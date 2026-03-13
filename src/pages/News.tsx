import { useState, useMemo } from 'react';
import Layout from '../components/Layout';

const newsItems = [
  {id:17,title:'🚀 Introducing Bayan — Free Medical Board Exam Prep for Residents',date:'March 2026',summary:'MedResearch Academy proudly launches Bayan, a free AI-powered medical board exam preparation platform built specifically for residents in Oman and the region. Bayan features thousands of physician-reviewed clinical vignettes mapped to OMSB, Arab Board, MRCP, ABIM, USMLE, and 10+ other board exams.',link:'https://bayan-med.vercel.app',isBayan:true},
  {id:15,title:'Dr. Abdullah Al Alawi Featured on Oman TV — Nabt Jinan Program',date:'March 2026',summary:'Dr. Abdullah M. Al Alawi was featured as a guest on the Oman TV program "Nabt Jinan" (نبت جنان) during Ramadan 1447H, highlighting inspiring Omani personalities.',link:'https://www.youtube.com/watch?v=SnowxT9f9r4',youtubeId:'SnowxT9f9r4'},
  {id:16,title:'Dr. Abdullah Al Alawi on Oman TV — Taryaq: AI in Medicine',date:'March 2026',summary:'Dr. Al Alawi was featured on Oman TV\'s health program "Taryaq" (ترياق) to discuss the role of Artificial Intelligence in modern medicine.',link:'https://www.youtube.com/watch?v=9NKD_sPF0x8',youtubeId:'9NKD_sPF0x8'},
  {id:14,title:'Dr. Omar Al Taie Wins First Place for Best Scientific Research',date:'December 2025',summary:'Dr. Omar Al Taie was awarded First Place for the best scientific research at the 7th Annual Research Forum of the National Heart Center. His study: "Ten-Year Trends in Cardiac Mortality and Sudden Death in Oman (2014–2023)."',link:'https://x.com/OMSB_OM/status/2005151473563557933'},
  {id:13,title:'Dr. Marwa Al Sharji Presents at International Conference',date:'December 2025',summary:'Dr. Marwa Al Sharji presented a scientific poster at the Emirates International Gastroenterology and Hepatology Conference.',link:'https://x.com/OMSB_OM/status/2005154326424228031'},
  {id:12,title:'Launch of Medad: Revolutionizing Clinical Documentation with AI',date:'December 2025',summary:'The launch of Medad, an AI-powered ambient clinical documentation system designed specifically for Omani healthcare.',link:'https://www.medad.om/',image:'/images/medad_hero.webp'},
  {id:1,title:'Annual Forum for Medical Specialties Highlights Career and Research Pathways',date:'February 2025',summary:'The OMSB organized the Annual Forum for Career Guidance and Scientific Research 2025/2026 at the Oman Convention and Exhibition Centre.',link:'https://www.omandaily.om',image:'/images/news-omsb.jpg'},
  {id:4,title:'UMC Congratulates Dr. Aisha Al Huraizi and Team on National Research Award',date:'December 2024',summary:'The University Medical City congratulated Dr. Aisha Al Huraizi and her research team, led by Dr. Abdullah Al Alawi, for winning the National Research Award.',link:'https://x.com/UMC_OMAN/status/1866122329937350820',image:'/images/news-umc-award.jpg'},
  {id:5,title:'Internal Medicine Program Organizes Scientific Research Day',date:'October 2025',summary:'The Internal Medicine Program at OMSB organized a "Scientific Research Day" bringing together residents and faculty to present and discuss their scientific research.',link:'https://x.com/OMSB_OM/status/1981972765268967804',image:'/images/news-omsb-internal-med-oct.jpg'},
  {id:8,title:'Dr. Raja Al Farsi Wins National Research Award',date:'December 2023',summary:'The UMC congratulated Dr. Raja Al Farsi for winning the National Research Award for her paper on "Delirium in Patients Admitted to the Internal Medicine Department."',link:'https://x.com/UMC_OMAN/status/1731914315454717976',image:'/images/news-umc-raja-award.jpg'},
];

const parseDate = (d: string) => { const [m,y] = d.split(' '); return new Date(`${m} 1, ${y}`); };

export default function News() {
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(6);

  const filtered = useMemo(() => {
    const sorted = [...newsItems].sort((a,b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());
    if (!search) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(i => i.title.toLowerCase().includes(q) || i.summary.toLowerCase().includes(q));
  }, [search]);

  const displayed = filtered.slice(0, visible);

  return (
    <Layout>
      <section className="page-hero centered">
        <div className="container">
          <h1>Latest News</h1>
          <p>Updates on our activities, achievements, and contributions to the medical research community.</p>
        </div>
      </section>

      <section className="section section-muted" style={{padding:'32px 0'}}>
        <div className="container">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search news..." value={search} onChange={e => { setSearch(e.target.value); setVisible(6); }} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {displayed.length === 0 ? (
            <div className="text-center" style={{padding:'60px 0'}}>
              <p className="text-muted">No news found matching your search.</p>
              <button onClick={() => setSearch('')} className="btn btn-outline" style={{marginTop:16}}>Clear search</button>
            </div>
          ) : (
            <>
              {/* Bayan featured card */}
              {displayed[0]?.isBayan && (
                <div className="bayan-card" style={{marginBottom:32}}>
                  <div className="bayan-glow-1"></div>
                  <div className="bayan-glow-2"></div>
                  <div style={{position:'relative',zIndex:1}}>
                    <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
                      <span className="badge badge-accent">🆕 New Launch</span>
                      <span className="badge badge-green-live"><span style={{width:8,height:8,background:'white',borderRadius:'50%',display:'block'}} className="animate-pulse"></span> Live Now</span>
                      <span className="badge badge-outline" style={{border:'1px solid rgba(255,255,255,0.2)',color:'rgba(255,255,255,0.7)'}}>Free for All Residents</span>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:40,alignItems:'start'}}>
                      <div>
                        <h2 style={{fontFamily:'var(--font-serif)',fontSize:'2rem',color:'white',marginBottom:12}}>Introducing <span style={{color:'var(--accent-light)'}}>Bayan</span></h2>
                        <p style={{color:'rgba(255,255,255,0.7)',marginBottom:16}}>A free AI-powered medical board exam preparation platform built by MedResearch Academy for residents in Oman and the region.</p>
                        <div className="exam-tags" style={{marginBottom:20}}>
                          {['🇴🇲 OMSB','🏥 Arab Board','🇬🇧 MRCP(UK)','🇺🇸 ABIM','🇺🇸 USMLE','🇦🇪 DHA/HAAD','🇶🇦 QCHP','🇸🇦 SMLE','+ more'].map(e => <span key={e} className="exam-tag">{e}</span>)}
                        </div>
                        <a href="https://bayan-med.vercel.app" target="_blank" rel="noopener noreferrer" className="btn btn-accent btn-lg">Try Bayan Free →</a>
                      </div>
                      <div className="bayan-features">
                        {[['🧠','Adaptive Learning','AI adjusts to your level'],['📚','Knowledge Library','Clinical articles'],['🃏','Flashcards','Spaced repetition'],['📈','Analytics','Track your progress'],['📅','Study Planner','Weekly goals'],['🏆','Leaderboard','Compete with peers']].map(([icon,title,desc]) => (
                          <div key={title as string} className="bayan-feature">
                            <div className="icon">{icon}</div>
                            <p>{title}</p>
                            <small>{desc}</small>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="news-grid">
                {displayed.filter(i => !i.isBayan).map(item => (
                  <div className="card" key={item.id}>
                    {item.youtubeId ? (
                      <div style={{position:'relative',paddingBottom:'56.25%',background:'#000'}}>
                        <iframe src={`https://www.youtube.com/embed/${item.youtubeId}`} title={item.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{position:'absolute',inset:0,width:'100%',height:'100%',border:'none'}} />
                      </div>
                    ) : item.image ? (
                      <img src={item.image} alt={item.title} className="card-img" />
                    ) : null}
                    <div className="card-body">
                      <div className="news-date">📅 {item.date}</div>
                      <div className="news-title">{item.title}</div>
                      <div className="news-summary">{item.summary}</div>
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{marginTop:16}}>
                        {item.youtubeId ? '▶ Watch on YouTube' : 'Read More →'}
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {visible < filtered.length && (
                <div className="load-more-wrap">
                  <button className="btn btn-outline" onClick={() => setVisible(v => v + 3)}>Load More News</button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
