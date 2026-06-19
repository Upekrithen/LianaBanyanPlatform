-- BP087 MAMBA-β7: peer_eblet_sync_manifest table
-- Tracks which eblet subsets are synced to which peers (domain-affinity selective).
-- Peers do NOT receive all 130+ eblets — only the subset relevant to their assigned domains.
--
-- Sync discipline: at fleet_warmup, M0 broadcasts eblet_sync with peer_id + domain_subset.
-- Each peer SELECTs only its assigned domain rows from the eblets table.
--
-- Canon: canon_substrate_primitives_mesh_wiring_8_primitives_distributed_bp087

CREATE TABLE IF NOT EXISTS peer_eblet_sync_manifest (
  peer_id          TEXT        NOT NULL,
  domain           TEXT        NOT NULL,
  last_sync_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  eblet_count      INTEGER     NOT NULL DEFAULT 0,
  sync_session_id  TEXT,
  PRIMARY KEY (peer_id, domain)
);

ALTER TABLE peer_eblet_sync_manifest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_peer_eblet_sync_manifest"
  ON peer_eblet_sync_manifest FOR SELECT
  USING (true);

CREATE POLICY "service_role_all_peer_eblet_sync_manifest"
  ON peer_eblet_sync_manifest FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE peer_eblet_sync_manifest IS
  'MAMBA-β7: per-peer per-domain eblet sync manifest. '
  'M0 populates at fleet_warmup via eblet_sync MIC broadcast. '
  'Each peer syncs only domains assigned by Wrasse Quartermaster affinity. '
  'eblet_count tracks how many eblets were current at last sync.';
