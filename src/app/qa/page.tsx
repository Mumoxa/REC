import { AppHeader } from "@/components/shell/app-header";
import { EvidenceWorkspace } from "@/components/research/evidence-workspace";
import { getWorkspaceSnapshot } from "@/lib/data/repository";
import "../research.css";

export const dynamic = "force-dynamic";

export default async function QaPage() {
  const snapshot = await getWorkspaceSnapshot();
  return (
    <div className="page-shell">
      <AppHeader
        current="QA"
        demoMode={snapshot.demoMode}
        generatedAt={snapshot.generatedAt}
        snapshot={snapshot}
      />
      <main className="page-content" id="main-content" tabIndex={-1}>
        <EvidenceWorkspace vacancies={snapshot.vacancies} />
      </main>
    </div>
  );
}
