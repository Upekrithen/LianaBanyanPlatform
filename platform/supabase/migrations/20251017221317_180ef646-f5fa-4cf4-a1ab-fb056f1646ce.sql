-- ============================================
-- BACKUP POSITION SLA TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS public.backup_position_slas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID NOT NULL REFERENCES public.contract_position_templates(id),
  project_id UUID NOT NULL REFERENCES public.projects(id),
  
  -- SLA Parameters
  response_time_hours INTEGER NOT NULL DEFAULT 24, -- 24 hours standard response
  activation_notice_hours INTEGER NOT NULL DEFAULT 48, -- 48 hours notice before activation
  max_activation_delay_hours INTEGER NOT NULL DEFAULT 6, -- 6 hours max delay after activation
  
  -- Penalty Structure (percentage of contract value)
  late_response_penalty_pct NUMERIC NOT NULL DEFAULT 5.0, -- 5% penalty for late response
  failed_activation_penalty_pct NUMERIC NOT NULL DEFAULT 15.0, -- 15% penalty for failed activation
  reputation_hit_per_violation INTEGER NOT NULL DEFAULT 10, -- 10 point reputation hit per violation
  
  -- Tracking
  total_activations INTEGER DEFAULT 0,
  successful_activations INTEGER DEFAULT 0,
  failed_activations INTEGER DEFAULT 0,
  average_response_time_hours NUMERIC,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_backup_slas_position ON public.backup_position_slas(position_id);
CREATE INDEX idx_backup_slas_project ON public.backup_position_slas(project_id);

-- ============================================
-- GUILD SPONSORSHIP & CO-SIGNING
-- ============================================

CREATE TABLE IF NOT EXISTS public.guild_sponsorship_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Parties
  sponsor_id UUID NOT NULL, -- Higher guild member
  mentee_id UUID NOT NULL, -- Junior guild member
  contract_id UUID NOT NULL REFERENCES public.contract_position_templates(id),
  project_id UUID NOT NULL REFERENCES public.projects(id),
  
  -- Guild Levels
  sponsor_tier TEXT NOT NULL, -- 'apprentice', 'journeyman', 'master'
  sponsor_class INTEGER NOT NULL CHECK (sponsor_class BETWEEN 1 AND 6),
  mentee_tier TEXT NOT NULL,
  mentee_class INTEGER NOT NULL CHECK (mentee_class BETWEEN 1 AND 6),
  
  -- Level Difference (for percentage calculation)
  tier_difference INTEGER NOT NULL, -- 0=same tier, 1=one tier apart, 2=two tiers apart
  class_difference INTEGER NOT NULL, -- difference in classes
  
  -- Financial Terms
  access_fee_percentage NUMERIC NOT NULL, -- Fee sponsor receives (5-15% based on difference)
  contract_value NUMERIC NOT NULL,
  sponsor_earnings NUMERIC, -- Calculated: contract_value * (access_fee_percentage / 100)
  
  -- Reputation Risk
  reputation_risk_percentage NUMERIC NOT NULL, -- How much sponsor risks (5-35% based on proximity)
  sponsor_reputation_at_signing NUMERIC NOT NULL, -- Snapshot of sponsor's reputation
  mentee_reputation_at_signing NUMERIC NOT NULL,
  
  -- Status & Performance
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'failed', 'disputed'
  contract_completed_successfully BOOLEAN,
  reputation_penalty_applied NUMERIC DEFAULT 0, -- Actual penalty if mentee failed
  reputation_penalty_date TIMESTAMPTZ,
  
  -- Timestamps
  signed_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_guild_sponsorship_sponsor ON public.guild_sponsorship_records(sponsor_id);
CREATE INDEX idx_guild_sponsorship_mentee ON public.guild_sponsorship_records(mentee_id);
CREATE INDEX idx_guild_sponsorship_contract ON public.guild_sponsorship_records(contract_id);
CREATE INDEX idx_guild_sponsorship_status ON public.guild_sponsorship_records(status);

-- ============================================
-- CLAN CROSS-PROJECT RESOURCE SHARING
-- ============================================

CREATE TABLE IF NOT EXISTS public.clan_resource_sharing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Clan & Projects
  clan_id UUID NOT NULL REFERENCES public.clans(id),
  owner_project_id UUID NOT NULL REFERENCES public.projects(id), -- Project that owns the resource
  borrower_project_id UUID NOT NULL REFERENCES public.projects(id), -- Project borrowing the resource
  
  -- Resource Details
  resource_type TEXT NOT NULL, -- 'equipment', 'supplies', 'tools', 'materials'
  resource_name TEXT NOT NULL,
  resource_description TEXT,
  
  -- Financial Benefits
  standard_rental_rate NUMERIC NOT NULL, -- Market rate per day/unit
  clan_discount_percentage NUMERIC NOT NULL DEFAULT 25.0, -- 25% discount for clan members
  discounted_rate NUMERIC NOT NULL, -- Calculated: standard_rate * (1 - discount_pct / 100)
  
  -- Usage Tracking
  reserved_from TIMESTAMPTZ NOT NULL,
  reserved_until TIMESTAMPTZ NOT NULL,
  actual_return_date TIMESTAMPTZ,
  condition_at_loan TEXT, -- 'excellent', 'good', 'fair', 'poor'
  condition_at_return TEXT,
  
  -- Financial Settlement
  total_cost NUMERIC, -- Calculated based on duration and discounted_rate
  paid BOOLEAN DEFAULT false,
  payment_date TIMESTAMPTZ,
  
  -- Vouching & Reputation
  vouched_by UUID, -- Clan member who vouched for borrower
  voucher_reputation_risk NUMERIC DEFAULT 5.0, -- Reputation at stake if damaged/not returned
  damage_reported BOOLEAN DEFAULT false,
  damage_description TEXT,
  reputation_penalty_applied NUMERIC DEFAULT 0,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'returned', 'damaged', 'lost'
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT different_projects CHECK (owner_project_id != borrower_project_id)
);

CREATE INDEX idx_clan_resources_clan ON public.clan_resource_sharing(clan_id);
CREATE INDEX idx_clan_resources_owner ON public.clan_resource_sharing(owner_project_id);
CREATE INDEX idx_clan_resources_borrower ON public.clan_resource_sharing(borrower_project_id);
CREATE INDEX idx_clan_resources_status ON public.clan_resource_sharing(status);
CREATE INDEX idx_clan_resources_dates ON public.clan_resource_sharing(reserved_from, reserved_until);

-- ============================================
-- HELPER FUNCTION: Calculate Guild Sponsorship Terms
-- ============================================

CREATE OR REPLACE FUNCTION public.calculate_guild_sponsorship_terms(
  _sponsor_tier TEXT,
  _sponsor_class INTEGER,
  _mentee_tier TEXT,
  _mentee_class INTEGER,
  _contract_value NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tier_map JSONB := '{"apprentice": 1, "journeyman": 2, "master": 3}'::JSONB;
  _sponsor_tier_num INTEGER;
  _mentee_tier_num INTEGER;
  _tier_diff INTEGER;
  _class_diff INTEGER;
  _total_level_diff INTEGER;
  _access_fee_pct NUMERIC;
  _reputation_risk_pct NUMERIC;
BEGIN
  -- Convert tiers to numbers
  _sponsor_tier_num := (_tier_map->>_sponsor_tier)::INTEGER;
  _mentee_tier_num := (_tier_map->>_mentee_tier)::INTEGER;
  
  -- Calculate differences
  _tier_diff := _sponsor_tier_num - _mentee_tier_num;
  _class_diff := (_sponsor_tier_num * 6 + _sponsor_class) - (_mentee_tier_num * 6 + _mentee_class);
  _total_level_diff := _class_diff;
  
  -- Access fee: 5-15% based on level difference (more difference = higher fee)
  _access_fee_pct := LEAST(15.0, GREATEST(5.0, 5.0 + (_total_level_diff * 0.5)));
  
  -- Reputation risk: 5-35% inversely based on level difference (closer = higher risk)
  -- Apprentice-Apprentice or close levels = HIGH risk
  -- Master-Apprentice = LOW risk (master should know what they're doing)
  IF _tier_diff = 0 THEN
    -- Same tier, risk based on class difference
    _reputation_risk_pct := GREATEST(25.0, 35.0 - (_class_diff * 2.0));
  ELSIF _tier_diff = 1 THEN
    -- One tier apart (e.g., Journeyman-Apprentice)
    _reputation_risk_pct := GREATEST(15.0, 20.0 - (_class_diff * 1.0));
  ELSE
    -- Two tiers apart (Master-Apprentice)
    _reputation_risk_pct := GREATEST(5.0, 10.0 - (_class_diff * 0.5));
  END IF;
  
  RETURN jsonb_build_object(
    'access_fee_percentage', _access_fee_pct,
    'sponsor_earnings', _contract_value * (_access_fee_pct / 100.0),
    'reputation_risk_percentage', _reputation_risk_pct,
    'tier_difference', _tier_diff,
    'class_difference', _class_diff,
    'total_level_difference', _total_level_diff
  );
END;
$$;

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE public.backup_position_slas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_sponsorship_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clan_resource_sharing ENABLE ROW LEVEL SECURITY;

-- Backup SLAs: Anyone can view, project owners can manage
CREATE POLICY "Anyone can view backup SLAs"
  ON public.backup_position_slas FOR SELECT
  USING (true);

CREATE POLICY "Project owners can manage backup SLAs"
  ON public.backup_position_slas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = backup_position_slas.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Guild Sponsorship: Participants and project owners can view
CREATE POLICY "Participants can view guild sponsorships"
  ON public.guild_sponsorship_records FOR SELECT
  USING (
    sponsor_id = auth.uid()
    OR mentee_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = guild_sponsorship_records.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Sponsors can create sponsorships"
  ON public.guild_sponsorship_records FOR INSERT
  WITH CHECK (sponsor_id = auth.uid());

CREATE POLICY "Project owners can update sponsorships"
  ON public.guild_sponsorship_records FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = guild_sponsorship_records.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Clan Resource Sharing: Clan members can view and create
CREATE POLICY "Clan members can view resource sharing"
  ON public.clan_resource_sharing FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clan_members
      WHERE clan_members.clan_id = clan_resource_sharing.clan_id
      AND clan_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Clan members can create resource sharing"
  ON public.clan_resource_sharing FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clan_members
      WHERE clan_members.clan_id = clan_resource_sharing.clan_id
      AND clan_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can manage resource sharing"
  ON public.clan_resource_sharing FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE (projects.id = clan_resource_sharing.owner_project_id
             OR projects.id = clan_resource_sharing.borrower_project_id)
      AND projects.owner_id = auth.uid()
    )
  );

-- ============================================
-- UPDATE TRIGGERS
-- ============================================

CREATE TRIGGER update_backup_slas_updated_at
  BEFORE UPDATE ON public.backup_position_slas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_guild_sponsorship_updated_at
  BEFORE UPDATE ON public.guild_sponsorship_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clan_resources_updated_at
  BEFORE UPDATE ON public.clan_resource_sharing
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();