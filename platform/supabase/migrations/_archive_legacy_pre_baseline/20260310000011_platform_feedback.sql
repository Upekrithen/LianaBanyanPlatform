-- Platform Feedback / Suggestion Box
-- Global feedback system for all users (authenticated and anonymous).
-- Replaces the project-specific theme_suggestions approach with
-- a platform-wide suggestion box accessible from the footer.

CREATE TABLE IF NOT EXISTS platform_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL DEFAULT 'general'
    CHECK (category IN ('suggestion', 'bug', 'feature', 'general')),
  subject TEXT,
  message TEXT NOT NULL,
  contact_email TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  page_url TEXT,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'acknowledged', 'in_progress', 'resolved', 'declined')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: Anyone can INSERT (anonymous submissions allowed).
-- Only the submitter can read their own. Admins can read all.
ALTER TABLE platform_feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit feedback (no auth required)
CREATE POLICY "Anyone can submit feedback"
  ON platform_feedback FOR INSERT
  WITH CHECK (true);

-- Users can read their own submissions
CREATE POLICY "Users can read own feedback"
  ON platform_feedback FOR SELECT
  USING (auth.uid() = user_id);

-- Founder admin can read all feedback
CREATE POLICY "Admin can read all feedback"
  ON platform_feedback FOR SELECT
  USING (
    auth.uid() IN (
      '330eafae-4dfe-4e01-941f-47d7df55b7b5',
      '86380080-9d6e-41f3-b67f-27d39e6dc6f1'
    )
  );

-- Founder admin can update (status, admin_notes)
CREATE POLICY "Admin can update feedback"
  ON platform_feedback FOR UPDATE
  USING (
    auth.uid() IN (
      '330eafae-4dfe-4e01-941f-47d7df55b7b5',
      '86380080-9d6e-41f3-b67f-27d39e6dc6f1'
    )
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_platform_feedback_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_platform_feedback_updated_at
  BEFORE UPDATE ON platform_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_feedback_timestamp();

-- Index for admin queries
CREATE INDEX idx_platform_feedback_status ON platform_feedback(status);
CREATE INDEX idx_platform_feedback_category ON platform_feedback(category);
CREATE INDEX idx_platform_feedback_created ON platform_feedback(created_at DESC);
