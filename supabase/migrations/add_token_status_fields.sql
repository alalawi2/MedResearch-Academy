-- Add token health tracking fields to whoop_tokens
-- Tracks consecutive failures to detect revoked/deauthorized tokens
ALTER TABLE whoop_tokens
  ADD COLUMN IF NOT EXISTS token_status text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS consecutive_failures integer DEFAULT 0;

COMMENT ON COLUMN whoop_tokens.token_status IS 'active | revoked — set to revoked after 3 consecutive refresh failures';
COMMENT ON COLUMN whoop_tokens.consecutive_failures IS 'Number of consecutive token refresh failures. Reset to 0 on success.';
