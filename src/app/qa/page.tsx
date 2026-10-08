import Link from "next/link";
import { getWorkspaceSnapshot } from "@/lib/data/repository";

export const dynamic = "force-dynamic";

export default async function QaPage() {
  const snapshot = await getWorkspaceSnapshot();
  const qaRank = (status: string) =>
    status === "FAIL_RESEARCH_REQUIRED" ? 0 : status === "PASS_WITH_UNKNOWNS" ? 1 : 2;
  const rows = snapshot.vacancies
    .filter((v) => v.qaStatus !== "PASS" || v.employerStatus !== "CONFIRMED")
    .sort(
      (a, b) =>
        qaRank(a.qaStatus) - qaRank(b.qaStatus) || a.title.localeCompare(b.title)
    );

  return (
    <main className="secondary-shell">
      <header className="secondary-header">
        <div><div className="eyebrow">Talent Tree Intelligence</div><h1>QA & Research Queue</h1><p>Unresolved claims, failed gates and evidence gaps</p></div>
        <nav><Link href="/">Vacancies</Link><Link href="/companies">Companies</Link><Link href="/runs">Runs</Link></nav>
      </header>
      <section className="secondary-content">
        <div className="secondary-table qa-table">
          <div className="secondary-row header"><span>Vacancy</span><span>Employer</span><span>QA</span><span>Employer evidence</span><span>Next focus</span></div>
          {rows.map((vacancy) => (
            <div className="secondary-row" key={vacancy.id}>
              <strong>{vacancy.title}</strong>
              <span>{vacancy.employerName}</span>
              <span className={`run-status ${vacancy.qaStatus === "FAIL_RESEARCH_REQUIRED" ? "failed" : "partial"}`}>{vacancy.qaStatus.replaceAll("_"," ")}</span>
              <span>{vacancy.employerStatus}</span>
              <span>{vacancy.qaStatus === "FAIL_RESEARCH_REQUIRED" ? "Resolve blocking evidence" : "Verify remaining unknowns"}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
