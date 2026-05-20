import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Admin endpoint to manually enroll a participant (bypasses WHOOP OAuth).
 * Creates participant record + auth account so resident can log in immediately.
 * WHOOP can be connected later.
 *
 * POST /api/admin-enroll
 * Body: { email, full_name, password }
 * Auth: Bearer token (must be super_admin)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization?.replace('Bearer ', '');
  if (!authHeader) return res.status(401).json({ error: 'No auth token' });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Verify caller is super_admin
  const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader);
  if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

  const { data: staffRow } = await supabase
    .from('staff')
    .select('id')
    .eq('auth_user_id', user.id)
    .limit(1)
    .single();

  if (!staffRow) return res.status(403).json({ error: 'Not a staff member' });

  const { data: roleRow } = await supabase
    .from('staff_study_roles')
    .select('role')
    .eq('staff_id', staffRow.id)
    .eq('role', 'super_admin')
    .limit(1)
    .single();

  if (!roleRow) return res.status(403).json({ error: 'Super admin access required' });

  // Get request body
  const { email, full_name, password } = req.body || {};
  if (!email || !full_name || !password) {
    return res.status(400).json({ error: 'email, full_name, and password are required' });
  }

  try {
    // Get study ID
    const { data: study } = await supabase
      .from('studies')
      .select('id')
      .eq('slug', 'resident-burnout')
      .limit(1)
      .single();

    if (!study) return res.status(500).json({ error: 'Study not found' });

    // Generate next participant ID
    const { data: allIds } = await supabase
      .from('burnout_participants')
      .select('study_participant_id')
      .eq('study_id', study.id)
      .limit(1000);

    let nextNum = 1;
    if (allIds) {
      for (const row of allIds) {
        const match = row.study_participant_id?.match(/RES-(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num >= nextNum) nextNum = num + 1;
        }
      }
    }
    const participantId = `RES-${String(nextNum).padStart(3, '0')}`;

    // Create auth account
    const { data: authUser, error: createAuthErr } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
    });

    let authUserId: string;
    if (createAuthErr) {
      // If user already exists, find them
      if (createAuthErr.message.includes('already been registered')) {
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const existing = users?.find((u: any) => u.email === email.trim().toLowerCase());
        if (!existing) return res.status(400).json({ error: 'Account exists but could not find user' });
        authUserId = existing.id;
        // Update password
        await supabase.auth.admin.updateUser(authUserId, { password });
      } else {
        return res.status(400).json({ error: createAuthErr.message });
      }
    } else {
      authUserId = authUser.user.id;
    }

    // Check if participant already exists by email
    const { data: existing } = await supabase
      .from('burnout_participants')
      .select('id, study_participant_id')
      .eq('email', email.trim().toLowerCase())
      .limit(1)
      .single();

    if (existing) {
      // Link auth user to existing participant
      await supabase
        .from('burnout_participants')
        .update({ auth_user_id: authUserId })
        .eq('id', existing.id);

      return res.json({
        success: true,
        action: 'linked_existing',
        participant_id: existing.study_participant_id,
        email: email.trim().toLowerCase(),
        note: 'Existing participant linked to auth account. WHOOP not connected — can be done later.',
      });
    }

    // Create new participant record (without WHOOP)
    const { data: newParticipant, error: insertErr } = await supabase
      .from('burnout_participants')
      .insert({
        study_id: study.id,
        study_participant_id: participantId,
        full_name: full_name.trim(),
        email: email.trim().toLowerCase(),
        auth_user_id: authUserId,
        status: 'active',
        enrollment_date: new Date().toISOString().slice(0, 10),
      })
      .select('id, study_participant_id')
      .single();

    if (insertErr) {
      return res.status(500).json({ error: insertErr.message });
    }

    return res.json({
      success: true,
      action: 'created',
      participant_id: newParticipant.study_participant_id,
      email: email.trim().toLowerCase(),
      note: 'Participant created. WHOOP not connected — resident can connect later at /enroll/whoop',
    });
  } catch (err: any) {
    console.error('Admin enroll error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
