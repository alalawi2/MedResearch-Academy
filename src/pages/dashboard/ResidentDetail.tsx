import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface ResidentRow {
  id: string;
  study_participant_id: string;
  full_name: string | null;
  sex: string | null;
  age_at_enrollment: number | null;
  program: string | null;
  pgy_level: number | null;
  primary_site: string | null;
  status: string;
  enrollment_date: string | null;
  marital_status: string | null;
  number_of_kids: number | null;
}

interface BlockRow {
  id: string;
  block_number: number;
  rotation_name: string | null;
  rotation_type: string | null;
  rotation_site: string | null;
  period_start: string;
  period_end: string;
  calls_count: number | null;
  primary_call_type: string | null;
  hours_worked_per_week: number | null;
  hours_slept_per_day: number | null;
}

interface MbiRow {
  response_date: string;
  ee_score: number;
  dp_score: number;
  pa_score: number;
  burnout_positive: boolean;
  block_id: string | null;
}

interface WhoopRow {
  period_start: string;
  period_end: string;
  avg_hrv_rmssd_ms: number | null;
  avg_resting_hr_bpm: number | null;
  avg_total_sleep_min: number | null;
  avg_sleep_efficiency_pct: number | null;
  avg_daily_strain: number | null;
  avg_recovery_score: number | null;
  days_with_data: number | null;
  block_id: string | null;
}

export default function ResidentDetail() {
  const { id } = useParams<{ id: string }>();
  const { studyRoles, getRoleForStudy } = useAuth();
  const studySlug = studyRoles[0]?.study_slug;
  const role = getRoleForStudy(studySlug);
  const canSeePii = role && ['super_admin', 'research_admin', 'site_coordinator'].includes(role);

  const [resident, setResident] = useState<ResidentRow | null>(null);
  const [blocks, setBlocks] = useState<BlockRow[]>([]);
  const [mbiData, setMbiData] = useState<MbiRow[]>([]);
  const [whoopData, setWhoopData] = useState<WhoopRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadAll();
  }, [id]);

  async function loadAll() {
    setLoading(true);
    const [resResult, blockResult, mbiResult, whoopResult] = await Promise.all([
      supabase.from('residents').select('*').eq('id', id).limit(1).single(),
      supabase.from('rotation_blocks').select('*').eq('resident_id', id).order('block_number').limit(13),
      supabase.from('mbi_responses').select('response_date, ee_score, dp_score, pa_score, burnout_positive, block_id').eq('resident_id', id).order('response_date').limit(13),
      supabase.from('whoop_pulls').select('period_start, period_end, avg_hrv_rmssd_ms, avg_resting_hr_bpm, avg_total_sleep_min, avg_sleep_efficiency_pct, avg_daily_strain, avg_recovery_score, days_with_data, block_id').eq('resident_id', id).order('period_start').limit(13),
    ]);

    setResident(resResult.data);
    setBlocks(blockResult.data ?? []);
    setMbiData(mbiResult.data ?? []);
    setWhoopData(whoopResult.data ?? []);
    setLoading(false);
  }

  if (loading) return <div style={{padding:48,textAlign:'center',color:'var(--text-muted)'}}>Loading resident detail...</div>;
  if (!resident) return <div style={{padding:48,textAlign:'center',color:'var(--text-muted)'}}>Resident not found.</div>;

  const burnoutColor = (cat: string | null) => cat === 'high' ? '#dc2626' : cat === 'moderate' ? '#f59e0b' : '#16a34a';
  const mbiCategory = (ee: number, dp: number) => {
    const eeHigh = ee >= 30;
    const dpHigh = dp >= 12;
    return eeHigh && dpHigh ? 'high' : (eeHigh || dpHigh) ? 'moderate' : 'low';
  };

  return (
    <div>
      <Link to="/dashboard/residents" style={{color:'var(--text-muted)',fontSize:13,textDecoration:'none',display:'inline-block',marginBottom:16}}>← Back to Residents</Link>

      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28,flexWrap:'wrap',gap:16}}>
        <div>
          <h1 style={{fontSize:'1.8rem',fontFamily:'var(--font-serif)',color:'var(--primary)',marginBottom:4}}>
            {canSeePii && resident.full_name ? resident.full_name : resident.study_participant_id}
          </h1>
          <div style={{display:'flex',gap:12,color:'var(--text-muted)',fontSize:14,flexWrap:'wrap'}}>
            <span style={{fontFamily:'monospace',fontWeight:600}}>{resident.study_participant_id}</span>
            <span>·</span>
            <span>{resident.program?.replace(/_/g,' ')}</span>
            <span>·</span>
            <span>PGY-{resident.pgy_level}</span>
            <span>·</span>
            <span>{resident.primary_site}</span>
          </div>
        </div>
        <span style={{
          padding:'5px 14px',borderRadius:50,fontSize:12,fontWeight:600,
          background: resident.status === 'active' ? '#dcfce7' : '#fef3c7',
          color: resident.status === 'active' ? '#166534' : '#92400e',
        }}>
          {resident.status}
        </span>
      </div>

      {/* Demographics */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:12,marginBottom:32}}>
        {[
          ['Age', resident.age_at_enrollment ?? '—'],
          ['Sex', resident.sex ?? '—'],
          ['Marital Status', resident.marital_status ?? '—'],
          ['Children', resident.number_of_kids ?? '—'],
          ['Enrolled', resident.enrollment_date ?? '—'],
        ].map(([label, val]) => (
          <div key={label as string} style={{background:'white',borderRadius:10,padding:'14px 16px',border:'1px solid var(--border)'}}>
            <div style={{fontSize:10,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:3}}>{label}</div>
            <div style={{fontSize:14,fontWeight:600,color:'var(--text)'}}>{String(val)}</div>
          </div>
        ))}
      </div>

      {/* Block-by-block timeline */}
      <h2 style={{fontSize:'1.3rem',fontFamily:'var(--font-serif)',color:'var(--primary)',marginBottom:16}}>Block-by-Block Data</h2>

      {blocks.length === 0 ? (
        <div style={{background:'white',borderRadius:14,border:'1px solid var(--border)',padding:40,textAlign:'center',color:'var(--text-muted)'}}>
          No rotation blocks recorded yet.
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {blocks.map(block => {
            const mbi = mbiData.find(m => m.block_id === block.id);
            const whoop = whoopData.find(w => w.block_id === block.id);
            const bCat = mbi ? mbiCategory(mbi.ee_score, mbi.dp_score) : null;

            return (
              <div key={block.id} style={{background:'white',borderRadius:14,border:'1px solid var(--border)',padding:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.03)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:8}}>
                  <div>
                    <span style={{fontFamily:'var(--font-serif)',fontWeight:700,fontSize:'1.1rem',color:'var(--primary)'}}>Block {block.block_number}</span>
                    <span style={{color:'var(--text-muted)',fontSize:13,marginLeft:12}}>{block.period_start} → {block.period_end}</span>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    {block.rotation_name && <span style={{padding:'3px 10px',borderRadius:50,fontSize:11,background:'var(--bg-muted)',color:'var(--text-muted)',fontWeight:600}}>{block.rotation_name}</span>}
                    {block.rotation_site && <span style={{padding:'3px 10px',borderRadius:50,fontSize:11,background:'rgba(26,58,92,0.08)',color:'var(--primary)',fontWeight:600}}>{block.rotation_site}</span>}
                  </div>
                </div>

                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:12}}>
                  {/* Rotation workload */}
                  <MetricCell label="Calls" value={block.calls_count} />
                  <MetricCell label="Call Type" value={block.primary_call_type?.replace(/_/g,' ')} />
                  <MetricCell label="Hours/wk" value={block.hours_worked_per_week} />
                  <MetricCell label="Sleep hrs/d" value={block.hours_slept_per_day} />

                  {/* MBI */}
                  {mbi ? (
                    <>
                      <MetricCell label="EE Score" value={mbi.ee_score} color={mbi.ee_score >= 30 ? '#dc2626' : mbi.ee_score >= 18 ? '#f59e0b' : '#16a34a'} />
                      <MetricCell label="DP Score" value={mbi.dp_score} color={mbi.dp_score >= 12 ? '#dc2626' : mbi.dp_score >= 6 ? '#f59e0b' : '#16a34a'} />
                      <MetricCell label="PA Score" value={mbi.pa_score} color={mbi.pa_score < 33 ? '#dc2626' : mbi.pa_score <= 39 ? '#f59e0b' : '#16a34a'} />
                      <MetricCell label="Burnout" value={bCat ?? '—'} color={burnoutColor(bCat)} />
                    </>
                  ) : (
                    <MetricCell label="MBI" value="Not entered" color="var(--text-muted)" />
                  )}

                  {/* WHOOP */}
                  {whoop ? (
                    <>
                      <MetricCell label="HRV (ms)" value={whoop.avg_hrv_rmssd_ms?.toFixed(1)} />
                      <MetricCell label="RHR (bpm)" value={whoop.avg_resting_hr_bpm?.toFixed(1)} />
                      <MetricCell label="Sleep (min)" value={whoop.avg_total_sleep_min?.toFixed(0)} />
                      <MetricCell label="Recovery" value={whoop.avg_recovery_score?.toFixed(0)} suffix="%" />
                      <MetricCell label="Strain" value={whoop.avg_daily_strain?.toFixed(1)} />
                      <MetricCell label="Days w/ data" value={whoop.days_with_data} suffix="/28" />
                    </>
                  ) : (
                    <MetricCell label="WHOOP" value="No data" color="var(--text-muted)" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MetricCell({ label, value, color, suffix }: { label: string; value: any; color?: string; suffix?: string }) {
  return (
    <div style={{background:'var(--bg-muted)',borderRadius:8,padding:'10px 12px'}}>
      <div style={{fontSize:10,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:3}}>{label}</div>
      <div style={{fontSize:15,fontWeight:700,color:color ?? 'var(--text)'}}>
        {value ?? '—'}{suffix && <span style={{fontSize:11,fontWeight:400,color:'var(--text-muted)'}}>{suffix}</span>}
      </div>
    </div>
  );
}
