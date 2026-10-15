begin;
-- Exercise the live constraint on a temporary table, without patient records.
create temporary table age_constraint_probe (age_at_enrollment integer);
do $$
declare definition text; rejected integer;
begin
  select pg_get_constraintdef(oid) into strict definition
    from pg_constraint
    where conrelid = 'public.thalassemia_patients'::regclass
      and conname = 'chk_patient_age';
  execute 'alter table age_constraint_probe add constraint age_probe ' || definition;
  insert into age_constraint_probe values (12), (17), (18), (100), (null);
  foreach rejected in array array[11, 101] loop
    begin
      insert into age_constraint_probe values (rejected);
      raise exception 'Unexpectedly accepted age %', rejected;
    exception when check_violation then
      null;
    end;
  end loop;
end $$;
select 'PASS: 12, 17, 18, 100 and NULL accepted; 11 and 101 rejected' as result;
rollback;
