import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

const curriculum = [
  {phase:'Phase 1: Research Foundations (Weeks 1–5)',modules:['Research Question Formulation and PICO Framework','Literature Search and Critical Appraisal','Study Designs: Observational vs Interventional','How to Write a Case Report','Ethical Approval and IRB Process']},
  {phase:'Phase 2: Research Methods (Weeks 6–10)',modules:['Sampling, Bias, and Confounding','Data Collection Tools (REDCap, surveys)','Qualitative Research for Clinicians','Introduction to Biostatistics','Hypothesis Testing and P-values']},
  {phase:'Phase 3: Data Analysis (Weeks 11–14)',modules:['Descriptive Statistics and Data Visualization','Introduction to SPSS/R for Medical Research','Common Statistical Tests','Regression Analysis Basics']},
  {phase:'Phase 4: Publication & Advanced Topics (Weeks 15–16)',modules:['Scientific Writing and Paper Structure','Journal Selection and Submission','Peer Review and Revision Process','Research Ethics and Responsible Conduct']},
];

export default function Programs() {
  return (
    <Layout>
      <section className="page-hero centered">
        <div className="container">
          <h1>Our Programs</h1>
          <p>Comprehensive research training designed for medical students, residents, and healthcare professionals at every level.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Virtual Research Series */}
          <div style={{background:'var(--bg-muted)',border:'1px solid var(--border)',borderRadius:16,padding:48,marginBottom:40}}>
            <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:8}}>
              <span style={{fontSize:32}}>🖥️</span>
              <div>
                <span className="badge badge-primary" style={{marginBottom:8,display:'inline-block'}}>Flagship Program</span>
                <h2 style={{fontSize:'2rem',margin:0}}>Virtual Research Series</h2>
              </div>
            </div>
            <p style={{color:'var(--text-muted)',marginBottom:24,fontSize:'1.05rem',maxWidth:720}}>A comprehensive 16-week virtual training program covering the entire research lifecycle. Designed for flexibility, this series brings expert mentorship directly to your screen.</p>
            <div style={{display:'flex',gap:16,flexWrap:'wrap',marginBottom:32}}>
              <span className="badge badge-accent">📅 16 Weeks</span>
              <span className="badge badge-primary">All Levels</span>
              <span className="badge badge-green">🌐 Virtual / Online</span>
            </div>

            <h3 style={{fontSize:'1.3rem',marginBottom:20}}>Curriculum</h3>
            {curriculum.map(c => (
              <div key={c.phase} className="curriculum-phase">
                <h4>{c.phase}</h4>
                <ul>
                  {c.modules.map(m => <li key={m}><span style={{color:'var(--primary)'}}>✓</span>{m}</li>)}
                </ul>
              </div>
            ))}


            {/* ── Upcoming Event ── */}
            <div style={{marginTop:32,marginBottom:8}}>
              <h3 style={{fontSize:'1.1rem',marginBottom:16,color:'var(--primary)'}}>🗓️ Next Upcoming Lecture</h3>
              <div className="event-home-card" style={{marginBottom:0}}>
                <div className="event-home-left">
                  <div className="event-home-date-block">
                    <div className="event-home-month">APR</div>
                    <div className="event-home-day">8</div>
                    <div className="event-home-year">2026</div>
                  </div>
                </div>
                <div className="event-home-center">
                  <div className="event-home-badges">
                    <span className="event-live-badge"><span className="event-live-dot"></span>Tomorrow</span>
                    <span className="event-series-badge">Virtual Research Series</span>
                  </div>
                  <h3 className="event-home-title">AI in Medical Education</h3>
                  <p className="event-home-desc">From global evidence to local implementation — showcasing Bayan, an AI-powered board prep platform. Presented by Dr. Abdullah M. Al Alawi.</p>
                  <div className="event-home-meta">
                    <span>🕗 8:00 PM Muscat (GST)</span>
                    <span>💻 Zoom</span>
                    <span>⏱ 60 min</span>
                    <span>🔑 ID: 864 7984 0360 · PW: 857478</span>
                  </div>
                </div>
                <div className="event-home-right">
                  <a href="https://us02web.zoom.us/j/86479840360?pwd=cl9IYzFAcAb1oIxbZoVbW8GzhxiPOS.1" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    🎥 Join Free →
                  </a>
                  <Link to="/events" className="btn btn-outline" style={{marginTop:10}}>Full Details</Link>
                </div>
              </div>
            </div>

            <div style={{marginTop:24,display:'flex',gap:16,flexWrap:'wrap'}}>
              <Link to="/contact?subject=Virtual Research Series Inquiry" className="btn btn-primary btn-lg">Apply Now →</Link>
              <a href="https://whatsapp.com/channel/0029Vb7YmBo2ER6mtOHgja13" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-lg">Join WhatsApp Channel</a>
            </div>
          </div>

          {/* Workshop Series */}
          <div style={{background:'var(--bg-muted)',border:'1px solid var(--border)',borderRadius:16,padding:48,marginBottom:40}}>
            <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:8}}>
              <span style={{fontSize:32}}>🎓</span>
              <div>
                <h2 style={{fontSize:'2rem',margin:0}}>Focused Workshop Series</h2>
              </div>
            </div>
            <p style={{color:'var(--text-muted)',marginBottom:24,fontSize:'1.05rem',maxWidth:720}}>Intensive single-topic workshops on key research skills including biostatistics, critical appraisal, scientific writing, and data analysis using SPSS and STATA.</p>
            <div style={{display:'flex',gap:16,flexWrap:'wrap',marginBottom:32}}>
              <span className="badge badge-accent">⏱️ Half/Full Day</span>
              <span className="badge badge-primary">All Levels</span>
              <span className="badge badge-green">🏥 In-Person & Virtual</span>
            </div>
            <div className="expertise-grid">
              {[['Biostatistics for Clinicians','From descriptive statistics to regression analysis, tailored for medical professionals.'],
                ['Scientific Writing','Structure, style, and submission strategies for high-impact journals.'],
                ['Critical Appraisal','How to evaluate and interpret medical literature confidently.'],
              ].map(([t,d]) => (
                <div key={t as string} className="expertise-card">
                  <h4 style={{marginBottom:8,fontFamily:'var(--font-sans)',fontSize:'1rem'}}>{t}</h4>
                  <p style={{fontSize:14,color:'var(--text-muted)'}}>{d}</p>
                </div>
              ))}
            </div>
          </div>

          {/* One on One */}
          <div style={{background:'linear-gradient(135deg,var(--primary) 0%,#0d2540 100%)',borderRadius:16,padding:48,color:'white',textAlign:'center'}}>
            <span style={{fontSize:36,display:'block',marginBottom:16}}>🤝</span>
            <h2 style={{fontSize:'2rem',marginBottom:12,color:'white'}}>1-on-1 Research Mentorship</h2>
            <p style={{color:'rgba(255,255,255,0.75)',maxWidth:580,margin:'0 auto 28px',fontSize:'1.05rem'}}>Personalized mentorship sessions with Dr. Al Alawi or Dr. Al Rawahi. From research idea to publication — we guide you every step of the way.</p>
            <Link to="/contact?subject=Research Mentorship Request" className="btn btn-accent btn-lg">Request Mentorship →</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
