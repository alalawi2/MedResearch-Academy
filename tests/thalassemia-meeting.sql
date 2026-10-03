\set ON_ERROR_STOP on
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated;
  end if;
end $$;
create type enrollment_status as enum ('active','withdrawn','completed','consented');
create type thal_diagnosis as enum ('major','intermedia');
create type thal_timepoint as enum ('baseline','6mo','12mo','unscheduled');
create type ae_severity as enum ('mild','moderate','severe','life_threatening','fatal');
create type ae_relatedness as enum ('unrelated','unlikely','possible','probable','definite');
create table studies(id uuid primary key default gen_random_uuid(),slug text);
create table staff(id uuid primary key);
create function can_read_study_data(uuid) returns boolean language sql as 'select true';
create function can_write_study_data(uuid) returns boolean language sql as 'select true';
create function can_write_identifiers(uuid) returns boolean language sql as 'select true';
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
-- Codex fix: status column removed; status is computed on read via view
-- thalassemia_visit_schedule_v (defined below). This eliminates the need
-- for a scheduled refresh and prevents stale KPIs.
create table if not exists thalassemia_visit_schedule (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references thalassemia_patients(id) on delete cascade,
  study_id uuid not null references studies(id) on delete cascade,
  timepoint thal_timepoint not null,
  expected_date date not null,
  window_start date not null,           -- expected_date - grace
  window_end date not null,             -- expected_date + grace
  actual_date date,
  notes text,
  entered_by uuid references staff(id),
  entered_at timestamptz not null default now(),
  updated_by uuid references staff(id),
  updated_at timestamptz not null default now(),
  unique (patient_id, timepoint)
);
create index if not exists idx_thal_visit_patient on thalassemia_visit_schedule (patient_id);

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
-- Codex fix: prevent duplicate scheduled-timepoint rows per patient. Ad-hoc
-- unscheduled entries stay unrestricted so multiple can be logged freely.
create unique index if not exists uniq_thal_lab_patient_tp
  on thalassemia_lab (patient_id, timepoint)
  where timepoint <> 'unscheduled';

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
create unique index if not exists uniq_thal_ecg_patient_tp
  on thalassemia_ecg (patient_id, timepoint)
  where timepoint <> 'unscheduled';

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
create unique index if not exists uniq_thal_echo_patient_tp
  on thalassemia_echo (patient_id, timepoint)
  where timepoint <> 'unscheduled';

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
create unique index if not exists uniq_thal_mri_patient_tp
  on thalassemia_t2mri (patient_id, timepoint)
  where timepoint <> 'unscheduled';

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
create unique index if not exists uniq_thal_scg_patient_tp
  on thalassemia_scg (patient_id, timepoint)
  where timepoint <> 'unscheduled';

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
insert into studies(slug) values('thalassemia-cardiac');
\ir ../supabase/migrations/202610030001_thalassemia_meeting.sql
do $$
declare pid uuid; n integer;
begin
pid := save_thalassemia_patient('{"patient_code":"TEST-1","enrollment_date":"2026-10-03","chelation_therapy":"Deferasirox; Deferiprone"}','{"mrn":"TEST-MRN","full_name":"Synthetic","date_of_birth":"1990-01-01"}','[{"timepoint":"baseline","expected_date":"2026-10-03","window_start":"2026-10-03","window_end":"2026-10-17"}]');
assert (select count(*)=1 from thalassemia_visit_schedule where patient_id=pid);
assert (select date_of_birth='1990-01-01' from thalassemia_patient_identifiers where patient_id=pid);
perform save_thalassemia_patient('{"enrollment_date":"2026-10-03","splenectomy":true}','{"mrn":"TEST-MRN","full_name":"Synthetic","date_of_birth":"1990-01-01"}','[]',pid);
assert (select splenectomy from thalassemia_patients where id=pid);
select count(*) into n from thalassemia_patients;
begin
perform save_thalassemia_patient('{"patient_code":"TEST-2","enrollment_date":"2026-10-03"}','{"mrn":"TEST-MRN"}','[]');
raise exception 'Duplicate MRN unexpectedly accepted';
exception when unique_violation then null;
end;
assert (select count(*)=n from thalassemia_patients), 'Failed identifier insert left an orphan patient';
end $$;
