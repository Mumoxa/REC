import { AppHeader, formatSast } from "@/components/shell/app-header";
import { getWorkspaceSnapshot } from "@/lib/data/repository";
import type { RunSummary } from "@/lib/data/types";

export const dynamic = "force-dynamic";

const CHANNEL_LABEL: Record<RunSummary["channel"], string> = {
  AGREED_CLIENTS: "Agreed clients",
  AGENCY_SITES: "Agency sites",
  LINKEDIN: "LinkedIn",
  JOB_BOARDS: "Job boards",
};

const STATUS_META: Record<RunSummary["status"], { label: string; tone: "ok" | "warn" | "fail" | "info"; note: string }> = {
  QUEUED: { label: "Queued", tone: "info", note: "Waiting for the pipeline. No results yet." },
  RUNNING: { label: "Running", tone: "info", note: "In progress. Results appear when the run completes." },
  COMPLETE: { label: "Complete", tone: "ok", note: "Results published to the workspace." },
  PARTIAL: { label: "Partial", tone: "warn", note: "Only part of this run published. Check QA before relying on its results." },
  FAILED: { label: "Failed", tone: "fail", note: "This run did not publish results." },
};

const timeZoneNote = "Times shown in SAST (UTC+2, Africa/Johannesburg).";

export default async function RunsPage() {
  const snapshot = await getWorkspaceSnapshot();
  const runs = [...snapshot.runs].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  const counts = {
    total: runs.length,
    complete: runs.filter((run) => run.status === "COMPLETE").length,
    active: runs.filter((run) => run.status === "QUEUED" || run.status === "RUNNING").length,
    attention: runs.filter((run) => run.status === "PARTIAL" || run.status === "FAILED").length,
  };

  return (
    <main className="page-shell">
      <AppHeader current="RUNS" demoMode={snapshot.demoMode} generatedAt={snapshot.generatedAt} />

      <div className="page-intro">
        <div>
          <div className="eyebrow">Talent Tree Intelligence</div>
          <h1>Research runs</h1>
          <p>
            Pipeline runs that publish vacancies and candidate evidence to the workspace. {timeZoneNote}
          </p>
        </div>
        <div className="page-summary" aria-label="Run totals">
          <span>
            <strong>{counts.total}</strong> runs
          </span>
          <span>
            <strong>{counts.complete}</strong> complete
          </span>
          <span>
            <strong>{counts.active}</strong> in progress
          </span>
          <span>
            <strong>{counts.attention}</strong> need attention
          </span>
        </div>
      </div>

      <section className="page-body" aria-labelledby="runs-heading">
        <h2 id="runs-heading" className="sr-only">
          Run history
        </h2>
        <p className="page-note">
          Runs are published by the ingestion pipeline. This screen is read-only: it cannot start, retry or edit a run.
        </p>

        {runs.length === 0 ? (
          <div className="empty-panel">No runs have been published yet.</div>
        ) : (
          <div className="data-list-scroll">
            <div className="data-list" role="table" aria-label="Research runs">
              <div className="data-list-head run-grid" role="row">
                <span role="columnheader">Run</span>
                <span role="columnheader">Channel</span>
                <span role="columnheader">Status</span>
                <span role="columnheader">Started</span>
                <span role="columnheader">Duration</span>
                <span role="columnheader">Results published</span>
              </div>
              {runs.map((run) => (
                <RunRow key={run.id} run={run} />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function RunRow({ run }: { run: RunSummary }) {
  const meta = STATUS_META[run.status] ?? { label: run.status, tone: "info" as const, note: "Unrecognised status." };
  const metrics = Object.entries(run.metrics);

  return (
    <div className="data-list-row run-grid" role="row">
      <span role="cell">
        <strong>{run.externalRunId}</strong>
        <span className="sub">{meta.note}</span>
      </span>
      <span role="cell">{CHANNEL_LABEL[run.channel] ?? run.channel.replaceAll("_", " ")}</span>
      <span role="cell">
        <span className={`status-tag ${meta.tone}`}>{meta.label}</span>
      </span>
      <span role="cell" className="num">
        {formatSast(run.startedAt)}
      </span>
      <span role="cell" className="num">
        {formatDuration(run.startedAt, run.completedAt, run.status)}
      </span>
      <span role="cell">
        {metrics.length ? (
          <dl className="run-metrics">
            {metrics.map(([key, value]) => (
              <div key={key}>
                <dt>
                  <span>{humanise(key)}</span>
                </dt>
                <dd>
                  <b>{value.toLocaleString("en-ZA")}</b>
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <span className="employer-none">No result counts published</span>
        )}
      </span>
    </div>
  );
}

function humanise(key: string) {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replaceAll("_", " ").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function formatDuration(startedAt: string, completedAt: string | null | undefined, status: RunSummary["status"]) {
  if (status !== "COMPLETE" && status !== "PARTIAL" && status !== "FAILED") return "—";
  if (!completedAt) return "Not recorded";
  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return "Not recorded";
  const minutes = Math.round((end - start) / 60000);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? `${hours}h ${String(rest).padStart(2, "0")}m` : `${rest}m`;
}
