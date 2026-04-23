-- ════════════════════════════════════════════════════════════════════════════
-- Migration: Print Pipeline Refinement (Session 22 Addendum)
-- Three-vendor model, approval gate, production levels with real pricing
-- March 15, 2026
-- ════════════════════════════════════════════════════════════════════════════

-- ─── 1. ALTER print_orders: expand order types + add pricing/vendor/credits cols ─

DO $$ BEGIN
  -- Expand order_type check constraint
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'print_orders') THEN
    ALTER TABLE public.print_orders DROP CONSTRAINT IF EXISTS print_orders_order_type_check;
    ALTER TABLE public.print_orders ADD CONSTRAINT print_orders_order_type_check
      CHECK (order_type IN ('cue_card','business_card','medallion_coin','merch_apparel','merch_print','deck'));

    -- Expand status check constraint
    ALTER TABLE public.print_orders DROP CONSTRAINT IF EXISTS print_orders_status_check;
    ALTER TABLE public.print_orders ADD CONSTRAINT print_orders_status_check
      CHECK (status IN (
        'draft','cart','paid','waitlist','batch_ready','local_claimed',
        'approved','submitted','in_production','quality_check',
        'shipped','delivered','cancelled','refunded'
      ));

    -- Drop old quantity check (was >= 25)
    ALTER TABLE public.print_orders DROP CONSTRAINT IF EXISTS print_orders_quantity_check;
    ALTER TABLE public.print_orders ADD CONSTRAINT print_orders_quantity_check CHECK (quantity >= 1);
  END IF;
END $$;

-- Add new columns (safe: each wrapped in IF NOT EXISTS)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'print_orders') THEN

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'print_orders' AND column_name = 'platform_margin') THEN
      ALTER TABLE public.print_orders ADD COLUMN platform_margin NUMERIC(8,4);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'print_orders' AND column_name = 'member_price') THEN
      ALTER TABLE public.print_orders ADD COLUMN member_price NUMERIC(8,4);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'print_orders' AND column_name = 'credits_charged') THEN
      ALTER TABLE public.print_orders ADD COLUMN credits_charged NUMERIC(12,2) NOT NULL DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'print_orders' AND column_name = 'payment_status') THEN
      ALTER TABLE public.print_orders ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (payment_status IN ('pending','charged','refunded','failed'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'print_orders' AND column_name = 'default_vendor') THEN
      ALTER TABLE public.print_orders ADD COLUMN default_vendor TEXT
        CHECK (default_vendor IN ('moo','printful','challenge_coin','other'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'print_orders' AND column_name = 'producer_id') THEN
      ALTER TABLE public.print_orders ADD COLUMN producer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'print_orders' AND column_name = 'producer_claimed_at') THEN
      ALTER TABLE public.print_orders ADD COLUMN producer_claimed_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'print_orders' AND column_name = 'active_vendor') THEN
      ALTER TABLE public.print_orders ADD COLUMN active_vendor TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'print_orders' AND column_name = 'paid_at') THEN
      ALTER TABLE public.print_orders ADD COLUMN paid_at TIMESTAMPTZ;
    END IF;

  END IF;
END $$;

-- Add producer read policy
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'print_orders') THEN
    DROP POLICY IF EXISTS "Producer view claimed" ON public.print_orders;
    CREATE POLICY "Producer view claimed" ON public.print_orders
      FOR SELECT USING (producer_id = auth.uid());
  END IF;
END $$;

-- ─── 2. ALTER print_batches: add approval gate + vendor columns ──────────────

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'print_batches') THEN

    -- Expand batch_type
    ALTER TABLE public.print_batches DROP CONSTRAINT IF EXISTS print_batches_batch_type_check;
    ALTER TABLE public.print_batches ADD CONSTRAINT print_batches_batch_type_check
      CHECK (batch_type IN ('cue_card','business_card','medallion_coin','merch','mixed'));

    -- Expand status
    ALTER TABLE public.print_batches DROP CONSTRAINT IF EXISTS print_batches_status_check;
    ALTER TABLE public.print_batches ADD CONSTRAINT print_batches_status_check
      CHECK (status IN (
        'aggregating','threshold_met','approved','submitted',
        'in_production','splitting','complete','cancelled'
      ));

    -- Approval gate columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'print_batches' AND column_name = 'requires_approval') THEN
      ALTER TABLE public.print_batches ADD COLUMN requires_approval BOOLEAN NOT NULL DEFAULT true;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'print_batches' AND column_name = 'approved_by') THEN
      ALTER TABLE public.print_batches ADD COLUMN approved_by UUID REFERENCES auth.users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'print_batches' AND column_name = 'approved_at') THEN
      ALTER TABLE public.print_batches ADD COLUMN approved_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'print_batches' AND column_name = 'default_vendor') THEN
      ALTER TABLE public.print_batches ADD COLUMN default_vendor TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'print_batches' AND column_name = 'base_unit_cost') THEN
      ALTER TABLE public.print_batches ADD COLUMN base_unit_cost NUMERIC(8,4);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'print_batches' AND column_name = 'final_unit_cost') THEN
      ALTER TABLE public.print_batches ADD COLUMN final_unit_cost NUMERIC(8,4);
    END IF;

    -- Lower threshold from 500 to 50 for testing
    UPDATE public.print_batches SET threshold_quantity = 50 WHERE threshold_quantity = 500;

  END IF;
END $$;

-- ─── 3. PRODUCTION LEVEL PRICING TABLE ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.print_production_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_type TEXT NOT NULL,
  vendor TEXT NOT NULL,
  product_name TEXT NOT NULL,
  tier_1_qty INTEGER NOT NULL DEFAULT 1,
  tier_1_cost NUMERIC(8,4) NOT NULL,
  tier_2_qty INTEGER,
  tier_2_cost NUMERIC(8,4),
  tier_3_qty INTEGER,
  tier_3_cost NUMERIC(8,4),
  tier_4_qty INTEGER,
  tier_4_cost NUMERIC(8,4),
  margin_pct NUMERIC(5,2) NOT NULL DEFAULT 20.00,
  description TEXT,
  specs JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_type, vendor, product_name)
);

INSERT INTO public.print_production_levels
  (product_type, vendor, product_name, tier_1_qty, tier_1_cost, tier_2_qty, tier_2_cost, tier_3_qty, tier_3_cost, description, specs)
VALUES
  ('business_card', 'moo', 'Moo Original Business Card',
    50, 0.40, 200, 0.30, 400, 0.25,
    'Premium business card with QR code, full color both sides',
    '{"stock": "Original 350gsm", "finish": "Matte or Gloss", "size": "3.5x2in"}'),

  ('business_card', 'moo', 'Moo Luxe Business Card',
    50, 0.80, 200, 0.65, 400, 0.55,
    'Ultra-thick business card with colored seam, QR code, spot gloss available',
    '{"stock": "Luxe 600gsm", "finish": "Spot Gloss optional", "size": "3.5x2in", "color_seam": true}'),

  ('cue_card', 'moo', 'Moo Luxe Cue Card',
    50, 0.80, 200, 0.65, 400, 0.55,
    'Cue card with personalized QR, Hofund channel routing, Luxe stock',
    '{"stock": "Luxe 600gsm", "finish": "Spot Gloss on QR", "size": "3.5x2in"}'),

  ('merch_apparel', 'printful', 'Unisex Staple T-Shirt (Bella+Canvas 3001)',
    1, 9.25, 25, 8.50, 100, 7.75,
    'Standard unisex tee with LB branding',
    '{"brand": "Bella+Canvas", "model": "3001", "fabric": "100% cotton"}'),

  ('merch_print', 'printful', 'Enhanced Matte Poster',
    1, 4.50, 10, 4.00, 50, 3.50,
    'Wall poster with innovation artwork or initiative branding',
    '{"paper": "Enhanced Matte", "sizes": ["12x18", "18x24", "24x36"]}')
ON CONFLICT (product_type, vendor, product_name) DO NOTHING;

ALTER TABLE public.print_production_levels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read pricing" ON public.print_production_levels;
CREATE POLICY "Public read pricing" ON public.print_production_levels FOR SELECT USING (is_active = true);
