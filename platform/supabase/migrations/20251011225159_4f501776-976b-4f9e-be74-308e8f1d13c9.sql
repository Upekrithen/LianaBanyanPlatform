-- Add preview image support to project_themes
ALTER TABLE project_themes
ADD COLUMN IF NOT EXISTS preview_image_url TEXT;

-- Create a table for storing theme preview images in storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('theme-previews', 'theme-previews', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for theme preview images
CREATE POLICY "Project owners can upload theme previews"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'theme-previews' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM projects WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Everyone can view theme previews"
ON storage.objects FOR SELECT
USING (bucket_id = 'theme-previews');

CREATE POLICY "Project owners can delete theme previews"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'theme-previews' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM projects WHERE owner_id = auth.uid()
  )
);
