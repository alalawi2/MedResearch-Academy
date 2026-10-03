import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import {runSync} from './sync-engine.js';

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

function avg(nums: (number | null | undefined)[]): number | null {
  const valid = nums.filter((n): n is number => n != null && !isNaN(n));
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Auth: verify Supabase JWT from admin user
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  if (req.method !== 'POST') return res.status(405).json({error:'Use POST'});
  const {data: study} = await supabase.from('studies').select('id').eq('slug','resident-burnout').single();
  if (!study) return res.status(503).json({error:'Study unavailable'});

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
    .eq('study_id', study.id)
    .limit(1)
    .single();

  if (!staffRole || !['super_admin', 'research_admin'].includes(staffRole.role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  return res.json(await runSync(supabase, 90));
}
