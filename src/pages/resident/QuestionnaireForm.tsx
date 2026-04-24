import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  CBI_ITEMS,
  PHQ9_ITEMS,
  GAD7_ITEMS,
  ISI_ITEMS,
  INSTRUMENTS,
} from '../../lib/instruments';
import type { InstrumentId, QuestionnaireItem, CBIItem } from '../../lib/instruments';
import type { Responses } from '../../lib/scoring';
import {
  scoreCBI,
  scorePHQ9,
  scoreGAD7,
  scoreISI,
  isCBIComplete,
  isPHQ9Complete,
  isGAD7Complete,
  isISIComplete,
} from '../../lib/scoring';
import type { CBIResult, PHQ9Result, GAD7Result, ISIResult } from '../../lib/scoring';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_TYPES: InstrumentId[] = ['cbi', 'phq9', 'gad7', 'isi'];

const TABLE_MAP: Record<InstrumentId, string> = {
  cbi: 'cbi_responses',
  phq9: 'phq9_responses',
  gad7: 'gad7_responses',
  isi: 'isi_responses',
};

function getItems(type: InstrumentId): (QuestionnaireItem | CBIItem)[] {
  switch (type) {
    case 'cbi': return CBI_ITEMS;
    case 'phq9': return PHQ9_ITEMS;
    case 'gad7': return GAD7_ITEMS;
    case 'isi': return ISI_ITEMS;
  }
}

function isComplete(type: InstrumentId, responses: Responses): boolean {
  switch (type) {
    case 'cbi': return isCBIComplete(responses);
    case 'phq9': return isPHQ9Complete(responses);
    case 'gad7': return isGAD7Complete(responses);
    case 'isi': return isISIComplete(responses);
  }
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// CBI subscale grouping
// ---------------------------------------------------------------------------

const CBI_SUBSCALE_META: { key: 'personal' | 'work' | 'patient'; label: string }[] = [
  { key: 'personal', label: 'Personal Burnout' },
  { key: 'work', label: 'Work-Related Burnout' },
  { key: 'patient', label: 'Patient-Related Burnout' },
];

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = {
  page: {
    maxWidth: 640,
    margin: '0 auto',
    padding: '0 16px 64px',
  } as React.CSSProperties,

  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 14,
    color: 'var(--text-muted)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 0',
    marginBottom: 12,
  } as React.CSSProperties,

  progressBar: {
    width: '100%',
    height: 6,
    background: 'var(--border)',
    borderRadius: 3,
    overflow: 'hidden' as const,
    marginBottom: 8,
  } as React.CSSProperties,

  progressFill: (pct: number) => ({
    width: `${pct}%`,
    height: '100%',
    background: 'var(--primary)',
    borderRadius: 3,
    transition: 'width 0.3s ease',
  }) as React.CSSProperties,

  progressText: {
    fontSize: 13,
    color: 'var(--text-muted)',
    marginBottom: 20,
  } as React.CSSProperties,

  heading: {
    fontSize: '1.4rem',
    fontFamily: 'var(--font-serif)',
    color: 'var(--primary)',
    marginBottom: 4,
    marginTop: 0,
  } as React.CSSProperties,

  description: {
    fontSize: 14,
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    marginBottom: 24,
  } as React.CSSProperties,

  sectionHeader: {
    fontSize: 15,
    fontWeight: 600 as const,
    color: 'var(--primary)',
    borderBottom: '2px solid var(--primary)',
    paddingBottom: 6,
    marginTop: 28,
    marginBottom: 16,
  } as React.CSSProperties,

  card: {
    background: 'white',
    borderRadius: 12,
    border: '1px solid var(--border)',
    padding: '20px 20px 16px',
    marginBottom: 16,
  } as React.CSSProperties,

  questionText: {
    fontSize: 15,
    lineHeight: 1.5,
    color: 'var(--text)',
    marginBottom: 12,
    fontWeight: 500 as const,
  } as React.CSSProperties,

  optionsRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 8,
  } as React.CSSProperties,

  optionBtn: (selected: boolean) => ({
    minHeight: 44,
    minWidth: 44,
    padding: '8px 14px',
    borderRadius: 8,
    border: selected ? '2px solid var(--primary)' : '2px solid var(--border)',
    background: selected ? 'var(--primary)' : 'white',
    color: selected ? 'white' : 'var(--text)',
    fontSize: 13,
    fontWeight: selected ? 600 : 400,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    flex: '1 1 auto',
    textAlign: 'center' as const,
  }) as React.CSSProperties,

  submitBtn: (disabled: boolean) => ({
    width: '100%',
    padding: '14px 24px',
    borderRadius: 10,
    border: 'none',
    background: disabled ? 'var(--border)' : 'var(--primary)',
    color: disabled ? 'var(--text-muted)' : 'white',
    fontSize: 16,
    fontWeight: 600 as const,
    cursor: disabled ? 'not-allowed' : 'pointer',
    marginTop: 24,
  }) as React.CSSProperties,

  alert: (variant: 'info' | 'warning' | 'success') => ({
    padding: '16px 20px',
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 14,
    lineHeight: 1.6,
    background: variant === 'warning' ? '#fef3cd' : variant === 'success' ? '#d1e7dd' : '#cfe2ff',
    border: `1px solid ${variant === 'warning' ? '#ffc107' : variant === 'success' ? '#198754' : 'var(--primary)'}`,
    color: variant === 'warning' ? '#664d03' : variant === 'success' ? '#0f5132' : '#084298',
  }) as React.CSSProperties,

  summaryCard: {
    background: 'white',
    borderRadius: 12,
    border: '1px solid var(--border)',
    padding: '24px 20px',
    marginBottom: 16,
  } as React.CSSProperties,

  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid var(--border)',
    fontSize: 14,
  } as React.CSSProperties,

  loading: {
    textAlign: 'center' as const,
    padding: '48px 24px',
    color: 'var(--text-muted)',
    fontSize: 14,
  } as React.CSSProperties,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function QuestionnaireForm() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { residentProfile } = useAuth();

  const [responses, setResponses] = useState<Responses>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState(true);

  // Scores after submission
  const [cbiResult, setCbiResult] = useState<CBIResult | null>(null);
  const [phq9Result, setPhq9Result] = useState<PHQ9Result | null>(null);
  const [gad7Result, setGad7Result] = useState<GAD7Result | null>(null);
  const [isiResult, setIsiResult] = useState<ISIResult | null>(null);

  const instrumentType = VALID_TYPES.includes(type as InstrumentId) ? (type as InstrumentId) : null;
  const meta = instrumentType ? INSTRUMENTS[instrumentType] : null;
  const items = instrumentType ? getItems(instrumentType) : [];

  // Check for duplicate submission today
  useEffect(() => {
    if (!instrumentType || !residentProfile) {
      setCheckingDuplicate(false);
      return;
    }

    const table = TABLE_MAP[instrumentType];
    const today = todayDate();

    supabase
      .from(table)
      .select('id')
      .eq('resident_id', residentProfile.id)
      .eq('response_date', today)
      .limit(1)
      .then(({ data, error: err }) => {
        if (!err && data && data.length > 0) {
          setAlreadySubmitted(true);
        }
        setCheckingDuplicate(false);
      });
  }, [instrumentType, residentProfile]);

  // Count answered questions
  const answeredCount = useMemo(() => {
    return items.filter((item) => responses[item.id] !== undefined).length;
  }, [items, responses]);

  const progressPct = items.length > 0 ? Math.round((answeredCount / items.length) * 100) : 0;
  const formComplete = instrumentType ? isComplete(instrumentType, responses) : false;

  // ---------------------------------------------------------------------------
  // Invalid type / no profile
  // ---------------------------------------------------------------------------

  if (!type || !instrumentType) {
    return (
      <div style={styles.page}>
        <button style={styles.backBtn} onClick={() => navigate('/resident/dashboard')}>
          &larr; Back to Dashboard
        </button>
        <h1 style={styles.heading}>Select a Questionnaire</h1>
        <p style={styles.description}>Choose one of the available instruments to complete.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {VALID_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => navigate(`/resident/questionnaire/${t}`)}
              style={{
                ...styles.card,
                cursor: 'pointer',
                textAlign: 'left',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: 4 }}>
                {INSTRUMENTS[t].name}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {INSTRUMENTS[t].fullName} &middot; {INSTRUMENTS[t].itemCount} items
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!residentProfile) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>Loading your profile...</div>
      </div>
    );
  }

  if (checkingDuplicate) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>Checking submission status...</div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Already submitted today
  // ---------------------------------------------------------------------------

  if (alreadySubmitted && !submitted) {
    return (
      <div style={styles.page}>
        <button style={styles.backBtn} onClick={() => navigate('/resident/dashboard')}>
          &larr; Back to Dashboard
        </button>
        <h1 style={styles.heading}>{meta!.name}</h1>
        <div style={styles.alert('info')}>
          <strong>Already submitted today.</strong> You have already completed the {meta!.name} for today ({todayDate()}).
          You can submit again tomorrow if needed.
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Handle response selection
  // ---------------------------------------------------------------------------

  function handleSelect(itemId: string, value: number) {
    setResponses((prev) => ({ ...prev, [itemId]: value }));
  }

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  async function handleSubmit() {
    if (!instrumentType || !residentProfile || !formComplete) return;

    setSubmitting(true);
    setError(null);

    try {
      const table = TABLE_MAP[instrumentType];
      const today = todayDate();

      // Double-check duplicate
      const { data: existing } = await supabase
        .from(table)
        .select('id')
        .eq('resident_id', residentProfile.id)
        .eq('response_date', today)
        .limit(1);

      if (existing && existing.length > 0) {
        setAlreadySubmitted(true);
        setSubmitting(false);
        return;
      }

      // Build insert payload
      let payload: Record<string, unknown> = {
        study_id: residentProfile.participant_id,
        resident_id: residentProfile.id,
        response_date: today,
        items: responses,
        review_status: 'pending',
      };

      if (instrumentType === 'cbi') {
        const result = scoreCBI(responses);
        setCbiResult(result);
        payload = {
          ...payload,
          personal_score: result.personal.score,
          work_score: result.work.score,
          patient_score: result.patient.score,
          personal_burnout: result.personal.burnout,
          work_burnout: result.work.burnout,
          patient_burnout: result.patient.burnout,
          any_burnout: result.anyBurnout,
        };
      } else if (instrumentType === 'phq9') {
        const result = scorePHQ9(responses);
        setPhq9Result(result);
        payload = {
          ...payload,
          total_score: result.total,
          severity: result.severity,
        };
      } else if (instrumentType === 'gad7') {
        const result = scoreGAD7(responses);
        setGad7Result(result);
        payload = {
          ...payload,
          total_score: result.total,
          severity: result.severity,
        };
      } else if (instrumentType === 'isi') {
        const result = scoreISI(responses);
        setIsiResult(result);
        payload = {
          ...payload,
          total_score: result.total,
          severity: result.severity,
        };
      }

      const { error: insertError } = await supabase.from(table).insert(payload);

      if (insertError) {
        setError(insertError.message);
      } else {
        setSubmitted(true);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Completion summary
  // ---------------------------------------------------------------------------

  if (submitted) {
    return (
      <div style={styles.page}>
        <button style={styles.backBtn} onClick={() => navigate('/resident/dashboard')}>
          &larr; Back to Dashboard
        </button>

        <h1 style={styles.heading}>Submission Complete</h1>
        <p style={styles.description}>
          Thank you for completing the {meta!.fullName}. Your responses have been recorded.
        </p>

        {/* PHQ-9 suicidal ideation notice */}
        {instrumentType === 'phq9' && phq9Result?.suicidalIdeationFlag && (
          <div style={styles.alert('warning')}>
            <strong>Support is available.</strong> If you are experiencing thoughts of self-harm, please reach out
            to your program director or call the Oman Mental Health Helpline at <strong>1444</strong>.
          </div>
        )}

        <div style={styles.summaryCard}>
          <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: 12, fontSize: 15 }}>
            Your Scores
          </div>

          {instrumentType === 'cbi' && cbiResult && (
            <>
              <div style={styles.summaryRow}>
                <span>Personal Burnout</span>
                <span style={{ fontWeight: 600 }}>
                  {cbiResult.personal.score.toFixed(1)} — {cbiResult.personal.burnout ? 'Burnout' : 'No Burnout'}
                </span>
              </div>
              <div style={styles.summaryRow}>
                <span>Work-Related Burnout</span>
                <span style={{ fontWeight: 600 }}>
                  {cbiResult.work.score.toFixed(1)} — {cbiResult.work.burnout ? 'Burnout' : 'No Burnout'}
                </span>
              </div>
              <div style={{ ...styles.summaryRow, borderBottom: 'none' }}>
                <span>Patient-Related Burnout</span>
                <span style={{ fontWeight: 600 }}>
                  {cbiResult.patient.score.toFixed(1)} — {cbiResult.patient.burnout ? 'Burnout' : 'No Burnout'}
                </span>
              </div>
            </>
          )}

          {instrumentType === 'phq9' && phq9Result && (
            <div style={{ ...styles.summaryRow, borderBottom: 'none' }}>
              <span>Total Score</span>
              <span style={{ fontWeight: 600 }}>
                {phq9Result.total} / 27 — {phq9Result.severity}
              </span>
            </div>
          )}

          {instrumentType === 'gad7' && gad7Result && (
            <div style={{ ...styles.summaryRow, borderBottom: 'none' }}>
              <span>Total Score</span>
              <span style={{ fontWeight: 600 }}>
                {gad7Result.total} / 21 — {gad7Result.severity}
              </span>
            </div>
          )}

          {instrumentType === 'isi' && isiResult && (
            <div style={{ ...styles.summaryRow, borderBottom: 'none' }}>
              <span>Total Score</span>
              <span style={{ fontWeight: 600 }}>
                {isiResult.total} / 28 — {isiResult.severity}
              </span>
            </div>
          )}
        </div>

        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
          Submitted on {todayDate()} &middot; Study ID: {residentProfile.participant_id}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render question
  // ---------------------------------------------------------------------------

  function renderQuestion(item: QuestionnaireItem | CBIItem, index: number) {
    const selected = responses[item.id];

    return (
      <div key={item.id} style={styles.card}>
        <div style={styles.questionText}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginRight: 6 }}>
            {index + 1}.
          </span>
          {item.text}
        </div>
        <div style={styles.optionsRow}>
          {item.options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              style={styles.optionBtn(selected === opt.value)}
              onClick={() => handleSelect(item.id, opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Main form render
  // ---------------------------------------------------------------------------

  return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => navigate('/resident/dashboard')}>
        &larr; Back to Dashboard
      </button>

      {/* Progress */}
      <div style={styles.progressBar}>
        <div style={styles.progressFill(progressPct)} />
      </div>
      <div style={styles.progressText}>
        Question {Math.min(answeredCount + 1, items.length)} of {items.length}
        {formComplete && ' — All questions answered'}
      </div>

      {/* Header */}
      <h1 style={styles.heading}>{meta!.fullName}</h1>
      <p style={styles.description}>
        {meta!.name} &middot; {meta!.itemCount} questions
        {meta!.timeframe ? ` &middot; ${meta!.timeframe}` : ''}
      </p>

      {/* Error */}
      {error && (
        <div style={styles.alert('warning')}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Questions */}
      {instrumentType === 'cbi' ? (
        // Group CBI by subscale
        <>
          {CBI_SUBSCALE_META.map((sub) => {
            const subscaleItems = (items as CBIItem[]).filter((i) => i.subscale === sub.key);
            // Global index offset
            const startIndex =
              sub.key === 'personal' ? 0 :
              sub.key === 'work' ? 6 :
              13;

            return (
              <div key={sub.key}>
                <div style={styles.sectionHeader}>{sub.label}</div>
                {subscaleItems.map((item, i) => renderQuestion(item, startIndex + i))}
              </div>
            );
          })}
        </>
      ) : (
        items.map((item, i) => renderQuestion(item, i))
      )}

      {/* Submit */}
      <button
        style={styles.submitBtn(!formComplete || submitting)}
        disabled={!formComplete || submitting}
        onClick={handleSubmit}
      >
        {submitting ? 'Submitting...' : 'Submit Responses'}
      </button>

      {!formComplete && answeredCount > 0 && (
        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
          Please answer all {items.length} questions to submit.
        </div>
      )}
    </div>
  );
}
