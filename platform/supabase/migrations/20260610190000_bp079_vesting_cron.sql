-- BP079 Wave B.6 — Red Carpet Vesting Cron Job
-- 2026-06-10
-- SEG-RC-B-Vesting (Sonnet 4.6)
--
-- Schedules the promotion-attribution-vesting-check Edge Function to run daily at 2am UTC.
-- This function scans promotion_attributions for rows where vesting_unlock_at has passed
-- and claims them for introducers.
--
-- CANONICAL RULE: canon_three_currency_no_fiat_substitution_bp078
--   - Attributions use currency_class (credits/marks/joules), NEVER fiat amounts.

-- Verify pg_cron extension is enabled (should be from baseline migration)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the daily vesting check at 2am UTC
-- Uses Supabase's runtime settings pattern (see k412 migration for reference)
SELECT cron.schedule(
  'promotion-attribution-vesting-check-daily',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/promotion-attribution-vesting-check',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  )
  $$
);

-- Note: If current_setting() pattern fails, alternative is to query platform_canonical:
-- (SELECT value FROM public.platform_canonical WHERE key = 'supabase_url')
