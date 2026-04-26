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

interface CbiRow {
  response_date: string;
  personal_score: number;
  work_score: number;
  patient_score: number;
  any_burnout: boolean;
  block_id: string | null;
}

interface WhoopRow {
  period_start: string;
  period_end: string;
  avg_hrv_rmssd_ms: number | null;
  avg_resting_hr_bpm: number | null;
  avg_spo2_pct: number | null;
  avg_skin_temp_c: number | null;
  avg_recovery_score: number | null;
  avg_total_sleep_min: number | null;
  avg_light_sleep_min: number | null;
  avg_deep_sleep_min: number | null;
  avg_rem_sleep_min: number | null;
  avg_sleep_efficiency_pct: number | null;
  avg_sleep_consistency_pct: number | null;
  avg_sleep_performance_pct: number | null;
  avg_sleep_debt_min: number | null;
  avg_respiratory_rate_bpm: number | null;
  avg_time_in_bed_min: number | null;
  avg_disturbance_count: number | null;
  nap_count: number | null;
  avg_daily_strain: number | null;
  avg_hr_bpm: number | null;
  max_hr_bpm: number | null;
  avg_kilojoules: number | null;
  hr_zone1_min: number | null;
  hr_zone2_min: number | null;
  hr_zone3_min: number | null;
  hr_zone4_min: number | null;
  hr_zone5_min: number | null;
  workout_count: number | null;
  days_with_data: number | null;
  pct_recorded: number | null;
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
  const [cbiData, setCbiData] = useState<CbiRow[]>([]);
  const [whoopData, setWhoopData] = useState<WhoopRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadAll();
  }, [id]);

  async function loadAll() {
    setLoading(true);
    const [resResult, blockResult, mbiResult, whoopResult] = await Promise.all([
      supabase.from('burnout_participants').select('*').eq('id', id).limit(1).single(),
      supabase.from('rotation_blocks').select('*').eq('resident_id', id).order('block_number').limit(13),
      supabase.from('cbi_responses').select('response_date, personal_score, work_score, patient_score, any_burnout, block_id').eq('resident_id', id).order('response_date').limit(13),
      supabase.from('whoop_pulls').select('period_start, period_end, avg_hrv_rmssd_ms, avg_resting_hr_bpm, avg_spo2_pct, avg_skin_temp_c, avg_recovery_score, avg_total_sleep_min, avg_light_sleep_min, avg_deep_sleep_min, avg_rem_sleep_min, avg_sleep_efficiency_pct, avg_sleep_consistency_pct, avg_sleep_performance_pct, avg_sleep_debt_min, avg_respiratory_rate_bpm, avg_time_in_bed_min, avg_disturbance_count, nap_count, avg_daily_strain, avg_hr_bpm, max_hr_bpm, avg_kilojoules, hr_zone1_min, hr_zone2_min, hr_zone3_min, hr_zone4_min, hr_zone5_min, workout_count, days_with_data, pct_recorded, block_id').eq('resident_id', id).order('period_start', { ascending: false }).limit(13),
    ]);

    setResident(resResult.data);
    setBlocks(blockResult.data ?? []);
    setCbiData(mbiResult.data ?? []);
    setWhoopData(whoopResult.data ?? []);
    setLoading(false);
  }

  if (loading) return <div style={{padding:48,textAlign:'center',color:'var(--text-muted)'}}>Loading resident detail...</div>;
  if (!resident) return <div style={{padding:48,textAlign:'center',color:'var(--text-muted)'}}>Resident not found.</div>;

  const burnoutColor = (burnout: boolean | null) => burnout ? '#dc2626' : '#16a34a';

  return (
    <div>
      <Link to="/dashboard/residents" style={{color:'var(--text-muted)',fontSize:13,textDecoration:'none',display:'inline-block',marginBottom:16}}>← Back to Residents</Link>

      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28,flexWrap:'wrap',gap:16}}>
        <div>
          <h1 style={{fontSize:'1.8rem',fontFamily:'var(--font-serif)',color:'var(--primary)',marginBottom:4}}>
            {resident.study_participant_id}
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

      {/* Latest WHOOP Data */}
      {whoopData.length > 0 && (
        <div style={{marginBottom:32}}>
          <h2 style={{fontSize:'1.3rem',fontFamily:'var(--font-serif)',color:'var(--primary)',marginBottom:16}}>WHOOP Biophysical Data</h2>
          {whoopData.map((w, i) => (
            <div key={i} style={{background:'white',borderRadius:14,border:'1px solid var(--border)',padding:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.03)',marginBottom:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:8}}>
                <div style={{fontSize:13,color:'var(--text-muted)'}}>
                  <strong>{w.period_start}</strong> → <strong>{w.period_end}</strong>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <span style={{padding:'3px 10px',borderRadius:50,fontSize:11,background:'var(--bg-muted)',color:'var(--text-muted)',fontWeight:600}}>
                    {w.days_with_data ?? 0}/28 days
                  </span>
                  {w.pct_recorded != null && (
                    <span style={{padding:'3px 10px',borderRadius:50,fontSize:11,background:'var(--bg-muted)',color:'var(--text-muted)',fontWeight:600}}>
                      {w.pct_recorded}% recorded
                    </span>
                  )}
                </div>
              </div>

              {/* Recovery Metrics */}
              <div style={{marginBottom:20}}>
                <div style={{fontSize:11,fontWeight:700,color:'var(--primary)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:10,borderBottom:'2px solid var(--border)',paddingBottom:6}}>💓 Recovery</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:10}}>
                  <MetricCell label="Recovery Score" value={w.avg_recovery_score?.toFixed(0)} suffix="%" color={w.avg_recovery_score != null ? (w.avg_recovery_score < 34 ? '#dc2626' : w.avg_recovery_score < 67 ? '#f59e0b' : '#16a34a') : undefined} />
                  <MetricCell label="HRV RMSSD" value={w.avg_hrv_rmssd_ms?.toFixed(1)} suffix=" ms" color={w.avg_hrv_rmssd_ms != null ? (w.avg_hrv_rmssd_ms < 30 ? '#f59e0b' : '#16a34a') : undefined} />
                  <MetricCell label="Resting Heart Rate" value={w.avg_resting_hr_bpm?.toFixed(1)} suffix=" bpm" />
                  <MetricCell label="Blood Oxygen (SpO2)" value={w.avg_spo2_pct?.toFixed(1)} suffix="%" />
                  <MetricCell label="Skin Temperature" value={w.avg_skin_temp_c?.toFixed(1)} suffix=" °C" />
                  <MetricCell label="Respiratory Rate" value={w.avg_respiratory_rate_bpm?.toFixed(1)} suffix=" br/min" />
                </div>
              </div>

              {/* Sleep Metrics */}
              <div style={{marginBottom:20}}>
                <div style={{fontSize:11,fontWeight:700,color:'var(--primary)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:10,borderBottom:'2px solid var(--border)',paddingBottom:6}}>😴 Sleep</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:10}}>
                  <MetricCell label="Total Sleep" value={w.avg_total_sleep_min != null ? `${Math.floor(w.avg_total_sleep_min / 60)}h ${Math.round(w.avg_total_sleep_min % 60)}m` : null} color={w.avg_total_sleep_min != null ? (w.avg_total_sleep_min < 420 ? '#dc2626' : '#16a34a') : undefined} />
                  <MetricCell label="Time in Bed" value={w.avg_time_in_bed_min != null ? `${Math.floor(w.avg_time_in_bed_min / 60)}h ${Math.round(w.avg_time_in_bed_min % 60)}m` : null} />
                  <MetricCell label="Light Sleep" value={w.avg_light_sleep_min != null ? `${Math.floor(w.avg_light_sleep_min / 60)}h ${Math.round(w.avg_light_sleep_min % 60)}m` : null} />
                  <MetricCell label="Deep (SWS)" value={w.avg_deep_sleep_min != null ? `${Math.floor(w.avg_deep_sleep_min / 60)}h ${Math.round(w.avg_deep_sleep_min % 60)}m` : null} />
                  <MetricCell label="REM Sleep" value={w.avg_rem_sleep_min != null ? `${Math.floor(w.avg_rem_sleep_min / 60)}h ${Math.round(w.avg_rem_sleep_min % 60)}m` : null} />
                  <MetricCell label="Sleep Efficiency" value={w.avg_sleep_efficiency_pct?.toFixed(1)} suffix="%" />
                  <MetricCell label="Sleep Consistency" value={w.avg_sleep_consistency_pct?.toFixed(1)} suffix="%" />
                  <MetricCell label="Sleep Performance" value={w.avg_sleep_performance_pct?.toFixed(1)} suffix="%" />
                  <MetricCell label="Sleep Debt" value={w.avg_sleep_debt_min != null ? `${Math.round(w.avg_sleep_debt_min)}m` : null} color={w.avg_sleep_debt_min != null ? (w.avg_sleep_debt_min > 60 ? '#dc2626' : '#16a34a') : undefined} />
                  <MetricCell label="Disturbances" value={w.avg_disturbance_count?.toFixed(1)} />
                  <MetricCell label="Naps" value={w.nap_count} />
                </div>
              </div>

              {/* Strain & Activity */}
              <div>
                <div style={{fontSize:11,fontWeight:700,color:'var(--primary)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:10,borderBottom:'2px solid var(--border)',paddingBottom:6}}>🏋️ Strain & Activity</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:10}}>
                  <MetricCell label="Daily Strain" value={w.avg_daily_strain?.toFixed(1)} suffix=" / 21" />
                  <MetricCell label="Avg Heart Rate" value={w.avg_hr_bpm?.toFixed(0)} suffix=" bpm" />
                  <MetricCell label="Max Heart Rate" value={w.max_hr_bpm?.toFixed(0)} suffix=" bpm" />
                  <MetricCell label="Energy Burned" value={w.avg_kilojoules?.toFixed(0)} suffix=" kJ" />
                  <MetricCell label="Workouts" value={w.workout_count} />
                  <MetricCell label="HR Zone 1" value={w.hr_zone1_min?.toFixed(0)} suffix=" min" />
                  <MetricCell label="HR Zone 2" value={w.hr_zone2_min?.toFixed(0)} suffix=" min" />
                  <MetricCell label="HR Zone 3" value={w.hr_zone3_min?.toFixed(0)} suffix=" min" />
                  <MetricCell label="HR Zone 4" value={w.hr_zone4_min?.toFixed(0)} suffix=" min" />
                  <MetricCell label="HR Zone 5" value={w.hr_zone5_min?.toFixed(0)} suffix=" min" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Block-by-block timeline */}
      <h2 style={{fontSize:'1.3rem',fontFamily:'var(--font-serif)',color:'var(--primary)',marginBottom:16}}>Block-by-Block Data</h2>

      {blocks.length === 0 ? (
        <div style={{background:'white',borderRadius:14,border:'1px solid var(--border)',padding:40,textAlign:'center',color:'var(--text-muted)'}}>
          No rotation blocks recorded yet.
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {blocks.map(block => {
            const cbi = cbiData.find(m => m.block_id === block.id);
            const whoop = whoopData.find(w => w.block_id === block.id);

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

                  {/* CBI */}
                  {cbi ? (
                    <>
                      <MetricCell label="Personal" value={cbi.personal_score?.toFixed(0)} suffix="/100" color={cbi.personal_score >= 50 ? '#dc2626' : '#16a34a'} />
                      <MetricCell label="Work" value={cbi.work_score?.toFixed(0)} suffix="/100" color={cbi.work_score >= 50 ? '#dc2626' : '#16a34a'} />
                      <MetricCell label="Patient" value={cbi.patient_score?.toFixed(0)} suffix="/100" color={cbi.patient_score >= 50 ? '#dc2626' : '#16a34a'} />
                      <MetricCell label="Burnout" value={cbi.any_burnout ? 'Yes' : 'No'} color={burnoutColor(cbi.any_burnout)} />
                    </>
                  ) : (
                    <MetricCell label="CBI" value="Not entered" color="var(--text-muted)" />
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
