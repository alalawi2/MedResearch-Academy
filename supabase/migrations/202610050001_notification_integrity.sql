do $$ begin
 if not public.claim_whoop_sync('e18fc5d0-b39f-4cba-9181-a14ec3100501'::uuid) then
  raise exception 'WHOOP import active; retry migration after it finishes';
 end if;
end $$;
-- Preserve incorrect alert history, but exclude it from future cooldowns.
alter table public.adherence_alerts add column if not exists invalidated_at timestamptz;
alter table public.adherence_alerts add column if not exists invalidation_reason text;
alter table public.adherence_alerts add column if not exists correction_sent_at timestamptz;
alter table public.adherence_alerts add column if not exists correction_provider_id text;
update public.adherence_alerts set invalidated_at=now(),
 invalidation_reason='Importer omitted percentage; reminder converted unknown to zero.'
where created_at>='2026-10-03' and pct_recorded=0 and days_with_data>0 and invalidated_at is null;

-- Repair only dates proven to have been overwritten after an earlier WHOOP-link event.
create table if not exists public.enrollment_date_repairs (
 resident_id uuid primary key references public.burnout_participants(id),
 old_date date not null, restored_date date not null, source_event_at timestamptz not null,
 repaired_at timestamptz not null default now()
);
alter table public.enrollment_date_repairs enable row level security;
revoke all on public.enrollment_date_repairs from anon,authenticated;
insert into public.enrollment_date_repairs(resident_id,old_date,restored_date,source_event_at)
select p.id,p.enrollment_date,(e.linked_at at time zone 'Asia/Muscat')::date,e.linked_at
from public.burnout_participants p join (
 select resident_id,min(created_at) linked_at from public.enrollment_events
 where event_type='whoop_oauth_linked' group by resident_id
)e on e.resident_id=p.id
where p.study_participant_id ~ '^RES-[0-9]+$'
and p.enrollment_date>(e.linked_at at time zone 'Asia/Muscat')::date
on conflict do nothing;

update public.burnout_participants p set enrollment_date=r.restored_date
from public.enrollment_date_repairs r where p.id=r.resident_id and p.enrollment_date=r.old_date;
-- A repaired earlier consent window needs a fresh bounded backfill, not a cursor at the old start.
update public.whoop_sync_state s set
 window_start=(r.restored_date::timestamp at time zone 'Asia/Muscat'),
 window_end=least(now(),((r.restored_date+28)::timestamp at time zone 'Asia/Muscat')),
 next_token=null,completed_through=null,status='pending',error=null,next_attempt=now()
from public.enrollment_date_repairs r where s.resident_id=r.resident_id;
delete from public.whoop_sync_lease where name='archive' and owner='e18fc5d0-b39f-4cba-9181-a14ec3100501'::uuid;
