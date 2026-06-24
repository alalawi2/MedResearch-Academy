import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization?.replace('Bearer ', '');
  if (!authHeader) return res.status(401).json({ error: 'No auth token' });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Verify JWT → get user
  const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader);
  if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

  // Get resident profile
  const { data: resident } = await supabase
    .from('burnout_participants')
    .select('id, study_id')
    .eq('auth_user_id', user.id)
    .limit(1)
    .single();

  if (!resident) return res.status(403).json({ error: 'Not a study participant' });

  const { payload, cbiData, phq9Data, gad7Data, isiData, blockNumber } = req.body;

  if (!payload || !cbiData || !phq9Data || !gad7Data || !isiData) {
    return res.status(400).json({ error: 'Missing assessment data' });
  }

  // Verify the payload belongs to this resident
  if (payload.resident_id !== resident.id || payload.study_id !== resident.study_id) {
    return res.status(403).json({ error: 'Resident mismatch' });
  }

  // Get block_id if exists
  let blockId: string | null = null;
  if (blockNumber) {
    const { data: block } = await supabase
      .from('rotation_blocks')
      .select('id')
      .eq('resident_id', resident.id)
      .eq('block_number', blockNumber)
      .limit(1)
      .single();
    blockId = block?.id || null;
  }

  // Insert block assessment (service role bypasses RLS)
  const { error: baError } = await supabase
    .from('block_assessments')
    .insert(payload);

  if (baError) {
    console.error('Block assessment insert error:', baError);
    return res.status(500).json({ error: 'Failed to save assessment: ' + baError.message });
  }

  // Insert individual instrument responses
  const errors: string[] = [];

  const { error: cbiErr } = await supabase.from('cbi_responses').insert({
    ...cbiData,
    study_id: resident.study_id,
    resident_id: resident.id,
    block_id: blockId,
  });
  if (cbiErr) errors.push('CBI: ' + cbiErr.message);

  const { error: phqErr } = await supabase.from('phq9_responses').insert({
    ...phq9Data,
    study_id: resident.study_id,
    resident_id: resident.id,
    block_id: blockId,
  });
  if (phqErr) errors.push('PHQ-9: ' + phqErr.message);

  const { error: gadErr } = await supabase.from('gad7_responses').insert({
    ...gad7Data,
    study_id: resident.study_id,
    resident_id: resident.id,
    block_id: blockId,
  });
  if (gadErr) errors.push('GAD-7: ' + gadErr.message);

  const { error: isiErr } = await supabase.from('isi_responses').insert({
    ...isiData,
    study_id: resident.study_id,
    resident_id: resident.id,
    block_id: blockId,
  });
  if (isiErr) errors.push('ISI: ' + isiErr.message);

  if (errors.length > 0) {
    console.error('Instrument insert errors:', errors);
    return res.status(207).json({ saved: true, warnings: errors });
  }

  return res.json({ saved: true });
}
