create table if not exists public.wardwise_free_quota (
  usage_day date not null,
  scope text not null check (scope in ('install', 'global')),
  bucket text not null check (bucket in ('conversation', 'transcription')),
  subject_hash text not null,
  used integer not null default 0 check (used >= 0),
  primary key (usage_day, scope, bucket, subject_hash)
);

alter table public.wardwise_free_quota enable row level security;
revoke all on public.wardwise_free_quota from public, anon, authenticated;

create or replace function public.wardwise_reserve_free_use(
  p_install_hash text,
  p_bucket text,
  p_install_limit integer,
  p_global_limit integer
) returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  today_utc date := (now() at time zone 'UTC')::date;
  changed integer;
begin
  if p_install_hash !~ '^[a-f0-9]{64}$'
    or p_bucket not in ('conversation', 'transcription')
    or p_install_limit not between 1 and 20
    or p_global_limit not between 1 and 1000 then
    raise exception 'invalid_quota_request';
  end if;

  delete from public.wardwise_free_quota where usage_day <= today_utc - 90;

  insert into public.wardwise_free_quota (usage_day, scope, bucket, subject_hash, used)
  values (today_utc, 'global', p_bucket, 'global', 1)
  on conflict (usage_day, scope, bucket, subject_hash)
  do update set used = public.wardwise_free_quota.used + 1
    where public.wardwise_free_quota.used < p_global_limit;
  get diagnostics changed = row_count;
  if changed = 0 then raise exception 'quota_exceeded'; end if;

  insert into public.wardwise_free_quota (usage_day, scope, bucket, subject_hash, used)
  values (today_utc, 'install', p_bucket, p_install_hash, 1)
  on conflict (usage_day, scope, bucket, subject_hash)
  do update set used = public.wardwise_free_quota.used + 1
    where public.wardwise_free_quota.used < p_install_limit;
  get diagnostics changed = row_count;
  if changed = 0 then raise exception 'quota_exceeded'; end if;
  return true;
end;
$$;

revoke all on function public.wardwise_reserve_free_use(text,text,integer,integer) from public, anon, authenticated;
grant execute on function public.wardwise_reserve_free_use(text,text,integer,integer) to service_role;

create extension if not exists pg_cron with schema extensions;
select cron.schedule(
  'wardwise-delete-old-free-quota',
  '15 2 * * *',
  $$delete from public.wardwise_free_quota where usage_day <= ((now() at time zone 'UTC')::date - 90)$$
);
