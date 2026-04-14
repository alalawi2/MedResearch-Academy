import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const WHOOP_TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';
const WHOOP_API = 'https://api.prod.whoop.com/developer/v1';
const CLIENT_ID = process.env.WHOOP_CLIENT_ID!;
const CLIENT_SECRET = process.env.WHOOP_CLIENT_SECRET!;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface TokenRow {
  id: string;
  resident_id: string;
  whoop_user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

async function refreshToken(token: TokenRow, supabase: any): Promise<string | null> {
  const now = new Date();
  const expires = new Date(token.expires_at);

  if (now < expires) return token.access_token;

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
        refresh_token: data.refresh_token,
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
  const res = await fetch(`${WHOOP_API}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  return res.json();
}

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

async function pullResidentData(token: TokenRow, supabase: any, startDate: string, endDate: string) {
  const accessToken = await refreshToken(token, supabase);
  if (!accessToken) return { error: 'token_refresh_failed', resident_id: token.resident_id };

  const params = `start=${startDate}T00:00:00.000Z&end=${endDate}T23:59:59.999Z`;

  const [recoveryData, sleepData, cycleData, workoutData] = await Promise.all([
    whoopGet(`/recovery?${params}&limit=50`, accessToken),
    whoopGet(`/activity/sleep?${params}&limit=50`, accessToken),
    whoopGet(`/cycle?${params}&limit=50`, accessToken),
    whoopGet(`/activity/workout?${params}&limit=50`, accessToken),
  ]);

  const recoveries = recoveryData?.records || [];
  const sleeps = (sleepData?.records || []).filter((s: any) => !s.nap);
  const naps = (sleepData?.records || []).filter((s: any) => s.nap);
  const cycles = cycleData?.records || [];
  const workouts = workoutData?.records || [];

  const scored = (arr: any[]) => arr.filter((r: any) => r.score_state === 'SCORED' && r.score);

  const scoredRecoveries = scored(recoveries);
  const scoredSleeps = scored(sleeps);
  const scoredCycles = scored(cycles);

  const pull = {
    resident_id: token.resident_id,
    study_id: null as string | null,
    period_start: startDate,
    period_end: endDate,
    avg_hrv_rmssd_ms: avg(scoredRecoveries.map((r: any) => r.score.hrv_rmssd_milli).filter(Boolean)),
    avg_resting_hr_bpm: avg(scoredRecoveries.map((r: any) => r.score.resting_heart_rate).filter(Boolean)),
    avg_spo2_pct: avg(scoredRecoveries.map((r: any) => r.score.spo2_percentage).filter(Boolean)),
    avg_skin_temp_c: avg(scoredRecoveries.map((r: any) => r.score.skin_temp_celsius).filter(Boolean)),
    avg_recovery_score: avg(scoredRecoveries.map((r: any) => r.score.recovery_score).filter(Boolean)),
    avg_total_sleep_min: avg(scoredSleeps.map((s: any) => {
      const st = s.score?.stage_summary;
      if (!st) return null;
      return (st.total_in_bed_time_milli - st.total_awake_time_milli) / 60000;
    }).filter(Boolean)),
    avg_light_sleep_min: avg(scoredSleeps.map((s: any) => s.score?.stage_summary?.total_light_sleep_time_milli / 60000).filter(Boolean)),
    avg_deep_sleep_min: avg(scoredSleeps.map((s: any) => s.score?.stage_summary?.total_slow_wave_sleep_time_milli / 60000).filter(Boolean)),
    avg_rem_sleep_min: avg(scoredSleeps.map((s: any) => s.score?.stage_summary?.total_rem_sleep_time_milli / 60000).filter(Boolean)),
    avg_sleep_efficiency_pct: avg(scoredSleeps.map((s: any) => s.score?.sleep_efficiency_percentage).filter(Boolean)),
    avg_sleep_consistency_pct: avg(scoredSleeps.map((s: any) => s.score?.sleep_consistency_percentage).filter(Boolean)),
    avg_sleep_performance_pct: avg(scoredSleeps.map((s: any) => s.score?.sleep_performance_percentage).filter(Boolean)),
    avg_respiratory_rate_bpm: avg(scoredSleeps.map((s: any) => s.score?.respiratory_rate).filter(Boolean)),
    avg_time_in_bed_min: avg(scoredSleeps.map((s: any) => s.score?.stage_summary?.total_in_bed_time_milli / 60000).filter(Boolean)),
    avg_disturbance_count: avg(scoredSleeps.map((s: any) => s.score?.stage_summary?.disturbance_count).filter(Boolean)),
    avg_sleep_debt_min: null as number | null,
    nap_count: naps.length,
    avg_daily_strain: avg(scoredCycles.map((c: any) => c.score?.strain).filter(Boolean)),
    avg_hr_bpm: avg(scoredCycles.map((c: any) => c.score?.average_heart_rate).filter(Boolean)),
    max_hr_bpm: scoredCycles.length > 0 ? Math.max(...scoredCycles.map((c: any) => c.score?.max_heart_rate || 0)) : null,
    avg_kilojoules: avg(scoredCycles.map((c: any) => c.score?.kilojoule).filter(Boolean)),
    hr_zone1_min: null as number | null,
    hr_zone2_min: null as number | null,
    hr_zone3_min: null as number | null,
    hr_zone4_min: null as number | null,
    hr_zone5_min: null as number | null,
    workout_count: workouts.length,
    days_with_data: scoredCycles.length,
    pct_recorded: scoredCycles.length > 0 ? Math.round((scoredCycles.length / 28) * 100) : 0,
  };

  // Get zone data from workouts
  if (workouts.length > 0) {
    const zones = workouts
      .filter((w: any) => w.score?.zone_duration)
      .flatMap((w: any) => {
        const zd = w.score.zone_duration;
        return [zd];
      });
    if (zones.length > 0) {
      const sumZones = zones.reduce((acc: any, z: any) => {
        acc.z1 += z.zone_one_milli || 0;
        acc.z2 += z.zone_two_milli || 0;
        acc.z3 += z.zone_three_milli || 0;
        acc.z4 += z.zone_four_milli || 0;
        acc.z5 += z.zone_five_milli || 0;
        return acc;
      }, { z1: 0, z2: 0, z3: 0, z4: 0, z5: 0 });
      pull.hr_zone1_min = sumZones.z1 / 60000;
      pull.hr_zone2_min = sumZones.z2 / 60000;
      pull.hr_zone3_min = sumZones.z3 / 60000;
      pull.hr_zone4_min = sumZones.z4 / 60000;
      pull.hr_zone5_min = sumZones.z5 / 60000;
    }
  }

  // Get study_id from resident
  const { data: resident } = await supabase
    .from('residents')
    .select('study_id')
    .eq('id', token.resident_id)
    .limit(1)
    .single();

  pull.study_id = resident?.study_id || null;

  return pull;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Simple auth: require service key or a secret header
  const authHeader = req.headers['x-api-key'];
  if (authHeader !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Optional: pull for a specific resident
  const residentId = req.query.resident_id as string | undefined;

  // Date range: default to last 28 days
  const endDate = req.query.end as string || new Date().toISOString().slice(0, 10);
  const startDate = req.query.start as string || new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  // Get tokens
  let tokenQuery = supabase.from('whoop_tokens').select('*').limit(200);
  if (residentId) tokenQuery = tokenQuery.eq('resident_id', residentId);

  const { data: tokens, error: tokenErr } = await tokenQuery;

  if (tokenErr || !tokens || tokens.length === 0) {
    return res.status(404).json({ error: 'No enrolled residents with WHOOP tokens found' });
  }

  const results = [];
  for (const token of tokens) {
    const pull = await pullResidentData(token, supabase, startDate, endDate);

    if ('error' in pull) {
      results.push(pull);
      continue;
    }

    // Upsert into whoop_pulls
    const { error: upsertErr } = await supabase
      .from('whoop_pulls')
      .upsert(pull, { onConflict: 'resident_id,period_start,period_end' });

    results.push({
      resident_id: token.resident_id,
      status: upsertErr ? 'error' : 'success',
      days_with_data: pull.days_with_data,
      error: upsertErr?.message,
    });
  }

  return res.status(200).json({
    pulled: results.length,
    period: { start: startDate, end: endDate },
    results,
  });
}
