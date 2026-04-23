-- Create test scenarios table for what-if analysis
CREATE TABLE public.test_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  scenario_name TEXT NOT NULL,
  scenario_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  xml_output TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.test_scenarios ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own scenarios"
  ON public.test_scenarios
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own scenarios"
  ON public.test_scenarios
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scenarios"
  ON public.test_scenarios
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scenarios"
  ON public.test_scenarios
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_test_scenarios_user_id ON public.test_scenarios(user_id);
CREATE INDEX idx_test_scenarios_project_id ON public.test_scenarios(project_id);
