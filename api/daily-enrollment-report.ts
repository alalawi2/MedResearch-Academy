import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Daily enrollment report — runs 3:00 UTC (7:00 AM Oman)
// Sends the full enrolled residents list to research team + Dawood

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const CRON_SECRET = process.env.CRON_SECRET || SUPABASE_KEY;

const TEAM_EMAILS = [
  'dr.abdullahalalawi@gmail.com',
  'mrawahi@squ.edu.om',
  'masoud.kashoob@gmail.com',
  'salim.sas1992@gmail.com',
  'jhsm41191@gmail.com',
  'dradil@squ.edu.om',
  'tamadhiralmahrouqi@gmail.com',
  'a.altoubi@squ.edu.om',
  'nuhahabsi7@gmail.com',
  'altaeiomar11@gmail.com',
  'd.alaamri@squ.edu.om',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers['authorization']?.replace('Bearer ', '') || req.headers['x-api-key'];
  if (authHeader !== CRON_SECRET && authHeader !== SUPABASE_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: participants } = await supabase
    .from('burnout_participants')
    .select('study_participant_id, full_name, email, enrollment_date, demographics_completed, baseline_completed, whoop_user_id, auth_user_id')
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(200);

  if (!participants || participants.length === 0) {
    return res.json({ message: 'No participants found' });
  }

  // Exclude test account
  const real = participants.filter(p => p.study_participant_id !== 'RES-TEST');
  const total = real.length;
  const whoopLinked = real.filter(p => p.whoop_user_id).length;
  const accountLinked = real.filter(p => p.auth_user_id).length;
  const demoComplete = real.filter(p => p.demographics_completed).length;
  const baselineComplete = real.filter(p => p.baseline_completed).length;
  const fullyComplete = real.filter(p => p.demographics_completed && p.baseline_completed).length;

  // Find new enrollments (today)
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const newToday = real.filter(p => p.enrollment_date === today);
  const newYesterday = real.filter(p => p.enrollment_date === yesterday);

  // Incomplete list
  const incomplete = real.filter(p => !p.demographics_completed || !p.baseline_completed);

  const rows = real.map((p, i) => {
    const demoIcon = p.demographics_completed ? '&#9989;' : '&#10060;';
    const baseIcon = p.baseline_completed ? '&#9989;' : '&#10060;';
    const whoopIcon = p.whoop_user_id ? '&#9989;' : '&#10060;';
    const isNew = p.enrollment_date === today || p.enrollment_date === yesterday;
    const rowBg = isNew ? 'background:#f0fdf4;' : '';
    // NOTE: Never include study_participant_id alongside names in team emails
    return `<tr style="${rowBg}"><td style="padding:5px 8px;border-bottom:1px solid #eee;font-size:12px">${i + 1}</td><td style="padding:5px 8px;border-bottom:1px solid #eee;font-size:12px">${p.full_name}${isNew ? ' <span style="color:#16a34a;font-size:10px">NEW</span>' : ''}</td><td style="padding:5px 8px;border-bottom:1px solid #eee;font-size:12px">${p.email}</td><td style="padding:5px 8px;border-bottom:1px solid #eee;font-size:12px">${p.enrollment_date}</td><td style="padding:5px 8px;border-bottom:1px solid #eee;text-align:center;font-size:12px">${whoopIcon}</td><td style="padding:5px 8px;border-bottom:1px solid #eee;text-align:center;font-size:12px">${demoIcon}</td><td style="padding:5px 8px;border-bottom:1px solid #eee;text-align:center;font-size:12px">${baseIcon}</td></tr>`;
  }).join('');

  const incompleteRows = incomplete.map(p => {
    const missing = [];
    if (!p.demographics_completed) missing.push('Demographics');
    if (!p.baseline_completed) missing.push('Baseline');
    return `<tr><td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:12px">${p.full_name}</td><td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:12px;color:#dc2626">${missing.join(', ')}</td></tr>`;
  }).join('');

  const html = `<div style="font-family:Arial,sans-serif;max-width:750px;margin:0 auto;color:#333">
<div style="background:#0f766e;padding:20px;border-radius:12px 12px 0 0;text-align:center">
  <h1 style="color:white;margin:0;font-size:18px">Daily Enrollment Report</h1>
  <p style="color:#d1fae5;margin:6px 0 0;font-size:13px">OMSB Resident Burnout Study — ${today}</p>
</div>
<div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 12px 12px">

<table style="width:100%;font-size:14px;margin-bottom:20px;border-collapse:collapse">
  <tr>
    <td style="padding:8px;background:#f0fdf4;border-radius:8px;text-align:center;width:20%"><strong style="font-size:24px;color:#0f766e">${total}</strong><br><span style="font-size:11px;color:#666">Enrolled</span></td>
    <td style="padding:8px;background:#f0fdf4;border-radius:8px;text-align:center;width:20%"><strong style="font-size:24px;color:#0f766e">${whoopLinked}</strong><br><span style="font-size:11px;color:#666">WHOOP</span></td>
    <td style="padding:8px;background:#f0fdf4;border-radius:8px;text-align:center;width:20%"><strong style="font-size:24px;color:#0f766e">${fullyComplete}</strong><br><span style="font-size:11px;color:#666">Forms Done</span></td>
    <td style="padding:8px;background:${incomplete.length > 0 ? '#fef2f2' : '#f0fdf4'};border-radius:8px;text-align:center;width:20%"><strong style="font-size:24px;color:${incomplete.length > 0 ? '#dc2626' : '#0f766e'}">${incomplete.length}</strong><br><span style="font-size:11px;color:#666">Incomplete</span></td>
    <td style="padding:8px;background:${newToday.length > 0 ? '#fffbeb' : '#f0fdf4'};border-radius:8px;text-align:center;width:20%"><strong style="font-size:24px;color:#f59e0b">${newToday.length + newYesterday.length}</strong><br><span style="font-size:11px;color:#666">New (48h)</span></td>
  </tr>
</table>

${incomplete.length > 0 ? `<h3 style="font-size:13px;color:#dc2626;margin:16px 0 8px">Incomplete Enrollment Forms</h3>
<table style="width:100%;border-collapse:collapse;margin-bottom:16px">
<thead><tr style="background:#fef2f2"><th style="padding:5px 8px;text-align:left;border-bottom:1px solid #fecaca;font-size:12px">Name</th><th style="padding:5px 8px;text-align:left;border-bottom:1px solid #fecaca;font-size:12px">Missing</th></tr></thead>
<tbody>${incompleteRows}</tbody></table>` : ''}

<h3 style="font-size:13px;color:#0f766e;margin:16px 0 8px">All Enrolled Residents (${total})</h3>
<table style="width:100%;border-collapse:collapse;font-size:12px">
<thead><tr style="background:#f0fdf4">
  <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #d1fae5">#</th>
  <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #d1fae5">Name</th>
  <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #d1fae5">Email</th>
  <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #d1fae5">Enrolled</th>
  <th style="padding:6px 8px;text-align:center;border-bottom:2px solid #d1fae5">WHOOP</th>
  <th style="padding:6px 8px;text-align:center;border-bottom:2px solid #d1fae5">Demo</th>
  <th style="padding:6px 8px;text-align:center;border-bottom:2px solid #d1fae5">Base</th>
</tr></thead>
<tbody>${rows}</tbody>
</table>

<hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
<p style="font-size:11px;color:#888">Automated daily report — OMSB Resident Burnout Study Platform</p>
</div></div>`;

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'OMSB Burnout Study <info@medresearch-academy.om>',
      to: TEAM_EMAILS,
      subject: `Burnout Study — ${total} Enrolled (${newToday.length > 0 ? '+' + newToday.length + ' today' : 'no new today'}) — Daily Report`,
      html,
    }),
  });

  const emailResult = await emailRes.json();

  return res.json({
    sent_at: new Date().toISOString(),
    total,
    whoop_linked: whoopLinked,
    account_linked: accountLinked,
    forms_complete: fullyComplete,
    incomplete: incomplete.length,
    new_today: newToday.length,
    new_yesterday: newYesterday.length,
    email_status: emailRes.status,
    email_id: emailResult.id || null,
  });
}
