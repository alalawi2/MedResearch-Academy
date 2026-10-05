begin;
do $$ declare t text; begin
 foreach t in array array['cbi_responses','phq9_responses','gad7_responses','isi_responses'] loop
  execute format('alter table public.%I add column if not exists block_assessment_id uuid references public.block_assessments(id)',t);
  execute format('alter table public.%I drop constraint if exists %I',t,t||'_resident_id_response_date_key');
  execute format('create unique index if not exists %I on public.%I(block_assessment_id) where block_assessment_id is not null',t||'_assessment_key',t);
 end loop;
end $$;
create or replace function public.insert_assessment_record(target_table text,record_json jsonb) returns uuid
language plpgsql security definer set search_path=public as $$
declare cols text; rid uuid:=gen_random_uuid();
begin
 if not target_table=any(array['block_assessments','cbi_responses','phq9_responses','gad7_responses','isi_responses']) then raise exception 'Invalid assessment table'; end if;
 record_json:=(record_json-array['id','created_at','reviewed_by','reviewed_at','review_notes','entered_by'])||jsonb_build_object('id',rid,'review_status','pending');
 if exists(select 1 from jsonb_object_keys(record_json) k where not exists(select 1 from information_schema.columns c where c.table_schema='public' and c.table_name=target_table and c.column_name=k)) then raise exception 'Unknown assessment field'; end if;
 select string_agg(quote_ident(k),',') into cols from jsonb_object_keys(record_json) k;
 execute format('insert into public.%I (%s) select %s from jsonb_populate_record(null::public.%I,$1)',target_table,cols,cols,target_table) using record_json;
 return rid;
end $$;
create or replace function public.save_burnout_assessment(assessment jsonb,cbi jsonb,phq jsonb,gad jsonb,isi jsonb,rotation_id uuid default null) returns jsonb
language plpgsql security definer set search_path=public as $$
declare p public.burnout_participants; aid uuid; existing_id uuid; baseline boolean; common jsonb; ay integer;
begin
 select * into strict p from burnout_participants where id=(assessment->>'resident_id')::uuid for update;
 if p.status<>'active' or p.study_id<>(assessment->>'study_id')::uuid then raise exception 'Invalid participant'; end if;
 baseline:=assessment->>'rotation_name'='BASELINE' and coalesce(assessment->>'block_number','')='';
 if baseline and coalesce(assessment->>'academic_year','')='' then
  ay:=extract(year from (assessment->>'assessment_date')::date)::integer-case when extract(month from (assessment->>'assessment_date')::date)<9 then 1 else 0 end;
  assessment:=assessment||jsonb_build_object('academic_year',ay::text||'-'||(ay+1)::text);
 end if;
 select id into existing_id from block_assessments where resident_id=p.id and
  ((baseline and rotation_name='BASELINE' and block_number is null) or
  (not baseline and block_number=(assessment->>'block_number')::integer and academic_year=assessment->>'academic_year')) limit 1;
 if existing_id is not null then
  if baseline then update burnout_participants set baseline_completed=true where id=p.id; end if;
  return jsonb_build_object('id',existing_id,'already_submitted',true);
 end if;
 aid:=insert_assessment_record('block_assessments',assessment);
 common:=jsonb_build_object('study_id',p.study_id,'resident_id',p.id,'block_id',rotation_id,'block_assessment_id',aid,'response_date',assessment->>'assessment_date');
 perform insert_assessment_record('cbi_responses',cbi||common);
 perform insert_assessment_record('phq9_responses',phq||common);
 perform insert_assessment_record('gad7_responses',gad||common);
 perform insert_assessment_record('isi_responses',isi||common);
 if baseline then update burnout_participants set baseline_completed=true where id=p.id; end if;
 return jsonb_build_object('id',aid,'already_submitted',false);
end $$;
revoke all on function public.insert_assessment_record(text,jsonb),public.save_burnout_assessment(jsonb,jsonb,jsonb,jsonb,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.save_burnout_assessment(jsonb,jsonb,jsonb,jsonb,jsonb,uuid) to service_role;
commit;
