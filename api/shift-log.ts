import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Weekly shift log — no login required
// GET: renders a simple HTML form with one-click shift type per day
// POST: saves the responses

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const SHIFT_TYPES = [
  { value: 'regular', label: 'Regular Day', emoji: '🏥', color: '#e0f2fe' },
  { value: 'call_24h', label: '24h On-Call', emoji: '🔴', color: '#fef2f2' },
  { value: 'call_12h', label: '12h Shift', emoji: '🟠', color: '#fff7ed' },
  { value: 'night_shift', label: 'Night Shift', emoji: '🌙', color: '#f5f3ff' },
  { value: 'post_call', label: 'Post-Call', emoji: '😴', color: '#fefce8' },
  { value: 'day_off', label: 'Day Off', emoji: '🟢', color: '#f0fdf4' },
  { value: 'home_call', label: 'Home Call', emoji: '📱', color: '#fdf4ff' },
];

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function renderForm(token: string, weekStart: string, existing: Record<string, string | null>, name: string, adherencePct: number | null, daysWithData: number | null, rank: number | null, totalRanked: number): string {
  const weekEnd = new Date(new Date(weekStart).getTime() + 6 * 86400000).toISOString().slice(0, 10);

  const adherenceColor = adherencePct == null ? '#64748b' : adherencePct >= 80 ? '#16a34a' : adherencePct >= 60 ? '#f59e0b' : '#dc2626';
  const adherenceBanner = adherencePct != null ? `
    <div style="background:${adherencePct >= 80 ? '#f0fdf4' : adherencePct >= 60 ? '#fffbeb' : '#fef2f2'};border:1px solid ${adherencePct >= 80 ? '#bbf7d0' : adherencePct >= 60 ? '#fde68a' : '#fecaca'};border-radius:10px;padding:14px;margin-bottom:16px;display:flex;align-items:center;gap:14px">
      <div style="text-align:center;min-width:70px">
        <div style="font-size:28px;font-weight:700;color:${adherenceColor}">${Math.round(adherencePct)}%</div>
        <div style="font-size:10px;color:#666">WHOOP</div>
      </div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:600;color:#333">${adherencePct >= 80 ? 'Great adherence!' : adherencePct >= 60 ? 'Your WHOOP adherence needs improvement' : 'Low WHOOP adherence — please wear your band 24/7'}</div>
        <div style="font-size:12px;color:#666">${daysWithData ?? '?'}/25 days recorded${rank ? ' · Rank: ' + rank + '/' + totalRanked : ''}</div>
        ${adherencePct < 80 ? '<div style="font-size:11px;color:#9a3412;margin-top:4px">Wear your WHOOP band 24/7 including sleep. Charge while wearing.</div>' : ''}
      </div>
    </div>` : '';

  const dayRows = DAYS.map((day, i) => {
    const date = new Date(new Date(weekStart).getTime() + i * 86400000);
    const dateStr = date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
    const selected = existing[day] || '';

    const buttons = SHIFT_TYPES.map(st => {
      const isSelected = selected === st.value;
      return `<label style="display:inline-block;margin:3px;cursor:pointer">
        <input type="radio" name="${day}" value="${st.value}" ${isSelected ? 'checked' : ''} style="display:none">
        <span style="display:inline-block;padding:6px 10px;border-radius:8px;font-size:12px;border:2px solid ${isSelected ? '#0f766e' : '#e5e7eb'};background:${isSelected ? '#d1fae5' : st.color};transition:all 0.15s;cursor:pointer">${st.emoji} ${st.label}</span>
      </label>`;
    }).join('');

    return `<div style="margin-bottom:16px;padding:12px;background:#fafafa;border-radius:10px">
      <div style="font-weight:600;margin-bottom:8px;font-size:14px">${DAY_LABELS[i]} <span style="color:#666;font-weight:400">(${dateStr})</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:2px">${buttons}</div>
    </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Weekly Shift Log</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin:0; padding:0; background:#f8fafc; }
  input[type=radio]:checked + span { border-color:#0f766e !important; background:#d1fae5 !important; font-weight:600; }
  label:hover span { border-color:#0f766e; }
</style>
</head><body>
<div style="max-width:600px;margin:0 auto;padding:16px">
  <div style="background:#0f766e;padding:20px;border-radius:12px 12px 0 0;text-align:center">
    <h1 style="color:white;margin:0;font-size:18px">Weekly Shift Log</h1>
    <p style="color:#d1fae5;margin:6px 0 0;font-size:13px">Week of ${weekStart} to ${weekEnd}</p>
  </div>
  <div style="background:white;border:1px solid #e5e7eb;border-top:none;padding:20px;border-radius:0 0 12px 12px">
    ${adherenceBanner}
    <p style="font-size:14px;color:#333">Dear ${name}, please select your shift type for each day this past week. <strong>One tap per day.</strong></p>
    <form method="POST" action="/api/shift-log?token=${token}">
      <input type="hidden" name="token" value="${token}">
      ${dayRows}
      <div style="text-align:center;margin-top:20px">
        <button type="submit" style="background:#0f766e;color:white;padding:14px 40px;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer">Submit Shift Log</button>
      </div>
    </form>
    <p style="font-size:11px;color:#999;margin-top:16px;text-align:center">Takes 30 seconds. Your data is confidential and used only for research.</p>
  </div>
</div>
</body></html>`;
}

function renderThanks(): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Thank You</title></head><body>
<div style="max-width:500px;margin:60px auto;text-align:center;font-family:-apple-system,sans-serif">
  <div style="font-size:60px;margin-bottom:16px">✅</div>
  <h1 style="color:#0f766e;font-size:22px;margin:0 0 8px">Shift Log Submitted</h1>
  <p style="color:#666;font-size:15px">Thank you! Your shift data has been recorded. You can close this page.</p>
</div>
</body></html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const token = (req.query.token || req.body?.token) as string;
  if (!token) return res.status(400).send('Missing token');

  // Look up the shift log entry by token
  const { data: entry } = await supabase
    .from('weekly_shift_log')
    .select('id, resident_id, week_start, sun, mon, tue, wed, thu, fri, sat, submitted_at, study_id')
    .eq('token', token)
    .limit(1)
    .single();

  if (!entry) return res.status(404).send('Invalid or expired link');

  // Get resident name + WHOOP adherence
  const { data: resident } = await supabase
    .from('burnout_participants')
    .select('full_name')
    .eq('id', entry.resident_id)
    .limit(1)
    .single();

  const name = resident?.full_name?.split(' ')[0] || 'Participant';

  // Get latest WHOOP adherence for this resident
  const { data: latestPull } = await supabase
    .from('whoop_pulls')
    .select('days_with_data, pct_recorded')
    .eq('resident_id', entry.resident_id)
    .order('pulled_at', { ascending: false })
    .limit(1)
    .single();

  const adherencePct = latestPull?.pct_recorded ?? null;
  const daysWithData = latestPull?.days_with_data ?? null;

  // Get rank among all residents
  const { data: allPulls } = await supabase
    .from('whoop_pulls')
    .select('resident_id, pct_recorded')
    .order('pulled_at', { ascending: false })
    .limit(500);

  const latestPerRes = new Map<string, number>();
  allPulls?.forEach((p: any) => { if (!latestPerRes.has(p.resident_id)) latestPerRes.set(p.resident_id, p.pct_recorded ?? 0); });
  const allAdherence = Array.from(latestPerRes.values()).sort((a, b) => b - a);
  const myRank = adherencePct != null ? allAdherence.findIndex(a => a <= adherencePct) + 1 : null;
  const totalRanked = allAdherence.length;

  if (req.method === 'GET') {
    // Render the form with adherence banner
    const existing: Record<string, string | null> = {};
    DAYS.forEach(d => { existing[d] = (entry as any)[d] || null; });
    res.setHeader('Content-Type', 'text/html');
    return res.send(renderForm(token, entry.week_start, existing, name, adherencePct, daysWithData, myRank, totalRanked));
  }

  if (req.method === 'POST') {
    // Parse form data (URL-encoded from HTML form)
    const body = req.body;
    const update: Record<string, string | null> = { submitted_at: new Date().toISOString() };

    DAYS.forEach(d => {
      const val = body[d];
      if (val && SHIFT_TYPES.some(st => st.value === val)) {
        update[d] = val;
      }
    });

    await supabase
      .from('weekly_shift_log')
      .update(update)
      .eq('id', entry.id);

    res.setHeader('Content-Type', 'text/html');
    return res.send(renderThanks());
  }

  return res.status(405).send('Method not allowed');
}
