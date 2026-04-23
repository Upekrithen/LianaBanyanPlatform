-- K349: Snow Gate Quest Chain foundation
-- Bishop B084 / Knight session 349

CREATE TABLE IF NOT EXISTS public.snow_gate_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lock_number INTEGER NOT NULL CHECK (lock_number BETWEEN 1 AND 12),
  lock_name TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reward_claimed BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, lock_number)
);

CREATE TABLE IF NOT EXISTS public.babylon_candle_fragments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fragment_number INTEGER NOT NULL CHECK (fragment_number BETWEEN 1 AND 7),
  source TEXT NOT NULL CHECK (source IN ('star_chamber', 'pudding_series', 'treasure_map', 'alcove', 'other')),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, fragment_number)
);

CREATE INDEX IF NOT EXISTS idx_snow_gate_progress_user ON public.snow_gate_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_babylon_fragments_user ON public.babylon_candle_fragments(user_id);

ALTER TABLE public.snow_gate_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.babylon_candle_fragments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "snow_gate_progress_select_own" ON public.snow_gate_progress;
CREATE POLICY "snow_gate_progress_select_own"
ON public.snow_gate_progress FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "snow_gate_progress_insert_own" ON public.snow_gate_progress;
CREATE POLICY "snow_gate_progress_insert_own"
ON public.snow_gate_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "snow_gate_progress_update_own" ON public.snow_gate_progress;
CREATE POLICY "snow_gate_progress_update_own"
ON public.snow_gate_progress FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "babylon_fragments_select_own" ON public.babylon_candle_fragments;
CREATE POLICY "babylon_fragments_select_own"
ON public.babylon_candle_fragments FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "babylon_fragments_insert_own" ON public.babylon_candle_fragments;
CREATE POLICY "babylon_fragments_insert_own"
ON public.babylon_candle_fragments FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "babylon_fragments_update_own" ON public.babylon_candle_fragments;
CREATE POLICY "babylon_fragments_update_own"
ON public.babylon_candle_fragments FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
