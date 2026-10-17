import { AppHeader } from "@/components/shell/app-header";
import { OrganisationDirectory } from "@/components/organisations/directory";
import { getWorkspaceSnapshot } from "@/lib/data/repository";
import "../intelligence.css";

export const dynamic = "force-dynamic";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [snapshot, params] = await Promise.all([getWorkspaceSnapshot(), searchParams]);
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  const query = first(params.q)?.slice(0, 200) ?? "";
  const company = first(params.company);
  return (
    <div className="page-shell">
      <AppHeader
        current="COMPANIES"
        demoMode={snapshot.demoMode}
        generatedAt={snapshot.generatedAt}
        snapshot={snapshot}
      />
      <main className="page-content" id="main-content" tabIndex={-1}>
        <OrganisationDirectory
          key={`${company ?? "directory"}:${query}`}
          vacancies={snapshot.vacancies}
          initialQuery={query}
          selectedKey={company}
        />
      </main>
    </div>
  );
}
