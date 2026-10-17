"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CircleAlert,
  FileCheck2,
  Link2,
  ListChecks,
  ShieldCheck,
} from "lucide-react";
import type { Vacancy } from "@/lib/data/types";
import { Badge, Dialog, EmptyState, PageHeader, StatCard } from "@/components/ui/primitives";
import {
  buildEvidenceRecords,
  EVIDENCE_KIND_LABELS,
  type EvidenceKind,
  type EvidenceRecord,
  humanise,
} from "./research-model";
import { Pagination, RecordedTime, SearchField } from "./research-ui";

type View = "QUEUE" | "REGISTER" | "SOURCES";
const PAGE_SIZE = 12;

export function EvidenceWorkspace({ vacancies }: { vacancies: Vacancy[] }) {
  const records = useMemo(() => buildEvidenceRecords(vacancies), [vacancies]);
  const [view, setView] = useState<View>("QUEUE");
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<EvidenceRecord | null>(null);
  const review = records.filter((record) => record.needsReview);
  const blocking = records.filter((record) => record.blocking);
  const sources = records.filter((record) => record.kind === "SOURCE");
  const base = view === "QUEUE" ? review : view === "SOURCES" ? sources : records;
  const filtered = base
    .filter(
      (record) =>
        (kind === "ALL" || record.kind === kind) &&
        (status === "ALL" || record.status === status) &&
        [
          record.title,
          record.description,
          record.vacancyTitle,
          record.employerName,
          record.candidateName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search.trim().toLowerCase())
    )
    .sort(
      (a, b) =>
        Number(b.blocking) - Number(a.blocking) ||
        Number(b.needsReview) - Number(a.needsReview) ||
        a.title.localeCompare(b.title)
    );
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const reset = () => {
    setSearch("");
    setKind("ALL");
    setStatus("ALL");
    setPage(1);
  };
  const changeView = (next: View) => {
    setView(next);
    reset();
  };
  const statuses = [...new Set(base.map((record) => record.status))].sort();
  const kinds = [...new Set(base.map((record) => record.kind))].sort();

  return (
    <>
      <PageHeader
        eyebrow="Independent research assurance"
        title="Evidence & QA"
        description="The confidence behind every opportunity. Review failed gates, unconfirmed claims and evidence gaps in their original research context."
        actions={
          <Link className="btn btn-secondary" href="/">
            Open workspace <ArrowUpRight size={16} />
          </Link>
        }
      />
      <div className="stat-grid research-stats">
        <StatCard
          label="Items needing review"
          value={review.length}
          detail="Gates, claims, gaps and sources"
          icon={<ListChecks size={20} />}
        />
        <StatCard
          label="Blocking QA gates"
          value={blocking.length}
          detail="Vacancy and candidate gate failures"
          icon={<CircleAlert size={20} />}
        />
        <StatCard
          label="Confirmed sources"
          value={sources.filter((record) => record.status === "CONFIRMED").length}
          detail={`Of ${sources.length} recorded vacancy sources`}
          icon={<FileCheck2 size={20} />}
        />
        <StatCard
          label="Candidate evidence gaps"
          value={records.filter((record) => record.kind === "GAP" && record.candidateId).length}
          detail="Explicit gaps in candidate assignments"
          icon={<ShieldCheck size={20} />}
        />
      </div>
      <div className="research-assurance">
        <div className="research-assurance-icon">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h2>Evidence before confidence.</h2>
          <p>
            A passed gate can still contain unknowns. Research evidence and recruiter workflow
            remain independent.
          </p>
        </div>
        <div className="research-confidence-legend">
          <Badge value="CONFIRMED" />
          <Badge value="PROBABLE" />
          <Badge value="HYPOTHESIS" />
          <Badge value="UNKNOWN" />
        </div>
      </div>
      <section className="surface evidence-surface" aria-labelledby="evidence-register-heading">
        <div className="research-section-head padded">
          <div>
            <h2 id="evidence-register-heading">Research evidence</h2>
            <p className="muted">
              Follow each item back to the exact vacancy or candidate assignment.
            </p>
          </div>
          <span className="research-readonly">
            <Link2 size={15} /> Canonical records
          </span>
        </div>
        <div
          className="research-tabs"
          role="tablist"
          aria-label="Evidence views"
          onKeyDown={(event) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
            event.preventDefault();
            const tabs = Array.from(
              event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')
            );
            const current = tabs.indexOf(document.activeElement as HTMLButtonElement);
            const next =
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? tabs.length - 1
                  : (current + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
            tabs[next]?.focus();
            tabs[next]?.click();
          }}
        >
          {(
            [
              ["QUEUE", "Review queue", review.length],
              ["REGISTER", "Evidence register", records.length],
              ["SOURCES", "Source library", sources.length],
            ] as const
          ).map(([id, label, count]) => (
            <button
              key={id}
              id={`evidence-tab-${id}`}
              type="button"
              role="tab"
              tabIndex={view === id ? 0 : -1}
              aria-selected={view === id}
              aria-controls="evidence-panel"
              onClick={() => changeView(id)}
            >
              {label}
              <span>{count}</span>
            </button>
          ))}
        </div>
        <div className="filter-bar research-filter-bar evidence-filters">
          <SearchField
            label="Search evidence"
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Search a claim, candidate, vacancy or source…"
          />
          {view !== "SOURCES" ? (
            <label className="research-select">
              <span className="sr-only">Evidence record type</span>
              <select
                className="field"
                value={kind}
                onChange={(event) => {
                  setKind(event.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">All record types</option>
                {kinds.map((value) => (
                  <option key={value} value={value}>
                    {EVIDENCE_KIND_LABELS[value as EvidenceKind]}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="research-select">
            <span className="sr-only">Evidence status</span>
            <select
              className="field"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All statuses</option>
              {statuses.map((value) => (
                <option key={value} value={value}>
                  {humanise(value)}
                </option>
              ))}
            </select>
          </label>
          {search || kind !== "ALL" || status !== "ALL" ? (
            <button className="btn btn-secondary" onClick={reset}>
              Reset
            </button>
          ) : null}
        </div>
        <div role="tabpanel" id="evidence-panel" aria-labelledby={`evidence-tab-${view}`}>
          {!filtered.length ? (
            <EmptyState
              title={
                base.length
                  ? "No matching evidence"
                  : view === "QUEUE"
                    ? "No review items in this snapshot"
                    : "No evidence records yet"
              }
            >
              <p>
                {base.length
                  ? "Try another search or clear your filters."
                  : view === "QUEUE"
                    ? "No failed gates, unconfirmed claims or explicit evidence gaps are recorded in the current snapshot."
                    : "Published research records will appear here when available."}
              </p>
              {base.length ? (
                <button className="btn btn-secondary" onClick={reset}>
                  Reset filters
                </button>
              ) : null}
            </EmptyState>
          ) : (
            <>
              <div className="table-wrap">
                <table className="data-table evidence-table">
                  <caption className="sr-only">
                    {view === "QUEUE"
                      ? "Research QA review queue"
                      : view === "SOURCES"
                        ? "Vacancy source library"
                        : "Research evidence register"}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Research item</th>
                      <th scope="col">Context</th>
                      <th scope="col">Evidence / QA</th>
                      <th scope="col">Context verified</th>
                      <th scope="col">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered
                      .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                      .map((record) => (
                        <tr key={record.id}>
                          <td>
                            <div className="evidence-item">
                              <span
                                className={`evidence-kind-icon ${record.blocking ? "blocking" : record.needsReview ? "review" : "confirmed"}`}
                                aria-hidden="true"
                              >
                                {record.blocking ? (
                                  <CircleAlert size={18} />
                                ) : record.kind === "SOURCE" ? (
                                  <Link2 size={18} />
                                ) : (
                                  <FileCheck2 size={18} />
                                )}
                              </span>
                              <div>
                                <span className="research-overline">
                                  {EVIDENCE_KIND_LABELS[record.kind]}
                                </span>
                                <button
                                  className="research-name-button"
                                  onClick={() => setSelected(record)}
                                >
                                  {record.title}
                                </button>
                                <p>{record.description}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <strong>{record.candidateName || record.employerName}</strong>
                            <Link
                              className="research-table-link"
                              href={`/?vacancy=${encodeURIComponent(record.vacancyId)}`}
                            >
                              {record.vacancyTitle}
                              <ArrowUpRight size={12} />
                            </Link>
                          </td>
                          <td>
                            <Badge value={record.status} />
                            {record.blocking ? (
                              <span className="research-blocking-note">
                                Blocks research readiness
                              </span>
                            ) : null}
                          </td>
                          <td className="research-time">
                            <RecordedTime value={record.lastVerified} />
                          </td>
                          <td>
                            <button
                              className="btn btn-secondary research-inspect-button"
                              onClick={() => setSelected(record)}
                              aria-label={`Inspect ${record.title} ${EVIDENCE_KIND_LABELS[record.kind].toLowerCase()}`}
                            >
                              Inspect <ArrowRight size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={currentPage}
                pageSize={PAGE_SIZE}
                total={filtered.length}
                onPage={setPage}
                noun="evidence items"
              />
            </>
          )}
        </div>
      </section>
      <div className="research-footnotes">
        <p>
          Counts refer to evidence items, so one vacancy or candidate can appear more than once.
          Unconfirmed claims retain their recorded confidence. A separate challenge or
          review-history log is not available.
        </p>
        <p>
          Dates show the latest recorded verification of the associated vacancy or candidate. The
          source library contains vacancy provenance; individual candidate-claim citations are not
          available.
        </p>
      </div>
      {selected ? <EvidenceDetail record={selected} onClose={() => setSelected(null)} /> : null}
    </>
  );
}

function EvidenceDetail({ record, onClose }: { record: EvidenceRecord; onClose: () => void }) {
  return (
    <Dialog title={record.title} onClose={onClose}>
      <div className="research-detail">
        <div className="research-detail-badges">
          <span className="research-overline">{EVIDENCE_KIND_LABELS[record.kind]}</span>
          <Badge value={record.status} />
          {record.blocking ? (
            <span className="research-blocking-note">Blocking QA gate</span>
          ) : null}
        </div>
        <p className="research-detail-description">{record.description}</p>
        <div className="research-inset">
          <h3>Research context</h3>
          <dl className="research-facts">
            <div>
              <dt>Vacancy</dt>
              <dd>
                <Link href={`/?vacancy=${encodeURIComponent(record.vacancyId)}`}>
                  {record.vacancyTitle} <ArrowUpRight size={13} />
                </Link>
              </dd>
            </div>
            <div>
              <dt>Employer</dt>
              <dd>{record.employerName}</dd>
            </div>
            {record.candidateName ? (
              <div>
                <dt>Candidate</dt>
                <dd>
                  <Link href={record.entityHref}>
                    {record.candidateName} <ArrowUpRight size={13} />
                  </Link>
                </dd>
              </div>
            ) : null}
            <div>
              <dt>{record.candidateId ? "Candidate last verified" : "Vacancy last verified"}</dt>
              <dd>
                <RecordedTime value={record.lastVerified} />
              </dd>
            </div>
            {record.kind === "SOURCE" ? (
              <div>
                <dt>Source posted</dt>
                <dd>
                  <RecordedTime value={record.sourceDate} />
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
        {record.kind === "SOURCE" ? (
          <section>
            <h3>Source access</h3>
            {record.sourceUrl ? (
              <a
                className="btn btn-secondary"
                href={record.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open original source <ArrowUpRight size={15} />
              </a>
            ) : (
              <p className="muted">
                A source URL has not been recorded. Inspect the vacancy for the available source
                context.
              </p>
            )}
          </section>
        ) : null}
        <section className="research-detail-note">
          <h3>Verification history</h3>
          <p>
            The current canonical snapshot provides the latest recorded confidence and entity
            verification date. A timestamped review or challenge history is not available in this
            view.
          </p>
        </section>
        <div className="research-detail-actions">
          <span>
            {record.blocking
              ? "Further research required"
              : record.needsReview
                ? "Review the remaining uncertainty"
                : "Recorded evidence"}
          </span>
          <Link className="btn btn-primary" href={record.entityHref}>
            Open {record.candidateId ? "candidate intelligence" : "vacancy intelligence"}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </Dialog>
  );
}
