-- K412 Glass Door — pg_cron registration for outreach-dispatch-cron
-- Fires every 5 minutes; outreach letters are not minute-sensitive.

SELECT cron.schedule(
  'outreach-dispatch-cron',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/outreach-dispatch-cron',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type', 'application/json'
    )
  );
  $$
);
