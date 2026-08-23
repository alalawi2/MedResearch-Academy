-- ============================================================================
-- Thalassemia Study — Myocardial Iron Overload in TDT (MREC #3938)
-- PI: Dr. Mohammed Al Rawahi · SQU Medical Research Council funded
-- ============================================================================
-- Adds:
--   * studies row (slug: thalassemia-cardiac)
--   * staff + staff_study_roles for 14 team members
--   * 10 tables: patients, patient_identifiers, visit_schedule, transfusions,
--                lab, echo, ecg, t2mri, polysomnography, scg, adverse_events
--   * RLS: two-tier (identified vs pseudonymized), audit columns
-- Idempotent. Safe to re-run.
-- ============================================================================

-- ── ENUMS ────────────────────────────────────────────────────────────────────
do $$ begin
  create type thal_timepoint as enum ('baseline', '6mo', '12mo', 'unscheduled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type thal_diagnosis as enum ('major', 'intermedia');
exception when duplicate_object then null; end $$;

do $$ begin
  create type thal_visit_status as enum ('scheduled', 'complete', 'missed', 'window_open', 'overdue');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ae_severity as enum ('mild', 'moderate', 'severe', 'life_threatening', 'fatal');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ae_relatedness as enum ('unrelated', 'unlikely', 'possible', 'probable', 'definite');
exception when duplicate_object then null; end $$;

-- ── RLS HELPER — identifier-restricted access ────────────────────────────────
create or replace function can_read_identifiers(_study_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select current_role_for_study(_study_id) in ('super_admin', 'research_admin');
$$;

create or replace function can_write_identifiers(_study_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select current_role_for_study(_study_id) in ('super_admin', 'research_admin');
$$;

-- ── PATIENTS (pseudonymized — safe for whole team) ───────────────────────────
create table if not exists thalassemia_patients (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references studies(id) on delete cascade,
  patient_code text not null,                -- e.g., "TDT-001", the study pseudonym
  enrollment_date date,
  age_at_enrollment integer,
  sex smallint,                              -- 0 = female, 1 = male
  bmi numeric(5,2),
  diagnosis thal_diagnosis,
  age_at_diagnosis integer,
  transfusion_frequency text,                -- e.g. "3-4 weeks"
  chelation_therapy text,                    -- current chelator(s)
  splenectomy boolean default false,
  -- Cardiac complications
  heart_failure boolean default false,
  hf_onset_date date,
  pericarditis boolean default false,
  myocarditis boolean default false,
  pulmonary_hypertension boolean default false,
  af boolean default false,                  -- atrial fibrillation
  vt boolean default false,                  -- ventricular tachycardia
  pacs boolean default false,                -- premature atrial contractions
  pvcs boolean default false,                -- premature ventricular contractions
  nsvt boolean default false,
  svt boolean default false,
  heart_block boolean default false,
  heart_block_type text,
  ecg_abnormality text,
  pericardial_effusion boolean default false,
  scd boolean default false,                 -- sudden cardiac death
  age_at_death integer,
  death_reason text,
  -- Other complications
  dm boolean default false,
  liver_disease boolean default false,
  stroke boolean default false,
  hypothyroidism boolean default false,
  kidney_disease boolean default false,
  peripheral_vascular_disease boolean default false,
  other_complications text,
  drugs_used text,
  notes text,
  status enrollment_status not null default 'active',
  -- Audit
  entered_by uuid references staff(id),
  entered_at timestamptz not null default now(),
  updated_by uuid references staff(id),
  updated_at timestamptz not null default now(),
  unique (study_id, patient_code)
);
create index if not exists idx_thal_patients_study on thalassemia_patients (study_id);
create index if not exists idx_thal_patients_code on thalassemia_patients (patient_code);

-- ── IDENTIFIERS (PHI — PI/Co-PI only) ────────────────────────────────────────
create table if not exists thalassemia_patient_identifiers (
  patient_id uuid primary key references thalassemia_patients(id) on delete cascade,
  study_id uuid not null references studies(id) on delete cascade,
  mrn text not null,
  full_name text not null,
  contact_phone text,
  contact_email text,
  entered_by uuid references staff(id),
  entered_at timestamptz not null default now(),
  updated_by uuid references staff(id),
  updated_at timestamptz not null default now(),
  unique (study_id, mrn)
);
create index if not exists idx_thal_ident_study on thalassemia_patient_identifiers (study_id);
create index if not exists idx_thal_ident_mrn on thalassemia_patient_identifiers (mrn);

-- ── VISIT SCHEDULE — drives the checklist matrix ─────────────────────────────
create table if not exists thalassemia_visit_schedule (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references thalassemia_patients(id) on delete cascade,
  study_id uuid not null references studies(id) on delete cascade,
  timepoint thal_timepoint not null,
  expected_date date not null,
  window_start date not null,           -- expected_date - grace
  window_end date not null,             -- expected_date + grace
  actual_date date,
  status thal_visit_status not null default 'scheduled',
  notes text,
  entered_by uuid references staff(id),
  entered_at timestamptz not null default now(),
  updated_by uuid references staff(id),
  updated_at timestamptz not null default now(),
  unique (patient_id, timepoint)
);
create index if not exists idx_thal_visit_patient on thalassemia_visit_schedule (patient_id);
create index if not exists idx_thal_visit_status on thalassemia_visit_schedule (status);

-- ── TRANSFUSIONS (context for ad-hoc ECG) ────────────────────────────────────
create table if not exists thalassemia_transfusions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references thalassemia_patients(id) on delete cascade,
  transfusion_date date not null,
  volume_ml integer,
  pre_transfusion_hb numeric(4,1),
  chelation_at_visit text,
  notes text,
  entered_by uuid references staff(id),
  entered_at timestamptz not null default now(),
  updated_by uuid references staff(id),
  updated_at timestamptz not null default now()
);
create index if not exists idx_thal_tx_patient on thalassemia_transfusions (patient_id);
create index if not exists idx_thal_tx_date on thalassemia_transfusions (transfusion_date);

-- ── LAB BIOMARKERS (baseline/6mo/12mo) ───────────────────────────────────────
create table if not exists thalassemia_lab (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references thalassemia_patients(id) on delete cascade,
  assessment_date date not null,
  timepoint thal_timepoint not null default 'unscheduled',
  hemoglobin numeric(5,2),               -- g/dL
  ferritin numeric(10,2),                -- ng/mL
  labile_plasma_iron numeric(6,3),       -- µmol/L
  mmp_2 numeric(8,2),                    -- ng/mL
  mmp_9 numeric(8,2),
  timp_1 numeric(8,2),
  galectin_3 numeric(6,2),
  troponin numeric(8,3),
  bnp numeric(8,2),                      -- NT-proBNP pg/mL
  creatinine numeric(5,2),
  growth_hormone numeric(6,2),
  pth numeric(6,2),
  calcium numeric(4,2),
  ast integer,
  alt integer,
  alp integer,
  tsh numeric(6,3),
  t4_t3 text,
  fsh_lh text,
  crp numeric(6,2),
  notes text,
  entered_by uuid references staff(id),
  entered_at timestamptz not null default now(),
  updated_by uuid references staff(id),
  updated_at timestamptz not null default now()
);
create index if not exists idx_thal_lab_patient on thalassemia_lab (patient_id);
create index if not exists idx_thal_lab_date on thalassemia_lab (assessment_date);

-- ── ECG (baseline + 12mo + ad-hoc at each transfusion) ───────────────────────
create table if not exists thalassemia_ecg (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references thalassemia_patients(id) on delete cascade,
  transfusion_id uuid references thalassemia_transfusions(id) on delete set null,
  assessment_date date not null,
  timepoint thal_timepoint not null default 'unscheduled',
  rate integer,
  rhythm text,
  pr_ms integer,
  qrs_ms integer,
  qtc_ms integer,
  qrs_axis text,
  qrs_morphology text,
  rvh boolean default false,
  lvh boolean default false,
  t_wave_abnormality text,
  other_findings text,
  entered_by uuid references staff(id),
  entered_at timestamptz not null default now(),
  updated_by uuid references staff(id),
  updated_at timestamptz not null default now()
);
create index if not exists idx_thal_ecg_patient on thalassemia_ecg (patient_id);
create index if not exists idx_thal_ecg_date on thalassemia_ecg (assessment_date);

-- ── ECHO (baseline + 12mo) ───────────────────────────────────────────────────
create table if not exists thalassemia_echo (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references thalassemia_patients(id) on delete cascade,
  assessment_date date not null,
  timepoint thal_timepoint not null default 'unscheduled',
  lvef numeric(5,2),
  lvidd_mm numeric(5,2),
  lvids_mm numeric(5,2),
  lvpwd_mm numeric(5,2),
  ivsd_mm numeric(5,2),
  lv_mass_index numeric(6,2),           -- g/m²
  rwt numeric(4,2),
  lvedv_ml numeric(6,2),
  lvedv_index numeric(6,2),             -- ml/m²
  lvesv_ml numeric(6,2),
  sv_ml numeric(6,2),
  co_l_min numeric(4,2),
  gls_pct numeric(5,2),
  lavi_ml_m2 numeric(6,2),
  la_reservoir_strain_pct numeric(5,2),
  e_e_avg numeric(5,2),
  medial_e_velocity numeric(5,2),
  lateral_e_velocity numeric(5,2),
  pulmonary_vein_sd_ratio numeric(4,2),
  rvsp_mmhg numeric(5,2),
  tapse_mm numeric(5,2),
  tdi_s_cm_s numeric(4,2),
  fac_pct numeric(5,2),
  rv_gls_pct numeric(5,2),
  notes text,
  entered_by uuid references staff(id),
  entered_at timestamptz not null default now(),
  updated_by uuid references staff(id),
  updated_at timestamptz not null default now()
);
create index if not exists idx_thal_echo_patient on thalassemia_echo (patient_id);
create index if not exists idx_thal_echo_date on thalassemia_echo (assessment_date);

-- ── CARDIAC T2* MRI (baseline + 12mo) ────────────────────────────────────────
create table if not exists thalassemia_t2mri (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references thalassemia_patients(id) on delete cascade,
  assessment_date date not null,
  timepoint thal_timepoint not null default 'unscheduled',
  cardiac_t2_star_ms numeric(5,2),      -- <10ms = severe MIO
  liver_t2_star_ms numeric(5,2),
  interpretation text,
  notes text,
  entered_by uuid references staff(id),
  entered_at timestamptz not null default now(),
  updated_by uuid references staff(id),
  updated_at timestamptz not null default now()
);
create index if not exists idx_thal_mri_patient on thalassemia_t2mri (patient_id);

-- ── POLYSOMNOGRAPHY (one-time OSA screening) ─────────────────────────────────
create table if not exists thalassemia_polysomnography (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references thalassemia_patients(id) on delete cascade,
  study_date date not null,
  tst_minutes numeric(6,1),              -- total sleep time
  ahi numeric(5,2),                      -- apnea-hypopnea index /hr
  sleep_efficiency_pct numeric(5,2),
  supine_ahi numeric(5,2),
  non_supine_ahi numeric(5,2),
  obstructive_apnea_index numeric(5,2),
  central_apnea_index numeric(5,2),
  mixed_apnea_index numeric(5,2),
  total_apnea_index numeric(5,2),
  hypopnea_index numeric(5,2),
  average_spo2 numeric(4,1),
  odi numeric(5,2),                      -- oxygen desaturation index
  average_hr integer,
  osa_diagnosis boolean,
  osa_severity text,                     -- mild / moderate / severe
  notes text,
  entered_by uuid references staff(id),
  entered_at timestamptz not null default now(),
  updated_by uuid references staff(id),
  updated_at timestamptz not null default now(),
  unique (patient_id)
);

-- ── SEISMOCARDIOGRAPHY (SCG) ─────────────────────────────────────────────────
create table if not exists thalassemia_scg (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references thalassemia_patients(id) on delete cascade,
  assessment_date date not null,
  timepoint thal_timepoint not null default 'unscheduled',
  ejection_fraction_pct numeric(5,2),
  cardiac_output_l_min numeric(4,2),
  stroke_volume_ml numeric(5,2),
  ao_valve_findings text,
  mv_findings text,
  device_id text,
  ai_model_version text,
  ai_confidence_score numeric(4,3),
  notes text,
  entered_by uuid references staff(id),
  entered_at timestamptz not null default now(),
  updated_by uuid references staff(id),
  updated_at timestamptz not null default now()
);
create index if not exists idx_thal_scg_patient on thalassemia_scg (patient_id);

-- ── ADVERSE EVENTS ───────────────────────────────────────────────────────────
create table if not exists thalassemia_adverse_events (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references thalassemia_patients(id) on delete cascade,
  event_date date not null,
  description text not null,
  severity ae_severity not null,
  relatedness ae_relatedness,
  serious boolean not null default false,
  procedure_related text,                -- e.g., 'MRI', 'Polysomnography', 'SCG', 'Blood draw'
  action_taken text,
  outcome text,
  resolved_date date,
  reported_to_mrec boolean default false,
  reported_date date,
  entered_by uuid references staff(id),
  entered_at timestamptz not null default now(),
  updated_by uuid references staff(id),
  updated_at timestamptz not null default now()
);
create index if not exists idx_thal_ae_patient on thalassemia_adverse_events (patient_id);
create index if not exists idx_thal_ae_serious on thalassemia_adverse_events (serious) where serious = true;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table thalassemia_patients enable row level security;
alter table thalassemia_patient_identifiers enable row level security;
alter table thalassemia_visit_schedule enable row level security;
alter table thalassemia_transfusions enable row level security;
alter table thalassemia_lab enable row level security;
alter table thalassemia_ecg enable row level security;
alter table thalassemia_echo enable row level security;
alter table thalassemia_t2mri enable row level security;
alter table thalassemia_polysomnography enable row level security;
alter table thalassemia_scg enable row level security;
alter table thalassemia_adverse_events enable row level security;

-- Pseudonymized tables: full team can read/write
do $$ declare t text; begin
  for t in select unnest(array[
    'thalassemia_patients',
    'thalassemia_visit_schedule',
    'thalassemia_transfusions',
    'thalassemia_lab',
    'thalassemia_ecg',
    'thalassemia_echo',
    'thalassemia_t2mri',
    'thalassemia_polysomnography',
    'thalassemia_scg',
    'thalassemia_adverse_events'
  ])
  loop
    execute format('drop policy if exists %I_read on %I', t||'_read', t);
    execute format('drop policy if exists %I_write on %I', t||'_write', t);
    execute format('drop policy if exists %I_update on %I', t||'_update', t);
    execute format($f$ create policy %I on %I for select using (can_read_study_data(study_id)) $f$,
                   t||'_read', t)
      -- some tables don't have study_id (they inherit via patient_id); handle separately below
    ;
  end loop;
exception when others then null; end $$;

-- Explicit policies (safe, per-table) — for tables with study_id column
create policy thal_patients_read on thalassemia_patients
  for select using (can_read_study_data(study_id));
create policy thal_patients_insert on thalassemia_patients
  for insert with check (can_write_study_data(study_id));
create policy thal_patients_update on thalassemia_patients
  for update using (can_write_study_data(study_id)) with check (can_write_study_data(study_id));
create policy thal_patients_delete on thalassemia_patients
  for delete using (current_role_for_study(study_id) = 'super_admin');

create policy thal_visit_read on thalassemia_visit_schedule
  for select using (can_read_study_data(study_id));
create policy thal_visit_write on thalassemia_visit_schedule
  for all using (can_write_study_data(study_id)) with check (can_write_study_data(study_id));

-- Identifier table: restricted to PI + Co-PI only
create policy thal_ident_read on thalassemia_patient_identifiers
  for select using (can_read_identifiers(study_id));
create policy thal_ident_write on thalassemia_patient_identifiers
  for all using (can_write_identifiers(study_id)) with check (can_write_identifiers(study_id));

-- Modality tables — inherit study via patient_id
create policy thal_lab_read on thalassemia_lab
  for select using (exists (select 1 from thalassemia_patients p where p.id = patient_id and can_read_study_data(p.study_id)));
create policy thal_lab_write on thalassemia_lab
  for all using (exists (select 1 from thalassemia_patients p where p.id = patient_id and can_write_study_data(p.study_id)))
  with check (exists (select 1 from thalassemia_patients p where p.id = patient_id and can_write_study_data(p.study_id)));

create policy thal_ecg_read on thalassemia_ecg
  for select using (exists (select 1 from thalassemia_patients p where p.id = patient_id and can_read_study_data(p.study_id)));
create policy thal_ecg_write on thalassemia_ecg
  for all using (exists (select 1 from thalassemia_patients p where p.id = patient_id and can_write_study_data(p.study_id)))
  with check (exists (select 1 from thalassemia_patients p where p.id = patient_id and can_write_study_data(p.study_id)));

create policy thal_echo_read on thalassemia_echo
  for select using (exists (select 1 from thalassemia_patients p where p.id = patient_id and can_read_study_data(p.study_id)));
create policy thal_echo_write on thalassemia_echo
  for all using (exists (select 1 from thalassemia_patients p where p.id = patient_id and can_write_study_data(p.study_id)))
  with check (exists (select 1 from thalassemia_patients p where p.id = patient_id and can_write_study_data(p.study_id)));

create policy thal_mri_read on thalassemia_t2mri
  for select using (exists (select 1 from thalassemia_patients p where p.id = patient_id and can_read_study_data(p.study_id)));
create policy thal_mri_write on thalassemia_t2mri
  for all using (exists (select 1 from thalassemia_patients p where p.id = patient_id and can_write_study_data(p.study_id)))
  with check (exists (select 1 from thalassemia_patients p where p.id = patient_id and can_write_study_data(p.study_id)));

create policy thal_psg_read on thalassemia_polysomnography
  for select using (exists (select 1 from thalassemia_patients p where p.id = patient_id and can_read_study_data(p.study_id)));
create policy thal_psg_write on thalassemia_polysomnography
  for all using (exists (select 1 from thalassemia_patients p where p.id = patient_id and can_write_study_data(p.study_id)))
  with check (exists (select 1 from thalassemia_patients p where p.id = patient_id and can_write_study_data(p.study_id)));

create policy thal_scg_read on thalassemia_scg
  for select using (exists (select 1 from thalassemia_patients p where p.id = patient_id and can_read_study_data(p.study_id)));
create policy thal_scg_write on thalassemia_scg
  for all using (exists (select 1 from thalassemia_patients p where p.id = patient_id and can_write_study_data(p.study_id)))
  with check (exists (select 1 from thalassemia_patients p where p.id = patient_id and can_write_study_data(p.study_id)));

create policy thal_tx_read on thalassemia_transfusions
  for select using (exists (select 1 from thalassemia_patients p where p.id = patient_id and can_read_study_data(p.study_id)));
create policy thal_tx_write on thalassemia_transfusions
  for all using (exists (select 1 from thalassemia_patients p where p.id = patient_id and can_write_study_data(p.study_id)))
  with check (exists (select 1 from thalassemia_patients p where p.id = patient_id and can_write_study_data(p.study_id)));

create policy thal_ae_read on thalassemia_adverse_events
  for select using (exists (select 1 from thalassemia_patients p where p.id = patient_id and can_read_study_data(p.study_id)));
create policy thal_ae_write on thalassemia_adverse_events
  for all using (exists (select 1 from thalassemia_patients p where p.id = patient_id and can_write_study_data(p.study_id)))
  with check (exists (select 1 from thalassemia_patients p where p.id = patient_id and can_write_study_data(p.study_id)));

-- ============================================================================
-- SEED — study record + 14 research team members
-- ============================================================================
insert into studies (slug, short_name, full_title, description, pi_name, status,
                     mrec_number, ethics_refs, ethics_approved_date, start_date, end_date, funding_source)
values (
  'thalassemia-cardiac',
  'Thalassemia Cardiac Study',
  'Multi-Modal Cardiac Assessment in Transfusion-Dependent Beta Thalassemia',
  'Myocardial Iron Overload in Transfusion-Dependent Beta Thalassemia: Novel Biomarkers (MMPs), Obstructive Sleep Apnea, AI-Based ECG Prediction, and AI-Enabled Seismocardiography for hemodynamic assessment.',
  'Dr. Mohammed Al Rawahi',
  'recruiting',
  '3938',
  array['SQU-EC/096/2026'],
  '2026-05-10',
  '2026-01-01',
  '2026-12-31',
  'SQU Medical Research Council (ET/DVC/MRC/24/08) — 6,000 OMR'
)
on conflict (slug) do update set
  short_name = excluded.short_name,
  full_title = excluded.full_title,
  description = excluded.description,
  status = excluded.status,
  updated_at = now();

-- Team members
do $$
declare
  v_study_id uuid;
  team record;
begin
  select id into v_study_id from studies where slug = 'thalassemia-cardiac';

  for team in
    select * from (values
      ('mrawahi@squ.edu.om',      'Dr. Mohammed Al Rawahi',    'Principal Investigator',   'research_admin'),
      ('alalawi2@squ.edu.om',     'Dr. Abdullah M. Al Alawi',  'Research Lead',            'research_admin'),
      ('Nuhahabsi7@gmail.com',    'Nuha Al Habsi',             'Research Team',            'research_assistant'),
      ('abubakr@squ.edu.om',      'Abubakr El''Tigani',        'Research Team',            'research_assistant'),
      ('Malakalkulibi@gmail.com', 'Malak Amur Alkulaibi',      'Research Team',            'research_assistant'),
      ('sara55@squ.edu.om',       'Sarah Al Rahbi',            'Research Team',            'research_assistant'),
      ('m.s.m22133@gmail.com',    'Mohammed Al Habsi',         'Research Team',            'research_assistant'),
      ('2fatma2me@gmail.com',     'Fatema Al Maqblai',         'Research Team',            'research_assistant'),
      ('doctornoura33@gmail.com', 'Noura Al-Harmali',          'Research Team',            'research_assistant'),
      ('bass@squ.edu.om',         'Bader Al Rawahi',           'Research Team',            'research_assistant'),
      ('aalismaili@squ.edu.om',   'Abdullah Ismaili',          'Research Team',            'research_assistant'),
      ('Dradil@squ.edu.om',       'Adil Riyami',               'Research Team',            'research_assistant'),
      ('altaeiomar11@gmail.com',  'Omar Al Taei',              'Research Team',            'research_assistant'),
      ('d.alaamri@squ.edu.om',    'Dawood Al Amri',            'Research Team',            'research_assistant')
    ) as t(email, full_name, title, role)
  loop
    insert into staff (email, full_name, title, active)
    values (lower(team.email), team.full_name, team.title, true)
    on conflict (email) do update set
      full_name = excluded.full_name,
      title = excluded.title,
      active = true;

    insert into staff_study_roles (staff_id, study_id, role)
    select s.id, v_study_id, team.role
    from staff s where s.email = lower(team.email)
    on conflict (staff_id, study_id) do update set role = excluded.role;
  end loop;
end $$;

-- ============================================================================
-- HELPER — auto-update visit_schedule.status based on window vs today
-- ============================================================================
create or replace function refresh_thalassemia_visit_status()
returns void language plpgsql as $$
begin
  update thalassemia_visit_schedule
  set status = case
    when actual_date is not null then 'complete'::thal_visit_status
    when current_date < window_start then 'scheduled'::thal_visit_status
    when current_date between window_start and window_end then 'window_open'::thal_visit_status
    else 'overdue'::thal_visit_status
  end
  where status <> 'missed';
end $$;
