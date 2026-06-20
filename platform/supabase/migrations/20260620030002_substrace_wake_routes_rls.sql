-- substrace_wake_routes RLS policies
-- BP087 Wave 3 - Knight ships - Bishop applies via psql
-- Identity column confirmed: origin_peer_id (TEXT NOT NULL) -- peer_id placeholder
--   replaced with origin_peer_id per Knight inspection of 20260619120006 migration.
-- Table also has target_peer_id (TEXT NOT NULL) for inbound-route filtering if needed.

ALTER TABLE substrace_wake_routes ENABLE ROW LEVEL SECURITY;

-- service_role full access
CREATE POLICY "substrace_wake_routes_service_role_all"
  ON substrace_wake_routes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- anon SELECT own routes by origin_peer_id header
CREATE POLICY "substrace_wake_routes_anon_select_own"
  ON substrace_wake_routes
  FOR SELECT
  TO anon
  USING (origin_peer_id = current_setting('request.headers', true)::json->>'x-peer-id');
