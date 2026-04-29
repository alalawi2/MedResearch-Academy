import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import SupportAdvice from '../../components/SupportAdvice';
import {
  WHO5_ITEMS,
  CBI_ITEMS,
  PHQ9_ITEMS,
  GAD7_ITEMS,
} from '../../lib/instruments';
import type { QuestionnaireItem, CBIItem } from '../../lib/instruments';
import { scoreWHO5, scoreCBI, scorePHQ9, scoreGAD7 } from '../../lib/scoring';
import type { Responses } from '../../lib/scoring';
import {
  scoreWHO5,
  scoreCBI,
  scorePHQ9,
  scoreGAD7,
  isWHO5Complete,
  isCBIComplete,
  isPHQ9Complete,
  isGAD7Complete,
} from '../../lib/scoring';

// ---------------------------------------------------------------------------
// Part definitions (4 parts — no rotation context for baseline)
// ---------------------------------------------------------------------------

const PARTS = [
  { id: 1, title: 'WHO-5 Wellbeing', icon: '\uD83D\uDE0A' },
  { id: 2, title: 'CBI Burnout', icon: '\uD83D\uDD25' },
  { id: 3, title: 'PHQ-9 Depression', icon: '\uD83D\uDCAD' },
  { id: 4, title: 'GAD-7 Anxiety', icon: '\uD83D\uDCA8' },
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

  sectionHeader: {
    fontSize: 15,
    fontWeight: 600 as const,
    color: 'var(--primary)',
    borderBottom: '2px solid var(--primary)',
    paddingBottom: 6,
    marginTop: 28,
    marginBottom: 16,
  } as React.CSSProperties,

  loading: {
    textAlign: 'center' as const,
    padding: '48px 24px',
    color: 'var(--text-muted)',
    fontSize: 14,
  } as React.CSSProperties,

  navRow: {
    display: 'flex',
    gap: 12,
    marginTop: 24,
  } as React.CSSProperties,

  navBtn: (variant: 'primary' | 'secondary', disabled?: boolean) => ({
    flex: 1,
    padding: '14px 24px',
    borderRadius: 10,
    border: variant === 'secondary' ? '2px solid var(--border)' : 'none',
    background: disabled ? 'var(--border)' : variant === 'primary' ? 'var(--primary)' : 'white',
    color: disabled ? 'var(--text-muted)' : variant === 'primary' ? 'white' : 'var(--text)',
    fontSize: 16,
    fontWeight: 600 as const,
    cursor: disabled ? 'not-allowed' : 'pointer',
  }) as React.CSSProperties,

  stepper: {
    display: 'flex',
    gap: 4,
    marginBottom: 20,
  } as React.CSSProperties,

  stepDot: (active: boolean, completed: boolean) => ({
    flex: 1,
    height: 6,
    borderRadius: 3,
    background: active ? 'var(--primary)' : completed ? 'var(--accent)' : 'var(--border)',
    transition: 'background 0.2s',
  }) as React.CSSProperties,

  successContainer: {
    textAlign: 'center' as const,
    padding: '48px 24px',
  } as React.CSSProperties,

  successIcon: {
    fontSize: 56,
    marginBottom: 16,
  } as React.CSSProperties,

  successTitle: {
    fontSize: '1.6rem',
    fontFamily: 'var(--font-serif)',
    color: 'var(--primary)',
    marginBottom: 8,
    marginTop: 0,
  } as React.CSSProperties,

  successText: {
    fontSize: 15,
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    marginBottom: 32,
  } as React.CSSProperties,

  dashboardBtn: {
    display: 'inline-block',
    padding: '14px 32px',
    borderRadius: 10,
    border: 'none',
    background: 'var(--primary)',
    color: 'white',
    fontSize: 16,
    fontWeight: 600 as const,
    cursor: 'pointer',
    textDecoration: 'none',
  } as React.CSSProperties,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BaselineAssessment() {
  const { residentProfile } = useAuth();

  const [currentPart, setCurrentPart] = useState(1);
  const [responses, setResponses] = useState<Responses>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Check if baseline already completed on mount
  useEffect(() => {
    if (!residentProfile) {
      setCheckingStatus(false);
      return;
    }

    supabase
      .from('block_assessments')
      .select('id')
      .eq('resident_id', residentProfile.id)
      .eq('rotation_name', 'BASELINE')
      .limit(1)
      .then(({ data, error: err }) => {
        if (!err && data && data.length > 0) {
          setAlreadyDone(true);
        }
        setCheckingStatus(false);
      });
  }, [residentProfile]);

  // ---------------------------------------------------------------------------
  // Part completeness
  // ---------------------------------------------------------------------------

  const who5Complete = useMemo(() => isWHO5Complete(responses), [responses]);
  const cbiComplete = useMemo(() => isCBIComplete(responses), [responses]);
  const phq9Complete = useMemo(() => isPHQ9Complete(responses), [responses]);
  const gad7Complete = useMemo(() => isGAD7Complete(responses), [responses]);

  const partComplete = useCallback((part: number): boolean => {
    switch (part) {
      case 1: return who5Complete;
      case 2: return cbiComplete;
      case 3: return phq9Complete;
      case 4: return gad7Complete;
      default: return false;
    }
  }, [who5Complete, cbiComplete, phq9Complete, gad7Complete]);

  const allComplete = who5Complete && cbiComplete && phq9Complete && gad7Complete;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function handleSelect(itemId: string, value: number) {
    setResponses((prev) => ({ ...prev, [itemId]: value }));
  }

  function handleNext() {
    if (currentPart < 4) setCurrentPart(currentPart + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBack() {
    if (currentPart > 1) setCurrentPart(currentPart - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  async function handleSubmit() {
    if (!residentProfile || !allComplete) return;

    setSubmitting(true);
    setError(null);

    try {
      // Double-check duplicate
      const { data: existing } = await supabase
        .from('block_assessments')
        .select('id')
        .eq('resident_id', residentProfile.id)
        .eq('rotation_name', 'BASELINE')
        .limit(1);

      if (existing && existing.length > 0) {
        setAlreadyDone(true);
        setSubmitting(false);
        return;
      }

      // Score everything
      const who5 = scoreWHO5(responses);
      const cbi = scoreCBI(responses);
      const phq9 = scorePHQ9(responses);
      const gad7 = scoreGAD7(responses);

      // Build WHO-5 items
      const who5Items: Record<string, number> = {};
      for (let i = 1; i <= 5; i++) {
        who5Items[`who5_q${i}`] = responses[`who5_q${i}`];
      }

      // Build CBI items
      const cbiItems: Record<string, number> = {};
      for (const item of CBI_ITEMS) {
        cbiItems[item.id] = responses[item.id];
      }

      // Build PHQ-9 items
      const phq9Items: Record<string, number> = {};
      for (let i = 1; i <= 9; i++) {
        phq9Items[`phq9_q${i}`] = responses[`phq9_q${i}`];
      }

      // Build GAD-7 items
      const gad7Items: Record<string, number> = {};
      for (let i = 1; i <= 7; i++) {
        gad7Items[`gad7_q${i}`] = responses[`gad7_q${i}`];
      }

      const today = new Date().toISOString().slice(0, 10);

      const payload = {
        study_id: residentProfile.study_id,
        resident_id: residentProfile.id,
        assessment_date: today,
        rotation_name: 'BASELINE',

        // WHO-5
        who5_items: who5Items,
        who5_total: who5.total,
        who5_percent: who5.percent,

        // CBI
        cbi_items: cbiItems,
        cbi_personal_score: cbi.personal.score,
        cbi_work_score: cbi.work.score,
        cbi_patient_score: cbi.patient.score,
        cbi_personal_burnout: cbi.personal.burnout,
        cbi_work_burnout: cbi.work.burnout,
        cbi_patient_burnout: cbi.patient.burnout,
        cbi_any_burnout: cbi.anyBurnout,

        // PHQ-9
        phq9_items: phq9Items,
        phq9_total: phq9.total,
        phq9_severity: phq9.severity,

        // GAD-7
        gad7_items: gad7Items,
        gad7_total: gad7.total,
        gad7_severity: gad7.severity,

        review_status: 'pending',
      };

      const { error: insertError } = await supabase
        .from('block_assessments')
        .insert(payload);

      if (insertError) {
        setError(insertError.message);
        setSubmitting(false);
        return;
      }

      // Mark baseline as completed on the participant record
      await supabase
        .from('burnout_participants')
        .update({ baseline_completed: true })
        .eq('id', residentProfile.id);

      setSubmitted(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Loading / guard states
  // ---------------------------------------------------------------------------

  if (!residentProfile) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>Loading your profile...</div>
      </div>
    );
  }

  if (checkingStatus) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>Checking baseline status...</div>
      </div>
    );
  }

  if (alreadyDone && !submitted) {
    return (
      <div style={styles.page}>
        <h1 style={styles.heading}>Baseline Assessment</h1>
        <div style={styles.alert('success')}>
          <strong>Already completed.</strong> You have already submitted your baseline assessment.
        </div>
        <button
          style={styles.dashboardBtn}
          onClick={() => { window.location.href = '/resident/dashboard'; }}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Success screen
  // ---------------------------------------------------------------------------

  if (submitted) {
    // Compute scores for support advice
    const who5Score = scoreWHO5(responses);
    const cbiScore = scoreCBI(responses);
    const phq9Score = scorePHQ9(responses);
    const gad7Score = scoreGAD7(responses);

    return (
      <div style={styles.page}>
        <div style={styles.successContainer}>
          <div style={styles.successIcon}>{'\u2705'}</div>
          <h1 style={styles.successTitle}>Baseline Complete!</h1>
          <p style={styles.successText}>
            Your baseline measurements have been recorded
            and will be used as a reference throughout the study.
          </p>
        </div>

        <SupportAdvice
          who5Percent={who5Score.percentage}
          cbiPersonal={cbiScore.personalScore}
          cbiWork={cbiScore.workScore}
          cbiPatient={cbiScore.patientScore}
          phq9Total={phq9Score.total}
          phq9Q9={responses.phq9_q9 ?? 0}
          gad7Total={gad7Score.total}
        />

        <button
          style={styles.dashboardBtn}
          onClick={() => { window.location.href = '/resident/dashboard'; }}
        >
          Go to Dashboard {'\u2192'}
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render question helper
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
  // Part 1: WHO-5
  // ---------------------------------------------------------------------------

  function renderWHO5() {
    return (
      <>
        <div style={styles.sectionHeader}>WHO-5 Well-Being Index</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
          Over the last two weeks, how have you been feeling?
        </div>
        {WHO5_ITEMS.map((item, i) => renderQuestion(item, i))}
      </>
    );
  }

  // ---------------------------------------------------------------------------
  // Part 2: CBI
  // ---------------------------------------------------------------------------

  function renderCBI() {
    const subscales = [
      { key: 'personal' as const, label: 'Personal Burnout', startIdx: 0 },
      { key: 'work' as const, label: 'Work-Related Burnout', startIdx: 6 },
      { key: 'patient' as const, label: 'Patient-Related Burnout', startIdx: 13 },
    ];

    return (
      <>
        <div style={styles.sectionHeader}>Copenhagen Burnout Inventory</div>
        {subscales.map((sub) => {
          const subscaleItems = CBI_ITEMS.filter((i) => i.subscale === sub.key);
          return (
            <div key={sub.key}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', marginTop: 20, marginBottom: 12 }}>
                {sub.label}
              </div>
              {subscaleItems.map((item, i) => renderQuestion(item, sub.startIdx + i))}
            </div>
          );
        })}
      </>
    );
  }

  // ---------------------------------------------------------------------------
  // Part 3: PHQ-9
  // ---------------------------------------------------------------------------

  function renderPHQ9() {
    const showSafetyMessage = responses['phq9_q9'] != null && responses['phq9_q9'] >= 1;

    return (
      <>
        <div style={styles.sectionHeader}>PHQ-9 Depression Screening</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
          Over the last 2 weeks, how often have you been bothered by any of the following problems?
        </div>
        {PHQ9_ITEMS.map((item, i) => renderQuestion(item, i))}
        {showSafetyMessage && (
          <div style={styles.alert('warning')}>
            <strong>Support is available.</strong> If you are experiencing distressing thoughts, please know
            that help is available. You can reach the Oman Mental Health Helpline at <strong>1444</strong>.
            Your wellbeing matters to us.
          </div>
        )}
      </>
    );
  }

  // ---------------------------------------------------------------------------
  // Part 4: GAD-7
  // ---------------------------------------------------------------------------

  function renderGAD7() {
    return (
      <>
        <div style={styles.sectionHeader}>GAD-7 Anxiety Screening</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
          Over the last 2 weeks, how often have you been bothered by the following problems?
        </div>
        {GAD7_ITEMS.map((item, i) => renderQuestion(item, i))}
      </>
    );
  }

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  const currentPartDef = PARTS[currentPart - 1];
  const isLastPart = currentPart === 4;

  return (
    <div style={styles.page}>
      {/* Header */}
      <h1 style={styles.heading}>Baseline Assessment</h1>
      <p style={styles.description}>
        This one-time assessment establishes your baseline measurements before the study begins.
      </p>

      {/* Stepper dots + progress bar */}
      <div style={styles.stepper}>
        {PARTS.map((p) => (
          <div
            key={p.id}
            style={styles.stepDot(p.id === currentPart, partComplete(p.id))}
          />
        ))}
      </div>

      {/* Part title */}
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>
          Part {currentPart} of 4
        </span>
      </div>
      <h2 style={{ ...styles.heading, fontSize: '1.2rem', marginBottom: 16 }}>
        {currentPartDef.icon} {currentPartDef.title}
      </h2>

      {/* Error */}
      {error && (
        <div style={styles.alert('warning')}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Part content */}
      {currentPart === 1 && renderWHO5()}
      {currentPart === 2 && renderCBI()}
      {currentPart === 3 && renderPHQ9()}
      {currentPart === 4 && renderGAD7()}

      {/* Navigation */}
      <div style={styles.navRow}>
        {currentPart > 1 && (
          <button
            type="button"
            style={styles.navBtn('secondary')}
            onClick={handleBack}
          >
            Back
          </button>
        )}

        {!isLastPart ? (
          <button
            type="button"
            style={styles.navBtn('primary', !partComplete(currentPart))}
            disabled={!partComplete(currentPart)}
            onClick={handleNext}
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            style={styles.navBtn('primary', !allComplete || submitting)}
            disabled={!allComplete || submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Submitting...' : 'Submit Baseline'}
          </button>
        )}
      </div>

      {/* Incomplete hint */}
      {!partComplete(currentPart) && (
        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
          Please complete all questions in this section to continue.
        </div>
      )}
    </div>
  );
}
