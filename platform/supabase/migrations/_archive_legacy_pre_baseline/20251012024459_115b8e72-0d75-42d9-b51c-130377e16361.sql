-- Create scheduled_resources table for the 1/3 rule equipment allocation
CREATE TABLE IF NOT EXISTS public.scheduled_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL,
  description TEXT,
  cost NUMERIC NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheduled_resources ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view scheduled resources"
  ON public.scheduled_resources
  FOR SELECT
  USING (true);

CREATE POLICY "Project owners can manage scheduled resources"
  ON public.scheduled_resources
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = scheduled_resources.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_scheduled_resources_project_id ON public.scheduled_resources(project_id);
CREATE INDEX idx_scheduled_resources_scheduled_date ON public.scheduled_resources(scheduled_date);
