-- K385: Submissions Pedestal
-- Members submit work (art, writing, code, designs) for review.
-- Submissions go through a review pipeline: pending → reviewing → approved/rejected.
-- Approved submissions can be minted as Deck Cards, featured on islands, or
-- earn Marks for the contributor.

BEGIN;

-- ═══ Submissions Table ═══
CREATE TABLE IF NOT EXISTS hexisle_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitter_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  submission_type TEXT NOT NULL
    CHECK (submission_type IN ('art', 'writing', 'code', 'design', 'music', 'map', 'character', 'other')),
  island_slug TEXT,
  district_slug TEXT,
  campaign_id UUID REFERENCES hexisle_campaigns(id),
  file_urls TEXT[] DEFAULT '{}',
  content_body TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewing', 'revision_requested', 'approved', 'rejected', 'featured')),
  reviewer_id UUID REFERENCES auth.users(id),
  reviewer_notes TEXT,
  marks_awarded NUMERIC(10,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_submissions_submitter ON hexisle_submissions (submitter_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON hexisle_submissions (status);
CREATE INDEX IF NOT EXISTS idx_submissions_type ON hexisle_submissions (submission_type);
CREATE INDEX IF NOT EXISTS idx_submissions_island ON hexisle_submissions (island_slug);
CREATE INDEX IF NOT EXISTS idx_submissions_campaign ON hexisle_submissions (campaign_id);

-- ═══ Submission Votes (community review) ═══
CREATE TABLE IF NOT EXISTS submission_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES hexisle_submissions(id) ON DELETE CASCADE NOT NULL,
  voter_id UUID REFERENCES auth.users(id) NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down', 'star')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(submission_id, voter_id)
);

CREATE INDEX IF NOT EXISTS idx_submission_votes_sub ON submission_votes (submission_id);

-- ═══ RLS ═══
ALTER TABLE hexisle_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_votes ENABLE ROW LEVEL SECURITY;

-- Submissions: submitters manage own, approved visible to all
DROP POLICY IF EXISTS "submissions_read" ON hexisle_submissions;
CREATE POLICY "submissions_read" ON hexisle_submissions FOR SELECT
  USING (auth.uid() = submitter_id OR status IN ('approved', 'featured'));

DROP POLICY IF EXISTS "submissions_insert" ON hexisle_submissions;
CREATE POLICY "submissions_insert" ON hexisle_submissions FOR INSERT
  WITH CHECK (auth.uid() = submitter_id);

DROP POLICY IF EXISTS "submissions_update_own" ON hexisle_submissions;
CREATE POLICY "submissions_update_own" ON hexisle_submissions FOR UPDATE
  USING (auth.uid() = submitter_id AND status IN ('pending', 'revision_requested'));

-- Votes: authenticated members can vote
DROP POLICY IF EXISTS "submission_votes_read" ON submission_votes;
CREATE POLICY "submission_votes_read" ON submission_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "submission_votes_insert" ON submission_votes;
CREATE POLICY "submission_votes_insert" ON submission_votes FOR INSERT
  WITH CHECK (auth.uid() = voter_id);

-- ═══ Submissions Pedestal Deck Card ═══
INSERT INTO deck_cards (card_code, name, front_title, back_title, back_instructions, description, front_icon, card_type, rarity, deep_link_url, credit_cost)
VALUES (
  'submissions-pedestal',
  'Submissions Pedestal — The Creator Card',
  'Submissions Pedestal',
  'The Creator Card',
  'Unlocked when your first submission is approved. Your work lives in the Archipelago forever.',
  'Submit your creations to the Archipelago.',
  '🏆',
  'access',
  'rare',
  '/hexisle/submissions',
  0
) ON CONFLICT (card_code) DO NOTHING;

COMMIT;
