-- Drop anon SELECT policies on shift study tables
-- All reads now go through /api/shift-study-auth (service_role) with role verification
DROP POLICY IF EXISTS anon_sel_ssp ON shift_study_participants;
DROP POLICY IF EXISTS anon_sel_sst ON shift_study_timepoints;
DROP POLICY IF EXISTS anon_sel_cfg ON shift_study_config;
