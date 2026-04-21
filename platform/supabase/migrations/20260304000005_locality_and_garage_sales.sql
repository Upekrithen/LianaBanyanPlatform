-- ═══════════════════════════════════════════════════════════════
-- LOCALITY, MAPS, AND GARAGE SALES
-- ═══════════════════════════════════════════════════════════════

-- 1. Add Locality to Anchors (Businesses)
-- Allows filtering storefronts and businesses by zip, city, or lat/long
ALTER TABLE public.anchors
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS region TEXT, -- State/Province
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'US',
ADD COLUMN IF NOT EXISTS is_local_pickup_available BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_anchors_postal_code ON public.anchors(postal_code);
CREATE INDEX IF NOT EXISTS idx_anchors_city ON public.anchors(city);

-- 2. Family Table: Garage Sales
-- Integrating neighborhood garage sales into the Family Table ecosystem
CREATE TABLE IF NOT EXISTS public.family_garage_sales (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id             UUID NOT NULL REFERENCES auth.users(id),

  -- Details
  title               TEXT NOT NULL,
  description         TEXT,

  -- Locality
  latitude            DECIMAL(10, 8),
  longitude           DECIMAL(11, 8),
  address_text        TEXT NOT NULL,
  city                TEXT,
  postal_code         TEXT,

  -- Schedule
  start_time          TIMESTAMPTZ NOT NULL,
  end_time            TIMESTAMPTZ NOT NULL,

  -- Status
  status              TEXT DEFAULT 'scheduled', -- scheduled, active, completed, canceled

  -- Liana Banyan Integration
  accepts_marks       BOOLEAN DEFAULT true,
  marks_discount_pct  INTEGER DEFAULT 10, -- Discount if paying in Marks

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_garage_sales_locality ON public.family_garage_sales(postal_code, city);
CREATE INDEX idx_garage_sales_status ON public.family_garage_sales(status);
CREATE INDEX idx_garage_sales_dates ON public.family_garage_sales(start_time, end_time);

-- RLS
ALTER TABLE public.family_garage_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view garage sales" ON public.family_garage_sales
  FOR SELECT USING (true);
CREATE POLICY "Hosts can manage their garage sales" ON public.family_garage_sales
  FOR ALL USING (auth.uid() = host_id);
