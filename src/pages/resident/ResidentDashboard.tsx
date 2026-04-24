import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

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

type QuestionnaireKey = 'cbi' | 'phq9' | 'gad7' | 'isi';

const QUESTIONNAIRE_LABELS: Record<QuestionnaireKey, string> = {
  cbi: 'CBI (Burnout)',
  phq9: 'PHQ-9 (Depression)',
  gad7: 'GAD-7 (Anxiety)',
  isi: 'ISI (Insomnia)',
};

const QUESTIONNAIRE_TABLES: Record<QuestionnaireKey, string> = {
  cbi: 'cbi_responses',
  phq9: 'phq9_responses',
  gad7: 'gad7_responses',
  isi: 'isi_responses',
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getMondayOfCurrentWeek(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Sun … 6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
}

function getMonthRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
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

function StatusBadge({ status }: { status: 'done' | 'pending' | 'overdue' }) {
  const colors: Record<string, { bg: string; fg: string; label: string }> = {
    done: { bg: '#dcfce7', fg: '#166534', label: 'Done' },
    pending: { bg: '#fff7ed', fg: '#9a3412', label: 'Pending' },
    overdue: { bg: '#fef2f2', fg: '#991b1b', label: 'Overdue' },
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
  const [qStatus, setQStatus] = useState<Record<QuestionnaireKey, boolean>>({
    cbi: false,
    phq9: false,
    gad7: false,
    isi: false,
  });
  const [events, setEvents] = useState<EventLogEntry[]>([]);
  const [lastCheckin, setLastCheckin] = useState<string | null>(null);
  const [whoop, setWhoop] = useState<WhoopData | null>(null);
  const [whoopStatus, setWhoopStatus] = useState<'connected' | 'no_data' | 'not_connected'>('not_connected');

  useEffect(() => {
    if (!residentProfile) return;
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residentProfile]);

  async function fetchAll() {
    if (!residentProfile) return;
    const rid = residentProfile.id;
    const mondayISO = getMondayOfCurrentWeek();
    const { start: monthStart, end: monthEnd } = getMonthRange();

    try {
      // 1) Weekly check-in
      const checkinPromise = supabase
        .from('weekly_checkins')
        .select('id')
        .eq('resident_id', rid)
        .eq('week_start', mondayISO)
        .limit(1);

      // 2) Questionnaire statuses
      const qPromises = (Object.keys(QUESTIONNAIRE_TABLES) as QuestionnaireKey[]).map((key) =>
        supabase
          .from(QUESTIONNAIRE_TABLES[key])
          .select('id')
          .eq('resident_id', rid)
          .gte('response_date', monthStart)
          .lte('response_date', monthEnd)
          .limit(1)
          .then(({ data }) => [key, (data?.length ?? 0) > 0] as [QuestionnaireKey, boolean])
      );

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

      const [checkinRes, ...qResults] = await Promise.all([
        checkinPromise,
        ...qPromises,
      ]);

      const [eventsRes, lastCheckinRes, whoopRes] = await Promise.all([
        eventsPromise,
        lastCheckinPromise,
        whoopPromise,
      ]);

      // Process check-in
      setCheckinDone((checkinRes.data?.length ?? 0) > 0);

      // Process questionnaire statuses
      const newQStatus = { cbi: false, phq9: false, gad7: false, isi: false };
      for (const [key, done] of qResults as [QuestionnaireKey, boolean][]) {
        newQStatus[key] = done;
      }
      setQStatus(newQStatus);

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
        // Distinguish "no data yet" vs "not connected" — for now treat as no_data
        setWhoopStatus('no_data');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  const completedCount = Object.values(qStatus).filter(Boolean).length;
  const firstName = residentProfile?.full_name?.split(' ')[0] || 'Resident';
  const participantId = residentProfile?.participant_id || '---';

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

  return (
    <div style={{ padding: '0 4px' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>

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

          {/* Questionnaires Summary Card */}
          <Link
            to="/resident/questionnaires"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 12,
                border: `2px solid ${completedCount === 4 ? '#22c55e' : '#f97316'}`,
                padding: '16px 14px',
                cursor: 'pointer',
                transition: 'box-shadow 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
            >
              <div style={{ fontSize: 22, marginBottom: 8 }}>{completedCount === 4 ? '\u2705' : '\ud83d\udccb'}</div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, color: 'var(--primary)' }}>
                Questionnaires
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                {completedCount}/4 done
              </div>
            </div>
          </Link>
        </div>

        {/* Individual Questionnaire Status List */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          {(Object.keys(QUESTIONNAIRE_LABELS) as QuestionnaireKey[]).map((key, idx) => (
            <Link
              key={key}
              to={`/resident/questionnaire/${key}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: idx < 3 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: 14, fontWeight: 500 }}>
                  {QUESTIONNAIRE_LABELS[key]}
                </span>
                <StatusBadge status={qStatus[key] ? 'done' : 'pending'} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* -------- Completion Progress -------- */}
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid var(--border)',
          padding: '16px',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>
            Monthly Progress
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
            {completedCount}/4 questionnaires
          </span>
        </div>
        <div
          style={{
            height: 10,
            background: '#e5e7eb',
            borderRadius: 999,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${(completedCount / 4) * 100}%`,
              background: completedCount === 4 ? '#22c55e' : 'var(--accent)',
              borderRadius: 999,
              transition: 'width 0.4s ease',
            }}
          />
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
    </div>
  );
}
