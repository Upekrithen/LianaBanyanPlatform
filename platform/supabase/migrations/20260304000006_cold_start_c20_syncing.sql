-- ═══════════════════════════════════════════════════════════════
-- COLD START C20 SYNCING LOGIC
-- ═══════════════════════════════════════════════════════════════

-- 1. StoreFront Sync Jobs
-- Tracks the automated or manual syncing of external storefronts
CREATE TABLE IF NOT EXISTS public.biz_storefront_sync_jobs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anchor_id           UUID NOT NULL REFERENCES public.anchors(id) ON DELETE CASCADE,
  owner_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Sync Details
  platform_type       TEXT NOT NULL, -- 'shopify', 'etsy', 'fiverr', 'custom'
  source_url          TEXT NOT NULL,
  
  -- Status
  status              TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  items_synced        INTEGER DEFAULT 0,
  error_message       TEXT,
  
  -- Timestamps
  started_at          TIMESTAMPTZ DEFAULT NOW(),
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sync_jobs_anchor ON public.biz_storefront_sync_jobs(anchor_id);
CREATE INDEX idx_sync_jobs_status ON public.biz_storefront_sync_jobs(status);

-- 2. Ready-Made Bounties (Salt Mines Integration)
-- Pre-defined templates for common business needs
CREATE TABLE IF NOT EXISTS public.ready_made_bounty_templates (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Template Details
  title               TEXT NOT NULL UNIQUE,
  category            TEXT NOT NULL, -- 'design', 'development', 'syncing'
  short_description   TEXT NOT NULL,
  full_description    TEXT NOT NULL,
  
  -- Economics
  suggested_credits_min INTEGER NOT NULL,
  suggested_credits_max INTEGER NOT NULL,
  
  -- Tools/Platforms
  target_platforms    TEXT[], -- e.g., ['Google Sites', 'Squarespace', 'Wix']
  
  is_active           BOOLEAN DEFAULT true,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Seed the Ready-Made Bounties
INSERT INTO public.ready_made_bounty_templates 
  (title, category, short_description, full_description, suggested_credits_min, suggested_credits_max, target_platforms)
VALUES
  ('WYSIWYG Website Setup', 'design', 'Basic website setup using drag-and-drop builders.', 'Need a simple web presence? A Maker will set up a clean, professional 3-page site using your preferred WYSIWYG builder. Includes linking your custom domain and setting up basic contact forms.', 500, 1500, ARRAY['Google Sites', 'Squarespace', 'Wix']),
  
  ('AI App Generation', 'development', 'Rapid prototyping using AI generation tools.', 'Have an idea for a simple web app or internal tool? A Maker will use modern AI generation tools to build a functional prototype based on your prompt.', 1000, 3000, ARRAY['Lovable', 'v0', 'Cursor']),
  
  ('StoreFront Syncing', 'syncing', 'Help linking external stores to the Liana Banyan .biz portal.', 'Need help getting your existing products into the Cold Start C20 system? A Maker will manually extract up to 20 of your best items and format them perfectly for your .biz Kaleidoscope listing.', 300, 800, ARRAY['Etsy', 'Shopify', 'Fiverr'])
ON CONFLICT (title) DO NOTHING;

-- 3. Kaleidoscope Placements
-- Tracks which businesses are featured in the Kaleidoscope based on trust/locality
CREATE TABLE IF NOT EXISTS public.kaleidoscope_placements (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anchor_id           UUID NOT NULL REFERENCES public.anchors(id) ON DELETE CASCADE,
  
  -- Placement Details
  placement_type      TEXT DEFAULT 'organic', -- organic, featured (based on charitable tier)
  postal_code         TEXT NOT NULL,
  category            TEXT NOT NULL,
  
  -- Metrics
  impressions         INTEGER DEFAULT 0,
  clicks              INTEGER DEFAULT 0,
  
  -- Validity
  is_active           BOOLEAN DEFAULT true,
  last_verified_at    TIMESTAMPTZ DEFAULT NOW(),
  
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kaleidoscope_geo ON public.kaleidoscope_placements(postal_code, category);
CREATE INDEX idx_kaleidoscope_active ON public.kaleidoscope_placements(is_active) WHERE is_active = true;

-- RLS
ALTER TABLE public.biz_storefront_sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ready_made_bounty_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kaleidoscope_placements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their sync jobs" ON public.biz_storefront_sync_jobs
  FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Owners can create sync jobs" ON public.biz_storefront_sync_jobs
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Anyone can view bounty templates" ON public.ready_made_bounty_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active kaleidoscope placements" ON public.kaleidoscope_placements
  FOR SELECT USING (is_active = true);
