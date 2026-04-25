import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface EventData {
  id: string;
  study_id: string;
  resident_id: string;
  category: string;
  event_type: string;
  details: string | null;
  event_date: string;
  created_at: string;
}

const CATEGORIES: Record<string, { label: string; color: string; events: string[] }> = {
  clinical: {
    label: 'Clinical',
    color: '#3182ce',
    events: ['Post-call day', 'Night float', 'Patient death', 'Adverse event', 'Difficult family discussion', 'Code/resuscitation'],
  },
  academic: {
    label: 'Academic',
    color: '#805ad5',
    events: ['Written exam', 'OSCE/clinical exam', 'Presentation', 'In-training exam (ITE)'],
  },
  personal: {
    label: 'Personal',
    color: '#38a169',
    events: ['Illness/sick day', 'Pregnancy milestone', 'Family event', 'Travel', 'Conflict'],
  },
  program: {
    label: 'Program',
    color: '#dd6b20',
    events: ['Rotation change', 'Site change', 'Evaluation received', 'Meeting with PD'],
  },
};

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: 12,
  border: '1px solid var(--border)',
  padding: '24px 20px',
  marginBottom: 16,
};

function formatDateDisplay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function isWithin24Hours(createdAt: string): boolean {
  const created = new Date(createdAt);
  const now = new Date();
  return now.getTime() - created.getTime() < 24 * 60 * 60 * 1000;
}

export default function EventLog() {
  const { residentProfile } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [eventDate, setEventDate] = useState(todayStr());

  const [recentEvents, setRecentEvents] = useState<EventData[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    if (!residentProfile) return;
    setLoading(true);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data } = await supabase
      .from('event_logs')
      .select('id, study_id, resident_id, category, event_type, details, event_date, created_at')
      .eq('resident_id', residentProfile.id)
      .gte('event_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('event_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50);

    setRecentEvents(data || []);
    setLoading(false);
  }, [residentProfile]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  function resetForm() {
    setStep(1);
    setSelectedCategory(null);
    setSelectedEvent(null);
    setDetails('');
    setEventDate(todayStr());
  }

  async function handleSubmit() {
    if (!residentProfile || !selectedCategory || !selectedEvent) return;

    setSubmitting(true);
    setError(null);

    const { error: insertErr } = await supabase
      .from('event_logs')
      .insert({
        study_id: residentProfile.study_id,
        resident_id: residentProfile.id,
        category: selectedCategory,
        event_type: selectedEvent,
        details: details.trim() || null,
        event_date: eventDate,
      });

    if (insertErr) {
      setError(insertErr.message);
    } else {
      setSuccess(true);
      resetForm();
      await loadEvents();
      setTimeout(() => setSuccess(false), 3000);
    }
    setSubmitting(false);
  }

  async function handleDelete(eventId: string) {
    setDeletingId(eventId);
    const { error: delErr } = await supabase
      .from('event_logs')
      .delete()
      .eq('id', eventId)
      .eq('resident_id', residentProfile!.id);

    if (delErr) {
      setError(delErr.message);
    } else {
      await loadEvents();
    }
    setDeletingId(null);
  }

  // Group events by date
  const grouped = recentEvents.reduce<Record<string, EventData[]>>((acc, ev) => {
    if (!acc[ev.event_date]) acc[ev.event_date] = [];
    acc[ev.event_date].push(ev);
    return acc;
  }, {});

  const catInfo = selectedCategory ? CATEGORIES[selectedCategory] : null;

  return (
    <div>
      <h1 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: 8 }}>
        Event Log
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
        Log significant events that may affect your well-being.
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
          Event logged successfully.
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

      {/* Step 1: Category picker */}
      <div style={cardStyle}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', marginBottom: 12 }}>
          {step === 1 ? 'Select category' : step === 2 ? 'Select event type' : 'Add details'}
        </div>

        {step === 1 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedCategory(key);
                  setSelectedEvent(null);
                  setStep(2);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 18px',
                  borderRadius: 22,
                  border: selectedCategory === key ? `2px solid ${cat.color}` : '1.5px solid var(--border)',
                  background: selectedCategory === key ? cat.color : 'white',
                  color: selectedCategory === key ? 'white' : cat.color,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: selectedCategory === key ? 'white' : cat.color,
                  display: 'inline-block',
                }}></span>
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Event type */}
        {step === 2 && catInfo && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <button
                onClick={() => { setStep(1); setSelectedCategory(null); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 18, color: 'var(--text-muted)', padding: '0 4px',
                }}
              >
                &#8592;
              </button>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 12,
                background: catInfo.color + '18',
                color: catInfo.color,
                fontSize: 13,
                fontWeight: 600,
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: catInfo.color, display: 'inline-block',
                }}></span>
                {catInfo.label}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {catInfo.events.map((ev) => (
                <button
                  key={ev}
                  onClick={() => {
                    setSelectedEvent(ev);
                    setStep(3);
                  }}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '1.5px solid var(--border)',
                    background: 'white',
                    color: 'var(--primary)',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  {ev}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Details + date + submit */}
        {step === 3 && catInfo && selectedEvent && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <button
                onClick={() => { setStep(2); setSelectedEvent(null); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 18, color: 'var(--text-muted)', padding: '0 4px',
                }}
              >
                &#8592;
              </button>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 12,
                background: catInfo.color + '18',
                color: catInfo.color,
                fontSize: 13,
                fontWeight: 600,
              }}>
                {catInfo.label}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {selectedEvent}
              </span>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--primary)', display: 'block', marginBottom: 6 }}>
                Date
              </label>
              <input
                type="date"
                value={eventDate}
                max={todayStr()}
                onChange={(e) => setEventDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1.5px solid var(--border)',
                  fontSize: 14,
                  color: 'var(--primary)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--primary)', display: 'block', marginBottom: 6 }}>
                Details (optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Any additional notes..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1.5px solid var(--border)',
                  fontSize: 14,
                  color: 'var(--primary)',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                width: '100%',
                padding: '14px 24px',
                borderRadius: 10,
                border: 'none',
                background: catInfo.color,
                color: 'white',
                fontSize: 16,
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                marginBottom: 8,
              }}
            >
              {submitting ? 'Saving...' : 'Log Event'}
            </button>

            <button
              onClick={resetForm}
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
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Recent events timeline */}
      {loading ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '32px 24px' }}>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Loading events...</div>
        </div>
      ) : recentEvents.length > 0 ? (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', marginBottom: 12 }}>
            Recent Events (last 30 days)
          </div>
          {Object.entries(grouped).map(([date, events]) => (
            <div key={date} style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-muted)',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {formatDateDisplay(date)}
              </div>
              {events.map((ev) => {
                const cat = CATEGORIES[ev.category];
                const canDelete = isWithin24Hours(ev.created_at);
                return (
                  <div key={ev.id} style={{
                    ...cardStyle,
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    marginBottom: 8,
                  }}>
                    <span style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: cat?.color || '#999',
                      display: 'inline-block',
                      marginTop: 4,
                      flexShrink: 0,
                    }}></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--primary)' }}>
                        {ev.event_type}
                      </div>
                      <div style={{ fontSize: 12, color: cat?.color || 'var(--text-muted)', marginTop: 2 }}>
                        {cat?.label || ev.category}
                      </div>
                      {ev.details && (
                        <div style={{
                          fontSize: 13,
                          color: 'var(--text-muted)',
                          marginTop: 6,
                          lineHeight: 1.5,
                        }}>
                          {ev.details}
                        </div>
                      )}
                    </div>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(ev.id)}
                        disabled={deletingId === ev.id}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#e53e3e',
                          fontSize: 12,
                          cursor: 'pointer',
                          padding: '4px 8px',
                          opacity: deletingId === ev.id ? 0.5 : 0.7,
                          flexShrink: 0,
                        }}
                      >
                        {deletingId === ev.id ? '...' : 'Delete'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '32px 24px', marginTop: 8 }}>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>No events logged in the last 30 days.</div>
        </div>
      )}
    </div>
  );
}
