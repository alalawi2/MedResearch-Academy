import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const SITE_URL = process.env.SITE_URL || 'https://www.medresearch-academy.om';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, redirectTo } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // Generate magic link via Supabase Admin API
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email.trim(),
      options: {
        redirectTo: redirectTo || `${SITE_URL}/resident/dashboard`,
      },
    });

    if (error) {
      console.error('Generate link error:', error);
      return res.status(400).json({ error: error.message });
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
        from: 'OMSB Burnout Study <info@medresearch-academy.om>',
        to: [email.trim()],
        subject: 'OMSB Burnout Study — Your Login Link',
        html: `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; color: #333;">
<div style="background: linear-gradient(135deg, #0f766e 0%, #115e59 100%); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
<h1 style="color: white; margin: 0; font-size: 18px;">OMSB Burnout Study</h1>
<p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 13px;">Secure Login Link</p>
</div>
<div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 28px; border-radius: 0 0 12px 12px;">
<p>Click the button below to sign in to your study portal:</p>
<div style="text-align: center; margin: 24px 0;">
<a href="${magicLink}" style="display: inline-block; padding: 14px 32px; background: #0f766e; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">Sign In to Study Portal</a>
</div>
<p style="font-size: 13px; color: #666;">This link expires in 24 hours. If you didn't request this, you can safely ignore this email.</p>
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
    console.error('Magic link error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
