import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const newsItems = [
  {id:17,cat:'launch',title:'Introducing Bayan — Free Medical Board Exam Prep for Residents',date:'March 2026',dateSort:'2026-03',summary:'MedResearch Academy proudly launches Bayan, a free AI-powered medical board exam preparation platform built specifically for residents in Oman and the region. Bayan features thousands of physician-reviewed clinical vignettes mapped to OMSB, Arab Board, MRCP, ABIM, USMLE, and 10+ other board exams.',link:'https://bayan-med.vercel.app',isBayan:true,youtubeId:'',image:''},
  {id:15,cat:'media',title:'Dr. Abdullah Al Alawi Featured on Oman TV — Nabt Jinan Program',date:'March 2026',dateSort:'2026-03',summary:'Dr. Abdullah M. Al Alawi was featured as a guest on the Oman TV program Nabt Jinan during Ramadan 1447H, highlighting inspiring Omani personalities.',link:'https://www.youtube.com/watch?v=SnowxT9f9r4',youtubeId:'SnowxT9f9r4',isBayan:false,image:''},
  {id:16,cat:'media',title:'Dr. Abdullah Al Alawi on Oman TV — Taryaq: AI in Medicine',date:'March 2026',dateSort:'2026-03',summary:'Dr. Al Alawi was featured on the Oman TV health program Taryaq to discuss the role of Artificial Intelligence in modern medicine.',link:'https://www.youtube.com/watch?v=9NKD_sPF0x8',youtubeId:'9NKD_sPF0x8',isBayan:false,image:''},
  {id:14,cat:'achievement',title:'Dr. Omar Al Taie Wins First Place for Best Scientific Research',date:'December 2025',dateSort:'2025-12',summary:'Dr. Omar Al Taie was awarded First Place for the best scientific research at the 7th Annual Research Forum of the National Heart Center. His study: Ten-Year Trends in Cardiac Mortality and Sudden Death in Oman (2014-2023).',link:'https://x.com/OMSB_OM/status/2005151473563557933',youtubeId:'',isBayan:false,image:''},
  {id:13,cat:'achievement',title:'Dr. Marwa Al Sharji Presents at International Conference',date:'December 2025',dateSort:'2025-12',summary:'Dr. Marwa Al Sharji presented a scientific poster at the Emirates International Gastroenterology and Hepatology Conference.',link:'https://x.com/OMSB_OM/status/2005154326424228031',youtubeId:'',isBayan:false,image:''},
  {id:12,cat:'launch',title:'Launch of Medad: Revolutionizing Clinical Documentation with AI',date:'December 2025',dateSort:'2025-12',summary:'The launch of Medad, an AI-powered ambient clinical documentation system designed specifically for Omani healthcare.',link:'https://www.medad.om/',image:'/images/medad_hero.webp',youtubeId:'',isBayan:false},
  {id:5,cat:'education',title:'Internal Medicine Program Organizes Scientific Research Day',date:'October 2025',dateSort:'2025-10',summary:'The Internal Medicine Program at OMSB organized a Scientific Research Day bringing together residents and faculty to present and discuss their scientific research.',link:'https://x.com/OMSB_OM/status/1981972765268967804',image:'/images/news-omsb-internal-med-oct.jpg',youtubeId:'',isBayan:false},
  {id:1,cat:'education',title:'Annual Forum for Medical Specialties Highlights Career and Research Pathways',date:'February 2025',dateSort:'2025-02',summary:'The OMSB organized the Annual Forum for Career Guidance and Scientific Research 2025/2026 at the Oman Convention and Exhibition Centre.',link:'https://www.omandaily.om',image:'/images/news-omsb.jpg',youtubeId:'',isBayan:false},
  {id:4,cat:'achievement',title:'UMC Congratulates Dr. Aisha Al Huraizi and Team on National Research Award',date:'December 2024',dateSort:'2024-12',summary:'The University Medical City congratulated Dr. Aisha Al Huraizi and her research team, led by Dr. Abdullah Al Alawi, for winning the National Research Award.',link:'https://x.com/UMC_OMAN/status/1866122329937350820',image:'/images/news-umc-award.jpg',youtubeId:'',isBayan:false},
  {id:8,cat:'achievement',title:'Dr. Raja Al Farsi Wins National Research Award',date:'December 2023',dateSort:'2023-12',summary:'The UMC congratulated Dr. Raja Al Farsi for winning the National Research Award for her paper on Delirium in Patients Admitted to the Internal Medicine Department.',link:'https://x.com/UMC_OMAN/status/1731914315454717976',image:'/images/news-umc-raja-award.jpg',youtubeId:'',isBayan:false},
];

const TABS = [
  { key: 'all',         label: 'All',           icon: '📋' },
  { key: 'achievement', label: 'Achievements',   icon: '🏆' },
  { key: 'media',       label: 'Media',          icon: '📺' },
  { key: 'launch',      label: 'Launches',       icon: '🚀' },
  { key: 'education',   label: 'Education',      icon: '🎓' },
];

type NewsItem = typeof newsItems[0];

export default function News() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [visible, setVisible] = useState(6);

  const sorted = useMemo(() =>
    [...newsItems].sort((a, b) => b.dateSort.localeCompare(a.dateSort)),
  []);

  const filtered = useMemo(() => {
    let items: NewsItem[] = activeTab === 'all' ? sorted : sorted.filter(i => i.cat === activeTab);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(i => i.title.toLowerCase().includes(q) || i.summary.toLowerCase().includes(q));
    }
    return items;
  }, [sorted, activeTab, search]);

  const displayed = filtered.slice(0, visible);
  const latest = sorted.slice(0, 6);

  const counts: Record<string, number> = { all: newsItems.length };
  TABS.slice(1).forEach(t => { counts[t.key] = newsItems.filter(i => i.cat === t.key).length; });

  const showBayan = (activeTab === 'all' || activeTab === 'launch') && !search;

  return (
    <Layout>
      <section className="page-hero centered">
        <div className="container">
          <h1>Latest News</h1>
          <p>Updates on our activities, achievements, and contributions to the medical research community.</p>
        </div>
      </section>

      {/* Search bar */}
      <section className="section section-muted" style={{padding:'24px 0'}}>
        <div className="container">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search news..."
              value={search}
              onChange={e => { setSearch(e.target.value); setVisible(6); }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',fontSize:18,padding:'0 8px'}}
              >×</button>
            )}
          </div>
        </div>
      </section>

      {/* Pinned Bayan card */}
      {showBayan && (
        <section className="section" style={{paddingBottom:0,paddingTop:32}}>
          <div className="container">
            <div className="bayan-card" style={{marginBottom:0}}>
              <div className="bayan-glow-1"></div>
              <div className="bayan-glow-2"></div>
              <div style={{position:'relative',zIndex:1}}>
                <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
                  <span className="badge badge-accent">📌 Pinned</span>
                  <span className="badge badge-green-live">
                    <span style={{width:8,height:8,background:'white',borderRadius:'50%',display:'block'}} className="animate-pulse"></span>
                    Live Now
                  </span>
                  <span className="badge badge-outline" style={{border:'1px solid rgba(255,255,255,0.2)',color:'rgba(255,255,255,0.7)'}}>Free for All Residents</span>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:40,alignItems:'start'}}>
                  <div>
                    <h2 style={{fontFamily:'var(--font-serif)',fontSize:'2rem',color:'white',marginBottom:12}}>
                      Introducing <span style={{color:'var(--accent-light)'}}>Bayan</span>
                    </h2>
                    <p style={{color:'rgba(255,255,255,0.7)',marginBottom:16}}>
                      A free AI-powered medical board exam preparation platform built by MedResearch Academy for residents in Oman and the region.
                    </p>
                    <div className="exam-tags" style={{marginBottom:20}}>
                      {['🇴🇲 OMSB','🏥 Arab Board','🇬🇧 MRCP(UK)','🇺🇸 ABIM','🇺🇸 USMLE','🇦🇪 DHA/HAAD','🇶🇦 QCHP','🇸🇦 SMLE','+ more'].map(e => (
                        <span key={e} className="exam-tag">{e}</span>
                      ))}
                    </div>
                    <a href="https://bayan-med.vercel.app" target="_blank" rel="noopener noreferrer" className="btn btn-accent btn-lg">
                      Try Bayan Free →
                    </a>
                  </div>
                  <div className="bayan-features">
                    {([
                      ['🧠','Adaptive Learning','AI adjusts to your level'],
                      ['📚','Knowledge Library','Clinical articles'],
                      ['🃏','Flashcards','Spaced repetition'],
                      ['📈','Analytics','Track your progress'],
                      ['📅','Study Planner','Weekly goals'],
                      ['🏆','Leaderboard','Compete with peers'],
                    ] as [string,string,string][]).map(([icon,title,desc]) => (
                      <div key={title} className="bayan-feature">
                        <div className="icon">{icon}</div>
                        <p>{title}</p>
                        <small>{desc}</small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tabs */}
      <section className="section" style={{paddingTop:32,paddingBottom:0}}>
        <div className="container">
          <div className="news-tabs">
            {TABS.map(t => (
              <button
                key={t.key}
                className={`news-tab${activeTab === t.key ? ' active' : ''}`}
                onClick={() => { setActiveTab(t.key); setVisible(6); setSearch(''); }}
              >
                {t.icon} {t.label}
                <span className="news-tab-count">{counts[t.key]}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content: grid + sidebar */}
      <section className="section" style={{paddingTop:28}}>
        <div className="container">
          <div className="news-page-layout">

            {/* Main grid */}
            <div className="news-page-main">
              {displayed.filter(i => !i.isBayan).length === 0 ? (
                <div className="text-center" style={{padding:'60px 0'}}>
                  <p className="text-muted">No news found.</p>
                  <button
                    onClick={() => { setSearch(''); setActiveTab('all'); }}
                    className="btn btn-outline"
                    style={{marginTop:16}}
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="news-grid">
                    {displayed.filter(i => !i.isBayan).map(item => (
                      <div className="card" key={item.id}>
                        {item.youtubeId ? (
                          <div style={{position:'relative',paddingBottom:'56.25%',background:'#000'}}>
                            <iframe
                              src={`https://www.youtube.com/embed/${item.youtubeId}`}
                              title={item.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              style={{position:'absolute',inset:0,width:'100%',height:'100%',border:'none'}}
                            />
                          </div>
                        ) : item.image ? (
                          <img src={item.image} alt={item.title} className="card-img" />
                        ) : null}
                        <div className="card-body">
                          <div className="news-date">📅 {item.date}</div>
                          <div className="news-title">{item.title}</div>
                          <div className="news-summary">{item.summary}</div>
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-sm"
                            style={{marginTop:16}}
                          >
                            {item.youtubeId ? '▶ Watch on YouTube' : 'Read More →'}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>

                  {visible < filtered.filter(i => !i.isBayan).length && (
                    <div className="load-more-wrap">
                      <button className="btn btn-outline" onClick={() => setVisible(v => v + 3)}>
                        Load More News
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Latest sidebar */}
            <aside className="news-sidebar">
              <div className="news-sidebar-inner">
                <h3 className="news-sidebar-title">🕐 Latest Updates</h3>
                <ul className="news-sidebar-list">
                  {latest.map(item => (
                    <li key={item.id} className="news-sidebar-item">
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="news-sidebar-link">
                        {item.title}
                      </a>
                      <span className="news-sidebar-date">{item.date}</span>
                    </li>
                  ))}
                </ul>
                <div style={{marginTop:20,textAlign:'center'}}>
                  <Link to="/news" className="btn btn-outline btn-sm" style={{width:'100%'}}>View All →</Link>
                </div>
              </div>
            </aside>

          </div>
        </div>
      </section>
    </Layout>
  );
}
