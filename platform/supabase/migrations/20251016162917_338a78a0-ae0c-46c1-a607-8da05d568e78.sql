-- Workshop and Asset Tracking System

-- Asset submissions table
CREATE TABLE public.asset_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  asset_type TEXT NOT NULL, -- 'video_script', 'business_plan', 'design', 'code', etc.
  asset_title TEXT NOT NULL,
  asset_content JSONB NOT NULL, -- Flexible storage for different asset types
  workstation_id UUID, -- References workstation this asset belongs to
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'submitted', 'under_review', 'approved', 'rejected', 'adopted'
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  contribution_percentage NUMERIC(5,2) DEFAULT 0, -- Auto-calculated or manual
  is_contribution_locked BOOLEAN DEFAULT false, -- Lock after adoption
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- IP contributions tracking
CREATE TABLE public.ip_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES public.asset_submissions(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contribution_type TEXT NOT NULL, -- 'creator', 'editor', 'reviewer', 'adopter'
  contribution_percentage NUMERIC(5,2) NOT NULL,
  royalty_eligible BOOLEAN DEFAULT true,
  notes TEXT,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  recorded_by UUID REFERENCES auth.users(id)
);

-- Workstations (task groupings)
CREATE TABLE public.workstations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  workstation_name TEXT NOT NULL,
  workstation_type TEXT NOT NULL, -- 'campaign_production', 'development', 'design', etc.
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Task assignments
CREATE TABLE public.task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workstation_id UUID REFERENCES public.workstations(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES auth.users(id) NOT NULL,
  task_title TEXT NOT NULL,
  task_description TEXT,
  task_type TEXT, -- 'video_script', 'business_plan', etc.
  due_date TIMESTAMPTZ,
  status TEXT DEFAULT 'assigned', -- 'assigned', 'in_progress', 'completed', 'cancelled'
  email_sent BOOLEAN DEFAULT false,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  asset_submission_id UUID REFERENCES public.asset_submissions(id)
);

-- Project features (to enable/disable services like Business Plan Generator)
CREATE TABLE public.project_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  feature_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  enabled_at TIMESTAMPTZ,
  enabled_by UUID REFERENCES auth.users(id),
  UNIQUE(project_id, feature_name)
);

-- Enable RLS
ALTER TABLE public.asset_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workstations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_features ENABLE ROW LEVEL SECURITY;

-- RLS Policies for asset_submissions
CREATE POLICY "Members can view project assets"
  ON public.asset_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_member_contracts
      WHERE project_id = asset_submissions.project_id
      AND member_id = auth.uid()
      AND status = 'active'
    )
    OR member_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = asset_submissions.project_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Members can create own assets"
  ON public.asset_submissions FOR INSERT
  WITH CHECK (member_id = auth.uid());

CREATE POLICY "Members can update own draft assets"
  ON public.asset_submissions FOR UPDATE
  USING (member_id = auth.uid() AND status = 'draft');

CREATE POLICY "Project owners can review assets"
  ON public.asset_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = asset_submissions.project_id
      AND owner_id = auth.uid()
    )
  );

-- RLS Policies for ip_contributions
CREATE POLICY "Anyone can view IP contributions"
  ON public.ip_contributions FOR SELECT
  USING (true);

CREATE POLICY "Project owners can manage IP contributions"
  ON public.ip_contributions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = ip_contributions.project_id
      AND owner_id = auth.uid()
    )
  );

-- RLS Policies for workstations
CREATE POLICY "Members can view project workstations"
  ON public.workstations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_member_contracts
      WHERE project_id = workstations.project_id
      AND member_id = auth.uid()
      AND status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = workstations.project_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can manage workstations"
  ON public.workstations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = workstations.project_id
      AND owner_id = auth.uid()
    )
  );

-- RLS Policies for task_assignments
CREATE POLICY "Members can view own assignments"
  ON public.task_assignments FOR SELECT
  USING (assigned_to = auth.uid() OR assigned_by = auth.uid());

CREATE POLICY "Project owners can view all assignments"
  ON public.task_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = task_assignments.project_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can create assignments"
  ON public.task_assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = task_assignments.project_id
      AND owner_id = auth.uid()
    )
  );

-- RLS Policies for project_features
CREATE POLICY "Anyone can view project features"
  ON public.project_features FOR SELECT
  USING (true);

CREATE POLICY "Project owners can manage features"
  ON public.project_features FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_features.project_id
      AND owner_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_asset_submissions_project ON public.asset_submissions(project_id);
CREATE INDEX idx_asset_submissions_member ON public.asset_submissions(member_id);
CREATE INDEX idx_asset_submissions_status ON public.asset_submissions(status);
CREATE INDEX idx_ip_contributions_asset ON public.ip_contributions(asset_id);
CREATE INDEX idx_ip_contributions_project ON public.ip_contributions(project_id);
CREATE INDEX idx_workstations_project ON public.workstations(project_id);
CREATE INDEX idx_task_assignments_assigned_to ON public.task_assignments(assigned_to);
CREATE INDEX idx_task_assignments_project ON public.task_assignments(project_id);

-- Trigger to update updated_at
CREATE TRIGGER update_asset_submissions_updated_at
  BEFORE UPDATE ON public.asset_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workstations_updated_at
  BEFORE UPDATE ON public.workstations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
