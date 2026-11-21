begin;
-- Isolated, service-only feedback for SuppClarity's optional AI answers.
-- No clinical or Academy participant tables are read or changed.
create table if not exists public.suppclarity_content_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  ip_hash text not null check (ip_hash ~ '^[a-f0-9]{64}$'),
  category text not null check (category in ('incorrect','unsafe','offensive','other')),
  answer text not null check (length(btrim(answer)) between 1 and 6000),
  source_ids jsonb not null default '[]'::jsonb check (jsonb_typeof(source_ids) = 'array' and jsonb_array_length(source_ids) <= 12)
);
create index if not exists suppclarity_reports_allowance on public.suppclarity_content_reports (ip_hash, created_at);
create index if not exists suppclarity_reports_expiry on public.suppclarity_content_reports (created_at);
alter table public.suppclarity_content_reports enable row level security;
revoke all on public.suppclarity_content_reports from public, anon, authenticated;
grant select, insert, delete on public.suppclarity_content_reports to service_role;
create or replace function public.suppclarity_submit_report(p_ip_hash text, p_category text, p_answer text, p_source_ids jsonb)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if p_ip_hash !~ '^[a-f0-9]{64}$' or p_category not in ('incorrect','unsafe','offensive','other') or length(btrim(p_answer)) not between 1 and 6000 or jsonb_typeof(p_source_ids) <> 'array' or jsonb_array_length(p_source_ids) > 12 then
    raise exception 'invalid_report';
  end if;
  perform pg_advisory_xact_lock(hashtext('suppclarity-report-v1'));
  if (select count(*) from public.suppclarity_content_reports where ip_hash = p_ip_hash and created_at >= date_trunc('day', now() at time zone 'UTC') at time zone 'UTC') >= 10
     or (select count(*) from public.suppclarity_content_reports where created_at >= date_trunc('day', now() at time zone 'UTC') at time zone 'UTC') >= 200 then
    raise exception 'report_allowance_exceeded';
  end if;
  insert into public.suppclarity_content_reports(ip_hash,category,answer,source_ids) values(p_ip_hash,p_category,btrim(p_answer),p_source_ids);
  return true;
end;
$$;
revoke all on function public.suppclarity_submit_report(text,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.suppclarity_submit_report(text,text,text,jsonb) to service_role;
-- Named schedule is updated in place if this migration is reapplied.
select cron.schedule('suppclarity-expire-content-reports', '0 3 * * *', $$delete from public.suppclarity_content_reports where created_at < now() - interval '30 days';$$);

commit;
