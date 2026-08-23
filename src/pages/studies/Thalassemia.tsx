import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';

const TEAM = [
  { name: 'Dr. Mohammed Al Rawahi',    role: 'Principal Investigator',    email: 'mrawahi@squ.edu.om' },
  { name: 'Dr. Abdullah M. Al Alawi',  role: 'Research Lead',              email: 'alalawi2@squ.edu.om' },
  { name: 'Dr. Mohamed Al Husaini',    role: 'AI Co-Investigator',         email: null },
  { name: 'Nuha Al Habsi',             role: 'Research Team',              email: 'Nuhahabsi7@gmail.com' },
  { name: 'Abubakr El’Tigani',    role: 'Research Team',              email: 'abubakr@squ.edu.om' },
  { name: 'Malak Amur Alkulaibi',      role: 'Research Team',              email: 'Malakalkulibi@gmail.com' },
  { name: 'Sarah Al Rahbi',            role: 'Research Team',              email: 'sara55@squ.edu.om' },
  { name: 'Mohammed Al Habsi',         role: 'Research Team',              email: 'm.s.m22133@gmail.com' },
  { name: 'Fatema Al Maqblai',         role: 'Research Team',              email: '2fatma2me@gmail.com' },
  { name: 'Noura Al-Harmali',          role: 'Research Team',              email: 'doctornoura33@gmail.com' },
  { name: 'Bader Al Rawahi',           role: 'Research Team',              email: 'bass@squ.edu.om' },
  { name: 'Abdullah Ismaili',          role: 'Research Team',              email: 'aalismaili@squ.edu.om' },
  { name: 'Adil Riyami',               role: 'Research Team',              email: 'Dradil@squ.edu.om' },
  { name: 'Omar Al Taei',              role: 'Research Team',              email: 'altaeiomar11@gmail.com' },
  { name: 'Dawood Al Amri',            role: 'Research Team',              email: 'd.alaamri@squ.edu.om' },
];

const TIMELINE = [
  { date: 'May 2026',       title: 'Ethical Approval Secured',       status: 'done',    detail: 'MREC #3938 · SQU-EC/096/2026' },
  { date: 'Jun 2026',       title: 'Enrollment Opens',                status: 'done',    detail: 'Adult TDT patients at UMC Hematology Center' },
  { date: 'Jun–Dec 2026',   title: 'Baseline Data Collection',        status: 'active',  detail: 'Demographics, labs, ECG, Echo, T2* MRI, PSG, SCG' },
  { date: 'Dec 2026',       title: '6-Month Lab Follow-Up',           status: 'planned', detail: 'MMPs, ferritin, LPI, NT-proBNP' },
  { date: 'Jun 2027',       title: '12-Month Full Reassessment',      status: 'planned', detail: 'Labs + Echo + Cardiac T2* MRI + ECG' },
  { date: 'Q3 2027',        title: 'Analysis & Manuscript',           status: 'planned', detail: 'AI-ECG model training + statistical analysis' },
];

export default function Thalassemia() {
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
              Recruiting Now
            </span>
            <span style={{background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.25)',borderRadius:50,padding:'5px 14px',fontSize:12}}>MREC #3938</span>
            <span style={{background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.25)',borderRadius:50,padding:'5px 14px',fontSize:12}}>SQU-EC/096/2026</span>
          </div>
          <div style={{fontSize:11,fontWeight:700,color:'var(--accent-light)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10}}>Approved Protocol · MREC #3938</div>
          <h1 style={{fontSize:'clamp(1.7rem,4.2vw,2.5rem)',marginBottom:14,fontFamily:'var(--font-serif)',lineHeight:1.25}}>
            Multi-Modal Cardiac Assessment in Transfusion-Dependent Beta Thalassemia
          </h1>
          <div style={{display:'inline-block',background:'rgba(200,151,42,0.18)',border:'1px solid rgba(200,151,42,0.4)',padding:'6px 16px',borderRadius:8,fontSize:13,marginBottom:20}}>
            🫀 A prospective cohort at <strong>Sultan Qaboos University Hospital</strong>
          </div>
          <p style={{color:'rgba(255,255,255,0.8)',maxWidth:740,fontSize:'1.05rem',lineHeight:1.75,marginBottom:28}}>
            A prospective, open-label study of adult transfusion-dependent beta thalassemia (TDT) patients at the University Medical City Hematology Center. The study combines novel matrix metalloproteinase (MMP) biomarkers, home polysomnography for obstructive sleep apnea, AI-based ECG prediction, and AI-enabled seismocardiography with conventional imaging (echocardiography, cardiac T2* MRI) to detect early myocardial iron overload and subclinical cardiac dysfunction.
          </p>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            <a href="#overview" className="btn btn-accent">Learn More</a>
            <Link to="/login" className="btn btn-outline-white">🔬 Research Team Login</Link>
          </div>
        </div>
      </section>

      {/* ── Key facts strip ─────────────────────────────────────────────── */}
      <section style={{background:'var(--bg-muted)',padding:'40px 0',borderBottom:'1px solid var(--border)'}}>
        <div className="container" style={{maxWidth:960}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:20,textAlign:'center'}}>
            {[
              { n: '~120', l: 'Adult TDT patients' },
              { n: '4',    l: 'Investigation arms' },
              { n: '12 mo', l: 'Follow-up per patient' },
              { n: '14',   l: 'Research team members' },
            ].map((f,i) => (
              <div key={i}>
                <div style={{fontSize:'2rem',fontWeight:700,color:'var(--primary)'}}>{f.n}</div>
                <div style={{fontSize:12,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>{f.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Background ──────────────────────────────────────────────────── */}
      <section id="overview" className="section">
        <div className="container" style={{maxWidth:820}}>
          <h2 style={{color:'var(--primary)',fontFamily:'var(--font-serif)',marginBottom:16}}>Background &amp; Rationale</h2>
          <p style={{lineHeight:1.8,color:'var(--text)',marginBottom:14}}>
            Beta thalassemia is a genetic hemoglobinopathy characterized by reduced ß-globin production, leading to chronic anemia and iron overload from frequent transfusions. In Oman, the carrier rate is estimated at <strong>2.2–4%</strong>. Despite advances in iron chelation, myocardial iron overload (MIO) remains a leading driver of cardiac dysfunction and mortality in this population.
          </p>
          <p style={{lineHeight:1.8,color:'var(--text)',marginBottom:14}}>
            Cardiac MRI (T2*) is the gold standard for detecting MIO, but access is limited. NT-proBNP and serum ferritin have limitations for early cardiac involvement. <strong>Matrix metalloproteinases (MMP-2, MMP-9, TIMP-1)</strong> are enzymes central to extracellular matrix remodelling and have been proposed as biomarkers for early cardiac complications in TDT — none of the available studies has specifically evaluated their diagnostic or prognostic value in this population.
          </p>
          <p style={{lineHeight:1.8,color:'var(--text)'}}>
            Sleep disorders — particularly obstructive sleep apnea — and subclinical ECG abnormalities are highly prevalent in TDT but under-diagnosed. This study integrates biomarker discovery, home polysomnography, AI-based ECG interpretation, and AI-enabled seismocardiography (SCG) into a single multi-modal assessment protocol.
          </p>
        </div>
      </section>

      {/* ── Objectives ──────────────────────────────────────────────────── */}
      <section className="section" style={{background:'var(--bg-muted)'}}>
        <div className="container" style={{maxWidth:960}}>
          <h2 style={{color:'var(--primary)',fontFamily:'var(--font-serif)',marginBottom:24}}>Objectives</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20}}>
            <div style={{background:'white',padding:24,borderRadius:12,border:'1px solid var(--border)'}}>
              <div style={{fontSize:12,fontWeight:700,color:'var(--accent)',marginBottom:8}}>PRIMARY</div>
              <ul style={{margin:0,paddingLeft:20,lineHeight:1.8,color:'var(--text)'}}>
                <li>Correlate circulating MMP-2 / MMP-9 with cardiac complications in adult TDT</li>
                <li>Evaluate accuracy of in-house, offline AI-based ECG prediction for early cardiac involvement</li>
                <li>Determine OSA prevalence by home overnight polysomnography</li>
                <li>Compare SCG-derived parameters with Echo and Cardiac MRI</li>
              </ul>
            </div>
            <div style={{background:'white',padding:24,borderRadius:12,border:'1px solid var(--border)'}}>
              <div style={{fontSize:12,fontWeight:700,color:'var(--accent)',marginBottom:8}}>SECONDARY</div>
              <ul style={{margin:0,paddingLeft:20,lineHeight:1.8,color:'var(--text)'}}>
                <li>Correlate MMP levels with iron overload markers (ferritin, cardiac T2*)</li>
                <li>Assess MMP predictive value for subclinical dysfunction on Echo / MRI</li>
                <li>Evaluate longitudinal MMP changes with iron chelation therapy</li>
                <li>Test association between cardiac iron overload and OSA severity</li>
                <li>Compare AI-ECG with conventional cardiac tools (Echo, T2*, NT-proBNP, MMPs)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Methodology ─────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container" style={{maxWidth:960}}>
          <h2 style={{color:'var(--primary)',fontFamily:'var(--font-serif)',marginBottom:24}}>Methodology</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:18}}>
            {[
              { icon: '🩸', title: 'Study Design',           body: 'Prospective, open-label cohort. All eligible adult TDT patients at UMC Hematology Center (~120).' },
              { icon: '🧪', title: 'MMP Biomarkers',          body: 'Serum MMP-2, MMP-9, TIMP-1, Galectin-3 measured at baseline, 6, and 12 months.' },
              { icon: '⚕️', title: 'Iron Overload',           body: 'Serum ferritin, labile plasma iron (LPI), NT-proBNP + Cardiac T2* MRI at baseline and 12 months.' },
              { icon: '💤', title: 'OSA Screening',           body: 'Home overnight polysomnography (one-time). Correlation with cardiac iron overload severity.' },
              { icon: '🧠', title: 'AI-Based ECG',            body: 'CNN model trained 80/20 on study ECGs. Fully offline, closed-source, local-only deployment.' },
              { icon: '📈', title: 'AI Seismocardiography',   body: 'Non-invasive AI-enabled SCG for hemodynamic assessment; compared with Echo and MRI parameters.' },
            ].map((m,i) => (
              <div key={i} style={{background:'white',padding:20,borderRadius:12,border:'1px solid var(--border)'}}>
                <div style={{fontSize:28,marginBottom:8}}>{m.icon}</div>
                <h3 style={{margin:'0 0 8px',fontSize:'1rem',color:'var(--primary)'}}>{m.title}</h3>
                <p style={{margin:0,fontSize:14,color:'var(--text-muted)',lineHeight:1.6}}>{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Research Team ───────────────────────────────────────────────── */}
      <section className="section" style={{background:'var(--bg-muted)'}}>
        <div className="container" style={{maxWidth:960}}>
          <h2 style={{color:'var(--primary)',fontFamily:'var(--font-serif)',marginBottom:20}}>Research Team</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:14}}>
            {TEAM.map((m,i) => (
              <div key={i} style={{background:'white',padding:16,borderRadius:10,border:'1px solid var(--border)'}}>
                <div style={{fontWeight:600,color:'var(--primary)'}}>{m.name}</div>
                <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>{m.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container" style={{maxWidth:820}}>
          <h2 style={{color:'var(--primary)',fontFamily:'var(--font-serif)',marginBottom:24}}>Timeline</h2>
          <div style={{borderLeft:'2px solid var(--border)',paddingLeft:24}}>
            {TIMELINE.map((t,i) => (
              <div key={i} style={{marginBottom:24,position:'relative'}}>
                <div style={{position:'absolute',left:-32,top:4,width:12,height:12,borderRadius:'50%',
                             background: t.status==='done' ? 'var(--accent)' : t.status==='active' ? '#3b82f6' : 'var(--border)',
                             border:'2px solid white',boxShadow:'0 0 0 2px var(--border)'}}></div>
                <div style={{fontSize:12,fontWeight:700,color:'var(--accent)',textTransform:'uppercase',letterSpacing:'0.05em'}}>{t.date}</div>
                <div style={{fontSize:'1rem',fontWeight:600,color:'var(--primary)',margin:'2px 0 4px'}}>{t.title}</div>
                <div style={{fontSize:13,color:'var(--text-muted)'}}>{t.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ethics + Funding ────────────────────────────────────────────── */}
      <section className="section" style={{background:'var(--bg-muted)'}}>
        <div className="container" style={{maxWidth:820}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:20}}>
            <div style={{background:'white',padding:24,borderRadius:12,border:'1px solid var(--border)'}}>
              <h3 style={{margin:'0 0 10px',color:'var(--primary)'}}>Ethical Approval</h3>
              <p style={{margin:0,color:'var(--text-muted)',lineHeight:1.7,fontSize:14}}>
                Approved by the <strong>Medical Research Ethics Committee (MREC #3938)</strong>, College of Medicine and Health Sciences, Sultan Qaboos University · Reference SQU-EC/096/2026 · Approved 10 May 2026.
              </p>
            </div>
            <div style={{background:'white',padding:24,borderRadius:12,border:'1px solid var(--border)'}}>
              <h3 style={{margin:'0 0 10px',color:'var(--primary)'}}>Funding</h3>
              <p style={{margin:0,color:'var(--text-muted)',lineHeight:1.7,fontSize:14}}>
                Funded by the <strong>Sultan Qaboos University Medical Research Council</strong> (grant ET/DVC/MRC/24/08 · 6,000 OMR). The funder has no role in study design, data analysis, or manuscript preparation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ─────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container" style={{maxWidth:820,textAlign:'center'}}>
          <h2 style={{color:'var(--primary)',fontFamily:'var(--font-serif)',marginBottom:12}}>Questions About the Study?</h2>
          <p style={{color:'var(--text-muted)',marginBottom:20}}>Contact the research team for enrollment inquiries or collaboration.</p>
          <div style={{display:'flex',gap:10,flexWrap:'wrap',justifyContent:'center'}}>
            <a href="mailto:mrawahi@squ.edu.om" className="btn btn-primary">Email PI (Dr. Al Rawahi)</a>
            <a href="mailto:alalawi2@squ.edu.om" className="btn btn-outline">Email Research Lead</a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
