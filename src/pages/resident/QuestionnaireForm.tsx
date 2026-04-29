import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SupportAdvice from '../../components/SupportAdvice';
import { supabase } from '../../lib/supabase';
import {
  WHO5_ITEMS,
  CBI_ITEMS,
  PHQ9_ITEMS,
  GAD7_ITEMS,
} from '../../lib/instruments';
import type { QuestionnaireItem, CBIItem } from '../../lib/instruments';
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
import type { WHO5Result, CBIResult, PHQ9Result, GAD7Result } from '../../lib/scoring';

// ---------------------------------------------------------------------------
// Block schedule
// ---------------------------------------------------------------------------

interface BlockDef {
  block: number;
  start: string; // MM-DD
  end: string;   // MM-DD
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
  // For Block 5 where end month < start month, end is next year
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
  canSubmit: boolean;       // true if we're in week 3+
  submissionOpensDate: Date;
  daysUntilOpen: number;
}

function getCurrentBlock(): CurrentBlockInfo | null {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Try current academic year (starting Sep of the current year or previous year)
  const currentYear = now.getFullYear();
  const yearsToTry = [currentYear, currentYear - 1];

  for (const year of yearsToTry) {
    for (const b of BLOCK_SCHEDULE) {
      const { start, end } = getBlockDates(b, year);
      if (now >= start && now <= end) {
        // Calculate 3rd week start (day 15 of block)
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

// ---------------------------------------------------------------------------
// Part definitions
// ---------------------------------------------------------------------------

const PARTS = [
  { id: 1, title: 'Rotation Context', icon: '\uD83C\uDFE5' },
  { id: 2, title: 'WHO-5 Wellbeing', icon: '\uD83D\uDE0A' },
  { id: 3, title: 'CBI Burnout', icon: '\uD83D\uDD25' },
  { id: 4, title: 'PHQ-9 Depression', icon: '\uD83D\uDCAD' },
  { id: 5, title: 'GAD-7 Anxiety', icon: '\uD83D\uDCA8' },
];

// ---------------------------------------------------------------------------
// Rotation context types
// ---------------------------------------------------------------------------

interface RotationContext {
  rotation_name: string;
  clinical_intensity: number | null;
  calls_count: string;
  call_types: string[];
  rotation_types: string[];
  weekly_hours: string;
  major_life_event: string;
  annual_leave: string;
  sick_leave: string;
  pregnancy_status: string;
}

const CALL_TYPE_OPTIONS = ['24-hour shift', '12-hour shift', 'Home calls', 'No calls'];
const ROTATION_TYPE_OPTIONS = ['Outpatient based', 'Acute inpatient service', 'Both outpatient and inpatient', 'Surgical/Procedural', 'Laboratory settings'];
const WEEKLY_HOURS_OPTIONS = ['<40hrs', '40-60hrs', '60-80hrs', '>80hrs'];
const LEAVE_OPTIONS = ['No', '1-3 days', '4-7 days', '>7 days'];

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

  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 8,
    border: '2px solid var(--border)',
    fontSize: 15,
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.15s',
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

  checkboxRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 8,
  } as React.CSSProperties,

  checkboxBtn: (selected: boolean) => ({
    minHeight: 44,
    padding: '10px 16px',
    borderRadius: 8,
    border: selected ? '2px solid var(--primary)' : '2px solid var(--border)',
    background: selected ? 'var(--primary)' : 'white',
    color: selected ? 'white' : 'var(--text)',
    fontSize: 13,
    fontWeight: selected ? 600 : 400,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textAlign: 'left' as const,
  }) as React.CSSProperties,

  intensityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 8,
  } as React.CSSProperties,

  intensityBtn: (selected: boolean) => ({
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    border: selected ? '2px solid var(--primary)' : '2px solid var(--border)',
    background: selected ? 'var(--primary)' : 'white',
    color: selected ? 'white' : 'var(--text)',
    fontSize: 16,
    fontWeight: selected ? 700 : 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  }) as React.CSSProperties,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function QuestionnaireForm() {
  const navigate = useNavigate();
  const { residentProfile } = useAuth();

  const [currentPart, setCurrentPart] = useState(1);
  const [responses, setResponses] = useState<Responses>({});
  const [rotationCtx, setRotationCtx] = useState<RotationContext>({
    rotation_name: '',
    clinical_intensity: null,
    calls_count: '',
    call_types: [],
    rotation_types: [],
    weekly_hours: '',
    major_life_event: '',
    annual_leave: '',
    sick_leave: '',
    pregnancy_status: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Scores after submission
  const [who5Result, setWho5Result] = useState<WHO5Result | null>(null);
  const [cbiResult, setCbiResult] = useState<CBIResult | null>(null);
  const [phq9Result, setPhq9Result] = useState<PHQ9Result | null>(null);
  const [gad7Result, setGad7Result] = useState<GAD7Result | null>(null);

  const blockInfo = useMemo(() => getCurrentBlock(), []);

  // Check if already submitted for this block
  useEffect(() => {
    if (!residentProfile || !blockInfo) {
      setCheckingStatus(false);
      return;
    }

    const startISO = blockInfo.startDate.toISOString().slice(0, 10);
    const endISO = blockInfo.endDate.toISOString().slice(0, 10);

    supabase
      .from('block_assessments')
      .select('id')
      .eq('resident_id', residentProfile.id)
      .gte('assessment_date', startISO)
      .lte('assessment_date', endISO)
      .limit(1)
      .then(({ data, error: err }) => {
        if (!err && data && data.length > 0) {
          setAlreadySubmitted(true);
        }
        setCheckingStatus(false);
      });
  }, [residentProfile, blockInfo]);

  // ---------------------------------------------------------------------------
  // Part completeness
  // ---------------------------------------------------------------------------

  const isRotationComplete = useMemo(() => {
    const r = rotationCtx;
    return (
      r.rotation_name.trim().length > 0 &&
      r.clinical_intensity !== null &&
      r.calls_count !== '' &&
      r.call_types.length > 0 &&
      r.rotation_types.length > 0 &&
      r.weekly_hours !== '' &&
      r.major_life_event !== '' &&
      r.annual_leave !== '' &&
      r.sick_leave !== ''
      // pregnancy_status is optional
    );
  }, [rotationCtx]);

  const who5Complete = useMemo(() => isWHO5Complete(responses), [responses]);
  const cbiComplete = useMemo(() => isCBIComplete(responses), [responses]);
  const phq9Complete = useMemo(() => isPHQ9Complete(responses), [responses]);
  const gad7Complete = useMemo(() => isGAD7Complete(responses), [responses]);

  const partComplete = useCallback((part: number): boolean => {
    switch (part) {
      case 1: return isRotationComplete;
      case 2: return who5Complete;
      case 3: return cbiComplete;
      case 4: return phq9Complete;
      case 5: return gad7Complete;
      default: return false;
    }
  }, [isRotationComplete, who5Complete, cbiComplete, phq9Complete, gad7Complete]);

  const allComplete = isRotationComplete && who5Complete && cbiComplete && phq9Complete && gad7Complete;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function handleSelect(itemId: string, value: number) {
    setResponses((prev) => ({ ...prev, [itemId]: value }));
  }

  function toggleCheckbox(field: 'call_types' | 'rotation_types', value: string) {
    setRotationCtx((prev) => {
      const arr = prev[field];
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      return { ...prev, [field]: next };
    });
  }

  function handleNext() {
    if (currentPart < 5) setCurrentPart(currentPart + 1);
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
    if (!residentProfile || !blockInfo || !allComplete) return;

    setSubmitting(true);
    setError(null);

    try {
      const today = new Date().toISOString().slice(0, 10);
      const startISO = blockInfo.startDate.toISOString().slice(0, 10);
      const endISO = blockInfo.endDate.toISOString().slice(0, 10);

      // Double-check duplicate
      const { data: existing } = await supabase
        .from('block_assessments')
        .select('id')
        .eq('resident_id', residentProfile.id)
        .gte('assessment_date', startISO)
        .lte('assessment_date', endISO)
        .limit(1);

      if (existing && existing.length > 0) {
        setAlreadySubmitted(true);
        setSubmitting(false);
        return;
      }

      // Score everything
      const who5 = scoreWHO5(responses);
      const cbi = scoreCBI(responses);
      const phq9 = scorePHQ9(responses);
      const gad7 = scoreGAD7(responses);

      setWho5Result(who5);
      setCbiResult(cbi);
      setPhq9Result(phq9);
      setGad7Result(gad7);

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

      const payload = {
        study_id: residentProfile.study_id,
        resident_id: residentProfile.id,
        block_number: blockInfo.block,
        assessment_date: today,

        // Rotation context
        rotation_name: rotationCtx.rotation_name.trim(),
        clinical_intensity: rotationCtx.clinical_intensity,
        calls_count: rotationCtx.calls_count,
        call_types: rotationCtx.call_types,
        rotation_types: rotationCtx.rotation_types,
        weekly_hours: rotationCtx.weekly_hours,
        major_life_event: rotationCtx.major_life_event === 'Yes',
        annual_leave: rotationCtx.annual_leave,
        sick_leave: rotationCtx.sick_leave,
        pregnancy_status: rotationCtx.pregnancy_status || null,

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

      const { error: insertError } = await supabase.from('block_assessments').insert(payload);

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
        <div style={styles.loading}>Checking submission status...</div>
      </div>
    );
  }

  if (!blockInfo) {
    return (
      <div style={styles.page}>
        <button style={styles.backBtn} onClick={() => navigate('/resident/dashboard')}>
          &larr; Back to Dashboard
        </button>
        <h1 style={styles.heading}>Block Assessment</h1>
        <div style={styles.alert('info')}>
          <strong>No active block.</strong> You are currently outside of a scheduled rotation block.
          Assessments can only be completed during an active block period.
        </div>
      </div>
    );
  }

  if (!blockInfo.canSubmit && !alreadySubmitted) {
    return (
      <div style={styles.page}>
        <button style={styles.backBtn} onClick={() => navigate('/resident/dashboard')}>
          &larr; Back to Dashboard
        </button>
        <h1 style={styles.heading}>Block Assessment</h1>
        <div style={styles.alert('info')}>
          <strong>{blockInfo.label}</strong>
          <br />
          The assessment opens from the 3rd week of each block.
          It will be available on <strong>{formatDateShort(blockInfo.submissionOpensDate)}</strong> ({blockInfo.daysUntilOpen} days from now).
        </div>
      </div>
    );
  }

  if (alreadySubmitted && !submitted) {
    return (
      <div style={styles.page}>
        <button style={styles.backBtn} onClick={() => navigate('/resident/dashboard')}>
          &larr; Back to Dashboard
        </button>
        <h1 style={styles.heading}>Block Assessment</h1>
        <div style={styles.alert('success')}>
          <strong>Already completed.</strong> You have already submitted your assessment for {blockInfo.label}.
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Submission success
  // ---------------------------------------------------------------------------

  if (submitted) {
    return (
      <div style={styles.page}>
        <button style={styles.backBtn} onClick={() => navigate('/resident/dashboard')}>
          &larr; Back to Dashboard
        </button>

        <h1 style={styles.heading}>Assessment Complete</h1>
        <p style={styles.description}>
          Thank you for completing the End-of-Block Assessment for {blockInfo.label}. Your responses have been recorded.
        </p>

        {/* PHQ-9 suicidal ideation notice */}
        {phq9Result?.suicidalIdeationFlag && (
          <div style={styles.alert('warning')}>
            <strong>Support is available.</strong> If you are experiencing distressing thoughts, please reach out
            to your program director or call the Oman Mental Health Helpline at <strong>1444</strong>.
            Your wellbeing matters.
          </div>
        )}

        {/* WHO-5 */}
        {who5Result && (
          <div style={styles.summaryCard}>
            <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: 12, fontSize: 15 }}>
              WHO-5 Well-Being Index
            </div>
            <div style={styles.summaryRow}>
              <span>Raw Score</span>
              <span style={{ fontWeight: 600 }}>{who5Result.total} / 25</span>
            </div>
            <div style={{ ...styles.summaryRow, borderBottom: 'none' }}>
              <span>Percentage</span>
              <span style={{ fontWeight: 600, color: who5Result.poorWellbeing ? '#dc2626' : '#16a34a' }}>
                {who5Result.percent}% {who5Result.poorWellbeing ? '- Poor wellbeing' : '- Adequate wellbeing'}
              </span>
            </div>
          </div>
        )}

        {/* CBI */}
        {cbiResult && (
          <div style={styles.summaryCard}>
            <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: 12, fontSize: 15 }}>
              Copenhagen Burnout Inventory
            </div>
            <div style={styles.summaryRow}>
              <span>Personal Burnout</span>
              <span style={{ fontWeight: 600 }}>
                {cbiResult.personal.score.toFixed(1)} - {cbiResult.personal.burnout ? 'Burnout' : 'No Burnout'}
              </span>
            </div>
            <div style={styles.summaryRow}>
              <span>Work-Related Burnout</span>
              <span style={{ fontWeight: 600 }}>
                {cbiResult.work.score.toFixed(1)} - {cbiResult.work.burnout ? 'Burnout' : 'No Burnout'}
              </span>
            </div>
            <div style={{ ...styles.summaryRow, borderBottom: 'none' }}>
              <span>Patient-Related Burnout</span>
              <span style={{ fontWeight: 600 }}>
                {cbiResult.patient.score.toFixed(1)} - {cbiResult.patient.burnout ? 'Burnout' : 'No Burnout'}
              </span>
            </div>
          </div>
        )}

        {/* PHQ-9 */}
        {phq9Result && (
          <div style={styles.summaryCard}>
            <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: 12, fontSize: 15 }}>
              PHQ-9 Depression
            </div>
            <div style={{ ...styles.summaryRow, borderBottom: 'none' }}>
              <span>Total Score</span>
              <span style={{ fontWeight: 600 }}>{phq9Result.total} / 27 - {phq9Result.severity}</span>
            </div>
          </div>
        )}

        {/* GAD-7 */}
        {gad7Result && (
          <div style={styles.summaryCard}>
            <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: 12, fontSize: 15 }}>
              GAD-7 Anxiety
            </div>
            <div style={{ ...styles.summaryRow, borderBottom: 'none' }}>
              <span>Total Score</span>
              <span style={{ fontWeight: 600 }}>{gad7Result.total} / 21 - {gad7Result.severity}</span>
            </div>
          </div>
        )}

        <SupportAdvice
          who5Percent={who5Result?.percent ?? null}
          cbiPersonal={cbiResult?.personal?.score ?? null}
          cbiWork={cbiResult?.work?.score ?? null}
          cbiPatient={cbiResult?.patient?.score ?? null}
          phq9Total={phq9Result?.total ?? null}
          phq9Q9={responses.phq9_q9 ?? 0}
          gad7Total={gad7Result?.total ?? null}
        />

        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
          Submitted on {new Date().toISOString().slice(0, 10)} | {residentProfile.study_participant_id} | {blockInfo.label}
        </div>
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
  // Part 1: Rotation Context
  // ---------------------------------------------------------------------------

  function renderRotationContext() {
    return (
      <>
        <div style={styles.sectionHeader}>Rotation Context</div>

        {/* Q1: Rotation name */}
        <div style={styles.card}>
          <div style={styles.questionText}>1. What rotation are you currently doing?</div>
          <input
            type="text"
            value={rotationCtx.rotation_name}
            onChange={(e) => setRotationCtx((p) => ({ ...p, rotation_name: e.target.value }))}
            placeholder="e.g. General Medicine, ICU, Cardiology..."
            style={styles.input}
          />
        </div>

        {/* Q2: Clinical intensity */}
        <div style={styles.card}>
          <div style={styles.questionText}>2. Clinical intensity/workload rating</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
            1 = Very light &nbsp;&nbsp; 10 = Extremely intense
          </div>
          <div style={styles.intensityGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                type="button"
                style={styles.intensityBtn(rotationCtx.clinical_intensity === n)}
                onClick={() => setRotationCtx((p) => ({ ...p, clinical_intensity: n }))}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Q3: Number of calls */}
        <div style={styles.card}>
          <div style={styles.questionText}>3. Number of calls in last block</div>
          <div style={styles.optionsRow}>
            {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map((n) => (
              <button
                key={n}
                type="button"
                style={styles.optionBtn(rotationCtx.calls_count === n)}
                onClick={() => setRotationCtx((p) => ({ ...p, calls_count: n }))}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Q4: Type of calls */}
        <div style={styles.card}>
          <div style={styles.questionText}>4. Type of calls</div>
          <div style={styles.checkboxRow}>
            {CALL_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                style={styles.checkboxBtn(rotationCtx.call_types.includes(opt))}
                onClick={() => toggleCheckbox('call_types', opt)}
              >
                {rotationCtx.call_types.includes(opt) ? '\u2713 ' : ''}{opt}
              </button>
            ))}
          </div>
        </div>

        {/* Q5: Type of rotation */}
        <div style={styles.card}>
          <div style={styles.questionText}>5. Type of rotation</div>
          <div style={styles.checkboxRow}>
            {ROTATION_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                style={styles.checkboxBtn(rotationCtx.rotation_types.includes(opt))}
                onClick={() => toggleCheckbox('rotation_types', opt)}
              >
                {rotationCtx.rotation_types.includes(opt) ? '\u2713 ' : ''}{opt}
              </button>
            ))}
          </div>
        </div>

        {/* Q6: Weekly hours */}
        <div style={styles.card}>
          <div style={styles.questionText}>6. Weekly hours worked</div>
          <div style={styles.optionsRow}>
            {WEEKLY_HOURS_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                style={styles.optionBtn(rotationCtx.weekly_hours === opt)}
                onClick={() => setRotationCtx((p) => ({ ...p, weekly_hours: opt }))}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Q7: Major life event */}
        <div style={styles.card}>
          <div style={styles.questionText}>7. Major personal life event this block?</div>
          <div style={styles.optionsRow}>
            {['Yes', 'No'].map((opt) => (
              <button
                key={opt}
                type="button"
                style={styles.optionBtn(rotationCtx.major_life_event === opt)}
                onClick={() => setRotationCtx((p) => ({ ...p, major_life_event: opt }))}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Q8: Annual leave */}
        <div style={styles.card}>
          <div style={styles.questionText}>8. Annual leave taken this block</div>
          <div style={styles.optionsRow}>
            {LEAVE_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                style={styles.optionBtn(rotationCtx.annual_leave === opt)}
                onClick={() => setRotationCtx((p) => ({ ...p, annual_leave: opt }))}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Q9: Sick leave */}
        <div style={styles.card}>
          <div style={styles.questionText}>9. Sick leave taken this block</div>
          <div style={styles.optionsRow}>
            {LEAVE_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                style={styles.optionBtn(rotationCtx.sick_leave === opt)}
                onClick={() => setRotationCtx((p) => ({ ...p, sick_leave: opt }))}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Q10: Pregnancy status (optional) */}
        <div style={styles.card}>
          <div style={styles.questionText}>
            10. Pregnancy status
            <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>(optional)</span>
          </div>
          <div style={styles.optionsRow}>
            {['Yes', 'No', 'Prefer not to answer'].map((opt) => (
              <button
                key={opt}
                type="button"
                style={styles.optionBtn(rotationCtx.pregnancy_status === opt)}
                onClick={() => setRotationCtx((p) => ({ ...p, pregnancy_status: opt }))}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  // ---------------------------------------------------------------------------
  // Part 2: WHO-5
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
  // Part 3: CBI
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
  // Part 4: PHQ-9
  // ---------------------------------------------------------------------------

  function renderPHQ9() {
    // Check if q9 has a value >= 1
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
  // Part 5: GAD-7
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
  const isLastPart = currentPart === 5;

  return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => navigate('/resident/dashboard')}>
        &larr; Back to Dashboard
      </button>

      {/* Block info */}
      <div style={{ ...styles.alert('info'), marginBottom: 16 }}>
        <strong>{blockInfo.label}</strong>
        <br />
        <span style={{ fontSize: 13 }}>
          {formatDateShort(blockInfo.startDate)} - {formatDateShort(blockInfo.endDate)} | End-of-Block Assessment
        </span>
      </div>

      {/* Stepper */}
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
          Part {currentPart} of 5
        </span>
      </div>
      <h1 style={styles.heading}>
        {currentPartDef.icon} {currentPartDef.title}
      </h1>

      {/* Error */}
      {error && (
        <div style={styles.alert('warning')}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Part content */}
      {currentPart === 1 && renderRotationContext()}
      {currentPart === 2 && renderWHO5()}
      {currentPart === 3 && renderCBI()}
      {currentPart === 4 && renderPHQ9()}
      {currentPart === 5 && renderGAD7()}

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
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
        )}
      </div>

      {/* Incomplete hint */}
      {!partComplete(currentPart) && (
        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
          Please complete all required questions in this section to continue.
        </div>
      )}
    </div>
  );
}
