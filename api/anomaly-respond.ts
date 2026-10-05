import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import {escapeHtml} from '../shared/notification-safety.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SITE_URL = process.env.SITE_URL || 'https://www.medresearch-academy.om';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { token, response } = req.method==='POST' ? req.body||{} : req.query;
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Referrer-Policy','no-referrer');
  if(!['GET','POST'].includes(req.method||''))return res.status(405).end();

  if (typeof token!=='string' || !/^[a-f0-9]{48}$/.test(token) || typeof response!=='string' || !response.trim() || response.length>200) {
    return res.redirect(`${SITE_URL}/active-research/resident-burnout`);
  }

  // Email security scanners may visit GET links. Never record a research answer on GET.
  if(req.method==='GET')return res.send(`<!doctype html><html><meta name="viewport" content="width=device-width"><title>Confirm response</title><body><h1>Confirm your response</h1><p>${escapeHtml(response)}</p><form method="POST"><input type="hidden" name="token" value="${token}"><input type="hidden" name="response" value="${escapeHtml(response)}"><button type="submit">Confirm and submit</button></form></body></html>`);

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
  const {data:saved,error:saveError}=await supabase
    .from('anomaly_investigations')
    .update({
      resident_response: response as string,
      responded_at: new Date().toISOString(),
    })
    .eq('id', investigation.id).is('resident_response',null).select('id');
  if(saveError || !saved?.length)return res.status(409).send(thankYouPage('Unable to save, or a response was already submitted. Please contact the study team.',false));

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
