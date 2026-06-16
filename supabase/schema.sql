-- ============================================================================
-- MedResearch Academy — Unified Research Data Platform
-- Multi-tenant schema v3.0 — synced with live database (June 2026)
-- ============================================================================
-- Run this ENTIRE file in the Supabase SQL editor in ONE go.
-- Then run seed.sql separately.
-- Idempotent: re-running will not destroy data.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================
do $$ begin
  create type user_role as enum (
    'admin',
    'apd',
    'coordinator',
    'chief_resident',
    'resident',
    'external_coordinator',
    'external_resident',
    'faculty',
    'ec_member',
    'auditor'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type study_status as enum (
    'planning',
    'recruiting',
    'data_collection',
    'follow_up',
    'data_analysis',
    'published',
    'closed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type enrollment_status as enum (
    'pending',
    'consented',
    'active',
    'withdrawn',
    'completed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type residency_program as enum (
    'internal_medicine',
    'general_surgery',
    'pediatrics',
    'ob_gyn',
    'anesthesia',
    'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type study_site as enum (
    'SQUH',
    'Royal',
    'AFH',
    'Khoula',
    'MCMSS',
    'Sohar',
    'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type rotation_type as enum (
    'outpatient',
    'inpatient_acute',
    'elective',
    'ICU',
    'ER',
    'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type call_type as enum ('none', '24h', 'shift', 'mixed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type training_level as enum ('R1', 'R2', 'R3', 'R4');
exception when duplicate_object then null; end $$;

do $$ begin
  create type burnout_category as enum ('low', 'moderate', 'high');
exception when duplicate_object then null; end $$;

do $$ begin
  create type severity_category as enum ('none', 'minimal', 'mild', 'moderate', 'moderately_severe', 'severe');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- 1. STUDIES
-- ============================================================================
create table if not exists studies (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  short_name text not null,
  full_title text not null,
  description text,
  pi_name text not null,
  co_pi_name text,
  status study_status not null default 'planning',
  mrec_number text,
  ethics_refs text[],
  ethics_approved_date date,
  ethics_expires_date date,
  start_date date,
  end_date date,
  funding_source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_studies_slug on studies (slug);

-- ============================================================================
-- 2. STAFF
-- ============================================================================
create table if not exists staff (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email text unique not null,
  full_name text not null,
  title text,
  primary_site study_site,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_staff_email on staff (email);
create index if not exists idx_staff_auth on staff (auth_user_id);

-- ============================================================================
-- 3. STAFF_STUDY_ROLES
-- ============================================================================
create table if not exists staff_study_roles (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff(id) on delete cascade,
  study_id uuid not null references studies(id) on delete cascade,
  role text not null default 'research_assistant',
  site_scope study_site,
  created_at timestamptz not null default now(),
  unique (staff_id, study_id)
);
create index if not exists idx_ssr_staff on staff_study_roles (staff_id);
create index if not exists idx_ssr_study on staff_study_roles (study_id);

-- ============================================================================
-- 4. USER_PROFILES (referenced by residents)
-- ============================================================================
create table if not exists user_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email text,
  full_name text,
  role text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 5. RESIDENTS — residency program roster (NOT burnout study participants)
-- ============================================================================
create table if not exists residents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id),
  full_name text not null,
  staff_id text unique not null,
  email text not null,
  training_level training_level not null,
  resident_type text not null default 'internal_medicine',
  program text not null default 'Internal Medicine',
  academic_day text,
  longitudinal_clinic_day text,
  start_date date not null,
  expected_graduation date,
  is_extension boolean default false,
  is_active boolean default true,
  pregnancy_due_date date,
  gender text,
  marital_status text,
  phone text,
  onboarding_complete boolean default false,
  schedule_confirmed boolean default false,
  schedule_confirmed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================================
-- 6. BURNOUT_PARTICIPANTS — study-specific participant enrollment
-- ============================================================================
create table if not exists burnout_participants (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references studies(id) on delete cascade,
  study_participant_id text not null,
  auth_user_id uuid unique,
  full_name text,
  email text,
  phone text,
  whoop_user_id text,
  -- Demographics
  date_of_birth date,
  gender text,
  age_at_enrollment integer,
  sex text,
  marital_status text,
  number_of_kids integer,
  has_children boolean,
  number_of_children text,
  social_support text,
  annual_income_bracket text,
  region_of_origin text,
  hometown_visit_frequency text,
  special_care_dependents boolean,
  financial_difficulties boolean,
  -- Physical
  weight_kg numeric,
  height_cm numeric,
  -- Program
  program text,
  pgy_level integer,
  residency_level text,
  residency_program text,
  primary_site text,
  -- Health
  chronic_conditions jsonb default '[]'::jsonb,
  psychiatric_conditions jsonb default '[]'::jsonb,
  on_medications boolean,
  medications_list text,
  -- Lifestyle
  exercise_days_per_week text,
  diet_type jsonb default '[]'::jsonb,
  caffeine_drinks_daily text,
  sleep_hours_non_call text,
  -- Enrollment
  status text not null default 'pending',
  enrollment_date date,
  withdrawal_date date,
  withdrawal_reason text,
  whoop_device_serial text,
  demographics_completed boolean default false,
  baseline_completed boolean default false,
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (study_id, study_participant_id)
);
create index if not exists idx_bp_study on burnout_participants (study_id);
create index if not exists idx_bp_status on burnout_participants (study_id, status);
create index if not exists idx_bp_auth on burnout_participants (auth_user_id);

-- ============================================================================
-- 7. ROTATION BLOCKS
-- ============================================================================
create table if not exists rotation_blocks (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references studies(id) on delete cascade,
  resident_id uuid not null references burnout_participants(id) on delete cascade,
  block_number integer not null,
  academic_year text not null,
  rotation_name text,
  rotation_type rotation_type,
  rotation_site study_site,
  period_start date not null,
  period_end date not null,
  calls_count integer,
  primary_call_type call_type,
  hours_worked_per_week numeric,
  hours_slept_per_day numeric,
  entered_by uuid references staff(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (resident_id, academic_year, block_number)
);
create index if not exists idx_blocks_study on rotation_blocks (study_id);
create index if not exists idx_blocks_resident on rotation_blocks (resident_id);

-- ============================================================================
-- 8. BLOCK_ASSESSMENTS — unified block-level assessment (CBI+PHQ9+GAD7+ISI+WHO5)
-- ============================================================================
create table if not exists block_assessments (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references studies(id) on delete cascade,
  resident_id uuid not null references burnout_participants(id) on delete cascade,
  assessment_date date not null default CURRENT_DATE,
  block_number integer,
  rotation_name text,
  clinical_intensity integer,
  calls_count integer,
  call_types jsonb default '[]'::jsonb,
  rotation_types jsonb default '[]'::jsonb,
  weekly_hours text,
  major_life_event boolean,
  annual_leave text,
  sick_leave text,
  pregnancy_status boolean,
  -- WHO-5
  who5_items jsonb,
  who5_total integer,
  who5_percent integer,
  -- CBI
  cbi_items jsonb,
  cbi_personal_score numeric,
  cbi_work_score numeric,
  cbi_patient_score numeric,
  cbi_personal_burnout boolean,
  cbi_work_burnout boolean,
  cbi_patient_burnout boolean,
  cbi_any_burnout boolean,
  -- PHQ-9
  phq9_items jsonb,
  phq9_total integer,
  phq9_severity text,
  -- GAD-7
  gad7_items jsonb,
  gad7_total integer,
  gad7_severity text,
  -- ISI
  isi_items jsonb,
  isi_total integer,
  isi_severity text,
  -- Review
  review_status text default 'pending',
  reviewed_by uuid references staff(id),
  reviewed_at timestamptz,
  review_notes text,
  -- Timestamp
  created_at timestamptz not null default now(),
  unique (resident_id, assessment_date)
);
create index if not exists idx_ba_study on block_assessments (study_id);
create index if not exists idx_ba_resident on block_assessments (resident_id);

-- ============================================================================
-- 9. CBI RESPONSES — Copenhagen Burnout Inventory (22 items)
--    3 subscales: Personal (6), Work-related (7), Patient-related (9)
--    Each item scored 1-5 (never -> always). Subscale = mean * 25 -> 0-100.
--    Burnout if subscale >= 50.
-- ============================================================================
create table if not exists cbi_responses (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references studies(id) on delete cascade,
  resident_id uuid not null references burnout_participants(id) on delete cascade,
  block_id uuid references rotation_blocks(id) on delete set null,
  response_date date not null,
  items jsonb not null,
  personal_score numeric not null,
  work_score numeric not null,
  patient_score numeric not null,
  personal_burnout boolean,
  work_burnout boolean,
  patient_burnout boolean,
  any_burnout boolean,
  entered_by uuid references staff(id),
  review_status text default 'pending',
  reviewed_by uuid references staff(id),
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  unique (resident_id, response_date)
);
create index if not exists idx_cbi_study on cbi_responses (study_id);
create index if not exists idx_cbi_resident on cbi_responses (resident_id);

-- ============================================================================
-- 10. PHQ-9 RESPONSES — Patient Health Questionnaire (9 items)
--     Each item 0-3. Total 0-27.
--     Minimal <5, Mild 5-9, Moderate 10-14, Mod-Severe 15-19, Severe 20-27.
-- ============================================================================
create table if not exists phq9_responses (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references studies(id) on delete cascade,
  resident_id uuid not null references burnout_participants(id) on delete cascade,
  block_id uuid references rotation_blocks(id) on delete set null,
  response_date date not null,
  items jsonb not null,
  total_score integer not null,
  severity severity_category,
  entered_by uuid references staff(id),
  review_status text default 'pending',
  reviewed_by uuid references staff(id),
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  unique (resident_id, response_date)
);
create index if not exists idx_phq9_study on phq9_responses (study_id);
create index if not exists idx_phq9_resident on phq9_responses (resident_id);

-- ============================================================================
-- 11. GAD-7 RESPONSES — Generalized Anxiety Disorder (7 items)
--     Each item 0-3. Total 0-21.
--     Minimal <5, Mild 5-9, Moderate 10-14, Severe 15-21.
-- ============================================================================
create table if not exists gad7_responses (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references studies(id) on delete cascade,
  resident_id uuid not null references burnout_participants(id) on delete cascade,
  block_id uuid references rotation_blocks(id) on delete set null,
  response_date date not null,
  items jsonb not null,
  total_score integer not null,
  severity severity_category,
  entered_by uuid references staff(id),
  review_status text default 'pending',
  reviewed_by uuid references staff(id),
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  unique (resident_id, response_date)
);
create index if not exists idx_gad7_study on gad7_responses (study_id);
create index if not exists idx_gad7_resident on gad7_responses (resident_id);

-- ============================================================================
-- 12. ISI RESPONSES — Insomnia Severity Index (7 items)
--     Each item 0-4. Total 0-28.
--     None 0-7, Subthreshold 8-14, Moderate 15-21, Severe 22-28.
-- ============================================================================
create table if not exists isi_responses (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references studies(id) on delete cascade,
  resident_id uuid not null references burnout_participants(id) on delete cascade,
  block_id uuid references rotation_blocks(id) on delete set null,
  response_date date not null,
  items jsonb not null,
  total_score integer not null,
  severity severity_category,
  entered_by uuid references staff(id),
  review_status text default 'pending',
  reviewed_by uuid references staff(id),
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  unique (resident_id, response_date)
);
create index if not exists idx_isi_study on isi_responses (study_id);
create index if not exists idx_isi_resident on isi_responses (resident_id);

-- ============================================================================
-- 13. WEEKLY CHECK-INS
-- ============================================================================
create table if not exists weekly_checkins (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references studies(id) on delete cascade,
  resident_id uuid not null references burnout_participants(id) on delete cascade,
  week_start date not null,
  hours_worked numeric,
  on_call_count integer check (on_call_count >= 0 and on_call_count <= 7),
  call_type text check (call_type in ('none', '24h', 'shift', 'mixed')),
  call_busyness integer check (call_busyness >= 1 and call_busyness <= 5),
  sleep_rating integer check (sleep_rating >= 1 and sleep_rating <= 5),
  stress_level integer check (stress_level >= 1 and stress_level <= 5),
  created_at timestamptz not null default now(),
  unique (resident_id, week_start)
);
create index if not exists idx_wc_study on weekly_checkins (study_id);
create index if not exists idx_wc_resident on weekly_checkins (resident_id);

-- ============================================================================
-- 14. WHOOP TOKENS — OAuth tokens for WHOOP API
-- ============================================================================
create table if not exists whoop_tokens (
  id uuid primary key default gen_random_uuid(),
  resident_id uuid unique not null references burnout_participants(id) on delete cascade,
  participant_id uuid references burnout_participants(id),
  whoop_user_id text not null,
  access_token text not null,
  refresh_token text default '',
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 15. WHOOP PULLS — 4-week aggregated biophysical data
-- ============================================================================
create table if not exists whoop_pulls (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references studies(id) on delete cascade,
  resident_id uuid not null references burnout_participants(id) on delete cascade,
  block_id uuid references rotation_blocks(id) on delete set null,
  period_start date not null,
  period_end date not null,
  -- Recovery metrics
  avg_hrv_rmssd_ms numeric,
  avg_resting_hr_bpm numeric,
  avg_spo2_pct numeric,
  avg_skin_temp_c numeric,
  avg_recovery_score numeric,
  -- Sleep metrics
  avg_total_sleep_min numeric,
  avg_light_sleep_min numeric,
  avg_deep_sleep_min numeric,
  avg_rem_sleep_min numeric,
  avg_sleep_efficiency_pct numeric,
  avg_sleep_consistency_pct numeric,
  avg_sleep_performance_pct numeric,
  avg_sleep_debt_min numeric,
  avg_respiratory_rate_bpm numeric,
  avg_time_in_bed_min numeric,
  avg_disturbance_count numeric,
  avg_awake_time_min numeric,
  avg_no_data_time_min numeric,
  avg_sleep_cycle_count numeric,
  avg_sleep_need_baseline_min numeric,
  avg_sleep_need_from_strain_min numeric,
  avg_sleep_need_from_nap_min numeric,
  avg_sleep_onset_min numeric,
  avg_wake_time_min numeric,
  avg_restorative_sleep_min numeric,
  nap_count integer,
  -- Strain / workout metrics
  avg_daily_strain numeric,
  avg_hr_bpm numeric,
  max_hr_bpm numeric,
  avg_kilojoules numeric,
  hr_zone0_min numeric,
  hr_zone1_min numeric,
  hr_zone2_min numeric,
  hr_zone3_min numeric,
  hr_zone4_min numeric,
  hr_zone5_min numeric,
  workout_count integer,
  avg_workout_distance_m numeric,
  top_sport_name text,
  all_sport_names text,
  -- Per-workout metrics
  avg_workout_strain numeric,
  avg_workout_hr_bpm numeric,
  max_workout_hr_bpm numeric,
  avg_workout_kj numeric,
  total_altitude_gain_m numeric,
  -- Body measurements (from WHOOP profile)
  whoop_height_m numeric,
  whoop_weight_kg numeric,
  whoop_max_hr integer,
  -- Quality
  any_calibrating boolean,
  days_with_data integer,
  pct_recorded numeric,
  -- Raw
  pulled_at timestamptz not null default now(),
  raw_json jsonb,
  unique (resident_id, period_start, period_end)
);
create index if not exists idx_whoop_study on whoop_pulls (study_id);
create index if not exists idx_whoop_resident on whoop_pulls (resident_id);

-- ============================================================================
-- 16. EVENT LOGS — general study event tracking
-- ============================================================================
create table if not exists event_logs (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references studies(id) on delete cascade,
  resident_id uuid not null references burnout_participants(id) on delete cascade,
  category text not null,
  event_type text not null,
  details text,
  event_date date not null default CURRENT_DATE,
  created_at timestamptz not null default now()
);
create index if not exists idx_el_study on event_logs (study_id);
create index if not exists idx_el_resident on event_logs (resident_id);

-- ============================================================================
-- 17. ENROLLMENT EVENTS
-- ============================================================================
create table if not exists enrollment_events (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references studies(id) on delete cascade,
  resident_id uuid not null references burnout_participants(id) on delete cascade,
  event_type text not null,
  details jsonb,
  performed_by uuid references staff(id),
  created_at timestamptz not null default now()
);
create index if not exists idx_enroll_study on enrollment_events (study_id);
create index if not exists idx_enroll_resident on enrollment_events (resident_id);

-- ============================================================================
-- 18. ADHERENCE ALERTS
-- ============================================================================
create table if not exists adherence_alerts (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references studies(id) on delete cascade,
  resident_id uuid not null references burnout_participants(id) on delete cascade,
  alert_type text not null,
  pct_recorded numeric,
  days_with_data integer,
  message_sent_to text[],
  created_at timestamptz not null default now()
);
create index if not exists idx_aa_study on adherence_alerts (study_id);
create index if not exists idx_aa_resident on adherence_alerts (resident_id);

-- ============================================================================
-- 19. ANOMALY INVESTIGATIONS
-- ============================================================================
create table if not exists anomaly_investigations (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references studies(id) on delete cascade,
  resident_id uuid not null references burnout_participants(id) on delete cascade,
  anomaly_type text not null,
  trigger_detail jsonb not null,
  token text unique not null,
  resident_response text,
  response_details text,
  responded_at timestamptz,
  email_sent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists idx_ai_study on anomaly_investigations (study_id);
create index if not exists idx_ai_resident on anomaly_investigations (resident_id);

-- ============================================================================
-- 20. QUESTIONNAIRE REMINDERS — escalation tracking for overdue assessments
-- ============================================================================
create table if not exists questionnaire_reminders (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references studies(id) on delete cascade,
  resident_id uuid not null references burnout_participants(id) on delete cascade,
  block_number integer not null,
  level integer not null check (level between 1 and 5),
  reminder_type text not null,  -- email_gentle, email_firm, email_final, coordinator_escalation
  sent_to text[] not null default '{}',
  missing_items text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists idx_qr_study on questionnaire_reminders (study_id);
create index if not exists idx_qr_resident on questionnaire_reminders (resident_id);
create index if not exists idx_qr_block on questionnaire_reminders (block_number, level);

-- ============================================================================
-- 21. AUDIT LOG
-- ============================================================================
create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references staff(id),
  study_id uuid references studies(id),
  action text not null,
  resource_type text,
  resource_id uuid,
  metadata jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_staff on audit_log (staff_id);
create index if not exists idx_audit_study on audit_log (study_id);
create index if not exists idx_audit_time on audit_log (created_at desc);

-- ============================================================================
-- HELPER FUNCTIONS for RLS
-- ============================================================================
create or replace function current_staff_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from staff where auth_user_id = auth.uid() and active = true limit 1;
$$;

create or replace function current_role_for_study(_study_id uuid)
returns text language sql stable security definer set search_path = public as $$
  select ssr.role from staff_study_roles ssr
  join staff s on s.id = ssr.staff_id
  where s.auth_user_id = auth.uid() and s.active = true and ssr.study_id = _study_id
  limit 1;
$$;

create or replace function current_site_for_study(_study_id uuid)
returns study_site language sql stable security definer set search_path = public as $$
  select ssr.site_scope from staff_study_roles ssr
  join staff s on s.id = ssr.staff_id
  where s.auth_user_id = auth.uid() and s.active = true and ssr.study_id = _study_id
  limit 1;
$$;

create or replace function is_authenticated_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from staff where auth_user_id = auth.uid() and active = true);
$$;

create or replace function can_read_study_data(_study_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select current_role_for_study(_study_id) in (
    'admin','apd','coordinator','chief_resident','resident',
    'external_coordinator','external_resident','faculty','ec_member','auditor');
$$;

create or replace function can_write_study_data(_study_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select current_role_for_study(_study_id) in (
    'admin','apd','coordinator','chief_resident');
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table studies               enable row level security;
alter table staff                 enable row level security;
alter table staff_study_roles     enable row level security;
alter table burnout_participants  enable row level security;
alter table rotation_blocks       enable row level security;
alter table block_assessments     enable row level security;
alter table cbi_responses         enable row level security;
alter table phq9_responses        enable row level security;
alter table gad7_responses        enable row level security;
alter table isi_responses         enable row level security;
alter table weekly_checkins       enable row level security;
alter table whoop_tokens          enable row level security;
alter table whoop_pulls           enable row level security;
alter table event_logs            enable row level security;
alter table enrollment_events     enable row level security;
alter table adherence_alerts      enable row level security;
alter table anomaly_investigations enable row level security;
alter table audit_log             enable row level security;

-- Studies
drop policy if exists studies_select on studies;
create policy studies_select on studies for select using (is_authenticated_staff());

-- Staff
drop policy if exists staff_self on staff;
create policy staff_self on staff for select using (auth_user_id = auth.uid() or is_authenticated_staff());

-- Staff study roles
drop policy if exists ssr_self on staff_study_roles;
create policy ssr_self on staff_study_roles for select using (staff_id = current_staff_id());

-- Burnout participants
drop policy if exists bp_select on burnout_participants;
create policy bp_select on burnout_participants for select using (
  can_read_study_data(study_id)
  or auth_user_id = auth.uid()
);
drop policy if exists bp_insert on burnout_participants;
create policy bp_insert on burnout_participants for insert with check (
  can_write_study_data(study_id));
drop policy if exists bp_update on burnout_participants;
create policy bp_update on burnout_participants for update using (
  can_write_study_data(study_id)
  or auth_user_id = auth.uid()
);
drop policy if exists bp_delete on burnout_participants;
create policy bp_delete on burnout_participants for delete using (
  current_role_for_study(study_id) = 'admin');

-- Rotation blocks
drop policy if exists blocks_select on rotation_blocks;
create policy blocks_select on rotation_blocks for select using (can_read_study_data(study_id));
drop policy if exists blocks_write on rotation_blocks;
create policy blocks_write on rotation_blocks for all
  using (can_write_study_data(study_id)) with check (can_write_study_data(study_id));

-- Block assessments
drop policy if exists ba_select on block_assessments;
create policy ba_select on block_assessments for select using (can_read_study_data(study_id));
drop policy if exists ba_write on block_assessments;
create policy ba_write on block_assessments for all
  using (can_write_study_data(study_id)) with check (can_write_study_data(study_id));

-- CBI
drop policy if exists cbi_select on cbi_responses;
create policy cbi_select on cbi_responses for select using (can_read_study_data(study_id));
drop policy if exists cbi_write on cbi_responses;
create policy cbi_write on cbi_responses for all
  using (can_write_study_data(study_id)) with check (can_write_study_data(study_id));

-- PHQ-9
drop policy if exists phq9_select on phq9_responses;
create policy phq9_select on phq9_responses for select using (can_read_study_data(study_id));
drop policy if exists phq9_write on phq9_responses;
create policy phq9_write on phq9_responses for all
  using (can_write_study_data(study_id)) with check (can_write_study_data(study_id));

-- GAD-7
drop policy if exists gad7_select on gad7_responses;
create policy gad7_select on gad7_responses for select using (can_read_study_data(study_id));
drop policy if exists gad7_write on gad7_responses;
create policy gad7_write on gad7_responses for all
  using (can_write_study_data(study_id)) with check (can_write_study_data(study_id));

-- ISI
drop policy if exists isi_select on isi_responses;
create policy isi_select on isi_responses for select using (can_read_study_data(study_id));
drop policy if exists isi_write on isi_responses;
create policy isi_write on isi_responses for all
  using (can_write_study_data(study_id)) with check (can_write_study_data(study_id));

-- Weekly check-ins
drop policy if exists wc_select on weekly_checkins;
create policy wc_select on weekly_checkins for select using (can_read_study_data(study_id));
drop policy if exists wc_write on weekly_checkins;
create policy wc_write on weekly_checkins for all
  using (can_write_study_data(study_id)) with check (can_write_study_data(study_id));

-- WHOOP tokens
drop policy if exists wt_select on whoop_tokens;
create policy wt_select on whoop_tokens for select using (
  exists (select 1 from burnout_participants bp
    where bp.id = whoop_tokens.resident_id and can_read_study_data(bp.study_id))
);
drop policy if exists wt_write on whoop_tokens;
create policy wt_write on whoop_tokens for all using (
  exists (select 1 from burnout_participants bp
    where bp.id = whoop_tokens.resident_id and can_write_study_data(bp.study_id))
) with check (
  exists (select 1 from burnout_participants bp
    where bp.id = whoop_tokens.resident_id and can_write_study_data(bp.study_id))
);

-- WHOOP pulls
drop policy if exists whoop_select on whoop_pulls;
create policy whoop_select on whoop_pulls for select using (can_read_study_data(study_id));
drop policy if exists whoop_write on whoop_pulls;
create policy whoop_write on whoop_pulls for all
  using (current_role_for_study(study_id) = 'admin')
  with check (current_role_for_study(study_id) = 'admin');

-- Event logs
drop policy if exists el_select on event_logs;
create policy el_select on event_logs for select using (can_read_study_data(study_id));
drop policy if exists el_write on event_logs;
create policy el_write on event_logs for all
  using (can_write_study_data(study_id)) with check (can_write_study_data(study_id));

-- Enrollment events
drop policy if exists enroll_select on enrollment_events;
create policy enroll_select on enrollment_events for select using (can_read_study_data(study_id));
drop policy if exists enroll_write on enrollment_events;
create policy enroll_write on enrollment_events for insert with check (
  can_write_study_data(study_id));

-- Adherence alerts
drop policy if exists aa_select on adherence_alerts;
create policy aa_select on adherence_alerts for select using (can_read_study_data(study_id));
drop policy if exists aa_write on adherence_alerts;
create policy aa_write on adherence_alerts for insert with check (
  can_write_study_data(study_id));

-- Anomaly investigations
drop policy if exists ai_select on anomaly_investigations;
create policy ai_select on anomaly_investigations for select using (can_read_study_data(study_id));
drop policy if exists ai_write on anomaly_investigations;
create policy ai_write on anomaly_investigations for all
  using (can_write_study_data(study_id)) with check (can_write_study_data(study_id));

-- Questionnaire reminders
alter table questionnaire_reminders enable row level security;
drop policy if exists qr_select on questionnaire_reminders;
create policy qr_select on questionnaire_reminders for select using (can_read_study_data(study_id));
drop policy if exists qr_write on questionnaire_reminders;
create policy qr_write on questionnaire_reminders for insert with check (
  can_write_study_data(study_id));

-- Audit log
drop policy if exists audit_select on audit_log;
create policy audit_select on audit_log for select using (current_role_for_study(study_id) = 'admin');
drop policy if exists audit_insert on audit_log;
create policy audit_insert on audit_log for insert with check (auth.uid() is not null);

-- ============================================================================
-- ANALYSIS VIEW — one row per participant per block with ALL measures
-- ============================================================================
drop view if exists v_block_measures;
create or replace view v_block_measures as
select
  st.slug as study_slug,
  st.short_name as study_name,
  bp.study_participant_id,
  bp.age_at_enrollment,
  bp.sex,
  bp.program,
  bp.pgy_level,
  bp.primary_site,
  b.block_number,
  b.academic_year,
  b.rotation_type,
  b.rotation_site,
  b.calls_count,
  b.primary_call_type,
  b.hours_worked_per_week,
  b.hours_slept_per_day,
  -- CBI
  c.personal_score  as cbi_personal,
  c.work_score      as cbi_work,
  c.patient_score   as cbi_patient,
  c.any_burnout     as cbi_burnout,
  -- PHQ-9
  ph.total_score    as phq9_score,
  ph.severity       as phq9_severity,
  -- GAD-7
  g.total_score     as gad7_score,
  g.severity        as gad7_severity,
  -- ISI
  i.total_score     as isi_score,
  i.severity        as isi_severity,
  -- WHOOP
  w.avg_hrv_rmssd_ms,
  w.avg_resting_hr_bpm,
  w.avg_spo2_pct,
  w.avg_skin_temp_c,
  w.avg_recovery_score,
  w.avg_total_sleep_min,
  w.avg_sleep_efficiency_pct,
  w.avg_daily_strain,
  w.days_with_data
from studies st
join burnout_participants bp on bp.study_id = st.id
join rotation_blocks b      on b.resident_id = bp.id and b.study_id = st.id
left join lateral (
  select * from cbi_responses where resident_id = bp.id and block_id = b.id
  order by response_date desc limit 1
) c on true
left join lateral (
  select * from phq9_responses where resident_id = bp.id and block_id = b.id
  order by response_date desc limit 1
) ph on true
left join lateral (
  select * from gad7_responses where resident_id = bp.id and block_id = b.id
  order by response_date desc limit 1
) g on true
left join lateral (
  select * from isi_responses where resident_id = bp.id and block_id = b.id
  order by response_date desc limit 1
) i on true
left join lateral (
  select * from whoop_pulls where resident_id = bp.id and block_id = b.id
  order by pulled_at desc limit 1
) w on true;

-- ============================================================================
-- UPDATED_AT triggers
-- ============================================================================
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists studies_touch on studies;
create trigger studies_touch before update on studies for each row execute function touch_updated_at();
drop trigger if exists bp_touch on burnout_participants;
create trigger bp_touch before update on burnout_participants for each row execute function touch_updated_at();
drop trigger if exists blocks_touch on rotation_blocks;
create trigger blocks_touch before update on rotation_blocks for each row execute function touch_updated_at();
drop trigger if exists residents_touch on residents;
create trigger residents_touch before update on residents for each row execute function touch_updated_at();
drop trigger if exists whoop_tokens_touch on whoop_tokens;
create trigger whoop_tokens_touch before update on whoop_tokens for each row execute function touch_updated_at();

-- ============================================================================
-- Done. Now run seed.sql separately.
-- ============================================================================
