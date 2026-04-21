-- Create project test suites table
CREATE TABLE IF NOT EXISTS public.project_test_suites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  test_config JSONB NOT NULL DEFAULT '{"tests": [], "enabled": true}'::jsonb,
  last_run TIMESTAMP WITH TIME ZONE,
  last_status TEXT CHECK (last_status IN ('success', 'failure', 'partial')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create project test results table
CREATE TABLE IF NOT EXISTS public.project_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  suite_id UUID REFERENCES public.project_test_suites(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'skipped')),
  message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_test_suites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_test_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_test_suites
CREATE POLICY "Project owners can view test suites"
  ON public.project_test_suites
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_test_suites.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Authorized members can view test suites"
  ON public.project_test_suites
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_member_contracts
      WHERE project_member_contracts.project_id = project_test_suites.project_id
      AND project_member_contracts.member_id = auth.uid()
      AND project_member_contracts.status = 'active'
      AND (LOWER(project_member_contracts.contract_title) = 'steward'
           OR LOWER(project_member_contracts.contract_title) = 'hr')
    )
  );

CREATE POLICY "Project owners can manage test suites"
  ON public.project_test_suites
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_test_suites.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Authorized members can manage test suites"
  ON public.project_test_suites
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.project_member_contracts
      WHERE project_member_contracts.project_id = project_test_suites.project_id
      AND project_member_contracts.member_id = auth.uid()
      AND project_member_contracts.status = 'active'
      AND (LOWER(project_member_contracts.contract_title) = 'steward'
           OR LOWER(project_member_contracts.contract_title) = 'hr')
    )
  );

-- RLS Policies for project_test_results
CREATE POLICY "Project owners can view test results"
  ON public.project_test_results
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_test_results.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Authorized members can view test results"
  ON public.project_test_results
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_member_contracts
      WHERE project_member_contracts.project_id = project_test_results.project_id
      AND project_member_contracts.member_id = auth.uid()
      AND project_member_contracts.status = 'active'
      AND (LOWER(project_member_contracts.contract_title) = 'steward'
           OR LOWER(project_member_contracts.contract_title) = 'hr')
    )
  );

CREATE POLICY "System can insert test results"
  ON public.project_test_results
  FOR INSERT
  WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_test_suites_project ON public.project_test_suites(project_id);
CREATE INDEX idx_test_results_project ON public.project_test_results(project_id);
CREATE INDEX idx_test_results_suite ON public.project_test_results(suite_id);
CREATE INDEX idx_test_results_timestamp ON public.project_test_results(timestamp DESC);
