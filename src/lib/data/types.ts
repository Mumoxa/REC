export type EvidenceStatus = "CONFIRMED" | "PROBABLE" | "HYPOTHESIS" | "UNKNOWN";
export type QaStatus = "PASS" | "PASS_WITH_UNKNOWNS" | "FAIL_RESEARCH_REQUIRED";
export type VacancyLifecycle = "DISCOVERED" | "VERIFYING" | "QUALIFIED" | "EMPLOYER_RESOLVED" | "CANDIDATE_MAPPING" | "TOP_10_READY" | "CLIENT_ACTION" | "CLOSED";
export type CandidateOperationalStatus = "SURFACED" | "RELEVANT" | "EARMARKED" | "TOP_10" | "APPROACH" | "ENGAGED" | "SUBMITTED" | "EXCLUDED";
export type MarketBucket = "TOP_10" | "STRONG_MARKET" | "LONGLIST" | "UNREVIEWED" | "EXCLUDED";

export interface Requirement {
  id: string;
  label: string;
  value: string;
  status: EvidenceStatus;
  type: "REQUIRED" | "PREFERRED" | "CONTEXT";
}

export interface VacancySource {
  id: string;
  name: string;
  type: string;
  url?: string | null;
  evidenceStatus: EvidenceStatus;
  postedAt?: string | null;
}

export interface CandidateClaim {
  name: string;
  value: string;
  status: EvidenceStatus;
}

export interface CandidateAssignment {
  assignmentId: string;
  candidateId: string;
  name: string;
  currentTitle: string;
  currentEmployer: string;
  location: string;
  profileUrl?: string | null;
  marketBucket: MarketBucket;
  operationalStatus: CandidateOperationalStatus;
  rank?: number | null;
  comparableTier?: "A" | "B" | "C" | "D" | null;
  qaStatus: QaStatus;
  whyFit: string;
  claims: CandidateClaim[];
  evidenceGaps: string[];
  lastVerified?: string | null;
}

export interface ResearchQuery {
  id: string;
  query: string;
  source: string;
  family: string;
  executionStatus: "EXECUTED" | "ACCESS_LIMITED" | "NOT_APPLICABLE" | "NOT_EXECUTED";
  yieldCount?: number | null;
  candidatesSurfaced?: number | null;
}

export interface Vacancy {
  id: string;
  canonicalKey: string;
  title: string;
  employerName: string;
  employerStatus: EvidenceStatus;
  location: string;
  region: string;
  roleFamily: string;
  seniority: string;
  clientStatus: "AGREED_CLIENT" | "AGREED_GROUP_ENTITY" | "PAST_CLIENT" | "TARGET_PROSPECT" | "UNKNOWN";
  searchChannel: "AGREED_CLIENTS" | "AGENCY_SITES" | "LINKEDIN" | "JOB_BOARDS";
  sourceLabel: string;
  lifecycleStatus: VacancyLifecycle;
  qaStatus: QaStatus;
  candidateMapStatus: "NOT_STARTED" | "IN_PROGRESS" | "READY";
  firstSeen: string;
  lastSeen?: string | null;
  lastVerified?: string | null;
  summary: string;
  unread: boolean;
  requirements: Requirement[];
  sources: VacancySource[];
  candidates: CandidateAssignment[];
  researchQueries: ResearchQuery[];
}

export interface RunSummary {
  id: string;
  externalRunId: string;
  channel: Vacancy["searchChannel"];
  status: "QUEUED" | "RUNNING" | "COMPLETE" | "FAILED" | "PARTIAL";
  startedAt: string;
  completedAt?: string | null;
  metrics: Record<string, number>;
}

export interface WorkspaceSnapshot {
  workspaceName: string;
  demoMode: boolean;
  generatedAt: string;
  vacancies: Vacancy[];
  runs: RunSummary[];
}
