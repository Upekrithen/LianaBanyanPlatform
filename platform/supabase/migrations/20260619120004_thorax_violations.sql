-- MAMBA-beta3: Thorax PKI violation log table
-- BP087 -- Ship only; Bishop applies via psql.

CREATE TABLE IF NOT EXISTS thorax_violations (
  id              BIGSERIAL PRIMARY KEY,
  peer_id         TEXT NOT NULL,
  frame_hex_prefix TEXT NOT NULL,
  violation_type  TEXT NOT NULL DEFAULT 'invalid_signature',
  detected_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS thorax_violations_peer ON thorax_violations(peer_id);
CREATE INDEX IF NOT EXISTS thorax_violations_detected ON thorax_violations(detected_at DESC);
