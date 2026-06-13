-- ============================================================================
-- Migration: Questionnaire Reminders table for escalation system
-- Run this in the Supabase SQL editor
-- ============================================================================

create table if not exists questionnaire_reminders (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references studies(id) on delete cascade,
  resident_id uuid not null references burnout_participants(id) on delete cascade,
  block_number integer not null,  -- 0 = enrollment, 1-6 = rotation blocks
  level integer not null check (level between 1 and 5),
  reminder_type text not null,    -- email_gentle, email_firm, email_final, coordinator_escalation, enrollment_gentle, enrollment_urgent
  sent_to text[] not null default '{}',
  missing_items text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_qr_study on questionnaire_reminders (study_id);
create index if not exists idx_qr_resident on questionnaire_reminders (resident_id);
create index if not exists idx_qr_block on questionnaire_reminders (block_number, level);

-- RLS
alter table questionnaire_reminders enable row level security;

drop policy if exists qr_select on questionnaire_reminders;
create policy qr_select on questionnaire_reminders for select using (can_read_study_data(study_id));

drop policy if exists qr_write on questionnaire_reminders;
create policy qr_write on questionnaire_reminders for insert with check (can_write_study_data(study_id));
