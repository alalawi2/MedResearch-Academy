import { createHmac } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const LIMITS = {
  conversation: { install: 6, global: 120 },
  transcription: { install: 3, global: 40 },
};

export async function reserveFreeUse(installId, bucket, env = process.env, rpc) {
  if (!/^[A-Za-z0-9_-]{32,96}$/.test(installId || '') || !LIMITS[bucket])
    return { status: 400, error: 'Update Wardwise and try again.' };
  if (!env.WARDWISE_FREE_HASH_SALT || !env.VITE_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY)
    return { status: 503, error: 'Free AI practice is temporarily unavailable. Guided practice still works.' };
  const installHash = createHmac('sha256', env.WARDWISE_FREE_HASH_SALT).update(installId).digest('hex');
  const limits = LIMITS[bucket];
  const call = rpc || ((params) => createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  }).rpc('wardwise_reserve_free_use', params));
  try {
    const { data, error } = await call({
      p_install_hash: installHash,
      p_bucket: bucket,
      p_install_limit: limits.install,
      p_global_limit: limits.global,
    });
    if (error?.message?.includes('quota_exceeded'))
      return { status: 429, error: 'Free AI practice has reached today’s limit. Try again tomorrow or continue in guided mode.' };
    if (error || data !== true)
      return { status: 503, error: 'Free AI practice is temporarily unavailable. Guided practice still works.' };
    return null;
  } catch {
    return { status: 503, error: 'Free AI practice is temporarily unavailable. Guided practice still works.' };
  }
}
