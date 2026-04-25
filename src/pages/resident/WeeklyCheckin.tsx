import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface CheckinData {
  id?: string;
  study_id: string;
  resident_id: string;
  week_start: string;
  hours_worked: number;
  on_call_count: number;
  call_type: string;
  call_busyness: number | null;
  sleep_rating: number;
  stress_level: number;
  created_at?: string;
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart + 'T00:00:00');
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${formatDate(weekStart)} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

const RATING_COLORS = ['#e53e3e', '#ed8936', '#ecc94b', '#68d391', '#38a169'];

const CALL_COUNTS = [0, 1, 2, 3, 4, 5];
const CALL_TYPES = ['None', '24h', 'Shift', 'Mixed'];

const SLEEP_LABELS = ['Terrible', 'Poor', 'Fair', 'Good', 'Excellent'];
const STRESS_LABELS = ['Minimal', 'Mild', 'Moderate', 'High', 'Extreme'];
const BUSYNESS_LABELS = ['Very quiet', 'Quiet', 'Average', 'Busy', 'Extremely busy'];

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: 12,
  border: '1px solid var(--border)',
  padding: '24px 20px',
  marginBottom: 16,
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: 'var(--primary)',
  marginBottom: 10,
  display: 'block',
};

const pillStyle = (active: boolean, color?: string): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 48,
  height: 44,
  padding: '0 16px',
  borderRadius: 22,
  border: active ? '2px solid var(--primary)' : '1.5px solid var(--border)',
  background: active ? (color || 'var(--primary)') : 'white',
  color: active ? 'white' : 'var(--primary)',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
});

const ratingCircle = (active: boolean, color: string): React.CSSProperties => ({
  width: 44,
  height: 44,
  borderRadius: '50%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: active ? `2.5px solid ${color}` : '1.5px solid var(--border)',
  background: active ? color : 'white',
  color: active ? 'white' : '#888',
  fontWeight: 700,
  fontSize: 15,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
});

export default function WeeklyCheckin() {
  const { residentProfile } = useAuth();

  const today = new Date();
  const monday = getMonday(today);
  const weekStartStr = monday.toISOString().split('T')[0];

  const [hoursWorked, setHoursWorked] = useState(60);
  const [onCallCount, setOnCallCount] = useState<number | null>(null);
  const [callType, setCallType] = useState<string | null>(null);
  const [callBusyness, setCallBusyness] = useState<number | null>(null);
  const [sleepRating, setSleepRating] = useState<number | null>(null);
  const [stressLevel, setStressLevel] = useState<number | null>(null);

  const [existingCheckin, setExistingCheckin] = useState<CheckinData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [pastCheckins, setPastCheckins] = useState<CheckinData[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!residentProfile) return;
    setLoading(true);

    // Check for existing checkin this week
    const { data: existing } = await supabase
      .from('weekly_checkins')
      .select('id, study_id, resident_id, week_start, hours_worked, on_call_count, call_type, call_busyness, sleep_rating, stress_level, created_at')
      .eq('resident_id', residentProfile.id)
      .eq('week_start', weekStartStr)
      .limit(1)
      .maybeSingle();

    if (existing) {
      setExistingCheckin(existing);
      setHoursWorked(existing.hours_worked);
      setOnCallCount(existing.on_call_count);
      setCallType(existing.call_type);
      setCallBusyness(existing.call_busyness);
      setSleepRating(existing.sleep_rating);
      setStressLevel(existing.stress_level);
    }

    // Load past 4 weeks
    const fourWeeksAgo = new Date(monday);
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const { data: past } = await supabase
      .from('weekly_checkins')
      .select('id, study_id, resident_id, week_start, hours_worked, on_call_count, call_type, call_busyness, sleep_rating, stress_level, created_at')
      .eq('resident_id', residentProfile.id)
      .gte('week_start', fourWeeksAgo.toISOString().split('T')[0])
      .lt('week_start', weekStartStr)
      .order('week_start', { ascending: false })
      .limit(4);

    setPastCheckins(past || []);
    setLoading(false);
  }, [residentProfile, weekStartStr]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isFormValid =
    onCallCount !== null &&
    callType !== null &&
    sleepRating !== null &&
    stressLevel !== null &&
    (onCallCount === 0 || callBusyness !== null);

  async function handleSubmit() {
    if (!residentProfile || !isFormValid) return;

    setSubmitting(true);
    setError(null);

    const payload = {
      study_id: residentProfile.study_id,
      resident_id: residentProfile.id,
      week_start: weekStartStr,
      hours_worked: hoursWorked,
      on_call_count: onCallCount === 5 ? 5 : onCallCount!,
      call_type: callType!,
      call_busyness: onCallCount! > 0 ? callBusyness : null,
      sleep_rating: sleepRating!,
      stress_level: stressLevel!,
    };

    let err;
    if (existingCheckin?.id) {
      const { error: updateErr } = await supabase
        .from('weekly_checkins')
        .update(payload)
        .eq('id', existingCheckin.id);
      err = updateErr;
    } else {
      const { error: insertErr } = await supabase
        .from('weekly_checkins')
        .insert(payload);
      err = insertErr;
    }

    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
      setIsEditing(false);
      await loadData();
      setTimeout(() => setSuccess(false), 3000);
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: 8 }}>
          Weekly Check-in
        </h1>
        <div style={{ ...cardStyle, textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Loading...</div>
        </div>
      </div>
    );
  }

  const showForm = !existingCheckin || isEditing;

  return (
    <div>
      <h1 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: 8 }}>
        Weekly Check-in
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4, lineHeight: 1.6 }}>
        Week of {formatWeekRange(weekStartStr)}
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
        Quick 2-minute check-in on your week.
      </p>

      {success && (
        <div style={{
          background: '#f0fff4',
          border: '1px solid #c6f6d5',
          borderRadius: 10,
          padding: '14px 18px',
          marginBottom: 16,
          color: '#276749',
          fontSize: 14,
          fontWeight: 500,
        }}>
          Check-in saved successfully.
        </div>
      )}

      {error && (
        <div style={{
          background: '#fff5f5',
          border: '1px solid #fed7d7',
          borderRadius: 10,
          padding: '14px 18px',
          marginBottom: 16,
          color: '#c53030',
          fontSize: 14,
        }}>
          {error}
        </div>
      )}

      {/* Existing checkin summary */}
      {existingCheckin && !isEditing && (
        <div style={cardStyle}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', marginBottom: 14 }}>
            This week's check-in (submitted)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <SummaryItem label="Hours" value={`${existingCheckin.hours_worked}h`} />
            <SummaryItem label="On-calls" value={existingCheckin.on_call_count >= 5 ? '5+' : String(existingCheckin.on_call_count)} />
            <SummaryItem label="Call type" value={existingCheckin.call_type} />
            {existingCheckin.on_call_count > 0 && existingCheckin.call_busyness && (
              <SummaryItem
                label="Call busyness"
                value={BUSYNESS_LABELS[existingCheckin.call_busyness - 1]}
                color={RATING_COLORS[existingCheckin.call_busyness - 1]}
              />
            )}
            <SummaryItem
              label="Sleep"
              value={SLEEP_LABELS[existingCheckin.sleep_rating - 1]}
              color={RATING_COLORS[existingCheckin.sleep_rating - 1]}
            />
            <SummaryItem
              label="Stress"
              value={STRESS_LABELS[existingCheckin.stress_level - 1]}
              color={RATING_COLORS[existingCheckin.stress_level - 1]}
            />
          </div>
          <button
            onClick={() => setIsEditing(true)}
            style={{
              background: 'transparent',
              border: '1.5px solid var(--primary)',
              color: 'var(--primary)',
              borderRadius: 8,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Update Check-in
          </button>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div>
          {/* Q1: Hours worked */}
          <div style={cardStyle}>
            <label style={labelStyle}>1. Hours worked this week</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
              <button
                onClick={() => setHoursWorked(Math.max(30, hoursWorked - 5))}
                style={{
                  width: 44, height: 44, borderRadius: '50%', border: '1.5px solid var(--border)',
                  background: 'white', fontSize: 20, cursor: 'pointer', color: 'var(--primary)', fontWeight: 700,
                }}
              >
                -
              </button>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--primary)' }}>{hoursWorked}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>hours</div>
              </div>
              <button
                onClick={() => setHoursWorked(Math.min(120, hoursWorked + 5))}
                style={{
                  width: 44, height: 44, borderRadius: '50%', border: '1.5px solid var(--border)',
                  background: 'white', fontSize: 20, cursor: 'pointer', color: 'var(--primary)', fontWeight: 700,
                }}
              >
                +
              </button>
            </div>
            <input
              type="range"
              min={30}
              max={120}
              step={5}
              value={hoursWorked}
              onChange={(e) => setHoursWorked(Number(e.target.value))}
              style={{ width: '100%', marginTop: 12, accentColor: 'var(--primary)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              <span>30h</span><span>120h</span>
            </div>
          </div>

          {/* Q2: On-call shifts */}
          <div style={cardStyle}>
            <label style={labelStyle}>2. Number of on-call shifts</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CALL_COUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    setOnCallCount(n);
                    if (n === 0) {
                      setCallType('None');
                      setCallBusyness(null);
                    } else if (callType === 'None') {
                      setCallType(null);
                    }
                  }}
                  style={pillStyle(onCallCount === n)}
                >
                  {n === 5 ? '5+' : n}
                </button>
              ))}
            </div>
          </div>

          {/* Q3: Call type */}
          <div style={cardStyle}>
            <label style={labelStyle}>3. Call type</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CALL_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setCallType(t)}
                  style={pillStyle(callType === t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Q4: Call busyness (conditional) */}
          {onCallCount !== null && onCallCount > 0 && (
            <div style={cardStyle}>
              <label style={labelStyle}>4. How busy were your calls?</label>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => setCallBusyness(n)}
                      style={ratingCircle(callBusyness === n, RATING_COLORS[n - 1])}
                    >
                      {n}
                    </button>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, maxWidth: 52 }}>
                      {BUSYNESS_LABELS[n - 1]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Q5: Sleep rating */}
          <div style={cardStyle}>
            <label style={labelStyle}>
              {onCallCount !== null && onCallCount > 0 ? '5' : '4'}. Rate your sleep this week
            </label>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => setSleepRating(n)}
                    style={ratingCircle(sleepRating === n, RATING_COLORS[n - 1])}
                  >
                    {n}
                  </button>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, maxWidth: 52 }}>
                    {SLEEP_LABELS[n - 1]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Q6: Stress level */}
          <div style={cardStyle}>
            <label style={labelStyle}>
              {onCallCount !== null && onCallCount > 0 ? '6' : '5'}. Overall stress level
            </label>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => setStressLevel(n)}
                    style={ratingCircle(stressLevel === n, RATING_COLORS[n - 1])}
                  >
                    {n}
                  </button>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, maxWidth: 52 }}>
                    {STRESS_LABELS[n - 1]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || submitting}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: 10,
              border: 'none',
              background: isFormValid ? 'var(--primary)' : '#ccc',
              color: 'white',
              fontSize: 16,
              fontWeight: 600,
              cursor: isFormValid ? 'pointer' : 'not-allowed',
              opacity: submitting ? 0.7 : 1,
              marginBottom: 8,
            }}
          >
            {submitting ? 'Saving...' : existingCheckin ? 'Update Check-in' : 'Submit Check-in'}
          </button>

          {isEditing && (
            <button
              onClick={() => setIsEditing(false)}
              style={{
                width: '100%',
                padding: '12px 24px',
                borderRadius: 10,
                border: '1.5px solid var(--border)',
                background: 'white',
                color: 'var(--text-muted)',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                marginBottom: 16,
              }}
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Past check-ins timeline */}
      {pastCheckins.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', marginBottom: 12 }}>
            Recent Check-ins
          </div>
          {pastCheckins.map((c) => (
            <div key={c.id} style={{
              ...cardStyle,
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}>
              <div style={{ flex: '0 0 auto', textAlign: 'center', minWidth: 60 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>
                  {formatDate(c.week_start)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {c.hours_worked}h
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', gap: 6 }}>
                <MiniIndicator label="Sleep" value={c.sleep_rating} />
                <MiniIndicator label="Stress" value={c.stress_level} />
                {c.call_busyness && <MiniIndicator label="Calls" value={c.call_busyness} />}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', flex: '0 0 auto' }}>
                {c.on_call_count >= 5 ? '5+' : c.on_call_count} call{c.on_call_count !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: color || 'var(--primary)' }}>{value}</div>
    </div>
  );
}

function MiniIndicator({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: RATING_COLORS[value - 1],
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: 700,
        margin: '0 auto 2px',
      }}>
        {value}
      </div>
      <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}
