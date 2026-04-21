-- Create helper function for updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for project themes/stylesheets
CREATE TABLE public.project_themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  theme_name TEXT NOT NULL,
  css_content TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_themes ENABLE ROW LEVEL SECURITY;

-- Anyone can view themes
CREATE POLICY "Anyone can view project themes"
ON public.project_themes
FOR SELECT
USING (true);

-- Project owners can create themes
CREATE POLICY "Project owners can create themes"
ON public.project_themes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_themes.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- Project owners can update their project themes
CREATE POLICY "Project owners can update themes"
ON public.project_themes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_themes.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- Project owners can delete their project themes
CREATE POLICY "Project owners can delete themes"
ON public.project_themes
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_themes.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- Create index for faster lookups
CREATE INDEX idx_project_themes_project_id ON public.project_themes(project_id);

-- Create trigger for updated_at
CREATE TRIGGER update_project_themes_updated_at
BEFORE UPDATE ON public.project_themes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
