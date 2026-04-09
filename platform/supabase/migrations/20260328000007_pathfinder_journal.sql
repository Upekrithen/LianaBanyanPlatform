-- =============================================================================
-- MIGRATION: 20260328000007_pathfinder_journal
-- PURPOSE:   PathFinder — persistent career discovery journal.
--            Members log work experiences, system detects patterns,
--            matches to Treasure Maps and Cold Start pathways.
-- DATE:      2026-03-28  |  Knight 150
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.pathfinder_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,

  experience_title TEXT NOT NULL,
  experience_category TEXT CHECK (experience_category IN (
    'food', 'delivery', 'service', 'manufacturing', 'digital',
    'education', 'healthcare', 'retail', 'trade', 'creative', 'other'
  )),

  rating INT CHECK (rating BETWEEN 1 AND 5),
  liked_aspects TEXT[],
  disliked_aspects TEXT[],

  notes TEXT,
  duration TEXT CHECK (duration IN (
    'one_day', 'one_week', 'one_month', 'several_months', 'years'
  )),
  would_do_again BOOLEAN,

  related_treasure_map_id UUID,
  marks_earned INT DEFAULT 1,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── RLS ──────────────────────────────────────────────────────────────────
ALTER TABLE public.pathfinder_journal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own journal entries"
  ON public.pathfinder_journal FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create journal entries"
  ON public.pathfinder_journal FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries"
  ON public.pathfinder_journal FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries"
  ON public.pathfinder_journal FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Indexes ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pathfinder_journal_user
  ON public.pathfinder_journal(user_id);
CREATE INDEX IF NOT EXISTS idx_pathfinder_journal_category
  ON public.pathfinder_journal(experience_category);
CREATE INDEX IF NOT EXISTS idx_pathfinder_journal_rating
  ON public.pathfinder_journal(user_id, rating);
