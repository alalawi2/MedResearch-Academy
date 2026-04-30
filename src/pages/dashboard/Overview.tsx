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
  pendingReviews: number;
}

interface BurnoutOverview {
  avgWork: number | null;
  avgPHQ9: number | null;
  phqModerateRate: number | null;
  avgGAD7: number | null;
  gadModerateRate: number | null;
  avgISI: number | null;
  assessmentCount: number;
}

interface WhoopSummary {
  avgHRV: number | null;
  avgRecovery: number | null;
  avgSleepHours: number | null;
  avgStrain: number | null;
}

interface Participant {
  id: string;
  study_participant_id: string;
  full_name: string | null;
  status: string;
  whoop_user_id: string | null;
  demographics_completed: boolean | null;
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
        .select('id, study_participant_id, full_name, status, whoop_user_id, demographics_completed')
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
      const [baRes, wcRes, elRes, whoopCountRes] = await Promise.all([
        supabase.from('block_assessments').select('id', { count: 'exact' }).eq('study_id', studyId).limit(1),
        supabase.from('weekly_checkins').select('id', { count: 'exact' }).eq('study_id', studyId).limit(1),
        supabase.from('event_logs').select('id', { count: 'exact' }).eq('study_id', studyId).limit(1),
        supabase.from('whoop_pulls').select('id', { count: 'exact' }).eq('study_id', studyId).limit(1),
      ]);

      if (!cancelled) {
        setCollection({
          blockAssessments: baRes.count ?? 0,
          weeklyCheckins: wcRes.count ?? 0,
          eventsLogged: elRes.count ?? 0,
          pendingReviews: whoopCountRes.count ?? 0,
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
          setBurnout({ avgWork: null, avgPHQ9: null, phqModerateRate: null, avgGAD7: null, gadModerateRate: null, avgISI: null, assessmentCount: 0 });
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
            assessmentCount: totalAssessments,
          });
        }
      }

      /* WHOOP Biometrics — latest pull per participant */
      const { data: whoopData } = await supabase
        .from('whoop_pulls')
        .select('resident_id, avg_hrv_rmssd_ms, avg_recovery_score, avg_total_sleep_min, avg_daily_strain, pulled_at')
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
          setWhoop({
            avgHRV: avg(latest.map(r => r.avg_hrv_rmssd_ms).filter((v): v is number => v != null)),
            avgRecovery: avg(latest.map(r => r.avg_recovery_score).filter((v): v is number => v != null)),
            avgSleepHours: avg(latest.map(r => r.avg_total_sleep_min != null ? r.avg_total_sleep_min / 60 : null).filter((v): v is number => v != null)),
            avgStrain: avg(latest.map(r => r.avg_daily_strain).filter((v): v is number => v != null)),
          });
        }
      }

      if (!cancelled) setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [studyId]);

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
      { label: 'WHOOP Pulls', value: collection.pendingReviews, color: '#7c3aed', bg: '#f5f3ff', icon: whoopIcon },
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
        <div>
          <h1 style={styles.h1}>Welcome, {staff?.full_name ?? 'Researcher'}</h1>
          <p style={styles.subtitle}>
            {studySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            <span style={styles.statusBadge}>Active</span>
          </p>
        </div>
        <span style={{ ...styles.roleBadge, background: roleColor(userRole) }}>
          {ROLE_LABELS[userRole] ?? userRole.replace(/_/g, ' ')}
        </span>
      </header>

      {/* ---------- ENROLLMENT KPIs ---------- */}
      <Section title="Enrollment">
        <div style={styles.kpiGrid}>
          {loading
            ? [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
            : enrollmentCards.map(c => (
                <KPICard key={c.label} label={c.label} value={c.value} color={c.color} bg={c.bg} icon={c.icon} />
              ))}
        </div>
      </Section>

      {/* ---------- DATA COLLECTION ---------- */}
      <Section title="Data Collection Progress">
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
        <Section title="Burnout Overview" style={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <div style={styles.loadingBox}><div style={{ ...styles.skeletonLine, width: '50%', height: 16 }} /></div>
          ) : burnout && burnout.assessmentCount === 0 ? (
            <p style={styles.emptyText}>No assessments yet</p>
          ) : burnout ? (
            <div style={styles.metricsGrid}>
              <MetricRow label="CBI Work" value={fmt(burnout.avgWork)} />
              <MetricRow label="Avg PHQ-9" value={fmt(burnout.avgPHQ9)} />
              <MetricRow label="PHQ-9 Moderate+" value={pct(burnout.phqModerateRate)} warn={burnout.phqModerateRate != null && burnout.phqModerateRate > 25} />
              <MetricRow label="Avg GAD-7" value={fmt(burnout.avgGAD7)} />
              <MetricRow label="GAD-7 Moderate+" value={pct(burnout.gadModerateRate)} warn={burnout.gadModerateRate != null && burnout.gadModerateRate > 25} />
              <MetricRow label="Avg ISI" value={fmt(burnout.avgISI)} />
            </div>
          ) : null}
        </Section>

        {/* WHOOP biometrics */}
        <Section title="WHOOP Biometrics Summary" style={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <div style={styles.loadingBox}><div style={{ ...styles.skeletonLine, width: '50%', height: 16 }} /></div>
          ) : whoop ? (
            <div style={styles.metricsGrid}>
              <MetricRow label="Avg HRV (ms)" value={fmt(whoop.avgHRV)} />
              <MetricRow label="Avg Recovery" value={fmt(whoop.avgRecovery, 0, '%')} />
              <MetricRow label="Avg Sleep" value={fmt(whoop.avgSleepHours, 1, ' hrs')} />
              <MetricRow label="Avg Strain" value={fmt(whoop.avgStrain)} />
            </div>
          ) : (
            <p style={styles.emptyText}>No WHOOP data yet</p>
          )}
        </Section>
      </div>

      {/* ---------- PARTICIPANT TABLE ---------- */}
      <Section title="Participants">
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Participant ID</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>WHOOP</th>
                <th style={styles.th}>Demographics</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)
              ) : participants.length === 0 ? (
                <tr><td colSpan={4} style={{ ...styles.td, textAlign: 'center', color: 'var(--text-muted)' }}>No participants enrolled</td></tr>
              ) : (
                participants.map((p, idx) => (
                  <tr
                    key={p.id}
                    style={{ ...styles.tableRow, background: idx % 2 === 0 ? '#fff' : '#f9fafb', cursor: 'pointer' }}
                    onClick={() => { window.location.href = `/dashboard/residents/${p.id}`; }}
                  >
                    <td style={styles.td}><span style={styles.monoText}>{p.study_participant_id}</span></td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statusPill, background: statusColor(p.status).bg, color: statusColor(p.status).text }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statusPill, background: p.whoop_user_id ? '#dcfce7' : '#fef3c7', color: p.whoop_user_id ? '#166534' : '#92400e' }}>
                        {p.whoop_user_id ? 'Connected' : 'Not connected'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statusPill, background: p.demographics_completed ? '#dcfce7' : '#fee2e2', color: p.demographics_completed ? '#166534' : '#991b1b' }}>
                        {p.demographics_completed ? 'Done' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ---------- QUICK ACTIONS ---------- */}
      <Section title="Quick Actions">
        <div style={styles.actionsGrid}>
          {quickActions.map(a => (
            <a key={a.label} href={a.href} style={styles.actionCard}>
              <div style={styles.actionIcon} dangerouslySetInnerHTML={{ __html: a.icon }} />
              <span style={styles.actionLabel}>{a.label}</span>
              {a.badge > 0 && <span style={styles.badge}>{a.badge}</span>}
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

function Section({ title, children, style: extra }: { title: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <section style={{ ...styles.section, ...extra }}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

function KPICard({ label, value, color, bg, icon }: { label: string; value: number | string; color: string; bg: string; icon: string }) {
  return (
    <div style={styles.kpiCard}>
      <div style={styles.kpiTop}>
        <span style={styles.kpiLabel}>{label}</span>
        <div style={{ ...styles.kpiIconWrap, background: bg }} dangerouslySetInnerHTML={{ __html: icon.replace('currentColor', color) }} />
      </div>
      <div style={{ ...styles.kpiValue, color }}>{value}</div>
    </div>
  );
}

function MetricRow({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div style={styles.metricRow}>
      <span style={styles.metricLabel}>{label}</span>
      <span style={{ ...styles.metricValue, color: warn ? '#dc2626' : 'var(--text)' }}>{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Utility                                                            */
/* ------------------------------------------------------------------ */

function roleColor(role: string): string {
  switch (role) {
    case 'super_admin': return '#7c3aed';
    case 'research_admin': return '#2563eb';
    case 'site_coordinator': return '#0891b2';
    case 'research_assistant': return '#16a34a';
    case 'statistician': return '#d97706';
    default: return '#6b7280';
  }
}

function statusColor(s: string): { bg: string; text: string } {
  switch (s) {
    case 'active': return { bg: '#dcfce7', text: '#166534' };
    case 'withdrawn': return { bg: '#fee2e2', text: '#991b1b' };
    case 'completed': return { bg: '#dbeafe', text: '#1e40af' };
    case 'paused': return { bg: '#fef3c7', text: '#92400e' };
    default: return { bg: '#f3f4f6', text: '#374151' };
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  h1: {
    fontSize: '1.75rem',
    fontFamily: 'var(--font-serif, Georgia, serif)',
    color: 'var(--primary, #1e3a5f)',
    margin: 0,
    lineHeight: 1.3,
  },
  subtitle: {
    color: 'var(--text-muted, #6b7280)',
    fontSize: 14,
    margin: '6px 0 0',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  statusBadge: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    background: '#dcfce7',
    color: '#166534',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '6px 16px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    color: '#fff',
    textTransform: 'capitalize' as const,
    whiteSpace: 'nowrap' as const,
  },

  /* Section */
  section: {
    background: '#fff',
    border: '1px solid var(--border, #e5e7eb)',
    borderRadius: 14,
    padding: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    fontFamily: 'var(--font-serif, Georgia, serif)',
    color: 'var(--primary, #1e3a5f)',
    margin: '0 0 16px',
  },

  /* KPI grid */
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 14,
  },
  kpiCard: {
    background: '#fff',
    border: '1px solid var(--border, #e5e7eb)',
    borderRadius: 12,
    padding: '20px 18px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  kpiTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--text-muted, #6b7280)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  kpiIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  kpiValue: {
    fontSize: '2rem',
    fontWeight: 700,
    fontFamily: 'var(--font-serif, Georgia, serif)',
    lineHeight: 1,
  },

  /* Two-column layout */
  twoCol: {
    display: 'flex',
    gap: 20,
    flexWrap: 'wrap' as const,
  },

  /* Metrics grid inside cards */
  metricsGrid: {
    display: 'grid',
    gap: 0,
  },
  metricRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid var(--border, #e5e7eb)',
  },
  metricLabel: {
    fontSize: 13,
    color: 'var(--text-muted, #6b7280)',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 700,
    fontFamily: 'var(--font-serif, Georgia, serif)',
  },

  /* Table */
  tableWrap: {
    overflowX: 'auto' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: 13,
  },
  th: {
    textAlign: 'left' as const,
    padding: '10px 14px',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--text-muted, #6b7280)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    borderBottom: '2px solid var(--border, #e5e7eb)',
    whiteSpace: 'nowrap' as const,
  },
  td: {
    padding: '10px 14px',
    borderBottom: '1px solid var(--border, #e5e7eb)',
    verticalAlign: 'middle' as const,
  },
  tableRow: {
    transition: 'background 0.15s',
  },
  monoText: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 12,
    color: 'var(--text, #1f2937)',
  },
  statusPill: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'capitalize' as const,
  },

  /* Quick Actions */
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 14,
  },
  actionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px 18px',
    borderRadius: 12,
    background: 'var(--bg-muted, #f9fafb)',
    border: '1px solid var(--border, #e5e7eb)',
    textDecoration: 'none',
    color: 'var(--text, #1f2937)',
    fontWeight: 600,
    fontSize: 14,
    transition: 'box-shadow 0.15s, border-color 0.15s',
    position: 'relative' as const,
  },
  actionIcon: {
    width: 20,
    height: 20,
    flexShrink: 0,
    color: 'var(--primary, #1e3a5f)',
  },
  actionLabel: {
    flex: 1,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    background: '#dc2626',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    padding: '0 6px',
  },

  /* Skeleton */
  skeletonLine: {
    borderRadius: 6,
    background: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)',
    backgroundSize: '200% 100%',
    animation: 'none', // CSS animation not available inline; uses static gradient
  },

  /* Misc */
  loadingBox: {
    padding: '24px 0',
  },
  emptyText: {
    color: 'var(--text-muted, #6b7280)',
    fontSize: 14,
    fontStyle: 'italic' as const,
    margin: 0,
    padding: '16px 0',
  },
};
