-- A-Aron Device: Name Pronunciation & Accessibility
-- Part of Harper Guild's cross-board accessibility initiative.
-- Tracks phonetic spellings, common mistakes, audio clips, and Harper verification.

CREATE TABLE IF NOT EXISTS aaron_pronunciations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  phonetic_spelling TEXT NOT NULL,
  common_mistakes TEXT[],           -- Array of mispronunciations to avoid
  language_origin TEXT,             -- e.g., "Irish Gaelic", "Arabic"
  audio_url TEXT,                   -- Supabase Storage path for audio clip
  is_verified BOOLEAN DEFAULT false,-- Harper Guild verified?
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  notes TEXT,                       -- Harper Guild verifier notes
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- One pronunciation per user (they can update but not duplicate)
CREATE UNIQUE INDEX IF NOT EXISTS idx_aaron_pronunciations_user
  ON aaron_pronunciations(user_id);

-- Index for browsing verified pronunciations
CREATE INDEX IF NOT EXISTS idx_aaron_pronunciations_verified
  ON aaron_pronunciations(is_verified, display_name);

-- RLS policies
ALTER TABLE aaron_pronunciations ENABLE ROW LEVEL SECURITY;

-- Anyone can read verified pronunciations
CREATE POLICY "aaron_read_verified"
  ON aaron_pronunciations FOR SELECT
  USING (is_verified = true);

-- Users can read their own (even if unverified)
CREATE POLICY "aaron_read_own"
  ON aaron_pronunciations FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert/update their own
CREATE POLICY "aaron_insert_own"
  ON aaron_pronunciations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "aaron_update_own"
  ON aaron_pronunciations FOR UPDATE
  USING (auth.uid() = user_id);

-- Founder admin can read/update all (for Harper Guild verification)
CREATE POLICY "aaron_admin_all"
  ON aaron_pronunciations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN ('upekrithen@gmail.com', 'support@lianabanyan.com')
    )
  );
