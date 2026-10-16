import Link from "next/link";
import { AppHeader } from "@/components/shell/app-header";
import { getWorkspaceSnapshot } from "@/lib/data/repository";
export const dynamic = "force-dynamic";
export default async function IntelligencePage() {
  const snapshot = await getWorkspaceSnapshot();
  const roles = snapshot.vacancies;
  const active = roles.filter(v => v.lifecycleStatus !== "CLOSED");
  const companies = new Set(roles.map(v => v.employerName).filter(Boolean));
  const candidates = new Set(roles.flatMap(v => v.candidates.map(c => c.candidateId)));
  const stakeholders = new Set(roles.flatMap(v => v.stakeholders.map(s => s.key)));
  const needsQA = active.filter(v => v.qaStatus === "FAIL_RESEARCH_REQUIRED");
  const recent = [...active].sort((a,b) => b.firstSeen.localeCompare(a.firstSeen)).slice(0,8);
  const funnel = [
    ["Discovered",active.length],
    ["Employer confirmed",active.filter(v=>v.employerStatus==="CONFIRMED").length],
    ["Market ready",active.filter(v=>v.candidateMapStatus==="READY").length],
    ["Client action",active.filter(v=>v.lifecycleStatus==="CLIENT_ACTION").length]
  ] as const;
  return <main className="page-shell rec-pro-page">
    <AppHeader current="INTELLIGENCE" demoMode={snapshot.demoMode} generatedAt={snapshot.generatedAt}/>
    <div className="rec-pro-content">
      <div className="rec-pro-heading"><div><div className="eyebrow">Recruitment intelligence / Overview</div><h1>Intelligence overview</h1><p>Your hiring market, research progress and outstanding actions in one place.</p></div><Link href="/" className="rec-pro-action">Open vacancy workspace ↗</Link></div>
      <div className="rec-pro-kpis">
        {[[companies.size,"Organisations","/companies"],[active.length,"Active vacancies","/"],[candidates.size,"Mapped candidates","/candidates"],[stakeholders.size,"Hiring stakeholders","/stakeholders"]] .map(([n,label,href])=><Link key={label} href={String(href)} className="rec-pro-kpi"><span>{label}</span><strong>{n}</strong><small>View records ↗</small></Link>)}
      </div>
      <div className="rec-pro-two">
        <section className="rec-pro-panel"><div className="rec-pro-panel-heading"><div><span className="eyebrow">Pipeline</span><h2>Vacancy intelligence funnel</h2></div><Link href="/">Investigate ↗</Link></div><p>Live totals from REC. Each stage is independent and is not a conversion prediction.</p><div className="rec-pro-funnel">{funnel.map(([name,count])=><div key={name} className="rec-pro-funnel-row"><div><strong>{name}</strong><span>{count}</span></div><div className="rec-pro-track"><div style={{width:`${active.length ? Math.round(count/active.length*100) : 0}%`}}/></div></div>)}</div></section>
        <section className="rec-pro-panel"><div className="rec-pro-panel-heading"><div><span className="eyebrow">Attention</span><h2>Research priorities</h2></div><Link href="/qa">Review QA ↗</Link></div><div className="rec-pro-callout"><strong>{needsQA.length}</strong><div><b>Vacancies require research</b><p>Blocking evidence or independent QA findings need action before a confident presentation.</p></div></div><div className="rec-pro-callout muted"><strong>{active.filter(v=>v.candidateMapStatus!=="READY").length}</strong><div><b>Candidate markets not ready</b><p>In-progress and not-started mappings remain separate from verified shortlist readiness.</p></div></div></section>
      </div>
      <section className="rec-pro-panel"><div className="rec-pro-panel-heading"><div><span className="eyebrow">Latest intelligence</span><h2>Recently surfaced vacancies</h2></div><Link href="/">All vacancies ↗</Link></div><div className="rec-pro-table-scroll"><table className="rec-pro-table"><thead><tr><th>Vacancy</th><th>Organisation</th><th>Location</th><th>QA</th><th>Candidate market</th><th/></tr></thead><tbody>{recent.map(v=><tr key={v.id}><td><strong>{v.title}</strong></td><td>{v.employerName}</td><td>{v.location}</td><td>{v.qaStatus.replaceAll("_"," ")}</td><td>{v.candidates.length} mapped</td><td><Link href={`/?vacancy=${encodeURIComponent(v.id)}`}>Open ↗</Link></td></tr>)}</tbody></table>{recent.length===0?<p className="rec-pro-empty">No active vacancies yet.</p>:null}</div></section>
    </div>
  </main>;
}