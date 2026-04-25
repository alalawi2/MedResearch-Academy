import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import CollapsibleInfo from '../../components/CollapsibleInfo';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface EventLogEntry {
  id: string;
  event_type: string;
  event_date: string;
  description: string | null;
}

interface WhoopData {
  recovery_score: number | null;
  hrv: number | null;
  sleep_hours: number | null;
  pulled_at: string;
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

        return {
          block: b.block,
          label: b.label,
          startDate: start,
          endDate: end,
          canSubmit,
          submissionOpensDate: submissionOpens,
          daysUntilOpen,
        };
      }
    }
  }
  return null;
}

function formatDateShort(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

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
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function SkeletonCard({ height = 120 }: { height?: number }) {
  return (
    <div
      style={{
        background: '#f3f4f6',
        borderRadius: 12,
        height,
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Status Badge                                                       */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: 'done' | 'pending' | 'locked' }) {
  const colors: Record<string, { bg: string; fg: string; label: string }> = {
    done: { bg: '#dcfce7', fg: '#166534', label: 'Done' },
    pending: { bg: '#fff7ed', fg: '#9a3412', label: 'Pending' },
    locked: { bg: '#f3f4f6', fg: '#6b7280', label: 'Locked' },
  };
  const c = colors[status];
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: 11,
        fontWeight: 600,
        padding: '2px 10px',
        borderRadius: 999,
        background: c.bg,
        color: c.fg,
        letterSpacing: 0.3,
        textTransform: 'uppercase',
      }}
    >
      {c.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function ResidentDashboard() {
  const { residentProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [checkinDone, setCheckinDone] = useState(false);
  const [assessmentDone, setAssessmentDone] = useState(false);
  const [events, setEvents] = useState<EventLogEntry[]>([]);
  const [lastCheckin, setLastCheckin] = useState<string | null>(null);
  const [whoop, setWhoop] = useState<WhoopData | null>(null);
  const [whoopStatus, setWhoopStatus] = useState<'connected' | 'no_data' | 'not_connected'>('not_connected');

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

    try {
      // 1) Weekly check-in
      const checkinPromise = supabase
        .from('weekly_checkins')
        .select('id')
        .eq('resident_id', rid)
        .eq('week_start', mondayISO)
        .limit(1);

      // 2) Block assessment status
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let assessmentPromise: PromiseLike<any> | null = null;
      if (blockInfo) {
        const startISO = blockInfo.startDate.toISOString().slice(0, 10);
        const endISO = blockInfo.endDate.toISOString().slice(0, 10);
        assessmentPromise = supabase
          .from('block_assessments')
          .select('id')
          .eq('resident_id', rid)
          .gte('assessment_date', startISO)
          .lte('assessment_date', endISO)
          .limit(1);
      }

      // 3) Event logs
      const eventsPromise = supabase
        .from('event_logs')
        .select('id, event_type, event_date, description')
        .eq('resident_id', rid)
        .order('event_date', { ascending: false })
        .limit(5);

      // 4) Last checkin date
      const lastCheckinPromise = supabase
        .from('weekly_checkins')
        .select('created_at')
        .eq('resident_id', rid)
        .order('created_at', { ascending: false })
        .limit(1);

      // 5) WHOOP data
      const whoopPromise = supabase
        .from('whoop_pulls')
        .select('recovery_score, hrv, sleep_hours, pulled_at')
        .eq('resident_id', rid)
        .order('pulled_at', { ascending: false })
        .limit(1);

      const results = await Promise.all([
        checkinPromise,
        assessmentPromise,
        eventsPromise,
        lastCheckinPromise,
        whoopPromise,
      ]);

      const [checkinRes, assessmentRes, eventsRes, lastCheckinRes, whoopRes] = results;

      // Process check-in
      setCheckinDone((checkinRes.data?.length ?? 0) > 0);

      // Process block assessment
      if (assessmentRes) {
        setAssessmentDone(((assessmentRes as any)?.data?.length ?? 0) > 0);
      }

      // Process events
      setEvents((eventsRes.data as EventLogEntry[]) ?? []);

      // Process last checkin
      if (lastCheckinRes.data && lastCheckinRes.data.length > 0) {
        setLastCheckin(lastCheckinRes.data[0].created_at);
      }

      // Process WHOOP
      if (whoopRes.data && whoopRes.data.length > 0) {
        setWhoop(whoopRes.data[0] as WhoopData);
        setWhoopStatus('connected');
      } else {
        setWhoop(null);
        setWhoopStatus('no_data');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  const firstName = residentProfile?.full_name?.split(' ')[0] || 'Resident';
  const participantId = residentProfile?.participant_id || '---';

  // Determine assessment status for display
  function getAssessmentStatus(): 'done' | 'pending' | 'locked' {
    if (assessmentDone) return 'done';
    if (!blockInfo) return 'locked';
    if (!blockInfo.canSubmit) return 'locked';
    return 'pending';
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  if (loading) {
    return (
      <div style={{ padding: '0 4px' }}>
        <div style={{ marginBottom: 24 }}>
          <SkeletonCard height={56} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <SkeletonCard height={110} />
          <SkeletonCard height={110} />
        </div>
        <SkeletonCard height={180} />
        <div style={{ marginTop: 16 }}>
          <SkeletonCard height={100} />
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      </div>
    );
  }

  const assessmentStatus = getAssessmentStatus();

  return (
    <div style={{ padding: '0 4px' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>

      {/* -------- Demographics Banner -------- */}
      {!residentProfile?.demographics_completed && (
        <Link
          to="/resident/demographics"
          style={{ textDecoration: 'none' }}
        >
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 10,
              marginBottom: 20,
              fontSize: 14,
              lineHeight: 1.6,
              background: '#fff7ed',
              border: '2px solid #f97316',
              color: '#9a3412',
              cursor: 'pointer',
            }}
          >
            <strong>Action Required:</strong> Please complete your enrollment form first.
            <span style={{ display: 'block', marginTop: 4, fontSize: 13, fontWeight: 600, color: '#ea580c' }}>
              Tap here to complete &rarr;
            </span>
          </div>
        </Link>
      )}

      {/* -------- Welcome Header -------- */}
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: '1.4rem',
            fontFamily: 'var(--font-serif)',
            color: 'var(--primary)',
            marginBottom: 6,
            marginTop: 0,
          }}
        >
          Welcome, {firstName}
        </h1>
        <span
          style={{
            display: 'inline-block',
            fontSize: 12,
            fontWeight: 600,
            padding: '3px 12px',
            borderRadius: 999,
            background: 'var(--primary)',
            color: '#fff',
            letterSpacing: 0.5,
          }}
        >
          {participantId}
        </span>
      </div>

      {/* -------- Pending Actions -------- */}
      <div style={{ marginBottom: 20 }}>
        <h2
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            marginBottom: 10,
          }}
        >
          Pending Actions
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          {/* Weekly Check-in Card */}
          <Link
            to="/resident/checkin"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 12,
                border: `2px solid ${checkinDone ? '#22c55e' : '#f97316'}`,
                padding: '16px 14px',
                cursor: 'pointer',
                transition: 'box-shadow 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
            >
              <div style={{ fontSize: 22, marginBottom: 8 }}>{checkinDone ? '\u2705' : '\u23f0'}</div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, color: 'var(--primary)' }}>
                Weekly Check-in
              </div>
              <StatusBadge status={checkinDone ? 'done' : 'pending'} />
            </div>
          </Link>

          {/* Block Assessment Card */}
          <Link
            to="/resident/questionnaire"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 12,
                border: `2px solid ${assessmentStatus === 'done' ? '#22c55e' : assessmentStatus === 'pending' ? '#f97316' : 'var(--border)'}`,
                padding: '16px 14px',
                cursor: 'pointer',
                transition: 'box-shadow 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
            >
              <div style={{ fontSize: 22, marginBottom: 8 }}>
                {assessmentStatus === 'done' ? '\u2705' : assessmentStatus === 'locked' ? '\uD83D\uDD12' : '\uD83D\uDCCB'}
              </div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, color: 'var(--primary)' }}>
                Block Assessment
              </div>
              <StatusBadge status={assessmentStatus} />
            </div>
          </Link>
        </div>

        {/* Block Assessment Detail Card */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid var(--border)',
            padding: '16px',
            marginBottom: 12,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>
              {blockInfo ? blockInfo.label : 'No Active Block'}
            </span>
            <StatusBadge status={assessmentStatus} />
          </div>

          {blockInfo && (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {formatDateShort(blockInfo.startDate)} - {formatDateShort(blockInfo.endDate)}
              {assessmentStatus === 'locked' && blockInfo.daysUntilOpen > 0 && (
                <span style={{ display: 'block', marginTop: 4, fontSize: 12 }}>
                  Assessment opens on {formatDateShort(blockInfo.submissionOpensDate)} ({blockInfo.daysUntilOpen} days)
                </span>
              )}
              {assessmentStatus === 'pending' && (
                <span style={{ display: 'block', marginTop: 4, fontSize: 12, color: '#ea580c', fontWeight: 600 }}>
                  Assessment is now open - please complete before the block ends
                </span>
              )}
              {assessmentStatus === 'done' && (
                <span style={{ display: 'block', marginTop: 4, fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
                  Assessment completed for this block
                </span>
              )}
            </div>
          )}

          {!blockInfo && (
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              You are currently between rotation blocks.
            </div>
          )}

          <Link
            to="/resident/questionnaire"
            style={{
              display: 'block',
              marginTop: 12,
              padding: '10px 16px',
              borderRadius: 8,
              background: assessmentStatus === 'pending' ? 'var(--primary)' : 'var(--border)',
              color: assessmentStatus === 'pending' ? 'white' : 'var(--text-muted)',
              textDecoration: 'none',
              textAlign: 'center',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {assessmentStatus === 'done' ? 'View Assessment' : assessmentStatus === 'locked' ? 'Not Yet Available' : 'Start Assessment'}
          </Link>
        </div>
      </div>

      {/* -------- WHOOP Status -------- */}
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid var(--border)',
          padding: '16px',
          marginBottom: 20,
        }}
      >
        <h2
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--primary)',
            marginTop: 0,
            marginBottom: 12,
          }}
        >
          WHOOP Status
        </h2>

        {whoopStatus === 'connected' && whoop ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>
                {whoop.recovery_score != null ? `${whoop.recovery_score}%` : '--'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Recovery</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>
                {whoop.hrv != null ? `${whoop.hrv}` : '--'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>HRV (ms)</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>
                {whoop.sleep_hours != null ? `${whoop.sleep_hours.toFixed(1)}h` : '--'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Sleep</div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {whoopStatus === 'no_data'
                ? 'Awaiting first data pull'
                : 'WHOOP not connected'}
            </div>
          </div>
        )}

        {whoopStatus === 'connected' && whoop && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', marginTop: 8 }}>
            Last pull: {formatDate(whoop.pulled_at)} {formatTime(whoop.pulled_at)}
          </div>
        )}
      </div>

      {/* -------- Recent Activity -------- */}
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid var(--border)',
          padding: '16px',
          marginBottom: 20,
        }}
      >
        <h2
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--primary)',
            marginTop: 0,
            marginBottom: 12,
          }}
        >
          Recent Activity
        </h2>

        {events.length === 0 && !lastCheckin ? (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>
            No activity recorded yet.
          </div>
        ) : (
          <div>
            {lastCheckin && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: events.length > 0 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>Weekly Check-in</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Last submission</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {formatDate(lastCheckin)}
                </div>
              </div>
            )}
            {events.map((evt, idx) => (
              <div
                key={evt.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: idx < events.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    {evt.event_type.replace(/_/g, ' ')}
                  </div>
                  {evt.description && (
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {evt.description}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: 12 }}>
                  {formatDate(evt.event_date)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* -------- About This Study -------- */}
      <div style={{ marginBottom: 20 }}>
        <CollapsibleInfo title="About This Study" icon="&#128300;">
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: 4, fontSize: 14 }}>
              Resident Burnout &amp; Biophysical Parameters
            </div>
            <p style={{ margin: '0 0 8px', fontSize: 13, color: '#374151' }}>
              This study investigates the association between healthcare workers&apos; burnout and
              biophysical parameters using WHOOP wearable devices. It is a pilot multi-center cohort
              study conducted at SQUH, Royal Hospital, and Armed Forces Hospital.
            </p>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: 4, fontSize: 13 }}>
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
            <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: 4, fontSize: 13 }}>
              Privacy &amp; Confidentiality
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#374151' }}>
              Your data is pseudonymized &mdash; you are identified by a study ID (e.g. RES-002),
              not your name. Only authorized researchers can access identifiable information. You can
              revoke WHOOP access at any time.
            </p>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: 4, fontSize: 13 }}>
              Ethics Approval
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#374151' }}>
              This study is approved by the SQU Medical Research Ethics Committee (MREC #3190) and
              Royal Hospital ethics committee.
            </p>
          </div>

          <div>
            <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: 4, fontSize: 13 }}>
              Contact the Research Team
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#374151' }}>
              Dr. Mohamed Al Rawahi &mdash; <a href="mailto:mrawahi@squ.edu.om" style={{ color: 'var(--accent)' }}>mrawahi@squ.edu.om</a>
              <br />
              Dr. Abdullah Al Alawi &mdash; <a href="mailto:dr.abdullahalalawi@gmail.com" style={{ color: 'var(--accent)' }}>dr.abdullahalalawi@gmail.com</a>
            </p>
          </div>
        </CollapsibleInfo>
      </div>
    </div>
  );
}
