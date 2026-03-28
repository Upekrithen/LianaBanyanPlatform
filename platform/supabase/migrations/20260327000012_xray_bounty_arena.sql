-- K141: X-Ray Bounty Arena (Innovations #2023-#2028)

-- Error reports (Tier 1: Find)
CREATE TABLE IF NOT EXISTS error_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  element_selector TEXT,
  element_screenshot_url TEXT,
  error_type TEXT NOT NULL CHECK (error_type IN (
    'visual','layout','typo','broken','accessibility','performance','other'
  )),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
    'open','documented','fix_proposed','fix_accepted','resolved','duplicate','invalid'
  )),
  marks_allocated NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read error reports" ON error_reports FOR SELECT USING (true);
CREATE POLICY "Authenticated users create error reports" ON error_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Reporters manage own reports" ON error_reports FOR UPDATE
  USING (auth.uid() = reporter_id);

-- Error documentation (Tier 2: Document)
CREATE TABLE IF NOT EXISTS error_documentation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_id UUID NOT NULL REFERENCES error_reports(id) ON DELETE CASCADE,
  documenter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  expected_behavior TEXT,
  browser_info TEXT,
  device_info TEXT,
  steps_to_reproduce TEXT,
  severity TEXT CHECK (severity IN ('critical','major','minor','cosmetic')),
  marks_earned NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE error_documentation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read documentation" ON error_documentation FOR SELECT USING (true);
CREATE POLICY "Authenticated users create documentation" ON error_documentation FOR INSERT
  WITH CHECK (auth.uid() = documenter_id);

-- Fix proposals (Tier 3: Fix)
CREATE TABLE IF NOT EXISTS fix_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_id UUID NOT NULL REFERENCES error_reports(id) ON DELETE CASCADE,
  proposer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  fix_type TEXT NOT NULL CHECK (fix_type IN ('css','content','layout','functional','other')),
  proposed_css TEXT,
  proposed_html TEXT,
  proposed_content TEXT,
  description TEXT NOT NULL,
  marks_earned NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending','approved','rejected','implemented'
  )),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE fix_proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read fix proposals" ON fix_proposals FOR SELECT USING (true);
CREATE POLICY "Authenticated users create fix proposals" ON fix_proposals FOR INSERT
  WITH CHECK (auth.uid() = proposer_id);

-- Bounties (self-generating)
CREATE TABLE IF NOT EXISTS error_bounties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_id UUID REFERENCES error_reports(id) ON DELETE SET NULL,
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  marks_reward NUMERIC NOT NULL DEFAULT 0,
  marks_pool NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','claimed','fulfilled','expired','cancelled')),
  fulfilled_by UUID REFERENCES profiles(id),
  fulfilled_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE error_bounties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read bounties" ON error_bounties FOR SELECT USING (true);
CREATE POLICY "Authenticated users create bounties" ON error_bounties FOR INSERT
  WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators manage own bounties" ON error_bounties FOR UPDATE
  USING (auth.uid() = creator_id);

-- Bounty contributions (community amplification)
CREATE TABLE IF NOT EXISTS bounty_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id UUID NOT NULL REFERENCES error_bounties(id) ON DELETE CASCADE,
  contributor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  marks_amount NUMERIC NOT NULL CHECK (marks_amount > 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(bounty_id, contributor_id)
);

ALTER TABLE bounty_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read contributions" ON bounty_contributions FOR SELECT USING (true);
CREATE POLICY "Authenticated users contribute" ON bounty_contributions FOR INSERT
  WITH CHECK (auth.uid() = contributor_id);

-- Design auction entries
CREATE TABLE IF NOT EXISTS design_auction_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fix_proposal_id UUID REFERENCES fix_proposals(id) ON DELETE CASCADE,
  element_overlay_id UUID REFERENCES element_overlays(id) ON DELETE CASCADE,
  submitter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  auction_cycle DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  nickname TEXT,
  bid_total NUMERIC DEFAULT 0,
  display_duration_seconds INTEGER DEFAULT 10,
  is_winner BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE design_auction_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read auction entries" ON design_auction_entries FOR SELECT USING (true);
CREATE POLICY "Authenticated users submit entries" ON design_auction_entries FOR INSERT
  WITH CHECK (auth.uid() = submitter_id);

-- Auction bids (Marks-weighted governance votes)
CREATE TABLE IF NOT EXISTS auction_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES design_auction_entries(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  marks_weight NUMERIC NOT NULL CHECK (marks_weight > 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(entry_id, bidder_id)
);

ALTER TABLE auction_bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read bids" ON auction_bids FOR SELECT USING (true);
CREATE POLICY "Authenticated users bid" ON auction_bids FOR INSERT
  WITH CHECK (auth.uid() = bidder_id);

-- Daily tracker (per-user daily stats)
CREATE TABLE IF NOT EXISTS xray_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stat_date DATE NOT NULL DEFAULT CURRENT_DATE,
  errors_found INTEGER DEFAULT 0,
  errors_documented INTEGER DEFAULT 0,
  fixes_proposed INTEGER DEFAULT 0,
  bounties_created INTEGER DEFAULT 0,
  bounties_fulfilled INTEGER DEFAULT 0,
  marks_earned NUMERIC DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, stat_date)
);

ALTER TABLE xray_daily_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own stats" ON xray_daily_stats FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users update own stats" ON xray_daily_stats FOR ALL
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_error_reports_status ON error_reports(status);
CREATE INDEX IF NOT EXISTS idx_error_reports_page ON error_reports(page_url);
CREATE INDEX IF NOT EXISTS idx_bounties_status ON error_bounties(status);
CREATE INDEX IF NOT EXISTS idx_auction_cycle ON design_auction_entries(auction_cycle, is_winner);
CREATE INDEX IF NOT EXISTS idx_xray_stats_user_date ON xray_daily_stats(user_id, stat_date);
