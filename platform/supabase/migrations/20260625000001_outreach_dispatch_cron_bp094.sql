-- BP094 Knight Session 6 -- outreach-dispatch-cron pg_cron job activation
-- NOTE: Edge function queries outreach_letters table (state='scheduled').
-- BP094 rows are in outbound_dispatch with status='stamped' and scheduled_for=NULL.
-- Cron is safe to activate now -- NULL scheduled_for means zero rows fire.
-- Founder action required: set scheduled_for timestamps in outbound_dispatch to activate dispatch.

SELECT cron.schedule(
  'outreach-dispatch-cron-bp094',
  '*/5 * * * *',
  $$
    SELECT net.http_post(
      url := current_setting('app.supabase_url', true) || '/functions/v1/outreach-dispatch-cron',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
      ),
      body := '{}'::jsonb
    );
  $$
);
