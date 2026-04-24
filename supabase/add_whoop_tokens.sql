create table if not exists whoop_tokens (
  id uuid primary key default gen_random_uuid(),
  resident_id uuid unique not null references residents(id) on delete cascade,
  whoop_user_id text not null,
  access_token text not null,
  refresh_token text not null default '',
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_whoop_tokens_resident on whoop_tokens (resident_id);

alter table whoop_tokens enable row level security;

drop policy if exists whoop_tokens_admin on whoop_tokens;
create policy whoop_tokens_admin on whoop_tokens for all
  using (false) with check (false);
