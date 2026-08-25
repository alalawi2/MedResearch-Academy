// Thalassemia Study — shared types + Supabase helpers
// Study slug: 'thalassemia-cardiac'  ·  MREC #3938
import { supabase } from './supabase';

export const THAL_STUDY_SLUG = 'thalassemia-cardiac';

export type Timepoint = 'baseline' | '6mo' | '12mo' | 'unscheduled';
export type VisitStatus = 'scheduled' | 'window_open' | 'overdue' | 'complete' | 'missed';
export type Diagnosis = 'major' | 'intermedia';
export type AeSeverity = 'mild' | 'moderate' | 'severe' | 'life_threatening' | 'fatal';

export interface ThalPatient {
  id: string;
  study_id: string;
  patient_code: string;
  enrollment_date: string | null;
  age_at_enrollment: number | null;
  sex: 0 | 1 | null;
  bmi: number | null;
  diagnosis: Diagnosis | null;
  age_at_diagnosis: number | null;
  transfusion_frequency: string | null;
  chelation_therapy: string | null;
  splenectomy: boolean;
  heart_failure: boolean;
  af: boolean;
  vt: boolean;
  pacs: boolean;
  pvcs: boolean;
  pericarditis: boolean;
  myocarditis: boolean;
  pulmonary_hypertension: boolean;
  dm: boolean;
  liver_disease: boolean;
  stroke: boolean;
  hypothyroidism: boolean;
  kidney_disease: boolean;
  splenectomy_done: boolean;
  notes: string | null;
  status: string;
  entered_at: string;
  updated_at: string;
}

export interface ThalIdentifiers {
  patient_id: string;
  study_id: string;
  mrn: string;
  full_name: string;
  contact_phone: string | null;
  contact_email: string | null;
}

// Row shape from view `thalassemia_visit_schedule_v` — `computed_status`
// is derived at read time from window vs current_date (Codex fix).
export interface VisitScheduleRow {
  id: string;
  patient_id: string;
  timepoint: Timepoint;
  expected_date: string;
  window_start: string;
  window_end: string;
  actual_date: string | null;
  computed_status: VisitStatus;
  notes: string | null;
}

export interface LabRow {
  id: string;
  patient_id: string;
  assessment_date: string;
  timepoint: Timepoint;
  hemoglobin: number | null;
  ferritin: number | null;
  labile_plasma_iron: number | null;
  mmp_2: number | null;
  mmp_9: number | null;
  timp_1: number | null;
  galectin_3: number | null;
  troponin: number | null;
  bnp: number | null;
  creatinine: number | null;
  growth_hormone: number | null;
  pth: number | null;
  calcium: number | null;
  ast: number | null;
  alt: number | null;
  alp: number | null;
  tsh: number | null;
  t4_t3: string | null;
  fsh_lh: string | null;
  crp: number | null;
  notes: string | null;
}

export interface EcgRow {
  id: string;
  patient_id: string;
  assessment_date: string;
  timepoint: Timepoint;
  rate: number | null;
  rhythm: string | null;
  pr_ms: number | null;
  qrs_ms: number | null;
  qtc_ms: number | null;
  qrs_axis: string | null;
  qrs_morphology: string | null;
  rvh: boolean;
  lvh: boolean;
  t_wave_abnormality: string | null;
  other_findings: string | null;
}

export interface EchoRow {
  id: string;
  patient_id: string;
  assessment_date: string;
  timepoint: Timepoint;
  lvef: number | null;
  lvidd_mm: number | null;
  lvids_mm: number | null;
  lvpwd_mm: number | null;
  ivsd_mm: number | null;
  lv_mass_index: number | null;
  rwt: number | null;
  lvedv_ml: number | null;
  lvedv_index: number | null;
  lvesv_ml: number | null;
  sv_ml: number | null;
  co_l_min: number | null;
  gls_pct: number | null;
  lavi_ml_m2: number | null;
  la_reservoir_strain_pct: number | null;
  e_e_avg: number | null;
  medial_e_velocity: number | null;
  lateral_e_velocity: number | null;
  pulmonary_vein_sd_ratio: number | null;
  rvsp_mmhg: number | null;
  tapse_mm: number | null;
  tdi_s_cm_s: number | null;
  fac_pct: number | null;
  rv_gls_pct: number | null;
  notes: string | null;
}

export interface T2mriRow {
  id: string;
  patient_id: string;
  assessment_date: string;
  timepoint: Timepoint;
  cardiac_t2_star_ms: number | null;
  liver_t2_star_ms: number | null;
  interpretation: string | null;
  notes: string | null;
}

export interface PolysomnographyRow {
  id: string;
  patient_id: string;
  study_date: string;
  tst_minutes: number | null;
  ahi: number | null;
  sleep_efficiency_pct: number | null;
  supine_ahi: number | null;
  non_supine_ahi: number | null;
  obstructive_apnea_index: number | null;
  central_apnea_index: number | null;
  mixed_apnea_index: number | null;
  total_apnea_index: number | null;
  hypopnea_index: number | null;
  average_spo2: number | null;
  odi: number | null;
  average_hr: number | null;
  osa_diagnosis: boolean | null;
  osa_severity: string | null;
  notes: string | null;
}

export interface ScgRow {
  id: string;
  patient_id: string;
  assessment_date: string;
  timepoint: Timepoint;
  ejection_fraction_pct: number | null;
  cardiac_output_l_min: number | null;
  stroke_volume_ml: number | null;
  ao_valve_findings: string | null;
  mv_findings: string | null;
  device_id: string | null;
  ai_model_version: string | null;
  ai_confidence_score: number | null;
  notes: string | null;
}

export interface TransfusionRow {
  id: string;
  patient_id: string;
  transfusion_date: string;
  volume_ml: number | null;
  pre_transfusion_hb: number | null;
  chelation_at_visit: string | null;
  notes: string | null;
}

export interface AdverseEventRow {
  id: string;
  patient_id: string;
  event_date: string;
  description: string;
  severity: AeSeverity;
  relatedness: string | null;
  serious: boolean;
  procedure_related: string | null;
  action_taken: string | null;
  outcome: string | null;
  resolved_date: string | null;
  reported_to_mrec: boolean;
  reported_date: string | null;
}

// Investigations required by protocol at each timepoint
export const REQUIRED_INVESTIGATIONS = {
  baseline: ['demographics', 'lab', 'ecg', 'echo', 't2mri', 'polysomnography', 'scg'],
  '6mo':    ['lab'],
  '12mo':   ['lab', 'ecg', 'echo', 't2mri'],
} as const;

export const INVESTIGATION_LABEL: Record<string, string> = {
  demographics:     'Demographics + history',
  lab:              'Labs (MMPs, Ferritin, LPI, NT-proBNP)',
  ecg:              'ECG',
  echo:             'Echocardiogram',
  t2mri:            'Cardiac T2* MRI',
  polysomnography:  'Polysomnography (OSA)',
  scg:              'Seismocardiography (SCG)',
};

// ── Queries ─────────────────────────────────────────────────────────────────

export async function fetchStudyId(): Promise<string | null> {
  const { data } = await supabase.from('studies').select('id').eq('slug', THAL_STUDY_SLUG).maybeSingle();
  return data?.id ?? null;
}

export async function fetchPatients() {
  const { data, error } = await supabase
    .from('thalassemia_patients')
    .select('*')
    .order('patient_code', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ThalPatient[];
}

export async function fetchPatient(id: string) {
  const { data, error } = await supabase.from('thalassemia_patients').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as ThalPatient | null;
}

export async function fetchIdentifiers(patientId: string) {
  const { data } = await supabase
    .from('thalassemia_patient_identifiers')
    .select('*')
    .eq('patient_id', patientId)
    .maybeSingle();
  return data as ThalIdentifiers | null;
}

export async function fetchVisitSchedule(patientId: string) {
  // Query the view — status is computed at read time, always fresh.
  const { data, error } = await supabase
    .from('thalassemia_visit_schedule_v')
    .select('*')
    .eq('patient_id', patientId)
    .order('expected_date');
  if (error) throw error;
  return (data ?? []) as VisitScheduleRow[];
}

export async function fetchBaselineStatus(patientIds?: string[]) {
  let q = supabase.from('thalassemia_baseline_status_v').select('*');
  if (patientIds && patientIds.length > 0) q = q.in('patient_id', patientIds);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as { patient_id: string; baseline_complete: boolean }[];
}

export async function fetchModalityRows<T>(
  table: string,
  patientId: string,
  dateCol = 'assessment_date',
): Promise<T[]> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('patient_id', patientId)
    .order(dateCol, { ascending: false });
  if (error) throw error;
  return (data ?? []) as T[];
}

// Compute checklist: has this patient done investigation X at timepoint Y?
export interface ChecklistCell {
  timepoint: Timepoint;
  investigation: string;
  required: boolean;
  done: boolean;
  date: string | null;
  overdue: boolean;
}

export function buildChecklist(
  patient: ThalPatient,
  visits: VisitScheduleRow[],
  rows: {
    lab: LabRow[]; ecg: EcgRow[]; echo: EchoRow[]; t2mri: T2mriRow[];
    polysomnography: PolysomnographyRow[]; scg: ScgRow[];
  },
): ChecklistCell[] {
  const cells: ChecklistCell[] = [];
  const today = new Date().toISOString().slice(0, 10);

  const timepoints = ['baseline', '6mo', '12mo'] as const;
  for (const tp of timepoints) {
    const required = REQUIRED_INVESTIGATIONS[tp] as readonly string[];
    const visit = visits.find(v => v.timepoint === tp);
    // Use view's computed_status when available; fall back to date math.
    const overdueTp = visit?.computed_status === 'overdue'
      || (visit?.window_end != null && today > visit.window_end && !visit.actual_date);

    for (const inv of required) {
      let done = false;
      let date: string | null = null;

      if (inv === 'demographics') {
        done = tp === 'baseline' && !!patient.enrollment_date;
        date = patient.enrollment_date;
      } else if (inv === 'polysomnography') {
        done = rows.polysomnography.length > 0;
        date = rows.polysomnography[0]?.study_date ?? null;
      } else {
        const arr = (rows as any)[inv] as { timepoint: Timepoint; assessment_date: string }[];
        const match = arr.find(r => r.timepoint === tp);
        done = !!match;
        date = match?.assessment_date ?? null;
      }

      cells.push({
        timepoint: tp,
        investigation: inv,
        required: true,
        done,
        date,
        overdue: !done && overdueTp,
      });
    }
  }
  return cells;
}

// Generate default visit schedule based on enrollment date
export function generateVisitSchedule(enrollmentDate: string) {
  const enroll = new Date(enrollmentDate);
  const addDays = (d: Date, days: number) => {
    const c = new Date(d); c.setDate(c.getDate() + days); return c.toISOString().slice(0, 10);
  };
  // Codex fix: clamp to end-of-month. Native setMonth rolls Aug-31 + 6mo into
  // Mar 3, not end-of-Feb. Clamp the day to the last valid day of the target
  // month so month-end enrollments produce clinically sensible visit dates.
  const addMonths = (d: Date, months: number) => {
    const originalDay = d.getDate();
    const targetYear = d.getFullYear();
    const targetMonth = d.getMonth() + months;
    const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const day = Math.min(originalDay, lastDayOfTargetMonth);
    return new Date(targetYear, targetMonth, day);
  };
  const rows: { timepoint: Timepoint; expected_date: string; window_start: string; window_end: string }[] = [];
  const gracePost = 30;
  const gracePre = 14;
  rows.push({
    timepoint: 'baseline',
    expected_date: enrollmentDate,
    window_start: enrollmentDate,
    window_end: addDays(enroll, 14),
  });
  const m6 = addMonths(enroll, 6);
  rows.push({
    timepoint: '6mo',
    expected_date: m6.toISOString().slice(0, 10),
    window_start: addDays(m6, -gracePre),
    window_end: addDays(m6, gracePost),
  });
  const m12 = addMonths(enroll, 12);
  rows.push({
    timepoint: '12mo',
    expected_date: m12.toISOString().slice(0, 10),
    window_start: addDays(m12, -gracePre),
    window_end: addDays(m12, gracePost),
  });
  return rows;
}
