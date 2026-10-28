begin;
lock table public.weekly_checkins in share row exclusive mode;
-- Preserve original dates and answers before correcting the UTC conversion bug.
create table public.weekly_checkins_before_date_fix_20261028 as select * from public.weekly_checkins;
alter table public.weekly_checkins_before_date_fix_20261028 enable row level security;
revoke all on public.weekly_checkins_before_date_fix_20261028 from anon,authenticated;
grant all on public.weekly_checkins_before_date_fix_20261028 to service_role;
-- Any collision aborts the whole transaction rather than merging answers.
update public.weekly_checkins set week_start=week_start+1 where extract(dow from week_start)=0;
create function public.normalize_weekly_log_date() returns trigger language plpgsql set search_path=public as $$
begin
 -- Compatibility for an already-open old browser sending the erroneous Sunday.
 if extract(dow from new.week_start)=0 then new.week_start:=new.week_start+1;end if;
 return new;
end $$;
create trigger normalize_weekly_log_date before insert or update of week_start on public.weekly_checkins
 for each row execute function public.normalize_weekly_log_date();
commit;
