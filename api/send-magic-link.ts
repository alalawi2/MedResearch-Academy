import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const SITE_URL = process.env.SITE_URL || 'https://www.medresearch-academy.om';

// Best-effort per-instance cooldown; production should also enforce an edge rate limit.
const recentRequests = new Map<string, number>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, redirectTo, purpose } = req.body || {};
  const staffRequest = purpose === 'staff-login' || purpose === 'staff-reset';
  if (purpose !== undefined && !staffRequest) return res.status(400).json({ error: 'Invalid purpose' });
  if (typeof email!=='string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return res.status(400).json({ error: 'Valid email is required' });
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !RESEND_API_KEY) {
    return res.status(503).json({ error: 'Email service is unavailable. Please contact the study administrator.' });
  }
  const normalizedEmail = email.trim().toLowerCase();
  const now = Date.now();
  for (const [key, timestamp] of recentRequests) if (now - timestamp >= 60000) recentRequests.delete(key);
  if (recentRequests.has(normalizedEmail)) {
    res.setHeader('Retry-After', '60');
    return res.status(429).json({ error: 'Please wait one minute before requesting another email.' });
  }
  recentRequests.set(normalizedEmail, now);
  let safeRedirect = `${SITE_URL}/resident/dashboard`;
  if(typeof redirectTo==='string'){
    try{const url=new URL(redirectTo,SITE_URL);if(url.origin===new URL(SITE_URL).origin)safeRedirect=url.href;}catch{}
  }
  if (staffRequest) safeRedirect = `${SITE_URL}${purpose === 'staff-reset' ? '/dashboard/set-password' : '/dashboard'}`;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    if (staffRequest) {
      const { data: staff, error: staffError } = await supabase.from('staff')
        .select('auth_user_id').ilike('email', normalizedEmail.replace(/[\\%_]/g, '\\$&')).eq('active', true).maybeSingle();
      if (staffError) throw new Error('Staff lookup failed');
      // Do not create accounts or disclose whether an address belongs to staff.
      if (!staff?.auth_user_id) return res.status(200).json({ success: true });
      const { data: account, error: accountError } = await supabase.auth.admin.getUserById(staff.auth_user_id);
      if (accountError) throw new Error('Account lookup failed');
      if (account.user?.email?.toLowerCase() !== normalizedEmail) return res.status(200).json({ success: true });
    }
    // Generate magic link via Supabase Admin API
    const { data, error } = await supabase.auth.admin.generateLink({
      type: purpose === 'staff-reset' ? 'recovery' : 'magiclink',
      email: normalizedEmail,
      options: {
        redirectTo: safeRedirect,
      },
    });

    if (error) {
      console.error('Generate link failed:', error.status);
      return res.status(503).json({ error: 'Unable to generate an access link. Please try again later.' });
    }

    const magicLink = data?.properties?.action_link;
    if (!magicLink) {
      return res.status(500).json({ error: 'Failed to generate magic link' });
    }

    // Send email via Resend with correct branding
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${staffRequest ? 'MedResearch Academy' : 'OMSB Burnout Study'} <info@medresearch-academy.om>`,
        to: [normalizedEmail],
        subject: staffRequest ? `MedResearch Academy - ${purpose === 'staff-reset' ? 'Reset your password' : 'Your login link'}` : 'OMSB Burnout Study — Your Login Link',
        html: staffRequest ? `<h1>MedResearch Academy</h1><p>${purpose === 'staff-reset' ? 'Use the link below to choose a new password.' : 'Use the link below to sign in to the research dashboard.'}</p><p><a href="${magicLink.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}">${purpose === 'staff-reset' ? 'Reset password' : 'Sign in'}</a></p><p>This link is single-use. If you did not request it, ignore this email.</p>` : `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; color: #333;">
<div style="background: linear-gradient(135deg, #0f766e 0%, #115e59 100%); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
<h1 style="color: white; margin: 0; font-size: 18px;">OMSB Burnout Study</h1>
<p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 13px;">Secure Login Link</p>
</div>
<div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 28px; border-radius: 0 0 12px 12px;">
<p>Click the button below to sign in to your study portal:</p>
<div style="text-align: center; margin: 24px 0;">
<a href="${magicLink}" style="display: inline-block; padding: 14px 32px; background: #0f766e; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">Sign In to Study Portal</a>
</div>
<p style="font-size: 13px; color: #666;">Use this one-time link promptly. If it has expired, request a new link from the login page. If you didn't request this, you can safely ignore this email.</p>
<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
<p style="font-size: 12px; color: #999;">WHOOP Resident Study Team<br/>www.medresearch-academy.om</p>
</div>
</div>`,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error('Resend error:', errText);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Access email failed');
    return res.status(500).json({ error: 'Unable to send the email. Please try again later or contact the study administrator.' });
  }
}
