\set ON_ERROR_STOP on
do $$ begin
 if not exists(select 1 from pg_roles where rolname='anon') then create role anon; end if;
 if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated; end if;
 if not exists(select 1 from pg_roles where rolname='service_role') then create role service_role; end if;
end $$;
create table burnout_participants(id uuid primary key default gen_random_uuid(),study_id uuid,study_participant_id text,enrollment_date date,withdrawal_date date,status text);
create function can_read_study_data(uuid) returns boolean language sql as 'select true';
create table whoop_daily(id uuid primary key default gen_random_uuid(),resident_id uuid,study_id uuid,date date,is_nap boolean,
 hrv_rmssd_ms numeric,resting_hr_bpm numeric,spo2_pct numeric,skin_temp_c numeric,recovery_score numeric,user_calibrating boolean,
 total_sleep_min numeric,light_sleep_min numeric,deep_sleep_min numeric,rem_sleep_min numeric,awake_min numeric,
 sleep_efficiency_pct numeric,sleep_consistency_pct numeric,sleep_performance_pct numeric,respiratory_rate numeric,disturbance_count integer,sleep_cycle_count integer,
 sleep_onset_time timestamptz,sleep_end_time timestamptz,sleep_debt_min numeric,sleep_need_baseline_min numeric,sleep_need_strain_min numeric,
 daily_strain numeric,avg_hr_bpm numeric,max_hr_bpm numeric,kilojoules numeric,cycle_id text,sleep_id text,pulled_at timestamptz,
 unique(resident_id,date,is_nap));
\ir ../supabase/migrations/202610030004_whoop_archive.sql
do $$ declare rid uuid; owner1 uuid:=gen_random_uuid(); begin
 insert into burnout_participants(study_id,study_participant_id,enrollment_date,status) values(gen_random_uuid(),'RES-001','2026-05-01','active') returning id into rid;
 assert claim_whoop_sync(owner1); assert not claim_whoop_sync(gen_random_uuid());
 insert into whoop_sync_state(resident_id,kind,window_start,window_end) values(rid,'cycle','2026-05-01','2026-05-29');
 perform save_whoop_page(rid,'cycle','[{"id":1,"updated_at":"2026-05-02T00:00:00Z"}]','page2','2026-05-01','2026-05-29');
 perform save_whoop_page(rid,'cycle','[{"id":1,"updated_at":"2026-05-02T00:00:00Z"}]',null,'2026-05-01','2026-05-29');
 assert(select count(*)=1 from whoop_source_versions);
 assert(select completed_through='2026-05-29' from whoop_sync_state);
 perform merge_whoop_days(rid,'[{"date":"2026-05-02","hrv_rmssd_ms":60}]');
 perform merge_whoop_days(rid,'[{"date":"2026-05-02","hrv_rmssd_ms":null,"total_sleep_min":400}]');
 assert(select hrv_rmssd_ms=60 and total_sleep_min=400 from whoop_daily);
 assert(select count(*)=1 from whoop_daily);
 assert not has_table_privilege('authenticated','whoop_source_records','select');
 assert not has_function_privilege('authenticated','claim_whoop_sync(uuid)','execute');
end $$;
