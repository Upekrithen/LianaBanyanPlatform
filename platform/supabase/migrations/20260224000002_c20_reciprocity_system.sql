-- ============================================================================
-- C+20 RECIPROCITY SYSTEM
-- ============================================================================
-- Innovation #1347: C+20 Reciprocity Law
-- "For every dollar of margin a business voluntarily gives up by adopting 
-- Cost + 20% pricing, the system grants that business one dollar of C+20 
-- purchasing power inside the ecosystem."
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PRODUCT-LEVEL C+20 CONFIGURATION
-- ----------------------------------------------------------------------------
-- Allows businesses to "dip their toe" by setting per-product C+20 limits

CREATE TABLE IF NOT EXISTS public.c20_product_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anchor_id UUID NOT NULL REFERENCES public.anchors(id) ON DELETE CASCADE,
  product_sku TEXT NOT NULL,
  product_name TEXT NOT NULL,
  
  -- Pricing configuration
  reference_price NUMERIC(10,2) NOT NULL,      -- Normal retail price (e.g., $100)
  cost_basis NUMERIC(10,2) NOT NULL,           -- True cost (e.g., $40)
  c20_price NUMERIC(10,2) GENERATED ALWAYS AS (cost_basis * 1.20) STORED,
  margin_at_reference NUMERIC(10,2) GENERATED ALWAYS AS (reference_price - cost_basis) STORED,
  margin_at_c20 NUMERIC(10,2) GENERATED ALWAYS AS (cost_basis * 0.20) STORED,
  margin_sacrificed_per_unit NUMERIC(10,2) GENERATED ALWAYS AS 
    ((reference_price - cost_basis) - (cost_basis * 0.20)) STORED,
  
  -- C+20 limits (toe-dipping)
  c20_enabled BOOLEAN DEFAULT true,
  c20_max_units INTEGER,                       -- NULL = unlimited, e.g., 50
  c20_units_sold INTEGER DEFAULT 0,
  c20_auto_revert BOOLEAN DEFAULT true,        -- Revert to reference price when max hit
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(anchor_id, product_sku)
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_c20_product_config_anchor 
  ON public.c20_product_config(anchor_id);

-- ----------------------------------------------------------------------------
-- 2. RECIPROCITY TRANSACTION LEDGER
-- ----------------------------------------------------------------------------
-- Tracks every margin contribution and balance spend

CREATE TABLE IF NOT EXISTS public.c20_reciprocity_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anchor_id UUID NOT NULL REFERENCES public.anchors(id) ON DELETE CASCADE,
  
  -- Transaction type
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'MARGIN_CONTRIBUTION',    -- Sold at C+20, earned reciprocity balance
    'BALANCE_SPEND',          -- Purchased at C+20, spent reciprocity balance
    'JOULE_CONVERSION',       -- Converted Joules to extend C+20 purchasing power
    'BALANCE_ADJUSTMENT'      -- Manual adjustment (admin)
  )),
  
  -- Amounts
  amount NUMERIC(14,2) NOT NULL,               -- Positive for contributions, negative for spends
  balance_before NUMERIC(14,2) NOT NULL,
  balance_after NUMERIC(14,2) NOT NULL,
  
  -- Reference data
  product_config_id UUID REFERENCES public.c20_product_config(id),
  order_id UUID,                               -- If tied to a specific order
  joule_amount NUMERIC(14,2),                  -- If JOULE_CONVERSION
  joule_rate NUMERIC(10,6),                    -- Forex rate at conversion
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_c20_reciprocity_ledger_anchor 
  ON public.c20_reciprocity_ledger(anchor_id);
CREATE INDEX IF NOT EXISTS idx_c20_reciprocity_ledger_type 
  ON public.c20_reciprocity_ledger(transaction_type);

-- ----------------------------------------------------------------------------
-- 3. DNA LOCK ENTRIES FOR RECIPROCITY ECONOMICS
-- ----------------------------------------------------------------------------

INSERT INTO public.dna_lock (key, value, description, locked_at, locked_by)
VALUES 
  ('c20_reciprocity_rate', '1.0', 'Dollars of C+20 purchasing power per dollar of margin sacrificed', NOW(), 'system'),
  ('c20_joule_conversion_rate', '1.0', 'Joules to C+20 balance conversion rate (1:1 at parity)', NOW(), 'system'),
  ('c20_min_contribution_for_balance', '0.01', 'Minimum margin contribution to earn balance', NOW(), 'system')
ON CONFLICT (key) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. FUNCTIONS
-- ----------------------------------------------------------------------------

-- Record a margin contribution when a C+20 sale occurs
CREATE OR REPLACE FUNCTION public.record_c20_margin_contribution(
  p_anchor_id UUID,
  p_product_config_id UUID,
  p_units_sold INTEGER DEFAULT 1,
  p_order_id UUID DEFAULT NULL
)
RETURNS NUMERIC AS $$
DECLARE
  v_margin_per_unit NUMERIC(10,2);
  v_total_margin NUMERIC(14,2);
  v_balance_before NUMERIC(14,2);
  v_balance_after NUMERIC(14,2);
  v_reciprocity_rate NUMERIC(10,6);
BEGIN
  -- Get margin sacrificed per unit
  SELECT margin_sacrificed_per_unit INTO v_margin_per_unit
  FROM public.c20_product_config
  WHERE id = p_product_config_id;
  
  IF v_margin_per_unit IS NULL THEN
    RAISE EXCEPTION 'Product config not found';
  END IF;
  
  -- Calculate total margin contributed
  v_total_margin := v_margin_per_unit * p_units_sold;
  
  -- Get reciprocity rate from DNA lock
  SELECT COALESCE(value::NUMERIC, 1.0) INTO v_reciprocity_rate
  FROM public.dna_lock WHERE key = 'c20_reciprocity_rate';
  
  -- Get current balance
  SELECT c20_reciprocity_balance INTO v_balance_before
  FROM public.anchors WHERE id = p_anchor_id;
  
  v_balance_after := v_balance_before + (v_total_margin * v_reciprocity_rate);
  
  -- Update anchor balances
  UPDATE public.anchors
  SET 
    c20_reciprocity_balance = v_balance_after,
    c20_total_margin_contributed = c20_total_margin_contributed + v_total_margin,
    updated_at = NOW()
  WHERE id = p_anchor_id;
  
  -- Update product config units sold
  UPDATE public.c20_product_config
  SET 
    c20_units_sold = c20_units_sold + p_units_sold,
    updated_at = NOW()
  WHERE id = p_product_config_id;
  
  -- Record in ledger
  INSERT INTO public.c20_reciprocity_ledger (
    anchor_id, transaction_type, amount, 
    balance_before, balance_after,
    product_config_id, order_id, notes
  ) VALUES (
    p_anchor_id, 'MARGIN_CONTRIBUTION', v_total_margin * v_reciprocity_rate,
    v_balance_before, v_balance_after,
    p_product_config_id, p_order_id,
    format('Sold %s units, margin sacrificed: $%s each', p_units_sold, v_margin_per_unit)
  );
  
  RETURN v_total_margin * v_reciprocity_rate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Spend reciprocity balance on a C+20 purchase
CREATE OR REPLACE FUNCTION public.spend_c20_balance(
  p_anchor_id UUID,
  p_amount NUMERIC(14,2),
  p_order_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  balance_used NUMERIC(14,2),
  joules_needed NUMERIC(14,2),
  remaining_balance NUMERIC(14,2)
) AS $$
DECLARE
  v_current_balance NUMERIC(14,2);
  v_balance_to_use NUMERIC(14,2);
  v_joules_needed NUMERIC(14,2);
  v_balance_after NUMERIC(14,2);
BEGIN
  -- Get current balance
  SELECT c20_reciprocity_balance INTO v_current_balance
  FROM public.anchors WHERE id = p_anchor_id;
  
  -- Calculate how much balance to use vs Joules needed
  IF v_current_balance >= p_amount THEN
    v_balance_to_use := p_amount;
    v_joules_needed := 0;
  ELSE
    v_balance_to_use := v_current_balance;
    v_joules_needed := p_amount - v_current_balance;
  END IF;
  
  v_balance_after := v_current_balance - v_balance_to_use;
  
  -- Update anchor balance
  UPDATE public.anchors
  SET 
    c20_reciprocity_balance = v_balance_after,
    c20_total_balance_spent = c20_total_balance_spent + v_balance_to_use,
    updated_at = NOW()
  WHERE id = p_anchor_id;
  
  -- Record in ledger
  IF v_balance_to_use > 0 THEN
    INSERT INTO public.c20_reciprocity_ledger (
      anchor_id, transaction_type, amount,
      balance_before, balance_after,
      order_id, notes
    ) VALUES (
      p_anchor_id, 'BALANCE_SPEND', -v_balance_to_use,
      v_current_balance, v_balance_after,
      p_order_id, COALESCE(p_notes, 'C+20 purchase')
    );
  END IF;
  
  RETURN QUERY SELECT v_balance_to_use, v_joules_needed, v_balance_after;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Convert Joules to C+20 purchasing power
CREATE OR REPLACE FUNCTION public.convert_joules_to_c20_balance(
  p_anchor_id UUID,
  p_joule_amount NUMERIC(14,2),
  p_notes TEXT DEFAULT NULL
)
RETURNS NUMERIC AS $$
DECLARE
  v_conversion_rate NUMERIC(10,6);
  v_c20_amount NUMERIC(14,2);
  v_balance_before NUMERIC(14,2);
  v_balance_after NUMERIC(14,2);
BEGIN
  -- Get conversion rate from DNA lock
  SELECT COALESCE(value::NUMERIC, 1.0) INTO v_conversion_rate
  FROM public.dna_lock WHERE key = 'c20_joule_conversion_rate';
  
  v_c20_amount := p_joule_amount * v_conversion_rate;
  
  -- Get current balance
  SELECT c20_reciprocity_balance INTO v_balance_before
  FROM public.anchors WHERE id = p_anchor_id;
  
  v_balance_after := v_balance_before + v_c20_amount;
  
  -- Update anchor balance
  UPDATE public.anchors
  SET 
    c20_reciprocity_balance = v_balance_after,
    updated_at = NOW()
  WHERE id = p_anchor_id;
  
  -- Record in ledger
  INSERT INTO public.c20_reciprocity_ledger (
    anchor_id, transaction_type, amount,
    balance_before, balance_after,
    joule_amount, joule_rate, notes
  ) VALUES (
    p_anchor_id, 'JOULE_CONVERSION', v_c20_amount,
    v_balance_before, v_balance_after,
    p_joule_amount, v_conversion_rate,
    COALESCE(p_notes, format('Converted %s Joules at rate %s', p_joule_amount, v_conversion_rate))
  );
  
  RETURN v_c20_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if a product should still be sold at C+20 (toe-dipping limit)
CREATE OR REPLACE FUNCTION public.is_product_c20_available(p_product_config_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_enabled BOOLEAN;
  v_max_units INTEGER;
  v_units_sold INTEGER;
  v_auto_revert BOOLEAN;
BEGIN
  SELECT c20_enabled, c20_max_units, c20_units_sold, c20_auto_revert
  INTO v_enabled, v_max_units, v_units_sold, v_auto_revert
  FROM public.c20_product_config
  WHERE id = p_product_config_id;
  
  IF NOT v_enabled THEN
    RETURN false;
  END IF;
  
  -- If no max set, always available
  IF v_max_units IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check if under limit
  RETURN v_units_sold < v_max_units;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get anchor's C+20 reciprocity summary
CREATE OR REPLACE FUNCTION public.get_c20_reciprocity_summary(p_anchor_id UUID)
RETURNS TABLE (
  reciprocity_balance NUMERIC(14,2),
  total_margin_contributed NUMERIC(14,2),
  total_balance_spent NUMERIC(14,2),
  net_contribution NUMERIC(14,2),
  products_at_c20 INTEGER,
  total_c20_units_sold INTEGER,
  total_c20_units_remaining INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.c20_reciprocity_balance,
    a.c20_total_margin_contributed,
    a.c20_total_balance_spent,
    a.c20_total_margin_contributed - a.c20_total_balance_spent,
    COUNT(pc.id)::INTEGER,
    COALESCE(SUM(pc.c20_units_sold), 0)::INTEGER,
    COALESCE(SUM(
      CASE 
        WHEN pc.c20_max_units IS NOT NULL 
        THEN GREATEST(0, pc.c20_max_units - pc.c20_units_sold)
        ELSE 0 
      END
    ), 0)::INTEGER
  FROM public.anchors a
  LEFT JOIN public.c20_product_config pc ON pc.anchor_id = a.id AND pc.c20_enabled = true
  WHERE a.id = p_anchor_id
  GROUP BY a.id, a.c20_reciprocity_balance, a.c20_total_margin_contributed, a.c20_total_balance_spent;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------

ALTER TABLE public.c20_product_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.c20_reciprocity_ledger ENABLE ROW LEVEL SECURITY;

-- Product config: owners can manage their own
CREATE POLICY "Anchor owners can manage their product configs"
  ON public.c20_product_config
  FOR ALL
  USING (
    anchor_id IN (SELECT id FROM public.anchors WHERE owner_id = auth.uid())
  );

-- Ledger: owners can view their own
CREATE POLICY "Anchor owners can view their reciprocity ledger"
  ON public.c20_reciprocity_ledger
  FOR SELECT
  USING (
    anchor_id IN (SELECT id FROM public.anchors WHERE owner_id = auth.uid())
  );

-- Public can view aggregate stats (for transparency)
CREATE POLICY "Public can view product configs"
  ON public.c20_product_config
  FOR SELECT
  USING (true);

-- ----------------------------------------------------------------------------
-- 6. PUBLIC VIEW FOR TRANSPARENCY
-- ----------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.v_c20_reciprocity_leaderboard AS
SELECT 
  a.id AS anchor_id,
  a.display_name,
  a.c20_total_margin_contributed AS total_contributed,
  a.c20_total_balance_spent AS total_spent,
  a.c20_reciprocity_balance AS current_balance,
  COUNT(pc.id) AS products_at_c20,
  SUM(pc.c20_units_sold) AS total_units_sold,
  a.cost_plus_compliance_ratio AS compliance_ratio,
  public.get_cost_plus_tier(a.id) AS badge_tier
FROM public.anchors a
LEFT JOIN public.c20_product_config pc ON pc.anchor_id = a.id AND pc.c20_enabled = true
WHERE a.c20_total_margin_contributed > 0
GROUP BY a.id
ORDER BY a.c20_total_margin_contributed DESC;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
