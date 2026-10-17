import type { EvidenceStatus, Vacancy } from "@/lib/data/types";

export const RELATIONSHIP_LABELS: Record<Vacancy["clientStatus"], string> = {
  AGREED_CLIENT: "Agreed client",
  AGREED_GROUP_ENTITY: "Agreed group entity",
  PAST_CLIENT: "Past client",
  TARGET_PROSPECT: "Target prospect",
  UNKNOWN: "Relationship unknown",
};

export interface Organisation {
  key: string;
  name: string;
  identified: boolean;
  vacancies: Vacancy[];
  activeCount: number;
  newCount: number;
  closedCount: number;
  candidateCount: number;
  stakeholderCount: number;
  sourceCount: number;
  confirmedSourceCount: number;
  employerEvidence: EvidenceStatus | "MIXED";
  employerStatuses: EvidenceStatus[];
  clientStatuses: Vacancy["clientStatus"][];
  locations: string[];
  roleFamilies: string[];
  latestActivity: string | null;
}

const UNRESOLVED_LABEL =
  /^(?:unknown|unresolved|unidentified|not (?:known|recorded|provided)|confidential|undisclosed|anonymous)(?: employer| company| organisation)?$|^(?:employer|company|organisation) (?:unknown|unresolved|unidentified|not (?:known|recorded|provided))$/i;
const unique = <T extends string>(values: T[]): T[] => [...new Set(values)].sort();
export function validDate(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** An employer-label read model, never an employer registry or identity resolution. */
export function deriveOrganisations(vacancies: Vacancy[]): Organisation[] {
  const groups = new Map<string, { name: string; identified: boolean; vacancies: Vacancy[] }>();
  for (const vacancy of vacancies) {
    const name = vacancy.employerName.trim().replace(/\s+/g, " ");
    const identified = Boolean(name) && !UNRESOLVED_LABEL.test(name);
    const key = identified
      ? `label:${name.toLocaleLowerCase("en-ZA")}`
      : `unresolved:${vacancy.id}`;
    const group = groups.get(key) ?? {
      name: name || "Employer unresolved",
      identified,
      vacancies: [],
    };
    group.vacancies.push(vacancy);
    groups.set(key, group);
  }
  return [...groups.entries()]
    .map(([key, group]): Organisation => {
      const roles = group.vacancies;
      const employerStatuses = unique(roles.map((role) => role.employerStatus));
      const active = roles.filter((role) => role.lifecycleStatus !== "CLOSED");
      const dates = roles
        .flatMap((role) => [role.firstSeen, role.lastSeen, role.lastVerified])
        .filter((value): value is string => Boolean(value) && validDate(value) > 0)
        .sort((a, b) => validDate(b) - validDate(a));
      return {
        key,
        ...group,
        activeCount: active.length,
        newCount: active.filter((role) => role.unread).length,
        closedCount: roles.length - active.length,
        candidateCount: new Set(
          roles.flatMap((role) => role.candidates.map((person) => person.candidateId))
        ).size,
        stakeholderCount: roles.reduce((count, role) => count + role.stakeholders.length, 0),
        sourceCount: roles.reduce((count, role) => count + role.sources.length, 0),
        confirmedSourceCount: roles.reduce(
          (count, role) =>
            count + role.sources.filter((source) => source.evidenceStatus === "CONFIRMED").length,
          0
        ),
        employerEvidence: employerStatuses.length === 1 ? employerStatuses[0] : "MIXED",
        employerStatuses,
        clientStatuses: unique(roles.map((role) => role.clientStatus)),
        locations: unique(roles.map((role) => role.location).filter(Boolean)),
        roleFamilies: unique(roles.map((role) => role.roleFamily).filter(Boolean)),
        latestActivity: dates[0] ?? null,
      };
    })
    .sort(
      (a, b) =>
        b.activeCount - a.activeCount || a.name.localeCompare(b.name) || a.key.localeCompare(b.key)
    );
}

export interface OrganisationFilters {
  query: string;
  relationship: string;
  location: string;
  evidence: string;
  sort: "ACTIVE" | "RECENT" | "NAME";
}

export function filterOrganisations(
  rows: Organisation[],
  filters: OrganisationFilters
): Organisation[] {
  const query = filters.query.trim().toLocaleLowerCase("en-ZA");
  return rows
    .filter((row) => {
      const searchable = [
        row.name,
        ...row.locations,
        ...row.roleFamilies,
        ...row.vacancies.map((role) => role.title),
      ]
        .join(" ")
        .toLocaleLowerCase("en-ZA");
      return (
        (!query || searchable.includes(query)) &&
        (filters.relationship === "ALL" ||
          row.clientStatuses.includes(filters.relationship as Vacancy["clientStatus"])) &&
        (filters.location === "ALL" || row.locations.includes(filters.location)) &&
        (filters.evidence === "ALL" || row.employerEvidence === filters.evidence)
      );
    })
    .sort((a, b) => {
      const primary =
        filters.sort === "ACTIVE"
          ? b.activeCount - a.activeCount
          : filters.sort === "RECENT"
            ? validDate(b.latestActivity) - validDate(a.latestActivity)
            : 0;
      return primary || a.name.localeCompare(b.name) || a.key.localeCompare(b.key);
    });
}

export function paginateOrganisations(rows: Organisation[], requestedPage: number, pageSize = 9) {
  const safeSize = Math.max(1, Math.floor(pageSize) || 9);
  const pageCount = Math.max(1, Math.ceil(rows.length / safeSize));
  const page = Math.max(1, Math.min(pageCount, Math.floor(requestedPage) || 1));
  const offset = (page - 1) * safeSize;
  return {
    items: rows.slice(offset, offset + safeSize),
    page,
    pageCount,
    start: rows.length ? offset + 1 : 0,
    end: Math.min(offset + safeSize, rows.length),
  };
}

export function organisationHref(key: string): string {
  return `/companies?company=${encodeURIComponent(key)}`;
}

export function vacancyHref(id: string): string {
  return `/?vacancy=${encodeURIComponent(id)}`;
}

export function shortDate(value: string | null | undefined): string {
  if (!value || !validDate(value)) return "Not recorded";
  return new Intl.DateTimeFormat("en-ZA", {
    timeZone: "Africa/Johannesburg",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function safeSourceUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}
