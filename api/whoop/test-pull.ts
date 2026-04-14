import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const WHOOP_API = 'https://api.prod.whoop.com/developer/v1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get the first token
  const { data: token } = await supabase
    .from('whoop_tokens')
    .select('*')
    .limit(1)
    .single();

  if (!token) return res.json({ error: 'No tokens found' });

  const accessToken = token.access_token;
  const results: any = { token_expires: token.expires_at };

  // Test each endpoint
  // First get cycle IDs
  const cycleRes = await fetch(`${WHOOP_API}/cycle?limit=2`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const cycleData = await cycleRes.json();
  const cycleId = cycleData?.records?.[1]?.id; // use second (completed) cycle
  results['cycle_data'] = { status: cycleRes.status, first_two: cycleData?.records?.map((r:any) => ({ id: r.id, score_state: r.score_state, start: r.start, end: r.end })) };

  const endpoints = [
    `/cycle/${cycleId}`,
    `/cycle/${cycleId}/recovery`,
    `/cycle/${cycleId}/sleep`,
    `/body/measurement`,
    `/user/body/measurement`,
  ];

  for (const ep of endpoints) {
    try {
      const r = await fetch(`${WHOOP_API}${ep}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const body = await r.text();
      results[ep] = {
        status: r.status,
        body: body.substring(0, 500),
      };
    } catch (e: any) {
      results[ep] = { error: e.message };
    }
  }

  return res.json(results);
}
