import Link from "next/link";
import { AppHeader } from "@/components/shell/app-header";
import { getWorkspaceSnapshot } from "@/lib/data/repository";
export const dynamic="force-dynamic";
export default async function StakeholdersPage(){
 const snapshot=await getWorkspaceSnapshot();
 const rows=snapshot.vacancies.flatMap(v=>v.stakeholders.map(s=>({person:s,vacancy:v})));
 const people=new Set(rows.map(r=>r.person.key));
 return <main className="page-shell rec-pro-page"><AppHeader current="STAKEHOLDERS" demoMode={snapshot.demoMode} generatedAt={snapshot.generatedAt}/><div className="rec-pro-content">
 <div className="rec-pro-heading"><div><div className="eyebrow">Hiring intelligence / Decision-makers</div><h1>Hiring stakeholders</h1><p>Verified and inferred hiring contacts, with their evidence distinctions preserved.</p></div><Link className="rec-pro-action" href="/">Open intelligence workspace ↗</Link></div>
 <div className="rec-pro-kpis"><div className="rec-pro-kpi"><span>Unique stakeholders</span><strong>{people.size}</strong></div><div className="rec-pro-kpi"><span>Vacancy associations</span><strong>{rows.length}</strong></div><div className="rec-pro-kpi"><span>Confirmed evidence</span><strong>{rows.filter(r=>r.person.evidenceStatus==="CONFIRMED").length}</strong></div></div>
 <section className="rec-pro-panel"><div className="rec-pro-panel-heading"><div><span className="eyebrow">Hiring team mapping</span><h2>Stakeholder directory</h2></div></div><div className="rec-pro-table-scroll"><table className="rec-pro-table"><thead><tr><th>Person</th><th>Position</th><th>Employer / vacancy</th><th>Relationship</th><th>Evidence</th><th>Intelligence</th></tr></thead><tbody>{rows.map(({person:s,vacancy:v})=><tr key={v.id+":"+s.id}><td><strong>{s.name}</strong></td><td>{s.title||"Not recorded"}</td><td>{v.employerName}<br/><small>{v.title}</small></td><td>{s.relevance?.replaceAll("_"," ")||"Not classified"}</td><td><span className={`status-tag ${s.evidenceStatus==="CONFIRMED"?"ok":"warn"}`}>{s.evidenceStatus}</span></td><td><Link href={`/?vacancy=${encodeURIComponent(v.id)}`}>Inspect source ↗</Link></td></tr>)}</tbody></table>{!rows.length?<p className="rec-pro-empty">No stakeholder mappings have been published yet.</p>:null}</div></section>
 <p className="rec-pro-footnote">Observed and pattern-inferred business email addresses must never be presented as equivalent. Inspect the vacancy for source-level details.</p>
 </div></main>;
}