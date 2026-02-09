-- Create table for project visual themes (colors and backgrounds)
CREATE TABLE IF NOT EXISTS public.project_visual_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  primary_color TEXT NOT NULL DEFAULT '#10b981',
  secondary_color TEXT NOT NULL DEFAULT '#059669',
  accent_color TEXT NOT NULL DEFAULT '#34d399',
  background_pattern TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id)
);

-- Create table for custom lifecycle stage icons
CREATE TABLE IF NOT EXISTS public.project_lifecycle_theme_icons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN ('germination', 'seed', 'sprout', 'seedling', 'plant_no_flowers', 'plant_with_flowers', 'plant_with_fruit')),
  icon_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, stage)
);

-- Enable RLS
ALTER TABLE public.project_visual_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_lifecycle_theme_icons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_visual_themes
CREATE POLICY "Anyone can view visual themes"
  ON public.project_visual_themes FOR SELECT
  USING (true);

CREATE POLICY "Project owners can manage visual themes"
  ON public.project_visual_themes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_visual_themes.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- RLS Policies for project_lifecycle_theme_icons
CREATE POLICY "Anyone can view lifecycle icons"
  ON public.project_lifecycle_theme_icons FOR SELECT
  USING (true);

CREATE POLICY "Project owners can manage lifecycle icons"
  ON public.project_lifecycle_theme_icons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_lifecycle_theme_icons.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Add updated_at trigger
CREATE TRIGGER update_project_visual_themes_updated_at
  BEFORE UPDATE ON public.project_visual_themes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_lifecycle_theme_icons_updated_at
  BEFORE UPDATE ON public.project_lifecycle_theme_icons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();