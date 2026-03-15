-- ════════════════════════════════════════════════════════════════════════════
-- Migration: Canonical DB Propagation + QR-Innovation Linkage + Medallion FK
-- Session 22 — March 15, 2026
-- ════════════════════════════════════════════════════════════════════════════

-- ─── 1. PLATFORM CANONICAL (Single Source of Truth) ──────────────────────────

CREATE TABLE IF NOT EXISTS public.platform_canonical (
  key TEXT PRIMARY KEY,
  value NUMERIC,
  value_text TEXT,
  description TEXT,
  last_updated_by TEXT DEFAULT 'system',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.platform_canonical (key, value, value_text, description) VALUES
  ('innovation_count', 1662, NULL, 'Total innovations in registry'),
  ('crown_jewels', 123, NULL, 'First 123 flagship innovations (Bags 1-10)'),
  ('patent_applications', 7, NULL, 'USPTO provisional applications filed'),
  ('patent_claims', 1336, NULL, 'Total formal claims across 7 provisionals'),
  ('domains', 14, NULL, 'Major innovation domains'),
  ('initiatives', 16, NULL, 'The Sweet Sixteen initiatives'),
  ('membership_cost', 5, NULL, 'Annual membership in dollars'),
  ('creator_keeps_pct', 83.3, NULL, 'Creator/worker percentage per transaction'),
  ('platform_margin_pct', 20, NULL, 'Cost + 20% margin'),
  ('spec_expanded', 653, NULL, 'Innovations with full patent-quality specs'),
  ('portfolio_value_low', 9000000, NULL, 'Conservative portfolio valuation'),
  ('portfolio_value_high', 80000000, NULL, 'Optimistic portfolio valuation'),
  ('personal_investment', 525000, NULL, 'Founder personal investment'),
  ('investment_years', 9, NULL, 'Years of development')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.platform_canonical ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read canonical" ON public.platform_canonical;
CREATE POLICY "Public read canonical" ON public.platform_canonical FOR SELECT USING (true);

-- ─── 2. QR → INNOVATION LINKAGE ─────────────────────────────────────────────

-- 2a. Add innovation FK to existing qr_codes table (only if qr_codes exists)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'qr_codes'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'qr_codes' AND column_name = 'innovation_id'
  ) THEN
    ALTER TABLE public.qr_codes
    ADD COLUMN innovation_id UUID REFERENCES public.innovation_log(id) ON DELETE SET NULL;
    COMMENT ON COLUMN public.qr_codes.innovation_id IS
      'Optional link to a specific innovation. Nullable — products still use product_id.';
  END IF;
END $$;

-- 2b. Pedestal → Innovation junction table (only if pedestals table exists)
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pedestals') THEN

  CREATE TABLE IF NOT EXISTS public.pedestal_innovations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedestal_id UUID NOT NULL REFERENCES public.pedestals(id) ON DELETE CASCADE,
    innovation_number INTEGER NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    added_by UUID REFERENCES auth.users(id),
    ledger_entry_id UUID REFERENCES public.ip_ledger(id),
    UNIQUE(pedestal_id, innovation_number)
  );

  CREATE INDEX IF NOT EXISTS idx_pedestal_innovations_pedestal ON public.pedestal_innovations(pedestal_id);
  CREATE INDEX IF NOT EXISTS idx_pedestal_innovations_innovation ON public.pedestal_innovations(innovation_number);

  ALTER TABLE public.pedestal_innovations ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "Public read pedestal innovations" ON public.pedestal_innovations;
  CREATE POLICY "Public read pedestal innovations" ON public.pedestal_innovations FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Curator manage pedestal innovations" ON public.pedestal_innovations;
  CREATE POLICY "Curator manage pedestal innovations" ON public.pedestal_innovations FOR ALL USING (
    EXISTS (SELECT 1 FROM public.pedestals p WHERE p.id = pedestal_id AND p.curator_member_id = auth.uid())
  );

  -- 2c. Pedestal innovation history (immutable ledger)
  CREATE TABLE IF NOT EXISTS public.pedestal_innovation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedestal_id UUID NOT NULL REFERENCES public.pedestals(id) ON DELETE CASCADE,
    innovation_number INTEGER NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('added', 'removed', 'rebalanced')),
    reason TEXT,
    performed_by UUID REFERENCES auth.users(id),
    ledger_entry_id UUID REFERENCES public.ip_ledger(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  ALTER TABLE public.pedestal_innovation_history ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "Public read pedestal history" ON public.pedestal_innovation_history;
  CREATE POLICY "Public read pedestal history" ON public.pedestal_innovation_history FOR SELECT USING (true);

END IF;
END $$;

-- 2d. Portfolio QR codes for brand/pedestal/ledger routing
CREATE TABLE IF NOT EXISTS public.portfolio_qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  qr_type TEXT NOT NULL CHECK (qr_type IN ('brand', 'pedestal', 'upekrithen_ledger', 'initiative', 'bag')),
  target_pedestal_id UUID,
  target_initiative TEXT,
  target_bag TEXT,
  code TEXT UNIQUE NOT NULL DEFAULT 'PQR-' || gen_random_uuid()::text,
  label TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  scan_count INTEGER NOT NULL DEFAULT 0,
  last_scanned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolio_qr_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage portfolio qr" ON public.portfolio_qr_codes;
CREATE POLICY "Owner manage portfolio qr" ON public.portfolio_qr_codes FOR ALL USING (owner_id = auth.uid());
DROP POLICY IF EXISTS "Public scan portfolio qr" ON public.portfolio_qr_codes;
CREATE POLICY "Public scan portfolio qr" ON public.portfolio_qr_codes FOR SELECT USING (is_active = true);

-- ─── 3. MEDALLION → INNOVATION JUNCTION TABLE ───────────────────────────────
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'member_medallion_collection') THEN

  CREATE TABLE IF NOT EXISTS public.medallion_innovations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medallion_id UUID NOT NULL REFERENCES public.member_medallion_collection(id) ON DELETE CASCADE,
    innovation_number INTEGER NOT NULL,
    attribution_type TEXT NOT NULL DEFAULT 'included'
      CHECK (attribution_type IN ('included', 'primary', 'featured')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_medallion_innovations_unique
    ON public.medallion_innovations(medallion_id, innovation_number);
  CREATE INDEX IF NOT EXISTS idx_medallion_innovations_innovation
    ON public.medallion_innovations(innovation_number);

  ALTER TABLE public.medallion_innovations ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "Public read medallion innovations" ON public.medallion_innovations;
  CREATE POLICY "Public read medallion innovations" ON public.medallion_innovations FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Owner manage medallion innovations" ON public.medallion_innovations;
  CREATE POLICY "Owner manage medallion innovations" ON public.medallion_innovations FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.member_medallion_collection m
      WHERE m.id = medallion_id AND m.user_id = auth.uid()
    )
  );

END IF;
END $$;

-- Trigger: auto-seed Crown Jewels when a medallion is minted
CREATE OR REPLACE FUNCTION public.seed_medallion_innovations()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.medallion_type IN ('founder', 'member', '2ndsecond') THEN
    INSERT INTO public.medallion_innovations (medallion_id, innovation_number, attribution_type)
    SELECT NEW.id, il.innovation_number,
      CASE WHEN il.innovation_number <= 37 THEN 'primary' ELSE 'included' END
    FROM public.innovation_log il
    WHERE il.innovation_number BETWEEN 1 AND 123
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'member_medallion_collection') THEN
  DROP TRIGGER IF EXISTS trg_seed_medallion_innovations ON public.member_medallion_collection;
  CREATE TRIGGER trg_seed_medallion_innovations
    AFTER INSERT ON public.member_medallion_collection
    FOR EACH ROW EXECUTE FUNCTION public.seed_medallion_innovations();
END IF;
END $$;

-- ─── 4. PRINT PIPELINE ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.print_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_type TEXT NOT NULL CHECK (order_type IN ('cue_card', 'business_card', 'medallion_card', 'deck')),
  template_id UUID,
  personalization JSONB NOT NULL DEFAULT '{}',
  quantity INTEGER NOT NULL DEFAULT 100 CHECK (quantity >= 25),
  unit_cost NUMERIC(8,4),
  total_cost NUMERIC(12,2),
  vendor TEXT,
  vendor_order_id TEXT,
  shipping_address JSONB,
  shipping_method TEXT DEFAULT 'standard',
  tracking_number TEXT,
  shipping_carrier TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'waitlist', 'batch_ready', 'submitted',
    'in_production', 'shipped', 'delivered', 'cancelled'
  )),
  batch_id UUID,
  submitted_at TIMESTAMPTZ,
  production_started_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.print_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_type TEXT NOT NULL CHECK (batch_type IN ('cue_card', 'business_card', 'mixed')),
  total_quantity INTEGER NOT NULL DEFAULT 0,
  order_count INTEGER NOT NULL DEFAULT 0,
  volume_discount_pct NUMERIC(5,2) DEFAULT 0,
  vendor TEXT,
  vendor_batch_id TEXT,
  status TEXT NOT NULL DEFAULT 'aggregating' CHECK (status IN (
    'aggregating', 'threshold_met', 'submitted',
    'in_production', 'splitting', 'complete'
  )),
  threshold_quantity INTEGER NOT NULL DEFAULT 500,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_print_batch' AND table_name = 'print_orders'
  ) THEN
    ALTER TABLE public.print_orders ADD CONSTRAINT fk_print_batch
      FOREIGN KEY (batch_id) REFERENCES public.print_batches(id) ON DELETE SET NULL;
  END IF;
END $$;

ALTER TABLE public.print_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage print orders" ON public.print_orders;
CREATE POLICY "Owner manage print orders" ON public.print_orders FOR ALL USING (user_id = auth.uid());

ALTER TABLE public.print_batches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read print batches" ON public.print_batches;
CREATE POLICY "Public read print batches" ON public.print_batches FOR SELECT USING (true);

-- ─── 5. HOFUND CHANNEL 5: IP PORTFOLIO ───────────────────────────────────────
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'hofund_channels') THEN
  INSERT INTO public.hofund_channels (user_id, channel_number, channel_name, channel_type, destination_url, icon, is_active)
  SELECT DISTINCT user_id, 5, 'IP Portfolio', 'platform', '/ip-portfolio', '🏛️', true
  FROM public.hofund_channels
  WHERE NOT EXISTS (
    SELECT 1 FROM public.hofund_channels h2
    WHERE h2.user_id = hofund_channels.user_id AND h2.channel_number = 5
  )
  ON CONFLICT DO NOTHING;
END IF;
END $$;
