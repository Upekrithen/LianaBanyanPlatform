-- Create enum for user test roles
CREATE TYPE public.test_user_role AS ENUM (
  'new_user',
  'authenticated_user',
  'member',
  'project_owner',
  'project_manager',
  'hr',
  'steward',
  'applicant',
  'admin'
);

-- Create enum for test execution status
CREATE TYPE public.test_execution_status AS ENUM (
  'not_started',
  'in_progress',
  'passed',
  'failed',
  'blocked'
);

-- Table to store test flow definitions
CREATE TABLE public.test_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_name TEXT NOT NULL,
  description TEXT,
  user_role test_user_role NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Table to store steps within each test flow
CREATE TABLE public.test_flow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID REFERENCES public.test_flows(id) ON DELETE CASCADE NOT NULL,
  step_number INTEGER NOT NULL,
  step_title TEXT NOT NULL,
  step_description TEXT,
  route_path TEXT,
  expected_outcome TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(flow_id, step_number)
);

-- Table to record test executions
CREATE TABLE public.test_flow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID REFERENCES public.test_flows(id) ON DELETE CASCADE NOT NULL,
  executed_by UUID REFERENCES auth.users(id),
  execution_date TIMESTAMPTZ DEFAULT now(),
  status test_execution_status NOT NULL DEFAULT 'not_started',
  notes TEXT,
  failed_step_id UUID REFERENCES public.test_flow_steps(id),
  duration_minutes INTEGER,
  environment TEXT DEFAULT 'development'
);

-- Enable RLS
ALTER TABLE public.test_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_flow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_flow_executions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for test_flows
CREATE POLICY "Anyone can view test flows"
  ON public.test_flows FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create test flows"
  ON public.test_flows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update own test flows"
  ON public.test_flows FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all test flows"
  ON public.test_flows FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for test_flow_steps
CREATE POLICY "Anyone can view test flow steps"
  ON public.test_flow_steps FOR SELECT
  USING (true);

CREATE POLICY "Flow creators can manage steps"
  ON public.test_flow_steps FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.test_flows
      WHERE test_flows.id = test_flow_steps.flow_id
      AND test_flows.created_by = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all test flow steps"
  ON public.test_flow_steps FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for test_flow_executions
CREATE POLICY "Anyone can view test executions"
  ON public.test_flow_executions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create executions"
  ON public.test_flow_executions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = executed_by);

CREATE POLICY "Executors can update own executions"
  ON public.test_flow_executions FOR UPDATE
  TO authenticated
  USING (auth.uid() = executed_by);

-- Create indexes for performance
CREATE INDEX idx_test_flow_steps_flow_id ON public.test_flow_steps(flow_id);
CREATE INDEX idx_test_flow_executions_flow_id ON public.test_flow_executions(flow_id);
CREATE INDEX idx_test_flows_user_role ON public.test_flows(user_role);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_test_flow_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER test_flows_updated_at
  BEFORE UPDATE ON public.test_flows
  FOR EACH ROW
  EXECUTE FUNCTION update_test_flow_updated_at();
