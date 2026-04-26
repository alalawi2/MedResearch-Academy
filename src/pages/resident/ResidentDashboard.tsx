import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import CollapsibleInfo from '../../components/CollapsibleInfo';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface WhoopPull {
  avg_recovery_score: number | null;
  avg_hrv_rmssd_ms: number | null;
  avg_resting_hr_bpm: number | null;
  avg_total_sleep_min: number | null;
  avg_daily_strain: number | null;
  avg_sleep_efficiency_pct: number | null;
  pulled_at: string;
}

interface EventLogEntry {
  id: string;
  event_type: string;
  event_category: string | null;
  event_date: string;
  description: string | null;
}

interface WeeklyCheckinTrend {
  week_start: string;
  stress_level: number | null;
  sleep_rating: number | null;
  hours_worked: number | null;
}

/* ------------------------------------------------------------------ */
/*  Block schedule                                                     */
/* ------------------------------------------------------------------ */

interface BlockDef {
  block: number;
  start: string;
  end: string;
  label: string;
}

const BLOCK_SCHEDULE: BlockDef[] = [
  { block: 1,  start: '09-01', end: '09-27', label: 'Block 1: Sep 1 - Sep 27' },
  { block: 2,  start: '09-28', end: '10-25', label: 'Block 2: Sep 28 - Oct 25' },
  { block: 3,  start: '10-27', end: '11-22', label: 'Block 3: Oct 27 - Nov 22' },
  { block: 4,  start: '11-23', end: '12-20', label: 'Block 4: Nov 23 - Dec 20' },
  { block: 5,  start: '12-21', end: '01-17', label: 'Block 5: Dec 21 - Jan 17' },
  { block: 6,  start: '01-18', end: '02-14', label: 'Block 6: Jan 18 - Feb 14' },
  { block: 7,  start: '02-15', end: '03-14', label: 'Block 7: Feb 15 - Mar 14' },
  { block: 8,  start: '03-15', end: '04-11', label: 'Block 8: Mar 15 - Apr 11' },
  { block: 9,  start: '04-12', end: '05-09', label: 'Block 9: Apr 12 - May 9' },
  { block: 10, start: '05-10', end: '06-06', label: 'Block 10: May 10 - Jun 6' },
  { block: 11, start: '06-07', end: '07-06', label: 'Block 11: Jun 7 - Jul 6' },
  { block: 12, start: '07-07', end: '08-01', label: 'Block 12: Jul 7 - Aug 1' },
  { block: 13, start: '08-02', end: '08-31', label: 'Block 13: Aug 2 - Aug 31' },
];

function getBlockDates(b: BlockDef, refYear: number): { start: Date; end: Date } {
  const [sm, sd] = b.start.split('-').map(Number);
  const [em, ed] = b.end.split('-').map(Number);
  const startYear = refYear;
  let endYear = refYear;
  if (em < sm) endYear = refYear + 1;
  return {
    start: new Date(startYear, sm - 1, sd),
    end: new Date(endYear, em - 1, ed),
  };
}

interface CurrentBlockInfo {
  block: number;
  label: string;
  startDate: Date;
  endDate: Date;
  canSubmit: boolean;
  submissionOpensDate: Date;
  daysUntilOpen: number;
}

function getCurrentBlock(): CurrentBlockInfo | null {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const currentYear = now.getFullYear();
  const yearsToTry = [currentYear, currentYear - 1];

  for (const year of yearsToTry) {
    for (const b of BLOCK_SCHEDULE) {
      const { start, end } = getBlockDates(b, year);
      if (now >= start && now <= end) {
        const submissionOpens = new Date(start);
        submissionOpens.setDate(submissionOpens.getDate() + 14);
        const canSubmit = now >= submissionOpens;
        const daysUntilOpen = canSubmit ? 0 : Math.ceil((submissionOpens.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return { block: b.block, label: b.label, startDate: start, endDate: end, canSubmit, submissionOpensDate: submissionOpens, daysUntilOpen };
      }
    }
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getMondayOfCurrentWeek(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateShort(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatMinutesToHM(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${h}:${m.toString().padStart(2, '0')}`;
}

function getMonthStart(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

/* ------------------------------------------------------------------ */
/*  Color helpers                                                      */
/* ------------------------------------------------------------------ */

const COLORS = {
  navy: '#0f172a',
  navyLight: '#1e293b',
  teal: '#0d9488',
  tealLight: '#14b8a6',
  green: '#22c55e',
  greenBg: 'rgba(34,197,94,0.12)',
  orange: '#f97316',
  orangeBg: 'rgba(249,115,22,0.12)',
  red: '#ef4444',
  redBg: 'rgba(239,68,68,0.12)',
  gray: '#64748b',
  grayLight: '#94a3b8',
  border: 'rgba(15,23,42,0.08)',
  cardBg: 'rgba(255,255,255,0.75)',
  cardBgSolid: '#ffffff',
  pageBg: '#f1f5f9',
  glassBorder: 'rgba(255,255,255,0.6)',
};

function recoveryColor(v: number): string {
  if (v >= 67) return COLORS.green;
  if (v >= 34) return COLORS.orange;
  return COLORS.red;
}

function sleepColor(min: number): string {
  return min >= 420 ? COLORS.green : COLORS.red; // 7 hours = 420 min
}

function stressBarColor(v: number): string {
  if (v <= 2) return COLORS.green;
  if (v <= 3) return COLORS.orange;
  return COLORS.red;
}

function sleepRatingBarColor(v: number): string {
  if (v >= 4) return COLORS.green;
  if (v >= 3) return COLORS.orange;
  return COLORS.red;
}

/* Category colors for event timeline */
const CATEGORY_COLORS: Record<string, string> = {
  clinical: '#6366f1',
  academic: '#0ea5e9',
  personal: '#a855f7',
  program: '#f59e0b',
  wellness: COLORS.teal,
};

/* ------------------------------------------------------------------ */
/*  CSS (injected once)                                                */
/* ------------------------------------------------------------------ */

const DASHBOARD_CSS = `
@keyframes dashPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
@keyframes dashFadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes dashCircleIn {
  from { stroke-dashoffset: var(--dash-circumference); }
  to { stroke-dashoffset: var(--dash-offset); }
}
.dash-card {
  background: ${COLORS.cardBg};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid ${COLORS.glassBorder};
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.03);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.dash-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}
.dash-action-card {
  background: ${COLORS.cardBg};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid ${COLORS.glassBorder};
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.03);
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.15s ease;
  text-decoration: none;
  color: inherit;
  display: block;
}
.dash-action-card:hover {
  box-shadow: 0 6px 20px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}
.dash-skeleton {
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: dashPulse 1.5s ease-in-out infinite;
  border-radius: 16px;
}
`;

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SkeletonCard({ height = 120 }: { height?: number }) {
  return <div className="dash-skeleton" style={{ height, marginBottom: 16 }} />;
}

/* Circular progress ring */
function MetricRing({
  value,
  max,
  color,
  label,
  display,
  unit,
  size = 100,
}: {
  value: number | null;
  max: number;
  color: string;
  label: string;
  display: string;
  unit?: string;
  size?: number;
}) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = value != null ? Math.min(value / max, 1) : 0;
  const offset = circumference * (1 - pct);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(0,0,0,0.06)"
            strokeWidth={strokeWidth}
          />
          {value != null && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{
                ['--dash-circumference' as string]: circumference,
                ['--dash-offset' as string]: offset,
                animation: 'dashCircleIn 1s ease-out forwards',
              }}
            />
          )}
        </svg>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, color: value != null ? color : COLORS.grayLight, lineHeight: 1.1 }}>
            {display}
          </div>
          {unit && (
            <div style={{ fontSize: 9, color: COLORS.gray, marginTop: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {unit}
            </div>
          )}
        </div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.gray, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </div>
    </div>
  );
}

/* Horizontal bar for trends */
function TrendBar({
  values,
  colorFn,
  maxVal,
  labels,
}: {
  values: (number | null)[];
  colorFn: (v: number) => string;
  maxVal: number;
  labels: string[];
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {values.map((v, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 10, color: COLORS.gray, width: 36, textAlign: 'right', flexShrink: 0 }}>
            {labels[i]}
          </div>
          <div style={{ flex: 1, height: 14, background: 'rgba(0,0,0,0.04)', borderRadius: 7, overflow: 'hidden' }}>
            {v != null && (
              <div
                style={{
                  width: `${Math.max((v / maxVal) * 100, 8)}%`,
                  height: '100%',
                  background: colorFn(v),
                  borderRadius: 7,
                  transition: 'width 0.6s ease',
                }}
              />
            )}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: v != null ? COLORS.navy : COLORS.grayLight, width: 24, textAlign: 'right', flexShrink: 0 }}>
            {v != null ? v : '--'}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function ResidentDashboard() {
  const { residentProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [whoop, setWhoop] = useState<WhoopPull | null>(null);
  const [assessmentDone, setAssessmentDone] = useState(false);
  const [assessmentDate, setAssessmentDate] = useState<string | null>(null);
  const [checkinDone, setCheckinDone] = useState(false);
  const [eventCount, setEventCount] = useState(0);
  const [events, setEvents] = useState<EventLogEntry[]>([]);
  const [trends, setTrends] = useState<WeeklyCheckinTrend[]>([]);

  const blockInfo = useMemo(() => getCurrentBlock(), []);

  useEffect(() => {
    if (!residentProfile) return;
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residentProfile]);

  async function fetchAll() {
    if (!residentProfile) return;
    const rid = residentProfile.id;
    const mondayISO = getMondayOfCurrentWeek();
    const monthStart = getMonthStart();

    try {
      // 1) WHOOP — latest pull
      const whoopP = supabase
        .from('whoop_pulls')
        .select('avg_recovery_score, avg_hrv_rmssd_ms, avg_resting_hr_bpm, avg_total_sleep_min, avg_daily_strain, avg_sleep_efficiency_pct, pulled_at')
        .eq('resident_id', rid)
        .order('pulled_at', { ascending: false })
        .limit(1);

      // 2) Block assessment
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let assessP: PromiseLike<any> | null = null;
      if (blockInfo) {
        const startISO = blockInfo.startDate.toISOString().slice(0, 10);
        const endISO = blockInfo.endDate.toISOString().slice(0, 10);
        assessP = supabase
          .from('block_assessments')
          .select('id, assessment_date')
          .eq('resident_id', rid)
          .gte('assessment_date', startISO)
          .lte('assessment_date', endISO)
          .limit(1);
      }

      // 3) Weekly check-in this week
      const checkinP = supabase
        .from('weekly_checkins')
        .select('id')
        .eq('resident_id', rid)
        .eq('week_start', mondayISO)
        .limit(1);

      // 4) Event logs — last 5
      const eventsP = supabase
        .from('event_logs')
        .select('id, event_type, event_category, event_date, description')
        .eq('resident_id', rid)
        .order('event_date', { ascending: false })
        .limit(5);

      // 5) Event count this month
      const eventCountP = supabase
        .from('event_logs')
        .select('id', { count: 'exact', head: true })
        .eq('resident_id', rid)
        .gte('event_date', monthStart)
        .limit(1000);

      // 6) Weekly check-in trends — last 4 weeks
      const trendsP = supabase
        .from('weekly_checkins')
        .select('week_start, stress_level, sleep_rating, hours_worked')
        .eq('resident_id', rid)
        .order('week_start', { ascending: false })
        .limit(4);

      const [whoopRes, assessRes, checkinRes, eventsRes, eventCountRes, trendsRes] = await Promise.all([
        whoopP, assessP, checkinP, eventsP, eventCountP, trendsP,
      ]);

      // WHOOP
      if (whoopRes.data && whoopRes.data.length > 0) {
        setWhoop(whoopRes.data[0] as WhoopPull);
      }

      // Assessment
      if (assessRes) {
        const data = (assessRes as any)?.data;
        if (data && data.length > 0) {
          setAssessmentDone(true);
          setAssessmentDate(data[0].assessment_date);
        }
      }

      // Check-in
      setCheckinDone((checkinRes.data?.length ?? 0) > 0);

      // Events
      setEvents((eventsRes.data as EventLogEntry[]) ?? []);
      setEventCount(eventCountRes.count ?? 0);

      // Trends
      setTrends(((trendsRes.data as WeeklyCheckinTrend[]) ?? []).reverse());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  const firstName = residentProfile?.full_name?.split(' ')[0] || 'Resident';
  const participantId = residentProfile?.study_participant_id || '---';

  function getAssessmentStatus(): 'done' | 'pending' | 'locked' {
    if (assessmentDone) return 'done';
    if (!blockInfo) return 'locked';
    if (!blockInfo.canSubmit) return 'locked';
    return 'pending';
  }

  /* ---------------------------------------------------------------- */
  /*  Loading skeleton                                                 */
  /* ---------------------------------------------------------------- */

  if (loading) {
    return (
      <div style={{ padding: '16px 12px', maxWidth: 720, margin: '0 auto' }}>
        <style>{DASHBOARD_CSS}</style>
        <SkeletonCard height={72} />
        <SkeletonCard height={220} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <SkeletonCard height={120} />
          <SkeletonCard height={120} />
          <SkeletonCard height={120} />
        </div>
        <SkeletonCard height={160} />
        <SkeletonCard height={140} />
      </div>
    );
  }

  const assessmentStatus = getAssessmentStatus();

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div style={{ padding: '16px 12px', maxWidth: 720, margin: '0 auto' }}>
      <style>{DASHBOARD_CSS}</style>

      {/* -------- Demographics Banner -------- */}
      {!residentProfile?.demographics_completed && (
        <Link to="/resident/demographics" style={{ textDecoration: 'none' }}>
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 16,
              marginBottom: 20,
              fontSize: 14,
              lineHeight: 1.6,
              background: `linear-gradient(135deg, ${COLORS.orangeBg}, rgba(249,115,22,0.06))`,
              border: `2px solid ${COLORS.orange}`,
              color: '#9a3412',
              cursor: 'pointer',
              animation: 'dashFadeIn 0.4s ease',
            }}
          >
            <strong>Action Required:</strong> Please complete your enrollment form first.
            <span style={{ display: 'block', marginTop: 4, fontSize: 13, fontWeight: 600, color: '#ea580c' }}>
              Tap here to complete &rarr;
            </span>
          </div>
        </Link>
      )}

      {/* ================================================================ */}
      {/* 1. WELCOME HEADER                                                */}
      {/* ================================================================ */}
      <div
        style={{
          marginBottom: 24,
          animation: 'dashFadeIn 0.4s ease',
        }}
      >
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: COLORS.navy,
            marginBottom: 8,
            marginTop: 0,
            letterSpacing: -0.3,
          }}
        >
          {getGreeting()}, {firstName}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Participant badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 700,
              padding: '4px 14px',
              borderRadius: 999,
              background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.navyLight})`,
              color: '#fff',
              letterSpacing: 0.6,
              textTransform: 'uppercase',
            }}
          >
            {participantId}
          </span>

          {/* Block info badge */}
          {blockInfo && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: 12,
                fontWeight: 500,
                padding: '4px 12px',
                borderRadius: 999,
                background: 'rgba(13,148,136,0.1)',
                color: COLORS.teal,
                letterSpacing: 0.3,
              }}
            >
              {blockInfo.label.split(':')[0]}: {formatDateShort(blockInfo.startDate)} - {formatDateShort(blockInfo.endDate)}
            </span>
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* 2. WHOOP BIOMETRICS CARD                                         */}
      {/* ================================================================ */}
      <div
        className="dash-card"
        style={{
          padding: '20px 16px',
          marginBottom: 20,
          animation: 'dashFadeIn 0.5s ease',
          background: `linear-gradient(135deg, ${COLORS.cardBg}, rgba(13,148,136,0.03))`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: COLORS.navy, margin: 0, letterSpacing: -0.2 }}>
            WHOOP Biometrics
          </h2>
          {whoop && (
            <span style={{ fontSize: 11, color: COLORS.gray }}>
              Last updated: {formatDate(whoop.pulled_at)}
            </span>
          )}
        </div>

        {whoop ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
              justifyItems: 'center',
            }}
          >
            <MetricRing
              value={whoop.avg_recovery_score}
              max={100}
              color={whoop.avg_recovery_score != null ? recoveryColor(whoop.avg_recovery_score) : COLORS.grayLight}
              label="Recovery"
              display={whoop.avg_recovery_score != null ? `${Math.round(whoop.avg_recovery_score)}%` : '--'}
            />
            <MetricRing
              value={whoop.avg_hrv_rmssd_ms}
              max={200}
              color={COLORS.teal}
              label="HRV"
              display={whoop.avg_hrv_rmssd_ms != null ? `${Math.round(whoop.avg_hrv_rmssd_ms)}` : '--'}
              unit="ms"
            />
            <MetricRing
              value={whoop.avg_resting_hr_bpm}
              max={100}
              color={COLORS.navy}
              label="Resting HR"
              display={whoop.avg_resting_hr_bpm != null ? `${Math.round(whoop.avg_resting_hr_bpm)}` : '--'}
              unit="bpm"
            />
            <MetricRing
              value={whoop.avg_total_sleep_min}
              max={600}
              color={whoop.avg_total_sleep_min != null ? sleepColor(whoop.avg_total_sleep_min) : COLORS.grayLight}
              label="Sleep"
              display={whoop.avg_total_sleep_min != null ? formatMinutesToHM(whoop.avg_total_sleep_min) : '--'}
              unit={whoop.avg_total_sleep_min != null ? 'h:m' : ''}
            />
            <MetricRing
              value={whoop.avg_daily_strain}
              max={21}
              color="#6366f1"
              label="Strain"
              display={whoop.avg_daily_strain != null ? `${whoop.avg_daily_strain.toFixed(1)}` : '--'}
              unit="/21"
            />
            <MetricRing
              value={whoop.avg_sleep_efficiency_pct}
              max={100}
              color={COLORS.tealLight}
              label="Sleep Eff."
              display={whoop.avg_sleep_efficiency_pct != null ? `${Math.round(whoop.avg_sleep_efficiency_pct)}%` : '--'}
            />
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '32px 16px',
              color: COLORS.gray,
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.4 }}>&#9201;</div>
            Awaiting WHOOP data — your first data pull will happen overnight
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* 3. ACTION CARDS ROW                                              */}
      {/* ================================================================ */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 20,
          animation: 'dashFadeIn 0.6s ease',
        }}
      >
        {/* Block Assessment */}
        <Link to="/resident/questionnaire" className="dash-action-card" style={{ padding: '16px 12px' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
              fontSize: 18,
              background: assessmentStatus === 'done' ? COLORS.greenBg
                : assessmentStatus === 'pending' ? COLORS.orangeBg
                : 'rgba(0,0,0,0.04)',
            }}
          >
            {assessmentStatus === 'done' ? '\u2713' : assessmentStatus === 'pending' ? '\u270E' : '\uD83D\uDD12'}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy, marginBottom: 4 }}>
            Block Assessment
          </div>
          <div style={{ fontSize: 11, color: COLORS.gray, lineHeight: 1.4 }}>
            {assessmentStatus === 'done' && assessmentDate
              ? `Completed ${formatDate(assessmentDate)}`
              : assessmentStatus === 'pending'
              ? 'Ready to complete \u2192'
              : blockInfo
              ? `Opens ${formatDateShort(blockInfo.submissionOpensDate)}`
              : 'No active block'}
          </div>
          <div
            style={{
              display: 'inline-block',
              marginTop: 8,
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 999,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              background: assessmentStatus === 'done' ? COLORS.greenBg
                : assessmentStatus === 'pending' ? COLORS.orangeBg
                : 'rgba(0,0,0,0.04)',
              color: assessmentStatus === 'done' ? '#166534'
                : assessmentStatus === 'pending' ? '#9a3412'
                : COLORS.gray,
            }}
          >
            {assessmentStatus === 'done' ? 'Done' : assessmentStatus === 'pending' ? 'Open' : 'Locked'}
          </div>
        </Link>

        {/* Weekly Check-in */}
        <Link to="/resident/checkin" className="dash-action-card" style={{ padding: '16px 12px' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
              fontSize: 18,
              background: checkinDone ? COLORS.greenBg : COLORS.orangeBg,
            }}
          >
            {checkinDone ? '\u2713' : '\u23F0'}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy, marginBottom: 4 }}>
            Weekly Check-in
          </div>
          <div style={{ fontSize: 11, color: COLORS.gray, lineHeight: 1.4 }}>
            {checkinDone ? 'Done this week' : 'Due this week \u2192'}
          </div>
          <div
            style={{
              display: 'inline-block',
              marginTop: 8,
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 999,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              background: checkinDone ? COLORS.greenBg : COLORS.orangeBg,
              color: checkinDone ? '#166534' : '#9a3412',
            }}
          >
            {checkinDone ? 'Done' : 'Pending'}
          </div>
        </Link>

        {/* Event Log */}
        <Link to="/resident/events" className="dash-action-card" style={{ padding: '16px 12px' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
              fontSize: 18,
              background: 'rgba(99,102,241,0.1)',
            }}
          >
            &#128203;
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy, marginBottom: 4 }}>
            Event Log
          </div>
          <div style={{ fontSize: 11, color: COLORS.gray, lineHeight: 1.4 }}>
            {eventCount} event{eventCount !== 1 ? 's' : ''} this month
          </div>
          <div
            style={{
              display: 'inline-block',
              marginTop: 8,
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 999,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              background: 'rgba(99,102,241,0.1)',
              color: '#4338ca',
            }}
          >
            Log Event
          </div>
        </Link>
      </div>

      {/* ================================================================ */}
      {/* 4. WEEKLY TRENDS                                                 */}
      {/* ================================================================ */}
      <div
        className="dash-card"
        style={{
          padding: '20px 16px',
          marginBottom: 20,
          animation: 'dashFadeIn 0.7s ease',
        }}
      >
        <h2 style={{ fontSize: 15, fontWeight: 700, color: COLORS.navy, margin: '0 0 16px', letterSpacing: -0.2 }}>
          Weekly Trends
        </h2>

        {trends.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: COLORS.gray, fontSize: 13 }}>
            Complete weekly check-ins to see your trends
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Stress */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.navy, marginBottom: 6 }}>
                Stress Level <span style={{ fontWeight: 400, color: COLORS.gray }}>(1-5)</span>
              </div>
              <TrendBar
                values={trends.map(t => t.stress_level)}
                colorFn={stressBarColor}
                maxVal={5}
                labels={trends.map(t => {
                  const d = new Date(t.week_start);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                })}
              />
            </div>

            {/* Sleep rating */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.navy, marginBottom: 6 }}>
                Sleep Rating <span style={{ fontWeight: 400, color: COLORS.gray }}>(1-5)</span>
              </div>
              <TrendBar
                values={trends.map(t => t.sleep_rating)}
                colorFn={sleepRatingBarColor}
                maxVal={5}
                labels={trends.map(t => {
                  const d = new Date(t.week_start);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                })}
              />
            </div>

            {/* Hours worked */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.navy, marginBottom: 6 }}>
                Hours Worked
              </div>
              <TrendBar
                values={trends.map(t => t.hours_worked)}
                colorFn={() => COLORS.teal}
                maxVal={100}
                labels={trends.map(t => {
                  const d = new Date(t.week_start);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                })}
              />
            </div>
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* 5. RECENT EVENTS TIMELINE                                        */}
      {/* ================================================================ */}
      <div
        className="dash-card"
        style={{
          padding: '20px 16px',
          marginBottom: 20,
          animation: 'dashFadeIn 0.8s ease',
        }}
      >
        <h2 style={{ fontSize: 15, fontWeight: 700, color: COLORS.navy, margin: '0 0 16px', letterSpacing: -0.2 }}>
          Recent Events
        </h2>

        {events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: COLORS.gray, fontSize: 13 }}>
            No events logged yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {events.map((evt, i) => {
              const catColor = CATEGORY_COLORS[evt.event_category ?? ''] ?? COLORS.gray;
              return (
                <div
                  key={evt.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom: i < events.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                  }}
                >
                  {/* Timeline dot */}
                  <div style={{ paddingTop: 4, flexShrink: 0 }}>
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: catColor,
                        boxShadow: `0 0 0 3px ${catColor}22`,
                      }}
                    />
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, textTransform: 'capitalize' }}>
                      {evt.event_type.replace(/_/g, ' ')}
                    </div>
                    {evt.description && (
                      <div
                        style={{
                          fontSize: 12,
                          color: COLORS.gray,
                          marginTop: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {evt.description}
                      </div>
                    )}
                  </div>
                  {/* Date */}
                  <div style={{ fontSize: 11, color: COLORS.grayLight, whiteSpace: 'nowrap', flexShrink: 0, paddingTop: 1 }}>
                    {formatDate(evt.event_date)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* 6. ABOUT THIS STUDY                                              */}
      {/* ================================================================ */}
      <div style={{ marginBottom: 20, animation: 'dashFadeIn 0.9s ease' }}>
        <CollapsibleInfo title="About This Study" icon="&#128300;">
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 600, color: COLORS.navy, marginBottom: 4, fontSize: 14 }}>
              Resident Burnout &amp; Biophysical Parameters
            </div>
            <p style={{ margin: '0 0 8px', fontSize: 13, color: '#374151' }}>
              This study investigates the association between healthcare workers&apos; burnout and
              biophysical parameters using WHOOP wearable devices. It is a pilot multi-center cohort
              study conducted at SQUH, Royal Hospital, and Armed Forces Hospital.
            </p>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 600, color: COLORS.navy, marginBottom: 4, fontSize: 13 }}>
              What data is collected?
            </div>
            <ul style={{ margin: '0', paddingLeft: 18, fontSize: 13, color: '#374151' }}>
              <li style={{ marginBottom: 4 }}>
                <strong>WHOOP wearable:</strong> heart rate, HRV, sleep, recovery, and strain (pulled daily at 3 AM)
              </li>
              <li style={{ marginBottom: 4 }}>
                <strong>Block assessments:</strong> WHO-5, CBI (burnout), PHQ-9 (depression), GAD-7 (anxiety) &mdash; end of each block
              </li>
              <li style={{ marginBottom: 4 }}>
                <strong>Weekly check-ins:</strong> 6 brief questions on hours, on-call shifts, sleep, and stress
              </li>
              <li>
                <strong>Event logs:</strong> significant clinical, academic, personal, or program events
              </li>
            </ul>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 600, color: COLORS.navy, marginBottom: 4, fontSize: 13 }}>
              Privacy &amp; Confidentiality
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#374151' }}>
              Your data is pseudonymized &mdash; you are identified by a study ID (e.g. RES-002),
              not your name. Only authorized researchers can access identifiable information. You can
              revoke WHOOP access at any time.
            </p>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 600, color: COLORS.navy, marginBottom: 4, fontSize: 13 }}>
              Ethics Approval
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#374151' }}>
              This study is approved by the SQU Medical Research Ethics Committee (MREC #3190) and
              Royal Hospital ethics committee.
            </p>
          </div>

          <div>
            <div style={{ fontWeight: 600, color: COLORS.navy, marginBottom: 4, fontSize: 13 }}>
              Contact the Research Team
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#374151' }}>
              Dr. Mohamed Al Rawahi &mdash; <a href="mailto:mrawahi@squ.edu.om" style={{ color: COLORS.teal }}>mrawahi@squ.edu.om</a>
              <br />
              Dr. Abdullah Al Alawi &mdash; <a href="mailto:dr.abdullahalalawi@gmail.com" style={{ color: COLORS.teal }}>dr.abdullahalalawi@gmail.com</a>
            </p>
          </div>
        </CollapsibleInfo>
      </div>
    </div>
  );
}
