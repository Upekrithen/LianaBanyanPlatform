-- ═══════════════════════════════════════════════════════════════
-- STAMPS TABLE + UNIFIED BADGE SYSTEM
-- "Credit Where Credit Is Due"
-- 
-- Stamps = unique QR signatures for members
-- Badges = recognition for contributions (sponsorship, charitable, etc.)
-- ═══════════════════════════════════════════════════════════════

-- ─── STAMPS (Member QR Signatures) ───
-- Each member has a unique stamp that identifies their QR codes.
-- The stamp is the cryptographic identity for all their Cue Cards.

CREATE TABLE IF NOT EXISTS public.stamps (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Stamp identity
  stamp_code          TEXT NOT NULL UNIQUE,  -- Short unique code (e.g., 'JJ-2026-A7B3')
  public_key          TEXT,                   -- For cryptographic signing
  private_key_hash    TEXT,                   -- Hash of private key (actual key stored client-side)
  
  -- Display
  display_name        TEXT,                   -- Optional custom name
  avatar_url          TEXT,                   -- Optional avatar
  
  -- Portfolio (what this stamp can route to)
  default_anchor_id   UUID REFERENCES public.anchors(id),
  
  -- Stats
  total_cue_cards     INTEGER DEFAULT 0,
  total_scans         INTEGER DEFAULT 0,
  total_pass_throughs INTEGER DEFAULT 0,
  
  -- Status
  is_active           BOOLEAN DEFAULT true,
  revoked_at          TIMESTAMPTZ,
  revoke_reason       TEXT,
  
  -- Timestamps
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)  -- One stamp per user
);

CREATE INDEX IF NOT EXISTS idx_stamps_user ON public.stamps(user_id);
CREATE INDEX IF NOT EXISTS idx_stamps_code ON public.stamps(stamp_code);

-- ─── UNIFIED BADGE TYPES ───
-- All the different types of badges members can earn.
-- "Credit Where Credit Is Due"

CREATE TABLE IF NOT EXISTS public.badge_types (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Badge identity
  badge_code          TEXT NOT NULL UNIQUE,   -- 'sponsor_5k', 'kindling_ember', 'initiative_champion', etc.
  badge_category      TEXT NOT NULL,          -- 'sponsorship', 'charitable', 'initiative', 'achievement'
  
  -- Display
  display_name        TEXT NOT NULL,
  description         TEXT,
  icon                TEXT NOT NULL,          -- Emoji or icon class
  badge_color         TEXT,                   -- Tailwind color class
  
  -- Requirements
  requirement_type    TEXT,                   -- 'credits_sponsored', 'donation_percent', 'initiative_credits', etc.
  requirement_value   DECIMAL(12,2),          -- Threshold value
  
  -- Tier (for progressive badges)
  tier_level          INTEGER DEFAULT 1,
  tier_name           TEXT,                   -- 'bronze', 'silver', 'gold', 'platinum' or custom
  
  -- Benefits
  trust_score_bonus   INTEGER DEFAULT 0,
  featured_placement  BOOLEAN DEFAULT false,
  
  -- Status
  is_active           BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Seed badge types
INSERT INTO public.badge_types 
  (badge_code, badge_category, display_name, description, icon, badge_color, requirement_type, requirement_value, tier_level, tier_name, trust_score_bonus)
VALUES
  -- Sponsorship badges (Credit Where Credit Is Due)
  ('sponsor_seedling', 'sponsorship', 'Seedling Sponsor', 'Sponsored 25+ Credits', '🌱', 'green-300', 'credits_sponsored', 25, 1, 'seedling', 2),
  ('sponsor_sapling', 'sponsorship', 'Sapling Sponsor', 'Sponsored 100+ Credits', '🌿', 'green-400', 'credits_sponsored', 100, 2, 'sapling', 5),
  ('sponsor_tree', 'sponsorship', 'Tree Sponsor', 'Sponsored 500+ Credits', '🌳', 'green-500', 'credits_sponsored', 500, 3, 'tree', 10),
  ('sponsor_grove', 'sponsorship', 'Grove Sponsor', 'Sponsored 1,000+ Credits', '🌲', 'green-600', 'credits_sponsored', 1000, 4, 'grove', 15),
  ('sponsor_forest', 'sponsorship', 'Forest Sponsor', 'Sponsored 5,000+ Credits (Community Seeder)', '🏔️', 'green-700', 'credits_sponsored', 5000, 5, 'forest', 25),
  
  -- Kindling badges (Charitable business tiers - linked to charitable_business_tiers)
  ('kindling_ember', 'charitable', 'Ember Partner', 'Donates 1-2.99% of sales', '🔥', 'orange-300', 'donation_percent', 1, 1, 'ember', 5),
  ('kindling_flame', 'charitable', 'Flame Partner', 'Donates 3-4.99% of sales', '🔥🔥', 'orange-500', 'donation_percent', 3, 2, 'flame', 10),
  ('kindling_blaze', 'charitable', 'Blaze Partner', 'Donates 5-9.99% of sales', '🔥🔥🔥', 'orange-600', 'donation_percent', 5, 3, 'blaze', 15),
  ('kindling_inferno', 'charitable', 'Inferno Partner', 'Donates 10%+ of sales', '🔥🔥🔥🔥', 'orange-700', 'donation_percent', 10, 4, 'inferno', 25),
  
  -- Initiative contribution badges
  ('initiative_helper', 'initiative', 'Initiative Helper', 'Contributed 50+ Credits to initiatives', '🤝', 'blue-300', 'initiative_credits', 50, 1, 'helper', 3),
  ('initiative_supporter', 'initiative', 'Initiative Supporter', 'Contributed 200+ Credits to initiatives', '💪', 'blue-400', 'initiative_credits', 200, 2, 'supporter', 7),
  ('initiative_champion', 'initiative', 'Initiative Champion', 'Contributed 1,000+ Credits to initiatives', '🏆', 'blue-500', 'initiative_credits', 1000, 3, 'champion', 15),
  ('initiative_legend', 'initiative', 'Initiative Legend', 'Contributed 5,000+ Credits to initiatives', '👑', 'blue-600', 'initiative_credits', 5000, 4, 'legend', 25),
  
  -- Achievement badges
  ('early_adopter', 'achievement', 'Early Adopter', 'Joined in the first year', '⭐', 'yellow-400', NULL, NULL, 1, NULL, 5),
  ('founding_300', 'achievement', 'The 300', 'One of the first 300 strategic allies', '🛡️', 'amber-500', NULL, NULL, 1, NULL, 10),
  ('patent_contributor', 'achievement', 'Patent Contributor', 'Contributed to a filed patent', '📜', 'purple-400', NULL, NULL, 1, NULL, 10),
  ('cascade_starter', 'achievement', 'Cascade Starter', 'Sponsorship cascaded to 10+ people', '🌊', 'cyan-400', 'cascade_depth', 10, 1, NULL, 8),
  
  -- Furnace/Trust badges
  ('verified_business', 'trust', 'Verified Business', 'Business verified through The Furnace', '✓', 'emerald-400', NULL, NULL, 1, NULL, 5),
  ('trusted_anchor', 'trust', 'Trusted Anchor', 'Anchor with 90+ trust score', '🔒', 'emerald-500', 'trust_score', 90, 1, NULL, 10)
ON CONFLICT (badge_code) DO NOTHING;

-- ─── MEMBER BADGES (Earned badges) ───
-- Track which badges each member has earned.

CREATE TABLE IF NOT EXISTS public.member_badges (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type_id       UUID NOT NULL REFERENCES public.badge_types(id),
  
  -- Context
  earned_for          TEXT,                   -- Description of what earned it
  related_entity_id   UUID,                   -- Initiative, anchor, sponsorship, etc.
  related_entity_type TEXT,                   -- 'initiative', 'anchor', 'sponsorship', etc.
  
  -- Metrics at time of earning
  metric_value        DECIMAL(12,2),          -- The value that triggered the badge
  
  -- Display
  is_visible          BOOLEAN DEFAULT true,
  is_featured         BOOLEAN DEFAULT false,  -- Show prominently on profile
  
  -- Timestamps
  earned_at           TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, badge_type_id)  -- One of each badge type per user
);

CREATE INDEX idx_member_badges_user ON public.member_badges(user_id);
CREATE INDEX idx_member_badges_type ON public.member_badges(badge_type_id);

-- ─── INITIATIVE CONTRIBUTIONS ───
-- Track credits contributed to each initiative.

CREATE TABLE IF NOT EXISTS public.initiative_contributions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Initiative
  initiative_slug     TEXT NOT NULL,
  initiative_name     TEXT,
  
  -- Contribution
  credit_amount       DECIMAL(12,2) NOT NULL,
  contribution_type   TEXT NOT NULL,          -- 'direct', 'charitable', 'matching', 'sponsorship'
  
  -- Source tracking
  source_entity_id    UUID,                   -- Anchor, sponsorship, etc.
  source_entity_type  TEXT,
  
  -- Timestamps
  contributed_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_initiative_contributions_user ON public.initiative_contributions(user_id);
CREATE INDEX idx_initiative_contributions_initiative ON public.initiative_contributions(initiative_slug);

-- ─── UPDATE CUE CARD REGISTRY TO REFERENCE STAMPS ───
-- Add stamp_id column to cue_card_registry

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'cue_card_registry' 
    AND column_name = 'stamp_id'
  ) THEN
    ALTER TABLE public.cue_card_registry 
    ADD COLUMN stamp_id UUID REFERENCES public.stamps(id);
    
    CREATE INDEX idx_cue_card_registry_stamp ON public.cue_card_registry(stamp_id);
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- Function to create a stamp for a new user
CREATE OR REPLACE FUNCTION public.create_user_stamp(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_stamp_id UUID;
  v_stamp_code TEXT;
BEGIN
  -- Generate unique stamp code
  v_stamp_code := 'ST-' || TO_CHAR(NOW(), 'YYMM') || '-' || UPPER(SUBSTR(gen_random_uuid()::text, 1, 4));
  
  -- Create stamp
  INSERT INTO public.stamps (user_id, stamp_code)
  VALUES (p_user_id, v_stamp_code)
  ON CONFLICT (user_id) DO NOTHING
  RETURNING id INTO v_stamp_id;
  
  -- If already exists, get existing
  IF v_stamp_id IS NULL THEN
    SELECT id INTO v_stamp_id FROM public.stamps WHERE user_id = p_user_id;
  END IF;
  
  RETURN v_stamp_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and award badges based on sponsorship
CREATE OR REPLACE FUNCTION public.check_sponsorship_badges(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_total_sponsored DECIMAL(12,2);
  v_badge_record RECORD;
BEGIN
  -- Calculate total sponsored
  SELECT COALESCE(SUM(credit_amount), 0) INTO v_total_sponsored
  FROM public.sponsorships
  WHERE sponsor_id = p_user_id AND status IN ('active', 'split');
  
  -- Check each sponsorship badge tier
  FOR v_badge_record IN 
    SELECT id, badge_code, requirement_value 
    FROM public.badge_types 
    WHERE badge_category = 'sponsorship' 
    AND requirement_type = 'credits_sponsored'
    ORDER BY requirement_value ASC
  LOOP
    IF v_total_sponsored >= v_badge_record.requirement_value THEN
      INSERT INTO public.member_badges (user_id, badge_type_id, metric_value, earned_for)
      VALUES (p_user_id, v_badge_record.id, v_total_sponsored, 
              'Sponsored ' || v_total_sponsored || ' Credits')
      ON CONFLICT (user_id, badge_type_id) DO UPDATE
      SET metric_value = EXCLUDED.metric_value;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and award badges based on initiative contributions
CREATE OR REPLACE FUNCTION public.check_initiative_badges(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_total_contributed DECIMAL(12,2);
  v_badge_record RECORD;
BEGIN
  -- Calculate total contributed to initiatives
  SELECT COALESCE(SUM(credit_amount), 0) INTO v_total_contributed
  FROM public.initiative_contributions
  WHERE user_id = p_user_id;
  
  -- Check each initiative badge tier
  FOR v_badge_record IN 
    SELECT id, badge_code, requirement_value 
    FROM public.badge_types 
    WHERE badge_category = 'initiative' 
    AND requirement_type = 'initiative_credits'
    ORDER BY requirement_value ASC
  LOOP
    IF v_total_contributed >= v_badge_record.requirement_value THEN
      INSERT INTO public.member_badges (user_id, badge_type_id, metric_value, earned_for)
      VALUES (p_user_id, v_badge_record.id, v_total_contributed, 
              'Contributed ' || v_total_contributed || ' Credits to initiatives')
      ON CONFLICT (user_id, badge_type_id) DO UPDATE
      SET metric_value = EXCLUDED.metric_value;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all badges for a user
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
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.stamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initiative_contributions ENABLE ROW LEVEL SECURITY;

-- Stamps: users can view their own, public can see basic info
CREATE POLICY "Users can view their own stamp" ON public.stamps
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own stamp" ON public.stamps
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public can verify stamps" ON public.stamps
  FOR SELECT USING (true);  -- Needed for Furnace verification

-- Badge types: public read
CREATE POLICY "Anyone can view badge types" ON public.badge_types
  FOR SELECT USING (true);

-- Member badges: users can view their own, public can see visible badges
CREATE POLICY "Users can view their own badges" ON public.member_badges
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public can view visible badges" ON public.member_badges
  FOR SELECT USING (is_visible = true);

-- Initiative contributions: users can view their own
CREATE POLICY "Users can view their own contributions" ON public.initiative_contributions
  FOR SELECT USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════════════════

-- Trigger to create stamp when user joins
CREATE OR REPLACE FUNCTION public.trigger_create_stamp_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.create_user_stamp(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: This trigger would be on auth.users or profiles table
-- CREATE TRIGGER on_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.trigger_create_stamp_on_signup();

-- Trigger to check badges after sponsorship
CREATE OR REPLACE FUNCTION public.trigger_check_badges_on_sponsorship()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.check_sponsorship_badges(NEW.sponsor_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_sponsorship_check_badges ON public.sponsorships;
CREATE TRIGGER on_sponsorship_check_badges
  AFTER INSERT OR UPDATE ON public.sponsorships
  FOR EACH ROW EXECUTE FUNCTION public.trigger_check_badges_on_sponsorship();

-- Trigger to check badges after initiative contribution
CREATE OR REPLACE FUNCTION public.trigger_check_badges_on_contribution()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.check_initiative_badges(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_contribution_check_badges ON public.initiative_contributions;
CREATE TRIGGER on_contribution_check_badges
  AFTER INSERT ON public.initiative_contributions
  FOR EACH ROW EXECUTE FUNCTION public.trigger_check_badges_on_contribution();

-- ═══════════════════════════════════════════════════════════════
-- COMMENTS
-- ═══════════════════════════════════════════════════════════════

COMMENT ON TABLE public.stamps IS 'Member QR signatures - unique identity for all Cue Cards';
COMMENT ON TABLE public.badge_types IS 'All badge types available - Credit Where Credit Is Due';
COMMENT ON TABLE public.member_badges IS 'Badges earned by members';
COMMENT ON TABLE public.initiative_contributions IS 'Credits contributed to initiatives';

COMMENT ON COLUMN public.stamps.stamp_code IS 'Unique short code for this stamp (e.g., ST-2602-A7B3)';
COMMENT ON COLUMN public.badge_types.badge_category IS 'sponsorship, charitable, initiative, achievement, trust';
