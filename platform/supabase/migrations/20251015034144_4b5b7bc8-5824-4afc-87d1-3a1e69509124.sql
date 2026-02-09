-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule hourly queue recalculation (every hour, on the hour)
SELECT cron.schedule(
  'recalculate-production-queue-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://ivopsblevxcujagykobj.supabase.co/functions/v1/recalculate-queue-hourly',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2b3BzYmxldnhjdWphZ3lrb2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDc2NjcsImV4cCI6MjA3NTQ4MzY2N30.Gt0r4_LtBuDxAwxprWETc-cO_y0Ah9mcVg3eSnedInY"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);
