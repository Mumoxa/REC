import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

type Evidence = "CONFIRMED" | "PROBABLE" | "HYPOTHESIS" | "UNKNOWN";
type Channel = "AGREED_CLIENTS" | "AGENCY_SITES" | "LINKEDIN" | "JOB_BOARDS";

type Payload = {
  workspaceSlug?: string;
  run: {
    externalRunId: string;
    channel: Channel;
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
    employerStatus?: Evidence;
    location?: string | null;
    region?: string | null;
    roleFamily?: string | null;
    seniority?: string | null;
    clientStatus?: "AGREED_CLIENT" | "AGREED_GROUP_ENTITY" | "PAST_CLIENT" | "TARGET_PROSPECT" | "UNKNOWN";
    searchChannel?: Channel;
    sourceLabel?: string | null;
    qaStatus?: "PASS" | "PASS_WITH_UNKNOWNS" | "FAIL_RESEARCH_REQUIRED";
    candidateMapStatus?: "NOT_STARTED" | "IN_PROGRESS" | "READY";
    candidateMarketSummary?: {
      coverageStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE" | "SCARCE_MARKET";
      rawProfilesReviewed?: number | null;
      credibleMarketCount: number;
      strongestMarketCount: number;
      top10Count: number;
      executedQueryCount: number;
      coverageNote?: string | null;
    };
    stakeholderMapStatus?: "NOT_STARTED" | "IN_PROGRESS" | "READY" | "BLOCKED_WITH_EVIDENCE";
    stakeholderMapNote?: string | null;
    companyEmailIntelligence?: {
      websiteDomain?: string | null;
      employeeEmailDomain?: string | null;
      domainStatus?: "CONFIRMED" | "PROBABLE" | "CONFLICTING" | "UNKNOWN";
      observedPatternExamplesCount?: number;
      observedBusinessEmailExamples?: string[];
      detectedPattern?: string | null;
      patternStatus?: "CONFIRMED_PATTERN" | "PROBABLE_PATTERN" | "CONFLICTING_PATTERNS" | "UNKNOWN_PATTERN";
      patternBasis?: string[];
      alternatePatterns?: string[];
      notes?: string | null;
      lastVerified?: string | null;
      metadata?: Record<string, unknown>;
    };
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
      evidenceStatus?: Evidence;
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
      evidenceStatus?: Evidence;
      requirementType?: "REQUIRED" | "PREFERRED" | "CONTEXT";
      sourceUrl?: string | null;
      sortOrder?: number;
    }>;
    stakeholders?: Array<{
      key: string;
      name: string;
      title?: string | null;
      relevance?: string | null;
      reasonRelevant?: string | null;
      currentEmploymentStatus?: string | null;
      profileUrl?: string | null;
      businessEmail?: string | null;
      observedBusinessEmail?: string | null;
      probableBusinessEmail?: string | null;
      emailStatus?: string | null;
      emailPatternBasis?: string | null;
      emailConfidenceNote?: string | null;
      evidenceStatus?: Evidence;
      lastVerified?: string | null;
      metadata?: Record<string, unknown>;
    }>;
    targetCompanies?: Array<{
      key: string;
      name: string;
      tier: "A" | "B" | "C" | "D";
      reason: string;
      evidenceStatus?: Evidence;
      sources?: unknown[];
      contradictions?: string[];
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
      qaStatus?: "PASS" | "PASS_WITH_UNKNOWNS" | "FAIL_RESEARCH_REQUIRED";
      whyFit?: string | null;
      evidenceGaps?: string[];
      lastVerified?: string | null;
      operationalStatus?: string;
      claims?: Array<{
        key: string;
        name: string;
        value?: string | null;
        evidenceStatus?: Evidence;
        sourceUrl?: string | null;
        notes?: string | null;
      }>;
    }>;
    qaReviews?: Array<{
      candidateCanonicalKey?: string | null;
      gate: string;
      conclusion: "PASS" | "PASS_WITH_UNKNOWNS" | "FAIL_RESEARCH_REQUIRED";
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

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return response({ error: "Method not allowed." }, 405);
  }

  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return response({ error: "Unauthorized." }, 401);
  }

  const token = auth.slice("Bearer ".length).trim();
  if (token.length < 32) {
    return response({ error: "Unauthorized." }, 401);
  }

  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) {
    return response({ error: "Supabase runtime configuration missing." }, 500);
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const tokenHash = await sha256(token);
  const { data: tokenRecord, error: tokenError } = await supabase
    .from("ingest_tokens")
    .select("id")
    .eq("token_hash", tokenHash)
    .eq("active", true)
    .maybeSingle();

  if (tokenError || !tokenRecord) {
    return response({ error: "Unauthorized." }, 401);
  }

  let payload: Payload;
  try {
    payload = (await request.json()) as Payload;
  } catch {
    return response({ error: "Invalid JSON payload." }, 400);
  }

  if (!payload?.run?.externalRunId || !payload?.run?.channel) {
    return response(
      { error: "run.externalRunId and run.channel are required." },
      400,
    );
  }

  const requestedRunStatus = payload.run.status || "RUNNING";
  const completionError = validateCompletionContract(payload, requestedRunStatus);
  if (completionError) {
    return response({ error: completionError }, 400);
  }

  const workspaceSlug = payload.workspaceSlug || "talent-tree";
  const now = new Date().toISOString();
  const completedAt =
    requestedRunStatus === "COMPLETE" ||
    requestedRunStatus === "PARTIAL" ||
    requestedRunStatus === "FAILED"
      ? payload.run.completedAt ?? now
      : null;

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id")
    .eq("slug", workspaceSlug)
    .single();

  if (workspaceError || !workspace) {
    return response({ error: `Workspace ${workspaceSlug} not found.` }, 404);
  }

  const workspaceId = workspace.id;

  const { data: run, error: runError } = await supabase
    .from("runs")
    .upsert(
      {
        workspace_id: workspaceId,
        external_run_id: payload.run.externalRunId,
        channel: payload.run.channel,
        status: requestedRunStatus,
        spec_version: payload.run.specVersion || "REC-main",
        geography: payload.run.geography || {},
        metrics: payload.run.metrics || {},
        started_at: payload.run.startedAt || now,
        completed_at: completedAt,
        updated_at: now,
      },
      { onConflict: "workspace_id,external_run_id" },
    )
    .select("id")
    .single();

  if (runError || !run) {
    return response({ error: runError?.message || "Unable to persist run." }, 400);
  }

  const persistedVacancies: string[] = [];
  const candidateIdByCanonicalKey = new Map<string, string>();

  for (const item of payload.vacancies || []) {
    if (!item.canonicalKey || !item.title) {
      return response({ error: "Each vacancy requires canonicalKey and title." }, 400);
    }

    let companyId: string | null = null;
    if (item.employerName && item.employerName !== "Employer unresolved") {
      const { data: company, error } = await supabase
        .from("companies")
        .upsert(
          {
            workspace_id: workspaceId,
            canonical_name: item.employerName,
            client_status: item.clientStatus || "UNKNOWN",
            updated_at: now,
          },
          { onConflict: "workspace_id,canonical_name" },
        )
        .select("id")
        .single();
      if (error) return response({ error: error.message }, 400);
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
          candidate_market_summary: item.candidateMarketSummary || {},
          stakeholder_map_status: item.stakeholderMapStatus || "NOT_STARTED",
          stakeholder_map_note: item.stakeholderMapNote,
          first_seen: item.firstSeen || now,
          last_seen: item.lastSeen || now,
          last_verified: item.lastVerified,
          summary: item.summary,
          updated_at: now,
          last_changed: now,
        },
        { onConflict: "workspace_id,canonical_key" },
      )
      .select("id")
      .single();

    if (vacancyError || !vacancy) {
      return response({ error: vacancyError?.message || "Unable to persist vacancy." }, 400);
    }
    persistedVacancies.push(vacancy.id);

    const { error: operationError } = await supabase
      .from("vacancy_operations")
      .upsert(
        {
          workspace_id: workspaceId,
          vacancy_id: vacancy.id,
          lifecycle_status: item.lifecycleStatus || inferLifecycle(item),
          unread: true,
        },
        { onConflict: "workspace_id,vacancy_id", ignoreDuplicates: true },
      );
    if (operationError) return response({ error: operationError.message }, 400);

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
        { onConflict: "workspace_id,vacancy_id,source_key" },
      );
      if (error) return response({ error: error.message }, 400);
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
        { onConflict: "workspace_id,vacancy_id,requirement_key" },
      );
      if (error) return response({ error: error.message }, 400);
    }

    for (const stakeholder of item.stakeholders || []) {
      const { error } = await supabase.from("stakeholders").upsert(
        {
          workspace_id: workspaceId,
          vacancy_id: vacancy.id,
          stakeholder_key: stakeholder.key,
          full_name: stakeholder.name,
          current_title: stakeholder.title,
          relevance: stakeholder.relevance,
          reason_relevant: stakeholder.reasonRelevant,
          current_employment_status: stakeholder.currentEmploymentStatus,
          profile_url: stakeholder.profileUrl,
          business_email:
            stakeholder.observedBusinessEmail ||
            stakeholder.probableBusinessEmail ||
            stakeholder.businessEmail,
          observed_business_email: stakeholder.observedBusinessEmail,
          probable_business_email: stakeholder.probableBusinessEmail,
          email_status: stakeholder.emailStatus,
          email_pattern_basis: stakeholder.emailPatternBasis,
          email_confidence_note: stakeholder.emailConfidenceNote,
          evidence_status: stakeholder.evidenceStatus || "UNKNOWN",
          last_verified: stakeholder.lastVerified,
          metadata: stakeholder.metadata || {},
          updated_at: now,
        },
        { onConflict: "workspace_id,vacancy_id,stakeholder_key" },
      );
      if (error) return response({ error: error.message }, 400);
    }

    if (item.companyEmailIntelligence) {
      const emailIntel = item.companyEmailIntelligence;
      const { error } = await supabase.from("company_email_intelligence").upsert(
        {
          workspace_id: workspaceId,
          vacancy_id: vacancy.id,
          company_id: companyId,
          website_domain: emailIntel.websiteDomain,
          employee_email_domain: emailIntel.employeeEmailDomain,
          domain_status: emailIntel.domainStatus || "UNKNOWN",
          observed_pattern_examples_count: emailIntel.observedPatternExamplesCount || 0,
          observed_business_email_examples: emailIntel.observedBusinessEmailExamples || [],
          detected_pattern: emailIntel.detectedPattern,
          pattern_status: emailIntel.patternStatus || "UNKNOWN_PATTERN",
          pattern_basis: emailIntel.patternBasis || [],
          alternate_patterns: emailIntel.alternatePatterns || [],
          notes: emailIntel.notes,
          last_verified: emailIntel.lastVerified,
          metadata: emailIntel.metadata || {},
          updated_at: now,
        },
        { onConflict: "workspace_id,vacancy_id" },
      );
      if (error) return response({ error: error.message }, 400);
    }

    for (const target of item.targetCompanies || []) {
      const { error } = await supabase.from("target_companies").upsert(
        {
          workspace_id: workspaceId,
          vacancy_id: vacancy.id,
          company_key: target.key,
          canonical_name: target.name,
          tier: target.tier,
          reason: target.reason,
          evidence_status: target.evidenceStatus || "UNKNOWN",
          sources: target.sources || [],
          contradictions: target.contradictions || [],
        },
        { onConflict: "workspace_id,vacancy_id,company_key" },
      );
      if (error) return response({ error: error.message }, 400);
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
        { onConflict: "workspace_id,vacancy_id,query_key" },
      );
      if (error) return response({ error: error.message }, 400);
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
          { onConflict: "workspace_id,canonical_key" },
        )
        .select("id")
        .single();

      if (candidateError || !candidate) {
        return response({ error: candidateError?.message || "Unable to persist candidate." }, 400);
      }

      candidateIdByCanonicalKey.set(candidateItem.canonicalKey, candidate.id);

      const { error: assignmentError } = await supabase
        .from("candidate_assignments")
        .upsert(
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
          { onConflict: "workspace_id,vacancy_id,candidate_id" },
        );
      if (assignmentError) return response({ error: assignmentError.message }, 400);

      const { error: operationError } = await supabase
        .from("candidate_operations")
        .upsert(
          {
            workspace_id: workspaceId,
            vacancy_id: vacancy.id,
            candidate_id: candidate.id,
            operational_status: candidateItem.operationalStatus || "SURFACED",
          },
          { onConflict: "workspace_id,vacancy_id,candidate_id", ignoreDuplicates: true },
        );
      if (operationError) return response({ error: operationError.message }, 400);

      for (const claim of candidateItem.claims || []) {
        const { error } = await supabase.from("candidate_claims").upsert(
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
          { onConflict: "workspace_id,candidate_id,claim_key" },
        );
        if (error) return response({ error: error.message }, 400);
      }
    }

    for (const review of item.qaReviews || []) {
      let candidateId: string | null = null;
      if (review.candidateCanonicalKey) {
        candidateId = candidateIdByCanonicalKey.get(review.candidateCanonicalKey) || null;
        if (!candidateId) {
          const { data: candidate } = await supabase
            .from("candidates")
            .select("id")
            .eq("workspace_id", workspaceId)
            .eq("canonical_key", review.candidateCanonicalKey)
            .maybeSingle();
          candidateId = candidate?.id || null;
        }
      }

      const { error } = await supabase.from("qa_reviews").insert({
        workspace_id: workspaceId,
        vacancy_id: vacancy.id,
        candidate_id: candidateId,
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
      if (error) return response({ error: error.message }, 400);
    }
  }

  const { data: verifiedAssignments, error: verificationError } =
    persistedVacancies.length > 0
      ? await supabase
          .from("candidate_assignments")
          .select("vacancy_id,candidate_id,market_bucket,qa_status,why_fit")
          .in("vacancy_id", persistedVacancies)
      : { data: [], error: null };

  if (verificationError) {
    return response(
      { error: `Persistence verification failed: ${verificationError.message}` },
      500,
    );
  }

  const assignmentRows = verifiedAssignments || [];
  const verifiedCandidateIds = new Set(
    assignmentRows.map((row) => row.candidate_id),
  );
  const submitReadyRows = assignmentRows.filter((row) =>
    isPersistedClientSubmittableCandidate(row),
  );
  const submitReadyVacancyIds = new Set(
    submitReadyRows.map((row) => row.vacancy_id),
  );

  const [
    persistedVacancyStateResult,
    persistedStakeholdersResult,
    persistedEmailIntelResult,
  ] = persistedVacancies.length > 0
    ? await Promise.all([
        supabase
          .from("vacancies")
          .select("id,stakeholder_map_status,stakeholder_map_note,candidate_market_summary")
          .in("id", persistedVacancies),
        supabase
          .from("stakeholders")
          .select("id,vacancy_id")
          .in("vacancy_id", persistedVacancies),
        supabase
          .from("company_email_intelligence")
          .select("id,vacancy_id")
          .in("vacancy_id", persistedVacancies),
      ])
    : [
        { data: [], error: null },
        { data: [], error: null },
        { data: [], error: null },
      ];

  const stakeholderVerificationError =
    persistedVacancyStateResult.error ||
    persistedStakeholdersResult.error ||
    persistedEmailIntelResult.error;

  if (stakeholderVerificationError) {
    return response(
      {
        error:
          `Stakeholder persistence verification failed: ${stakeholderVerificationError.message}`,
      },
      500,
    );
  }

  const stakeholderVacancyIds = new Set(
    (persistedStakeholdersResult.data || []).map((row) => row.vacancy_id),
  );
  const emailIntelVacancyIds = new Set(
    (persistedEmailIntelResult.data || []).map((row) => row.vacancy_id),
  );
  const hiringTeamReadyVacancyIds = new Set(
    (persistedVacancyStateResult.data || [])
      .filter((row) => {
        if (!emailIntelVacancyIds.has(row.id)) return false;
        if (row.stakeholder_map_status === "READY") {
          return stakeholderVacancyIds.has(row.id);
        }
        if (row.stakeholder_map_status === "BLOCKED_WITH_EVIDENCE") {
          return Boolean(row.stakeholder_map_note?.trim());
        }
        return false;
      })
      .map((row) => row.id),
  );

  const persistedMarketCounts = new Map<
    string,
    { credible: number; strongest: number; top10: number }
  >();
  for (const row of assignmentRows) {
    const current = persistedMarketCounts.get(row.vacancy_id) || {
      credible: 0,
      strongest: 0,
      top10: 0,
    };
    if (["LONGLIST", "STRONG_MARKET", "TOP_10"].includes(row.market_bucket)) {
      current.credible += 1;
    }
    if (["STRONG_MARKET", "TOP_10"].includes(row.market_bucket)) {
      current.strongest += 1;
    }
    if (row.market_bucket === "TOP_10") {
      current.top10 += 1;
    }
    persistedMarketCounts.set(row.vacancy_id, current);
  }

  const fullMarketReadyVacancyIds = new Set(
    (persistedVacancyStateResult.data || [])
      .filter((row) => {
        const summary = (row.candidate_market_summary || {}) as {
          coverageStatus?: string;
          credibleMarketCount?: number;
          strongestMarketCount?: number;
          top10Count?: number;
          coverageNote?: string | null;
        };
        const counts = persistedMarketCounts.get(row.id) || {
          credible: 0,
          strongest: 0,
          top10: 0,
        };
        const terminal =
          summary.coverageStatus === "COMPLETE" ||
          summary.coverageStatus === "SCARCE_MARKET";
        const countsMatch =
          summary.credibleMarketCount === counts.credible &&
          summary.strongestMarketCount === counts.strongest &&
          summary.top10Count === counts.top10;
        const scarcityExplained =
          summary.coverageStatus !== "SCARCE_MARKET" ||
          Boolean(summary.coverageNote?.trim());
        return terminal && countsMatch && scarcityExplained;
      })
      .map((row) => row.id),
  );

  const completionContractSatisfied =
    persistedVacancies.length > 0 &&
    persistedVacancies.every(
      (vacancyId) =>
        submitReadyVacancyIds.has(vacancyId) &&
        fullMarketReadyVacancyIds.has(vacancyId) &&
        hiringTeamReadyVacancyIds.has(vacancyId),
    );

  if (requestedRunStatus === "COMPLETE" && !completionContractSatisfied) {
    return response(
      {
        error:
          "Persistence verification failed: COMPLETE requires (a) a persisted full candidate market with terminal coverage state and reconciled longlist/strongest/Top-10 counts, (b) at least one QA-cleared TOP_10 candidate with a non-empty fit rationale, and (c) completed hiring-team/contact intelligence for every vacancy.",
      },
      500,
    );
  }

  await supabase
    .from("ingest_tokens")
    .update({ last_used_at: now })
    .eq("id", tokenRecord.id);

  return response({
    ok: true,
    runId: run.id,
    externalRunId: payload.run.externalRunId,
    runStatus: requestedRunStatus,
    persistedVacancies,
    verification: {
      persistedVacancyCount: persistedVacancies.length,
      persistedCandidateCount: verifiedCandidateIds.size,
      persistedCandidateAssignmentCount: assignmentRows.length,
      persistedSubmitReadyTop10Count: submitReadyRows.length,
      persistedFullMarketReadyVacancyCount: fullMarketReadyVacancyIds.size,
      persistedStakeholderCount: (persistedStakeholdersResult.data || []).length,
      persistedHiringTeamReadyVacancyCount: hiringTeamReadyVacancyIds.size,
      persistedCompanyEmailIntelligenceCount: (persistedEmailIntelResult.data || []).length,
      completionContractSatisfied,
    },
  });
});

function validateCompletionContract(
  payload: Payload,
  runStatus: NonNullable<Payload["run"]["status"]>,
): string | null {
  if (runStatus !== "COMPLETE") return null;

  const vacancies = payload.vacancies || [];
  if (vacancies.length === 0) {
    return "A COMPLETE REC run requires at least one qualifying vacancy with client-submittable candidates. A finished source sweep with no qualifying opportunities must not be labelled COMPLETE.";
  }

  for (const item of vacancies) {
    const qaPassed =
      item.qaStatus === "PASS" || item.qaStatus === "PASS_WITH_UNKNOWNS";

    if (!qaPassed) {
      return `Vacancy "${item.title}" cannot be COMPLETE because QA Gate A has not passed.`;
    }

    if (item.candidateMapStatus !== "READY") {
      return `Vacancy "${item.title}" cannot be COMPLETE because candidateMapStatus is not READY.`;
    }

    const marketSummary = item.candidateMarketSummary;
    if (!marketSummary) {
      return `Vacancy "${item.title}" cannot be COMPLETE because the full candidate-market coverage summary is missing.`;
    }

    if (
      marketSummary.coverageStatus !== "COMPLETE" &&
      marketSummary.coverageStatus !== "SCARCE_MARKET"
    ) {
      return `Vacancy "${item.title}" cannot be COMPLETE because candidate-market coverage is not COMPLETE or SCARCE_MARKET.`;
    }

    const credibleCandidates = (item.candidates || []).filter((candidate) =>
      ["LONGLIST", "STRONG_MARKET", "TOP_10"].includes(
        candidate.marketBucket || "UNREVIEWED",
      ),
    );
    const strongestCandidates = credibleCandidates.filter((candidate) =>
      ["STRONG_MARKET", "TOP_10"].includes(
        candidate.marketBucket || "UNREVIEWED",
      ),
    );
    const top10Candidates = credibleCandidates.filter(
      (candidate) => candidate.marketBucket === "TOP_10",
    );
    const executedQueryCount = (item.researchQueries || []).filter(
      (query) => query.executionStatus === "EXECUTED",
    ).length;

    if (
      marketSummary.credibleMarketCount !== credibleCandidates.length ||
      marketSummary.strongestMarketCount !== strongestCandidates.length ||
      marketSummary.top10Count !== top10Candidates.length ||
      marketSummary.executedQueryCount !== executedQueryCount
    ) {
      return `Vacancy "${item.title}" cannot be COMPLETE because candidate-market summary counts do not match the persisted market/search payload.`;
    }

    if (marketSummary.credibleMarketCount < marketSummary.strongestMarketCount) {
      return `Vacancy "${item.title}" cannot be COMPLETE because strongest-market count exceeds the credible market.`;
    }

    if (marketSummary.strongestMarketCount < marketSummary.top10Count) {
      return `Vacancy "${item.title}" cannot be COMPLETE because Top 10 count exceeds the strongest market.`;
    }

    if (marketSummary.executedQueryCount < 1) {
      return `Vacancy "${item.title}" cannot be COMPLETE because no candidate-market search query was executed.`;
    }

    if (
      marketSummary.coverageStatus === "COMPLETE" &&
      marketSummary.credibleMarketCount < 50
    ) {
      return `Vacancy "${item.title}" cannot use COMPLETE market coverage with fewer than 50 credible candidates; use SCARCE_MARKET with an evidence-grounded coverage note when the real market is smaller.`;
    }

    if (
      marketSummary.coverageStatus === "SCARCE_MARKET" &&
      !marketSummary.coverageNote?.trim()
    ) {
      return `Vacancy "${item.title}" cannot use SCARCE_MARKET without an evidence-grounded coverage/scarcity note.`;
    }

    const stakeholderReady =
      item.stakeholderMapStatus === "READY" ||
      item.stakeholderMapStatus === "BLOCKED_WITH_EVIDENCE";

    if (!stakeholderReady) {
      return `Vacancy "${item.title}" cannot be COMPLETE because hiring-team/contact research is not READY or BLOCKED_WITH_EVIDENCE.`;
    }

    if (
      item.stakeholderMapStatus === "READY" &&
      (item.stakeholders || []).length === 0
    ) {
      return `Vacancy "${item.title}" cannot be COMPLETE because stakeholderMapStatus is READY but no hiring stakeholder is present.`;
    }

    if (
      item.stakeholderMapStatus === "BLOCKED_WITH_EVIDENCE" &&
      !item.stakeholderMapNote?.trim()
    ) {
      return `Vacancy "${item.title}" cannot be COMPLETE because blocked stakeholder research requires an evidence-grounded note.`;
    }

    if (!item.companyEmailIntelligence) {
      return `Vacancy "${item.title}" cannot be COMPLETE because company email-domain/pattern intelligence was not recorded.`;
    }

    const submitReadyCandidates = (item.candidates || []).filter(
      isPayloadClientSubmittableCandidate,
    );

    if (submitReadyCandidates.length === 0) {
      return `Vacancy "${item.title}" cannot be COMPLETE because it has no QA-cleared TOP_10 candidate with a non-empty evidence-grounded fit rationale.`;
    }
  }

  return null;
}

function isPayloadClientSubmittableCandidate(
  candidate: NonNullable<
    NonNullable<Payload["vacancies"]>[number]["candidates"]
  >[number],
): boolean {
  const qaPassed =
    candidate.qaStatus === "PASS" ||
    candidate.qaStatus === "PASS_WITH_UNKNOWNS";

  return (
    candidate.marketBucket === "TOP_10" &&
    qaPassed &&
    Boolean(candidate.whyFit?.trim())
  );
}

function isPersistedClientSubmittableCandidate(candidate: {
  market_bucket?: string | null;
  qa_status?: string | null;
  why_fit?: string | null;
}): boolean {
  const qaPassed =
    candidate.qa_status === "PASS" ||
    candidate.qa_status === "PASS_WITH_UNKNOWNS";

  return (
    candidate.market_bucket === "TOP_10" &&
    qaPassed &&
    Boolean(candidate.why_fit?.trim())
  );
}

function inferLifecycle(
  item: NonNullable<Payload["vacancies"]>[number],
) {
  if (item.qaStatus === "FAIL_RESEARCH_REQUIRED") return "VERIFYING";
  if (item.candidateMapStatus === "READY") return "MARKET_READY";
  if (item.candidateMapStatus === "IN_PROGRESS") return "CANDIDATE_MAPPING";
  if (item.employerStatus === "CONFIRMED") return "EMPLOYER_RESOLVED";
  return "DISCOVERED";
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: jsonHeaders,
  });
}
