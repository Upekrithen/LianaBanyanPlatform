-- Create position assignments table for Primary/Secondary/Backup
CREATE TYPE assignment_type AS ENUM ('primary', 'secondary', 'backup');
CREATE TYPE assignment_status AS ENUM ('pending', 'active', 'completed', 'cancelled');

CREATE TABLE public.position_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.position_applications(id) ON DELETE CASCADE,
  position_id UUID NOT NULL REFERENCES public.contract_position_templates(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES auth.users(id),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  
  -- Assignment details
  assignment_type assignment_type NOT NULL,
  assignment_status assignment_status NOT NULL DEFAULT 'pending',
  
  -- Compensation adjustments for Secondary/Backup
  original_equity_percentage NUMERIC,
  adjusted_equity_percentage NUMERIC,
  original_cash_amount NUMERIC,
  adjusted_cash_amount NUMERIC,
  original_credits NUMERIC,
  adjusted_credits NUMERIC,
  
  -- Duty reduction
  duty_percentage NUMERIC NOT NULL DEFAULT 100, -- 100% for primary, reduced for secondary/backup
  duty_description TEXT,
  
  -- Assignment metadata
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.position_assignments ENABLE ROW LEVEL SECURITY;

-- Anyone can view assignments
CREATE POLICY "Anyone can view position assignments"
  ON public.position_assignments
  FOR SELECT
  USING (true);

-- Project owners can manage assignments
CREATE POLICY "Project owners can manage assignments"
  ON public.position_assignments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = position_assignments.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- HR can manage assignments
CREATE POLICY "HR can manage assignments"
  ON public.position_assignments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.project_member_contracts
      WHERE project_member_contracts.project_id = position_assignments.project_id
      AND project_member_contracts.member_id = auth.uid()
      AND project_member_contracts.status = 'active'
      AND LOWER(project_member_contracts.contract_title) = 'hr'
    )
  );

-- Stewards can manage assignments
CREATE POLICY "Stewards can manage assignments"
  ON public.position_assignments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.project_member_contracts
      WHERE project_member_contracts.project_id = position_assignments.project_id
      AND project_member_contracts.member_id = auth.uid()
      AND project_member_contracts.status = 'active'
      AND LOWER(project_member_contracts.contract_title) = 'steward'
    )
  );

-- Applicants can view their own assignments
CREATE POLICY "Applicants can view own assignments"
  ON public.position_assignments
  FOR SELECT
  USING (applicant_id = auth.uid());

-- Create application review table
CREATE TABLE public.application_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.position_applications(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id),
  reviewer_email TEXT NOT NULL,
  
  -- Review details
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  strengths TEXT,
  weaknesses TEXT,
  recommendation TEXT CHECK (recommendation IN ('hire_primary', 'hire_secondary', 'hire_backup', 'reject', 'pending')),
  
  -- Review metadata
  reviewed_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.application_reviews ENABLE ROW LEVEL SECURITY;

-- Project owners and assigned agents can view reviews
CREATE POLICY "Project owners can view reviews"
  ON public.application_reviews
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.position_applications pa
      JOIN public.contract_position_templates cpt ON cpt.id = pa.position_id
      JOIN public.projects p ON p.id = cpt.project_id
      WHERE pa.id = application_reviews.application_id
      AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "HR and Stewards can view reviews"
  ON public.application_reviews
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.position_applications pa
      JOIN public.contract_position_templates cpt ON cpt.id = pa.position_id
      JOIN public.project_member_contracts pmc ON pmc.project_id = cpt.project_id
      WHERE pa.id = application_reviews.application_id
      AND pmc.member_id = auth.uid()
      AND pmc.status = 'active'
      AND (LOWER(pmc.contract_title) = 'hr' OR LOWER(pmc.contract_title) = 'steward')
    )
  );

-- Reviewers can create and update their reviews
CREATE POLICY "Reviewers can create reviews"
  ON public.application_reviews
  FOR INSERT
  WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Reviewers can update own reviews"
  ON public.application_reviews
  FOR UPDATE
  USING (reviewer_id = auth.uid());

-- Add indexes
CREATE INDEX idx_position_assignments_application ON public.position_assignments(application_id);
CREATE INDEX idx_position_assignments_applicant ON public.position_assignments(applicant_id);
CREATE INDEX idx_position_assignments_project ON public.position_assignments(project_id);
CREATE INDEX idx_position_assignments_type ON public.position_assignments(assignment_type);
CREATE INDEX idx_application_reviews_application ON public.application_reviews(application_id);

-- Trigger for position assignment audit logging
CREATE OR REPLACE FUNCTION public.audit_position_assignment_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    PERFORM public.log_agent_action(
      'create',
      'position_assignments',
      NEW.id,
      jsonb_build_object('new_values', to_jsonb(NEW))
    );
  ELSIF (TG_OP = 'UPDATE') THEN
    PERFORM public.log_agent_action(
      'update',
      'position_assignments',
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

CREATE TRIGGER audit_position_assignment_changes
  AFTER INSERT OR UPDATE ON public.position_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_position_assignment_changes();