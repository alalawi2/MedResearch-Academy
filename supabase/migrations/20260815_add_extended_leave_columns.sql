-- Add extended leave columns to block_assessments
ALTER TABLE block_assessments ADD COLUMN IF NOT EXISTS on_extended_leave boolean DEFAULT false;
ALTER TABLE block_assessments ADD COLUMN IF NOT EXISTS extended_leave_type text;
ALTER TABLE block_assessments ADD COLUMN IF NOT EXISTS extended_leave_end_block integer;
ALTER TABLE block_assessments ADD COLUMN IF NOT EXISTS maternity_expected boolean DEFAULT false;
ALTER TABLE block_assessments ADD COLUMN IF NOT EXISTS maternity_start_block integer;
ALTER TABLE block_assessments ADD COLUMN IF NOT EXISTS maternity_end_block integer;
ALTER TABLE block_assessments ADD COLUMN IF NOT EXISTS maternity_due_date date;
