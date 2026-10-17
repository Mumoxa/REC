"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CircleCheck,
  Fingerprint,
  Globe,
  Mail,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { Vacancy } from "@/lib/data/types";
import { Badge, Dialog, EmptyState, PageHeader, StatCard } from "@/components/ui/primitives";
import {
  collectStakeholders,
  humanise,
  safePublicUrl,
  type StakeholderEntry,
} from "./research-model";
import { Pagination, RecordedTime, SearchField } from "./research-ui";

const PAGE_SIZE = 12;

export function StakeholderDirectory({
  vacancies,
  initialStakeholderId,
  initialVacancyId,
}: {
  vacancies: Vacancy[];
  initialStakeholderId?: string;
  initialVacancyId?: string;
}) {
  const entries = useMemo(() => collectStakeholders(vacancies), [vacancies]);
  const initialMatches = entries.filter(
    (entry) =>
      entry.person.id === initialStakeholderId &&
      (!initialVacancyId || entry.vacancy.id === initialVacancyId)
  );
  const [selected, setSelected] = useState<StakeholderEntry | null>(
    initialMatches.length === 1 ? initialMatches[0] : null
  );
  const [search, setSearch] = useState("");
  const [evidence, setEvidence] = useState("ALL");
  const [relevance, setRelevance] = useState("ALL");
  const [page, setPage] = useState(1);
  const filtered = entries.filter(
    ({ person, vacancy }) =>
      (evidence === "ALL" || person.evidenceStatus === evidence) &&
      (relevance === "ALL" || person.relevance === relevance) &&
      [
        person.name,
        person.title,
        vacancy.employerName,
        vacancy.title,
        person.observedBusinessEmail,
        person.probableBusinessEmail,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search.trim().toLowerCase())
  );
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const activeFilters = search || evidence !== "ALL" || relevance !== "ALL";
  const reset = () => {
    setSearch("");
    setEvidence("ALL");
    setRelevance("ALL");
    setPage(1);
  };
  const relevanceOptions = [
    ...new Set(
      entries
        .map((entry) => entry.person.relevance)
        .filter((value): value is NonNullable<typeof value> => Boolean(value))
    ),
  ].sort();

  return (
    <>
      <PageHeader
        eyebrow="Relationships that move research forward"
        title="Hiring stakeholders"
        description="Decision-makers, hiring owners and talent contacts, connected to the vacancy evidence behind each mapping."
        actions={
          <Link prefetch={false} className="btn btn-secondary" href="/">
            Explore vacancies <ArrowUpRight size={16} />
          </Link>
        }
      />
      <div className="stat-grid research-stats">
        <StatCard
          label="Stakeholder mappings"
          value={entries.length}
          detail="Vacancy-specific associations"
          icon={<Users size={20} />}
        />
        <StatCard
          label="Confirmed evidence"
          value={entries.filter(({ person }) => person.evidenceStatus === "CONFIRMED").length}
          detail="Confirmed stakeholder mappings"
          icon={<ShieldCheck size={20} />}
        />
        <StatCard
          label="Vacancies with contacts"
          value={vacancies.filter((vacancy) => vacancy.stakeholders.length > 0).length}
          detail={`Across ${vacancies.length} recorded vacancies`}
          icon={<Building2 size={20} />}
        />
        <StatCard
          label="Observed business emails"
          value={entries.filter(({ person }) => Boolean(person.observedBusinessEmail)).length}
          detail="Observed addresses, including verified"
          icon={<Mail size={20} />}
        />
      </div>
      <section aria-labelledby="stakeholder-directory-heading">
        <div className="research-section-head">
          <div>
            <h2 id="stakeholder-directory-heading">
              Stakeholder directory <span className="research-count">{entries.length}</span>
            </h2>
            <p className="muted">
              Hiring relevance and confidence, without losing vacancy context.
            </p>
          </div>
          <span className="research-readonly">
            <Fingerprint size={15} /> Research intelligence
          </span>
        </div>
        <div className="surface filter-bar research-filter-bar">
          <SearchField
            label="Search stakeholders"
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Search name, role, employer or email…"
          />
          <label className="research-select">
            <span className="sr-only">Stakeholder evidence</span>
            <select
              className="field"
              value={evidence}
              onChange={(event) => {
                setEvidence(event.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All evidence</option>
              {["CONFIRMED", "PROBABLE", "HYPOTHESIS", "UNKNOWN"].map((value) => (
                <option key={value} value={value}>
                  {humanise(value)}
                </option>
              ))}
            </select>
          </label>
          <label className="research-select">
            <span className="sr-only">Hiring relevance</span>
            <select
              className="field"
              value={relevance}
              onChange={(event) => {
                setRelevance(event.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All hiring relevance</option>
              {relevanceOptions.map((value) => (
                <option key={value} value={value}>
                  {humanise(value)}
                </option>
              ))}
            </select>
          </label>
          {activeFilters ? (
            <button className="btn btn-secondary" onClick={reset}>
              Reset
            </button>
          ) : null}
        </div>
        {initialStakeholderId && !selected && !initialMatches.length ? (
          <p className="research-notice">
            The requested stakeholder mapping is unavailable in this snapshot. Browse the directory
            below.
          </p>
        ) : null}
        {!filtered.length ? (
          <EmptyState
            title={
              entries.length
                ? "No matching stakeholders"
                : "Stakeholder intelligence is still taking shape"
            }
          >
            {entries.length ? (
              <>
                <p>Try another name, employer or evidence filter.</p>
                <button className="btn btn-secondary" onClick={reset}>
                  Reset filters
                </button>
              </>
            ) : (
              <p>
                No stakeholder mappings are recorded yet. Open a vacancy to inspect the current
                hiring-team research.
              </p>
            )}
          </EmptyState>
        ) : (
          <>
            <div className="stakeholder-grid">
              {filtered
                .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                .map((entry) => {
                  const { person, vacancy } = entry;
                  return (
                    <article className="surface stakeholder-card" key={entry.id}>
                      <div className="stakeholder-card-head">
                        <div className="research-avatar" aria-hidden="true">
                          {person.name
                            .split(/\s+/)
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <Badge value={person.evidenceStatus} />
                      </div>
                      <h3>
                        <button className="research-name-button" onClick={() => setSelected(entry)}>
                          {person.name}
                        </button>
                      </h3>
                      <p className="stakeholder-title">{person.title || "Title not recorded"}</p>
                      <p className="stakeholder-employer">
                        <Building2 size={14} /> {vacancy.employerName}
                      </p>
                      <div className="stakeholder-relevance">
                        <span>Hiring relevance</span>
                        <strong>
                          {person.relevance ? humanise(person.relevance) : "Not classified"}
                        </strong>
                        <p>
                          {person.reasonRelevant ||
                            "The basis for this hiring relationship has not been recorded."}
                        </p>
                      </div>
                      <div className="stakeholder-vacancy">
                        <span>Associated vacancy</span>
                        <Link prefetch={false} href={`/?vacancy=${encodeURIComponent(vacancy.id)}`}>
                          {vacancy.title}
                          <ArrowUpRight size={13} />
                        </Link>
                      </div>
                      <div className="stakeholder-confidence">
                        <span>Current employment</span>
                        <strong>
                          {person.currentEmploymentStatus
                            ? humanise(person.currentEmploymentStatus)
                            : "Not recorded"}
                        </strong>
                      </div>
                      <div className="stakeholder-card-footer">
                        <div>
                          <span>Last verified</span>
                          <RecordedTime value={person.lastVerified} />
                        </div>
                        <button
                          className="btn btn-secondary"
                          onClick={() => setSelected(entry)}
                          aria-label={`Open intelligence for ${person.name}`}
                        >
                          Intelligence <ArrowUpRight size={14} />
                        </button>
                      </div>
                    </article>
                  );
                })}
            </div>
            <Pagination
              page={currentPage}
              pageSize={PAGE_SIZE}
              total={filtered.length}
              onPage={setPage}
              noun="mappings"
            />
          </>
        )}
      </section>
      <div className="research-principle">
        <ShieldCheck size={19} />
        <div>
          <strong>Confidence stays visible.</strong>
          <p>
            Observed and verified business email addresses remain separate from pattern-inferred
            addresses. Each person is shown in the context of their vacancy mapping.
          </p>
        </div>
      </div>
      {selected ? <StakeholderDetail entry={selected} onClose={() => setSelected(null)} /> : null}
    </>
  );
}

function StakeholderDetail({ entry, onClose }: { entry: StakeholderEntry; onClose: () => void }) {
  const { person, vacancy } = entry;
  const profileUrl = safePublicUrl(person.profileUrl);
  const email = vacancy.companyEmailIntelligence;
  return (
    <Dialog title={person.name} onClose={onClose}>
      <div className="research-detail">
        <div className="research-detail-profile">
          <div className="research-avatar large" aria-hidden="true">
            {person.name
              .split(/\s+/)
              .map((part) => part[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div>
            <h3>{person.title || "Title not recorded"}</h3>
            <p>{vacancy.employerName}</p>
            <Badge value={person.evidenceStatus} />
          </div>
        </div>
        <div className="research-detail-grid">
          <section className="research-inset">
            <h3>Hiring relationship</h3>
            <strong>{person.relevance ? humanise(person.relevance) : "Not classified"}</strong>
            <p>{person.reasonRelevant || "The basis for this relationship is not recorded."}</p>
            <dl className="research-facts">
              <div>
                <dt>Current employment</dt>
                <dd>
                  {person.currentEmploymentStatus
                    ? humanise(person.currentEmploymentStatus)
                    : "Not recorded"}
                </dd>
              </div>
              <div>
                <dt>Last verified</dt>
                <dd>
                  <RecordedTime value={person.lastVerified} />
                </dd>
              </div>
            </dl>
          </section>
          <section className="research-inset">
            <h3>Vacancy association</h3>
            <Link
              prefetch={false}
              className="research-detail-link"
              href={`/?vacancy=${encodeURIComponent(vacancy.id)}`}
            >
              {vacancy.title}
              <ArrowUpRight size={16} />
            </Link>
            <p>
              {vacancy.employerName} · {vacancy.location}
            </p>
            <Badge value={vacancy.stakeholderMapStatus} />
            {vacancy.stakeholderMapNote ? <p>{vacancy.stakeholderMapNote}</p> : null}
          </section>
        </div>
        <section>
          <div className="research-section-head">
            <h3>Business email intelligence</h3>
            <Mail size={18} />
          </div>
          <div className="email-confidence-grid">
            <div className="research-inset">
              <span className="research-overline">Observed public business email</span>
              <strong className="research-email">
                {person.observedBusinessEmail || "Not recorded"}
              </strong>
              {person.observedBusinessEmail ? (
                <Badge value={person.emailStatus === "VERIFIED" ? "VERIFIED" : "OBSERVED"} />
              ) : null}
              <p>
                {person.emailStatus === "VERIFIED" && person.observedBusinessEmail
                  ? "The recorded address is marked verified."
                  : "Observed in a public source; observation does not establish deliverability."}
              </p>
            </div>
            <div className="research-inset inferred">
              <span className="research-overline">Pattern-inferred business email</span>
              <strong className="research-email">
                {person.probableBusinessEmail || "Not recorded"}
              </strong>
              {person.probableBusinessEmail ? <Badge value="PATTERN_INFERRED" /> : null}
              <p>{person.emailPatternBasis || "No individual email-pattern basis is recorded."}</p>
            </div>
          </div>
          <dl className="research-facts">
            <div>
              <dt>Recorded email status</dt>
              <dd>{person.emailStatus ? humanise(person.emailStatus) : "Unknown"}</dd>
            </div>
            <div>
              <dt>Confidence note</dt>
              <dd>{person.emailConfidenceNote || "Not recorded"}</dd>
            </div>
          </dl>
          {email ? (
            <div className="research-inset">
              <h4>Organisation pattern context</h4>
              <dl className="research-facts">
                <div>
                  <dt>Employee email domain</dt>
                  <dd>
                    {email.employeeEmailDomain || "Unknown"} <Badge value={email.domainStatus} />
                  </dd>
                </div>
                <div>
                  <dt>Detected pattern</dt>
                  <dd>
                    {email.detectedPattern || "Unknown"} <Badge value={email.patternStatus} />
                  </dd>
                </div>
                <div>
                  <dt>Observed examples</dt>
                  <dd>{email.observedPatternExamplesCount}</dd>
                </div>
              </dl>
              {email.patternBasis.length ? (
                <ul>
                  {email.patternBasis.map((basis, index) => (
                    <li key={index}>{basis}</li>
                  ))}
                </ul>
              ) : null}
              {email.notes ? <p>{email.notes}</p> : null}
            </div>
          ) : null}
        </section>
        <section>
          <h3>Source context</h3>
          {profileUrl ? (
            <a className="btn btn-secondary" href={profileUrl} target="_blank" rel="noreferrer">
              <Globe size={16} /> Public profile <ArrowUpRight size={15} />
            </a>
          ) : (
            <p className="muted">No public profile URL is recorded.</p>
          )}
          <p className="muted research-detail-note">
            Vacancy sources below provide context. Individual stakeholder claim citations are not
            available in this view.
          </p>
          <ul className="research-source-list">
            {vacancy.sources.length ? (
              vacancy.sources.map((source) => {
                const url = safePublicUrl(source.url);
                return (
                  <li key={source.id}>
                    <div>
                      <strong>{source.name}</strong>
                      <span>{humanise(source.type)}</span>
                    </div>
                    <Badge value={source.evidenceStatus} />
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open ${source.name} source`}
                      >
                        <ArrowUpRight size={17} />
                      </a>
                    ) : (
                      <span className="muted">No URL</span>
                    )}
                  </li>
                );
              })
            ) : (
              <li>No vacancy sources recorded.</li>
            )}
          </ul>
        </section>
        <div className="research-detail-actions">
          <span>
            <CircleCheck size={15} /> Read-only research record
          </span>
          <Link
            prefetch={false}
            className="btn btn-primary"
            href={`/?vacancy=${encodeURIComponent(vacancy.id)}`}
          >
            Open vacancy intelligence <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </Dialog>
  );
}
