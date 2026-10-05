begin;
-- Replace browser-generated/login-displayed access codes with verified Supabase sessions.
revoke all on public.researcher_access_codes from public,anon,authenticated;
revoke select on public.surveys from public,anon,authenticated;
do $$ declare cols text; begin
 select string_agg(quote_ident(column_name),',') into cols from information_schema.columns
 where table_schema='public' and table_name='surveys' and column_name<>'researcher_password';
 execute 'grant select ('||cols||') on public.surveys to anon,authenticated';
end $$;
drop policy if exists "Public update survey password" on public.surveys;
create or replace function public.can_manage_survey(sid uuid) returns boolean
language sql stable security definer set search_path=public as $$
 select auth.uid() is not null and (
  exists(select 1 from surveys where id=sid and lower(researcher_email)=lower(auth.jwt()->>'email'))
  or exists(select 1 from staff s join staff_study_roles r on r.staff_id=s.id
    where s.auth_user_id=auth.uid() and s.active and r.role in ('admin','super_admin'))
 );
$$;
create policy survey_owner_read on public.surveys for select to authenticated using(public.can_manage_survey(id));
create policy survey_staff_update on public.surveys for update to authenticated
 using(exists(select 1 from staff s join staff_study_roles r on r.staff_id=s.id where s.auth_user_id=auth.uid() and s.active and r.role in ('admin','super_admin')))
 with check(exists(select 1 from staff s join staff_study_roles r on r.staff_id=s.id where s.auth_user_id=auth.uid() and s.active and r.role in ('admin','super_admin')));
drop policy if exists "Public read responses" on public.survey_responses;
create policy survey_owner_responses on public.survey_responses for select to authenticated using(public.can_manage_survey(survey_id));
drop policy if exists "Public insert responses" on public.survey_responses;
create policy active_survey_response_insert on public.survey_responses for insert to anon,authenticated
 with check(exists(select 1 from surveys s where s.id=survey_id and s.status='active'));
drop policy if exists "Anyone can view enrollment count" on public.pilot_enrollment;
-- Existing role-scoped administrator policy remains; a public count must not reveal names/emails.
commit;
