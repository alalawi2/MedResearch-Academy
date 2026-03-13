import Layout from '../components/Layout';

export default function WallOfImpact() {
  return (
    <Layout>
      <section style={{background:'linear-gradient(135deg,var(--primary) 0%,#0f2847 100%)',color:'white',padding:'96px 0',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,opacity:0.04,backgroundImage:'radial-gradient(circle, white 1px, transparent 1px)',backgroundSize:'40px 40px'}}></div>
        <div className="container" style={{position:'relative',zIndex:1}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(200,151,42,0.2)',border:'1px solid rgba(200,151,42,0.4)',borderRadius:50,padding:'6px 20px',fontSize:13,marginBottom:24}}>🏆 Wall of Impact</div>
          <h1 style={{fontSize:'clamp(2rem,5vw,3.5rem)',marginBottom:16,fontFamily:'var(--font-serif)'}}>Stories That Change Lives</h1>
          <p style={{color:'rgba(255,255,255,0.75)',maxWidth:560,margin:'0 auto',fontSize:'1.1rem'}}>Behind every breakthrough is a clinician who asked <em>"Why?"</em> — and had the courage to find out.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{maxWidth:900}}>

          {/* Dr. Salim */}
          <div style={{background:'white',borderRadius:20,border:'1px solid var(--border)',overflow:'hidden',marginBottom:48,boxShadow:'0 4px 24px rgba(0,0,0,0.07)'}}>
            <div style={{background:'linear-gradient(90deg,var(--primary),#2d5f8a)',padding:'20px 28px',display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontSize:28}}>🏥</span>
              <div>
                <div style={{color:'rgba(255,255,255,0.7)',fontSize:12,marginBottom:2}}>Alumni Success Story</div>
                <div style={{color:'white',fontWeight:700,fontSize:'1.1rem'}}>Dr. Salim Al Busaidi — From Night Call to National Policy</div>
              </div>
            </div>
            <div style={{padding:'36px 40px'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:32,alignItems:'start'}}>
                <div>
                  <img src="/images/dr_salim_profile.jpg" alt="Dr. Salim Al Busaidi" style={{width:'100%',borderRadius:12,marginBottom:12,objectFit:'cover',aspectRatio:'1',display:'block'}} onError={e=>(e.currentTarget.style.display='none')} />
                  <img src="/images/dr_salim_presentation.jpg" alt="Dr. Salim Presenting" style={{width:'100%',borderRadius:12,objectFit:'cover',display:'block'}} onError={e=>(e.currentTarget.style.display='none')} />
                </div>
                <div>
                  <h2 style={{fontFamily:'var(--font-serif)',fontSize:'1.8rem',color:'var(--primary)',marginBottom:4}}>Dr. Salim Al Busaidi</h2>
                  <p style={{color:'var(--text-muted)',fontSize:14,marginBottom:28}}>Specialist Physician, SQUH · Currently: Acute Care Fellow, Australia</p>

                  {[
                    ['🔍','The Spark','An on-call night. A death certificate. A single cause of death assigned from fragmented data. Dr. Salim paused and asked: <em>How accurate is our national mortality data?</em> That question changed everything.'],
                    ['📊','The Research','He launched a retrospective study at SQUH investigating discrepancies in cause-of-death documentation. His findings were published in the <strong>Journal of Forensic and Legal Medicine (Q1)</strong> and supported by national research funding.'],
                    ['🌍','The Impact','His work catalysed a flagship national workshop co-organised with the WHO, MOH, and OMSB — aligning Oman\'s mortality reporting with international standards. It also seeded a national online training platform for physicians, strengthening the evidence base for public health policy.'],
                  ].map(([icon, title, body]) => (
                    <div key={title as string} style={{marginBottom:24,paddingBottom:24,borderBottom:'1px solid var(--border)'}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                        <span style={{fontSize:18}}>{icon}</span>
                        <h3 style={{fontSize:'1rem',fontWeight:700,color:'var(--primary)',margin:0}}>{title as string}</h3>
                      </div>
                      <p style={{fontSize:14,color:'var(--text-muted)',lineHeight:1.8,margin:0}} dangerouslySetInnerHTML={{__html: body as string}} />
                    </div>
                  ))}

                  <div style={{background:'var(--bg-muted)',borderLeft:'4px solid var(--accent)',padding:'16px 20px',borderRadius:'0 12px 12px 0',marginBottom:20}}>
                    <p style={{fontSize:14,fontStyle:'italic',color:'var(--text)',margin:0,lineHeight:1.7}}>"This shows how a single clinical observation, pursued with rigor, can reshape national health infrastructure."</p>
                  </div>

                  <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
                    <a href="https://mjournal.squ.edu.om/home/vol25/iss1/36/" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">View SQUMJ Publication →</a>
                    <span style={{background:'rgba(26,58,92,0.08)',color:'var(--primary)',padding:'6px 14px',borderRadius:50,fontSize:12,fontWeight:600,display:'flex',alignItems:'center'}}>📄 Forensic &amp; Legal Medicine (Q1)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dr. Fatma */}
          <div style={{background:'white',borderRadius:20,border:'1px solid var(--border)',overflow:'hidden',marginBottom:48,boxShadow:'0 4px 24px rgba(0,0,0,0.07)'}}>
            <div style={{background:'linear-gradient(90deg,#7c3aed,#9f67f5)',padding:'20px 28px',display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontSize:28}}>🏆</span>
              <div>
                <div style={{color:'rgba(255,255,255,0.7)',fontSize:12,marginBottom:2}}>Alumni Success Story</div>
                <div style={{color:'white',fontWeight:700,fontSize:'1.1rem'}}>Dr. Fatma Al Shamsi — 1st Place to International Stage</div>
              </div>
            </div>
            <div style={{padding:'36px 40px'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:32,alignItems:'start'}}>
                <div>
                  <img src="/images/dr_fatma_award_full.jpeg" alt="Dr. Fatma Al Shamsi receiving award" style={{width:'100%',borderRadius:12,objectFit:'cover',display:'block',marginBottom:12}} onError={e=>(e.currentTarget.style.display='none')} />
                  <img src="/images/dr_fatma_qr.png" alt="Scan to see more" style={{width:'100%',borderRadius:12,objectFit:'contain',display:'block'}} onError={e=>(e.currentTarget.style.display='none')} />
                </div>
                <div>
                  <h2 style={{fontFamily:'var(--font-serif)',fontSize:'1.8rem',color:'#7c3aed',marginBottom:4}}>Dr. Fatma Al Shamsi</h2>
                  <p style={{color:'var(--text-muted)',fontSize:14,marginBottom:28}}>Internal Medicine Resident, SQUH</p>

                  {[
                    ['💡','The Question','While caring for elderly patients with advanced dementia, Dr. Fatma questioned the routine use of feeding tubes — a common intervention with mounting evidence of harm over benefit. She decided to investigate the evidence and local practice patterns systematically.'],
                    ['🔬','The Work','She designed and conducted a rigorous clinical study examining feeding tube use in dementia patients at SQUH, critically appraising the evidence and local patterns against international guidelines.'],
                    ['🥇','The Recognition','Her research earned <strong>1st Place at the Royal Hospital Research Day</strong> — the most competitive internal medicine research platform in Oman. It then brought her to the <strong>ACP Internal Medicine Meeting 2025 in New Orleans</strong>, where she presented to an international audience.'],
                  ].map(([icon, title, body]) => (
                    <div key={title as string} style={{marginBottom:24,paddingBottom:24,borderBottom:'1px solid var(--border)'}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                        <span style={{fontSize:18}}>{icon}</span>
                        <h3 style={{fontSize:'1rem',fontWeight:700,color:'#7c3aed',margin:0}}>{title as string}</h3>
                      </div>
                      <p style={{fontSize:14,color:'var(--text-muted)',lineHeight:1.8,margin:0}} dangerouslySetInnerHTML={{__html: body as string}} />
                    </div>
                  ))}

                  <div style={{background:'#f5f3ff',borderLeft:'4px solid #7c3aed',padding:'16px 20px',borderRadius:'0 12px 12px 0',marginBottom:20}}>
                    <p style={{fontSize:14,fontStyle:'italic',color:'var(--text)',margin:0,lineHeight:1.7}}>"From a ward observation in Muscat to an international podium in New Orleans — this is what happens when residents are supported to think like researchers."</p>
                  </div>

                  <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
                    <a href="https://www.instagram.com/p/DCWuAxMooNI/" target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{background:'#7c3aed',color:'white'}}>View on Instagram →</a>
                    <span style={{background:'rgba(124,58,237,0.08)',color:'#7c3aed',padding:'6px 14px',borderRadius:50,fontSize:12,fontWeight:600,display:'flex',alignItems:'center'}}>🏆 ACP 2025 · New Orleans</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Global reach CTA */}
          <div style={{background:'linear-gradient(135deg,var(--primary),#0f2847)',borderRadius:20,padding:'52px 40px',textAlign:'center',color:'white'}}>
            <div style={{fontSize:48,marginBottom:16}}>🌍</div>
            <h2 style={{fontFamily:'var(--font-serif)',fontSize:'2rem',marginBottom:12}}>Your Story Could Be Next</h2>
            <p style={{color:'rgba(255,255,255,0.75)',maxWidth:500,margin:'0 auto 28px',lineHeight:1.7}}>Join MedResearch Academy's programs and get the mentorship, skills, and community to take your clinical question all the way to publication — and beyond.</p>
            <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap'}}>
              <a href="/programs" className="btn btn-accent btn-lg">Explore Our Programs</a>
              <a href="/contact" className="btn btn-lg" style={{background:'rgba(255,255,255,0.1)',color:'white',border:'1px solid rgba(255,255,255,0.3)'}}>Contact Us</a>
            </div>
          </div>

        </div>
      </section>
    </Layout>
  );
}
