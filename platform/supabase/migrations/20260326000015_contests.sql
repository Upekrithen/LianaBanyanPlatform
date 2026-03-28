-- ============================================
-- K120: Contest Infrastructure
-- Tables for platform contests, entries, votes
-- First contest: Capstone Terrain Design
-- ============================================

CREATE TABLE IF NOT EXISTS platform_contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  rules TEXT NOT NULL,

  craft_type TEXT NOT NULL,
  portal TEXT DEFAULT 'marketplace',

  submission_start TIMESTAMPTZ NOT NULL,
  submission_end TIMESTAMPTZ NOT NULL,
  voting_start TIMESTAMPTZ NOT NULL,
  voting_end TIMESTAMPTZ NOT NULL,

  prize_description TEXT NOT NULL,
  winner_production BOOLEAN DEFAULT true,

  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'submissions_open', 'voting_open', 'judging', 'complete')),

  winner_project_id UUID REFERENCES turnkey_projects(id),
  runner_up_ids JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contest_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID REFERENCES platform_contests(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES turnkey_projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,

  entry_statement TEXT,

  vote_count INT DEFAULT 0,
  pledge_total INT DEFAULT 0,

  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(contest_id, user_id)
);

CREATE TABLE IF NOT EXISTS contest_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID REFERENCES platform_contests(id) ON DELETE CASCADE NOT NULL,
  entry_id UUID REFERENCES contest_entries(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,

  vote_type TEXT DEFAULT 'want' CHECK (vote_type IN ('want', 'pledge')),
  credits_pledged INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(contest_id, entry_id, user_id)
);

-- Indexes
CREATE INDEX idx_contest_entries_contest ON contest_entries(contest_id);
CREATE INDEX idx_contest_entries_user ON contest_entries(user_id);
CREATE INDEX idx_contest_votes_entry ON contest_votes(entry_id);
CREATE INDEX idx_contest_votes_user ON contest_votes(user_id);

-- RLS
ALTER TABLE platform_contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view contests" ON platform_contests FOR SELECT USING (true);
CREATE POLICY "Anyone can view entries" ON contest_entries FOR SELECT USING (true);
CREATE POLICY "Users manage own entries" ON contest_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view votes" ON contest_votes FOR SELECT USING (true);
CREATE POLICY "Users manage own votes" ON contest_votes FOR ALL USING (auth.uid() = user_id);

-- Seed: Capstone Terrain Design Contest
INSERT INTO platform_contests (title, slug, description, rules, craft_type, portal, submission_start, submission_end, voting_start, voting_end, prize_description) VALUES (
  'Capstone Terrain Design Contest',
  'capstone-terrain-2026',
  'Design a Capstone terrain module for the SlottedTop hex system. Your design could be the next piece in the HexIsle collection — produced and sold with you earning from every unit.',
  E'1. Create a free account on Liana Banyan ($5/year membership required to submit)\n2. Create a Turn-Key Project with your Capstone design\n3. Include at least 3 photos or renders of your design\n4. Describe how your Capstone uses pass-through connection points\n5. One entry per person\n6. You retain full ownership of your design\n7. Winning design enters production — you earn from every unit sold',
  'terrain',
  'hexisle',
  now() + interval '7 days',
  now() + interval '35 days',
  now() + interval '35 days',
  now() + interval '49 days',
  'Winning design enters the HexIsle production pipeline. Designer earns from every unit sold through the Tiered Production Cascade. Runner-up designs receive featured placement on the marketplace.'
) ON CONFLICT (slug) DO NOTHING;
