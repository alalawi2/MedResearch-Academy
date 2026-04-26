import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const CRON_SECRET = process.env.CRON_SECRET || SUPABASE_KEY;

const WARNING_THRESHOLD = 70; // % — send gentle reminder to resident
const CRITICAL_THRESHOLD = 30; // % — alert team + urgent reminder to resident
const COOLDOWN_DAYS = 7; // don't re-alert same resident within this window

interface Participant {
  id: string;
  study_id: string;
  study_participant_id: string;
  full_name: string | null;
  email: string | null;
}

interface WhoopPull {
  resident_id: string;
  days_with_data: number | null;
  pct_recorded: number | null;
  pulled_at: string;
}

async function sendEmail(to: string[], subject: string, html: string) {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'WHOOP Resident Study Team <info@medresearch-academy.om>',
      to,
      subject,
      html,
    }),
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Auth
  const authHeader = req.headers['authorization']?.replace('Bearer ', '') || req.headers['x-api-key'];
  if (authHeader !== CRON_SECRET && authHeader !== SUPABASE_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Get all active participants with email
  const { data: participants } = await supabase
    .from('burnout_participants')
    .select('id, study_id, study_participant_id, full_name, email')
    .eq('status', 'active')
    .not('whoop_user_id', 'is', null)
    .not('email', 'is', null)
    .limit(200);

  if (!participants || participants.length === 0) {
    return res.json({ checked: 0, message: 'No active participants with WHOOP' });
  }

  // Get latest WHOOP pull for each participant
  const { data: pulls } = await supabase
    .from('whoop_pulls')
    .select('resident_id, days_with_data, pct_recorded, pulled_at')
    .order('pulled_at', { ascending: false })
    .limit(500);

  // Deduplicate: latest per resident
  const latestPulls = new Map<string, WhoopPull>();
  for (const p of (pulls ?? [])) {
    if (!latestPulls.has(p.resident_id)) {
      latestPulls.set(p.resident_id, p);
    }
  }

  // Get recent alerts to respect cooldown
  const cooldownDate = new Date();
  cooldownDate.setDate(cooldownDate.getDate() - COOLDOWN_DAYS);
  const { data: recentAlerts } = await supabase
    .from('adherence_alerts')
    .select('resident_id, created_at')
    .gte('created_at', cooldownDate.toISOString())
    .limit(500);

  const recentlyAlerted = new Set(
    (recentAlerts ?? []).map(a => a.resident_id)
  );

  const results: Array<{
    participant_id: string;
    name: string | null;
    pct: number | null;
    days: number | null;
    action: string;
  }> = [];

  for (const participant of participants as Participant[]) {
    const pull = latestPulls.get(participant.id);

    // No WHOOP data at all — treat as critical
    const pctRecorded = pull?.pct_recorded ?? 0;
    const daysWithData = pull?.days_with_data ?? 0;
    const lastPulled = pull?.pulled_at;

    // Check if data is stale (no pull in last 3 days)
    let isStale = false;
    if (lastPulled) {
      const pullDate = new Date(lastPulled);
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      isStale = pullDate < threeDaysAgo;
    } else {
      isStale = true; // never pulled
    }

    // Determine alert level
    let alertType: 'warning' | 'critical' | null = null;
    if (pctRecorded < CRITICAL_THRESHOLD || isStale) {
      alertType = 'critical';
    } else if (pctRecorded < WARNING_THRESHOLD) {
      alertType = 'warning';
    }

    if (!alertType) {
      results.push({
        participant_id: participant.study_participant_id,
        name: participant.full_name,
        pct: pctRecorded,
        days: daysWithData,
        action: 'ok',
      });
      continue;
    }

    // Check cooldown
    if (recentlyAlerted.has(participant.id)) {
      results.push({
        participant_id: participant.study_participant_id,
        name: participant.full_name,
        pct: pctRecorded,
        days: daysWithData,
        action: 'cooldown',
      });
      continue;
    }

    const sentTo: string[] = [];

    // Send to resident
    if (participant.email) {
      const isUrgent = alertType === 'critical';
      await sendEmail(
        [participant.email],
        isUrgent
          ? 'OMSB Burnout Study — Please Wear Your WHOOP Band'
          : 'OMSB Burnout Study — WHOOP Reminder',
        `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; color: #333;">
<div style="background: ${isUrgent ? '#dc2626' : '#f59e0b'}; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
<h1 style="color: white; margin: 0; font-size: 18px;">${isUrgent ? 'Low WHOOP Adherence' : 'WHOOP Reminder'}</h1>
</div>
<div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
<p>Dear ${participant.full_name || 'Participant'},</p>
<p>Our records show your WHOOP band has recorded data for only <strong>${Math.round(pctRecorded)}%</strong> of the expected time (${daysWithData} out of 28 days).</p>
${isUrgent ? '<p style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; color: #991b1b; font-weight: 600;">Your data quality is below the minimum threshold for the study. Please ensure your WHOOP band is charged and worn consistently.</p>' : ''}
<p>To ensure your biophysical data is complete and usable for the study, please:</p>
<ul style="line-height: 1.8;">
<li>Wear your WHOOP band <strong>24/7</strong>, including during sleep</li>
<li>Keep it <strong>charged</strong> — charge while wearing when the battery is low</li>
<li>Ensure the band fits <strong>snugly</strong> on your wrist (2 fingers above the wrist bone)</li>
</ul>
<p style="font-size: 13px; color: #666;">If your device is lost or damaged, please contact the study team immediately.</p>
<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
<p style="font-size: 13px; color: #666;">WHOOP Resident Study Team — <a href="mailto:info@medresearch-academy.om" style="color: #0f766e;">info@medresearch-academy.om</a></p>
</div></div>`,
      );
      sentTo.push(participant.email);
    }

    // Alert research team for critical cases
    if (alertType === 'critical') {
      await sendEmail(
        ['dr.abdullahalalawi@gmail.com', 'mrawahi@squ.edu.om'],
        `WHOOP Adherence Alert: ${participant.study_participant_id} — ${Math.round(pctRecorded)}%`,
        `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; color: #333;">
<div style="background: #dc2626; padding: 16px; border-radius: 12px 12px 0 0; text-align: center;">
<h1 style="color: white; margin: 0; font-size: 16px;">WHOOP Adherence Alert</h1>
</div>
<div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 20px; border-radius: 0 0 12px 12px;">
<p><strong>${participant.study_participant_id}</strong> (${participant.full_name || 'Unknown'}) has critically low WHOOP adherence:</p>
<table style="width: 100%; font-size: 14px; margin: 12px 0;">
<tr><td style="padding: 6px 0; color: #666;">Data recorded</td><td style="font-weight: 700; color: #dc2626;">${Math.round(pctRecorded)}%</td></tr>
<tr><td style="padding: 6px 0; color: #666;">Days with data</td><td style="font-weight: 700;">${daysWithData}/28</td></tr>
<tr><td style="padding: 6px 0; color: #666;">Last pull</td><td style="font-weight: 700;">${lastPulled ? new Date(lastPulled).toLocaleDateString() : 'Never'}</td></tr>
</table>
<p style="font-size: 13px; color: #666;">A reminder email has been sent to the participant. Consider following up directly if the issue persists.</p>
</div></div>`,
      );
      sentTo.push('dr.abdullahalalawi@gmail.com', 'mrawahi@squ.edu.om');
    }

    // Log the alert
    await supabase
      .from('adherence_alerts')
      .insert({
        study_id: participant.study_id,
        resident_id: participant.id,
        alert_type: alertType,
        pct_recorded: pctRecorded,
        days_with_data: daysWithData,
        message_sent_to: sentTo,
      });

    results.push({
      participant_id: participant.study_participant_id,
      name: participant.full_name,
      pct: pctRecorded,
      days: daysWithData,
      action: `${alertType}_alert_sent`,
    });
  }

  const warnings = results.filter(r => r.action === 'warning_alert_sent').length;
  const criticals = results.filter(r => r.action === 'critical_alert_sent').length;

  return res.json({
    checked_at: new Date().toISOString(),
    total_participants: participants.length,
    ok: results.filter(r => r.action === 'ok').length,
    warnings,
    criticals,
    cooldown: results.filter(r => r.action === 'cooldown').length,
    results,
  });
}
