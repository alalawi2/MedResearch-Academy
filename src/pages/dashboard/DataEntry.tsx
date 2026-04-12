import { useAuth } from '../../context/AuthContext';

export default function DataEntry() {
  const { studyRoles } = useAuth();
  return (
    <div>
      <h1 style={{fontSize:'1.8rem',fontFamily:'var(--font-serif)',color:'var(--primary)',marginBottom:8}}>Data Entry</h1>
      <p style={{color:'var(--text-muted)',fontSize:14,marginBottom:32}}>Enter rotation logs, MBI responses, and PROMIS-29 assessments for {studyRoles[0]?.study_slug}.</p>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:20}}>
        {[
          {icon:'📋',title:'MBI Response',desc:'Enter a 22-item Maslach Burnout Inventory assessment for a resident. Auto-computes EE, DP, PA subscales and burnout classification.',soon:false},
          {icon:'🧠',title:'PROMIS-29 Response',desc:'Enter an 8-domain PROMIS-29 v2.0 assessment (anxiety, depression, fatigue, sleep, physical function, pain, social roles).',soon:true},
          {icon:'📅',title:'Rotation Log',desc:'Log a rotation block: rotation name, site, call count, call type, hours worked, hours slept.',soon:true},
        ].map(card => (
          <div key={card.title} style={{background:'white',borderRadius:14,padding:'28px',border:'1px solid var(--border)',opacity:card.soon?0.6:1}}>
            <div style={{fontSize:32,marginBottom:12}}>{card.icon}</div>
            <h3 style={{fontFamily:'var(--font-serif)',color:'var(--primary)',marginBottom:8}}>{card.title}</h3>
            <p style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.6,marginBottom:16}}>{card.desc}</p>
            {card.soon ? (
              <span style={{padding:'5px 12px',borderRadius:50,fontSize:11,background:'var(--bg-muted)',color:'var(--text-muted)',fontWeight:600}}>Coming soon</span>
            ) : (
              <button className="btn btn-primary" style={{padding:'10px 20px',fontSize:13}}>Start Entry →</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
