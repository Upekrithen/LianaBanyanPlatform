CREATE TABLE IF NOT EXISTS substrace_wake_routes (
  wake_id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  origin_peer_id   TEXT NOT NULL,
  target_peer_id   TEXT NOT NULL,
  manifest         JSONB NOT NULL,
  dispatched_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ack_received_at  TIMESTAMPTZ,
  ack_status       TEXT CHECK (ack_status IN ('pending','complete','timeout','failed')) DEFAULT 'pending',
  resolved_items   JSONB
);
CREATE INDEX IF NOT EXISTS swrk_target ON substrace_wake_routes(target_peer_id);
CREATE INDEX IF NOT EXISTS swrk_status ON substrace_wake_routes(ack_status);
CREATE INDEX IF NOT EXISTS swrk_dispatched ON substrace_wake_routes(dispatched_at DESC);
