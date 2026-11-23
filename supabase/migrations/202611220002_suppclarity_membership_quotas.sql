-- Private, atomic calendar-month allowances. Never accept client claims of Plus.
create table if not exists public.suppclarity_membership_usage (
 window_start date not null,
 period text not null check (period in ('day','month')),
 kind text not null check (kind in ('scan','answer')),
 scope text not null check (scope in ('member','ip','global')),
 subject_hash text not null,
 used integer not null check (used >= 0),
 primary key(window_start,period,kind,scope,subject_hash)
);
alter table public.suppclarity_membership_usage enable row level security;
revoke all on public.suppclarity_membership_usage from public,anon,authenticated;
create or replace function public.suppclarity_reserve_membership_action(p_subject_hash text,p_ip_hash text,p_kind text,p_plus boolean)
returns boolean language plpgsql security definer set search_path=public as $$
declare today_utc date := (now() at time zone 'UTC')::date; month_utc date := date_trunc('month',now() at time zone 'UTC')::date; monthly_limit integer; daily_limit integer; changed integer;
begin
 if p_subject_hash !~ '^[a-f0-9]{64}$' or p_ip_hash !~ '^[a-f0-9]{64}$' or p_kind not in ('scan','answer') or p_plus is null then raise exception 'invalid_quota_request'; end if;
 monthly_limit := case when p_plus then case when p_kind='scan' then 100 else 300 end else case when p_kind='scan' then 3 else 10 end end;
 daily_limit := case when p_plus then case when p_kind='scan' then 20 else 50 end else case when p_kind='scan' then 3 else 10 end end;
 delete from public.suppclarity_membership_usage where window_start < today_utc - 62;
 insert into public.suppclarity_membership_usage values(month_utc,'month',p_kind,'member',p_subject_hash,1)
 on conflict(window_start,period,kind,scope,subject_hash) do update set used=public.suppclarity_membership_usage.used+1 where public.suppclarity_membership_usage.used<monthly_limit;
 get diagnostics changed=row_count; if changed=0 then raise exception 'quota_exceeded'; end if;
 insert into public.suppclarity_membership_usage values(today_utc,'day',p_kind,'member',p_subject_hash,1)
 on conflict(window_start,period,kind,scope,subject_hash) do update set used=public.suppclarity_membership_usage.used+1 where public.suppclarity_membership_usage.used<daily_limit;
 get diagnostics changed=row_count; if changed=0 then raise exception 'quota_exceeded'; end if;
 insert into public.suppclarity_membership_usage values(today_utc,'day',p_kind,'ip',p_ip_hash,1)
 on conflict(window_start,period,kind,scope,subject_hash) do update set used=public.suppclarity_membership_usage.used+1 where public.suppclarity_membership_usage.used<case when p_plus then 500 else 30 end;
 get diagnostics changed=row_count; if changed=0 then raise exception 'quota_exceeded'; end if;
 insert into public.suppclarity_membership_usage values(today_utc,'day',p_kind,'global',case when p_plus then 'plus' else 'free' end,1)
 on conflict(window_start,period,kind,scope,subject_hash) do update set used=public.suppclarity_membership_usage.used+1 where public.suppclarity_membership_usage.used<case when p_plus then 3000 else 100 end;
 get diagnostics changed=row_count; if changed=0 then raise exception 'quota_exceeded'; end if;
 return true;
end $$;
revoke all on function public.suppclarity_reserve_membership_action(text,text,text,boolean) from public,anon,authenticated;
grant execute on function public.suppclarity_reserve_membership_action(text,text,text,boolean) to service_role;
create or replace function public.suppclarity_membership_ready() returns boolean language sql security definer set search_path=public as $$ select true $$;
revoke all on function public.suppclarity_membership_ready() from public,anon,authenticated;
grant execute on function public.suppclarity_membership_ready() to service_role;
