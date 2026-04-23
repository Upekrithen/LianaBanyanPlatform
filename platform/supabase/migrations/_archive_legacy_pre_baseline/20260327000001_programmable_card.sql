-- K131: Programmable Card — Durin's Door Routing, Sponsored Cards, Brand Bounties, Designer Marketplace
-- Innovation count: 2,033

-- Durin's Door configurations (per-member conditional routing)
CREATE TABLE IF NOT EXISTS durins_door_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medallion_id UUID REFERENCES auth.users(id) NOT NULL,
  default_template TEXT DEFAULT 'generic_welcome',
  default_data JSONB DEFAULT '{}',
  active_from TIMESTAMPTZ DEFAULT now(),
  active_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Door rules (each rule = one phrase → one experience)
CREATE TABLE IF NOT EXISTS durins_door_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES durins_door_configs(id) ON DELETE CASCADE,
  key_type TEXT NOT NULL CHECK (key_type IN ('phrase', 'email', 'code', 'any')),
  key_value TEXT NOT NULL,
  case_sensitive BOOLEAN DEFAULT false,
  single_use BOOLEAN DEFAULT false,
  used BOOLEAN DEFAULT false,
  template TEXT NOT NULL,
  experience_data JSONB NOT NULL DEFAULT '{}',
  intended_recipient TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sponsored cards (pre-funded onboarding cards)
CREATE TABLE IF NOT EXISTS sponsored_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID REFERENCES auth.users(id) NOT NULL,
  card_type TEXT DEFAULT 'digital' CHECK (card_type IN ('physical', 'digital', 'both')),
  preloaded_amount NUMERIC(10,2) DEFAULT 0,
  include_membership BOOLEAN DEFAULT false,
  door_config_id UUID REFERENCES durins_door_configs(id),
  activation_code TEXT UNIQUE,
  activated BOOLEAN DEFAULT false,
  activated_by UUID REFERENCES auth.users(id),
  activated_at TIMESTAMPTZ,
  status TEXT DEFAULT 'created' CHECK (status IN ('created', 'distributed', 'activated', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Sponsorship attribution (ONE LEVEL ONLY — NOT MLM)
CREATE TABLE IF NOT EXISTS sponsorship_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID REFERENCES auth.users(id) NOT NULL,
  sponsored_user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  card_id UUID REFERENCES sponsored_cards(id),
  marks_earned_signup INT DEFAULT 0,
  marks_earned_activity INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Brand bounties (design work requests from new members)
CREATE TABLE IF NOT EXISTS brand_bounties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES auth.users(id) NOT NULL,
  bounty_type TEXT NOT NULL CHECK (bounty_type IN ('logo', 'domain_email', 'designed_card', 'other')),
  rush_tier INT NOT NULL CHECK (rush_tier BETWEEN 1 AND 6),
  price_marks INT NOT NULL,
  paid_in_credits BOOLEAN DEFAULT false,
  brief JSONB DEFAULT '{}',
  designer_id UUID REFERENCES auth.users(id),
  claimed_at TIMESTAMPTZ,
  deliverable_url TEXT,
  delivered_at TIMESTAMPTZ,
  approved BOOLEAN,
  approved_at TIMESTAMPTZ,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'in_progress', 'delivered', 'approved', 'disputed', 'cancelled')),
  deadline TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Designer profiles (cooperative design marketplace)
CREATE TABLE IF NOT EXISTS designer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  services TEXT[] DEFAULT '{}',
  tier_availability INT[] DEFAULT '{4,5,6}',
  weekly_capacity INT DEFAULT 5,
  pricing_tier TEXT DEFAULT 'retail' CHECK (pricing_tier IN ('c20', 'c40', 'c60', 'c90', 'retail')),
  completed_bounties INT DEFAULT 0,
  tryout_completed BOOLEAN DEFAULT false,
  xp_rating NUMERIC(5,2) DEFAULT 0,
  avg_quality NUMERIC(3,2) DEFAULT 0,
  on_time_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE durins_door_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE durins_door_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsored_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorship_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_bounties ENABLE ROW LEVEL SECURITY;
ALTER TABLE designer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own door configs" ON durins_door_configs FOR ALL USING (medallion_id = auth.uid());
CREATE POLICY "Public read door rules" ON durins_door_rules FOR SELECT USING (true);
CREATE POLICY "Config owners manage rules" ON durins_door_rules FOR ALL USING (
  EXISTS (SELECT 1 FROM durins_door_configs WHERE id = config_id AND medallion_id = auth.uid())
);
CREATE POLICY "Users manage own cards" ON sponsored_cards FOR ALL USING (sponsor_id = auth.uid());
CREATE POLICY "Users see own attributions" ON sponsorship_attributions FOR SELECT USING (sponsor_id = auth.uid() OR sponsored_user_id = auth.uid());
CREATE POLICY "Public read open bounties" ON brand_bounties FOR SELECT USING (true);
CREATE POLICY "Users manage own bounties" ON brand_bounties FOR ALL USING (requester_id = auth.uid() OR designer_id = auth.uid());
CREATE POLICY "Public read designer profiles" ON designer_profiles FOR SELECT USING (true);
CREATE POLICY "Users manage own designer profile" ON designer_profiles FOR ALL USING (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_door_configs_medallion ON durins_door_configs(medallion_id);
CREATE INDEX idx_door_rules_config ON durins_door_rules(config_id);
CREATE INDEX idx_sponsored_cards_sponsor ON sponsored_cards(sponsor_id);
CREATE INDEX idx_sponsored_cards_activation ON sponsored_cards(activation_code);
CREATE INDEX idx_sponsorship_sponsor ON sponsorship_attributions(sponsor_id);
CREATE INDEX idx_brand_bounties_status ON brand_bounties(status);
CREATE INDEX idx_brand_bounties_designer ON brand_bounties(designer_id);
CREATE INDEX idx_designer_profiles_user ON designer_profiles(user_id);
