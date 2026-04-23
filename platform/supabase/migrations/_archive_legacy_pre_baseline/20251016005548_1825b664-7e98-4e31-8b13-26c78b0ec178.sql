-- Company independence tracking for projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS company_status text DEFAULT 'lb_project';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS became_independent_at timestamptz;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS independence_equity_bonus numeric DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS can_use_external_services boolean DEFAULT false;

-- Company milestone tracking
CREATE TABLE IF NOT EXISTS public.company_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  milestone_type text NOT NULL,
  milestone_description text,
  achieved_at timestamptz DEFAULT now(),
  verified_by uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- RLS for company milestones
ALTER TABLE public.company_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view company milestones"
ON public.company_milestones
FOR SELECT
USING (true);

CREATE POLICY "Project owners can manage milestones"
ON public.company_milestones
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = company_milestones.project_id
    AND projects.owner_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all milestones"
ON public.company_milestones
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));
