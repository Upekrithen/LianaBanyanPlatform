-- bp071: DD-11 stl_files table + storage wiring
-- stl_files table already exists in baseline (uploader_id, file_url, filename, display_name, etc.)
-- This migration adds the DD-11 columns needed for initiative-scoped uploads and storage wiring.

-- Add initiative_slug to scope STL files to a specific initiative/project
ALTER TABLE public.stl_files
  ADD COLUMN IF NOT EXISTS initiative_slug TEXT,
  ADD COLUMN IF NOT EXISTS storage_bucket TEXT NOT NULL DEFAULT 'stl-files',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Index for initiative-scoped queries
CREATE INDEX IF NOT EXISTS idx_stl_files_initiative_slug ON public.stl_files (initiative_slug)
  WHERE initiative_slug IS NOT NULL;

-- Admin all-access policy (supplements existing public-read and uploader-manage policies)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'stl_files' AND policyname = 'Admins all stl_files'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Admins all stl_files" ON public.stl_files
        FOR ALL USING (auth.jwt() ->> 'role' = 'admin')
    $policy$;
  END IF;
END;
$$;

-- Members insert policy (supplements existing uploader policy)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'stl_files' AND policyname = 'Members insert stl_files'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Members insert stl_files" ON public.stl_files
        FOR INSERT WITH CHECK (auth.uid() IS NOT NULL)
    $policy$;
  END IF;
END;
$$;

-- ⚠️ Founder action required:
--   1. Create the 'stl-files' storage bucket in Supabase Dashboard > Storage
--   2. Set bucket public: true (for is_public = true files)
--   3. Upload STL blobs; the STLFileUpload component wires the UI for this
