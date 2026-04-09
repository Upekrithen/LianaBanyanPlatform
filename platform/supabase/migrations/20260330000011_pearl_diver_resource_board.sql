-- Pearl Diver Resource Intelligence (#2101)
-- K181 — Resource Board + Subscriptions + Cue Card

-- ════════════════════════════════════════════
-- 1. Resource Board Tips
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS resource_board_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES auth.users(id),
  store_name TEXT NOT NULL,
  store_location TEXT,
  deal_type TEXT NOT NULL,
  description TEXT NOT NULL,
  schedule_recurring BOOLEAN DEFAULT false,
  schedule_days TEXT[],
  schedule_time_hint TEXT,
  stacking_info TEXT,
  confidence TEXT DEFAULT 'verified',
  social_url TEXT,
  marks_awarded INTEGER DEFAULT 4,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days')
);

ALTER TABLE resource_board_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active tips"
  ON resource_board_tips FOR SELECT
  USING (status = 'active');

CREATE POLICY "Members can insert their own tips"
  ON resource_board_tips FOR INSERT
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Members can update own tips"
  ON resource_board_tips FOR UPDATE
  USING (auth.uid() = member_id);

CREATE INDEX idx_rbt_member ON resource_board_tips(member_id);
CREATE INDEX idx_rbt_deal_type ON resource_board_tips(deal_type);
CREATE INDEX idx_rbt_status ON resource_board_tips(status);
CREATE INDEX idx_rbt_created ON resource_board_tips(created_at DESC);

-- ════════════════════════════════════════════
-- 2. Tip Votes (one vote per member per tip)
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS resource_board_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tip_id UUID REFERENCES resource_board_tips(id) ON DELETE CASCADE,
  voter_id UUID REFERENCES auth.users(id),
  vote SMALLINT NOT NULL CHECK (vote IN (-1, 1)),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tip_id, voter_id)
);

ALTER TABLE resource_board_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read votes"
  ON resource_board_votes FOR SELECT USING (true);

CREATE POLICY "Members can insert own votes"
  ON resource_board_votes FOR INSERT
  WITH CHECK (auth.uid() = voter_id);

CREATE POLICY "Members can update own votes"
  ON resource_board_votes FOR UPDATE
  USING (auth.uid() = voter_id);

-- ════════════════════════════════════════════
-- 3. Pearl Diver Subscriptions
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS pearl_diver_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES auth.users(id),
  pearl_diver_id UUID REFERENCES auth.users(id),
  currency TEXT DEFAULT 'marks',
  price_per_month NUMERIC DEFAULT 10,
  delivery_preference TEXT DEFAULT 'daily',
  geo_radius_km INTEGER DEFAULT 25,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  next_billing_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days')
);

ALTER TABLE pearl_diver_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subscribers can see own subs"
  ON pearl_diver_subscriptions FOR SELECT
  USING (auth.uid() = subscriber_id OR auth.uid() = pearl_diver_id);

CREATE POLICY "Members can subscribe"
  ON pearl_diver_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = subscriber_id);

CREATE POLICY "Participants can update"
  ON pearl_diver_subscriptions FOR UPDATE
  USING (auth.uid() = subscriber_id OR auth.uid() = pearl_diver_id);

CREATE INDEX idx_pds_subscriber ON pearl_diver_subscriptions(subscriber_id);
CREATE INDEX idx_pds_diver ON pearl_diver_subscriptions(pearl_diver_id);

-- ════════════════════════════════════════════
-- 4. Pearl Diver Cue Card Template
-- ════════════════════════════════════════════
INSERT INTO cue_card_templates (
  initiative_slug,
  template_type,
  title,
  subtitle,
  body_text,
  hashtags,
  background_type,
  background_value,
  accent_color,
  card_style,
  is_active,
  sort_order
) VALUES (
  'pearl-diver',
  'role',
  'Pearl Diver',
  'Find deals others miss. Get paid for what you already know.',
  E'**What you do:** Shop where you already shop. Log deals to the Resource Board.\n\n**What you earn:** 4+ Marks per tip, subscriptions from followers, bulk buy bonuses.\n\n**What you need:** A phone, feet in the aisles, and knowledge of your neighborhood stores.\n\n**Monthly potential:** 120–250 Marks/month (Quiet Pearl) or 400–800 Marks/month (Pearl Influencer with subscriptions).\n\n**Time commitment:** 2–5 hours/week (you''re already shopping).',
  ARRAY['PearlDiver', 'ResourceBoard', 'DealFinder', 'LianaBanyan'],
  'gradient',
  'linear-gradient(135deg, #1e3a5f 0%, #0d7377 100%)',
  '#c9a96e',
  'brass-helmet',
  true,
  50
) ON CONFLICT DO NOTHING;
