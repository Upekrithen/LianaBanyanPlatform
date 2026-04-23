-- K114: Platform Tier Subscriptions (Explorer / Member / Builder)
-- Separate from the existing member_subscriptions table which handles business-level subscription commitments.
-- This table tracks the user's platform membership tier.

CREATE TABLE IF NOT EXISTS platform_tier_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('explorer', 'member', 'builder')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE platform_tier_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own tier subscription"
  ON platform_tier_subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users manage own tier subscription"
  ON platform_tier_subscriptions FOR ALL USING (auth.uid() = user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_platform_tier_active
  ON platform_tier_subscriptions(user_id) WHERE status = 'active';
