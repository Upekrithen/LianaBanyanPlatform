-- ============================================================================
-- Migration: 20260319000007_storefronts_and_products.sql
-- Session 38 — Task B: Main Square Supabase Wiring
-- Creates storefronts + storefront_products tables with RLS + seed data
-- ============================================================================

-- ═══════════════════════════════════════════════════════════════
-- STOREFRONTS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS storefronts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  category    text NOT NULL CHECK (category IN (
    'food_drink', 'crafts_making', 'services', 'digital',
    'home_garden', 'health', 'education'
  )),
  owner_name  text NOT NULL,
  is_open     boolean DEFAULT true,
  xp_score    integer DEFAULT 0,
  member_since date DEFAULT CURRENT_DATE,
  template_id uuid,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE storefronts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "storefronts_select_authenticated"
  ON storefronts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "storefronts_insert_own"
  ON storefronts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "storefronts_update_own"
  ON storefronts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "storefronts_delete_own"
  ON storefronts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- STOREFRONT PRODUCTS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS storefront_products (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storefront_id uuid NOT NULL REFERENCES storefronts(id) ON DELETE CASCADE,
  name          text NOT NULL,
  price         numeric NOT NULL,
  currency_type text DEFAULT 'credit' CHECK (currency_type IN ('credit', 'mark', 'joule')),
  is_featured   boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE storefront_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "storefront_products_select_authenticated"
  ON storefront_products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "storefront_products_insert_owner"
  ON storefront_products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM storefronts
      WHERE storefronts.id = storefront_id
        AND storefronts.user_id = auth.uid()
    )
  );

CREATE POLICY "storefront_products_update_owner"
  ON storefront_products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM storefronts
      WHERE storefronts.id = storefront_id
        AND storefronts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM storefronts
      WHERE storefronts.id = storefront_id
        AND storefronts.user_id = auth.uid()
    )
  );

CREATE POLICY "storefront_products_delete_owner"
  ON storefront_products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM storefronts
      WHERE storefronts.id = storefront_id
        AND storefronts.user_id = auth.uid()
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- SEED DATA — 8 sample storefronts from MainSquare.tsx
-- Uses a shared placeholder user_id (the Supabase service role
-- owns these seeds; real users will create their own via UI).
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE
  seed_user_id uuid;
BEGIN
  SELECT id INTO seed_user_id FROM auth.users LIMIT 1;
  IF seed_user_id IS NULL THEN
    RAISE NOTICE 'No auth.users found — skipping storefront seed data';
    RETURN;
  END IF;

  INSERT INTO storefronts (user_id, name, description, category, owner_name, is_open, xp_score, member_since)
  VALUES
    (seed_user_id, 'Boise Business Cards',
     'Custom letterpress business cards and stationery for the discerning professional.',
     'crafts_making', 'Captain Mike', true, 14200, '2026-01-15'),
    (seed_user_id, 'Sarah''s Sourdough',
     'Artisan sourdough bread baked fresh daily with heritage grain flour.',
     'food_drink', 'Sarah Chen', true, 8750, '2026-02-01'),
    (seed_user_id, 'CodeForge Tools',
     'Developer productivity tools and custom integrations for cooperative teams.',
     'digital', 'DevGuild', true, 45000, '2025-11-20'),
    (seed_user_id, 'Green Thumb Gardens',
     'Heirloom seeds, starter kits, and garden planning for every climate zone.',
     'home_garden', 'Maria Lopez', false, 3200, '2026-03-01'),
    (seed_user_id, 'Healthy Habits MSA',
     'Preventive wellness programs and Medical Savings Account consultation.',
     'health', 'Dr. Kim', true, 22100, '2025-12-10'),
    (seed_user_id, 'Didasko Tutoring',
     'Peer-to-peer tutoring and skill mentoring across all Academy disciplines.',
     'education', 'Academy Guild', true, 67800, '2025-10-05'),
    (seed_user_id, 'Harbor Woodworks',
     'Hand-crafted hardwood furniture and custom cabinetry from reclaimed timber.',
     'crafts_making', 'Jake Morrison', true, 31500, '2025-11-12'),
    (seed_user_id, 'Mountain View Meals',
     'Farm-to-table meal kits featuring seasonal ingredients from local growers.',
     'food_drink', 'Fresh Crew', false, 5600, '2026-02-20');

  INSERT INTO storefront_products (storefront_id, name, price, currency_type, is_featured)
  SELECT s.id, p.product_name, p.product_price, 'credit', true
  FROM storefronts s
  JOIN (
    VALUES
      ('Boise Business Cards', 'Letterpress Cards (100)', 45::numeric),
      ('Boise Business Cards', 'Foil Stamped Set', 72::numeric),
      ('Boise Business Cards', 'Logo Design Package', 120::numeric),
      ('Sarah''s Sourdough', 'Classic Sourdough Loaf', 8::numeric),
      ('Sarah''s Sourdough', 'Olive Rosemary Boule', 12::numeric),
      ('Sarah''s Sourdough', 'Starter Kit', 25::numeric),
      ('CodeForge Tools', 'CI Pipeline Template', 30::numeric),
      ('CodeForge Tools', 'API Monitoring Suite', 85::numeric),
      ('CodeForge Tools', 'Code Review Bot', 50::numeric),
      ('Green Thumb Gardens', 'Heirloom Tomato Seeds', 6::numeric),
      ('Green Thumb Gardens', 'Raised Bed Kit', 95::numeric),
      ('Green Thumb Gardens', 'Garden Plan Consult', 35::numeric),
      ('Healthy Habits MSA', 'Wellness Assessment', 40::numeric),
      ('Healthy Habits MSA', 'Nutrition Plan (4 wk)', 60::numeric),
      ('Healthy Habits MSA', 'MSA Setup Guide', 15::numeric),
      ('Didasko Tutoring', '1-on-1 Session (1 hr)', 20::numeric),
      ('Didasko Tutoring', 'Group Workshop', 35::numeric),
      ('Didasko Tutoring', 'Study Plan Bundle', 50::numeric),
      ('Harbor Woodworks', 'Cutting Board (Walnut)', 55::numeric),
      ('Harbor Woodworks', 'Floating Shelf Set', 130::numeric),
      ('Harbor Woodworks', 'Custom Quote Request', 0::numeric),
      ('Mountain View Meals', 'Weekly Meal Kit (2)', 48::numeric),
      ('Mountain View Meals', 'Family Box (4)', 85::numeric),
      ('Mountain View Meals', 'Snack Sampler', 22::numeric)
  ) AS p(store_name, product_name, product_price) ON s.name = p.store_name;

END $$;
