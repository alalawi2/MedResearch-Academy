import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const WHOOP_TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';
const WHOOP_API_V2 = 'https://api.prod.whoop.com/developer/v2';
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
  const url = `${WHOOP_API_V2}${path}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return { _error: true, status: res.status };
  return res.json();
}

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Auth: verify Supabase JWT from admin user
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Verify the user is an admin
  const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.split(' ')[1]);
  if (authErr || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Look up staff record by auth_user_id
  const { data: staffRow } = await supabase
    .from('staff')
    .select('id')
    .eq('auth_user_id', user.id)
    .eq('active', true)
    .limit(1)
    .single();

  if (!staffRow) {
    return res.status(403).json({ error: 'Staff account not found' });
  }

  // Check role in staff_study_roles
  const { data: staffRole } = await supabase
    .from('staff_study_roles')
    .select('role')
    .eq('staff_id', staffRow.id)
    .limit(1)
    .single();

  if (!staffRole || !['super_admin', 'research_admin'].includes(staffRole.role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  // Date range: last 28 days
  const endDate = new Date().toISOString().slice(0, 10);
  const startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  // Get all WHOOP tokens
  const { data: tokens, error: tokenErr } = await supabase
    .from('whoop_tokens')
    .select('*')
    .limit(1000);

  if (tokenErr || !tokens || tokens.length === 0) {
    return res.status(404).json({ error: 'No enrolled residents with WHOOP tokens found' });
  }

  const results = [];
  for (const token of tokens) {
    const accessToken = await refreshToken(token, supabase);
    if (!accessToken) {
      results.push({ resident_id: token.resident_id, error: 'token_refresh_failed' });
      continue;
    }

    const [recoveryData, sleepData, cycleData, workoutData] = await Promise.all([
      whoopGet('/recovery?limit=25', accessToken),
      whoopGet('/activity/sleep?limit=25', accessToken),
      whoopGet('/cycle?limit=25', accessToken),
      whoopGet('/activity/workout?limit=25', accessToken),
    ]);

    const recoveries = recoveryData?._error ? [] : (recoveryData?.records || []);
    const sleeps = (sleepData?._error ? [] : (sleepData?.records || [])).filter((s: any) => !s.nap);
    const naps = (sleepData?._error ? [] : (sleepData?.records || [])).filter((s: any) => s.nap);
    const cycles = cycleData?._error ? [] : (cycleData?.records || []);
    const workouts = workoutData?._error ? [] : (workoutData?.records || []);

    const scored = (arr: any[]) => arr.filter((r: any) => r.score_state === 'SCORED' && r.score);
    const scoredRecoveries = scored(recoveries);
    const scoredSleeps = scored(sleeps);
    const scoredCycles = scored(cycles);
    const scoredWorkouts = scored(workouts);

    // HR zones
    let z0 = 0, z1 = 0, z2 = 0, z3 = 0, z4 = 0, z5 = 0;
    scoredWorkouts.forEach((w: any) => {
      const zd = w.score?.zone_duration;
      if (zd) {
        z0 += zd.zone_zero_milli || 0;
        z1 += zd.zone_one_milli || 0;
        z2 += zd.zone_two_milli || 0;
        z3 += zd.zone_three_milli || 0;
        z4 += zd.zone_four_milli || 0;
        z5 += zd.zone_five_milli || 0;
      }
    });

    // Restorative sleep
    const restorativeMins = scoredSleeps.map((s: any) => {
      const st = s.score?.stage_summary;
      if (!st) return null;
      return ((st.total_rem_sleep_time_milli || 0) + (st.total_slow_wave_sleep_time_milli || 0)) / 60000;
    }).filter(Boolean) as number[];

    const fmtMin = (ms: number | null | undefined): number | null => ms != null ? ms / 60000 : null;
    const awakeMins = scoredSleeps.map((s: any) => fmtMin(s.score?.stage_summary?.total_awake_time_milli)).filter(Boolean) as number[];
    const noDataMins = scoredSleeps.map((s: any) => fmtMin(s.score?.stage_summary?.total_no_data_time_milli)).filter(Boolean) as number[];
    const sleepCycles = scoredSleeps.map((s: any) => s.score?.stage_summary?.sleep_cycle_count).filter((v: any) => v != null) as number[];
    const sleepNeedBaseline = scoredSleeps.map((s: any) => s.score?.sleep_needed?.baseline_milli != null ? s.score.sleep_needed.baseline_milli / 60000 : null).filter(Boolean) as number[];
    const sleepNeedStrain = scoredSleeps.map((s: any) => s.score?.sleep_needed?.need_from_recent_strain_milli != null ? s.score.sleep_needed.need_from_recent_strain_milli / 60000 : null).filter(Boolean) as number[];
    const sleepNeedNap = scoredSleeps.map((s: any) => s.score?.sleep_needed?.need_from_recent_nap_milli != null ? s.score.sleep_needed.need_from_recent_nap_milli / 60000 : null).filter(Boolean) as number[];

    const sleepOnsets = scoredSleeps.map((s: any) => { const d = new Date(s.start); return d.getHours() * 60 + d.getMinutes(); });
    const sleepWakes = scoredSleeps.map((s: any) => { const d = new Date(s.end); return d.getHours() * 60 + d.getMinutes(); });

    const distances = scoredWorkouts.map((w: any) => w.score?.distance_meter).filter((v: any) => v != null && v > 0) as number[];
    const sportNames = workouts.map((w: any) => w.sport_name).filter(Boolean) as string[];
    const topSport = sportNames.length > 0
      ? sportNames.sort((a, b) => sportNames.filter(v => v === b).length - sportNames.filter(v => v === a).length)[0]
      : null;

    const pull: Record<string, any> = {
      resident_id: token.resident_id,
      study_id: null,
      period_start: startDate,
      period_end: endDate,
      avg_hrv_rmssd_ms: avg(scoredRecoveries.map((r: any) => r.score.hrv_rmssd_milli).filter(Boolean)),
      avg_resting_hr_bpm: avg(scoredRecoveries.map((r: any) => r.score.resting_heart_rate).filter(Boolean)),
      avg_spo2_pct: avg(scoredRecoveries.map((r: any) => r.score.spo2_percentage).filter(Boolean)),
      avg_skin_temp_c: avg(scoredRecoveries.map((r: any) => r.score.skin_temp_celsius).filter(Boolean)),
      avg_recovery_score: avg(scoredRecoveries.map((r: any) => r.score.recovery_score).filter(Boolean)),
      any_calibrating: scoredRecoveries.some((r: any) => r.score.user_calibrating === true),
      avg_total_sleep_min: avg(scoredSleeps.map((s: any) => { const st = s.score?.stage_summary; if (!st) return null; return (st.total_in_bed_time_milli - st.total_awake_time_milli) / 60000; }).filter(Boolean)),
      avg_light_sleep_min: avg(scoredSleeps.map((s: any) => s.score?.stage_summary?.total_light_sleep_time_milli / 60000).filter(Boolean)),
      avg_deep_sleep_min: avg(scoredSleeps.map((s: any) => s.score?.stage_summary?.total_slow_wave_sleep_time_milli / 60000).filter(Boolean)),
      avg_rem_sleep_min: avg(scoredSleeps.map((s: any) => s.score?.stage_summary?.total_rem_sleep_time_milli / 60000).filter(Boolean)),
      avg_sleep_efficiency_pct: avg(scoredSleeps.map((s: any) => s.score?.sleep_efficiency_percentage).filter(Boolean)),
      avg_sleep_consistency_pct: avg(scoredSleeps.map((s: any) => s.score?.sleep_consistency_percentage).filter(Boolean)),
      avg_sleep_performance_pct: avg(scoredSleeps.map((s: any) => s.score?.sleep_performance_percentage).filter(Boolean)),
      avg_respiratory_rate_bpm: avg(scoredSleeps.map((s: any) => s.score?.respiratory_rate).filter(Boolean)),
      avg_time_in_bed_min: avg(scoredSleeps.map((s: any) => s.score?.stage_summary?.total_in_bed_time_milli / 60000).filter(Boolean)),
      avg_disturbance_count: avg(scoredSleeps.map((s: any) => s.score?.stage_summary?.disturbance_count).filter(Boolean)),
      avg_sleep_debt_min: avg(scoredSleeps.map((s: any) => s.score?.sleep_needed?.need_from_sleep_debt_milli != null ? s.score.sleep_needed.need_from_sleep_debt_milli / 60000 : null).filter(Boolean)),
      nap_count: naps.length,
      avg_awake_time_min: avg(awakeMins),
      avg_no_data_time_min: avg(noDataMins),
      avg_sleep_cycle_count: avg(sleepCycles),
      avg_sleep_need_baseline_min: avg(sleepNeedBaseline),
      avg_sleep_need_from_strain_min: avg(sleepNeedStrain),
      avg_sleep_need_from_nap_min: avg(sleepNeedNap),
      avg_sleep_onset_min: avg(sleepOnsets),
      avg_wake_time_min: avg(sleepWakes),
      avg_restorative_sleep_min: avg(restorativeMins),
      avg_daily_strain: avg(scoredCycles.map((c: any) => c.score?.strain).filter(Boolean)),
      avg_hr_bpm: avg(scoredCycles.map((c: any) => c.score?.average_heart_rate).filter(Boolean)),
      max_hr_bpm: scoredCycles.length > 0 ? Math.max(...scoredCycles.map((c: any) => c.score?.max_heart_rate || 0)) : null,
      avg_kilojoules: avg(scoredCycles.map((c: any) => c.score?.kilojoule).filter(Boolean)),
      hr_zone0_min: z0 > 0 ? z0 / 60000 : null,
      hr_zone1_min: z1 > 0 ? z1 / 60000 : null,
      hr_zone2_min: z2 > 0 ? z2 / 60000 : null,
      hr_zone3_min: z3 > 0 ? z3 / 60000 : null,
      hr_zone4_min: z4 > 0 ? z4 / 60000 : null,
      hr_zone5_min: z5 > 0 ? z5 / 60000 : null,
      workout_count: workouts.length,
      avg_workout_distance_m: avg(distances),
      top_sport_name: topSport,
      days_with_data: scoredCycles.length,
      pct_recorded: scoredCycles.length > 0 ? Math.round((scoredCycles.length / 28) * 100) : 0,
    };

    // Get study_id
    const { data: resident } = await supabase
      .from('burnout_participants')
      .select('study_id')
      .eq('id', token.resident_id)
      .limit(1)
      .single();
    pull.study_id = resident?.study_id || null;

    const { error: upsertErr } = await supabase
      .from('whoop_pulls')
      .upsert(pull, { onConflict: 'resident_id,period_start,period_end' });

    results.push({
      resident_id: token.resident_id,
      status: upsertErr ? 'error' : 'success',
      days_with_data: pull.days_with_data,
      recovery_score: pull.avg_recovery_score,
      error: upsertErr?.message,
    });
  }

  return res.status(200).json({
    pulled: results.length,
    period: { start: startDate, end: endDate },
    results,
  });
}
