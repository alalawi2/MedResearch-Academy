import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { createHmac, timingSafeEqual } from 'crypto';

type EnrollmentTokenPayload = { participantId: string; exp: number };

function verifyEnrollmentToken(token: string | undefined | null): EnrollmentTokenPayload | null {
  if (!token) return null;
  const secret = process.env.ENROLLMENT_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!secret) return null;
  const [enc, sig] = token.split('.');
  if (!enc || !sig) return null;
  const expected = createHmac('sha256', secret).update(enc).digest('base64url');
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(enc, 'base64url').toString('utf8')) as EnrollmentTokenPayload;
    if (!p.participantId || !p.exp || p.exp < Math.floor(Date.now() / 1000)) return null;
    return p;
  } catch { return null; }
}

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

  const enrollmentToken = typeof req.body?.enrollmentToken === 'string' ? req.body.enrollmentToken : null;
  const tokenPayload = verifyEnrollmentToken(enrollmentToken);

  if (tokenPayload?.participantId) {
    const { data: byParticipantId } = await supabase
      .from('burnout_participants')
      .select('id, study_participant_id')
      .eq('study_participant_id', tokenPayload.participantId)
      .is('auth_user_id', null)
      .limit(1)
      .single();

    if (byParticipantId) {
      const { error: tokenUpdateErr } = await supabase
        .from('burnout_participants')
        .update({ auth_user_id: user.id })
        .eq('id', byParticipantId.id);

      if (tokenUpdateErr) {
        console.error('Token link error:', tokenUpdateErr);
        return res.status(500).json({ error: 'Failed to link account' });
      }

      await logLinkEvent(supabase, byParticipantId.id, byParticipantId.study_participant_id, user.id, user.email, 'enrollment_token');
      return res.json({ profile: byParticipantId, action: 'linked_by_token' });
    }
  }

  // Try to link by email (exact match)
  const { data: byEmail } = await supabase
    .from('burnout_participants')
    .select('id, study_participant_id')
    .ilike('email', user.email)
    .is('auth_user_id', null)
    .limit(1)
    .single();

  // Fallback: if email doesn't match, try case-insensitive email
  let match = byEmail;
  if (!match && user.email) {
    const { data: byEmailCI } = await supabase
      .from('burnout_participants')
      .select('id, study_participant_id')
      .ilike('email', user.email)
      .is('auth_user_id', null)
      .limit(1)
      .single();
    match = byEmailCI;
  }

  // No more fallback — enrollment token or email match only.
  // The old 30-min fallback caused cross-linking between residents.

  if (!match) return res.status(404).json({ error: 'not_enrolled' });

  // Link auth_user_id (service role bypasses RLS)
  const { error: updateErr } = await supabase
    .from('burnout_participants')
    .update({ auth_user_id: user.id })
    .eq('id', match.id);

  if (updateErr) {
    console.error('Link error:', updateErr);
    return res.status(500).json({ error: 'Failed to link account' });
  }

  const method = match === byEmail ? 'email_exact' : 'email_ci';
  await logLinkEvent(supabase, match.id, match.study_participant_id, user.id, user.email, method);
  return res.json({ profile: match, action: 'linked' });
}

async function logLinkEvent(
  supabase: any,
  participantDbId: string,
  studyParticipantId: string,
  authUserId: string,
  authEmail: string | undefined,
  method: string,
) {
  try {
    await supabase.from('enrollment_events').insert({
      resident_id: participantDbId,
      event_type: 'auth_linked',
      details: {
        participant_id: studyParticipantId,
        auth_user_id: authUserId,
        auth_email: authEmail || null,
        method,
      },
    });
  } catch (err) {
    console.error('Failed to log link event:', err);
  }
}
