import Link from "next/link";
import { AppHeader } from "@/components/shell/app-header";
import { getWorkspaceSnapshot } from "@/lib/data/repository";
import type { EvidenceStatus, QaStatus, Vacancy } from "@/lib/data/types";

export const dynamic = "force-dynamic";

const QA_META: Record<QaStatus, { label: string; tone: "ok" | "warn" | "fail"; next: string; rank: number }> = {
  FAIL_RESEARCH_REQUIRED: { label: "Research required", tone: "fail", next: "Resolve blocking evidence", rank: 0 },
  PASS_WITH_UNKNOWNS: { label: "Pass with unknowns", tone: "warn", next: "Verify remaining unknowns", rank: 1 },
  PASS: { label: "Pass", tone: "ok", next: "No action needed", rank: 2 },
};

const EVIDENCE_META: Record<EvidenceStatus, { label: string; tone: "ok" | "info" | "warn" | "quiet" }> = {
  CONFIRMED: { label: "Confirmed", tone: "ok" },
  PROBABLE: { label: "Probable", tone: "info" },
  HYPOTHESIS: { label: "Hypothesis", tone: "warn" },
  UNKNOWN: { label: "Unknown", tone: "quiet" },
};

export default async function QaPage() {
  const snapshot = await getWorkspaceSnapshot();

  const rows: Vacancy[] = snapshot.vacancies
    .filter((vacancy) => vacancy.qaStatus !== "PASS" || vacancy.employerStatus !== "CONFIRMED")
    .sort(
      (a, b) =>
        QA_META[a.qaStatus].rank - QA_META[b.qaStatus].rank || a.title.localeCompare(b.title)
    );

  const blocking = rows.filter((vacancy) => vacancy.qaStatus === "FAIL_RESEARCH_REQUIRED").length;

  return (
    <main className="page-shell">
      <AppHeader current="QA" demoMode={snapshot.demoMode} generatedAt={snapshot.generatedAt} />

      <div className="page-intro">
        <div>
          <div className="eyebrow">Talent Tree Intelligence</div>
          <h1>QA &amp; research queue</h1>
          <p>Unresolved claims, failed gates and evidence gaps. Open a vacancy to resolve it in the workspace.</p>
        </div>
        <div className="page-summary" aria-label="QA totals">
          <span>
            <strong>{rows.length}</strong> to review
          </span>
          <span>
            <strong>{blocking}</strong> blocking
          </span>
        </div>
      </div>

      <section className="page-body" aria-labelledby="qa-heading">
        <h2 id="qa-heading" className="sr-only">
          Vacancies needing review
        </h2>

        <ul className="evidence-legend" aria-label="How to read these statuses">
          <li>
            <strong>Research required:</strong> a blocking gate failed.
          </li>
          <li>
            <strong>Pass with unknowns:</strong> the gate passed, but some facts remain unverified.
          </li>
          <li>
            <strong>Employer evidence:</strong> how strongly the employer identity is supported.
          </li>
        </ul>

        {rows.length === 0 ? (
          <div className="empty-panel">Nothing needs review. Every vacancy passed QA with confirmed employer evidence.</div>
        ) : (
          <div className="data-list-scroll">
            <div className="data-list" role="table" aria-label="Vacancies needing QA review">
              <div className="data-list-head qa-grid" role="row">
                <span role="columnheader">Vacancy</span>
                <span role="columnheader">Employer</span>
                <span role="columnheader">QA status</span>
                <span role="columnheader">Employer evidence</span>
                <span role="columnheader">Next focus</span>
                <span role="columnheader">
                  <span className="sr-only">Action</span>
                </span>
              </div>
              {rows.map((vacancy) => {
                const qa = QA_META[vacancy.qaStatus];
                const evidence = EVIDENCE_META[vacancy.employerStatus];
                const closed = vacancy.lifecycleStatus === "CLOSED";
                return (
                  <div className="data-list-row qa-grid" role="row" key={vacancy.id}>
                    <span role="cell">
                      <strong>{vacancy.title}</strong>
                      {closed ? <span className="sub">Closed vacancy</span> : null}
                    </span>
                    <span role="cell">{vacancy.employerName}</span>
                    <span role="cell">
                      <span className={`status-tag ${qa.tone}`}>{qa.label}</span>
                    </span>
                    <span role="cell">
                      <span className={`status-tag ${evidence.tone}`}>{evidence.label}</span>
                    </span>
                    <span role="cell">
                      {vacancy.qaStatus === "PASS" && vacancy.employerStatus !== "CONFIRMED"
                        ? "Confirm employer evidence"
                        : qa.next}
                    </span>
                    <span role="cell">
                      <Link href={`/?vacancy=${encodeURIComponent(vacancy.id)}`} aria-label={`Open ${vacancy.title} in the workspace`}>
                        Open
                      </Link>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
