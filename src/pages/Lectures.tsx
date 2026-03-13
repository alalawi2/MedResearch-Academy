import Layout from '../components/Layout';

const CHANNEL_URL = 'https://www.youtube.com/@MedReseacrhAcademy';

const videos = [
  {
    id: 'slJYaAXdG5k',
    title: 'From Clinical Observation to Research Question',
    description: 'Learn how to transform everyday clinical encounters into structured, publishable research questions — the essential first step in any research journey.',
    tag: 'Research Foundations',
    url: 'https://www.youtube.com/watch?v=slJYaAXdG5k',
    thumbnail: 'https://i.ytimg.com/vi/slJYaAXdG5k/hqdefault.jpg',
  },
  {
    id: '4i5WvOTzCH4',
    title: 'How to Write a Medical Case Report',
    description: 'A step-by-step guide for medical students and residents on structuring, writing, and submitting a case report for publication.',
    tag: 'Medical Writing',
    url: 'https://www.youtube.com/watch?v=4i5WvOTzCH4&t=368s',
    thumbnail: 'https://i.ytimg.com/vi/4i5WvOTzCH4/hqdefault.jpg',
  },
  {
    id: '-aTy6QKaVts',
    title: 'Mastering Research Proposals',
    description: 'A comprehensive walkthrough of methodology design, ethics committee applications, and securing research funding in Oman and the region.',
    tag: 'Research Design',
    url: 'https://www.youtube.com/watch?v=-aTy6QKaVts&t=15s',
    thumbnail: 'https://i.ytimg.com/vi/-aTy6QKaVts/hqdefault.jpg',
  },
  {
    id: 'z0fz5KCLGmI',
    title: 'Beyond PubMed: AI-Powered Literature Search',
    description: 'Explore the latest AI tools for medical literature search — applications, workflows, and the ethical considerations every researcher must know.',
    tag: 'AI in Research',
    url: 'https://www.youtube.com/watch?v=z0fz5KCLGmI&t=943s',
    thumbnail: 'https://i.ytimg.com/vi/z0fz5KCLGmI/hqdefault.jpg',
  },
  {
    id: 'qJTu99R6N80',
    title: 'How to Use Zotero with Consensus',
    description: 'Master the new Zotero + Consensus integration to supercharge your reference management and AI-assisted literature review workflow.',
    tag: 'Research Tools',
    url: 'https://www.youtube.com/watch?v=qJTu99R6N80&t=11s',
    thumbnail: 'https://i.ytimg.com/vi/qJTu99R6N80/hqdefault.jpg',
  },
];

const tagColors: Record<string, { bg: string; color: string }> = {
  'Research Foundations': { bg: 'rgba(26,58,92,0.12)', color: 'var(--primary)' },
  'Medical Writing':      { bg: 'rgba(200,151,42,0.15)', color: '#9a6e10' },
  'Research Design':      { bg: 'rgba(20,184,166,0.12)', color: '#0d9488' },
  'AI in Research':       { bg: 'rgba(139,92,246,0.12)', color: '#7c3aed' },
  'Research Tools':       { bg: 'rgba(236,72,153,0.12)', color: '#be185d' },
};

export default function Lectures() {
  return (
    <Layout>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #0f2847 100%)',
        color: 'white',
        padding: '96px 0 80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position:'absolute',inset:0,opacity:0.05,
          backgroundImage:'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
          backgroundSize:'40px 40px',
        }}></div>
        <div className="container" style={{position:'relative',zIndex:1}}>
          <a
            href={CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display:'inline-flex',alignItems:'center',gap:10,
              background:'rgba(255,0,0,0.15)',border:'1px solid rgba(255,80,80,0.4)',
              borderRadius:50,padding:'8px 20px',fontSize:14,color:'white',
              textDecoration:'none',marginBottom:28,transition:'background 0.2s',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff4444">
              <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8z"/>
              <polygon fill="white" points="9.75,15.02 15.5,12 9.75,8.98"/>
            </svg>
            MedResearch Academy on YouTube
          </a>

          <h1 style={{fontSize:'clamp(2rem,5vw,3.2rem)',marginBottom:16,fontFamily:'var(--font-serif)'}}>
            Free Medical Research Lectures
          </h1>
          <p style={{color:'rgba(255,255,255,0.75)',maxWidth:580,margin:'0 auto 36px',fontSize:'1.1rem',lineHeight:1.7}}>
            Watch our full lecture library on YouTube — research methodology, medical writing, AI tools, and more. Free for every physician and resident.
          </p>
          <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="btn btn-accent btn-lg">
            ▶ Visit Our YouTube Channel
          </a>
        </div>
      </section>

      {/* Stats bar */}
      <div style={{background:'white',borderBottom:'1px solid var(--border)',padding:'24px 0'}}>
        <div className="container" style={{display:'flex',justifyContent:'center',gap:'clamp(32px,6vw,80px)',flexWrap:'wrap',textAlign:'center'}}>
          {[
            ['100% Free','All lectures, no paywall'],
            ['Arabic & English','Bilingual content'],
            ['5 Topics','From writing to AI tools'],
            ['All Levels','Students to consultants'],
          ].map(([n,l]) => (
            <div key={n}>
              <div style={{fontSize:'1.25rem',fontWeight:700,color:'var(--primary)',marginBottom:2}}>{n}</div>
              <div style={{fontSize:13,color:'var(--text-muted)'}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Video grid */}
      <section className="section">
        <div className="container">
          <div style={{textAlign:'center',marginBottom:48}}>
            <h2 style={{fontSize:'2rem',fontFamily:'var(--font-serif)',color:'var(--primary)',marginBottom:8}}>
              Featured Lectures
            </h2>
            <p style={{color:'var(--text-muted)'}}>
              Click any lecture to watch directly on YouTube.
            </p>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:28,marginBottom:56}}>
            {videos.map((v) => {
              const tc = tagColors[v.tag] || { bg: 'rgba(26,58,92,0.1)', color: 'var(--primary)' };
              return (
                <a
                  key={v.id}
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration:'none',color:'inherit',
                    background:'white',borderRadius:16,
                    border:'1px solid var(--border)',overflow:'hidden',
                    display:'flex',flexDirection:'column',
                    boxShadow:'0 2px 12px rgba(0,0,0,0.06)',
                    transition:'transform 0.2s,box-shadow 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.13)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{position:'relative',overflow:'hidden',height:190,background:'#000'}}>
                    <img
                      src={v.thumbnail}
                      alt={v.title}
                      style={{width:'100%',height:'100%',objectFit:'cover',opacity:0.92,display:'block'}}
                    />
                    {/* Play button overlay */}
                    <div style={{
                      position:'absolute',inset:0,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      background:'rgba(0,0,0,0.18)',
                      transition:'background 0.2s',
                    }}>
                      <div style={{
                        width:52,height:52,borderRadius:'50%',
                        background:'rgba(255,0,0,0.88)',
                        display:'flex',alignItems:'center',justifyContent:'center',
                        boxShadow:'0 4px 16px rgba(0,0,0,0.4)',
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <polygon points="5,3 19,12 5,21"/>
                        </svg>
                      </div>
                    </div>
                    {/* Tag badge */}
                    <span style={{
                      position:'absolute',top:12,left:12,
                      background:tc.bg,backdropFilter:'blur(4px)',
                      color:tc.color,fontWeight:600,
                      fontSize:11,padding:'4px 10px',borderRadius:50,
                      border:`1px solid ${tc.color}33`,
                    }}>
                      {v.tag}
                    </span>
                  </div>

                  {/* Content */}
                  <div style={{padding:'20px 22px',flex:1,display:'flex',flexDirection:'column'}}>
                    <h3 style={{
                      fontSize:'1rem',fontWeight:700,
                      color:'var(--primary)',marginBottom:8,lineHeight:1.4,
                    }}>
                      {v.title}
                    </h3>
                    <p style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.65,flex:1}}>
                      {v.description}
                    </p>
                    <div style={{
                      marginTop:16,paddingTop:14,borderTop:'1px solid var(--border)',
                      display:'flex',justifyContent:'space-between',alignItems:'center',
                    }}>
                      <span style={{fontSize:12,color:'var(--text-muted)',display:'flex',alignItems:'center',gap:5}}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff4444">
                          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8z"/>
                          <polygon fill="white" points="9.75,15.02 15.5,12 9.75,8.98"/>
                        </svg>
                        Watch on YouTube
                      </span>
                      <span style={{
                        background:'var(--primary)',color:'white',
                        fontSize:12,padding:'4px 12px',borderRadius:50,fontWeight:600,
                      }}>
                        Watch Now →
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          {/* Subscribe CTA */}
          <div style={{
            background:'linear-gradient(135deg,var(--primary) 0%,#0f2847 100%)',
            borderRadius:20,padding:'52px 40px',textAlign:'center',color:'white',
          }}>
            <svg width="52" height="52" viewBox="0 0 24 24" fill="#ff4444" style={{marginBottom:16}}>
              <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8z"/>
              <polygon fill="white" points="9.75,15.02 15.5,12 9.75,8.98"/>
            </svg>
            <h2 style={{fontFamily:'var(--font-serif)',fontSize:'2rem',marginBottom:12}}>
              Never Miss a New Lecture
            </h2>
            <p style={{color:'rgba(255,255,255,0.75)',maxWidth:480,margin:'0 auto 28px',lineHeight:1.7}}>
              Subscribe to our YouTube channel and get notified every time we publish new lectures, workshops, and educational content — all free.
            </p>
            <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="btn btn-accent btn-lg">
              Subscribe Free on YouTube →
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
