import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Daily granularity WHOOP pull — stores one row per resident per day
// Runs after the main cron-pull (which does 25-day averages)
// Schedule: 3:30 AM UTC daily (right after cron-pull at 3:00 AM)

const WHOOP_TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';
const WHOOP_API_V2 = 'https://api.prod.whoop.com/developer/v2';
const CLIENT_ID = process.env.WHOOP_CLIENT_ID!;
const CLIENT_SECRET = process.env.WHOOP_CLIENT_SECRET!;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const CRON_SECRET = process.env.CRON_SECRET || SUPABASE_KEY;

interface TokenRow {
  id: string;
  resident_id: string;
  access_token: string;
  refresh_token: string | null;
  expires_at: string;
}

async function refreshToken(token: TokenRow, supabase: any): Promise<string | null> {
  // Always refresh — keeps tokens alive in DB between cron runs
  if (!token.refresh_token) return token.access_token;

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
    await supabase.from('whoop_tokens').update({
      access_token: data.access_token,
      refresh_token: data.refresh_token || token.refresh_token,
      expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', token.id);
    return data.access_token;
  } catch { return null; }
}

async function whoopGet(path: string, accessToken: string) {
  const res = await fetch(`${WHOOP_API_V2}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  return res.json();
}

function formatMin(ms: number | null | undefined): number | null {
  return ms != null ? ms / 60000 : null;
}

async function pullDaily(token: TokenRow, supabase: any) {
  const accessToken = await refreshToken(token, supabase);
  if (!accessToken) return { resident_id: token.resident_id, status: 'token_failed', days: 0 };

  // Pull full 25 days retrospectively — captures entire block evolution
  const [recoveryData, sleepData, cycleData] = await Promise.all([
    whoopGet('/recovery?limit=25', accessToken),
    whoopGet('/activity/sleep?limit=25', accessToken),
    whoopGet('/cycle?limit=25', accessToken),
  ]);

  const recoveries = (recoveryData?.records || []).filter((r: any) => r.score_state === 'SCORED' && r.score);
  const allSleeps = (sleepData?.records || []).filter((s: any) => s.score_state === 'SCORED' && s.score);
  const cycles = (cycleData?.records || []).filter((c: any) => c.score_state === 'SCORED' && c.score);

  // Get study_id
  const { data: resident } = await supabase
    .from('burnout_participants')
    .select('study_id')
    .eq('id', token.resident_id)
    .limit(1)
    .single();

  const studyId = resident?.study_id || null;
  let inserted = 0;

  // Index recoveries by date
  const recoveryByDate = new Map<string, any>();
  recoveries.forEach((r: any) => {
    const date = r.created_at?.slice(0, 10);
    if (date) recoveryByDate.set(date, r);
  });

  // Index sleeps by date (use end date as the "night of" date)
  const sleepByDate = new Map<string, any>();
  const napsByDate = new Map<string, any[]>();
  allSleeps.forEach((s: any) => {
    // Use the end time's date as the sleep date (sleep that ends on Jun 22 = night of Jun 21-22)
    const date = s.end?.slice(0, 10);
    if (!date) return;
    if (s.nap) {
      if (!napsByDate.has(date)) napsByDate.set(date, []);
      napsByDate.get(date)!.push(s);
    } else {
      sleepByDate.set(date, s);
    }
  });

  // Index cycles by date
  const cycleByDate = new Map<string, any>();
  cycles.forEach((c: any) => {
    const date = c.start?.slice(0, 10);
    if (date) cycleByDate.set(date, c);
  });

  // Get all unique dates
  const allDates = new Set<string>();
  recoveryByDate.forEach((_, d) => allDates.add(d));
  sleepByDate.forEach((_, d) => allDates.add(d));
  cycleByDate.forEach((_, d) => allDates.add(d));

  for (const date of Array.from(allDates)) {
    const rec = recoveryByDate.get(date);
    const slp = sleepByDate.get(date);
    const cyc = cycleByDate.get(date);
    const st = slp?.score?.stage_summary;
    const sn = slp?.score?.sleep_needed;

    const row = {
      study_id: studyId,
      resident_id: token.resident_id,
      date,
      is_nap: false,
      // Recovery
      hrv_rmssd_ms: rec?.score?.hrv_rmssd_milli ?? null,
      resting_hr_bpm: rec?.score?.resting_heart_rate ?? null,
      spo2_pct: rec?.score?.spo2_percentage ?? null,
      skin_temp_c: rec?.score?.skin_temp_celsius ?? null,
      recovery_score: rec?.score?.recovery_score ?? null,
      user_calibrating: rec?.score?.user_calibrating ?? null,
      // Sleep
      total_sleep_min: st ? (st.total_in_bed_time_milli - st.total_awake_time_milli) / 60000 : null,
      light_sleep_min: formatMin(st?.total_light_sleep_time_milli),
      deep_sleep_min: formatMin(st?.total_slow_wave_sleep_time_milli),
      rem_sleep_min: formatMin(st?.total_rem_sleep_time_milli),
      awake_min: formatMin(st?.total_awake_time_milli),
      sleep_efficiency_pct: slp?.score?.sleep_efficiency_percentage ?? null,
      sleep_consistency_pct: slp?.score?.sleep_consistency_percentage ?? null,
      sleep_performance_pct: slp?.score?.sleep_performance_percentage ?? null,
      respiratory_rate: slp?.score?.respiratory_rate ?? null,
      disturbance_count: st?.disturbance_count ?? null,
      sleep_cycle_count: st?.sleep_cycle_count ?? null,
      sleep_onset_time: slp?.start ?? null,
      sleep_end_time: slp?.end ?? null,
      sleep_debt_min: sn?.need_from_sleep_debt_milli != null ? sn.need_from_sleep_debt_milli / 60000 : null,
      sleep_need_baseline_min: sn?.baseline_milli != null ? sn.baseline_milli / 60000 : null,
      sleep_need_strain_min: sn?.need_from_recent_strain_milli != null ? sn.need_from_recent_strain_milli / 60000 : null,
      // Strain
      daily_strain: cyc?.score?.strain ?? null,
      avg_hr_bpm: cyc?.score?.average_heart_rate ?? null,
      max_hr_bpm: cyc?.score?.max_heart_rate ?? null,
      kilojoules: cyc?.score?.kilojoule ?? null,
      // IDs
      cycle_id: cyc?.id?.toString() ?? null,
      sleep_id: slp?.id ?? null,
      pulled_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('whoop_daily')
      .upsert(row, { onConflict: 'resident_id,date,is_nap' });

    if (!error) inserted++;
  }

  return { resident_id: token.resident_id, status: 'success', days: inserted };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers['authorization']?.replace('Bearer ', '') || req.headers['x-api-key'];
  if (authHeader !== CRON_SECRET && authHeader !== SUPABASE_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Support batch param to process subset (0-indexed): ?batch=0&size=20
  const batchNum = parseInt(String(req.query.batch ?? '0'), 10);
  const batchSize = parseInt(String(req.query.size ?? '20'), 10);

  const { data: tokens } = await supabase
    .from('whoop_tokens')
    .select('id, resident_id, access_token, refresh_token, expires_at')
    .order('resident_id')
    .limit(1000);

  if (!tokens || tokens.length === 0) {
    return res.json({ pulled: 0, message: 'No tokens' });
  }

  const start = batchNum * batchSize;
  const batch = tokens.slice(start, start + batchSize);

  if (batch.length === 0) {
    return res.json({ message: 'No tokens in this batch', batch: batchNum, total: tokens.length });
  }

  const results = [];
  for (const token of batch) {
    const result = await pullDaily(token, supabase);
    results.push(result);
    await new Promise(r => setTimeout(r, 200));
  }

  const succeeded = results.filter(r => r.status === 'success').length;
  const totalDays = results.reduce((s, r) => s + r.days, 0);

  return res.json({
    pulled_at: new Date().toISOString(),
    batch: batchNum,
    batch_size: batchSize,
    total_residents: tokens.length,
    processed: batch.length,
    succeeded,
    failed: results.filter(r => r.status !== 'success').length,
    total_daily_records: totalDays,
    has_more: start + batchSize < tokens.length,
    results,
  });
}
