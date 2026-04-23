-- ============================================================================
-- K353: Neighborhood System — Member-Customizable Local Sections
-- Enables "my corner of the Galactic Empire" — local marketplace sections
-- customized by members, governed by Harper Guild + Star Chamber
-- ============================================================================

-- =====================
-- PART A: neighborhoods table
-- =====================
CREATE TABLE IF NOT EXISTS neighborhoods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  region TEXT,

  -- Ownership
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  owner_type TEXT DEFAULT 'member' CHECK (owner_type IN ('member', 'guild', 'tribe', 'cooperative')),

  -- Customization
  template TEXT DEFAULT 'main-street' CHECK (template IN ('main-street', 'art-district', 'food-court', 'tech-hub', 'market-square')),
  theme_config JSONB DEFAULT '{}'::jsonb,
  hero_image_url TEXT,
  description TEXT,
  custom_css TEXT,

  -- Governance
  harper_score NUMERIC(4,2) DEFAULT 0,
  star_chamber_compliant BOOLEAN DEFAULT true,
  governance_charter TEXT,

  -- Content
  featured_storefronts UUID[],
  welcome_message TEXT,

  -- Platform compliance (immutable floor)
  cost_plus_margin NUMERIC DEFAULT 20 CHECK (cost_plus_margin >= 20),
  creator_keeps_pct NUMERIC DEFAULT 83.3,

  -- Stats (denormalized for browse performance)
  storefront_count INTEGER DEFAULT 0,
  visitor_count INTEGER DEFAULT 0,
  rating_avg NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'suspended', 'archived'))
);

CREATE INDEX IF NOT EXISTS idx_neighborhoods_city ON neighborhoods (city);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_owner ON neighborhoods (owner_id);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_status ON neighborhoods (status);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_region ON neighborhoods (region);

ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;

-- Everyone can read active neighborhoods
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'neighborhoods_public_read' AND tablename = 'neighborhoods') THEN
    CREATE POLICY neighborhoods_public_read ON neighborhoods
      FOR SELECT USING (status = 'active');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'neighborhoods_owner_all' AND tablename = 'neighborhoods') THEN
    CREATE POLICY neighborhoods_owner_all ON neighborhoods
      FOR ALL USING (owner_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'neighborhoods_draft_owner_read' AND tablename = 'neighborhoods') THEN
    CREATE POLICY neighborhoods_draft_owner_read ON neighborhoods
      FOR SELECT USING (status = 'draft' AND owner_id = auth.uid());
  END IF;
END $$;


-- =====================
-- PART B: neighborhood_storefronts junction table
-- =====================
CREATE TABLE IF NOT EXISTS neighborhood_storefronts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
  storefront_id UUID NOT NULL REFERENCES storefronts(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (neighborhood_id, storefront_id)
);

ALTER TABLE neighborhood_storefronts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ns_public_read' AND tablename = 'neighborhood_storefronts') THEN
    CREATE POLICY ns_public_read ON neighborhood_storefronts
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ns_owner_manage' AND tablename = 'neighborhood_storefronts') THEN
    CREATE POLICY ns_owner_manage ON neighborhood_storefronts
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM neighborhoods n
          WHERE n.id = neighborhood_storefronts.neighborhood_id
            AND n.owner_id = auth.uid()
        )
      );
  END IF;
END $$;


-- =====================
-- PART C: neighborhood_ratings table
-- =====================
CREATE TABLE IF NOT EXISTS neighborhood_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (neighborhood_id, user_id)
);

ALTER TABLE neighborhood_ratings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'nr_public_read' AND tablename = 'neighborhood_ratings') THEN
    CREATE POLICY nr_public_read ON neighborhood_ratings
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'nr_user_manage' AND tablename = 'neighborhood_ratings') THEN
    CREATE POLICY nr_user_manage ON neighborhood_ratings
      FOR ALL USING (user_id = auth.uid());
  END IF;
END $$;


-- =====================
-- PART D: Seed a demonstration neighborhood
-- =====================
DO $$
DECLARE seed_uid uuid;
BEGIN
  SELECT id INTO seed_uid FROM auth.users LIMIT 1;
  IF seed_uid IS NULL THEN RETURN; END IF;

  INSERT INTO neighborhoods (slug, name, city, state, region, owner_id, owner_type, template, description, welcome_message, status)
  VALUES (
    'san-antonio-makers-row',
    'San Antonio Makers Row',
    'San Antonio',
    'TX',
    'Southwest',
    seed_uid,
    'member',
    'market-square',
    'The heart of San Antonio''s maker community. Local artisans, 3D printers, leather workers, and food creators — all under one roof with Cost+20% pricing.',
    'Welcome to Makers Row! Every storefront here is locally owned and operated. Browse, order, and support your neighbors.',
    'active'
  )
  ON CONFLICT (slug) DO NOTHING;
END $$;
