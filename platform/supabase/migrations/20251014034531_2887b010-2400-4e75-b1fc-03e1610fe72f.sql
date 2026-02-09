-- Add stewards to theme management RLS policies
DROP POLICY IF EXISTS "Project owners can create themes" ON public.project_themes;
DROP POLICY IF EXISTS "Project owners can update themes" ON public.project_themes;
DROP POLICY IF EXISTS "Project owners can delete themes" ON public.project_themes;

-- Project owners and stewards can create themes
CREATE POLICY "Project owners and stewards can create themes"
ON public.project_themes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_themes.project_id
    AND projects.owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.project_member_contracts
    WHERE project_member_contracts.project_id = project_themes.project_id
    AND project_member_contracts.member_id = auth.uid()
    AND project_member_contracts.status = 'active'
    AND LOWER(project_member_contracts.contract_title) = 'steward'
  )
);

-- Project owners and stewards can update themes
CREATE POLICY "Project owners and stewards can update themes"
ON public.project_themes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_themes.project_id
    AND projects.owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.project_member_contracts
    WHERE project_member_contracts.project_id = project_themes.project_id
    AND project_member_contracts.member_id = auth.uid()
    AND project_member_contracts.status = 'active'
    AND LOWER(project_member_contracts.contract_title) = 'steward'
  )
);

-- Project owners and stewards can delete themes
CREATE POLICY "Project owners and stewards can delete themes"
ON public.project_themes
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_themes.project_id
    AND projects.owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.project_member_contracts
    WHERE project_member_contracts.project_id = project_themes.project_id
    AND project_member_contracts.member_id = auth.uid()
    AND project_member_contracts.status = 'active'
    AND LOWER(project_member_contracts.contract_title) = 'steward'
  )
);

-- Add portal_type column to themes for portal-specific theming
ALTER TABLE public.project_themes 
ADD COLUMN IF NOT EXISTS portal_type TEXT DEFAULT 'marketplace';

-- Add index for portal filtering
CREATE INDEX IF NOT EXISTS idx_project_themes_portal ON public.project_themes(portal_type);

-- Create user theme preferences table
CREATE TABLE IF NOT EXISTS public.user_theme_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  portal_type TEXT NOT NULL DEFAULT 'marketplace',
  theme_id UUID NOT NULL REFERENCES public.project_themes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, project_id, portal_type)
);

-- Enable RLS on user theme preferences
ALTER TABLE public.user_theme_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own theme preferences
CREATE POLICY "Users can view own theme preferences"
ON public.user_theme_preferences
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own theme preferences
CREATE POLICY "Users can insert own theme preferences"
ON public.user_theme_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own theme preferences
CREATE POLICY "Users can update own theme preferences"
ON public.user_theme_preferences
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own theme preferences
CREATE POLICY "Users can delete own theme preferences"
ON public.user_theme_preferences
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_theme_preferences_updated_at
BEFORE UPDATE ON public.user_theme_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();