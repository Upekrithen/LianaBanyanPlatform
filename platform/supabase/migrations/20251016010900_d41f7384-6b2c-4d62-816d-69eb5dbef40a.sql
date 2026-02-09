-- Task 22: Scale Rate System for Contract Positions

-- Add scale rate columns to contract_position_templates
ALTER TABLE contract_position_templates
ADD COLUMN scale_rate_type text CHECK (scale_rate_type IN ('standard', 'negotiated', 'custom')),
ADD COLUMN negotiated_scale_id uuid,
ADD COLUMN scale_rate_metadata jsonb DEFAULT '{}'::jsonb;

-- Create table for bulk scale rate negotiations
CREATE TABLE contract_scale_negotiations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  organization_type text NOT NULL CHECK (organization_type IN ('guild', 'clan', 'council')),
  organization_id uuid NOT NULL,
  negotiated_by uuid REFERENCES profiles(id) NOT NULL,
  approved_by uuid REFERENCES profiles(id),
  
  -- Negotiated terms
  discount_percentage numeric DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  bulk_commitment_positions integer DEFAULT 0,
  minimum_positions_required integer DEFAULT 1,
  
  -- Status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'expired', 'rejected')),
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  
  -- Metadata
  terms jsonb DEFAULT '{}'::jsonb,
  notes text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE (project_id, organization_type, organization_id, status)
);

-- Enable RLS
ALTER TABLE contract_scale_negotiations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scale negotiations
CREATE POLICY "Anyone can view active negotiations"
ON contract_scale_negotiations FOR SELECT
USING (status = 'active' OR status = 'approved');

CREATE POLICY "Project owners can manage negotiations"
ON contract_scale_negotiations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = contract_scale_negotiations.project_id
    AND projects.owner_id = auth.uid()
  )
);

CREATE POLICY "Organization members can create negotiations"
ON contract_scale_negotiations FOR INSERT
WITH CHECK (negotiated_by = auth.uid());

CREATE POLICY "HR and Stewards can manage negotiations"
ON contract_scale_negotiations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM project_member_contracts
    WHERE project_member_contracts.project_id = contract_scale_negotiations.project_id
    AND project_member_contracts.member_id = auth.uid()
    AND project_member_contracts.status = 'active'
    AND (LOWER(project_member_contracts.contract_title) = 'hr' OR LOWER(project_member_contracts.contract_title) = 'steward')
  )
);

-- Add foreign key for negotiated scale
ALTER TABLE contract_position_templates
ADD CONSTRAINT fk_negotiated_scale
FOREIGN KEY (negotiated_scale_id) REFERENCES contract_scale_negotiations(id) ON DELETE SET NULL;

-- Function to calculate effective compensation with scale rate
CREATE OR REPLACE FUNCTION calculate_position_compensation(
  _position_id uuid,
  _organization_type text DEFAULT NULL,
  _organization_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _position RECORD;
  _negotiation RECORD;
  _discount NUMERIC := 0;
  _effective_cash NUMERIC;
  _effective_equity NUMERIC;
BEGIN
  -- Get position details
  SELECT * INTO _position
  FROM contract_position_templates
  WHERE id = _position_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Position not found');
  END IF;
  
  -- Check for negotiated rate
  IF _position.scale_rate_type = 'negotiated' AND _position.negotiated_scale_id IS NOT NULL THEN
    SELECT * INTO _negotiation
    FROM contract_scale_negotiations
    WHERE id = _position.negotiated_scale_id
    AND status = 'active'
    AND (valid_until IS NULL OR valid_until > now());
    
    IF FOUND THEN
      _discount := _negotiation.discount_percentage;
    END IF;
  END IF;
  
  -- Check for applicable organization negotiation
  IF _organization_type IS NOT NULL AND _organization_id IS NOT NULL THEN
    SELECT * INTO _negotiation
    FROM contract_scale_negotiations
    WHERE project_id = _position.project_id
    AND organization_type = _organization_type
    AND organization_id = _organization_id
    AND status = 'active'
    AND (valid_until IS NULL OR valid_until > now())
    ORDER BY discount_percentage DESC
    LIMIT 1;
    
    IF FOUND AND _negotiation.discount_percentage > _discount THEN
      _discount := _negotiation.discount_percentage;
    END IF;
  END IF;
  
  -- Calculate effective compensation
  _effective_cash := COALESCE(_position.cash_amount, 0) * (1 - _discount / 100.0);
  _effective_equity := COALESCE(_position.equity_percentage, 0);
  
  RETURN jsonb_build_object(
    'base_cash', COALESCE(_position.cash_amount, 0),
    'base_equity', COALESCE(_position.equity_percentage, 0),
    'discount_percentage', _discount,
    'effective_cash', _effective_cash,
    'effective_equity', _effective_equity,
    'scale_rate_type', _position.scale_rate_type,
    'has_negotiated_rate', (_discount > 0)
  );
END;
$$;

-- Update timestamp trigger for negotiations
CREATE TRIGGER update_scale_negotiations_timestamp
BEFORE UPDATE ON contract_scale_negotiations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_scale_negotiations_project ON contract_scale_negotiations(project_id);
CREATE INDEX idx_scale_negotiations_org ON contract_scale_negotiations(organization_type, organization_id);
CREATE INDEX idx_scale_negotiations_status ON contract_scale_negotiations(status);
CREATE INDEX idx_position_templates_scale ON contract_position_templates(scale_rate_type, negotiated_scale_id);