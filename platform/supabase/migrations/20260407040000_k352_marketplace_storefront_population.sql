-- ============================================================================
-- K352: Marketplace Storefront Population — Real Shops, Real Products
-- Replaces placeholder storefronts with functional entries
-- ============================================================================

-- =====================
-- PART A: Add status column to storefronts for pending_claim / demonstration flow
-- =====================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'storefronts'
      AND column_name = 'status'
  ) THEN
    ALTER TABLE storefronts ADD COLUMN status TEXT DEFAULT 'active'
      CHECK (status IN ('active', 'pending_claim', 'demonstration', 'archived'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'storefronts'
      AND column_name = 'tagline'
  ) THEN
    ALTER TABLE storefronts ADD COLUMN tagline TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'storefronts'
      AND column_name = 'production_linked'
  ) THEN
    ALTER TABLE storefronts ADD COLUMN production_linked BOOLEAN DEFAULT false;
  END IF;
END $$;

-- =====================
-- PART B: Add columns to storefront_products for ordering + thresholds
-- =====================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'storefront_products'
      AND column_name = 'description'
  ) THEN
    ALTER TABLE storefront_products ADD COLUMN description TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'storefront_products'
      AND column_name = 'cost_basis'
  ) THEN
    ALTER TABLE storefront_products ADD COLUMN cost_basis NUMERIC;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'storefront_products'
      AND column_name = 'order_count'
  ) THEN
    ALTER TABLE storefront_products ADD COLUMN order_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'storefront_products'
      AND column_name = 'order_threshold'
  ) THEN
    ALTER TABLE storefront_products ADD COLUMN order_threshold INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'storefront_products'
      AND column_name = 'threshold_deadline'
  ) THEN
    ALTER TABLE storefront_products ADD COLUMN threshold_deadline TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'storefront_products'
      AND column_name = 'production_status'
  ) THEN
    ALTER TABLE storefront_products ADD COLUMN production_status TEXT DEFAULT 'accepting_orders'
      CHECK (production_status IN ('accepting_orders', 'threshold_met', 'in_production', 'shipped', 'completed'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'storefront_products'
      AND column_name = 'image_url'
  ) THEN
    ALTER TABLE storefront_products ADD COLUMN image_url TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'storefront_products'
      AND column_name = 'sku'
  ) THEN
    ALTER TABLE storefront_products ADD COLUMN sku TEXT;
  END IF;
END $$;


-- =====================
-- PART C: Delete old placeholder storefronts (and their products via CASCADE)
-- =====================
DELETE FROM storefronts WHERE name IN (
  'Boise Business Cards',
  'Sarah''s Sourdough',
  'CodeForge Tools',
  'Green Thumb Gardens',
  'Healthy Habits MSA',
  'Didasko Tutoring',
  'Harbor Woodworks',
  'Mountain View Meals'
);


-- =====================
-- PART D: Insert REAL storefronts + products
-- =====================
DO $$
DECLARE
  seed_uid uuid;
  lb_cards_id uuid;
  montana_id uuid;
BEGIN
  SELECT id INTO seed_uid FROM auth.users LIMIT 1;
  IF seed_uid IS NULL THEN RETURN; END IF;

  -- ─── 1. Liana Banyan Cue Cards (REAL, orderable) ───
  INSERT INTO storefronts (id, user_id, name, slug, description, tagline, category, owner_name, is_open, status, production_linked)
  VALUES (
    gen_random_uuid(), seed_uid,
    'Liana Banyan Cue Cards',
    'lb-cue-cards',
    'Custom business cards featuring your Deck Card design, QR code to your Cue Card share page, and Cost+20% pricing. Order individually or join a batch for lower per-unit cost.',
    'Your card. Your design. Cost+20%.',
    'crafts_making',
    'Liana Banyan Corporation',
    true,
    'active',
    true
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO lb_cards_id;

  IF lb_cards_id IS NOT NULL THEN
    INSERT INTO storefront_products (storefront_id, name, description, price, cost_basis, currency_type, is_featured, sku, order_threshold, threshold_deadline, production_status)
    VALUES
      (lb_cards_id, 'Standard Business Cards (100 pack)',
       '100 full-color business cards with your Deck Card design and QR code linking to your Cue Card share page.',
       15.00, 12.50, 'credit', true, 'LBC-STD-100', 50,
       NOW() + INTERVAL '14 days', 'accepting_orders'),
      (lb_cards_id, 'Premium Business Cards (100 pack)',
       '100 premium cards with foil accent, your Deck Card design, and QR code. Heavier stock.',
       25.00, 20.83, 'credit', true, 'LBC-PRM-100', 50,
       NOW() + INTERVAL '14 days', 'accepting_orders'),
      (lb_cards_id, 'Deck Card Prints (5x7, set of 5)',
       'Large format prints of your Deck Card design. Frame-ready. Set of 5.',
       8.00, 6.67, 'credit', false, 'LBC-DCP-5x7', NULL, NULL, 'accepting_orders'),
      (lb_cards_id, 'QR Code Stickers (sheet of 20)',
       'Weatherproof vinyl stickers with your personal Cue Card QR code. Stick them everywhere.',
       5.00, 4.17, 'credit', false, 'LBC-QRS-20', NULL, NULL, 'accepting_orders');
  END IF;

  -- ─── 2. Montana Makers Collective (demonstration storefront) ───
  INSERT INTO storefronts (id, user_id, name, slug, description, tagline, category, owner_name, is_open, status, production_linked)
  VALUES (
    gen_random_uuid(), seed_uid,
    'Montana Makers Collective',
    'montana-makers',
    'A demonstration storefront showing how an established artisan collective integrates with Liana Banyan. 20% workforce dedication → 40% discount. Company Island model.',
    'Handcrafted in Montana. Cost+20%.',
    'crafts_making',
    'Montana Makers Collective',
    true,
    'demonstration',
    true
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO montana_id;

  IF montana_id IS NOT NULL THEN
    INSERT INTO storefront_products (storefront_id, name, description, price, cost_basis, currency_type, is_featured, sku, order_threshold, production_status)
    VALUES
      (montana_id, 'Hand-Tooled Leather Journal',
       'Full-grain leather journal cover with hand-tooled Montana wildflower design. Refillable A5 insert included.',
       65.00, 54.17, 'credit', true, 'MMC-LTH-JRN', 25, 'accepting_orders'),
      (montana_id, 'Reclaimed Timber Cutting Board',
       'Edge-grain cutting board from reclaimed Montana barn timber. Each piece unique. Oiled and sealed.',
       55.00, 45.83, 'credit', true, 'MMC-WD-CB', 30, 'accepting_orders'),
      (montana_id, 'Copper Canyon Lamp',
       'Hand-hammered copper table lamp with rawhide shade. Wired and safety-tested. 12" height.',
       120.00, 100.00, 'credit', true, 'MMC-CP-LAMP', 15, 'accepting_orders'),
      (montana_id, 'Beeswax Candle Set (6)',
       'Hand-poured beeswax candles from Montana apiaries. Unscented. 4" pillars.',
       28.00, 23.33, 'credit', false, 'MMC-BW-6PK', NULL, 'accepting_orders'),
      (montana_id, 'Custom Commission Request',
       'Request a custom piece from the collective. Leatherwork, woodworking, or metalwork. Quote within 48 hours.',
       0.00, 0.00, 'credit', false, 'MMC-CUSTOM', NULL, 'accepting_orders');
  END IF;
END $$;


-- =====================
-- PART E: Create storefronts for each creator from creator_draft_picks
-- Each gets a pending_claim storefront ready for them to customize
-- =====================
DO $$
DECLARE
  seed_uid uuid;
  rec RECORD;
  new_sf_id uuid;
  cat TEXT;
BEGIN
  SELECT id INTO seed_uid FROM auth.users LIMIT 1;
  IF seed_uid IS NULL THEN RETURN; END IF;

  FOR rec IN
    SELECT creator_name, creator_handle, specialty
    FROM creator_draft_picks
    WHERE platform = 'instagram'
      AND status = 'undrafted'
  LOOP
    -- Map specialty to storefront category
    IF rec.specialty ILIKE '%food%' OR rec.specialty ILIKE '%cake%' OR rec.specialty ILIKE '%ceramic%' THEN
      cat := 'crafts_making';
    ELSIF rec.specialty ILIKE '%digital%' OR rec.specialty ILIKE '%software%' THEN
      cat := 'digital';
    ELSE
      cat := 'crafts_making';
    END IF;

    INSERT INTO storefronts (id, user_id, name, slug, description, tagline, category, owner_name, is_open, status, production_linked)
    VALUES (
      gen_random_uuid(),
      seed_uid,
      rec.creator_name || '''s Studio',
      LOWER(REPLACE(REPLACE(rec.creator_handle, '@', ''), '.', '-')),
      'This storefront was prepared for you by the Liana Banyan community. Claim it to customize your products, pricing, and brand.',
      rec.specialty,
      cat,
      rec.creator_name,
      false,
      'pending_claim',
      true
    )
    ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO new_sf_id;

    -- Give each creator 3 placeholder product slots
    IF new_sf_id IS NOT NULL THEN
      INSERT INTO storefront_products (storefront_id, name, description, price, cost_basis, currency_type, is_featured, production_status)
      VALUES
        (new_sf_id, 'Product 1 — Ready to customize', 'This slot is reserved for your first product. Claim your storefront to set it up.', 0, 0, 'credit', true, 'accepting_orders'),
        (new_sf_id, 'Product 2 — Ready to customize', 'Your second product slot. Set your price with Cost+20% — you keep 83.3%.', 0, 0, 'credit', false, 'accepting_orders'),
        (new_sf_id, 'Product 3 — Ready to customize', 'Your third product slot. Add photos, descriptions, and pricing.', 0, 0, 'credit', false, 'accepting_orders');
    END IF;
  END LOOP;
END $$;


-- =====================
-- PART F: Create storefront_orders table for actual order tracking
-- =====================
CREATE TABLE IF NOT EXISTS storefront_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storefront_id UUID NOT NULL REFERENCES storefronts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES storefront_products(id) ON DELETE CASCADE,
  buyer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'credits' CHECK (payment_method IN ('credits', 'marks', 'cash')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled', 'refunded')),
  shipping_address JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE storefront_orders ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storefront_orders_buyer_read' AND tablename = 'storefront_orders') THEN
    CREATE POLICY storefront_orders_buyer_read ON storefront_orders
      FOR SELECT USING (buyer_user_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storefront_orders_buyer_insert' AND tablename = 'storefront_orders') THEN
    CREATE POLICY storefront_orders_buyer_insert ON storefront_orders
      FOR INSERT WITH CHECK (buyer_user_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storefront_orders_owner_read' AND tablename = 'storefront_orders') THEN
    CREATE POLICY storefront_orders_owner_read ON storefront_orders
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM storefronts s
          WHERE s.id = storefront_orders.storefront_id
            AND s.user_id = auth.uid()
        )
      );
  END IF;
END $$;
