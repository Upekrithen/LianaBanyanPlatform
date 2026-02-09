-- Create QR landing pages table for market segmentation
CREATE TABLE IF NOT EXISTS public.qr_landing_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  variant TEXT NOT NULL DEFAULT 'default',
  headline TEXT NOT NULL,
  subheadline TEXT,
  description TEXT,
  cta_text TEXT NOT NULL DEFAULT 'Learn More',
  cta_url TEXT,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, variant)
);

-- Enable RLS
ALTER TABLE public.qr_landing_pages ENABLE ROW LEVEL SECURITY;

-- Allow project owners to manage their QR landing pages
CREATE POLICY "Project owners can manage QR landing pages"
ON public.qr_landing_pages
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = qr_landing_pages.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- Allow everyone to view QR landing pages
CREATE POLICY "Everyone can view QR landing pages"
ON public.qr_landing_pages
FOR SELECT
USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_qr_landing_pages_updated_at
BEFORE UPDATE ON public.qr_landing_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();