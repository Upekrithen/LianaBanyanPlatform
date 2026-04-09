-- K154 Task 2: Escrow mechanism for Credits-for-Marks exchange
-- Adds escrow_hold / escrow_release ledger categories + SQL functions for escrow lifecycle.

-- Step 1: Add escrow_hold and escrow_release to ledger_category constraint
ALTER TABLE transaction_ledger
  DROP CONSTRAINT IF EXISTS transaction_ledger_ledger_category_check;

ALTER TABLE transaction_ledger
  ADD CONSTRAINT transaction_ledger_ledger_category_check
  CHECK (ledger_category = ANY (ARRAY[
    'membership', 'commerce_storefront', 'commerce_creator', 'commerce_platform',
    'commerce_gleaners', 'project_funding', 'project_funder_credit', 'project_seeding',
    'project_platform_cap', 'project_escrow', 'guild_payment', 'coalition_fee',
    'housing_fund', 'subscription', 'card_funding', 'card_transaction',
    'connect_payout', 'connect_payout_fee',
    'escrow_hold', 'escrow_release', 'escrow_refund',
    'marks_payback'
  ]));

-- Step 2: Function to hold Credits in escrow when a sponsorship is committed
CREATE OR REPLACE FUNCTION hold_bounty_escrow(
  p_sponsorship_id UUID,
  p_sponsor_id UUID,
  p_amount_cents INTEGER,
  p_project_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ledger_id UUID;
BEGIN
  -- Insert hold transaction
  INSERT INTO transaction_ledger (
    ledger_category, amount_cents, currency, payer_id, project_id,
    status, description, metadata
  )
  VALUES (
    'escrow_hold', p_amount_cents, 'credits', p_sponsor_id, p_project_id,
    'held',
    'Credits held in escrow for bounty sponsorship',
    jsonb_build_object('sponsorship_id', p_sponsorship_id, 'action', 'hold')
  )
  RETURNING id INTO v_ledger_id;

  -- Update sponsorship status to escrowed
  UPDATE bounty_sponsorships
    SET status = 'escrowed'
    WHERE id = p_sponsorship_id AND sponsor_id = p_sponsor_id;

  -- Insert into project_escrow_ledger for tracking
  INSERT INTO project_escrow_ledger (
    contribution_id, project_id, amount_cents, status, deposited_at, notes
  )
  VALUES (
    v_ledger_id, COALESCE(p_project_id, p_sponsorship_id), p_amount_cents,
    'held', now(), 'Bounty sponsorship escrow hold'
  );

  RETURN v_ledger_id;
END;
$$;

-- Step 3: Function to release escrow on deliverable approval
CREATE OR REPLACE FUNCTION release_bounty_escrow(
  p_sponsorship_id UUID,
  p_recipient_id UUID,
  p_verifier_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sponsorship RECORD;
  v_ledger_id UUID;
  v_amount_cents INTEGER;
BEGIN
  SELECT * INTO v_sponsorship
    FROM bounty_sponsorships
    WHERE id = p_sponsorship_id AND status = 'escrowed';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sponsorship % not in escrow', p_sponsorship_id;
  END IF;

  v_amount_cents := (v_sponsorship.amount_credits * 100)::INTEGER;

  -- Insert release transaction
  INSERT INTO transaction_ledger (
    ledger_category, amount_cents, currency, payer_id, payee_id, project_id,
    status, description, metadata
  )
  VALUES (
    'escrow_release', v_amount_cents, 'credits',
    v_sponsorship.sponsor_id, p_recipient_id, v_sponsorship.project_id,
    'completed',
    'Escrow released — deliverable approved',
    jsonb_build_object('sponsorship_id', p_sponsorship_id, 'action', 'release')
  )
  RETURNING id INTO v_ledger_id;

  -- Update sponsorship
  UPDATE bounty_sponsorships
    SET status = 'released', completed_at = now()
    WHERE id = p_sponsorship_id;

  -- Update escrow ledger
  UPDATE project_escrow_ledger
    SET status = 'released', released_at = now(),
        released_to = p_recipient_id, verified_by = p_verifier_id
    WHERE contribution_id IN (
      SELECT id FROM transaction_ledger
        WHERE metadata->>'sponsorship_id' = p_sponsorship_id::text
        AND ledger_category = 'escrow_hold'
    );

  RETURN v_ledger_id;
END;
$$;

-- Step 4: Function to refund escrow on dispute/cancellation
CREATE OR REPLACE FUNCTION refund_bounty_escrow(
  p_sponsorship_id UUID,
  p_reason TEXT DEFAULT 'Dispute or cancellation'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sponsorship RECORD;
  v_ledger_id UUID;
  v_amount_cents INTEGER;
BEGIN
  SELECT * INTO v_sponsorship
    FROM bounty_sponsorships
    WHERE id = p_sponsorship_id AND status = 'escrowed';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sponsorship % not in escrow', p_sponsorship_id;
  END IF;

  v_amount_cents := (v_sponsorship.amount_credits * 100)::INTEGER;

  -- Insert refund transaction (Credits return to sender)
  INSERT INTO transaction_ledger (
    ledger_category, amount_cents, currency, payee_id, project_id,
    status, description, metadata
  )
  VALUES (
    'escrow_refund', v_amount_cents, 'credits',
    v_sponsorship.sponsor_id, v_sponsorship.project_id,
    'refunded',
    'Escrow refunded — ' || p_reason,
    jsonb_build_object('sponsorship_id', p_sponsorship_id, 'action', 'refund', 'reason', p_reason)
  )
  RETURNING id INTO v_ledger_id;

  -- Update sponsorship
  UPDATE bounty_sponsorships
    SET status = 'refunded', completed_at = now()
    WHERE id = p_sponsorship_id;

  -- Update escrow ledger
  UPDATE project_escrow_ledger
    SET status = 'refunded', released_at = now(),
        released_to = v_sponsorship.sponsor_id,
        notes = 'Refund: ' || p_reason
    WHERE contribution_id IN (
      SELECT id FROM transaction_ledger
        WHERE metadata->>'sponsorship_id' = p_sponsorship_id::text
        AND ledger_category = 'escrow_hold'
    );

  RETURN v_ledger_id;
END;
$$;

-- Grant execute to authenticated users (functions use SECURITY DEFINER)
GRANT EXECUTE ON FUNCTION hold_bounty_escrow TO authenticated;
GRANT EXECUTE ON FUNCTION release_bounty_escrow TO authenticated;
GRANT EXECUTE ON FUNCTION refund_bounty_escrow TO authenticated;
