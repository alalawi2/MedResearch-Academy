begin;
-- Explicitly authorized: all active members of this study can enroll patients.
create or replace function public.is_thalassemia_team(_study_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from studies where id=_study_id and slug='thalassemia-cardiac')
   and current_role_for_study(_study_id) is not null;
$$;
create or replace function public.can_read_identifiers(_study_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
 select coalesce(current_role_for_study(_study_id) in ('super_admin','research_admin'),false)
   or is_thalassemia_team(_study_id);
$$;
create or replace function public.can_write_identifiers(_study_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
 select coalesce(current_role_for_study(_study_id) in ('super_admin','research_admin'),false)
   or is_thalassemia_team(_study_id);
$$;
-- Do not expand identifier deletion when expanding enrollment/edit access.
drop policy if exists thal_ident_write on public.thalassemia_patient_identifiers;
create policy thal_ident_insert on public.thalassemia_patient_identifiers for insert to authenticated
 with check(can_write_identifiers(study_id));
create policy thal_ident_update on public.thalassemia_patient_identifiers for update to authenticated
 using(can_write_identifiers(study_id)) with check(can_write_identifiers(study_id));
create policy thal_ident_delete on public.thalassemia_patient_identifiers for delete to authenticated
 using(current_role_for_study(study_id) in ('super_admin','research_admin'));
-- Enrollment needs patients and their schedule as well as identifiers.
create policy thal_team_patient_insert on public.thalassemia_patients for insert to authenticated with check(is_thalassemia_team(study_id));
create policy thal_team_patient_update on public.thalassemia_patients for update to authenticated using(is_thalassemia_team(study_id)) with check(is_thalassemia_team(study_id));
create policy thal_team_visit_insert on public.thalassemia_visit_schedule for insert to authenticated with check(is_thalassemia_team(study_id));
create policy thal_team_visit_update on public.thalassemia_visit_schedule for update to authenticated using(is_thalassemia_team(study_id)) with check(is_thalassemia_team(study_id));
commit;
