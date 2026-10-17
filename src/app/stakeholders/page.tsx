import { AppHeader } from "@/components/shell/app-header";
import { StakeholderDirectory } from "@/components/research/stakeholder-directory";
import { getWorkspaceSnapshot } from "@/lib/data/repository";
import "../research.css";

export const dynamic = "force-dynamic";

export default async function StakeholdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [snapshot, params] = await Promise.all([getWorkspaceSnapshot(), searchParams]);
  return (
    <div className="page-shell">
      <AppHeader
        current="STAKEHOLDERS"
        demoMode={snapshot.demoMode}
        generatedAt={snapshot.generatedAt}
        snapshot={snapshot}
      />
      <main className="page-content" id="main-content" tabIndex={-1}>
        <StakeholderDirectory
          key={JSON.stringify([params.stakeholder, params.vacancy])}
          vacancies={snapshot.vacancies}
          initialStakeholderId={
            typeof params.stakeholder === "string" ? params.stakeholder : undefined
          }
          initialVacancyId={typeof params.vacancy === "string" ? params.vacancy : undefined}
        />
      </main>
    </div>
  );
}
