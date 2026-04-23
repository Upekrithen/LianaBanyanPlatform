-- ════════════════════════════════════════════════════════════════════
-- A-ARON DEVICE — Audio Storage Bucket
-- ════════════════════════════════════════════════════════════════════
-- Creates a storage bucket for name pronunciation audio clips.
-- Files stored as: {user_id}/pronunciation.webm
-- Max 5MB per file, audio/* MIME types only.
-- ════════════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'aaron-audio',
  'aaron-audio',
  true,                      -- public reads (pronunciations are public once verified)
  5242880,                   -- 5 MB limit
  ARRAY['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav']
)
ON CONFLICT (id) DO NOTHING;

-- RLS on storage.objects for this bucket
-- Users can upload/update their own audio
CREATE POLICY "aaron_audio_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'aaron-audio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "aaron_audio_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'aaron-audio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Anyone can read (public pronunciations)
CREATE POLICY "aaron_audio_read_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'aaron-audio');

-- Users can delete their own audio
CREATE POLICY "aaron_audio_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'aaron-audio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
