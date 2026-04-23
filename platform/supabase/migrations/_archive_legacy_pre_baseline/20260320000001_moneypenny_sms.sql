-- ============================================================================
-- Moneypenny SMS Gateway — Tables & RLS
-- Innovation #1754: AI executive assistant via text message
-- ============================================================================

-- Outbound SMS queue (other Edge Functions insert here, moneypenny-sms processes)
CREATE TABLE IF NOT EXISTS public.moneypenny_sms_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  recipient_phone TEXT NOT NULL,
  message_body TEXT NOT NULL,
  priority INT NOT NULL DEFAULT 3,
  source TEXT NOT NULL DEFAULT 'manual',
  source_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  twilio_sid TEXT,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

-- Full conversation log (inbound + outbound audit trail)
CREATE TABLE IF NOT EXISTS public.moneypenny_sms_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  direction TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  message_body TEXT NOT NULL,
  twilio_sid TEXT,
  claude_request_id TEXT,
  tokens_used INT,
  response_time_ms INT
);

-- Scheduled briefing templates (Phase 3)
CREATE TABLE IF NOT EXISTS public.moneypenny_sms_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  schedule_name TEXT NOT NULL,
  cron_expression TEXT,
  template TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE moneypenny_sms_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE moneypenny_sms_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE moneypenny_sms_schedules ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
DO $$ BEGIN
  CREATE POLICY "Admin SMS queue access" ON moneypenny_sms_queue
    FOR ALL USING (
      auth.jwt() ->> 'email' IN ('upekrithen@gmail.com', 'support@lianabanyan.com')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admin SMS log access" ON moneypenny_sms_log
    FOR ALL USING (
      auth.jwt() ->> 'email' IN ('upekrithen@gmail.com', 'support@lianabanyan.com')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admin SMS schedule access" ON moneypenny_sms_schedules
    FOR ALL USING (
      auth.jwt() ->> 'email' IN ('upekrithen@gmail.com', 'support@lianabanyan.com')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Service role bypass (Edge Functions use service role key)
DO $$ BEGIN
  CREATE POLICY "Service role SMS queue bypass" ON moneypenny_sms_queue
    FOR ALL USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role SMS log bypass" ON moneypenny_sms_log
    FOR ALL USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role SMS schedule bypass" ON moneypenny_sms_schedules
    FOR ALL USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sms_queue_pending
  ON moneypenny_sms_queue (status, priority, created_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_sms_log_direction
  ON moneypenny_sms_log (direction, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sms_log_phone
  ON moneypenny_sms_log (phone_number, created_at DESC);

-- Seed default schedule templates (inactive until Phase 3)
INSERT INTO moneypenny_sms_schedules (schedule_name, cron_expression, template, is_active)
VALUES
  ('morning_briefing', '0 6 * * *',
   'Good morning. {{pending_actions}} actions pending. {{inbox_count}} inbox items. {{deploy_status}}. Reply with questions.',
   false),
  ('evening_recap', '0 21 * * *',
   'Evening recap: {{completed_today}} tasks completed. {{new_innovations}} innovations added. Next deploy: {{next_deploy}}. Sleep well.',
   false),
  ('deploy_alert', NULL,
   '{{agent_name}} Session {{session_number}} deployed. Commit {{commit_hash}}. {{summary}}',
   true)
ON CONFLICT DO NOTHING;
