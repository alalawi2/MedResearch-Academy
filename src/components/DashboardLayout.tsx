import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Overview', icon: '📊' },
  { path: '/dashboard/residents', label: 'Residents', icon: '👥' },
  { path: '/dashboard/data-entry', label: 'Data Entry', icon: '📝' },
  { path: '/dashboard/import', label: 'Import Data', icon: '📥', adminOnly: true },
  { path: '/dashboard/send-links', label: 'Send Links', icon: '🔗', adminOnly: true },
  { path: '/dashboard/review', label: 'Review Queue', icon: '🔍' },
  { path: '/dashboard/enrollment', label: 'Enrollment', icon: '🔗' },
  { path: '/dashboard/exports', label: 'Exports', icon: '📦' },
];

export default function DashboardLayout() {
  const { staff, studyRoles, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg-muted)'}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:32,marginBottom:12}}>🔬</div>
          <div style={{color:'var(--text-muted)',fontSize:14}}>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (!staff) return <Navigate to="/login" replace />;
  if (studyRoles.length === 0) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg-muted)',padding:24}}>
        <div style={{maxWidth:420,background:'white',borderRadius:16,padding:'40px',textAlign:'center',border:'1px solid var(--border)',boxShadow:'0 4px 24px rgba(0,0,0,0.08)'}}>
          <div style={{fontSize:40,marginBottom:12}}>🔒</div>
          <h2 style={{fontSize:'1.3rem',color:'var(--primary)',marginBottom:8}}>No Study Access</h2>
          <p style={{fontSize:14,color:'var(--text-muted)',lineHeight:1.6,marginBottom:20}}>
            Your account <strong>{staff.email}</strong> is registered but has not been assigned to any study. Contact the principal investigator to get access.
          </p>
          <button onClick={signOut} className="btn btn-outline" style={{width:'100%',justifyContent:'center'}}>Sign Out</button>
        </div>
      </div>
    );
  }

  const currentStudy = studyRoles[0]; // default to first study
  const currentRole = currentStudy?.role ?? '';
  const isAdmin = currentRole === 'super_admin' || currentRole === 'research_admin';

  return (
    <div style={{minHeight:'100vh',display:'flex',background:'var(--bg-muted)'}}>
      {/* ── Sidebar ── */}
      <aside style={{width:240,background:'var(--primary)',color:'white',display:'flex',flexDirection:'column',position:'fixed',top:0,bottom:0,left:0,zIndex:50}}>
        <div style={{padding:'20px 20px 12px'}}>
          <img src="/images/logo_transparent.png" alt="MedResearch" style={{height:36,marginBottom:12,filter:'brightness(2)'}} />
          <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:4}}>Dashboard</div>
          <div style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.85)',lineHeight:1.4}}>{currentStudy.study_slug === 'resident-burnout' ? 'Burnout Study' : currentStudy.study_slug}</div>
        </div>
        <nav style={{flex:1,padding:'8px 12px',display:'flex',flexDirection:'column',gap:2}}>
          {NAV_ITEMS.filter(item => !item.adminOnly || isAdmin).map(item => {
            const active = item.path === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:8,fontSize:14,fontWeight:500,
                  color: active ? '#fff' : 'rgba(255,255,255,0.9)',
                  background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
                  textDecoration:'none',transition:'all 0.15s',
                }}
              >
                <span style={{fontSize:16}}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div style={{padding:'16px 16px 20px',borderTop:'1px solid rgba(255,255,255,0.1)'}}>
          <div style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.85)',marginBottom:2}}>{staff.full_name}</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',marginBottom:10}}>{currentStudy.role.replace('_',' ')}</div>
          <button
            onClick={signOut}
            style={{width:'100%',padding:'8px',borderRadius:6,border:'1px solid rgba(255,255,255,0.2)',background:'transparent',color:'rgba(255,255,255,0.7)',cursor:'pointer',fontSize:12,fontWeight:600}}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{flex:1,marginLeft:240,padding:'32px 40px',maxWidth:1200}}>
        <Outlet />
      </main>
    </div>
  );
}
