-- Create audit log table for tracking all changes
CREATE TABLE public.agent_action_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES auth.users(id),
  agent_email TEXT NOT NULL,
  agent_role TEXT,
  action_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'activate', 'deactivate'
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  changes JSONB NOT NULL, -- stores old_values and new_values
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Verification fields
  verified BOOLEAN DEFAULT true,
  verification_method TEXT DEFAULT 'supabase_auth'
);

-- Enable RLS
ALTER TABLE public.agent_action_audit_log ENABLE ROW LEVEL SECURITY;

-- Admins and project owners can view audit logs
CREATE POLICY "Admins can view all audit logs"
  ON public.agent_action_audit_log
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Project owners can view logs for their projects"
  ON public.agent_action_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.owner_id = auth.uid()
    )
  );

-- Agents can view their own logs
CREATE POLICY "Agents can view own logs"
  ON public.agent_action_audit_log
  FOR SELECT
  USING (agent_id = auth.uid());

-- Create aggregate project data table for Liana Banyan
CREATE TABLE public.project_aggregate_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_category TEXT NOT NULL, -- Used to group similar projects
  project_tags TEXT[], -- Additional categorization
  
  -- Aggregate metrics
  avg_position_cost NUMERIC,
  avg_position_profit NUMERIC,
  avg_completion_time_days INTEGER,
  total_projects_analyzed INTEGER DEFAULT 0,
  
  -- Common requirements across similar projects
  common_prerequisites JSONB DEFAULT '[]'::jsonb,
  common_requirements JSONB DEFAULT '[]'::jsonb,
  
  -- Cost/profit ranges
  min_cost NUMERIC,
  max_cost NUMERIC,
  min_profit NUMERIC,
  max_profit NUMERIC,
  
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(project_category)
);

-- Enable RLS
ALTER TABLE public.project_aggregate_data ENABLE ROW LEVEL SECURITY;

-- Anyone can view aggregate data (for Liana Banyan insights)
CREATE POLICY "Anyone can view aggregate project data"
  ON public.project_aggregate_data
  FOR SELECT
  USING (true);

-- Only admins can manage aggregate data
CREATE POLICY "Admins can manage aggregate data"
  ON public.project_aggregate_data
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Create project category mapping
CREATE TABLE public.project_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(project_id)
);

-- Enable RLS
ALTER TABLE public.project_categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view project categories
CREATE POLICY "Anyone can view project categories"
  ON public.project_categories
  FOR SELECT
  USING (true);

-- Project owners can manage their categories
CREATE POLICY "Project owners can manage categories"
  ON public.project_categories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_categories.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Add indexes
CREATE INDEX idx_audit_log_agent_id ON public.agent_action_audit_log(agent_id);
CREATE INDEX idx_audit_log_table_record ON public.agent_action_audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_timestamp ON public.agent_action_audit_log(timestamp DESC);
CREATE INDEX idx_project_categories_project_id ON public.project_categories(project_id);
CREATE INDEX idx_project_categories_category ON public.project_categories(category);

-- Function to log agent actions
CREATE OR REPLACE FUNCTION public.log_agent_action(
  _action_type TEXT,
  _table_name TEXT,
  _record_id UUID,
  _changes JSONB,
  _ip_address TEXT DEFAULT NULL,
  _user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _log_id UUID;
  _agent_email TEXT;
  _agent_role TEXT;
BEGIN
  -- Get agent email
  SELECT email INTO _agent_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Get agent role
  SELECT role::text INTO _agent_role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  -- Insert audit log
  INSERT INTO public.agent_action_audit_log (
    agent_id,
    agent_email,
    agent_role,
    action_type,
    table_name,
    record_id,
    changes,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    _agent_email,
    COALESCE(_agent_role, 'user'),
    _action_type,
    _table_name,
    _record_id,
    _changes,
    _ip_address,
    _user_agent
  )
  RETURNING id INTO _log_id;
  
  RETURN _log_id;
END;
$$;

-- Trigger function for contract position changes
CREATE OR REPLACE FUNCTION public.audit_contract_position_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    PERFORM public.log_agent_action(
      'update',
      'contract_position_templates',
      NEW.id,
      jsonb_build_object(
        'old_values', to_jsonb(OLD),
        'new_values', to_jsonb(NEW)
      )
    );
  ELSIF (TG_OP = 'INSERT') THEN
    PERFORM public.log_agent_action(
      'create',
      'contract_position_templates',
      NEW.id,
      jsonb_build_object('new_values', to_jsonb(NEW))
    );
  ELSIF (TG_OP = 'DELETE') THEN
    PERFORM public.log_agent_action(
      'delete',
      'contract_position_templates',
      OLD.id,
      jsonb_build_object('old_values', to_jsonb(OLD))
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for contract positions
CREATE TRIGGER audit_contract_position_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.contract_position_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_contract_position_changes();

-- Trigger function for contract assignment config changes
CREATE OR REPLACE FUNCTION public.audit_contract_config_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    PERFORM public.log_agent_action(
      'update',
      'contract_assignment_configs',
      NEW.id,
      jsonb_build_object(
        'old_values', to_jsonb(OLD),
        'new_values', to_jsonb(NEW)
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for contract assignment configs
CREATE TRIGGER audit_contract_config_changes
  AFTER UPDATE ON public.contract_assignment_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_contract_config_changes();