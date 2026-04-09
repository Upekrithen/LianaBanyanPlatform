-- B075 / KNIGHT SESSION 272
-- Pudding hot-pepper ratings with view-gated activation

ALTER TABLE public.cephas_puddings
  ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_active BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pepper_rating_avg NUMERIC(3,2),
  ADD COLUMN IF NOT EXISTS pepper_rating_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.pudding_pepper_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pudding_number INTEGER NOT NULL REFERENCES public.cephas_puddings(pudding_number) ON DELETE CASCADE,
  rater_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  pepper_count INTEGER NOT NULL CHECK (pepper_count BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_pudding_pepper_ratings_member
  ON public.pudding_pepper_ratings (pudding_number, rater_id)
  WHERE rater_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pudding_pepper_ratings_pudding
  ON public.pudding_pepper_ratings (pudding_number);

CREATE INDEX IF NOT EXISTS idx_pudding_pepper_ratings_created_at
  ON public.pudding_pepper_ratings (created_at DESC);

ALTER TABLE public.pudding_pepper_ratings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'pudding_pepper_ratings'
      AND policyname = 'Anyone can read pudding pepper ratings'
  ) THEN
    CREATE POLICY "Anyone can read pudding pepper ratings"
      ON public.pudding_pepper_ratings
      FOR SELECT
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'pudding_pepper_ratings'
      AND policyname = 'Anyone can insert pudding pepper ratings'
  ) THEN
    CREATE POLICY "Anyone can insert pudding pepper ratings"
      ON public.pudding_pepper_ratings
      FOR INSERT
      WITH CHECK (pepper_count BETWEEN 1 AND 5);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc
    JOIN pg_namespace n ON n.oid = pg_proc.pronamespace
    WHERE proname = 'activate_pudding_rating'
      AND n.nspname = 'public'
  ) THEN
    CREATE FUNCTION public.activate_pudding_rating()
    RETURNS TRIGGER AS $fn$
    BEGIN
      IF NEW.view_count >= 100 AND COALESCE(OLD.rating_active, false) = false THEN
        NEW.rating_active := true;
      END IF;
      RETURN NEW;
    END;
    $fn$ LANGUAGE plpgsql;
  END IF;
END
$$;

DROP TRIGGER IF EXISTS pudding_rating_activation ON public.cephas_puddings;
CREATE TRIGGER pudding_rating_activation
  BEFORE UPDATE ON public.cephas_puddings
  FOR EACH ROW
  EXECUTE FUNCTION public.activate_pudding_rating();

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'aggregate-pudding-ratings-hourly') THEN
    PERFORM cron.unschedule('aggregate-pudding-ratings-hourly');
  END IF;
END $$;

SELECT cron.schedule(
  'aggregate-pudding-ratings-hourly',
  '5 * * * *',
  $cron$
    SELECT net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/aggregate-pudding-ratings',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'::jsonb
    );
  $cron$
);
