-- K350: Alcove hallway progress tracking

CREATE TABLE IF NOT EXISTS public.alcove_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stop_slug TEXT NOT NULL,
  tier INTEGER NOT NULL CHECK (tier BETWEEN 1 AND 3),
  visited_at TIMESTAMPTZ DEFAULT now(),
  comprehended_at TIMESTAMPTZ,
  marks_awarded INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, stop_slug)
);

CREATE INDEX IF NOT EXISTS idx_alcove_progress_user ON public.alcove_progress (user_id);

ALTER TABLE public.alcove_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own alcove progress" ON public.alcove_progress;
CREATE POLICY "Users read own alcove progress"
ON public.alcove_progress
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own alcove progress" ON public.alcove_progress;
CREATE POLICY "Users insert own alcove progress"
ON public.alcove_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own alcove progress" ON public.alcove_progress;
CREATE POLICY "Users update own alcove progress"
ON public.alcove_progress
FOR UPDATE
USING (auth.uid() = user_id);
