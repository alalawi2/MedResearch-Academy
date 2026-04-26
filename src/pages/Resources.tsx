import Layout from '../components/Layout';
import { useState, useEffect } from 'react';

interface Article { title: string; authors: string; journal: string; year: string; link: string; }

export default function Resources() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=Al+Alawi+AM[Author]&retmax=6&sort=date&retmode=json')
      .then(r => r.json())
      .then(async data => {
        const ids = data.esearchresult?.idlist || [];
        if (!ids.length) { setLoading(false); return; }
        const summary = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`);
        const sData = await summary.json();
        const result = ids.map((id: string) => {
          const item = sData.result[id];
          return {
            title: item.title,
            authors: item.authors?.slice(0,3).map((a: any) => a.name).join(', ') + (item.authors?.length > 3 ? ' et al.' : ''),
            journal: item.source,
            year: item.pubdate?.split(' ')[0] || '',
            link: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
          };
        });
        setArticles(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <section className="page-hero" style={{background:'var(--bg)',color:'var(--text)',borderBottom:'1px solid var(--border)'}}>
        <div className="container">
          <h1 style={{color:'var(--primary)'}}>Resources</h1>
          <p style={{color:'var(--text-muted)'}}>Explore our clinical tools, latest research publications, and educational resources.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{maxWidth:960}}>

          {/* Pre-op Guide — periop-consult */}
          <div className="resource-card">
            <img src="/images/preop-guide-banner.png" alt="Pre-Operative Guide" className="resource-img" onError={e => (e.currentTarget.style.display='none')} />
            <div className="resource-body">
              <span className="badge badge-accent" style={{marginBottom:16,display:'inline-block'}}>Featured Clinical Resource</span>
              <h2 style={{fontSize:'1.8rem',marginBottom:12}}>Comprehensive Pre-Operative Patient Preparation Guide</h2>
              <p style={{color:'var(--text-muted)',marginBottom:24,lineHeight:1.8}}>Access the most recent and comprehensive evidence-based resource designed to guide medical professionals through optimal patient preparation for surgical procedures. This interactive tool provides step-by-step protocols, safety checklists, and best practices.</p>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20,marginBottom:28,borderTop:'1px solid var(--border)',paddingTop:24}}>
                {[['Evidence-Based','Latest clinical guidelines and research'],['Interactive Checklists','Step-by-step preparation protocols'],['Risk Mitigation','Minimize perioperative complications']].map(([t,d]) => (
                  <div key={t}><div style={{fontWeight:600,marginBottom:4}}>{t}</div><div style={{fontSize:13,color:'var(--text-muted)'}}>{d}</div></div>
                ))}
              </div>
              <a href="https://www.bayan.edu.om/periop-consult" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg">Access Interactive Guide →</a>
            </div>
          </div>


          {/* Bayan */}
          <div className="bayan-card" style={{marginBottom:32}}>
            <div className="bayan-glow-1"></div>
            <div className="bayan-glow-2"></div>
            <div style={{position:'absolute',top:20,right:20,zIndex:10}}>
              <span className="badge badge-green-live" style={{fontSize:13,padding:'6px 14px'}}><span style={{width:8,height:8,background:'white',borderRadius:'50%',display:'block'}} className="animate-pulse"></span>Now Live</span>
            </div>
            <div className="bayan-content">
              <div>
                <div style={{marginBottom:20}}>
                  <img src="/images/bayan_logo_final_v2.png" alt="Bayan" style={{height:72,objectFit:'contain',marginBottom:16}} onError={e => (e.currentTarget.style.display='none')} />
                  <span className="badge" style={{background:'rgba(200,151,42,0.2)',color:'var(--accent-light)',display:'block',marginBottom:12,width:'fit-content'}}>AI-Powered Board Exam Preparation — Free</span>
                  <h2 style={{fontFamily:'var(--font-serif)',fontSize:'1.8rem',color:'white',marginBottom:8}}>Bayan: Master Internal Medicine. <span style={{color:'var(--accent-light)'}}>Pass Your Board Exam.</span></h2>
                </div>
                <p style={{color:'rgba(255,255,255,0.7)',marginBottom:20,lineHeight:1.7}}>Free AI-powered medical board exam prep built by MedResearch Academy for residents in Oman. Thousands of physician-reviewed clinical vignettes based on the latest guidelines.</p>
                <div className="exam-tags" style={{marginBottom:20}}>
                  {['🇴🇲 OMSB','🏥 Arab Board','🇬🇧 MRCP(UK)','🇺🇸 ABIM','🇺🇸 USMLE','🇦🇪 DHA/HAAD','🇶🇦 QCHP','🇸🇦 SMLE','🇦🇺 RACP','+ more'].map(e => <span key={e} className="exam-tag">{e}</span>)}
                </div>
                <a href="https://www.bayan.edu.om" target="_blank" rel="noopener noreferrer" className="btn btn-accent btn-lg">Launch Bayan Free →</a>
              </div>
              <div className="bayan-features">
                {[['🧠','Adaptive Learning','AI adjusts difficulty in real time'],['📚','Knowledge Library','Clinical articles with key terms'],['🃏','Flashcards','Spaced repetition for retention'],['📈','Analytics','Detailed performance tracking'],['📅','Study Planner','Weekly schedule & goals'],['🏆','Leaderboard','Compete with fellow residents']].map(([icon,title,desc]) => (
                  <div key={title as string} className="bayan-feature">
                    <div className="icon">{icon}</div>
                    <p>{title}</p>
                    <small>{desc}</small>
                  </div>
                ))}
              </div>
            </div>
            <div className="bayan-stats">
              <div><div className="bayan-stat-num">10+</div><div className="bayan-stat-label">Board Exams</div></div>
              <div><div className="bayan-stat-num">3-Tier</div><div className="bayan-stat-label">Editorial Review</div></div>
              <div><div className="bayan-stat-num">14</div><div className="bayan-stat-label">Specialties</div></div>
              <div><div className="bayan-stat-num">Free</div><div className="bayan-stat-label">No subscription</div></div>
            </div>
          </div>

          {/* JournalReady */}
          <div className="resource-card" style={{marginBottom:32,background:'linear-gradient(135deg, #f7f8fa 0%, #eef1f6 100%)',border:'2px solid #e2e5ea',borderRadius:16,overflow:'hidden'}}>
            <div className="resource-body" style={{padding:32}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
                <div style={{width:48,height:48,borderRadius:12,background:'linear-gradient(135deg, #1a3a5c, #0d2540)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <span style={{color:'#c8972a',fontSize:24,fontWeight:700}}>J</span>
                </div>
                <div>
                  <span style={{fontFamily:'Georgia, serif',fontSize:'1.5rem',fontWeight:700,color:'#1a3a5c'}}>Journal<span style={{color:'#c8972a'}}>Ready</span></span>
                  <div style={{fontSize:10,fontWeight:700,color:'#8a9ab5',letterSpacing:1.5}}>BY MEDRESEARCH ACADEMY</div>
                </div>
                <span className="badge" style={{background:'rgba(200,151,42,0.15)',color:'#8a6515',marginLeft:12}}>Beta</span>
              </div>
              <h2 style={{fontSize:'1.6rem',marginBottom:12,color:'#1a3a5c'}}>From Research Idea to Published Paper — One Platform</h2>
              <p style={{color:'var(--text-muted)',marginBottom:24,lineHeight:1.8}}>
                JournalReady is the AI-powered publishing assistant for academic medicine. 23 specialist tools guide you through every stage of the research lifecycle — from structuring your first PICO question to formatting the final manuscript for submission.
              </p>

              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:28}}>
                {[
                  ['Research Question Builder','Structure ideas with PICO/FINER frameworks, AI-guided feasibility assessment'],
                  ['Sample Size Calculator','Wizard mode for beginners — answers 4 plain-language questions, auto-selects the right test'],
                  ['Manuscript Formatter','Format to any journal (800+ styles), citation-manager-aware, compliance checking'],
                  ['Reference Linker','Paste plain-text refs → auto-link via CrossRef DOI → export to EndNote/Zotero/Mendeley'],
                  ['Journal Finder','Realistic matching by study design, sample size, and quality tier — not just topic'],
                  ['Stats Analysis','Full pipeline: t-test, ANOVA, regression, survival analysis, ML models via Railway backend'],
                ].map(([title, desc]) => (
                  <div key={title} style={{background:'white',borderRadius:10,padding:16,border:'1px solid #e2e5ea'}}>
                    <div style={{fontWeight:700,fontSize:13,color:'#1a3a5c',marginBottom:6}}>{title}</div>
                    <div style={{fontSize:12,color:'var(--text-muted)',lineHeight:1.5}}>{desc}</div>
                  </div>
                ))}
              </div>

              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:28,borderTop:'1px solid #e2e5ea',paddingTop:20}}>
                {[['23','AI Tools'],['6','Workflow Stages'],['800+','Journal Styles'],['Free','For Oman']].map(([num, label]) => (
                  <div key={label} style={{textAlign:'center'}}>
                    <div style={{fontFamily:'Georgia, serif',fontSize:'1.6rem',fontWeight:700,color:'#c8972a'}}>{num}</div>
                    <div style={{fontSize:11,color:'#8a9ab5',fontWeight:600,letterSpacing:0.5}}>{label}</div>
                  </div>
                ))}
              </div>

              <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
                <a href="https://journal-ready.vercel.app" target="_blank" rel="noopener noreferrer" className="btn btn-lg" style={{background:'#1a3a5c',color:'white',border:'none'}}>Open JournalReady →</a>
                <a href="https://journal-ready.vercel.app/author/projects" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-lg">Start a Research Project</a>
              </div>

              <div style={{marginTop:20,padding:16,background:'rgba(26,58,92,0.04)',borderRadius:10,border:'1px dashed #c8972a33'}}>
                <div style={{fontSize:12,fontWeight:700,color:'#1a3a5c',marginBottom:8}}>Who is JournalReady for?</div>
                <div style={{fontSize:12,color:'var(--text-muted)',lineHeight:1.6}}>
                  <strong>Residents writing their first paper</strong> — the wizard modes ask plain-language questions so you don&apos;t need to know which statistical test to use. <strong>Senior researchers</strong> — skip to any tool (manuscript formatter, reference auditor, journal finder) without creating a project. <strong>Supervisors</strong> — the Reference Linker converts residents&apos; plain-text citations into proper EndNote/Zotero libraries in one click.
                </div>
              </div>
            </div>
          </div>

          {/* Publications */}
          <div>
            <h2 style={{fontSize:'1.8rem',marginBottom:8}}>Latest Publications</h2>
            <p style={{color:'var(--text-muted)',marginBottom:28}}>Recent peer-reviewed publications from our team, fetched live from PubMed.</p>
            {loading ? (
              <div style={{textAlign:'center',padding:'40px 0',color:'var(--text-muted)'}}>Loading publications from PubMed...</div>
            ) : articles.length > 0 ? (
              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                {articles.map((a, i) => (
                  <div key={i} className="card">
                    <div className="card-body" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:20}}>
                      <div>
                        <div style={{fontSize:13,color:'var(--text-muted)',marginBottom:6}}>{a.year} · {a.journal}</div>
                        <div style={{fontWeight:600,marginBottom:4,lineHeight:1.4}}>{a.title}</div>
                        <div style={{fontSize:13,color:'var(--text-muted)'}}>{a.authors}</div>
                      </div>
                      <a href={a.link} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{flexShrink:0}}>PubMed →</a>
                    </div>
                  </div>
                ))}
                <a href="https://pubmed.ncbi.nlm.nih.gov/?term=Al+Alawi+AM" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{width:'fit-content'}}>View All Publications →</a>
              </div>
            ) : (
              <div style={{textAlign:'center',padding:'32px',background:'var(--bg-muted)',borderRadius:12}}>
                <p style={{color:'var(--text-muted)',marginBottom:16}}>Publications loading — view directly on PubMed</p>
                <a href="https://pubmed.ncbi.nlm.nih.gov/?term=Al+Alawi+AM" target="_blank" rel="noopener noreferrer" className="btn btn-primary">View on PubMed →</a>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
