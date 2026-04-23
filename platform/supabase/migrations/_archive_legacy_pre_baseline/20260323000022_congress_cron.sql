-- pg_cron jobs for Congress.gov API sync — K90

SELECT cron.schedule(
  'congress-bill-sync',
  '0 */6 * * *',
  $$SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/congress-api-sync?mode=bills',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'), 'x-lb-system-key', current_setting('app.settings.lb_system_key')),
    body := '{}'::jsonb
  )$$
);

SELECT cron.schedule(
  'congress-member-sync',
  '0 3 * * *',
  $$SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/congress-api-sync?mode=members',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'), 'x-lb-system-key', current_setting('app.settings.lb_system_key')),
    body := '{}'::jsonb
  )$$
);

SELECT cron.schedule(
  'congress-action-sync',
  '0 2 * * *',
  $$SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/congress-api-sync?mode=actions',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'), 'x-lb-system-key', current_setting('app.settings.lb_system_key')),
    body := '{}'::jsonb
  )$$
);
