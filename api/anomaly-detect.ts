import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const CRON_SECRET = process.env.CRON_SECRET || SUPABASE_KEY;
const SITE_URL = process.env.SITE_URL || 'https://www.medresearch-academy.om';

// CC on every anomaly email
const TEAM_CC = ['dr.abdullahalalawi@gmail.com', 'mrawahi@squ.edu.om'];

// Cooldown: don't re-ask same anomaly type within 5 days
const COOLDOWN_DAYS = 5;

// ── Pattern definitions ──────────────────────────────────────────────

interface AnomalyPattern {
  id: string;
  name: string;
  detect: (current: PullData, baseline: PullData) => boolean;
  subject: string;
  question: string;
  options: string[];
}

interface PullData {
  avg_hrv_rmssd_ms: number | null;
  avg_resting_hr_bpm: number | null;
  avg_recovery_score: number | null;
  avg_total_sleep_min: number | null;
  avg_daily_strain: number | null;
  avg_sleep_efficiency_pct: number | null;
  avg_respiratory_rate_bpm: number | null;
  days_with_data: number | null;
}

const PATTERNS: AnomalyPattern[] = [
  {
    id: 'hrv_drop',
    name: 'HRV Drop >25%',
    detect: (cur, base) => {
      if (!cur.avg_hrv_rmssd_ms || !base.avg_hrv_rmssd_ms) return false;
      const drop = (base.avg_hrv_rmssd_ms - cur.avg_hrv_rmssd_ms) / base.avg_hrv_rmssd_ms;
      return drop > 0.25;
    },
    subject: 'We noticed a change in your heart rate variability',
    question: 'Your HRV (heart rate variability) has dropped significantly compared to your baseline. This can happen for many reasons. Were any of the following factors present this week?',
    options: [
      'Health-related factor',
      'Medication change',
      'Academic demands',
      'Lifestyle or routine change',
      'Physical factor (exercise, fasting, etc.)',
      'Nothing unusual — I feel fine',
      'Prefer not to specify',
    ],
  },
  {
    id: 'rhr_spike',
    name: 'Resting HR Spike >10%',
    detect: (cur, base) => {
      if (!cur.avg_resting_hr_bpm || !base.avg_resting_hr_bpm) return false;
      const rise = (cur.avg_resting_hr_bpm - base.avg_resting_hr_bpm) / base.avg_resting_hr_bpm;
      return rise > 0.10;
    },
    subject: 'Your resting heart rate has been elevated',
    question: 'Your resting heart rate has been higher than your usual baseline. This sometimes indicates your body is dealing with something. Have you experienced any of the following?',
    options: [
      'Health-related factor',
      'Medication change',
      'Increased stress',
      'Lifestyle change',
      'Nothing unusual',
      'Prefer not to specify',
    ],
  },
  {
    id: 'sleep_drop',
    name: 'Sleep <5h for 3+ days (non-call)',
    detect: (cur, _base) => {
      if (!cur.avg_total_sleep_min) return false;
      return cur.avg_total_sleep_min < 300; // 5 hours
    },
    subject: 'Your sleep has been shorter than usual',
    question: 'Your average sleep has dropped below 5 hours per night recently. This is below the recommended minimum. Is there a specific reason?',
    options: [
      'Difficulty sleeping',
      'Academic demands',
      'Health-related factor',
      'Family or personal commitment',
      'Lifestyle change',
      'Nothing specific',
      'Prefer not to specify',
    ],
  },
  {
    id: 'recovery_crash',
    name: 'Recovery <30% sustained',
    detect: (cur, _base) => {
      if (!cur.avg_recovery_score) return false;
      return cur.avg_recovery_score < 30;
    },
    subject: 'Your recovery score has been low',
    question: 'Your WHOOP recovery score has been consistently below 30% (red zone). This suggests your body is under significant stress. Have any of the following contributed?',
    options: [
      'Health-related factor',
      'Physical exertion',
      'Medication change',
      'Poor sleep',
      'Increased demands (non-work)',
      'Nothing unusual',
      'Prefer not to specify',
    ],
  },
  {
    id: 'resp_rate_spike',
    name: 'Respiratory Rate >20 breaths/min',
    detect: (cur, base) => {
      if (!cur.avg_respiratory_rate_bpm || !base.avg_respiratory_rate_bpm) return false;
      return cur.avg_respiratory_rate_bpm > 20 && cur.avg_respiratory_rate_bpm > base.avg_respiratory_rate_bpm * 1.15;
    },
    subject: 'Your respiratory rate has been elevated',
    question: 'Your breathing rate during sleep has been higher than normal. This can indicate illness, stress, or other factors. Have you experienced any of the following?',
    options: [
      'Respiratory symptoms',
      'Health-related factor',
      'Increased stress',
      'Medication change',
      'Nothing unusual',
      'Prefer not to specify',
    ],
  },
  {
    id: 'sleep_efficiency_drop',
    name: 'Sleep Efficiency <70%',
    detect: (cur, base) => {
      if (!cur.avg_sleep_efficiency_pct || !base.avg_sleep_efficiency_pct) return false;
      return cur.avg_sleep_efficiency_pct < 70 && base.avg_sleep_efficiency_pct >= 75;
    },
    subject: 'Your sleep quality has declined',
    question: 'Your sleep efficiency has dropped below 70%, meaning you are spending significant time in bed awake. What might be contributing?',
    options: [
      'Difficulty staying asleep',
      'Environmental factor',
      'Health-related factor',
      'Increased stress',
      'Family or personal commitment',
      'Nothing specific',
      'Prefer not to specify',
    ],
  },
];

// ── Main handler ─────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers['authorization']?.replace('Bearer ', '') || req.headers['x-api-key'];
  if (authHeader !== CRON_SECRET && authHeader !== SUPABASE_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Get active participants
  const { data: participants } = await supabase
    .from('burnout_participants')
    .select('id, study_id, study_participant_id, full_name, email')
    .eq('status', 'active')
    .not('whoop_user_id', 'is', null)
    .not('email', 'is', null)
    .limit(200);

  if (!participants || participants.length === 0) {
    return res.json({ checked: 0, anomalies: 0 });
  }

  // Get recent anomaly investigations for cooldown
  const cooldownDate = new Date();
  cooldownDate.setDate(cooldownDate.getDate() - COOLDOWN_DAYS);
  const { data: recentInvestigations } = await supabase
    .from('anomaly_investigations')
    .select('resident_id, anomaly_type')
    .gte('created_at', cooldownDate.toISOString())
    .limit(500);

  const recentKeys = new Set(
    (recentInvestigations ?? []).map(a => `${a.resident_id}:${a.anomaly_type}`)
  );

  const results: Array<{ participant: string; anomalies: string[]; action: string }> = [];

  for (const p of participants) {
    // Get latest WHOOP pull (current period)
    const { data: currentPulls } = await supabase
      .from('whoop_pulls')
      .select('avg_hrv_rmssd_ms, avg_resting_hr_bpm, avg_recovery_score, avg_total_sleep_min, avg_daily_strain, avg_sleep_efficiency_pct, avg_respiratory_rate_bpm, days_with_data')
      .eq('resident_id', p.id)
      .order('pulled_at', { ascending: false })
      .limit(1);

    if (!currentPulls || currentPulls.length === 0) {
      results.push({ participant: p.study_participant_id, anomalies: [], action: 'no_data' });
      continue;
    }

    // Get baseline (2nd most recent pull, or average of older pulls)
    const { data: baselinePulls } = await supabase
      .from('whoop_pulls')
      .select('avg_hrv_rmssd_ms, avg_resting_hr_bpm, avg_recovery_score, avg_total_sleep_min, avg_daily_strain, avg_sleep_efficiency_pct, avg_respiratory_rate_bpm, days_with_data')
      .eq('resident_id', p.id)
      .order('pulled_at', { ascending: false })
      .limit(5);

    // Use average of pulls 2-5 as baseline (skip the latest)
    const baselineData = (baselinePulls ?? []).slice(1);
    if (baselineData.length === 0) {
      results.push({ participant: p.study_participant_id, anomalies: [], action: 'no_baseline' });
      continue;
    }

    const avgField = (arr: PullData[], field: keyof PullData): number | null => {
      const vals = arr.map(r => r[field]).filter((v): v is number => v != null);
      return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    };

    const baseline: PullData = {
      avg_hrv_rmssd_ms: avgField(baselineData, 'avg_hrv_rmssd_ms'),
      avg_resting_hr_bpm: avgField(baselineData, 'avg_resting_hr_bpm'),
      avg_recovery_score: avgField(baselineData, 'avg_recovery_score'),
      avg_total_sleep_min: avgField(baselineData, 'avg_total_sleep_min'),
      avg_daily_strain: avgField(baselineData, 'avg_daily_strain'),
      avg_sleep_efficiency_pct: avgField(baselineData, 'avg_sleep_efficiency_pct'),
      avg_respiratory_rate_bpm: avgField(baselineData, 'avg_respiratory_rate_bpm'),
      days_with_data: avgField(baselineData, 'days_with_data'),
    };

    const current = currentPulls[0];
    const detectedAnomalies: AnomalyPattern[] = [];

    for (const pattern of PATTERNS) {
      if (recentKeys.has(`${p.id}:${pattern.id}`)) continue; // cooldown
      if (pattern.detect(current, baseline)) {
        detectedAnomalies.push(pattern);
      }
    }

    if (detectedAnomalies.length === 0) {
      results.push({ participant: p.study_participant_id, anomalies: [], action: 'ok' });
      continue;
    }

    // Send investigation email for each anomaly
    for (const anomaly of detectedAnomalies) {
      const token = crypto.randomBytes(24).toString('hex');

      // Save to DB
      const triggerDetail: Record<string, unknown> = {
        current_hrv: current.avg_hrv_rmssd_ms,
        baseline_hrv: baseline.avg_hrv_rmssd_ms,
        current_rhr: current.avg_resting_hr_bpm,
        baseline_rhr: baseline.avg_resting_hr_bpm,
        current_recovery: current.avg_recovery_score,
        current_sleep_min: current.avg_total_sleep_min,
        current_sleep_eff: current.avg_sleep_efficiency_pct,
        current_resp: current.avg_respiratory_rate_bpm,
        baseline_resp: baseline.avg_respiratory_rate_bpm,
      };

      await supabase
        .from('anomaly_investigations')
        .insert({
          study_id: p.study_id,
          resident_id: p.id,
          anomaly_type: anomaly.id,
          trigger_detail: triggerDetail,
          token,
        });

      // Build response buttons as links
      const responseUrl = `${SITE_URL}/api/anomaly-respond`;
      const optionButtons = anomaly.options.map(opt => {
        const encoded = encodeURIComponent(opt);
        return `<a href="${responseUrl}?token=${token}&response=${encoded}" style="display:block;width:100%;padding:12px 16px;margin:4px 0;border-radius:8px;background:#f8fafc;border:1px solid #e2e8f0;color:#1a3a5c;text-decoration:none;font-size:14px;text-align:left;">${opt}</a>`;
      }).join('\n');

      // Send to resident, CC team
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'WHOOP Resident Study Team <info@medresearch-academy.om>',
          to: [p.email],
          cc: TEAM_CC,
          subject: `WHOOP Study — ${anomaly.subject}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#333;">
<div style="background:linear-gradient(135deg,#1a3a5c,#0f2847);padding:24px;border-radius:12px 12px 0 0;text-align:center;">
<h1 style="color:white;margin:0;font-size:17px;">WHOOP Study</h1>
<p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:13px;">${p.study_participant_id} — Biometric Pattern Detected</p>
</div>
<div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 12px 12px;">
<p>Dear ${p.full_name || 'Participant'},</p>
<p style="font-size:14px;line-height:1.7;color:#444;">${anomaly.question}</p>
<p style="font-size:13px;color:#666;margin-bottom:16px;"><strong>Please tap the option that best applies:</strong></p>
${optionButtons}
<hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
<p style="font-size:12px;color:#999;line-height:1.6;">This is a confidential research inquiry. Your response helps us understand the context behind your biophysical data. If you have concerns about your health, please consult your physician.</p>
<p style="font-size:12px;color:#999;">WHOOP Resident Study Team — info@medresearch-academy.om</p>
</div></div>`,
        }),
      });
    }

    results.push({
      participant: p.study_participant_id,
      anomalies: detectedAnomalies.map(a => a.id),
      action: 'investigated',
    });

    // Small delay between participants
    await new Promise(r => setTimeout(r, 300));
  }

  const investigated = results.filter(r => r.action === 'investigated').length;

  return res.json({
    checked_at: new Date().toISOString(),
    total: participants.length,
    ok: results.filter(r => r.action === 'ok').length,
    no_data: results.filter(r => r.action === 'no_data').length,
    no_baseline: results.filter(r => r.action === 'no_baseline').length,
    investigated,
    results,
  });
}
