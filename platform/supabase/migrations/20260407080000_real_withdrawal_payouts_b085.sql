-- ═══════════════════════════════════════════════════════════════════
-- B085: Wire real Stripe Connect payouts for credit withdrawals
-- Adds connect account reference + real transfer tracking to
-- credit_withdrawals so process-withdrawal can send real money.
-- Also enables connect_payouts_enabled feature flag.
-- ═══════════════════════════════════════════════════════════════════

-- 1. Add stripe_transfer_id for real Stripe transfer references
ALTER TABLE public.credit_withdrawals
  ADD COLUMN IF NOT EXISTS stripe_transfer_id TEXT;

-- 2. Add connect_account_id FK so we know which Connect account was used
ALTER TABLE public.credit_withdrawals
  ADD COLUMN IF NOT EXISTS connect_account_id UUID REFERENCES public.member_connect_accounts(id);

-- 3. Add payout_method if not already present (may exist from earlier migration)
ALTER TABLE public.credit_withdrawals
  ADD COLUMN IF NOT EXISTS payout_method TEXT DEFAULT 'connect';

-- 4. Index for looking up withdrawals by connect account
CREATE INDEX IF NOT EXISTS idx_credit_withdrawals_connect
  ON public.credit_withdrawals(connect_account_id)
  WHERE connect_account_id IS NOT NULL;

-- 5. Index for stripe_transfer_id lookups (webhook reconciliation)
CREATE INDEX IF NOT EXISTS idx_credit_withdrawals_stripe_transfer
  ON public.credit_withdrawals(stripe_transfer_id)
  WHERE stripe_transfer_id IS NOT NULL;

-- 6. Enable Connect payouts feature flag
UPDATE public.founder_feature_flags
SET is_enabled = true,
    enabled_at = NOW(),
    notes = 'B085: Enabled for real Stripe Connect payouts to member bank/debit cards'
WHERE feature_key = 'connect_payouts_enabled';

-- Insert if somehow missing
INSERT INTO public.founder_feature_flags (feature_key, is_enabled, enabled_at, notes)
VALUES ('connect_payouts_enabled', true, NOW(), 'B085: Enabled for real Stripe Connect payouts to member bank/debit cards')
ON CONFLICT (feature_key) DO NOTHING;
