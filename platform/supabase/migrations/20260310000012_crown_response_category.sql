-- Add crown_response category to platform_feedback
-- Bridges Red Carpet verified recipients → outbound dispatch tracking.
-- Also add response_intent and recipient metadata columns.

-- Drop and re-add the category check constraint
ALTER TABLE platform_feedback DROP CONSTRAINT IF EXISTS platform_feedback_category_check;
ALTER TABLE platform_feedback
  ADD CONSTRAINT platform_feedback_category_check
  CHECK (category IN ('suggestion', 'bug', 'feature', 'general', 'crown_response'));

-- Add columns for Red Carpet response integration
ALTER TABLE platform_feedback
  ADD COLUMN IF NOT EXISTS response_intent TEXT,
  ADD COLUMN IF NOT EXISTS recipient_id TEXT,
  ADD COLUMN IF NOT EXISTS verified_domain TEXT,
  ADD COLUMN IF NOT EXISTS publish_to_junket BOOLEAN DEFAULT false;

-- Index for crown response queries (Founder dashboard)
CREATE INDEX IF NOT EXISTS idx_platform_feedback_crown
  ON platform_feedback(recipient_id)
  WHERE category = 'crown_response';
