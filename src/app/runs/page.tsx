import Link from "next/link";
import { getWorkspaceSnapshot } from "@/lib/data/repository";

export const dynamic = "force-dynamic";

export default async function RunsPage() {
  const snapshot = await getWorkspaceSnapshot();
  return (
    <main className="secondary-shell">
      <SecondaryHeader title="Runs" subtitle="Execution history and publishing status" />
      <section className="secondary-content">
        <div className="secondary-table">
          <div className="secondary-row header">
            <span>Run</span><span>Channel</span><span>Status</span><span>Started</span><span>Results</span>
          </div>
          {snapshot.runs.map((run) => (
            <div className="secondary-row" key={run.id}>
              <strong>{run.externalRunId}</strong>
              <span>{run.channel.replaceAll("_", " ")}</span>
              <span className={`run-status ${run.status.toLowerCase()}`}>{run.status}</span>
              <span>{new Date(run.startedAt).toLocaleString()}</span>
              <span>{Object.entries(run.metrics).map(([k,v]) => `${k}: ${v}`).join(" · ") || "—"}</span>
            </div>
          ))}
        </div>
        {!snapshot.runs.length && <div className="empty-state">No runs have been published yet.</div>}
      </section>
    </main>
  );
}

function SecondaryHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="secondary-header">
      <div>
        <div className="eyebrow">Talent Tree Intelligence</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <nav><Link href="/">Vacancies</Link><Link href="/companies">Companies</Link><Link href="/qa">QA</Link></nav>
    </header>
  );
}
