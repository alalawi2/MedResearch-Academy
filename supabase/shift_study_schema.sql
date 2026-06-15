-- ══════════════════════════════════════════════════════════════
-- SCHEMA: Cognitive Shifts Study
-- Tables: shift_study_participants, shift_study_timepoints
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS shift_study_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text,
  gender text,
  specialty text,
  residency_year text,
  shift_type text,
  participant_id text UNIQUE,
  role text DEFAULT 'participant' CHECK (role IN ('participant','investigator')),
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shift_study_timepoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES shift_study_participants(id),
  timepoint text NOT NULL CHECK (timepoint IN (
    'baseline',
    'pre_shift_1','post_shift_1',
    'pre_shift_2','post_shift_2',
    'pre_shift_3','post_shift_3'
  )),
  answers jsonb DEFAULT '{}',
  completed boolean DEFAULT false,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(participant_id, timepoint)
);

-- RLS
ALTER TABLE shift_study_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_study_timepoints ENABLE ROW LEVEL SECURITY;

-- Service role: full access
CREATE POLICY srv_ssp ON shift_study_participants FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY srv_sst ON shift_study_timepoints FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Anon: read-only for participants (auth goes through /api/shift-study-auth)
-- Insert/update on participants restricted to service_role only
CREATE POLICY anon_sel_ssp ON shift_study_participants FOR SELECT TO anon USING (true);

-- Anon: read + write for timepoints (participant saves their own progress)
CREATE POLICY anon_sel_sst ON shift_study_timepoints FOR SELECT TO anon USING (true);
CREATE POLICY anon_ins_sst ON shift_study_timepoints FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY anon_upd_sst ON shift_study_timepoints FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ── Config table (editable by investigator) ──
CREATE TABLE IF NOT EXISTS shift_study_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE shift_study_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY srv_cfg ON shift_study_config FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY anon_sel_cfg ON shift_study_config FOR SELECT TO anon USING (true);
CREATE POLICY anon_ups_cfg ON shift_study_config FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY anon_ins_cfg ON shift_study_config FOR INSERT TO anon WITH CHECK (true);
