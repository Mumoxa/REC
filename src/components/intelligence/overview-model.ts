import type { Vacancy, VacancyLifecycle, WorkspaceSnapshot } from "@/lib/data/types";
import { displayMarketCounts } from "@/lib/workspace/market-stats";
import { deriveOrganisations, validDate } from "@/components/organisations/read-model";

export const LIFECYCLE_LABELS: Record<VacancyLifecycle, string> = {
  DISCOVERED: "Discovered",
  VERIFYING: "Verifying",
  QUALIFIED: "Qualified",
  EMPLOYER_RESOLVED: "Employer resolved",
  CANDIDATE_MAPPING: "Candidate mapping",
  MARKET_READY: "Market ready",
  CLIENT_ACTION: "Client action",
  CLOSED: "Closed",
};
export const CHANNEL_LABELS: Record<Vacancy["searchChannel"], string> = {
  AGREED_CLIENTS: "Agreed clients",
  AGENCY_SITES: "Agency sites",
  LINKEDIN: "LinkedIn",
  JOB_BOARDS: "Job boards",
};

export function researchPriorities(vacancy: Vacancy): string[] {
  return [
    vacancy.qaStatus === "FAIL_RESEARCH_REQUIRED" ? "Independent QA requires research" : null,
    vacancy.employerStatus !== "CONFIRMED" ? "Resolve employer identity" : null,
    vacancy.candidateMapStatus !== "READY" ? "Complete candidate mapping" : null,
    vacancy.stakeholderMapStatus !== "READY"
      ? vacancy.stakeholderMapStatus === "BLOCKED_WITH_EVIDENCE"
        ? "Review stakeholder evidence blocker"
        : "Map hiring stakeholders"
      : null,
  ].filter((value): value is string => Boolean(value));
}

export function buildIntelligenceOverview(snapshot: WorkspaceSnapshot) {
  const active = snapshot.vacancies.filter((role) => role.lifecycleStatus !== "CLOSED");
  const organisations = deriveOrganisations(snapshot.vacancies);
  const lifecycle = (Object.keys(LIFECYCLE_LABELS) as VacancyLifecycle[])
    .filter((status) => status !== "CLOSED")
    .map((status) => ({
      status,
      label: LIFECYCLE_LABELS[status],
      count: active.filter((role) => role.lifecycleStatus === status).length,
    }));
  const market = active.reduce(
    (totals, role) => {
      const counts = displayMarketCounts(role.candidates, role.candidateMarketSummary);
      totals.credible += counts.credible;
      totals.strongest += counts.strongest;
      totals.top10 += counts.top10;
      return totals;
    },
    { credible: 0, strongest: 0, top10: 0 }
  );
  return {
    active,
    organisations,
    lifecycle,
    market,
    namedOrganisationCount: organisations.filter((org) => org.identified).length,
    unresolvedCount: snapshot.vacancies.filter((role) => role.employerStatus !== "CONFIRMED")
      .length,
    newCount: active.filter((role) => role.unread).length,
    candidateCount: new Set(
      snapshot.vacancies.flatMap((role) => role.candidates.map((person) => person.candidateId))
    ).size,
    stakeholderCount: snapshot.vacancies.reduce(
      (count, role) => count + role.stakeholders.length,
      0
    ),
    priorities: active
      .map((role) => ({ role, reasons: researchPriorities(role) }))
      .filter((item) => item.reasons.length)
      .sort(
        (a, b) =>
          Number(b.role.qaStatus === "FAIL_RESEARCH_REQUIRED") -
            Number(a.role.qaStatus === "FAIL_RESEARCH_REQUIRED") ||
          b.reasons.length - a.reasons.length ||
          validDate(b.role.firstSeen) - validDate(a.role.firstSeen)
      ),
    recent: [...active].sort((a, b) => validDate(b.firstSeen) - validDate(a.firstSeen)).slice(0, 6),
    runs: [...snapshot.runs]
      .sort((a, b) => validDate(b.startedAt) - validDate(a.startedAt))
      .slice(0, 4),
    commercial: active.filter(
      (role) => role.clientStatus === "AGREED_CLIENT" || role.clientStatus === "AGREED_GROUP_ENTITY"
    ),
    channels: (Object.keys(CHANNEL_LABELS) as Vacancy["searchChannel"][]).map((channel) => ({
      channel,
      label: CHANNEL_LABELS[channel],
      count: active.filter((role) => role.searchChannel === channel).length,
    })),
  };
}
