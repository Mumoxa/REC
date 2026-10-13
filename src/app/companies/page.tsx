import Link from "next/link";
import { AppHeader } from "@/components/shell/app-header";
import { getWorkspaceSnapshot } from "@/lib/data/repository";

export const dynamic = "force-dynamic";

type CompanyRow = {
  name: string;
  openRoles: number;
  newRoles: number;
  closedRoles: number;
  clientStatus: string;
  locations: string[];
};

const CLIENT_STATUS_LABEL: Record<string, string> = {
  AGREED_CLIENT: "Agreed client",
  AGREED_GROUP_ENTITY: "Agreed group entity",
  PAST_CLIENT: "Past client",
  TARGET_PROSPECT: "Target prospect",
  UNKNOWN: "Status unknown",
};

export default async function CompaniesPage() {
  const snapshot = await getWorkspaceSnapshot();

  const byName = new Map<string, CompanyRow & { locationSet: Set<string> }>();
  for (const vacancy of snapshot.vacancies) {
    const existing = byName.get(vacancy.employerName) ?? {
      name: vacancy.employerName,
      openRoles: 0,
      newRoles: 0,
      closedRoles: 0,
      clientStatus: vacancy.clientStatus,
      locations: [],
      locationSet: new Set<string>(),
    };
    const closed = vacancy.lifecycleStatus === "CLOSED";
    if (closed) {
      existing.closedRoles += 1;
    } else {
      existing.openRoles += 1;
      if (vacancy.unread) existing.newRoles += 1;
    }
    existing.locationSet.add(vacancy.location);
    if (vacancy.clientStatus === "AGREED_CLIENT") existing.clientStatus = vacancy.clientStatus;
    byName.set(vacancy.employerName, existing);
  }

  const companies: CompanyRow[] = Array.from(byName.values())
    .map(({ locationSet, ...rest }) => ({ ...rest, locations: Array.from(locationSet).sort() }))
    .sort((a, b) => b.openRoles - a.openRoles || a.name.localeCompare(b.name));

  const totalOpen = companies.reduce((sum, company) => sum + company.openRoles, 0);

  return (
    <main className="page-shell">
      <AppHeader current="COMPANIES" demoMode={snapshot.demoMode} generatedAt={snapshot.generatedAt} />

      <div className="page-intro">
        <div>
          <div className="eyebrow">Talent Tree Intelligence</div>
          <h1>Companies</h1>
          <p>Hiring activity by employer, from the canonical vacancy store. Open a company to see its roles in the workspace.</p>
        </div>
        <div className="page-summary" aria-label="Company totals">
          <span>
            <strong>{companies.length}</strong> employers
          </span>
          <span>
            <strong>{totalOpen}</strong> open roles
          </span>
        </div>
      </div>

      <section className="page-body" aria-labelledby="companies-heading">
        <h2 id="companies-heading" className="sr-only">
          Employers
        </h2>

        {companies.length === 0 ? (
          <div className="empty-panel">No employers have been recorded yet.</div>
        ) : (
          <div className="employer-grid">
            {companies.map((company) => (
              <article className="employer-card" key={company.name} aria-labelledby={`company-${slug(company.name)}`}>
                <div className="employer-card-head">
                  <h3 id={`company-${slug(company.name)}`}>{company.name}</h3>
                  <span className={`status-tag ${company.clientStatus === "AGREED_CLIENT" ? "ok" : "quiet"}`}>
                    {CLIENT_STATUS_LABEL[company.clientStatus] ?? company.clientStatus.replaceAll("_", " ")}
                  </span>
                </div>

                <dl className="employer-card-stats">
                  <div>
                    <dd>{company.openRoles}</dd>
                    <dt>Open roles</dt>
                  </div>
                  <div>
                    <dd>{company.newRoles}</dd>
                    <dt>New</dt>
                  </div>
                  <div>
                    <dd>{company.closedRoles}</dd>
                    <dt>Closed</dt>
                  </div>
                </dl>

                <div className="employer-meta">
                  <span>
                    <strong>Locations:</strong> {company.locations.length ? company.locations.join(" · ") : "Not recorded"}
                  </span>
                </div>

                <div className="employer-card-foot">
                  {company.openRoles > 0 ? (
                    <Link href={`/?q=${encodeURIComponent(company.name)}`}>View open roles</Link>
                  ) : (
                    <span className="employer-none">No open roles to show</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "employer";
}
