-- Crewman #6 serialized episodes for battery dispatch threading
CREATE TABLE IF NOT EXISTS public.crewman_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES public.crewman_chapters(id) ON DELETE CASCADE,
  sequence_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  source_reference TEXT,
  tags TEXT[],
  platform TEXT NOT NULL DEFAULT 'twitter',
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'posted', 'failed')),
  posted_at TIMESTAMPTZ,
  platform_post_id TEXT,
  parent_post_id TEXT,
  engagement_likes INTEGER NOT NULL DEFAULT 0,
  engagement_replies INTEGER NOT NULL DEFAULT 0,
  engagement_reposts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT crewman_episodes_chapter_sequence_platform_key UNIQUE (chapter_id, sequence_number, platform)
);

CREATE INDEX IF NOT EXISTS idx_crewman_episodes_chapter_status
  ON public.crewman_episodes(chapter_id, status, sequence_number);

CREATE INDEX IF NOT EXISTS idx_crewman_episodes_status
  ON public.crewman_episodes(status);

ALTER TABLE public.crewman_episodes ENABLE ROW LEVEL SECURITY;

-- Episodes are social posts; public read is always allowed.
CREATE POLICY "Crewman episodes public read"
  ON public.crewman_episodes
  FOR SELECT
  USING (true);

-- Automated system owns writes.
CREATE POLICY "Crewman episodes service role full access"
  ON public.crewman_episodes
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
