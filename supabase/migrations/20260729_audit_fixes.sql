-- Audit fixes — July 29, 2026

-- Fix 1: Expand reminder level constraint (was 1-5, missed_block uses level 10)
ALTER TABLE questionnaire_reminders DROP CONSTRAINT IF EXISTS questionnaire_reminders_level_check;
ALTER TABLE questionnaire_reminders ADD CONSTRAINT questionnaire_reminders_level_check CHECK (level >= 0 AND level <= 20);

-- Fix 2: Correct enrollment_date to match first WHOOP OAuth event
UPDATE burnout_participants bp
SET enrollment_date = sub.first_oauth::date
FROM (
  SELECT resident_id, MIN(created_at) as first_oauth
  FROM enrollment_events
  WHERE event_type = 'whoop_oauth_linked'
  GROUP BY resident_id
) sub
WHERE bp.id = sub.resident_id
  AND bp.status = 'active'
  AND bp.enrollment_date != sub.first_oauth::date;

-- Fix 4: Backfill missing ISI secondary records from block_assessments
INSERT INTO isi_responses (study_id, resident_id, response_date, items, total_score, severity, created_at)
SELECT ba.study_id, ba.resident_id, ba.assessment_date, ba.isi_items, ba.isi_total,
  CASE
    WHEN ba.isi_total <= 7 THEN 'none'
    WHEN ba.isi_total <= 14 THEN 'subthreshold_insomnia'
    WHEN ba.isi_total <= 21 THEN 'moderate_insomnia'
    ELSE 'severe_insomnia'
  END, ba.created_at
FROM block_assessments ba
WHERE ba.isi_total IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM isi_responses ir
    WHERE ir.resident_id = ba.resident_id AND ir.response_date = ba.assessment_date
  )
ON CONFLICT DO NOTHING;
