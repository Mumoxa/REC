import Link from "next/link";
import { getWorkspaceSnapshot } from "@/lib/data/repository";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const snapshot = await getWorkspaceSnapshot();
  const companies = Array.from(
    snapshot.vacancies.reduce((map, vacancy) => {
      const current = map.get(vacancy.employerName) || {
        name: vacancy.employerName,
        roles: 0,
        newRoles: 0,
        clientStatus: vacancy.clientStatus,
        locations: new Set<string>(),
      };
      current.roles += vacancy.lifecycleStatus === "CLOSED" ? 0 : 1;
      current.newRoles += vacancy.unread ? 1 : 0;
      current.locations.add(vacancy.location);
      if (vacancy.clientStatus === "AGREED_CLIENT") current.clientStatus = vacancy.clientStatus;
      map.set(vacancy.employerName, current);
      return map;
    }, new Map<string, {name:string; roles:number; newRoles:number; clientStatus:string; locations:Set<string>}>()).values()
  ).sort((a,b) => b.roles - a.roles);

  return (
    <main className="secondary-shell">
      <header className="secondary-header">
        <div><div className="eyebrow">Talent Tree Intelligence</div><h1>Companies</h1><p>Hiring activity from the canonical vacancy store</p></div>
        <nav><Link href="/">Vacancies</Link><Link href="/runs">Runs</Link><Link href="/qa">QA</Link></nav>
      </header>
      <section className="secondary-content">
        <div className="company-grid">
          {companies.map((company) => (
            <article className="company-card" key={company.name}>
              <div className="company-card-top"><h2>{company.name}</h2><span>{company.clientStatus.replaceAll("_"," ")}</span></div>
              <div className="company-card-stats"><strong>{company.roles}</strong><span>live roles</span><strong>{company.newRoles}</strong><span>new</span></div>
              <div className="company-locations">{Array.from(company.locations).join(" · ")}</div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
