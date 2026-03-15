-- Product Creator XP, Production Labor XP, production_runs, preorder lock (Session 18)

-- New columns on xp_transactions
ALTER TABLE public.xp_transactions
  ADD COLUMN IF NOT EXISTS xp_type TEXT NOT NULL DEFAULT 'bounty'
    CHECK (xp_type IN ('bounty', 'product', 'production')),
  ADD COLUMN IF NOT EXISTS preorder_volume INTEGER,
  ADD COLUMN IF NOT EXISTS unit_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS production_run_id UUID,
  ADD COLUMN IF NOT EXISTS volume_locked_at TIMESTAMPTZ;

COMMENT ON COLUMN public.xp_transactions.xp_type IS 'bounty = task completion, product = maker/designer preorder, production = manufacturing labor';
COMMENT ON COLUMN public.xp_transactions.preorder_volume IS 'Number of units preordered (locked at production start)';
COMMENT ON COLUMN public.xp_transactions.unit_price IS 'Price per unit in Credits (for product XP calculation)';
COMMENT ON COLUMN public.xp_transactions.production_run_id IS 'Reference to the production run (for production labor XP)';
COMMENT ON COLUMN public.xp_transactions.volume_locked_at IS 'Timestamp when preorder volume was locked — prevents post-lock inflation';

-- production_runs table
CREATE TABLE IF NOT EXISTS public.production_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  product_id UUID,
  certification_tier INTEGER CHECK (certification_tier BETWEEN 1 AND 6),
  total_units INTEGER NOT NULL,
  preorder_volume INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  designer_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_production', 'quality_check', 'completed', 'cancelled')),
  volume_locked_at TIMESTAMPTZ,
  production_started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_production_runs_designer ON public.production_runs(designer_id);

ALTER TABLE public.production_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read production runs" ON public.production_runs FOR SELECT USING (true);
CREATE POLICY "Service role manage production runs" ON public.production_runs FOR ALL USING (auth.role() = 'service_role');

-- Preorder lock function
CREATE OR REPLACE FUNCTION public.lock_preorder_volume(run_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.production_runs
  SET volume_locked_at = NOW(),
      status = 'in_production',
      production_started_at = COALESCE(production_started_at, NOW())
  WHERE id = run_id
    AND volume_locked_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Type-specific aggregation columns on xp_scores
ALTER TABLE public.xp_scores
  ADD COLUMN IF NOT EXISTS bounty_xp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS product_xp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS production_xp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS products_completed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS production_runs_completed INTEGER DEFAULT 0;

-- Replace trigger function with type breakdown
CREATE OR REPLACE FUNCTION public.recalculate_xp_scores()
RETURNS TRIGGER AS $$
DECLARE
  v_total_xp INTEGER;
  v_bounty_xp INTEGER;
  v_product_xp INTEGER;
  v_production_xp INTEGER;
  v_bounties INTEGER;
  v_products INTEGER;
  v_productions INTEGER;
  v_avg_score NUMERIC;
  v_highest INTEGER;
BEGIN
  SELECT
    COALESCE(SUM(xp_earned), 0)::INTEGER,
    COALESCE(SUM(CASE WHEN xp_type = 'bounty' THEN xp_earned ELSE 0 END), 0)::INTEGER,
    COALESCE(SUM(CASE WHEN xp_type = 'product' THEN xp_earned ELSE 0 END), 0)::INTEGER,
    COALESCE(SUM(CASE WHEN xp_type = 'production' THEN xp_earned ELSE 0 END), 0)::INTEGER,
    COUNT(*) FILTER (WHERE xp_type = 'bounty')::INTEGER,
    COUNT(*) FILTER (WHERE xp_type = 'product')::INTEGER,
    COUNT(*) FILTER (WHERE xp_type = 'production')::INTEGER,
    COALESCE(AVG(accomplishment_score), 0),
    COALESCE(MAX(xp_earned), 0)::INTEGER
  INTO v_total_xp, v_bounty_xp, v_product_xp, v_production_xp,
       v_bounties, v_products, v_productions, v_avg_score, v_highest
  FROM public.xp_transactions
  WHERE user_id = NEW.user_id;

  INSERT INTO public.xp_scores (
    user_id, total_xp, bounty_xp, product_xp, production_xp,
    bounties_completed, products_completed, production_runs_completed,
    average_accomplishment_score, highest_single_xp, updated_at
  ) VALUES (
    NEW.user_id, v_total_xp, v_bounty_xp, v_product_xp, v_production_xp,
    v_bounties, v_products, v_productions,
    v_avg_score, v_highest, NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_xp = EXCLUDED.total_xp,
    bounty_xp = EXCLUDED.bounty_xp,
    product_xp = EXCLUDED.product_xp,
    production_xp = EXCLUDED.production_xp,
    bounties_completed = EXCLUDED.bounties_completed,
    products_completed = EXCLUDED.products_completed,
    production_runs_completed = EXCLUDED.production_runs_completed,
    average_accomplishment_score = EXCLUDED.average_accomplishment_score,
    highest_single_xp = EXCLUDED.highest_single_xp,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- dna_lock
INSERT INTO public.dna_lock (parameter_key, parameter_value, data_type, is_locked, locked_by, description, category)
VALUES
  ('product_creator_xp', 'true', 'boolean', false, 'SYSTEM', 'Product Creator XP path: price × volume × quality fraction', 'xp'),
  ('production_labor_xp', 'true', 'boolean', false, 'SYSTEM', 'Production Labor XP path: bounty_points × volume × quality fraction', 'xp'),
  ('preorder_volume_lock', 'true', 'boolean', false, 'SYSTEM', 'Lock preorder volume at production start to prevent XP inflation', 'xp')
ON CONFLICT (parameter_key) DO NOTHING;
