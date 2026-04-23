-- K110: Earmarked Credits for .org charitable portal
CREATE TABLE IF NOT EXISTS earmarked_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id),
  amount_cents INTEGER NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('initiative','area','guild','general')),
  target_id TEXT,
  target_label TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','deployed','expired')),
  deployed_at TIMESTAMPTZ,
  deployed_to TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE earmarked_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members see own earmarks" ON earmarked_credits FOR SELECT USING (member_id = auth.uid());
CREATE POLICY "Members create earmarks" ON earmarked_credits FOR INSERT WITH CHECK (member_id = auth.uid());

CREATE TABLE IF NOT EXISTS charitable_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES auth.users(id),
  subscription_count INTEGER NOT NULL DEFAULT 1,
  area_preference TEXT,
  monthly_amount_cents INTEGER NOT NULL,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','paused','cancelled')),
  meals_funded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE charitable_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sponsors see own subs" ON charitable_subscriptions FOR SELECT USING (sponsor_id = auth.uid());
CREATE POLICY "Sponsors create subs" ON charitable_subscriptions FOR INSERT WITH CHECK (sponsor_id = auth.uid());
CREATE POLICY "Sponsors update own" ON charitable_subscriptions FOR UPDATE USING (sponsor_id = auth.uid());
