import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const newsItems = [
  {id:18,cat:'education',title:'Internal Medicine Research Day 2026 — Programme Highlights',date:'October 2026',dateSort:'2026-10',summary:'The OMSB Internal Medicine programme shared moments from its 2026 Research Day on its official im.omsb profile in October. View the programme’s original photo post.',link:'https://www.instagram.com/im.omsb/p/DeHmkOqDBDq/',youtubeId:'',isBayan:false,image:''},
  {id:19,cat:'education',title:'Internal Medicine Retreat 2026 — Parallel Lives',date:'July 2026',dateSort:'2026-07',summary:'The Internal Medicine programme published highlights from its 2026 retreat, “Parallel Lives”, in July. The programme’s original post captures the occasion.',link:'https://www.instagram.com/im.omsb/p/Daw3WxGDG7Y/',youtubeId:'',isBayan:false,image:''},
  {id:20,cat:'achievement',title:'Dr. Abdullah Al Alawi Listed Among Qatar Health 2026 International Speakers',date:'January 2026',dateSort:'2026-01',summary:'Hamad Medical Corporation listed Dr. Abdullah Al Alawi among the international speakers for Qatar Health 2026. The congress took place on 28–31 January, with participation from OMSB Internal Medicine residents, faculty and graduates.',link:'https://www.hamad.qa/EN/All-Events/QatarHealth2026/Speakers/International-Speakers/Pages/Abdullah-Al-Alawi.aspx',youtubeId:'',isBayan:false,image:''},
  {id:21,cat:'education',title:'OMSB Celebrates Its 17th Graduating Cohort',date:'3 February 2026',dateSort:'2026-02-03',summary:'The Internal Medicine programme shared highlights from the Oman Medical Specialty Board’s 17th graduation ceremony, held on 3 February 2026.',link:'https://www.instagram.com/im.omsb/p/DUWBgJQjAXI/',youtubeId:'',isBayan:false,image:''},
  {id:22,cat:'achievement',title:'Mohamed Al Habsi Receives Best Poster Award at Gulf Heart Association Conference',date:'November 2025',dateSort:'2025-11',summary:'Sultan Qaboos University’s College of Medicine and Health Sciences congratulated student Mohamed bin Saeed Al Habsi on a Best Poster Award at the Gulf Heart Association conference in Doha. His work was supervised by Dr. Mohamed Al Rawahi at Sultan Qaboos University Hospital. The college announced the award on 25 November.',link:'https://x.com/medicine_squ/status/1993221279902785756',youtubeId:'',isBayan:false,image:''},
  {id:23,cat:'education',title:'MedResearch Academy Announces Virtual Research Series',date:'December 2025',dateSort:'2025-12-20',summary:'The Internal Medicine programme announced the Academy’s online research series led by Dr. Abdullah Al Alawi and Dr. Mohamed Al Rawahi, with its opening session scheduled for 31 December 2025. The original announcement outlines the series.',link:'https://www.instagram.com/im.omsb/p/DSetInHjBib/',youtubeId:'',isBayan:false,image:''},
  {id:17,cat:'launch',title:'Introducing Bayan — Medical Education & Exam Preparation',date:'March 2026',dateSort:'2026-03',summary:'Bayan launched as a medical education initiative. It now offers medical and nursing learning tracks, board-exam practice and web/mobile access. See the product site for current features, plans and access terms.',link:'https://www.bayan.edu.om',isBayan:true,youtubeId:'',image:''},
  {id:15,cat:'media',title:'Dr. Abdullah Al Alawi Featured on Oman TV — Nabt Jinan Program',date:'24 February 2026',dateSort:'2026-02-24',summary:'Dr. Abdullah M. Al Alawi was featured as a guest on the Oman TV program Nabt Jinan during Ramadan 1447H, highlighting inspiring Omani personalities. Oman TV published the episode on 24 February 2026.',link:'https://www.youtube.com/watch?v=SnowxT9f9r4',youtubeId:'SnowxT9f9r4',isBayan:false,image:''},
  {id:16,cat:'media',title:'Dr. Abdullah Al Alawi on Oman TV — Taryaq: AI in Medicine',date:'March 2026',dateSort:'2026-03',summary:'Dr. Al Alawi was featured on the Oman TV health program Taryaq to discuss the role of Artificial Intelligence in modern medicine.',link:'https://www.youtube.com/watch?v=9NKD_sPF0x8',youtubeId:'9NKD_sPF0x8',isBayan:false,image:''},
  {id:14,cat:'achievement',title:'Dr. Omar Al Taie Wins First Place for Best Scientific Research',date:'December 2025',dateSort:'2025-12',summary:'Dr. Omar Al Taie was awarded First Place for the best scientific research at the 7th Annual Research Forum of the National Heart Center. His study: Ten-Year Trends in Cardiac Mortality and Sudden Death in Oman (2014-2023).',link:'https://x.com/OMSB_OM/status/2005151473563557933',youtubeId:'',isBayan:false,image:''},
  {id:13,cat:'achievement',title:'Dr. Marwa Al Sharji Presents at International Conference',date:'December 2025',dateSort:'2025-12',summary:'Dr. Marwa Al Sharji presented a scientific poster at the Emirates International Gastroenterology and Hepatology Conference.',link:'https://x.com/OMSB_OM/status/2005154326424228031',youtubeId:'',isBayan:false,image:''},
  {id:12,cat:'launch',title:'Launch of Medad: Revolutionizing Clinical Documentation with AI',date:'December 2025',dateSort:'2025-12',summary:'The launch of Medad, an AI-powered ambient clinical documentation system designed specifically for Omani healthcare.',link:'https://www.medad.om/',image:'/images/medad_hero.webp',youtubeId:'',isBayan:false},
  {id:5,cat:'education',title:'Internal Medicine Program Organizes Scientific Research Day',date:'October 2025',dateSort:'2025-10',summary:'The Internal Medicine Program at OMSB organized a Scientific Research Day bringing together residents and faculty to present and discuss their scientific research.',link:'https://x.com/OMSB_OM/status/1981972765268967804',image:'/images/news-omsb-internal-med-oct.jpg',youtubeId:'',isBayan:false},
  {id:1,cat:'education',title:'Annual Career Guidance and Research Forum 2025–2026 — Programme Highlights',date:'December 2025',dateSort:'2025-12-13',summary:'The Internal Medicine programme shared highlights from the annual Career Guidance and Scientific Research Forum 2025–2026 in a post published on 13 December 2025.',link:'https://www.instagram.com/im.omsb/p/DSM_IRxDOqA/',image:'',youtubeId:'',isBayan:false},
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
            <aside className="product-update">
              <p className="product-update-label">Product update · Checked 9 October 2026</p>
              <h2>Bayan: medical and nursing education</h2>
              <p>Question practice, flashcards and structured learning for medical students, residents, clinicians and nurses. Available on the web and mobile, with free and paid access options.</p>
              <div className="resource-links">
                <a href="https://www.bayan.edu.om/" target="_blank" rel="noopener noreferrer" className="btn btn-primary">Explore Bayan ↗</a>
                <a href="/resources" className="btn btn-outline">All products & resources →</a>
              </div>
            </aside>
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
