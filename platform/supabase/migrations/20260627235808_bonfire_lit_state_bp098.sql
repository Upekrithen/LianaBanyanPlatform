-- BP098 Bonfire Lit Scribe — active peer mesh sync state
-- Tracks per-peer context sync status for each context_type.
-- One row per (peer_id, context_type) — upserted on each sync attempt.

CREATE TABLE IF NOT EXISTS bonfire_lit_state (
  id               BIGSERIAL PRIMARY KEY,
  peer_id          TEXT        NOT NULL,
  context_type     TEXT        NOT NULL,  -- 'priming' | 'routes' | 'config' | 'mcp'
  last_sync_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sync_fingerprint TEXT,                  -- SHA-256 of the synced payload
  sync_status      TEXT        NOT NULL DEFAULT 'pending',  -- 'ok'|'pending'|'error'|'skipped'
  error_detail     TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enforce uniqueness: one state row per peer+context combination
CREATE UNIQUE INDEX IF NOT EXISTS bonfire_lit_state_peer_context_idx
  ON bonfire_lit_state (peer_id, context_type);

-- Fast lookup by peer
CREATE INDEX IF NOT EXISTS idx_bonfire_lit_state_peer_id
  ON bonfire_lit_state (peer_id);

-- Fast lookup by status for recovery runner
CREATE INDEX IF NOT EXISTS idx_bonfire_lit_state_sync_status
  ON bonfire_lit_state (sync_status) WHERE sync_status != 'ok';

-- RLS: service_role writes; anon/authenticated reads own peer rows
ALTER TABLE bonfire_lit_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bonfire_lit_state_service_write" ON bonfire_lit_state
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "bonfire_lit_state_peer_read" ON bonfire_lit_state
  FOR SELECT USING (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_bonfire_lit_state_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bonfire_lit_state_updated_at ON bonfire_lit_state;
CREATE TRIGGER trg_bonfire_lit_state_updated_at
  BEFORE UPDATE ON bonfire_lit_state
  FOR EACH ROW EXECUTE FUNCTION update_bonfire_lit_state_updated_at();

COMMENT ON TABLE bonfire_lit_state IS
  'BP098: Bonfire Lit Scribe per-peer context sync tracking. '
  'Excludes phantom peer 49f3e597. Managed by recovery_runner.ts.';
