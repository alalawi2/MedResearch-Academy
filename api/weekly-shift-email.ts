import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

// Weekly shift log email — sends every Sunday at 6 AM Oman (2 AM UTC)
// Creates a token-based link per resident — no login needed

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const CRON_SECRET = process.env.CRON_SECRET || SUPABASE_KEY;
const SITE_URL = process.env.SITE_URL || 'https://www.medresearch-academy.om';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers['authorization']?.replace('Bearer ', '') || req.headers['x-api-key'];
  if (authHeader !== CRON_SECRET && authHeader !== SUPABASE_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Calculate the week that just ended (Sun-Sat)
  const today = new Date();
  const dayOfWeek = today.getUTCDay(); // 0=Sun
  // Week start = last Sunday
  const weekStart = new Date(today);
  weekStart.setUTCDate(today.getUTCDate() - dayOfWeek);
  const weekStartStr = weekStart.toISOString().slice(0, 10);

  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
  const weekEndStr = weekEnd.toISOString().slice(0, 10);

  // Get active participants with email
  const { data: participants } = await supabase
    .from('burnout_participants')
    .select('id, study_id, full_name, email')
    .eq('status', 'active')
    .not('email', 'is', null)
    .neq('study_participant_id', 'RES-TEST')
    .limit(200);

  if (!participants || participants.length === 0) {
    return res.json({ message: 'No participants', week: weekStartStr });
  }

  let sent = 0;
  let skipped = 0;

  for (const p of participants) {
    // Check if already created for this week
    const { data: existing } = await supabase
      .from('weekly_shift_log')
      .select('id, token')
      .eq('resident_id', p.id)
      .eq('week_start', weekStartStr)
      .limit(1)
      .single();

    let token: string;

    if (existing) {
      // Already exists — use existing token (re-send link)
      token = existing.token;
    } else {
      // Create new entry with unique token
      token = randomBytes(24).toString('base64url');
      const { error: insertErr } = await supabase
        .from('weekly_shift_log')
        .insert({
          study_id: p.study_id,
          resident_id: p.id,
          week_start: weekStartStr,
          token,
        });
      if (insertErr) {
        console.error('Shift log insert error for', p.id, insertErr.message);
        skipped++;
        continue;
      }
    }

    const link = `${SITE_URL}/api/shift-log?token=${token}`;
    const name = p.full_name?.split(' ')[0] || 'Participant';

    // Send email with one-click link
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'OMSB Burnout Study <info@medresearch-academy.om>',
        to: [p.email],
        subject: `Shift Log — Week of ${weekStartStr} (30 seconds)`,
        html: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;color:#333">
<div style="background:#0f766e;padding:20px;border-radius:12px 12px 0 0;text-align:center">
  <h1 style="color:white;margin:0;font-size:18px">Weekly Shift Log</h1>
  <p style="color:#d1fae5;margin:6px 0 0;font-size:13px">${weekStartStr} to ${weekEndStr}</p>
</div>
<div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 12px 12px">
  <p>Dear ${name},</p>
  <p>Please log your shift pattern for this past week. Tap the button below — <strong>no login needed</strong>, takes 30 seconds.</p>
  <p style="font-size:13px;color:#666">For each day, select: Regular Day, 24h On-Call, 12h Shift, Night Shift, Post-Call, Day Off, or Home Call.</p>
  <div style="text-align:center;margin:24px 0">
    <a href="${link}" style="display:inline-block;background:#0f766e;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px">Log My Shifts</a>
  </div>
  <p style="font-size:12px;color:#999;text-align:center">This link is unique to you. Do not share it.</p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
  <p style="font-size:12px;color:#666">OMSB Burnout Study Team</p>
</div></div>`,
      }),
    });

    if (emailRes.ok) sent++;
    else skipped++;

    await new Promise(r => setTimeout(r, 100));
  }

  return res.json({
    week: weekStartStr,
    total: participants.length,
    sent,
    skipped,
  });
}
