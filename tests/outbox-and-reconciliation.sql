begin;
do $$ declare k text:='TEST-'||gen_random_uuid(); run uuid:=gen_random_uuid(); claim jsonb; begin
 claim:=public.claim_notification(k,'{"subject":"Synthetic rollback test"}',run);
 assert claim->'body'->>'subject'='Synthetic rollback test';
 assert (public.claim_notification(k,'{}',gen_random_uuid())->>'busy')::boolean,'Concurrent sender not blocked';
 update public.notification_outbox set status='accepted',provider_id='test-provider-id',lease_until=null where message_key=k;
 assert public.claim_notification(k,'{}',gen_random_uuid())->>'id'='test-provider-id','Accepted send not deduplicated';
 update public.notification_outbox set status='uncertain',provider_id=null,first_attempt_at=now()-interval '25 hours' where message_key=k;
 assert (public.claim_notification(k,'{}',gen_random_uuid())->>'review_required')::boolean,'Old ambiguous send retried';
 assert not has_table_privilege('anon','public.notification_outbox','select');
 assert not has_function_privilege('authenticated','public.claim_notification(text,jsonb,uuid)','EXECUTE');
end $$;
do $$ declare t text; mismatches integer; begin
 foreach t in array array['cbi','phq9','gad7','isi'] loop
  execute format('select count(*) from public.%I r join public.block_assessments a on a.id=r.block_assessment_id where r.resident_id<>a.resident_id or r.study_id<>a.study_id or r.items is distinct from a.%I',t||'_assessment_responses',t||'_items') into mismatches;
  assert mismatches=0,'Reconciliation identity or answers mismatch';
 end loop;
 assert not exists(select 1 from public.cbi_assessment_responses r join public.block_assessments a on a.id=r.block_assessment_id where r.work_score is distinct from a.cbi_work_score or r.personal_score is distinct from a.cbi_personal_score or r.patient_score is distinct from a.cbi_patient_score);
end $$;
rollback;
