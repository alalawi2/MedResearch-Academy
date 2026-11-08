create or replace function public.wardwise_release_failed_use(
  p_install_hash text,
  p_bucket text
) returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  today_utc date := (now() at time zone 'UTC')::date;
begin
  if p_install_hash !~ '^[a-f0-9]{64}$'
    or p_bucket not in ('conversation', 'transcription') then
    raise exception 'invalid_quota_request';
  end if;
  update public.wardwise_free_quota
    set used = greatest(0, used - 1)
    where usage_day = today_utc and scope = 'install'
      and bucket = p_bucket and subject_hash = p_install_hash;
  update public.wardwise_free_quota
    set used = greatest(0, used - 1)
    where usage_day = today_utc and scope = 'global'
      and bucket = p_bucket and subject_hash = 'global';
  return true;
end;
$$;
revoke all on function public.wardwise_release_failed_use(text,text) from public, anon, authenticated;
grant execute on function public.wardwise_release_failed_use(text,text) to service_role;
