-- BP077 Scope 11 — Credit-staking for outreach_letters (Pedestal 5K/20K mechanism)
-- Migration: 20260608000001_bp077_letter_credit_stakes.sql
-- Mirrors pedestal_contributions pattern for outreach letters.
-- Max 5,000 Credits per member per letter; 20,000 Credits + 4 funders = went public.

-- ── Table: outreach_letter_stakes ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "public"."outreach_letter_stakes" (
  "id"                uuid        DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "letter_id"         uuid        NOT NULL REFERENCES outreach_letters(letter_id) ON DELETE CASCADE,
  "member_id"         uuid        NOT NULL,
  "amount"            numeric(12,2) NOT NULL CHECK (amount > 0),
  "contribution_type" text        DEFAULT 'initial' NOT NULL
                                  CHECK (contribution_type IN ('initial', 'additional')),
  "member_total_after" numeric(12,2) NOT NULL
                                  CHECK (member_total_after <= 5000),
  "ledger_entry_id"   text        NOT NULL,
  "created_at"        timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS outreach_letter_stakes_letter_id_idx
  ON "public"."outreach_letter_stakes" (letter_id);

CREATE INDEX IF NOT EXISTS outreach_letter_stakes_member_id_idx
  ON "public"."outreach_letter_stakes" (member_id);

CREATE INDEX IF NOT EXISTS outreach_letter_stakes_letter_member_idx
  ON "public"."outreach_letter_stakes" (letter_id, member_id);

-- ── Add staking columns to outreach_letters ────────────────────────────────

ALTER TABLE "public"."outreach_letters"
  ADD COLUMN IF NOT EXISTS "credit_stake_total"           numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "credit_funder_count"          integer       NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "went_public_via_credits_at"   timestamptz;

-- ── RLS: append-only ledger, publicly readable ────────────────────────────

ALTER TABLE "public"."outreach_letter_stakes" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_stakes"
  ON "public"."outreach_letter_stakes"
  FOR SELECT
  USING (true);

CREATE POLICY "member_insert_stake"
  ON "public"."outreach_letter_stakes"
  FOR INSERT
  WITH CHECK (auth.uid() = member_id);

-- ── Atomic RPC: process_letter_stake_atomic ───────────────────────────────
-- Called from client-side; SECURITY DEFINER so it can bypass RLS for the
-- credit debit and letter-total update. search_path locked to public.

CREATE OR REPLACE FUNCTION process_letter_stake_atomic(
  p_letter_id     uuid,
  p_member_id     uuid,
  p_amount        numeric,
  p_ledger_entry_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member_total    numeric;
  v_letter_total    numeric;
  v_funder_count    integer;
  v_went_public     boolean := false;
  v_new_went_public timestamptz;
BEGIN
  -- Validate caller is acting for themselves
  IF auth.uid() != p_member_id THEN
    RAISE EXCEPTION 'Caller is not the member being staked for';
  END IF;

  -- Guard: amount must be positive
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Stake amount must be greater than 0';
  END IF;

  -- Check member total for this letter (for-update lock on member rows)
  SELECT COALESCE(SUM(amount), 0) INTO v_member_total
  FROM outreach_letter_stakes
  WHERE letter_id = p_letter_id AND member_id = p_member_id;

  IF v_member_total + p_amount > 5000 THEN
    RAISE EXCEPTION 'Exceeds per-person cap of 5,000 Credits (already staked: %, requested: %)',
      v_member_total, p_amount;
  END IF;

  -- Debit credits (errors if row missing or balance would go negative)
  UPDATE user_credits
  SET balance = balance - p_amount
  WHERE user_id = p_member_id
    AND balance >= p_amount;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient credits or credit account not found';
  END IF;

  -- Insert stake record
  INSERT INTO outreach_letter_stakes
    (letter_id, member_id, amount, contribution_type, member_total_after, ledger_entry_id)
  VALUES (
    p_letter_id,
    p_member_id,
    p_amount,
    CASE WHEN v_member_total = 0 THEN 'initial' ELSE 'additional' END,
    v_member_total + p_amount,
    p_ledger_entry_id
  );

  -- Update letter totals atomically; set went_public_via_credits_at on first crossing
  UPDATE outreach_letters
  SET
    credit_stake_total  = credit_stake_total + p_amount,
    credit_funder_count = (
      SELECT COUNT(DISTINCT member_id)
      FROM outreach_letter_stakes
      WHERE letter_id = p_letter_id
    ),
    went_public_via_credits_at = CASE
      WHEN went_public_via_credits_at IS NULL
        AND (credit_stake_total + p_amount) >= 20000
        AND (
          SELECT COUNT(DISTINCT member_id)
          FROM outreach_letter_stakes
          WHERE letter_id = p_letter_id
        ) >= 4
      THEN now()
      ELSE went_public_via_credits_at
    END,
    updated_at = now()
  WHERE letter_id = p_letter_id
  RETURNING credit_stake_total, credit_funder_count, went_public_via_credits_at
    INTO v_letter_total, v_funder_count, v_new_went_public;

  -- Determine if this stake triggered the public crossing
  IF v_new_went_public IS NOT NULL
     AND v_new_went_public >= (now() - interval '2 seconds')
  THEN
    v_went_public := true;
  END IF;

  RETURN jsonb_build_object(
    'success',             true,
    'member_total_after',  v_member_total + p_amount,
    'letter_total',        v_letter_total,
    'funder_count',        v_funder_count,
    'went_public',         v_went_public
  );
END;
$$;

-- Grant execute to authenticated users only
REVOKE EXECUTE ON FUNCTION process_letter_stake_atomic(uuid, uuid, numeric, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION process_letter_stake_atomic(uuid, uuid, numeric, text) TO authenticated;

-- ── Comment ────────────────────────────────────────────────────────────────
COMMENT ON TABLE "public"."outreach_letter_stakes" IS
  'BP077 — Credit-staking for outreach letters. Mirrors pedestal_contributions. '
  'Max 5,000 Credits per member per letter; 20,000 Credits + 4 funders = community elevation.';

COMMENT ON FUNCTION process_letter_stake_atomic(uuid, uuid, numeric, text) IS
  'BP077 — Atomic credit stake for an outreach letter. Debits user_credits, inserts stake record, '
  'updates letter totals, and sets went_public_via_credits_at on first threshold crossing.';
