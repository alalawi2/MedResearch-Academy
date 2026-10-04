-- Production-safe permission smoke test: all changes roll back.
begin;
do $$ declare member record; sid uuid; checked_count integer:=0; begin
 select id into strict sid from public.studies where slug='thalassemia-cardiac';
 for member in select st.auth_user_id from public.staff st join public.staff_study_roles r on r.staff_id=st.id where r.study_id=sid and st.active loop
  if member.auth_user_id is null then continue; end if;
  perform set_config('request.jwt.claim.sub',member.auth_user_id::text,true);
  assert public.can_read_identifiers(sid), 'Team member cannot confirm MRN';
  assert public.can_write_identifiers(sid), 'Team member cannot enroll';
  checked_count:=checked_count+1;
 end loop;
 assert checked_count>0, 'No linked team accounts';
 perform set_config('request.jwt.claim.sub',(select auth_user_id::text from public.staff where email='abubakr@squ.edu.om'),true);
end $$;
set local role authenticated;
do $$ declare pid uuid; code text:='PERMISSION-TEST-'||gen_random_uuid()::text; begin
 pid:=public.save_thalassemia_patient(jsonb_build_object('patient_code',code,'enrollment_date','2026-10-04'),jsonb_build_object('mrn',code,'full_name','Synthetic permission test'),
 '[{"timepoint":"baseline","expected_date":"2026-10-04","window_start":"2026-10-04","window_end":"2026-10-18"}]');
 assert exists(select 1 from public.thalassemia_patient_identifiers where patient_id=pid and mrn=code);
 perform public.save_thalassemia_patient('{"enrollment_date":"2026-10-04","notes":"Synthetic edit"}',jsonb_build_object('mrn',code,'full_name','Synthetic edited'), '[]',pid);
 assert exists(select 1 from public.thalassemia_patients where id=pid and notes='Synthetic edit');
 delete from public.thalassemia_patient_identifiers where patient_id=pid;
 assert exists(select 1 from public.thalassemia_patient_identifiers where patient_id=pid), 'Assistant must not gain identifier deletion';
end $$;
reset role;
do $$ declare sid uuid; begin
 select id into sid from public.studies where slug='thalassemia-cardiac';
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 assert not public.can_read_identifiers(sid);
 assert not public.can_write_identifiers(sid);
 assert not public.is_thalassemia_team(sid);
end $$;
rollback;
