import Link from "next/link";
import { AppHeader } from "@/components/shell/app-header";
import { getWorkspaceSnapshot } from "@/lib/data/repository";
export const dynamic = "force-dynamic";
export default async function CandidateMarketsPage() {
 const snapshot=await getWorkspaceSnapshot();
 const people=new Map<string,{name:string;title:string;employer:string;location:string;roles:{id:string;title:string;bucket:string;qa:string}[]}>();
 for(const v of snapshot.vacancies)for(const c of v.candidates){
  const person=people.get(c.candidateId)??{name:c.name,title:c.currentTitle,employer:c.currentEmployer,location:c.location,roles:[]};
  person.roles.push({id:v.id,title:v.title,bucket:c.marketBucket,qa:c.qaStatus});
  people.set(c.candidateId,person);
 }
 const rows=[...people.entries()].sort((a,b)=>b[1].roles.length-a[1].roles.length||a[1].name.localeCompare(b[1].name));
 return <main className="page-shell rec-pro-page"><AppHeader current="CANDIDATES" demoMode={snapshot.demoMode} generatedAt={snapshot.generatedAt}/><div className="rec-pro-content">
  <div className="rec-pro-heading"><div><div className="eyebrow">Talent intelligence / Candidate markets</div><h1>Candidate markets</h1><p>People researched across REC vacancies. Candidate status and evidence remain vacancy-specific.</p></div><Link className="rec-pro-action" href="/">Explore vacancies ↗</Link></div>
  <div className="rec-pro-kpis"><div className="rec-pro-kpi"><span>Unique candidates</span><strong>{rows.length}</strong></div><div className="rec-pro-kpi"><span>Role assignments</span><strong>{rows.reduce((n,[,r])=>n+r.roles.length,0)}</strong></div><div className="rec-pro-kpi"><span>Mapped vacancies</span><strong>{snapshot.vacancies.filter(v=>v.candidates.length>0).length}</strong></div></div>
  <section className="rec-pro-panel"><div className="rec-pro-panel-heading"><div><span className="eyebrow">Evidence-backed talent pool</span><h2>Researched candidates</h2></div></div><div className="rec-pro-table-scroll"><table className="rec-pro-table"><thead><tr><th>Candidate</th><th>Current role</th><th>Employer</th><th>Location</th><th>Vacancy links</th><th>Open market</th></tr></thead><tbody>{rows.map(([id,p])=><tr key={id}><td><strong>{p.name}</strong></td><td>{p.title||"Not recorded"}</td><td>{p.employer||"Not recorded"}</td><td>{p.location||"Not recorded"}</td><td>{p.roles.length}</td><td><Link href={`/?vacancy=${encodeURIComponent(p.roles[0].id)}`}>View evidence ↗</Link></td></tr>)}</tbody></table>{!rows.length?<p className="rec-pro-empty">No candidate research has been published yet.</p>:null}</div></section>
 </div></main>;
}