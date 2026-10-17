import type {
  CandidateAssignment,
  EvidenceStatus,
  HiringStakeholder,
  QaStatus,
  RunSummary,
  Vacancy,
} from "@/lib/data/types";

export const CHANNEL_LABELS: Record<Vacancy["searchChannel"], string> = {
  AGREED_CLIENTS: "Agreed clients",
  AGENCY_SITES: "Agency sites",
  LINKEDIN: "LinkedIn",
  JOB_BOARDS: "Job boards",
};

export function humanise(value: string): string {
  const text = value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function safePublicUrl(value?: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? value : null;
  } catch {
    return null;
  }
}

export interface StakeholderEntry {
  id: string;
  person: HiringStakeholder;
  vacancy: Vacancy;
}
export function collectStakeholders(vacancies: Vacancy[]): StakeholderEntry[] {
  return vacancies.flatMap((vacancy) =>
    vacancy.stakeholders.map((person) => ({ id: `${vacancy.id}:${person.id}`, person, vacancy }))
  );
}

export type EvidenceKind =
  "VACANCY_QA" | "CANDIDATE_QA" | "EMPLOYER" | "REQUIREMENT" | "SOURCE" | "CLAIM" | "GAP";
export const EVIDENCE_KIND_LABELS: Record<EvidenceKind, string> = {
  VACANCY_QA: "Vacancy QA",
  CANDIDATE_QA: "Candidate QA",
  EMPLOYER: "Employer identity",
  REQUIREMENT: "Vacancy requirement",
  SOURCE: "Source verification",
  CLAIM: "Candidate claim",
  GAP: "Evidence gap",
};
export interface EvidenceRecord {
  id: string;
  kind: EvidenceKind;
  title: string;
  description: string;
  status: EvidenceStatus | QaStatus;
  needsReview: boolean;
  blocking: boolean;
  vacancyId: string;
  vacancyTitle: string;
  employerName: string;
  candidateId?: string;
  candidateName?: string;
  lastVerified?: string | null;
  sourceUrl?: string | null;
  sourceDate?: string | null;
  entityHref: string;
}

export function buildEvidenceRecords(vacancies: Vacancy[]): EvidenceRecord[] {
  return vacancies.flatMap((vacancy) => {
    const context = {
      vacancyId: vacancy.id,
      vacancyTitle: vacancy.title,
      employerName: vacancy.employerName,
      lastVerified: vacancy.lastVerified,
      entityHref: `/?vacancy=${encodeURIComponent(vacancy.id)}`,
    };
    const records: EvidenceRecord[] = [
      {
        ...context,
        id: `${vacancy.id}:qa`,
        kind: "VACANCY_QA",
        title: vacancy.title,
        description:
          vacancy.qaStatus === "PASS"
            ? "The recorded vacancy QA gate passed."
            : vacancy.qaStatus === "PASS_WITH_UNKNOWNS"
              ? "The vacancy gate passed with unresolved unknowns."
              : "The vacancy QA gate requires further research.",
        status: vacancy.qaStatus,
        needsReview: vacancy.qaStatus !== "PASS",
        blocking: vacancy.qaStatus === "FAIL_RESEARCH_REQUIRED",
      },
      {
        ...context,
        id: `${vacancy.id}:employer`,
        kind: "EMPLOYER",
        title: vacancy.employerName,
        description: "Confidence in the employer identity associated with this vacancy.",
        status: vacancy.employerStatus,
        needsReview: vacancy.employerStatus !== "CONFIRMED",
        blocking: false,
      },
    ];
    vacancy.requirements.forEach((requirement) =>
      records.push({
        ...context,
        id: `${vacancy.id}:requirement:${requirement.id}`,
        kind: "REQUIREMENT",
        title: requirement.label,
        description: `${requirement.value} · ${humanise(requirement.type)}`,
        status: requirement.status,
        needsReview: requirement.status !== "CONFIRMED",
        blocking: false,
      })
    );
    vacancy.sources.forEach((source) =>
      records.push({
        ...context,
        id: `${vacancy.id}:source:${source.id}`,
        kind: "SOURCE",
        title: source.name,
        description: humanise(source.type),
        status: source.evidenceStatus,
        needsReview: source.evidenceStatus !== "CONFIRMED",
        blocking: false,
        sourceUrl: safePublicUrl(source.url),
        sourceDate: source.postedAt,
      })
    );
    if (!vacancy.sources.length)
      records.push({
        ...context,
        id: `${vacancy.id}:sources-missing`,
        kind: "GAP",
        title: "No vacancy sources recorded",
        description: "This vacancy has no source records in the current snapshot.",
        status: "UNKNOWN",
        needsReview: true,
        blocking: false,
      });
    vacancy.candidates.forEach((candidate: CandidateAssignment) => {
      const candidateContext = {
        ...context,
        candidateId: candidate.candidateId,
        candidateName: candidate.name,
        lastVerified: candidate.lastVerified,
        entityHref: `/candidates?candidate=${encodeURIComponent(candidate.candidateId)}&vacancy=${encodeURIComponent(vacancy.id)}`,
      };
      records.push({
        ...candidateContext,
        id: `${vacancy.id}:${candidate.assignmentId}:qa`,
        kind: "CANDIDATE_QA",
        title: candidate.name,
        description:
          candidate.qaStatus === "PASS"
            ? "The recorded candidate QA gate passed for this vacancy."
            : candidate.qaStatus === "PASS_WITH_UNKNOWNS"
              ? "The candidate gate passed with unresolved unknowns for this vacancy."
              : "The candidate QA gate requires further research for this vacancy.",
        status: candidate.qaStatus,
        needsReview: candidate.qaStatus !== "PASS",
        blocking: candidate.qaStatus === "FAIL_RESEARCH_REQUIRED",
      });
      candidate.claims.forEach((claim, index) =>
        records.push({
          ...candidateContext,
          id: `${vacancy.id}:${candidate.assignmentId}:claim:${index}`,
          kind: "CLAIM",
          title: claim.name,
          description: claim.value,
          status: claim.status,
          needsReview: claim.status !== "CONFIRMED",
          blocking: false,
        })
      );
      candidate.evidenceGaps.forEach((gap, index) =>
        records.push({
          ...candidateContext,
          id: `${vacancy.id}:${candidate.assignmentId}:gap:${index}`,
          kind: "GAP",
          title: candidate.name,
          description: gap,
          status: "UNKNOWN",
          needsReview: true,
          blocking: false,
        })
      );
    });
    return records;
  });
}

export function runStatusNote(status: RunSummary["status"]): string {
  const notes: Record<RunSummary["status"], string> = {
    QUEUED: "Queued in the research pipeline. Publication receipt is not available in this view.",
    RUNNING:
      "Research is in progress. Check recorded metrics for the available checkpoint context.",
    COMPLETE:
      "The pipeline records this run as complete. A publication receipt is not available in this view.",
    PARTIAL:
      "Partial run: research or publication may require follow-up. Inspect its recorded metrics before use.",
    FAILED:
      "The pipeline records a failure. Earlier checkpoints may exist; this status alone does not establish publication outcomes.",
  };
  return notes[status];
}

export function formatRunDuration(startedAt: string, completedAt?: string | null): string {
  if (!completedAt) return "Not recorded";
  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return "Not recorded";
  const minutes = Math.round((end - start) / 60000);
  const hours = Math.floor(minutes / 60);
  return hours ? `${hours}h ${String(minutes % 60).padStart(2, "0")}m` : `${minutes}m`;
}
