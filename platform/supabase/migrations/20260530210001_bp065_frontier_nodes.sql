-- BP065 · Tier-2 Onboarding · Part B (SEG-A2b)
-- frontier_nodes: public cooperative mesh registry — active nodes readable by all authenticated members
-- REQUIRES: mnemosyne_device_links (migration 20260530210000) MUST be applied first
-- RLS enabled + policies in same migration (§4 discipline)
-- Public cooperative mesh: active (non-withdrawn) nodes visible to all authenticated members
-- Authored: 2026-05-30T21:30:00Z · Knight BP065

SET search_path = public, pg_catalog;

CREATE TABLE IF NOT EXISTS frontier_nodes (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  peer_id            text NOT NULL,
  node_label         text,
  app_version        text,
  transport_hint     text,
  relay_peer_id      text,
  registered_at      timestamptz NOT NULL DEFAULT now(),
  last_heartbeat_at  timestamptz NOT NULL DEFAULT now(),
  withdrawn_at       timestamptz,
  UNIQUE(user_id, peer_id)
);

-- RLS
ALTER TABLE frontier_nodes ENABLE ROW LEVEL SECURITY;

-- PUBLIC COOPERATIVE MESH (Founder decision BP065):
-- All authenticated members can read active (non-withdrawn) nodes.
-- Own user can also read their own withdrawn nodes.
CREATE POLICY "frontier_nodes_public_mesh_read"
  ON frontier_nodes
  FOR SELECT
  USING (user_id = auth.uid() OR withdrawn_at IS NULL);

-- Own-row insert
CREATE POLICY "frontier_nodes_own_insert"
  ON frontier_nodes
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Own-row update (heartbeat + withdraw)
CREATE POLICY "frontier_nodes_own_update"
  ON frontier_nodes
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Index for fast user lookups and public mesh reads
CREATE INDEX IF NOT EXISTS frontier_nodes_user_id_idx
  ON frontier_nodes(user_id);

CREATE INDEX IF NOT EXISTS frontier_nodes_withdrawn_at_idx
  ON frontier_nodes(withdrawn_at)
  WHERE withdrawn_at IS NULL;

COMMENT ON TABLE frontier_nodes IS
  'BP065 Tier-2 · Public cooperative mesh registry. Active (non-withdrawn) nodes are visible to all authenticated members (Founder decision: public cooperative mesh). Gated on mnemosyne_device_links prerequisite (enforced at edge fn level).';
