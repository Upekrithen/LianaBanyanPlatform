-- Crewman #6 schedule wiring
-- - dispatch-crewman-episode: hourly
-- - track-crewman-engagement: every 15 minutes

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'crewman-dispatch-hourly') THEN
    PERFORM cron.unschedule('crewman-dispatch-hourly');
  END IF;

  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'crewman-engagement-quarter-hour') THEN
    PERFORM cron.unschedule('crewman-engagement-quarter-hour');
  END IF;
END $$;

SELECT cron.schedule(
  'crewman-dispatch-hourly',
  '0 * * * *',
  $cron$
    SELECT net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/dispatch-crewman-episode',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'::jsonb
    );
  $cron$
);

SELECT cron.schedule(
  'crewman-engagement-quarter-hour',
  '*/15 * * * *',
  $cron$
    SELECT net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/track-crewman-engagement',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'::jsonb
    );
  $cron$
);
