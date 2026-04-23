-- K144: Chain Dashboard + Kickstarter Sync + HexIsle Downloads

-- Kickstarter campaign tracking
CREATE TABLE IF NOT EXISTS kickstarter_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_number INTEGER NOT NULL UNIQUE CHECK (campaign_number BETWEEN 1 AND 13),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  product_type TEXT NOT NULL CHECK (product_type IN ('component','character','creature','assembly')),
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming','live','funded','fulfilled','cancelled')),
  goal_amount NUMERIC NOT NULL DEFAULT 1000,
  raised_amount NUMERIC DEFAULT 0,
  backer_count INTEGER DEFAULT 0,
  launch_date DATE,
  end_date DATE,
  fulfillment_date DATE,
  kickstarter_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Member chain tracking
CREATE TABLE IF NOT EXISTS member_chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  chain_length INTEGER DEFAULT 0,
  max_chain_length INTEGER DEFAULT 0,
  current_bonus_pct NUMERIC DEFAULT 0,
  chain_expires_at TIMESTAMPTZ,
  last_backed_campaign INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Individual chain links (one per campaign backed)
CREATE TABLE IF NOT EXISTS chain_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES kickstarter_campaigns(id),
  backed_at TIMESTAMPTZ DEFAULT now(),
  pledge_amount NUMERIC,
  pledge_tier TEXT,
  chain_position INTEGER NOT NULL,
  bonus_pct NUMERIC NOT NULL,
  UNIQUE(user_id, campaign_id)
);

-- HexIsle STL downloads library
CREATE TABLE IF NOT EXISTS hexisle_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_name TEXT NOT NULL,
  piece_slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN (
    'terrain','character','creature','component','accessory','assembly'
  )),
  tier TEXT NOT NULL CHECK (tier IN (
    'tereno_certified','tereno_approved','hexisle_official',
    'hexisle_compatible','hexisle_adaptable','hexisle_inspired'
  )),
  stl_url TEXT,
  thumbnail_url TEXT,
  description TEXT,
  innovation_number INTEGER,
  download_count INTEGER DEFAULT 0,
  submitted_by UUID REFERENCES profiles(id),
  campaign_id UUID REFERENCES kickstarter_campaigns(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE kickstarter_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read campaigns" ON kickstarter_campaigns FOR SELECT USING (true);

ALTER TABLE member_chains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own chain" ON member_chains FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own chain" ON member_chains FOR ALL USING (auth.uid() = user_id);

ALTER TABLE chain_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own links" ON chain_links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own links" ON chain_links FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE hexisle_downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read downloads" ON hexisle_downloads FOR SELECT USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chain_links_user ON chain_links(user_id, chain_position);
CREATE INDEX IF NOT EXISTS idx_downloads_category ON hexisle_downloads(category, tier);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON kickstarter_campaigns(status);

-- Seed the 13 campaigns from B011 Kickstarter Strategy
INSERT INTO kickstarter_campaigns (campaign_number, title, slug, product_type, goal_amount) VALUES
  (1, 'SlottedTop — Universal Hex Adapter', 'slotted-top', 'component', 1000),
  (2, 'Peasant — Starter Character', 'peasant', 'character', 1000),
  (3, 'Merchant — Starter Character', 'merchant', 'character', 1000),
  (4, 'Golden Lotus — Tesla Valve', 'golden-lotus', 'component', 1000),
  (5, 'Farmer / Warrior — Dual Class', 'farmer-warrior', 'character', 1000),
  (6, 'Sawtooth Coral — Bedrock + Timing Belt', 'sawtooth-coral', 'component', 1000),
  (7, 'Healer / Assassin — Dual Class', 'healer-assassin', 'character', 1000),
  (8, 'War Horse — Mountable Creature', 'war-horse', 'creature', 1000),
  (9, 'King — Capstone Character', 'king', 'character', 1000),
  (10, 'Pneumatic Palm Tree — Hydraulic', 'pneumatic-palm', 'component', 2000),
  (11, 'Queen — Capstone Character', 'queen', 'character', 1000),
  (12, 'Hexel Assembly — Complete Stack', 'hexel-assembly', 'assembly', 5000),
  (13, 'Tereno Water Table — Hydraulic Surface', 'water-table', 'assembly', 12000);
