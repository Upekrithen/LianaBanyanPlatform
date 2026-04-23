CREATE TABLE IF NOT EXISTS public.chapter_unlock_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id TEXT NOT NULL UNIQUE,
  chapter_number INTEGER NOT NULL,
  chapter_title TEXT NOT NULL,
  paper_slug TEXT NOT NULL,
  engagement_threshold INTEGER NOT NULL DEFAULT 500,
  like_weight NUMERIC NOT NULL DEFAULT 1.0,
  comment_weight NUMERIC NOT NULL DEFAULT 3.0,
  share_weight NUMERIC NOT NULL DEFAULT 5.0,
  save_weight NUMERIC NOT NULL DEFAULT 2.0,
  unlocked BOOLEAN NOT NULL DEFAULT false,
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chapter_engagement_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id TEXT NOT NULL REFERENCES public.chapter_unlock_config(chapter_id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  episode_number INTEGER,
  event_type TEXT NOT NULL CHECK (event_type IN ('like', 'comment', 'share', 'save', 'view')),
  event_count INTEGER NOT NULL DEFAULT 1,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chapter_engagement_chapter
  ON public.chapter_engagement_events(chapter_id);

CREATE INDEX IF NOT EXISTS idx_chapter_engagement_recorded
  ON public.chapter_engagement_events(recorded_at DESC);

ALTER TABLE public.chapter_unlock_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_engagement_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'chapter_unlock_config'
      AND policyname = 'Anyone can read chapter unlock config'
  ) THEN
    CREATE POLICY "Anyone can read chapter unlock config"
      ON public.chapter_unlock_config
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'chapter_engagement_events'
      AND policyname = 'Anyone can read engagement events'
  ) THEN
    CREATE POLICY "Anyone can read engagement events"
      ON public.chapter_engagement_events
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'chapter_engagement_events'
      AND policyname = 'Anyone can insert engagement events'
  ) THEN
    CREATE POLICY "Anyone can insert engagement events"
      ON public.chapter_engagement_events
      FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

CREATE OR REPLACE VIEW public.chapter_unlock_progress AS
SELECT
  cuc.chapter_id,
  cuc.chapter_number,
  cuc.chapter_title,
  cuc.paper_slug,
  cuc.engagement_threshold,
  cuc.unlocked,
  cuc.unlocked_at,
  COALESCE(SUM(
    CASE e.event_type
      WHEN 'like' THEN e.event_count * cuc.like_weight
      WHEN 'comment' THEN e.event_count * cuc.comment_weight
      WHEN 'share' THEN e.event_count * cuc.share_weight
      WHEN 'save' THEN e.event_count * cuc.save_weight
      ELSE 0
    END
  ), 0) AS weighted_engagement,
  COALESCE(SUM(e.event_count) FILTER (WHERE e.event_type != 'view'), 0) AS raw_engagement,
  ROUND(
    LEAST(100, COALESCE(SUM(
      CASE e.event_type
        WHEN 'like' THEN e.event_count * cuc.like_weight
        WHEN 'comment' THEN e.event_count * cuc.comment_weight
        WHEN 'share' THEN e.event_count * cuc.share_weight
        WHEN 'save' THEN e.event_count * cuc.save_weight
        ELSE 0
      END
    ), 0) * 100.0 / NULLIF(cuc.engagement_threshold, 0)),
    0
  ) AS percent_unlocked
FROM public.chapter_unlock_config cuc
LEFT JOIN public.chapter_engagement_events e
  ON e.chapter_id = cuc.chapter_id
  AND e.event_type != 'view'
GROUP BY cuc.id;

CREATE OR REPLACE FUNCTION public.check_chapter_unlock()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_config public.chapter_unlock_config;
  v_weighted NUMERIC;
BEGIN
  SELECT * INTO v_config
  FROM public.chapter_unlock_config
  WHERE chapter_id = NEW.chapter_id;

  IF v_config.unlocked THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(SUM(
    CASE event_type
      WHEN 'like' THEN event_count * v_config.like_weight
      WHEN 'comment' THEN event_count * v_config.comment_weight
      WHEN 'share' THEN event_count * v_config.share_weight
      WHEN 'save' THEN event_count * v_config.save_weight
      ELSE 0
    END
  ), 0) INTO v_weighted
  FROM public.chapter_engagement_events
  WHERE chapter_id = NEW.chapter_id
    AND event_type != 'view';

  IF v_weighted >= v_config.engagement_threshold THEN
    UPDATE public.chapter_unlock_config
    SET unlocked = true,
        unlocked_at = now(),
        updated_at = now()
    WHERE chapter_id = NEW.chapter_id;
  ELSE
    UPDATE public.chapter_unlock_config
    SET updated_at = now()
    WHERE chapter_id = NEW.chapter_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS chapter_unlock_check ON public.chapter_engagement_events;

CREATE TRIGGER chapter_unlock_check
  AFTER INSERT ON public.chapter_engagement_events
  FOR EACH ROW
  EXECUTE FUNCTION public.check_chapter_unlock();

INSERT INTO public.chapter_unlock_config
  (chapter_id, chapter_number, chapter_title, paper_slug, engagement_threshold)
VALUES
  ('bst_ch_07_lighthouse_ladder', 7, 'The Lighthouse Ladder', 'lighthouse-ladder', 500),
  ('bst_ch_08_invisible_temperament', 8, 'The Invisible Temperament', 'invisible-temperament', 500),
  ('bst_ch_09_self_funding_economics', 9, 'Self-Funding Economics', 'self-funding-economics', 500),
  ('bst_ch_10_portable_reputation', 10, 'Portable Reputation', 'portable-reputation', 500),
  ('bst_ch_11_contingency_operators', 11, 'Contingency Operators', 'contingency-operators', 500),
  ('bst_ch_12_tca', 12, 'Temporal Content Architecture', 'temporal-content-architecture', 500)
ON CONFLICT (chapter_id) DO UPDATE
SET chapter_number = EXCLUDED.chapter_number,
    chapter_title = EXCLUDED.chapter_title,
    paper_slug = EXCLUDED.paper_slug,
    engagement_threshold = EXCLUDED.engagement_threshold,
    updated_at = now();
