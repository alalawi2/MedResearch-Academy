import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Export de-identified study data as JSON for statistician
// Access: service role key or cron secret only (PI access)

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const CRON_SECRET = process.env.CRON_SECRET || SUPABASE_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers['authorization']?.replace('Bearer ', '') || req.headers['x-api-key'];
  if (authHeader !== CRON_SECRET && authHeader !== SUPABASE_KEY) {
    return res.status(401).json({ error: 'Unauthorized — PI access only' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const format = (req.query.format as string) || 'json';

  // 1. Participants (de-identified: no names, no emails, no phone)
  const { data: parts } = await supabase
    .from('burnout_participants')
    .select('study_participant_id, gender, residency_level, residency_program, marital_status, has_children, number_of_children, region_of_origin, exercise_days_per_week, caffeine_drinks_daily, sleep_hours_non_call, weight_kg, height_cm, chronic_conditions, psychiatric_conditions, on_medications, financial_difficulties, special_care_dependents, enrollment_date, demographics_completed, baseline_completed')
    .eq('status', 'active')
    .neq('study_participant_id', 'RES-TEST')
    .order('study_participant_id')
    .limit(200);

  // 2. CBI
  const { data: cbi } = await supabase
    .from('cbi_responses')
    .select('resident_id, response_date, personal_score, work_score, patient_score, personal_burnout, work_burnout, patient_burnout, any_burnout')
    .limit(500);

  // 3. PHQ-9
  const { data: phq } = await supabase
    .from('phq9_responses')
    .select('resident_id, response_date, total_score, severity, items')
    .limit(500);

  // 4. GAD-7
  const { data: gad } = await supabase
    .from('gad7_responses')
    .select('resident_id, response_date, total_score, severity, items')
    .limit(500);

  // 5. Block assessments
  const { data: assessments } = await supabase
    .from('block_assessments')
    .select('resident_id, assessment_date, block_number, rotation_name, clinical_intensity, calls_count, call_types, rotation_types, weekly_hours, major_life_event, annual_leave, sick_leave, who5_total, who5_percent, cbi_personal_score, cbi_work_score, cbi_patient_score, cbi_any_burnout, phq9_total, phq9_severity, gad7_total, gad7_severity, isi_total, isi_severity')
    .limit(1000);

  // 6. WHOOP aggregated
  const { data: whoop } = await supabase
    .from('whoop_pulls')
    .select('resident_id, period_start, period_end, avg_hrv_rmssd_ms, avg_resting_hr_bpm, avg_spo2_pct, avg_skin_temp_c, avg_recovery_score, avg_total_sleep_min, avg_light_sleep_min, avg_deep_sleep_min, avg_rem_sleep_min, avg_sleep_efficiency_pct, avg_sleep_consistency_pct, avg_sleep_performance_pct, avg_sleep_debt_min, avg_respiratory_rate_bpm, avg_disturbance_count, avg_awake_time_min, avg_restorative_sleep_min, avg_daily_strain, avg_hr_bpm, max_hr_bpm, avg_kilojoules, avg_workout_strain, workout_count, avg_sleep_onset_min, avg_wake_time_min, nap_count, days_with_data, pct_recorded, whoop_height_m, whoop_weight_kg, whoop_max_hr, pulled_at')
    .order('pulled_at', { ascending: false })
    .limit(2000);

  // 7. WHOOP daily
  const { data: daily } = await supabase
    .from('whoop_daily')
    .select('resident_id, date, hrv_rmssd_ms, resting_hr_bpm, spo2_pct, skin_temp_c, recovery_score, total_sleep_min, light_sleep_min, deep_sleep_min, rem_sleep_min, awake_min, sleep_efficiency_pct, respiratory_rate, disturbance_count, sleep_cycle_count, daily_strain, avg_hr_bpm, max_hr_bpm, kilojoules, sleep_debt_min, is_nap')
    .order('date')
    .limit(10000);

  // 8. Weekly checkins
  const { data: checkins } = await supabase
    .from('weekly_checkins')
    .select('resident_id, week_start, hours_worked, on_call_count, call_type, call_busyness, sleep_rating, stress_level')
    .limit(500);

  // Map resident_id → study_participant_id for de-identification
  const { data: idMap } = await supabase
    .from('burnout_participants')
    .select('id, study_participant_id')
    .eq('status', 'active')
    .limit(200);

  const pidMap = new Map<string, string>();
  idMap?.forEach((p: any) => pidMap.set(p.id, p.study_participant_id));

  const deId = (rows: any[] | null) =>
    (rows || []).map((r: any) => {
      const out = { ...r };
      if (out.resident_id) {
        out.participant_id = pidMap.get(out.resident_id) || 'UNKNOWN';
        delete out.resident_id;
      }
      return out;
    });

  const dataset = {
    exported_at: new Date().toISOString(),
    study: 'OMSB Resident Burnout Study',
    mrec: 'MREC# 3190 | SQU-EC/297-2023',
    note: 'De-identified dataset. No names, emails, or phone numbers included.',
    participants: parts,
    cbi_responses: deId(cbi),
    phq9_responses: deId(phq),
    gad7_responses: deId(gad),
    block_assessments: deId(assessments),
    whoop_aggregated: deId(whoop),
    whoop_daily: deId(daily),
    weekly_checkins: deId(checkins),
    counts: {
      participants: parts?.length || 0,
      cbi: cbi?.length || 0,
      phq9: phq?.length || 0,
      gad7: gad?.length || 0,
      block_assessments: assessments?.length || 0,
      whoop_aggregated: whoop?.length || 0,
      whoop_daily: daily?.length || 0,
      weekly_checkins: checkins?.length || 0,
    },
  };

  if (format === 'csv') {
    // Return just participants as CSV for quick use
    const headers = Object.keys(parts?.[0] || {}).join(',');
    const rows = (parts || []).map((p: any) => Object.values(p).map(v => JSON.stringify(v ?? '')).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="burnout_study_participants.csv"');
    return res.send(headers + '\n' + rows);
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="burnout_study_dataset.json"');
  return res.json(dataset);
}
