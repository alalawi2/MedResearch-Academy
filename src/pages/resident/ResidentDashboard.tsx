import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

/* ------------------------------------------------------------------ */
/*  Simple types                                                       */
/* ------------------------------------------------------------------ */

interface WhoopData {
  avg_recovery_score: number | null;
  avg_hrv_rmssd_ms: number | null;
  avg_resting_hr_bpm: number | null;
  avg_total_sleep_min: number | null;
  avg_daily_strain: number | null;
  avg_sleep_efficiency_pct: number | null;
  avg_spo2_pct: number | null;
  avg_respiratory_rate_bpm: number | null;
  avg_skin_temp_c: number | null;
  days_with_data: number | null;
  pct_recorded: number | null;
  pulled_at: string;
}

interface WeeklyCheckin {
  week_start: string;
  hours_worked: number | null;
  on_call_count: number | null;
  call_type: string | null;
  sleep_rating: number | null;
  stress_level: number | null;
}

interface BlockAssessment {
  assessment_date: string;
  who5_total: number | null;
  cbi_personal_score: number | null;
  cbi_work_score: number | null;
  cbi_patient_score: number | null;
  phq9_total: number | null;
  gad7_total: number | null;
  isi_total: number | null;
}

interface WhoopPullHistory {
  pulled_at: string;
  avg_recovery_score: number | null;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ResidentDashboard() {
  const { residentProfile } = useAuth();
  const [, setStatus] = useState('Initializing...');
  const [whoop, setWhoop] = useState<WhoopData | null>(null);
  const [prevWhoop, setPrevWhoop] = useState<WhoopData | null>(null);
  const [whoopError, setWhoopError] = useState<string | null>(null);
  const [assessmentCount, setAssessmentCount] = useState(0);
  const [checkinCount, setCheckinCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [checkins, setCheckins] = useState<WeeklyCheckin[]>([]);
  const [assessments, setAssessments] = useState<BlockAssessment[]>([]);
  const [whoopHistory, setWhoopHistory] = useState<WhoopPullHistory[]>([]);

  useEffect(() => {
    if (!residentProfile) {
      setStatus('Waiting for profile...');
      return;
    }
    setStatus(`Profile loaded: ${residentProfile.study_participant_id}`);
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residentProfile]);

  async function loadData() {
    if (!residentProfile) return;
    const rid = residentProfile.id;
    const log: string[] = [];

    // Check session
    const { data: sess } = await supabase.auth.getSession();
    if (!sess?.session) {
      setStatus('ERROR: No active auth session');
      setLoaded(true);
      return;
    }
    log.push('Session OK');

    // WHOOP — fetch latest 2 pulls for trend comparison
    const { data: wData, error: wErr } = await supabase
      .from('whoop_pulls')
      .select('avg_recovery_score, avg_hrv_rmssd_ms, avg_resting_hr_bpm, avg_total_sleep_min, avg_daily_strain, avg_sleep_efficiency_pct, avg_spo2_pct, avg_respiratory_rate_bpm, avg_skin_temp_c, days_with_data, pct_recorded, pulled_at')
      .eq('resident_id', rid)
      .order('pulled_at', { ascending: false })
      .limit(2);

    if (wErr) {
      setWhoopError(wErr.message);
      log.push(`WHOOP error: ${wErr.message}`);
    } else if (wData && wData.length > 0) {
      setWhoop(wData[0] as WhoopData);
      if (wData.length > 1) setPrevWhoop(wData[1] as WhoopData);
      log.push(`WHOOP: ${wData.length} row(s)`);
    } else {
      log.push('WHOOP: 0 rows (empty)');
    }

    // Block assessments count
    const { count: baCount, error: baErr } = await supabase
      .from('block_assessments')
      .select('id', { count: 'exact' })
      .eq('resident_id', rid).limit(0);
    if (baErr) log.push(`Assessments error: ${baErr.message}`);
    else { setAssessmentCount(baCount ?? 0); log.push(`Assessments: ${baCount ?? 0}`); }

    // Weekly checkins count
    const { count: wcCount, error: wcErr } = await supabase
      .from('weekly_checkins')
      .select('id', { count: 'exact' })
      .eq('resident_id', rid).limit(0);
    if (wcErr) log.push(`Checkins error: ${wcErr.message}`);
    else { setCheckinCount(wcCount ?? 0); log.push(`Checkins: ${wcCount ?? 0}`); }

    // Event count
    const { count: evCount, error: evErr } = await supabase
      .from('event_logs')
      .select('id', { count: 'exact' })
      .eq('resident_id', rid).limit(0);
    if (evErr) log.push(`Events error: ${evErr.message}`);
    else { setEventCount(evCount ?? 0); log.push(`Events: ${evCount ?? 0}`); }

    // Weekly checkins — last 8 weeks for trend timeline
    const { data: ciData, error: ciErr } = await supabase
      .from('weekly_checkins')
      .select('week_start, hours_worked, on_call_count, call_type, sleep_rating, stress_level')
      .eq('resident_id', rid)
      .order('week_start', { ascending: false })
      .limit(8);
    if (ciErr) log.push(`Checkins detail error: ${ciErr.message}`);
    else if (ciData) { setCheckins(ciData as WeeklyCheckin[]); log.push(`Checkin details: ${ciData.length}`); }

    // Block assessments — last 6 for score history
    const { data: asData, error: asErr } = await supabase
      .from('block_assessments')
      .select('assessment_date, who5_total, cbi_personal_score, cbi_work_score, cbi_patient_score, phq9_total, gad7_total, isi_total')
      .eq('resident_id', rid)
      .order('assessment_date', { ascending: false })
      .limit(6);
    if (asErr) log.push(`Assessment detail error: ${asErr.message}`);
    else if (asData) { setAssessments(asData as BlockAssessment[]); log.push(`Assessment details: ${asData.length}`); }

    // WHOOP recovery history — last 6 pulls for trend chart
    const { data: whData, error: whErr } = await supabase
      .from('whoop_pulls')
      .select('pulled_at, avg_recovery_score')
      .eq('resident_id', rid)
      .order('pulled_at', { ascending: false })
      .limit(6);
    if (whErr) log.push(`WHOOP history error: ${whErr.message}`);
    else if (whData) { setWhoopHistory(whData as WhoopPullHistory[]); log.push(`WHOOP history: ${whData.length}`); }

    setStatus(log.join(' | '));
    setLoaded(true);
  }

  const name = residentProfile?.full_name?.split(' ')[0] || 'Resident';
  const pid = residentProfile?.study_participant_id || '---';

  /* ---------------------------------------------------------------- */
  /*  Helpers                                                          */
  /* ---------------------------------------------------------------- */

  function fmtMin(min: number | null): string {
    if (min == null) return '--';
    const h = Math.floor(min / 60);
    const m = Math.round(min % 60);
    return `${h}h ${m}m`;
  }

  function fmtNum(v: number | null, d = 1, suffix = ''): string {
    if (v == null) return '--';
    return v.toFixed(d) + suffix;
  }

  /* Trend helper — compares current vs previous pull */
  function trend(current: number | null | undefined, previous: number | null | undefined, inverse = false): { arrow: string; color: string } | null {
    if (current == null || previous == null) return null;
    const diff = current - previous;
    const threshold = Math.abs(previous) * 0.03; // 3% change threshold
    if (Math.abs(diff) < threshold) return null; // no significant change
    const improving = inverse ? diff < 0 : diff > 0;
    return {
      arrow: improving ? '\u25B2' : '\u25BC',
      color: improving ? '#10b981' : '#ef4444',
    };
  }

  /* Color helpers for each metric */
  const STATUS_GREEN = '#10b981';
  const STATUS_AMBER = '#f59e0b';
  const STATUS_RED = '#ef4444';

  function recoveryStatus(v: number | null): { color: string; label: string } {
    if (v == null) return { color: '#64748b', label: 'No data' };
    if (v >= 67) return { color: STATUS_GREEN, label: 'Optimal' };
    if (v >= 34) return { color: STATUS_AMBER, label: 'Caution' };
    return { color: STATUS_RED, label: 'Concern' };
  }

  function hrvStatus(v: number | null): { color: string; label: string } {
    if (v == null) return { color: '#64748b', label: 'No data' };
    if (v >= 50) return { color: STATUS_GREEN, label: 'Optimal' };
    if (v >= 30) return { color: STATUS_AMBER, label: 'Caution' };
    return { color: STATUS_RED, label: 'Concern' };
  }

  function restingHrStatus(v: number | null): { color: string; label: string } {
    if (v == null) return { color: '#64748b', label: 'No data' };
    if (v <= 65) return { color: STATUS_GREEN, label: 'Optimal' };
    if (v <= 80) return { color: STATUS_AMBER, label: 'Caution' };
    return { color: STATUS_RED, label: 'Concern' };
  }

  function sleepStatus(min: number | null): { color: string; label: string } {
    if (min == null) return { color: '#64748b', label: 'No data' };
    const h = min / 60;
    if (h >= 7) return { color: STATUS_GREEN, label: 'Optimal' };
    if (h >= 6) return { color: STATUS_AMBER, label: 'Caution' };
    return { color: STATUS_RED, label: 'Concern' };
  }

  function sleepEffStatus(v: number | null): { color: string; label: string } {
    if (v == null) return { color: '#64748b', label: 'No data' };
    if (v >= 85) return { color: STATUS_GREEN, label: 'Optimal' };
    if (v >= 75) return { color: STATUS_AMBER, label: 'Caution' };
    return { color: STATUS_RED, label: 'Concern' };
  }

  function strainStatus(v: number | null): { color: string; label: string } {
    if (v == null) return { color: '#64748b', label: 'No data' };
    if (v >= 8 && v <= 14) return { color: STATUS_GREEN, label: 'Optimal' };
    if ((v >= 4 && v < 8) || (v > 14 && v <= 18)) return { color: STATUS_AMBER, label: 'Caution' };
    return { color: STATUS_RED, label: 'Concern' };
  }

  function spo2Status(v: number | null): { color: string; label: string } {
    if (v == null) return { color: '#64748b', label: 'No data' };
    if (v >= 96) return { color: STATUS_GREEN, label: 'Optimal' };
    if (v >= 93) return { color: STATUS_AMBER, label: 'Caution' };
    return { color: STATUS_RED, label: 'Concern' };
  }

  function rrStatus(v: number | null): { color: string; label: string } {
    if (v == null) return { color: '#64748b', label: 'No data' };
    if (v >= 12 && v <= 20) return { color: STATUS_GREEN, label: 'Normal' };
    return { color: STATUS_AMBER, label: 'Caution' };
  }

  function skinTempStatus(v: number | null): { color: string; label: string } {
    if (v == null) return { color: '#64748b', label: 'No data' };
    const diff = Math.abs(v - 33.0);
    if (diff <= 0.5) return { color: STATUS_GREEN, label: 'Normal' };
    if (diff <= 1.0) return { color: STATUS_AMBER, label: 'Caution' };
    return { color: STATUS_RED, label: 'Concern' };
  }

  /* ── Assessment score severity helpers ── */

  function who5Severity(v: number | null): { color: string; label: string } {
    if (v == null) return { color: '#64748b', label: 'No data' };
    if (v >= 52) return { color: STATUS_GREEN, label: 'Good' };
    if (v >= 28) return { color: STATUS_AMBER, label: 'Low' };
    return { color: STATUS_RED, label: 'Poor' };
  }

  function cbiWorkSeverity(v: number | null): { color: string; label: string } {
    if (v == null) return { color: '#64748b', label: 'No data' };
    if (v < 25) return { color: STATUS_GREEN, label: 'Low' };
    if (v < 50) return { color: STATUS_AMBER, label: 'Moderate' };
    if (v < 75) return { color: '#f97316', label: 'High' };
    return { color: STATUS_RED, label: 'Severe' };
  }

  function phq9Severity(v: number | null): { color: string; label: string } {
    if (v == null) return { color: '#64748b', label: 'No data' };
    if (v <= 4) return { color: STATUS_GREEN, label: 'Minimal' };
    if (v <= 9) return { color: STATUS_AMBER, label: 'Mild' };
    if (v <= 14) return { color: '#f97316', label: 'Moderate' };
    return { color: STATUS_RED, label: 'Severe' };
  }

  function gad7Severity(v: number | null): { color: string; label: string } {
    if (v == null) return { color: '#64748b', label: 'No data' };
    if (v <= 4) return { color: STATUS_GREEN, label: 'Minimal' };
    if (v <= 9) return { color: STATUS_AMBER, label: 'Mild' };
    if (v <= 14) return { color: '#f97316', label: 'Moderate' };
    return { color: STATUS_RED, label: 'Severe' };
  }

  function isiSeverity(v: number | null): { color: string; label: string } {
    if (v == null) return { color: '#64748b', label: 'No data' };
    if (v <= 7) return { color: STATUS_GREEN, label: 'None' };
    if (v <= 14) return { color: STATUS_AMBER, label: 'Subthreshold' };
    if (v <= 21) return { color: '#f97316', label: 'Moderate' };
    return { color: STATUS_RED, label: 'Severe' };
  }

  function ratingDotColor(rating: number | null): string {
    if (rating == null) return '#64748b';
    if (rating >= 4) return STATUS_GREEN;
    if (rating >= 3) return STATUS_AMBER;
    return STATUS_RED;
  }

  function stressDotColor(level: number | null): string {
    if (level == null) return '#64748b';
    if (level <= 2) return STATUS_GREEN;
    if (level <= 3) return STATUS_AMBER;
    return STATUS_RED;
  }

  /* Checkin averages helper */
  function calcCheckinAverages(items: WeeklyCheckin[]): { avgHours: number; avgStress: number; avgSleep: number } {
    if (items.length === 0) return { avgHours: 0, avgStress: 0, avgSleep: 0 };
    let hSum = 0, hCount = 0, sSum = 0, sCount = 0, slSum = 0, slCount = 0;
    for (const c of items) {
      if (c.hours_worked != null) { hSum += c.hours_worked; hCount++; }
      if (c.stress_level != null) { sSum += c.stress_level; sCount++; }
      if (c.sleep_rating != null) { slSum += c.sleep_rating; slCount++; }
    }
    return {
      avgHours: hCount > 0 ? hSum / hCount : 0,
      avgStress: sCount > 0 ? sSum / sCount : 0,
      avgSleep: slCount > 0 ? slSum / slCount : 0,
    };
  }

  /* Check if any elevated scores in latest assessment */
  const latestAssessment = assessments.length > 0 ? assessments[0] : null;
  const hasElevatedScores = latestAssessment != null && (
    (latestAssessment.phq9_total != null && latestAssessment.phq9_total >= 10) ||
    (latestAssessment.gad7_total != null && latestAssessment.gad7_total >= 10) ||
    (latestAssessment.cbi_work_score != null && latestAssessment.cbi_work_score >= 50)
  );

  /* Block comparison — latest 4 vs previous 4 */
  const recentBlock = checkins.slice(0, 4);
  const previousBlock = checkins.slice(4, 8);
  const recentAvg = calcCheckinAverages(recentBlock);
  const prevAvg = calcCheckinAverages(previousBlock);
  const hasBlockComparison = recentBlock.length > 0 && previousBlock.length > 0;

  /* Generate personalized insight text */
  function getInsightText(): string {
    if (!whoop) return '';
    const parts: string[] = [];

    const rec = whoop.avg_recovery_score;
    if (rec != null) {
      if (rec >= 67) parts.push('Your recovery is in the green zone -- your body is well-adapted to current demands. You can handle higher training loads today.');
      else if (rec >= 34) parts.push('Recovery is moderate. Consider balancing workload with rest, and prioritize sleep quality tonight.');
      else parts.push('Recovery is critically low. Your body is signaling accumulated stress. Prioritize rest and consider reducing on-call intensity if possible.');
    }

    const sleep = whoop.avg_total_sleep_min;
    if (sleep != null) {
      const hrs = sleep / 60;
      if (hrs >= 7) parts.push(`Averaging ${fmtMin(sleep)} of sleep -- meeting the 7-hour target for cognitive performance.`);
      else if (hrs >= 6) parts.push(`Averaging ${fmtMin(sleep)} sleep -- slightly below the 7-hour threshold. Even 30 extra minutes can improve clinical decision-making.`);
      else parts.push(`Only ${fmtMin(sleep)} average sleep -- significantly below recommended. Sleep debt impairs memory consolidation and clinical judgment.`);
    }

    const strain = whoop.avg_daily_strain;
    if (strain != null && rec != null) {
      if (strain > 18 && rec < 50) parts.push('High strain combined with low recovery may indicate overtraining risk.');
      else if (strain < 4 && rec >= 67) parts.push('Low strain with high recovery -- capacity for more physical activity.');
    }

    return parts.join(' ');
  }

  /* Progress calculation */
  const progressItems = [
    { label: 'Demographics', done: !!residentProfile?.demographics_completed },
    { label: 'Baseline Assessment', done: !!residentProfile?.baseline_completed },
    { label: 'WHOOP Connected', done: !!whoop },
    { label: 'Check-ins Completed', done: checkinCount > 0, detail: `${checkinCount} submitted` },
    { label: 'Events Logged', done: eventCount > 0, detail: `${eventCount} logged` },
    { label: 'Block Assessments', done: assessmentCount > 1, detail: `${assessmentCount} completed` },
  ];
  const progressPct = Math.round((progressItems.filter(i => i.done).length / progressItems.length) * 100);

  /* ---------------------------------------------------------------- */
  /*  Styles                                                           */
  /* ---------------------------------------------------------------- */

  const cardShadow = '0 4px 24px rgba(0,0,0,0.06)';
  const cardRadius = 16;

  const metricCardStyle = (statusColor: string): React.CSSProperties => ({
    background: '#fff',
    borderRadius: 12,
    padding: '14px 16px',
    position: 'relative',
    borderLeft: `3px solid ${statusColor}`,
    transition: 'transform 0.15s ease',
  });

  const metricLabelStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 4,
  };

  const metricValueStyle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 2,
  };

  const statusDotStyle = (color: string): React.CSSProperties => ({
    display: 'inline-block',
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: color,
    marginRight: 5,
    verticalAlign: 'middle',
  });

  const statusTextStyle: React.CSSProperties = {
    fontSize: 10,
    color: '#94a3b8',
    verticalAlign: 'middle',
  };

  const metricInfoStyle: React.CSSProperties = {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 4,
    lineHeight: 1.4,
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 8px 40px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

      {/* ============================================================ */}
      {/*  HEADER                                                       */}
      {/* ============================================================ */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #134e4a 50%, #0f766e 100%)',
        borderRadius: `0 0 ${cardRadius + 8}px ${cardRadius + 8}px`,
        padding: '32px 24px 28px',
        marginBottom: 24,
        marginLeft: -8,
        marginRight: -8,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glassmorphism decorative circles */}
        <div style={{
          position: 'absolute', top: -30, right: -30, width: 120, height: 120,
          borderRadius: '50%', background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
        }} />
        <div style={{
          position: 'absolute', bottom: -20, left: 40, width: 80, height: 80,
          borderRadius: '50%', background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.05)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 500, marginBottom: 4, letterSpacing: '0.02em' }}>
            Welcome back
          </div>
          <h1 style={{
            fontSize: 28, fontWeight: 700, color: '#fff', margin: '0 0 12px',
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}>
            {name}
          </h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 99,
              background: 'rgba(255,255,255,0.12)', color: '#5eead4',
              backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)',
              letterSpacing: '0.06em',
            }}>
              {pid}
            </span>
            <Link to="/resident/set-password" style={{
              fontSize: 11, fontWeight: 600, padding: '4px 14px', borderRadius: 99,
              background: 'rgba(13,148,136,0.3)', color: '#99f6e4',
              textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)',
            }}>
              Set Password
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  WEEKLY GUIDE                                                  */}
      {/* ============================================================ */}
      <div style={{
        padding: '16px 20px', borderRadius: cardRadius, marginBottom: 20,
        background: 'linear-gradient(135deg, #f0fdfa 0%, #f0f9ff 100%)',
        border: '1px solid #ccfbf1',
        boxShadow: cardShadow,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f766e', marginBottom: 8 }}>
          Weekly Tasks
        </div>
        <div style={{ fontSize: 12, color: '#1e3a5a', lineHeight: 2 }}>
          1. <strong>Wear WHOOP 24/7</strong> -- data pulls at 3 AM<br />
          2. <strong>Weekly check-in</strong> -- 2 min, hours/calls/sleep/stress<br />
          3. <strong>Log events</strong> -- clinical, academic, personal<br />
          4. <strong>Block assessment</strong> -- opens week 3 of each rotation
        </div>
      </div>

      {/* ============================================================ */}
      {/*  ACTION CARDS                                                  */}
      {/* ============================================================ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
        {/* Assessment */}
        <Link to="/resident/questionnaire" style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
          borderRadius: cardRadius,
          padding: '20px 12px 18px',
          textDecoration: 'none',
          textAlign: 'center',
          boxShadow: cardShadow,
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, margin: '0 auto 10px',
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>
            &#128203;
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', marginBottom: 6, lineHeight: 1.3 }}>Block Assessment</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#2563eb', lineHeight: 1 }}>{assessmentCount}</div>
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>completed</div>
        </Link>

        {/* Check-in */}
        <Link to="/resident/checkin" style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
          borderRadius: cardRadius,
          padding: '20px 12px 18px',
          textDecoration: 'none',
          textAlign: 'center',
          boxShadow: cardShadow,
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, margin: '0 auto 10px',
            background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>
            &#9989;
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', marginBottom: 6, lineHeight: 1.3 }}>Weekly Check-in</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#16a34a', lineHeight: 1 }}>{checkinCount}</div>
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>submitted</div>
        </Link>

        {/* Events */}
        <Link to="/resident/events" style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
          borderRadius: cardRadius,
          padding: '20px 12px 18px',
          textDecoration: 'none',
          textAlign: 'center',
          boxShadow: cardShadow,
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, margin: '0 auto 10px',
            background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>
            &#128197;
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', marginBottom: 6, lineHeight: 1.3 }}>Event Log</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#7c3aed', lineHeight: 1 }}>{eventCount}</div>
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>logged</div>
        </Link>
      </div>

      {/* ============================================================ */}
      {/*  WHOOP BIOMETRICS                                              */}
      {/* ============================================================ */}
      <div style={{
        background: '#fff',
        borderRadius: cardRadius,
        padding: '24px 20px',
        marginBottom: 24,
        boxShadow: cardShadow,
        border: '1px solid #e2e8f0',
      }}>
        {/* Section header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0, fontFamily: 'Georgia, "Times New Roman", serif' }}>
              WHOOP Biometrics
            </h2>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Wearable health metrics</div>
          </div>
          {whoop && (
            <span style={{
              fontSize: 10, color: '#0d9488', fontWeight: 600,
              padding: '3px 10px', borderRadius: 99,
              background: '#f0fdfa', border: '1px solid #ccfbf1',
            }}>
              {new Date(whoop.pulled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>

        {whoopError ? (
          <div style={{
            padding: '20px', background: 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)',
            borderRadius: 12, color: '#991b1b', fontSize: 13, border: '1px solid #fecaca',
          }}>
            Unable to load WHOOP data: {whoopError}
          </div>
        ) : whoop ? (
          <>
            {/* ── Hero Rings ── */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              borderRadius: 14, padding: '28px 12px 24px',
            }}>
              {/* Recovery Ring */}
              {(() => {
                const s = recoveryStatus(whoop.avg_recovery_score);
                return (
                  <div>
                    <div style={{
                      width: 88, height: 88, borderRadius: '50%', margin: '0 auto 10px',
                      border: `5px solid ${s.color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `radial-gradient(circle, ${s.color}11 0%, transparent 70%)`,
                      boxShadow: `0 0 20px ${s.color}33`,
                    }}>
                      <span style={{ fontSize: 22, fontWeight: 800, color: s.color }}>
                        {whoop.avg_recovery_score != null ? `${Math.round(whoop.avg_recovery_score)}%` : '--'}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.02em' }}>Recovery</div>
                    <div style={{ fontSize: 10, color: s.color, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                  </div>
                );
              })()}

              {/* HRV Ring */}
              {(() => {
                const s = hrvStatus(whoop.avg_hrv_rmssd_ms);
                return (
                  <div>
                    <div style={{
                      width: 88, height: 88, borderRadius: '50%', margin: '0 auto 10px',
                      border: `5px solid ${s.color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `radial-gradient(circle, ${s.color}11 0%, transparent 70%)`,
                      boxShadow: `0 0 20px ${s.color}33`,
                    }}>
                      <span style={{ fontSize: 22, fontWeight: 800, color: s.color }}>
                        {whoop.avg_hrv_rmssd_ms != null ? Math.round(whoop.avg_hrv_rmssd_ms) : '--'}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.02em' }}>HRV (ms)</div>
                    <div style={{ fontSize: 10, color: s.color, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                  </div>
                );
              })()}

              {/* Strain Ring */}
              {(() => {
                const s = strainStatus(whoop.avg_daily_strain);
                return (
                  <div>
                    <div style={{
                      width: 88, height: 88, borderRadius: '50%', margin: '0 auto 10px',
                      border: `5px solid ${s.color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `radial-gradient(circle, ${s.color}11 0%, transparent 70%)`,
                      boxShadow: `0 0 20px ${s.color}33`,
                    }}>
                      <span style={{ fontSize: 22, fontWeight: 800, color: s.color }}>
                        {whoop.avg_daily_strain != null ? whoop.avg_daily_strain.toFixed(1) : '--'}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.02em' }}>Strain</div>
                    <div style={{ fontSize: 10, color: s.color, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                  </div>
                );
              })()}
            </div>

            {/* ── Personalized Insight ── */}
            {getInsightText() && (
              <div style={{
                background: 'linear-gradient(135deg, #f0fdfa 0%, #f0f9ff 100%)',
                borderRadius: 12, padding: '14px 16px', marginBottom: 24,
                fontSize: 13, color: '#134e4a', lineHeight: 1.7,
                border: '1px solid #ccfbf1',
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  Personalized Insight
                </div>
                {getInsightText()}
              </div>
            )}

            {/* ── Category: Recovery & Heart ── */}
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: '#0f766e', textTransform: 'uppercase',
                letterSpacing: '0.08em', marginBottom: 10, paddingLeft: 2,
              }}>
                Recovery & Heart
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {/* Recovery */}
                {(() => {
                  const s = recoveryStatus(whoop.avg_recovery_score);
                  const t = trend(whoop.avg_recovery_score, prevWhoop?.avg_recovery_score);
                  return (
                    <div style={metricCardStyle(s.color)}>
                      <div style={metricLabelStyle}>Recovery</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={metricValueStyle}>{fmtNum(whoop.avg_recovery_score, 0, '%')}</span>
                        {t && <span style={{ fontSize: 12, fontWeight: 700, color: t.color }}>{t.arrow}</span>}
                      </div>
                      <div>
                        <span style={statusDotStyle(s.color)} />
                        <span style={statusTextStyle}>{s.label}</span>
                      </div>
                      <div style={metricInfoStyle}>Readiness for physical and mental strain</div>
                    </div>
                  );
                })()}

                {/* HRV */}
                {(() => {
                  const s = hrvStatus(whoop.avg_hrv_rmssd_ms);
                  const t = trend(whoop.avg_hrv_rmssd_ms, prevWhoop?.avg_hrv_rmssd_ms);
                  return (
                    <div style={metricCardStyle(s.color)}>
                      <div style={metricLabelStyle}>HRV</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={metricValueStyle}>{fmtNum(whoop.avg_hrv_rmssd_ms, 0, ' ms')}</span>
                        {t && <span style={{ fontSize: 12, fontWeight: 700, color: t.color }}>{t.arrow}</span>}
                      </div>
                      <div>
                        <span style={statusDotStyle(s.color)} />
                        <span style={statusTextStyle}>{s.label}</span>
                      </div>
                      <div style={metricInfoStyle}>Autonomic resilience indicator</div>
                    </div>
                  );
                })()}

                {/* Resting HR */}
                {(() => {
                  const s = restingHrStatus(whoop.avg_resting_hr_bpm);
                  const t = trend(whoop.avg_resting_hr_bpm, prevWhoop?.avg_resting_hr_bpm, true);
                  return (
                    <div style={metricCardStyle(s.color)}>
                      <div style={metricLabelStyle}>Resting HR</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={metricValueStyle}>{fmtNum(whoop.avg_resting_hr_bpm, 0, ' bpm')}</span>
                        {t && <span style={{ fontSize: 12, fontWeight: 700, color: t.color }}>{t.arrow}</span>}
                      </div>
                      <div>
                        <span style={statusDotStyle(s.color)} />
                        <span style={statusTextStyle}>{s.label}</span>
                      </div>
                      <div style={metricInfoStyle}>Lower is better for cardiovascular fitness</div>
                    </div>
                  );
                })()}

                {/* SpO2 */}
                {(() => {
                  const s = spo2Status(whoop.avg_spo2_pct);
                  const t = trend(whoop.avg_spo2_pct, prevWhoop?.avg_spo2_pct);
                  return (
                    <div style={metricCardStyle(s.color)}>
                      <div style={metricLabelStyle}>SpO2</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={metricValueStyle}>{fmtNum(whoop.avg_spo2_pct, 1, '%')}</span>
                        {t && <span style={{ fontSize: 12, fontWeight: 700, color: t.color }}>{t.arrow}</span>}
                      </div>
                      <div>
                        <span style={statusDotStyle(s.color)} />
                        <span style={statusTextStyle}>{s.label}</span>
                      </div>
                      <div style={metricInfoStyle}>Blood oxygen saturation level</div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* ── Category: Sleep ── */}
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: '#0f766e', textTransform: 'uppercase',
                letterSpacing: '0.08em', marginBottom: 10, paddingLeft: 2,
              }}>
                Sleep
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {/* Total Sleep */}
                {(() => {
                  const s = sleepStatus(whoop.avg_total_sleep_min);
                  const t = trend(whoop.avg_total_sleep_min, prevWhoop?.avg_total_sleep_min);
                  return (
                    <div style={metricCardStyle(s.color)}>
                      <div style={metricLabelStyle}>Total Sleep</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={metricValueStyle}>{fmtMin(whoop.avg_total_sleep_min)}</span>
                        {t && <span style={{ fontSize: 12, fontWeight: 700, color: t.color }}>{t.arrow}</span>}
                      </div>
                      <div>
                        <span style={statusDotStyle(s.color)} />
                        <span style={statusTextStyle}>{s.label}</span>
                      </div>
                      <div style={metricInfoStyle}>Target 7+ hours for cognitive function</div>
                    </div>
                  );
                })()}

                {/* Sleep Efficiency */}
                {(() => {
                  const s = sleepEffStatus(whoop.avg_sleep_efficiency_pct);
                  const t = trend(whoop.avg_sleep_efficiency_pct, prevWhoop?.avg_sleep_efficiency_pct);
                  return (
                    <div style={metricCardStyle(s.color)}>
                      <div style={metricLabelStyle}>Sleep Efficiency</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={metricValueStyle}>{fmtNum(whoop.avg_sleep_efficiency_pct, 0, '%')}</span>
                        {t && <span style={{ fontSize: 12, fontWeight: 700, color: t.color }}>{t.arrow}</span>}
                      </div>
                      <div>
                        <span style={statusDotStyle(s.color)} />
                        <span style={statusTextStyle}>{s.label}</span>
                      </div>
                      <div style={metricInfoStyle}>Time asleep vs. time in bed</div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* ── Category: Activity & Strain ── */}
            <div style={{ marginBottom: 10 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: '#0f766e', textTransform: 'uppercase',
                letterSpacing: '0.08em', marginBottom: 10, paddingLeft: 2,
              }}>
                Activity & Strain
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {/* Daily Strain */}
                {(() => {
                  const s = strainStatus(whoop.avg_daily_strain);
                  const t = trend(whoop.avg_daily_strain, prevWhoop?.avg_daily_strain);
                  return (
                    <div style={metricCardStyle(s.color)}>
                      <div style={metricLabelStyle}>Daily Strain</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={metricValueStyle}>{fmtNum(whoop.avg_daily_strain, 1)}</span>
                        {t && <span style={{ fontSize: 12, fontWeight: 700, color: t.color }}>{t.arrow}</span>}
                      </div>
                      <div>
                        <span style={statusDotStyle(s.color)} />
                        <span style={statusTextStyle}>{s.label}</span>
                      </div>
                      <div style={metricInfoStyle}>Optimal range: 8-14 for residents</div>
                    </div>
                  );
                })()}

                {/* Respiratory Rate */}
                {(() => {
                  const s = rrStatus(whoop.avg_respiratory_rate_bpm);
                  const t = trend(whoop.avg_respiratory_rate_bpm, prevWhoop?.avg_respiratory_rate_bpm);
                  return (
                    <div style={metricCardStyle(s.color)}>
                      <div style={metricLabelStyle}>Resp. Rate</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={metricValueStyle}>{fmtNum(whoop.avg_respiratory_rate_bpm, 1, ' br/min')}</span>
                        {t && <span style={{ fontSize: 12, fontWeight: 700, color: t.color }}>{t.arrow}</span>}
                      </div>
                      <div>
                        <span style={statusDotStyle(s.color)} />
                        <span style={statusTextStyle}>{s.label}</span>
                      </div>
                      <div style={metricInfoStyle}>Normal range: 12-20 breaths/min</div>
                    </div>
                  );
                })()}

                {/* Skin Temp */}
                {(() => {
                  const s = skinTempStatus(whoop.avg_skin_temp_c);
                  const t = trend(whoop.avg_skin_temp_c, prevWhoop?.avg_skin_temp_c);
                  return (
                    <div style={metricCardStyle(s.color)}>
                      <div style={metricLabelStyle}>Skin Temp</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={metricValueStyle}>{fmtNum(whoop.avg_skin_temp_c, 1, ' °C')}</span>
                        {t && <span style={{ fontSize: 12, fontWeight: 700, color: t.color }}>{t.arrow}</span>}
                      </div>
                      <div>
                        <span style={statusDotStyle(s.color)} />
                        <span style={statusTextStyle}>{s.label}</span>
                      </div>
                      <div style={metricInfoStyle}>Deviation from baseline (33.0 °C)</div>
                    </div>
                  );
                })()}

                {/* Data coverage */}
                <div style={metricCardStyle('#64748b')}>
                  <div style={metricLabelStyle}>Data Coverage</div>
                  <div style={metricValueStyle}>{whoop.days_with_data ?? 0} / 28 days</div>
                  <div>
                    <span style={statusDotStyle(
                      (whoop.pct_recorded ?? 0) >= 80 ? STATUS_GREEN :
                      (whoop.pct_recorded ?? 0) >= 50 ? STATUS_AMBER : STATUS_RED
                    )} />
                    <span style={statusTextStyle}>{whoop.pct_recorded ?? 0}% recorded</span>
                  </div>
                  <div style={metricInfoStyle}>Wear consistency for data quality</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* No WHOOP data state */
          <div style={{
            textAlign: 'center', padding: '36px 20px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRadius: 12,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', margin: '0 auto 14px',
              background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, opacity: 0.5,
            }}>
              &#9201;
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Awaiting WHOOP Data</div>
            <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.7 }}>
              Data is pulled automatically every night at 3 AM.<br />
              Make sure your WHOOP is worn and charged.
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/*  WEEKLY CHECK-IN TRENDS                                        */}
      {/* ============================================================ */}
      {checkins.length > 0 && (
        <div style={{
          background: '#fff',
          borderRadius: cardRadius,
          padding: '24px 20px',
          marginBottom: 24,
          boxShadow: cardShadow,
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0, fontFamily: 'Georgia, "Times New Roman", serif' }}>
              Weekly Check-in Trends
            </h2>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Last {checkins.length} weeks</div>
          </div>

          {/* Averages summary */}
          {(() => {
            const avgs = calcCheckinAverages(checkins);
            return (
              <div style={{
                display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16,
                background: 'linear-gradient(135deg, #f0fdfa 0%, #f0f9ff 100%)',
                borderRadius: 10, padding: '10px 14px',
                border: '1px solid #ccfbf1',
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#134e4a' }}>
                  Avg Hours: <strong>{avgs.avgHours > 0 ? `${Math.round(avgs.avgHours)}h` : '--'}</strong>
                </span>
                <span style={{ color: '#cbd5e1' }}>|</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#134e4a' }}>
                  Avg Stress: <strong>{avgs.avgStress > 0 ? `${avgs.avgStress.toFixed(1)}/5` : '--'}</strong>
                </span>
                <span style={{ color: '#cbd5e1' }}>|</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#134e4a' }}>
                  Avg Sleep: <strong>{avgs.avgSleep > 0 ? `${avgs.avgSleep.toFixed(1)}/5` : '--'}</strong>
                </span>
              </div>
            );
          })()}

          {/* Scrollable timeline */}
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 4 }}>
            <div style={{ display: 'flex', gap: 10, minWidth: 'max-content' }}>
              {checkins.map((c, i) => {
                const isCurrentWeek = i === 0;
                const weekDate = new Date(c.week_start);
                return (
                  <div key={c.week_start} style={{
                    minWidth: 130,
                    background: isCurrentWeek
                      ? 'linear-gradient(135deg, #0f172a 0%, #134e4a 100%)'
                      : '#f8fafc',
                    borderRadius: 12,
                    padding: '14px 12px',
                    border: isCurrentWeek ? '1px solid #0f766e' : '1px solid #e2e8f0',
                  }}>
                    <div style={{
                      fontSize: 10, fontWeight: 700, color: isCurrentWeek ? '#5eead4' : '#0f766e',
                      textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8,
                    }}>
                      {isCurrentWeek ? 'Current' : weekDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </div>
                    <div style={{ fontSize: 11, color: isCurrentWeek ? '#e2e8f0' : '#475569', marginBottom: 4 }}>
                      Hours: <strong>{c.hours_worked != null ? `${c.hours_worked}h` : '--'}</strong>
                    </div>
                    <div style={{ fontSize: 11, color: isCurrentWeek ? '#e2e8f0' : '#475569', marginBottom: 4 }}>
                      On-call: <strong>{c.on_call_count ?? '--'}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 11, color: isCurrentWeek ? '#e2e8f0' : '#475569' }}>Sleep</span>
                      <span style={{
                        display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                        background: ratingDotColor(c.sleep_rating),
                      }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: isCurrentWeek ? '#fff' : '#0f172a' }}>
                        {c.sleep_rating ?? '--'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, color: isCurrentWeek ? '#e2e8f0' : '#475569' }}>Stress</span>
                      <span style={{
                        display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                        background: stressDotColor(c.stress_level),
                      }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: isCurrentWeek ? '#fff' : '#0f172a' }}>
                        {c.stress_level ?? '--'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  BLOCK COMPARISON                                              */}
      {/* ============================================================ */}
      {hasBlockComparison && (
        <div style={{
          background: '#fff',
          borderRadius: cardRadius,
          padding: '24px 20px',
          marginBottom: 24,
          boxShadow: cardShadow,
          border: '1px solid #e2e8f0',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 4px', fontFamily: 'Georgia, "Times New Roman", serif' }}>
            This Period vs Previous
          </h2>
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 16 }}>
            Latest 4 weeks compared to prior 4 weeks
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {/* Hours/week */}
            {(() => {
              const diff = recentAvg.avgHours - prevAvg.avgHours;
              const improved = diff < 0; // fewer hours is better
              const significant = Math.abs(diff) > 2;
              return (
                <div style={metricCardStyle(significant ? (improved ? STATUS_GREEN : STATUS_RED) : '#64748b')}>
                  <div style={metricLabelStyle}>Hours / Week</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={metricValueStyle}>{recentAvg.avgHours > 0 ? `${Math.round(recentAvg.avgHours)}h` : '--'}</span>
                    {significant && (
                      <span style={{ fontSize: 12, fontWeight: 700, color: improved ? STATUS_GREEN : STATUS_RED }}>
                        {improved ? '\u25BC' : '\u25B2'}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    was {prevAvg.avgHours > 0 ? `${Math.round(prevAvg.avgHours)}h` : '--'}
                  </div>
                </div>
              );
            })()}

            {/* On-calls */}
            {(() => {
              let recentCalls = 0, rCount = 0, prevCalls = 0, pCount = 0;
              for (const c of recentBlock) if (c.on_call_count != null) { recentCalls += c.on_call_count; rCount++; }
              for (const c of previousBlock) if (c.on_call_count != null) { prevCalls += c.on_call_count; pCount++; }
              const rAvg = rCount > 0 ? recentCalls / rCount : 0;
              const pAvg = pCount > 0 ? prevCalls / pCount : 0;
              const diff = rAvg - pAvg;
              const improved = diff < 0;
              const significant = Math.abs(diff) > 0.5;
              return (
                <div style={metricCardStyle(significant ? (improved ? STATUS_GREEN : STATUS_RED) : '#64748b')}>
                  <div style={metricLabelStyle}>On-calls / Week</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={metricValueStyle}>{rAvg > 0 ? rAvg.toFixed(1) : '--'}</span>
                    {significant && (
                      <span style={{ fontSize: 12, fontWeight: 700, color: improved ? STATUS_GREEN : STATUS_RED }}>
                        {improved ? '\u25BC' : '\u25B2'}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    was {pAvg > 0 ? pAvg.toFixed(1) : '--'}
                  </div>
                </div>
              );
            })()}

            {/* Sleep rating */}
            {(() => {
              const diff = recentAvg.avgSleep - prevAvg.avgSleep;
              const improved = diff > 0; // higher sleep rating is better
              const significant = Math.abs(diff) > 0.3;
              return (
                <div style={metricCardStyle(significant ? (improved ? STATUS_GREEN : STATUS_RED) : '#64748b')}>
                  <div style={metricLabelStyle}>Sleep Rating</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={metricValueStyle}>{recentAvg.avgSleep > 0 ? `${recentAvg.avgSleep.toFixed(1)}/5` : '--'}</span>
                    {significant && (
                      <span style={{ fontSize: 12, fontWeight: 700, color: improved ? STATUS_GREEN : STATUS_RED }}>
                        {improved ? '\u25B2' : '\u25BC'}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    was {prevAvg.avgSleep > 0 ? `${prevAvg.avgSleep.toFixed(1)}/5` : '--'}
                  </div>
                </div>
              );
            })()}

            {/* Stress level */}
            {(() => {
              const diff = recentAvg.avgStress - prevAvg.avgStress;
              const improved = diff < 0; // lower stress is better
              const significant = Math.abs(diff) > 0.3;
              return (
                <div style={metricCardStyle(significant ? (improved ? STATUS_GREEN : STATUS_RED) : '#64748b')}>
                  <div style={metricLabelStyle}>Stress Level</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={metricValueStyle}>{recentAvg.avgStress > 0 ? `${recentAvg.avgStress.toFixed(1)}/5` : '--'}</span>
                    {significant && (
                      <span style={{ fontSize: 12, fontWeight: 700, color: improved ? STATUS_GREEN : STATUS_RED }}>
                        {improved ? '\u25BC' : '\u25B2'}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    was {prevAvg.avgStress > 0 ? `${prevAvg.avgStress.toFixed(1)}/5` : '--'}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Deterioration alert */}
          {(() => {
            const sleepWorse = recentAvg.avgSleep > 0 && prevAvg.avgSleep > 0 && (recentAvg.avgSleep - prevAvg.avgSleep) < -0.3;
            const stressWorse = recentAvg.avgStress > 0 && prevAvg.avgStress > 0 && (recentAvg.avgStress - prevAvg.avgStress) > 0.3;
            if (!sleepWorse && !stressWorse) return null;
            return (
              <div style={{
                marginTop: 14, padding: '12px 14px', borderRadius: 10,
                background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                border: '1px solid #fde68a',
                fontSize: 12, color: '#92400e', lineHeight: 1.6,
              }}>
                {sleepWorse && 'Your sleep quality has declined compared to the previous period. '}
                {stressWorse && 'Your stress levels have increased. '}
                Consider reviewing your schedule and recovery habits.
              </div>
            );
          })()}
        </div>
      )}

      {/* ============================================================ */}
      {/*  ASSESSMENT SCORE HISTORY                                      */}
      {/* ============================================================ */}
      {assessments.length > 0 && (
        <div style={{
          background: '#fff',
          borderRadius: cardRadius,
          padding: '24px 20px',
          marginBottom: 24,
          boxShadow: cardShadow,
          border: '1px solid #e2e8f0',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 4px', fontFamily: 'Georgia, "Times New Roman", serif' }}>
            Assessment Score History
          </h2>
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 16 }}>
            {assessments.length} assessment{assessments.length !== 1 ? 's' : ''} recorded
          </div>

          {/* PHQ-9 / GAD-7 supportive alert */}
          {latestAssessment && (
            (latestAssessment.phq9_total != null && latestAssessment.phq9_total >= 10) ||
            (latestAssessment.gad7_total != null && latestAssessment.gad7_total >= 10)
          ) && (
            <div style={{
              padding: '14px 16px', borderRadius: 10, marginBottom: 16,
              background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%)',
              border: '1px solid #a7f3d0',
              fontSize: 12, color: '#065f46', lineHeight: 1.7,
            }}>
              If you are feeling overwhelmed, OMSB Employee Assistance is available. You are not alone.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {assessments.map((a) => {
              const dt = new Date(a.assessment_date);
              return (
                <div key={a.assessment_date} style={{
                  background: '#f8fafc', borderRadius: 12, padding: '14px 16px',
                  border: '1px solid #e2e8f0',
                }}>
                  <div style={{
                    fontSize: 12, fontWeight: 700, color: '#0f766e', marginBottom: 10,
                  }}>
                    {dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {/* WHO-5 */}
                    {(() => {
                      const s = who5Severity(a.who5_total);
                      return (
                        <div style={{ fontSize: 11, color: '#475569' }}>
                          WHO-5: <strong style={{ color: s.color }}>{a.who5_total != null ? `${a.who5_total}%` : '--'}</strong>
                          <span style={{ ...statusTextStyle, marginLeft: 4 }}>{s.label}</span>
                        </div>
                      );
                    })()}

                    {/* CBI Work */}
                    {(() => {
                      const s = cbiWorkSeverity(a.cbi_work_score);
                      return (
                        <div style={{ fontSize: 11, color: '#475569' }}>
                          CBI Work: <strong style={{ color: s.color }}>{a.cbi_work_score != null ? a.cbi_work_score.toFixed(0) : '--'}</strong>
                          <span style={{ ...statusTextStyle, marginLeft: 4 }}>{s.label}</span>
                        </div>
                      );
                    })()}

                    {/* CBI Personal */}
                    {(() => {
                      const s = cbiWorkSeverity(a.cbi_personal_score); // same thresholds
                      return (
                        <div style={{ fontSize: 11, color: '#475569' }}>
                          CBI Personal: <strong style={{ color: s.color }}>{a.cbi_personal_score != null ? a.cbi_personal_score.toFixed(0) : '--'}</strong>
                          <span style={{ ...statusTextStyle, marginLeft: 4 }}>{s.label}</span>
                        </div>
                      );
                    })()}

                    {/* CBI Patient */}
                    {(() => {
                      const s = cbiWorkSeverity(a.cbi_patient_score);
                      return (
                        <div style={{ fontSize: 11, color: '#475569' }}>
                          CBI Patient: <strong style={{ color: s.color }}>{a.cbi_patient_score != null ? a.cbi_patient_score.toFixed(0) : '--'}</strong>
                          <span style={{ ...statusTextStyle, marginLeft: 4 }}>{s.label}</span>
                        </div>
                      );
                    })()}

                    {/* PHQ-9 */}
                    {(() => {
                      const s = phq9Severity(a.phq9_total);
                      return (
                        <div style={{ fontSize: 11, color: '#475569' }}>
                          PHQ-9: <strong style={{ color: s.color }}>{a.phq9_total ?? '--'}</strong>
                          <span style={{ ...statusTextStyle, marginLeft: 4 }}>{s.label}</span>
                        </div>
                      );
                    })()}

                    {/* GAD-7 */}
                    {(() => {
                      const s = gad7Severity(a.gad7_total);
                      return (
                        <div style={{ fontSize: 11, color: '#475569' }}>
                          GAD-7: <strong style={{ color: s.color }}>{a.gad7_total ?? '--'}</strong>
                          <span style={{ ...statusTextStyle, marginLeft: 4 }}>{s.label}</span>
                        </div>
                      );
                    })()}

                    {/* ISI */}
                    {(() => {
                      const s = isiSeverity(a.isi_total);
                      return (
                        <div style={{ fontSize: 11, color: '#475569' }}>
                          ISI: <strong style={{ color: s.color }}>{a.isi_total ?? '--'}</strong>
                          <span style={{ ...statusTextStyle, marginLeft: 4 }}>{s.label}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  WHOOP RECOVERY TREND (Mini Chart)                             */}
      {/* ============================================================ */}
      {whoopHistory.length > 1 && (
        <div style={{
          background: '#fff',
          borderRadius: cardRadius,
          padding: '24px 20px',
          marginBottom: 24,
          boxShadow: cardShadow,
          border: '1px solid #e2e8f0',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 4px', fontFamily: 'Georgia, "Times New Roman", serif' }}>
            Recovery Trend
          </h2>
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 16 }}>
            Last {whoopHistory.length} WHOOP data pulls
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...whoopHistory].reverse().map((pull) => {
              const score = pull.avg_recovery_score ?? 0;
              const barColor = score >= 67 ? STATUS_GREEN : score >= 34 ? STATUS_AMBER : STATUS_RED;
              const dt = new Date(pull.pulled_at);
              return (
                <div key={pull.pulled_at} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#64748b', minWidth: 50, textAlign: 'right' }}>
                    {dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </div>
                  <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 4, height: 18, overflow: 'hidden', position: 'relative' }}>
                    <div style={{
                      width: `${Math.min(score, 100)}%`,
                      height: '100%',
                      background: barColor,
                      borderRadius: 4,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: barColor, minWidth: 36, textAlign: 'right' }}>
                    {pull.avg_recovery_score != null ? `${Math.round(pull.avg_recovery_score)}%` : '--'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  WELLBEING RESOURCES (Conditional)                             */}
      {/* ============================================================ */}
      {hasElevatedScores && (
        <div style={{
          borderRadius: cardRadius,
          padding: '20px 20px',
          marginBottom: 24,
          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
          border: '1px solid #fde68a',
          boxShadow: cardShadow,
        }}>
          <div style={{
            fontSize: 14, fontWeight: 700, color: '#92400e', marginBottom: 10,
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}>
            Wellbeing Resources
          </div>
          <p style={{ fontSize: 13, color: '#78350f', lineHeight: 1.7, margin: '0 0 12px' }}>
            Your recent scores suggest you may be experiencing elevated stress.
            This is common among residents and does not reflect on your ability or dedication.
          </p>
          <div style={{
            background: 'rgba(255,255,255,0.6)', borderRadius: 10, padding: '12px 14px',
            fontSize: 12, color: '#78350f', lineHeight: 1.8,
          }}>
            <strong>OMSB Counselling:</strong>{' '}
            <a href="mailto:counselling@omsb.org" style={{ color: '#0d9488', fontWeight: 600 }}>counselling@omsb.org</a>
            <br />
            <strong>SQU Employee Assistance:</strong>{' '}
            <a href="mailto:mrawahi@squ.edu.om" style={{ color: '#0d9488', fontWeight: 600 }}>mrawahi@squ.edu.om</a>
            <br />
            <span style={{ fontSize: 11, color: '#92400e', fontStyle: 'italic' }}>
              You are not alone. Reaching out is a sign of strength.
            </span>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  STUDY PROGRESS                                                */}
      {/* ============================================================ */}
      <div style={{
        background: '#fff',
        borderRadius: cardRadius,
        padding: '24px 20px',
        marginBottom: 24,
        boxShadow: cardShadow,
        border: '1px solid #e2e8f0',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0, fontFamily: 'Georgia, "Times New Roman", serif' }}>
            Your Progress
          </h2>
          <span style={{
            fontSize: 13, fontWeight: 800, color: progressPct === 100 ? '#0f766e' : '#0f172a',
          }}>
            {progressPct}%
          </span>
        </div>

        {/* Progress bar */}
        <div style={{
          width: '100%', height: 6, borderRadius: 99,
          background: '#f1f5f9', marginBottom: 20, overflow: 'hidden',
        }}>
          <div style={{
            width: `${progressPct}%`, height: '100%', borderRadius: 99,
            background: progressPct === 100
              ? 'linear-gradient(90deg, #0f766e 0%, #10b981 100%)'
              : 'linear-gradient(90deg, #0f766e 0%, #0d9488 100%)',
            transition: 'width 0.5s ease',
          }} />
        </div>

        {progressItems.map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0',
            borderBottom: i < progressItems.length - 1 ? '1px solid #f1f5f9' : 'none',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
              background: item.done
                ? 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)'
                : '#f1f5f9',
              color: item.done ? '#fff' : '#94a3b8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700,
              boxShadow: item.done ? '0 2px 8px rgba(16,185,129,0.25)' : 'none',
            }}>
              {item.done ? '\u2713' : (i + 1)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 13, fontWeight: 600,
                color: item.done ? '#0f172a' : '#64748b',
              }}>
                {item.label}
              </div>
              {item.detail && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{item.detail}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* ============================================================ */}
      {/*  ABOUT STUDY (Collapsible)                                     */}
      {/* ============================================================ */}
      <div style={{
        background: '#fff',
        borderRadius: cardRadius,
        marginBottom: 24,
        boxShadow: cardShadow,
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
      }}>
        <button
          onClick={() => setAboutOpen(!aboutOpen)}
          style={{
            width: '100%', padding: '18px 20px',
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontFamily: 'inherit',
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', fontFamily: 'Georgia, "Times New Roman", serif' }}>
            About This Study
          </span>
          <span style={{
            fontSize: 18, color: '#94a3b8', fontWeight: 300,
            transform: aboutOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            display: 'inline-block',
          }}>
            &#9660;
          </span>
        </button>

        {aboutOpen && (
          <div style={{ padding: '0 20px 20px' }}>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, margin: '0 0 14px' }}>
              This study investigates the association between healthcare workers' burnout and
              biophysical parameters using WHOOP wearable devices. Multi-center cohort study
              at SQUH, Royal Hospital, and Armed Forces Hospital.
            </p>
            <div style={{
              fontSize: 12, color: '#64748b', lineHeight: 1.8,
              background: '#f8fafc', borderRadius: 10, padding: '12px 14px',
            }}>
              <strong>Ethics:</strong> MREC #3190 (SQU) + Royal Hospital<br />
              <strong>Privacy:</strong> You are identified by study ID only ({pid})<br />
              <strong>Contact:</strong>{' '}
              <a href="mailto:mrawahi@squ.edu.om" style={{ color: '#0d9488', fontWeight: 600 }}>
                mrawahi@squ.edu.om
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
