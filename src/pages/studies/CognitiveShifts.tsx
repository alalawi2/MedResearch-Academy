import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';

export default function CognitiveShifts() {
  return (
    <Layout>
      {/* Hero */}
      <section style={{background:'linear-gradient(135deg,var(--primary) 0%,#0f2847 100%)',color:'white',padding:'80px 0',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,opacity:0.04,backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)',backgroundSize:'40px 40px'}}></div>
        <div className="container" style={{position:'relative',zIndex:1,maxWidth:960}}>
          <Link to="/active-research" style={{color:'rgba(255,255,255,0.75)',fontSize:13,textDecoration:'none',display:'inline-block',marginBottom:20}}>&larr; Back to Active Research</Link>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:20}}>
            <span style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(34,197,94,0.18)',border:'1px solid rgba(34,197,94,0.4)',borderRadius:50,padding:'5px 16px',fontSize:12,fontWeight:600}}>
              <span style={{width:7,height:7,background:'#22c55e',borderRadius:'50%',display:'inline-block'}}></span>
              Recruiting
            </span>
            <span style={{background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.25)',borderRadius:50,padding:'5px 14px',fontSize:12}}>OMSB Ethics Approved</span>
          </div>
          <h1 style={{fontSize:'clamp(1.7rem,4.2vw,2.5rem)',marginBottom:14,fontFamily:'var(--font-serif)',lineHeight:1.25}}>
            Comparative Study of Cognitive Effects of 24-Hour and 12-Hour Shifts on OMSB Residents
          </h1>
          <p style={{color:'rgba(255,255,255,0.8)',maxWidth:740,fontSize:'1.05rem',lineHeight:1.75,marginBottom:28}}>
            A prospective cohort study assessing the impact of 24-hour on-call shifts versus 12-hour night shifts on cognitive function (short-term memory and attention) among resident physicians at the Oman Medical Specialty Board, using validated screening instruments and objective wearable sleep tracking.
          </p>
        </div>
      </section>

      {/* Key facts */}
      <section style={{background:'var(--bg-muted)',padding:'40px 0',borderBottom:'1px solid var(--border)'}}>
        <div className="container" style={{maxWidth:1000}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:24}}>
            {[
              ['\u{1F9E0}','128','Target Participants'],
              ['\u{1F3E5}','2 Groups','24hr On-call vs 12hr Night'],
              ['\u{231B}','Pre & Post','Repeated Assessments'],
              ['\u{1F4CA}','9+','Validated Instruments'],
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

      {/* Background */}
      <section className="section">
        <div className="container" style={{maxWidth:860}}>
          <h2 style={{fontSize:'1.8rem',color:'var(--primary)',marginBottom:20}}>Background & Rationale</h2>
          <p style={{color:'var(--text-muted)',marginBottom:16,lineHeight:1.8,fontSize:'1.02rem'}}>
            Shift work is an integral part of the modern healthcare workforce. Studies show that night shifts are associated with increased oxidative stress, circadian rhythm disruption, and elevated risk of chronic diseases. Among healthcare workers, night shifts can lead to immediate cognitive impairments in <strong style={{color:'var(--text)'}}>memory, attention, and decision-making</strong>.
          </p>
          <p style={{color:'var(--text-muted)',marginBottom:16,lineHeight:1.8,fontSize:'1.02rem'}}>
            Despite well-documented negative effects of shift work, <strong style={{color:'var(--text)'}}>limited data exists</strong> on the relationship between shift work and cognitive functions among healthcare workers in the Omani population. This study is the first to address this gap using a multimodal approach combining cognitive testing, validated psychological instruments, and objective sleep monitoring.
          </p>
        </div>
      </section>

      {/* Objectives */}
      <section className="section section-muted">
        <div className="container" style={{maxWidth:900}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))',gap:24}}>
            <div style={{background:'white',borderRadius:16,padding:'32px',border:'1px solid var(--border)'}}>
              <h3 style={{color:'var(--primary)',marginBottom:16,fontSize:'1.3rem'}}>Primary Objective</h3>
              <p style={{color:'var(--text-muted)',lineHeight:1.7}}>
                Study the effect of 24-hour on-call shift versus 12-hour night shift on cognitive functions (short-term memory and attention) among OMSB residents.
              </p>
            </div>
            <div style={{background:'white',borderRadius:16,padding:'32px',border:'1px solid var(--border)'}}>
              <h3 style={{color:'var(--primary)',marginBottom:16,fontSize:'1.3rem'}}>Secondary Objective</h3>
              <p style={{color:'var(--text-muted)',lineHeight:1.7}}>
                Measure the different types of chronotypes and sleep patterns among OMSB residents, and assess confounders including mental health, burnout, and perceived stress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Study Design */}
      <section className="section">
        <div className="container" style={{maxWidth:900}}>
          <h2 style={{fontSize:'1.8rem',color:'var(--primary)',marginBottom:20}}>Study Design</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:20,marginBottom:32}}>
            <div style={{background:'var(--bg-muted)',borderRadius:12,padding:24,border:'1px solid var(--border)',textAlign:'center'}}>
              <div style={{fontSize:36,marginBottom:8}}>Group 1</div>
              <h4 style={{color:'var(--primary)',marginBottom:8}}>24-Hour On-Call</h4>
              <p style={{color:'var(--text-muted)',fontSize:14}}>64 Pediatrics Residents</p>
            </div>
            <div style={{background:'var(--bg-muted)',borderRadius:12,padding:24,border:'1px solid var(--border)',textAlign:'center'}}>
              <div style={{fontSize:36,marginBottom:8}}>Group 2</div>
              <h4 style={{color:'var(--primary)',marginBottom:8}}>12-Hour Night Shift</h4>
              <p style={{color:'var(--text-muted)',fontSize:14}}>64 Internal Medicine Residents</p>
            </div>
          </div>

          <h3 style={{color:'var(--primary)',marginBottom:16,fontSize:'1.2rem'}}>Procedure</h3>
          <div style={{display:'grid',gap:16}}>
            {[
              ['Pre-Exposure','Complete all baseline surveys, cognitive assessments, and Fitbit setup'],
              ['Exposure','Group 1: 24-hour on-call shift | Group 2: 12-hour night shift'],
              ['Post-Exposure','Repeat cognitive assessments + NASA-TLX workload assessment'],
            ].map(([phase,desc]) => (
              <div key={phase} style={{display:'flex',gap:16,alignItems:'flex-start',background:'var(--bg-muted)',borderRadius:12,padding:'16px 20px',border:'1px solid var(--border)'}}>
                <div style={{background:'var(--primary)',color:'white',borderRadius:8,padding:'6px 14px',fontSize:13,fontWeight:700,whiteSpace:'nowrap'}}>{phase}</div>
                <p style={{color:'var(--text-muted)',fontSize:14,lineHeight:1.6,margin:0}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instruments */}
      <section className="section section-muted">
        <div className="container" style={{maxWidth:900}}>
          <h2 style={{fontSize:'1.8rem',color:'var(--primary)',marginBottom:24}}>Measurement Instruments</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:16}}>
            {[
              {cat:'Cognitive Assessment',items:['TestMyBrain (Forward & Backward Digit Span)','Gradual Sustained Attention Task']},
              {cat:'Sleep & Chronotype',items:['STOP-BANG Questionnaire','Reduced MEQ (rMEQ-5)','Insomnia Severity Index (ISI)','Fitbit Sleep Tracking']},
              {cat:'Mental Health',items:['WHO-5 Well-Being Index','PHQ-9 (Depression)','GAD-7 (Anxiety)']},
              {cat:'Stress & Burnout',items:['Perceived Stress Scale (PSS-10)','Copenhagen Burnout Inventory (CBI)']},
              {cat:'Workload',items:['NASA Task Load Index (NASA-TLX)','Post-shift assessment']},
              {cat:'Demographics',items:['Age, Gender, Specialty, Year','Shift frequency, Sleep hours','Coping mechanisms','Post-shift driving incidents']},
            ].map(({cat,items}) => (
              <div key={cat} style={{background:'white',borderRadius:12,padding:'20px',border:'1px solid var(--border)'}}>
                <h4 style={{color:'var(--primary)',marginBottom:12,fontSize:14,fontWeight:700}}>{cat}</h4>
                <ul style={{margin:0,paddingLeft:18,color:'var(--text-muted)',fontSize:13,lineHeight:1.8}}>
                  {items.map(i => <li key={i}>{i}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Team */}
      <section className="section">
        <div className="container" style={{maxWidth:860}}>
          <h2 style={{fontSize:'1.8rem',color:'var(--primary)',marginBottom:24}}>Research Team</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:20}}>
            {[
              {name:'Dr. Said Al Farsi',role:'Principal Investigator'},
              {name:'Dr. Siham Al Shimli',role:'Co-Principal Investigator'},
              {name:'Prof. Samir Al Adawi',role:'Research Supervisor'},
            ].map(({name,role}) => (
              <div key={name} style={{background:'var(--bg-muted)',borderRadius:12,padding:'24px',border:'1px solid var(--border)',textAlign:'center'}}>
                <div style={{width:56,height:56,background:'var(--primary)',color:'white',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px',fontSize:20,fontWeight:700}}>
                  {name.split(' ').pop()![0]}
                </div>
                <h4 style={{color:'var(--text)',marginBottom:4}}>{name}</h4>
                <p style={{color:'var(--text-muted)',fontSize:13,margin:0}}>{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="section section-muted">
        <div className="container" style={{maxWidth:860}}>
          <h2 style={{fontSize:'1.8rem',color:'var(--primary)',marginBottom:20}}>Eligibility</h2>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
            <div style={{background:'white',borderRadius:12,padding:'24px',border:'1px solid var(--border)'}}>
              <h4 style={{color:'#22c55e',marginBottom:12}}>Inclusion Criteria</h4>
              <ul style={{margin:0,paddingLeft:18,color:'var(--text-muted)',fontSize:14,lineHeight:1.8}}>
                <li>OMSB registered residents (R1-R4)</li>
                <li>Internal Medicine or Pediatrics program</li>
                <li>Working 24-hour or 12-hour shifts</li>
                <li>Direct patient contact</li>
              </ul>
            </div>
            <div style={{background:'white',borderRadius:12,padding:'24px',border:'1px solid var(--border)'}}>
              <h4 style={{color:'#ef4444',marginBottom:12}}>Exclusion Criteria</h4>
              <ul style={{margin:0,paddingLeft:18,color:'var(--text-muted)',fontSize:14,lineHeight:1.8}}>
                <li>Pregnant participants</li>
                <li>Known psychiatric or sleep disorders</li>
                <li>Abnormal baseline cognitive functions</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="section">
        <div className="container" style={{maxWidth:600,textAlign:'center'}}>
          <h2 style={{fontSize:'1.5rem',color:'var(--primary)',marginBottom:12}}>Interested in Participating?</h2>
          <p style={{color:'var(--text-muted)',marginBottom:24,lineHeight:1.7}}>
            If you are an OMSB resident in Internal Medicine or Pediatrics and would like to participate in this study, please reach out to the research team.
          </p>
          <a href="mailto:info@medresearch-academy.om" className="btn btn-primary">Contact Research Team</a>
        </div>
      </section>
    </Layout>
  );
}
