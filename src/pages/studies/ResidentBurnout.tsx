import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';

export default function ResidentBurnout() {
  return (
    <Layout>
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section style={{background:'linear-gradient(135deg,var(--primary) 0%,#0f2847 100%)',color:'white',padding:'80px 0',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,opacity:0.04,backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)',backgroundSize:'40px 40px'}}></div>
        <div className="container" style={{position:'relative',zIndex:1,maxWidth:960}}>
          <Link to="/active-research" style={{color:'rgba(255,255,255,0.75)',fontSize:13,textDecoration:'none',display:'inline-block',marginBottom:20}}>← Back to Active Research</Link>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:20}}>
            <span style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(59,130,246,0.18)',border:'1px solid rgba(59,130,246,0.4)',borderRadius:50,padding:'5px 16px',fontSize:12,fontWeight:600}}>
              <span style={{width:7,height:7,background:'#3b82f6',borderRadius:'50%',display:'inline-block'}}></span>
              Data Collection Phase
            </span>
            <span style={{background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.25)',borderRadius:50,padding:'5px 14px',fontSize:12}}>MREC #3190</span>
            <span style={{background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.25)',borderRadius:50,padding:'5px 14px',fontSize:12}}>SQU-EC297-2023</span>
            <span style={{background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.25)',borderRadius:50,padding:'5px 14px',fontSize:12}}>Royal Hospital EC Approved</span>
          </div>
          <div style={{fontSize:11,fontWeight:700,color:'var(--accent-light)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10}}>Approved Protocol · MREC #3190</div>
          <h1 style={{fontSize:'clamp(1.7rem,4.2vw,2.5rem)',marginBottom:14,fontFamily:'var(--font-serif)',lineHeight:1.25}}>
            The Association Between Healthcare Workers' Burnout and Biophysical Parameters
          </h1>
          <div style={{display:'inline-block',background:'rgba(200,151,42,0.18)',border:'1px solid rgba(200,151,42,0.4)',padding:'6px 16px',borderRadius:8,fontSize:13,marginBottom:20}}>
            📍 Current Phase: <strong>A resident-focused pilot study at OMSB</strong>
          </div>
          <p style={{color:'rgba(255,255,255,0.8)',maxWidth:740,fontSize:'1.05rem',lineHeight:1.75,marginBottom:28}}>
            A multi-center, prospective pilot cohort study using the Copenhagen Burnout Inventory (CBI), validated psychological screening instruments (PHQ-9, GAD-7, Insomnia Severity Index), and WHOOP wearable biosensors to quantify the relationship between burnout severity and objective biophysical markers — heart rate variability, sleep quality, and autonomic tone. The pilot cohort comprises 70+ OMSB internal medicine and general surgery residents at three hospitals in Muscat.
          </p>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            <a href="#overview" className="btn btn-accent">Learn More</a>
            <Link to="/login" className="btn btn-outline-white">🔒 Team Login</Link>
          </div>
        </div>
      </section>

      {/* ── Key facts strip ───────────────────────────────────────────── */}
      <section style={{background:'var(--bg-muted)',padding:'40px 0',borderBottom:'1px solid var(--border)'}}>
        <div className="container" style={{maxWidth:1000}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:24}}>
            {[
              ['🏥','3 Sites','SQUH · Royal · AFH'],
              ['👩‍⚕️','70+','Residents enrolled'],
              ['⏱️','12 months','Study duration'],
              ['📊','13 blocks','4-week rotations'],
            ].map(([icon,num,label]) => (
              <div key={label} style={{textAlign:'center'}}>
                <div style={{fontSize:28,marginBottom:6}}>{icon}</div>
                <div style={{fontSize:'1.6rem',fontWeight:700,fontFamily:'var(--font-serif)',color:'var(--primary)'}}>{num}</div>
                <div style={{fontSize:13,color:'var(--text-muted)'}}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Background / Rationale ────────────────────────────────────── */}
      <section id="overview" className="section">
        <div className="container" style={{maxWidth:860}}>
          <h2 style={{fontSize:'1.8rem',color:'var(--primary)',marginBottom:20}}>Background & Rationale</h2>
          <p style={{color:'var(--text-muted)',marginBottom:16,lineHeight:1.8,fontSize:'1.02rem'}}>
            Burnout among healthcare professionals has reached crisis proportions globally. In 2021, the prevalence among U.S. physicians was documented at <strong style={{color:'var(--text)'}}>62.8%</strong> — a sharp rise from 38.2% in 2020. In the Middle East, rates range from <strong style={{color:'var(--text)'}}>40% to 60%</strong>. Residents, with their long hours, intense patient care responsibilities, and steep learning curves, are disproportionately affected.
          </p>
          <p style={{color:'var(--text-muted)',marginBottom:16,lineHeight:1.8,fontSize:'1.02rem'}}>
            A 2020 study by Al Subhi et al. found that <strong style={{color:'var(--text)'}}>16.6% of OMSB residents experienced burnout</strong> — 13.9% in surgical, 19.0% in medical, and 12.8% in diagnostic specialties. Yet all existing assessments rely on self-report questionnaires, which are subjective and retrospective.
          </p>
          <p style={{color:'var(--text-muted)',lineHeight:1.8,fontSize:'1.02rem'}}>
            Emerging evidence links burnout to measurable <strong style={{color:'var(--text)'}}>biophysical changes</strong> — reduced heart rate variability (HRV), altered respiratory patterns, and disturbed sleep architecture. This study is the <strong style={{color:'var(--text)'}}>first in the region</strong> to objectively quantify this link using continuous wearable monitoring.
          </p>
        </div>
      </section>

      {/* ── Objectives & Hypothesis ───────────────────────────────────── */}
      <section className="section section-muted">
        <div className="container" style={{maxWidth:900}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr',gap:24}}>
            <div style={{background:'white',borderRadius:16,padding:'32px',border:'1px solid var(--border)'}}>
              <h3 style={{color:'var(--primary)',marginBottom:16,fontSize:'1.3rem'}}>🎯 Primary Objective</h3>
              <p style={{color:'var(--text-muted)',lineHeight:1.75,fontSize:15}}>
                To determine the correlation between burnout severity (measured by the Copenhagen Burnout Inventory) and objective biophysical parameters captured by the WHOOP wearable device in OMSB residents.
              </p>
            </div>

            <div style={{background:'white',borderRadius:16,padding:'32px',border:'1px solid var(--border)'}}>
              <h3 style={{color:'var(--primary)',marginBottom:16,fontSize:'1.3rem'}}>🧭 Secondary Objectives</h3>
              <ul style={{color:'var(--text-muted)',lineHeight:1.85,fontSize:15,paddingLeft:20,listStyle:'none'}}>
                {[
                  'Identify associations between demographic variables (age, sex, PGY, marital status, family support) and burnout',
                  'Evaluate program-specific workload factors (calls per block, call type, weekly hours, sleep hours) against burnout outcomes',
                  'Compare burnout risk profiles between medical and surgical residents',
                  'Build predictive models linking biophysical signatures to CBI subscale scores',
                ].map(obj => (
                  <li key={obj} style={{position:'relative',paddingLeft:24,marginBottom:10}}>
                    <span style={{position:'absolute',left:0,color:'var(--accent)',fontWeight:700}}>▸</span>
                    {obj}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{background:'linear-gradient(135deg,rgba(200,151,42,0.08),rgba(200,151,42,0.02))',borderRadius:16,padding:'32px',border:'1px solid rgba(200,151,42,0.25)'}}>
              <h3 style={{color:'#8a6515',marginBottom:12,fontSize:'1.3rem'}}>🧪 Hypothesis</h3>
              <p style={{color:'var(--text-muted)',lineHeight:1.75,fontSize:15}}>
                Residents with higher burnout will exhibit <strong style={{color:'var(--text)'}}>lower heart rate variability</strong> (reduced parasympathetic tone), <strong style={{color:'var(--text)'}}>altered respiratory rate</strong>, and <strong style={{color:'var(--text)'}}>worse sleep quality and duration</strong> on objective wearable measurement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Methodology ───────────────────────────────────────────────── */}
      <section className="section">
        <div className="container" style={{maxWidth:900}}>
          <h2 style={{fontSize:'1.8rem',color:'var(--primary)',marginBottom:24,textAlign:'center'}}>Study Methodology</h2>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:20}}>
            {[
              {icon:'📝',title:'Study Design',desc:'Multi-center, prospective, pilot cohort study. 12-month data collection across SQUH, Royal Hospital, and Armed Forces Hospital.'},
              {icon:'👥',title:'Sample',desc:'Convenience sample of 70+ OMSB residents — internal medicine and general surgery, spanning PGY-1 to PGY-5.'},
              {icon:'⌚',title:'WHOOP Wearable',desc:'Continuous 24/7 monitoring of HRV, RHR, SpO2, skin temperature, respiratory rate, sleep stages, and daily strain.'},
              {icon:'📊',title:'Copenhagen Burnout Inventory',desc:'CBI — 22 items measuring personal burnout, work-related burnout, and patient-related burnout. Administered monthly at the end of each rotation block.'},
              {icon:'🧠',title:'PHQ-9 · GAD-7 · ISI',desc:'Depression screening (PHQ-9, 9 items), anxiety screening (GAD-7, 7 items), and insomnia severity assessment (ISI, 7 items). Administered monthly alongside the CBI.'},
              {icon:'📅',title:'Rotation Log',desc:'At end of each 4-week block: calls worked, call type (24h vs shift), weekly hours, sleep hours, rotation type and site.'},
            ].map(card => (
              <div key={card.title} style={{background:'white',borderRadius:14,padding:'24px',border:'1px solid var(--border)',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
                <div style={{fontSize:30,marginBottom:12}}>{card.icon}</div>
                <h4 style={{color:'var(--primary)',fontSize:'1.05rem',marginBottom:8,fontFamily:'var(--font-serif)'}}>{card.title}</h4>
                <p style={{color:'var(--text-muted)',fontSize:13.5,lineHeight:1.65}}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Research Team ─────────────────────────────────────────────── */}
      <section className="section section-muted">
        <div className="container" style={{maxWidth:960}}>
          <h2 style={{fontSize:'1.8rem',color:'var(--primary)',marginBottom:8,textAlign:'center'}}>Research Team</h2>
          <p style={{textAlign:'center',color:'var(--text-muted)',marginBottom:36,fontSize:14}}>A multi-institutional collaboration across cardiology, internal medicine, and psychiatry</p>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:18}}>
            {[
              {name:'Dr. Mohamed Al Rawahi',role:'Principal Investigator',creds:'MD, MBA, MSc',detail:'Senior Consultant Cardiac Electrophysiologist · SQUH & National Heart Center, Royal Hospital'},
              {name:'Dr. Abdullah M. Al Alawi',role:'Co-Principal Investigator — AI/ML Analytics Lead',creds:'BSc, MD, MSc, FRACP, FACP',detail:'PD Internal Medicine Residency, OMSB'},
              {name:'Dr. Masoud Kashoub',role:'Co-Investigator',creds:'MD',detail:'Internal Medicine, SQUH'},
              {name:'Dr. Salim Al Busaidi',role:'Co-Investigator — Recruitment Lead',creds:'MD',detail:'Internal Medicine, SQUH'},
              {name:'Dr. Jawahar Al Nou\u2019mani',role:'Co-Investigator — Site Coordinator',creds:'MD',detail:'Internal Medicine, SQUH'},
              {name:'Dr. Adil Al Riyami',role:'Co-Investigator — Policy',creds:'MD',detail:'Interventional Cardiology, SQUH'},
              {name:'Dr. Tamadhir Al Mahrouqi',role:'Co-Investigator — Psychometrics',creds:'MD',detail:'Psychiatry, SQUH'},
              {name:'Aseel Al Toubi',role:'Co-Investigator — Research Coordinator',creds:'BSc',detail:'Research Assistant, SQUH'},
            ].map(member => (
              <div key={member.name} style={{background:'white',borderRadius:14,padding:'22px 24px',border:'1px solid var(--border)',borderLeft:'4px solid var(--accent)'}}>
                <div style={{fontWeight:700,fontSize:15,color:'var(--text)',marginBottom:3,fontFamily:'var(--font-serif)'}}>{member.name}</div>
                <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:8}}>{member.creds}</div>
                <div style={{fontSize:12,color:'var(--primary)',fontWeight:600,marginBottom:8}}>{member.role}</div>
                <div style={{fontSize:12,color:'var(--text-muted)',lineHeight:1.55}}>{member.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ──────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container" style={{maxWidth:900}}>
          <h2 style={{fontSize:'1.8rem',color:'var(--primary)',marginBottom:32,textAlign:'center'}}>Study Timeline</h2>
          <div style={{position:'relative',paddingLeft:32}}>
            <div style={{position:'absolute',left:8,top:0,bottom:0,width:2,background:'var(--border)'}}></div>
            {[
              {date:'July 2024',title:'Ethical Approvals Secured',desc:'MREC #3190 (SQU) and Royal Hospital Research Ethics Committee approvals obtained.',done:true},
              {date:'January 2025',title:'Funding Confirmed',desc:'Grant awarded by the Ministry of Higher Education, Research, and Innovation (MoHERI).',done:true},
              {date:'March 2025',title:'Recruitment & Device Distribution',desc:'70+ WHOOP devices distributed to consenting OMSB residents across three sites.',done:true},
              {date:'March 2025 – March 2026',title:'Continuous Data Collection',desc:'Continuous biophysical monitoring with monthly CBI, PHQ-9, GAD-7, and ISI assessments tied to rotation blocks.',done:true,active:true},
              {date:'April – June 2026',title:'Data Processing & Quality Control',desc:'WHOOP API extraction, pseudonymization, data validation, and linkage to rotation metadata.',done:false},
              {date:'July – August 2026',title:'Analysis & Interpretation',desc:'Statistical modeling (SPSS + multivariate regression) to test primary hypothesis and secondary objectives.',done:false},
              {date:'September 2026',title:'Dissemination',desc:'Manuscript submission, conference presentations, and policy briefing to OMSB leadership.',done:false},
            ].map((m,i) => (
              <div key={i} style={{position:'relative',marginBottom:24,paddingLeft:24}}>
                <div style={{position:'absolute',left:-4,top:4,width:18,height:18,borderRadius:'50%',background:m.done ? (m.active ? 'var(--accent)' : 'var(--primary)') : 'white',border:`3px solid ${m.done ? (m.active ? 'var(--accent-light)' : 'var(--primary)') : 'var(--border)'}`}}></div>
                <div style={{fontSize:11,color:'var(--text-muted)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:4}}>{m.date}</div>
                <div style={{fontSize:'1.05rem',fontWeight:700,color:'var(--primary)',marginBottom:4}}>{m.title}</div>
                <div style={{fontSize:13.5,color:'var(--text-muted)',lineHeight:1.6}}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ethics & Funding ──────────────────────────────────────────── */}
      <section className="section section-muted">
        <div className="container" style={{maxWidth:860}}>
          <div style={{background:'white',borderRadius:16,padding:'36px',border:'1px solid var(--border)',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:32}}>
            <div>
              <div style={{fontSize:28,marginBottom:12}}>🛡️</div>
              <h3 style={{color:'var(--primary)',fontSize:'1.2rem',marginBottom:10}}>Ethical Approval</h3>
              <p style={{fontSize:13.5,color:'var(--text-muted)',lineHeight:1.65,marginBottom:8}}>
                Approved by the <strong style={{color:'var(--text)'}}>Medical Research Ethics Committee of Sultan Qaboos University</strong> (MREC #3190, Ref. SQU-EC/297/2023, 11 December 2023) and the <strong style={{color:'var(--text)'}}>Royal Hospital Scientific Research Committee</strong> (MoH/CSR/24/28632, 2 July 2024).
              </p>
              <p style={{fontSize:12,color:'var(--text-muted)',marginBottom:6}}>The current pilot — focused on OMSB medical and surgical residents — is conducted within the broader approved protocol "The Association Between Healthcare Burnout and Biophysical Parameters".</p>
              <p style={{fontSize:12,color:'var(--text-muted)'}}>All participant data is pseudonymized and stored under institutional data governance standards.</p>
            </div>
            <div>
              <div style={{fontSize:28,marginBottom:12}}>💰</div>
              <h3 style={{color:'var(--primary)',fontSize:'1.2rem',marginBottom:10}}>Funding</h3>
              <p style={{fontSize:13.5,color:'var(--text-muted)',lineHeight:1.65,marginBottom:8}}>This research is funded by a grant from the <strong style={{color:'var(--text)'}}>Ministry of Higher Education, Research, and Innovation (MoHERI)</strong>, Sultanate of Oman.</p>
              <p style={{fontSize:12,color:'var(--text-muted)'}}>The funder had no role in study design, data analysis, or manuscript preparation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA strip ─────────────────────────────────────────────────── */}
      <section style={{background:'var(--primary)',color:'white',padding:'56px 0',textAlign:'center'}}>
        <div className="container" style={{maxWidth:700}}>
          <h3 style={{fontSize:'1.5rem',marginBottom:12,fontFamily:'var(--font-serif)'}}>Research Team Access</h3>
          <p style={{color:'rgba(255,255,255,0.8)',marginBottom:24,fontSize:15}}>Investigators and research assistants can access the secure study dashboard to enter rotation logs, review assessments, and export de-identified data.</p>
          <div style={{display:'flex',justifyContent:'center',gap:12,flexWrap:'wrap'}}>
            <Link to="/login" className="btn btn-accent">🔒 Team Dashboard Login</Link>
            <a href="mailto:alalawi2@squ.edu.om" className="btn btn-outline-white">Contact Research Team</a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
