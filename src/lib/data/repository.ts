import { demoSnapshot } from "./demo";
import type {
  CandidateAssignment,
  CandidateClaim,
  CandidateMarketSummary,
  CompanyEmailIntelligence,
  HiringStakeholder,
  QaStatus,
  ResearchQuery,
  Requirement,
  RunSummary,
  Vacancy,
  VacancySource,
  WorkspaceSnapshot,
} from "./types";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type Row = Record<string, any>;

export async function getWorkspaceSnapshot(): Promise<WorkspaceSnapshot> {
  if (isDemoMode()) {
    return demoSnapshot;
  }

  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getClaims();
  if (authError || !authData?.claims?.sub) {
    redirect("/login");
  }

  const slug = process.env.WORKSPACE_SLUG || "talent-tree";

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id,name")
    .eq("slug", slug)
    .maybeSingle();

  if (workspaceError) throw workspaceError;
  if (!workspace) {
    throw new Error(
      `Workspace "${slug}" was not found or the signed-in user does not have access.`
    );
  }

  const workspaceId = workspace.id;

  const [
    vacanciesResult,
    operationsResult,
    sourcesResult,
    requirementsResult,
    stakeholdersResult,
    companyEmailResult,
    assignmentsResult,
    candidateOpsResult,
    candidatesResult,
    claimsResult,
    queriesResult,
    runsResult,
  ] = await Promise.all([
    supabase.from("vacancies").select("*").eq("workspace_id", workspaceId),
    supabase.from("vacancy_operations").select("*").eq("workspace_id", workspaceId),
    supabase.from("vacancy_sources").select("*").eq("workspace_id", workspaceId),
    supabase.from("vacancy_requirements").select("*").eq("workspace_id", workspaceId),
    supabase.from("stakeholders").select("*").eq("workspace_id", workspaceId),
    supabase.from("company_email_intelligence").select("*").eq("workspace_id", workspaceId),
    supabase.from("candidate_assignments").select("*").eq("workspace_id", workspaceId),
    supabase.from("candidate_operations").select("*").eq("workspace_id", workspaceId),
    supabase.from("candidates").select("*").eq("workspace_id", workspaceId),
    supabase.from("candidate_claims").select("*").eq("workspace_id", workspaceId),
    supabase.from("research_queries").select("*").eq("workspace_id", workspaceId),
    supabase.from("runs").select("*").eq("workspace_id", workspaceId).order("started_at", { ascending: false }),
  ]);

  const errors = [
    vacanciesResult.error,
    operationsResult.error,
    sourcesResult.error,
    requirementsResult.error,
    stakeholdersResult.error,
    companyEmailResult.error,
    assignmentsResult.error,
    candidateOpsResult.error,
    candidatesResult.error,
    claimsResult.error,
    queriesResult.error,
    runsResult.error,
  ].filter(Boolean);

  if (errors.length) throw errors[0];

  const operationsByVacancy = mapBy((operationsResult.data || []) as Row[], "vacancy_id");
  const sourcesByVacancy = groupBy((sourcesResult.data || []) as Row[], "vacancy_id");
  const requirementsByVacancy = groupBy((requirementsResult.data || []) as Row[], "vacancy_id");
  const stakeholdersByVacancy = groupBy((stakeholdersResult.data || []) as Row[], "vacancy_id");
  const companyEmailByVacancy = mapBy((companyEmailResult.data || []) as Row[], "vacancy_id");
  const assignmentsByVacancy = groupBy((assignmentsResult.data || []) as Row[], "vacancy_id");
  const candidateOpsByKey = new Map<string, Row>();
  for (const row of (candidateOpsResult.data || []) as Row[]) {
    candidateOpsByKey.set(`${row.vacancy_id}:${row.candidate_id}`, row);
  }
  const candidatesById = mapBy((candidatesResult.data || []) as Row[], "id");
  const claimsByCandidate = groupBy((claimsResult.data || []) as Row[], "candidate_id");
  const queriesByVacancy = groupBy((queriesResult.data || []) as Row[], "vacancy_id");

  const vacancies: Vacancy[] = ((vacanciesResult.data || []) as Row[])
    .map((row) =>
      toVacancy(
        row,
        operationsByVacancy.get(row.id),
        sourcesByVacancy.get(row.id) || [],
        requirementsByVacancy.get(row.id) || [],
        stakeholdersByVacancy.get(row.id) || [],
        companyEmailByVacancy.get(row.id),
        assignmentsByVacancy.get(row.id) || [],
        candidateOpsByKey,
        candidatesById,
        claimsByCandidate,
        queriesByVacancy.get(row.id) || []
      )
    )
    .sort((a, b) => {
      if (a.clientStatus === "AGREED_CLIENT" && b.clientStatus !== "AGREED_CLIENT") return -1;
      if (b.clientStatus === "AGREED_CLIENT" && a.clientStatus !== "AGREED_CLIENT") return 1;
      return new Date(b.firstSeen).getTime() - new Date(a.firstSeen).getTime();
    });

  const runs: RunSummary[] = ((runsResult.data || []) as Row[]).map((row) => ({
    id: row.id,
    externalRunId: row.external_run_id,
    channel: row.channel,
    status: row.status,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    metrics: row.metrics || {},
  }));

  return {
    workspaceName: workspace.name,
    demoMode: false,
    generatedAt: new Date().toISOString(),
    vacancies,
    runs,
  };
}

function toVacancy(
  row: Row,
  operation: Row | undefined,
  sources: Row[],
  requirements: Row[],
  stakeholders: Row[],
  companyEmail: Row | undefined,
  assignments: Row[],
  candidateOpsByKey: Map<string, Row>,
  candidatesById: Map<string, Row>,
  claimsByCandidate: Map<string, Row[]>,
  queries: Row[]
): Vacancy {
  return {
    id: row.id,
    canonicalKey: row.canonical_key,
    title: row.title,
    employerName: row.employer_name || "Employer unresolved",
    employerStatus: row.employer_status || "UNKNOWN",
    location: row.location || "Unknown",
    region: row.region || "Unknown",
    roleFamily: row.role_family || "Other",
    seniority: row.seniority || "Unknown",
    clientStatus: row.client_status || "UNKNOWN",
    searchChannel: row.search_channel,
    sourceLabel: row.source_label || row.search_channel,
    lifecycleStatus: operation?.lifecycle_status || "DISCOVERED",
    qaStatus: row.qa_status || "PASS_WITH_UNKNOWNS",
    candidateMapStatus: row.candidate_map_status || "NOT_STARTED",
    candidateMarketSummary: toCandidateMarketSummary(
      row.candidate_market_summary,
      assignments,
      queries
    ),
    stakeholderMapStatus: row.stakeholder_map_status || "NOT_STARTED",
    stakeholderMapNote: row.stakeholder_map_note,
    firstSeen: row.first_seen,
    lastSeen: row.last_seen,
    lastVerified: row.last_verified,
    summary: row.summary || "",
    unread: operation?.unread ?? true,
    requirements: requirements
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map(toRequirement),
    sources: sources.map(toSource),
    stakeholders: stakeholders.map(toStakeholder),
    companyEmailIntelligence: companyEmail ? toCompanyEmailIntelligence(companyEmail) : null,
    candidates: assignments
      .map((assignment) =>
        toCandidate(
          assignment,
          candidatesById.get(assignment.candidate_id),
          candidateOpsByKey.get(`${assignment.vacancy_id}:${assignment.candidate_id}`),
          claimsByCandidate.get(assignment.candidate_id) || []
        )
      )
      .filter(Boolean) as CandidateAssignment[],
    researchQueries: queries.map(toResearchQuery),
  };
}

function toRequirement(row: Row): Requirement {
  return {
    id: row.id,
    label: row.label,
    value: row.value || "",
    status: row.evidence_status || "UNKNOWN",
    type: row.requirement_type || "CONTEXT",
  };
}

function toSource(row: Row): VacancySource {
  return {
    id: row.id,
    name: row.source_name,
    type: row.source_type,
    url: row.source_url,
    evidenceStatus: row.evidence_status || "UNKNOWN",
    postedAt: row.posted_at,
  };
}

function toCandidateMarketSummary(
  value: unknown,
  assignments: Row[],
  queries: Row[]
): CandidateMarketSummary {
  const raw =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Row)
      : {};

  const credible = assignments.filter((row) =>
    ["LONGLIST", "STRONG_MARKET", "TOP_10"].includes(row.market_bucket)
  ).length;
  const strongest = assignments.filter((row) =>
    ["STRONG_MARKET", "TOP_10"].includes(row.market_bucket)
  ).length;
  const top10 = assignments.filter((row) => row.market_bucket === "TOP_10").length;
  const executed = queries.filter((row) => row.execution_status === "EXECUTED").length;

  return {
    coverageStatus:
      raw.coverageStatus ||
      raw.coverage_status ||
      (credible > 0 ? "IN_PROGRESS" : "NOT_STARTED"),
    rawProfilesReviewed:
      raw.rawProfilesReviewed ?? raw.raw_profiles_reviewed ?? null,
    credibleMarketCount:
      raw.credibleMarketCount ?? raw.credible_market_count ?? credible,
    strongestMarketCount:
      raw.strongestMarketCount ?? raw.strongest_market_count ?? strongest,
    top10Count: raw.top10Count ?? raw.top10_count ?? top10,
    executedQueryCount:
      raw.executedQueryCount ?? raw.executed_query_count ?? executed,
    coverageNote: raw.coverageNote ?? raw.coverage_note ?? null,
  };
}

function toCandidate(
  assignment: Row,
  candidate: Row | undefined,
  operation: Row | undefined,
  claims: Row[]
): CandidateAssignment | null {
  if (!candidate) return null;

  return {
    assignmentId: assignment.id,
    candidateId: candidate.id,
    name: candidate.full_name,
    currentTitle: candidate.current_title || "Unknown title",
    currentEmployer: candidate.current_employer || "Unknown employer",
    location: candidate.location || "Unknown",
    profileUrl: candidate.profile_url,
    marketBucket: assignment.market_bucket || "UNREVIEWED",
    operationalStatus: operation?.operational_status || "SURFACED",
    rank: assignment.rank,
    comparableTier: assignment.comparable_tier,
    qaStatus: (assignment.qa_status || "PASS_WITH_UNKNOWNS") as QaStatus,
    whyFit: assignment.why_fit || "",
    claims: claims.map(toCandidateClaim),
    evidenceGaps: Array.isArray(assignment.evidence_gaps)
      ? assignment.evidence_gaps
      : [],
    lastVerified: assignment.last_verified,
  };
}

function toCandidateClaim(row: Row): CandidateClaim {
  return {
    name: row.claim_name,
    value: row.claim_value || "",
    status: row.evidence_status || "UNKNOWN",
  };
}

function toStakeholder(row: Row): HiringStakeholder {
  return {
    id: row.id,
    key: row.stakeholder_key,
    name: row.full_name,
    title: row.current_title,
    relevance: row.relevance,
    reasonRelevant: row.reason_relevant,
    currentEmploymentStatus: row.current_employment_status,
    profileUrl: row.profile_url,
    observedBusinessEmail: row.observed_business_email || null,
    probableBusinessEmail: row.probable_business_email || (!row.observed_business_email ? row.business_email : null),
    emailStatus: row.email_status,
    emailPatternBasis: row.email_pattern_basis,
    emailConfidenceNote: row.email_confidence_note,
    evidenceStatus: row.evidence_status || "UNKNOWN",
    lastVerified: row.last_verified,
  };
}

function toCompanyEmailIntelligence(row: Row): CompanyEmailIntelligence {
  return {
    websiteDomain: row.website_domain,
    employeeEmailDomain: row.employee_email_domain,
    domainStatus: row.domain_status || "UNKNOWN",
    observedPatternExamplesCount: row.observed_pattern_examples_count || 0,
    observedBusinessEmailExamples: Array.isArray(row.observed_business_email_examples)
      ? row.observed_business_email_examples
      : [],
    detectedPattern: row.detected_pattern,
    patternStatus: row.pattern_status || "UNKNOWN_PATTERN",
    patternBasis: Array.isArray(row.pattern_basis) ? row.pattern_basis : [],
    alternatePatterns: Array.isArray(row.alternate_patterns) ? row.alternate_patterns : [],
    notes: row.notes,
    lastVerified: row.last_verified,
  };
}

function toResearchQuery(row: Row): ResearchQuery {
  return {
    id: row.id,
    query: row.query_text,
    source: row.source,
    family: row.search_family,
    executionStatus: row.execution_status,
    yieldCount: row.observed_yield,
    candidatesSurfaced: row.candidates_surfaced,
  };
}

function groupBy(rows: Row[], key: string) {
  const map = new Map<string, Row[]>();
  for (const row of rows) {
    const value = row[key];
    if (!value) continue;
    const existing = map.get(value) || [];
    existing.push(row);
    map.set(value, existing);
  }
  return map;
}

function mapBy(rows: Row[], key: string) {
  const map = new Map<string, Row>();
  for (const row of rows) {
    if (row[key]) map.set(row[key], row);
  }
  return map;
}
