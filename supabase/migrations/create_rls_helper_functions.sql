drop function if exists can_write_study_data(uuid) cascade;
drop function if exists can_read_study_data(uuid) cascade;
drop function if exists is_authenticated_staff() cascade;
drop function if exists current_site_for_study(uuid) cascade;
drop function if exists current_role_for_study(uuid) cascade;
drop function if exists current_staff_id() cascade;

create or replace function current_staff_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from staff where auth_user_id = auth.uid() and active = true limit 1;
$$;

create or replace function current_role_for_study(_study_id uuid)
returns text language sql stable security definer set search_path = public as $$
  select ssr.role from staff_study_roles ssr
  join staff s on s.id = ssr.staff_id
  where s.auth_user_id = auth.uid() and s.active = true and ssr.study_id = _study_id
  limit 1;
$$;

create or replace function current_site_for_study(_study_id uuid)
returns text language sql stable security definer set search_path = public as $$
  select ssr.site_scope from staff_study_roles ssr
  join staff s on s.id = ssr.staff_id
  where s.auth_user_id = auth.uid() and s.active = true and ssr.study_id = _study_id
  limit 1;
$$;

create or replace function is_authenticated_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from staff where auth_user_id = auth.uid() and active = true);
$$;

create or replace function can_read_study_data(_study_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select current_role_for_study(_study_id) in (
    'super_admin','research_admin','research_assistant','statistician','site_coordinator');
$$;

create or replace function can_write_study_data(_study_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select current_role_for_study(_study_id) in (
    'super_admin','research_admin','research_assistant','site_coordinator');
$$;

create policy ssr_self on staff_study_roles
  for select using (staff_id = current_staff_id());
