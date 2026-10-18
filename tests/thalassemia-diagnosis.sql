begin;
create temporary table diagnosis_probe (diagnosis public.thal_diagnosis);
insert into diagnosis_probe values ('major'), ('intermedia'), ('cda');
update diagnosis_probe set diagnosis = 'cda' where diagnosis = 'intermedia';
do $$
begin
  if (select count(*) from diagnosis_probe where diagnosis = 'cda') <> 2 then
    raise exception 'CDA insert/update failed';
  end if;
  if (select diagnosis from jsonb_populate_record(null::public.thalassemia_patients, '{"diagnosis":"cda"}')) <> 'cda' then
    raise exception 'Enrollment payload conversion failed';
  end if;
end $$;
select 'PASS: CDA insert, update and enrollment payload conversion' as result;
rollback;
