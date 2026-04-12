import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface Stats {
  total: number;
  active: number;
  withdrawn: number;
  completedMbi: number;
  avgHrv: number | null;
  avgStrain: number | null;
  burnoutRate: number | null;
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

    const [resResult, mbiResult, whoopResult] = await Promise.all([
      supabase.from('residents').select('id, status', { count: 'exact' }).eq('study_id', studyId).limit(500),
      supabase.from('mbi_responses').select('id, burnout_positive').eq('study_id', studyId).limit(1000),
      supabase.from('whoop_pulls').select('avg_hrv_rmssd_ms, avg_daily_strain').eq('study_id', studyId).limit(1000),
    ]);

    const residents = resResult.data ?? [];
    const mbiRows = mbiResult.data ?? [];
    const whoopRows = whoopResult.data ?? [];

    const active = residents.filter(r => r.status === 'active').length;
    const withdrawn = residents.filter(r => r.status === 'withdrawn').length;

    const burnoutPositive = mbiRows.filter(m => m.burnout_positive).length;
    const burnoutRate = mbiRows.length > 0 ? Math.round((burnoutPositive / mbiRows.length) * 100) : null;

    const hrvValues = whoopRows.map(w => w.avg_hrv_rmssd_ms).filter((v): v is number => v != null);
    const strainValues = whoopRows.map(w => w.avg_daily_strain).filter((v): v is number => v != null);
    const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

    setStats({
      total: residents.length,
      active,
      withdrawn,
      completedMbi: mbiRows.length,
      avgHrv: avg(hrvValues),
      avgStrain: avg(strainValues),
      burnoutRate,
    });
    setLoading(false);
  }

  const kpiCards = stats ? [
    { label: 'Total Enrolled', value: stats.total, color: 'var(--primary)', icon: '👥' },
    { label: 'Active', value: stats.active, color: '#16a34a', icon: '✅' },
    { label: 'Withdrawn', value: stats.withdrawn, color: '#dc2626', icon: '🚪' },
    { label: 'MBI Responses', value: stats.completedMbi, color: 'var(--accent)', icon: '📋' },
    { label: 'Avg HRV (ms)', value: stats.avgHrv != null ? stats.avgHrv.toFixed(1) : '—', color: '#7c3aed', icon: '💓' },
    { label: 'Avg Strain', value: stats.avgStrain != null ? stats.avgStrain.toFixed(1) : '—', color: '#0891b2', icon: '🏋️' },
    { label: 'Burnout Rate', value: stats.burnoutRate != null ? `${stats.burnoutRate}%` : '—', color: stats.burnoutRate && stats.burnoutRate > 30 ? '#dc2626' : '#16a34a', icon: '🔥' },
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

      {/* Data completeness tracker */}
      <div style={{background:'white',borderRadius:14,padding:'28px',border:'1px solid var(--border)',marginBottom:24}}>
        <h3 style={{fontSize:'1.1rem',color:'var(--primary)',marginBottom:16,fontFamily:'var(--font-serif)'}}>Quick Actions</h3>
        <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
          <a href="/dashboard/data-entry" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'10px 20px',borderRadius:8,background:'var(--bg-muted)',border:'1px solid var(--border)',color:'var(--text)',fontWeight:600,fontSize:14,textDecoration:'none'}}>
            📝 Enter MBI Response
          </a>
          <a href="/dashboard/residents" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'10px 20px',borderRadius:8,background:'var(--bg-muted)',border:'1px solid var(--border)',color:'var(--text)',fontWeight:600,fontSize:14,textDecoration:'none'}}>
            👥 View Residents
          </a>
          <a href="/dashboard/exports" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'10px 20px',borderRadius:8,background:'var(--bg-muted)',border:'1px solid var(--border)',color:'var(--text)',fontWeight:600,fontSize:14,textDecoration:'none'}}>
            📦 Export Data
          </a>
        </div>
      </div>
    </div>
  );
}
