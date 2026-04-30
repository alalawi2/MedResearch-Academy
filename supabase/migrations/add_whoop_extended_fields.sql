-- Migration: Add 13 new WHOOP variables to whoop_pulls
-- Run this in the Supabase SQL editor

ALTER TABLE whoop_pulls ADD COLUMN IF NOT EXISTS hr_zone0_min numeric(6,1);
ALTER TABLE whoop_pulls ADD COLUMN IF NOT EXISTS avg_awake_time_min numeric(6,1);
ALTER TABLE whoop_pulls ADD COLUMN IF NOT EXISTS avg_no_data_time_min numeric(6,1);
ALTER TABLE whoop_pulls ADD COLUMN IF NOT EXISTS avg_sleep_cycle_count numeric(5,2);
ALTER TABLE whoop_pulls ADD COLUMN IF NOT EXISTS avg_sleep_need_baseline_min numeric(6,1);
ALTER TABLE whoop_pulls ADD COLUMN IF NOT EXISTS avg_sleep_need_from_strain_min numeric(6,1);
ALTER TABLE whoop_pulls ADD COLUMN IF NOT EXISTS avg_sleep_need_from_nap_min numeric(6,1);
ALTER TABLE whoop_pulls ADD COLUMN IF NOT EXISTS avg_sleep_onset_min numeric(6,1);
ALTER TABLE whoop_pulls ADD COLUMN IF NOT EXISTS avg_wake_time_min numeric(6,1);
ALTER TABLE whoop_pulls ADD COLUMN IF NOT EXISTS avg_restorative_sleep_min numeric(6,1);
ALTER TABLE whoop_pulls ADD COLUMN IF NOT EXISTS avg_workout_distance_m numeric(10,1);
ALTER TABLE whoop_pulls ADD COLUMN IF NOT EXISTS top_sport_name text;
ALTER TABLE whoop_pulls ADD COLUMN IF NOT EXISTS any_calibrating boolean;
