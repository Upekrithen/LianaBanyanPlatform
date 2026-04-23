-- Creator Referral System — Session 15
-- creator_referrals table + six-tier reward dna_lock config

CREATE TABLE IF NOT EXISTS public.creator_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_handle TEXT NOT NULL,
  referred_platform TEXT NOT NULL DEFAULT 'instagram'
    CHECK (referred_platform IN ('instagram', 'etsy', 'tiktok', 'email', 'other')),
  cue_card_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  referred_user_id UUID REFERENCES auth.users(id),
  signed_up_at TIMESTAMPTZ,
  reward_tier TEXT,
  reward_marks NUMERIC(8,2) DEFAULT 0,
  reward_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creator_referrals_referrer ON public.creator_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_creator_referrals_handle ON public.creator_referrals(referred_handle);
ALTER TABLE public.creator_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own referrals" ON public.creator_referrals FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Users create referrals" ON public.creator_referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);

INSERT INTO public.dna_lock (parameter_key, parameter_value, data_type, is_locked, locked_by, description, category)
VALUES
  ('creator_referral_tier_1_name', 'Pioneer', 'text', false, 'SYSTEM', 'First 100 referrals tier name', 'creator_referral'),
  ('creator_referral_tier_1_max', '100', 'integer', false, 'SYSTEM', 'First tier max referral count', 'creator_referral'),
  ('creator_referral_tier_1_reward', '10', 'integer', false, 'SYSTEM', 'Marks per successful referral in tier 1', 'creator_referral'),
  ('creator_referral_tier_2_name', 'Vanguard', 'text', false, 'SYSTEM', 'Tier 2 name (101-500)', 'creator_referral'),
  ('creator_referral_tier_2_max', '500', 'integer', false, 'SYSTEM', 'Tier 2 max cumulative referrals', 'creator_referral'),
  ('creator_referral_tier_2_reward', '5', 'integer', false, 'SYSTEM', 'Marks per successful referral in tier 2', 'creator_referral'),
  ('creator_referral_tier_3_name', 'Pathfinder', 'text', false, 'SYSTEM', 'Tier 3 name (501-2000)', 'creator_referral'),
  ('creator_referral_tier_3_max', '2000', 'integer', false, 'SYSTEM', 'Tier 3 max cumulative referrals', 'creator_referral'),
  ('creator_referral_tier_3_reward', '3', 'integer', false, 'SYSTEM', 'Marks per successful referral in tier 3', 'creator_referral'),
  ('creator_referral_tier_4_name', 'Trailblazer', 'text', false, 'SYSTEM', 'Tier 4 name (2001-10000)', 'creator_referral'),
  ('creator_referral_tier_4_max', '10000', 'integer', false, 'SYSTEM', 'Tier 4 max cumulative referrals', 'creator_referral'),
  ('creator_referral_tier_4_reward', '2', 'integer', false, 'SYSTEM', 'Marks per successful referral in tier 4', 'creator_referral'),
  ('creator_referral_tier_5_name', 'Guide', 'text', false, 'SYSTEM', 'Tier 5 name (10001-50000)', 'creator_referral'),
  ('creator_referral_tier_5_max', '50000', 'integer', false, 'SYSTEM', 'Tier 5 max cumulative referrals', 'creator_referral'),
  ('creator_referral_tier_5_reward', '1.5', 'text', false, 'SYSTEM', 'Marks per successful referral in tier 5', 'creator_referral'),
  ('creator_referral_tier_6_name', 'Ambassador', 'text', false, 'SYSTEM', 'Tier 6 name (50001+)', 'creator_referral'),
  ('creator_referral_tier_6_reward', '1', 'integer', false, 'SYSTEM', 'Marks per successful referral in tier 6 (universal floor)', 'creator_referral')
ON CONFLICT (parameter_key) DO NOTHING;
