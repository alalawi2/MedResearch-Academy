begin;
create table public.instrument_reconciliation (
 assessment_id uuid not null references public.block_assessments(id), instrument text not null,
 response_id uuid, action text not null, source_fingerprint text not null,
 reconciled_at timestamptz not null default now(),primary key(assessment_id,instrument)
);
alter table public.instrument_reconciliation enable row level security;
revoke all on public.instrument_reconciliation from public,anon,authenticated;
grant all on public.instrument_reconciliation to service_role;
do $$
declare a record; kind text; tab text; source jsonb; matching jsonb; rid uuid; candidates uuid[]; competing int; action_name text; rot uuid;
begin
 for a in select b.* from public.block_assessments b join public.burnout_participants p on p.id=b.resident_id where p.study_participant_id ~ '^RES-[0-9]+$' order by b.created_at,b.id for update of b loop
  select id into rot from public.rotation_blocks where resident_id=a.resident_id and block_number=a.block_number and academic_year=a.academic_year limit 1;
  foreach kind in array array['cbi','phq9','gad7','isi'] loop
   tab:=kind||'_responses';
   if kind='cbi' then
    source:=jsonb_build_object('items',a.cbi_items,'personal_score',a.cbi_personal_score,'work_score',a.cbi_work_score,'patient_score',a.cbi_patient_score);
   else
    source:=jsonb_build_object('items',to_jsonb(a)->(kind||'_items'),'total_score',to_jsonb(a)->(kind||'_total'));
   end if;
   if exists(select 1 from jsonb_each(source) x where x.value='null'::jsonb) then
    insert into public.instrument_reconciliation values(a.id,kind,null,'source_incomplete',md5(source::text),now()) on conflict do nothing;
    continue;
   end if;
   execute format('select id from public.%I where block_assessment_id=$1',tab) into rid using a.id;
   if rid is not null then continue; end if;
   matching:=source||jsonb_build_object('resident_id',a.resident_id,'study_id',a.study_id,'response_date',a.assessment_date);
   execute format('select array_agg(id) from public.%I r where block_assessment_id is null and to_jsonb(r) @> $1',tab) into candidates using matching;
   -- Only attach a legacy row when both sides of the match are unique. Never guess its original block.
   execute format('select count(*) from public.block_assessments where resident_id=$1 and assessment_date=$2 and %I=$3',kind||'_items') into competing using a.resident_id,a.assessment_date,source->'items';
   if cardinality(candidates)=1 and competing=1 then
    rid:=candidates[1];
    execute format('update public.%I set block_assessment_id=$1 where id=$2 and block_assessment_id is null',tab) using a.id,rid;
    action_name:='linked_exact_legacy';
   else
    source:=source||jsonb_build_object('resident_id',a.resident_id,'study_id',a.study_id,'response_date',a.assessment_date,'block_id',rot,'block_assessment_id',a.id);
    if kind='cbi' then
     source:=source||jsonb_build_object('personal_burnout',a.cbi_personal_burnout,'work_burnout',a.cbi_work_burnout,'patient_burnout',a.cbi_patient_burnout,'any_burnout',a.cbi_any_burnout);
    else
     source:=source||jsonb_build_object('severity',replace(replace(lower(to_jsonb(a)->>(kind||'_severity')),' ','_'),'clinically_significant_',''));
    end if;
    rid:=public.insert_assessment_record(tab,source);
    action_name:='reconstructed_from_saved_assessment';
   end if;
   insert into public.instrument_reconciliation values(a.id,kind,rid,action_name,md5(to_jsonb(a)::text),now()) on conflict do nothing;
  end loop;
 end loop;
end $$;
-- Canonical analysis reads one instrument row per real assessment. Unmatched legacy
-- rows remain untouched in the base tables for coordinator review, not silently counted twice.
do $$ declare t text; begin
 foreach t in array array['cbi','phq9','gad7','isi'] loop
  execute format('create view public.%I with(security_invoker=true) as select r.* from public.%I r join public.block_assessments a on a.id=r.block_assessment_id join public.burnout_participants p on p.id=a.resident_id where p.study_participant_id ~ ''^RES-[0-9]+$''',t||'_assessment_responses',t||'_responses');
  execute format('grant select on public.%I to authenticated,service_role',t||'_assessment_responses');
 end loop;
end $$;
commit;
