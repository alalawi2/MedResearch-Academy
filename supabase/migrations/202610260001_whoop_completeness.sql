begin;
alter table public.whoop_sync_state add column reconcile_cursor timestamptz,
 add column reconcile_due_at timestamptz,add column reconcile_mode boolean not null default false;

-- A historical refresh must never move the catch-up watermark backwards.
create function public.whoop_monotonic_watermark() returns trigger language plpgsql set search_path=public as $$
begin
 new.completed_through:=greatest(old.completed_through,new.completed_through);
 return new;
end $$;
create trigger whoop_monotonic_watermark before update on public.whoop_sync_state
 for each row execute function public.whoop_monotonic_watermark();

create table public.whoop_body_snapshots(
 resident_id uuid not null references public.burnout_participants(id),
 observed_at timestamptz not null default now(),
 height_meter double precision,weight_kilogram double precision,max_heart_rate double precision,
 primary key(resident_id,observed_at)
);
create table public.whoop_body_sync_state(
 resident_id uuid primary key references public.burnout_participants(id),
 last_success timestamptz,next_attempt timestamptz not null default now(),error text
);
create table public.whoop_daily_summaries(
 resident_id uuid not null references public.burnout_participants(id),date date not null,
 version integer not null default 2,metrics jsonb not null,quality jsonb not null,source_ids jsonb not null,
 calculated_at timestamptz not null default now(),primary key(resident_id,date,version)
);
create table public.whoop_daily_summary_versions(
 resident_id uuid not null references public.burnout_participants(id),date date not null,
 version integer not null,fingerprint text not null,summary jsonb not null,
 calculated_at timestamptz not null default now(),primary key(resident_id,date,version,fingerprint)
);
-- Preserve the old calculation as it stood before any new deployment.
create table public.whoop_daily_legacy_20261026 as select * from public.whoop_daily;
do $$ declare t text;begin
 foreach t in array array['whoop_body_snapshots','whoop_body_sync_state','whoop_daily_summaries','whoop_daily_summary_versions','whoop_daily_legacy_20261026'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon,authenticated',t);
  execute format('grant all on public.%I to service_role',t);
 end loop;
end $$;
create function public.save_whoop_summaries(rid uuid,rows_json jsonb) returns void
 language plpgsql security definer set search_path=public as $$
declare item jsonb;
begin
 for item in select * from jsonb_array_elements(rows_json) loop
  insert into whoop_daily_summary_versions(resident_id,date,version,fingerprint,summary)
   values(rid,(item->>'date')::date,2,md5(item::text),item) on conflict do nothing;
  insert into whoop_daily_summaries(resident_id,date,version,metrics,quality,source_ids)
   values(rid,(item->>'date')::date,2,item->'metrics',item->'quality',item->'source_ids')
   on conflict(resident_id,date,version) do update set metrics=excluded.metrics,quality=excluded.quality,
    source_ids=excluded.source_ids,calculated_at=now();
 end loop;
end $$;
revoke all on function public.save_whoop_summaries(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.save_whoop_summaries(uuid,jsonb) to service_role;
commit;
