import Layout from '../components/Layout';

export default function ActiveResearch() {
  return (
    <Layout>
      <section style={{background:'linear-gradient(135deg,var(--primary) 0%,#0f2847 100%)',color:'white',padding:'80px 0',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,opacity:0.04,backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)',backgroundSize:'40px 40px'}}></div>
        <div className="container" style={{position:'relative',zIndex:1}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(34,197,94,0.15)',border:'1px solid rgba(34,197,94,0.35)',borderRadius:50,padding:'6px 20px',fontSize:13,marginBottom:24}}>
            <span style={{width:8,height:8,background:'#22c55e',borderRadius:'50%',display:'inline-block',animation:'pulse 2s infinite'}}></span>
            Recruiting Now
          </div>
          <h1 style={{fontSize:'clamp(1.8rem,5vw,3rem)',marginBottom:16,fontFamily:'var(--font-serif)'}}>Active Research Studies</h1>
          <p style={{color:'rgba(255,255,255,0.75)',maxWidth:540,margin:'0 auto',fontSize:'1.05rem'}}>Participate in research that shapes medical education policy in Oman and the region.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{maxWidth:900}}>

          {/* Study card */}
          <div style={{background:'white',borderRadius:20,border:'1px solid var(--border)',overflow:'hidden',marginBottom:40,boxShadow:'0 4px 24px rgba(0,0,0,0.07)'}}>
            {/* Header */}
            <div style={{background:'linear-gradient(90deg,#059669,#10b981)',padding:'20px 28px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
              <div>
                <div style={{color:'rgba(255,255,255,0.75)',fontSize:12,marginBottom:4}}>Currently Recruiting · Ethics Approved</div>
                <div style={{color:'white',fontWeight:700,fontSize:'1.05rem'}}>Residency & Parenthood Study</div>
              </div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                <span style={{background:'rgba(255,255,255,0.15)',color:'white',padding:'4px 12px',borderRadius:50,fontSize:12}}>SQU-EC/228/2025</span>
                <span style={{background:'rgba(255,255,255,0.15)',color:'white',padding:'4px 12px',borderRadius:50,fontSize:12}}>MREC #3679</span>
              </div>
            </div>

            <div style={{padding:'36px 40px'}}>
              <h2 style={{fontFamily:'var(--font-serif)',fontSize:'1.8rem',color:'var(--primary)',marginBottom:8,lineHeight:1.3}}>
                Perspectives on Parenthood During Residency Training in Oman
              </h2>
              <p style={{color:'var(--text-muted)',fontSize:14,marginBottom:32,lineHeight:1.7}}>
                A mixed-methods study exploring how residency training affects family planning decisions and the experiences of resident physicians who are also parents — with the goal of informing humane, family-supportive training policies.
              </p>

              {/* Study details grid */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:20,marginBottom:36,padding:'24px',background:'var(--bg-muted)',borderRadius:12}}>
                {[
                  ['Principal Investigator','Dr. Abdullah M. Al Alawi'],
                  ['Co-Principal Investigator','Dr. Fatma Al Mahruqi'],
                  ['Ethics Approval','September 4, 2025'],
                  ['Target Population','IM Residents, Oman'],
                  ['Contact','r2261@resident.omsb.org'],
                  ['Study Type','Mixed-methods'],
                ].map(([label, val]) => (
                  <div key={label as string}>
                    <div style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:4}}>{label as string}</div>
                    <div style={{fontSize:14,fontWeight:600,color:'var(--text)'}}>{val as string}</div>
                  </div>
                ))}
              </div>

              {/* Who can participate */}
              <h3 style={{fontSize:'1.1rem',fontWeight:700,color:'var(--primary)',marginBottom:16}}>Who Can Participate?</h3>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:12,marginBottom:36}}>
                {[
                  ['✅','Currently enrolled in an OMSB residency program in Oman'],
                  ['✅','Any specialty, any year of training'],
                  ['✅','Parents, non-parents, and those planning a family'],
                  ['✅','All genders welcome'],
                ].map(([icon, text]) => (
                  <div key={text as string} style={{display:'flex',gap:10,alignItems:'flex-start',padding:'12px 16px',background:'#f0fdf4',borderRadius:10,border:'1px solid #bbf7d0'}}>
                    <span style={{fontSize:16,flexShrink:0}}>{icon}</span>
                    <span style={{fontSize:13,color:'#166534',lineHeight:1.5}}>{text as string}</span>
                  </div>
                ))}
              </div>

              {/* Survey embed */}
              <div style={{marginBottom:32}}>
                <h3 style={{fontSize:'1.1rem',fontWeight:700,color:'var(--primary)',marginBottom:8}}>Participate Now — Takes ~10 Minutes</h3>
                <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:16}}>Your responses are anonymous and will directly inform residency training policy in Oman.</p>
                <div style={{borderRadius:16,overflow:'hidden',border:'1px solid var(--border)',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
                  <iframe
                    src="https://docs.google.com/forms/d/e/1FAIpQLSdgdjPhGLefsHkKl4S4C-pOrWOBw9ZZPLRvKlksZuC5ZuV-SQ/viewform?embedded=true"
                    width="100%"
                    height="820"
                    frameBorder="0"
                    marginHeight={0}
                    marginWidth={0}
                    title="Parenthood During Residency Survey"
                    style={{display:'block'}}
                  >
                    Loading survey…
                  </iframe>
                </div>
              </div>

              <div style={{background:'#fef3c7',border:'1px solid #fde68a',borderRadius:12,padding:'16px 20px',display:'flex',gap:12,alignItems:'flex-start'}}>
                <span style={{fontSize:20,flexShrink:0}}>📧</span>
                <div>
                  <div style={{fontWeight:600,fontSize:14,marginBottom:4}}>Questions about this study?</div>
                  <div style={{fontSize:13,color:'var(--text-muted)'}}>Contact the research team at <a href="mailto:r2261@resident.omsb.org" style={{color:'var(--primary)',fontWeight:600}}>r2261@resident.omsb.org</a></div>
                </div>
              </div>
            </div>
          </div>

          {/* Interested in joining future studies? */}
          <div style={{background:'var(--bg-muted)',borderRadius:16,padding:'36px',textAlign:'center',border:'1px solid var(--border)'}}>
            <div style={{fontSize:36,marginBottom:12}}>🔬</div>
            <h3 style={{fontSize:'1.3rem',color:'var(--primary)',marginBottom:8}}>Interested in Joining Future Research?</h3>
            <p style={{color:'var(--text-muted)',maxWidth:480,margin:'0 auto 20px',fontSize:14,lineHeight:1.7}}>MedResearch Academy regularly conducts studies on medical education, clinical practice, and healthcare quality. Get in touch to be notified of future opportunities.</p>
            <a href="/contact" className="btn btn-primary">Contact Us →</a>
          </div>

        </div>
      </section>
    </Layout>
  );
}
