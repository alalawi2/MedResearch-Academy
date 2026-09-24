-- ============================================================================
-- Thalassemia Study — Investigation Files & Team Confirmations
-- Adds file upload tracking + team review/confirmation for ECG/Echo/MRI/etc.
-- ============================================================================

-- ── INVESTIGATION FILES (generic — supports ECG, Echo, MRI, etc.) ──────────
create table if not exists thalassemia_investigation_files (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references thalassemia_patients(id) on delete cascade,
  investigation_type text not null,           -- 'ecg', 'echo', 'mri', 'scg', etc.
  investigation_id uuid not null,             -- FK to the modality row (thalassemia_ecg.id, etc.)
  file_path text not null,                    -- Supabase Storage path
  file_name text not null,                    -- original filename
  file_type text not null,                    -- MIME type (image/jpeg, application/pdf, etc.)
  file_size_bytes bigint,
  uploaded_by uuid references staff(id),
  uploaded_at timestamptz not null default now(),
  notes text
);
create index if not exists idx_thal_files_patient on thalassemia_investigation_files (patient_id);
create index if not exists idx_thal_files_inv on thalassemia_investigation_files (investigation_type, investigation_id);

-- ── INVESTIGATION CONFIRMATIONS (team review) ─────────────────────────────
create table if not exists thalassemia_investigation_confirmations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references thalassemia_patients(id) on delete cascade,
  investigation_type text not null,           -- 'ecg', 'echo', 'mri', etc.
  investigation_id uuid not null,             -- FK to the modality row
  confirmed_by uuid not null references staff(id),
  confirmed_at timestamptz not null default now(),
  agrees_with_findings boolean not null,
  comments text,
  unique (investigation_id, confirmed_by)     -- one confirmation per staff per investigation
);
create index if not exists idx_thal_confirm_inv on thalassemia_investigation_confirmations (investigation_type, investigation_id);
create index if not exists idx_thal_confirm_staff on thalassemia_investigation_confirmations (confirmed_by);

-- ── RLS ────────────────────────────────────────────────────────────────────
alter table thalassemia_investigation_files enable row level security;
alter table thalassemia_investigation_confirmations enable row level security;

-- Files: study team can read/write (inherit study via patient_id, same pattern as other modality tables)
create policy thal_files_read on thalassemia_investigation_files
  for select using (exists (
    select 1 from thalassemia_patients p
    where p.id = patient_id and can_read_study_data(p.study_id)
  ));
create policy thal_files_write on thalassemia_investigation_files
  for all using (exists (
    select 1 from thalassemia_patients p
    where p.id = patient_id and can_write_study_data(p.study_id)
  ))
  with check (exists (
    select 1 from thalassemia_patients p
    where p.id = patient_id and can_write_study_data(p.study_id)
  ));

-- Confirmations: study team can read/write
create policy thal_confirm_read on thalassemia_investigation_confirmations
  for select using (exists (
    select 1 from thalassemia_patients p
    where p.id = patient_id and can_read_study_data(p.study_id)
  ));
create policy thal_confirm_write on thalassemia_investigation_confirmations
  for all using (exists (
    select 1 from thalassemia_patients p
    where p.id = patient_id and can_write_study_data(p.study_id)
  ))
  with check (exists (
    select 1 from thalassemia_patients p
    where p.id = patient_id and can_write_study_data(p.study_id)
  ));

-- ── STORAGE BUCKET ─────────────────────────────────────────────────────────
-- Note: Create the 'thalassemia-files' bucket in Supabase dashboard or via:
--   insert into storage.buckets (id, name, public)
--   values ('thalassemia-files', 'thalassemia-files', false)
--   on conflict (id) do nothing;
-- Storage policies must be configured in the dashboard to allow authenticated
-- users to upload/read from 'thalassemia-files/*'.
