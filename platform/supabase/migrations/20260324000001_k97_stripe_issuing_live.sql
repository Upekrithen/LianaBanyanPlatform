-- ============================================
-- K97: Stripe Issuing Go-Live
-- Adds provider-agnostic columns (future-proofing)
-- Enables lb_card_enabled feature flag
-- ============================================

-- Provider columns on lb_cardholders
ALTER TABLE lb_cardholders
  ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'stripe'
    CHECK (provider IN ('stripe', 'unit', 'lithic')),
  ADD COLUMN IF NOT EXISTS provider_cardholder_id TEXT,
  ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'approved'
    CHECK (kyc_status IN ('not_started', 'pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS provider_metadata JSONB DEFAULT '{}';

-- Backfill from existing stripe columns
UPDATE lb_cardholders
  SET provider_cardholder_id = stripe_cardholder_id, provider = 'stripe'
  WHERE stripe_cardholder_id IS NOT NULL AND provider_cardholder_id IS NULL;

-- Provider columns on lb_cards
ALTER TABLE lb_cards
  ADD COLUMN IF NOT EXISTS provider_card_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_metadata JSONB DEFAULT '{}';

UPDATE lb_cards
  SET provider_card_id = stripe_card_id
  WHERE stripe_card_id IS NOT NULL AND provider_card_id IS NULL;

-- Provider columns on lb_card_transactions
ALTER TABLE lb_card_transactions
  ADD COLUMN IF NOT EXISTS provider_authorization_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_metadata JSONB DEFAULT '{}';

UPDATE lb_card_transactions
  SET provider_authorization_id = stripe_authorization_id
  WHERE stripe_authorization_id IS NOT NULL AND provider_authorization_id IS NULL;

-- Provider columns on lb_card_funding
ALTER TABLE lb_card_funding
  ADD COLUMN IF NOT EXISTS provider_transfer_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_metadata JSONB DEFAULT '{}';

UPDATE lb_card_funding
  SET provider_transfer_id = stripe_transfer_id
  WHERE stripe_transfer_id IS NOT NULL AND provider_transfer_id IS NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cardholders_provider ON lb_cardholders(provider, provider_cardholder_id);
CREATE INDEX IF NOT EXISTS idx_cards_provider ON lb_cards(provider_card_id);

-- FLIP THE SWITCH
UPDATE founder_feature_flags
  SET is_enabled = true, enabled_at = NOW(),
      notes = 'LIVE — Stripe Issuing connected (K97)'
  WHERE feature_key = 'lb_card_enabled';

-- Set active provider
INSERT INTO founder_feature_flags (feature_key, is_enabled, enabled_at, notes)
VALUES ('lb_card_provider', true, NOW(), 'stripe')
ON CONFLICT (feature_key) DO UPDATE
  SET is_enabled = true, enabled_at = NOW(), notes = 'stripe';
