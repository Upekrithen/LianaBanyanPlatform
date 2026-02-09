-- ============================================
-- IP CONTROL FRAMEWORK - THREE-TIER MODEL
-- ============================================

-- Create IP asset types enum
CREATE TYPE public.ip_asset_type AS ENUM ('patent', 'copyright', 'trademark', 'trade_secret', 'design', 'know_how');

-- Create IP control tier enum
CREATE TYPE public.ip_control_tier AS ENUM ('tier_a', 'tier_b', 'tier_c');

-- Create IP use proposal status enum
CREATE TYPE public.ip_proposal_status AS ENUM ('pending', 'auto_approved', 'creator_approved', 'creator_denied', 'arbitration', 'approved_by_arbitration', 'rejected');

-- Create arbitration ruling enum
CREATE TYPE public.arbitration_ruling AS ENUM ('creator_upheld', 'lb_upheld', 'compromise');

-- ============================================
-- TABLE 1: IP Assets (Core IP Registry)
-- ============================================
CREATE TABLE public.ip_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_name TEXT NOT NULL,
  asset_description TEXT,
  asset_type ip_asset_type NOT NULL,
  control_tier ip_control_tier NOT NULL DEFAULT 'tier_a',
  
  -- Equity splits
  equity_split_creator NUMERIC NOT NULL CHECK (equity_split_creator IN (49, 60, 75)),
  equity_split_lb NUMERIC NOT NULL CHECK (equity_split_lb IN (51, 40, 25)),
  
  -- Tier B: Prohibited categories (up to 5)
  prohibited_categories TEXT[] CHECK (array_length(prohibited_categories, 1) <= 5),
  category_lock_date TIMESTAMPTZ, -- Can only modify categories once per year
  
  -- Metadata
  patent_number TEXT,
  filing_date DATE,
  grant_date DATE,
  expiration_date DATE,
  jurisdiction TEXT,
  
  -- Status tracking
  is_active BOOLEAN DEFAULT true,
  tier_c_invitation_id UUID, -- References tier_c_invitations table
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 2: IP Creator Controls (Tier A Anti-Shelving)
-- ============================================
CREATE TABLE public.ip_creator_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_asset_id UUID NOT NULL REFERENCES public.ip_assets(id) ON DELETE CASCADE,
  
  -- Veto powers
  has_veto_power BOOLEAN DEFAULT true,
  requires_creator_approval_for TEXT[] DEFAULT ARRAY['shelving', 'external_licensing', 'strategic_pivot'],
  
  -- Commercialization requirements
  min_commercialization_timeline INTEGER DEFAULT 18, -- months
  max_dormancy_days INTEGER DEFAULT 365,
  
  -- Reversion clause
  reversion_clause BOOLEAN DEFAULT true,
  reversion_conditions JSONB DEFAULT '{"dormancy_days": 365, "equity_shift": "60/40"}',
  
  -- Governance rights
  voting_weight_in_lb NUMERIC DEFAULT 2.0,
  can_propose_uses BOOLEAN DEFAULT true,
  quarterly_report_required BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 3: Patent Pool Usage Rights (Tier B Sandbox)
-- ============================================
CREATE TABLE public.patent_pool_usage_rights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_asset_id UUID NOT NULL REFERENCES public.ip_assets(id) ON DELETE CASCADE,
  
  -- Unlimited Internal Use
  unlimited_internal_use BOOLEAN DEFAULT true,
  can_derive BOOLEAN DEFAULT true,
  can_modify BOOLEAN DEFAULT true,
  can_combine_with_other_pool_ip BOOLEAN DEFAULT true,
  
  -- Authorization Model
  authorization_model TEXT DEFAULT 'dibs_with_premium' CHECK (authorization_model IN ('dibs_with_premium', 'protest_premium', 'first_come')),
  dibs_holder_id UUID REFERENCES auth.users(id),
  dibs_expiration TIMESTAMPTZ,
  dibs_profit_share NUMERIC DEFAULT 5.0, -- Extra % for dibs holder
  unauthorized_use_premium NUMERIC DEFAULT 15.0, -- Higher % if used without approval
  protest_offset_penalty NUMERIC DEFAULT 5.0, -- Penalty to discourage frivolous protests
  
  -- Revenue Sharing (Tier B: Only applies to LB-connected products)
  applies_to_lb_products_only BOOLEAN DEFAULT true,
  base_revenue_share NUMERIC DEFAULT 10.0,
  with_authorization_share NUMERIC DEFAULT 10.0,
  without_authorization_share NUMERIC DEFAULT 25.0, -- If used over objection (after arbitration)
  external_license_revenue_share NUMERIC DEFAULT 50.0, -- % of revenue from licensing to non-LB entities
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 4: IP Use Proposals (Tier B & C Approval Workflow)
-- ============================================
CREATE TABLE public.ip_use_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_asset_id UUID NOT NULL REFERENCES public.ip_assets(id) ON DELETE CASCADE,
  proposed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proposal_description TEXT NOT NULL,
  proposed_use_category TEXT,
  target_product_id UUID REFERENCES public.products(id),
  
  -- Status and timeline
  status ip_proposal_status DEFAULT 'pending',
  creator_response_deadline TIMESTAMPTZ,
  creator_denial_reason TEXT,
  arbitration_ruling TEXT,
  
  -- Tracking
  auto_approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

-- ============================================
-- TABLE 5: IP Arbitration Cases (Frivolous Block Detection)
-- ============================================
CREATE TABLE public.ip_arbitration_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.ip_use_proposals(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Case details
  case_type TEXT CHECK (case_type IN ('frivolous_block', 'unauthorized_use', 'category_dispute', 'shelving_complaint')),
  evidence JSONB,
  mediator_id UUID REFERENCES auth.users(id),
  
  -- Ruling
  ruling arbitration_ruling,
  ruling_rationale TEXT,
  financial_penalty NUMERIC DEFAULT 0, -- Arbitration costs awarded
  equity_adjustment NUMERIC DEFAULT 0, -- Penalty equity forfeiture if applicable
  
  -- Tier C downgrade tracking
  triggers_tier_downgrade BOOLEAN DEFAULT false,
  downgrade_duration_months INTEGER,
  
  filed_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ============================================
-- TABLE 6: Tier C Invitations (C-Suite Authorization)
-- ============================================
CREATE TABLE public.tier_c_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_asset_id UUID REFERENCES public.ip_assets(id),
  
  -- Strategic justification
  invitation_reason TEXT NOT NULL CHECK (invitation_reason IN (
    'exceptionally_rare_ip',
    'strategic_ecosystem_gap',
    'network_effects',
    'competitive_lockout',
    'first_mover_advantage'
  )),
  justification_details TEXT NOT NULL,
  estimated_value_usd NUMERIC,
  
  -- C-Suite/Division Director authorization
  initiated_by UUID NOT NULL REFERENCES auth.users(id), -- Must be C-suite or Division Director
  
  -- Two additional approvals required
  approver_1_id UUID REFERENCES auth.users(id),
  approver_1_role TEXT,
  approver_1_approved_at TIMESTAMPTZ,
  
  approver_2_id UUID REFERENCES auth.users(id),
  approver_2_role TEXT,
  approver_2_approved_at TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  
  -- Final decision
  final_decision_by UUID REFERENCES auth.users(id),
  final_decision_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 7: IP Tier Downgrade History (Track penalties)
-- ============================================
CREATE TABLE public.ip_tier_downgrade_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_asset_id UUID NOT NULL REFERENCES public.ip_assets(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Downgrade details
  original_tier ip_control_tier NOT NULL,
  downgraded_to ip_control_tier NOT NULL,
  reason TEXT NOT NULL,
  related_arbitration_case_id UUID REFERENCES public.ip_arbitration_cases(id),
  
  -- Duration
  downgrade_duration_months INTEGER,
  downgrade_start_date TIMESTAMPTZ DEFAULT NOW(),
  downgrade_end_date TIMESTAMPTZ,
  is_permanent BOOLEAN DEFAULT false,
  
  -- Restoration
  restored_at TIMESTAMPTZ,
  restored_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_ip_assets_creator ON public.ip_assets(creator_id);
CREATE INDEX idx_ip_assets_tier ON public.ip_assets(control_tier);
CREATE INDEX idx_ip_assets_active ON public.ip_assets(is_active);

CREATE INDEX idx_ip_proposals_status ON public.ip_use_proposals(status);
CREATE INDEX idx_ip_proposals_creator_deadline ON public.ip_use_proposals(creator_response_deadline);

CREATE INDEX idx_tier_c_invitations_status ON public.tier_c_invitations(status);
CREATE INDEX idx_tier_c_invitations_creator ON public.tier_c_invitations(creator_id);

CREATE INDEX idx_arbitration_cases_creator ON public.ip_arbitration_cases(creator_id);
CREATE INDEX idx_arbitration_cases_resolved ON public.ip_arbitration_cases(resolved_at);

-- ============================================
-- RLS POLICIES
-- ============================================

-- IP Assets
ALTER TABLE public.ip_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view own IP assets"
  ON public.ip_assets FOR SELECT
  USING (creator_id = auth.uid());

CREATE POLICY "Admins can view all IP assets"
  ON public.ip_assets FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Creators can create IP assets"
  ON public.ip_assets FOR INSERT
  WITH CHECK (creator_id = auth.uid() AND control_tier != 'tier_c');

CREATE POLICY "Creators can update own IP assets"
  ON public.ip_assets FOR UPDATE
  USING (creator_id = auth.uid());

-- IP Creator Controls
ALTER TABLE public.ip_creator_controls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view own controls"
  ON public.ip_creator_controls FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.ip_assets
    WHERE id = ip_creator_controls.ip_asset_id
    AND creator_id = auth.uid()
  ));

CREATE POLICY "Admins can view all controls"
  ON public.ip_creator_controls FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Patent Pool Usage Rights
ALTER TABLE public.patent_pool_usage_rights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view patent pool rights"
  ON public.patent_pool_usage_rights FOR SELECT
  USING (true); -- All members can see what's in the pool

CREATE POLICY "Creators can manage own pool rights"
  ON public.patent_pool_usage_rights FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.ip_assets
    WHERE id = patent_pool_usage_rights.ip_asset_id
    AND creator_id = auth.uid()
  ));

-- IP Use Proposals
ALTER TABLE public.ip_use_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view proposals"
  ON public.ip_use_proposals FOR SELECT
  USING (
    proposed_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.ip_assets
      WHERE id = ip_use_proposals.ip_asset_id
      AND creator_id = auth.uid()
    )
  );

CREATE POLICY "Members can create proposals"
  ON public.ip_use_proposals FOR INSERT
  WITH CHECK (proposed_by = auth.uid());

CREATE POLICY "Creators can respond to proposals"
  ON public.ip_use_proposals FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.ip_assets
    WHERE id = ip_use_proposals.ip_asset_id
    AND creator_id = auth.uid()
  ));

-- IP Arbitration Cases
ALTER TABLE public.ip_arbitration_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parties can view own arbitration cases"
  ON public.ip_arbitration_cases FOR SELECT
  USING (
    creator_id = auth.uid() OR
    filed_by = auth.uid() OR
    mediator_id = auth.uid()
  );

CREATE POLICY "Admins can view all arbitration cases"
  ON public.ip_arbitration_cases FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members can file arbitration"
  ON public.ip_arbitration_cases FOR INSERT
  WITH CHECK (filed_by = auth.uid());

-- Tier C Invitations
ALTER TABLE public.tier_c_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "C-Suite can create Tier C invitations"
  ON public.tier_c_invitations FOR INSERT
  WITH CHECK (
    initiated_by = auth.uid() AND
    (public.has_role(auth.uid(), 'admin') OR
     EXISTS (
       SELECT 1 FROM public.user_roles
       WHERE user_id = auth.uid()
       AND role::text IN ('admin', 'project_owner')
     ))
  );

CREATE POLICY "Invited creators can view their invitations"
  ON public.tier_c_invitations FOR SELECT
  USING (creator_id = auth.uid() OR initiated_by = auth.uid());

CREATE POLICY "Approvers can view pending invitations"
  ON public.tier_c_invitations FOR SELECT
  USING (
    approver_1_id = auth.uid() OR
    approver_2_id = auth.uid() OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Approvers can update invitations"
  ON public.tier_c_invitations FOR UPDATE
  USING (
    approver_1_id = auth.uid() OR
    approver_2_id = auth.uid() OR
    initiated_by = auth.uid() OR
    public.has_role(auth.uid(), 'admin')
  );

-- IP Tier Downgrade History
ALTER TABLE public.ip_tier_downgrade_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view own downgrade history"
  ON public.ip_tier_downgrade_history FOR SELECT
  USING (creator_id = auth.uid());

CREATE POLICY "Admins can view all downgrade history"
  ON public.ip_tier_downgrade_history FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create controls for Tier A assets
CREATE OR REPLACE FUNCTION public.auto_create_ip_controls()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.control_tier = 'tier_a' THEN
    INSERT INTO public.ip_creator_controls (ip_asset_id)
    VALUES (NEW.id);
  END IF;
  
  IF NEW.control_tier = 'tier_b' THEN
    INSERT INTO public.patent_pool_usage_rights (ip_asset_id)
    VALUES (NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_create_ip_controls
  AFTER INSERT ON public.ip_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_ip_controls();

-- Auto-approve proposals after deadline
CREATE OR REPLACE FUNCTION public.auto_approve_expired_proposals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.creator_response_deadline < NOW() AND NEW.status = 'pending' THEN
    NEW.status := 'auto_approved';
    NEW.auto_approved_at := NOW();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_approve_proposals
  BEFORE UPDATE ON public.ip_use_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_approve_expired_proposals();

-- Update timestamps
CREATE TRIGGER update_ip_assets_updated_at
  BEFORE UPDATE ON public.ip_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tier_c_invitations_updated_at
  BEFORE UPDATE ON public.tier_c_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();