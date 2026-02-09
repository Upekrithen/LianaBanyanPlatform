-- Rename contest tables to challenge tables
ALTER TABLE influencer_contest_config RENAME TO influencer_challenge_config;
ALTER TABLE contest_submissions RENAME TO challenge_submissions;

-- Update challenge config to support entrance fees and concurrent challenges
ALTER TABLE influencer_challenge_config
  ADD COLUMN entrance_fee_credits numeric DEFAULT 0 NOT NULL,
  ADD COLUMN allow_concurrent boolean DEFAULT true,
  ADD COLUMN challenge_arena text,
  ADD COLUMN hexisle_skill_category text,
  ADD COLUMN ideation_level integer DEFAULT 1;

-- Update challenge submissions to track ideation and multiple challenges
ALTER TABLE challenge_submissions
  RENAME COLUMN contest_id TO challenge_id;

ALTER TABLE challenge_submissions
  ADD COLUMN entrance_fee_paid numeric DEFAULT 0,
  ADD COLUMN ideation_level integer DEFAULT 1,
  ADD COLUMN can_be_revisited boolean DEFAULT true,
  ADD COLUMN hexisle_xp_awarded integer DEFAULT 0;

-- Update foreign key constraint name
ALTER TABLE challenge_submissions
  DROP CONSTRAINT IF EXISTS contest_submissions_contest_id_fkey;

ALTER TABLE challenge_submissions
  ADD CONSTRAINT challenge_submissions_challenge_id_fkey 
  FOREIGN KEY (challenge_id) 
  REFERENCES influencer_challenge_config(id) 
  ON DELETE CASCADE;

-- Create index for concurrent challenge queries
CREATE INDEX IF NOT EXISTS idx_challenge_config_arena_category 
  ON influencer_challenge_config(challenge_arena, submission_categories);

-- Update RLS policies
DROP POLICY IF EXISTS "Project owners can manage submissions" ON challenge_submissions;
DROP POLICY IF EXISTS "Users can create contest submissions" ON challenge_submissions;
DROP POLICY IF EXISTS "Users can view own submissions" ON challenge_submissions;
DROP POLICY IF EXISTS "Anyone can view winning submissions" ON challenge_submissions;

CREATE POLICY "Project owners can manage challenge submissions"
  ON challenge_submissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM influencer_challenge_config icc
      JOIN projects p ON p.id = icc.project_id
      WHERE icc.id = challenge_submissions.challenge_id
      AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create challenge submissions"
  ON challenge_submissions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own submissions"
  ON challenge_submissions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can view winning submissions"
  ON challenge_submissions FOR SELECT
  USING (placement IN ('first', 'second', 'third', 'category_winner'));