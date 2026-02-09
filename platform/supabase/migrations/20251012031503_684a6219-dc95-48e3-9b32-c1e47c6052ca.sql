-- Create contract assignment configuration table
CREATE TABLE public.contract_assignment_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  
  -- Equity/Cash ratios
  min_equity_ratio NUMERIC NOT NULL DEFAULT 0.1 CHECK (min_equity_ratio >= 0 AND min_equity_ratio <= 1),
  max_equity_ratio NUMERIC NOT NULL DEFAULT 0.9 CHECK (max_equity_ratio >= 0 AND max_equity_ratio <= 1),
  
  -- Assignment lead time in days
  assignment_lead_time_days INTEGER NOT NULL DEFAULT 90,
  
  -- Prerequisites and requirements
  prerequisites JSONB DEFAULT '[]'::jsonb,
  requirements JSONB DEFAULT '[]'::jsonb,
  
  -- Time commitment options for equipment scheduling
  time_commitment_options JSONB NOT NULL DEFAULT '[
    {"days": 30, "label": "1 Month"},
    {"days": 60, "label": "2 Months"},
    {"days": 90, "label": "3 Months"},
    {"days": 180, "label": "6 Months"},
    {"days": 365, "label": "1 Year"}
  ]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(project_id)
);

-- Enable RLS
ALTER TABLE public.contract_assignment_configs ENABLE ROW LEVEL SECURITY;

-- Anyone can view configs
CREATE POLICY "Anyone can view contract assignment configs"
  ON public.contract_assignment_configs
  FOR SELECT
  USING (true);

-- Project owners can manage configs
CREATE POLICY "Project owners can manage contract assignment configs"
  ON public.contract_assignment_configs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = contract_assignment_configs.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Stewards can manage configs
CREATE POLICY "Stewards can manage contract assignment configs"
  ON public.contract_assignment_configs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.project_member_contracts
      WHERE project_member_contracts.project_id = contract_assignment_configs.project_id
      AND project_member_contracts.member_id = auth.uid()
      AND project_member_contracts.status = 'active'
      AND LOWER(project_member_contracts.contract_title) = 'steward'
    )
  );

-- HR can manage configs
CREATE POLICY "HR can manage contract assignment configs"
  ON public.contract_assignment_configs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.project_member_contracts
      WHERE project_member_contracts.project_id = contract_assignment_configs.project_id
      AND project_member_contracts.member_id = auth.uid()
      AND project_member_contracts.status = 'active'
      AND LOWER(project_member_contracts.contract_title) = 'hr'
    )
  );

-- Auto-create default config for new projects
CREATE OR REPLACE FUNCTION public.create_default_contract_assignment_config()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.contract_assignment_configs (project_id)
  VALUES (NEW.id)
  ON CONFLICT (project_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_create_contract_assignment_config
  AFTER INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_contract_assignment_config();

-- Create configs for existing projects
INSERT INTO public.contract_assignment_configs (project_id)
SELECT p.id 
FROM public.projects p
LEFT JOIN public.contract_assignment_configs cac ON cac.project_id = p.id
WHERE cac.id IS NULL
ON CONFLICT (project_id) DO NOTHING;

-- Add index
CREATE INDEX idx_contract_assignment_configs_project_id ON public.contract_assignment_configs(project_id);