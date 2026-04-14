import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: token } = await supabase
    .from('whoop_tokens')
    .select('*')
    .limit(1)
    .single();

  if (!token) return res.json({ error: 'No tokens found' });

  const at = token.access_token;
  const results: any = {};

  // Try every possible base + path combination
  const bases = [
    'https://api.prod.whoop.com/developer/v1',
    'https://api.prod.whoop.com/developer/v2',
    'https://api.prod.whoop.com/v1',
    'https://api.prod.whoop.com/v2',
  ];

  const paths = [
    '/recovery',
    '/activity/sleep',
    '/activity/workout',
    '/sleep',
    '/workout',
  ];

  for (const base of bases) {
    for (const path of paths) {
      const url = `${base}${path}?limit=1`;
      try {
        const r = await fetch(url, {
          headers: { Authorization: `Bearer ${at}` },
        });
        const key = `${base.replace('https://api.prod.whoop.com','')}${path}`;
        if (r.status === 200) {
          const body = await r.text();
          results[key] = { status: 200, body: body.substring(0, 300) };
        } else {
          results[key] = { status: r.status };
        }
      } catch (e: any) {
        results[`${base}${path}`] = { error: e.message };
      }
    }
  }

  return res.json(results);
}
