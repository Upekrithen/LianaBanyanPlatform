-- BP085: membership_activation_tokens
-- One-time tokens for MnemosyneC app membership return flow.
-- Token plaintext is NEVER stored — only SHA-256 hash is persisted.

CREATE TABLE IF NOT EXISTS membership_activation_tokens (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   UUID        NOT NULL REFERENCES member_profiles(id) ON DELETE CASCADE,
  token_hash  TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  UNIQUE (token_hash)
);

CREATE INDEX IF NOT EXISTS idx_mat_member_id   ON membership_activation_tokens(member_id);
CREATE INDEX IF NOT EXISTS idx_mat_token_hash  ON membership_activation_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_mat_expires_at  ON membership_activation_tokens(expires_at);

-- RLS: service role only (called from Edge Function with service key)
ALTER TABLE membership_activation_tokens ENABLE ROW LEVEL SECURITY;
-- No direct user-facing RLS policies — Edge Function uses service_role key
