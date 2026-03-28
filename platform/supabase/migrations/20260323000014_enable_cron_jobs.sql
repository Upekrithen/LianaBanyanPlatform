-- Enable pg_cron + pg_net for scheduled edge function invocations
-- NOTE: Both extensions must also be enabled in Supabase Dashboard → Database → Extensions
-- If pg_net is not available, use the Supabase Dashboard cron UI as a fallback.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Process scheduled social media posts every 5 minutes
SELECT cron.schedule(
  'process-scheduled-posts',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/process-scheduled-posts',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- MoneyPenny auto-post approved drafts every 5 minutes (offset by 2 min)
SELECT cron.schedule(
  'moneypenny-auto-post',
  '2-57/5 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/moneypenny-auto-post',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
