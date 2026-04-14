import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const WHOOP_TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';
const WHOOP_PROFILE_URL = 'https://api.prod.whoop.com/developer/v1/user/profile/basic';
const CLIENT_ID = process.env.WHOOP_CLIENT_ID!;
const CLIENT_SECRET = process.env.WHOOP_CLIENT_SECRET!;
const REDIRECT_URI = process.env.WHOOP_REDIRECT_URI!;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SITE_URL = process.env.SITE_URL || 'https://www.medresearch-academy.om';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code, error: oauthError } = req.query;

  if (oauthError || !code) {
    return res.redirect(`${SITE_URL}/enroll/whoop?error=denied`);
  }

  try {
    // Exchange authorization code for tokens
    const tokenRes = await fetch(WHOOP_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('Token exchange failed:', errText);
      return res.redirect(`${SITE_URL}/enroll/whoop?error=token_failed`);
    }

    const tokens = await tokenRes.json();
    const { access_token, refresh_token, expires_in } = tokens;

    // Fetch WHOOP user profile
    const profileRes = await fetch(WHOOP_PROFILE_URL, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    let whoopUserId = '';
    let whoopEmail = '';
    let whoopName = '';

    if (profileRes.ok) {
      const profile = await profileRes.json();
      whoopUserId = String(profile.user_id || '');
      whoopEmail = profile.email || '';
      whoopName = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
    }

    // Store in Supabase using service role (bypasses RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get the burnout study ID
    const { data: study } = await supabase
      .from('studies')
      .select('id')
      .eq('slug', 'resident-burnout')
      .limit(1)
      .single();

    if (!study) {
      console.error('Burnout study not found');
      return res.redirect(`${SITE_URL}/enroll/whoop?error=study_not_found`);
    }

    // Check if this WHOOP user is already enrolled
    const { data: existing } = await supabase
      .from('residents')
      .select('id, study_participant_id')
      .eq('study_id', study.id)
      .eq('whoop_user_id', whoopUserId)
      .limit(1)
      .single();

    if (existing) {
      // Insert or update tokens for existing resident
      const { error: tokenErr } = await supabase
        .from('whoop_tokens')
        .upsert({
          resident_id: existing.id,
          whoop_user_id: whoopUserId,
          access_token,
          refresh_token,
          expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'resident_id' });

      if (tokenErr) {
        console.error('Token upsert failed:', tokenErr);
        return res.redirect(`${SITE_URL}/enroll/whoop?error=token_save_failed&detail=${encodeURIComponent(tokenErr.message)}`);
      }

      return res.redirect(`${SITE_URL}/enroll/whoop?success=reconnected&id=${existing.study_participant_id}`);
    }

    // Generate next study participant ID
    const { data: lastResident } = await supabase
      .from('residents')
      .select('study_participant_id')
      .eq('study_id', study.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let nextNum = 1;
    if (lastResident?.study_participant_id) {
      const match = lastResident.study_participant_id.match(/(\d+)$/);
      if (match) nextNum = parseInt(match[1], 10) + 1;
    }
    const participantId = `RES-${String(nextNum).padStart(3, '0')}`;

    // Create resident record
    const { data: newResident, error: insertErr } = await supabase
      .from('residents')
      .insert({
        study_id: study.id,
        study_participant_id: participantId,
        full_name: whoopName || null,
        email: whoopEmail || null,
        whoop_user_id: whoopUserId,
        status: 'active',
        enrollment_date: new Date().toISOString().slice(0, 10),
      })
      .select('id')
      .single();

    if (insertErr) {
      console.error('Failed to create resident:', insertErr);
      return res.redirect(`${SITE_URL}/enroll/whoop?error=insert_failed`);
    }

    // Store tokens
    const { error: newTokenErr } = await supabase
      .from('whoop_tokens')
      .insert({
        resident_id: newResident.id,
        whoop_user_id: whoopUserId,
        access_token,
        refresh_token,
        expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
      });

    if (newTokenErr) {
      console.error('Token insert failed:', newTokenErr);
      return res.redirect(`${SITE_URL}/enroll/whoop?error=token_save_failed&detail=${encodeURIComponent(newTokenErr.message)}`);
    }

    // Log enrollment event
    await supabase
      .from('enrollment_events')
      .insert({
        study_id: study.id,
        resident_id: newResident.id,
        event_type: 'whoop_oauth_linked',
        details: { whoop_user_id: whoopUserId, participant_id: participantId },
      });

    return res.redirect(`${SITE_URL}/enroll/whoop?success=enrolled&id=${participantId}`);
  } catch (err: any) {
    console.error('WHOOP callback error:', err);
    return res.redirect(`${SITE_URL}/enroll/whoop?error=server_error`);
  }
}
