import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type IngestPayload = {
  workspaceSlug?: string;
  run: {
    externalRunId: string;
    channel: "AGREED_CLIENTS" | "AGENCY_SITES" | "LINKEDIN" | "JOB_BOARDS";
    status?: "QUEUED" | "RUNNING" | "COMPLETE" | "FAILED" | "PARTIAL";
    specVersion?: string;
    startedAt?: string;
    completedAt?: string | null;
    geography?: Record<string, unknown>;
    metrics?: Record<string, number>;
  };
  vacancies?: Array<{
    canonicalKey: string;
    title: string;
    employerName?: string | null;
    employerStatus?: "CONFIRMED" | "PROBABLE" | "HYPOTHESIS" | "UNKNOWN";
    location?: string | null;
    region?: string | null;
    roleFamily?: string | null;
    seniority?: string | null;
    clientStatus?: "AGREED_CLIENT" | "AGREED_GROUP_ENTITY" | "PAST_CLIENT" | "TARGET_PROSPECT" | "UNKNOWN";
    searchChannel?: "AGREED_CLIENTS" | "AGENCY_SITES" | "LINKEDIN" | "JOB_BOARDS";
    sourceLabel?: string | null;
    qaStatus?: "PASS" | "PASS_WITH_UNKNOWNS" | "FAIL_RESEARCH_REQUIRED";
    candidateMapStatus?: "NOT_STARTED" | "IN_PROGRESS" | "READY";
    firstSeen?: string;
    lastSeen?: string | null;
    lastVerified?: string | null;
    summary?: string | null;
    lifecycleStatus?: string;
    sources?: Array<{
      sourceKey: string;
      type: string;
      name: string;
      url?: string | null;
      evidenceStatus?: string;
      postedAt?: string | null;
      firstSeen?: string | null;
      lastSeen?: string | null;
      rawTitle?: string | null;
      rawEmployer?: string | null;
      rawLocation?: string | null;
      metadata?: Record<string, unknown>;
    }>;
    requirements?: Array<{
      key: string;
      label: string;
      value?: string | null;
      evidenceStatus?: string;
      requirementType?: "REQUIRED" | "PREFERRED" | "CONTEXT";
      sourceUrl?: string | null;
      sortOrder?: number;
    }>;
    researchQueries?: Array<{
      queryKey: string;
      query: string;
      source: string;
      family: string;
      reasonGenerated?: string | null;
      executionStatus: "EXECUTED" | "ACCESS_LIMITED" | "NOT_APPLICABLE" | "NOT_EXECUTED";
      executedAt?: string | null;
      observedYield?: number | null;
      candidatesSurfaced?: number | null;
      notes?: string | null;
    }>;
    candidates?: Array<{
      canonicalKey: string;
      name: string;
      currentTitle?: string | null;
      currentEmployer?: string | null;
      location?: string | null;
      profileUrl?: string | null;
      marketBucket?: "TOP_10" | "STRONG_MARKET" | "LONGLIST" | "UNREVIEWED" | "EXCLUDED";
      rank?: number | null;
      comparableTier?: "A" | "B" | "C" | "D" | null;
      qaStatus?: string;
      whyFit?: string | null;
      evidenceGaps?: string[];
      lastVerified?: string | null;
      operationalStatus?: string;
      claims?: Array<{
        key: string;
        name: string;
        value?: string | null;
        evidenceStatus?: string;
        sourceUrl?: string | null;
        notes?: string | null;
      }>;
    }>;
    qaReviews?: Array<{
      gate: string;
      conclusion: string;
      reviewedAt?: string;
      summary?: string | null;
      claimsUpheld?: string[];
      claimsDowngraded?: string[];
      claimsRemoved?: string[];
      contradictions?: string[];
      unknowns?: string[];
      nextActions?: string[];
      sourcesChecked?: string[];
    }>;
  }>;
};

export async function POST(request: Request) {
  const expectedKey = process.env.INGEST_API_KEY;
  if (!expectedKey) {
    return NextResponse.json({ error: "Ingestion is not configured." }, { status: 503 });
  }

  const supplied = request.headers.get("authorization");
  if (supplied !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let payload: IngestPayload;
  try {
    payload = (await request.json()) as IngestPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!payload?.run?.externalRunId || !payload?.run?.channel) {
    return NextResponse.json({ error: "run.externalRunId and run.channel are required." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const workspaceSlug = payload.workspaceSlug || process.env.WORKSPACE_SLUG || "talent-tree";

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id")
    .eq("slug", workspaceSlug)
    .single();

  if (workspaceError || !workspace) {
    return NextResponse.json({ error: `Workspace ${workspaceSlug} was not found.` }, { status: 404 });
  }

  const workspaceId = workspace.id;
  const now = new Date().toISOString();

  const { data: run, error: runError } = await supabase
    .from("runs")
    .upsert(
      {
        workspace_id: workspaceId,
        external_run_id: payload.run.externalRunId,
        channel: payload.run.channel,
        status: payload.run.status || "COMPLETE",
        spec_version: payload.run.specVersion || "REC-main",
        geography: payload.run.geography || {},
        metrics: payload.run.metrics || {},
        started_at: payload.run.startedAt || now,
        completed_at: payload.run.completedAt ?? now,
        updated_at: now,
      },
      { onConflict: "workspace_id,external_run_id" }
    )
    .select("id")
    .single();

  if (runError || !run) {
    return NextResponse.json({ error: runError?.message || "Unable to persist run." }, { status: 400 });
  }

  const persistedVacancies: string[] = [];

  for (const item of payload.vacancies || []) {
    let companyId: string | null = null;

    if (item.employerName && item.employerName !== "Employer unresolved") {
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .upsert(
          {
            workspace_id: workspaceId,
            canonical_name: item.employerName,
            client_status: item.clientStatus || "UNKNOWN",
            updated_at: now,
          },
          { onConflict: "workspace_id,canonical_name" }
        )
        .select("id")
        .single();
      if (companyError) return NextResponse.json({ error: companyError.message }, { status: 400 });
      companyId = company?.id || null;
    }

    const { data: vacancy, error: vacancyError } = await supabase
      .from("vacancies")
      .upsert(
        {
          workspace_id: workspaceId,
          company_id: companyId,
          canonical_key: item.canonicalKey,
          title: item.title,
          employer_name: item.employerName || "Employer unresolved",
          employer_status: item.employerStatus || "UNKNOWN",
          location: item.location,
          region: item.region,
          role_family: item.roleFamily,
          seniority: item.seniority,
          client_status: item.clientStatus || "UNKNOWN",
          search_channel: item.searchChannel || payload.run.channel,
          source_label: item.sourceLabel || payload.run.channel,
          qa_status: item.qaStatus || "PASS_WITH_UNKNOWNS",
          candidate_map_status: item.candidateMapStatus || "NOT_STARTED",
          first_seen: item.firstSeen || now,
          last_seen: item.lastSeen || now,
          last_verified: item.lastVerified,
          summary: item.summary,
          updated_at: now,
        },
        { onConflict: "workspace_id,canonical_key" }
      )
      .select("id")
      .single();

    if (vacancyError || !vacancy) {
      return NextResponse.json({ error: vacancyError?.message || "Unable to persist vacancy." }, { status: 400 });
    }

    persistedVacancies.push(vacancy.id);

    const { error: opError } = await supabase.from("vacancy_operations").upsert(
      {
        workspace_id: workspaceId,
        vacancy_id: vacancy.id,
        lifecycle_status: item.lifecycleStatus || inferLifecycle(item),
        unread: true,
        last_user_action_at: null,
      },
      { onConflict: "workspace_id,vacancy_id", ignoreDuplicates: false }
    );
    if (opError) return NextResponse.json({ error: opError.message }, { status: 400 });

    for (const source of item.sources || []) {
      const { error } = await supabase.from("vacancy_sources").upsert(
        {
          workspace_id: workspaceId,
          vacancy_id: vacancy.id,
          run_id: run.id,
          source_key: source.sourceKey,
          source_type: source.type,
          source_name: source.name,
          source_url: source.url,
          evidence_status: source.evidenceStatus || "UNKNOWN",
          posted_at: source.postedAt,
          first_seen: source.firstSeen || item.firstSeen || now,
          last_seen: source.lastSeen || now,
          raw_title: source.rawTitle,
          raw_employer: source.rawEmployer,
          raw_location: source.rawLocation,
          metadata: source.metadata || {},
        },
        { onConflict: "workspace_id,vacancy_id,source_key" }
      );
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }

    for (const requirement of item.requirements || []) {
      const { error } = await supabase.from("vacancy_requirements").upsert(
        {
          workspace_id: workspaceId,
          vacancy_id: vacancy.id,
          requirement_key: requirement.key,
          label: requirement.label,
          value: requirement.value,
          evidence_status: requirement.evidenceStatus || "UNKNOWN",
          requirement_type: requirement.requirementType || "CONTEXT",
          source_url: requirement.sourceUrl,
          sort_order: requirement.sortOrder || 0,
        },
        { onConflict: "workspace_id,vacancy_id,requirement_key" }
      );
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }

    for (const query of item.researchQueries || []) {
      const { error } = await supabase.from("research_queries").upsert(
        {
          workspace_id: workspaceId,
          vacancy_id: vacancy.id,
          run_id: run.id,
          query_key: query.queryKey,
          query_text: query.query,
          source: query.source,
          search_family: query.family,
          reason_generated: query.reasonGenerated,
          execution_status: query.executionStatus,
          executed_at: query.executedAt,
          observed_yield: query.observedYield,
          candidates_surfaced: query.candidatesSurfaced,
          notes: query.notes,
        },
        { onConflict: "workspace_id,vacancy_id,query_key" }
      );
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }

    for (const candidateItem of item.candidates || []) {
      const { data: candidate, error: candidateError } = await supabase
        .from("candidates")
        .upsert(
          {
            workspace_id: workspaceId,
            canonical_key: candidateItem.canonicalKey,
            full_name: candidateItem.name,
            current_title: candidateItem.currentTitle,
            current_employer: candidateItem.currentEmployer,
            location: candidateItem.location,
            profile_url: candidateItem.profileUrl,
            updated_at: now,
          },
          { onConflict: "workspace_id,canonical_key" }
        )
        .select("id")
        .single();

      if (candidateError || !candidate) {
        return NextResponse.json({ error: candidateError?.message || "Unable to persist candidate." }, { status: 400 });
      }

      const { error: assignmentError } = await supabase.from("candidate_assignments").upsert(
        {
          workspace_id: workspaceId,
          vacancy_id: vacancy.id,
          candidate_id: candidate.id,
          market_bucket: candidateItem.marketBucket || "UNREVIEWED",
          rank: candidateItem.rank,
          comparable_tier: candidateItem.comparableTier,
          qa_status: candidateItem.qaStatus || "PASS_WITH_UNKNOWNS",
          why_fit: candidateItem.whyFit,
          evidence_gaps: candidateItem.evidenceGaps || [],
          last_verified: candidateItem.lastVerified,
          updated_at: now,
        },
        { onConflict: "workspace_id,vacancy_id,candidate_id" }
      );
      if (assignmentError) return NextResponse.json({ error: assignmentError.message }, { status: 400 });

      const { error: candidateOpError } = await supabase.from("candidate_operations").upsert(
        {
          workspace_id: workspaceId,
          vacancy_id: vacancy.id,
          candidate_id: candidate.id,
          operational_status: candidateItem.operationalStatus || "SURFACED",
        },
        { onConflict: "workspace_id,vacancy_id,candidate_id", ignoreDuplicates: true }
      );
      if (candidateOpError) return NextResponse.json({ error: candidateOpError.message }, { status: 400 });

      for (const claim of candidateItem.claims || []) {
        const { error: claimError } = await supabase.from("candidate_claims").upsert(
          {
            workspace_id: workspaceId,
            candidate_id: candidate.id,
            claim_key: claim.key,
            claim_name: claim.name,
            claim_value: claim.value,
            evidence_status: claim.evidenceStatus || "UNKNOWN",
            source_url: claim.sourceUrl,
            notes: claim.notes,
          },
          { onConflict: "workspace_id,candidate_id,claim_key" }
        );
        if (claimError) return NextResponse.json({ error: claimError.message }, { status: 400 });
      }
    }

    for (const review of item.qaReviews || []) {
      const { error } = await supabase.from("qa_reviews").insert({
        workspace_id: workspaceId,
        vacancy_id: vacancy.id,
        run_id: run.id,
        gate: review.gate,
        reviewer_conclusion: review.conclusion,
        reviewed_at: review.reviewedAt || now,
        summary: review.summary,
        claims_upheld: review.claimsUpheld || [],
        claims_downgraded: review.claimsDowngraded || [],
        claims_removed: review.claimsRemoved || [],
        contradictions: review.contradictions || [],
        unknowns: review.unknowns || [],
        next_research_actions: review.nextActions || [],
        sources_checked: review.sourcesChecked || [],
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  return NextResponse.json({
    ok: true,
    runId: run.id,
    externalRunId: payload.run.externalRunId,
    persistedVacancies,
  });
}

function inferLifecycle(item: IngestPayload["vacancies"][number]) {
  if (item.qaStatus === "FAIL_RESEARCH_REQUIRED") return "VERIFYING";
  if (item.candidateMapStatus === "READY") return "TOP_10_READY";
  if (item.candidateMapStatus === "IN_PROGRESS") return "CANDIDATE_MAPPING";
  if (item.employerStatus === "CONFIRMED") return "EMPLOYER_RESOLVED";
  return "DISCOVERED";
}
