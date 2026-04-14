import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const env = {
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? `SET (starts with ${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10)}...)` : 'MISSING',
    WHOOP_CLIENT_ID: process.env.WHOOP_CLIENT_ID ? 'SET' : 'MISSING',
    WHOOP_CLIENT_SECRET: process.env.WHOOP_CLIENT_SECRET ? 'SET' : 'MISSING',
    WHOOP_REDIRECT_URI: process.env.WHOOP_REDIRECT_URI || 'MISSING',
  };

  let dbTest = 'not tested';
  let tokenCount = 'not tested';
  let residentCount = 'not tested';

  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: studies, error: studyErr } = await supabase
      .from('studies')
      .select('slug')
      .limit(5);

    dbTest = studyErr ? `ERROR: ${studyErr.message}` : `OK (${studies?.length} studies)`;

    const { data: residents, error: resErr } = await supabase
      .from('residents')
      .select('id')
      .limit(100);

    residentCount = resErr ? `ERROR: ${resErr.message}` : `${residents?.length} residents`;

    const { data: tokens, error: tokErr } = await supabase
      .from('whoop_tokens')
      .select('id')
      .limit(100);

    tokenCount = tokErr ? `ERROR: ${tokErr.message}` : `${tokens?.length} tokens`;

  } catch (e: any) {
    dbTest = `EXCEPTION: ${e.message}`;
  }

  return res.status(200).json({ env, dbTest, residentCount, tokenCount });
}
