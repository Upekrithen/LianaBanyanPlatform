-- Add project_type to projects table
ALTER TABLE public.projects 
  ADD COLUMN project_type TEXT DEFAULT 'default';

-- Update existing projects to categorize them
UPDATE public.projects
SET project_type = 'default'
WHERE project_type IS NULL;