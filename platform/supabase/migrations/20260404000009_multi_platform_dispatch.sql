-- K248: Battery Grid Wiring + Multi-Platform Dispatch + Opening Gambit Attribution

-- Platform accounts for multi-channel posting.
CREATE TABLE IF NOT EXISTS public.dispatch_platform_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'threads', 'bluesky', 'instagram', 'facebook')),
  account_name TEXT NOT NULL,
  auth_token_encrypted TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  posting_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_dispatch_platform_accounts_platform_account
  ON public.dispatch_platform_accounts (platform, account_name);

CREATE INDEX IF NOT EXISTS idx_dispatch_platform_accounts_active
  ON public.dispatch_platform_accounts (platform, is_active);

ALTER TABLE public.dispatch_platform_accounts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'dispatch_platform_accounts'
      AND policyname = 'Dispatch platform accounts service role full access'
  ) THEN
    CREATE POLICY "Dispatch platform accounts service role full access"
      ON public.dispatch_platform_accounts
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

-- Engagement aggregation for the self-referencing loop.
CREATE TABLE IF NOT EXISTS public.distribution_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID NOT NULL REFERENCES public.crewman_episodes(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  time_slot TIMESTAMPTZ NOT NULL,
  day_of_week TEXT NOT NULL,
  hour_local INTEGER NOT NULL CHECK (hour_local BETWEEN 0 AND 23),
  channel TEXT NOT NULL CHECK (channel IN ('bst', 'spoonfuls', 'skipping_stones')),
  content_type TEXT,
  likes INTEGER NOT NULL DEFAULT 0,
  replies INTEGER NOT NULL DEFAULT 0,
  reposts INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  cross_ref_clicks INTEGER NOT NULL DEFAULT 0,
  beacon_creates INTEGER NOT NULL DEFAULT 0,
  collected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_distribution_analytics_episode_platform_slot
  ON public.distribution_analytics (episode_id, platform, time_slot);

CREATE INDEX IF NOT EXISTS idx_analytics_channel_platform
  ON public.distribution_analytics (channel, platform);

CREATE INDEX IF NOT EXISTS idx_analytics_content_type
  ON public.distribution_analytics (content_type);

CREATE INDEX IF NOT EXISTS idx_analytics_time
  ON public.distribution_analytics (day_of_week, hour_local);

ALTER TABLE public.distribution_analytics ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'distribution_analytics'
      AND policyname = 'Distribution analytics service role full access'
  ) THEN
    CREATE POLICY "Distribution analytics service role full access"
      ON public.distribution_analytics
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

-- Opening Gambit reloaded attribution: letter -> viewing schedule -> series engagement -> member conversion.
CREATE TABLE IF NOT EXISTS public.opening_gambit_funnel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_identifier TEXT NOT NULL,
  letter_slug TEXT,
  wave TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('letter_open', 'viewing_schedule_visit', 'series_engagement', 'member_conversion')),
  series_key TEXT CHECK (series_key IN ('bst', 'spoonfuls', 'skipping_stones')),
  member_id UUID,
  event_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_opening_gambit_funnel_recipient
  ON public.opening_gambit_funnel_events (recipient_identifier, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_opening_gambit_funnel_type
  ON public.opening_gambit_funnel_events (event_type, created_at DESC);

ALTER TABLE public.opening_gambit_funnel_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'opening_gambit_funnel_events'
      AND policyname = 'Opening gambit funnel service role full access'
  ) THEN
    CREATE POLICY "Opening gambit funnel service role full access"
      ON public.opening_gambit_funnel_events
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

-- Daily aggregation cron.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'crewman-distribution-analytics-daily') THEN
    PERFORM cron.unschedule('crewman-distribution-analytics-daily');
  END IF;
END $$;

SELECT cron.schedule(
  'crewman-distribution-analytics-daily',
  '15 2 * * *',
  $cron$
    SELECT net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/aggregate-distribution-analytics',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'::jsonb
    );
  $cron$
);
