import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';

export default function SmartBlock() {
  return (
    <Layout>
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section style={{background:'linear-gradient(135deg,var(--primary) 0%,#0f2847 100%)',color:'white',padding:'80px 0',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,opacity:0.04,backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)',backgroundSize:'40px 40px'}}></div>
        <div className="container" style={{position:'relative',zIndex:1,maxWidth:960}}>
          <Link to="/active-research" style={{color:'rgba(255,255,255,0.75)',fontSize:13,textDecoration:'none',display:'inline-block',marginBottom:20}}>← Back to Active Research</Link>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:20}}>
            <span style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(34,197,94,0.18)',border:'1px solid rgba(34,197,94,0.4)',borderRadius:50,padding:'5px 16px',fontSize:12,fontWeight:600}}>
              <span style={{width:7,height:7,background:'#22c55e',borderRadius:'50%',display:'inline-block'}}></span>
              System Development & Pilot
            </span>
            <span style={{background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.25)',borderRadius:50,padding:'5px 14px',fontSize:12}}>SQUH MREC</span>
          </div>
          <div style={{fontSize:11,fontWeight:700,color:'var(--accent-light)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10}}>Approved Protocol</div>
          <h1 style={{fontSize:'clamp(1.7rem,4.2vw,2.5rem)',marginBottom:14,fontFamily:'var(--font-serif)',lineHeight:1.25}}>
            SmartBlock: AI-Enabled Rotation Scheduling for the OMSB Internal Medicine Residency Program
          </h1>
          <div style={{display:'inline-block',background:'rgba(34,197,94,0.18)',border:'1px solid rgba(34,197,94,0.4)',padding:'6px 16px',borderRadius:8,fontSize:13,marginBottom:20}}>
            Current Phase: <strong>System build & iterative refinement with stakeholder feedback</strong>
          </div>
          <p style={{color:'rgba(255,255,255,0.8)',maxWidth:740,fontSize:'1.05rem',lineHeight:1.75,marginBottom:28}}>
            A three-phase mixed-methods research study evaluating the design, implementation, and impact of an AI-powered constraint optimization platform for generating equitable, curriculum-compliant rotation schedules across 3 training sites, 119 residents, and 13 four-week blocks per academic year.
          </p>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            <a href="#overview" className="btn btn-accent">Learn More</a>
            <a href="https://rota.medresearch-academy.om" target="_blank" rel="noopener noreferrer" className="btn btn-outline-white">View Platform</a>
          </div>
        </div>
      </section>

      {/* ── Key facts strip ───────────────────────────────────────────── */}
      <section style={{background:'var(--bg-muted)',padding:'40px 0',borderBottom:'1px solid var(--border)'}}>
        <div className="container" style={{maxWidth:1000}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:24}}>
            {([
              ['🏥','3 Sites','SQUH, Royal, AFH'],
              ['👩‍⚕️','119','IM Residents'],
              ['📅','13 Blocks','4-week rotations/year'],
              ['🧠','OR-Tools','Constraint optimization'],
              ['📊','9 CTUs','Across 3 hospitals'],
            ] as [string,string,string][]).map(([icon,num,label]) => (
              <div key={label} style={{textAlign:'center'}}>
                <div style={{fontSize:28,marginBottom:6}}>{icon}</div>
                <div style={{fontSize:'1.6rem',fontWeight:700,fontFamily:'var(--font-serif)',color:'var(--primary)'}}>{num}</div>
                <div style={{fontSize:13,color:'var(--text-muted)'}}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Background / Problem ────────────────────────────────────── */}
      <section id="overview" className="section">
        <div className="container" style={{maxWidth:860}}>
          <h2 style={{fontSize:'1.8rem',color:'var(--primary)',marginBottom:20}}>Background & Problem Statement</h2>
          <p style={{color:'var(--text-muted)',marginBottom:16,lineHeight:1.8,fontSize:'1.02rem'}}>
            The OMSB Internal Medicine Residency Program manages <strong style={{color:'var(--text)'}}>119 residents</strong> (R1-R4) across <strong style={{color:'var(--text)'}}>3 training sites</strong> (SQUH, Royal Hospital, and Armed Forces Hospital), with an additional ~16 external rotators from 6 programs each year. Two interconnected scheduling challenges must be solved annually.
          </p>
          <p style={{color:'var(--text-muted)',marginBottom:16,lineHeight:1.8,fontSize:'1.02rem'}}>
            The <strong style={{color:'var(--text)'}}>Master Rota</strong> assigns all residents to rotations across 13 four-week blocks, satisfying curriculum requirements while maintaining stable CTU staffing of 6-8 residents per team across 9 CTUs. Currently built manually using spreadsheets, taking <strong style={{color:'var(--text)'}}>2-3 weeks</strong> of administrative effort.
          </p>
          <p style={{color:'var(--text-muted)',lineHeight:1.8,fontSize:'1.02rem'}}>
            The <strong style={{color:'var(--text)'}}>Block On-Call Rota</strong> assigns daily on-call duties across 3 seniority levels at each site, respecting OMSB duty-hour regulations. Chief residents currently spend up to <strong style={{color:'var(--text)'}}>one full week per block</strong> on this task, with rotas going through 4-6 revision cycles due to complaints.
          </p>
        </div>
      </section>

      {/* ── Research Phases ─────────────────────────────────────────── */}
      <section className="section section-muted">
        <div className="container" style={{maxWidth:900}}>
          <h2 style={{fontSize:'1.8rem',color:'var(--primary)',marginBottom:28,textAlign:'center'}}>Research Phases</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:24}}>
            <div style={{background:'white',borderRadius:16,padding:'28px',border:'1px solid var(--border)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--accent)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:8}}>Phase 1</div>
              <h3 style={{color:'var(--primary)',marginBottom:10,fontSize:'1.15rem'}}>Stakeholder Interviews</h3>
              <p style={{color:'var(--text-muted)',fontSize:14,lineHeight:1.7}}>
                Semi-structured interviews with residents, chief residents, program coordinators, and the PD to understand scheduling pain points, fairness perceptions, and priority constraints.
              </p>
            </div>
            <div style={{background:'white',borderRadius:16,padding:'28px',border:'2px solid var(--accent)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--accent)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:8}}>Phase 2 (Current)</div>
              <h3 style={{color:'var(--primary)',marginBottom:10,fontSize:'1.15rem'}}>System Build & Pilot</h3>
              <p style={{color:'var(--text-muted)',fontSize:14,lineHeight:1.7}}>
                Iterative development of the SmartBlock platform with constraint optimization solver, on-call generator, wellbeing monitoring, and feedback loops. Pilot deployment with real schedules.
              </p>
            </div>
            <div style={{background:'white',borderRadius:16,padding:'28px',border:'1px solid var(--border)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--accent)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:8}}>Phase 3</div>
              <h3 style={{color:'var(--primary)',marginBottom:10,fontSize:'1.15rem'}}>Evaluation & Impact</h3>
              <p style={{color:'var(--text-muted)',fontSize:14,lineHeight:1.7}}>
                Quantitative comparison (time savings, fairness metrics, constraint violations) and qualitative evaluation (satisfaction surveys, focus groups) against the previous manual process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Platform Features ───────────────────────────────────────── */}
      <section className="section">
        <div className="container" style={{maxWidth:900}}>
          <h2 style={{fontSize:'1.8rem',color:'var(--primary)',marginBottom:28,textAlign:'center'}}>SmartBlock Platform</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:20}}>
            {([
              ['Master Rota Solver', 'Google OR-Tools CP-SAT solver generates optimal rotation assignments respecting curriculum, capacity, and fairness constraints.'],
              ['On-Call Generator', 'Automated daily on-call assignments with IMAD protection, duty-hour compliance, and subspecialty call pool routing.'],
              ['Preference Collection', 'Structured forms for leave preferences, elective choices, site restrictions, and special circumstances — replacing Google Forms.'],
              ['Wellbeing Monitoring', 'Algorithmic tracking of intensive block burden, consecutive intensity, site variety, and maternity protection.'],
              ['Swap Management', 'Tiered swap system with constraint validation, cross-level checks, and audit trail.'],
              ['Fairness Analytics', 'Gini coefficient tracking, call distribution monitoring, holiday equity, and per-resident workload analysis.'],
            ] as [string,string][]).map(([title,desc]) => (
              <div key={title} style={{background:'var(--bg-muted)',borderRadius:12,padding:'20px',border:'1px solid var(--border)'}}>
                <h4 style={{color:'var(--primary)',marginBottom:8,fontSize:'0.95rem'}}>{title}</h4>
                <p style={{color:'var(--text-muted)',fontSize:13,lineHeight:1.6}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Research Team ───────────────────────────────────────────── */}
      <section className="section section-muted">
        <div className="container" style={{maxWidth:860}}>
          <h2 style={{fontSize:'1.8rem',color:'var(--primary)',marginBottom:24}}>Research Team</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:20}}>
            <div style={{background:'white',borderRadius:12,padding:'24px',border:'1px solid var(--border)'}}>
              <div style={{fontSize:10,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:6}}>Principal Investigator</div>
              <div style={{fontSize:15,fontWeight:600,color:'var(--text)'}}>Dr. Abdullah M. Al Alawi</div>
              <div style={{fontSize:13,color:'var(--text-muted)',marginTop:4}}>Program Director, OMSB IM Residency</div>
            </div>
            <div style={{background:'white',borderRadius:12,padding:'24px',border:'1px solid var(--border)'}}>
              <div style={{fontSize:10,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:6}}>Co-Principal Investigator</div>
              <div style={{fontSize:15,fontWeight:600,color:'var(--text)'}}>Dr. Hala Muslem Al-Riyami</div>
              <div style={{fontSize:13,color:'var(--text-muted)',marginTop:4}}>IM Residency, OMSB</div>
            </div>
            <div style={{background:'white',borderRadius:12,padding:'24px',border:'1px solid var(--border)'}}>
              <div style={{fontSize:10,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:6}}>Co-Investigator</div>
              <div style={{fontSize:15,fontWeight:600,color:'var(--text)'}}>Dr. Marwa Sultan Al Sharji</div>
              <div style={{fontSize:13,color:'var(--text-muted)',marginTop:4}}>IM Residency, OMSB</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ethics & Contact ─────────────────────────────────────────── */}
      <section className="section">
        <div className="container" style={{maxWidth:860}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:24}}>
            <div style={{background:'var(--bg-muted)',borderRadius:16,padding:'28px',border:'1px solid var(--border)'}}>
              <h3 style={{color:'var(--primary)',marginBottom:12,fontSize:'1.15rem'}}>Ethics Approval</h3>
              <p style={{color:'var(--text-muted)',fontSize:14,lineHeight:1.7}}>
                This study has been reviewed and approved by the <strong style={{color:'var(--text)'}}>SQUH Medical Research Ethics Committee</strong> (submitted February 2026). All data is handled in accordance with institutional data protection policies.
              </p>
            </div>
            <div style={{background:'var(--bg-muted)',borderRadius:16,padding:'28px',border:'1px solid var(--border)'}}>
              <h3 style={{color:'var(--primary)',marginBottom:12,fontSize:'1.15rem'}}>Contact</h3>
              <p style={{color:'var(--text-muted)',fontSize:14,lineHeight:1.7,marginBottom:12}}>
                For questions about this study or to participate in Phase 3 evaluation:
              </p>
              <p style={{fontSize:14}}>
                <strong style={{color:'var(--text)'}}>Email:</strong>{' '}
                <a href="mailto:medicine.pd@omsb.org" style={{color:'var(--primary)'}}>medicine.pd@omsb.org</a>
              </p>
              <p style={{fontSize:14,marginTop:4}}>
                <strong style={{color:'var(--text)'}}>Platform:</strong>{' '}
                <a href="https://rota.medresearch-academy.om" target="_blank" rel="noopener noreferrer" style={{color:'var(--primary)'}}>rota.medresearch-academy.om</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
