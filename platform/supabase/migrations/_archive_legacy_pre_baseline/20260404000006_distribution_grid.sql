ALTER TABLE public.crewman_episodes ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'bst'
  CHECK (channel IN ('bst', 'spoonfuls', 'skipping_stones'));
ALTER TABLE public.crewman_episodes ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;
ALTER TABLE public.crewman_episodes ADD COLUMN IF NOT EXISTS content_type TEXT;
ALTER TABLE public.crewman_episodes ADD COLUMN IF NOT EXISTS cross_ref_post_id UUID REFERENCES public.crewman_episodes(id);
ALTER TABLE public.crewman_episodes ADD COLUMN IF NOT EXISTS cross_ref_text TEXT;
ALTER TABLE public.crewman_episodes ADD COLUMN IF NOT EXISTS engagement_clicks INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.crewman_episodes ADD COLUMN IF NOT EXISTS engagement_cross_ref_clicks INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.crewman_episodes ADD COLUMN IF NOT EXISTS engagement_beacon_creates INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_crewman_episodes_schedule
  ON public.crewman_episodes (channel, scheduled_for) WHERE status = 'queued';
CREATE INDEX IF NOT EXISTS idx_crewman_episodes_channel
  ON public.crewman_episodes (channel);
