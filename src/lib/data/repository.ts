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

// P2: strict row typing — replaces Record<string,any> with per-table interfaces
// (short-term manual types; regenerate via `supabase gen types typescript` when schema evolves)
type BaseRow = Record<string, unknown>;

export interface VacancyRow extends BaseRow {
  id: string;
  workspace_id: string;
  canonical_key: string;
  title: string;
  employer_name: string | null;
  employer_status: string | null;
  location: string | null;
  region: string | null;
  role_family: string | null;
  seniority: string | null;
  client_status: string | null;
  search_channel: string;
  source_label: string | null;
  qa_status: string | null;
  candidate_map_status: string | null;
  candidate_market_summary: unknown;
  stakeholder_map_status: string | null;
  stakeholder_map_note: string | null;
  first_seen: string;
  last_seen: string | null;
  last_verified: string | null;
  summary: string | null;
}

export interface VacancyOperationRow extends BaseRow {
  workspace_id: string;
  vacancy_id: string;
  lifecycle_status: string | null;
  unread: boolean | null;
}

export interface VacancySourceRow extends BaseRow {
  id: string;
  workspace_id: string;
  vacancy_id: string;
  source_name: string;
  source_type: string;
  source_url: string | null;
  evidence_status: string | null;
  posted_at: string | null;
}

export interface VacancyRequirementRow extends BaseRow {
  id: string;
  workspace_id: string;
  vacancy_id: string;
  label: string;
  value: string | null;
  evidence_status: string | null;
  requirement_type: string | null;
  sort_order: number | null;
}

export interface StakeholderRow extends BaseRow {
  id: string;
  workspace_id: string;
  vacancy_id: string;
  stakeholder_key: string;
  full_name: string;
  current_title: string | null;
  relevance: string | null;
  reason_relevant: string | null;
  current_employment_status: string | null;
  profile_url: string | null;
  observed_business_email: string | null;
  probable_business_email: string | null;
  business_email: string | null;
  email_status: string | null;
  email_pattern_basis: string | null;
  email_confidence_note: string | null;
  evidence_status: string | null;
  last_verified: string | null;
}

export interface CompanyEmailRow extends BaseRow {
  workspace_id: string;
  vacancy_id: string;
  website_domain: string | null;
  employee_email_domain: string | null;
  domain_status: string | null;
  observed_pattern_examples_count: number | null;
  observed_business_email_examples: unknown;
  detected_pattern: string | null;
  pattern_status: string | null;
  pattern_basis: unknown;
  alternate_patterns: unknown;
  notes: string | null;
  last_verified: string | null;
}

export interface CandidateAssignmentRow extends BaseRow {
  id: string;
  workspace_id: string;
  vacancy_id: string;
  candidate_id: string;
  market_bucket: string | null;
  rank: number | null;
  comparable_tier: string | null;
  qa_status: string | null;
  why_fit: string | null;
  evidence_gaps: unknown;
  last_verified: string | null;
}

export interface CandidateOperationRow extends BaseRow {
  workspace_id: string;
  vacancy_id: string;
  candidate_id: string;
  operational_status: string | null;
}

export interface CandidateRow extends BaseRow {
  id: string;
  workspace_id: string;
  full_name: string;
  current_title: string | null;
  current_employer: string | null;
  location: string | null;
  profile_url: string | null;
}

export interface CandidateClaimRow extends BaseRow {
  workspace_id: string;
  candidate_id: string;
  claim_name: string;
  claim_value: string | null;
  evidence_status: string | null;
}

export interface ResearchQueryRow extends BaseRow {
  id: string;
  workspace_id: string;
  vacancy_id: string;
  query_text: string;
  source: string;
  search_family: string;
  execution_status: string;
  observed_yield: number | null;
  candidates_surfaced: number | null;
}

export interface RunRow extends BaseRow {
  id: string;
  workspace_id: string;
  external_run_id: string;
  channel: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  metrics: Record<string, number> | null;
}

export interface SavedViewRow extends BaseRow {
  id: string;
  workspace_id: string;
  user_id: string;
  name: string;
  view_state: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
}

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

  const workspaceId = workspace.id as string;

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
    savedViewsResult,
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
    supabase.from("saved_views").select("*").eq("workspace_id", workspaceId),
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
    savedViewsResult.error,
  ].filter(Boolean);

  if (errors.length) throw errors[0];

  // Strictly typed casts — column rename would surface as TS error via interfaces above
  const vacanciesData = (vacanciesResult.data || []) as VacancyRow[];
  const operationsData = (operationsResult.data || []) as VacancyOperationRow[];
  const sourcesData = (sourcesResult.data || []) as VacancySourceRow[];
  const requirementsData = (requirementsResult.data || []) as VacancyRequirementRow[];
  const stakeholdersData = (stakeholdersResult.data || []) as StakeholderRow[];
  const companyEmailData = (companyEmailResult.data || []) as CompanyEmailRow[];
  const assignmentsData = (assignmentsResult.data || []) as CandidateAssignmentRow[];
  const candidateOpsData = (candidateOpsResult.data || []) as CandidateOperationRow[];
  const candidatesData = (candidatesResult.data || []) as CandidateRow[];
  const claimsData = (claimsResult.data || []) as CandidateClaimRow[];
  const queriesData = (queriesResult.data || []) as ResearchQueryRow[];
  const runsData = (runsResult.data || []) as RunRow[];
  const savedViewsData = (savedViewsResult.data || []) as SavedViewRow[];

  const operationsByVacancy = mapBy(operationsData, "vacancy_id");
  const sourcesByVacancy = groupBy(sourcesData, "vacancy_id");
  const requirementsByVacancy = groupBy(requirementsData, "vacancy_id");
  const stakeholdersByVacancy = groupBy(stakeholdersData, "vacancy_id");
  const companyEmailByVacancy = mapBy(companyEmailData, "vacancy_id");
  const assignmentsByVacancy = groupBy(assignmentsData, "vacancy_id");
  const candidateOpsByKey = new Map<string, CandidateOperationRow>();
  for (const row of candidateOpsData) {
    candidateOpsByKey.set(`${row.vacancy_id}:${row.candidate_id}`, row);
  }
  const candidatesById = mapBy(candidatesData, "id");
  const claimsByCandidate = groupBy(claimsData, "candidate_id");
  const queriesByVacancy = groupBy(queriesData, "vacancy_id");

  const vacancies: Vacancy[] = vacanciesData
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

  const runs: RunSummary[] = runsData.map((row) => ({
    id: row.id,
    externalRunId: row.external_run_id,
    channel: row.channel as RunSummary["channel"],
    status: row.status as RunSummary["status"],
    startedAt: row.started_at,
    completedAt: row.completed_at,
    metrics: (row.metrics as Record<string, number>) || {},
  }));

  const savedViews = savedViewsData.map((row) => ({
    id: row.id,
    name: row.name,
    viewState: (row.view_state as Record<string, unknown>) || {},
    createdAt: row.created_at || undefined,
    updatedAt: row.updated_at || undefined,
  }));

  return {
    workspaceName: workspace.name as string,
    demoMode: false,
    generatedAt: new Date().toISOString(),
    vacancies,
    runs,
    savedViews,
  };
}

function toVacancy(
  row: VacancyRow,
  operation: VacancyOperationRow | undefined,
  sources: VacancySourceRow[],
  requirements: VacancyRequirementRow[],
  stakeholders: StakeholderRow[],
  companyEmail: CompanyEmailRow | undefined,
  assignments: CandidateAssignmentRow[],
  candidateOpsByKey: Map<string, CandidateOperationRow>,
  candidatesById: Map<string, CandidateRow>,
  claimsByCandidate: Map<string, CandidateClaimRow[]>,
  queries: ResearchQueryRow[]
): Vacancy {
  return {
    id: row.id,
    canonicalKey: row.canonical_key,
    title: row.title,
    employerName: row.employer_name || "Employer unresolved",
    employerStatus: (row.employer_status as Vacancy["employerStatus"]) || "UNKNOWN",
    location: row.location || "Unknown",
    region: row.region || "Unknown",
    roleFamily: row.role_family || "Other",
    seniority: row.seniority || "Unknown",
    clientStatus: (row.client_status as Vacancy["clientStatus"]) || "UNKNOWN",
    searchChannel: row.search_channel as Vacancy["searchChannel"],
    sourceLabel: row.source_label || row.search_channel,
    lifecycleStatus: (operation?.lifecycle_status as Vacancy["lifecycleStatus"]) || "DISCOVERED",
    qaStatus: (row.qa_status as Vacancy["qaStatus"]) || "PASS_WITH_UNKNOWNS",
    candidateMapStatus: (row.candidate_map_status as Vacancy["candidateMapStatus"]) || "NOT_STARTED",
    candidateMarketSummary: toCandidateMarketSummary(
      row.candidate_market_summary,
      assignments,
      queries
    ),
    stakeholderMapStatus: (row.stakeholder_map_status as Vacancy["stakeholderMapStatus"]) || "NOT_STARTED",
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

function toRequirement(row: VacancyRequirementRow): Requirement {
  return {
    id: row.id,
    label: row.label,
    value: row.value || "",
    status: (row.evidence_status as Requirement["status"]) || "UNKNOWN",
    type: (row.requirement_type as Requirement["type"]) || "CONTEXT",
  };
}

function toSource(row: VacancySourceRow): VacancySource {
  return {
    id: row.id,
    name: row.source_name,
    type: row.source_type,
    url: row.source_url,
    evidenceStatus: (row.evidence_status as VacancySource["evidenceStatus"]) || "UNKNOWN",
    postedAt: row.posted_at,
  };
}

function toCandidateMarketSummary(
  value: unknown,
  assignments: CandidateAssignmentRow[],
  queries: ResearchQueryRow[]
): CandidateMarketSummary {
  const raw =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  const credible = assignments.filter((row) =>
    ["LONGLIST", "STRONG_MARKET", "TOP_10"].includes(row.market_bucket as string)
  ).length;
  const strongest = assignments.filter((row) =>
    ["STRONG_MARKET", "TOP_10"].includes(row.market_bucket as string)
  ).length;
  const top10 = assignments.filter((row) => row.market_bucket === "TOP_10").length;
  const executed = queries.filter((row) => row.execution_status === "EXECUTED").length;

  return {
    coverageStatus:
      (raw.coverageStatus as CandidateMarketSummary["coverageStatus"]) ||
      (raw.coverage_status as CandidateMarketSummary["coverageStatus"]) ||
      (credible > 0 ? "IN_PROGRESS" : "NOT_STARTED"),
    rawProfilesReviewed:
      (raw.rawProfilesReviewed as number) ?? (raw.raw_profiles_reviewed as number) ?? null,
    credibleMarketCount:
      (raw.credibleMarketCount as number) ?? (raw.credible_market_count as number) ?? credible,
    strongestMarketCount:
      (raw.strongestMarketCount as number) ?? (raw.strongest_market_count as number) ?? strongest,
    top10Count: (raw.top10Count as number) ?? (raw.top10_count as number) ?? top10,
    executedQueryCount:
      (raw.executedQueryCount as number) ?? (raw.executed_query_count as number) ?? executed,
    coverageNote: (raw.coverageNote as string) ?? (raw.coverage_note as string) ?? null,
  };
}

function toCandidate(
  assignment: CandidateAssignmentRow,
  candidate: CandidateRow | undefined,
  operation: CandidateOperationRow | undefined,
  claims: CandidateClaimRow[]
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
    marketBucket: (assignment.market_bucket as CandidateAssignment["marketBucket"]) || "UNREVIEWED",
    operationalStatus: (operation?.operational_status as CandidateAssignment["operationalStatus"]) || "SURFACED",
    rank: assignment.rank,
    comparableTier: assignment.comparable_tier as CandidateAssignment["comparableTier"],
    qaStatus: (assignment.qa_status as QaStatus) || "PASS_WITH_UNKNOWNS",
    whyFit: assignment.why_fit || "",
    claims: claims.map(toCandidateClaim),
    evidenceGaps: Array.isArray(assignment.evidence_gaps)
      ? (assignment.evidence_gaps as string[])
      : [],
    lastVerified: assignment.last_verified,
  };
}

function toCandidateClaim(row: CandidateClaimRow): CandidateClaim {
  return {
    name: row.claim_name,
    value: row.claim_value || "",
    status: (row.evidence_status as CandidateClaim["status"]) || "UNKNOWN",
  };
}

function toStakeholder(row: StakeholderRow): HiringStakeholder {
  return {
    id: row.id,
    key: row.stakeholder_key,
    name: row.full_name,
    title: row.current_title,
    relevance: row.relevance as HiringStakeholder["relevance"],
    reasonRelevant: row.reason_relevant,
    currentEmploymentStatus: row.current_employment_status,
    profileUrl: row.profile_url,
    observedBusinessEmail: row.observed_business_email || null,
    probableBusinessEmail: row.probable_business_email || (!row.observed_business_email ? row.business_email : null),
    emailStatus: row.email_status as HiringStakeholder["emailStatus"],
    emailPatternBasis: row.email_pattern_basis,
    emailConfidenceNote: row.email_confidence_note,
    evidenceStatus: (row.evidence_status as HiringStakeholder["evidenceStatus"]) || "UNKNOWN",
    lastVerified: row.last_verified,
  };
}

function toCompanyEmailIntelligence(row: CompanyEmailRow): CompanyEmailIntelligence {
  return {
    websiteDomain: row.website_domain,
    employeeEmailDomain: row.employee_email_domain,
    domainStatus: (row.domain_status as CompanyEmailIntelligence["domainStatus"]) || "UNKNOWN",
    observedPatternExamplesCount: row.observed_pattern_examples_count || 0,
    observedBusinessEmailExamples: Array.isArray(row.observed_business_email_examples)
      ? (row.observed_business_email_examples as string[])
      : [],
    detectedPattern: row.detected_pattern,
    patternStatus: (row.pattern_status as CompanyEmailIntelligence["patternStatus"]) || "UNKNOWN_PATTERN",
    patternBasis: Array.isArray(row.pattern_basis) ? (row.pattern_basis as string[]) : [],
    alternatePatterns: Array.isArray(row.alternate_patterns) ? (row.alternate_patterns as string[]) : [],
    notes: row.notes,
    lastVerified: row.last_verified,
  };
}

function toResearchQuery(row: ResearchQueryRow): ResearchQuery {
  return {
    id: row.id,
    query: row.query_text,
    source: row.source,
    family: row.search_family,
    executionStatus: row.execution_status as ResearchQuery["executionStatus"],
    yieldCount: row.observed_yield,
    candidatesSurfaced: row.candidates_surfaced,
  };
}

function groupBy<T extends BaseRow>(rows: T[], key: keyof T) {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const value = row[key] as unknown as string | null | undefined;
    if (!value) continue;
    const existing = map.get(value) || [];
    existing.push(row);
    map.set(value, existing);
  }
  return map;
}

function mapBy<T extends BaseRow>(rows: T[], key: keyof T) {
  const map = new Map<string, T>();
  for (const row of rows) {
    const v = row[key] as unknown as string | null | undefined;
    if (v) map.set(v, row);
  }
  return map;
}
