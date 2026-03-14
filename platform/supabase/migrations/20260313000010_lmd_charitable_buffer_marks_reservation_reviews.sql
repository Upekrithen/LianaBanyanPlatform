-- LMD: Charitable buffer config, Marks reservation, meal reviews, recipe popularity (Session 11)
-- See CONTEXT_MANAGEMENT/CHARITABLE_BUFFER_FOR_PREORDERS.md, LMD_PIPELINE_AND_REPUTATION_DESIGN.md

-- ─── Charitable buffer (cap, time-bound) ─────────────────────────────────────
INSERT INTO dna_lock (parameter_key, parameter_value, data_type, is_locked, locked_by, description, category)
VALUES
  ('charitable_buffer_max_meals_per_week', '2', 'integer', false, 'SYSTEM', 'Max meals per week from charitable buffer for preorders (iterate from usage)', 'operations'),
  ('charitable_buffer_max_weeks', '2', 'integer', false, 'SYSTEM', 'Max weeks of buffer before review; catch-up window', 'operations'),
  ('charitable_buffer_max_pct_weekly_need', '40', 'integer', false, 'SYSTEM', 'Max percent of weekly preorder need that buffer can cover', 'operations')
ON CONFLICT (parameter_key) DO NOTHING;

-- Optional: log buffer use (anon) for iteration
CREATE TABLE IF NOT EXISTS public.charitable_buffer_use (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL,
  meals_covered INTEGER NOT NULL DEFAULT 0,
  outcome TEXT, -- 'caught_up', 'extended', 'closed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.charitable_buffer_use ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON public.charitable_buffer_use FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─── Marks reservation (reserve on preorder, release on fulfill/cancel) ───────
CREATE TABLE IF NOT EXISTS public.marks_reservation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL, -- meal_orders.id or lmd_meal_requests.id; polymorphic
  order_type TEXT NOT NULL CHECK (order_type IN ('meal_order', 'meal_request')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount_reserved INTEGER NOT NULL CHECK (amount_reserved >= 0),
  currency_type TEXT NOT NULL DEFAULT 'marks' CHECK (currency_type IN ('marks', 'credits')),
  status TEXT NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'released', 'converted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  released_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_marks_reservation_order ON marks_reservation(order_id, order_type);
CREATE INDEX IF NOT EXISTS idx_marks_reservation_user ON marks_reservation(user_id);
ALTER TABLE public.marks_reservation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own reservations" ON marks_reservation FOR SELECT USING (auth.uid() = user_id);

-- ─── Meal / recipe iteration reviews (taste, flavor, spice, mouthfeel) ───────
CREATE TABLE IF NOT EXISTS public.lmd_recipe_iteration_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID NOT NULL REFERENCES public.lmd_meals(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.meal_orders(id) ON DELETE SET NULL,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID, -- user_recipe_portfolio.id or pantry_recipes.id if we have it
  cook_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- chef_id from lmd_meals
  taste SMALLINT CHECK (taste >= 1 AND taste <= 5),
  flavor SMALLINT CHECK (flavor >= 1 AND flavor <= 5),
  spice SMALLINT CHECK (spice >= 1 AND spice <= 5),
  mouthfeel SMALLINT CHECK (mouthfeel >= 1 AND mouthfeel <= 5),
  review_text TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  within_incentive_window BOOLEAN DEFAULT false,
  UNIQUE(meal_id, reviewer_id)
);
CREATE INDEX IF NOT EXISTS idx_lmd_reviews_meal ON lmd_recipe_iteration_reviews(meal_id);
CREATE INDEX IF NOT EXISTS idx_lmd_reviews_reviewer ON lmd_recipe_iteration_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_lmd_reviews_cook ON lmd_recipe_iteration_reviews(cook_id);
ALTER TABLE public.lmd_recipe_iteration_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert own review" ON lmd_recipe_iteration_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Users view own reviews" ON lmd_recipe_iteration_reviews FOR SELECT USING (auth.uid() = reviewer_id);
CREATE POLICY "Public read for aggregates" ON lmd_recipe_iteration_reviews FOR SELECT USING (true); -- for leaderboard; can restrict by area later

-- Config: incentive window and reward for early review
INSERT INTO dna_lock (parameter_key, parameter_value, data_type, is_locked, locked_by, description, category)
VALUES
  ('lmd_review_incentive_window_hours', '72', 'integer', false, 'SYSTEM', 'Hours after delivery to submit review and earn incentive', 'reputation'),
  ('lmd_review_incentive_marks', '5', 'integer', false, 'SYSTEM', 'Marks awarded for review within incentive window (one-serving equivalent)', 'reputation')
ON CONFLICT (parameter_key) DO NOTHING;

-- ─── Recipe popularity by area (fulfilled orders) ─────────────────────────────
-- Add optional delivery_postal_code to meal_orders for area
ALTER TABLE public.meal_orders ADD COLUMN IF NOT EXISTS delivery_postal_code TEXT;

-- Ensure lmd_meals has portfolio_recipe_id (some migrations add it)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'lmd_meals' AND column_name = 'portfolio_recipe_id'
  ) THEN
    ALTER TABLE public.lmd_meals ADD COLUMN portfolio_recipe_id UUID;
  END IF;
END $$;

-- View: recipe + cook (iteration) and area
CREATE OR REPLACE VIEW public.lmd_recipe_popularity_by_area AS
SELECT
  m.id AS meal_id,
  m.chef_id AS cook_id,
  m.title AS meal_title,
  m.portfolio_recipe_id AS recipe_id,
  COALESCE(o.delivery_postal_code, 'unknown') AS area_key,
  COUNT(o.id) AS order_count,
  COUNT(DISTINCT o.user_id) AS recipient_count
FROM public.lmd_meals m
JOIN public.meal_orders o ON o.meal_id = m.id
WHERE o.status IN ('fulfilled', 'delivered', 'completed', 'pending')
GROUP BY m.id, m.chef_id, m.title, m.portfolio_recipe_id, COALESCE(o.delivery_postal_code, 'unknown')
ORDER BY order_count DESC, recipient_count DESC;

COMMENT ON VIEW public.lmd_recipe_popularity_by_area IS 'Fulfilled orders by meal (recipe iteration) and area for leaderboard and node density';
