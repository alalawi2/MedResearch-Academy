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

const SECTION_LABELS = [
  'Personal Information',
  'Physical',
  'Training',
  'Medical History',
  'Lifestyle',
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

  sectionHeader: {
    fontSize: 15,
    fontWeight: 600 as const,
    color: 'var(--primary)',
    borderBottom: '2px solid var(--primary)',
    paddingBottom: 6,
    marginTop: 28,
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    userSelect: 'none' as const,
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
    padding: '8px 14px',
    borderRadius: 8,
    border: selected ? '2px solid var(--primary)' : '2px solid var(--border)',
    background: selected ? 'var(--primary)' : 'white',
    color: selected ? 'white' : 'var(--text)',
    fontSize: 13,
    fontWeight: selected ? 600 : 400,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    flex: '0 1 auto',
    textAlign: 'center' as const,
  }) as React.CSSProperties,

  checkboxRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 8,
  } as React.CSSProperties,

  checkboxBtn: (selected: boolean) => ({
    minHeight: 44,
    padding: '8px 14px',
    borderRadius: 8,
    border: selected ? '2px solid var(--primary)' : '2px solid var(--border)',
    background: selected ? 'var(--primary)' : 'white',
    color: selected ? 'white' : 'var(--text)',
    fontSize: 13,
    fontWeight: selected ? 600 : 400,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textAlign: 'center' as const,
  }) as React.CSSProperties,

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

  loading: {
    textAlign: 'center' as const,
    padding: '48px 24px',
    color: 'var(--text-muted)',
    fontSize: 14,
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
  const [collapsedSections, setCollapsedSections] = useState<Record<number, boolean>>({});
  const [currentSection, setCurrentSection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  }

  function toggleCheckbox(key: 'chronic_conditions' | 'psychiatric_conditions' | 'diet_types', value: string) {
    setForm(prev => {
      const arr = prev[key];
      // Handle "None" / "No specific diet" logic
      const noneValue = key === 'diet_types' ? 'No specific diet' : 'None';
      if (value === noneValue) {
        return { ...prev, [key]: arr.includes(noneValue) ? [] : [noneValue] };
      }
      // If selecting something else, remove "None"
      const filtered = arr.filter(v => v !== noneValue);
      if (filtered.includes(value)) {
        return { ...prev, [key]: filtered.filter(v => v !== value) };
      }
      return { ...prev, [key]: [...filtered, value] };
    });
  }

  function toggleSection(idx: number) {
    setCollapsedSections(prev => ({ ...prev, [idx]: !prev[idx] }));
  }

  // Validation
  const isFormValid = useMemo(() => {
    if (!form.date_of_birth || !form.gender || !form.marital_status || !form.region_of_origin) return false;
    if (form.region_of_origin !== 'Muscat' && !form.hometown_visits) return false;
    if (!form.has_children) return false;
    if (form.has_children === 'Yes' && !form.num_children) return false;
    if (!form.special_care_dependents || !form.financial_difficulties) return false;
    if (!form.weight_kg || !form.height_cm) return false;
    if (!form.residency_level || !form.residency_program) return false;
    if (form.chronic_conditions.length === 0) return false;
    if (form.psychiatric_conditions.length === 0) return false;
    if (!form.on_medications) return false;
    if (form.on_medications === 'Yes' && !form.medications_list.trim()) return false;
    if (!form.exercise_days) return false;
    if (form.diet_types.length === 0) return false;
    if (!form.caffeine_per_day) return false;
    if (!form.sleep_hours) return false;
    return true;
  }, [form]);

  // Submit
  async function handleSubmit() {
    if (!residentProfile || !isFormValid) return;

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
  // Already completed — read-only summary
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
          {existingData.hometown_visits ? renderReadOnlyRow('Hometown Visits per Block', existingData.hometown_visits as string) : null}
          {renderReadOnlyRow('Has Children', existingData.has_children ? 'Yes' : 'No')}
          {existingData.num_children ? renderReadOnlyRow('Number of Children', existingData.num_children as string) : null}
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
          {renderReadOnlyRow('Exercise Days/Week', existingData.exercise_days as string)}
          {renderReadOnlyRow('Diet', Array.isArray(existingData.diet_types) ? (existingData.diet_types as string[]).join(', ') : '--')}
          {renderReadOnlyRow('Caffeine/Day', existingData.caffeine_per_day as string)}
          {renderReadOnlyRow('Sleep Hours (non-call)', `${existingData.sleep_hours}h`)}
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
        <button style={styles.backBtn} onClick={() => navigate('/resident/dashboard')}>
          &larr; Back to Dashboard
        </button>
        <h1 style={styles.heading}>Enrollment Complete</h1>
        <div style={styles.alert('success')}>
          <strong>Thank you!</strong> Your demographics information has been recorded successfully.
          You can now proceed to your dashboard.
        </div>
        <button
          style={styles.submitBtn(false)}
          onClick={() => {
            // Force reload to update residentProfile with demographics_completed
            window.location.href = '/resident/dashboard';
          }}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Section renderers
  // -------------------------------------------------------------------------

  function renderSectionHeader(index: number, label: string) {
    const collapsed = collapsedSections[index] ?? false;
    return (
      <div
        style={styles.sectionHeader}
        onClick={() => toggleSection(index)}
      >
        <span>Section {index + 1}: {label}</span>
        <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>
          {collapsed ? '+ Expand' : '- Collapse'}
        </span>
      </div>
    );
  }

  function renderReadOnlyRow(label: string, value: string) {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
        <span style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontWeight: 500, textAlign: 'right' as const, maxWidth: '60%' }}>{value || '--'}</span>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Main form render
  // -------------------------------------------------------------------------

  const totalSections = 5;
  const sectionPct = Math.round((currentSection / totalSections) * 100);

  return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => navigate('/resident/dashboard')}>
        &larr; Back to Dashboard
      </button>

      {/* Progress */}
      <div style={styles.progressBar}>
        <div style={styles.progressFill(sectionPct)} />
      </div>
      <div style={styles.progressText}>
        Section {currentSection} of {totalSections}
      </div>

      {/* Header */}
      <h1 style={styles.heading}>Enrollment Form</h1>
      <p style={styles.description}>
        Please complete all sections below. This information is collected once during enrollment for research purposes.
      </p>

      {/* Error */}
      {error && (
        <div style={styles.alert('warning')}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ---- Section 1: Personal Information ---- */}
      {renderSectionHeader(0, SECTION_LABELS[0])}
      {!(collapsedSections[0] ?? false) && (
        <div onFocus={() => setCurrentSection(1)}>
          {/* Date of Birth */}
          <div style={styles.card}>
            <label style={styles.label}>1. Date of Birth</label>
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
            <label style={styles.label}>2. Gender</label>
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
            <label style={styles.label}>3. Marital Status</label>
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
            <label style={styles.label}>4. Region of Origin</label>
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
              <label style={styles.label}>5. How often do you visit your hometown per 4-week block?</label>
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
            <label style={styles.label}>6. Do you have children?</label>
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
              <label style={styles.label}>7. How many children?</label>
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
            <label style={styles.label}>8. Do you have children or family members requiring special care?</label>
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
            <label style={styles.label}>9. Do you perceive any financial difficulties?</label>
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
        </div>
      )}

      {/* ---- Section 2: Physical ---- */}
      {renderSectionHeader(1, SECTION_LABELS[1])}
      {!(collapsedSections[1] ?? false) && (
        <div onFocus={() => setCurrentSection(2)}>
          {/* Weight */}
          <div style={styles.card}>
            <label style={styles.label}>10. Weight (kg)</label>
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
            <label style={styles.label}>11. Height (cm)</label>
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
            <label style={styles.label}>12. BMI (auto-calculated)</label>
            <div style={styles.bmiDisplay}>
              {bmi ? (
                <>
                  {bmi}
                  <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>
                    kg/m&sup2;
                    {parseFloat(bmi) < 18.5 && ' — Underweight'}
                    {parseFloat(bmi) >= 18.5 && parseFloat(bmi) < 25 && ' — Normal'}
                    {parseFloat(bmi) >= 25 && parseFloat(bmi) < 30 && ' — Overweight'}
                    {parseFloat(bmi) >= 30 && ' — Obese'}
                  </span>
                </>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                  Enter weight and height above
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---- Section 3: Training ---- */}
      {renderSectionHeader(2, SECTION_LABELS[2])}
      {!(collapsedSections[2] ?? false) && (
        <div onFocus={() => setCurrentSection(3)}>
          {/* Residency Level */}
          <div style={styles.card}>
            <label style={styles.label}>13. Current residency level</label>
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
            <label style={styles.label}>14. Residency program</label>
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
        </div>
      )}

      {/* ---- Section 4: Medical History ---- */}
      {renderSectionHeader(3, SECTION_LABELS[3])}
      {!(collapsedSections[3] ?? false) && (
        <div onFocus={() => setCurrentSection(4)}>
          {/* Chronic Conditions */}
          <div style={styles.card}>
            <label style={styles.label}>15. Chronic medical conditions (select all that apply)</label>
            <div style={styles.checkboxRow}>
              {CHRONIC_CONDITIONS.map(opt => (
                <button
                  key={opt}
                  type="button"
                  style={styles.checkboxBtn(form.chronic_conditions.includes(opt))}
                  onClick={() => toggleCheckbox('chronic_conditions', opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Psychiatric Conditions */}
          <div style={styles.card}>
            <label style={styles.label}>16. Psychiatric conditions (select all that apply)</label>
            <div style={styles.checkboxRow}>
              {PSYCHIATRIC_CONDITIONS.map(opt => (
                <button
                  key={opt}
                  type="button"
                  style={styles.checkboxBtn(form.psychiatric_conditions.includes(opt))}
                  onClick={() => toggleCheckbox('psychiatric_conditions', opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* On Medications */}
          <div style={styles.card}>
            <label style={styles.label}>17. Currently on medications?</label>
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
              <label style={styles.label}>18. Please list your current medications</label>
              <textarea
                value={form.medications_list}
                onChange={e => setField('medications_list', e.target.value)}
                placeholder="List each medication..."
                style={styles.textarea}
              />
            </div>
          )}
        </div>
      )}

      {/* ---- Section 5: Lifestyle ---- */}
      {renderSectionHeader(4, SECTION_LABELS[4])}
      {!(collapsedSections[4] ?? false) && (
        <div onFocus={() => setCurrentSection(5)}>
          {/* Exercise */}
          <div style={styles.card}>
            <label style={styles.label}>19. Days per week of 30+ min moderate-to-vigorous exercise</label>
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
            <label style={styles.label}>20. Diet type (select all that apply)</label>
            <div style={styles.checkboxRow}>
              {DIET_TYPES.map(opt => (
                <button
                  key={opt}
                  type="button"
                  style={styles.checkboxBtn(form.diet_types.includes(opt))}
                  onClick={() => toggleCheckbox('diet_types', opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Caffeine */}
          <div style={styles.card}>
            <label style={styles.label}>21. Caffeinated drinks per day</label>
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
            <label style={styles.label}>22. Average hours of sleep on non-call nights</label>
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
        </div>
      )}

      {/* Submit */}
      <button
        style={styles.submitBtn(!isFormValid || submitting)}
        disabled={!isFormValid || submitting}
        onClick={handleSubmit}
      >
        {submitting ? 'Submitting...' : 'Submit Enrollment Form'}
      </button>

      {!isFormValid && (
        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
          Please complete all required fields to submit.
        </div>
      )}
    </div>
  );
}
