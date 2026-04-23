-- K243: Cue Card Interest Signal (#2136)

-- Add interest signal support to cue_cards (if table is present in this environment).
ALTER TABLE IF EXISTS public.cue_cards
  ADD COLUMN IF NOT EXISTS shared_beacons UUID[] DEFAULT '{}';

ALTER TABLE IF EXISTS public.cue_cards
  ADD COLUMN IF NOT EXISTS interest_visibility TEXT DEFAULT 'public'
  CHECK (interest_visibility IN ('public', 'crew', 'private'));

-- Reading cohorts: groups of members reading the same paper.
CREATE TABLE IF NOT EXISTS public.reading_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_key TEXT NOT NULL,
  member_id UUID NOT NULL REFERENCES auth.users(id),
  joined_via_member_id UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (paper_key, member_id)
);

ALTER TABLE public.reading_cohorts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read cohorts" ON public.reading_cohorts;
CREATE POLICY "Public read cohorts"
  ON public.reading_cohorts
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Members join cohorts" ON public.reading_cohorts;
CREATE POLICY "Members join cohorts"
  ON public.reading_cohorts
  FOR INSERT
  WITH CHECK (auth.uid() = member_id);

CREATE INDEX IF NOT EXISTS idx_reading_cohorts_paper
  ON public.reading_cohorts (paper_key);
