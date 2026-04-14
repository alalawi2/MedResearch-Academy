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
  const endpoints = [
    '/user/profile/basic',
    '/cycle?limit=2',
    '/recovery?limit=2',
    '/sleep?limit=2',
    '/workout?limit=2',
    '/activity/sleep?limit=2',
    '/activity/workout?limit=2',
    '/cycle/' + 'collection?limit=2',
    '/recovery/collection?limit=2',
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
