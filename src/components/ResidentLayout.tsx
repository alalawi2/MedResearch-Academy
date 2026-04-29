import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/resident/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/resident/questionnaire', label: 'Block Assessment', icon: '📋' },
  { path: '/resident/checkin', label: 'Check-in', icon: '✅' },
  { path: '/resident/events', label: 'Events', icon: '📅' },
];

export default function ResidentLayout() {
  const { residentProfile, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg-muted)'}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:32,marginBottom:12}}>🔬</div>
          <div style={{color:'var(--text-muted)',fontSize:14}}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!residentProfile) return <Navigate to="/resident/login" replace />;

  // Redirect to demographics form if not completed
  if (!residentProfile.demographics_completed && location.pathname !== '/resident/demographics') {
    return <Navigate to="/resident/demographics" replace />;
  }

  // Redirect to baseline assessment after demographics
  if (residentProfile.demographics_completed && !residentProfile.baseline_completed && location.pathname !== '/resident/baseline') {
    return <Navigate to="/resident/baseline" replace />;
  }

  const hideNav = location.pathname === '/resident/demographics' || location.pathname === '/resident/baseline';

  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',background:'var(--bg-muted)'}}>
      {/* ── Header ── */}
      <header style={{
        background:'white',
        borderBottom:'1px solid var(--border)',
        padding:'12px 20px',
        display:'flex',
        alignItems:'center',
        justifyContent:'space-between',
        position:'sticky',
        top:0,
        zIndex:50,
      }}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <img src="/images/logo_final_v2.png" alt="MedResearch" style={{height:28}} />
          <div>
            <div style={{fontSize:14,fontWeight:600,color:'var(--primary)',lineHeight:1.3}}>
              {residentProfile.full_name}
            </div>
            <div style={{fontSize:11,color:'var(--text-muted)'}}>
              ID: {residentProfile.study_participant_id}
            </div>
          </div>
        </div>
        <button
          onClick={signOut}
          style={{
            padding:'6px 14px',
            borderRadius:6,
            border:'1px solid var(--border)',
            background:'transparent',
            color:'var(--text-muted)',
            cursor:'pointer',
            fontSize:12,
            fontWeight:600,
          }}
        >
          Sign Out
        </button>
      </header>

      {/* ── Main Content ── */}
      <main style={{flex:1,padding:'20px 16px',paddingBottom:hideNav ? 24 : 80,maxWidth:600,width:'100%',margin:'0 auto'}}>
        <Outlet />
      </main>

      {/* ── Bottom Navigation (hidden during demographics) ── */}
      {!hideNav && <nav style={{
        position:'fixed',
        bottom:0,
        left:0,
        right:0,
        background:'white',
        borderTop:'1px solid var(--border)',
        display:'flex',
        justifyContent:'space-around',
        padding:'8px 0 calc(8px + env(safe-area-inset-bottom, 0px))',
        zIndex:50,
      }}>
        {NAV_ITEMS.map(item => {
          const active = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display:'flex',
                flexDirection:'column',
                alignItems:'center',
                gap:2,
                padding:'4px 12px',
                textDecoration:'none',
                color: active ? 'var(--primary)' : 'var(--text-muted)',
                fontSize:10,
                fontWeight: active ? 700 : 500,
                transition:'color 0.15s',
              }}
            >
              <span style={{fontSize:20}}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>}
    </div>
  );
}
