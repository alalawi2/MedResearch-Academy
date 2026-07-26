-- Fix: allow multiple block assessments on same day (late submissions)
-- Old: UNIQUE (resident_id, assessment_date) — blocked submitting multiple missed blocks on same day
-- New: UNIQUE (resident_id, block_number) — one assessment per block per resident
ALTER TABLE block_assessments DROP CONSTRAINT IF EXISTS block_assessments_resident_id_assessment_date_key;
ALTER TABLE block_assessments ADD CONSTRAINT block_assessments_resident_id_block_number_key UNIQUE (resident_id, block_number);
