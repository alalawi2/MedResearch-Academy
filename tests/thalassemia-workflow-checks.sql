-- Run after thalassemia-meeting.sql in the synthetic test database only.
\set ON_ERROR_STOP on
begin;
do $$
declare pid uuid; before_count integer;
begin
  select id into strict pid from thalassemia_patients where patient_code='TEST-1';
  insert into thalassemia_lab(patient_id,assessment_date,timepoint,pre_transfusion_hb)
    values(pid,'2026-10-03','baseline',9.5);
  assert (select pre_transfusion_hb=9.5 from thalassemia_lab where patient_id=pid);
  begin
    insert into thalassemia_lab(patient_id,assessment_date,timepoint,pre_transfusion_hb)
      values(pid,'2026-10-04','unscheduled',31);
    raise exception 'Out-of-range Hb accepted';
  exception when check_violation then null;
  end;
  insert into thalassemia_concomitant_meds(patient_id,medication_name,start_date)
    values(pid,'Synthetic non-chelation medicine','2026-10-03');
  insert into thalassemia_adverse_events(patient_id,event_date,description,severity,cardiac_complication)
    values(pid,'2026-10-03','Synthetic event','mild','Heart failure');
  select count(*) into before_count from thalassemia_patients;
  begin
    perform save_thalassemia_patient('{"patient_code":"BAD-DOB","enrollment_date":"2026-10-03"}',
      '{"mrn":"BAD-DOB","date_of_birth":"2027-01-01"}','[]');
    raise exception 'Future DOB accepted';
  exception when raise_exception then
    if SQLERRM <> 'Date of birth must not be after enrollment' then raise; end if;
  end;
  assert (select count(*)=before_count from thalassemia_patients);
  update thalassemia_visit_schedule set actual_date='2026-10-03' where patient_id=pid;
  perform save_thalassemia_patient('{"enrollment_date":"2026-10-05"}',
    '{"mrn":"TEST-MRN","date_of_birth":"1990-01-01"}',
    '[{"timepoint":"baseline","expected_date":"2026-10-05","window_start":"2026-10-05","window_end":"2026-10-19"}]',pid);
  assert (select expected_date='2026-10-03' from thalassemia_visit_schedule where patient_id=pid);
end $$;
-- This tests the RPC guard, not production auth/RLS policies.
create or replace function can_write_identifiers(uuid) returns boolean language sql as 'select false';
do $$ begin
  begin
    perform save_thalassemia_patient('{"patient_code":"DENIED"}','{"mrn":"DENIED"}','[]');
    raise exception 'Denied enrollment accepted';
  exception when raise_exception then
    if SQLERRM <> 'Identifier access is required to enroll or edit an MRN-identified patient' then raise; end if;
  end;
end $$;
rollback;
