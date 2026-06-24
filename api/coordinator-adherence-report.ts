import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Weekly adherence report to each coordinator — Monday 7 AM Oman (3 AM UTC)
// Shows their group's WHOOP adherence + who needs follow-up

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const CRON_SECRET = process.env.CRON_SECRET || SUPABASE_KEY;

const PI_CC = ['dr.abdullahalalawi@gmail.com', 'mrawahi@squ.edu.om', 'tamadhiralmahrouqi@gmail.com'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers['authorization']?.replace('Bearer ', '') || req.headers['x-api-key'];
  if (authHeader !== CRON_SECRET && authHeader !== SUPABASE_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Get all active participants with coordinator assignment
  const { data: parts } = await supabase
    .from('burnout_participants')
    .select('id, full_name, email, coordinator_group, coordinator_name, coordinator_email, demographics_completed, baseline_completed')
    .eq('status', 'active')
    .neq('study_participant_id', 'RES-TEST')
    .not('coordinator_email', 'is', null)
    .limit(200);

  if (!parts || parts.length === 0) {
    return res.json({ message: 'No assigned participants' });
  }

  // Get latest WHOOP pull per resident
  const { data: pulls } = await supabase
    .from('whoop_pulls')
    .select('resident_id, pct_recorded, days_with_data, pulled_at')
    .order('pulled_at', { ascending: false })
    .limit(500);

  const latestPull = new Map<string, any>();
  pulls?.forEach(p => { if (!latestPull.has(p.resident_id)) latestPull.set(p.resident_id, p); });

  // Group by coordinator
  const byCoord = new Map<string, typeof parts>();
  parts.forEach(p => {
    const email = p.coordinator_email!;
    if (!byCoord.has(email)) byCoord.set(email, []);
    byCoord.get(email)!.push(p);
  });

  let sent = 0;
  const today = new Date().toISOString().slice(0, 10);

  for (const [coordEmail, members] of Array.from(byCoord)) {
    const coordName = members[0].coordinator_name || 'Coordinator';
    const group = members[0].coordinator_group || '?';

    // Build member rows sorted by adherence (worst first)
    const memberData = members.map(m => {
      const pull = latestPull.get(m.id);
      const pct = pull?.pct_recorded ?? 0;
      const days = pull?.days_with_data ?? 0;
      const lastPull = pull?.pulled_at ? new Date(pull.pulled_at) : null;
      const stale = !lastPull || (Date.now() - lastPull.getTime()) > 3 * 86400000;
      const formsDone = m.demographics_completed && m.baseline_completed;
      return { name: m.full_name, email: m.email, pct, days, stale, formsDone };
    }).sort((a, b) => a.pct - b.pct);

    const needsAttention = memberData.filter(m => m.pct < 70 || m.stale || !m.formsDone);
    const groupAvg = memberData.length > 0 ? Math.round(memberData.reduce((s, m) => s + m.pct, 0) / memberData.length) : 0;

    const rows = memberData.map(m => {
      const pctColor = m.pct >= 80 ? '#16a34a' : m.pct >= 60 ? '#d97706' : '#dc2626';
      const flags: string[] = [];
      if (m.pct < 70) flags.push('Low adherence');
      if (m.stale) flags.push('Data stale');
      if (!m.formsDone) flags.push('Forms incomplete');
      const bgColor = flags.length > 0 ? '#fef2f2' : '';
      return `<tr style="background:${bgColor}">
        <td style="padding:5px 8px;border-bottom:1px solid #eee;font-size:12px">${m.name}</td>
        <td style="padding:5px 8px;border-bottom:1px solid #eee;font-size:12px;color:${pctColor};font-weight:600">${m.pct}%</td>
        <td style="padding:5px 8px;border-bottom:1px solid #eee;font-size:12px">${m.days}/25</td>
        <td style="padding:5px 8px;border-bottom:1px solid #eee;font-size:11px;color:#dc2626">${flags.join(', ') || '-'}</td>
      </tr>`;
    }).join('');

    const html = `<div style="font-family:Arial,sans-serif;max-width:650px;margin:0 auto;color:#333">
<div style="background:#0f766e;padding:20px;border-radius:12px 12px 0 0;text-align:center">
  <h1 style="color:white;margin:0;font-size:18px">Weekly Adherence Report — Group ${group}</h1>
  <p style="color:#d1fae5;margin:6px 0 0;font-size:13px">${today}</p>
</div>
<div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 12px 12px">
  <p>Dear ${coordName.split(' ')[0]},</p>
  <p>Here is your group's WHOOP adherence summary for this week.</p>

  <table style="width:100%;font-size:14px;margin:16px 0;border-collapse:collapse">
    <tr>
      <td style="padding:10px;background:${groupAvg>=80?'#f0fdf4':'#fffbeb'};border-radius:8px;text-align:center;width:33%"><strong style="font-size:24px;color:${groupAvg>=80?'#16a34a':'#d97706'}">${groupAvg}%</strong><br><span style="font-size:11px;color:#666">Group Average</span></td>
      <td style="padding:10px;background:#f0fdf4;border-radius:8px;text-align:center;width:33%"><strong style="font-size:24px;color:#0f766e">${members.length}</strong><br><span style="font-size:11px;color:#666">Residents</span></td>
      <td style="padding:10px;background:${needsAttention.length>0?'#fef2f2':'#f0fdf4'};border-radius:8px;text-align:center;width:33%"><strong style="font-size:24px;color:${needsAttention.length>0?'#dc2626':'#0f766e'}">${needsAttention.length}</strong><br><span style="font-size:11px;color:#666">Need Attention</span></td>
    </tr>
  </table>

  ${needsAttention.length > 0 ? '<p style="font-size:13px;color:#dc2626;font-weight:600">Please follow up with residents flagged below (phone or in-person).</p>' : '<p style="font-size:13px;color:#16a34a;font-weight:600">All residents in your group are on track!</p>'}

  <table style="width:100%;border-collapse:collapse;font-size:12px;margin:12px 0">
    <thead><tr style="background:#f0fdf4">
      <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #d1fae5">Name</th>
      <th style="padding:6px 8px;text-align:center;border-bottom:2px solid #d1fae5">Adherence</th>
      <th style="padding:6px 8px;text-align:center;border-bottom:2px solid #d1fae5">Days</th>
      <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #d1fae5">Flags</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
  <p style="font-size:11px;color:#888">OMSB Burnout Study — Automated Weekly Report</p>
</div></div>`;

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'OMSB Burnout Study <info@medresearch-academy.om>',
        to: [coordEmail],
        cc: PI_CC,
        subject: `[Group ${group}] Weekly Adherence: ${groupAvg}% avg, ${needsAttention.length} need attention`,
        html,
      }),
    });

    if (emailRes.ok) sent++;
    await new Promise(r => setTimeout(r, 200));
  }

  return res.json({ sent, coordinators: byCoord.size, date: today });
}
