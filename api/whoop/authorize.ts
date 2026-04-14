import type { VercelRequest, VercelResponse } from '@vercel/node';

const WHOOP_AUTH_URL = 'https://api.prod.whoop.com/oauth/oauth2/auth';
const CLIENT_ID = process.env.WHOOP_CLIENT_ID!;
const REDIRECT_URI = process.env.WHOOP_REDIRECT_URI!;
const SCOPES = [
  'read:profile',
  'read:body_measurement',
  'read:recovery',
  'read:cycles',
  'read:sleep',
  'read:workout',
].join(' ');

export default function handler(req: VercelRequest, res: VercelResponse) {
  const state = Math.random().toString(36).substring(2, 15);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
    state,
  });

  res.redirect(`${WHOOP_AUTH_URL}?${params.toString()}`);
}
