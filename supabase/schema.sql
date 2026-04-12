-- ============================================================================
-- MedResearch Academy — Unified Research Data Platform
-- Multi-tenant schema v1.0 — one project, many studies
-- ============================================================================
-- Run this in the Supabase SQL editor of your MedResearch Academy project.
-- Idempotent: re-running will not destroy data.
--
-- Hosts data for all MedResearch Academy studies:
--   - Resident Burnout (MREC #3190)
--   - Residency & Parenthood (MREC #3679)
--   - AI Rota Optimization
--   - EMAN — ECG Mastery
-- ============================================================================

create extension if not exists "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================
do $$ begin
  create type user_role as enum (
    'super_admin',
    'research_admin',
    'site_coordinator',
    'research_assistant',
    'statistician'
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
  create type call_type as enum ('none', '24h', 'shift');
exception when duplicate_object then null; end $$;

do $$ begin
  create type burnout_category as enum ('low', 'moderate', 'high');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- STUDIES — the umbrella table. Every data row belongs to exactly one study.
-- ============================================================================
create table if not exists studies (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,                 -- URL slug, e.g. 'resident-burnout'
  short_name text not null,                  -- display name, e.g. 'Resident Burnout'
  full_title text not null,                  -- as approved by ethics
  description text,
  pi_name text not null,
  co_pi_name text,
  status study_status not null default 'planning',
  mrec_number text,                          -- e.g. '3190'
  ethics_refs text[],                        -- e.g. ['SQU-EC/297/2023', 'MoH/CSR/24/28632']
  ethics_approved_date date,
  ethics_expires_date date,
  start_date date,
  end_date date,
  funding_source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_studies_slug on studies (slug);
create index if not exists idx_studies_status on studies (status);

-- ============================================================================
-- STAFF — who can access the dashboard (5 roles)
-- One staff member can have different roles in different studies via staff_study_roles
-- ============================================================================
create table if not exists staff (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,                  -- links to auth.users once they sign in
  email text unique not null,
  full_name text not null,
  title text,                                -- e.g. 'Senior Consultant', 'Research Coordinator'
  primary_site study_site,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_staff_email on staff (email);
create index if not exists idx_staff_auth on staff (auth_user_id);

-- Per-study role assignment. A person can be super_admin in Study A but
-- only research_assistant in Study B.
create table if not exists staff_study_roles (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff(id) on delete cascade,
  study_id uuid not null references studies(id) on delete cascade,
  role user_role not null,
  site_scope study_site,                     -- for site_coordinator: only their site
  created_at timestamptz not null default now(),
  unique (staff_id, study_id)
);

create index if not exists idx_ssr_staff on staff_study_roles (staff_id);
create index if not exists idx_ssr_study on staff_study_roles (study_id);

-- ============================================================================
-- RESIDENTS — study participants (scoped to a study)
-- ============================================================================
create table if not exists residents (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references studies(id) on delete cascade,
  study_participant_id text not null,        -- e.g. 'RES-042' — unique within a study
  -- PII (behind RLS, visible only to authorized roles)
  full_name text,
  email text,
  phone text,
  whoop_user_id text,
  -- Demographics
  age_at_enrollment integer,
  sex text check (sex in ('male', 'female')),
  marital_status text,
  number_of_kids integer,
  social_support text,
  annual_income_bracket text,
  -- Program info
  program residency_program,
  pgy_level integer check (pgy_level between 1 and 6),
  primary_site study_site,
  -- Enrollment state
  status enrollment_status not null default 'pending',
  enrollment_date date,
  withdrawal_date date,
  withdrawal_reason text,
  -- Device (burnout-specific)
  whoop_device_serial text,
  -- Audit
  created_by uuid references staff(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (study_id, study_participant_id)
);

create index if not exists idx_residents_study on residents (study_id);
create index if not exists idx_residents_status on residents (study_id, status);
create index if not exists idx_residents_site on residents (study_id, primary_site);

-- ============================================================================
-- ROTATION BLOCKS — one row per resident per 4-week block
-- ============================================================================
create table if not exists rotation_blocks (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references studies(id) on delete cascade,
  resident_id uuid not null references residents(id) on delete cascade,
  block_number integer not null check (block_number between 1 and 13),
  academic_year text not null,
  rotation_name text,
  rotation_type rotation_type,
  rotation_site study_site,
  period_start date not null,
  period_end date not null,
  calls_count integer,
  primary_call_type call_type,
  hours_worked_per_week numeric(5,1),
  hours_slept_per_day numeric(4,1),
  entered_by uuid references staff(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (resident_id, academic_year, block_number)
);

create index if not exists idx_blocks_study on rotation_blocks (study_id);
create index if not exists idx_blocks_resident on rotation_blocks (resident_id);
create index if not exists idx_blocks_period on rotation_blocks (period_start, period_end);

-- ============================================================================
-- MBI RESPONSES — Maslach Burnout Inventory (22 items)
-- ============================================================================
create table if not exists mbi_responses (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references studies(id) on delete cascade,
  resident_id uuid not null references residents(id) on delete cascade,
  block_id uuid references rotation_blocks(id) on delete set null,
  response_date date not null,
  items jsonb not null,                      -- {"q1": 4, "q2": 3, ...}
  ee_score integer not null,                 -- 0-54
  dp_score integer not null,                 -- 0-30
  pa_score integer not null,                 -- 0-48
  ee_category burnout_category,
  dp_category burnout_category,
  pa_category burnout_category,
  burnout_positive boolean,                  -- high EE AND high DP
  entered_by uuid references staff(id),
  created_at timestamptz not null default now(),
  unique (resident_id, response_date)
);

create index if not exists idx_mbi_study on mbi_responses (study_id);
create index if not exists idx_mbi_resident on mbi_responses (resident_id);
create index if not exists idx_mbi_date on mbi_responses (response_date);

-- ============================================================================
-- PROMIS-29 RESPONSES — 8 domains
-- ============================================================================
create table if not exists promis29_responses (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references studies(id) on delete cascade,
  resident_id uuid not null references residents(id) on delete cascade,
  block_id uuid references rotation_blocks(id) on delete set null,
  response_date date not null,
  items jsonb not null,
  physical_function numeric(5,1),
  anxiety numeric(5,1),
  depression numeric(5,1),
  fatigue numeric(5,1),
  sleep_disturbance numeric(5,1),
  social_roles numeric(5,1),
  pain_interference numeric(5,1),
  pain_intensity integer check (pain_intensity between 0 and 10),
  entered_by uuid references staff(id),
  created_at timestamptz not null default now(),
  unique (resident_id, response_date)
);

create index if not exists idx_promis_study on promis29_responses (study_id);
create index if not exists idx_promis_resident on promis29_responses (resident_id);

-- ============================================================================
-- WHOOP PULLS — 4-week aggregated biophysical data
-- ============================================================================
create table if not exists whoop_pulls (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references studies(id) on delete cascade,
  resident_id uuid not null references residents(id) on delete cascade,
  block_id uuid references rotation_blocks(id) on delete set null,
  period_start date not null,
  period_end date not null,
  -- Recovery
  avg_hrv_rmssd_ms numeric(6,2),
  avg_resting_hr_bpm numeric(5,2),
  avg_spo2_pct numeric(5,2),
  avg_skin_temp_c numeric(5,2),
  avg_recovery_score numeric(5,2),
  -- Sleep
  avg_total_sleep_min numeric(6,1),
  avg_light_sleep_min numeric(6,1),
  avg_deep_sleep_min numeric(6,1),
  avg_rem_sleep_min numeric(6,1),
  avg_sleep_efficiency_pct numeric(5,2),
  avg_sleep_consistency_pct numeric(5,2),
  avg_sleep_performance_pct numeric(5,2),
  avg_sleep_debt_min numeric(6,1),
  avg_respiratory_rate_bpm numeric(5,2),
  avg_time_in_bed_min numeric(6,1),
  avg_disturbance_count numeric(5,2),
  nap_count integer,
  -- Strain / activity
  avg_daily_strain numeric(5,2),
  avg_hr_bpm numeric(5,2),
  max_hr_bpm numeric(5,2),
  avg_kilojoules numeric(8,1),
  hr_zone1_min numeric(6,1),
  hr_zone2_min numeric(6,1),
  hr_zone3_min numeric(6,1),
  hr_zone4_min numeric(6,1),
  hr_zone5_min numeric(6,1),
  workout_count integer,
  -- Data quality
  days_with_data integer,
  pct_recorded numeric(5,2),
  pulled_at timestamptz not null default now(),
  raw_json jsonb,
  unique (resident_id, period_start, period_end)
);

create index if not exists idx_whoop_study on whoop_pulls (study_id);
create index if not exists idx_whoop_resident on whoop_pulls (resident_id);

-- ============================================================================
-- ENROLLMENT EVENTS
-- ============================================================================
create table if not exists enrollment_events (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references studies(id) on delete cascade,
  resident_id uuid not null references residents(id) on delete cascade,
  event_type text not null,
  details jsonb,
  performed_by uuid references staff(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_enroll_study on enrollment_events (study_id);
create index if not exists idx_enroll_resident on enrollment_events (resident_id);

-- ============================================================================
-- AUDIT LOG
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
returns uuid
language sql stable security definer set search_path = public
as $$
  select id from staff where auth_user_id = auth.uid() and active = true limit 1;
$$;

-- Returns the role for (current user, given study_id). Null if no access.
create or replace function current_role_for_study(_study_id uuid)
returns user_role
language sql stable security definer set search_path = public
as $$
  select ssr.role
  from staff_study_roles ssr
  join staff s on s.id = ssr.staff_id
  where s.auth_user_id = auth.uid()
    and s.active = true
    and ssr.study_id = _study_id
  limit 1;
$$;

-- Returns the site scope for (current user, given study_id).
create or replace function current_site_for_study(_study_id uuid)
returns study_site
language sql stable security definer set search_path = public
as $$
  select ssr.site_scope
  from staff_study_roles ssr
  join staff s on s.id = ssr.staff_id
  where s.auth_user_id = auth.uid()
    and s.active = true
    and ssr.study_id = _study_id
  limit 1;
$$;

-- True if current user has any role in any study.
create or replace function is_authenticated_staff()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from staff where auth_user_id = auth.uid() and active = true
  );
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table studies             enable row level security;
alter table staff               enable row level security;
alter table staff_study_roles   enable row level security;
alter table residents           enable row level security;
alter table rotation_blocks     enable row level security;
alter table mbi_responses       enable row level security;
alter table promis29_responses  enable row level security;
alter table whoop_pulls         enable row level security;
alter table enrollment_events   enable row level security;
alter table audit_log           enable row level security;

-- Studies: any authenticated staff can see the list (needed to render the
-- dashboard landing page). But only roles with access to a specific study
-- can see its data (enforced on the data tables themselves).
drop policy if exists studies_select on studies;
create policy studies_select on studies for select
  using (is_authenticated_staff());

-- Staff: everyone sees own row
drop policy if exists staff_self on staff;
create policy staff_self on staff for select
  using (auth_user_id = auth.uid() or is_authenticated_staff());

-- staff_study_roles: everyone sees their own assignments
drop policy if exists ssr_self on staff_study_roles;
create policy ssr_self on staff_study_roles for select
  using (staff_id = current_staff_id());

-- Residents
drop policy if exists residents_select on residents;
create policy residents_select on residents for select
  using (
    current_role_for_study(study_id) in ('super_admin', 'research_admin', 'research_assistant', 'statistician')
    or (
      current_role_for_study(study_id) = 'site_coordinator'
      and primary_site = current_site_for_study(study_id)
    )
  );

drop policy if exists residents_insert on residents;
create policy residents_insert on residents for insert
  with check (
    current_role_for_study(study_id) in ('super_admin', 'research_admin', 'site_coordinator')
  );

drop policy if exists residents_update on residents;
create policy residents_update on residents for update
  using (
    current_role_for_study(study_id) in ('super_admin', 'research_admin')
    or (
      current_role_for_study(study_id) = 'site_coordinator'
      and primary_site = current_site_for_study(study_id)
    )
  );

drop policy if exists residents_delete on residents;
create policy residents_delete on residents for delete
  using (current_role_for_study(study_id) = 'super_admin');

-- Rotation blocks, MBI, PROMIS — same pattern: data_readers can read,
-- data_entry roles can write.
create or replace function can_read_study_data(_study_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select current_role_for_study(_study_id) in (
    'super_admin', 'research_admin', 'research_assistant', 'statistician', 'site_coordinator'
  );
$$;

create or replace function can_write_study_data(_study_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select current_role_for_study(_study_id) in (
    'super_admin', 'research_admin', 'research_assistant', 'site_coordinator'
  );
$$;

-- Rotation blocks
drop policy if exists blocks_select on rotation_blocks;
create policy blocks_select on rotation_blocks for select
  using (can_read_study_data(study_id));
drop policy if exists blocks_write on rotation_blocks;
create policy blocks_write on rotation_blocks for all
  using (can_write_study_data(study_id))
  with check (can_write_study_data(study_id));

-- MBI
drop policy if exists mbi_select on mbi_responses;
create policy mbi_select on mbi_responses for select
  using (can_read_study_data(study_id));
drop policy if exists mbi_write on mbi_responses;
create policy mbi_write on mbi_responses for all
  using (can_write_study_data(study_id))
  with check (can_write_study_data(study_id));

-- PROMIS-29
drop policy if exists promis_select on promis29_responses;
create policy promis_select on promis29_responses for select
  using (can_read_study_data(study_id));
drop policy if exists promis_write on promis29_responses;
create policy promis_write on promis29_responses for all
  using (can_write_study_data(study_id))
  with check (can_write_study_data(study_id));

-- WHOOP (read-only for most; only super_admin and service role can write)
drop policy if exists whoop_select on whoop_pulls;
create policy whoop_select on whoop_pulls for select
  using (can_read_study_data(study_id));
drop policy if exists whoop_write on whoop_pulls;
create policy whoop_write on whoop_pulls for all
  using (current_role_for_study(study_id) = 'super_admin')
  with check (current_role_for_study(study_id) = 'super_admin');

-- Enrollment events
drop policy if exists enroll_select on enrollment_events;
create policy enroll_select on enrollment_events for select
  using (can_read_study_data(study_id));
drop policy if exists enroll_write on enrollment_events;
create policy enroll_write on enrollment_events for insert
  with check (
    current_role_for_study(study_id) in ('super_admin', 'research_admin', 'site_coordinator')
  );

-- Audit log
drop policy if exists audit_select on audit_log;
create policy audit_select on audit_log for select
  using (current_role_for_study(study_id) = 'super_admin');
drop policy if exists audit_insert on audit_log;
create policy audit_insert on audit_log for insert
  with check (auth.uid() is not null);

-- ============================================================================
-- ANALYSIS VIEW — one row per resident per block with ALL measures
-- ============================================================================
create or replace view v_block_measures as
select
  st.slug as study_slug,
  st.short_name as study_name,
  r.study_participant_id,
  r.age_at_enrollment,
  r.sex,
  r.program,
  r.pgy_level,
  r.primary_site,
  b.block_number,
  b.academic_year,
  b.rotation_type,
  b.rotation_site,
  b.calls_count,
  b.primary_call_type,
  b.hours_worked_per_week,
  b.hours_slept_per_day,
  m.ee_score,
  m.dp_score,
  m.pa_score,
  m.burnout_positive,
  p.anxiety     as promis_anxiety,
  p.depression  as promis_depression,
  p.fatigue     as promis_fatigue,
  p.sleep_disturbance as promis_sleep_disturbance,
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
join residents r       on r.study_id = st.id
join rotation_blocks b on b.resident_id = r.id and b.study_id = st.id
left join lateral (
  select * from mbi_responses
  where resident_id = r.id and block_id = b.id
  order by response_date desc limit 1
) m on true
left join lateral (
  select * from promis29_responses
  where resident_id = r.id and block_id = b.id
  order by response_date desc limit 1
) p on true
left join lateral (
  select * from whoop_pulls
  where resident_id = r.id and block_id = b.id
  order by pulled_at desc limit 1
) w on true;

-- ============================================================================
-- UPDATED_AT triggers
-- ============================================================================
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists studies_touch on studies;
create trigger studies_touch before update on studies
for each row execute function touch_updated_at();

drop trigger if exists residents_touch on residents;
create trigger residents_touch before update on residents
for each row execute function touch_updated_at();

drop trigger if exists blocks_touch on rotation_blocks;
create trigger blocks_touch before update on rotation_blocks
for each row execute function touch_updated_at();

-- ============================================================================
-- Schema complete. Next: run supabase/seed.sql to insert the study rows.
-- ============================================================================
