-- bp071: DD-4 project_escrow_ledger + Stripe-native threshold-hold option
--
-- project_escrow_ledger already exists in baseline with core columns:
--   id, contribution_id, project_id, amount_cents (integer), status (held|released|returned|disputed),
--   deposited_at, released_at, released_to, verified_by, notes, created_at, updated_at
--
-- This migration adds the Stripe integration columns needed for DD-4.
--
-- ─────────────────────────────────────────────────────────────────────────────
-- TWO HOLD OPTIONS — Founder ratifies which to use:
--
--   Option A: Stripe Payment Intents with capture_method: manual
--     • Create PaymentIntent with capture_method='manual' → funds held on card
--     • stripe_payment_intent_id stores the PI id
--     • On release condition met → call PaymentIntents.capture(id)
--     • Uncaptured PIs expire after 7 days (or up to 90 with uncaptured_funds feature)
--     • Best for: short-term, single-funder holds
--
--   Option B: Stripe-native threshold accumulation
--     • Each funder contribution creates a Transfer into platform account
--     • stripe_payment_intent_id tracks individual funder PIs (already captured/paid in)
--     • threshold_cents stores the release target
--     • When SUM(amount_cents) WHERE project_id = X AND status = 'held' >= threshold_cents
--       → auto-release triggers (via process-escrow-auto-release edge function)
--     • threshold_met_at records when the threshold was crossed
--     • Best for: crowdfunded milestones, multi-funder accumulation
--
-- ⚠️ Founder ratifies which option (A: manual capture vs B: threshold accumulation)
-- ─────────────────────────────────────────────────────────────────────────────

-- Add Stripe and threshold columns to the existing table
ALTER TABLE public.project_escrow_ledger
  ADD COLUMN IF NOT EXISTS funder_entity_id UUID,
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'usd',
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_transfer_id TEXT,
  ADD COLUMN IF NOT EXISTS threshold_cents BIGINT,
  ADD COLUMN IF NOT EXISTS threshold_met_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS release_condition TEXT;

-- Widen amount_cents from integer to bigint for large-denomination safety
ALTER TABLE public.project_escrow_ledger
  ALTER COLUMN amount_cents TYPE BIGINT;

-- Add 'refunded' to the status check (existing constraint allows: held|released|returned|disputed)
ALTER TABLE public.project_escrow_ledger
  DROP CONSTRAINT IF EXISTS project_escrow_ledger_status_check;

ALTER TABLE public.project_escrow_ledger
  ADD CONSTRAINT project_escrow_ledger_status_check
    CHECK (status IN ('held', 'released', 'returned', 'refunded', 'disputed'));

-- Index for threshold queries (Option B)
CREATE INDEX IF NOT EXISTS idx_escrow_threshold
  ON public.project_escrow_ledger (project_id, status, amount_cents)
  WHERE threshold_cents IS NOT NULL;

-- Index for Stripe PI lookups (Option A + B)
CREATE INDEX IF NOT EXISTS idx_escrow_stripe_pi
  ON public.project_escrow_ledger (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

-- RLS: funder_entity_id-based read (supplements existing contribution_id and project_id policies)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'project_escrow_ledger' AND policyname = 'Funders read by entity_id'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Funders read by entity_id" ON public.project_escrow_ledger
        FOR SELECT USING (
          funder_entity_id IS NOT NULL
          AND funder_entity_id::text = auth.uid()::text
        )
    $policy$;
  END IF;
END;
$$;
