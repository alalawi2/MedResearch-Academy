import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.headers['x-setup-key'] !== 'shift-study-setup-2026') {
    return res.status(403).json({ error: 'forbidden' });
  }

  const results: string[] = [];

  // Create participants table
  const { error: e1 } = await supabase.rpc('exec_sql', { sql: '' }).then((r: any) => r, () => ({ error: null }));

  // Try direct table operations instead - check if table exists
  const { data: existing } = await supabase
    .from('shift_study_participants')
    .select('id')
    .limit(1);

  if (existing !== null) {
    results.push('Tables already exist');

    // Seed Dr. Said
    const { error: seedErr } = await supabase
      .from('shift_study_participants')
      .upsert({
        email: 'said.alfarsi96@gmail.com',
        password: 'OMSB2026',
        full_name: 'Dr. Said Al Farsi',
        role: 'investigator',
        participant_id: 'PI-001',
        status: 'active'
      }, { onConflict: 'email' });

    results.push(seedErr ? `Seed error: ${seedErr.message}` : 'Dr. Said seeded');
  } else {
    results.push('Tables do not exist - need to create via SQL editor');
  }

  return res.json({ results });
}
