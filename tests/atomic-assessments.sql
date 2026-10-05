begin;
do $$ declare sid uuid; rid uuid; a jsonb; c jsonb; p jsonb; g jsonb; i jsonb; first_result jsonb; second_result jsonb; baseline_result jsonb; before_count int; begin
 select id into strict sid from studies where slug='resident-burnout';
 insert into burnout_participants(study_id,study_participant_id,status,enrollment_date) values(sid,'RES-TEST-ATOMIC-'||gen_random_uuid(),'active','2026-05-01') returning id into rid;
 a:='{}';
 c:='{"items":{},"personal_score":0,"work_score":0,"patient_score":0}';
 p:='{"items":{},"total_score":0,"severity":"minimal"}';
 g:=p;
 i:='{"items":{},"total_score":0,"severity":"none"}';
 assert a is not null and c is not null and p is not null and g is not null and i is not null, 'Missing test templates';
 a:=a||jsonb_build_object('resident_id',rid,'study_id',sid,'assessment_date','2026-10-05','block_number',1,'academic_year','2026-2027','rotation_name','SYNTHETIC ROLLBACK TEST');
 first_result:=save_burnout_assessment(a,c,p,g,i);
 assert (select count(*) from cbi_responses where block_assessment_id=(first_result->>'id')::uuid)=1;
 second_result:=save_burnout_assessment(a,c,p,g,i);
 assert second_result->>'id'=first_result->>'id' and (second_result->>'already_submitted')::boolean;
 -- A second block on the same date must not conflict with the first instrument response.
 perform save_burnout_assessment(a||'{"block_number":2}',c,p,g,i);
 assert (select count(*) from block_assessments where resident_id=rid)=2;
 assert (select count(*) from cbi_responses where resident_id=rid)=2;
 before_count:=2;
 begin
  perform save_burnout_assessment(a||'{"block_number":3}','{}',p,g,i);
  raise exception 'Invalid instrument was unexpectedly accepted';
 exception when not_null_violation then null;
 end;
 assert (select count(*) from block_assessments where resident_id=rid)=before_count,'Partial parent persisted';
 baseline_result:=save_burnout_assessment(a||'{"block_number":null,"academic_year":null,"rotation_name":"BASELINE"}',c,p,g,i);
 assert (select baseline_completed from burnout_participants where id=rid),'Baseline flag not transactional';
 assert not has_function_privilege('authenticated','public.save_burnout_assessment(jsonb,jsonb,jsonb,jsonb,jsonb,uuid)','EXECUTE');
end $$;
rollback;
