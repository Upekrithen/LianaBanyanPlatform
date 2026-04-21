-- Create business plan tasks table for implementation tracking
CREATE TABLE IF NOT EXISTS public.business_plan_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  task_description TEXT,
  category TEXT NOT NULL, -- 'marketing', 'development', 'operations', 'legal', 'contest'
  status TEXT NOT NULL DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed', 'blocked', 'moot'
  priority INTEGER NOT NULL DEFAULT 3, -- 1 (highest) to 5 (lowest)
  prerequisite_task_ids UUID[] DEFAULT ARRAY[]::UUID[],
  assigned_to UUID REFERENCES auth.users(id),
  scheduled_start_date TIMESTAMP WITH TIME ZONE,
  scheduled_completion_date TIMESTAMP WITH TIME ZONE,
  actual_start_date TIMESTAMP WITH TIME ZONE,
  actual_completion_date TIMESTAMP WITH TIME ZONE,
  made_moot_reason TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_plan_tasks ENABLE ROW LEVEL SECURITY;

-- Project owners can manage all tasks
CREATE POLICY "Project owners can manage business plan tasks"
ON public.business_plan_tasks
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = business_plan_tasks.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- Project team members can view and update assigned tasks
CREATE POLICY "Team members can view project tasks"
ON public.business_plan_tasks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_member_contracts
    WHERE project_member_contracts.project_id = business_plan_tasks.project_id
    AND project_member_contracts.member_id = auth.uid()
    AND project_member_contracts.status = 'active'
  )
);

CREATE POLICY "Team members can update assigned tasks"
ON public.business_plan_tasks
FOR UPDATE
USING (assigned_to = auth.uid());

-- Anyone can view completed tasks (for transparency)
CREATE POLICY "Anyone can view completed tasks"
ON public.business_plan_tasks
FOR SELECT
USING (status = 'completed');

-- Add updated_at trigger
CREATE TRIGGER update_business_plan_tasks_updated_at
BEFORE UPDATE ON public.business_plan_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create influencer contest config table
CREATE TABLE IF NOT EXISTS public.influencer_contest_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE UNIQUE,
  contest_name TEXT NOT NULL DEFAULT 'Beta Launch Documentation Contest',
  contest_description TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  prize_structure JSONB NOT NULL DEFAULT '{
    "first_place": {"credits": 500, "description": "Best overall documentation"},
    "second_place": {"credits": 300, "description": "Runner-up"},
    "third_place": {"credits": 200, "description": "Third place"},
    "category_winners": {"credits": 100, "description": "Per category"}
  }'::jsonb,
  submission_categories JSONB NOT NULL DEFAULT '["Tutorial", "Review", "Use Case", "Behind the Scenes", "User Story"]'::jsonb,
  judging_criteria JSONB NOT NULL DEFAULT '{
    "clarity": 30,
    "creativity": 25,
    "engagement": 25,
    "authenticity": 20
  }'::jsonb,
  eligibility_rules TEXT,
  submission_guidelines TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.influencer_contest_config ENABLE ROW LEVEL SECURITY;

-- Project owners can manage contest config
CREATE POLICY "Project owners can manage contest config"
ON public.influencer_contest_config
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = influencer_contest_config.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- Anyone can view active contests
CREATE POLICY "Anyone can view active contests"
ON public.influencer_contest_config
FOR SELECT
USING (is_active = true);

-- Add updated_at trigger
CREATE TRIGGER update_influencer_contest_config_updated_at
BEFORE UPDATE ON public.influencer_contest_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create contest submissions table
CREATE TABLE IF NOT EXISTS public.contest_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_id UUID NOT NULL REFERENCES public.influencer_contest_config(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  submission_title TEXT NOT NULL,
  submission_category TEXT NOT NULL,
  content_url TEXT NOT NULL,
  description TEXT,
  engagement_metrics JSONB DEFAULT '{}'::jsonb,
  judge_scores JSONB DEFAULT '{}'::jsonb,
  final_score NUMERIC,
  placement TEXT, -- 'first', 'second', 'third', 'category_winner', 'participant'
  prize_awarded NUMERIC DEFAULT 0,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contest_submissions ENABLE ROW LEVEL SECURITY;

-- Users can create and view own submissions
CREATE POLICY "Users can create contest submissions"
ON public.contest_submissions
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own submissions"
ON public.contest_submissions
FOR SELECT
USING (user_id = auth.uid());

-- Project owners can view and judge all submissions
CREATE POLICY "Project owners can manage submissions"
ON public.contest_submissions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.influencer_contest_config icc
    JOIN public.projects p ON p.id = icc.project_id
    WHERE icc.id = contest_submissions.contest_id
    AND p.owner_id = auth.uid()
  )
);

-- Anyone can view winning submissions
CREATE POLICY "Anyone can view winning submissions"
ON public.contest_submissions
FOR SELECT
USING (placement IN ('first', 'second', 'third', 'category_winner'));

-- Add updated_at trigger
CREATE TRIGGER update_contest_submissions_updated_at
BEFORE UPDATE ON public.contest_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
