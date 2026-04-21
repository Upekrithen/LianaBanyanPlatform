-- ═══════════════════════════════════════════════════════════════════════════════
-- CORRECTED MIGRATIONS — February 23, 2026
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- LESSON LEARNED: The `stamps` table already exists for Cue Card QR authentication.
-- Renaming achievement stamps to `achievement_badges` to avoid collision.
--
-- This migration ONLY creates tables that don't already exist.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 1: FURNACE SYSTEM (QR Verification Registry)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Furnace anchors - products/items registered for verification
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

-- Furnace scans - verification attempts
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

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 2: KINDLING TIERS (External Business Subscriptions)
-- ═══════════════════════════════════════════════════════════════════════════════

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

-- Seed tiers (only if table was just created)
INSERT INTO public.kindling_tiers (tier_name, tier_level, monthly_fee, revenue_share_percent, max_cue_cards, max_products, charitable_allocation_percent, features)
VALUES
  ('Spark', 1, 0, 5, 3, 10, 10, '["basic_qr", "furnace_verification"]'),
  ('Ember', 2, 29, 3, 10, 50, 10, '["custom_branding", "analytics", "priority_support"]'),
  ('Flame', 3, 99, 2, 50, 250, 10, '["white_label", "api_access", "dedicated_support"]'),
  ('Blaze', 4, 299, 1, 0, 0, 10, '["unlimited", "custom_integration", "account_manager"]')
ON CONFLICT (tier_name) DO NOTHING;

-- Kindling subscriptions
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
-- PART 3: ACHIEVEMENT BADGES (renamed from stamps to avoid collision)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Achievement badge definitions
CREATE TABLE IF NOT EXISTS public.achievement_badge_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_type TEXT UNIQUE NOT NULL,
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

-- Seed badge definitions
INSERT INTO public.achievement_badge_definitions (badge_type, category, name, description, icon, rarity, points)
VALUES
  ('first_share', 'social', 'First Share', 'Shared your first Cue Card', '📤', 'common', 10),
  ('viral_card', 'social', 'Viral Card', 'Cue Card reached 100+ clicks', '🔥', 'rare', 50),
  ('first_sale', 'commerce', 'First Sale', 'Made your first sale', '💰', 'common', 25),
  ('sponsor_5', 'community', 'Sponsor Squad', 'Sponsored 5 new members', '🤝', 'uncommon', 100),
  ('research_contributor', 'research', 'Research Pioneer', 'Contributed to research pool', '🔬', 'uncommon', 30),
  ('template_creator', 'creative', 'Template Creator', 'Created a Cue Card template used by others', '🎨', 'rare', 75)
ON CONFLICT (badge_type) DO NOTHING;

-- User achievement badges (earned badges)
CREATE TABLE IF NOT EXISTS public.user_achievement_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  badge_category TEXT DEFAULT 'achievement',

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

CREATE INDEX IF NOT EXISTS idx_user_achievement_badges_user ON public.user_achievement_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievement_badges_type ON public.user_achievement_badges(badge_type);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 4: SOCIAL SHARES
-- ═══════════════════════════════════════════════════════════════════════════════

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

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 5: CUE CARD RESEARCH TOGGLE SYSTEM
-- ═══════════════════════════════════════════════════════════════════════════════

-- Research commitment locks
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

-- Cue card campaigns
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
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.cue_card_campaigns(status);

-- Template attribution (Marks for creators)
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

CREATE INDEX IF NOT EXISTS idx_attribution_creator ON public.template_attribution(creator_id);
CREATE INDEX IF NOT EXISTS idx_attribution_user ON public.template_attribution(user_id);

-- Research pool aggregates (anonymized)
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

-- Comparison frame slots (6-slot drag-and-drop)
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

-- Expiration presets
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
-- PART 6: FUNCTIONS
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

-- Create commitment lock
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

-- Satisfy commitment lock
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

-- Award template marks
CREATE OR REPLACE FUNCTION public.award_template_marks(p_attribution_id UUID)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attribution RECORD;
  v_total_marks DECIMAL := 0;
BEGIN
  SELECT * INTO v_attribution FROM public.template_attribution WHERE id = p_attribution_id;
  IF NOT FOUND THEN RETURN 0; END IF;

  v_total_marks := v_attribution.marks_for_selection;
  IF v_attribution.sent_at IS NOT NULL THEN v_total_marks := v_total_marks + 2; END IF;
  v_total_marks := v_total_marks + (v_attribution.clicks_generated * 0.1);
  v_total_marks := v_total_marks + v_attribution.conversions_generated;
  IF v_attribution.is_derivative THEN v_total_marks := v_total_marks + 5; END IF;

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
-- PART 7: RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.furnace_anchors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.furnace_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kindling_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievement_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_commitment_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cue_card_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_attribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_pool_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comparison_frame_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expiration_presets ENABLE ROW LEVEL SECURITY;

-- Furnace
DROP POLICY IF EXISTS "Users view own anchors" ON public.furnace_anchors;
CREATE POLICY "Users view own anchors" ON public.furnace_anchors
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Anyone can verify anchors" ON public.furnace_anchors;
CREATE POLICY "Anyone can verify anchors" ON public.furnace_anchors
  FOR SELECT TO authenticated USING (verification_status = 'verified');

-- Achievement badges
DROP POLICY IF EXISTS "Users manage own achievement badges" ON public.user_achievement_badges;
CREATE POLICY "Users manage own achievement badges" ON public.user_achievement_badges
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Social shares
DROP POLICY IF EXISTS "Users manage own shares" ON public.social_shares;
CREATE POLICY "Users manage own shares" ON public.social_shares
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Research toggle
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
    OR public.has_active_commitment_lock(auth.uid())
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

SELECT 'Corrected migration applied successfully!' as status;
