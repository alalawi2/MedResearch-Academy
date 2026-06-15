import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function hashPassword(pw: string): string {
  return createHash('sha256').update(pw + 'shift-study-2026-salt').digest('hex');
}

const VALID_TIMEPOINTS = [
  'baseline',
  'pre_shift_1', 'post_shift_1',
  'pre_shift_2', 'post_shift_2',
  'pre_shift_3', 'post_shift_3',
];

// Timepoint ordering: each requires its predecessor to be completed
const TIMEPOINT_PREREQS: Record<string, string | null> = {
  baseline: null,
  pre_shift_1: 'baseline',
  post_shift_1: 'pre_shift_1',
  pre_shift_2: 'post_shift_1',
  post_shift_2: 'pre_shift_2',
  pre_shift_3: 'post_shift_2',
  post_shift_3: 'pre_shift_3',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action } = req.body || {};

  // ── LOGIN ──
  if (action === 'login') {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const hash = hashPassword(password);
    const { data, error } = await supabase
      .from('shift_study_participants')
      .select('id,email,full_name,gender,specialty,residency_year,shift_type,participant_id,role,status')
      .eq('email', email.toLowerCase().trim())
      .limit(1)
      .single();

    if (error || !data) return res.status(401).json({ error: 'Invalid email or password' });

    // Check password: support both hashed and legacy plaintext during migration
    const { data: pwRow } = await supabase
      .from('shift_study_participants')
      .select('password_hash')
      .eq('id', data.id)
      .single();

    const storedPw = (pwRow as any)?.password_hash;
    if (!storedPw || storedPw !== hash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    return res.json({ participant: data });
  }

  // ── REGISTER ──
  if (action === 'register') {
    const { email, password, full_name, gender, specialty, residency_year, shift_type } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Name, email, and password required' });
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from('shift_study_participants')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .limit(1);

    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Generate participant ID
    const { data: allIds } = await supabase
      .from('shift_study_participants')
      .select('participant_id')
      .like('participant_id', 'CS-%')
      .limit(1000);

    let nextNum = 1;
    if (allIds) {
      for (const row of allIds) {
        const match = row.participant_id?.match(/CS-(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num >= nextNum) nextNum = num + 1;
        }
      }
    }
    const participantId = `CS-${String(nextNum).padStart(3, '0')}`;

    const hash = hashPassword(password);
    const { data, error } = await supabase
      .from('shift_study_participants')
      .insert({
        email: email.toLowerCase().trim(),
        password_hash: hash,
        full_name,
        gender,
        specialty,
        residency_year,
        shift_type,
        participant_id: participantId,
        role: 'participant',
        status: 'active',
      })
      .select('id,email,full_name,gender,specialty,residency_year,shift_type,participant_id,role,status')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ participant: data });
  }

  // ── VALIDATE TIMEPOINT (before saving assessment) ──
  if (action === 'validate_timepoint') {
    const { participant_id, timepoint } = req.body;
    if (!participant_id || !timepoint) {
      return res.status(400).json({ error: 'participant_id and timepoint required' });
    }

    if (!VALID_TIMEPOINTS.includes(timepoint)) {
      return res.status(400).json({ error: `Invalid timepoint: ${timepoint}` });
    }

    // Check prerequisite
    const prereq = TIMEPOINT_PREREQS[timepoint];
    if (prereq) {
      const { data: prereqData } = await supabase
        .from('shift_study_timepoints')
        .select('completed')
        .eq('participant_id', participant_id)
        .eq('timepoint', prereq)
        .eq('completed', true)
        .limit(1);

      if (!prereqData || prereqData.length === 0) {
        return res.status(403).json({ error: `Must complete ${prereq.replace(/_/g, ' ')} first` });
      }
    }

    // Check not already completed
    const { data: existing } = await supabase
      .from('shift_study_timepoints')
      .select('completed')
      .eq('participant_id', participant_id)
      .eq('timepoint', timepoint)
      .limit(1);

    if (existing && existing.length > 0 && existing[0].completed) {
      return res.status(409).json({ error: 'This assessment is already completed' });
    }

    return res.json({ valid: true });
  }

  // ── SAVE TIMEPOINT (server-side write with service role) ──
  if (action === 'save_timepoint') {
    const { participant_id, timepoint, answers, completed } = req.body;
    if (!participant_id || !timepoint) {
      return res.status(400).json({ error: 'participant_id and timepoint required' });
    }
    if (!VALID_TIMEPOINTS.includes(timepoint)) {
      return res.status(400).json({ error: `Invalid timepoint: ${timepoint}` });
    }

    const now = new Date().toISOString();

    // Check if record exists
    const { data: existing } = await supabase
      .from('shift_study_timepoints')
      .select('id,completed')
      .eq('participant_id', participant_id)
      .eq('timepoint', timepoint)
      .limit(1);

    if (existing && existing.length > 0) {
      if (existing[0].completed && completed) {
        return res.status(409).json({ error: 'Assessment already completed' });
      }
      const { error } = await supabase
        .from('shift_study_timepoints')
        .update({
          answers: answers || {},
          completed: !!completed,
          ...(completed ? { completed_at: now } : {}),
        })
        .eq('id', existing[0].id);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ id: existing[0].id });
    } else {
      const { data, error } = await supabase
        .from('shift_study_timepoints')
        .insert({
          participant_id,
          timepoint,
          answers: answers || {},
          completed: !!completed,
          started_at: now,
          ...(completed ? { completed_at: now } : {}),
        })
        .select('id')
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ id: data?.id });
    }
  }

  // ── UPDATE CONFIG (investigator only) ──
  if (action === 'update_config') {
    const { participant_id, key, value } = req.body;
    if (!participant_id || !key || value === undefined) {
      return res.status(400).json({ error: 'participant_id, key, and value required' });
    }

    // Verify investigator role
    const { data: caller } = await supabase
      .from('shift_study_participants')
      .select('role')
      .eq('id', participant_id)
      .single();

    if (!caller || caller.role !== 'investigator') {
      return res.status(403).json({ error: 'Only investigators can update settings' });
    }

    const { error } = await supabase
      .from('shift_study_config')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }

  return res.status(400).json({ error: 'Unknown action' });
}
