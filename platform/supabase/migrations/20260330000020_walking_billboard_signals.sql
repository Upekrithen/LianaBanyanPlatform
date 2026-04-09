-- Walking Billboard Signals — transaction-level merchant intelligence for Captains
-- Innovation #1975 Walking Billboard (Captain Scaling Architecture)
-- Tracks every LB Card swipe to build merchant heat maps for Captain outreach.

-- ── Table ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS walking_billboard_signals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cardholder_id   uuid NOT NULL REFERENCES lb_cardholders(id) ON DELETE CASCADE,
  card_id         uuid REFERENCES lb_cards(id) ON DELETE SET NULL,
  transaction_id  uuid REFERENCES lb_card_transactions(id) ON DELETE SET NULL,

  -- Merchant info (from webhook payload)
  merchant_name       text,
  merchant_category   text,       -- MCC code or Lithic category
  merchant_descriptor text,       -- raw descriptor string
  amount_cents        integer NOT NULL DEFAULT 0,

  -- Location (when available from provider)
  location_city       text,
  location_state      text,
  location_country    text DEFAULT 'US',
  location_zip        text,
  latitude            double precision,
  longitude           double precision,

  -- Walking Billboard scoring
  is_participating_merchant boolean NOT NULL DEFAULT false,
  signal_strength           integer NOT NULL DEFAULT 1
    CHECK (signal_strength BETWEEN 1 AND 10),

  -- Timestamps
  transacted_at   timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),

  -- Provider reference
  provider            text NOT NULL DEFAULT 'stripe',
  provider_event_id   text
);

-- Indexes for Captain dashboards and aggregation
CREATE INDEX IF NOT EXISTS idx_wbs_cardholder
  ON walking_billboard_signals(cardholder_id);
CREATE INDEX IF NOT EXISTS idx_wbs_merchant_name
  ON walking_billboard_signals(merchant_name);
CREATE INDEX IF NOT EXISTS idx_wbs_merchant_category
  ON walking_billboard_signals(merchant_category);
CREATE INDEX IF NOT EXISTS idx_wbs_transacted_at
  ON walking_billboard_signals(transacted_at DESC);
CREATE INDEX IF NOT EXISTS idx_wbs_participating
  ON walking_billboard_signals(is_participating_merchant)
  WHERE is_participating_merchant = true;
CREATE INDEX IF NOT EXISTS idx_wbs_location
  ON walking_billboard_signals(location_city, location_state)
  WHERE location_city IS NOT NULL;

-- ── Aggregated View for Captains ───────────────────────────────────

CREATE OR REPLACE VIEW walking_billboard_summary AS
SELECT
  merchant_name,
  merchant_category,
  location_city,
  location_state,
  COUNT(*)                                          AS total_transactions,
  COUNT(DISTINCT cardholder_id)                     AS unique_cardholders,
  SUM(amount_cents)                                 AS total_amount_cents,
  AVG(signal_strength)::numeric(3,1)                AS avg_signal_strength,
  bool_or(is_participating_merchant)                AS any_participating,
  MAX(transacted_at)                                AS last_transaction_at,
  -- Captain priority: high unique cardholders + high spend + not yet participating
  CASE
    WHEN bool_or(is_participating_merchant) THEN 0
    ELSE (COUNT(DISTINCT cardholder_id) * 10 + SUM(amount_cents) / 100)::integer
  END                                               AS captain_priority_score
FROM walking_billboard_signals
WHERE transacted_at >= now() - interval '90 days'
GROUP BY merchant_name, merchant_category, location_city, location_state;

-- ── RLS ────────────────────────────────────────────────────────────

ALTER TABLE walking_billboard_signals ENABLE ROW LEVEL SECURITY;

-- Cardholders can see their own signals
CREATE POLICY "Cardholders read own signals"
  ON walking_billboard_signals FOR SELECT
  USING (
    cardholder_id IN (
      SELECT id FROM lb_cardholders WHERE user_id = auth.uid()
    )
  );

-- Captains can read all signals in their territory (via user_roles)
CREATE POLICY "Captains read all signals"
  ON walking_billboard_signals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('captain', 'admin')
    )
  );

-- Only service role inserts (from webhook)
CREATE POLICY "Service role insert signals"
  ON walking_billboard_signals FOR INSERT
  WITH CHECK (
    auth.uid() IS NULL  -- service role calls have no auth.uid
  );

-- Admins can update (e.g., mark is_participating_merchant)
CREATE POLICY "Admins update signals"
  ON walking_billboard_signals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
  );
