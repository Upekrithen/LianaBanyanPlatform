-- Session 140: LB Card Funding Compliance
-- Stripe Issuing requires Person A → Platform → Person B routing
-- with velocity controls and AML relationship tracking.

-- ─── Add compliance columns to lb_card_funding_schedules ───
ALTER TABLE lb_card_funding_schedules
  ADD COLUMN IF NOT EXISTS funding_relationship TEXT
    CHECK (funding_relationship IN ('employer','family','sponsor','self','guild','other'))
    NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS kyc_verified_funder BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS kyc_verified_recipient BOOLEAN DEFAULT false;

-- ─── Add compliance columns to lb_card_funding_transactions ───
ALTER TABLE lb_card_funding_transactions
  ADD COLUMN IF NOT EXISTS compliance_status TEXT
    CHECK (compliance_status IN ('clear','flagged','blocked','reviewed'))
    DEFAULT 'clear',
  ADD COLUMN IF NOT EXISTS daily_total_to_recipient NUMERIC,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- ─── Create funding_velocity_alerts table ───
CREATE TABLE IF NOT EXISTS funding_velocity_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES profiles(id),
  funder_id UUID NOT NULL REFERENCES profiles(id),
  alert_type TEXT NOT NULL
    CHECK (alert_type IN ('daily_5k_flag','daily_9500_block','pattern_flag')),
  daily_total NUMERIC NOT NULL,
  alert_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL
    CHECK (status IN ('open','reviewed','cleared','escalated'))
    DEFAULT 'open',
  reviewed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: admin/founder only
ALTER TABLE funding_velocity_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage velocity alerts"
  ON funding_velocity_alerts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Index for fast velocity lookups
CREATE INDEX IF NOT EXISTS idx_velocity_alerts_recipient_date
  ON funding_velocity_alerts (recipient_id, alert_date);

CREATE INDEX IF NOT EXISTS idx_funding_txn_compliance
  ON lb_card_funding_transactions (recipient_id, created_at)
  WHERE compliance_status != 'clear';
