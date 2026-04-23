-- B076 / Session 289: Engagement events ingestion (K289)
-- Adds social post mapping, dedupe columns/indexes, worker observability, and polling schedules.

CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.social_post_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  external_post_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL REFERENCES public.chapter_unlock_config(chapter_id) ON DELETE CASCADE,
  episode_number INTEGER,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (platform, external_post_id)
);

CREATE INDEX IF NOT EXISTS idx_social_post_mapping_chapter
  ON public.social_post_mapping(chapter_id);

CREATE INDEX IF NOT EXISTS idx_social_post_mapping_external
  ON public.social_post_mapping(platform, external_post_id);

CREATE INDEX IF NOT EXISTS idx_social_post_mapping_posted_at
  ON public.social_post_mapping(posted_at DESC);

ALTER TABLE public.social_post_mapping ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'social_post_mapping'
      AND policyname = 'Anyone can read social post mapping'
  ) THEN
    CREATE POLICY "Anyone can read social post mapping"
      ON public.social_post_mapping
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'social_post_mapping'
      AND policyname = 'Service role can manage social post mapping'
  ) THEN
    CREATE POLICY "Service role can manage social post mapping"
      ON public.social_post_mapping
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

ALTER TABLE public.chapter_engagement_events
  ADD COLUMN IF NOT EXISTS external_event_id TEXT,
  ADD COLUMN IF NOT EXISTS platform_post_id TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual';

CREATE UNIQUE INDEX IF NOT EXISTS ux_engagement_event_dedupe
  ON public.chapter_engagement_events (platform, platform_post_id, external_event_id, event_type)
  WHERE external_event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_chapter_engagement_platform_post
  ON public.chapter_engagement_events (platform, platform_post_id);

CREATE TABLE IF NOT EXISTS public.engagement_ingestion_worker_status (
  worker_name TEXT PRIMARY KEY,
  last_run_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_error_at TIMESTAMPTZ,
  error_count INTEGER NOT NULL DEFAULT 0,
  last_error_message TEXT,
  last_stats JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.engagement_ingestion_worker_status ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'engagement_ingestion_worker_status'
      AND policyname = 'Anyone can read engagement ingestion worker status'
  ) THEN
    CREATE POLICY "Anyone can read engagement ingestion worker status"
      ON public.engagement_ingestion_worker_status
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'engagement_ingestion_worker_status'
      AND policyname = 'Service role can manage engagement ingestion worker status'
  ) THEN
    CREATE POLICY "Service role can manage engagement ingestion worker status"
      ON public.engagement_ingestion_worker_status
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.touch_engagement_ingestion_worker(
  p_worker_name TEXT,
  p_success BOOLEAN,
  p_error_message TEXT DEFAULT NULL,
  p_stats JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.engagement_ingestion_worker_status (
    worker_name,
    last_run_at,
    last_success_at,
    last_error_at,
    error_count,
    last_error_message,
    last_stats,
    updated_at
  )
  VALUES (
    p_worker_name,
    now(),
    CASE WHEN p_success THEN now() ELSE NULL END,
    CASE WHEN p_success THEN NULL ELSE now() END,
    CASE WHEN p_success THEN 0 ELSE 1 END,
    CASE WHEN p_success THEN NULL ELSE p_error_message END,
    COALESCE(p_stats, '{}'::jsonb),
    now()
  )
  ON CONFLICT (worker_name)
  DO UPDATE SET
    last_run_at = now(),
    last_success_at = CASE
      WHEN p_success THEN now()
      ELSE public.engagement_ingestion_worker_status.last_success_at
    END,
    last_error_at = CASE
      WHEN p_success THEN public.engagement_ingestion_worker_status.last_error_at
      ELSE now()
    END,
    error_count = CASE
      WHEN p_success THEN 0
      ELSE public.engagement_ingestion_worker_status.error_count + 1
    END,
    last_error_message = CASE
      WHEN p_success THEN NULL
      ELSE p_error_message
    END,
    last_stats = COALESCE(p_stats, '{}'::jsonb),
    updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.touch_engagement_ingestion_worker(TEXT, BOOLEAN, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.touch_engagement_ingestion_worker(TEXT, BOOLEAN, TEXT, JSONB) TO service_role;

CREATE OR REPLACE VIEW public.engagement_events_per_platform_hour AS
SELECT
  platform,
  date_trunc('hour', recorded_at) AS hour_bucket,
  COUNT(*) AS rows_inserted,
  COALESCE(SUM(event_count), 0) AS events_recorded
FROM public.chapter_engagement_events
GROUP BY platform, date_trunc('hour', recorded_at);

CREATE OR REPLACE VIEW public.engagement_ingestion_coverage_gaps AS
SELECT
  spm.platform,
  spm.external_post_id AS platform_post_id,
  spm.chapter_id,
  spm.episode_number,
  spm.posted_at,
  COUNT(cee.id) AS engagement_rows,
  COALESCE(SUM(cee.event_count), 0) AS engagement_total,
  MAX(cee.recorded_at) AS last_event_at
FROM public.social_post_mapping spm
LEFT JOIN public.chapter_engagement_events cee
  ON cee.platform = spm.platform
  AND cee.platform_post_id = spm.external_post_id
WHERE spm.posted_at >= now() - interval '72 hours'
GROUP BY
  spm.platform,
  spm.external_post_id,
  spm.chapter_id,
  spm.episode_number,
  spm.posted_at
HAVING COUNT(cee.id) = 0;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'poll-x-engagement') THEN
    PERFORM cron.unschedule('poll-x-engagement');
  END IF;
END $$;

SELECT cron.schedule(
  'poll-x-engagement',
  '*/15 * * * *',
  $cron$
    SELECT net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/poll-x-engagement',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    );
  $cron$
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'poll-threads-engagement') THEN
    PERFORM cron.unschedule('poll-threads-engagement');
  END IF;
END $$;

SELECT cron.schedule(
  'poll-threads-engagement',
  '*/30 * * * *',
  $cron$
    SELECT net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/poll-threads-engagement',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    );
  $cron$
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'poll-linkedin-engagement') THEN
    PERFORM cron.unschedule('poll-linkedin-engagement');
  END IF;
END $$;

SELECT cron.schedule(
  'poll-linkedin-engagement',
  '0 * * * *',
  $cron$
    SELECT net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/poll-linkedin-engagement',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    );
  $cron$
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'poll-meta-engagement') THEN
    PERFORM cron.unschedule('poll-meta-engagement');
  END IF;
END $$;

SELECT cron.schedule(
  'poll-meta-engagement',
  '*/30 * * * *',
  $cron$
    SELECT net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/poll-meta-engagement',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    );
  $cron$
);
