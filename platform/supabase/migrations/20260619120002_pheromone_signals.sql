-- BP087 MAMBA-β1: pheromone_signals table
-- Pheromone trails computed on M0 and broadcast to peers via MIC pheromone_sync.
-- Each peer applies received pheromone weighting to its local eblet ranking.
--
-- Schema: peer-id-attributed, salience-weighted, expires per TTL.
-- Canon: canon_substrate_primitives_mesh_wiring_8_primitives_distributed_bp087

CREATE TABLE IF NOT EXISTS pheromone_signals (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  source_peer_id  TEXT        NOT NULL,
  domain          TEXT        NOT NULL,
  signal_key      TEXT        NOT NULL,           -- e.g. eblet_id or question SHA
  salience        NUMERIC(5,4) NOT NULL DEFAULT 0.5
    CHECK (salience >= 0 AND salience <= 1),
  signal_type     TEXT        NOT NULL DEFAULT 'eblet_rank'
    CHECK (signal_type IN ('eblet_rank', 'domain_weight', 'andon_skip', 'star_chamber_flag')),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload_json    JSONB
);

-- RLS: peers can read pheromones; only service role writes
ALTER TABLE pheromone_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_pheromone_signals"
  ON pheromone_signals FOR SELECT
  USING (expires_at > NOW());

CREATE POLICY "service_role_all_pheromone_signals"
  ON pheromone_signals FOR ALL
  USING (auth.role() = 'service_role');

-- Efficient lookups by domain + expiry
CREATE INDEX IF NOT EXISTS idx_pheromone_signals_domain
  ON pheromone_signals (domain, expires_at DESC);

CREATE INDEX IF NOT EXISTS idx_pheromone_signals_key
  ON pheromone_signals (signal_key, domain);

-- Auto-cleanup expired signals
CREATE INDEX IF NOT EXISTS idx_pheromone_signals_expires
  ON pheromone_signals (expires_at);

COMMENT ON TABLE pheromone_signals IS
  'MAMBA-β1: mesh-shared pheromone signals. '
  'M0 computes pheromone weights and broadcasts to peers via MIC pheromone_sync. '
  'Each peer applies salience weighting to local eblet ranking. '
  'Expires per TTL (default 24h per pheromone TTL canon).';
