import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface Stats {
  total: number;
  active: number;
  withdrawn: number;
  cbiCount: number;
  phq9Count: number;
  gad7Count: number;
  isiCount: number;
  pendingReviews: number;
  avgHrv: number | null;
  avgStrain: number | null;
  burnoutRate: number | null;
  weeklyCheckinRate: number | null;
}

export default function Overview() {
  const { staff, studyRoles } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const studyId = studyRoles[0]?.study_id;

  useEffect(() => {
    if (!studyId) return;
    loadStats();
  }, [studyId]);

  async function loadStats() {
    setLoading(true);

    const [resResult, cbiResult, phq9Result, gad7Result, isiResult, whoopResult, checkinResult] = await Promise.all([
      supabase.from('burnout_participants').select('id, status', { count: 'exact' }).eq('study_id', studyId).limit(500),
      supabase.from('cbi_responses').select('id, any_burnout, review_status').eq('study_id', studyId).limit(1000),
      supabase.from('phq9_responses').select('id, total_score, review_status').eq('study_id', studyId).limit(1000),
      supabase.from('gad7_responses').select('id, review_status').eq('study_id', studyId).limit(1000),
      supabase.from('isi_responses').select('id, review_status').eq('study_id', studyId).limit(1000),
      supabase.from('whoop_pulls').select('avg_hrv_rmssd_ms, avg_daily_strain').eq('study_id', studyId).limit(1000),
      supabase.from('weekly_checkins').select('id').eq('study_id', studyId).limit(500),
    ]);

    const residents = resResult.data ?? [];
    const cbiRows = cbiResult.data ?? [];
    const phq9Rows = phq9Result.data ?? [];
    const gad7Rows = gad7Result.data ?? [];
    const isiRows = isiResult.data ?? [];
    const whoopRows = whoopResult.data ?? [];
    const checkinRows = checkinResult.data ?? [];

    const active = residents.filter(r => r.status === 'active').length;
    const withdrawn = residents.filter(r => r.status === 'withdrawn').length;

    const burnoutPositive = cbiRows.filter(m => m.any_burnout).length;
    const burnoutRate = cbiRows.length > 0 ? Math.round((burnoutPositive / cbiRows.length) * 100) : null;

    const allResponses = [...cbiRows, ...phq9Rows, ...gad7Rows, ...isiRows];
    const pendingReviews = allResponses.filter(r => r.review_status === 'pending').length;

    const hrvValues = whoopRows.map(w => w.avg_hrv_rmssd_ms).filter((v): v is number => v != null);
    const strainValues = whoopRows.map(w => w.avg_daily_strain).filter((v): v is number => v != null);
    const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

    const weeklyCheckinRate = active > 0 ? Math.round((checkinRows.length / active) * 100) : null;

    setStats({
      total: residents.length,
      active,
      withdrawn,
      cbiCount: cbiRows.length,
      phq9Count: phq9Rows.length,
      gad7Count: gad7Rows.length,
      isiCount: isiRows.length,
      pendingReviews,
      avgHrv: avg(hrvValues),
      avgStrain: avg(strainValues),
      burnoutRate,
      weeklyCheckinRate,
    });
    setLoading(false);
  }

  const kpiCards = stats ? [
    { label: 'Total Enrolled', value: stats.total, color: 'var(--primary)', icon: '👥' },
    { label: 'Active', value: stats.active, color: '#16a34a', icon: '✅' },
    { label: 'CBI Responses', value: stats.cbiCount, color: 'var(--accent)', icon: '📋' },
    { label: 'PHQ-9', value: stats.phq9Count, color: '#7c3aed', icon: '🧠' },
    { label: 'GAD-7', value: stats.gad7Count, color: '#0891b2', icon: '😰' },
    { label: 'ISI', value: stats.isiCount, color: '#d97706', icon: '😴' },
    { label: 'Pending Reviews', value: stats.pendingReviews, color: stats.pendingReviews > 0 ? '#dc2626' : '#16a34a', icon: '⏳' },
    { label: 'Avg HRV (ms)', value: stats.avgHrv != null ? stats.avgHrv.toFixed(1) : '—', color: '#7c3aed', icon: '💓' },
    { label: 'Avg Strain', value: stats.avgStrain != null ? stats.avgStrain.toFixed(1) : '—', color: '#0891b2', icon: '🏋️' },
    { label: 'Burnout Rate (CBI)', value: stats.burnoutRate != null ? `${stats.burnoutRate}%` : '—', color: stats.burnoutRate && stats.burnoutRate > 30 ? '#dc2626' : '#16a34a', icon: '🔥' },
  ] : [];

  return (
    <div>
      <div style={{marginBottom:32}}>
        <h1 style={{fontSize:'1.8rem',fontFamily:'var(--font-serif)',color:'var(--primary)',marginBottom:4}}>Dashboard Overview</h1>
        <p style={{color:'var(--text-muted)',fontSize:14}}>
          Welcome back, {staff?.full_name}. Study: <strong>{studyRoles[0]?.study_slug}</strong> — Role: <strong>{studyRoles[0]?.role.replace(/_/g,' ')}</strong>
        </p>
      </div>

      {loading ? (
        <div style={{textAlign:'center',padding:60,color:'var(--text-muted)'}}>Loading KPIs...</div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:16,marginBottom:40}}>
          {kpiCards.map(card => (
            <div key={card.label} style={{background:'white',borderRadius:14,padding:'24px 20px',border:'1px solid var(--border)',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>{card.label}</div>
                <span style={{fontSize:20}}>{card.icon}</span>
              </div>
              <div style={{fontSize:'2rem',fontWeight:700,fontFamily:'var(--font-serif)',color:card.color,lineHeight:1}}>{card.value}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{background:'white',borderRadius:14,padding:'28px',border:'1px solid var(--border)',marginBottom:24}}>
        <h3 style={{fontSize:'1.1rem',color:'var(--primary)',marginBottom:16,fontFamily:'var(--font-serif)'}}>Quick Actions</h3>
        <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
          <a href="/dashboard/review" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'10px 20px',borderRadius:8,background:'var(--bg-muted)',border:'1px solid var(--border)',color:'var(--text)',fontWeight:600,fontSize:14,textDecoration:'none'}}>
            ⏳ Review Queue {stats && stats.pendingReviews > 0 ? `(${stats.pendingReviews})` : ''}
          </a>
          <a href="/dashboard/import" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'10px 20px',borderRadius:8,background:'var(--bg-muted)',border:'1px solid var(--border)',color:'var(--text)',fontWeight:600,fontSize:14,textDecoration:'none'}}>
            📥 Import Data
          </a>
          <a href="/dashboard/send-links" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'10px 20px',borderRadius:8,background:'var(--bg-muted)',border:'1px solid var(--border)',color:'var(--text)',fontWeight:600,fontSize:14,textDecoration:'none'}}>
            📧 Send Links
          </a>
          <a href="/dashboard/residents" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'10px 20px',borderRadius:8,background:'var(--bg-muted)',border:'1px solid var(--border)',color:'var(--text)',fontWeight:600,fontSize:14,textDecoration:'none'}}>
            👥 View Participants
          </a>
          <a href="/dashboard/exports" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'10px 20px',borderRadius:8,background:'var(--bg-muted)',border:'1px solid var(--border)',color:'var(--text)',fontWeight:600,fontSize:14,textDecoration:'none'}}>
            📦 Export Data
          </a>
        </div>
      </div>
    </div>
  );
}
