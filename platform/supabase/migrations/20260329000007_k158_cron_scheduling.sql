-- =============================================================================
-- MIGRATION: 20260329000007_k158_cron_scheduling
-- PURPOSE:   Schedule process-marks-payback and process-roommate-escrow via
--            pg_cron. Enable the extension, create the cron jobs, and add a
--            cron_job_log table for observability.
-- DATE:      2026-03-29  |  Knight 158
-- =============================================================================

-- Enable pg_cron (Supabase already has this available but may need explicit enable)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Grant usage to postgres role (Supabase standard)
GRANT USAGE ON SCHEMA cron TO postgres;

-- =====================
-- 1. Cron Job Log (observability)
-- =====================

CREATE TABLE IF NOT EXISTS cron_job_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  job_name TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT DEFAULT 'running',
  records_processed INT DEFAULT 0,
  error_message TEXT,
  details JSONB DEFAULT '{}'
);

ALTER TABLE cron_job_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read cron logs" ON cron_job_log
  FOR SELECT USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_cron_log_job ON cron_job_log(job_name);
CREATE INDEX IF NOT EXISTS idx_cron_log_started ON cron_job_log(started_at DESC);

-- =====================
-- 2. Marks Payback Cron — Weekly Sunday 3am UTC
-- =====================
-- Calls the existing process-marks-payback edge function with { all: true }

SELECT cron.schedule(
  'process-marks-payback-weekly',
  '0 3 * * 0',
  $$
    SELECT net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/process-marks-payback',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{"all": true}'::jsonb
    );
  $$
);

-- =====================
-- 3. Roommate Escrow Cron — Weekly Monday 4am UTC
-- =====================
-- Calls the process-roommate-escrow edge function

SELECT cron.schedule(
  'process-roommate-escrow-weekly',
  '0 4 * * 1',
  $$
    SELECT net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/process-roommate-escrow',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{"process_all": true}'::jsonb
    );
  $$
);

-- =====================
-- 4. Expired Guest Wallet Cleanup — Daily 2am UTC
-- =====================
-- Soft-cleanup: mark expired wallets so they're visible but non-functional

SELECT cron.schedule(
  'cleanup-expired-guest-wallets',
  '0 2 * * *',
  $$
    UPDATE guest_marks_wallets
    SET marks_balance = 0
    WHERE expires_at < now()
      AND converted_to_member_id IS NULL
      AND marks_balance > 0;
  $$
);
