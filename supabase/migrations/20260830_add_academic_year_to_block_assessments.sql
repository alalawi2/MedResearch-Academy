-- Add academic_year to block_assessments for multi-year study support
-- AY 2025-2026 = Sep 2025 through Aug 2026 (Blocks 10-13 collected so far)
-- AY 2026-2027 = Sep 2026 through Aug 2027 (starting Block 1 on Sep 1)

-- 1. Add column (nullable first for backfill)
ALTER TABLE block_assessments ADD COLUMN IF NOT EXISTS academic_year text;

-- 2. Backfill all existing rows — all current data is from AY 2025-2026
UPDATE block_assessments SET academic_year = '2025-2026' WHERE academic_year IS NULL;

-- 3. Make it NOT NULL (no default — frontend must always provide academic_year)
ALTER TABLE block_assessments ALTER COLUMN academic_year SET NOT NULL;

-- 4. Update unique constraint: (resident_id, block_number) → (resident_id, block_number, academic_year)
ALTER TABLE block_assessments DROP CONSTRAINT IF EXISTS block_assessments_resident_id_block_number_key;
ALTER TABLE block_assessments ADD CONSTRAINT block_assessments_resident_block_year_key
  UNIQUE (resident_id, block_number, academic_year);
