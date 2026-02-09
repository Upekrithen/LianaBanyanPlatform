-- Add detailed description field to projects
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS detailed_description text;

-- Create table for expandable project sections
CREATE TABLE IF NOT EXISTS public.project_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  video_url text,
  video_transcript text,
  sort_order integer DEFAULT 0,
  is_expanded_by_default boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Create table for section images
CREATE TABLE IF NOT EXISTS public.project_section_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id uuid NOT NULL,
  image_url text NOT NULL,
  caption text,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_section_images ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view project sections"
  ON public.project_sections
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view project section images"
  ON public.project_section_images
  FOR SELECT
  USING (true);