import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface EnrollmentKPIs {
  total: number;
  active: number;
  whoopConnected: number;
  demographicsDone: number;
}

interface CollectionKPIs {
  blockAssessments: number;
  weeklyCheckins: number;
  eventsLogged: number;
  whoopPulls: number;
  pendingReviews: number;
}

interface BurnoutOverview {
  avgWork: number | null;
  avgPHQ9: number | null;
  phqModerateRate: number | null;
  avgGAD7: number | null;
  gadModerateRate: number | null;
  avgISI: number | null;
  isiModerateRate: number | null;
  assessmentCount: number;
}

interface WhoopSummary {
  avgHRV: number | null;
  avgRecovery: number | null;
  avgRHR: number | null;
  avgSleepHours: number | null;
  avgSleepEfficiency: number | null;
  avgSleepDebt: number | null;
  avgStrain: number | null;
  avgSpO2: number | null;
  avgRespRate: number | null;
  avgSkinTemp: number | null;
  participantCount: number;
}

interface Participant {
  id: string;
  study_participant_id: string;
  full_name: string | null;
  status: string;
  whoop_user_id: string | null;
  demographics_completed: boolean | null;
  baseline_completed: boolean | null;
}

interface ParticipantWhoop {
  resident_id: string;
  avg_recovery_score: number | null;
  avg_hrv_rmssd_ms: number | null;
  avg_total_sleep_min: number | null;
  avg_daily_strain: number | null;
  days_with_data: number | null;
}

interface ParticipantScores {
  resident_id: string;
  cbi_work: number | null;
  phq9: number | null;
  gad7: number | null;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function avg(arr: number[]): number | null {
  if (arr.length === 0) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function fmt(v: number | null, decimals = 1, suffix = ''): string {
  if (v == null) return '\u2014';
  return v.toFixed(decimals) + suffix;
}

function pct(v: number | null): string {
  if (v == null) return '\u2014';
  return Math.round(v) + '%';
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  research_admin: 'Research Admin',
  site_coordinator: 'Site Coordinator',
  research_assistant: 'Research Assistant',
  statistician: 'Statistician',
};

/* ------------------------------------------------------------------ */
/*  Clinical color coding helpers                                      */
/* ------------------------------------------------------------------ */

function recoveryColor(v: number | null): string {
  if (v == null) return '#64748b';
  if (v >= 67) return '#10b981';
  if (v >= 34) return '#f59e0b';
  return '#ef4444';
}

function hrvColor(v: number | null): string {
  if (v == null) return '#64748b';
  if (v >= 50) return '#10b981';
  if (v >= 30) return '#f59e0b';
  return '#ef4444';
}

function rhrColor(v: number | null): string {
  if (v == null) return '#64748b';
  if (v <= 65) return '#10b981';
  if (v <= 80) return '#f59e0b';
  return '#ef4444';
}

function sleepColor(v: number | null): string {
  if (v == null) return '#64748b';
  if (v >= 7) return '#10b981';
  if (v >= 6) return '#f59e0b';
  return '#ef4444';
}

function strainColor(v: number | null): string {
  if (v == null) return '#64748b';
  if (v >= 8 && v <= 14) return '#10b981';
  if (v < 4 || v > 18) return '#ef4444';
  return '#f59e0b';
}

function spo2Color(v: number | null): string {
  if (v == null) return '#64748b';
  if (v >= 96) return '#10b981';
  if (v >= 93) return '#f59e0b';
  return '#ef4444';
}

function phq9Color(v: number | null): string {
  if (v == null) return '#64748b';
  if (v <= 4) return '#10b981';
  if (v <= 9) return '#22c55e';
  if (v <= 14) return '#f59e0b';
  if (v <= 19) return '#f97316';
  return '#ef4444';
}

function phq9Label(v: number | null): string {
  if (v == null) return '';
  if (v <= 4) return 'Minimal';
  if (v <= 9) return 'Mild';
  if (v <= 14) return 'Moderate';
  if (v <= 19) return 'Mod-Severe';
  return 'Severe';
}

function gad7Color(v: number | null): string {
  if (v == null) return '#64748b';
  if (v <= 4) return '#10b981';
  if (v <= 9) return '#22c55e';
  if (v <= 14) return '#f59e0b';
  return '#ef4444';
}

function gad7Label(v: number | null): string {
  if (v == null) return '';
  if (v <= 4) return 'Minimal';
  if (v <= 9) return 'Mild';
  if (v <= 14) return 'Moderate';
  return 'Severe';
}

function cbiColor(v: number | null): string {
  if (v == null) return '#64748b';
  if (v < 25) return '#10b981';
  if (v < 50) return '#f59e0b';
  if (v < 75) return '#f97316';
  return '#ef4444';
}

function cbiLabel(v: number | null): string {
  if (v == null) return '';
  if (v < 25) return 'Low';
  if (v < 50) return 'Moderate';
  if (v < 75) return 'High';
  return 'Severe';
}

function isiColor(v: number | null): string {
  if (v == null) return '#64748b';
  if (v <= 7) return '#10b981';
  if (v <= 14) return '#f59e0b';
  if (v <= 21) return '#f97316';
  return '#ef4444';
}

/* ------------------------------------------------------------------ */
/*  Skeleton loaders                                                   */
/* ------------------------------------------------------------------ */

function SkeletonCard() {
  return (
    <div style={styles.kpiCard}>
      <div style={{ ...styles.skeletonLine, width: '60%', height: 12, marginBottom: 16 }} />
      <div style={{ ...styles.skeletonLine, width: '40%', height: 32 }} />
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5].map(i => (
        <td key={i} style={styles.td}>
          <div style={{ ...styles.skeletonLine, width: '70%', height: 14 }} />
        </td>
      ))}
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Overview() {
  const { staff, studyRoles, hasRole } = useAuth();

  const [enrollment, setEnrollment] = useState<EnrollmentKPIs | null>(null);
  const [collection, setCollection] = useState<CollectionKPIs | null>(null);
  const [burnout, setBurnout] = useState<BurnoutOverview | null>(null);
  const [whoop, setWhoop] = useState<WhoopSummary | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [pulling, setPulling] = useState(false);
  const [pullResult, setPullResult] = useState<string | null>(null);
  const [perParticipantWhoop, setPerParticipantWhoop] = useState<ParticipantWhoop[]>([]);
  const [perParticipantScores, setPerParticipantScores] = useState<ParticipantScores[]>([]);

  const studyId = studyRoles[0]?.study_id;
  const studySlug = studyRoles[0]?.study_slug ?? '';
  const userRole = studyRoles[0]?.role ?? '';
  const isAdmin = hasRole(studySlug, 'research_admin');

  /* ---- data fetching ---- */

  useEffect(() => {
    if (!studyId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);

      /* Enrollment KPIs */
      const { data: pRows } = await supabase
        .from('burnout_participants')
        .select('id, study_participant_id, full_name, status, whoop_user_id, demographics_completed, baseline_completed')
        .eq('study_id', studyId)
        .limit(500);

      const parts = pRows ?? [];
      if (!cancelled) {
        setEnrollment({
          total: parts.length,
          active: parts.filter(p => p.status === 'active').length,
          whoopConnected: parts.filter(p => p.whoop_user_id != null).length,
          demographicsDone: parts.filter(p => p.demographics_completed === true).length,
        });
        setParticipants(parts);
      }

      /* Collection KPIs — query actual tables */
      const [baRes, wcRes, elRes, whoopCountRes, pendingRes] = await Promise.all([
        supabase.from('block_assessments').select('id', { count: 'exact' }).eq('study_id', studyId).limit(1),
        supabase.from('weekly_checkins').select('id', { count: 'exact' }).eq('study_id', studyId).limit(1),
        supabase.from('event_logs').select('id', { count: 'exact' }).eq('study_id', studyId).limit(1),
        supabase.from('whoop_pulls').select('id', { count: 'exact' }).eq('study_id', studyId).limit(1),
        supabase.from('block_assessments').select('id', { count: 'exact' }).eq('study_id', studyId).eq('review_status', 'pending').limit(1),
      ]);

      if (!cancelled) {
        setCollection({
          blockAssessments: baRes.count ?? 0,
          weeklyCheckins: wcRes.count ?? 0,
          eventsLogged: elRes.count ?? 0,
          whoopPulls: whoopCountRes.count ?? 0,
          pendingReviews: pendingRes.count ?? 0,
        });
      }

      /* Burnout Overview — query actual tables */
      const [cbiRes, phqRes, gadRes, isiRes] = await Promise.all([
        supabase.from('cbi_responses').select('work_score').eq('study_id', studyId).limit(1000),
        supabase.from('phq9_responses').select('total_score').eq('study_id', studyId).limit(1000),
        supabase.from('gad7_responses').select('total_score').eq('study_id', studyId).limit(1000),
        supabase.from('isi_responses').select('total_score').eq('study_id', studyId).limit(1000),
      ]);

      const cbiRows = cbiRes.data ?? [];
      const phqRows = phqRes.data ?? [];
      const gadRows = gadRes.data ?? [];
      const isiRows = isiRes.data ?? [];
      const totalAssessments = cbiRows.length + phqRows.length + gadRows.length + isiRows.length;

      if (!cancelled) {
        if (totalAssessments === 0) {
          setBurnout({ avgWork: null, avgPHQ9: null, phqModerateRate: null, avgGAD7: null, gadModerateRate: null, avgISI: null, isiModerateRate: null, assessmentCount: 0 });
        } else {
          const work = cbiRows.map(a => a.work_score).filter((v): v is number => v != null);
          const phq = phqRows.map(a => a.total_score).filter((v): v is number => v != null);
          const gad = gadRows.map(a => a.total_score).filter((v): v is number => v != null);
          const isiScores = isiRows.map(a => a.total_score).filter((v): v is number => v != null);

          setBurnout({
            avgWork: avg(work),
            avgPHQ9: avg(phq),
            phqModerateRate: phq.length > 0 ? (phq.filter(v => v >= 10).length / phq.length) * 100 : null,
            avgGAD7: avg(gad),
            gadModerateRate: gad.length > 0 ? (gad.filter(v => v >= 10).length / gad.length) * 100 : null,
            avgISI: avg(isiScores),
            isiModerateRate: isiScores.length > 0 ? (isiScores.filter(v => v >= 15).length / isiScores.length) * 100 : null,
            assessmentCount: totalAssessments,
          });
        }
      }

      /* WHOOP Biometrics — latest pull per participant */
      const { data: whoopData } = await supabase
        .from('whoop_pulls')
        .select('resident_id, avg_hrv_rmssd_ms, avg_recovery_score, avg_resting_hr_bpm, avg_total_sleep_min, avg_sleep_efficiency_pct, avg_sleep_debt_min, avg_daily_strain, avg_spo2_pct, avg_respiratory_rate_bpm, avg_skin_temp_c, days_with_data, pulled_at')
        .eq('study_id', studyId)
        .order('pulled_at', { ascending: false })
        .limit(1000);

      if (!cancelled) {
        const rows = whoopData ?? [];
        // Deduplicate: keep only latest per participant
        const seen = new Set<string>();
        const latest: typeof rows = [];
        for (const r of rows) {
          if (!seen.has(r.resident_id)) {
            seen.add(r.resident_id);
            latest.push(r);
          }
        }

        if (latest.length === 0) {
          setWhoop(null);
        } else {
          const nums = (arr: (number | null)[]) => arr.filter((v): v is number => v != null);
          setWhoop({
            avgHRV: avg(nums(latest.map(r => r.avg_hrv_rmssd_ms))),
            avgRecovery: avg(nums(latest.map(r => r.avg_recovery_score))),
            avgRHR: avg(nums(latest.map(r => r.avg_resting_hr_bpm))),
            avgSleepHours: avg(nums(latest.map(r => r.avg_total_sleep_min != null ? r.avg_total_sleep_min / 60 : null))),
            avgSleepEfficiency: avg(nums(latest.map(r => r.avg_sleep_efficiency_pct))),
            avgSleepDebt: avg(nums(latest.map(r => r.avg_sleep_debt_min))),
            avgStrain: avg(nums(latest.map(r => r.avg_daily_strain))),
            avgSpO2: avg(nums(latest.map(r => r.avg_spo2_pct))),
            avgRespRate: avg(nums(latest.map(r => r.avg_respiratory_rate_bpm))),
            avgSkinTemp: avg(nums(latest.map(r => r.avg_skin_temp_c))),
            participantCount: latest.length,
          });
        }
      }

      /* Per-participant WHOOP (latest per person) */
      if (!cancelled && whoopData) {
        const seen2 = new Set<string>();
        const ppWhoop: ParticipantWhoop[] = [];
        for (const r of (whoopData ?? [])) {
          if (!seen2.has(r.resident_id)) {
            seen2.add(r.resident_id);
            ppWhoop.push({ resident_id: r.resident_id, avg_recovery_score: r.avg_recovery_score, avg_hrv_rmssd_ms: r.avg_hrv_rmssd_ms, avg_total_sleep_min: r.avg_total_sleep_min, avg_daily_strain: r.avg_daily_strain, days_with_data: (r as any).days_with_data ?? null });
          }
        }
        setPerParticipantWhoop(ppWhoop);
      }

      /* Per-participant latest scores */
      if (!cancelled) {
        const { data: baScores } = await supabase
          .from('block_assessments')
          .select('resident_id, cbi_work_score, phq9_total, gad7_total, assessment_date')
          .eq('study_id', studyId)
          .order('assessment_date', { ascending: false })
          .limit(500);
        if (baScores) {
          const seen3 = new Set<string>();
          const ppScores: ParticipantScores[] = [];
          for (const r of baScores) {
            if (!seen3.has(r.resident_id)) {
              seen3.add(r.resident_id);
              ppScores.push({ resident_id: r.resident_id, cbi_work: r.cbi_work_score ? parseFloat(r.cbi_work_score) : null, phq9: r.phq9_total, gad7: r.gad7_total });
            }
          }
          setPerParticipantScores(ppScores);
        }
      }

      if (!cancelled) setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [studyId]);

  /* ---- WHOOP pull handler ---- */

  async function triggerWhoopPull() {
    setPulling(true);
    setPullResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setPullResult('Error: Not authenticated');
        setPulling(false);
        return;
      }
      const res = await fetch('/api/whoop/admin-pull', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setPullResult(`Pulled ${data.pulled} participant(s) — ${data.period.start} to ${data.period.end}`);
        // Reload dashboard data after a short delay
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setPullResult(`Error: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setPullResult(`Network error: ${err.message}`);
    } finally {
      setPulling(false);
    }
  }

  /* ---- render helpers ---- */

  const enrollmentCards = useMemo(() => {
    if (!enrollment) return [];
    return [
      { label: 'Total Enrolled', value: enrollment.total, color: '#2563eb', bg: '#eff6ff', icon: enrolledIcon },
      { label: 'Active', value: enrollment.active, color: '#16a34a', bg: '#f0fdf4', icon: activeIcon },
      { label: 'WHOOP Connected', value: enrollment.whoopConnected, color: '#7c3aed', bg: '#f5f3ff', icon: whoopIcon },
      { label: 'Demographics Done', value: enrollment.demographicsDone, color: '#0891b2', bg: '#ecfeff', icon: formIcon },
    ];
  }, [enrollment]);

  const collectionCards = useMemo(() => {
    if (!collection) return [];
    return [
      { label: 'Block Assessments', value: collection.blockAssessments, color: '#2563eb', bg: '#eff6ff', icon: clipboardIcon },
      { label: 'Weekly Check-ins', value: collection.weeklyCheckins, color: '#16a34a', bg: '#f0fdf4', icon: calendarIcon },
      { label: 'Events Logged', value: collection.eventsLogged, color: '#d97706', bg: '#fffbeb', icon: flagIcon },
      { label: 'WHOOP Pulls', value: collection.whoopPulls, color: '#7c3aed', bg: '#f5f3ff', icon: whoopIcon },
    ];
  }, [collection]);

  const quickActions = useMemo(() => [
    { label: 'Review Queue', href: '/dashboard/review', icon: reviewIcon, badge: collection?.pendingReviews ?? 0 },
    { label: 'Import Data', href: '/dashboard/import', icon: importIcon, badge: 0 },
    { label: 'Send Links', href: '/dashboard/send-links', icon: linkIcon, badge: 0 },
    { label: 'Export Data', href: '/dashboard/exports', icon: exportIcon, badge: 0 },
  ], [collection]);

  /* ---- main render ---- */

  return (
    <div style={styles.container}>
      {/* ---------- WELCOME HEADER ---------- */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.headerLeft}>
            <h1 style={styles.h1}>Welcome, {staff?.full_name ?? 'Researcher'}</h1>
            <p style={styles.subtitle}>
              {studySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              <span style={styles.statusBadge}>
                <span style={styles.statusDot} />
                Active
              </span>
            </p>
          </div>
          <span style={{ ...styles.roleBadge, background: roleColor(userRole) }}>
            {ROLE_LABELS[userRole] ?? userRole.replace(/_/g, ' ')}
          </span>
        </div>
      </header>

      {/* ---------- ENROLLMENT KPIs ---------- */}
      <Section title="Enrollment" icon={enrolledIcon}>
        <div style={styles.kpiGrid}>
          {loading
            ? [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
            : enrollmentCards.map(c => (
                <KPICard key={c.label} label={c.label} value={c.value} color={c.color} bg={c.bg} icon={c.icon} />
              ))}
        </div>
      </Section>

      {/* ---------- DATA COLLECTION ---------- */}
      <Section title="Data Collection Progress" icon={clipboardIcon}>
        <div style={styles.kpiGrid}>
          {loading
            ? [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
            : collectionCards.map(c => (
                <KPICard key={c.label} label={c.label} value={c.value} color={c.color} bg={c.bg} icon={c.icon} />
              ))}
        </div>
      </Section>

      {/* ---------- BURNOUT + WHOOP ROW ---------- */}
      <div style={styles.twoCol}>
        {/* Burnout overview */}
        <Section title="Burnout Overview" icon={flagIcon} style={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <div style={styles.loadingBox}><div style={{ ...styles.skeletonLine, width: '50%', height: 16 }} /></div>
          ) : burnout && burnout.assessmentCount === 0 ? (
            <p style={styles.emptyText}>No assessments yet</p>
          ) : burnout ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <GaugeBar
                label="CBI Work Burnout"
                value={burnout.avgWork}
                max={100}
                color={cbiColor(burnout.avgWork)}
                displayValue={fmt(burnout.avgWork, 0)}
                sublabel={cbiLabel(burnout.avgWork)}
              />
              <GaugeBar
                label="PHQ-9 (Depression)"
                value={burnout.avgPHQ9}
                max={27}
                color={phq9Color(burnout.avgPHQ9)}
                displayValue={fmt(burnout.avgPHQ9, 1)}
                sublabel={phq9Label(burnout.avgPHQ9)}
              />
              <div style={styles.gaugeSubInfo}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Moderate+ rate:</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: burnout.phqModerateRate != null && burnout.phqModerateRate > 25 ? '#ef4444' : '#10b981' }}>{pct(burnout.phqModerateRate)}</span>
              </div>
              <GaugeBar
                label="GAD-7 (Anxiety)"
                value={burnout.avgGAD7}
                max={21}
                color={gad7Color(burnout.avgGAD7)}
                displayValue={fmt(burnout.avgGAD7, 1)}
                sublabel={gad7Label(burnout.avgGAD7)}
              />
              <div style={styles.gaugeSubInfo}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Moderate+ rate:</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: burnout.gadModerateRate != null && burnout.gadModerateRate > 25 ? '#ef4444' : '#10b981' }}>{pct(burnout.gadModerateRate)}</span>
              </div>
              <GaugeBar
                label="ISI (Insomnia)"
                value={burnout.avgISI}
                max={28}
                color={isiColor(burnout.avgISI)}
                displayValue={fmt(burnout.avgISI, 1)}
                sublabel={burnout.avgISI != null ? (burnout.avgISI <= 7 ? 'No insomnia' : burnout.avgISI <= 14 ? 'Subthreshold' : burnout.avgISI <= 21 ? 'Moderate' : 'Severe') : ''}
              />
              <div style={styles.gaugeSubInfo}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Moderate+ rate:</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: burnout.isiModerateRate != null && burnout.isiModerateRate > 25 ? '#ef4444' : '#10b981' }}>{pct(burnout.isiModerateRate)}</span>
              </div>
              <div style={{ marginTop: 4, padding: '8px 12px', borderRadius: 10, background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.12)' }}>
                <span style={{ fontSize: 11, color: '#64748b' }}>Total assessments collected: </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#2563eb' }}>{burnout.assessmentCount}</span>
              </div>
            </div>
          ) : null}
        </Section>

        {/* WHOOP biometrics */}
        <Section title="WHOOP Biometrics Summary" icon={whoopIcon} style={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <div style={styles.loadingBox}><div style={{ ...styles.skeletonLine, width: '50%', height: 16 }} /></div>
          ) : whoop ? (
            <div>
              <div style={{ marginBottom: 14, padding: '8px 14px', borderRadius: 10, background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.12)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: '#64748b' }}>Participants with data:</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#7c3aed' }}>{whoop.participantCount}</span>
              </div>
              <div style={styles.whoopGrid}>
                <WhoopMetricCard
                  label="Recovery"
                  value={fmt(whoop.avgRecovery, 0, '%')}
                  color={recoveryColor(whoop.avgRecovery)}
                  info="Readiness for strain. Green >= 67%"
                />
                <WhoopMetricCard
                  label="HRV"
                  value={fmt(whoop.avgHRV, 1, ' ms')}
                  color={hrvColor(whoop.avgHRV)}
                  info="Heart rate variability. Green >= 50ms"
                />
                <WhoopMetricCard
                  label="Resting HR"
                  value={fmt(whoop.avgRHR, 0, ' bpm')}
                  color={rhrColor(whoop.avgRHR)}
                  info="Lower is better. Green <= 65 bpm"
                />
                <WhoopMetricCard
                  label="Sleep"
                  value={fmt(whoop.avgSleepHours, 1, ' hrs')}
                  color={sleepColor(whoop.avgSleepHours)}
                  info="Total sleep time. Green >= 7 hrs"
                />
                <WhoopMetricCard
                  label="Strain"
                  value={fmt(whoop.avgStrain, 1, ' /21')}
                  color={strainColor(whoop.avgStrain)}
                  info="Cardiovascular load. Optimal 8-14"
                />
                <WhoopMetricCard
                  label="SpO2"
                  value={fmt(whoop.avgSpO2, 1, '%')}
                  color={spo2Color(whoop.avgSpO2)}
                  info="Blood oxygen. Green >= 96%"
                />
                <WhoopMetricCard
                  label="Sleep Efficiency"
                  value={fmt(whoop.avgSleepEfficiency, 0, '%')}
                  color={whoop.avgSleepEfficiency != null && whoop.avgSleepEfficiency >= 85 ? '#10b981' : '#f59e0b'}
                  info="Time asleep / time in bed"
                />
                <WhoopMetricCard
                  label="Sleep Debt"
                  value={fmt(whoop.avgSleepDebt, 0, ' min')}
                  color={whoop.avgSleepDebt != null && whoop.avgSleepDebt > 60 ? '#ef4444' : '#10b981'}
                  info="Accumulated deficit. Red > 60 min"
                />
                <WhoopMetricCard
                  label="Resp Rate"
                  value={fmt(whoop.avgRespRate, 1, ' br/min')}
                  color="#0d9488"
                  info="Breaths per minute during sleep"
                />
                <WhoopMetricCard
                  label="Skin Temp"
                  value={fmt(whoop.avgSkinTemp, 1, ' \u00b0C')}
                  color="#0d9488"
                  info="Overnight skin temperature"
                />
              </div>
            </div>
          ) : (
            <p style={styles.emptyText}>No WHOOP data yet -- try pulling data below</p>
          )}
          {isAdmin && (
            <div style={{ marginTop: 20 }}>
              <button
                onClick={triggerWhoopPull}
                disabled={pulling}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: 12,
                  border: '1px solid rgba(124,58,237,0.3)',
                  background: pulling
                    ? 'linear-gradient(135deg, #1e1b4b, #312e81)'
                    : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: pulling ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  letterSpacing: '0.02em',
                  boxShadow: pulling ? 'none' : '0 4px 20px rgba(124,58,237,0.3)',
                  textTransform: 'uppercase' as const,
                }}
              >
                {pulling ? 'Syncing WHOOP data...' : 'Pull WHOOP Data Now'}
              </button>
              {pullResult && (
                <div style={{
                  marginTop: 10,
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 600,
                  background: pullResult.startsWith('Error') || pullResult.startsWith('Network')
                    ? 'rgba(239,68,68,0.08)'
                    : 'rgba(16,185,129,0.08)',
                  color: pullResult.startsWith('Error') || pullResult.startsWith('Network') ? '#ef4444' : '#10b981',
                  border: `1px solid ${pullResult.startsWith('Error') || pullResult.startsWith('Network') ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
                }}>
                  {pullResult}
                </div>
              )}
            </div>
          )}
        </Section>
      </div>

      {/* ---------- PARTICIPANT TABLE ---------- */}
      <Section title="Participants" icon={enrolledIcon}>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Participant ID</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>WHOOP</th>
                <th style={styles.th}>Demographics</th>
                <th style={{ ...styles.th, width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)
              ) : participants.length === 0 ? (
                <tr><td colSpan={5} style={{ ...styles.td, textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>No participants enrolled</td></tr>
              ) : (
                participants.map((p, idx) => (
                  <tr
                    key={p.id}
                    style={{
                      ...styles.tableRow,
                      background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                      cursor: 'pointer',
                    }}
                    onClick={() => { window.location.href = `/dashboard/residents/${p.id}`; }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(13,148,136,0.04)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? '#ffffff' : '#f8fafc'; }}
                  >
                    <td style={styles.td}><span style={styles.monoText}>{p.study_participant_id}</span></td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusPill,
                        background: statusColor(p.status).bg,
                        color: statusColor(p.status).text,
                        boxShadow: `0 0 8px ${statusColor(p.status).bg}`,
                      }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusPill,
                        background: p.whoop_user_id ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                        color: p.whoop_user_id ? '#10b981' : '#f59e0b',
                        boxShadow: p.whoop_user_id ? '0 0 8px rgba(16,185,129,0.15)' : '0 0 8px rgba(245,158,11,0.15)',
                      }}>
                        {p.whoop_user_id ? 'Connected' : 'Not connected'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusPill,
                        background: p.demographics_completed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: p.demographics_completed ? '#10b981' : '#ef4444',
                        boxShadow: p.demographics_completed ? '0 0 8px rgba(16,185,129,0.15)' : '0 0 8px rgba(239,68,68,0.15)',
                      }}>
                        {p.demographics_completed ? 'Done' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ ...styles.td, color: '#94a3b8', fontSize: 16 }}>
                      {'\u203A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ---------- PER-PARTICIPANT WHOOP COMPARISON ---------- */}
      {perParticipantWhoop.length > 0 && (
        <Section title="Participant WHOOP Comparison" icon={whoopIcon}>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Participant</th>
                  <th style={styles.th}>Recovery</th>
                  <th style={styles.th}>HRV</th>
                  <th style={styles.th}>Sleep</th>
                  <th style={styles.th}>Strain</th>
                  <th style={styles.th}>Days</th>
                </tr>
              </thead>
              <tbody>
                {perParticipantWhoop.map((pw, idx) => {
                  const p = participants.find(x => x.id === pw.resident_id);
                  return (
                    <tr
                      key={pw.resident_id}
                      style={{ ...styles.tableRow, background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(13,148,136,0.04)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? '#ffffff' : '#f8fafc'; }}
                    >
                      <td style={styles.td}><span style={styles.monoText}>{p?.study_participant_id ?? '?'}</span></td>
                      <td style={styles.td}>
                        <span style={{ fontWeight: 700, color: recoveryColor(pw.avg_recovery_score) }}>
                          {pw.avg_recovery_score != null ? Math.round(pw.avg_recovery_score) + '%' : '\u2014'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontWeight: 600, color: hrvColor(pw.avg_hrv_rmssd_ms) }}>
                          {pw.avg_hrv_rmssd_ms != null ? Math.round(pw.avg_hrv_rmssd_ms) + ' ms' : '\u2014'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontWeight: 600, color: pw.avg_total_sleep_min != null ? sleepColor(pw.avg_total_sleep_min / 60) : '#64748b' }}>
                          {pw.avg_total_sleep_min != null ? Math.floor(pw.avg_total_sleep_min / 60) + 'h ' + Math.round(pw.avg_total_sleep_min % 60) + 'm' : '\u2014'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontWeight: 600, color: strainColor(pw.avg_daily_strain) }}>
                          {pw.avg_daily_strain != null ? pw.avg_daily_strain.toFixed(1) : '\u2014'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontWeight: 600, color: (pw.days_with_data ?? 0) >= 20 ? '#10b981' : '#f59e0b' }}>
                          {pw.days_with_data ?? 0}/28
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* ---------- PER-PARTICIPANT ASSESSMENT SCORES ---------- */}
      {perParticipantScores.length > 0 && (
        <Section title="Latest Assessment Scores by Participant" icon={clipboardIcon}>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Participant</th>
                  <th style={styles.th}>CBI Work</th>
                  <th style={styles.th}>PHQ-9</th>
                  <th style={styles.th}>GAD-7</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {perParticipantScores.map((ps, idx) => {
                  const p = participants.find(x => x.id === ps.resident_id);
                  const flagged = (ps.phq9 ?? 0) >= 15 || (ps.gad7 ?? 0) >= 15 || (ps.cbi_work ?? 0) >= 50;
                  return (
                    <tr
                      key={ps.resident_id}
                      style={{
                        ...styles.tableRow,
                        background: flagged ? 'rgba(239,68,68,0.04)' : idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = flagged ? 'rgba(239,68,68,0.08)' : 'rgba(13,148,136,0.04)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = flagged ? 'rgba(239,68,68,0.04)' : idx % 2 === 0 ? '#ffffff' : '#f8fafc'; }}
                    >
                      <td style={styles.td}><span style={styles.monoText}>{p?.study_participant_id ?? '?'}</span></td>
                      <td style={styles.td}>
                        <span style={{ fontWeight: 700, color: cbiColor(ps.cbi_work) }}>
                          {ps.cbi_work != null ? Math.round(ps.cbi_work) + '/100' : '\u2014'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontWeight: 700, color: phq9Color(ps.phq9) }}>
                          {ps.phq9 ?? '\u2014'}<span style={{ fontWeight: 400, color: '#64748b' }}>/27</span>
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontWeight: 700, color: gad7Color(ps.gad7) }}>
                          {ps.gad7 ?? '\u2014'}<span style={{ fontWeight: 400, color: '#64748b' }}>/21</span>
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusPill,
                          background: flagged ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                          color: flagged ? '#ef4444' : '#10b981',
                          boxShadow: flagged ? '0 0 10px rgba(239,68,68,0.15)' : '0 0 10px rgba(16,185,129,0.15)',
                        }}>
                          {flagged ? 'Flagged' : 'Normal'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* ---------- STUDY COMPLIANCE ---------- */}
      <Section title="Study Compliance" icon={activeIcon}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          <div style={styles.kpiCard}>
            <div style={{ ...styles.kpiGlow, background: 'linear-gradient(180deg, #2563eb, transparent)' }} />
            <div style={styles.kpiTop}><span style={styles.kpiLabel}>Baseline Completion</span></div>
            <div style={{ ...styles.kpiValue, color: '#2563eb', fontSize: '2.2rem' }}>
              {participants.filter(p => p.baseline_completed).length}/{participants.length}
            </div>
            <div style={styles.kpiSub}>
              {participants.length > 0 ? Math.round(participants.filter(p => p.baseline_completed).length / participants.length * 100) : 0}% complete
            </div>
          </div>
          <div style={styles.kpiCard}>
            <div style={{ ...styles.kpiGlow, background: 'linear-gradient(180deg, #7c3aed, transparent)' }} />
            <div style={styles.kpiTop}><span style={styles.kpiLabel}>WHOOP Adherence</span></div>
            <div style={{ ...styles.kpiValue, color: '#7c3aed', fontSize: '2.2rem' }}>
              {perParticipantWhoop.filter(w => (w.days_with_data ?? 0) >= 20).length}/{perParticipantWhoop.length}
            </div>
            <div style={styles.kpiSub}>
              {'\u226520'} days data ({perParticipantWhoop.length > 0 ? Math.round(perParticipantWhoop.filter(w => (w.days_with_data ?? 0) >= 20).length / perParticipantWhoop.length * 100) : 0}%)
            </div>
          </div>
          <div style={styles.kpiCard}>
            <div style={{ ...styles.kpiGlow, background: `linear-gradient(180deg, ${perParticipantScores.some(ps => (ps.phq9 ?? 0) >= 15 || (ps.gad7 ?? 0) >= 15) ? '#ef4444' : '#10b981'}, transparent)` }} />
            <div style={styles.kpiTop}><span style={styles.kpiLabel}>Flagged Participants</span></div>
            <div style={{ ...styles.kpiValue, fontSize: '2.2rem', color: perParticipantScores.some(ps => (ps.phq9 ?? 0) >= 15 || (ps.gad7 ?? 0) >= 15) ? '#ef4444' : '#10b981' }}>
              {perParticipantScores.filter(ps => (ps.phq9 ?? 0) >= 15 || (ps.gad7 ?? 0) >= 15 || (ps.cbi_work ?? 0) >= 50).length}
            </div>
            <div style={styles.kpiSub}>
              PHQ-9{'\u226515'} or GAD-7{'\u226515'} or CBI{'\u226550'}
            </div>
          </div>
        </div>
      </Section>

      {/* ---------- QUICK ACTIONS ---------- */}
      <Section title="Quick Actions" icon={exportIcon}>
        <div style={styles.actionsGrid}>
          {quickActions.map(a => (
            <a
              key={a.label}
              href={a.href}
              style={styles.actionCard}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#0d9488';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(13,148,136,0.15)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(148,163,184,0.2)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              <div style={styles.actionIconWrap}>
                <div style={styles.actionIcon} dangerouslySetInnerHTML={{ __html: a.icon }} />
              </div>
              <span style={styles.actionLabel}>{a.label}</span>
              {a.badge > 0 && <span style={styles.badge}>{a.badge}</span>}
              <span style={styles.actionArrow}>{'\u203A'}</span>
            </a>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function Section({ title, children, style: extra, icon }: { title: string; children: React.ReactNode; style?: React.CSSProperties; icon?: string }) {
  return (
    <section style={{ ...styles.section, ...extra }}>
      <div style={styles.sectionHeader}>
        {icon && <div style={styles.sectionIconWrap} dangerouslySetInnerHTML={{ __html: icon.replace('currentColor', '#0d9488') }} />}
        <h2 style={styles.sectionTitle}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function KPICard({ label, value, color, bg, icon }: { label: string; value: number | string; color: string; bg: string; icon: string }) {
  return (
    <div style={styles.kpiCard}>
      <div style={{ ...styles.kpiGlow, background: `linear-gradient(180deg, ${color}, transparent)` }} />
      <div style={styles.kpiTop}>
        <span style={styles.kpiLabel}>{label}</span>
        <div style={{ ...styles.kpiIconWrap, background: bg }} dangerouslySetInnerHTML={{ __html: icon.replace('currentColor', color) }} />
      </div>
      <div style={{ ...styles.kpiValue, color }}>{value}</div>
    </div>
  );
}

function GaugeBar({ label, value, max, color, displayValue, sublabel }: {
  label: string;
  value: number | null;
  max: number;
  color: string;
  displayValue: string;
  sublabel: string;
}) {
  const pctVal = value != null ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>{sublabel}</span>
          <span style={{ fontSize: 16, fontWeight: 800, color, fontFamily: 'var(--font-serif, Georgia, serif)' }}>{displayValue}</span>
        </div>
      </div>
      <div style={styles.gaugeTrack}>
        <div
          style={{
            height: '100%',
            width: `${pctVal}%`,
            borderRadius: 6,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            transition: 'width 0.6s ease',
            boxShadow: `0 0 10px ${color}40`,
          }}
        />
      </div>
    </div>
  );
}

function WhoopMetricCard({ label, value, color, info }: { label: string; value: string; color: string; info: string }) {
  return (
    <div style={styles.whoopCard}>
      <div style={{ ...styles.whoopCardGlow, borderColor: color }} />
      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color, fontFamily: 'var(--font-serif, Georgia, serif)', lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 6, lineHeight: 1.3 }}>{info}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Utility                                                            */
/* ------------------------------------------------------------------ */

function roleColor(role: string): string {
  switch (role) {
    case 'super_admin': return 'linear-gradient(135deg, #7c3aed, #6d28d9)';
    case 'research_admin': return 'linear-gradient(135deg, #2563eb, #1d4ed8)';
    case 'site_coordinator': return 'linear-gradient(135deg, #0891b2, #0e7490)';
    case 'research_assistant': return 'linear-gradient(135deg, #16a34a, #15803d)';
    case 'statistician': return 'linear-gradient(135deg, #d97706, #b45309)';
    default: return 'linear-gradient(135deg, #6b7280, #4b5563)';
  }
}

function statusColor(s: string): { bg: string; text: string } {
  switch (s) {
    case 'active': return { bg: 'rgba(16,185,129,0.12)', text: '#10b981' };
    case 'withdrawn': return { bg: 'rgba(239,68,68,0.12)', text: '#ef4444' };
    case 'completed': return { bg: 'rgba(37,99,235,0.12)', text: '#2563eb' };
    case 'paused': return { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' };
    default: return { bg: 'rgba(100,116,139,0.12)', text: '#64748b' };
  }
}

/* ------------------------------------------------------------------ */
/*  SVG Icons (inline strings)                                         */
/* ------------------------------------------------------------------ */

const enrolledIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
const activeIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
const whoopIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
const formIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>';
const clipboardIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>';
const calendarIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
const flagIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>';
const reviewIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
const importIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
const linkIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
const exportIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>';

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 0 48px',
  },

  /* Header */
  header: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f4c5c 100%)',
    borderRadius: 20,
    padding: '32px 36px',
    marginBottom: 28,
    boxShadow: '0 8px 32px rgba(15,23,42,0.25)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  headerInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap' as const,
    gap: 16,
    position: 'relative' as const,
    zIndex: 1,
  },
  headerLeft: {},
  h1: {
    fontSize: '1.85rem',
    fontFamily: 'var(--font-serif, Georgia, serif)',
    color: '#ffffff',
    margin: 0,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    margin: '8px 0 0',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontWeight: 500,
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 12px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    background: 'rgba(16,185,129,0.15)',
    color: '#10b981',
    border: '1px solid rgba(16,185,129,0.25)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#10b981',
    boxShadow: '0 0 8px #10b981',
    display: 'inline-block',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '8px 20px',
    borderRadius: 24,
    fontSize: 12,
    fontWeight: 700,
    color: '#fff',
    textTransform: 'capitalize' as const,
    whiteSpace: 'nowrap' as const,
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    letterSpacing: '0.03em',
    backdropFilter: 'blur(8px)',
  },

  /* Section */
  section: {
    background: '#ffffff',
    border: '1px solid rgba(148,163,184,0.15)',
    borderRadius: 16,
    padding: 28,
    marginBottom: 22,
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  sectionIconWrap: {
    width: 22,
    height: 22,
    flexShrink: 0,
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    fontFamily: 'var(--font-serif, Georgia, serif)',
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.005em',
  },

  /* KPI grid */
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
    gap: 16,
  },
  kpiCard: {
    background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
    border: '1px solid rgba(148,163,184,0.15)',
    borderRadius: 14,
    padding: '22px 20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  kpiGlow: {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    width: 4,
    height: '100%',
    borderRadius: '4px 0 0 4px',
    opacity: 0.8,
  },
  kpiTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    paddingLeft: 8,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
  },
  kpiIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  kpiValue: {
    fontSize: '2.4rem',
    fontWeight: 800,
    fontFamily: 'var(--font-serif, Georgia, serif)',
    lineHeight: 1,
    paddingLeft: 8,
    letterSpacing: '-0.02em',
  },
  kpiSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 6,
    paddingLeft: 8,
    fontWeight: 500,
  },

  /* Two-column layout */
  twoCol: {
    display: 'flex',
    gap: 22,
    flexWrap: 'wrap' as const,
  },

  /* Gauge bar */
  gaugeTrack: {
    width: '100%',
    height: 10,
    borderRadius: 6,
    background: 'rgba(148,163,184,0.12)',
    overflow: 'hidden' as const,
  },
  gaugeSubInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 4px',
    marginTop: -8,
  },

  /* WHOOP grid */
  whoopGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
    gap: 12,
  },
  whoopCard: {
    background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 100%)',
    border: '1px solid rgba(148,163,184,0.12)',
    borderRadius: 12,
    padding: '16px 14px',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  whoopCardGlow: {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    width: 3,
    height: '100%',
    borderLeft: '3px solid',
    borderRadius: '3px 0 0 3px',
  },

  /* Metrics grid inside cards (no longer used for burnout, kept for compatibility) */
  metricsGrid: {
    display: 'grid',
    gap: 0,
  },
  metricRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid rgba(148,163,184,0.12)',
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: '#374151',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: 700,
    fontFamily: 'var(--font-serif, Georgia, serif)',
    color: '#0f172a',
  },

  /* Table */
  tableWrap: {
    overflowX: 'auto' as const,
    borderRadius: 12,
    border: '1px solid rgba(148,163,184,0.12)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: 14,
  },
  th: {
    textAlign: 'left' as const,
    padding: '14px 16px',
    fontSize: 11,
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    borderBottom: '2px solid rgba(148,163,184,0.15)',
    background: '#f8fafc',
    whiteSpace: 'nowrap' as const,
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid rgba(148,163,184,0.08)',
    verticalAlign: 'middle' as const,
  },
  tableRow: {
    transition: 'background 0.2s ease',
  },
  monoText: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 13,
    fontWeight: 600,
    color: '#0f172a',
    background: 'rgba(148,163,184,0.08)',
    padding: '2px 8px',
    borderRadius: 6,
  },
  statusPill: {
    display: 'inline-block',
    padding: '5px 14px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'capitalize' as const,
    letterSpacing: '0.02em',
  },

  /* Quick Actions */
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 16,
  },
  actionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '18px 20px',
    borderRadius: 14,
    background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 100%)',
    border: '1px solid rgba(148,163,184,0.2)',
    textDecoration: 'none',
    color: '#0f172a',
    fontWeight: 600,
    fontSize: 14,
    transition: 'all 0.25s ease',
    position: 'relative' as const,
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: 'rgba(13,148,136,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    flexShrink: 0,
    color: '#0d9488',
  },
  actionIcon: {
    width: 20,
    height: 20,
    flexShrink: 0,
    color: '#0d9488',
  },
  actionLabel: {
    flex: 1,
    letterSpacing: '0.01em',
  },
  actionArrow: {
    fontSize: 20,
    color: '#94a3b8',
    fontWeight: 300,
    transition: 'transform 0.2s ease',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    padding: '0 7px',
    boxShadow: '0 2px 8px rgba(239,68,68,0.3)',
  },

  /* Skeleton */
  skeletonLine: {
    borderRadius: 8,
    background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'none',
  },

  /* Misc */
  loadingBox: {
    padding: '24px 0',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    fontStyle: 'italic' as const,
    margin: 0,
    padding: '20px 0',
  },
};
