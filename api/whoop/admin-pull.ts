import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import {runSync,syncClient} from './sync-engine.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Auth: verify Supabase JWT from admin user
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization' });
  }

  const supabase = syncClient();
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
