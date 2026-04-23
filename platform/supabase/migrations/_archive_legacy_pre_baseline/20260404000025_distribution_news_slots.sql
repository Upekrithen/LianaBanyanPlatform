-- B075: Reserved daily news slot for distribution grid.
CREATE TABLE IF NOT EXISTS public.distribution_news_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_date DATE NOT NULL,
  slot_time TIME NOT NULL DEFAULT '17:00:00',
  content_type TEXT NOT NULL DEFAULT 'stats' CHECK (content_type IN ('stats', 'breaking_news', 'deferred')),
  content TEXT NOT NULL,
  original_date DATE,
  breaking_news_source TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'dispatched', 'deferred')),
  dispatched_at TIMESTAMPTZ,
  dispatched_platform TEXT,
  dispatched_platform_post_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_news_slots_date
  ON public.distribution_news_slots (scheduled_date, status);

CREATE INDEX IF NOT EXISTS idx_news_slots_dispatch_window
  ON public.distribution_news_slots (status, scheduled_date, slot_time);

ALTER TABLE public.distribution_news_slots ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'distribution_news_slots'
      AND policyname = 'Distribution news slots public read'
  ) THEN
    CREATE POLICY "Distribution news slots public read"
      ON public.distribution_news_slots
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
      AND tablename = 'distribution_news_slots'
      AND policyname = 'Distribution news slots service role full access'
  ) THEN
    CREATE POLICY "Distribution news slots service role full access"
      ON public.distribution_news_slots
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'crewman-generate-daily-stats') THEN
    PERFORM cron.unschedule('crewman-generate-daily-stats');
  END IF;
END $$;

SELECT cron.schedule(
  'crewman-generate-daily-stats',
  '5 0 * * *',
  $cron$
    SELECT net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/generate-daily-stats',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'::jsonb
    );
  $cron$
);
