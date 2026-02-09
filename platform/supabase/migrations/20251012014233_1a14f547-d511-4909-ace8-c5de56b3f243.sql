-- Create enum for position categories
CREATE TYPE position_category AS ENUM (
  'create_idea',
  'define_describe_document',
  'research_development',
  'prototype',
  'legal_services',
  'logistics_blockchain',
  'steward_owner',
  'marketing_services',
  'accounting_services',
  'hr_staffing',
  'materials_sourcing',
  'manufacture_assembly',
  'kickstarter_campaign',
  'it_services',
  'delivery'
);

-- Create table for contract position templates
CREATE TABLE public.contract_position_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category position_category NOT NULL,
  position_title TEXT NOT NULL,
  position_description TEXT,
  compensation_type TEXT NOT NULL DEFAULT 'equity', -- 'equity', 'cash', 'mixed'
  equity_percentage NUMERIC,
  cash_amount NUMERIC,
  credits_reserved NUMERIC NOT NULL DEFAULT 0,
  contract_xml_path TEXT, -- Path to XML contract in lockbox
  required_stage lifecycle_stage,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create table for position applications
CREATE TABLE public.position_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID NOT NULL REFERENCES public.contract_position_templates(id) ON DELETE CASCADE,
  applicant_id UUID REFERENCES auth.users(id),
  applicant_email TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  cover_letter TEXT,
  resume_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'withdrawn'
  reserved_credits NUMERIC,
  application_data JSONB DEFAULT '{}',
  applied_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Create table for completed contract assignments
CREATE TABLE public.contract_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID REFERENCES public.contract_position_templates(id),
  member_id UUID NOT NULL REFERENCES auth.users(id),
  project_id UUID NOT NULL REFERENCES public.projects(id),
  contract_xml_hash TEXT, -- Blockchain ledger reference
  completion_date TIMESTAMPTZ DEFAULT now(),
  credits_awarded NUMERIC,
  equity_awarded NUMERIC,
  blockchain_recorded BOOLEAN DEFAULT false,
  medallion_qr_code TEXT
);

-- Enable RLS
ALTER TABLE public.contract_position_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.position_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contract_position_templates
CREATE POLICY "Anyone can view active positions"
  ON public.contract_position_templates
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Project owners can manage positions"
  ON public.contract_position_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = contract_position_templates.project_id
        AND projects.owner_id = auth.uid()
    )
  );

-- RLS Policies for position_applications
CREATE POLICY "Applicants can view own applications"
  ON public.position_applications
  FOR SELECT
  USING (applicant_id = auth.uid() OR applicant_email = (SELECT email FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Anyone can create applications"
  ON public.position_applications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Applicants can update own pending applications"
  ON public.position_applications
  FOR UPDATE
  USING (applicant_id = auth.uid() AND status = 'pending');

CREATE POLICY "Project owners can view and update applications for their projects"
  ON public.position_applications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.contract_position_templates cpt
      JOIN public.projects p ON p.id = cpt.project_id
      WHERE cpt.id = position_applications.position_id
        AND p.owner_id = auth.uid()
    )
  );

-- RLS Policies for contract_completions
CREATE POLICY "Members can view own completions"
  ON public.contract_completions
  FOR SELECT
  USING (member_id = auth.uid());

CREATE POLICY "Anyone can view project completions"
  ON public.contract_completions
  FOR SELECT
  USING (true);

CREATE POLICY "Project owners can manage completions"
  ON public.contract_completions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = contract_completions.project_id
        AND projects.owner_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_position_templates_project ON public.contract_position_templates(project_id);
CREATE INDEX idx_position_templates_category ON public.contract_position_templates(category);
CREATE INDEX idx_applications_position ON public.position_applications(position_id);
CREATE INDEX idx_applications_applicant ON public.position_applications(applicant_id);
CREATE INDEX idx_completions_project ON public.contract_completions(project_id);
CREATE INDEX idx_completions_member ON public.contract_completions(member_id);

-- Create trigger for updated_at
CREATE TRIGGER update_position_templates_updated_at
  BEFORE UPDATE ON public.contract_position_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();