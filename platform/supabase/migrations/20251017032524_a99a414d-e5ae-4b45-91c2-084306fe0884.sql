-- Create project landing pages table for inspirational recruitment content
CREATE TABLE IF NOT EXISTS public.project_landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  segment_name TEXT NOT NULL,
  segment_slug TEXT NOT NULL,
  segment_description TEXT,
  hero_title TEXT NOT NULL,
  hero_subtitle TEXT,
  hero_image_url TEXT,
  mission_statement TEXT,
  value_propositions JSONB DEFAULT '[]'::jsonb,
  key_features JSONB DEFAULT '[]'::jsonb,
  testimonials JSONB DEFAULT '[]'::jsonb,
  call_to_action_text TEXT DEFAULT 'Join the Journey',
  call_to_action_type TEXT DEFAULT 'vote',
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, segment_slug)
);

-- Enable RLS
ALTER TABLE public.project_landing_pages ENABLE ROW LEVEL SECURITY;

-- Anyone can view active landing pages
CREATE POLICY "Anyone can view active landing pages"
  ON public.project_landing_pages
  FOR SELECT
  USING (is_active = true);

-- Project owners can manage landing pages
CREATE POLICY "Project owners can manage landing pages"
  ON public.project_landing_pages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_landing_pages.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Admins can manage all landing pages
CREATE POLICY "Admins can manage all landing pages"
  ON public.project_landing_pages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_project_landing_pages_updated_at
  BEFORE UPDATE ON public.project_landing_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_project_landing_pages_project ON public.project_landing_pages(project_id);
CREATE INDEX idx_project_landing_pages_slug ON public.project_landing_pages(project_id, segment_slug);