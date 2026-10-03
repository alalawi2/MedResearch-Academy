begin;
alter table public.questionnaire_reminders add column if not exists academic_year text;
-- Reminders are for the academic year active at send time. Preserve all history.
update public.questionnaire_reminders
set academic_year = case when extract(month from created_at at time zone 'Asia/Muscat') >= 9
 then extract(year from created_at at time zone 'Asia/Muscat')::int::text || '-' || (extract(year from created_at at time zone 'Asia/Muscat')::int+1)::text
 else (extract(year from created_at at time zone 'Asia/Muscat')::int-1)::text || '-' || extract(year from created_at at time zone 'Asia/Muscat')::int::text end
where academic_year is null and block_number > 0;
commit;
