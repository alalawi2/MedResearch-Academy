import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { validateBlockSubmission,omanToday } from '../shared/burnout-calendar.js';

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
  if (authErr || !user) {
    await supabase.from('submission_error_log').insert({
      error_message: authErr?.message || 'No user from token',
      error_source: 'auth_failure',
      payload_summary: { has_token: !!authHeader },
    }).then(() => {}, () => {});
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Get resident profile
  const { data: resident } = await supabase
    .from('burnout_participants')
    .select('id, study_id, enrollment_date, status')
    .eq('auth_user_id', user.id)
    .limit(1)
    .single();

  if (!resident) return res.status(403).json({ error: 'Not a study participant' });
  if(resident.status!=='active')return res.status(403).json({error:'Study participation is not active. Please contact the coordinator.'});

  const { payload, cbiData, phq9Data, gad7Data, isiData, blockNumber, academicYear } = req.body;

  if (!payload || !cbiData || !phq9Data || !gad7Data || !isiData) {
    return res.status(400).json({ error: 'Missing assessment data' });
  }
  const isBaseline=payload.rotation_name==='BASELINE' && payload.block_number==null && blockNumber==null;
  if (!isBaseline && (payload.block_number !== blockNumber || payload.academic_year !== academicYear)) {
    return res.status(400).json({ error: 'Block and academic year must match the assessment.' });
  }
  const eligibilityError = isBaseline ? null : validateBlockSubmission(blockNumber, academicYear, resident.enrollment_date);
  if (eligibilityError) return res.status(400).json({ error: eligibilityError });

  // Verify the payload belongs to this resident
  if (payload.resident_id !== resident.id || payload.study_id !== resident.study_id) {
    return res.status(403).json({ error: 'Resident mismatch' });
  }
  payload.assessment_date=omanToday().toISOString().slice(0,10);

  // Get block_id if exists
  let blockId: string | null = null;
  if (blockNumber) {
    let query = supabase
      .from('rotation_blocks')
      .select('id')
      .eq('resident_id', resident.id)
      .eq('block_number', blockNumber);
    if (academicYear) query = query.eq('academic_year', academicYear);
    const { data: block } = await query.limit(1).single();
    blockId = block?.id || null;
  }

  // All five records commit together; repeat submissions return the existing assessment.
  const {data,error}=await supabase.rpc('save_burnout_assessment',{
    assessment:payload,cbi:cbiData,phq:phq9Data,gad:gad7Data,isi:isiData,rotation_id:blockId,
  });
  if(error){
    await supabase.from('submission_error_log').insert({resident_id:resident.id,block_number:blockNumber||null,error_source:'atomic_assessment',error_message:error.message});
    return res.status(503).json({error:'The assessment was not saved. Please try again or contact your coordinator.'});
  }
  return res.json({saved:true,...data});
}
