-- ============================================================
-- Resident Self-Access RLS Policies
-- Allows authenticated residents to read/write their OWN data
-- Run this in Supabase SQL Editor
-- ============================================================

-- Helper: check if current user is the resident
create or replace function is_own_resident_row(_resident_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from burnout_participants
    where id = _resident_id
      and auth_user_id = auth.uid()
  );
$$;

-- ============================================================
-- burnout_participants: resident can read & update own row
-- ============================================================
drop policy if exists resident_self_select on burnout_participants;
create policy resident_self_select on burnout_participants
  for select using (auth_user_id = auth.uid() or can_read_study_data(study_id));

drop policy if exists resident_self_update on burnout_participants;
create policy resident_self_update on burnout_participants
  for update using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- ============================================================
-- whoop_pulls: resident can read own data
-- ============================================================
drop policy if exists whoop_resident_select on whoop_pulls;
create policy whoop_resident_select on whoop_pulls
  for select using (is_own_resident_row(resident_id) or can_read_study_data(study_id));

-- ============================================================
-- block_assessments: resident can read & insert own data
-- ============================================================
drop policy if exists ba_resident_select on block_assessments;
create policy ba_resident_select on block_assessments
  for select using (is_own_resident_row(resident_id) or can_read_study_data(study_id));

drop policy if exists ba_resident_insert on block_assessments;
create policy ba_resident_insert on block_assessments
  for insert with check (is_own_resident_row(resident_id));

-- ============================================================
-- weekly_checkins: resident can read, insert, update own data
-- ============================================================
drop policy if exists wc_resident_select on weekly_checkins;
create policy wc_resident_select on weekly_checkins
  for select using (is_own_resident_row(resident_id) or can_read_study_data(study_id));

drop policy if exists wc_resident_insert on weekly_checkins;
create policy wc_resident_insert on weekly_checkins
  for insert with check (is_own_resident_row(resident_id));

drop policy if exists wc_resident_update on weekly_checkins;
create policy wc_resident_update on weekly_checkins
  for update using (is_own_resident_row(resident_id))
  with check (is_own_resident_row(resident_id));

-- ============================================================
-- event_logs: resident can read, insert, delete own data
-- ============================================================
drop policy if exists el_resident_select on event_logs;
create policy el_resident_select on event_logs
  for select using (is_own_resident_row(resident_id) or can_read_study_data(study_id));

drop policy if exists el_resident_insert on event_logs;
create policy el_resident_insert on event_logs
  for insert with check (is_own_resident_row(resident_id));

drop policy if exists el_resident_delete on event_logs;
create policy el_resident_delete on event_logs
  for delete using (is_own_resident_row(resident_id));

-- ============================================================
-- cbi_responses: resident can read & insert own data
-- ============================================================
drop policy if exists cbi_resident_select on cbi_responses;
create policy cbi_resident_select on cbi_responses
  for select using (is_own_resident_row(resident_id) or can_read_study_data(study_id));

drop policy if exists cbi_resident_insert on cbi_responses;
create policy cbi_resident_insert on cbi_responses
  for insert with check (is_own_resident_row(resident_id));

-- ============================================================
-- phq9_responses: resident can read & insert own data
-- ============================================================
drop policy if exists phq9_resident_select on phq9_responses;
create policy phq9_resident_select on phq9_responses
  for select using (is_own_resident_row(resident_id) or can_read_study_data(study_id));

drop policy if exists phq9_resident_insert on phq9_responses;
create policy phq9_resident_insert on phq9_responses
  for insert with check (is_own_resident_row(resident_id));

-- ============================================================
-- gad7_responses: resident can read & insert own data
-- ============================================================
drop policy if exists gad7_resident_select on gad7_responses;
create policy gad7_resident_select on gad7_responses
  for select using (is_own_resident_row(resident_id) or can_read_study_data(study_id));

drop policy if exists gad7_resident_insert on gad7_responses;
create policy gad7_resident_insert on gad7_responses
  for insert with check (is_own_resident_row(resident_id));

-- ============================================================
-- isi_responses: resident can read & insert own data
-- ============================================================
drop policy if exists isi_resident_select on isi_responses;
create policy isi_resident_select on isi_responses
  for select using (is_own_resident_row(resident_id) or can_read_study_data(study_id));

drop policy if exists isi_resident_insert on isi_responses;
create policy isi_resident_insert on isi_responses
  for insert with check (is_own_resident_row(resident_id));

-- ============================================================
-- rotation_blocks: resident can read & insert own data
-- ============================================================
drop policy if exists rb_resident_select on rotation_blocks;
create policy rb_resident_select on rotation_blocks
  for select using (is_own_resident_row(resident_id) or can_read_study_data(study_id));

drop policy if exists rb_resident_insert on rotation_blocks;
create policy rb_resident_insert on rotation_blocks
  for insert with check (is_own_resident_row(resident_id));
