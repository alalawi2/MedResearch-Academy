begin;
-- OAuth credentials must never be accessible through the browser's database roles.
drop policy if exists whoop_tokens_service on public.whoop_tokens;
revoke all on public.whoop_tokens from public,anon,authenticated;
grant all on public.whoop_tokens to service_role;
create policy whoop_tokens_service on public.whoop_tokens for all to service_role using(true) with check(true);

-- Alert writes are server-only. Public writes could suppress cooldowns or fabricate responses.
drop policy if exists aa_insert on public.adherence_alerts;
drop policy if exists ai_insert on public.anomaly_investigations;
drop policy if exists ai_update on public.anomaly_investigations;
revoke insert,update,delete on public.adherence_alerts,public.anomaly_investigations from public,anon,authenticated;
drop policy if exists bp_insert on public.burnout_participants;
create policy bp_staff_insert on public.burnout_participants for insert to authenticated
 with check(public.current_role_for_study(study_id) in ('admin','super_admin','coordinator','data_entry'));

create or replace function public.guard_participant_identity() returns trigger language plpgsql set search_path=public as $$
begin
 if auth.role()='authenticated' and public.current_role_for_study(old.study_id) is null then
  if (to_jsonb(new)-array['updated_at','full_name','demographics_completed','baseline_completed'])
     is distinct from (to_jsonb(old)-array['updated_at','full_name','demographics_completed','baseline_completed']) then
   -- Protect identity/consent while allowing the demographic fields used by resident forms.
   if new.id is distinct from old.id or new.study_id is distinct from old.study_id
    or new.auth_user_id is distinct from old.auth_user_id or new.study_participant_id is distinct from old.study_participant_id
    or new.email is distinct from old.email or new.status is distinct from old.status
    or new.enrollment_date is distinct from old.enrollment_date or new.withdrawal_date is distinct from old.withdrawal_date
    or new.whoop_user_id is distinct from old.whoop_user_id then
     raise exception 'Study identity and enrollment changes require coordinator review';
   end if;
  end if;
 end if;
 return new;
end $$;
create trigger guard_participant_identity before update on public.burnout_participants
 for each row execute function public.guard_participant_identity();

create or replace function public.guard_staff_identity() returns trigger language plpgsql set search_path=public as $$
begin
 if auth.role()='authenticated' and (new.id is distinct from old.id or new.auth_user_id is distinct from old.auth_user_id or new.active is distinct from old.active) then
  raise exception 'Staff access changes require server administration';
 end if;
 return new;
end $$;
create trigger guard_staff_identity before update on public.staff for each row execute function public.guard_staff_identity();
commit;
