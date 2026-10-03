begin;
create table public.whoop_source_records (
 resident_id uuid not null references public.burnout_participants(id),
 kind text not null check(kind in ('cycle','sleep','recovery','workout')),
 source_id text not null, payload jsonb not null, fetched_at timestamptz not null default now(),
 primary key(resident_id,kind,source_id)
);
create table public.whoop_source_versions (
 resident_id uuid not null references public.burnout_participants(id), kind text not null,
 source_id text not null, fingerprint text not null, payload jsonb not null,
 fetched_at timestamptz not null default now(),primary key(resident_id,kind,source_id,fingerprint)
);
create table public.whoop_sync_state (
 resident_id uuid not null references public.burnout_participants(id),kind text not null,
 window_start timestamptz not null, window_end timestamptz not null, next_token text,
 completed_through timestamptz,last_success timestamptz,last_attempt timestamptz,
 next_attempt timestamptz not null default now(), status text not null default 'pending',
 error text, pages bigint not null default 0, primary key(resident_id,kind)
);
create table public.whoop_sync_lease (name text primary key, owner uuid not null, expires_at timestamptz not null);
alter table public.whoop_source_records enable row level security;
alter table public.whoop_source_versions enable row level security;
alter table public.whoop_sync_state enable row level security;
alter table public.whoop_sync_lease enable row level security;
revoke all on public.whoop_source_records,public.whoop_source_versions,public.whoop_sync_state,public.whoop_sync_lease from anon,authenticated;
grant all on public.whoop_source_records,public.whoop_source_versions,public.whoop_sync_state,public.whoop_sync_lease to service_role;
create policy sync_staff_read on public.whoop_sync_state for select to authenticated
 using(exists(select 1 from public.burnout_participants p where p.id=resident_id and public.can_read_study_data(p.study_id)));
grant select on public.whoop_sync_state to authenticated;
create function public.claim_whoop_sync(run_id uuid) returns boolean language plpgsql security definer set search_path=public as $$
begin
 insert into whoop_sync_lease values('archive',run_id,now()+interval '6 minutes')
 on conflict(name) do update set owner=excluded.owner,expires_at=excluded.expires_at
 where whoop_sync_lease.expires_at<now();
 return found;
end $$;
create function public.save_whoop_page(rid uuid, endpoint text, records jsonb, cursor_value text, expected_start timestamptz, expected_end timestamptz)
 returns void language plpgsql security definer set search_path=public as $$
declare item jsonb; sid text;
begin
 perform 1 from whoop_sync_state where resident_id=rid and kind=endpoint and window_start=expected_start and window_end=expected_end for update;
 if not found then raise exception 'Stale sync window'; end if;
 for item in select * from jsonb_array_elements(records) loop
  sid:=case when endpoint='recovery' then item->>'cycle_id' else item->>'id' end;
  if sid is null then raise exception 'Source identifier missing'; end if;
  insert into whoop_source_versions values(rid,endpoint,sid,md5(item::text),item,now()) on conflict do nothing;
  insert into whoop_source_records values(rid,endpoint,sid,item,now())
   on conflict(resident_id,kind,source_id) do update set payload=excluded.payload,fetched_at=excluded.fetched_at
   where coalesce((excluded.payload->>'updated_at')::timestamptz,'epoch')>=coalesce((whoop_source_records.payload->>'updated_at')::timestamptz,'epoch');
 end loop;
 update whoop_sync_state set next_token=cursor_value,pages=pages+1,last_success=now(),error=null,
  completed_through=case when cursor_value is null then expected_end else completed_through end,
  status=case when cursor_value is null then 'window_complete' else 'paging' end
 where resident_id=rid and kind=endpoint;
end $$;
-- Partial updates must not erase existing metrics when a different endpoint fails.
create function public.merge_whoop_days(rid uuid, rows_json jsonb) returns integer language plpgsql security definer set search_path=public as $$
declare item jsonb; oldrow public.whoop_daily; merged public.whoop_daily; n integer:=0; study uuid;
begin
 select study_id into strict study from burnout_participants where id=rid;
 for item in select * from jsonb_array_elements(rows_json) loop
  select * into oldrow from whoop_daily where resident_id=rid and date=(item->>'date')::date and is_nap=false for update;
  if not found then
   insert into whoop_daily(resident_id,study_id,date,is_nap) values(rid,study,(item->>'date')::date,false) returning * into oldrow;
  end if;
  merged:=jsonb_populate_record(oldrow,jsonb_strip_nulls(item));
  update whoop_daily set hrv_rmssd_ms=merged.hrv_rmssd_ms,resting_hr_bpm=merged.resting_hr_bpm,
   recovery_score=merged.recovery_score,spo2_pct=merged.spo2_pct,skin_temp_c=merged.skin_temp_c,user_calibrating=merged.user_calibrating,
   total_sleep_min=merged.total_sleep_min,light_sleep_min=merged.light_sleep_min,deep_sleep_min=merged.deep_sleep_min,rem_sleep_min=merged.rem_sleep_min,
   awake_min=merged.awake_min,sleep_efficiency_pct=merged.sleep_efficiency_pct,sleep_consistency_pct=merged.sleep_consistency_pct,
   sleep_performance_pct=merged.sleep_performance_pct,respiratory_rate=merged.respiratory_rate,
   disturbance_count=merged.disturbance_count,sleep_cycle_count=merged.sleep_cycle_count,sleep_onset_time=merged.sleep_onset_time,sleep_end_time=merged.sleep_end_time,
   sleep_debt_min=merged.sleep_debt_min,sleep_need_baseline_min=merged.sleep_need_baseline_min,sleep_need_strain_min=merged.sleep_need_strain_min,
   daily_strain=merged.daily_strain,avg_hr_bpm=merged.avg_hr_bpm,max_hr_bpm=merged.max_hr_bpm,kilojoules=merged.kilojoules,
   cycle_id=merged.cycle_id,sleep_id=merged.sleep_id,pulled_at=now() where id=oldrow.id;
  n:=n+1;
 end loop;
 return n;
end $$;
revoke all on function public.claim_whoop_sync(uuid),public.save_whoop_page(uuid,text,jsonb,text,timestamptz,timestamptz),public.merge_whoop_days(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.claim_whoop_sync(uuid),public.save_whoop_page(uuid,text,jsonb,text,timestamptz,timestamptz),public.merge_whoop_days(uuid,jsonb) to service_role;
create view public.whoop_coverage_v with(security_invoker=true) as
select p.id as resident_id,p.study_id,p.study_participant_id,p.enrollment_date,p.status,
 greatest(0,least(current_date,p.enrollment_date+364,coalesce(p.withdrawal_date-1,current_date))-p.enrollment_date+1) as expected_days,
 count(distinct w.date) as recorded_days,count(distinct w.date) filter(where w.hrv_rmssd_ms is not null) as hrv_days,
 count(distinct w.date) filter(where w.total_sleep_min is not null) as sleep_days,max(w.date) as latest_day,max(w.pulled_at) as last_import
from public.burnout_participants p left join public.whoop_daily w on w.resident_id=p.id
 and w.date>=p.enrollment_date and w.date<=least(current_date,p.enrollment_date+364,coalesce(p.withdrawal_date-1,current_date))
where p.study_participant_id ~ '^RES-[0-9]+$' group by p.id;
grant select on public.whoop_coverage_v to authenticated,service_role;
commit;
