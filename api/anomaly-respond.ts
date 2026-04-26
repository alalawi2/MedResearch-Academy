import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SITE_URL = process.env.SITE_URL || 'https://www.medresearch-academy.om';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { token, response } = req.query;

  if (!token || !response) {
    return res.redirect(`${SITE_URL}/active-research/resident-burnout`);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Find the investigation
  const { data: investigation } = await supabase
    .from('anomaly_investigations')
    .select('id, resident_response')
    .eq('token', token as string)
    .limit(1)
    .single();

  if (!investigation) {
    return res.send(thankYouPage('This link has expired or is invalid.', false));
  }

  if (investigation.resident_response) {
    return res.send(thankYouPage('You have already responded. Thank you.', true));
  }

  // Save response
  await supabase
    .from('anomaly_investigations')
    .update({
      resident_response: response as string,
      responded_at: new Date().toISOString(),
    })
    .eq('id', investigation.id);

  return res.send(thankYouPage('Your response has been recorded. Thank you for helping us understand your data.', true));
}

function thankYouPage(message: string, success: boolean): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>OMSB Burnout Study</title></head>
<body style="font-family:Arial,sans-serif;margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f8fafc;padding:24px;">
<div style="max-width:420px;text-align:center;background:white;padding:48px 36px;border-radius:20px;box-shadow:0 8px 32px rgba(0,0,0,0.08);">
<div style="font-size:48px;margin-bottom:16px;">${success ? '✅' : '⚠️'}</div>
<h1 style="color:#1a3a5c;font-size:1.4rem;margin-bottom:12px;">${success ? 'Thank You' : 'Oops'}</h1>
<p style="color:#666;font-size:14px;line-height:1.7;">${message}</p>
<a href="https://www.medresearch-academy.om" style="display:inline-block;margin-top:20px;padding:10px 24px;background:#1a3a5c;color:white;border-radius:8px;text-decoration:none;font-size:14px;">Back to MedResearch Academy</a>
</div></body></html>`;
}
