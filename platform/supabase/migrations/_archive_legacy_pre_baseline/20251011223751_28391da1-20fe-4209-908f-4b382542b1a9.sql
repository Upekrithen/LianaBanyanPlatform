-- Create enum for lifecycle stages
CREATE TYPE lifecycle_stage AS ENUM (
  'germination',
  'seed',
  'sprout',
  'seedling',
  'plant_no_flowers',
  'plant_with_flowers',
  'plant_with_fruit'
);

-- Create enum for contract/assignment status
CREATE TYPE contract_status AS ENUM (
  'pending',
  'active',
  'completed',
  'cancelled'
);

-- Create enum for task status
CREATE TYPE task_status AS ENUM (
  'pending',
  'in_progress',
  'completed'
);

-- Track project lifecycle stages
CREATE TABLE public.project_lifecycle_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  current_stage lifecycle_stage NOT NULL DEFAULT 'germination',
  stage_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id)
);

-- Define tasks for each lifecycle stage
CREATE TABLE public.lifecycle_stage_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage lifecycle_stage NOT NULL,
  task_title TEXT NOT NULL,
  task_description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Track member contracts for projects
CREATE TABLE public.project_member_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contract_title TEXT NOT NULL,
  status contract_status NOT NULL DEFAULT 'pending',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Track task assignments to members
CREATE TABLE public.project_stage_task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  stage lifecycle_stage NOT NULL,
  task_id UUID NOT NULL REFERENCES public.lifecycle_stage_tasks(id) ON DELETE CASCADE,
  assigned_member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_title TEXT NOT NULL,
  status task_status NOT NULL DEFAULT 'pending',
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_lifecycle_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifecycle_stage_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_member_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_stage_task_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_lifecycle_stages
CREATE POLICY "Anyone can view project lifecycle stages"
  ON public.project_lifecycle_stages FOR SELECT
  USING (true);

CREATE POLICY "Project owners can manage lifecycle stages"
  ON public.project_lifecycle_stages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_lifecycle_stages.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Stewards can update lifecycle stages"
  ON public.project_lifecycle_stages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.project_member_contracts
      WHERE project_member_contracts.project_id = project_lifecycle_stages.project_id
      AND project_member_contracts.member_id = auth.uid()
      AND project_member_contracts.status = 'active'
      AND LOWER(project_member_contracts.contract_title) = 'steward'
    )
  );

-- RLS Policies for lifecycle_stage_tasks
CREATE POLICY "Anyone can view lifecycle stage tasks"
  ON public.lifecycle_stage_tasks FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage lifecycle stage tasks"
  ON public.lifecycle_stage_tasks FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for project_member_contracts
CREATE POLICY "Anyone can view active contracts"
  ON public.project_member_contracts FOR SELECT
  USING (true);

CREATE POLICY "Project owners can manage contracts"
  ON public.project_member_contracts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_member_contracts.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Stewards can insert contracts"
  ON public.project_member_contracts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_member_contracts pmc
      WHERE pmc.project_id = project_member_contracts.project_id
      AND pmc.member_id = auth.uid()
      AND pmc.status = 'active'
      AND LOWER(pmc.contract_title) = 'steward'
    )
  );

CREATE POLICY "Stewards can update contracts"
  ON public.project_member_contracts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.project_member_contracts pmc
      WHERE pmc.project_id = project_member_contracts.project_id
      AND pmc.member_id = auth.uid()
      AND pmc.status = 'active'
      AND LOWER(pmc.contract_title) = 'steward'
    )
  );

CREATE POLICY "Members can view own contracts"
  ON public.project_member_contracts FOR SELECT
  USING (member_id = auth.uid());

CREATE POLICY "Members can accept own contracts"
  ON public.project_member_contracts FOR UPDATE
  USING (member_id = auth.uid());

-- RLS Policies for project_stage_task_assignments
CREATE POLICY "Anyone can view task assignments"
  ON public.project_stage_task_assignments FOR SELECT
  USING (true);

CREATE POLICY "Project owners can manage task assignments"
  ON public.project_stage_task_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_stage_task_assignments.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Stewards can insert task assignments"
  ON public.project_stage_task_assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_member_contracts
      WHERE project_member_contracts.project_id = project_stage_task_assignments.project_id
      AND project_member_contracts.member_id = auth.uid()
      AND project_member_contracts.status = 'active'
      AND LOWER(project_member_contracts.contract_title) = 'steward'
    )
  );

CREATE POLICY "Stewards can update task assignments"
  ON public.project_stage_task_assignments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.project_member_contracts
      WHERE project_member_contracts.project_id = project_stage_task_assignments.project_id
      AND project_member_contracts.member_id = auth.uid()
      AND project_member_contracts.status = 'active'
      AND LOWER(project_member_contracts.contract_title) = 'steward'
    )
  );

CREATE POLICY "Stewards can delete task assignments"
  ON public.project_stage_task_assignments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.project_member_contracts
      WHERE project_member_contracts.project_id = project_stage_task_assignments.project_id
      AND project_member_contracts.member_id = auth.uid()
      AND project_member_contracts.status = 'active'
      AND LOWER(project_member_contracts.contract_title) = 'steward'
    )
  );

CREATE POLICY "Assigned members can update their task status"
  ON public.project_stage_task_assignments FOR UPDATE
  USING (assigned_member_id = auth.uid());

-- Triggers for updated_at
CREATE TRIGGER update_project_lifecycle_stages_updated_at
  BEFORE UPDATE ON public.project_lifecycle_stages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_member_contracts_updated_at
  BEFORE UPDATE ON public.project_member_contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_stage_task_assignments_updated_at
  BEFORE UPDATE ON public.project_stage_task_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default lifecycle stage tasks
INSERT INTO public.lifecycle_stage_tasks (stage, task_title, task_description, sort_order) VALUES
  -- Germination stage (Idea phase)
  ('germination', 'Document Initial Idea', 'Create initial project concept documentation', 1),
  ('germination', 'Define Target Market', 'Research and define target audience', 2),
  ('germination', 'Initial Feasibility Study', 'Assess technical and financial feasibility', 3),

  -- Seed stage (Design phase)
  ('seed', 'Create Design Specifications', 'Develop detailed design requirements', 1),
  ('seed', 'Wireframe/Mockup Creation', 'Create visual representations of the product', 2),
  ('seed', 'Technical Architecture Planning', 'Plan technical implementation approach', 3),

  -- Sprout stage (Illustration and Description)
  ('sprout', 'Product Photography/Illustration', 'Create high-quality product visuals', 1),
  ('sprout', 'Write Marketing Copy', 'Develop compelling product descriptions', 2),
  ('sprout', 'Create Brand Guidelines', 'Establish visual and messaging standards', 3),

  -- Seedling stage (Prototype)
  ('seedling', 'Build Prototype', 'Create working prototype of the product', 1),
  ('seedling', 'User Testing', 'Conduct testing with target users', 2),
  ('seedling', 'Iterate Based on Feedback', 'Refine prototype based on test results', 3),

  -- Plant (no flowers) stage (Marketing)
  ('plant_no_flowers', 'Develop Marketing Strategy', 'Create comprehensive marketing plan', 1),
  ('plant_no_flowers', 'Build Marketing Materials', 'Create promotional content and assets', 2),
  ('plant_no_flowers', 'Launch Pre-sales Campaign', 'Begin accepting pre-orders', 3),

  -- Plant (with flowers) stage (Sales/Manufacturing)
  ('plant_with_flowers', 'Finalize Manufacturing Partner', 'Contract with production facility', 1),
  ('plant_with_flowers', 'Begin Production', 'Start manufacturing process', 2),
  ('plant_with_flowers', 'Quality Control', 'Ensure product meets standards', 3),

  -- Plant (with fruit) stage (Packaging/Delivery)
  ('plant_with_fruit', 'Package Products', 'Prepare products for shipment', 1),
  ('plant_with_fruit', 'Arrange Fulfillment', 'Set up delivery logistics', 2),
  ('plant_with_fruit', 'Ship to Customers', 'Deliver products to backers', 3),
  ('plant_with_fruit', 'Collect Feedback', 'Gather customer reviews and testimonials', 4);

-- Auto-create lifecycle stage entry when project is created
CREATE OR REPLACE FUNCTION public.auto_create_project_lifecycle()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.project_lifecycle_stages (project_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_project_created
  AFTER INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.auto_create_project_lifecycle();
