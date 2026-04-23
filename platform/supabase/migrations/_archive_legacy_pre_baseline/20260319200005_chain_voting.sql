-- ═══════════════════════════════════════════════════════════════════════════════
-- CHAIN VOTING — Proposals, Votes, Chain Status
-- Session 49 — March 19, 2026
-- ═══════════════════════════════════════════════════════════════════════════════

-- Voter chain status (one row per member)
CREATE TABLE IF NOT EXISTS chain_voting_chains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES auth.users(id),
  chain_length integer NOT NULL DEFAULT 0,
  current_bonus_percent integer NOT NULL DEFAULT 0,
  longest_chain integer NOT NULL DEFAULT 0,
  participation_rate numeric NOT NULL DEFAULT 0,
  last_vote_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(member_id)
);

-- Governance proposals
CREATE TABLE IF NOT EXISTS chain_voting_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('Governance', 'Economic', 'Community', 'Technical')),
  status text NOT NULL CHECK (status IN ('active', 'passed', 'failed', 'pending')) DEFAULT 'active',
  deadline timestamptz NOT NULL,
  votes_for integer NOT NULL DEFAULT 0,
  votes_against integer NOT NULL DEFAULT 0,
  total_marks_pledged numeric NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Individual vote records
CREATE TABLE IF NOT EXISTS chain_voting_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES auth.users(id) NOT NULL,
  proposal_id uuid REFERENCES chain_voting_proposals(id) NOT NULL,
  direction text NOT NULL CHECK (direction IN ('for', 'against')),
  chain_number integer NOT NULL DEFAULT 1,
  bonus_applied integer NOT NULL DEFAULT 0,
  marks_pledged numeric NOT NULL DEFAULT 0,
  voted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(member_id, proposal_id)
);

-- RLS
ALTER TABLE chain_voting_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE chain_voting_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE chain_voting_votes ENABLE ROW LEVEL SECURITY;

-- chain_voting_chains: read all, own insert/update, admin all
CREATE POLICY "chain_chains_read" ON chain_voting_chains FOR SELECT TO authenticated USING (true);
CREATE POLICY "chain_chains_own_insert" ON chain_voting_chains FOR INSERT TO authenticated WITH CHECK (auth.uid() = member_id);
CREATE POLICY "chain_chains_own_update" ON chain_voting_chains FOR UPDATE TO authenticated USING (auth.uid() = member_id);
CREATE POLICY "chain_chains_admin" ON chain_voting_chains FOR ALL TO authenticated USING (public.is_admin());

-- chain_voting_proposals: read all, authenticated insert, admin all
CREATE POLICY "chain_proposals_read" ON chain_voting_proposals FOR SELECT TO authenticated USING (true);
CREATE POLICY "chain_proposals_insert" ON chain_voting_proposals FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "chain_proposals_update" ON chain_voting_proposals FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "chain_proposals_admin" ON chain_voting_proposals FOR ALL TO authenticated USING (public.is_admin());

-- chain_voting_votes: read own + admin, insert own
CREATE POLICY "chain_votes_read_own" ON chain_voting_votes FOR SELECT TO authenticated USING (auth.uid() = member_id OR public.is_admin());
CREATE POLICY "chain_votes_insert" ON chain_voting_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = member_id);
CREATE POLICY "chain_votes_admin" ON chain_voting_votes FOR ALL TO authenticated USING (public.is_admin());

-- Seed proposals
INSERT INTO chain_voting_proposals (title, description, category, status, deadline, votes_for, votes_against, total_marks_pledged, created_at) VALUES
  ('Expand Didasko Curriculum to Include Trade Skills', 'Add vocational training modules (welding, carpentry, electrical) to the Didasko Academy, partnering with Guild experts to deliver hands-on coursework.', 'Community', 'active', '2026-03-25T23:59:59Z', 142, 31, 2840, '2026-03-10T09:00:00Z'),
  ('Adjust C+20 Floor from 20% to 15% for Micro-Transactions', 'Lower the Cost+20 reciprocity floor to Cost+15 for transactions under 5 Credits to encourage higher volume on small goods.', 'Economic', 'active', '2026-03-22T23:59:59Z', 89, 67, 1560, '2026-03-08T11:00:00Z'),
  ('Implement Quarterly Transparency Reports', 'Require the Treasury to publish detailed quarterly reports on cooperative finances, accessible to all members via the Transparent Ledger.', 'Governance', 'active', '2026-03-28T23:59:59Z', 203, 12, 4100, '2026-03-12T08:00:00Z'),
  ('Add WebSocket Support to Node API', 'Upgrade the Node registration API to support real-time WebSocket connections for live production queue updates.', 'Technical', 'active', '2026-03-20T23:59:59Z', 56, 18, 780, '2026-03-06T15:00:00Z'),
  ('Create Regional Ambassador Councils', 'Establish elected regional councils of Ambassadors to coordinate local cooperative activities and represent geographic interests at the Senate level.', 'Governance', 'active', '2026-03-30T23:59:59Z', 178, 44, 3200, '2026-03-14T10:00:00Z');
