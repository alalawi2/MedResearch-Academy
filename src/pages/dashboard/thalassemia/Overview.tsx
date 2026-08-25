import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

interface Kpi {
  total_patients: number;
  active: number;
  baseline_complete: number;
  visits_open: number;
  visits_overdue: number;
  serious_ae_open: number;
}

export default function ThalassemiaOverview() {
  const [kpi, setKpi] = useState<Kpi>({
    total_patients: 0, active: 0, baseline_complete: 0,
    visits_open: 0, visits_overdue: 0, serious_ae_open: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // Codex fix: query views for status/baseline (computed at read time)
      // and derive completion from actual investigation rows, not enrollment.
      const [p, v, baseline, ae] = await Promise.all([
        supabase.from('thalassemia_patients').select('id, status'),
        supabase.from('thalassemia_visit_schedule_v').select('computed_status'),
        supabase.from('thalassemia_baseline_status_v').select('patient_id, baseline_complete'),
        supabase.from('thalassemia_adverse_events').select('id, serious, resolved_date'),
      ]);
      const patients = p.data ?? [];
      const visits = v.data ?? [];
      const baselines = baseline.data ?? [];
      const aes = ae.data ?? [];
      setKpi({
        total_patients: patients.length,
        active: patients.filter(x => x.status === 'active').length,
        baseline_complete: baselines.filter(x => x.baseline_complete).length,
        visits_open: visits.filter(x => x.computed_status === 'window_open').length,
        visits_overdue: visits.filter(x => x.computed_status === 'overdue').length,
        serious_ae_open: aes.filter(x => x.serious && !x.resolved_date).length,
      });
      setLoading(false);
    })();
  }, []);

  return (
    <div style={{padding:'28px'}}>
      <div style={{marginBottom:24}}>
        <div style={{fontSize:12,fontWeight:700,color:'var(--accent)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4}}>MREC #3938 · SQU-EC/096/2026</div>
        <h1 style={{margin:0,color:'var(--primary)',fontFamily:'var(--font-serif)'}}>Thalassemia Cardiac Study</h1>
        <p style={{color:'var(--text-muted)',margin:'6px 0 0'}}>Multi-modal cardiac assessment in transfusion-dependent beta thalassemia — SQUH cohort</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16,marginBottom:32}}>
        <KpiCard label="Total Patients" value={kpi.total_patients} loading={loading} link="/dashboard/thalassemia/patients" />
        <KpiCard label="Active" value={kpi.active} loading={loading} tone="ok" />
        <KpiCard label="Baseline Complete" value={kpi.baseline_complete} loading={loading} tone="ok" />
        <KpiCard label="Visits Open Now" value={kpi.visits_open} loading={loading} tone="warn" />
        <KpiCard label="Overdue Visits" value={kpi.visits_overdue} loading={loading} tone={kpi.visits_overdue > 0 ? 'alert' : 'muted'} />
        <KpiCard label="Serious AE (open)" value={kpi.serious_ae_open} loading={loading} tone={kpi.serious_ae_open > 0 ? 'alert' : 'muted'} />
      </div>

      <div style={{background:'white',border:'1px solid var(--border)',borderRadius:12,padding:24,marginBottom:20}}>
        <h2 style={{margin:'0 0 10px',color:'var(--primary)',fontSize:'1.1rem'}}>Quick Actions</h2>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <Link to="/dashboard/thalassemia/patients" className="btn btn-primary">Open Patient List</Link>
          <Link to="/dashboard/thalassemia/patients/new" className="btn btn-outline">+ Enroll New Patient</Link>
        </div>
      </div>

      <div style={{background:'var(--bg-muted)',border:'1px solid var(--border)',borderRadius:12,padding:20,fontSize:14,color:'var(--text-muted)',lineHeight:1.7}}>
        <strong style={{color:'var(--text)'}}>Follow-up protocol reminder:</strong>{' '}
        Baseline: demographics + labs (MMPs, ferritin, LPI, NT-proBNP) + ECG + Echo + Cardiac T2* MRI + polysomnography + SCG.
        6 months: labs. 12 months: labs + ECG + Echo + Cardiac T2* MRI. ECG at every transfusion visit.
      </div>
    </div>
  );
}

function KpiCard({ label, value, loading, tone = 'default', link }: {
  label: string; value: number; loading: boolean; tone?: 'default'|'ok'|'warn'|'alert'|'muted'; link?: string;
}) {
  const bg = tone === 'alert' ? 'rgba(239,68,68,0.08)'
           : tone === 'warn'  ? 'rgba(200,151,42,0.10)'
           : tone === 'ok'    ? 'rgba(34,197,94,0.08)'
           : tone === 'muted' ? 'var(--bg-muted)' : 'white';
  const color = tone === 'alert' ? '#dc2626'
              : tone === 'warn'  ? '#8a6515'
              : tone === 'ok'    ? '#15803d' : 'var(--primary)';
  const inner = (
    <div style={{background:bg,border:'1px solid var(--border)',borderRadius:12,padding:20}}>
      <div style={{fontSize:12,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:8}}>{label}</div>
      <div style={{fontSize:'2rem',fontWeight:700,color}}>{loading ? '…' : value}</div>
    </div>
  );
  return link ? <Link to={link} style={{textDecoration:'none'}}>{inner}</Link> : inner;
}
