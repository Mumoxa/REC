"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  List,
  MapPin,
  Network,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { Badge, EmptyState, PageHeader, StatCard } from "@/components/ui/primitives";
import type { CandidateAssignment, WorkspaceSnapshot } from "@/lib/data/types";
import { CandidateIntelligence } from "./candidate-intelligence";
import {
  candidateDate,
  candidateIdentities,
  candidateLabel,
  EMPTY_CANDIDATE_FILTERS,
  latestVerified,
  matchingAssignments,
  workflowLabel,
  type CandidateFilters,
  type CandidateIdentity,
  type CandidateMarketLink,
} from "./market-model";

const PAGE_SIZE = 12;
const BUCKETS = ["TOP_10", "STRONG_MARKET", "LONGLIST", "UNREVIEWED", "EXCLUDED"];
const QA_STATUSES = ["PASS", "PASS_WITH_UNKNOWNS", "FAIL_RESEARCH_REQUIRED"];

export function CandidateMarkets({
  snapshot,
  initialSearch = "",
  initialCandidateId = "",
  initialVacancyId = "",
}: {
  snapshot: WorkspaceSnapshot;
  initialSearch?: string;
  initialCandidateId?: string;
  initialVacancyId?: string;
}) {
  const [filters, setFilters] = useState<CandidateFilters>({
    ...EMPTY_CANDIDATE_FILTERS,
    search: initialSearch,
    vacancy: initialVacancyId,
  });
  const [density, setDensity] = useState<"cards" | "table">("cards");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState({
    candidateId: initialCandidateId,
    vacancyId: initialVacancyId,
  });
  const [operations, setOperations] = useState<
    Record<string, Pick<CandidateAssignment, "operationalStatus" | "excludedReason">>
  >({});
  const vacancies = useMemo(
    () =>
      snapshot.vacancies.map((vacancy) => ({
        ...vacancy,
        candidates: vacancy.candidates.map((candidate) => ({
          ...candidate,
          ...operations[`${vacancy.id}:${candidate.candidateId}`],
        })),
      })),
    [snapshot.vacancies, operations]
  );
  const people = useMemo(() => candidateIdentities(vacancies), [vacancies]);
  const allAssignments = vacancies.flatMap((vacancy) => vacancy.candidates);
  const results = people
    .map((person) => ({ person, links: matchingAssignments(person, filters) }))
    .filter(({ links }) => links.length > 0)
    .sort((a, b) => {
      if (sort === "links")
        return (
          b.person.assignments.length - a.person.assignments.length ||
          a.person.profile.name.localeCompare(b.person.profile.name)
        );
      if (sort === "verified")
        return (
          (Date.parse(latestVerified(b.person) ?? "") || 0) -
            (Date.parse(latestVerified(a.person) ?? "") || 0) ||
          a.person.profile.name.localeCompare(b.person.profile.name)
        );
      return a.person.profile.name.localeCompare(b.person.profile.name);
    });
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const activePage = Math.min(page, pageCount);
  const paged = results.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);
  const activePerson = people.find((person) => person.id === selected.candidateId);
  const activeFilters = Object.entries(filters).filter(([, value]) => Boolean(value));

  function updateFilter(key: keyof CandidateFilters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }
  function resetFilters() {
    setFilters({ ...EMPTY_CANDIDATE_FILTERS });
    setPage(1);
  }
  function openPerson(person: CandidateIdentity, preferredVacancyId?: string) {
    setSelected({
      candidateId: person.id,
      vacancyId: preferredVacancyId ?? person.assignments[0].vacancy.id,
    });
  }
  function options(key: "currentEmployer" | "currentTitle" | "location") {
    return [...new Set(allAssignments.map((candidate) => candidate[key]).filter(Boolean))].sort();
  }
  function filterLabel(key: string, value: string) {
    if (key === "vacancy") return vacancies.find((vacancy) => vacancy.id === value)?.title ?? value;
    if (key === "tier")
      return value === "UNKNOWN" ? "Tier not recorded" : `Comparable tier ${value}`;
    return key === "bucket" || key === "qa" ? candidateLabel(value) : value;
  }

  return (
    <div className="candidate-markets">
      <PageHeader
        eyebrow="Talent intelligence"
        title="Candidate markets"
        description="The full talent market, with evidence behind every decision."
        actions={
          <Link className="btn btn-primary" href="/">
            Explore vacancies <ArrowRight size={16} />
          </Link>
        }
      />
      <div className="stat-grid candidate-stats">
        <StatCard
          label="Unique candidates"
          value={people.length}
          detail="People across all mapped markets"
          icon={<Users size={19} />}
        />
        <StatCard
          label="Vacancy assignments"
          value={allAssignments.length}
          detail={`${vacancies.filter((vacancy) => vacancy.candidates.length > 0).length} vacancies with candidate research`}
          icon={<Network size={19} />}
        />
        <StatCard
          label="Credible assignments"
          value={
            allAssignments.filter((candidate) =>
              ["LONGLIST", "STRONG_MARKET", "TOP_10"].includes(candidate.marketBucket)
            ).length
          }
          detail="Longlist, strong market and Research Top 10"
          icon={<ShieldCheck size={19} />}
        />
        <StatCard
          label="Need research review"
          value={allAssignments.filter((candidate) => candidate.qaStatus !== "PASS").length}
          detail="Assignment QA with unknowns or challenges"
          icon={<BriefcaseBusiness size={19} />}
        />
      </div>
      <section className="surface candidate-controls" aria-label="Candidate search and filters">
        <div className="candidate-search-row">
          <div className="candidate-search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              aria-label="Search candidates"
              placeholder="Search name, role, employer, location or evidence…"
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
            />
          </div>
          <label className="candidate-filter">
            <span>Research bucket</span>
            <select
              value={filters.bucket}
              onChange={(event) => updateFilter("bucket", event.target.value)}
              aria-label="Filter research bucket"
            >
              <option value="">All research buckets</option>
              {BUCKETS.map((bucket) => (
                <option key={bucket} value={bucket}>
                  {candidateLabel(bucket)}
                </option>
              ))}
            </select>
          </label>
          <div className="candidate-density" role="group" aria-label="Candidate viewing density">
            <button
              type="button"
              aria-label="Card view"
              aria-pressed={density === "cards"}
              onClick={() => setDensity("cards")}
            >
              <Grid2X2 size={18} />
            </button>
            <button
              type="button"
              aria-label="Compact table view"
              aria-pressed={density === "table"}
              onClick={() => setDensity("table")}
            >
              <List size={18} />
            </button>
          </div>
        </div>
        <div className="candidate-filter-grid">
          <label className="candidate-filter">
            <span>Employer</span>
            <select
              aria-label="Filter candidate employer"
              value={filters.employer}
              onChange={(event) => updateFilter("employer", event.target.value)}
            >
              <option value="">All employers</option>
              {options("currentEmployer").map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="candidate-filter">
            <span>Job title</span>
            <select
              aria-label="Filter candidate job title"
              value={filters.title}
              onChange={(event) => updateFilter("title", event.target.value)}
            >
              <option value="">All job titles</option>
              {options("currentTitle").map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="candidate-filter">
            <span>Location</span>
            <select
              aria-label="Filter candidate location"
              value={filters.location}
              onChange={(event) => updateFilter("location", event.target.value)}
            >
              <option value="">All locations</option>
              {options("location").map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="candidate-filter">
            <span>QA outcome</span>
            <select
              aria-label="Filter candidate QA"
              value={filters.qa}
              onChange={(event) => updateFilter("qa", event.target.value)}
            >
              <option value="">All QA outcomes</option>
              {QA_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {candidateLabel(value)}
                </option>
              ))}
            </select>
          </label>
          <label className="candidate-filter">
            <span>Vacancy association</span>
            <select
              aria-label="Filter associated vacancy"
              value={filters.vacancy}
              onChange={(event) => updateFilter("vacancy", event.target.value)}
            >
              <option value="">All vacancies</option>
              {vacancies.map((vacancy) => (
                <option key={vacancy.id} value={vacancy.id}>
                  {vacancy.title} · {vacancy.employerName}
                </option>
              ))}
            </select>
          </label>
          <label className="candidate-filter">
            <span>Comparable tier</span>
            <select
              aria-label="Filter comparable tier"
              value={filters.tier}
              onChange={(event) => updateFilter("tier", event.target.value)}
            >
              <option value="">All comparable tiers</option>
              {["A", "B", "C", "D"].map((value) => (
                <option key={value} value={value}>
                  Tier {value}
                </option>
              ))}
              <option value="UNKNOWN">Not recorded</option>
            </select>
          </label>
        </div>
        {activeFilters.length > 0 && (
          <div className="candidate-active-filters" aria-label="Active candidate filters">
            <SlidersHorizontal size={14} aria-hidden="true" />
            {activeFilters.map(([key, value]) => (
              <button
                type="button"
                key={key}
                onClick={() => updateFilter(key as keyof CandidateFilters, "")}
                aria-label={`Remove ${key} filter`}
              >
                {filterLabel(key, value)} <X size={12} aria-hidden="true" />
              </button>
            ))}
            <button type="button" className="candidate-clear" onClick={resetFilters}>
              Reset filters
            </button>
          </div>
        )}
      </section>
      <div className="candidate-results-heading">
        <div>
          <h2>
            Researched talent <span>{results.length}</span>
          </h2>
          <p>One person, all their vacancy contexts. Evidence and workflow stay distinct.</p>
        </div>
        <label className="candidate-sort">
          <span>Sort by</span>
          <select
            aria-label="Sort candidates"
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setPage(1);
            }}
          >
            <option value="name">Name A–Z</option>
            <option value="links">Most vacancy links</option>
            <option value="verified">Recently verified</option>
          </select>
        </label>
      </div>
      {paged.length === 0 ? (
        <div className="surface">
          <EmptyState
            title={
              people.length === 0 ? "No candidate research published" : "No matching candidates"
            }
          >
            {people.length === 0 ? (
              <p>Candidate markets appear here when research is published to REC.</p>
            ) : (
              <>
                <p>Try a broader search or change your evidence and vacancy filters.</p>
                <button type="button" className="btn btn-secondary" onClick={resetFilters}>
                  Reset filters
                </button>
              </>
            )}
          </EmptyState>
        </div>
      ) : density === "cards" ? (
        <div className="candidate-card-grid">
          {paged.map(({ person, links }) => (
            <CandidateCard
              key={person.id}
              person={person}
              link={links[0]}
              onOpen={() => openPerson(person, links[0].vacancy.id)}
            />
          ))}
        </div>
      ) : (
        <div className="surface table-wrap candidate-table-wrap">
          <table className="data-table candidate-table">
            <caption className="sr-only">
              Researched candidate identities and their selected vacancy context
            </caption>
            <thead>
              <tr>
                <th scope="col">Candidate</th>
                <th scope="col">Employer / location</th>
                <th scope="col">Vacancy / research</th>
                <th scope="col">Evidence / QA</th>
                <th scope="col">Verified</th>
                <th scope="col">Intelligence</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(({ person, links }) => {
                const { candidate, vacancy } = links[0];
                return (
                  <tr key={person.id}>
                    <td>
                      <strong>{candidate.name}</strong>
                      <span>{candidate.currentTitle || "Title not recorded"}</span>
                    </td>
                    <td>
                      <strong>{candidate.currentEmployer || "Employer not recorded"}</strong>
                      <span>{candidate.location || "Location not recorded"}</span>
                    </td>
                    <td>
                      <strong>{vacancy.title}</strong>
                      <span>
                        {candidateLabel(candidate.marketBucket)} · {person.assignments.length}{" "}
                        {person.assignments.length === 1 ? "assignment" : "assignments"}
                      </span>
                    </td>
                    <td>
                      <Badge value={candidate.qaStatus} />
                      <span>
                        {candidate.claims.filter((claim) => claim.status === "CONFIRMED").length}{" "}
                        confirmed claims
                      </span>
                    </td>
                    <td>{candidateDate(candidate.lastVerified)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        aria-label={`Open intelligence for ${candidate.name}`}
                        onClick={() => openPerson(person, vacancy.id)}
                      >
                        Open <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {results.length > 0 && (
        <nav className="candidate-pagination" aria-label="Candidate pagination">
          <span>
            Showing {(activePage - 1) * PAGE_SIZE + 1}–
            {Math.min(activePage * PAGE_SIZE, results.length)} of {results.length} candidates
          </span>
          <div>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={activePage === 1}
              aria-label="Previous candidate page"
              onClick={() => setPage(activePage - 1)}
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <span>
              Page {activePage} of {pageCount}
            </span>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={activePage === pageCount}
              aria-label="Next candidate page"
              onClick={() => setPage(activePage + 1)}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </nav>
      )}
      {initialCandidateId && !activePerson && selected.candidateId && (
        <div role="status" className="surface candidate-unavailable">
          The linked candidate is unavailable in this workspace. Search the authorised candidate
          market above.
        </div>
      )}
      {activePerson && (
        <CandidateIntelligence
          key={activePerson.id}
          person={activePerson}
          initialVacancyId={selected.vacancyId}
          demoMode={snapshot.demoMode}
          onClose={() => setSelected({ candidateId: "", vacancyId: "" })}
          onSaved={(vacancyId, candidateId, operation) =>
            setOperations((current) => ({ ...current, [`${vacancyId}:${candidateId}`]: operation }))
          }
        />
      )}
    </div>
  );
}

function CandidateCard({
  person,
  link,
  onOpen,
}: {
  person: CandidateIdentity;
  link: CandidateMarketLink;
  onOpen: () => void;
}) {
  const { candidate, vacancy } = link;
  const confirmed = candidate.claims.filter((claim) => claim.status === "CONFIRMED");
  const unknown = candidate.claims.filter((claim) => claim.status !== "CONFIRMED");
  const initials = candidate.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  return (
    <article className="surface candidate-card" aria-label={`${candidate.name} candidate profile`}>
      <div className="candidate-card-identity">
        <div className="candidate-avatar" aria-hidden="true">
          {initials}
        </div>
        <div>
          <h3>{candidate.name}</h3>
          <p>{candidate.currentTitle || "Title not recorded"}</p>
        </div>
        {candidate.comparableTier && (
          <span className="candidate-tier" title="Comparable employer tier">
            Tier {candidate.comparableTier}
          </span>
        )}
      </div>
      <div className="candidate-identity-meta">
        <span>
          <Building2 size={13} aria-hidden="true" />
          {candidate.currentEmployer || "Employer not recorded"}
        </span>
        <span>
          <MapPin size={13} aria-hidden="true" />
          {candidate.location || "Location not recorded"}
        </span>
      </div>
      <div className="candidate-market-context">
        <div className="candidate-context-label">
          <BriefcaseBusiness size={13} aria-hidden="true" />
          <span>{vacancy.title}</span>
        </div>
        <div className="candidate-badge-row">
          <Badge value={`RESEARCH_${candidate.marketBucket}`} />
          <span className="candidate-assignment-count">
            {person.assignments.length}{" "}
            {person.assignments.length === 1 ? "vacancy link" : "vacancy links"}
          </span>
        </div>
        <p>{candidate.whyFit || "Role-specific fit assessment has not been recorded."}</p>
      </div>
      <div className="candidate-evidence-strip">
        <span>
          <Check size={13} aria-hidden="true" />
          {confirmed.length} confirmed claims
        </span>
        <span>
          {unknown.length} unverified · {candidate.evidenceGaps.length} gaps
        </span>
      </div>
      <div className="candidate-evidence-tags">
        {confirmed.slice(0, 2).map((claim) => (
          <span key={`${claim.name}:${claim.value}`}>{claim.name}</span>
        ))}
        {unknown.length > 0 && (
          <span className="candidate-unverified">Verify: {unknown[0].name}</span>
        )}
      </div>
      <div className="candidate-card-status">
        <Badge value={candidate.qaStatus} />
        <span>{workflowLabel(candidate.operationalStatus)}</span>
      </div>
      <div className="candidate-card-footer">
        <span>Verified {candidateDate(candidate.lastVerified)}</span>
        <button
          type="button"
          className="btn btn-primary"
          aria-label={`Open intelligence for ${candidate.name}`}
          onClick={onOpen}
        >
          Open intelligence
          <ArrowRight size={14} />
        </button>
      </div>
    </article>
  );
}
