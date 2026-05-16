import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';

export default function OHealth() {
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
              Live Platform
            </span>
            <span style={{background:'rgba(200,151,42,0.2)',border:'1px solid rgba(200,151,42,0.5)',borderRadius:50,padding:'5px 14px',fontSize:12,color:'#f5d78e'}}>Open Data Lab 2026</span>
            <span style={{background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.25)',borderRadius:50,padding:'5px 14px',fontSize:12}}>مختبر البيانات المفتوحة</span>
          </div>
          <div style={{fontSize:11,fontWeight:700,color:'var(--accent-light)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10}}>MedResearch Academy Platform</div>
          <h1 style={{fontSize:'clamp(1.7rem,4.2vw,2.5rem)',marginBottom:8,fontFamily:'var(--font-serif)',lineHeight:1.25}}>
            OHealth — Oman Health Intelligence Platform
          </h1>
          <p style={{fontSize:'1.2rem',color:'rgba(255,255,255,0.6)',marginBottom:14,fontFamily:'var(--font-serif)'}}>
            منصة عمان للذكاء الصحي
          </p>
          <div style={{display:'inline-block',background:'rgba(200,151,42,0.18)',border:'1px solid rgba(200,151,42,0.4)',padding:'6px 16px',borderRadius:8,fontSize:13,marginBottom:20}}>
            Built on Oman's Open Government Data | مبني على البيانات الحكومية المفتوحة
          </div>
          <p style={{color:'rgba(255,255,255,0.8)',maxWidth:740,fontSize:'1.05rem',lineHeight:1.75,marginBottom:28}}>
            A comprehensive AI-powered analytics platform that transforms Oman's publicly available health data into actionable intelligence — enabling evidence-based planning, equity monitoring, and predictive capacity management across all 11 governorates.
          </p>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            <a href="https://ohealth.medresearch-academy.om" target="_blank" rel="noopener noreferrer" className="btn btn-accent">Launch OHealth →</a>
            <a href="#features" className="btn btn-outline-white">Explore Features</a>
          </div>
        </div>
      </section>

      {/* ── Key facts strip ───────────────────────────────────────────── */}
      <section style={{background:'var(--bg-muted)',padding:'40px 0',borderBottom:'1px solid var(--border)'}}>
        <div className="container" style={{maxWidth:1000}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:24}}>
            {([
              ['\u{1F3E5}','98','Hospitals Analyzed'],
              ['\u{1F6CF}\uFE0F','9,706','Hospital Beds Tracked'],
              ['\u{1F5FA}\uFE0F','11','Governorates Mapped'],
              ['\u{1F465}','5.36M','Population Covered'],
              ['\u{1F9EA}','27','Diseases Monitored'],
              ['\u{1F4C8}','10 Years','of Trend Data'],
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

      {/* ── About Section ─────────────────────────────────────────────── */}
      <section id="about" className="section">
        <div className="container" style={{maxWidth:860}}>
          <h2 style={{fontSize:'1.8rem',color:'var(--primary)',marginBottom:20}}>What is OHealth?</h2>
          <p style={{color:'var(--text-muted)',marginBottom:16,lineHeight:1.8,fontSize:'1.02rem'}}>
            OHealth is the first platform to integrate Oman's open government health and population datasets into a single, interactive intelligence layer. It combines data from the <strong style={{color:'var(--text)'}}>National Centre for Statistics and Information (NCSI)</strong>, Ministry of Health annual reports, and demographic projections to provide real-time insights for health planning.
          </p>
          <p style={{color:'var(--text-muted)',marginBottom:16,lineHeight:1.8,fontSize:'1.02rem'}}>
            <strong style={{color:'var(--text)'}}>Why it matters:</strong> Oman's health infrastructure is rapidly expanding, yet planning decisions are often made with fragmented data spread across PDF reports and static tables. OHealth transforms this scattered data into interactive visualizations, predictive models, and equity analyses — making it possible to identify gaps <em>before</em> they become crises.
          </p>
          <p style={{color:'var(--text-muted)',marginBottom:16,lineHeight:1.8,fontSize:'1.02rem'}}>
            <strong style={{color:'var(--text)'}}>Vision 2040 Alignment:</strong> The platform directly supports Oman Vision 2040's goals for health system efficiency, data-driven governance, and equitable resource distribution. By demonstrating what's possible with open data, OHealth advocates for greater data transparency across all government sectors.
          </p>
        </div>
      </section>

      {/* ── Platform Features ───────────────────────────────────────── */}
      <section id="features" className="section section-muted">
        <div className="container" style={{maxWidth:900}}>
          <h2 style={{fontSize:'1.8rem',color:'var(--primary)',marginBottom:28,textAlign:'center'}}>Platform Features</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:20}}>
            {([
              ['Interactive Health Map', 'Click any governorate for instant health statistics — hospitals, beds, staffing ratios, and population metrics with drill-down to wilayat level.'],
              ['Capacity Predictor', 'AI-powered forecasting engine that projects when hospitals will hit critical occupancy based on population growth trends and historical utilization.'],
              ['Health Equity Atlas', 'Ranks all 11 governorates by healthcare access metrics — bed ratios, physician density, facility distribution — revealing hidden disparities.'],
              ['Disease Surveillance', 'Tracks 27 infectious diseases with year-over-year trends, seasonal patterns, and climate correlation analysis for outbreak preparedness.'],
              ['Governorate Comparator', 'Side-by-side comparison tool with radar charts enabling policymakers to benchmark any two governorates across 12+ health indicators.'],
              ['What-If Simulator', 'Model the impact of population growth, new hospital construction, or resource reallocation on capacity metrics before committing resources.'],
            ] as [string,string][]).map(([title,desc]) => (
              <div key={title} style={{background:'white',borderRadius:12,padding:'24px',border:'1px solid var(--border)'}}>
                <h4 style={{color:'var(--primary)',marginBottom:10,fontSize:'1rem'}}>{title}</h4>
                <p style={{color:'var(--text-muted)',fontSize:13,lineHeight:1.7}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Impact & Findings ─────────────────────────────────────────── */}
      <section className="section">
        <div className="container" style={{maxWidth:900}}>
          <h2 style={{fontSize:'1.8rem',color:'var(--primary)',marginBottom:12,textAlign:'center'}}>Key Findings & Impact</h2>
          <p style={{color:'var(--text-muted)',textAlign:'center',marginBottom:28,fontSize:14}}>Insights surfaced by OHealth from Oman's open health data</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:20}}>
            {([
              ['4 hospitals projected to exceed capacity by 2028', 'Based on population growth trajectories and current bed counts'],
              ['Al Batinah South: lowest bed ratio — 4.4 per 10,000', 'Significantly below the national average, flagging underinvestment'],
              ['6 governorates have zero private hospital beds', 'Complete reliance on public sector for inpatient care'],
              ['Food poisoning surged 166% in 2 years', 'Identified from disease surveillance trend analysis'],
            ] as [string,string][]).map(([finding,detail]) => (
              <div key={finding} style={{background:'var(--bg-muted)',borderRadius:12,padding:'20px',border:'1px solid var(--border)',borderLeft:'4px solid var(--accent)'}}>
                <div style={{fontWeight:700,fontSize:14,color:'var(--text)',marginBottom:6}}>{finding}</div>
                <div style={{fontSize:12,color:'var(--text-muted)',lineHeight:1.6}}>{detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Data Sources ──────────────────────────────────────────────── */}
      <section className="section section-muted">
        <div className="container" style={{maxWidth:860}}>
          <h2 style={{fontSize:'1.8rem',color:'var(--primary)',marginBottom:24}}>Data Sources</h2>
          <p style={{color:'var(--text-muted)',marginBottom:20,lineHeight:1.8,fontSize:'1.02rem'}}>
            OHealth is built entirely on <strong style={{color:'var(--text)'}}>publicly available open government data</strong> — demonstrating that transformative health intelligence can be derived from existing national datasets without requiring new data collection.
          </p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:20}}>
            {([
              ['NCSI Data Portal — OMHLTH2016', 'Official health statistics dataset covering hospitals, beds, staffing, and disease incidence across all governorates', 'https://data.gov.om'],
              ['NCSI Data Portal — OMPOP2016', 'Population and demographic projections by governorate, nationality, and age group', 'https://data.gov.om'],
              ['NCSI Statistical Yearbook 2026', 'Issue 54 — comprehensive annual statistics including health chapter with facility-level data', 'https://www.ncsi.gov.om'],
              ['Ministry of Health Annual Reports', 'Detailed epidemiological data, disease notifications, and health service utilization statistics', 'https://www.moh.gov.om'],
            ] as [string,string,string][]).map(([title,desc,url]) => (
              <div key={title} style={{background:'white',borderRadius:12,padding:'20px',border:'1px solid var(--border)'}}>
                <h4 style={{color:'var(--primary)',marginBottom:8,fontSize:'0.9rem'}}>{title}</h4>
                <p style={{color:'var(--text-muted)',fontSize:12,lineHeight:1.6,marginBottom:10}}>{desc}</p>
                <a href={url} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:'var(--accent)',textDecoration:'none',fontWeight:600}}>{url} ↗</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Competition Context ───────────────────────────────────────── */}
      <section className="section">
        <div className="container" style={{maxWidth:860}}>
          <h2 style={{fontSize:'1.8rem',color:'var(--primary)',marginBottom:20}}>Competition Context</h2>
          <div style={{background:'var(--bg-muted)',borderRadius:16,padding:'32px',border:'1px solid var(--border)'}}>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:20}}>
              <span style={{background:'rgba(200,151,42,0.15)',color:'var(--accent)',border:'1px solid rgba(200,151,42,0.3)',borderRadius:50,padding:'5px 14px',fontSize:12,fontWeight:600}}>مختبر البيانات المفتوحة 2026</span>
              <span style={{background:'rgba(34,197,94,0.1)',color:'#16a34a',border:'1px solid rgba(34,197,94,0.3)',borderRadius:50,padding:'5px 14px',fontSize:12,fontWeight:600}}>Open Data Lab 2026</span>
            </div>
            <p style={{color:'var(--text-muted)',marginBottom:16,lineHeight:1.8,fontSize:'1.02rem'}}>
              OHealth was developed for <strong style={{color:'var(--text)'}}>مختبر البيانات المفتوحة (Open Data Lab 2026)</strong>, organized by <strong style={{color:'var(--text)'}}>وزارة النقل والاتصالات وتقنية المعلومات (MTCIT)</strong> — the Ministry of Transport, Communications and Information Technology of the Sultanate of Oman.
            </p>
            <p style={{color:'var(--text-muted)',marginBottom:16,lineHeight:1.8,fontSize:'1.02rem'}}>
              <strong style={{color:'var(--text)'}}>Category:</strong> Best Application/System Built on Open Data
            </p>
            <p style={{color:'var(--text-muted)',lineHeight:1.8,fontSize:'1.02rem'}}>
              The platform demonstrates how Oman's open government data can be transformed into actionable health intelligence — enabling evidence-based resource allocation, equity monitoring, and predictive planning without requiring any new data infrastructure or collection processes.
            </p>
          </div>
        </div>
      </section>

      {/* ── Technology ────────────────────────────────────────────────── */}
      <section className="section section-muted">
        <div className="container" style={{maxWidth:860}}>
          <h2 style={{fontSize:'1.8rem',color:'var(--primary)',marginBottom:24}}>Technology & Methodology</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:20}}>
            <div style={{background:'white',borderRadius:12,padding:'24px',border:'1px solid var(--border)'}}>
              <div style={{fontSize:10,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:8}}>Data Pipeline</div>
              <p style={{color:'var(--text-muted)',fontSize:14,lineHeight:1.7}}>
                Automated ETL from NCSI open data APIs and statistical yearbooks. Data is cleaned, normalized, and cross-validated across multiple sources for accuracy.
              </p>
            </div>
            <div style={{background:'white',borderRadius:12,padding:'24px',border:'1px solid var(--border)'}}>
              <div style={{fontSize:10,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:8}}>AI & Prediction</div>
              <p style={{color:'var(--text-muted)',fontSize:14,lineHeight:1.7}}>
                Time-series forecasting models for capacity prediction. Anomaly detection for disease surveillance. Regression analysis for equity scoring across governorates.
              </p>
            </div>
            <div style={{background:'white',borderRadius:12,padding:'24px',border:'1px solid var(--border)'}}>
              <div style={{fontSize:10,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:8}}>Visualization</div>
              <p style={{color:'var(--text-muted)',fontSize:14,lineHeight:1.7}}>
                Interactive choropleth maps, radar charts, trend lines, and comparison dashboards — all designed for non-technical decision makers in health planning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Footer ────────────────────────────────────────────────── */}
      <section className="section" style={{textAlign:'center'}}>
        <div className="container" style={{maxWidth:700}}>
          <div style={{fontSize:48,marginBottom:16}}>🇴🇲</div>
          <h2 style={{fontSize:'1.8rem',color:'var(--primary)',marginBottom:12,fontFamily:'var(--font-serif)'}}>Explore Oman's Health Data</h2>
          <p style={{color:'var(--text-muted)',marginBottom:28,lineHeight:1.8}}>
            OHealth is live and free to use. Explore interactive maps, run capacity forecasts, compare governorates, and discover insights from Oman's open government health data.
          </p>
          <div style={{display:'flex',justifyContent:'center',gap:12,flexWrap:'wrap'}}>
            <a href="https://ohealth.medresearch-academy.om" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg">Launch OHealth →</a>
            <Link to="/active-research" className="btn btn-outline btn-lg">← All Research</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
