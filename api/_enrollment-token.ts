import { createHmac, timingSafeEqual } from 'node:crypto';

type EnrollmentTokenPayload = {
  participantId: string;
  exp: number;
};

const DEFAULT_TTL_SECONDS = 60 * 60 * 24;

function getSecret() {
  return process.env.ENROLLMENT_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function sign(encodedPayload: string) {
  return createHmac('sha256', getSecret()).update(encodedPayload).digest('base64url');
}

export function createEnrollmentToken(participantId: string, ttlSeconds = DEFAULT_TTL_SECONDS) {
  const payload: EnrollmentTokenPayload = {
    participantId,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyEnrollmentToken(token: string | undefined | null): EnrollmentTokenPayload | null {
  if (!token) return null;

  const secret = getSecret();
  if (!secret) {
    console.error('Enrollment token secret is not configured');
    return null;
  }

  const [encodedPayload, encodedSignature] = token.split('.');
  if (!encodedPayload || !encodedSignature) return null;

  const expectedSignature = sign(encodedPayload);
  const provided = Buffer.from(encodedSignature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as EnrollmentTokenPayload;
    if (!payload.participantId || !payload.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
