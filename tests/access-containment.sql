begin;
do $$ begin
 assert not has_table_privilege('anon','public.whoop_tokens','select'), 'Anonymous role can read tokens';
 assert not has_table_privilege('authenticated','public.whoop_tokens','select'), 'Browser role can read tokens';
 assert has_table_privilege('service_role','public.whoop_tokens','select'), 'Importer lost access';
 assert not has_table_privilege('anon','public.researcher_access_codes','select'), 'Public login codes';
 assert not has_column_privilege('anon','public.surveys','researcher_password','select'), 'Public survey passwords';
 assert not exists(select 1 from pg_policies where tablename='survey_responses' and cmd='SELECT' and qual='true'), 'Public responses';
 assert (select count(*) from public.enrollment_date_repairs)=6, 'Unexpected repair count';
 assert not exists(select 1 from public.enrollment_date_repairs r join public.burnout_participants p on p.id=r.resident_id where p.enrollment_date<>r.restored_date), 'Repair missing';
end $$;
set local role anon;
do $$ begin
 assert (select count(*) from public.survey_responses)=0, 'Anonymous responses visible';
 assert (select count(*) from public.pilot_enrollment)=0, 'Pilot identifiers visible';
end $$;
reset role;
-- Verify email ownership under a synthetic authenticated JWT, without creating a user.
select set_config('request.jwt.claims',jsonb_build_object('sub',gen_random_uuid(),'role','authenticated','email','outsider@example.invalid')::text,true);
set local role authenticated;
do $$ begin
 assert (select count(*) from public.survey_responses)=0, 'Outsider responses visible';
end $$;
rollback;
