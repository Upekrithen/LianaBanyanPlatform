-- Turn-Key Project Templates (#1942)
CREATE TABLE IF NOT EXISTS turnkey_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'funded', 'producing', 'complete', 'paused')),

  -- Matched funding (#1943)
  creator_backing_credits INT DEFAULT 0,
  community_matched INT DEFAULT 0,
  matching_cap INT DEFAULT 0,

  -- Tier tracking
  current_tier TEXT DEFAULT 'prototype' CHECK (current_tier IN ('prototype', 'early_adopter', 'tier2_500', 'tier3_5k', 'tier4_mass')),
  early_adopter_slots INT DEFAULT 50,
  early_adopter_filled INT DEFAULT 0,

  -- Production routing
  production_method TEXT CHECK (production_method IN ('fdm', 'sla', 'sls', 'injection', 'handmade', 'digital', 'mixed')),
  stl_file_url TEXT,

  -- Cue Card used (nullable — manual setup if no cue card)
  cue_card_id UUID,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Turn-Key tier history (tracks cascade progression)
CREATE TABLE IF NOT EXISTS turnkey_tier_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES turnkey_projects(id) ON DELETE CASCADE,
  tier TEXT NOT NULL,
  units_target INT NOT NULL,
  units_filled INT DEFAULT 0,
  unit_price_credits INT NOT NULL,
  production_method TEXT,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Turn-Key backers (people who pre-ordered at a tier)
CREATE TABLE IF NOT EXISTS turnkey_backers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES turnkey_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  tier TEXT NOT NULL,
  credits_paid INT NOT NULL,
  fulfillment_type TEXT DEFAULT 'shipped' CHECK (fulfillment_type IN ('shipped', 'print_yourself', 'digital')),
  status TEXT DEFAULT 'backed' CHECK (status IN ('backed', 'producing', 'shipped', 'delivered')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, user_id, tier)
);

ALTER TABLE turnkey_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE turnkey_tier_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE turnkey_backers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active projects" ON turnkey_projects FOR SELECT USING (status != 'draft' OR auth.uid() = creator_id);
CREATE POLICY "Creator manages own project" ON turnkey_projects FOR ALL USING (auth.uid() = creator_id);

CREATE POLICY "Anyone can view tier history" ON turnkey_tier_history FOR SELECT USING (true);
CREATE POLICY "Creator manages tier history" ON turnkey_tier_history FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM turnkey_projects WHERE id = project_id AND creator_id = auth.uid())
);

CREATE POLICY "Anyone can view backers count" ON turnkey_backers FOR SELECT USING (true);
CREATE POLICY "Users manage own backing" ON turnkey_backers FOR ALL USING (auth.uid() = user_id);
