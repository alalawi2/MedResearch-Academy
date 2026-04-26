import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const REGIONS = [
  'Muscat', 'Dhofar', 'Buraimi', 'Al Batinah', 'Ash Sharqiyah',
  'Ad Dhahirah', 'Al Wusta', 'Musandam', 'Al Dakhiliya',
];

const RESIDENCY_PROGRAMS = [
  'Internal Medicine', 'General Surgery', 'Pediatrics', 'OB/GYN',
  'Anesthesia', 'Emergency Medicine', 'Orthopedics', 'Ophthalmology',
  'ENT', 'Dermatology', 'Psychiatry', 'Radiology', 'Pathology',
  'Family Medicine', 'Urology', 'Neurology', 'Cardiology', 'Nephrology',
  'Pulmonology', 'Gastroenterology', 'Endocrinology', 'Rheumatology', 'Other',
];

const CHRONIC_CONDITIONS = [
  'None', 'Hypertension', 'Diabetes Mellitus', 'Asthma/COPD',
  'Thyroid disorder', 'Cardiac disease', 'GI disease',
  'Musculoskeletal disorder', 'Neurological disorder', 'Autoimmune disease',
  'Cancer', 'Chronic pain', 'Other',
];

const PSYCHIATRIC_CONDITIONS = [
  'None', 'Depression', 'Anxiety disorder', 'PTSD', 'Bipolar disorder',
  'ADHD', 'OCD', 'Eating disorder', 'Insomnia disorder',
  'Substance use disorder', 'Panic disorder', 'Social anxiety', 'Other',
];

const DIET_TYPES = [
  'No specific diet', 'Vegetarian', 'Vegan', 'Ketogenic',
  'Mediterranean', 'Intermittent fasting', 'Gluten-free', 'Low-carb', 'Other',
];

const STEP_LABELS = [
  'Personal Information',
  'Physical',
  'Training',
  'Medical History',
  'Lifestyle',
];

const TOTAL_STEPS = 5;

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

  // Step indicator dots
  dotsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  } as React.CSSProperties,

  dot: (state: 'done' | 'active' | 'upcoming') => ({
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: state === 'done' ? 'var(--primary)' : state === 'active' ? 'var(--accent)' : 'var(--border)',
    border: state === 'active' ? '2px solid var(--primary)' : '2px solid transparent',
    transition: 'all 0.3s ease',
  }) as React.CSSProperties,

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
    transition: 'width 0.4s ease',
  }) as React.CSSProperties,

  progressText: {
    fontSize: 13,
    color: 'var(--text-muted)',
    marginBottom: 20,
    textAlign: 'center' as const,
  } as React.CSSProperties,

  stepTitle: {
    fontSize: 17,
    fontWeight: 600 as const,
    color: 'var(--primary)',
    marginBottom: 20,
    paddingBottom: 8,
    borderBottom: '2px solid var(--primary)',
  } as React.CSSProperties,

  card: {
    background: 'white',
    borderRadius: 12,
    border: '1px solid var(--border)',
    padding: '20px 20px 16px',
    marginBottom: 16,
  } as React.CSSProperties,

  label: {
    fontSize: 15,
    lineHeight: 1.5,
    color: 'var(--text)',
    marginBottom: 10,
    fontWeight: 500 as const,
    display: 'block' as const,
  } as React.CSSProperties,

  radioRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 8,
  } as React.CSSProperties,

  radioBtn: (selected: boolean) => ({
    minHeight: 44,
    minWidth: 44,
    padding: '8px 16px',
    borderRadius: 22,
    border: selected ? '2px solid var(--primary)' : '2px solid var(--border)',
    background: selected ? 'var(--primary)' : 'white',
    color: selected ? 'white' : 'var(--text)',
    fontSize: 14,
    fontWeight: selected ? 600 : 400,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    flex: '0 1 auto',
    textAlign: 'center' as const,
    lineHeight: '26px',
  }) as React.CSSProperties,

  checkboxBtn: (selected: boolean) => ({
    minHeight: 44,
    padding: '8px 16px',
    borderRadius: 22,
    border: selected ? '2px solid var(--primary)' : '2px solid var(--border)',
    background: selected ? 'var(--primary)' : 'white',
    color: selected ? 'white' : 'var(--text)',
    fontSize: 14,
    fontWeight: selected ? 600 : 400,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textAlign: 'center' as const,
    lineHeight: '26px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  }) as React.CSSProperties,

  checkboxRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 8,
  } as React.CSSProperties,

  input: {
    width: '100%',
    minHeight: 44,
    padding: '10px 14px',
    borderRadius: 8,
    border: '2px solid var(--border)',
    fontSize: 15,
    color: 'var(--text)',
    background: 'white',
    boxSizing: 'border-box' as const,
    outline: 'none',
  } as React.CSSProperties,

  select: {
    width: '100%',
    minHeight: 44,
    padding: '10px 14px',
    borderRadius: 8,
    border: '2px solid var(--border)',
    fontSize: 15,
    color: 'var(--text)',
    background: 'white',
    boxSizing: 'border-box' as const,
    outline: 'none',
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    paddingRight: 36,
  } as React.CSSProperties,

  textarea: {
    width: '100%',
    minHeight: 80,
    padding: '10px 14px',
    borderRadius: 8,
    border: '2px solid var(--border)',
    fontSize: 15,
    color: 'var(--text)',
    background: 'white',
    boxSizing: 'border-box' as const,
    outline: 'none',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
  } as React.CSSProperties,

  bmiDisplay: {
    minHeight: 44,
    padding: '10px 14px',
    borderRadius: 8,
    border: '2px solid var(--border)',
    background: '#f9fafb',
    fontSize: 15,
    color: 'var(--primary)',
    fontWeight: 600 as const,
  } as React.CSSProperties,

  navRow: {
    display: 'flex',
    gap: 12,
    marginTop: 28,
  } as React.CSSProperties,

  navBtn: (variant: 'back' | 'next' | 'submit', disabled?: boolean) => ({
    flex: 1,
    minHeight: 52,
    padding: '14px 24px',
    borderRadius: 12,
    border: variant === 'back' ? '2px solid var(--border)' : 'none',
    background: disabled
      ? 'var(--border)'
      : variant === 'back'
        ? 'white'
        : variant === 'submit'
          ? 'var(--accent)'
          : 'var(--primary)',
    color: disabled
      ? 'var(--text-muted)'
      : variant === 'back'
        ? 'var(--text)'
        : 'white',
    fontSize: 16,
    fontWeight: 600 as const,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  }) as React.CSSProperties,

  validationMsg: {
    textAlign: 'center' as const,
    fontSize: 13,
    color: '#dc3545',
    marginTop: 10,
    padding: '8px 12px',
    background: '#fff5f5',
    borderRadius: 8,
    border: '1px solid #fecaca',
  } as React.CSSProperties,

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

  loading: {
    textAlign: 'center' as const,
    padding: '48px 24px',
    color: 'var(--text-muted)',
    fontSize: 14,
  } as React.CSSProperties,

  // Success screen
  successContainer: {
    textAlign: 'center' as const,
    padding: '48px 24px',
  } as React.CSSProperties,

  successCheckmark: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: '#d1e7dd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
    fontSize: 40,
    color: '#198754',
  } as React.CSSProperties,

  successTitle: {
    fontSize: '1.4rem',
    fontFamily: 'var(--font-serif)',
    color: 'var(--primary)',
    marginBottom: 12,
  } as React.CSSProperties,

  successText: {
    fontSize: 15,
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    marginBottom: 32,
  } as React.CSSProperties,

  dashboardBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '14px 32px',
    borderRadius: 12,
    border: 'none',
    background: 'var(--primary)',
    color: 'white',
    fontSize: 16,
    fontWeight: 600 as const,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  } as React.CSSProperties,

  // Read-only summary
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

  readOnlyValue: {
    fontSize: 14,
    color: 'var(--text)',
    padding: '6px 0',
  } as React.CSSProperties,
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FormData {
  date_of_birth: string;
  gender: string;
  marital_status: string;
  region_of_origin: string;
  hometown_visits: string;
  has_children: string;
  num_children: string;
  special_care_dependents: string;
  financial_difficulties: string;
  weight_kg: string;
  height_cm: string;
  residency_level: string;
  residency_program: string;
  chronic_conditions: string[];
  psychiatric_conditions: string[];
  on_medications: string;
  medications_list: string;
  exercise_days: string;
  diet_types: string[];
  caffeine_per_day: string;
  sleep_hours: string;
}

const INITIAL_FORM: FormData = {
  date_of_birth: '',
  gender: '',
  marital_status: '',
  region_of_origin: '',
  hometown_visits: '',
  has_children: '',
  num_children: '',
  special_care_dependents: '',
  financial_difficulties: '',
  weight_kg: '',
  height_cm: '',
  residency_level: '',
  residency_program: '',
  chronic_conditions: [],
  psychiatric_conditions: [],
  on_medications: '',
  medications_list: '',
  exercise_days: '',
  diet_types: [],
  caffeine_per_day: '',
  sleep_hours: '',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DemographicsForm() {
  const navigate = useNavigate();
  const { residentProfile } = useAuth();

  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [existingData, setExistingData] = useState<Record<string, unknown> | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Check if already completed
  useEffect(() => {
    if (!residentProfile) {
      setCheckingStatus(false);
      return;
    }

    supabase
      .from('burnout_participants')
      .select('demographics_completed, date_of_birth, gender, marital_status, region_of_origin, hometown_visit_frequency, has_children, number_of_children, special_care_dependents, financial_difficulties, weight_kg, height_cm, residency_level, residency_program, chronic_conditions, psychiatric_conditions, on_medications, medications_list, exercise_days_per_week, diet_type, caffeine_drinks_daily, sleep_hours_non_call')
      .eq('id', residentProfile.id)
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data?.demographics_completed) {
          setAlreadyCompleted(true);
          setExistingData(data);
        }
        setCheckingStatus(false);
      });
  }, [residentProfile]);

  // BMI calculation
  const bmi = useMemo(() => {
    const w = parseFloat(form.weight_kg);
    const h = parseFloat(form.height_cm);
    if (!w || !h || h <= 0) return null;
    const heightM = h / 100;
    return (w / (heightM * heightM)).toFixed(1);
  }, [form.weight_kg, form.height_cm]);

  // Helpers
  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    setValidationError(null);
  }

  function toggleCheckbox(key: 'chronic_conditions' | 'psychiatric_conditions' | 'diet_types', value: string) {
    setForm(prev => {
      const arr = prev[key];
      const noneValue = key === 'diet_types' ? 'No specific diet' : 'None';
      if (value === noneValue) {
        return { ...prev, [key]: arr.includes(noneValue) ? [] : [noneValue] };
      }
      const filtered = arr.filter(v => v !== noneValue);
      if (filtered.includes(value)) {
        return { ...prev, [key]: filtered.filter(v => v !== value) };
      }
      return { ...prev, [key]: [...filtered, value] };
    });
    setValidationError(null);
  }

  // Per-step validation
  function validateStep(s: number): string | null {
    switch (s) {
      case 1: {
        if (!form.date_of_birth) return 'Please enter your date of birth.';
        if (!form.gender) return 'Please select your gender.';
        if (!form.marital_status) return 'Please select your marital status.';
        if (!form.region_of_origin) return 'Please select your region of origin.';
        if (form.region_of_origin !== 'Muscat' && !form.hometown_visits) return 'Please indicate how often you visit your hometown.';
        if (!form.has_children) return 'Please indicate whether you have children.';
        if (form.has_children === 'Yes' && !form.num_children) return 'Please select the number of children.';
        if (!form.special_care_dependents) return 'Please indicate if you have special care dependents.';
        if (!form.financial_difficulties) return 'Please indicate if you perceive financial difficulties.';
        return null;
      }
      case 2: {
        if (!form.weight_kg) return 'Please enter your weight.';
        if (!form.height_cm) return 'Please enter your height.';
        return null;
      }
      case 3: {
        if (!form.residency_level) return 'Please select your residency level.';
        if (!form.residency_program) return 'Please select your residency program.';
        return null;
      }
      case 4: {
        if (form.chronic_conditions.length === 0) return 'Please select at least one option for chronic conditions (or "None").';
        if (form.psychiatric_conditions.length === 0) return 'Please select at least one option for psychiatric conditions (or "None").';
        if (!form.on_medications) return 'Please indicate whether you are on medications.';
        if (form.on_medications === 'Yes' && !form.medications_list.trim()) return 'Please list your current medications.';
        return null;
      }
      case 5: {
        if (!form.exercise_days) return 'Please select your exercise frequency.';
        if (form.diet_types.length === 0) return 'Please select at least one diet type (or "No specific diet").';
        if (!form.caffeine_per_day) return 'Please select your daily caffeine intake.';
        if (!form.sleep_hours) return 'Please enter your average sleep hours.';
        return null;
      }
      default:
        return null;
    }
  }

  function handleNext() {
    const err = validateStep(step);
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError(null);
    setStep(prev => Math.min(prev + 1, TOTAL_STEPS));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBack() {
    setValidationError(null);
    setStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Submit
  async function handleSubmit() {
    if (!residentProfile) return;

    const err = validateStep(step);
    if (err) {
      setValidationError(err);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        date_of_birth: form.date_of_birth,
        gender: form.gender,
        marital_status: form.marital_status,
        region_of_origin: form.region_of_origin,
        hometown_visit_frequency: form.region_of_origin !== 'Muscat' ? form.hometown_visits : null,
        has_children: form.has_children === 'Yes',
        number_of_children: form.has_children === 'Yes' ? form.num_children : null,
        special_care_dependents: form.special_care_dependents === 'Yes',
        financial_difficulties: form.financial_difficulties === 'Yes',
        weight_kg: parseFloat(form.weight_kg),
        height_cm: parseFloat(form.height_cm),
        residency_level: form.residency_level,
        residency_program: form.residency_program,
        chronic_conditions: form.chronic_conditions,
        psychiatric_conditions: form.psychiatric_conditions,
        on_medications: form.on_medications === 'Yes',
        medications_list: form.on_medications === 'Yes' ? form.medications_list.trim() : null,
        exercise_days_per_week: form.exercise_days,
        diet_type: form.diet_types,
        caffeine_drinks_daily: form.caffeine_per_day,
        sleep_hours_non_call: parseFloat(form.sleep_hours),
        demographics_completed: true,
      };

      const { error: updateError } = await supabase
        .from('burnout_participants')
        .update(payload)
        .eq('id', residentProfile.id);

      if (updateError) {
        setError(updateError.message);
      } else {
        setSubmitted(true);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  }

  // -------------------------------------------------------------------------
  // Read-only summary helper
  // -------------------------------------------------------------------------

  function renderReadOnlyRow(label: string, value: string) {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
        <span style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontWeight: 500, textAlign: 'right' as const, maxWidth: '60%' }}>{value || '--'}</span>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Loading states
  // -------------------------------------------------------------------------

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
        <div style={styles.loading}>Checking enrollment status...</div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Already completed -- read-only summary
  // -------------------------------------------------------------------------

  if (alreadyCompleted && existingData && !submitted) {
    return (
      <div style={styles.page}>
        <button style={styles.backBtn} onClick={() => navigate('/resident/dashboard')}>
          &larr; Back to Dashboard
        </button>
        <h1 style={styles.heading}>Enrollment Form</h1>
        <div style={styles.alert('success')}>
          <strong>Already completed.</strong> Your demographics form has been submitted. Below is a read-only summary.
        </div>

        <div style={styles.card}>
          <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: 12, fontSize: 15 }}>
            Personal Information
          </div>
          {renderReadOnlyRow('Date of Birth', existingData.date_of_birth as string)}
          {renderReadOnlyRow('Gender', existingData.gender as string)}
          {renderReadOnlyRow('Marital Status', existingData.marital_status as string)}
          {renderReadOnlyRow('Region of Origin', existingData.region_of_origin as string)}
          {existingData.hometown_visit_frequency ? renderReadOnlyRow('Hometown Visits per Block', existingData.hometown_visit_frequency as string) : null}
          {renderReadOnlyRow('Has Children', existingData.has_children ? 'Yes' : 'No')}
          {existingData.number_of_children ? renderReadOnlyRow('Number of Children', existingData.number_of_children as string) : null}
          {renderReadOnlyRow('Special Care Dependents', existingData.special_care_dependents ? 'Yes' : 'No')}
          {renderReadOnlyRow('Financial Difficulties', existingData.financial_difficulties ? 'Yes' : 'No')}
        </div>

        <div style={styles.card}>
          <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: 12, fontSize: 15 }}>
            Physical
          </div>
          {renderReadOnlyRow('Weight', `${existingData.weight_kg} kg`)}
          {renderReadOnlyRow('Height', `${existingData.height_cm} cm`)}
          {existingData.weight_kg && existingData.height_cm ? renderReadOnlyRow('BMI', (() => {
            const w = Number(existingData.weight_kg);
            const h = Number(existingData.height_cm) / 100;
            return h > 0 ? (w / (h * h)).toFixed(1) : '--';
          })()) : null}
        </div>

        <div style={styles.card}>
          <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: 12, fontSize: 15 }}>
            Training
          </div>
          {renderReadOnlyRow('Residency Level', existingData.residency_level as string)}
          {renderReadOnlyRow('Residency Program', existingData.residency_program as string)}
        </div>

        <div style={styles.card}>
          <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: 12, fontSize: 15 }}>
            Medical History
          </div>
          {renderReadOnlyRow('Chronic Conditions', Array.isArray(existingData.chronic_conditions) ? (existingData.chronic_conditions as string[]).join(', ') : '--')}
          {renderReadOnlyRow('Psychiatric Conditions', Array.isArray(existingData.psychiatric_conditions) ? (existingData.psychiatric_conditions as string[]).join(', ') : '--')}
          {renderReadOnlyRow('On Medications', existingData.on_medications ? 'Yes' : 'No')}
          {existingData.medications_list ? renderReadOnlyRow('Medications', existingData.medications_list as string) : null}
        </div>

        <div style={styles.card}>
          <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: 12, fontSize: 15 }}>
            Lifestyle
          </div>
          {renderReadOnlyRow('Exercise Days/Week', existingData.exercise_days_per_week as string)}
          {renderReadOnlyRow('Diet', Array.isArray(existingData.diet_type) ? (existingData.diet_type as string[]).join(', ') : '--')}
          {renderReadOnlyRow('Caffeine/Day', existingData.caffeine_drinks_daily as string)}
          {renderReadOnlyRow('Sleep Hours (non-call)', `${existingData.sleep_hours_non_call}h`)}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Success screen
  // -------------------------------------------------------------------------

  if (submitted) {
    return (
      <div style={styles.page}>
        <div style={styles.successContainer}>
          <div style={styles.successCheckmark}>
            <span>&#10003;</span>
          </div>
          <div style={styles.successTitle}>Enrollment Complete</div>
          <div style={styles.successText}>
            Thank you! Your demographics information has been recorded successfully.
            You can now proceed to your dashboard.
          </div>
          <button
            style={styles.dashboardBtn}
            onClick={() => {
              window.location.href = '/resident/dashboard';
            }}
          >
            Go to Dashboard &rarr;
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Step content renderers
  // -------------------------------------------------------------------------

  const progressPct = Math.round((step / TOTAL_STEPS) * 100);

  function renderStep1() {
    let questionNum = 1;
    return (
      <>
        {/* Date of Birth */}
        <div style={styles.card}>
          <label style={styles.label}>{questionNum++}. Date of Birth</label>
          <input
            type="date"
            value={form.date_of_birth}
            onChange={e => setField('date_of_birth', e.target.value)}
            style={styles.input}
            max={new Date().toISOString().slice(0, 10)}
          />
        </div>

        {/* Gender */}
        <div style={styles.card}>
          <label style={styles.label}>{questionNum++}. Gender</label>
          <div style={styles.radioRow}>
            {['Male', 'Female'].map(opt => (
              <button
                key={opt}
                type="button"
                style={styles.radioBtn(form.gender === opt)}
                onClick={() => setField('gender', opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Marital Status */}
        <div style={styles.card}>
          <label style={styles.label}>{questionNum++}. Marital Status</label>
          <div style={styles.radioRow}>
            {['Single', 'Married', 'Widowed', 'Divorced'].map(opt => (
              <button
                key={opt}
                type="button"
                style={styles.radioBtn(form.marital_status === opt)}
                onClick={() => setField('marital_status', opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Region of Origin */}
        <div style={styles.card}>
          <label style={styles.label}>{questionNum++}. Region of Origin</label>
          <select
            value={form.region_of_origin}
            onChange={e => setField('region_of_origin', e.target.value)}
            style={styles.select}
          >
            <option value="">Select region...</option>
            {REGIONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Hometown visits (conditional) */}
        {form.region_of_origin && form.region_of_origin !== 'Muscat' && (
          <div style={styles.card}>
            <label style={styles.label}>{questionNum++}. How often do you visit your hometown per 4-week block?</label>
            <input
              type="text"
              value={form.hometown_visits}
              onChange={e => setField('hometown_visits', e.target.value)}
              placeholder="e.g. 2 times"
              style={styles.input}
            />
          </div>
        )}

        {/* Has children */}
        <div style={styles.card}>
          <label style={styles.label}>{form.region_of_origin && form.region_of_origin !== 'Muscat' ? questionNum++ : questionNum++}. Do you have children?</label>
          <div style={styles.radioRow}>
            {['Yes', 'No'].map(opt => (
              <button
                key={opt}
                type="button"
                style={styles.radioBtn(form.has_children === opt)}
                onClick={() => setField('has_children', opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Number of children (conditional) */}
        {form.has_children === 'Yes' && (
          <div style={styles.card}>
            <label style={styles.label}>{questionNum++}. How many children?</label>
            <div style={styles.radioRow}>
              {['1', '2', '3 or more'].map(opt => (
                <button
                  key={opt}
                  type="button"
                  style={styles.radioBtn(form.num_children === opt)}
                  onClick={() => setField('num_children', opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Special care dependents */}
        <div style={styles.card}>
          <label style={styles.label}>{questionNum++}. Do you have children or family members requiring special care?</label>
          <div style={styles.radioRow}>
            {['Yes', 'No'].map(opt => (
              <button
                key={opt}
                type="button"
                style={styles.radioBtn(form.special_care_dependents === opt)}
                onClick={() => setField('special_care_dependents', opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Financial difficulties */}
        <div style={styles.card}>
          <label style={styles.label}>{questionNum}. Do you perceive any financial difficulties?</label>
          <div style={styles.radioRow}>
            {['Yes', 'No'].map(opt => (
              <button
                key={opt}
                type="button"
                style={styles.radioBtn(form.financial_difficulties === opt)}
                onClick={() => setField('financial_difficulties', opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  function renderStep2() {
    return (
      <>
        {/* Weight */}
        <div style={styles.card}>
          <label style={styles.label}>1. Weight (kg)</label>
          <input
            type="number"
            value={form.weight_kg}
            onChange={e => setField('weight_kg', e.target.value)}
            placeholder="e.g. 70"
            min={30}
            max={300}
            style={styles.input}
          />
        </div>

        {/* Height */}
        <div style={styles.card}>
          <label style={styles.label}>2. Height (cm)</label>
          <input
            type="number"
            value={form.height_cm}
            onChange={e => setField('height_cm', e.target.value)}
            placeholder="e.g. 170"
            min={100}
            max={250}
            style={styles.input}
          />
        </div>

        {/* BMI */}
        <div style={styles.card}>
          <label style={styles.label}>3. BMI (auto-calculated)</label>
          <div style={styles.bmiDisplay}>
            {bmi ? (
              <>
                {bmi}
                <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>
                  kg/m&sup2;
                  {parseFloat(bmi) < 18.5 && ' -- Underweight'}
                  {parseFloat(bmi) >= 18.5 && parseFloat(bmi) < 25 && ' -- Normal'}
                  {parseFloat(bmi) >= 25 && parseFloat(bmi) < 30 && ' -- Overweight'}
                  {parseFloat(bmi) >= 30 && ' -- Obese'}
                </span>
              </>
            ) : (
              <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                Enter weight and height above
              </span>
            )}
          </div>
        </div>
      </>
    );
  }

  function renderStep3() {
    return (
      <>
        {/* Residency Level */}
        <div style={styles.card}>
          <label style={styles.label}>1. Current residency level</label>
          <div style={styles.radioRow}>
            {['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'GFP'].map(opt => (
              <button
                key={opt}
                type="button"
                style={styles.radioBtn(form.residency_level === opt)}
                onClick={() => setField('residency_level', opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Residency Program */}
        <div style={styles.card}>
          <label style={styles.label}>2. Residency program</label>
          <select
            value={form.residency_program}
            onChange={e => setField('residency_program', e.target.value)}
            style={styles.select}
          >
            <option value="">Select program...</option>
            {RESIDENCY_PROGRAMS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </>
    );
  }

  function renderStep4() {
    let questionNum = 1;
    return (
      <>
        {/* Chronic Conditions */}
        <div style={styles.card}>
          <label style={styles.label}>{questionNum++}. Chronic medical conditions (select all that apply)</label>
          <div style={styles.checkboxRow}>
            {CHRONIC_CONDITIONS.map(opt => (
              <button
                key={opt}
                type="button"
                style={styles.checkboxBtn(form.chronic_conditions.includes(opt))}
                onClick={() => toggleCheckbox('chronic_conditions', opt)}
              >
                {form.chronic_conditions.includes(opt) && <span>&#10003;</span>}
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Psychiatric Conditions */}
        <div style={styles.card}>
          <label style={styles.label}>{questionNum++}. Psychiatric conditions (select all that apply)</label>
          <div style={styles.checkboxRow}>
            {PSYCHIATRIC_CONDITIONS.map(opt => (
              <button
                key={opt}
                type="button"
                style={styles.checkboxBtn(form.psychiatric_conditions.includes(opt))}
                onClick={() => toggleCheckbox('psychiatric_conditions', opt)}
              >
                {form.psychiatric_conditions.includes(opt) && <span>&#10003;</span>}
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* On Medications */}
        <div style={styles.card}>
          <label style={styles.label}>{questionNum++}. Currently on medications?</label>
          <div style={styles.radioRow}>
            {['Yes', 'No'].map(opt => (
              <button
                key={opt}
                type="button"
                style={styles.radioBtn(form.on_medications === opt)}
                onClick={() => setField('on_medications', opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Medications List (conditional) */}
        {form.on_medications === 'Yes' && (
          <div style={styles.card}>
            <label style={styles.label}>{questionNum}. Please list your current medications</label>
            <textarea
              value={form.medications_list}
              onChange={e => setField('medications_list', e.target.value)}
              placeholder="List each medication..."
              style={styles.textarea}
            />
          </div>
        )}
      </>
    );
  }

  function renderStep5() {
    return (
      <>
        {/* Exercise */}
        <div style={styles.card}>
          <label style={styles.label}>1. Days per week of 30+ min moderate-to-vigorous exercise</label>
          <div style={styles.radioRow}>
            {['0', '1-2', '3-4', '5+'].map(opt => (
              <button
                key={opt}
                type="button"
                style={styles.radioBtn(form.exercise_days === opt)}
                onClick={() => setField('exercise_days', opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Diet */}
        <div style={styles.card}>
          <label style={styles.label}>2. Diet type (select all that apply)</label>
          <div style={styles.checkboxRow}>
            {DIET_TYPES.map(opt => (
              <button
                key={opt}
                type="button"
                style={styles.checkboxBtn(form.diet_types.includes(opt))}
                onClick={() => toggleCheckbox('diet_types', opt)}
              >
                {form.diet_types.includes(opt) && <span>&#10003;</span>}
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Caffeine */}
        <div style={styles.card}>
          <label style={styles.label}>3. Caffeinated drinks per day</label>
          <div style={styles.radioRow}>
            {['0', '1', '2', '3', '4', '5', '6', '7+'].map(opt => (
              <button
                key={opt}
                type="button"
                style={styles.radioBtn(form.caffeine_per_day === opt)}
                onClick={() => setField('caffeine_per_day', opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Sleep */}
        <div style={styles.card}>
          <label style={styles.label}>4. Average hours of sleep on non-call nights</label>
          <input
            type="number"
            value={form.sleep_hours}
            onChange={e => setField('sleep_hours', e.target.value)}
            placeholder="e.g. 7"
            min={0}
            max={16}
            step={0.5}
            style={styles.input}
          />
        </div>
      </>
    );
  }

  const stepRenderers = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5];

  // -------------------------------------------------------------------------
  // Main wizard render
  // -------------------------------------------------------------------------

  return (
    <div style={styles.page}>
      {/* Step indicator dots */}
      <div style={styles.dotsRow}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const s = i + 1;
          const state = s < step ? 'done' : s === step ? 'active' : 'upcoming';
          return <div key={s} style={styles.dot(state)} />;
        })}
      </div>

      {/* Progress bar */}
      <div style={styles.progressBar}>
        <div style={styles.progressFill(progressPct)} />
      </div>
      <div style={styles.progressText}>
        Step {step} of {TOTAL_STEPS}
      </div>

      {/* Header */}
      <h1 style={styles.heading}>Enrollment Form</h1>
      <p style={styles.description}>
        Please complete all sections. This information is collected once during enrollment for research purposes.
      </p>

      {/* Step title */}
      <div style={styles.stepTitle}>
        {STEP_LABELS[step - 1]}
      </div>

      {/* Error */}
      {error && (
        <div style={styles.alert('warning')}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Step content */}
      <div style={{ animation: 'fadeIn 0.3s ease' }}>
        {stepRenderers[step - 1]()}
      </div>

      {/* Validation message */}
      {validationError && (
        <div style={styles.validationMsg}>
          {validationError}
        </div>
      )}

      {/* Navigation buttons */}
      <div style={styles.navRow}>
        {step > 1 && (
          <button
            type="button"
            style={styles.navBtn('back')}
            onClick={handleBack}
          >
            &larr; Back
          </button>
        )}

        {step < TOTAL_STEPS ? (
          <button
            type="button"
            style={styles.navBtn('next')}
            onClick={handleNext}
          >
            Next &rarr;
          </button>
        ) : (
          <button
            type="button"
            style={styles.navBtn('submit', submitting)}
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        )}
      </div>
    </div>
  );
}
