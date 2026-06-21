-- entity_memberships anon SELECT for food/live nodes (Companies Joining In page)
-- BP087 Wave 3 SEG-F1 - Knight ships - Bishop applies via psql
--
-- TABLE NAME NOTE: The actual table is entity_memberships (plural), not entity_membership.
-- The Yoke prompt used the singular form; corrected here per the actual migration.
-- Migration 20260422100001_k427_entity_membership.sql creates entity_memberships (plural).
-- Migration 20260619000001_bp087_substrate_market_entity_membership_extend.sql already
-- added: CREATE POLICY IF NOT EXISTS "anon_read_live_entities" ON entity_memberships FOR SELECT
--   USING (status = 'live');
-- That existing policy already covers anon reads for all live entities.
-- This policy adds a named, scoped policy specifically for food+live (Companies Joining In).
-- Both policies coexist; Postgres takes the permissive union.
--
-- First check if RLS is already enabled before running:
-- SELECT relrowsecurity FROM pg_class WHERE relname = 'entity_memberships';

ALTER TABLE entity_memberships ENABLE ROW LEVEL SECURITY;

-- anon can SELECT live food nodes (for Companies Joining In page)
CREATE POLICY "entity_memberships_anon_select_food_live"
  ON entity_memberships
  FOR SELECT
  TO anon
  USING (entity_type = 'food' AND status = 'live');
