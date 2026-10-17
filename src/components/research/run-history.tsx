"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCheck,
  CircleAlert,
  Clock3,
  Layers3,
  Radio,
  Workflow,
} from "lucide-react";
import type { RunSummary } from "@/lib/data/types";
import { Badge, Dialog, EmptyState, PageHeader, StatCard } from "@/components/ui/primitives";
import { CHANNEL_LABELS, formatRunDuration, humanise, runStatusNote } from "./research-model";
import { Pagination, RecordedTime, SearchField } from "./research-ui";

const PAGE_SIZE = 12;
const STATUSES: RunSummary["status"][] = ["QUEUED", "RUNNING", "COMPLETE", "PARTIAL", "FAILED"];

export function RunHistory({
  runs,
  initialSearch = "",
  initialRunId,
}: {
  runs: RunSummary[];
  initialSearch?: string;
  initialRunId?: string;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [channel, setChannel] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<RunSummary | null>(
    runs.find((run) => run.id === initialRunId) ?? null
  );
  const sorted = [...runs].sort(
    (a, b) => (new Date(b.startedAt).getTime() || 0) - (new Date(a.startedAt).getTime() || 0)
  );
  const filtered = sorted.filter(
    (run) =>
      (channel === "ALL" || run.channel === channel) &&
      (status === "ALL" || run.status === status) &&
      [run.externalRunId, CHANNEL_LABELS[run.channel], run.status]
        .join(" ")
        .toLowerCase()
        .includes(search.trim().toLowerCase())
  );
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const reset = () => {
    setSearch("");
    setChannel("ALL");
    setStatus("ALL");
    setPage(1);
  };
  const attention = runs.filter(
    (run) => run.status === "PARTIAL" || run.status === "FAILED"
  ).length;

  return (
    <>
      <PageHeader
        eyebrow="The engine behind the intelligence"
        title="Research runs"
        description="A clear record of research activity across four independent channels. Inspect pipeline status, recorded timestamps and reported metrics."
        actions={
          <Link prefetch={false} className="btn btn-secondary" href="/">
            Explore vacancies <ArrowUpRight size={16} />
          </Link>
        }
      />
      <div className="stat-grid research-stats">
        <StatCard
          label="Recorded runs"
          value={runs.length}
          detail="Across all research channels"
          icon={<Layers3 size={20} />}
        />
        <StatCard
          label="In progress"
          value={runs.filter((run) => run.status === "RUNNING" || run.status === "QUEUED").length}
          detail="Running or queued in the pipeline"
          icon={<Radio size={20} />}
        />
        <StatCard
          label="Recorded complete"
          value={runs.filter((run) => run.status === "COMPLETE").length}
          detail="Status reported by the pipeline"
          icon={<CheckCheck size={20} />}
        />
        <StatCard
          label="Need attention"
          value={attention}
          detail="Partial or failed runs"
          icon={<CircleAlert size={20} />}
        />
      </div>
      <section aria-labelledby="research-channels-heading">
        <div className="research-section-head">
          <div>
            <h2 id="research-channels-heading">Four channels. One research standard.</h2>
            <p className="muted">Choose a channel to focus the run history.</p>
          </div>
        </div>
        <div className="research-channel-grid">
          {Object.entries(CHANNEL_LABELS).map(([id, label], index) => {
            const count = runs.filter((run) => run.channel === id).length;
            return (
              <button
                key={id}
                className={`surface research-channel-card ${channel === id ? "selected" : ""}`}
                aria-pressed={channel === id}
                onClick={() => {
                  setChannel(channel === id ? "ALL" : id);
                  setPage(1);
                }}
              >
                <span className="research-channel-number">0{index + 1}</span>
                <span>
                  <strong>{label}</strong>
                  <span>
                    {count} {count === 1 ? "recorded run" : "recorded runs"}
                  </span>
                </span>
                <ArrowRight size={17} />
              </button>
            );
          })}
        </div>
      </section>
      <section className="surface research-run-surface" aria-labelledby="run-history-heading">
        <div className="research-section-head padded">
          <div>
            <h2 id="run-history-heading">
              Run history <span className="research-count">{runs.length}</span>
            </h2>
            <p className="muted">Times shown in SAST · Africa/Johannesburg (UTC+2)</p>
          </div>
          <span className="research-readonly">
            <Workflow size={15} /> Pipeline managed
          </span>
        </div>
        <div className="filter-bar research-filter-bar evidence-filters">
          <SearchField
            label="Search research runs"
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Search run ID, channel or status…"
          />
          <label className="research-select">
            <span className="sr-only">Run channel</span>
            <select
              className="field"
              value={channel}
              onChange={(event) => {
                setChannel(event.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All channels</option>
              {Object.entries(CHANNEL_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="research-select">
            <span className="sr-only">Run status</span>
            <select
              className="field"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All statuses</option>
              {STATUSES.map((value) => (
                <option key={value} value={value}>
                  {humanise(value)}
                </option>
              ))}
            </select>
          </label>
          {search || channel !== "ALL" || status !== "ALL" ? (
            <button className="btn btn-secondary" onClick={reset}>
              Reset
            </button>
          ) : null}
        </div>
        {!filtered.length ? (
          <EmptyState title={runs.length ? "No matching runs" : "No research runs recorded"}>
            <p>
              {runs.length
                ? "Try another run ID, channel or status."
                : "Run summaries will appear here when they are available in the canonical workspace."}
            </p>
            {runs.length ? (
              <button className="btn btn-secondary" onClick={reset}>
                Reset filters
              </button>
            ) : null}
          </EmptyState>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table research-run-table">
                <caption className="sr-only">Research run history</caption>
                <thead>
                  <tr>
                    <th scope="col">Research run</th>
                    <th scope="col">Channel</th>
                    <th scope="col">Status</th>
                    <th scope="col">Started / completed</th>
                    <th scope="col">Recorded metrics</th>
                    <th scope="col">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered
                    .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                    .map((run) => (
                      <tr key={run.id}>
                        <td>
                          <div className="research-run-id">
                            <span
                              className={`evidence-kind-icon ${run.status === "FAILED" ? "blocking" : run.status === "PARTIAL" ? "review" : "confirmed"}`}
                              aria-hidden="true"
                            >
                              <Workflow size={19} />
                            </span>
                            <div>
                              <button
                                className="research-name-button"
                                onClick={() => setSelected(run)}
                              >
                                {run.externalRunId}
                              </button>
                              <span className="research-duration">
                                <Clock3 size={12} />{" "}
                                {formatRunDuration(run.startedAt, run.completedAt)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>{CHANNEL_LABELS[run.channel]}</td>
                        <td>
                          <Badge value={run.status} />
                          {run.status === "FAILED" || run.status === "PARTIAL" ? (
                            <span className="research-blocking-note">
                              Inspect before relying on results
                            </span>
                          ) : null}
                        </td>
                        <td className="research-time">
                          <RecordedTime value={run.startedAt} />
                          <span className="research-completed-time">
                            Completed: <RecordedTime value={run.completedAt} />
                          </span>
                        </td>
                        <td>
                          <MetricList metrics={run.metrics} compact />
                        </td>
                        <td>
                          <button
                            className="btn btn-secondary research-inspect-button"
                            onClick={() => setSelected(run)}
                            aria-label={`Inspect run ${run.externalRunId}`}
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
              noun="runs"
            />
          </>
        )}
      </section>
      <div className="research-principle">
        <Workflow size={21} />
        <div>
          <strong>Research runs are controlled by the authorised pipeline.</strong>
          <p>
            This view is read-only. Run status and metric labels do not independently prove that
            records were saved. Publication receipts and detailed QA outcomes are not included in
            the run summary.
          </p>
        </div>
        <Link prefetch={false} href="/qa">
          Review research QA <ArrowUpRight size={15} />
        </Link>
      </div>
      {selected ? (
        <Dialog title={selected.externalRunId} onClose={() => setSelected(null)}>
          <div className="research-detail">
            <div className="research-detail-badges">
              <Badge value={selected.status} />
              <span className="research-overline">{CHANNEL_LABELS[selected.channel]}</span>
            </div>
            <p
              className={`research-run-status-note ${selected.status === "FAILED" || selected.status === "PARTIAL" ? "attention" : ""}`}
            >
              {runStatusNote(selected.status)}
            </p>
            <section className="research-inset">
              <h3>Recorded timeline</h3>
              <dl className="research-facts">
                <div>
                  <dt>Started</dt>
                  <dd>
                    <RecordedTime value={selected.startedAt} />
                  </dd>
                </div>
                <div>
                  <dt>Completed</dt>
                  <dd>
                    <RecordedTime value={selected.completedAt} />
                  </dd>
                </div>
                <div>
                  <dt>Duration</dt>
                  <dd>{formatRunDuration(selected.startedAt, selected.completedAt)}</dd>
                </div>
                <div>
                  <dt>Timezone</dt>
                  <dd>SAST · Africa/Johannesburg (UTC+2)</dd>
                </div>
              </dl>
            </section>
            <section>
              <h3>Pipeline-reported metrics</h3>
              <p className="muted">
                Metric names and values are preserved from the run summary. Discovery counts and
                candidate maps are not automatically published-record counts.
              </p>
              <MetricList metrics={selected.metrics} />
            </section>
            <section className="research-inset">
              <h3>QA & publication state</h3>
              <p>
                Detailed QA-gate outcomes and a persistence receipt are unavailable in this read
                model. Review the evidence queue for independently recorded vacancy and candidate
                QA.
              </p>
              <Link prefetch={false} className="research-detail-link" href="/qa">
                Open evidence & QA <ArrowUpRight size={15} />
              </Link>
            </section>
            <div className="research-detail-actions">
              <span>Read-only operational record</span>
              <Link prefetch={false} className="btn btn-primary" href="/">
                Browse vacancy intelligence <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </Dialog>
      ) : null}
    </>
  );
}

function MetricList({
  metrics,
  compact = false,
}: {
  metrics: Record<string, number>;
  compact?: boolean;
}) {
  const entries = Object.entries(metrics);
  if (!entries.length) return <span className="muted">No metrics recorded</span>;
  return (
    <dl className={`research-run-metrics ${compact ? "compact" : ""}`}>
      {(compact ? entries.slice(0, 3) : entries).map(([key, value]) => (
        <div key={key}>
          <dt>{humanise(key)}</dt>
          <dd>{Number.isFinite(value) ? value.toLocaleString("en-ZA") : "Unavailable"}</dd>
        </div>
      ))}
      {compact && entries.length > 3 ? (
        <div>
          <dt>Additional metrics</dt>
          <dd>+{entries.length - 3}</dd>
        </div>
      ) : null}
    </dl>
  );
}
