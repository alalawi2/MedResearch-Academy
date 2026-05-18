import { Component, type ErrorInfo, type ReactNode, useEffect, useState } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ResidentProfile } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

/* ── Inline Dashboard ── */
function InlineDashboard({ profile }: { profile: ResidentProfile }) {
  const [whoop, setWhoop] = useState<any>(null);
  const [whoopHistory, setWhoopHistory] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [counts, setCounts] = useState({ assessments: 0, checkins: 0, events: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [profile.id]);

  async function loadData() {
    const rid = profile.id;
    // Latest WHOOP
    const { data: wData } = await supabase
      .from('whoop_pulls')
      .select('avg_recovery_score, avg_hrv_rmssd_ms, avg_resting_hr_bpm, avg_total_sleep_min, avg_daily_strain, avg_sleep_efficiency_pct, avg_sleep_consistency_pct, avg_sleep_performance_pct, avg_sleep_debt_min, avg_spo2_pct, avg_respiratory_rate_bpm, avg_skin_temp_c, avg_deep_sleep_min, avg_rem_sleep_min, avg_light_sleep_min, avg_time_in_bed_min, avg_disturbance_count, nap_count, avg_hr_bpm, max_hr_bpm, avg_kilojoules, workout_count, days_with_data, pct_recorded, pulled_at')
      .eq('resident_id', rid).order('pulled_at', { ascending: false }).limit(1);
    if (wData?.length) setWhoop(wData[0]);

    // WHOOP history (last 4 pulls for trend)
    const { data: wHist } = await supabase
      .from('whoop_pulls')
      .select('avg_recovery_score, avg_hrv_rmssd_ms, avg_total_sleep_min, avg_daily_strain, pulled_at')
      .eq('resident_id', rid).order('pulled_at', { ascending: true }).limit(4);
    if (wHist) setWhoopHistory(wHist);

    // Assessment scores (all blocks)
    const { data: aData } = await supabase
      .from('block_assessments')
      .select('rotation_name, assessment_date, who5_percent, cbi_work_score, phq9_total, phq9_severity, gad7_total, gad7_severity, isi_total, isi_severity')
      .eq('resident_id', rid).order('assessment_date').limit(13);
    if (aData) setAssessments(aData);

    // Counts
    const { count: ba } = await supabase.from('block_assessments').select('id', { count: 'exact', head: true }).eq('resident_id', rid);
    const { count: wc } = await supabase.from('weekly_checkins').select('id', { count: 'exact', head: true }).eq('resident_id', rid);
    const { count: ev } = await supabase.from('event_logs').select('id', { count: 'exact', head: true }).eq('resident_id', rid);
    setCounts({ assessments: ba ?? 0, checkins: wc ?? 0, events: ev ?? 0 });
    setLoading(false);
  }

  const name = profile.full_name?.split(' ')[0] || 'Resident';
  const pid = profile.study_participant_id;
  const fmtMin = (m: number | null) => m == null ? '--' : `${Math.floor(m / 60)}h ${Math.round(m % 60)}m`;
  const recoveryColor = (v: number) => v >= 67 ? '#16a34a' : v >= 34 ? '#f59e0b' : '#ef4444';
  const M = ({ l, v }: { l: string; v: string }) => (
    <div style={{ background: '#f8fafc', borderRadius: 6, padding: '7px 10px' }}>
      <div style={{ fontSize: 9, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{l}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{v}</div>
    </div>
  );

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading dashboard...</div>;

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>Welcome, {name}</h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 99, background: '#0f172a', color: '#fff' }}>{pid}</span>
          <Link to="/resident/set-password" style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: '#dbeafe', color: '#1d4ed8', textDecoration: 'none' }}>Set Password</Link>
        </div>
      </div>

      {/* Guide */}
      <div style={{ padding: '12px 16px', borderRadius: 12, marginBottom: 14, background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: 12, color: '#1e3a5a', lineHeight: 1.8 }}>
        <strong style={{ color: '#1e40af' }}>Weekly tasks:</strong><br />
        1. <strong>Wear WHOOP 24/7</strong> — data syncs at 3 AM<br />
        2. <strong>Weekly check-in</strong> — 2 min pulse (hours, calls, sleep, stress)<br />
        3. <strong>Log events</strong> — clinical, academic, personal, program<br />
        4. <strong>Block assessment</strong> — WHO-5 + CBI + PHQ-9 + GAD-7 + ISI (week 3+)
      </div>

      {/* Action cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
        {[
          { to: '/resident/questionnaire', icon: '\uD83D\uDCCB', label: 'Block Assessment', count: counts.assessments, color: '#2563eb', border: '#dbeafe', sub: 'completed' },
          { to: '/resident/checkin', icon: '\u2705', label: 'Weekly Check-in', count: counts.checkins, color: '#16a34a', border: '#dcfce7', sub: 'submitted' },
          { to: '/resident/events', icon: '\uD83D\uDCC5', label: 'Event Log', count: counts.events, color: '#7c3aed', border: '#ede9fe', sub: 'logged' },
        ].map(c => (
          <Link key={c.to} to={c.to} style={{ background: '#fff', border: `2px solid ${c.border}`, borderRadius: 12, padding: '14px 8px', textDecoration: 'none', textAlign: 'center', cursor: 'pointer', display: 'block' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{c.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{c.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: c.color }}>{c.count}</div>
            <div style={{ fontSize: 10, color: '#64748b' }}>{c.sub}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: c.color, marginTop: 4 }}>Tap to open &rarr;</div>
          </Link>
        ))}
      </div>

      {/* WHOOP Biometrics */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18, marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>WHOOP Biometrics</h2>
          {whoop && <span style={{ fontSize: 11, color: '#94a3b8' }}>Updated {new Date(whoop.pulled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
        </div>
        {whoop ? (<>
          {/* Rings */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14, textAlign: 'center' }}>
            {[
              { v: whoop.avg_recovery_score, l: 'Recovery', f: (x: number) => Math.round(x) + '%', c: recoveryColor(whoop.avg_recovery_score ?? 0) },
              { v: whoop.avg_hrv_rmssd_ms, l: 'HRV (ms)', f: (x: number) => String(Math.round(x)), c: '#0d9488' },
              { v: whoop.avg_daily_strain, l: 'Strain /21', f: (x: number) => x.toFixed(1), c: '#6366f1' },
            ].map(r => (
              <div key={r.l}>
                <div style={{ width: 68, height: 68, borderRadius: '50%', margin: '0 auto 4px', border: `3px solid ${r.v != null ? r.c : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: r.v != null ? r.c : '#94a3b8' }}>{r.v != null ? r.f(r.v) : '--'}</span>
                </div>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>{r.l}</div>
              </div>
            ))}
          </div>
          {/* Insight */}
          <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: 12, color: '#166534', lineHeight: 1.6, border: '1px solid #bbf7d0' }}>
            {whoop.avg_recovery_score != null && (whoop.avg_recovery_score >= 67
              ? 'Recovery is green — well rested and ready for activity.'
              : whoop.avg_recovery_score >= 34
              ? 'Recovery is moderate — balance workload and prioritize sleep.'
              : 'Recovery is low — consider rest and earlier bedtime.')}
            {whoop.avg_total_sleep_min != null && (whoop.avg_total_sleep_min >= 420
              ? ` Sleep: ${fmtMin(whoop.avg_total_sleep_min)} (meeting 7h target).`
              : ` Sleep: ${fmtMin(whoop.avg_total_sleep_min)} (below 7h recommended).`)}
          </div>
          {/* Recovery */}
          <SectionLabel text="Recovery" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
            <M l="Resting HR" v={whoop.avg_resting_hr_bpm != null ? Math.round(whoop.avg_resting_hr_bpm) + ' bpm' : '--'} />
            <M l="SpO2" v={whoop.avg_spo2_pct != null ? whoop.avg_spo2_pct.toFixed(1) + '%' : '--'} />
            <M l="Respiratory Rate" v={whoop.avg_respiratory_rate_bpm != null ? whoop.avg_respiratory_rate_bpm.toFixed(1) + ' br/min' : '--'} />
            <M l="Skin Temp" v={whoop.avg_skin_temp_c != null ? whoop.avg_skin_temp_c.toFixed(1) + ' °C' : '--'} />
          </div>
          {/* Sleep */}
          <SectionLabel text="Sleep" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
            <M l="Total Sleep" v={fmtMin(whoop.avg_total_sleep_min)} />
            <M l="Time in Bed" v={fmtMin(whoop.avg_time_in_bed_min)} />
            <M l="Deep (SWS)" v={fmtMin(whoop.avg_deep_sleep_min)} />
            <M l="REM Sleep" v={fmtMin(whoop.avg_rem_sleep_min)} />
            <M l="Light Sleep" v={fmtMin(whoop.avg_light_sleep_min)} />
            <M l="Efficiency" v={whoop.avg_sleep_efficiency_pct != null ? Math.round(whoop.avg_sleep_efficiency_pct) + '%' : '--'} />
            <M l="Consistency" v={whoop.avg_sleep_consistency_pct != null ? Math.round(whoop.avg_sleep_consistency_pct) + '%' : '--'} />
            <M l="Performance" v={whoop.avg_sleep_performance_pct != null ? Math.round(whoop.avg_sleep_performance_pct) + '%' : '--'} />
            <M l="Sleep Debt" v={whoop.avg_sleep_debt_min != null ? Math.round(whoop.avg_sleep_debt_min) + ' min' : '--'} />
            <M l="Disturbances" v={whoop.avg_disturbance_count != null ? whoop.avg_disturbance_count.toFixed(1) : '--'} />
          </div>
          {/* Strain */}
          <SectionLabel text="Strain & Activity" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
            <M l="Avg Heart Rate" v={whoop.avg_hr_bpm != null ? Math.round(whoop.avg_hr_bpm) + ' bpm' : '--'} />
            <M l="Max Heart Rate" v={whoop.max_hr_bpm != null ? Math.round(whoop.max_hr_bpm) + ' bpm' : '--'} />
            <M l="Energy Burned" v={whoop.avg_kilojoules != null ? Math.round(whoop.avg_kilojoules) + ' kJ' : '--'} />
            <M l="Workouts" v={whoop.workout_count != null ? String(whoop.workout_count) : '--'} />
            <M l="Naps" v={whoop.nap_count != null ? String(whoop.nap_count) : '--'} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, fontSize: 11, color: '#94a3b8' }}>
            <span>{whoop.days_with_data ?? 0}/28 days</span><span>{whoop.pct_recorded ?? 0}% recorded</span>
          </div>
        </>) : (
          <div style={{ textAlign: 'center', padding: '24px 16px' }}>
            <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.3 }}>&#9201;</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>Awaiting WHOOP Data</div>
            <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>Data pulls automatically at 3 AM. Wear your WHOOP and keep it charged.</div>
          </div>
        )}
      </div>

      {/* WHOOP Trend (if history available) */}
      {whoopHistory.length > 1 && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18, marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 12px' }}>WHOOP Trend</h2>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${whoopHistory.length}, 1fr)`, gap: 6, textAlign: 'center' }}>
            {whoopHistory.map((h: any, i: number) => (
              <div key={i} style={{ fontSize: 11 }}>
                <div style={{ fontSize: 9, color: '#94a3b8', marginBottom: 4 }}>{new Date(h.pulled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                <div style={{ height: 40, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 4 }}>
                  <div style={{ width: 24, background: recoveryColor(h.avg_recovery_score ?? 0), borderRadius: 4, height: `${Math.max((h.avg_recovery_score ?? 0) * 0.4, 4)}px`, transition: 'height 0.3s' }} />
                </div>
                <div style={{ fontWeight: 700, color: recoveryColor(h.avg_recovery_score ?? 0) }}>{h.avg_recovery_score != null ? Math.round(h.avg_recovery_score) + '%' : '--'}</div>
                <div style={{ fontSize: 9, color: '#64748b' }}>Recovery</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${whoopHistory.length}, 1fr)`, gap: 6, textAlign: 'center', marginTop: 8, borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
            {whoopHistory.map((h: any, i: number) => (
              <div key={i}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0d9488' }}>{h.avg_hrv_rmssd_ms != null ? Math.round(h.avg_hrv_rmssd_ms) : '--'}</div>
                <div style={{ fontSize: 9, color: '#64748b' }}>HRV</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#334155', marginTop: 2 }}>{h.avg_total_sleep_min != null ? Math.floor(h.avg_total_sleep_min / 60) + 'h' : '--'}</div>
                <div style={{ fontSize: 9, color: '#64748b' }}>Sleep</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assessment Scores */}
      {assessments.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18, marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 12px' }}>Your Assessment Scores</h2>
          {assessments.map((a: any, i: number) => (
            <div key={i} style={{ marginBottom: i < assessments.length - 1 ? 14 : 0, paddingBottom: i < assessments.length - 1 ? 14 : 0, borderBottom: i < assessments.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{a.rotation_name === 'BASELINE' ? 'Baseline' : `Block: ${a.rotation_name}`}</span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(a.assessment_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <div style={{ background: '#f8fafc', borderRadius: 6, padding: '7px 10px' }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>WHO-5 Wellbeing</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: (a.who5_percent ?? 0) <= 28 ? '#ef4444' : (a.who5_percent ?? 0) <= 50 ? '#f59e0b' : '#16a34a' }}>{a.who5_percent != null ? a.who5_percent + '%' : '--'}</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 6, padding: '7px 10px' }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>CBI Work Burnout</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: parseFloat(a.cbi_work_score) >= 50 ? '#ef4444' : '#16a34a' }}>{a.cbi_work_score != null ? Math.round(parseFloat(a.cbi_work_score)) + '/100' : '--'}</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 6, padding: '7px 10px' }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>PHQ-9 Depression</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: (a.phq9_total ?? 0) >= 15 ? '#ef4444' : (a.phq9_total ?? 0) >= 10 ? '#f59e0b' : '#16a34a' }}>{a.phq9_total ?? '--'}<span style={{ fontSize: 10, fontWeight: 400, color: '#94a3b8' }}>/27</span></div>
                  {a.phq9_severity && <div style={{ fontSize: 10, color: '#64748b', textTransform: 'capitalize' }}>{a.phq9_severity.replace(/_/g, ' ')}</div>}
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 6, padding: '7px 10px' }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>GAD-7 Anxiety</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: (a.gad7_total ?? 0) >= 15 ? '#ef4444' : (a.gad7_total ?? 0) >= 10 ? '#f59e0b' : '#16a34a' }}>{a.gad7_total ?? '--'}<span style={{ fontSize: 10, fontWeight: 400, color: '#94a3b8' }}>/21</span></div>
                  {a.gad7_severity && <div style={{ fontSize: 10, color: '#64748b', textTransform: 'capitalize' }}>{a.gad7_severity.replace(/_/g, ' ')}</div>}
                </div>
                {a.isi_total != null && (
                  <div style={{ background: '#f8fafc', borderRadius: 6, padding: '7px 10px' }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>ISI Insomnia</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: (a.isi_total ?? 0) >= 15 ? '#ef4444' : (a.isi_total ?? 0) >= 8 ? '#f59e0b' : '#16a34a' }}>{a.isi_total}<span style={{ fontSize: 10, fontWeight: 400, color: '#94a3b8' }}>/28</span></div>
                    {a.isi_severity && <div style={{ fontSize: 10, color: '#64748b', textTransform: 'capitalize' }}>{a.isi_severity.replace(/_/g, ' ')}</div>}
                  </div>
                )}
              </div>
              {/* Interpretation */}
              <div style={{ marginTop: 8, fontSize: 11, color: '#475569', lineHeight: 1.5, background: '#f8fafc', borderRadius: 6, padding: '8px 10px' }}>
                {(a.phq9_total ?? 0) >= 15 || (a.gad7_total ?? 0) >= 15
                  ? 'Some of your scores indicate significant distress. Please consider reaching out to the OMSB Counselling & Guidance Section for confidential support.'
                  : (a.phq9_total ?? 0) >= 10 || (a.gad7_total ?? 0) >= 10 || parseFloat(a.cbi_work_score) >= 50
                  ? 'Some scores are in the moderate range. Prioritize self-care, sleep, and social support. The research team is available if you need to talk.'
                  : 'Your scores are within normal ranges. Continue maintaining a healthy balance.'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Privacy note */}
      <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', marginBottom: 14, fontSize: 12, color: '#854d0e', lineHeight: 1.6 }}>
        <strong>Privacy:</strong> Your WHOOP data measures recovery, sleep stages, and strain — it does NOT detect or record personal activities. All data is pseudonymized under your study ID ({pid}). Only aggregated physiological metrics are stored.
      </div>

      {/* Progress */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18, marginBottom: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>Your Progress</h2>
        {[
          { label: 'Demographics', done: !!profile.demographics_completed },
          { label: 'Baseline Assessment', done: !!profile.baseline_completed },
          { label: 'WHOOP Connected', done: !!whoop, detail: whoop ? `${whoop.days_with_data} days collected` : 'Waiting for data' },
          { label: 'Weekly Check-ins', done: counts.checkins > 0, detail: `${counts.checkins} submitted` },
          { label: 'Events Logged', done: counts.events > 0, detail: `${counts.events} logged` },
          { label: 'Block Assessments', done: counts.assessments > 1, detail: `${counts.assessments} completed` },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 5 ? '1px solid #f1f5f9' : 'none' }}>
            <span style={{ fontSize: 16 }}>{item.done ? '\u2705' : '\u2B1C'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{item.label}</div>
              {item.detail && <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.detail}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* About */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>About This Study</h2>
        <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.7, margin: '0 0 10px' }}>
          Burnout &amp; Biophysical Parameters study using WHOOP wearables. Multi-center cohort at SQUH, Royal Hospital, and AFH.
        </p>
        <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
          <strong>Ethics:</strong> MREC #3190 (SQU) + Royal Hospital<br />
          <strong>Privacy:</strong> Identified by study ID only ({pid})<br />
          <strong>Contact:</strong> <a href="mailto:mrawahi@squ.edu.om" style={{ color: '#0d9488' }}>mrawahi@squ.edu.om</a>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ text }: { text: string }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, borderBottom: '2px solid #f1f5f9', paddingBottom: 4 }}>{text}</div>;
}

/* Error Boundary */
class DashboardErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Dashboard crash:', error, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24 }}>
          <div style={{ background: '#fef2f2', border: '2px solid #dc2626', borderRadius: 12, padding: 24 }}>
            <h2 style={{ color: '#dc2626', margin: '0 0 12px', fontSize: 18 }}>Something went wrong</h2>
            <pre style={{ fontSize: 12, color: '#991b1b', whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#fff', padding: 12, borderRadius: 8 }}>{this.state.error.message}</pre>
            <button onClick={() => window.location.reload()} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontWeight: 600, marginTop: 8 }}>Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ── Nav Items ── */
const NAV_ITEMS = [
  { path: '/resident/dashboard', label: 'Dashboard', icon: '\uD83C\uDFE0' },
  { path: '/resident/questionnaire', label: 'Assessment', icon: '\uD83D\uDCCB' },
  { path: '/resident/checkin', label: 'Check-in', icon: '\u2705' },
  { path: '/resident/events', label: 'Events', icon: '\uD83D\uDCC5' },
];

/* ── Main Layout ── */
export default function ResidentLayout() {
  const { residentProfile, loading, signOut, user, staff } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>&#128300;</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!residentProfile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-muted)', padding: 24 }}>
        <div style={{ maxWidth: 500, background: 'white', borderRadius: 16, padding: 32, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 40, marginBottom: 12, textAlign: 'center' }}>&#9888;&#65039;</div>
          <h2 style={{ color: '#0f766e', margin: '0 0 12px', textAlign: 'center' }}>WHOOP Not Connected</h2>
          <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.7, marginBottom: 16 }}>
            Signed in as <strong>{user?.email}</strong>, but no participant record found.
            You need to <strong>connect your WHOOP device first</strong> before you can access the dashboard.
          </p>
          <a href="/enroll/whoop" style={{ display: 'block', textAlign: 'center', padding: '14px 24px', borderRadius: 10, background: '#0f766e', color: 'white', fontWeight: 700, fontSize: 15, textDecoration: 'none', marginBottom: 12 }}>
            Connect WHOOP & Enroll
          </a>
          <button onClick={signOut} style={{ width: '100%', padding: '10px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#64748b' }}>Sign Out</button>
        </div>
      </div>
    );
  }

  if (!residentProfile.demographics_completed && location.pathname !== '/resident/demographics') {
    return <Navigate to="/resident/demographics" replace />;
  }
  if (residentProfile.demographics_completed && !residentProfile.baseline_completed && location.pathname !== '/resident/baseline') {
    return <Navigate to="/resident/baseline" replace />;
  }

  const hideNav = location.pathname === '/resident/demographics' || location.pathname === '/resident/baseline';
  const isDashboard = location.pathname === '/resident/dashboard' || location.pathname === '/resident';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-muted)' }}>
      <header style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/images/logo_final_v2.png" alt="MedResearch" style={{ height: 28 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', lineHeight: 1.3 }}>{residentProfile.full_name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID: {residentProfile.study_participant_id}</div>
          </div>
        </div>
        <button onClick={signOut} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Sign Out</button>
      </header>

      <main style={{ flex: 1, padding: '20px 16px', paddingBottom: hideNav ? 24 : 80, maxWidth: 600, width: '100%', margin: '0 auto' }}>
        {isDashboard
          ? <InlineDashboard profile={residentProfile} />
          : <DashboardErrorBoundary><Outlet /></DashboardErrorBoundary>
        }
      </main>

      {!hideNav && <nav style={{ position: 'fixed', top: 'auto', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '8px 0 calc(8px + env(safe-area-inset-bottom, 0px))', zIndex: 50, boxShadow: '0 -2px 10px rgba(0,0,0,0.05)', backdropFilter: 'none' }}>
        {NAV_ITEMS.map(item => {
          const active = location.pathname.startsWith(item.path);
          return (
            <Link key={item.path} to={item.path} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '4px 12px', textDecoration: 'none', color: active ? 'var(--primary)' : 'var(--text-muted)', fontSize: 10, fontWeight: active ? 700 : 500 }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>}
    </div>
  );
}
