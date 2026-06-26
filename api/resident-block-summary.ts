import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// End-of-block personal summary email to each resident
// Shows their scores vs cohort average (anonymized) + support resources
// Schedule: runs when triggered (after block assessment window closes)

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const CRON_SECRET = process.env.CRON_SECRET || SUPABASE_KEY;

function severityLabel(instrument: string, score: number): { label: string; color: string; concern: boolean } {
  if (instrument === 'phq9') {
    if (score >= 20) return { label: 'Severe', color: '#dc2626', concern: true };
    if (score >= 15) return { label: 'Moderately Severe', color: '#ea580c', concern: true };
    if (score >= 10) return { label: 'Moderate', color: '#d97706', concern: true };
    if (score >= 5) return { label: 'Mild', color: '#ca8a04', concern: false };
    return { label: 'Minimal', color: '#16a34a', concern: false };
  }
  if (instrument === 'gad7') {
    if (score >= 15) return { label: 'Severe', color: '#dc2626', concern: true };
    if (score >= 10) return { label: 'Moderate', color: '#d97706', concern: true };
    if (score >= 5) return { label: 'Mild', color: '#ca8a04', concern: false };
    return { label: 'Minimal', color: '#16a34a', concern: false };
  }
  if (instrument === 'cbi') {
    if (score >= 75) return { label: 'Severe Burnout', color: '#dc2626', concern: true };
    if (score >= 50) return { label: 'Burnout', color: '#ea580c', concern: true };
    if (score >= 25) return { label: 'Low-Moderate', color: '#ca8a04', concern: false };
    return { label: 'Minimal', color: '#16a34a', concern: false };
  }
  return { label: '', color: '#666', concern: false };
}

function progressBar(value: number, max: number, color: string): string {
  const pct = Math.min(100, (value / max) * 100);
  return `<div style="background:#e5e7eb;border-radius:4px;height:10px;width:100%;margin:4px 0">
    <div style="background:${color};border-radius:4px;height:10px;width:${pct}%"></div>
  </div>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers['authorization']?.replace('Bearer ', '') || req.headers['x-api-key'];
  if (authHeader !== CRON_SECRET && authHeader !== SUPABASE_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Get all participants with baseline
  const { data: parts } = await supabase
    .from('burnout_participants')
    .select('id, full_name, email, residency_program')
    .eq('status', 'active')
    .eq('baseline_completed', true)
    .not('email', 'is', null)
    .neq('study_participant_id', 'RES-TEST')
    .limit(200);

  if (!parts || parts.length === 0) {
    return res.json({ message: 'No eligible participants' });
  }

  // Get all CBI, PHQ, GAD scores for cohort averages
  const ids = parts.map(p => p.id);
  const [cbi, phq, gad, wp] = await Promise.all([
    supabase.from('cbi_responses').select('resident_id, personal_score, work_score, patient_score').in('resident_id', ids).limit(200),
    supabase.from('phq9_responses').select('resident_id, total_score').in('resident_id', ids).limit(200),
    supabase.from('gad7_responses').select('resident_id, total_score').in('resident_id', ids).limit(200),
    supabase.from('whoop_pulls').select('resident_id, avg_hrv_rmssd_ms, avg_resting_hr_bpm, avg_recovery_score, avg_total_sleep_min, avg_deep_sleep_min, avg_rem_sleep_min, avg_sleep_efficiency_pct, avg_sleep_debt_min, avg_daily_strain, avg_respiratory_rate_bpm, avg_skin_temp_c, avg_disturbance_count, avg_sleep_onset_min, avg_wake_time_min, workout_count, nap_count, pct_recorded').in('resident_id', ids).order('pulled_at', { ascending: false }).limit(500),
  ]);

  const cbiMap = new Map<string, any>();
  (cbi.data || []).forEach(c => { if (!cbiMap.has(c.resident_id)) cbiMap.set(c.resident_id, c); });
  const phqMap = new Map<string, any>();
  (phq.data || []).forEach(p => { if (!phqMap.has(p.resident_id)) phqMap.set(p.resident_id, p); });
  const gadMap = new Map<string, any>();
  (gad.data || []).forEach(g => { if (!gadMap.has(g.resident_id)) gadMap.set(g.resident_id, g); });
  const wMap = new Map<string, any>();
  (wp.data || []).forEach(w => { if (!wMap.has(w.resident_id)) wMap.set(w.resident_id, w); });

  // Cohort averages
  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const allCbiW = Array.from(cbiMap.values()).map(c => c.work_score);
  const allCbiP = Array.from(cbiMap.values()).map(c => c.personal_score);
  const allPhq = Array.from(phqMap.values()).map(p => p.total_score);
  const allGad = Array.from(gadMap.values()).map(g => g.total_score);
  const wAll = Array.from(wMap.values());
  const cohort = {
    cbiWork: avg(allCbiW),
    cbiPersonal: avg(allCbiP),
    phq9: avg(allPhq),
    gad7: avg(allGad),
    hrv: avg(wAll.map(w => w.avg_hrv_rmssd_ms).filter(Boolean)),
    rhr: avg(wAll.map(w => w.avg_resting_hr_bpm).filter(Boolean)),
    sleep: avg(wAll.map(w => w.avg_total_sleep_min).filter(Boolean)) / 60,
    deep: avg(wAll.map(w => w.avg_deep_sleep_min).filter(Boolean)),
    rem: avg(wAll.map(w => w.avg_rem_sleep_min).filter(Boolean)),
    efficiency: avg(wAll.map(w => w.avg_sleep_efficiency_pct).filter(Boolean)),
    debt: avg(wAll.map(w => w.avg_sleep_debt_min).filter(Boolean)),
    recovery: avg(wAll.map(w => w.avg_recovery_score).filter(Boolean)),
    strain: avg(wAll.map(w => w.avg_daily_strain).filter(Boolean)),
    respRate: avg(wAll.map(w => w.avg_respiratory_rate_bpm).filter(Boolean)),
    disturb: avg(wAll.map(w => w.avg_disturbance_count).filter(Boolean)),
    workouts: avg(wAll.map(w => w.workout_count).filter(Boolean)),
  };

  let sent = 0;
  const today = new Date().toISOString().slice(0, 10);

  for (const p of parts) {
    const c = cbiMap.get(p.id);
    const ph = phqMap.get(p.id);
    const ga = gadMap.get(p.id);
    const w = wMap.get(p.id);
    if (!c || !ph || !ga) continue;

    const name = p.full_name?.split(' ')[0] || 'Participant';

    const phqSev = severityLabel('phq9', ph.total_score);
    const gadSev = severityLabel('gad7', ga.total_score);
    const cbiWSev = severityLabel('cbi', c.work_score);
    const cbiPSev = severityLabel('cbi', c.personal_score);

    const hasConcern = phqSev.concern || gadSev.concern || cbiWSev.concern;

    const sleepH = w ? (w.avg_total_sleep_min / 60).toFixed(1) : '?';
    const deepM = w ? w.avg_deep_sleep_min?.toFixed(0) : '?';
    const remM = w ? w.avg_rem_sleep_min?.toFixed(0) : '?';
    const hrv = w ? w.avg_hrv_rmssd_ms?.toFixed(0) : '?';
    const rhr = w ? w.avg_resting_hr_bpm?.toFixed(0) : '?';
    const recovery = w ? w.avg_recovery_score?.toFixed(0) : '?';
    const efficiency = w ? w.avg_sleep_efficiency_pct?.toFixed(0) : '?';
    const debt = w ? w.avg_sleep_debt_min?.toFixed(0) : '?';
    const strain = w ? w.avg_daily_strain?.toFixed(1) : '?';
    const respRate = w ? w.avg_respiratory_rate_bpm?.toFixed(1) : '?';
    const disturb = w ? w.avg_disturbance_count?.toFixed(1) : '?';
    const workouts = w ? w.workout_count : '?';
    const adherence = w ? w.pct_recorded?.toFixed(0) : '?';
    const onsetMin = w?.avg_sleep_onset_min;
    const wakeMin = w?.avg_wake_time_min;
    const bedtime = onsetMin != null ? `${Math.floor(onsetMin / 60) >= 24 ? Math.floor(onsetMin / 60) - 24 : Math.floor(onsetMin / 60)}:${String(Math.round(onsetMin % 60)).padStart(2, '0')}` : '?';
    const wakeTime = wakeMin != null ? `${Math.floor(wakeMin / 60)}:${String(Math.round(wakeMin % 60)).padStart(2, '0')}` : '?';

    // Generate personalized tips based on data
    const tips: string[] = [];
    if (w) {
      if (w.avg_total_sleep_min < 360) tips.push('Your average sleep is below 6 hours. Aim for 7-8 hours — even 30 extra minutes can significantly improve recovery and cognitive performance.');
      if (w.avg_sleep_debt_min > 90) tips.push('You have significant sleep debt (' + debt + ' min). Try going to bed 30 minutes earlier for the next few days to recover.');
      if (w.avg_hrv_rmssd_ms < 35) tips.push('Your HRV is low, indicating high physiological stress. Consider deep breathing exercises (4-7-8 technique) before sleep.');
      if (w.avg_daily_strain < 5) tips.push('Your daily strain is very low. Even a 20-minute walk can improve HRV, mood, and sleep quality.');
      if (w.workout_count < 3) tips.push('You had only ' + workouts + ' workouts recently. Regular exercise (3-4x/week) is one of the strongest protectors against burnout.');
      if (w.avg_recovery_score < 40) tips.push('Your recovery score is in the red zone. Prioritize rest, hydration, and avoid caffeine after 2 PM.');
      if (w.avg_disturbance_count > 10) tips.push('You have frequent sleep disturbances (' + disturb + '/night). Consider a cooler room, blocking light, and avoiding screens 1 hour before bed.');
      if (w.avg_respiratory_rate_bpm > 17) tips.push('Your respiratory rate during sleep is elevated. This can indicate stress or anxiety. Relaxation techniques before bed may help.');
      if (w.pct_recorded < 70) tips.push('Your WHOOP adherence is ' + adherence + '%. Please wear your band 24/7 including sleep for accurate data collection.');
    }
    if (ph.total_score >= 10 && ga.total_score >= 10) tips.push('Both your depression and anxiety scores are elevated. This combination is common in residency — talking to someone can make a real difference.');
    if (c.work_score >= 60) tips.push('Your work-related burnout is high. Identify one small boundary you can set this week — even a 15-minute break can reset your stress response.');

    const scoreRow = (label: string, yours: number, cohortAvg: number, max: number, sev: { label: string; color: string }) =>
      `<tr>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:13px;font-weight:600">${label}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;font-size:14px;font-weight:700;color:${sev.color}">${yours.toFixed(0)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;font-size:13px;color:#666">${cohortAvg.toFixed(0)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:11px;color:${sev.color}">${sev.label}</td>
      </tr>`;

    const supportSection = hasConcern ? `
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px;margin:20px 0">
      <h3 style="margin:0 0 8px;font-size:14px;color:#991b1b">Support Resources</h3>
      <p style="font-size:13px;color:#333;margin:0 0 8px">Your scores suggest you may be experiencing significant stress. This is common among residents, and support is available:</p>
      <ul style="font-size:13px;line-height:1.8;color:#333;padding-left:20px;margin:0">
        <li><strong>OMSB Resident Counseling</strong> — Free, confidential counseling available to all OMSB trainees.</li>
        <li><strong>Confidential Discussion</strong> — You can also discuss your concerns confidentially with the PI, <strong>Dr. Mohamed Al Rawahi</strong> (<a href="mailto:mrawahi@squ.edu.om" style="color:#0f766e">mrawahi@squ.edu.om</a>).</li>
        <li><strong>Peer Support</strong> — Talking to a trusted colleague or mentor can help. You are not alone.</li>
      </ul>
      <p style="font-size:12px;color:#666;margin:10px 0 0">Seeking help is a sign of strength, not weakness. Your wellbeing matters.</p>
    </div>` : `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px;margin:20px 0">
      <p style="font-size:13px;color:#166534;margin:0"><strong>Your scores are within normal range.</strong> Keep taking care of yourself — regular sleep, exercise, and social connection all help maintain resilience.</p>
    </div>`;

    const html = `<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;color:#333">
<div style="background:linear-gradient(135deg,#0f172a,#0f766e);padding:24px;border-radius:12px 12px 0 0;text-align:center">
  <h1 style="color:white;margin:0;font-size:18px">Your Personal Wellbeing Summary</h1>
  <p style="color:#d1fae5;margin:6px 0 0;font-size:13px">OMSB Burnout Study — ${today}</p>
</div>
<div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 12px 12px">
  <p>Dear ${name},</p>
  <p style="font-size:14px">Thank you for participating in the study. Below is a summary of your latest wellbeing scores compared to the cohort average. <strong>Your data is confidential</strong> — only you see this report.</p>

  <h3 style="font-size:14px;color:#0f766e;margin:20px 0 8px">Mental Health & Burnout</h3>
  <table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead><tr style="background:#f0fdf4">
      <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #d1fae5">Measure</th>
      <th style="padding:6px 8px;text-align:center;border-bottom:2px solid #d1fae5">You</th>
      <th style="padding:6px 8px;text-align:center;border-bottom:2px solid #d1fae5">Cohort Avg</th>
      <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #d1fae5">Level</th>
    </tr></thead>
    <tbody>
      ${scoreRow('Work Burnout (CBI)', c.work_score, cohort.cbiWork, 100, cbiWSev)}
      ${scoreRow('Personal Burnout (CBI)', c.personal_score, cohort.cbiPersonal, 100, cbiPSev)}
      ${scoreRow('Depression (PHQ-9)', ph.total_score, cohort.phq9, 27, phqSev)}
      ${scoreRow('Anxiety (GAD-7)', ga.total_score, cohort.gad7, 21, gadSev)}
    </tbody>
  </table>

  ${w ? `<h3 style="font-size:14px;color:#0f766e;margin:20px 0 8px">Sleep</h3>
  <table style="width:100%;border-collapse:collapse;font-size:12px">
    <thead><tr style="background:#f0fdf4">
      <th style="padding:5px 8px;text-align:left;border-bottom:2px solid #d1fae5">Metric</th>
      <th style="padding:5px 8px;text-align:center;border-bottom:2px solid #d1fae5">You</th>
      <th style="padding:5px 8px;text-align:center;border-bottom:2px solid #d1fae5">Cohort</th>
      <th style="padding:5px 8px;text-align:left;border-bottom:2px solid #d1fae5">Status</th>
    </tr></thead>
    <tbody>
      <tr><td style="padding:4px 8px;border-bottom:1px solid #eee">Total Sleep</td><td style="padding:4px 8px;text-align:center;border-bottom:1px solid #eee;font-weight:600">${sleepH}h</td><td style="padding:4px 8px;text-align:center;border-bottom:1px solid #eee;color:#666">${cohort.sleep.toFixed(1)}h</td><td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:11px;color:${Number(sleepH) >= 7 ? '#16a34a' : Number(sleepH) >= 6 ? '#d97706' : '#dc2626'}">${Number(sleepH) >= 7 ? 'Good' : Number(sleepH) >= 6 ? 'Below recommended' : 'Insufficient'}</td></tr>
      <tr><td style="padding:4px 8px;border-bottom:1px solid #eee">Deep Sleep</td><td style="padding:4px 8px;text-align:center;border-bottom:1px solid #eee;font-weight:600">${deepM} min</td><td style="padding:4px 8px;text-align:center;border-bottom:1px solid #eee;color:#666">${cohort.deep.toFixed(0)} min</td><td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:11px;color:#666">Physical restoration</td></tr>
      <tr><td style="padding:4px 8px;border-bottom:1px solid #eee">REM Sleep</td><td style="padding:4px 8px;text-align:center;border-bottom:1px solid #eee;font-weight:600">${remM} min</td><td style="padding:4px 8px;text-align:center;border-bottom:1px solid #eee;color:#666">${cohort.rem.toFixed(0)} min</td><td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:11px;color:#666">Memory &amp; learning</td></tr>
      <tr><td style="padding:4px 8px;border-bottom:1px solid #eee">Efficiency</td><td style="padding:4px 8px;text-align:center;border-bottom:1px solid #eee;font-weight:600">${efficiency}%</td><td style="padding:4px 8px;text-align:center;border-bottom:1px solid #eee;color:#666">${cohort.efficiency.toFixed(0)}%</td><td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:11px;color:${Number(efficiency) >= 85 ? '#16a34a' : '#d97706'}">${Number(efficiency) >= 85 ? 'Good' : 'Low'}</td></tr>
      <tr><td style="padding:4px 8px;border-bottom:1px solid #eee">Sleep Debt</td><td style="padding:4px 8px;text-align:center;border-bottom:1px solid #eee;font-weight:600;color:${Number(debt) > 90 ? '#dc2626' : '#333'}">${debt} min</td><td style="padding:4px 8px;text-align:center;border-bottom:1px solid #eee;color:#666">${cohort.debt.toFixed(0)} min</td><td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:11px;color:${Number(debt) > 90 ? '#dc2626' : Number(debt) > 60 ? '#d97706' : '#16a34a'}">${Number(debt) > 90 ? 'High — prioritize rest' : Number(debt) > 60 ? 'Moderate' : 'Low'}</td></tr>
      <tr><td style="padding:4px 8px;border-bottom:1px solid #eee">Disturbances</td><td style="padding:4px 8px;text-align:center;border-bottom:1px solid #eee;font-weight:600">${disturb}/night</td><td style="padding:4px 8px;text-align:center;border-bottom:1px solid #eee;color:#666">${cohort.disturb.toFixed(1)}/night</td><td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:11px"></td></tr>
      <tr><td style="padding:4px 8px;border-bottom:1px solid #eee">Bedtime</td><td style="padding:4px 8px;text-align:center;border-bottom:1px solid #eee;font-weight:600">${bedtime}</td><td style="padding:4px 8px;text-align:center;border-bottom:1px solid #eee;color:#666">—</td><td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:11px"></td></tr>
      <tr><td style="padding:4px 8px;border-bottom:1px solid #eee">Wake Time</td><td style="padding:4px 8px;text-align:center;border-bottom:1px solid #eee;font-weight:600">${wakeTime}</td><td style="padding:4px 8px;text-align:center;border-bottom:1px solid #eee;color:#666">—</td><td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:11px"></td></tr>
    </tbody>
  </table>

  <h3 style="font-size:14px;color:#0f766e;margin:20px 0 8px">Recovery &amp; Physiology</h3>
  <table style="width:100%;border-collapse:collapse;font-size:12px">
    <thead><tr style="background:#f0fdf4">
      <th style="padding:5px 8px;text-align:left;border-bottom:2px solid #d1fae5">Metric</th>
      <th style="padding:5px 8px;text-align:center;border-bottom:2px solid #d1fae5">You</th>
      <th style="padding:5px 8px;text-align:center;border-bottom:2px solid #d1fae5">Cohort</th>
      <th style="padding:5px 8px;text-align:left;border-bottom:2px solid #d1fae5">Status</th>
    </tr></thead>
    <tbody>
      <tr><td style="padding:4px 8px;border-bottom:1px solid #eee">Recovery Score</td><td style="padding:4px 8px;text-align:center;border-bottom:1px solid #eee;font-weight:700;color:${Number(recovery) >= 67 ? '#16a34a' : Number(recovery) >= 34 ? '#d97706' : '#dc2626'}">${recovery}%</td><td style="padding:4px 8px;text-align:center;border-bottom:1px solid #eee;color:#666">${cohort.recovery.toFixed(0)}%</td><td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:11px;color:${Number(recovery) >= 67 ? '#16a34a' : Number(recovery) >= 34 ? '#d97706' : '#dc2626'}">${Number(recovery) >= 67 ? 'Green — optimal' : Number(recovery) >= 34 ? 'Yellow — moderate' : 'Red — low'}</td></tr>
      <tr><td style="padding:4px 8px;border-bottom:1px solid #eee">HRV</td><td style="padding:4px 8px;text-align:center;border-bottom:1px solid #eee;font-weight:600">${hrv} ms</td><td style="padding:4px 8px;text-align:center;border-bottom:1px solid #eee;color:#666">${cohort.hrv.toFixed(0)} ms</td><td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:11px;color:${Number(hrv) >= 50 ? '#16a34a' : Number(hrv) >= 30 ? '#d97706' : '#dc2626'}">${Number(hrv) >= 50 ? 'Good autonomic balance' : Number(hrv) >= 30 ? 'Moderate stress' : 'High stress'}</td></tr>
      <tr><td style="padding:4px 8px;border-bottom:1px solid #eee">Resting HR</td><td style="padding:4px 8px;text-align:center;border-bottom:1px solid #eee;font-weight:600">${rhr} bpm</td><td style="padding:4px 8px;text-align:center;border-bottom:1px solid #eee;color:#666">${cohort.rhr.toFixed(0)} bpm</td><td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:11px"></td></tr>
      <tr><td style="padding:4px 8px;border-bottom:1px solid #eee">Respiratory Rate</td><td style="padding:4px 8px;text-align:center;border-bottom:1px solid #eee;font-weight:600">${respRate}</td><td style="padding:4px 8px;text-align:center;border-bottom:1px solid #eee;color:#666">${cohort.respRate.toFixed(1)}</td><td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:11px">${Number(respRate) > 17 ? 'Elevated — may indicate stress' : ''}</td></tr>
      <tr><td style="padding:4px 8px;border-bottom:1px solid #eee">Daily Strain</td><td style="padding:4px 8px;text-align:center;border-bottom:1px solid #eee;font-weight:600">${strain}</td><td style="padding:4px 8px;text-align:center;border-bottom:1px solid #eee;color:#666">${cohort.strain.toFixed(1)}</td><td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:11px">${Number(strain) < 5 ? 'Low activity' : Number(strain) < 10 ? 'Moderate' : 'High'}</td></tr>
      <tr><td style="padding:4px 8px;border-bottom:1px solid #eee">Workouts</td><td style="padding:4px 8px;text-align:center;border-bottom:1px solid #eee;font-weight:600">${workouts}</td><td style="padding:4px 8px;text-align:center;border-bottom:1px solid #eee;color:#666">${cohort.workouts.toFixed(0)}</td><td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:11px">${Number(workouts) < 3 ? 'Consider adding exercise' : ''}</td></tr>
      <tr><td style="padding:4px 8px;border-bottom:1px solid #eee">WHOOP Adherence</td><td style="padding:4px 8px;text-align:center;border-bottom:1px solid #eee;font-weight:600;color:${Number(adherence) >= 80 ? '#16a34a' : '#d97706'}">${adherence}%</td><td style="padding:4px 8px;text-align:center;border-bottom:1px solid #eee;color:#666">—</td><td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:11px">${Number(adherence) < 70 ? 'Please wear 24/7' : ''}</td></tr>
    </tbody>
  </table>` : ''}

  ${tips.length > 0 ? `<h3 style="font-size:14px;color:#0f766e;margin:20px 0 8px">Personalized Tips</h3>
  <div style="background:#f8fafc;border-radius:10px;padding:14px">
    <ul style="font-size:13px;line-height:1.8;padding-left:18px;margin:0;color:#333">
      ${tips.map(t => '<li>' + t + '</li>').join('')}
    </ul>
  </div>` : ''}

  ${supportSection}

  <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
  <p style="font-size:11px;color:#888;text-align:center">This report is confidential and sent only to you. It is not shared with your program, supervisors, or peers.<br/>OMSB Resident Burnout Study — MREC# 3190</p>
</div></div>`;

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'OMSB Burnout Study <info@medresearch-academy.om>',
        to: [p.email],
        bcc: ['dr.abdullahalalawi@gmail.com'],
        subject: 'Your Personal Wellbeing Summary — OMSB Burnout Study',
        html,
      }),
    });

    if (emailRes.ok) sent++;
    await new Promise(r => setTimeout(r, 150));
  }

  return res.json({ sent, total: parts.length, date: today });
}
