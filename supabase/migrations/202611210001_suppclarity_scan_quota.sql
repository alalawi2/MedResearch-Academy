-- No label, health profile or raw IP is stored. Counters are separate from other Academy apps.
create table if not exists public.suppclarity_scan_quota (
  usage_day date not null,
  scope text not null check (scope in ('global','install','ip')),
  subject_hash text not null,
  used integer not null check (used >= 0),
  primary key (usage_day,scope,subject_hash)
);
alter table public.suppclarity_scan_quota enable row level security;
revoke all on public.suppclarity_scan_quota from anon, authenticated;
create or replace function public.suppclarity_reserve_scan(p_install_hash text,p_ip_hash text)
returns boolean language plpgsql security definer set search_path=public as $$
declare today_utc date:=(now() at time zone 'UTC')::date; changed integer;
begin
 if p_install_hash !~ '^[a-f0-9]{64}$' or p_ip_hash !~ '^[a-f0-9]{64}$' then raise exception 'invalid_quota_request'; end if;
 delete from public.suppclarity_scan_quota where usage_day < today_utc - 7;
 insert into public.suppclarity_scan_quota values(today_utc,'global','global',1)
 on conflict(usage_day,scope,subject_hash) do update set used=public.suppclarity_scan_quota.used+1 where public.suppclarity_scan_quota.used<100;
 get diagnostics changed=row_count; if changed=0 then raise exception 'quota_exceeded'; end if;
 insert into public.suppclarity_scan_quota values(today_utc,'ip',p_ip_hash,1)
 on conflict(usage_day,scope,subject_hash) do update set used=public.suppclarity_scan_quota.used+1 where public.suppclarity_scan_quota.used<15;
 get diagnostics changed=row_count; if changed=0 then raise exception 'quota_exceeded'; end if;
 insert into public.suppclarity_scan_quota values(today_utc,'install',p_install_hash,1)
 on conflict(usage_day,scope,subject_hash) do update set used=public.suppclarity_scan_quota.used+1 where public.suppclarity_scan_quota.used<5;
 get diagnostics changed=row_count; if changed=0 then raise exception 'quota_exceeded'; end if;
 return true;
end $$;
revoke all on function public.suppclarity_reserve_scan(text,text) from public,anon,authenticated;
grant execute on function public.suppclarity_reserve_scan(text,text) to service_role;

create or replace function public.suppclarity_reserve_evidence(p_ip_hash text)
returns boolean language plpgsql security definer set search_path=public as $$
declare today_utc date:=(now() at time zone 'UTC')::date; changed integer;
begin
 if p_ip_hash !~ '^[a-f0-9]{64}$' then raise exception 'invalid_quota_request'; end if;
 delete from public.suppclarity_scan_quota where usage_day < today_utc - 7;
 insert into public.suppclarity_scan_quota values(today_utc,'global','evidence',1)
 on conflict(usage_day,scope,subject_hash) do update set used=public.suppclarity_scan_quota.used+1 where public.suppclarity_scan_quota.used<50;
 get diagnostics changed=row_count; if changed=0 then raise exception 'quota_exceeded'; end if;
 insert into public.suppclarity_scan_quota values(today_utc,'ip','evidence:'||p_ip_hash,1)
 on conflict(usage_day,scope,subject_hash) do update set used=public.suppclarity_scan_quota.used+1 where public.suppclarity_scan_quota.used<20;
 get diagnostics changed=row_count; if changed=0 then raise exception 'quota_exceeded'; end if;
 return true;
end $$;
revoke all on function public.suppclarity_reserve_evidence(text) from public,anon,authenticated;
grant execute on function public.suppclarity_reserve_evidence(text) to service_role;
