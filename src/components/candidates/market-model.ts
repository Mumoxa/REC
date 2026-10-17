import type { CandidateAssignment, Vacancy } from "@/lib/data/types";

export interface CandidateMarketLink {
  vacancy: Vacancy;
  candidate: CandidateAssignment;
}

export interface CandidateIdentity {
  id: string;
  profile: CandidateAssignment;
  assignments: CandidateMarketLink[];
}

export interface CandidateFilters {
  search: string;
  employer: string;
  title: string;
  location: string;
  bucket: string;
  qa: string;
  vacancy: string;
  tier: string;
}

export const EMPTY_CANDIDATE_FILTERS: CandidateFilters = {
  search: "",
  employer: "",
  title: "",
  location: "",
  bucket: "",
  qa: "",
  vacancy: "",
  tier: "",
};

/** A person occurs once in the directory; research and workflow stay on each assignment. */
export function candidateIdentities(vacancies: Vacancy[]): CandidateIdentity[] {
  const people = new Map<string, CandidateIdentity>();
  for (const vacancy of vacancies) {
    for (const candidate of vacancy.candidates) {
      const person = people.get(candidate.candidateId) ?? {
        id: candidate.candidateId,
        profile: candidate,
        assignments: [],
      };
      person.assignments.push({ vacancy, candidate });
      people.set(candidate.candidateId, person);
    }
  }
  return [...people.values()];
}

export function matchingAssignments(
  person: CandidateIdentity,
  filters: CandidateFilters
): CandidateMarketLink[] {
  const search = filters.search.trim().toLowerCase();
  return person.assignments.filter(({ vacancy, candidate }) => {
    if (filters.employer && candidate.currentEmployer !== filters.employer) return false;
    if (filters.title && candidate.currentTitle !== filters.title) return false;
    if (filters.location && candidate.location !== filters.location) return false;
    if (filters.bucket && candidate.marketBucket !== filters.bucket) return false;
    if (filters.qa && candidate.qaStatus !== filters.qa) return false;
    if (filters.vacancy && vacancy.id !== filters.vacancy) return false;
    if (filters.tier && (candidate.comparableTier ?? "UNKNOWN") !== filters.tier) return false;
    return (
      !search ||
      [
        candidate.name,
        candidate.currentTitle,
        candidate.currentEmployer,
        candidate.location,
        vacancy.title,
        vacancy.employerName,
        candidate.marketBucket,
        candidate.qaStatus,
        candidate.comparableTier,
        ...candidate.claims.map((claim) => `${claim.name} ${claim.value}`),
      ]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  });
}

export function latestVerified(person: CandidateIdentity): string | undefined {
  return person.assignments
    .map(({ candidate }) => candidate.lastVerified)
    .filter((date): date is string => typeof date === "string" && Number.isFinite(Date.parse(date)))
    .sort((a, b) => Date.parse(b) - Date.parse(a))[0];
}

export function candidateLabel(value: string): string {
  const labels: Record<string, string> = {
    TOP_10: "Research Top 10",
    STRONG_MARKET: "Strong market",
    LONGLIST: "Longlist",
    UNREVIEWED: "Unreviewed",
    EXCLUDED: "Research excluded",
    PASS: "QA pass",
    PASS_WITH_UNKNOWNS: "QA: unknowns remain",
    FAIL_RESEARCH_REQUIRED: "QA: research required",
  };
  return (
    labels[value] ??
    value
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/^./, (first) => first.toUpperCase())
  );
}

export function workflowLabel(value: CandidateAssignment["operationalStatus"]): string {
  if (value === "TOP_10") return "Recruiter Top 10";
  if (value === "EXCLUDED") return "Recruiter excluded";
  return candidateLabel(value);
}

export const CANDIDATE_WORKFLOW_STAGES: CandidateAssignment["operationalStatus"][] = [
  "SURFACED",
  "RELEVANT",
  "EARMARKED",
  "TOP_10",
  "APPROACH",
  "ENGAGED",
  "SUBMITTED",
];

/** Preserve the established forward workflow, current-stage toggles and explicit restore. */
export function canChangeWorkflow(
  current: CandidateAssignment["operationalStatus"],
  next: CandidateAssignment["operationalStatus"]
): boolean {
  if (current === next) return true;
  if (current === "EXCLUDED") return next === "RELEVANT";
  if (next === "EXCLUDED") return true;
  if (current === "EARMARKED" && next === "RELEVANT") return true;
  if (current === "TOP_10" && next === "EARMARKED") return true;
  return CANDIDATE_WORKFLOW_STAGES.indexOf(next) > CANDIDATE_WORKFLOW_STAGES.indexOf(current);
}

export function candidateDate(value?: string | null): string {
  if (!value || !Number.isFinite(Date.parse(value))) return "Not recorded";
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Johannesburg",
  }).format(new Date(value));
}

/** Only public web destinations can be opened from evidence records. */
export function publicProfileUrl(value?: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}
