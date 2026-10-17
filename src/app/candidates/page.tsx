import { AppHeader } from "@/components/shell/app-header";
import { CandidateMarkets } from "@/components/candidates/candidate-markets";
import { getWorkspaceSnapshot } from "@/lib/data/repository";
import "@/app/candidates.css";

export const dynamic = "force-dynamic";

export default async function CandidateMarketsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; candidate?: string; vacancy?: string }>;
} = {}) {
  const [snapshot, params] = await Promise.all([
    getWorkspaceSnapshot(),
    searchParams ?? Promise.resolve(undefined),
  ]);
  return (
    <div className="page-shell">
      <AppHeader
        current="CANDIDATES"
        demoMode={snapshot.demoMode}
        generatedAt={snapshot.generatedAt}
        snapshot={snapshot}
      />
      <main className="page-content" id="main-content" tabIndex={-1}>
        <CandidateMarkets
          key={`${params?.q ?? ""}:${params?.candidate ?? ""}:${params?.vacancy ?? ""}`}
          snapshot={snapshot}
          initialSearch={params?.q}
          initialCandidateId={params?.candidate}
          initialVacancyId={params?.vacancy}
        />
      </main>
    </div>
  );
}
