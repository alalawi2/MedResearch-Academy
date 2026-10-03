begin;
-- Read-time completion uses the existing protocol checklist, not actual_date.
-- Old dates are preserved as historical attendance data, never completion proof.
create or replace view public.thalassemia_visit_schedule_v with (security_invoker=true) as
select vs.id, vs.patient_id, vs.study_id, vs.timepoint,
  vs.expected_date, vs.window_start, vs.window_end, vs.actual_date,
  vs.notes, vs.entered_by, vs.entered_at, vs.updated_by, vs.updated_at,
  case when
    exists(select 1 from public.thalassemia_lab l where l.patient_id=vs.patient_id and l.timepoint=vs.timepoint)
    and (vs.timepoint='6mo' or (
      vs.timepoint in ('baseline','12mo')
      and exists(select 1 from public.thalassemia_ecg e where e.patient_id=vs.patient_id and e.timepoint=vs.timepoint)
      and exists(select 1 from public.thalassemia_echo e where e.patient_id=vs.patient_id and e.timepoint=vs.timepoint)
      and exists(select 1 from public.thalassemia_t2mri m where m.patient_id=vs.patient_id and m.timepoint=vs.timepoint)
      and (vs.timepoint='12mo' or (
        exists(select 1 from public.thalassemia_patients p where p.id=vs.patient_id and p.enrollment_date is not null)
        and exists(select 1 from public.thalassemia_polysomnography p where p.patient_id=vs.patient_id)
        and exists(select 1 from public.thalassemia_scg s where s.patient_id=vs.patient_id and s.timepoint='baseline')
      ))
    )) then 'complete'
    when current_date < vs.window_start then 'scheduled'
    when current_date between vs.window_start and vs.window_end then 'window_open'
    else 'overdue'
  end as computed_status
from public.thalassemia_visit_schedule vs;
commit;
