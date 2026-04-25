import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization?.replace('Bearer ', '');
  if (!authHeader) return res.status(401).json({ error: 'No auth token' });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Verify the JWT to get user info
  const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader);
  if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

  // Check if already linked
  const { data: linked } = await supabase
    .from('burnout_participants')
    .select('id, study_participant_id')
    .eq('auth_user_id', user.id)
    .limit(1)
    .single();

  if (linked) return res.json({ profile: linked, action: 'already_linked' });

  // Try to link by email
  const { data: byEmail } = await supabase
    .from('burnout_participants')
    .select('id, study_participant_id')
    .eq('email', user.email)
    .is('auth_user_id', null)
    .limit(1)
    .single();

  if (!byEmail) return res.status(404).json({ error: 'not_enrolled' });

  // Link auth_user_id (service role bypasses RLS)
  const { error: updateErr } = await supabase
    .from('burnout_participants')
    .update({ auth_user_id: user.id })
    .eq('id', byEmail.id);

  if (updateErr) {
    console.error('Link error:', updateErr);
    return res.status(500).json({ error: 'Failed to link account' });
  }

  return res.json({ profile: byEmail, action: 'linked' });
}
