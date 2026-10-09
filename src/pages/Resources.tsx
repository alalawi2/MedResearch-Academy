import Layout from '../components/Layout';
import { useState, useEffect } from 'react';

interface Article { title: string; authors: string; journal: string; year: string; link: string; }
const resources = [
  {title:'JournalReady', category:'Research & writing', status:'Web platform · Free and paid plans', description:'Research planning, literature search, statistical interpretation, manuscript preparation and publication workflows. AI-generated outputs require researcher review.', links:[['Open JournalReady','https://journalready.ai/']]},
  {title:'Bayan', category:'Exam preparation', status:'Web, iPhone and Android · Free and paid access', description:'Medical and nursing education for students, residents and practising clinicians. Question practice, flashcards, exam preparation and learning resources. Check the current plan and access terms on Bayan.', links:[['Open Bayan','https://www.bayan.edu.om/'],['iPhone listing','https://apps.apple.com/app/id6792406710'],['Android listing','https://play.google.com/store/apps/details?id=com.bayanai.bayan']]},
  {title:'PreOp', category:'Clinical tools', status:'iPhone and Android · In-app purchases', description:'Perioperative reference tools for risk assessment, medication planning, airway assessment, postoperative care and handoffs. For healthcare professionals; follow local protocols and clinical judgment.', links:[['Product information','https://www.bayan.edu.om/preop'],['iPhone listing','https://apps.apple.com/app/id6789968249'],['Android listing','https://play.google.com/store/apps/details?id=com.bayanai.preop']]},
  {title:'Medad', category:'Research platforms', status:'Active development · Research project', description:'An Arabic clinical-documentation research project developing transcription and structured clinical notes. Visit the project site for its development status and contribution opportunities; this is not a public patient-data upload service.', links:[['Explore Medad','https://www.medad.om/']]},
  {title:'SmartBlock', category:'Research platforms', status:'Research pilot · Authorized access', description:'Medical-residency rotation planning and scheduling research. The platform requires an authorized account and identifies itself as a research pilot, not an official OMSB product.', links:[['Platform sign in','https://rota.medresearch-academy.om/'],['Study information','/active-research/smartblock']]},
  {title:'OHealth', category:'Open data', status:'Public data platform', description:'Oman health-data exploration, regional comparisons and healthcare-planning dashboards. Check dataset dates and methodology before interpreting results.', links:[['Open OHealth','https://ohealth.medresearch-academy.om/']]},
  {title:'OLearn', category:'Open data', status:'Public data platform', description:'Oman education-data exploration covering schools, enrollment, graduates and workforce statistics. Refer to the source datasets and reporting periods.', links:[['Open OLearn','https://olearn-sandy.vercel.app/']]},
  {title:'Death certification course', category:'Clinical learning', status:'Bayan course', description:'Structured teaching on cause-of-death certification with reading material and clinical cases. Consult the course page for current access and completion requirements.', links:[['View course','https://www.bayan.edu.om/courses/death-certification']]},
  {title:'ABG & acid-base course', category:'Clinical learning', status:'Bayan course', description:'A structured approach to blood-gas interpretation and acid-base disorders, with worked clinical cases.', links:[['View course','https://www.bayan.edu.om/courses/abg-analysis']]},
  {title:'Clinical calculators', category:'Clinical tools', status:'Bayan web tools', description:'Clinical scoring and calculation references. Verify inputs, applicability and original references; results do not replace clinical judgment.', links:[['Browse calculators','https://www.bayan.edu.om/tools/calculator']]},
  {title:'Research lectures', category:'Research & writing', status:'Library', description:'Recorded teaching on research methods, analysis and scientific writing.', links:[['Browse lectures','/lectures']]},
  {title:'Virtual Research Series', category:'Research & writing', status:'Program information', description:'A structured 16-week research curriculum. Contact the academy for the next cohort details.', links:[['View curriculum','/programs']]},
];
const categories = ['All','Research & writing','Clinical tools','Clinical learning','Exam preparation','Research platforms','Open data'];

export default function Resources() {
  const [query,setQuery] = useState('');
  const [category,setCategory] = useState('All');
  const [articles,setArticles] = useState<Article[]>([]);
  const [loading,setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    let mounted = true;
    async function load() {
      try {
        const response = await fetch('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=Al+Alawi+AM[Author]&retmax=6&sort=date&retmode=json',{signal:controller.signal});
        if(!response.ok) throw new Error('Publications unavailable');
        const data = await response.json();
        const ids: string[] = data.esearchresult?.idlist || [];
        if(!ids.length) return;
        const summary = await fetch('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id='+ids.join(',')+'&retmode=json',{signal:controller.signal});
        if(!summary.ok) throw new Error('Publications unavailable');
        const values = await summary.json();
        if(mounted) setArticles(ids.filter(id=>values.result?.[id]?.title).map(id=>{
          const item=values.result[id];
          return {title:item.title,authors:(item.authors||[]).slice(0,3).map((a:{name:string})=>a.name).join(', '),journal:item.source,year:item.pubdate?.split(' ')[0]||'',link:'https://pubmed.ncbi.nlm.nih.gov/'+id+'/'};
        }));
      } catch { /* Keep the direct PubMed link available when the service fails. */ }
      finally { clearTimeout(timeout); if(mounted) setLoading(false); }
    }
    void load();
    return ()=>{mounted=false;clearTimeout(timeout);controller.abort();};
  },[]);
  const filtered=resources.filter(r=>(category==='All'||r.category===category)&&(r.title+' '+r.description+' '+r.category).toLowerCase().includes(query.trim().toLowerCase()));
  return <Layout>
    <section className="page-hero centered"><div className="container"><h1>Products & resources</h1><p>Research, clinical learning and open-data tools—with clear access information.</p></div></section>
    <section className="section"><div className="container">
      <div className="public-notice">External resources open in a new tab and have their own privacy terms. Do not upload identifiable patient or participant information without the required authorization. Educational tools do not replace clinical judgment.</div>
      <div className="resource-filters">
        <label>Search resources<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Try statistics, writing or exam…" /></label>
        <label>Category<select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
      </div>
      <p role="status">{filtered.length} resource{filtered.length===1?'':'s'} found</p>
      <div className="public-grid">
        {filtered.map(r=><article className="public-card" key={r.title}>
          <span className="badge badge-primary">{r.category}</span><h2>{r.title}</h2><p><small>{r.status}</small></p><p>{r.description}</p>
          <div className="resource-links">{r.links.map(([label,url])=><a className="btn btn-outline" href={url} key={url} target={url.startsWith('https:')?'_blank':undefined} rel={url.startsWith('https:')?'noopener noreferrer':undefined}>{label}{url.startsWith('https:')?' ↗':' →'}</a>)}</div>
        </article>)}
      </div>
      {!filtered.length&&<div className="public-notice">No matching resources. <button className="btn btn-outline" onClick={()=>{setQuery('');setCategory('All');}}>Clear filters</button></div>}
      <p style={{marginTop:20,fontSize:14}}>Directory descriptions updated 9 October 2026. This is not a clinical-content validation date; check each resource for its own version and references.</p>
      <section style={{marginTop:48}} aria-labelledby="publications-heading">
        <h2 id="publications-heading">Publications on PubMed</h2>
        <p>Latest matches for the author search “Al Alawi AM”. Check author affiliations to confirm attribution.</p>
        {loading?<p role="status">Loading publications…</p>:articles.length?
          <div className="public-grid">{articles.map(a=><article className="public-card" key={a.link}><p>{a.year} · {a.journal}</p><h3>{a.title}</h3><p>{a.authors}</p><a href={a.link} target="_blank" rel="noopener noreferrer">Read publication on PubMed ↗</a></article>)}</div>:
          <p role="status">The publication feed is unavailable or returned no results. The direct PubMed search below remains available.</p>}
        <a className="btn btn-outline" href="https://pubmed.ncbi.nlm.nih.gov/?term=Al+Alawi+AM" target="_blank" rel="noopener noreferrer" style={{marginTop:20}}>Search publications on PubMed ↗</a>
      </section>
    </div></section>
  </Layout>;
}
