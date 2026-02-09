-- Create table for project-specific voting configurations
CREATE TABLE IF NOT EXISTS public.project_voting_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE UNIQUE,
  product_lead_time_days INTEGER NOT NULL DEFAULT 180,
  time_commitment_options JSONB NOT NULL DEFAULT '[
    {"days": 7, "label": "1 Week"},
    {"days": 14, "label": "2 Weeks"},
    {"days": 30, "label": "1 Month"},
    {"days": 60, "label": "2 Months"},
    {"days": 90, "label": "3 Months"},
    {"days": 180, "label": "6 Months"}
  ]'::jsonb,
  min_equity_ratio NUMERIC NOT NULL DEFAULT 0.1 CHECK (min_equity_ratio >= 0 AND min_equity_ratio <= 1),
  max_equity_ratio NUMERIC NOT NULL DEFAULT 0.9 CHECK (max_equity_ratio >= 0 AND max_equity_ratio <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_voting_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view voting configs"
  ON public.project_voting_configs
  FOR SELECT
  USING (true);

CREATE POLICY "Project owners can manage voting configs"
  ON public.project_voting_configs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_voting_configs.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Create trigger to auto-create config when project is created
CREATE OR REPLACE FUNCTION public.create_default_voting_config()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.project_voting_configs (project_id)
  VALUES (NEW.id)
  ON CONFLICT (project_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_create_voting_config
  AFTER INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_voting_config();

-- Create index
CREATE INDEX idx_project_voting_configs_project_id ON public.project_voting_configs(project_id);