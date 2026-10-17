"use client";

import Link from "next/link";
import { lazy, Suspense, useDeferredValue, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { Badge, EmptyState, PageHeader, StatCard } from "@/components/ui/primitives";
import type { Vacancy } from "@/lib/data/types";

import {
  deriveOrganisations,
  filterOrganisations,
  organisationHref,
  paginateOrganisations,
  RELATIONSHIP_LABELS,
  shortDate,
  type Organisation,
  type OrganisationFilters,
} from "./read-model";

const OrganisationProfile = lazy(() =>
  import("./profile").then((module) => ({ default: module.OrganisationProfile }))
);

export function OrganisationDirectory({
  vacancies,
  initialQuery = "",
  selectedKey,
}: {
  vacancies: Vacancy[];
  initialQuery?: string;
  selectedKey?: string;
}) {
  const organisations = useMemo(() => deriveOrganisations(vacancies), [vacancies]);
  const [filters, setFilters] = useState<OrganisationFilters>({
    query: initialQuery,
    relationship: "ALL",
    location: "ALL",
    evidence: "ALL",
    sort: "ACTIVE",
  });
  const [display, setDisplay] = useState<"CARDS" | "TABLE">("CARDS");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const locations = [...new Set(organisations.flatMap((org) => org.locations))].sort();
  const deferredFilters = useDeferredValue(filters);
  const filtered = useMemo(
    () => filterOrganisations(organisations, deferredFilters),
    [organisations, deferredFilters]
  );
  const paginated = paginateOrganisations(filtered, page, pageSize);
  const update = <K extends keyof OrganisationFilters>(key: K, value: OrganisationFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };
  const reset = () => {
    setFilters({
      query: "",
      relationship: "ALL",
      location: "ALL",
      evidence: "ALL",
      sort: "ACTIVE",
    });
    setPage(1);
  };
  if (selectedKey) {
    const org = organisations.find((row) => row.key === selectedKey);
    return org ? (
      <Suspense fallback={<p role="status">Loading organisation intelligence…</p>}>
        <OrganisationProfile organisation={org} />
      </Suspense>
    ) : (
      <div className="org-directory">
        <PageHeader
          eyebrow="Organisations / Profile"
          title="Employer group not found"
          description="This employer label is not present in the current authorised workspace snapshot."
        />
        <EmptyState title="The underlying vacancy grouping may have changed">
          <Link prefetch={false} className="btn btn-primary" href="/companies">
            Return to organisations
          </Link>
        </EmptyState>
      </div>
    );
  }
  return (
    <div className="org-directory">
      <PageHeader
        eyebrow="Connected intelligence / Employers"
        title="Organisations"
        description="Explore hiring activity, relationships and research across the employers in your workspace."
        actions={
          <Link prefetch={false} href="/" className="btn btn-primary">
            <ArrowUpRight size={16} aria-hidden="true" />
            Open vacancy workspace
          </Link>
        }
      />
      <div className="stat-grid org-stats">
        <StatCard
          label="Named employer groups"
          value={organisations.filter((org) => org.identified).length}
          detail="Matching recorded labels, across all vacancies"
          icon={<Building2 size={18} />}
        />
        <StatCard
          label="Active vacancies"
          value={vacancies.filter((role) => role.lifecycleStatus !== "CLOSED").length}
          detail="Non-closed canonical vacancy records"
          icon={<ArrowUpRight size={18} />}
        />
        <StatCard
          label="Agreed-client groups"
          value={
            organisations.filter(
              (org) => org.identified && org.clientStatuses.includes("AGREED_CLIENT")
            ).length
          }
          detail="At least one vacancy marked agreed client"
          icon={<ShieldCheck size={18} />}
        />
        <StatCard
          label="Identity research needed"
          value={vacancies.filter((role) => role.employerStatus !== "CONFIRMED").length}
          detail="Vacancies without confirmed employer identity"
          icon={<Search size={18} />}
        />
      </div>
      <div className="org-scope-note">
        <Building2 size={17} aria-hidden="true" />
        <p>
          A read view of canonical vacancy research. Matching employer labels are grouped;
          unresolved labels stay separate. Relationship and employer confidence remain
          vacancy-specific. Industry, employee counts and revenue are not recorded.
        </p>
      </div>
      <section className="surface org-directory-section" aria-labelledby="org-directory-heading">
        <div className="org-filter-panel">
          <div className="org-directory-heading">
            <h2 id="org-directory-heading">Employer intelligence</h2>
            <span>{organisations.length} groups including unresolved labels</span>
          </div>
          <div className="org-search-row">
            <label className="org-search-field">
              <Search size={18} aria-hidden="true" />
              <span className="sr-only">Search organisations</span>
              <input
                type="search"
                value={filters.query}
                onChange={(event) => update("query", event.target.value)}
                placeholder="Search name, location, role or discipline…"
              />
            </label>
            <div className="org-view-toggle" aria-label="Directory display">
              <button
                type="button"
                onClick={() => setDisplay("CARDS")}
                aria-pressed={display === "CARDS"}
                aria-label="Card view"
              >
                <LayoutGrid size={17} />
              </button>
              <button
                type="button"
                onClick={() => setDisplay("TABLE")}
                aria-pressed={display === "TABLE"}
                aria-label="Table view"
              >
                <List size={18} />
              </button>
            </div>
          </div>
          <div className="org-filter-row">
            <SlidersHorizontal size={16} className="org-filter-icon" aria-hidden="true" />
            <label>
              <span className="sr-only">Client relationship</span>
              <select
                aria-label="Client relationship"
                className="field"
                value={filters.relationship}
                onChange={(event) => update("relationship", event.target.value)}
              >
                <option value="ALL">All relationships</option>
                {Object.entries(RELATIONSHIP_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Location</span>
              <select
                aria-label="Location"
                className="field"
                value={filters.location}
                onChange={(event) => update("location", event.target.value)}
              >
                <option value="ALL">All locations</option>
                {locations.map((location) => (
                  <option key={location}>{location}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Employer confidence</span>
              <select
                aria-label="Employer confidence"
                className="field"
                value={filters.evidence}
                onChange={(event) => update("evidence", event.target.value)}
              >
                <option value="ALL">All employer confidence</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROBABLE">Probable</option>
                <option value="HYPOTHESIS">Hypothesis</option>
                <option value="UNKNOWN">Unknown</option>
                <option value="MIXED">Mixed evidence</option>
              </select>
            </label>
            <label className="org-sort-control">
              <span className="sr-only">Sort organisations</span>
              <select
                aria-label="Sort organisations"
                className="field"
                value={filters.sort}
                onChange={(event) =>
                  update("sort", event.target.value as OrganisationFilters["sort"])
                }
              >
                <option value="ACTIVE">Most active vacancies</option>
                <option value="RECENT">Latest observation</option>
                <option value="NAME">Name A–Z</option>
              </select>
            </label>
          </div>
        </div>
        <div className="org-results-line">
          <span role="status">
            {filtered.length} matching {filtered.length === 1 ? "group" : "groups"}
          </span>
          <button className="org-text-button" type="button" onClick={reset}>
            Reset filters
          </button>
        </div>
        {!filtered.length ? (
          <EmptyState title="No employer groups match your filters">
            <p>Search another name, location or role, or reset the filters.</p>
            <button className="btn btn-secondary" onClick={reset}>
              Reset filters
            </button>
          </EmptyState>
        ) : display === "CARDS" ? (
          <div className="org-card-grid">
            {paginated.items.map((org) => (
              <OrganisationCard key={org.key} organisation={org} />
            ))}
          </div>
        ) : (
          <OrganisationTable organisations={paginated.items} />
        )}
        {filtered.length > 0 ? (
          <div className="org-pagination">
            <span>
              Showing {paginated.start}–{paginated.end} of {filtered.length}
            </span>
            <label className="org-page-size">
              Per page
              <select
                className="field"
                aria-label="Organisations per page"
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
              >
                <option value={9}>9</option>
                <option value={18}>18</option>
                <option value={36}>36</option>
              </select>
            </label>
            <div className="org-page-buttons">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={paginated.page <= 1}
                onClick={() => setPage(paginated.page - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <span>
                Page {paginated.page} of {paginated.pageCount}
              </span>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={paginated.page >= paginated.pageCount}
                onClick={() => setPage(paginated.page + 1)}
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function OrganisationCard({ organisation: org }: { organisation: Organisation }) {
  return (
    <article className="org-card">
      <div className="org-card-top">
        <span className={`org-avatar ${!org.identified ? "unresolved" : ""}`}>
          <Building2 size={23} aria-hidden="true" />
        </span>
        <div className="org-card-badges">
          <Badge value={org.employerEvidence} />
          <span>
            {org.employerEvidence === "MIXED" ? "Vacancy confidence differs" : "Employer identity"}
          </span>
        </div>
      </div>
      <h3>
        <Link prefetch={false} href={organisationHref(org.key)}>
          {org.name}
        </Link>
      </h3>
      {!org.identified ? (
        <p className="org-unresolved-description">Unresolved employer · {org.vacancies[0].title}</p>
      ) : (
        <p className="org-location">
          <MapPin size={13} aria-hidden="true" />
          {org.locations.join(" · ") || "Location not recorded"}
        </p>
      )}
      <div className="org-relationship-tags">
        {org.clientStatuses.map((status) => (
          <span
            key={status}
            className={`org-relationship ${status === "AGREED_CLIENT" ? "agreed" : ""}`}
          >
            {RELATIONSHIP_LABELS[status]}
          </span>
        ))}
      </div>
      <dl className="org-card-counts">
        <div>
          <dd>{org.activeCount}</dd>
          <dt>Active roles</dt>
        </div>
        <div>
          <dd>{org.candidateCount}</dd>
          <dt>Mapped people</dt>
        </div>
        <div>
          <dd>{org.stakeholderCount}</dd>
          <dt>Contact links</dt>
        </div>
      </dl>
      <div className="org-card-evidence">
        <ShieldCheck size={14} aria-hidden="true" />
        <span>
          {org.confirmedSourceCount} confirmed / {org.sourceCount} source records
        </span>
      </div>
      <div className="org-card-footer">
        <span>
          Last observed<strong>{shortDate(org.latestActivity)}</strong>
        </span>
        <Link
          prefetch={false}
          href={organisationHref(org.key)}
          aria-label={`Open intelligence for ${org.name}`}
        >
          View intelligence
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

function OrganisationTable({ organisations }: { organisations: Organisation[] }) {
  return (
    <div className="table-wrap org-table">
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Organisation / employer label</th>
            <th scope="col">Relationship</th>
            <th scope="col">Employer identity</th>
            <th scope="col">Active roles</th>
            <th scope="col">Last observed</th>
            <th scope="col">
              <span className="sr-only">Open profile</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {organisations.map((org) => (
            <tr key={org.key}>
              <td>
                <Link
                  prefetch={false}
                  className="org-record-title"
                  href={organisationHref(org.key)}
                >
                  {org.name}
                </Link>
                <span className="org-cell-meta">
                  {org.identified
                    ? org.locations.join(" · ") || "Location not recorded"
                    : `Unresolved · ${org.vacancies[0].title}`}
                </span>
              </td>
              <td>
                {org.clientStatuses.map((status) => (
                  <span className="org-cell-meta" key={status}>
                    {RELATIONSHIP_LABELS[status]}
                  </span>
                ))}
              </td>
              <td>
                <Badge value={org.employerEvidence} />
              </td>
              <td>
                <strong>{org.activeCount}</strong>
                <span className="org-cell-meta">{org.closedCount} closed</span>
              </td>
              <td>{shortDate(org.latestActivity)}</td>
              <td>
                <Link
                  prefetch={false}
                  href={organisationHref(org.key)}
                  className="intelligence-icon-link"
                  aria-label={`Open ${org.name}`}
                >
                  <ArrowUpRight size={17} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
