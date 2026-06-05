-- BP073 Wave C — MoneyPenny Switchboard
-- Adds: moneypenny_inbound_calls, moneypenny_availability
-- ─────────────────────────────────────────────────────────

-- Inbound call log (Twilio Voice webhook sink)
CREATE TABLE IF NOT EXISTS moneypenny_inbound_calls (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_sid       TEXT UNIQUE,
  caller_phone   TEXT NOT NULL,
  caller_name    TEXT,
  direction      TEXT NOT NULL DEFAULT 'inbound',
  caller_class   TEXT NOT NULL DEFAULT 'general',  -- crown, press, investor, member, general
  priority_level INTEGER NOT NULL DEFAULT 5,        -- 0=crown, 1=press, 2=investor, 3=member, 5=general
  status         TEXT NOT NULL DEFAULT 'received',  -- received, held, callback_queued, resolved, missed
  hold_message   TEXT,
  callback_eta_hours INTEGER,
  sms_sent       BOOLEAN NOT NULL DEFAULT false,
  resolved_at    TIMESTAMPTZ,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE moneypenny_inbound_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_calls"
  ON moneypenny_inbound_calls
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Founder availability toggle (on/off for switchboard routing)
CREATE TABLE IF NOT EXISTS moneypenny_availability (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_available  BOOLEAN NOT NULL DEFAULT false,
  mode        TEXT NOT NULL DEFAULT 'auto',   -- 'available', 'unavailable', 'auto'
  note        TEXT,                            -- optional context ("In meetings until 3pm")
  set_by      TEXT NOT NULL DEFAULT 'system',
  valid_until TIMESTAMPTZ,                    -- null = indefinite
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE moneypenny_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_availability"
  ON moneypenny_availability
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Seed default availability row
INSERT INTO moneypenny_availability (is_available, mode, set_by, note)
VALUES (false, 'auto', 'system', 'Default: MoneyPenny holds all calls until Founder sets availability.')
ON CONFLICT DO NOTHING;

-- Index: latest availability lookup
CREATE INDEX IF NOT EXISTS idx_moneypenny_availability_created
  ON moneypenny_availability (created_at DESC);

-- Index: call queue (pending callbacks)
CREATE INDEX IF NOT EXISTS idx_moneypenny_calls_status
  ON moneypenny_inbound_calls (status, priority_level, created_at);
