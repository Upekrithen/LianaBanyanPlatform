-- ============================================================================
-- K138: Guild & Tribe Benefit Cascade + Treasury Governance
-- Innovation: #2018
-- ============================================================================

-- ── 1. GROUP BENEFIT TIERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS group_benefit_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_type TEXT NOT NULL CHECK (group_type IN ('guild', 'tribe')),
  member_threshold INTEGER NOT NULL,
  benefit_name TEXT NOT NULL,
  benefit_description TEXT NOT NULL,
  benefit_type TEXT NOT NULL CHECK (benefit_type IN (
    'discount', 'priority', 'treasury', 'marketplace', 'governance'
  )),
  benefit_value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE group_benefit_tiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read benefit tiers" ON group_benefit_tiers;
CREATE POLICY "Anyone can read benefit tiers"
  ON group_benefit_tiers FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_benefit_tiers_type_threshold
  ON group_benefit_tiers(group_type, member_threshold);

-- Seed Guild tiers (5 levels)
INSERT INTO group_benefit_tiers (group_type, member_threshold, benefit_name, benefit_description, benefit_type, benefit_value) VALUES
  ('guild', 5,   'Cooperative Purchasing',  'Group negotiating power for bulk orders',                              'discount',     '{"discount_pct": 3}'),
  ('guild', 10,  'Directory Listing',       'Guild appears in platform search and discovery',                       'priority',     '{"search_boost": true}'),
  ('guild', 25,  'Treasury Activation',     'Treasury spending proposals and voting enabled',                       'treasury',     '{"spending_enabled": true}'),
  ('guild', 50,  'Priority Support',        'Dedicated support channel for Guild issues',                           'governance',   '{"priority_support": true}'),
  ('guild', 100, 'Guild Marketplace',       'Dedicated Guild section in the marketplace',                           'marketplace',  '{"dedicated_section": true}');

-- Seed Tribe tiers (5 levels)
INSERT INTO group_benefit_tiers (group_type, member_threshold, benefit_name, benefit_description, benefit_type, benefit_value) VALUES
  ('tribe', 5,   'Shared Family Table',     'Family Table access for all Tribe members',                            'discount',     '{"family_table": true}'),
  ('tribe', 10,  'Group Ordering',          'Coordinated meal orders across the Tribe',                             'priority',     '{"group_ordering": true}'),
  ('tribe', 25,  'Tribe Treasury',          'Treasury spending proposals and voting enabled',                       'treasury',     '{"spending_enabled": true}'),
  ('tribe', 50,  'Neighborhood Deals',      'Local business discounts negotiated for Tribe members',                'governance',   '{"neighborhood_deals": true}'),
  ('tribe', 100, 'Community Hub',           'Dedicated Tribe section in the marketplace',                           'marketplace',  '{"dedicated_section": true}');

-- ── 2. TREASURY SPEND PROPOSALS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS treasury_spend_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_type TEXT NOT NULL CHECK (group_type IN ('guild', 'tribe')),
  group_id UUID NOT NULL,
  proposed_by UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  recipient TEXT,
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN (
    'proposed', 'voting', 'approved', 'rejected', 'executed', 'expired'
  )),
  votes_for INTEGER NOT NULL DEFAULT 0,
  votes_against INTEGER NOT NULL DEFAULT 0,
  vote_deadline TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE treasury_spend_proposals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read proposals" ON treasury_spend_proposals;
CREATE POLICY "Authenticated can read proposals"
  ON treasury_spend_proposals FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Members can create proposals" ON treasury_spend_proposals;
CREATE POLICY "Members can create proposals"
  ON treasury_spend_proposals FOR INSERT WITH CHECK (auth.uid() = proposed_by);

DROP POLICY IF EXISTS "Proposers can update own proposals" ON treasury_spend_proposals;
CREATE POLICY "Proposers can update own proposals"
  ON treasury_spend_proposals FOR UPDATE USING (auth.uid() = proposed_by);

CREATE INDEX IF NOT EXISTS idx_proposals_group ON treasury_spend_proposals(group_type, group_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON treasury_spend_proposals(status);

-- ── 3. TREASURY VOTES ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS treasury_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES treasury_spend_proposals(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES auth.users(id),
  vote BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(proposal_id, voter_id)
);

ALTER TABLE treasury_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read votes" ON treasury_votes;
CREATE POLICY "Authenticated can read votes"
  ON treasury_votes FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can cast votes" ON treasury_votes;
CREATE POLICY "Users can cast votes"
  ON treasury_votes FOR INSERT WITH CHECK (auth.uid() = voter_id);

CREATE INDEX IF NOT EXISTS idx_votes_proposal ON treasury_votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter ON treasury_votes(voter_id);
