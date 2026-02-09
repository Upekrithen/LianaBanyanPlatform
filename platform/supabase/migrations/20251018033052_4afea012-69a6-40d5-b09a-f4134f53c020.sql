-- Guild Re-Entry Cost Structure
-- Add fields to track previous membership and re-entry debt

ALTER TABLE user_guild_progression 
ADD COLUMN IF NOT EXISTS previous_stake_paid NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS reentry_debt NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS reentry_terms JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS left_guild_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rejoined_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

COMMENT ON COLUMN user_guild_progression.previous_stake_paid IS 'Total stake paid in previous guild membership (if rejoining)';
COMMENT ON COLUMN user_guild_progression.reentry_debt IS 'Remaining balance owed from rejoining guild';
COMMENT ON COLUMN user_guild_progression.reentry_terms IS 'Payment schedule: {upfront_paid, deferred_amount, monthly_deduction_pct}';
COMMENT ON COLUMN user_guild_progression.left_guild_at IS 'When user left guild (NULL if never left)';
COMMENT ON COLUMN user_guild_progression.rejoined_at IS 'When user rejoined guild (NULL if never rejoined)';

-- Guild membership history tracking
CREATE TABLE IF NOT EXISTS guild_membership_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guild_id UUID REFERENCES guilds(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('joined', 'left', 'rejoined')),
  tier_at_action TEXT,
  class_at_action INTEGER,
  stake_at_action NUMERIC DEFAULT 0,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE guild_membership_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own membership history"
ON guild_membership_history FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can insert membership history"
ON guild_membership_history FOR INSERT
WITH CHECK (true);

-- Accessory Trunk (Derivative Projects) Architecture
-- Add parent-child project relationships and IP compliance

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS parent_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS derivative_type TEXT CHECK (derivative_type IN ('accessory_trunk', 'licensed_variant')),
ADD COLUMN IF NOT EXISTS ip_compliance_rules JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS royalty_percentage NUMERIC DEFAULT 0 CHECK (royalty_percentage >= 0 AND royalty_percentage <= 100),
ADD COLUMN IF NOT EXISTS governance_link UUID REFERENCES guild_charters(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS derivative_status TEXT DEFAULT 'pending' CHECK (derivative_status IN ('pending', 'approved', 'active', 'suspended', 'terminated')),
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN projects.parent_project_id IS 'Parent project for derivative trunks (NULL for primary trunk)';
COMMENT ON COLUMN projects.derivative_type IS 'Type of derivative: accessory_trunk (full fork) or licensed_variant (partial fork)';
COMMENT ON COLUMN projects.ip_compliance_rules IS 'Inherited IP rules from parent: {enforce_tier_model, parent_equity_share, contract_template_source, etc}';
COMMENT ON COLUMN projects.royalty_percentage IS 'Percentage of revenue flowing to parent project';
COMMENT ON COLUMN projects.governance_link IS 'Link to parent governance charter for compliance';

-- Derivative project revenue tracking
CREATE TABLE IF NOT EXISTS derivative_royalties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  derivative_project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  revenue_amount NUMERIC NOT NULL,
  royalty_amount NUMERIC NOT NULL,
  royalty_percentage NUMERIC NOT NULL,
  transaction_hash TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed')),
  paid_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE derivative_royalties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project owners can view derivative royalties"
ON derivative_royalties FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE (projects.id = derivative_royalties.parent_project_id OR projects.id = derivative_royalties.derivative_project_id)
    AND projects.owner_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage derivative royalties"
ON derivative_royalties FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- IP compliance audit log
CREATE TABLE IF NOT EXISTS derivative_compliance_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  derivative_project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  audit_type TEXT NOT NULL CHECK (audit_type IN ('automated', 'manual', 'triggered')),
  compliance_status TEXT NOT NULL CHECK (compliance_status IN ('compliant', 'warning', 'violation')),
  findings JSONB DEFAULT '[]',
  audited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  audited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ DEFAULT NULL
);

ALTER TABLE derivative_compliance_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project owners can view compliance audits"
ON derivative_compliance_audits FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = derivative_compliance_audits.derivative_project_id
    AND projects.owner_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage compliance audits"
ON derivative_compliance_audits FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Function to calculate guild re-entry cost
CREATE OR REPLACE FUNCTION calculate_reentry_cost(
  _user_id UUID,
  _target_tier TEXT,
  _target_class INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _progression RECORD;
  _required_stake NUMERIC;
  _upfront_amount NUMERIC;
  _deferred_amount NUMERIC;
BEGIN
  -- Get user's progression data
  SELECT * INTO _progression
  FROM user_guild_progression
  WHERE user_id = _user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'User progression not found');
  END IF;
  
  -- Get required stake for target tier/class (from STAKE_INFO)
  -- This would reference your existing stake structure
  _required_stake := 100; -- Placeholder, should query your stake structure
  
  -- Calculate re-entry cost
  IF _progression.previous_stake_paid >= _required_stake THEN
    -- Already paid enough, but may have penalty for time lost
    RETURN jsonb_build_object(
      'reentry_cost', 0,
      'upfront_payment', 0,
      'deferred_payment', 0,
      'message', 'Stake already paid, but guild benefits were lost during absence'
    );
  ELSE
    -- Need to pay difference
    _upfront_amount := (_required_stake - _progression.previous_stake_paid) * 0.333;
    _deferred_amount := (_required_stake - _progression.previous_stake_paid) * 0.667;
    
    RETURN jsonb_build_object(
      'reentry_cost', _required_stake - _progression.previous_stake_paid,
      'upfront_payment', _upfront_amount,
      'deferred_payment', _deferred_amount,
      'total_required_stake', _required_stake,
      'previous_stake_paid', _progression.previous_stake_paid,
      'message', 'Pay 33% upfront, 67% from future profits'
    );
  END IF;
END;
$$;

-- Function to validate derivative project IP compliance
CREATE OR REPLACE FUNCTION validate_derivative_compliance(
  _derivative_project_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _project RECORD;
  _parent RECORD;
  _violations TEXT[] := ARRAY[]::TEXT[];
  _warnings TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Get derivative project
  SELECT * INTO _project
  FROM projects
  WHERE id = _derivative_project_id;
  
  IF NOT FOUND OR _project.parent_project_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Not a derivative project');
  END IF;
  
  -- Get parent project
  SELECT * INTO _parent
  FROM projects
  WHERE id = _project.parent_project_id;
  
  -- Check IP compliance rules
  IF _project.ip_compliance_rules IS NULL THEN
    _violations := array_append(_violations, 'IP compliance rules not defined');
  ELSE
    -- Check if 3-tier model is enforced
    IF NOT (_project.ip_compliance_rules->>'enforce_tier_model')::boolean THEN
      _violations := array_append(_violations, '3-Tier IP model must be enforced');
    END IF;
    
    -- Check royalty percentage is set
    IF _project.royalty_percentage = 0 THEN
      _warnings := array_append(_warnings, 'Royalty percentage is 0%');
    END IF;
  END IF;
  
  -- Return compliance status
  RETURN jsonb_build_object(
    'compliant', array_length(_violations, 1) IS NULL,
    'violations', _violations,
    'warnings', _warnings,
    'checked_at', now()
  );
END;
$$;