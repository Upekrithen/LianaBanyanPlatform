-- K107: Product Catalog, Makers, Production Orders
-- Uses catalog_products (not products) to avoid conflict with existing project-based products table

CREATE TABLE IF NOT EXISTS catalog_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id),
  storefront_id UUID REFERENCES storefronts(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  long_description TEXT,
  category TEXT NOT NULL CHECK (category IN ('terrain','hinge','miniature','accessory','tool','game','furniture','art','craft','digital','service','other')),
  price_cents INTEGER NOT NULL,
  cost_cents INTEGER,
  currency TEXT DEFAULT 'USD',
  images JSONB DEFAULT '[]',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','active','funded','producing','shipping','archived')),
  crowdfund_goal_cents INTEGER,
  crowdfund_raised_cents INTEGER DEFAULT 0,
  crowdfund_backer_count INTEGER DEFAULT 0,
  crowdfund_deadline TIMESTAMPTZ,
  maker_id UUID,
  production_status TEXT CHECK (production_status IN ('design','prototype','testing','production_ready','in_production','fulfilled')),
  stl_file_count INTEGER DEFAULT 0,
  is_hexisle BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS catalog_product_backers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES catalog_products(id),
  backer_id UUID NOT NULL REFERENCES auth.users(id),
  amount_cents INTEGER NOT NULL,
  tier TEXT,
  status TEXT DEFAULT 'pledged' CHECK (status IN ('pledged','charged','fulfilled','refunded')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS makers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  business_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  capabilities JSONB DEFAULT '[]',
  equipment JSONB DEFAULT '[]',
  location_city TEXT,
  location_state TEXT,
  location_country TEXT DEFAULT 'US',
  capacity_weekly INTEGER,
  rating NUMERIC(3,2) DEFAULT 0,
  completed_orders INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_accepting_orders BOOLEAN DEFAULT true,
  portfolio_images JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS production_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES catalog_products(id),
  maker_id UUID NOT NULL REFERENCES makers(id),
  quantity INTEGER NOT NULL,
  unit_cost_cents INTEGER NOT NULL,
  total_cost_cents INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','printing','quality_check','shipped','delivered','disputed')),
  due_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE catalog_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_product_backers ENABLE ROW LEVEL SECURITY;
ALTER TABLE makers ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Catalog products visible to all" ON catalog_products FOR SELECT USING (status != 'draft' OR creator_id = auth.uid());
CREATE POLICY "Creators manage own catalog products" ON catalog_products FOR ALL USING (creator_id = auth.uid());
CREATE POLICY "Backers see own pledges" ON catalog_product_backers FOR SELECT USING (backer_id = auth.uid());
CREATE POLICY "Anyone can back" ON catalog_product_backers FOR INSERT WITH CHECK (auth.uid() = backer_id);
CREATE POLICY "Makers visible to all" ON makers FOR SELECT USING (true);
CREATE POLICY "Makers manage own" ON makers FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Production orders visible to parties" ON production_orders FOR SELECT USING (
  maker_id IN (SELECT id FROM makers WHERE user_id = auth.uid()) OR
  product_id IN (SELECT id FROM catalog_products WHERE creator_id = auth.uid())
);
CREATE POLICY "Parties manage production orders" ON production_orders FOR ALL USING (
  maker_id IN (SELECT id FROM makers WHERE user_id = auth.uid()) OR
  product_id IN (SELECT id FROM catalog_products WHERE creator_id = auth.uid())
);

-- FK from catalog_products.maker_id now that makers table exists
ALTER TABLE catalog_products ADD CONSTRAINT fk_catalog_products_maker FOREIGN KEY (maker_id) REFERENCES makers(id);

-- Seed: SlottedTop + 12 Kickstarter products
INSERT INTO catalog_products (title, slug, category, price_cents, is_hexisle, is_featured, status, production_status, description) VALUES
  ('SlottedTop Universal Hinge System', 'slottedtop-hinge', 'hinge', 2499, true, true, 'active', 'prototype', 'The last hinge you''ll ever need. Universal snap-fit connection system for modular terrain, furniture, and creative builds.'),
  ('HexIsle Terrain Base Set (6-pack)', 'hexisle-base-6', 'terrain', 4999, true, false, 'draft', 'design', 'Six interlocking hex bases for your HexIsle world. Compatible with all SlottedTop accessories.'),
  ('Modular Stone Wall Set', 'stone-wall-set', 'terrain', 3499, true, false, 'draft', 'design', 'Stackable stone wall segments with SlottedTop connections. Build castles, ruins, and fortifications.'),
  ('Snap-In River Tiles', 'river-tiles', 'terrain', 2999, true, false, 'draft', 'design', 'Flowing river tile system with transparent blue inserts. Connects seamlessly to any hex base.'),
  ('Dungeon Floor Pack', 'dungeon-floor', 'terrain', 2499, true, false, 'draft', 'design', 'Detailed dungeon floor tiles with drainage channels, cracks, and moss detail.'),
  ('Forest Canopy Module', 'forest-canopy', 'terrain', 3999, true, false, 'draft', 'design', 'Multi-layer forest canopy that slots above ground-level terrain. Includes tree trunks and leaf clusters.'),
  ('Castle Tower Kit', 'castle-tower', 'terrain', 5999, true, false, 'draft', 'design', 'Full tower kit with spiral staircase interior, battlements, and arrow slits. Four stories tall.'),
  ('Hydraulic Wave Generator', 'wave-generator', 'accessory', 14999, true, false, 'draft', 'design', 'Motorized wave effect module for ocean and lake tiles. USB powered with adjustable speed.'),
  ('LED Lava Flow Insert', 'lava-flow', 'accessory', 1999, true, false, 'draft', 'design', 'Flickering LED strip insert that simulates flowing lava beneath transparent terrain tiles.'),
  ('Magnetic Cliff Face Set', 'cliff-face', 'terrain', 3499, true, false, 'draft', 'design', 'Magnetic cliff faces that attach to hex base edges. Create elevation changes and dramatic drops.'),
  ('Village Building Kit (12 structures)', 'village-kit', 'terrain', 7999, true, false, 'draft', 'design', 'Twelve unique village buildings: tavern, blacksmith, chapel, market stalls, and homes.'),
  ('Battle Grid Overlay (transparent)', 'battle-grid', 'accessory', 999, true, false, 'draft', 'design', 'Clear acrylic grid overlay that sits on any terrain. 1-inch squares with subtle etched lines.'),
  ('Campaign Carry Case', 'carry-case', 'accessory', 4999, false, false, 'draft', 'design', 'Padded carry case with custom foam inserts sized for HexIsle terrain modules.')
ON CONFLICT (slug) DO NOTHING;
