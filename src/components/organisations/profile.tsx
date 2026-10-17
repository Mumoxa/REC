"use client";

import Link from "next/link";
import { useState, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowUpRight, Building2, ExternalLink, FileSearch, MapPin } from "lucide-react";
import { Badge, EmptyState, PageHeader } from "@/components/ui/primitives";
import { CHANNEL_LABELS, LIFECYCLE_LABELS } from "@/components/intelligence/overview-model";
import {
  RELATIONSHIP_LABELS,
  safeSourceUrl,
  shortDate,
  vacancyHref,
  type Organisation,
} from "./read-model";

const TABS = [
  "Overview",
  "Vacancies",
  "Hiring stakeholders",
  "Candidate connections",
  "Research evidence",
  "Commercial relationship",
  "Hiring history",
] as const;
type ProfileTab = (typeof TABS)[number];

export function OrganisationProfile({ organisation: org }: { organisation: Organisation }) {
  const [tab, setTab] = useState<ProfileTab>("Overview");
  const people = new Set(
    org.vacancies.flatMap((role) => role.candidates.map((person) => person.candidateId))
  );
  const stakeholders = org.vacancies.flatMap((vacancy) =>
    vacancy.stakeholders.map((person) => ({ person, vacancy }))
  );
  const candidateConnections = org.vacancies.flatMap((vacancy) =>
    vacancy.candidates.map((person) => ({ person, vacancy }))
  );
  const sources = org.vacancies.flatMap((vacancy) =>
    vacancy.sources.map((source) => ({ source, vacancy }))
  );
  function navigateTabs(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (event.key === "ArrowRight") next = (index + 1) % TABS.length;
    else if (event.key === "ArrowLeft") next = (index + TABS.length - 1) % TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TABS.length - 1;
    else return;
    event.preventDefault();
    setTab(TABS[next]);
    document.getElementById(`org-tab-${next}`)?.focus();
  }
  const index = TABS.indexOf(tab);
  return (
    <div className="org-profile">
      <Link href="/companies" className="org-back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        All organisations
      </Link>
      <PageHeader
        eyebrow="Organisations / Employer intelligence"
        title={org.name}
        description={
          org.identified
            ? "Connected vacancy research for this recorded employer label."
            : `Employer identity remains unresolved for ${org.vacancies[0].title}.`
        }
        actions={<Badge value={org.employerEvidence} />}
      />
      <div className="surface org-profile-hero">
        <span className="org-avatar large">
          <Building2 size={32} aria-hidden="true" />
        </span>
        <div>
          <div className="org-relationship-tags">
            {org.clientStatuses.map((status) => (
              <span key={status} className="org-relationship">
                {RELATIONSHIP_LABELS[status]}
              </span>
            ))}
          </div>
          <p>
            <MapPin size={14} aria-hidden="true" />
            {org.locations.join(" · ") || "Location not recorded"}
          </p>
          <span className="muted">
            Derived employer grouping · {org.vacancies.length} canonical vacancy records
          </span>
        </div>
        <dl className="org-profile-counts">
          <div>
            <dd>{org.activeCount}</dd>
            <dt>Active roles</dt>
          </div>
          <div>
            <dd>{people.size}</dd>
            <dt>Mapped people</dt>
          </div>
          <div>
            <dd>{stakeholders.length}</dd>
            <dt>Stakeholder links</dt>
          </div>
        </dl>
      </div>
      <div className="org-scope-note">
        <FileSearch size={17} aria-hidden="true" />
        <p>
          Matching labels do not establish a legal company identity. Evidence, commercial
          relationship and market readiness are preserved per vacancy. Candidate connections show
          researched vacancy markets, not proven employment at this employer.
        </p>
      </div>
      <div className="surface org-profile-body">
        <div className="org-tabs" role="tablist" aria-label="Organisation intelligence">
          {TABS.map((label, tabIndex) => (
            <button
              type="button"
              key={label}
              role="tab"
              id={`org-tab-${tabIndex}`}
              aria-controls={`org-panel-${tabIndex}`}
              aria-selected={tab === label}
              tabIndex={tab === label ? 0 : -1}
              onClick={() => setTab(label)}
              onKeyDown={(event) => navigateTabs(event, tabIndex)}
            >
              {label}
            </button>
          ))}
        </div>
        <section
          role="tabpanel"
          id={`org-panel-${index}`}
          aria-labelledby={`org-tab-${index}`}
          className="org-tab-panel"
          tabIndex={0}
        >
          {tab === "Overview" ? (
            <>
              <div className="org-profile-two">
                <div>
                  <h2>Employer research overview</h2>
                  <p className="muted">
                    {org.vacancies.length} vacancy records carry this employer label.{" "}
                    {org.activeCount} remain active and {org.closedCount} are closed. The latest
                    recorded observation is {shortDate(org.latestActivity)}.
                  </p>
                  <dl className="org-fact-list">
                    <div>
                      <dt>Employer identity evidence</dt>
                      <dd>
                        {org.employerStatuses.map((status) => (
                          <Badge value={status} key={status} />
                        ))}
                      </dd>
                    </div>
                    <div>
                      <dt>Role disciplines</dt>
                      <dd>{org.roleFamilies.join(" · ") || "Not recorded"}</dd>
                    </div>
                    <div>
                      <dt>Industry / company size</dt>
                      <dd>Not recorded in canonical data</dd>
                    </div>
                    <div>
                      <dt>Organisation-wide website</dt>
                      <dd>
                        Not independently established; inspect vacancy-level domain research below
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="org-insight-panel">
                  <span className="eyebrow">Evidence coverage</span>
                  <strong>
                    {org.confirmedSourceCount}
                    <span> / {org.sourceCount}</span>
                  </strong>
                  <p>Confirmed source records across associated vacancies.</p>
                  <p className="muted">
                    Source verification does not establish every employer claim or commercial
                    relationship.
                  </p>
                  <button className="btn btn-secondary" onClick={() => setTab("Research evidence")}>
                    Inspect evidence
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </button>
                </div>
              </div>
              <h3>Vacancy-level employer confidence</h3>
              <div className="org-confidence-list">
                {org.vacancies.map((vacancy) => (
                  <Link key={vacancy.id} href={vacancyHref(vacancy.id)}>
                    <span>{vacancy.title}</span>
                    <Badge value={vacancy.employerStatus} />
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </>
          ) : null}
          {tab === "Vacancies" ? (
            <>
              <TabHeading
                title="Associated vacancies"
                description="Canonical vacancy records sharing this employer label, including closed records."
              />
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th scope="col">Vacancy</th>
                      <th scope="col">Channel / location</th>
                      <th scope="col">Lifecycle</th>
                      <th scope="col">Employer identity</th>
                      <th scope="col">Independent QA</th>
                      <th scope="col">Market</th>
                    </tr>
                  </thead>
                  <tbody>
                    {org.vacancies.map((role) => (
                      <tr key={role.id}>
                        <td>
                          <Link className="org-record-title" href={vacancyHref(role.id)}>
                            {role.title}
                          </Link>
                          <span className="org-cell-meta">
                            First seen {shortDate(role.firstSeen)}
                          </span>
                        </td>
                        <td>
                          {CHANNEL_LABELS[role.searchChannel]}
                          <span className="org-cell-meta">{role.location || "Not recorded"}</span>
                        </td>
                        <td>{LIFECYCLE_LABELS[role.lifecycleStatus]}</td>
                        <td>
                          <Badge value={role.employerStatus} />
                        </td>
                        <td>
                          <Badge value={role.qaStatus} />
                        </td>
                        <td>
                          {role.candidates.length} loaded
                          <span className="org-cell-meta">
                            {role.candidateMapStatus.replaceAll("_", " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
          {tab === "Hiring stakeholders" ? (
            <>
              <TabHeading
                title="Hiring stakeholder associations"
                description="Contacts remain scoped to their vacancy, relevance assessment and evidence status."
              />
              {stakeholders.length ? (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th scope="col">Stakeholder</th>
                        <th scope="col">Role / relevance</th>
                        <th scope="col">Vacancy</th>
                        <th scope="col">Evidence</th>
                        <th scope="col">Last verified</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stakeholders.map(({ person, vacancy }) => (
                        <tr key={`${vacancy.id}:${person.id}`}>
                          <td>
                            <Link
                              className="org-record-title"
                              href={`/stakeholders?stakeholder=${encodeURIComponent(person.id)}&vacancy=${encodeURIComponent(vacancy.id)}`}
                            >
                              {person.name}
                            </Link>
                          </td>
                          <td>
                            {person.title || "Title not recorded"}
                            <span className="org-cell-meta">
                              {person.relevance?.replaceAll("_", " ") || "Relevance not classified"}
                            </span>
                          </td>
                          <td>
                            <Link href={vacancyHref(vacancy.id)}>{vacancy.title}</Link>
                          </td>
                          <td>
                            <Badge value={person.evidenceStatus} />
                          </td>
                          <td>{shortDate(person.lastVerified)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="No stakeholder records published">
                  Hiring-team mapping has not supplied contact records for these vacancies.{" "}
                  <Link href={vacancyHref(org.vacancies[0].id)}>Inspect the vacancy research.</Link>
                </EmptyState>
              )}
            </>
          ) : null}
          {tab === "Candidate connections" ? (
            <>
              <TabHeading
                title="Candidate-market connections"
                description={`${people.size} unique loaded people across ${candidateConnections.length} vacancy assignments. Research bucket and recruiter action are separate facts.`}
              />
              {candidateConnections.length ? (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th scope="col">Candidate</th>
                        <th scope="col">Recorded current employer</th>
                        <th scope="col">Vacancy market</th>
                        <th scope="col">Research layer</th>
                        <th scope="col">Recruiter action</th>
                        <th scope="col">QA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidateConnections.map(({ person, vacancy }) => (
                        <tr key={`${vacancy.id}:${person.assignmentId}`}>
                          <td>
                            <Link
                              className="org-record-title"
                              href={`/candidates?candidate=${encodeURIComponent(person.candidateId)}&vacancy=${encodeURIComponent(vacancy.id)}`}
                            >
                              {person.name}
                            </Link>
                            <span className="org-cell-meta">
                              {person.currentTitle || "Title not recorded"}
                            </span>
                          </td>
                          <td>{person.currentEmployer || "Not recorded"}</td>
                          <td>
                            <Link href={vacancyHref(vacancy.id)}>{vacancy.title}</Link>
                          </td>
                          <td>
                            <Badge value={person.marketBucket} />
                          </td>
                          <td>
                            <Badge value={person.operationalStatus} />
                          </td>
                          <td>
                            <Badge value={person.qaStatus} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="No candidate assignments published">
                  Candidate mapping records will appear here when available.{" "}
                  <Link href={vacancyHref(org.vacancies[0].id)}>Open the vacancy market.</Link>
                </EmptyState>
              )}
            </>
          ) : null}
          {tab === "Research evidence" ? (
            <>
              <TabHeading
                title="Research source records"
                description="Source records retain their original confidence. A confirmed source does not upgrade employer or candidate claims."
              />
              {sources.length ? (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th scope="col">Source</th>
                        <th scope="col">Vacancy</th>
                        <th scope="col">Evidence</th>
                        <th scope="col">Source date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sources.map(({ source, vacancy }) => (
                        <tr key={`${vacancy.id}:${source.id}`}>
                          <td>
                            {safeSourceUrl(source.url) ? (
                              <a
                                href={safeSourceUrl(source.url)!}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {source.name}
                                <ExternalLink size={12} aria-label="opens in new tab" />
                              </a>
                            ) : (
                              <strong>{source.name}</strong>
                            )}
                            <span className="org-cell-meta">
                              {source.type.replaceAll("_", " ")}
                              {!safeSourceUrl(source.url) ? " · source URL not recorded" : ""}
                            </span>
                          </td>
                          <td>
                            <Link href={vacancyHref(vacancy.id)}>{vacancy.title}</Link>
                          </td>
                          <td>
                            <Badge value={source.evidenceStatus} />
                          </td>
                          <td>{shortDate(source.postedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="No source records published">
                  Employer confidence remains as recorded on each vacancy.
                </EmptyState>
              )}
              <h3 className="org-domain-heading">Vacancy-level domain research</h3>
              {org.vacancies.map((vacancy) => (
                <div className="org-domain-record" key={vacancy.id}>
                  <Link href={vacancyHref(vacancy.id)}>{vacancy.title}</Link>
                  {vacancy.companyEmailIntelligence ? (
                    <>
                      <div>
                        <span>
                          Website domain:{" "}
                          {vacancy.companyEmailIntelligence.websiteDomain || "Unknown"}
                        </span>
                        <Badge value={vacancy.companyEmailIntelligence.domainStatus} />
                      </div>
                      <p className="muted">
                        Employee email domain:{" "}
                        {vacancy.companyEmailIntelligence.employeeEmailDomain || "Unknown"} ·
                        Pattern status:{" "}
                        {vacancy.companyEmailIntelligence.patternStatus.replaceAll("_", " ")}
                      </p>
                    </>
                  ) : (
                    <p className="muted">No company domain or email-pattern research recorded.</p>
                  )}
                </div>
              ))}
            </>
          ) : null}
          {tab === "Commercial relationship" ? (
            <>
              <TabHeading
                title="Recorded commercial relationships"
                description="Relationship labels come from vacancy records. These labels do not establish an account contract, placement or fee."
              />
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th scope="col">Vacancy</th>
                      <th scope="col">Client relationship</th>
                      <th scope="col">Research channel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {org.vacancies.map((vacancy) => (
                      <tr key={vacancy.id}>
                        <td>
                          <Link href={vacancyHref(vacancy.id)}>{vacancy.title}</Link>
                        </td>
                        <td>{RELATIONSHIP_LABELS[vacancy.clientStatus]}</td>
                        <td>{CHANNEL_LABELS[vacancy.searchChannel]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="org-unavailable">
                <h3>Commercial data not available</h3>
                <p>
                  Revenue potential, fees, placements, account ownership, engagement history and
                  agreements are not included in REC’s canonical workspace snapshot.
                </p>
              </div>
            </>
          ) : null}
          {tab === "Hiring history" ? (
            <>
              <TabHeading
                title="Recorded hiring observations"
                description="Dates are vacancy research observations, not a complete organisation activity or recruiter audit history."
              />
              <div className="org-history-list">
                {[...org.vacancies]
                  .sort((a, b) => Date.parse(b.firstSeen) - Date.parse(a.firstSeen))
                  .map((vacancy) => (
                    <div key={vacancy.id}>
                      <span className="org-history-dot" />
                      <div>
                        <Link className="org-record-title" href={vacancyHref(vacancy.id)}>
                          {vacancy.title}
                        </Link>
                        <span>
                          {LIFECYCLE_LABELS[vacancy.lifecycleStatus]} ·{" "}
                          {CHANNEL_LABELS[vacancy.searchChannel]}
                        </span>
                        <dl>
                          <div>
                            <dt>First seen</dt>
                            <dd>{shortDate(vacancy.firstSeen)}</dd>
                          </div>
                          <div>
                            <dt>Last seen</dt>
                            <dd>{shortDate(vacancy.lastSeen)}</dd>
                          </div>
                          <div>
                            <dt>Last verified</dt>
                            <dd>{shortDate(vacancy.lastVerified)}</dd>
                          </div>
                        </dl>
                        {vacancy.lifecycleStatus === "CLOSED" ? (
                          <p>
                            Close reason:{" "}
                            {vacancy.closedReason?.replaceAll("_", " ") || "Not recorded"}
                            {vacancy.closeReasonDetail ? ` — ${vacancy.closeReasonDetail}` : ""}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
              </div>
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function TabHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="org-tab-heading">
      <h2>{title}</h2>
      <p className="muted">{description}</p>
    </div>
  );
}
