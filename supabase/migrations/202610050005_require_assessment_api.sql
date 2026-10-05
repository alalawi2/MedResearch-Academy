begin;
-- Resident forms now use the authenticated server endpoint and a single transaction.
-- Remove the alternate browser insertion path that bypasses calendar and active-status checks.
drop policy if exists ba_resident_insert on public.block_assessments;
drop policy if exists cbi_resident_insert on public.cbi_responses;
drop policy if exists phq9_resident_insert on public.phq9_responses;
drop policy if exists gad7_resident_insert on public.gad7_responses;
drop policy if exists isi_resident_insert on public.isi_responses;
-- Existing service-role ingestion remains unaffected. Staff imports keep their scoped access.
do $$ declare t text; begin
 foreach t in array array['block_assessments','cbi_responses','phq9_responses','gad7_responses','isi_responses'] loop
  execute format('create policy %I on public.%I for insert to authenticated with check(public.current_role_for_study(study_id) in (''admin'',''super_admin'',''coordinator'',''data_entry''))',t||'_staff_insert',t);
 end loop;
end $$;
commit;
