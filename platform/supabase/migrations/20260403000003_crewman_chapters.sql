-- Crewman #6 chapter staging/streaming lifecycle
CREATE TABLE IF NOT EXISTS public.crewman_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  source_document TEXT,
  cephas_content_key TEXT,
  episode_count INTEGER NOT NULL DEFAULT 0,
  vote_threshold INTEGER NOT NULL DEFAULT 100,
  current_engagement INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'staged' CHECK (status IN ('staged', 'streaming', 'published', 'completed')),
  stream_started_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crewman_chapters_status
  ON public.crewman_chapters(status);

CREATE INDEX IF NOT EXISTS idx_crewman_chapters_number
  ON public.crewman_chapters(chapter_number);

ALTER TABLE public.crewman_chapters ENABLE ROW LEVEL SECURITY;

-- Public read for chapters that have gone live.
CREATE POLICY "Crewman chapters public read published"
  ON public.crewman_chapters
  FOR SELECT
  USING (status IN ('published', 'completed'));

-- Authenticated users can monitor active chapters but not staged drafts.
CREATE POLICY "Crewman chapters authenticated read non-staged"
  ON public.crewman_chapters
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND status <> 'staged');

-- Automated system owns writes.
CREATE POLICY "Crewman chapters service role full access"
  ON public.crewman_chapters
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
