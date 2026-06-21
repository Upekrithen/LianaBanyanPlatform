-- pearl_share RLS policies
-- BP087 Wave 3 - Knight ships - Bishop applies via psql
-- AMBER NOTE: pearl_share has no 'status' column (columns: pearl_id, soccerball_sid,
--   payload_b64, authored_at, last_synced_at, origin_peer_id). The anon SELECT policy
--   below references status = 'live' which will error unless Bishop adds that column
--   first OR replaces this policy body with an appropriate filter (e.g. true, or a
--   date/origin filter). Bishop must confirm before applying.
-- AMBER NOTE: No auth.uid()-mapped owner column exists. Authenticated-user SELECT
--   policy omitted (not applicable). Identity column is origin_peer_id (TEXT, not UUID).

ALTER TABLE pearl_share ENABLE ROW LEVEL SECURITY;

-- anon can SELECT all rows (pearl_share is mesh-shared substrate - every peer reads all pearls)
-- D1 RESOLUTION BP087: status='live' was a copy-paste error from entity_memberships pattern.
-- pearl_share has no status column. Correct filter is USING (true) - open mesh read.
-- Founder decision BP087 SEG-CCC: "mesh-shared substrate intended for read by any peer"
CREATE POLICY "pearl_share_anon_select_live"
  ON pearl_share
  FOR SELECT
  TO anon
  USING (true);

-- anon can INSERT (new pearl shares submitted by unauthenticated members)
CREATE POLICY "pearl_share_anon_insert"
  ON pearl_share
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- service_role bypasses RLS (bypass is default in Supabase; no explicit policy needed)
-- If pearl_share has an owner column (auth.uid()), add authenticated SELECT here.
-- Check the CREATE TABLE migration and add if applicable.
