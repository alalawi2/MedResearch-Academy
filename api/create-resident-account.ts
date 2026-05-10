import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Check participant exists
  const { data: participant } = await supabase
    .from('burnout_participants')
    .select('id, auth_user_id')
    .eq('email', email.trim().toLowerCase())
    .limit(1)
    .single();

  if (!participant) {
    return res.status(404).json({ error: 'No participant found with this email. Please enroll via WHOOP first.' });
  }

  // If already has auth account, just update password
  if (participant.auth_user_id) {
    const { error: updateErr } = await supabase.auth.admin.updateUserById(
      participant.auth_user_id,
      { password }
    );
    if (updateErr) return res.status(500).json({ error: 'Failed to update password: ' + updateErr.message });
    return res.status(200).json({ message: 'Password updated', existing: true });
  }

  // Create new auth user
  const { data: authUser, error: createErr } = await supabase.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password,
    email_confirm: true,
  });

  if (createErr) {
    // User might already exist in auth but not linked
    if (createErr.message.includes('already been registered')) {
      // Find existing auth user and link
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const existing = users?.find(u => u.email === email.trim().toLowerCase());
      if (existing) {
        await supabase
          .from('burnout_participants')
          .update({ auth_user_id: existing.id })
          .eq('id', participant.id);
        // Update password
        await supabase.auth.admin.updateUserById(existing.id, { password });
        return res.status(200).json({ message: 'Account linked and password set', existing: true });
      }
    }
    return res.status(500).json({ error: 'Failed to create account: ' + createErr.message });
  }

  // Link auth user to participant
  await supabase
    .from('burnout_participants')
    .update({ auth_user_id: authUser.user.id })
    .eq('id', participant.id);

  return res.status(200).json({ message: 'Account created', userId: authUser.user.id });
}
