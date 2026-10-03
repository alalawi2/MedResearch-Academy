begin;
create view public.whoop_assessment_coverage_v with(security_invoker=true) as
select a.id,a.resident_id,a.block_number,a.academic_year,a.assessment_date,
 count(distinct w.date) filter(where w.hrv_rmssd_ms>0 and w.user_calibrating is not true) as hrv_days_14,
 count(distinct w.date) filter(where w.total_sleep_min>0) as sleep_days_14
from public.block_assessments a join public.burnout_participants p on p.id=a.resident_id
left join public.whoop_daily w on w.resident_id=a.resident_id and w.date between a.assessment_date-13 and a.assessment_date
 and w.date>=p.enrollment_date and w.date<p.enrollment_date+365 and (p.withdrawal_date is null or w.date<p.withdrawal_date)
group by a.id;
grant select on public.whoop_assessment_coverage_v to authenticated,service_role;
commit;
