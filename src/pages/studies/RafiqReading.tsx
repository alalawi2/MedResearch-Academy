import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';

export default function RafiqReading() {
  return (
    <Layout>
      {/* Hero */}
      <section style={{background:'linear-gradient(135deg,#1e594a 0%,#0f2847 100%)',color:'white',padding:'80px 0',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,opacity:0.04,backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)',backgroundSize:'40px 40px'}}></div>
        <div className="container" style={{position:'relative',zIndex:1,maxWidth:960}}>
          <Link to="/active-research" style={{color:'rgba(255,255,255,0.75)',fontSize:13,textDecoration:'none',display:'inline-block',marginBottom:20}}>&larr; Back to Active Research</Link>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:20}}>
            <span style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(59,130,246,0.18)',border:'1px solid rgba(59,130,246,0.4)',borderRadius:50,padding:'5px 16px',fontSize:12,fontWeight:600}}>
              <span style={{width:7,height:7,background:'#3b82f6',borderRadius:'50%',display:'inline-block'}}></span>
              System Development
            </span>
            <span style={{background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.25)',borderRadius:50,padding:'5px 14px',fontSize:12}}>KDA Innovation Award 2026</span>
          </div>
          <div style={{fontSize:11,fontWeight:700,color:'#d88548',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10}}>Technology Development &amp; Innovation</div>
          <h1 style={{fontSize:'clamp(1.7rem,4.2vw,2.5rem)',marginBottom:14,fontFamily:'var(--font-serif)',lineHeight:1.25}}>
            Rafiq: AI-Powered Arabic Reading Support for Children with Dyslexia
          </h1>
          <p style={{color:'rgba(255,255,255,0.8)',maxWidth:740,fontSize:'1.05rem',lineHeight:1.75,marginBottom:28}}>
            An intelligent Arabic reading error classification and intervention system that analyses reading patterns, identifies dyslexia-associated error profiles, and generates targeted therapeutic activities &mdash; built for the Kuwait Dyslexia Association's Dyslexia AI Innovation Award (December 2026).
          </p>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            <a href="#overview" className="btn btn-accent">Learn More</a>
            <a href="https://github.com/alalawi2/rafiq-reading" target="_blank" rel="noopener noreferrer" className="btn btn-outline-white">View Repository</a>
          </div>
        </div>
      </section>

      {/* Key facts */}
      <section style={{background:'var(--bg-muted)',padding:'40px 0',borderBottom:'1px solid var(--border)'}}>
        <div className="container" style={{maxWidth:1000}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:24}}>
            {([
              ['🧠','25','AI Capabilities'],
              ['📖','6','Arabic Passages'],
              ['🔤','13','Phonological Groups'],
              ['👁','9','Visual Groups'],
              ['📊','7','Error Types'],
              ['✅','42','Automated Tests'],
              ['📄','2,952','Lines of Code'],
              ['🌐','9','App Pages'],
            ] as [string,string,string][]).map(([icon,num,label]) => (
              <div key={label} style={{textAlign:'center'}}>
                <div style={{fontSize:28,marginBottom:6}}>{icon}</div>
                <div style={{fontSize:'1.5rem',fontWeight:700,fontFamily:'var(--font-serif)',color:'var(--primary)'}}>{num}</div>
                <div style={{fontSize:12,color:'var(--text-muted)'}}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section id="overview" className="section">
        <div className="container" style={{maxWidth:860}}>
          <h2 style={{fontSize:'1.8rem',color:'var(--primary)',marginBottom:20}}>Problem Statement</h2>
          <p style={{color:'var(--text-muted)',marginBottom:16,lineHeight:1.8,fontSize:'1.02rem'}}>
            Dyslexia affects <strong style={{color:'var(--text)'}}>5-7% of the global population</strong>, with prevalence studies in Kuwait showing <strong style={{color:'var(--text)'}}>6.29% of primary school children</strong> affected (Al-Qatami, Kuwait Dyslexia Association). In the Arabic-speaking world, teachers and specialists lack technology tools that can differentiate between phonological, visual, orthographic, and morphological reading errors &mdash; a critical distinction for targeted intervention.
          </p>
          <p style={{color:'var(--text-muted)',marginBottom:16,lineHeight:1.8,fontSize:'1.02rem'}}>
            Existing tools (Microsoft Reading Progress, Google Read Along, Lexia Core5) are designed for English and do not account for <strong style={{color:'var(--text)'}}>Arabic script complexity</strong>: letter joining, diacritical marks (tashkeel), right-to-left rendering, emphatic consonant pairs (e.g., &#x0637;/&#x062A;, &#x0635;/&#x0633;), and visually similar dot-differentiated letters (e.g., &#x0628;/&#x062A;/&#x062B;/&#x0646;).
          </p>
          <p style={{color:'var(--text-muted)',lineHeight:1.8,fontSize:'1.02rem'}}>
            There is no Arabic-first AI system that classifies reading errors by type, scores dyslexia-associated risk patterns, and recommends evidence-based therapeutic activities based on the specific error profile.
          </p>
        </div>
      </section>

      {/* AI Architecture */}
      <section className="section section-muted">
        <div className="container" style={{maxWidth:960}}>
          <h2 style={{fontSize:'1.8rem',color:'var(--primary)',marginBottom:28,textAlign:'center'}}>AI Architecture</h2>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center',marginBottom:32}}>
            {['Arabic Text Input','Speech Transcription (Whisper)','Word Alignment (Edit Distance)','Error Classification (7 Types)','Risk Scoring (5 Factors)','Activity Recommendation','Cross-Session Trends'].map((step,i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{background:'var(--primary)',color:'white',width:26,height:26,borderRadius:'50%',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,flexShrink:0}}>{i+1}</span>
                <span style={{background:'white',border:'1px solid var(--border)',borderRadius:8,padding:'6px 14px',fontSize:12,whiteSpace:'nowrap'}}>{step}</span>
                {i < 6 && <span style={{color:'var(--text-muted)',fontSize:18}}>&rarr;</span>}
              </div>
            ))}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:24}}>
            <div style={{background:'white',borderRadius:16,padding:'28px',border:'1px solid var(--border)'}}>
              <h3 style={{color:'var(--primary)',marginBottom:12,fontSize:'1.15rem'}}>Arabic Phonological Knowledge Base</h3>
              <ul style={{color:'var(--text-muted)',fontSize:14,lineHeight:2,paddingLeft:18}}>
                <li><strong>13 confusion groups</strong> based on articulatory phonetics (emphatic pairs, place/manner of articulation)</li>
                <li><strong>9 visual similarity groups</strong> for dot-differentiated letters</li>
                <li><strong>8 morphological patterns</strong> (Arabic verb/noun templates: &#x0641;&#x064E;&#x0639;&#x064E;&#x0644;&#x064E;, &#x0645;&#x064E;&#x0641;&#x0652;&#x0639;&#x064F;&#x0648;&#x0644;, etc.)</li>
                <li>Minimal-pair bank for interactive drills</li>
              </ul>
            </div>
            <div style={{background:'white',borderRadius:16,padding:'28px',border:'1px solid var(--border)'}}>
              <h3 style={{color:'var(--primary)',marginBottom:12,fontSize:'1.15rem'}}>Error Classification Engine</h3>
              <ul style={{color:'var(--text-muted)',fontSize:14,lineHeight:2,paddingLeft:18}}>
                <li><strong>7 error types:</strong> phonological, visual, orthographic, morphological, lexical, omission, unclassified</li>
                <li>Character-level edit distance with operation tracking</li>
                <li>Confidence scoring per classification (0-1)</li>
                <li>Arabic-specific normalisation (diacritics, tatweel, hamza preservation)</li>
              </ul>
            </div>
            <div style={{background:'white',borderRadius:16,padding:'28px',border:'1px solid var(--border)'}}>
              <h3 style={{color:'var(--primary)',marginBottom:12,fontSize:'1.15rem'}}>Risk Indicator &amp; Trend Analysis</h3>
              <ul style={{color:'var(--text-muted)',fontSize:14,lineHeight:2,paddingLeft:18}}>
                <li><strong>5 weighted risk factors</strong> from dyslexia research (phonological dominance, visual confusion, systematic patterns, error rate, omissions)</li>
                <li>Cross-session trend detection (improving/stable/declining)</li>
                <li>Confusion heatmap (SVG letter matrix)</li>
                <li>Sentence-level difficulty analysis</li>
              </ul>
            </div>
            <div style={{background:'white',borderRadius:16,padding:'28px',border:'1px solid var(--border)'}}>
              <h3 style={{color:'var(--primary)',marginBottom:12,fontSize:'1.15rem'}}>Therapeutic Activities</h3>
              <ul style={{color:'var(--text-muted)',fontSize:14,lineHeight:2,paddingLeft:18}}>
                <li>Sound discrimination drills (minimal pairs)</li>
                <li>Visual letter discrimination exercises</li>
                <li>Morphological awareness (root highlighting)</li>
                <li>Arabic letter tracing (SVG touch canvas, 15 letters)</li>
                <li>GPT-4o-mini exercise &amp; passage generation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Competition */}
      <section className="section">
        <div className="container" style={{maxWidth:860}}>
          <h2 style={{fontSize:'1.8rem',color:'var(--primary)',marginBottom:20}}>Competition &amp; Context</h2>
          <div style={{background:'var(--bg-muted)',borderRadius:16,padding:'32px',border:'1px solid var(--border)',marginBottom:24}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:6}}>Competition</div>
                <div style={{fontSize:15,fontWeight:600,color:'var(--text)'}}>Dyslexia AI Innovation Award 2026</div>
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:6}}>Organiser</div>
                <div style={{fontSize:15,fontWeight:600,color:'var(--text)'}}>Kuwait Dyslexia Association (KDA)</div>
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:6}}>Conference</div>
                <div style={{fontSize:15,fontWeight:600,color:'var(--text)'}}>ADC 2026, 13-14 December, Kuwait</div>
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:6}}>Prize Pool</div>
                <div style={{fontSize:15,fontWeight:600,color:'var(--text)'}}>$20,000 USD</div>
              </div>
            </div>
          </div>

          <h3 style={{color:'var(--primary)',marginBottom:12}}>Judging Criteria (100 points)</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12,marginBottom:24}}>
            {[
              ['AI Use & Depth','25','Error classification, risk scoring, adaptive activities, GPT generation'],
              ['Innovation & Originality','20','Arabic-first phonological KB, transparent risk scoring, teacher-controlled'],
              ['Impact & Value','20','Multi-learner, center dashboard, parent reports, PDF exports'],
              ['Scientific Basis','15','Abu-Rabia 2006, Elbeheri 2011, Layes 2021, IDA structured literacy'],
              ['Applicability & Scalability','10','PWA, offline-ready, localStorage, multi-learner profiles'],
              ['UX & Usability','5','Bilingual AR/EN, RTL, accessible, responsive'],
              ['Demo Quality','5','One-click quick demo, complete read-review-plan flow'],
            ].map(([label,weight,detail]) => (
              <div key={label} style={{background:'var(--bg-muted)',borderRadius:10,padding:'16px',border:'1px solid var(--border)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                  <span style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{label}</span>
                  <span style={{background:'var(--primary)',color:'white',borderRadius:50,padding:'2px 10px',fontSize:12,fontWeight:700}}>{weight}</span>
                </div>
                <p style={{fontSize:12,color:'var(--text-muted)',margin:0,lineHeight:1.6}}>{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scientific Basis */}
      <section className="section section-muted">
        <div className="container" style={{maxWidth:860}}>
          <h2 style={{fontSize:'1.8rem',color:'var(--primary)',marginBottom:20}}>Scientific Foundation</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:20}}>
            {[
              {ref:'Abu-Rabia, S. & Taha, H. (2006)',title:'Phonological errors predominate in Arabic dyslexia',journal:'Journal of Psycholinguistic Research',use:'Phonological error classification & risk factor weighting'},
              {ref:'Elbeheri, G. et al. (2011)',title:'Prevalence and nature of dyslexia among Arabic-speaking children',journal:'Dyslexia, 17(2)',use:'Arabic dyslexia prevalence data & error patterns'},
              {ref:'Layes, S. et al. (2021)',title:'Morphological training benefits Arabic reading',journal:'ERIC (EJ1316032)',use:'Morphological awareness activities & word-family exercises'},
              {ref:'Ibrahim, R. (2009)',title:'The cognitive basis of reading in Arabic',journal:'Reading and Writing, 22',use:'Arabic-specific reading difficulty factors'},
              {ref:'International Dyslexia Association',title:'Structured Literacy: Effective instruction for students with dyslexia',journal:'IDA Practice Guidelines',use:'Structured literacy principles for activity design'},
              {ref:'Taha, H. (2013)',title:'Investigating cognitive processes underlying reading in Arabic',journal:'Journal of Literacy Research, 45(1)',use:'Typical vs poor reader comparison data'},
            ].map(r => (
              <div key={r.ref} style={{background:'white',borderRadius:12,padding:'20px',border:'1px solid var(--border)'}}>
                <div style={{fontSize:13,fontWeight:600,color:'var(--text)',marginBottom:4}}>{r.ref}</div>
                <div style={{fontSize:13,color:'var(--text-muted)',marginBottom:4,fontStyle:'italic'}}>{r.title}</div>
                <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:8}}>{r.journal}</div>
                <div style={{fontSize:12,color:'var(--primary)',fontWeight:500}}>Used for: {r.use}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Stack */}
      <section className="section">
        <div className="container" style={{maxWidth:860}}>
          <h2 style={{fontSize:'1.8rem',color:'var(--primary)',marginBottom:20}}>Technical Stack</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16}}>
            {[
              ['AI Engine','955 lines: error classification, risk scoring, trends, predictions, root extraction, sentence analysis'],
              ['Frontend','668 lines: React-style SPA, bilingual AR/EN, RTL, 9 pages, SVG visualisations'],
              ['Server','188 lines: Node.js 22, 6 API endpoints, OpenAI Whisper + GPT integration'],
              ['Reports','172 lines: PDF reports for sessions, parents, and centers'],
              ['Letter Tracing','134 lines: SVG interactive canvas, 15 Arabic letters, touch support'],
              ['Multi-Learner','102 lines: profiles, center dashboard, import/export'],
              ['Tests','42 automated tests covering all AI functions, server security, i18n'],
              ['PWA','Service Worker for offline mode, Web App Manifest, installable'],
            ].map(([title,desc]) => (
              <div key={title} style={{background:'var(--bg-muted)',borderRadius:12,padding:'18px',border:'1px solid var(--border)'}}>
                <div style={{fontSize:13,fontWeight:700,color:'var(--primary)',marginBottom:6}}>{title}</div>
                <div style={{fontSize:12,color:'var(--text-muted)',lineHeight:1.7}}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Limitations & Ethics */}
      <section className="section section-muted">
        <div className="container" style={{maxWidth:860}}>
          <h2 style={{fontSize:'1.8rem',color:'var(--primary)',marginBottom:20}}>Limitations &amp; Ethical Considerations</h2>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
            <div style={{background:'white',borderRadius:16,padding:'24px',border:'1px solid var(--border)'}}>
              <h3 style={{color:'#c0392b',fontSize:'1.05rem',marginBottom:12}}>Current Limitations</h3>
              <ul style={{color:'var(--text-muted)',fontSize:13,lineHeight:2,paddingLeft:18}}>
                <li>Rule-based AI, not trained ML models</li>
                <li>Not validated with children</li>
                <li>No clinical efficacy trials</li>
                <li>Diacritics/pronunciation not assessed from text comparison</li>
                <li>Content needs specialist review before educational use</li>
                <li>No age-normed scores</li>
              </ul>
            </div>
            <div style={{background:'white',borderRadius:16,padding:'24px',border:'1px solid var(--border)'}}>
              <h3 style={{color:'#27ae60',fontSize:'1.05rem',marginBottom:12}}>Design Safeguards</h3>
              <ul style={{color:'var(--text-muted)',fontSize:13,lineHeight:2,paddingLeft:18}}>
                <li>Teacher retains authority over all decisions</li>
                <li>No diagnostic claims anywhere in the system</li>
                <li>Every AI output includes confidence &amp; disclaimer</li>
                <li>No child data collection in prototype</li>
                <li>No tracking, analytics, or persistent server storage</li>
                <li>All data stored locally on device (localStorage)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section">
        <div className="container" style={{maxWidth:860}}>
          <h2 style={{fontSize:'1.8rem',color:'var(--primary)',marginBottom:20}}>Research Team</h2>
          <div style={{background:'var(--bg-muted)',borderRadius:16,padding:'32px',border:'1px solid var(--border)'}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:20}}>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:6}}>Principal Investigator</div>
                <div style={{fontSize:16,fontWeight:700,color:'var(--text)'}}>Dr. Abdullah M. Al Alawi</div>
                <div style={{fontSize:13,color:'var(--text-muted)'}}>BSc, MD, MSc, FRACP, FACP</div>
                <div style={{fontSize:12,color:'var(--text-muted)'}}>MedResearch Academy, Muscat, Oman</div>
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:6}}>Organisation</div>
                <div style={{fontSize:16,fontWeight:700,color:'var(--text)'}}>Bayan AI Technologies LLC</div>
                <div style={{fontSize:13,color:'var(--text-muted)'}}>CR 1658733</div>
                <div style={{fontSize:12,color:'var(--text-muted)'}}>Muscat, Oman</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section section-muted">
        <div className="container" style={{maxWidth:700,textAlign:'center'}}>
          <div style={{fontSize:42,marginBottom:16}}>📖</div>
          <h2 style={{fontSize:'1.6rem',color:'var(--primary)',marginBottom:12,fontFamily:'var(--font-serif)'}}>Follow This Project</h2>
          <p style={{color:'var(--text-muted)',maxWidth:520,margin:'0 auto 24px',fontSize:14,lineHeight:1.7}}>
            Rafiq is under active development for the KDA Dyslexia AI Innovation Award. The system is a research prototype &mdash; not yet validated for clinical or educational use.
          </p>
          <div style={{display:'flex',justifyContent:'center',gap:10,flexWrap:'wrap'}}>
            <a href="/contact" className="btn btn-primary">Contact the PI &rarr;</a>
            <a href="https://github.com/alalawi2/rafiq-reading" target="_blank" rel="noopener noreferrer" className="btn btn-outline">View on GitHub</a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
