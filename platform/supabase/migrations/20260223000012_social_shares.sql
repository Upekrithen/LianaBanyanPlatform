-- ═══════════════════════════════════════════════════════════════════════════════
-- SOCIAL SHARES TABLE
-- Phase 6: Golden Keys Social — Track cross-platform sharing
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.social_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- twitter, facebook, linkedin, bluesky, copy, cuecard
  content_type TEXT NOT NULL, -- golden_key_achievement, leaderboard, referral, etc.
  content_id TEXT, -- optional reference to specific content
  share_url TEXT, -- generated share URL if applicable
  referral_code TEXT, -- user's referral code used
  clicks INTEGER DEFAULT 0, -- tracked if we can
  conversions INTEGER DEFAULT 0, -- signups from this share
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_social_shares_user ON public.social_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_platform ON public.social_shares(platform);
CREATE INDEX IF NOT EXISTS idx_social_shares_created ON public.social_shares(created_at DESC);

-- RLS
ALTER TABLE public.social_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own shares" ON public.social_shares;
CREATE POLICY "Users can view own shares" ON public.social_shares
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own shares" ON public.social_shares;
CREATE POLICY "Users can insert own shares" ON public.social_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- REFERRAL TRACKING TABLE
-- Track Daisy Chain referrals from Golden Key shares
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.referral_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referrer_code TEXT NOT NULL,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source_platform TEXT, -- where the referral came from
  source_content TEXT, -- what content led to referral
  bonus_awarded BOOLEAN DEFAULT FALSE,
  bonus_feathers INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_tracking_referrer ON public.referral_tracking(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_code ON public.referral_tracking(referrer_code);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_referred ON public.referral_tracking(referred_user_id);

-- RLS
ALTER TABLE public.referral_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view referrals they made" ON public.referral_tracking;
CREATE POLICY "Users can view referrals they made" ON public.referral_tracking
  FOR SELECT USING (auth.uid() = referrer_id);

DROP POLICY IF EXISTS "System can insert referrals" ON public.referral_tracking;
CREATE POLICY "System can insert referrals" ON public.referral_tracking
  FOR INSERT WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- FUNCTION: Award referral bonus
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION award_referral_bonus(
  p_referrer_code TEXT,
  p_referred_user_id UUID,
  p_source_platform TEXT DEFAULT NULL,
  p_source_content TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_referrer_id UUID;
  v_bonus_feathers INTEGER := 10; -- Base bonus
  v_result JSONB;
BEGIN
  -- Find referrer by code (first 8 chars of user_id)
  SELECT id INTO v_referrer_id
  FROM auth.users
  WHERE UPPER(LEFT(id::text, 8)) = UPPER(p_referrer_code)
  LIMIT 1;

  IF v_referrer_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid referral code');
  END IF;

  -- Don't allow self-referral
  IF v_referrer_id = p_referred_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot refer yourself');
  END IF;

  -- Check if already referred
  IF EXISTS (SELECT 1 FROM public.referral_tracking WHERE referred_user_id = p_referred_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'User already referred');
  END IF;

  -- Insert referral record
  INSERT INTO public.referral_tracking (
    referrer_id, referrer_code, referred_user_id,
    source_platform, source_content, bonus_awarded, bonus_feathers
  ) VALUES (
    v_referrer_id, p_referrer_code, p_referred_user_id,
    p_source_platform, p_source_content, true, v_bonus_feathers
  );

  -- Award feathers to referrer (if user_feathers table exists)
  UPDATE public.user_feathers
  SET total_feathers = total_feathers + v_bonus_feathers
  WHERE user_email = (SELECT email FROM auth.users WHERE id = v_referrer_id);

  RETURN jsonb_build_object(
    'success', true,
    'referrer_id', v_referrer_id,
    'bonus_feathers', v_bonus_feathers
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.social_shares IS 'Tracks social media shares of Golden Key achievements';
COMMENT ON TABLE public.referral_tracking IS 'Tracks Daisy Chain referrals from Golden Key shares';
