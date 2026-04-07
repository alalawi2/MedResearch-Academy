import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      <section className="hero">
        <div className="container">
          <div className="hero-inner">
            <div className="animate-in">
              <div className="hero-badge"><span></span>Research Training & Education</div>
              <h1>Empowering the Next Generation of <em>Medical Researchers</em></h1>
              <p>MedResearch Academy is a premier platform dedicated to spreading research knowledge, fostering innovation, and building research capacity in Oman and beyond. Led by Dr. Abdullah M. Al Alawi and Dr. Mohamed Al Rawahi.</p>
              <div className="hero-btns">
                <Link to="/programs" className="btn btn-accent btn-lg">Explore Programs →</Link>
                <Link to="/about" className="btn btn-outline-white btn-lg">Our Mission</Link>
              </div>
            </div>
            <div className="hero-images">
              <div className="hero-img-wrapper primary">
                <img src="/images/dr-alawi.jpg" alt="Dr. Abdullah M. Al Alawi" />
                <div className="hero-label">Dr. Abdullah Al Alawi</div>
              </div>
              <div className="hero-img-wrapper secondary">
                <img src="/mohamed-alrawahi.png" alt="Dr. Mohamed Al Rawahi" />
                <div className="hero-label">Dr. Mohamed Al Rawahi</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            {[['📚','50+','Students Mentored'],['👥','200+','Workshops'],['🔬','20+','Research Projects'],['🏆','20+','Research Grants']].map(([icon,num,label]) => (
              <div className="stat-item" key={label}>
                <div className="stat-icon">{icon}</div>
                <div className="stat-number">{num}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose MedResearch Academy?</h2>
            <p>We provide comprehensive training in research methodology, biostatistics, and scientific writing. Our programs are designed for medical students, residents, and healthcare professionals who want to excel in academic medicine.</p>
          </div>
          <div className="expertise-grid">
            {[
              ['Research Training','Structured programs covering the full research lifecycle from question formulation to publication.'],
              ['Expert Mentorship','Direct guidance from experienced researchers with international fellowships and awards.'],
              ['Open Access Resources','Free access to clinical calculators, guides, and educational materials for all healthcare professionals.'],
            ].map(([title, desc]) => (
              <div className="expertise-card" key={title as string}>
                <h3 style={{marginBottom:8,fontSize:'1.1rem'}}>{title}</h3>
                <p style={{fontSize:14,color:'var(--text-muted)'}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── News Ticker Strip ── */}
      <div className="news-ticker-wrap">
        <div className="news-ticker-inner">
          <span className="ticker-label">📰 NEWS</span>
          <div className="ticker-track">
            <div className="ticker-animate">
              {[
                {text:'🚀 Introducing Bayan — Free AI Medical Board Exam Prep for Residents', date:'Mar 2026', link:'https://www.bayan.edu.om'},
                {text:'📺 Dr. Al Alawi Featured on Oman TV — Nabt Jinan Program', date:'Mar 2026', link:'https://www.youtube.com/watch?v=SnowxT9f9r4'},
                {text:'📺 Dr. Al Alawi on Oman TV — Taryaq: AI in Medicine', date:'Mar 2026', link:'https://www.youtube.com/watch?v=9NKD_sPF0x8'},
                {text:'🏆 Dr. Omar Al Taie Wins First Place — National Heart Center Research Forum', date:'Dec 2025', link:'https://x.com/OMSB_OM/status/2005151473563557933'},
                {text:'🚀 Launch of Medad: AI Clinical Documentation for Omani Healthcare', date:'Dec 2025', link:'https://www.medad.om/'},
                {text:'🏆 UMC Congratulates Dr. Aisha Al Huraizi Team on National Research Award', date:'Dec 2024', link:'https://x.com/UMC_OMAN/status/1866122329937350820'},
              ].concat([
                {text:'🚀 Introducing Bayan — Free AI Medical Board Exam Prep for Residents', date:'Mar 2026', link:'https://www.bayan.edu.om'},
                {text:'📺 Dr. Al Alawi Featured on Oman TV — Nabt Jinan Program', date:'Mar 2026', link:'https://www.youtube.com/watch?v=SnowxT9f9r4'},
                {text:'📺 Dr. Al Alawi on Oman TV — Taryaq: AI in Medicine', date:'Mar 2026', link:'https://www.youtube.com/watch?v=9NKD_sPF0x8'},
                {text:'🏆 Dr. Omar Al Taie Wins First Place — National Heart Center Research Forum', date:'Dec 2025', link:'https://x.com/OMSB_OM/status/2005151473563557933'},
                {text:'🚀 Launch of Medad: AI Clinical Documentation for Omani Healthcare', date:'Dec 2025', link:'https://www.medad.om/'},
                {text:'🏆 UMC Congratulates Dr. Aisha Al Huraizi Team on National Research Award', date:'Dec 2024', link:'https://x.com/UMC_OMAN/status/1866122329937350820'},
              ]).map((item, i) => (
                <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="ticker-item">
                  <span className="ticker-dot"></span>
                  <span className="ticker-text">{item.text}</span>
                  <span className="ticker-date">{item.date}</span>
                </a>
              ))}
            </div>
          </div>
          <Link to="/news" className="ticker-all-link">All News →</Link>
        </div>
      </div>


      {/* ── Upcoming Event ── */}
      <section className="section" style={{paddingBottom:8}}>
        <div className="container">
          <div className="section-header">
            <h2>Upcoming Event</h2>
            <p>Join us for our next free virtual lecture — open to all healthcare professionals.</p>
          </div>
          <div className="event-home-card">
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
                <span>🕗 8:00 PM Muscat</span>
                <span>💻 Zoom</span>
                <span>⏱ 60 min</span>
              </div>
            </div>
            <div className="event-home-right">
              <a href="https://us02web.zoom.us/j/86479840360?pwd=cl9IYzFAcAb1oIxbZoVbW8GzhxiPOS.1" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                🎥 Join Free →
              </a>
              <Link to="/events" className="btn btn-outline" style={{marginTop:10}}>View Details</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured News Cards ── */}
      <section className="section section-muted">
        <div className="container">
          <div className="section-header">
            <h2>Latest News</h2>
            <p>Updates on our activities, achievements, and contributions to the medical research community.</p>
          </div>
          <div className="news-grid">
            {[
              {title:'🚀 Introducing Bayan — Free Medical Board Exam Prep',date:'March 2026',summary:'MedResearch Academy proudly launches Bayan, a free AI-powered medical board exam preparation platform for residents in Oman and the region.',link:'https://www.bayan.edu.om', highlight: true},
              {title:'📺 Dr. Al Alawi Featured on Oman TV — Nabt Jinan',date:'March 2026',summary:'Dr. Al Alawi was featured as a guest on the Oman TV program "Nabt Jinan" during Ramadan 1447H, highlighting inspiring Omani personalities.',link:'https://www.youtube.com/watch?v=SnowxT9f9r4'},
              {title:'🏆 Dr. Omar Al Taie Wins First Place — National Heart Center',date:'December 2025',summary:'Dr. Omar Al Taie was awarded First Place for best scientific research at the 7th Annual Research Forum of the National Heart Center.',link:'https://x.com/OMSB_OM/status/2005151473563557933'},
            ].map(item => (
              <div className={`card news-home-card${item.highlight ? ' news-home-card--highlight' : ''}`} key={item.title}>
                <div className="card-body">
                  <div className="news-date">📅 {item.date}</div>
                  <div className="news-title">{item.title}</div>
                  <div className="news-summary">{item.summary}</div>
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{marginTop:16}}>Read More →</a>
                </div>
              </div>
            ))}
          </div>
          <div className="load-more-wrap">
            <Link to="/news" className="btn btn-outline">View All News →</Link>
          </div>
        </div>
      </section>

      <section className="section" style={{background:'var(--primary)',color:'white',textAlign:'center'}}>
        <div className="container" style={{maxWidth:700}}>
          <p style={{fontSize:'1.4rem',fontStyle:'italic',fontFamily:'var(--font-serif)',color:'rgba(255,255,255,0.9)',marginBottom:32,lineHeight:1.6}}>
            "Research is the engine of medical progress. We are here to help you start your engine."
          </p>
          <Link to="/contact" className="btn btn-accent btn-lg">Join Our Community →</Link>
        </div>
      </section>
    </Layout>
  );
}
