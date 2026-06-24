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
    supabase.from('whoop_pulls').select('resident_id, avg_hrv_rmssd_ms, avg_recovery_score, avg_total_sleep_min, avg_daily_strain').in('resident_id', ids).order('pulled_at', { ascending: false }).limit(500),
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
  const allHrv = Array.from(wMap.values()).map(w => w.avg_hrv_rmssd_ms).filter(Boolean);
  const allSleep = Array.from(wMap.values()).map(w => w.avg_total_sleep_min).filter(Boolean);
  const allRecovery = Array.from(wMap.values()).map(w => w.avg_recovery_score).filter(Boolean);

  const cohort = {
    cbiWork: avg(allCbiW),
    cbiPersonal: avg(allCbiP),
    phq9: avg(allPhq),
    gad7: avg(allGad),
    hrv: avg(allHrv),
    sleep: avg(allSleep) / 60,
    recovery: avg(allRecovery),
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
    const hrv = w ? w.avg_hrv_rmssd_ms?.toFixed(0) : '?';
    const recovery = w ? w.avg_recovery_score?.toFixed(0) : '?';

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
        <li><strong>OMSB Counseling Section</strong> — Free, confidential counseling for all OMSB residents. Contact the wellness office directly.</li>
        <li><strong>Al Aqawya</strong> — If you have concerns, you can discuss them confidentially with the PI, <strong>Dr. Mohamed Al Rawahi</strong> (<a href="mailto:mrawahi@squ.edu.om" style="color:#0f766e">mrawahi@squ.edu.om</a>).</li>
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

  ${w ? `<h3 style="font-size:14px;color:#0f766e;margin:20px 0 8px">WHOOP Biometrics</h3>
  <table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead><tr style="background:#f0fdf4">
      <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #d1fae5">Metric</th>
      <th style="padding:6px 8px;text-align:center;border-bottom:2px solid #d1fae5">You</th>
      <th style="padding:6px 8px;text-align:center;border-bottom:2px solid #d1fae5">Cohort Avg</th>
    </tr></thead>
    <tbody>
      <tr><td style="padding:5px 8px;border-bottom:1px solid #eee">Sleep</td><td style="padding:5px 8px;text-align:center;border-bottom:1px solid #eee;font-weight:600">${sleepH}h</td><td style="padding:5px 8px;text-align:center;border-bottom:1px solid #eee;color:#666">${cohort.sleep.toFixed(1)}h</td></tr>
      <tr><td style="padding:5px 8px;border-bottom:1px solid #eee">HRV</td><td style="padding:5px 8px;text-align:center;border-bottom:1px solid #eee;font-weight:600">${hrv} ms</td><td style="padding:5px 8px;text-align:center;border-bottom:1px solid #eee;color:#666">${cohort.hrv.toFixed(0)} ms</td></tr>
      <tr><td style="padding:5px 8px;border-bottom:1px solid #eee">Recovery</td><td style="padding:5px 8px;text-align:center;border-bottom:1px solid #eee;font-weight:600">${recovery}%</td><td style="padding:5px 8px;text-align:center;border-bottom:1px solid #eee;color:#666">${cohort.recovery.toFixed(0)}%</td></tr>
    </tbody>
  </table>` : ''}

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
