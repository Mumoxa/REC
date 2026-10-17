import { AppHeader } from "@/components/shell/app-header";
import { RunHistory } from "@/components/research/run-history";
import { getWorkspaceSnapshot } from "@/lib/data/repository";
import "../research.css";

export const dynamic = "force-dynamic";

export default async function RunsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [snapshot, params] = await Promise.all([getWorkspaceSnapshot(), searchParams]);
  return (
    <div className="page-shell">
      <AppHeader
        current="RUNS"
        demoMode={snapshot.demoMode}
        generatedAt={snapshot.generatedAt}
        snapshot={snapshot}
      />
      <main className="page-content" id="main-content" tabIndex={-1}>
        <RunHistory
          key={JSON.stringify([params.q, params.run])}
          runs={snapshot.runs}
          initialSearch={typeof params.q === "string" ? params.q.slice(0, 240) : undefined}
          initialRunId={typeof params.run === "string" ? params.run : undefined}
        />
      </main>
    </div>
  );
}
