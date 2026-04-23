-- ═══════════════════════════════════════════════════════════════════════════════
-- CONSOLIDATED PENDING MIGRATIONS — February 23, 2026
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Run this entire file in Supabase SQL Editor to apply all pending migrations.
--
-- INCLUDED MIGRATIONS (in order):
-- 1. 20260223000010_furnace_anchors_charitable.sql (Furnace + Kindling)
-- 2. 20260223000011_stamps_and_unified_badges.sql (Stamps + Badges)
-- 3. 20260223000012_social_shares.sql (Social sharing)
-- 4. 20260223000015_cue_card_research_toggle.sql (Research Toggle)
--
-- NOTE: RUN_FEB23_FURNACE_STAMPS.sql is a duplicate/earlier version - skip it
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 1: FURNACE + KINDLING (Anchors, Charitable Tiers)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── FURNACE ANCHORS ───
CREATE TABLE IF NOT EXISTS public.furnace_anchors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_hash TEXT UNIQUE NOT NULL,
  anchor_type TEXT NOT NULL DEFAULT 'product',
  owner_id UUID REFERENCES auth.users(id),
  business_id UUID,

  product_name TEXT,
  product_description TEXT,
  product_category TEXT,

  verification_status TEXT DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  verified_by UUID,

  scan_count INTEGER DEFAULT 0,
  last_scanned_at TIMESTAMPTZ,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_furnace_anchors_hash ON public.furnace_anchors(qr_code_hash);
CREATE INDEX IF NOT EXISTS idx_furnace_anchors_owner ON public.furnace_anchors(owner_id);
CREATE INDEX IF NOT EXISTS idx_furnace_anchors_status ON public.furnace_anchors(verification_status);

-- ─── FURNACE SCANS ───
CREATE TABLE IF NOT EXISTS public.furnace_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anchor_id UUID REFERENCES public.furnace_anchors(id),
  scanner_id UUID REFERENCES auth.users(id),
  scanner_ghost_id TEXT,

  scan_location JSONB,
  scan_context TEXT,

  is_authentic BOOLEAN,
  confidence_score DECIMAL(5,4),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_furnace_scans_anchor ON public.furnace_scans(anchor_id);

-- ─── KINDLING TIERS ───
CREATE TABLE IF NOT EXISTS public.kindling_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name TEXT NOT NULL UNIQUE,
  tier_level INTEGER NOT NULL,

  monthly_fee DECIMAL(10,2) DEFAULT 0,
  revenue_share_percent DECIMAL(5,2) DEFAULT 0,

  max_cue_cards INTEGER,
  max_products INTEGER,

  features JSONB DEFAULT '[]',
  charitable_allocation_percent DECIMAL(5,2) DEFAULT 10,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed tiers
INSERT INTO public.kindling_tiers (tier_name, tier_level, monthly_fee, revenue_share_percent, max_cue_cards, max_products, charitable_allocation_percent, features)
VALUES
  ('Spark', 1, 0, 5, 3, 10, 10, '["basic_qr", "furnace_verification"]'),
  ('Ember', 2, 29, 3, 10, 50, 10, '["custom_branding", "analytics", "priority_support"]'),
  ('Flame', 3, 99, 2, 50, 250, 10, '["white_label", "api_access", "dedicated_support"]'),
  ('Blaze', 4, 299, 1, 0, 0, 10, '["unlimited", "custom_integration", "account_manager"]')
ON CONFLICT (tier_name) DO NOTHING;

-- ─── KINDLING SUBSCRIPTIONS ───
CREATE TABLE IF NOT EXISTS public.kindling_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  tier_id UUID REFERENCES public.kindling_tiers(id),

  status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  charitable_pool_contributions DECIMAL(12,2) DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 2: STAMPS + UNIFIED BADGES
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── STAMPS TABLE ───
CREATE TABLE IF NOT EXISTS public.stamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stamp_type TEXT NOT NULL,
  stamp_category TEXT DEFAULT 'achievement',

  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🏅',

  earned_at TIMESTAMPTZ DEFAULT NOW(),
  earned_context JSONB DEFAULT '{}',

  rarity TEXT DEFAULT 'common',
  points INTEGER DEFAULT 10,

  is_displayed BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stamps_user ON public.stamps(user_id);
CREATE INDEX IF NOT EXISTS idx_stamps_type ON public.stamps(stamp_type);
CREATE INDEX IF NOT EXISTS idx_stamps_category ON public.stamps(stamp_category);

-- ─── STAMP DEFINITIONS ───
CREATE TABLE IF NOT EXISTS public.stamp_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stamp_type TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,

  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🏅',

  rarity TEXT DEFAULT 'common',
  points INTEGER DEFAULT 10,

  unlock_criteria JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed some stamp definitions
INSERT INTO public.stamp_definitions (stamp_type, category, name, description, icon, rarity, points)
VALUES
  ('first_share', 'social', 'First Share', 'Shared your first Cue Card', '📤', 'common', 10),
  ('viral_card', 'social', 'Viral Card', 'Cue Card reached 100+ clicks', '🔥', 'rare', 50),
  ('first_sale', 'commerce', 'First Sale', 'Made your first sale', '💰', 'common', 25),
  ('sponsor_5', 'community', 'Sponsor Squad', 'Sponsored 5 new members', '🤝', 'uncommon', 100),
  ('research_contributor', 'research', 'Research Pioneer', 'Contributed to research pool', '🔬', 'uncommon', 30),
  ('template_creator', 'creative', 'Template Creator', 'Created a Cue Card template used by others', '🎨', 'rare', 75)
ON CONFLICT (stamp_type) DO NOTHING;

-- ─── UNIFIED BADGES ───
CREATE TABLE IF NOT EXISTS public.unified_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,

  level INTEGER DEFAULT 1,
  progress INTEGER DEFAULT 0,
  max_progress INTEGER DEFAULT 100,

  unlocked_at TIMESTAMPTZ,
  last_progress_at TIMESTAMPTZ DEFAULT NOW(),

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, badge_type)
);

CREATE INDEX IF NOT EXISTS idx_unified_badges_user ON public.unified_badges(user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 3: SOCIAL SHARES
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── SOCIAL SHARES TABLE ───
CREATE TABLE IF NOT EXISTS public.social_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  ghost_id TEXT,

  share_type TEXT NOT NULL,
  platform TEXT NOT NULL,

  content_id UUID,
  content_type TEXT,

  share_url TEXT,
  post_id TEXT,

  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,

  shared_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_shares_user ON public.social_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_platform ON public.social_shares(platform);
CREATE INDEX IF NOT EXISTS idx_social_shares_content ON public.social_shares(content_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 4: CUE CARD RESEARCH TOGGLE
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── RESEARCH COMMITMENT LOCKS ───
CREATE TABLE IF NOT EXISTS public.research_commitment_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID,

  locked_at TIMESTAMPTZ DEFAULT NOW(),
  satisfied_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '72 hours',

  reason TEXT DEFAULT 'accessed_research_without_sending',
  research_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  campaign_sent_at TIMESTAMPTZ,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_research_locks_user ON public.research_commitment_locks(user_id);
CREATE INDEX IF NOT EXISTS idx_research_locks_active ON public.research_commitment_locks(user_id, is_active) WHERE is_active = true;

-- ─── CUE CARD CAMPAIGNS ───
CREATE TABLE IF NOT EXISTS public.cue_card_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID,

  name TEXT NOT NULL,
  description TEXT,
  template_ids UUID[] DEFAULT '{}',

  research_commitment BOOLEAN DEFAULT false,
  research_commitment_set_at TIMESTAMPTZ,
  research_pool_accessed BOOLEAN DEFAULT false,
  research_pool_accessed_at TIMESTAMPTZ,
  commitment_satisfied BOOLEAN DEFAULT false,
  commitment_satisfied_at TIMESTAMPTZ,

  default_expiration_hours INTEGER DEFAULT 24,
  expiration_type TEXT DEFAULT 'pass_through',

  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  launched_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  cards_sent INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,4) DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_user ON public.cue_card_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_research ON public.cue_card_campaigns(research_commitment) WHERE research_commitment = true;
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.cue_card_campaigns(status);

-- ─── TEMPLATE ATTRIBUTION ───
CREATE TABLE IF NOT EXISTS public.template_attribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  template_id UUID,
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  campaign_id UUID,

  selected_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,

  clicks_generated INTEGER DEFAULT 0,
  conversions_generated INTEGER DEFAULT 0,

  marks_for_selection INTEGER DEFAULT 1,
  marks_for_send INTEGER DEFAULT 0,
  marks_for_clicks DECIMAL(10,2) DEFAULT 0,
  marks_for_conversions INTEGER DEFAULT 0,
  marks_for_derivative INTEGER DEFAULT 0,
  total_marks_awarded DECIMAL(10,2) DEFAULT 1,
  marks_paid_at TIMESTAMPTZ,

  is_derivative BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attribution_template ON public.template_attribution(template_id);
CREATE INDEX IF NOT EXISTS idx_attribution_creator ON public.template_attribution(creator_id);
CREATE INDEX IF NOT EXISTS idx_attribution_user ON public.template_attribution(user_id);

-- ─── RESEARCH POOL AGGREGATES ───
CREATE TABLE IF NOT EXISTS public.research_pool_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  template_type TEXT,
  initiative_slug TEXT,
  expiration_hours INTEGER,
  day_of_week INTEGER,
  hour_of_day INTEGER,

  campaign_count INTEGER DEFAULT 0,
  total_cards_sent INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  avg_conversion_rate DECIMAL(5,4) DEFAULT 0,

  avg_time_to_first_click_minutes INTEGER,
  avg_time_to_conversion_minutes INTEGER,

  computed_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(template_type, initiative_slug, expiration_hours, day_of_week, hour_of_day)
);

CREATE INDEX IF NOT EXISTS idx_research_pool_type ON public.research_pool_aggregates(template_type);

-- ─── COMPARISON FRAME SLOTS ───
CREATE TABLE IF NOT EXISTS public.comparison_frame_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  slot_number INTEGER NOT NULL CHECK (slot_number BETWEEN 1 AND 6),
  template_id UUID,
  user_notes TEXT,

  added_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, slot_number)
);

CREATE INDEX IF NOT EXISTS idx_comparison_user ON public.comparison_frame_slots(user_id);

-- ─── EXPIRATION PRESETS ───
CREATE TABLE IF NOT EXISTS public.expiration_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  benefit_type TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,

  min_hours INTEGER NOT NULL,
  max_hours INTEGER NOT NULL,
  default_hours INTEGER NOT NULL,

  description TEXT,
  urgency_note TEXT,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.expiration_presets (benefit_type, display_name, min_hours, max_hours, default_hours, description, urgency_note)
VALUES
  ('pass_through', 'Pass-Through Discount', 1, 72, 24, 'Discount for customers coming through your cue card', 'Creates urgency for immediate action'),
  ('first_time', 'First-Time Bonus', 24, 168, 48, 'Special offer for new users', 'Gives newcomers time to explore'),
  ('referral', 'Referral Credit', 24, 720, 168, 'Credit for bringing in new members', 'Allows relationship building'),
  ('campaign', 'Campaign Offer', 1, 72, 24, 'Standard marketing campaign', 'Standard urgency window')
ON CONFLICT (benefit_type) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Check if user has active commitment lock
CREATE OR REPLACE FUNCTION public.has_active_commitment_lock(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.research_commitment_locks
    WHERE user_id = p_user_id
      AND is_active = true
      AND satisfied_at IS NULL
      AND expires_at > NOW()
  );
END;
$$;

-- Create commitment lock when accessing research
CREATE OR REPLACE FUNCTION public.create_commitment_lock(
  p_user_id UUID,
  p_project_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_lock_id UUID;
BEGIN
  IF public.has_active_commitment_lock(p_user_id) THEN
    SELECT id INTO v_lock_id
    FROM public.research_commitment_locks
    WHERE user_id = p_user_id AND is_active = true AND satisfied_at IS NULL
    LIMIT 1;
    RETURN v_lock_id;
  END IF;

  INSERT INTO public.research_commitment_locks (user_id, project_id)
  VALUES (p_user_id, p_project_id)
  RETURNING id INTO v_lock_id;

  RETURN v_lock_id;
END;
$$;

-- Satisfy commitment lock when campaign is sent
CREATE OR REPLACE FUNCTION public.satisfy_commitment_lock(
  p_user_id UUID,
  p_campaign_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.research_commitment_locks
  SET
    satisfied_at = NOW(),
    campaign_sent_at = NOW(),
    is_active = false
  WHERE user_id = p_user_id
    AND is_active = true
    AND satisfied_at IS NULL;

  UPDATE public.cue_card_campaigns
  SET
    commitment_satisfied = true,
    commitment_satisfied_at = NOW()
  WHERE id = p_campaign_id;

  RETURN true;
END;
$$;

-- Award Marks to template creator
CREATE OR REPLACE FUNCTION public.award_template_marks(
  p_attribution_id UUID
)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attribution RECORD;
  v_total_marks DECIMAL := 0;
BEGIN
  SELECT * INTO v_attribution
  FROM public.template_attribution
  WHERE id = p_attribution_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  v_total_marks := v_attribution.marks_for_selection;

  IF v_attribution.sent_at IS NOT NULL THEN
    v_total_marks := v_total_marks + 2;
  END IF;

  v_total_marks := v_total_marks + (v_attribution.clicks_generated * 0.1);
  v_total_marks := v_total_marks + v_attribution.conversions_generated;

  IF v_attribution.is_derivative THEN
    v_total_marks := v_total_marks + 5;
  END IF;

  UPDATE public.template_attribution
  SET
    marks_for_send = CASE WHEN sent_at IS NOT NULL THEN 2 ELSE 0 END,
    marks_for_clicks = clicks_generated * 0.1,
    marks_for_conversions = conversions_generated,
    marks_for_derivative = CASE WHEN is_derivative THEN 5 ELSE 0 END,
    total_marks_awarded = v_total_marks,
    marks_paid_at = NOW(),
    updated_at = NOW()
  WHERE id = p_attribution_id;

  RETURN v_total_marks;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.furnace_anchors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.furnace_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kindling_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unified_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_commitment_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cue_card_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_attribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_pool_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comparison_frame_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expiration_presets ENABLE ROW LEVEL SECURITY;

-- Furnace policies
DROP POLICY IF EXISTS "Users view own anchors" ON public.furnace_anchors;
CREATE POLICY "Users view own anchors" ON public.furnace_anchors
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Anyone can verify anchors" ON public.furnace_anchors;
CREATE POLICY "Anyone can verify anchors" ON public.furnace_anchors
  FOR SELECT TO authenticated USING (verification_status = 'verified');

-- Stamps policies
DROP POLICY IF EXISTS "Users view own stamps" ON public.stamps;
CREATE POLICY "Users view own stamps" ON public.stamps
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own stamps" ON public.stamps;
CREATE POLICY "Users manage own stamps" ON public.stamps
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Badges policies
DROP POLICY IF EXISTS "Users manage own badges" ON public.unified_badges;
CREATE POLICY "Users manage own badges" ON public.unified_badges
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Social shares policies
DROP POLICY IF EXISTS "Users manage own shares" ON public.social_shares;
CREATE POLICY "Users manage own shares" ON public.social_shares
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Research toggle policies
DROP POLICY IF EXISTS "Users view own locks" ON public.research_commitment_locks;
CREATE POLICY "Users view own locks" ON public.research_commitment_locks
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own campaigns" ON public.cue_card_campaigns;
CREATE POLICY "Users manage own campaigns" ON public.cue_card_campaigns
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own attribution" ON public.template_attribution;
CREATE POLICY "Users view own attribution" ON public.template_attribution
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = creator_id);

DROP POLICY IF EXISTS "Research pool for committed users" ON public.research_pool_aggregates;
CREATE POLICY "Research pool for committed users" ON public.research_pool_aggregates
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cue_card_campaigns
      WHERE user_id = auth.uid()
        AND research_commitment = true
        AND commitment_satisfied = true
    )
    OR
    public.has_active_commitment_lock(auth.uid())
  );

DROP POLICY IF EXISTS "Users manage own comparison" ON public.comparison_frame_slots;
CREATE POLICY "Users manage own comparison" ON public.comparison_frame_slots
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can read presets" ON public.expiration_presets;
CREATE POLICY "Anyone can read presets" ON public.expiration_presets
  FOR SELECT TO authenticated USING (is_active = true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE
-- ═══════════════════════════════════════════════════════════════════════════════

SELECT 'All pending migrations applied successfully!' as status;
