import { Component, type ErrorInfo, type ReactNode, useEffect, useState } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ResidentProfile } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

/* ── Inline Dashboard — rendered directly, no routing ── */
function InlineDashboard({ profile }: { profile: ResidentProfile }) {
  const [status, setStatus] = useState('Loading data...');
  const [whoop, setWhoop] = useState<any>(null);
  const [counts, setCounts] = useState({ assessments: 0, checkins: 0, events: 0 });

  useEffect(() => {
    loadData();
  }, [profile.id]);

  async function loadData() {
    const rid = profile.id;
    const log: string[] = [];

    const { data: sess } = await supabase.auth.getSession();
    if (!sess?.session) { setStatus('No session — log out and back in'); return; }
    log.push('Session OK');

    const { data: wData, error: wErr } = await supabase
      .from('whoop_pulls')
      .select('avg_recovery_score, avg_hrv_rmssd_ms, avg_resting_hr_bpm, avg_total_sleep_min, avg_daily_strain, avg_sleep_efficiency_pct, avg_spo2_pct, days_with_data, pct_recorded, pulled_at')
      .eq('resident_id', rid)
      .order('pulled_at', { ascending: false })
      .limit(1);
    if (wErr) log.push('WHOOP err: ' + wErr.message);
    else if (wData?.length) { setWhoop(wData[0]); log.push('WHOOP: ' + wData.length + ' row'); }
    else log.push('WHOOP: 0 rows');

    const { count: ba } = await supabase.from('block_assessments').select('id', { count: 'exact', head: true }).eq('resident_id', rid);
    const { count: wc } = await supabase.from('weekly_checkins').select('id', { count: 'exact', head: true }).eq('resident_id', rid);
    const { count: ev } = await supabase.from('event_logs').select('id', { count: 'exact', head: true }).eq('resident_id', rid);
    setCounts({ assessments: ba ?? 0, checkins: wc ?? 0, events: ev ?? 0 });
    log.push(`BA:${ba ?? 0} WC:${wc ?? 0} EV:${ev ?? 0}`);

    setStatus(log.join(' | '));
  }

  const fmtMin = (m: number | null) => m == null ? '--' : `${Math.floor(m/60)}h ${Math.round(m%60)}m`;
  const recoveryColor = (v: number) => v >= 67 ? '#16a34a' : v >= 34 ? '#f59e0b' : '#ef4444';

  return (
    <div>
      {/* Debug */}
      <div style={{ padding: 10, marginBottom: 12, borderRadius: 8, background: '#dbeafe', border: '1px solid #93c5fd', fontSize: 11, color: '#1e40af', wordBreak: 'break-all' }}>
        {status}
      </div>

      {/* Welcome */}
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
        Welcome, {profile.full_name?.split(' ')[0] || 'Resident'}
      </h1>
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 99, background: '#0f172a', color: '#fff' }}>
          {profile.study_participant_id}
        </span>
      </div>

      {/* Guide */}
      <div style={{ padding: 14, borderRadius: 10, marginBottom: 16, background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: 12, color: '#1e3a5a', lineHeight: 1.8 }}>
        <strong style={{ color: '#1e40af' }}>Weekly tasks:</strong><br/>
        1. Wear WHOOP 24/7<br/>
        2. Complete weekly check-in<br/>
        3. Log significant events<br/>
        4. Block assessment (week 3+)
      </div>

      {/* Action cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
        <Link to="/resident/questionnaire" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, textDecoration: 'none', textAlign: 'center' }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>&#128203;</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>Assessments</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#2563eb' }}>{counts.assessments}</div>
        </Link>
        <Link to="/resident/checkin" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, textDecoration: 'none', textAlign: 'center' }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>&#9989;</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>Check-ins</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#16a34a' }}>{counts.checkins}</div>
        </Link>
        <Link to="/resident/events" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, textDecoration: 'none', textAlign: 'center' }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>&#128197;</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>Events</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#7c3aed' }}>{counts.events}</div>
        </Link>
      </div>

      {/* WHOOP */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 12px' }}>WHOOP Biometrics</h2>
        {whoop ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14, textAlign: 'center' }}>
              <div>
                <div style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 4px', border: `3px solid ${recoveryColor(whoop.avg_recovery_score ?? 0)}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: recoveryColor(whoop.avg_recovery_score ?? 0) }}>
                    {whoop.avg_recovery_score != null ? Math.round(whoop.avg_recovery_score) + '%' : '--'}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Recovery</div>
              </div>
              <div>
                <div style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 4px', border: '3px solid #0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#0d9488' }}>
                    {whoop.avg_hrv_rmssd_ms != null ? Math.round(whoop.avg_hrv_rmssd_ms) : '--'}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>HRV (ms)</div>
              </div>
              <div>
                <div style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 4px', border: '3px solid #6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#6366f1' }}>
                    {whoop.avg_daily_strain != null ? whoop.avg_daily_strain.toFixed(1) : '--'}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Strain</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {[
                ['Resting HR', whoop.avg_resting_hr_bpm != null ? Math.round(whoop.avg_resting_hr_bpm) + ' bpm' : '--'],
                ['Sleep', fmtMin(whoop.avg_total_sleep_min)],
                ['Efficiency', whoop.avg_sleep_efficiency_pct != null ? Math.round(whoop.avg_sleep_efficiency_pct) + '%' : '--'],
                ['SpO2', whoop.avg_spo2_pct != null ? whoop.avg_spo2_pct.toFixed(1) + '%' : '--'],
                ['Days w/ Data', (whoop.days_with_data ?? 0) + '/28'],
                ['Recorded', (whoop.pct_recorded ?? 0) + '%'],
              ].map(([l, v]) => (
                <div key={l as string} style={{ background: '#f8fafc', borderRadius: 6, padding: '8px 10px' }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{l}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{v}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 20, color: '#64748b', fontSize: 13 }}>
            Awaiting WHOOP data — pulled automatically at 3 AM daily
          </div>
        )}
      </div>

      {/* Progress */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>Progress</h2>
        {[
          ['Demographics', profile.demographics_completed],
          ['Baseline', profile.baseline_completed],
          ['WHOOP', !!whoop],
        ].map(([label, done], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none' }}>
            <span style={{ fontSize: 14 }}>{done ? '\u2705' : '\u2B1C'}</span>
            <span style={{ fontSize: 13, color: '#0f172a' }}>{label as string}</span>
          </div>
        ))}
      </div>

      {/* About */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>About This Study</h2>
        <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.7, margin: 0 }}>
          Burnout &amp; Biophysical Parameters study using WHOOP wearables.
          Ethics: MREC #3190. Contact: mrawahi@squ.edu.om
        </p>
      </div>
    </div>
  );
}

/* Error Boundary — catches React crashes and shows them visually */
class DashboardErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Dashboard crash:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
          <div style={{ background: '#fef2f2', border: '2px solid #dc2626', borderRadius: 12, padding: 24 }}>
            <h2 style={{ color: '#dc2626', margin: '0 0 12px', fontSize: 18 }}>Dashboard Error</h2>
            <pre style={{ fontSize: 12, color: '#991b1b', whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: '0 0 12px', background: '#fff', padding: 12, borderRadius: 8 }}>
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack?.split('\n').slice(0, 5).join('\n')}
            </pre>
            <button onClick={() => window.location.reload()} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const NAV_ITEMS = [
  { path: '/resident/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/resident/questionnaire', label: 'Block Assessment', icon: '📋' },
  { path: '/resident/checkin', label: 'Check-in', icon: '✅' },
  { path: '/resident/events', label: 'Events', icon: '📅' },
];

export default function ResidentLayout() {
  const { residentProfile, loading, signOut, user, staff } = useAuth();
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

  if (!residentProfile) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg-muted)',padding:24}}>
        <div style={{maxWidth:500,background:'white',borderRadius:16,padding:32,border:'1px solid #e2e8f0'}}>
          <h2 style={{color:'#dc2626',margin:'0 0 12px'}}>Profile Not Found</h2>
          <div style={{fontSize:13,color:'#334155',lineHeight:1.8,marginBottom:16}}>
            <strong>User:</strong> {user?.email ?? 'no user'}<br/>
            <strong>User ID:</strong> {user?.id ?? 'none'}<br/>
            <strong>Staff:</strong> {staff ? `${staff.full_name} (${staff.email})` : 'not staff'}<br/>
            <strong>Resident Profile:</strong> null<br/>
            <strong>Path:</strong> {location.pathname}
          </div>
          <p style={{fontSize:13,color:'#64748b',marginBottom:16}}>
            The auth user exists but no resident profile was found in burnout_participants.
            This could be an RLS issue or the auth_user_id is not linked.
          </p>
          <div style={{display:'flex',gap:8}}>
            <button onClick={signOut} style={{padding:'8px 16px',borderRadius:8,border:'1px solid #e2e8f0',background:'white',cursor:'pointer',fontSize:13,fontWeight:600}}>Sign Out</button>
            <Link to="/resident/login" style={{padding:'8px 16px',borderRadius:8,background:'#2563eb',color:'white',textDecoration:'none',fontSize:13,fontWeight:600}}>Back to Login</Link>
          </div>
        </div>
      </div>
    );
  }

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
        {/* Inline dashboard — no Outlet, no routing, no code splitting */}
        <InlineDashboard profile={residentProfile} />
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
