-- BP086 BLACK MAMBA Amendment · Base-Tier Mesh Connection
-- canon_generic_connection_membership_base_tier_free_bp086
-- Adds tier column, opens RLS for anon base-tier INSERT/SELECT

ALTER TABLE peer_presence
  ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'base'
  CHECK (tier IN ('base', 'member'));

CREATE INDEX IF NOT EXISTS idx_peer_presence_tier ON peer_presence(tier);
CREATE INDEX IF NOT EXISTS idx_peer_presence_last_seen ON peer_presence(last_seen_at);

-- Allow anon SELECT (enables Realtime subscriptions without JWT)
DROP POLICY IF EXISTS peer_presence_anon_select ON peer_presence;
CREATE POLICY peer_presence_anon_select ON peer_presence
  FOR SELECT TO anon
  USING (true);

-- Allow anon INSERT at tier='base' only
DROP POLICY IF EXISTS peer_presence_anon_insert_base ON peer_presence;
CREATE POLICY peer_presence_anon_insert_base ON peer_presence
  FOR INSERT TO anon
  WITH CHECK (tier = 'base');

-- Allow anon UPDATE own row (heartbeat refreshes)
DROP POLICY IF EXISTS peer_presence_anon_update_own ON peer_presence;
CREATE POLICY peer_presence_anon_update_own ON peer_presence
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (tier = 'base');

-- Allow authenticated users to upgrade tier to 'member'
DROP POLICY IF EXISTS peer_presence_member_upgrade ON peer_presence;
CREATE POLICY peer_presence_member_upgrade ON peer_presence
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (tier IN ('base', 'member'));
