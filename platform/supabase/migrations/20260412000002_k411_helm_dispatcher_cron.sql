-- K411 Helm Schedule — pg_cron registration for helm-task-dispatcher
-- Fires every minute, picks up pending tasks whose fire_at has passed.

SELECT cron.schedule(
  'helm-task-dispatcher',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/helm-task-dispatcher',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type', 'application/json'
    )
  );
  $$
);
