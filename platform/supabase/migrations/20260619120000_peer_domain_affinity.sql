-- BP087 MAMBA-γ: peer_domain_affinity table
-- Per-peer domain correctness tracking for Wrasse Quartermaster routing.
-- Updated after each question's verdict lands (via run-plow-on-mesh.mjs).
--
-- Canon: canon_domain_specific_specialist_routing_pheromone_affinity_bp087

CREATE TABLE IF NOT EXISTS peer_domain_affinity (
  peer_id         TEXT        NOT NULL,
  domain          TEXT        NOT NULL,
  correctness_rate NUMERIC(5,4) NOT NULL DEFAULT 0.5
    CHECK (correctness_rate >= 0 AND correctness_rate <= 1),
  sample_count    INTEGER     NOT NULL DEFAULT 0
    CHECK (sample_count >= 0),
  last_updated    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (peer_id, domain)
);

-- RLS: anon key can read (orchestrator needs to read affinity)
ALTER TABLE peer_domain_affinity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_peer_domain_affinity"
  ON peer_domain_affinity FOR SELECT
  USING (true);

CREATE POLICY "service_role_all_peer_domain_affinity"
  ON peer_domain_affinity FOR ALL
  USING (auth.role() = 'service_role');

-- Index for efficient per-domain pool selection
CREATE INDEX IF NOT EXISTS idx_peer_domain_affinity_domain
  ON peer_domain_affinity (domain, correctness_rate DESC);

-- Index for per-peer lookups
CREATE INDEX IF NOT EXISTS idx_peer_domain_affinity_peer
  ON peer_domain_affinity (peer_id);

COMMENT ON TABLE peer_domain_affinity IS
  'MAMBA-γ: per-peer per-domain correctness affinity. '
  'Bootstrapped at 0.5 (uniform). Diverges with empirical correctness per run. '
  'Consumed by Wrasse Quartermaster for domain-affinity routing.';
