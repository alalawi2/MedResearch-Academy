\set ON_ERROR_STOP on
\ir ../supabase/migrations/202610030002_thalassemia_workflow_fixes.sql
begin;
do $$
declare pid uuid;
begin
  select id into strict pid from thalassemia_patients where patient_code='TEST-1';
  update thalassemia_visit_schedule set actual_date=current_date where patient_id=pid;
  assert (select computed_status <> 'complete' from thalassemia_visit_schedule_v where patient_id=pid and timepoint='baseline'), 'Attendance alone is not completion';
  insert into thalassemia_lab(patient_id,assessment_date,timepoint,pre_transfusion_hb) values(pid,current_date,'baseline',9);
  assert (select computed_status <> 'complete' from thalassemia_visit_schedule_v where patient_id=pid and timepoint='baseline'), 'Lab alone is not baseline completion';
  insert into thalassemia_ecg(patient_id,assessment_date,timepoint) values(pid,current_date,'baseline');
  insert into thalassemia_echo(patient_id,assessment_date,timepoint) values(pid,current_date,'baseline');
  insert into thalassemia_t2mri(patient_id,assessment_date,timepoint) values(pid,current_date,'baseline');
  insert into thalassemia_scg(patient_id,assessment_date,timepoint) values(pid,current_date,'baseline');
  insert into thalassemia_polysomnography(patient_id,study_date) values(pid,current_date);
  assert (select computed_status = 'complete' from thalassemia_visit_schedule_v where patient_id=pid and timepoint='baseline');
  delete from thalassemia_ecg where patient_id=pid;
  assert (select computed_status <> 'complete' from thalassemia_visit_schedule_v where patient_id=pid and timepoint='baseline'), 'Deleting required data must reopen completion';
  insert into thalassemia_visit_schedule(patient_id,study_id,timepoint,expected_date,window_start,window_end)
    select pid,study_id,'6mo',current_date,current_date,current_date+14 from thalassemia_patients where id=pid;
  insert into thalassemia_lab(patient_id,assessment_date,timepoint,pre_transfusion_hb) values(pid,current_date,'6mo',9);
  assert (select computed_status='complete' from thalassemia_visit_schedule_v where patient_id=pid and timepoint='6mo');
end $$;
rollback;
