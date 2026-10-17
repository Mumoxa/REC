import { AppHeader } from "@/components/shell/app-header";
import { IntelligenceDashboard } from "@/components/intelligence/dashboard";
import { getWorkspaceSnapshot } from "@/lib/data/repository";
import "../intelligence.css";

export const dynamic = "force-dynamic";

export default async function IntelligencePage() {
  const snapshot = await getWorkspaceSnapshot();
  return (
    <div className="page-shell">
      <AppHeader
        current="INTELLIGENCE"
        demoMode={snapshot.demoMode}
        generatedAt={snapshot.generatedAt}
        snapshot={snapshot}
      />
      <main className="page-content" id="main-content" tabIndex={-1}>
        <IntelligenceDashboard snapshot={snapshot} />
      </main>
    </div>
  );
}
