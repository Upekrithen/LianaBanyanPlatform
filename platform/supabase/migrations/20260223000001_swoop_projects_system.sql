-- =====================================================
-- SWOOP PROJECTS SYSTEM
-- Do The Swoop - Community Crisis Support Infrastructure
-- Created: February 23, 2026
-- =====================================================

-- LEGAL STRUCTURE:
-- LB acts as payment processor only, NOT fund manager
-- Each project has its own account controlled by Project Lead
-- Full transparency: FROM, TO, WHEN, HOW MUCH, WHAT FOR

-- =====================================================
-- SWOOP PROJECTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS swoop_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Project Identity
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT, -- For cue cards
  
  -- Recipient Info (verified)
  recipient_name TEXT NOT NULL,
  recipient_relationship TEXT, -- "self", "spouse", "parent", "child", "friend", "neighbor"
  recipient_location TEXT, -- City, State (no full address)
  medical_situation TEXT NOT NULL,
  monthly_needs JSONB DEFAULT '{}', -- {"rent": 1200, "utilities": 300, "food": 400}
  
  -- Verification
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'in_review', 'verified', 'rejected')),
  verification_date TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  verification_notes TEXT,
  verification_contact_name TEXT,
  verification_contact_relationship TEXT,
  verification_contact_reached BOOLEAN DEFAULT false,
  
  -- Project Lead (NOT LB - critical for legal protection)
  project_lead_id UUID REFERENCES auth.users(id) NOT NULL,
  project_lead_name TEXT NOT NULL,
  project_lead_email TEXT,
  
  -- Nominator (may be same as project lead)
  nominator_id UUID REFERENCES auth.users(id) NOT NULL,
  nominator_name TEXT NOT NULL,
  
  -- Financial
  goal_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0,
  disbursed_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Stripe Connect (per-project account)
  stripe_account_id TEXT,
  stripe_account_status TEXT DEFAULT 'pending' CHECK (stripe_account_status IN ('pending', 'onboarding', 'active', 'restricted', 'closed')),
  stripe_account_created_at TIMESTAMPTZ,
  
  -- Status & Voting
  status TEXT DEFAULT 'nomination' CHECK (status IN ('nomination', 'voting', 'pending_verification', 'active', 'funded', 'closed', 'cancelled')),
  vote_count INTEGER DEFAULT 0,
  vote_threshold INTEGER DEFAULT 500,
  voting_started_at TIMESTAMPTZ,
  activation_date TIMESTAMPTZ,
  funded_date TIMESTAMPTZ,
  closed_date TIMESTAMPTZ,
  closed_reason TEXT,
  
  -- Transparency
  public_updates JSONB DEFAULT '[]', -- Array of {date, message, author}
  last_update TIMESTAMPTZ,
  
  -- Social/Sharing
  share_image_url TEXT,
  featured BOOLEAN DEFAULT false,
  featured_order INTEGER,
  
  -- Categories
  category TEXT DEFAULT 'medical' CHECK (category IN ('medical', 'housing', 'utilities', 'food', 'transportation', 'other'))
);

-- =====================================================
-- SWOOP VOTES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS swoop_project_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES swoop_projects(id) ON DELETE CASCADE NOT NULL,
  voter_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Vote weight (based on member Credits)
  credit_weight INTEGER DEFAULT 1,
  
  -- Display
  display_name TEXT,
  show_support BOOLEAN DEFAULT true, -- Show in "supporters" list
  
  UNIQUE(project_id, voter_id)
);

-- =====================================================
-- SWOOP TRANSACTIONS TABLE
-- Full transparency: FROM, TO, WHEN, HOW MUCH, WHAT FOR
-- =====================================================

CREATE TABLE IF NOT EXISTS swoop_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES swoop_projects(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Transaction Type
  type TEXT NOT NULL CHECK (type IN ('donation', 'disbursement', 'refund', 'transfer_in', 'transfer_out')),
  
  -- FROM (donor for donations, project for disbursements)
  from_type TEXT NOT NULL, -- "member", "anonymous", "project_fund", "master_fund"
  from_id UUID, -- User ID if member
  from_name TEXT NOT NULL, -- Display name or "Anonymous"
  from_anonymous BOOLEAN DEFAULT false,
  
  -- TO (project for donations, vendor for disbursements)
  to_type TEXT NOT NULL, -- "project_fund", "utility", "landlord", "grocery", "medical", "other"
  to_name TEXT NOT NULL, -- "Duke Energy", "ABC Apartments", etc.
  to_account_info TEXT, -- Masked account number if applicable
  
  -- WHAT
  amount DECIMAL(10,2) NOT NULL,
  purpose TEXT NOT NULL, -- "Electric bill - January 2026"
  notes TEXT,
  
  -- WHEN
  processed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  
  -- Stripe
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  stripe_payout_id TEXT,
  stripe_fee DECIMAL(10,2),
  
  -- Receipt
  receipt_url TEXT,
  receipt_uploaded_at TIMESTAMPTZ
);

-- =====================================================
-- SWOOP MASTER FUND
-- Unallocated donations before project assignment
-- =====================================================

CREATE TABLE IF NOT EXISTS swoop_master_fund (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  balance DECIMAL(10,2) DEFAULT 0,
  total_received DECIMAL(10,2) DEFAULT 0,
  total_allocated DECIMAL(10,2) DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  stripe_account_id TEXT
);

-- Insert single master fund record
INSERT INTO swoop_master_fund (id, balance, stripe_account_id)
VALUES (gen_random_uuid(), 0, 'pending_setup')
ON CONFLICT DO NOTHING;

-- =====================================================
-- SWOOP PROJECT UPDATES
-- Separate table for better querying
-- =====================================================

CREATE TABLE IF NOT EXISTS swoop_project_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES swoop_projects(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT DEFAULT 'project_lead' CHECK (author_role IN ('project_lead', 'recipient', 'lb_admin')),
  
  update_type TEXT DEFAULT 'general' CHECK (update_type IN ('general', 'milestone', 'disbursement', 'thank_you', 'closure')),
  title TEXT,
  content TEXT NOT NULL,
  
  -- Attachments
  image_url TEXT,
  
  -- Visibility
  is_public BOOLEAN DEFAULT true
);

-- =====================================================
-- MSA (Medical Savings Account) TABLES
-- Personal savings, separate from Swoop crisis support
-- =====================================================

CREATE TABLE IF NOT EXISTS msa_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Balance
  balance DECIMAL(10,2) DEFAULT 0,
  total_contributed DECIMAL(10,2) DEFAULT 0,
  total_withdrawn DECIMAL(10,2) DEFAULT 0,
  total_platform_match DECIMAL(10,2) DEFAULT 0,
  
  -- Stripe
  stripe_customer_id TEXT,
  
  -- Settings
  auto_contribute_percent DECIMAL(5,2) DEFAULT 0, -- % of earnings to auto-deposit
  platform_match_eligible BOOLEAN DEFAULT true,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed'))
);

CREATE TABLE IF NOT EXISTS msa_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES msa_accounts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'platform_match', 'auto_contribute', 'refund')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  
  -- Source/Destination
  source_type TEXT, -- "bank", "earnings", "platform"
  destination_type TEXT, -- "bank", "medical_provider"
  
  -- Stripe
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded'))
);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update vote count and check threshold
CREATE OR REPLACE FUNCTION update_swoop_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update vote count
  UPDATE swoop_projects
  SET vote_count = (
    SELECT COALESCE(SUM(credit_weight), 0)
    FROM swoop_project_votes
    WHERE project_id = NEW.project_id
  ),
  updated_at = NOW()
  WHERE id = NEW.project_id;
  
  -- Check if threshold reached and project is in voting status
  UPDATE swoop_projects
  SET status = 'pending_verification',
      voting_started_at = COALESCE(voting_started_at, NOW())
  WHERE id = NEW.project_id
    AND status = 'voting'
    AND vote_count >= vote_threshold;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for vote count updates
DROP TRIGGER IF EXISTS trigger_update_swoop_vote_count ON swoop_project_votes;
CREATE TRIGGER trigger_update_swoop_vote_count
  AFTER INSERT OR DELETE ON swoop_project_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_swoop_vote_count();

-- Function to update project amount from transactions
CREATE OR REPLACE FUNCTION update_swoop_project_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'donation' AND NEW.status = 'completed' THEN
    UPDATE swoop_projects
    SET current_amount = current_amount + NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.project_id;
  ELSIF NEW.type = 'disbursement' AND NEW.status = 'completed' THEN
    UPDATE swoop_projects
    SET disbursed_amount = disbursed_amount + NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.project_id;
  END IF;
  
  -- Check if goal reached
  UPDATE swoop_projects
  SET status = 'funded',
      funded_date = NOW()
  WHERE id = NEW.project_id
    AND status = 'active'
    AND current_amount >= goal_amount;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for amount updates
DROP TRIGGER IF EXISTS trigger_update_swoop_project_amount ON swoop_transactions;
CREATE TRIGGER trigger_update_swoop_project_amount
  AFTER INSERT OR UPDATE ON swoop_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_swoop_project_amount();

-- Function to move project from nomination to voting
CREATE OR REPLACE FUNCTION start_swoop_voting(project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE swoop_projects
  SET status = 'voting',
      voting_started_at = NOW(),
      updated_at = NOW()
  WHERE id = project_id
    AND status = 'nomination';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to activate verified project
CREATE OR REPLACE FUNCTION activate_swoop_project(project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE swoop_projects
  SET status = 'active',
      activation_date = NOW(),
      updated_at = NOW()
  WHERE id = project_id
    AND status = 'pending_verification'
    AND verification_status = 'verified';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS
-- =====================================================

-- Active projects view
CREATE OR REPLACE VIEW v_swoop_active_projects AS
SELECT 
  p.*,
  (SELECT COUNT(*) FROM swoop_project_votes WHERE project_id = p.id) as supporter_count,
  (SELECT COUNT(*) FROM swoop_transactions WHERE project_id = p.id AND type = 'donation' AND status = 'completed') as donation_count,
  (p.current_amount / NULLIF(p.goal_amount, 0) * 100) as percent_funded
FROM swoop_projects p
WHERE p.status IN ('voting', 'active', 'funded')
ORDER BY p.featured DESC, p.vote_count DESC;

-- Project transparency view
CREATE OR REPLACE VIEW v_swoop_project_transparency AS
SELECT 
  t.id,
  t.project_id,
  t.created_at,
  t.type,
  t.from_name,
  t.from_anonymous,
  t.to_name,
  t.to_type,
  t.amount,
  t.purpose,
  t.status,
  t.processed_at,
  p.title as project_title,
  p.project_lead_name
FROM swoop_transactions t
JOIN swoop_projects p ON t.project_id = p.id
WHERE t.status = 'completed'
ORDER BY t.created_at DESC;

-- MSA summary view
CREATE OR REPLACE VIEW v_msa_account_summary AS
SELECT 
  a.id,
  a.member_id,
  a.balance,
  a.total_contributed,
  a.total_withdrawn,
  a.total_platform_match,
  a.auto_contribute_percent,
  (SELECT COUNT(*) FROM msa_transactions WHERE account_id = a.id) as transaction_count,
  (SELECT MAX(created_at) FROM msa_transactions WHERE account_id = a.id) as last_transaction
FROM msa_accounts a
WHERE a.status = 'active';

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE swoop_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE swoop_project_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE swoop_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE swoop_project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE msa_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE msa_transactions ENABLE ROW LEVEL SECURITY;

-- Projects: Anyone can view active/voting projects
CREATE POLICY "Anyone can view public swoop projects"
  ON swoop_projects FOR SELECT
  USING (status IN ('voting', 'active', 'funded', 'closed'));

-- Projects: Only nominator/lead can edit
CREATE POLICY "Nominator and lead can update their projects"
  ON swoop_projects FOR UPDATE
  USING (auth.uid() = nominator_id OR auth.uid() = project_lead_id);

-- Projects: Authenticated users can nominate
CREATE POLICY "Authenticated users can create nominations"
  ON swoop_projects FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Votes: Authenticated users can vote
CREATE POLICY "Authenticated users can vote"
  ON swoop_project_votes FOR INSERT
  WITH CHECK (auth.uid() = voter_id);

CREATE POLICY "Users can view their own votes"
  ON swoop_project_votes FOR SELECT
  USING (auth.uid() = voter_id);

CREATE POLICY "Anyone can view vote counts"
  ON swoop_project_votes FOR SELECT
  USING (true);

-- Transactions: Anyone can view completed transactions (transparency)
CREATE POLICY "Anyone can view completed transactions"
  ON swoop_transactions FOR SELECT
  USING (status = 'completed');

-- Updates: Anyone can view public updates
CREATE POLICY "Anyone can view public updates"
  ON swoop_project_updates FOR SELECT
  USING (is_public = true);

-- Updates: Project lead can create updates
CREATE POLICY "Project lead can create updates"
  ON swoop_project_updates FOR INSERT
  WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM swoop_projects
      WHERE id = project_id AND project_lead_id = auth.uid()
    )
  );

-- MSA: Users can only see their own account
CREATE POLICY "Users can view own MSA account"
  ON msa_accounts FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "Users can update own MSA account"
  ON msa_accounts FOR UPDATE
  USING (auth.uid() = member_id);

CREATE POLICY "Users can create own MSA account"
  ON msa_accounts FOR INSERT
  WITH CHECK (auth.uid() = member_id);

-- MSA Transactions: Users can only see their own
CREATE POLICY "Users can view own MSA transactions"
  ON msa_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM msa_accounts
      WHERE id = account_id AND member_id = auth.uid()
    )
  );

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_swoop_projects_status ON swoop_projects(status);
CREATE INDEX IF NOT EXISTS idx_swoop_projects_slug ON swoop_projects(slug);
CREATE INDEX IF NOT EXISTS idx_swoop_projects_featured ON swoop_projects(featured, featured_order);
CREATE INDEX IF NOT EXISTS idx_swoop_project_votes_project ON swoop_project_votes(project_id);
CREATE INDEX IF NOT EXISTS idx_swoop_project_votes_voter ON swoop_project_votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_swoop_transactions_project ON swoop_transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_swoop_transactions_status ON swoop_transactions(status);
CREATE INDEX IF NOT EXISTS idx_msa_accounts_member ON msa_accounts(member_id);
CREATE INDEX IF NOT EXISTS idx_msa_transactions_account ON msa_transactions(account_id);

-- =====================================================
-- DNA LOCK ENTRIES
-- =====================================================

INSERT INTO dna_lock (parameter_key, parameter_value, data_type, description, category)
VALUES 
  ('swoop_vote_threshold', '500', 'numeric', 'Votes required to activate a Swoop project', 'operations'),
  ('swoop_platform_fee_percent', '0', 'numeric', 'Platform fee on Swoop donations (0% = all goes to recipient)', 'economics'),
  ('msa_platform_match_percent', '5', 'numeric', 'Platform match percentage for MSA contributions', 'economics'),
  ('msa_max_match_monthly', '50', 'numeric', 'Maximum platform match per month in dollars', 'economics')
ON CONFLICT (parameter_key) DO NOTHING;

-- =====================================================
-- SEED DATA: Sample Projects (for testing)
-- =====================================================

-- Note: In production, these would be real nominations
-- These are examples to show the system structure

/*
INSERT INTO swoop_projects (
  title, slug, description, short_description,
  recipient_name, recipient_relationship, recipient_location, medical_situation,
  monthly_needs, goal_amount,
  project_lead_id, project_lead_name, nominator_id, nominator_name,
  status, category
) VALUES (
  'Help the Smith Family',
  'smith-family-medical',
  'John Smith was diagnosed with stage 3 cancer in January. His wife Sarah is caring for him while working part-time. They need help with bills while John undergoes treatment.',
  'Cancer treatment support for the Smith family',
  'John Smith',
  'self',
  'Nashville, TN',
  'Stage 3 cancer, undergoing chemotherapy',
  '{"rent": 1200, "utilities": 300, "food": 400, "medical": 500}',
  5000,
  -- These would be real UUIDs
  '00000000-0000-0000-0000-000000000001',
  'Jane Doe',
  '00000000-0000-0000-0000-000000000001',
  'Jane Doe',
  'voting',
  'medical'
);
*/

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE swoop_projects IS 'Do The Swoop crisis support projects. LB acts as payment processor only.';
COMMENT ON TABLE swoop_project_votes IS 'Votes to activate Swoop projects. 500 votes required.';
COMMENT ON TABLE swoop_transactions IS 'Full transparency: FROM, TO, WHEN, HOW MUCH, WHAT FOR';
COMMENT ON TABLE msa_accounts IS 'Medical Savings Accounts - personal savings, separate from Swoop';
COMMENT ON COLUMN swoop_projects.project_lead_id IS 'CRITICAL: Project lead controls funds, NOT Liana Banyan';
COMMENT ON COLUMN swoop_projects.verification_status IS 'Must be verified before funds can be disbursed';
