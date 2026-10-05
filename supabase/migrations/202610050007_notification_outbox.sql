begin;
create table public.notification_outbox (
 message_key text primary key, body jsonb not null, status text not null default 'pending',
 provider_id text, attempts integer not null default 0, owner uuid, lease_until timestamptz,
 first_attempt_at timestamptz, updated_at timestamptz not null default now(), last_error text,
 check(status in ('pending','sending','accepted','uncertain'))
);
alter table public.notification_outbox enable row level security;
revoke all on public.notification_outbox from public,anon,authenticated;
grant all on public.notification_outbox to service_role;
create function public.claim_notification(k text,payload jsonb,run uuid) returns jsonb
language plpgsql security definer set search_path=public as $$
declare row public.notification_outbox;
begin
 insert into notification_outbox(message_key,body) values(k,payload) on conflict do nothing;
 select * into strict row from notification_outbox where message_key=k for update;
 if row.status='accepted' then return jsonb_build_object('accepted',true,'id',row.provider_id); end if;
 if row.lease_until>now() then return jsonb_build_object('busy',true); end if;
 -- Provider deduplication has a finite horizon. Never automatically resend an
 -- ambiguous old request after that horizon: it might already have been delivered.
 if row.first_attempt_at<now()-interval '23 hours' then
  update notification_outbox set status='uncertain',last_error='Provider acceptance requires manual review',updated_at=now() where message_key=k;
  return jsonb_build_object('review_required',true);
 end if;
 update notification_outbox set status='sending',owner=run,lease_until=now()+interval '2 minutes',attempts=attempts+1,
  first_attempt_at=coalesce(first_attempt_at,now()),updated_at=now() where message_key=k;
 return jsonb_build_object('body',row.body);
end $$;
revoke all on function public.claim_notification(text,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.claim_notification(text,jsonb,uuid) to service_role;
commit;
