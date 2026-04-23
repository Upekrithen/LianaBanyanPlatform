-- Subscription tiers available per business
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  tier_name TEXT NOT NULL, -- 'taste', 'regular', 'all_in', 'blind_box'
  frequency_per_week INT NOT NULL DEFAULT 3,
  discount_percent DECIMAL(5,2) NOT NULL DEFAULT 10.0,
  min_categories INT DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Member subscription commitments
CREATE TABLE IF NOT EXISTS member_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id),
  coalition_id UUID,
  tier_id UUID NOT NULL REFERENCES subscription_tiers(id),
  selected_businesses UUID[] NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'credits',
  cycle_start DATE NOT NULL,
  cycle_end DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Business Coalitions
CREATE TABLE IF NOT EXISTS business_coalitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  area_definition JSONB,
  min_businesses INT DEFAULT 10,
  min_subscribers INT DEFAULT 200,
  is_active BOOLEAN DEFAULT false,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Coalition membership (which businesses are in which coalition)
CREATE TABLE IF NOT EXISTS coalition_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coalition_id UUID NOT NULL REFERENCES business_coalitions(id),
  business_id UUID NOT NULL,
  business_name TEXT NOT NULL,
  category TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Subscription orders (what the member actually picked each week)
CREATE TABLE IF NOT EXISTS subscription_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES member_subscriptions(id),
  business_id UUID NOT NULL,
  order_date DATE NOT NULL,
  items JSONB,
  discount_applied DECIMAL(5,2),
  credits_charged DECIMAL(10,2),
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_coalitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coalition_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_orders ENABLE ROW LEVEL SECURITY;

-- Members can read all tiers and coalitions
CREATE POLICY "Anyone can view subscription tiers" ON subscription_tiers FOR SELECT USING (true);
CREATE POLICY "Anyone can view coalitions" ON business_coalitions FOR SELECT USING (true);
CREATE POLICY "Anyone can view coalition members" ON coalition_members FOR SELECT USING (true);

-- Members can manage their own subscriptions
CREATE POLICY "Members manage own subscriptions" ON member_subscriptions
  FOR ALL USING (auth.uid() = member_id);

CREATE POLICY "Members manage own orders" ON subscription_orders
  FOR ALL USING (
    subscription_id IN (SELECT id FROM member_subscriptions WHERE member_id = auth.uid())
  );

-- Admin can manage everything
CREATE POLICY "Admin manages tiers" ON subscription_tiers FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin manages coalitions" ON business_coalitions FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin manages coalition members" ON coalition_members FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
