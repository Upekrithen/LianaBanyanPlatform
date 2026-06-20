-- 20260619000001_bp087_substrate_market_entity_membership_extend.sql
-- MAMBA-SM-alpha: entity_memberships EXTEND + member_business_profile CREATE
-- Knight ships. Bishop applies via psql. DO NOT apply automatically.

-- EXTEND entity_memberships (K427 table -- ADD COLUMN ONLY, no breaking changes)
ALTER TABLE entity_memberships
  ADD COLUMN IF NOT EXISTS node_type TEXT
    CHECK (node_type IN ('food','goods','services','knowledge','gaming','other')),
  ADD COLUMN IF NOT EXISTS service_area_geojson JSONB,
  ADD COLUMN IF NOT EXISTS live_since TIMESTAMPTZ;

-- Extend status CHECK to include 'live' (safe: additive only)
-- Note: PostgreSQL requires DROP CONSTRAINT + ADD CONSTRAINT for CHECK constraints
-- The original constraint name must be found first -- use IF EXISTS pattern
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname LIKE '%entity_memberships%status%'
      AND contype = 'c'
  ) THEN
    EXECUTE (
      SELECT 'ALTER TABLE entity_memberships DROP CONSTRAINT ' || conname
      FROM pg_constraint
      WHERE conname LIKE '%entity_memberships%status%'
        AND contype = 'c'
      LIMIT 1
    );
  END IF;
END $$;
ALTER TABLE entity_memberships
  ADD CONSTRAINT entity_memberships_status_check
    CHECK (status IN ('pending','active','live','suspended','cancelled','pledged_commons'));

CREATE INDEX IF NOT EXISTS idx_entity_memberships_node_type_live
  ON entity_memberships(node_type, status) WHERE status = 'live';

-- RLS: anon SELECT WHERE status = 'live'
CREATE POLICY IF NOT EXISTS "anon_read_live_entities" ON entity_memberships
  FOR SELECT USING (status = 'live');

-- CREATE member_business_profile
CREATE TABLE IF NOT EXISTS member_business_profile (
  entity_id                  UUID PRIMARY KEY REFERENCES entity_memberships(id) ON DELETE CASCADE,
  pitch_md                   TEXT,
  offerings_count            INT NOT NULL DEFAULT 0,
  cost_plus_20_floor_price   NUMERIC(10,2),
  accepts_marks              BOOLEAN NOT NULL DEFAULT TRUE,
  accepts_credits            BOOLEAN NOT NULL DEFAULT TRUE,
  service_area_polygon       TEXT, -- stored as WKT for portability; cast to GEOMETRY if PostGIS available
  stripe_connect_account_id  TEXT,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE member_business_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_live_business" ON member_business_profile
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM entity_memberships e
      WHERE e.id = entity_id AND e.status = 'live'
    )
  );

CREATE POLICY "service_role_full_business" ON member_business_profile
  FOR ALL USING (auth.role() = 'service_role');

-- Seed pilot entity
INSERT INTO entity_memberships (
  entity_name, entity_type, node_type, status, live_since,
  primary_contact_name, primary_contact_email, tier_price_usd
) VALUES (
  'Pilot Kitchen #1', 'small_business', 'food', 'live', NOW(),
  'Cooperative Pilot', 'pilot@lianabanyan.com', 0
) ON CONFLICT DO NOTHING;
