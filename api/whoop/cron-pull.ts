import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const WHOOP_TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';
const WHOOP_API_V2 = 'https://api.prod.whoop.com/developer/v2';
const CLIENT_ID = process.env.WHOOP_CLIENT_ID!;
const CLIENT_SECRET = process.env.WHOOP_CLIENT_SECRET!;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const CRON_SECRET = process.env.CRON_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface TokenRow {
  id: string;
  resident_id: string;
  whoop_user_id: string;
  access_token: string;
  refresh_token: string | null;
  expires_at: string;
}

async function refreshAccessToken(token: TokenRow, supabase: any): Promise<string | null> {
  const now = new Date();
  const expires = new Date(token.expires_at);

  // Token still valid
  if (now.getTime() < expires.getTime() - 60000) return token.access_token;

  // No refresh token — can't refresh
  if (!token.refresh_token) return null;

  try {
    const res = await fetch(WHOOP_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: token.refresh_token,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    await supabase
      .from('whoop_tokens')
      .update({
        access_token: data.access_token,
        refresh_token: data.refresh_token || token.refresh_token,
        expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', token.id);

    return data.access_token;
  } catch {
    return null;
  }
}

async function whoopGet(path: string, accessToken: string) {
  const res = await fetch(`${WHOOP_API_V2}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  return res.json();
}

function avg(nums: number[]): number | null {
  const valid = nums.filter(n => n != null && !isNaN(n));
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function formatMin(ms: number | null | undefined): number | null {
  return ms != null ? ms / 60000 : null;
}

async function pullResident(token: TokenRow, supabase: any) {
  const accessToken = await refreshAccessToken(token, supabase);
  if (!accessToken) return { resident_id: token.resident_id, status: 'token_failed' };

  // Pull all available data (up to 25 records each — most recent first)
  const [recoveryData, sleepData, cycleData, workoutData] = await Promise.all([
    whoopGet('/recovery?limit=25', accessToken),
    whoopGet('/activity/sleep?limit=25', accessToken),
    whoopGet('/cycle?limit=25', accessToken),
    whoopGet('/activity/workout?limit=25', accessToken),
  ]);

  const recoveries = (recoveryData?.records || []).filter((r: any) => r.score_state === 'SCORED' && r.score);
  const allSleeps = (sleepData?.records || []).filter((s: any) => s.score_state === 'SCORED' && s.score);
  const sleeps = allSleeps.filter((s: any) => !s.nap);
  const naps = allSleeps.filter((s: any) => s.nap);
  const cycles = (cycleData?.records || []).filter((c: any) => c.score_state === 'SCORED' && c.score);
  const workouts = (workoutData?.records || []).filter((w: any) => w.score_state === 'SCORED' && w.score);

  // Determine date range from actual data
  const allDates = [
    ...cycles.map((c: any) => c.start),
    ...sleeps.map((s: any) => s.start),
    ...recoveries.map((r: any) => r.created_at),
  ].filter(Boolean).map((d: string) => new Date(d));

  if (allDates.length === 0) {
    return { resident_id: token.resident_id, status: 'no_data', days_with_data: 0 };
  }

  const earliest = new Date(Math.min(...allDates.map(d => d.getTime())));
  const latest = new Date(Math.max(...allDates.map(d => d.getTime())));
  const periodStart = earliest.toISOString().slice(0, 10);
  const periodEnd = latest.toISOString().slice(0, 10);

  // Get study_id
  const { data: resident } = await supabase
    .from('burnout_participants')
    .select('study_id')
    .eq('id', token.resident_id)
    .limit(1)
    .single();

  // Compute sleep onset/wake averages
  const sleepOnsets = sleeps.map((s: any) => {
    const d = new Date(s.start);
    return d.getHours() * 60 + d.getMinutes();
  });
  const sleepWakes = sleeps.map((s: any) => {
    const d = new Date(s.end);
    return d.getHours() * 60 + d.getMinutes();
  });

  // Compute restorative sleep (REM + Deep)
  const restorativeMins = sleeps.map((s: any) => {
    const st = s.score?.stage_summary;
    if (!st) return null;
    return ((st.total_rem_sleep_time_milli || 0) + (st.total_slow_wave_sleep_time_milli || 0)) / 60000;
  }).filter(Boolean);

  // HR zone totals from workouts
  let z1 = 0, z2 = 0, z3 = 0, z4 = 0, z5 = 0;
  workouts.forEach((w: any) => {
    const zd = w.score?.zone_duration;
    if (zd) {
      z1 += zd.zone_one_milli || 0;
      z2 += zd.zone_two_milli || 0;
      z3 += zd.zone_three_milli || 0;
      z4 += zd.zone_four_milli || 0;
      z5 += zd.zone_five_milli || 0;
    }
  });

  const pullData = {
    study_id: resident?.study_id || null,
    resident_id: token.resident_id,
    period_start: periodStart,
    period_end: periodEnd,
    // Recovery
    avg_hrv_rmssd_ms: avg(recoveries.map((r: any) => r.score.hrv_rmssd_milli)),
    avg_resting_hr_bpm: avg(recoveries.map((r: any) => r.score.resting_heart_rate)),
    avg_spo2_pct: avg(recoveries.map((r: any) => r.score.spo2_percentage)),
    avg_skin_temp_c: avg(recoveries.map((r: any) => r.score.skin_temp_celsius)),
    avg_recovery_score: avg(recoveries.map((r: any) => r.score.recovery_score)),
    // Sleep
    avg_total_sleep_min: avg(sleeps.map((s: any) => {
      const st = s.score?.stage_summary;
      if (!st) return null;
      return (st.total_in_bed_time_milli - st.total_awake_time_milli) / 60000;
    }).filter(Boolean)),
    avg_light_sleep_min: avg(sleeps.map((s: any) => formatMin(s.score?.stage_summary?.total_light_sleep_time_milli)).filter(Boolean) as number[]),
    avg_deep_sleep_min: avg(sleeps.map((s: any) => formatMin(s.score?.stage_summary?.total_slow_wave_sleep_time_milli)).filter(Boolean) as number[]),
    avg_rem_sleep_min: avg(sleeps.map((s: any) => formatMin(s.score?.stage_summary?.total_rem_sleep_time_milli)).filter(Boolean) as number[]),
    avg_sleep_efficiency_pct: avg(sleeps.map((s: any) => s.score?.sleep_efficiency_percentage).filter(Boolean)),
    avg_sleep_consistency_pct: avg(sleeps.map((s: any) => s.score?.sleep_consistency_percentage).filter(Boolean)),
    avg_sleep_performance_pct: avg(sleeps.map((s: any) => s.score?.sleep_performance_percentage).filter(Boolean)),
    avg_sleep_debt_min: avg(sleeps.map((s: any) => {
      const sn = s.score?.sleep_needed;
      return sn ? sn.need_from_sleep_debt_milli / 60000 : null;
    }).filter(Boolean)),
    avg_respiratory_rate_bpm: avg(sleeps.map((s: any) => s.score?.respiratory_rate).filter(Boolean)),
    avg_time_in_bed_min: avg(sleeps.map((s: any) => formatMin(s.score?.stage_summary?.total_in_bed_time_milli)).filter(Boolean) as number[]),
    avg_disturbance_count: avg(sleeps.map((s: any) => s.score?.stage_summary?.disturbance_count).filter(Boolean)),
    nap_count: naps.length,
    // Strain & Activity
    avg_daily_strain: avg(cycles.map((c: any) => c.score?.strain).filter(Boolean)),
    avg_hr_bpm: avg(cycles.map((c: any) => c.score?.average_heart_rate).filter(Boolean)),
    max_hr_bpm: cycles.length > 0 ? Math.max(...cycles.map((c: any) => c.score?.max_heart_rate || 0)) : null,
    avg_kilojoules: avg(cycles.map((c: any) => c.score?.kilojoule).filter(Boolean)),
    hr_zone1_min: z1 > 0 ? z1 / 60000 : null,
    hr_zone2_min: z2 > 0 ? z2 / 60000 : null,
    hr_zone3_min: z3 > 0 ? z3 / 60000 : null,
    hr_zone4_min: z4 > 0 ? z4 / 60000 : null,
    hr_zone5_min: z5 > 0 ? z5 / 60000 : null,
    workout_count: workouts.length,
    // Data quality
    days_with_data: cycles.length,
    pct_recorded: cycles.length > 0 ? Math.round((cycles.length / 25) * 100) : 0,
    pulled_at: new Date().toISOString(),
  };

  // Upsert
  const { error: upsertErr } = await supabase
    .from('whoop_pulls')
    .upsert(pullData, { onConflict: 'resident_id,period_start,period_end' });

  return {
    resident_id: token.resident_id,
    status: upsertErr ? 'db_error' : 'success',
    days_with_data: pullData.days_with_data,
    avg_hrv: pullData.avg_hrv_rmssd_ms,
    avg_rhr: pullData.avg_resting_hr_bpm,
    avg_sleep_min: pullData.avg_total_sleep_min,
    recovery: pullData.avg_recovery_score,
    strain: pullData.avg_daily_strain,
    error: upsertErr?.message,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Auth: accept cron secret or service role key
  const authHeader = req.headers['authorization']?.replace('Bearer ', '') || req.headers['x-api-key'];
  if (authHeader !== CRON_SECRET && authHeader !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Get all tokens
  const { data: tokens, error: tokErr } = await supabase
    .from('whoop_tokens')
    .select('*')
    .limit(200);

  if (tokErr || !tokens || tokens.length === 0) {
    return res.json({ pulled: 0, message: 'No enrolled residents with WHOOP tokens' });
  }

  const results = [];
  for (const token of tokens) {
    const result = await pullResident(token, supabase);
    results.push(result);
    // Small delay to respect rate limits
    await new Promise(r => setTimeout(r, 200));
  }

  const succeeded = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status !== 'success' && r.status !== 'no_data').length;

  return res.json({
    pulled_at: new Date().toISOString(),
    total_residents: tokens.length,
    succeeded,
    failed,
    results,
  });
}
