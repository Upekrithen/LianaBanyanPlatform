-- ============================================
-- MIGRATION: 20260323000028_one_third_funding_standard.sql
-- Knight Session 96: 1/3 Funding Standard + Initiative Webhook Scaffold
-- Spec: BISHOP_DROPZONE/ONE_THIRD_FUNDING_STANDARD_V2.md
-- ============================================

-- =============================================
-- TABLE 1: project_seeding_contributions
-- Records each funding event with the 1/3 split breakdown.
-- Named to avoid collision with existing project_funding table.
-- =============================================

CREATE TABLE IF NOT EXISTS project_seeding_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funder_id UUID NOT NULL REFERENCES auth.users(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  -- Stripe identifiers
  stripe_session_id TEXT,
  stripe_event_id TEXT UNIQUE, -- idempotency key
  -- The 1/3 split (all in cents to match transaction_ledger)
  total_amount_cents INTEGER NOT NULL,
  first_third_cents INTEGER NOT NULL,   -- Project Portion (PP)
  second_third_cents INTEGER NOT NULL,  -- Funder-Assignable Patronage (FAP)
  third_third_cents INTEGER NOT NULL,   -- Seeding + LB Platform
  -- Third Third breakdown
  lb_cut_cents INTEGER NOT NULL DEFAULT 0,      -- LB platform revenue (capped)
  seeding_amount_cents INTEGER NOT NULL DEFAULT 0, -- Flows to Seeding Pool
  -- Escrow (half of first third held until work verified)
  escrow_amount_cents INTEGER NOT NULL DEFAULT 0,
  escrow_released BOOLEAN DEFAULT false,
  escrow_released_at TIMESTAMPTZ,
  -- Cap state at time of contribution
  cap_reached_at_time BOOLEAN DEFAULT false,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE project_seeding_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Funders view own contributions" ON project_seeding_contributions
  FOR SELECT USING (auth.uid() = funder_id);
CREATE POLICY "Project owners view their project contributions" ON project_seeding_contributions
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
  );
CREATE POLICY "Admin manages all contributions" ON project_seeding_contributions
  FOR ALL USING (public.is_admin());

CREATE INDEX idx_seeding_contrib_funder ON project_seeding_contributions(funder_id, created_at DESC);
CREATE INDEX idx_seeding_contrib_project ON project_seeding_contributions(project_id, created_at DESC);
CREATE INDEX idx_seeding_contrib_stripe ON project_seeding_contributions(stripe_event_id);

-- =============================================
-- TABLE 2: project_cost_declarations
-- Tracks declared cost and the 20% cap per project.
-- Cap = 20% of declared cost (the maximum LB can extract).
-- =============================================

CREATE TABLE IF NOT EXISTS project_cost_declarations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) UNIQUE,
  -- Declared cost (itemized, auditable, declared at project creation)
  declared_cost_cents INTEGER NOT NULL,
  -- Cap: 20% of declared cost — generated column
  cap_amount_cents INTEGER GENERATED ALWAYS AS (declared_cost_cents / 5) STORED,
  -- Running total of LB revenue from this project
  cumulative_lb_revenue_cents INTEGER NOT NULL DEFAULT 0,
  -- Cap tracking
  cap_reached BOOLEAN DEFAULT false,
  cap_reached_date TIMESTAMPTZ,
  -- Itemized cost breakdown (materials, labor, overhead)
  itemized_costs JSONB DEFAULT '{}',
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE project_cost_declarations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project owners view own declarations" ON project_cost_declarations
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
  );
CREATE POLICY "Public read declarations" ON project_cost_declarations
  FOR SELECT USING (true); -- transparency: anyone can see declared costs
CREATE POLICY "Admin manages all declarations" ON project_cost_declarations
  FOR ALL USING (public.is_admin());

CREATE INDEX idx_cost_decl_project ON project_cost_declarations(project_id);

-- =============================================
-- TABLE 3: funder_assignable_credits
-- Second Third (FAP) — funder directs to other projects.
-- When assigned: triggers new 1/3 split on receiving project (WaterWheel).
-- =============================================

CREATE TABLE IF NOT EXISTS funder_assignable_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funder_id UUID NOT NULL REFERENCES auth.users(id),
  source_contribution_id UUID NOT NULL REFERENCES project_seeding_contributions(id),
  -- Original amount and remaining unassigned
  amount_cents INTEGER NOT NULL,
  remaining_cents INTEGER NOT NULL,
  -- Assignment
  assigned_to_project UUID REFERENCES projects(id),
  assigned_at TIMESTAMPTZ,
  -- Expiration (per V2 §7.3: no expiry while member active; 90-day grace on termination)
  expired BOOLEAN DEFAULT false,
  expired_at TIMESTAMPTZ,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE funder_assignable_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Funders view own credits" ON funder_assignable_credits
  FOR SELECT USING (auth.uid() = funder_id);
CREATE POLICY "Funders update own credits" ON funder_assignable_credits
  FOR UPDATE USING (auth.uid() = funder_id);
CREATE POLICY "Admin manages all credits" ON funder_assignable_credits
  FOR ALL USING (public.is_admin());

CREATE INDEX idx_fac_funder ON funder_assignable_credits(funder_id);
CREATE INDEX idx_fac_unassigned ON funder_assignable_credits(funder_id)
  WHERE assigned_to_project IS NULL AND expired = false;

-- =============================================
-- TABLE 4: seeding_pool
-- Third Third remainder after LB's capped cut.
-- Distributed to other Medallion holders' projects.
-- =============================================

CREATE TABLE IF NOT EXISTS seeding_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_contribution_id UUID NOT NULL REFERENCES project_seeding_contributions(id),
  amount_cents INTEGER NOT NULL,
  -- Allocation (when pool is distributed to a project)
  allocated_to_project UUID REFERENCES projects(id),
  allocated_at TIMESTAMPTZ,
  allocation_reason TEXT, -- 'need', 'activity', 'community_signal', 'diversity'
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE seeding_pool ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read seeding pool" ON seeding_pool
  FOR SELECT USING (true); -- full transparency per V2 §8.4
CREATE POLICY "Admin manages seeding pool" ON seeding_pool
  FOR ALL USING (public.is_admin());

CREATE INDEX idx_seeding_pool_source ON seeding_pool(source_contribution_id);
CREATE INDEX idx_seeding_pool_unallocated ON seeding_pool(allocated_to_project)
  WHERE allocated_to_project IS NULL;

-- =============================================
-- TABLE 5: project_escrow_ledger
-- Fiduciary escrow tracking per Pawn 15-01.
-- Half of First Third held until work verified.
-- Segregated from LB operating funds.
-- =============================================

CREATE TABLE IF NOT EXISTS project_escrow_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contribution_id UUID NOT NULL REFERENCES project_seeding_contributions(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  amount_cents INTEGER NOT NULL,
  -- Status lifecycle: held → released | returned | disputed
  status TEXT NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'released', 'returned', 'disputed')),
  -- Timestamps
  deposited_at TIMESTAMPTZ DEFAULT now(),
  released_at TIMESTAMPTZ,
  -- Verification
  released_to UUID REFERENCES auth.users(id), -- project owner or bounty worker
  verified_by UUID REFERENCES auth.users(id), -- funder or designated verifier
  -- Notes (for disputes, extensions)
  notes TEXT,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE project_escrow_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Funders view escrow for their contributions" ON project_escrow_ledger
  FOR SELECT USING (
    contribution_id IN (
      SELECT id FROM project_seeding_contributions WHERE funder_id = auth.uid()
    )
  );
CREATE POLICY "Project owners view their escrow" ON project_escrow_ledger
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
  );
CREATE POLICY "Admin manages all escrow" ON project_escrow_ledger
  FOR ALL USING (public.is_admin());

CREATE INDEX idx_escrow_contribution ON project_escrow_ledger(contribution_id);
CREATE INDEX idx_escrow_project ON project_escrow_ledger(project_id);
CREATE INDEX idx_escrow_held ON project_escrow_ledger(status) WHERE status = 'held';

-- =============================================
-- VIEW: seeding_pool_summary
-- Monthly transparency report per V2 §8.4
-- =============================================

CREATE OR REPLACE VIEW seeding_pool_summary AS
SELECT
  DATE_TRUNC('month', sp.created_at) AS month,
  COUNT(*) AS contribution_count,
  SUM(sp.amount_cents) AS total_pool_cents,
  SUM(sp.amount_cents) / 100.0 AS total_pool_dollars,
  SUM(CASE WHEN sp.allocated_to_project IS NOT NULL THEN sp.amount_cents ELSE 0 END) AS allocated_cents,
  SUM(CASE WHEN sp.allocated_to_project IS NULL THEN sp.amount_cents ELSE 0 END) AS unallocated_cents,
  COUNT(DISTINCT sp.allocated_to_project) FILTER (WHERE sp.allocated_to_project IS NOT NULL) AS projects_funded
FROM seeding_pool sp
GROUP BY DATE_TRUNC('month', sp.created_at)
ORDER BY month DESC;

-- =============================================
-- VIEW: project_cap_status
-- Per-project cap tracking for transparency
-- =============================================

CREATE OR REPLACE VIEW project_cap_status AS
SELECT
  pcd.project_id,
  p.name AS project_name,
  pcd.declared_cost_cents,
  pcd.declared_cost_cents / 100.0 AS declared_cost_dollars,
  pcd.cap_amount_cents,
  pcd.cap_amount_cents / 100.0 AS cap_dollars,
  pcd.cumulative_lb_revenue_cents,
  pcd.cumulative_lb_revenue_cents / 100.0 AS cumulative_lb_revenue_dollars,
  pcd.cap_reached,
  pcd.cap_reached_date,
  CASE
    WHEN pcd.cap_reached THEN 0
    ELSE pcd.cap_amount_cents - pcd.cumulative_lb_revenue_cents
  END AS remaining_cap_cents
FROM project_cost_declarations pcd
JOIN projects p ON p.id = pcd.project_id
ORDER BY pcd.created_at DESC;

-- =============================================
-- VIEW: funder_credit_summary
-- Per-funder assignable credit balances
-- =============================================

CREATE OR REPLACE VIEW funder_credit_summary AS
SELECT
  funder_id,
  COUNT(*) AS total_credits,
  SUM(amount_cents) AS total_amount_cents,
  SUM(remaining_cents) FILTER (WHERE assigned_to_project IS NULL AND expired = false) AS available_cents,
  SUM(amount_cents) FILTER (WHERE assigned_to_project IS NOT NULL) AS assigned_cents,
  SUM(amount_cents) FILTER (WHERE expired = true) AS expired_cents
FROM funder_assignable_credits
GROUP BY funder_id;
