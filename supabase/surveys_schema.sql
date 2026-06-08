-- ══════════════════════════════════════════════════════════════
-- SURVEYS MODULE — MedResearch Academy
-- Run this migration against your Supabase project
-- ══════════════════════════════════════════════════════════════

-- 1. Surveys table
CREATE TABLE IF NOT EXISTS surveys (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en      text NOT NULL,
  title_ar      text,
  description_en text,
  description_ar text,
  researcher_name text NOT NULL,
  researcher_email text NOT NULL,
  institution   text,
  status        text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','closed')),
  language      text NOT NULL DEFAULT 'both' CHECK (language IN ('en','ar','both')),
  estimated_minutes integer DEFAULT 10,
  ethics_approved boolean DEFAULT false,
  ethics_reference text,
  response_count integer DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

-- 2. Survey sections
CREATE TABLE IF NOT EXISTS survey_sections (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id     uuid NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  title_en      text NOT NULL,
  title_ar      text,
  description_en text,
  description_ar text,
  order_num     integer NOT NULL DEFAULT 0
);

CREATE INDEX idx_survey_sections_survey ON survey_sections(survey_id);

-- 3. Survey questions
CREATE TABLE IF NOT EXISTS survey_questions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id    uuid NOT NULL REFERENCES survey_sections(id) ON DELETE CASCADE,
  survey_id     uuid NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  question_en   text NOT NULL,
  question_ar   text,
  type          text NOT NULL CHECK (type IN ('radio','checkbox','likert','text','number','dropdown')),
  options_en    jsonb DEFAULT '[]'::jsonb,
  options_ar    jsonb DEFAULT '[]'::jsonb,
  required      boolean DEFAULT true,
  order_num     integer NOT NULL DEFAULT 0,
  skip_logic    jsonb
);

CREATE INDEX idx_survey_questions_section ON survey_questions(section_id);
CREATE INDEX idx_survey_questions_survey  ON survey_questions(survey_id);

-- 4. Survey responses
CREATE TABLE IF NOT EXISTS survey_responses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id     uuid NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  respondent_id uuid NOT NULL DEFAULT gen_random_uuid(),
  answers       jsonb NOT NULL DEFAULT '{}'::jsonb,
  language_used text DEFAULT 'en',
  ip_country    text,
  completed     boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_survey_responses_survey ON survey_responses(survey_id);

-- 5. Trigger to keep response_count in sync
CREATE OR REPLACE FUNCTION update_survey_response_count()
RETURNS trigger AS $$
BEGIN
  UPDATE surveys
  SET response_count = (
    SELECT count(*) FROM survey_responses
    WHERE survey_id = COALESCE(NEW.survey_id, OLD.survey_id)
      AND completed = true
  )
  WHERE id = COALESCE(NEW.survey_id, OLD.survey_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_survey_response_count
AFTER INSERT OR UPDATE OR DELETE ON survey_responses
FOR EACH ROW EXECUTE FUNCTION update_survey_response_count();

-- 6. RLS policies
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Public can read active surveys
CREATE POLICY "Public read active surveys"
  ON surveys FOR SELECT
  USING (status = 'active');

-- Public can read sections/questions of active surveys
CREATE POLICY "Public read survey sections"
  ON survey_sections FOR SELECT
  USING (EXISTS (SELECT 1 FROM surveys WHERE id = survey_id AND status = 'active'));

CREATE POLICY "Public read survey questions"
  ON survey_questions FOR SELECT
  USING (EXISTS (SELECT 1 FROM surveys WHERE id = survey_id AND status = 'active'));

-- Anyone can insert responses
CREATE POLICY "Public insert responses"
  ON survey_responses FOR INSERT
  WITH CHECK (true);

-- Anyone can insert surveys (submit for review)
CREATE POLICY "Public insert surveys"
  ON surveys FOR INSERT
  WITH CHECK (status = 'draft');

-- Anyone can insert sections/questions for draft surveys
CREATE POLICY "Public insert sections"
  ON survey_sections FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM surveys WHERE id = survey_id AND status = 'draft'));

CREATE POLICY "Public insert questions"
  ON survey_questions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM surveys WHERE id = survey_id AND status = 'draft'));
