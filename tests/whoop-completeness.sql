\set ON_ERROR_STOP on
\ir whoop-archive.sql
\ir ../supabase/migrations/202610260001_whoop_completeness.sql
do $$ declare rid uuid;begin
 select id into strict rid from burnout_participants;
 update whoop_sync_state set completed_through='2026-05-10';
 assert(select completed_through='2026-05-29' from whoop_sync_state);
 perform save_whoop_summaries(rid,'[{"date":"2026-05-02","metrics":{"all_sleep_min":450},"quality":{"counts_are_observed":true},"source_ids":["sleep:1"]}]');
 perform save_whoop_summaries(rid,'[{"date":"2026-05-02","metrics":{"all_sleep_min":450},"quality":{"counts_are_observed":true},"source_ids":["sleep:1"]}]');
 assert(select count(*)=1 from whoop_daily_summary_versions);
 perform save_whoop_summaries(rid,'[{"date":"2026-05-02","metrics":{"all_sleep_min":440},"quality":{},"source_ids":["sleep:1"]}]');
 assert(select count(*)=2 from whoop_daily_summary_versions);
 assert(select count(*)=1 from whoop_daily_summaries);
 assert(select metrics->>'all_sleep_min'='440' from whoop_daily_summaries);
 assert(select hrv_rmssd_ms=60 from whoop_daily_legacy_20261026);
 assert not has_table_privilege('anon','whoop_body_snapshots','select');
 assert not has_table_privilege('authenticated','whoop_daily_summary_versions','select');
 assert not has_function_privilege('authenticated','save_whoop_summaries(uuid,jsonb)','execute');
end $$;
