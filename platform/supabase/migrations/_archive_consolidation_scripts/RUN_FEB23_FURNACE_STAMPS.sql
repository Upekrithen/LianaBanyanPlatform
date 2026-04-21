-- ═══════════════════════════════════════════════════════════════
-- COMBINED MIGRATION: Furnace + Anchors + Stamps + Badges
-- Run this file to set up the complete Slingshot/Furnace system
-- February 23, 2026
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- PART 1: CHARITABLE BUSINESS TIERS (must be first for FK)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.charitable_business_tiers (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name           TEXT NOT NULL UNIQUE,
  tier_level          INTEGER NOT NULL,
  display_name        TEXT NOT NULL,
  icon                TEXT NOT NULL,
  badge_color         TEXT NOT NULL,
  description         TEXT,
  min_donation_percent DECIMAL(5,2) NOT NULL,
  max_donation_percent DECIMAL(5,2),
  trust_score_bonus   INTEGER DEFAULT 0,
  featured_placement  BOOLEAN DEFAULT false,
  matching_eligible   BOOLEAN DEFAULT false,
  matching_cap_percent DECIMAL(5,2),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.charitable_business_tiers
  (tier_name, tier_level, display_name, icon, badge_color, description, min_donation_percent, max_donation_percent, trust_score_bonus, featured_placement, matching_eligible, matching_cap_percent)
VALUES
  ('ember', 1, 'Ember Partner', '🔥', 'orange-300', 'Entry-level charitable partnership', 1.00, 2.99, 5, false, false, NULL),
  ('flame', 2, 'Flame Partner', '🔥🔥', 'orange-500', 'Growing commitment to community benefit', 3.00, 4.99, 10, false, true, 25.00),
  ('blaze', 3, 'Blaze Partner', '🔥🔥🔥', 'orange-600', 'Significant contributor to initiative funding', 5.00, 9.99, 15, true, true, 50.00),
  ('inferno', 4, 'Inferno Partner', '🔥🔥🔥🔥', 'orange-700', 'Maximum commitment - Leading by example', 10.00, NULL, 25, true, true, 100.00)
ON CONFLICT (tier_name) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- PART 2: ANCHORS (External Business Destinations)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.anchors (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_url     TEXT NOT NULL,
  display_name        TEXT NOT NULL,
  description         TEXT,
  business_type       TEXT,
  verification_method TEXT,
  verification_code   TEXT,
  verified_at         TIMESTAMPTZ,
  is_verified         BOOLEAN DEFAULT false,
  pass_through_level  INTEGER DEFAULT 1,
  charitable_tier_id  UUID REFERENCES public.charitable_business_tiers(id),
  trust_score         INTEGER DEFAULT 50,
  total_pass_throughs INTEGER DEFAULT 0,
  status              TEXT DEFAULT 'pending',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anchors_owner ON public.anchors(owner_id);
CREATE INDEX IF NOT EXISTS idx_anchors_verified ON public.anchors(is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_anchors_status ON public.anchors(status);

-- ═══════════════════════════════════════════════════════════════
-- PART 3: STAMPS (Member QR Identity)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.stamps (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stamp_code          TEXT NOT NULL UNIQUE,
  public_key          TEXT,
  private_key_hash    TEXT,
  display_name        TEXT,
  avatar_url          TEXT,
  default_anchor_id   UUID REFERENCES public.anchors(id),
  total_cue_cards     INTEGER DEFAULT 0,
  total_scans         INTEGER DEFAULT 0,
  total_pass_throughs INTEGER DEFAULT 0,
  is_active           BOOLEAN DEFAULT true,
  revoked_at          TIMESTAMPTZ,
  revoke_reason       TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_stamps_user ON public.stamps(user_id);
CREATE INDEX IF NOT EXISTS idx_stamps_code ON public.stamps(stamp_code);

-- ═══════════════════════════════════════════════════════════════
-- PART 4: CUE CARD REGISTRY
-- ═══════════════════════════════════════════════════════════════

-- Create table without stamp_id first (in case stamps table doesn't exist yet)
CREATE TABLE IF NOT EXISTS public.cue_card_registry (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payload_hash        TEXT NOT NULL UNIQUE,
  template_id         UUID REFERENCES public.cue_card_templates(id),
  creator_id          UUID NOT NULL REFERENCES auth.users(id),
  anchor_id           UUID REFERENCES public.anchors(id),
  signature           TEXT NOT NULL,
  security_state      TEXT DEFAULT 'valid',
  total_scans         INTEGER DEFAULT 0,
  total_verifications INTEGER DEFAULT 0,
  first_seen          TIMESTAMPTZ DEFAULT NOW(),
  last_seen           TIMESTAMPTZ,
  trust_score         INTEGER DEFAULT 50,
  report_count        INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Add stamp_id column if it doesn't exist (stamps table was created in PART 3)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'cue_card_registry'
    AND column_name = 'stamp_id'
  ) THEN
    ALTER TABLE public.cue_card_registry ADD COLUMN stamp_id UUID REFERENCES public.stamps(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_cue_card_registry_hash ON public.cue_card_registry(payload_hash);
CREATE INDEX IF NOT EXISTS idx_cue_card_registry_creator ON public.cue_card_registry(creator_id);
CREATE INDEX IF NOT EXISTS idx_cue_card_registry_stamp ON public.cue_card_registry(stamp_id);
CREATE INDEX IF NOT EXISTS idx_cue_card_registry_anchor ON public.cue_card_registry(anchor_id);

-- ═══════════════════════════════════════════════════════════════
-- PART 5: FURNACE TABLES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.furnace_verifications (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cue_card_id         UUID REFERENCES public.cue_card_registry(id),
  payload_checked     TEXT,
  verification_method TEXT NOT NULL,
  result              TEXT NOT NULL,
  trust_score_shown   INTEGER,
  ip_hash             TEXT,
  user_agent_hash     TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_furnace_verifications_card ON public.furnace_verifications(cue_card_id);
CREATE INDEX IF NOT EXISTS idx_furnace_verifications_result ON public.furnace_verifications(result);

CREATE TABLE IF NOT EXISTS public.furnace_reports (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cue_card_id         UUID REFERENCES public.cue_card_registry(id),
  payload_data        JSONB,
  image_url           TEXT,
  reporter_id         UUID REFERENCES auth.users(id),
  reporter_email      TEXT,
  report_type         TEXT NOT NULL,
  description         TEXT,
  status              TEXT DEFAULT 'pending',
  reviewed_by         UUID REFERENCES auth.users(id),
  reviewed_at         TIMESTAMPTZ,
  resolution_notes    TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_furnace_reports_status ON public.furnace_reports(status);

-- ═══════════════════════════════════════════════════════════════
-- PART 6: SLINGSHOT PASS-THROUGH TABLES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.slingshot_pass_throughs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cue_card_id         UUID REFERENCES public.cue_card_registry(id),
  anchor_id           UUID NOT NULL REFERENCES public.anchors(id),
  level               INTEGER NOT NULL,
  user_coupon_issued  BOOLEAN DEFAULT false,
  user_coupon_id      UUID,
  marks_earned        INTEGER DEFAULT 0,
  ip_hash             TEXT,
  referrer_hash       TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_slingshot_anchor ON public.slingshot_pass_throughs(anchor_id);
CREATE INDEX IF NOT EXISTS idx_slingshot_card ON public.slingshot_pass_throughs(cue_card_id);

CREATE TABLE IF NOT EXISTS public.user_coupons (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_code         TEXT NOT NULL UNIQUE,
  pass_through_id     UUID REFERENCES public.slingshot_pass_throughs(id),
  anchor_id           UUID REFERENCES public.anchors(id),
  scope               TEXT DEFAULT 'single_transaction',
  valid_transactions  INTEGER DEFAULT 1,
  used_transactions   INTEGER DEFAULT 0,
  expires_at          TIMESTAMPTZ NOT NULL,
  is_active           BOOLEAN DEFAULT true,
  converted_to_member BOOLEAN DEFAULT false,
  converted_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_coupons_code ON public.user_coupons(coupon_code);
CREATE INDEX IF NOT EXISTS idx_user_coupons_anchor ON public.user_coupons(anchor_id);

-- ═══════════════════════════════════════════════════════════════
-- PART 7: CHARITABLE DONATIONS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.charitable_business_donations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anchor_id           UUID NOT NULL REFERENCES public.anchors(id),
  business_owner_id   UUID NOT NULL REFERENCES auth.users(id),
  transaction_amount  DECIMAL(12,2) NOT NULL,
  donation_percent    DECIMAL(5,2) NOT NULL,
  donation_amount     DECIMAL(12,2) NOT NULL,
  initiative_slug     TEXT,
  matching_eligible   BOOLEAN DEFAULT false,
  matching_amount     DECIMAL(12,2) DEFAULT 0,
  matching_source     TEXT,
  transaction_date    TIMESTAMPTZ NOT NULL,
  recorded_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_charitable_donations_anchor ON public.charitable_business_donations(anchor_id);
CREATE INDEX IF NOT EXISTS idx_charitable_donations_initiative ON public.charitable_business_donations(initiative_slug);

CREATE TABLE IF NOT EXISTS public.charitable_matching_pool (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_name           TEXT NOT NULL DEFAULT 'patent_fund_matching',
  total_allocated     DECIMAL(12,2) DEFAULT 0,
  total_matched       DECIMAL(12,2) DEFAULT 0,
  current_balance     DECIMAL(12,2) DEFAULT 0,
  annual_cap          DECIMAL(12,2),
  per_business_cap    DECIMAL(12,2),
  period_start        DATE,
  period_end          DATE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- PART 8: BADGE SYSTEM
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.badge_types (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_code          TEXT NOT NULL UNIQUE,
  badge_category      TEXT NOT NULL,
  display_name        TEXT NOT NULL,
  description         TEXT,
  icon                TEXT NOT NULL,
  badge_color         TEXT,
  requirement_type    TEXT,
  requirement_value   DECIMAL(12,2),
  tier_level          INTEGER DEFAULT 1,
  tier_name           TEXT,
  trust_score_bonus   INTEGER DEFAULT 0,
  featured_placement  BOOLEAN DEFAULT false,
  is_active           BOOLEAN DEFAULT true,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.badge_types
  (badge_code, badge_category, display_name, description, icon, badge_color, requirement_type, requirement_value, tier_level, tier_name, trust_score_bonus)
VALUES
  ('sponsor_seedling', 'sponsorship', 'Seedling Sponsor', 'Sponsored 25+ Credits', '🌱', 'green-300', 'credits_sponsored', 25, 1, 'seedling', 2),
  ('sponsor_sapling', 'sponsorship', 'Sapling Sponsor', 'Sponsored 100+ Credits', '🌿', 'green-400', 'credits_sponsored', 100, 2, 'sapling', 5),
  ('sponsor_tree', 'sponsorship', 'Tree Sponsor', 'Sponsored 500+ Credits', '🌳', 'green-500', 'credits_sponsored', 500, 3, 'tree', 10),
  ('sponsor_grove', 'sponsorship', 'Grove Sponsor', 'Sponsored 1000+ Credits', '🌲', 'green-600', 'credits_sponsored', 1000, 4, 'grove', 15),
  ('sponsor_forest', 'sponsorship', 'Forest Sponsor', 'Sponsored 5000+ Credits', '🏔️', 'green-700', 'credits_sponsored', 5000, 5, 'forest', 25),
  ('kindling_ember', 'charitable', 'Ember Partner', 'Donates 1-2.99 percent of sales', '🔥', 'orange-300', 'donation_percent', 1, 1, 'ember', 5),
  ('kindling_flame', 'charitable', 'Flame Partner', 'Donates 3-4.99 percent of sales', '🔥🔥', 'orange-500', 'donation_percent', 3, 2, 'flame', 10),
  ('kindling_blaze', 'charitable', 'Blaze Partner', 'Donates 5-9.99 percent of sales', '🔥🔥🔥', 'orange-600', 'donation_percent', 5, 3, 'blaze', 15),
  ('kindling_inferno', 'charitable', 'Inferno Partner', 'Donates 10+ percent of sales', '🔥🔥🔥🔥', 'orange-700', 'donation_percent', 10, 4, 'inferno', 25),
  ('initiative_helper', 'initiative', 'Initiative Helper', 'Contributed 50+ Credits to initiatives', '🤝', 'blue-300', 'initiative_credits', 50, 1, 'helper', 3),
  ('initiative_supporter', 'initiative', 'Initiative Supporter', 'Contributed 200+ Credits to initiatives', '💪', 'blue-400', 'initiative_credits', 200, 2, 'supporter', 7),
  ('initiative_champion', 'initiative', 'Initiative Champion', 'Contributed 1000+ Credits to initiatives', '🏆', 'blue-500', 'initiative_credits', 1000, 3, 'champion', 15),
  ('initiative_legend', 'initiative', 'Initiative Legend', 'Contributed 5000+ Credits to initiatives', '👑', 'blue-600', 'initiative_credits', 5000, 4, 'legend', 25),
  ('early_adopter', 'achievement', 'Early Adopter', 'Joined in the first year', '⭐', 'yellow-400', NULL, NULL, 1, NULL, 5),
  ('founding_300', 'achievement', 'The 300', 'One of the first 300 strategic allies', '🛡️', 'amber-500', NULL, NULL, 1, NULL, 10),
  ('patent_contributor', 'achievement', 'Patent Contributor', 'Contributed to a filed patent', '📜', 'purple-400', NULL, NULL, 1, NULL, 10),
  ('cascade_starter', 'achievement', 'Cascade Starter', 'Sponsorship cascaded to 10+ people', '🌊', 'cyan-400', 'cascade_depth', 10, 1, NULL, 8),
  ('verified_business', 'trust', 'Verified Business', 'Business verified through The Furnace', '✓', 'emerald-400', NULL, NULL, 1, NULL, 5),
  ('trusted_anchor', 'trust', 'Trusted Anchor', 'Anchor with 90+ trust score', '🔒', 'emerald-500', 'trust_score', 90, 1, NULL, 10)
ON CONFLICT (badge_code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.member_badges (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type_id       UUID NOT NULL REFERENCES public.badge_types(id),
  earned_for          TEXT,
  related_entity_id   UUID,
  related_entity_type TEXT,
  metric_value        DECIMAL(12,2),
  is_visible          BOOLEAN DEFAULT true,
  is_featured         BOOLEAN DEFAULT false,
  earned_at           TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_type_id)
);

CREATE INDEX IF NOT EXISTS idx_member_badges_user ON public.member_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_member_badges_type ON public.member_badges(badge_type_id);

CREATE TABLE IF NOT EXISTS public.initiative_contributions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  initiative_slug     TEXT NOT NULL,
  initiative_name     TEXT,
  credit_amount       DECIMAL(12,2) NOT NULL,
  contribution_type   TEXT NOT NULL,
  source_entity_id    UUID,
  source_entity_type  TEXT,
  contributed_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_initiative_contributions_user ON public.initiative_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_initiative_contributions_initiative ON public.initiative_contributions(initiative_slug);

-- ═══════════════════════════════════════════════════════════════
-- PART 9: RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.charitable_business_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anchors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cue_card_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.furnace_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.furnace_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slingshot_pass_throughs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charitable_business_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initiative_contributions ENABLE ROW LEVEL SECURITY;

-- Public read policies
DROP POLICY IF EXISTS "Anyone can view charitable tiers" ON public.charitable_business_tiers;
CREATE POLICY "Anyone can view charitable tiers" ON public.charitable_business_tiers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view badge types" ON public.badge_types;
CREATE POLICY "Anyone can view badge types" ON public.badge_types FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can verify cards" ON public.cue_card_registry;
CREATE POLICY "Anyone can verify cards" ON public.cue_card_registry FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can verify stamps" ON public.stamps;
CREATE POLICY "Public can verify stamps" ON public.stamps FOR SELECT USING (true);

-- User policies
DROP POLICY IF EXISTS "Users can view their own anchors" ON public.anchors;
CREATE POLICY "Users can view their own anchors" ON public.anchors FOR SELECT USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can create anchors" ON public.anchors;
CREATE POLICY "Users can create anchors" ON public.anchors FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update their own anchors" ON public.anchors;
CREATE POLICY "Users can update their own anchors" ON public.anchors FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can view their own badges" ON public.member_badges;
CREATE POLICY "Users can view their own badges" ON public.member_badges FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public can view visible badges" ON public.member_badges;
CREATE POLICY "Public can view visible badges" ON public.member_badges FOR SELECT USING (is_visible = true);

DROP POLICY IF EXISTS "Users can view their own contributions" ON public.initiative_contributions;
CREATE POLICY "Users can view their own contributions" ON public.initiative_contributions FOR SELECT USING (auth.uid() = user_id);

-- Insert policies
DROP POLICY IF EXISTS "Anyone can log verification" ON public.furnace_verifications;
CREATE POLICY "Anyone can log verification" ON public.furnace_verifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can submit report" ON public.furnace_reports;
CREATE POLICY "Anyone can submit report" ON public.furnace_reports FOR INSERT WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- PART 10: HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.create_user_stamp(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_stamp_id UUID;
  v_stamp_code TEXT;
BEGIN
  v_stamp_code := 'ST-' || TO_CHAR(NOW(), 'YYMM') || '-' || UPPER(SUBSTR(gen_random_uuid()::text, 1, 4));

  INSERT INTO public.stamps (user_id, stamp_code)
  VALUES (p_user_id, v_stamp_code)
  ON CONFLICT (user_id) DO NOTHING
  RETURNING id INTO v_stamp_id;

  IF v_stamp_id IS NULL THEN
    SELECT id INTO v_stamp_id FROM public.stamps WHERE user_id = p_user_id;
  END IF;

  RETURN v_stamp_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.verify_cue_card(p_payload_hash TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  trust_score INTEGER,
  business_name TEXT,
  anchor_url TEXT,
  charitable_tier TEXT,
  charitable_icon TEXT,
  first_seen TIMESTAMPTZ,
  total_scans INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (ccr.security_state = 'valid') AS is_valid,
    ccr.trust_score,
    a.display_name AS business_name,
    a.destination_url AS anchor_url,
    cbt.display_name AS charitable_tier,
    cbt.icon AS charitable_icon,
    ccr.first_seen,
    ccr.total_scans
  FROM public.cue_card_registry ccr
  LEFT JOIN public.anchors a ON ccr.anchor_id = a.id
  LEFT JOIN public.charitable_business_tiers cbt ON a.charitable_tier_id = cbt.id
  WHERE ccr.payload_hash = p_payload_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_badges(p_user_id UUID)
RETURNS TABLE (
  badge_code TEXT,
  display_name TEXT,
  description TEXT,
  icon TEXT,
  badge_color TEXT,
  badge_category TEXT,
  tier_level INTEGER,
  tier_name TEXT,
  earned_at TIMESTAMPTZ,
  metric_value DECIMAL,
  is_featured BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bt.badge_code,
    bt.display_name,
    bt.description,
    bt.icon,
    bt.badge_color,
    bt.badge_category,
    bt.tier_level,
    bt.tier_name,
    mb.earned_at,
    mb.metric_value,
    mb.is_featured
  FROM public.member_badges mb
  JOIN public.badge_types bt ON mb.badge_type_id = bt.id
  WHERE mb.user_id = p_user_id
  AND mb.is_visible = true
  ORDER BY mb.is_featured DESC, mb.earned_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- DONE!
-- ═══════════════════════════════════════════════════════════════

SELECT 'Furnace + Anchors + Stamps + Badges migration complete!' AS status;
