begin;
set local lock_timeout = '5s';

-- Match the approved minimum age while preserving the existing upper bound.
alter table public.thalassemia_patients
  drop constraint if exists chk_patient_age,
  add constraint chk_patient_age check (
    age_at_enrollment is null or age_at_enrollment between 12 and 100
  );

commit;
