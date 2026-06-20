CREATE TABLE IF NOT EXISTS pearl_share (
  pearl_id       TEXT PRIMARY KEY,
  soccerball_sid TEXT NOT NULL,
  payload_b64    TEXT NOT NULL,
  authored_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  origin_peer_id TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS pearl_share_origin ON pearl_share(origin_peer_id);
CREATE INDEX IF NOT EXISTS pearl_share_synced ON pearl_share(last_synced_at DESC);
