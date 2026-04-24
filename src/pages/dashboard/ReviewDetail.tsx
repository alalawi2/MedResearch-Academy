import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { scoreCBI, scorePHQ9, scoreGAD7, scoreISI } from '../../lib/scoring';
import type { InstrumentId } from '../../lib/instruments';
import { INSTRUMENTS, CBI_ITEMS, PHQ9_ITEMS, GAD7_ITEMS, ISI_ITEMS } from '../../lib/instruments';
import type { QuestionnaireItem, CBIItem } from '../../lib/instruments';

const TABLE_MAP: Record<InstrumentId, string> = {
  cbi: 'cbi_responses',
  phq9: 'phq9_responses',
  gad7: 'gad7_responses',
  isi: 'isi_responses',
};

const ITEMS_MAP: Record<InstrumentId, (QuestionnaireItem | CBIItem)[]> = {
  cbi: CBI_ITEMS,
  phq9: PHQ9_ITEMS,
  gad7: GAD7_ITEMS,
  isi: ISI_ITEMS,
};

// Scoring reference information
const SCORING_REFERENCE: Record<InstrumentId, { ranges: { label: string; range: string; color: string }[]; note?: string }> = {
  phq9: {
    ranges: [
      { label: 'Minimal', range: '0-4', color: '#16a34a' },
      { label: 'Mild', range: '5-9', color: '#84cc16' },
      { label: 'Moderate', range: '10-14', color: '#f59e0b' },
      { label: 'Moderately Severe', range: '15-19', color: '#f97316' },
      { label: 'Severe', range: '20-27', color: '#dc2626' },
    ],
    note: 'Item 9 (suicidal ideation) requires immediate clinical attention if > 0.',
  },
  gad7: {
    ranges: [
      { label: 'Minimal', range: '0-4', color: '#16a34a' },
      { label: 'Mild', range: '5-9', color: '#84cc16' },
      { label: 'Moderate', range: '10-14', color: '#f59e0b' },
      { label: 'Severe', range: '15-21', color: '#dc2626' },
    ],
  },
  isi: {
    ranges: [
      { label: 'No clinically significant insomnia', range: '0-7', color: '#16a34a' },
      { label: 'Subthreshold insomnia', range: '8-14', color: '#f59e0b' },
      { label: 'Moderate insomnia', range: '15-21', color: '#f97316' },
      { label: 'Severe insomnia', range: '22-28', color: '#dc2626' },
    ],
  },
  cbi: {
    ranges: [
      { label: 'No burnout', range: '< 50', color: '#16a34a' },
      { label: 'Burnout', range: '>= 50', color: '#dc2626' },
      { label: 'Critically high', range: '>= 75', color: '#7f1d1d' },
    ],
    note: 'Each subscale (Personal, Work, Patient) scored independently on 0-100 scale.',
  },
};

export default function ReviewDetail() {
  const { instrument: instParam, id } = useParams<{ instrument: string; id: string }>();
  const navigate = useNavigate();
  const { staff } = useAuth();

  const instrument = instParam as InstrumentId;
  const meta = INSTRUMENTS[instrument];
  const questionItems = ITEMS_MAP[instrument] ?? [];
  const reference = SCORING_REFERENCE[instrument];

  const [response, setResponse] = useState<any>(null);
  const [participantId, setParticipantId] = useState('—');
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');

  useEffect(() => {
    if (!id || !instrument) return;
    loadResponse();
  }, [id, instrument]);

  async function loadResponse() {
    setLoading(true);
    const table = TABLE_MAP[instrument];
    if (!table) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from(table)
      .select('*, burnout_participants!inner(study_participant_id)')
      .eq('id', id)
      .limit(1)
      .single();

    if (data) {
      setResponse(data);
      setParticipantId((data as any).burnout_participants?.study_participant_id ?? '—');
      setReviewNotes(data.review_notes ?? '');
    }
    setLoading(false);
  }

  async function handleAction(status: 'verified' | 'flagged') {
    if (!id || !staff) return;
    setSubmitting(true);
    setSubmitMsg('');

    const table = TABLE_MAP[instrument];
    const { error } = await supabase
      .from(table)
      .update({
        review_status: status,
        reviewed_by: staff.id,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes || null,
      })
      .eq('id', id);

    if (error) {
      setSubmitMsg(`Error: ${error.message}`);
    } else {
      setSubmitMsg(`Response marked as ${status}.`);
      setTimeout(() => navigate('/dashboard/review'), 1200);
    }
    setSubmitting(false);
  }

  if (loading) {
    return <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading response...</div>;
  }

  if (!response) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>Response not found.</p>
        <Link to="/dashboard/review" style={{ color: 'var(--primary)', fontWeight: 600 }}>Back to Review Queue</Link>
      </div>
    );
  }

  const items: Record<string, number> = response.items ?? {};

  // Build score display
  let scoreDisplay: React.ReactNode = null;
  let q9Warning = false;

  if (instrument === 'cbi') {
    const result = scoreCBI(items);
    scoreDisplay = (
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {(['personal', 'work', 'patient'] as const).map(sub => {
          const s = result[sub];
          return (
            <div key={sub} style={{
              padding: '12px 20px', borderRadius: 10, border: '1px solid var(--border)',
              background: s.burnout ? '#fef2f2' : '#f0fdf4', minWidth: 140, textAlign: 'center',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                {sub}
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.burnout ? '#dc2626' : '#16a34a' }}>
                {Math.round(s.score)}
              </div>
              <span style={{
                padding: '2px 8px', borderRadius: 50, fontSize: 10, fontWeight: 700,
                background: s.burnout ? '#dc262618' : '#16a34a18',
                color: s.burnout ? '#dc2626' : '#16a34a',
              }}>
                {s.burnout ? 'BURNOUT' : 'NO BURNOUT'}
              </span>
            </div>
          );
        })}
      </div>
    );
  } else if (instrument === 'phq9') {
    const result = scorePHQ9(items);
    q9Warning = result.suicidalIdeationFlag;
    const sevColor = result.total >= 20 ? '#dc2626' : result.total >= 15 ? '#f97316' : result.total >= 10 ? '#f59e0b' : result.total >= 5 ? '#84cc16' : '#16a34a';
    scoreDisplay = (
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: sevColor }}>{result.total}</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: sevColor }}>{result.severity}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>out of 27</div>
        </div>
      </div>
    );
  } else if (instrument === 'gad7') {
    const result = scoreGAD7(items);
    const sevColor = result.total >= 15 ? '#dc2626' : result.total >= 10 ? '#f59e0b' : result.total >= 5 ? '#84cc16' : '#16a34a';
    scoreDisplay = (
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: sevColor }}>{result.total}</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: sevColor }}>{result.severity}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>out of 21</div>
        </div>
      </div>
    );
  } else if (instrument === 'isi') {
    const result = scoreISI(items);
    const sevColor = result.total >= 22 ? '#dc2626' : result.total >= 15 ? '#f97316' : result.total >= 8 ? '#f59e0b' : '#16a34a';
    scoreDisplay = (
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: sevColor }}>{result.total}</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: sevColor }}>{result.severity}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>out of 28</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link to="/dashboard/review" style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 600, textDecoration: 'none', marginBottom: 16, display: 'inline-block' }}>
        ← Back to Review Queue
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: 4 }}>
            {meta?.name ?? instrument.toUpperCase()} Review
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Participant <strong style={{ fontFamily: 'monospace' }}>{participantId}</strong> · Submitted {new Date(response.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <span style={{
          padding: '4px 14px', borderRadius: 50, fontSize: 12, fontWeight: 700,
          background: `${response.review_status === 'verified' ? '#16a34a' : response.review_status === 'flagged' ? '#dc2626' : '#f59e0b'}18`,
          color: response.review_status === 'verified' ? '#16a34a' : response.review_status === 'flagged' ? '#dc2626' : '#f59e0b',
        }}>
          {response.review_status ?? 'pending'}
        </span>
      </div>

      {/* PHQ-9 Q9 Warning */}
      {q9Warning && (
        <div style={{
          background: '#fef2f2', border: '2px solid #dc2626', borderRadius: 10,
          padding: '14px 20px', marginBottom: 20,
        }}>
          <div style={{ fontWeight: 700, color: '#dc2626', fontSize: 15, marginBottom: 4 }}>
            Suicidal Ideation Warning
          </div>
          <div style={{ fontSize: 13, color: '#991b1b', lineHeight: 1.5 }}>
            This participant endorsed item 9 ("Thoughts that you would be better off dead, or of hurting yourself in some way").
            This requires immediate clinical attention per study protocol.
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* Main content */}
        <div>
          {/* Score summary */}
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', padding: 24, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Score Summary
            </div>
            {scoreDisplay}
          </div>

          {/* Item-by-item responses */}
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Individual Items ({questionItems.length})
              </div>
            </div>
            {questionItems.map((q, idx) => {
              const val = items[q.id];
              const selectedOption = q.options.find(o => o.value === val);
              const isQ9 = q.id === 'phq9_q9' && val != null && val >= 1;
              const subscaleLabel = 'subscale' in q ? (q as CBIItem).subscale : null;

              return (
                <div
                  key={q.id}
                  style={{
                    padding: '14px 20px',
                    borderBottom: idx < questionItems.length - 1 ? '1px solid var(--border)' : 'none',
                    background: isQ9 ? '#fef2f2' : idx % 2 === 0 ? 'white' : 'var(--bg-muted)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>
                        {q.id.replace(/_/g, ' ').toUpperCase()}
                        {subscaleLabel && (
                          <span style={{ marginLeft: 8, fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'var(--primary)', color: 'white', fontWeight: 600, textTransform: 'capitalize' }}>
                            {subscaleLabel}
                          </span>
                        )}
                        {q.reverse && (
                          <span style={{ marginLeft: 6, fontSize: 10, padding: '1px 6px', borderRadius: 4, background: '#6b728018', color: '#6b7280', fontWeight: 600 }}>
                            Reverse
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 14, lineHeight: 1.5 }}>{q.text}</div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: 120 }}>
                      <div style={{
                        fontSize: 14, fontWeight: 700,
                        color: isQ9 ? '#dc2626' : 'var(--primary)',
                        padding: '4px 10px', borderRadius: 6,
                        background: isQ9 ? '#dc262612' : 'var(--primary)08',
                      }}>
                        {val != null ? `${val} — ${selectedOption?.label ?? '?'}` : 'Not answered'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action section */}
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', padding: 24, marginTop: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Review Action
            </div>
            <textarea
              value={reviewNotes}
              onChange={e => setReviewNotes(e.target.value)}
              placeholder="Review notes (optional)..."
              rows={3}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)',
                fontSize: 14, fontFamily: 'var(--font-sans)', resize: 'vertical', marginBottom: 14, boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => handleAction('verified')}
                disabled={submitting}
                style={{
                  padding: '10px 24px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 700,
                  background: '#16a34a', color: 'white', cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1, fontFamily: 'var(--font-sans)',
                }}
              >
                Verify
              </button>
              <button
                onClick={() => handleAction('flagged')}
                disabled={submitting}
                style={{
                  padding: '10px 24px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 700,
                  background: '#dc2626', color: 'white', cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1, fontFamily: 'var(--font-sans)',
                }}
              >
                Flag for Review
              </button>
            </div>
            {submitMsg && (
              <div style={{ marginTop: 10, fontSize: 13, color: submitMsg.startsWith('Error') ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                {submitMsg}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar — Scoring Reference */}
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', position: 'sticky', top: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
            Scoring Reference — {meta?.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
            {meta?.fullName}
          </div>
          {reference && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {reference.ranges.map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: 6, background: `${r.color}10` }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: r.color }}>{r.label}</span>
                    <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)' }}>{r.range}</span>
                  </div>
                ))}
              </div>
              {reference.note && (
                <div style={{ marginTop: 14, fontSize: 12, color: '#6b7280', lineHeight: 1.5, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  {reference.note}
                </div>
              )}
            </>
          )}
          {meta?.timeframe && (
            <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Timeframe: {meta.timeframe}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
