-- Meeting changes: preserve historical values; do not infer MRNs or pre-transfusion timing.
begin;
alter table public.thalassemia_patient_identifiers add column if not exists date_of_birth date;
alter table public.thalassemia_lab add column if not exists pre_transfusion_hb numeric(5,2)
  check (pre_transfusion_hb between 0 and 30);
alter table public.thalassemia_adverse_events add column if not exists cardiac_complication text;

-- Missing from earlier medication UI release. Existing installations remain intact.
create table if not exists public.thalassemia_concomitant_meds (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.thalassemia_patients(id),
  medication_name text not null, dose text, frequency text, route text,
  indication text, start_date date not null, end_date date,
  ongoing boolean default true, notes text,
  entered_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.thalassemia_concomitant_meds enable row level security;
drop policy if exists thal_meds_read on public.thalassemia_concomitant_meds;
create policy thal_meds_read on public.thalassemia_concomitant_meds for select to authenticated
using (exists (select 1 from public.thalassemia_patients p where p.id=patient_id and public.can_read_study_data(p.study_id)));
drop policy if exists thal_meds_write on public.thalassemia_concomitant_meds;
create policy thal_meds_write on public.thalassemia_concomitant_meds for all to authenticated
using (exists (select 1 from public.thalassemia_patients p where p.id=patient_id and public.can_write_study_data(p.study_id)))
with check (exists (select 1 from public.thalassemia_patients p where p.id=patient_id and public.can_write_study_data(p.study_id)));

-- Single transaction for enrollment, identifiers and schedule. Invoker retains existing RLS.
create or replace function public.save_thalassemia_patient(
  patient_data jsonb, identifier_data jsonb, visits jsonb, existing_id uuid default null
) returns uuid language plpgsql security invoker set search_path = public as $$
declare saved_id uuid; study uuid; p public.thalassemia_patients; v jsonb;
begin
  select id into study from public.studies where slug='thalassemia-cardiac';
  if study is null or public.can_write_identifiers(study) is not true then
    raise exception 'Identifier access is required to enroll or edit an MRN-identified patient';
  end if;
  if nullif(trim(identifier_data->>'mrn'),'') is null then raise exception 'Patient MRN is required'; end if;
  if (identifier_data->>'date_of_birth')::date > (patient_data->>'enrollment_date')::date then
    raise exception 'Date of birth must not be after enrollment';
  end if;
  if existing_id is null then
    p := jsonb_populate_record(null::public.thalassemia_patients, patient_data);
    insert into public.thalassemia_patients(study_id,patient_code,enrollment_date,age_at_enrollment,sex,bmi,diagnosis,age_at_diagnosis,transfusion_frequency,chelation_therapy,status)
    values(study,p.patient_code,p.enrollment_date,p.age_at_enrollment,p.sex,p.bmi,p.diagnosis,p.age_at_diagnosis,p.transfusion_frequency,p.chelation_therapy,'active') returning id into saved_id;
  else
    select * into p from public.thalassemia_patients where id=existing_id and study_id=study for update;
    if not found then raise exception 'Patient not found'; end if;
    p := jsonb_populate_record(p, patient_data);
    update public.thalassemia_patients set enrollment_date=p.enrollment_date,age_at_enrollment=p.age_at_enrollment,sex=p.sex,bmi=p.bmi,diagnosis=p.diagnosis,age_at_diagnosis=p.age_at_diagnosis,transfusion_frequency=p.transfusion_frequency,chelation_therapy=p.chelation_therapy,
      heart_failure=p.heart_failure,af=p.af,vt=p.vt,pacs=p.pacs,pvcs=p.pvcs,pericarditis=p.pericarditis,myocarditis=p.myocarditis,pulmonary_hypertension=p.pulmonary_hypertension,dm=p.dm,liver_disease=p.liver_disease,stroke=p.stroke,hypothyroidism=p.hypothyroidism,kidney_disease=p.kidney_disease,splenectomy=p.splenectomy,notes=p.notes,updated_at=now()
      where id=existing_id;
    saved_id := existing_id;
  end if;
  insert into public.thalassemia_patient_identifiers(patient_id,study_id,mrn,full_name,date_of_birth)
  values(saved_id,study,trim(identifier_data->>'mrn'),coalesce(identifier_data->>'full_name',''),(identifier_data->>'date_of_birth')::date)
  on conflict(patient_id) do update set mrn=excluded.mrn,full_name=excluded.full_name,date_of_birth=excluded.date_of_birth,updated_at=now();
  for v in select * from jsonb_array_elements(visits) loop
    insert into public.thalassemia_visit_schedule(patient_id,study_id,timepoint,expected_date,window_start,window_end)
    values(saved_id,study,(v->>'timepoint')::public.thal_timepoint,(v->>'expected_date')::date,(v->>'window_start')::date,(v->>'window_end')::date)
    on conflict(patient_id,timepoint) do update set expected_date=excluded.expected_date,window_start=excluded.window_start,window_end=excluded.window_end
      where thalassemia_visit_schedule.actual_date is null;
  end loop;
  return saved_id;
end $$;
revoke all on function public.save_thalassemia_patient(jsonb,jsonb,jsonb,uuid) from public;
grant execute on function public.save_thalassemia_patient(jsonb,jsonb,jsonb,uuid) to authenticated;
commit;
