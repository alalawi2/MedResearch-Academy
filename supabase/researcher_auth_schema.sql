-- Researcher Access Codes table
-- Used for OTP-style authentication for the Researcher Portal

CREATE TABLE IF NOT EXISTS researcher_access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '15 minutes'),
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_researcher_codes_email ON researcher_access_codes(email);

ALTER TABLE researcher_access_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert codes" ON researcher_access_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read own codes" ON researcher_access_codes FOR SELECT USING (true);
CREATE POLICY "Anyone can update codes" ON researcher_access_codes FOR UPDATE USING (true);
