-- ============================================================================
-- Migration: 20260319000008_daily_news_and_showcase.sql
-- Session 39 — Task A: Daily News Supabase Wiring
-- Creates daily_news_slides + showcase_promotions tables with RLS + seed data
-- ============================================================================

-- ═══════════════════════════════════════════════════════════════
-- DAILY NEWS SLIDES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS daily_news_slides (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slide_type    text NOT NULL CHECK (slide_type IN (
    'FEATURED_PRODUCT', 'NEW_MEMBER', 'MILESTONE',
    'SHOWCASE_PROMOTION', 'ANNOUNCEMENT', 'BREAKING_NEWS'
  )),
  title         text NOT NULL,
  subtitle      text,
  description   text,
  store_name    text,
  product_name  text,
  price         numeric,
  currency_type text DEFAULT 'credit',
  cta_text      text,
  cta_url       text,
  badge_text    text,
  is_active     boolean DEFAULT true,
  display_date  date NOT NULL,
  sort_order    integer DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE daily_news_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_news_slides_select_authenticated"
  ON daily_news_slides FOR SELECT
  TO authenticated
  USING (true);

-- ═══════════════════════════════════════════════════════════════
-- SHOWCASE PROMOTIONS (paid feature slots)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS showcase_promotions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storefront_id  uuid REFERENCES storefronts(id) ON DELETE SET NULL,
  slide_id       uuid REFERENCES daily_news_slides(id) ON DELETE SET NULL,
  credits_paid   numeric NOT NULL,
  promotion_date date NOT NULL,
  status         text NOT NULL CHECK (status IN ('pending', 'approved', 'active', 'expired')),
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE showcase_promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "showcase_promotions_select_own"
  ON showcase_promotions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "showcase_promotions_insert_own"
  ON showcase_promotions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "showcase_promotions_update_own"
  ON showcase_promotions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "showcase_promotions_delete_own"
  ON showcase_promotions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- SEED DATA — 8 main carousel slides + 6 headline slides
-- ═══════════════════════════════════════════════════════════════

INSERT INTO daily_news_slides (slide_type, title, subtitle, store_name, price, cta_text, cta_url, is_active, display_date, sort_order)
VALUES
  ('ANNOUNCEMENT',
   'Welcome to Launch Night!',
   'The cooperative is officially open. Every journey starts with a single step — and yours starts here.',
   NULL, NULL, 'Explore the Platform', '/marketplace',
   true, '2026-03-18', 1),

  ('FEATURED_PRODUCT',
   'Artisan Business Cards',
   'Premium letterpress cards, crafted locally in Boise.',
   'Boise Business Cards', 25, 'View in Store', '/marketplace',
   true, '2026-03-18', 2),

  ('NEW_MEMBER',
   'Welcome Sarah Chen!',
   'Sourdough baker, community builder, and our newest Food & Drink artisan.',
   NULL, NULL, NULL, NULL,
   true, '2026-03-18', 3),

  ('MILESTONE',
   'CodeForge Tools hits Silver XP!',
   '45,000 XP earned through quality digital tools.',
   'CodeForge Tools', NULL, NULL, NULL,
   true, '2026-03-18', 4),

  ('SHOWCASE_PROMOTION',
   'Harbor Woodworks Grand Opening',
   'Handcrafted furniture and woodworking — now open in Main Square.',
   'Harbor Woodworks', NULL, 'Visit Store', '/marketplace',
   true, '2026-03-18', 5),

  ('FEATURED_PRODUCT',
   'Organic Sourdough Starter Kit',
   'Everything you need to bake your own bread at home.',
   'Sarah''s Sourdough', 15, 'View in Store', '/marketplace',
   true, '2026-03-18', 6),

  ('ANNOUNCEMENT',
   'Demand Signaling is LIVE',
   'Tell us what you want. Back it with Marks. Watch it get built.',
   NULL, NULL, 'Signal Demand', '/demand',
   true, '2026-03-18', 7),

  ('NEW_MEMBER',
   'Welcome Mountain View Meals!',
   'Fresh, local meal prep service joining the cooperative.',
   NULL, NULL, NULL, NULL,
   true, '2026-03-18', 8),

  -- Headlines (same table, higher sort_order range)
  ('ANNOUNCEMENT',
   'Founding Run: First 50 Members',
   'Be part of the active feedback cohort with full testing access.',
   NULL, NULL, NULL, NULL,
   true, '2026-03-18', 101),

  ('MILESTONE',
   '100 Products Listed',
   'The marketplace crossed triple digits this week.',
   NULL, NULL, NULL, NULL,
   true, '2026-03-18', 102),

  ('FEATURED_PRODUCT',
   'Hand-Forged Chef Knife',
   'Damascus steel, made in Idaho.',
   'Forge & Flame', 180, NULL, NULL,
   true, '2026-03-18', 103),

  ('NEW_MEMBER',
   'Welcome Treasure Valley Honey!',
   'Raw, unfiltered honey straight from local hives.',
   NULL, NULL, NULL, NULL,
   true, '2026-03-18', 104),

  ('ANNOUNCEMENT',
   'Ghost World Beta Opens Friday',
   'Practice risk-free in the cooperative sandbox.',
   NULL, NULL, NULL, NULL,
   true, '2026-03-18', 105),

  ('MILESTONE',
   'First Business Swoop!',
   'A Patron fully funded a project via allocation authority.',
   NULL, NULL, NULL, NULL,
   true, '2026-03-18', 106);
