-- KN-H8 / BP017 — Bounty Marks Payout Integration with FORK Doctrine Compliance
-- =================================================================================
-- Creates bounty_payout_ledger (append-only; Year of Jubilee semantics per B127 #2308).
-- Wires payout to: profiles.current_marks_balance + backed_marks_ledger (source: bounty_payout).
-- FORK doctrine compliance:
--   - process_bounty_marks_payout is Marks-class only.
--   - cash_out_bounty_marks_to_fiat DOES NOT EXIST (structural absence, not policy-disabled).
-- Membership-orthogonal: $5/year unchanged; bounty payouts are LB-currency-class.
--
-- Composes with:
--   KN-H6 migration 20260502180000_knh6_bounty_posters_tier_class.sql
--   KN-H7 migration 20260502190000_knh7_bounty_receipts_validation_log.sql
--   KN105 excalibur_share_back_ledger (append-only payout precedent)
--
-- Pod-H Bounty Poster #3 of 3 — Pod-H COMPLETE (KN-H1 through KN-H8).

-- ─── 1. Extend backed_marks_ledger to accept 'bounty_payout' source ─────────────
-- Drop the old source check constraint (does not lock rows — DDL only).
ALTER TABLE public.backed_marks_ledger
  DROP CONSTRAINT IF EXISTS backed_marks_ledger_source_check;

ALTER TABLE public.backed_marks_ledger
  ADD CONSTRAINT backed_marks_ledger_source_check
  CHECK (source = ANY (ARRAY[
    'saa_allocation',
    'backing_spent',
    'backing_refund',
    'surplus_distribution',
    'bounty_payout'
  ]));

-- ─── 2. bounty_payout_ledger ──────────────────────────────────────────────────
-- Append-only — no UPDATE or DELETE by authenticated users (BRIDLE Rule 4 integrity).
-- Year of Jubilee semantics per project_year_of_jubilee_ledger_architecture.md B127 #2308:
--   all payouts are immutable audit entries; history is permanent.

CREATE TABLE IF NOT EXISTS public.bounty_payout_ledger (
  -- Identity
  id                        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_at                 timestamptz NOT NULL DEFAULT now(),

  -- Participant
  member_id                 uuid        NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,

  -- Bounty Poster + Receipt references
  bounty_id                 uuid        NOT NULL,
  receipt_id                uuid        NOT NULL REFERENCES public.bounty_receipts_validation_log(id)
                              ON DELETE RESTRICT,

  -- Tier
  tier_class                public.tier_bounty_class NOT NULL,

  -- Payout computation (full audit trail per Year of Jubilee semantics)
  standard_rate             integer     NOT NULL CHECK (standard_rate > 0),
  tier_multiplier           numeric(4,2) NOT NULL CHECK (tier_multiplier IN (1.00, 1.25, 1.50, 2.00)),
  completion_quality_factor numeric(4,2) NOT NULL CHECK (completion_quality_factor >= 0.50 AND completion_quality_factor <= 1.00),
  marks_earned              integer     NOT NULL CHECK (marks_earned >= 0),

  -- Timestamps from upstream receipt
  validation_pass_at        timestamptz NOT NULL,

  -- FORK doctrine attestation (structural form: bounty Marks payout is Marks-class only)
  -- cash_out_bounty_marks_to_fiat does NOT exist in this system.
  fork_compliant            boolean     NOT NULL DEFAULT true
                              CHECK (fork_compliant = true),  -- Always true by structural form

  -- Membership-orthogonal: $5/year is access-gate; bounty payouts are LB-currency-class.
  membership_orthogonal     boolean     NOT NULL DEFAULT true
                              CHECK (membership_orthogonal = true),

  -- Provenance
  payout_version            text        NOT NULL DEFAULT 'KN-H8-v1.0',
  canon_reference           text        NOT NULL DEFAULT 'BP017-Three-Tier-Bounty-Poster-Addendum'
);

COMMENT ON TABLE public.bounty_payout_ledger IS
  'KN-H8 / BP017 — Append-only Marks payout ledger for Bounty empirical-receipt completions. '
  'Year of Jubilee semantics: no mutations, no deletions. Full payout computation audit trail. '
  'FORK doctrine: fork_compliant=true enforced by CHECK constraint; cash_out_bounty_marks_to_fiat '
  'does not exist in codebase. Membership-orthogonal: $5/year is access-gate; this is LB-currency-class.';

COMMENT ON COLUMN public.bounty_payout_ledger.tier_multiplier IS
  'Tier multiplier per Three-Tier canon: Tier A=1.0, Tier B=1.25, Tier C=1.5, Cross-tier=2.0.';

COMMENT ON COLUMN public.bounty_payout_ledger.completion_quality_factor IS
  'BRIDLE Rule 4 quality factor (0.5–1.0) derived from validator margin. '
  'Bare pass (margin < 0.5pp): capped at 0.70. Solid pass (margin >= 10pp): 1.0. '
  'Scales linearly between: 0.5<=m<1: 0.75, 1<=m<5: 0.80, 5<=m<10: 0.90.';

COMMENT ON COLUMN public.bounty_payout_ledger.marks_earned IS
  'Final Marks awarded: floor(standard_rate × tier_multiplier × completion_quality_factor). '
  'Minimum 0 (though a passing receipt will always produce > 0 with standard_rate=100).';

COMMENT ON COLUMN public.bounty_payout_ledger.fork_compliant IS
  'FORK doctrine attestation. Always true: Marks-class payout only. '
  'cash_out_bounty_marks_to_fiat is structurally absent from codebase (not policy-disabled).';

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_bounty_payout_member
  ON public.bounty_payout_ledger (member_id, payout_at DESC);

CREATE INDEX IF NOT EXISTS idx_bounty_payout_receipt
  ON public.bounty_payout_ledger (receipt_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bounty_payout_receipt_unique
  ON public.bounty_payout_ledger (receipt_id);  -- One payout per receipt (idempotency guard)

CREATE INDEX IF NOT EXISTS idx_bounty_payout_tier_class
  ON public.bounty_payout_ledger (tier_class, payout_at DESC);

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE public.bounty_payout_ledger ENABLE ROW LEVEL SECURITY;

-- Members can view their own payout history
CREATE POLICY "bounty_payout_own_read"
  ON public.bounty_payout_ledger
  FOR SELECT
  TO authenticated
  USING (member_id = auth.uid());

-- No INSERT/UPDATE/DELETE for authenticated users — service_role only
-- (payout is system-mediated via process_bounty_marks_payout function)
CREATE POLICY "bounty_payout_service_full"
  ON public.bounty_payout_ledger
  FOR ALL
  USING (auth.role() = 'service_role');

-- ─── 3. process_bounty_marks_payout PL/pgSQL function ────────────────────────
-- Atomic payout:
--   a. Verify receipt: pass=true, requires_founder_review=false, not already paid
--   b. Compute marks_earned = floor(standard_rate × multiplier × quality_factor)
--   c. INSERT into bounty_payout_ledger
--   d. UPDATE profiles.current_marks_balance += marks_earned
--   e. INSERT into backed_marks_ledger (direction: credit, source: bounty_payout)
--   f. UPDATE bounty_receipts_validation_log marks_payout_status='paid'
--   Returns the payout ledger row as JSON.

CREATE OR REPLACE FUNCTION public.process_bounty_marks_payout(
  p_receipt_id   uuid,
  p_member_id    uuid,
  p_standard_rate integer DEFAULT 100
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_receipt       public.bounty_receipts_validation_log%ROWTYPE;
  v_multiplier    numeric(4,2);
  v_quality       numeric(4,2);
  v_marks_earned  integer;
  v_payout_id     uuid;
  v_result        jsonb;
BEGIN
  -- ── Gate: fetch and lock the receipt row ──────────────────────────────────
  SELECT * INTO v_receipt
  FROM public.bounty_receipts_validation_log
  WHERE id = p_receipt_id
  FOR UPDATE;  -- Row-level lock: prevents concurrent double-payout

  IF NOT FOUND THEN
    RAISE EXCEPTION 'process_bounty_marks_payout: receipt % not found.', p_receipt_id;
  END IF;

  -- ── Gate: submitter matches member ────────────────────────────────────────
  IF v_receipt.submitted_by IS DISTINCT FROM p_member_id THEN
    RAISE EXCEPTION
      'process_bounty_marks_payout: member % does not match receipt submitted_by %.',
      p_member_id, v_receipt.submitted_by;
  END IF;

  -- ── Gate: FORK compliance — only PASS receipts receive payout ─────────────
  IF NOT v_receipt.pass THEN
    RAISE EXCEPTION
      'process_bounty_marks_payout: receipt % FAILED validation. FORK doctrine: no payout on FAIL.',
      p_receipt_id;
  END IF;

  -- ── Gate: Founder review must be clear (no unresolved flags) ──────────────
  IF v_receipt.requires_founder_review AND
     (v_receipt.founder_review_status IS NULL OR v_receipt.founder_review_status <> 'approved') THEN
    RAISE EXCEPTION
      'process_bounty_marks_payout: receipt % requires Founder review (status: %). '
      'BRIDLE Rule 4: payout blocked until Founder approves.',
      p_receipt_id,
      COALESCE(v_receipt.founder_review_status, 'pending');
  END IF;

  -- ── Gate: idempotency — do not pay twice ──────────────────────────────────
  IF v_receipt.marks_payout_status = 'paid' THEN
    RAISE EXCEPTION
      'process_bounty_marks_payout: receipt % has already been paid (idempotency guard).',
      p_receipt_id;
  END IF;

  -- ── Compute tier multiplier ───────────────────────────────────────────────
  v_multiplier := CASE v_receipt.bounty_class::text
    WHEN 'tier_a_floor_verification'  THEN 1.00
    WHEN 'tier_b_uplift_verification' THEN 1.25
    WHEN 'tier_c_founder_replication' THEN 1.50
    WHEN 'cross_tier_comparison'      THEN 2.00
    ELSE NULL
  END;

  IF v_multiplier IS NULL THEN
    RAISE EXCEPTION
      'process_bounty_marks_payout: unknown tier_class % on receipt %.',
      v_receipt.bounty_class, p_receipt_id;
  END IF;

  -- ── Compute completion_quality_factor from margin (BRIDLE Rule 4 Phase B5) ─
  -- margin = lift_pp - 30 (positive = above threshold; negative = failing).
  -- Bare pass (margin < 0.5pp): capped at 0.70 (anti-bare-pass-payout).
  -- Solid passes scale up to 1.0.
  v_quality := CASE
    WHEN v_receipt.margin >= 10  THEN 1.00
    WHEN v_receipt.margin >= 5   THEN 0.90
    WHEN v_receipt.margin >= 1   THEN 0.80
    WHEN v_receipt.margin >= 0.5 THEN 0.75
    ELSE 0.70  -- bare pass: 0 < margin < 0.5 — BRIDLE Rule 4 cap
  END;

  -- ── Compute marks_earned (floor to integer) ───────────────────────────────
  v_marks_earned := FLOOR(p_standard_rate::numeric * v_multiplier * v_quality)::integer;

  IF v_marks_earned <= 0 THEN
    RAISE EXCEPTION
      'process_bounty_marks_payout: computed marks_earned=% is non-positive for receipt %. '
      'standard_rate=%, multiplier=%, quality=%. Verify inputs.',
      v_marks_earned, p_receipt_id, p_standard_rate, v_multiplier, v_quality;
  END IF;

  -- ── a. INSERT bounty_payout_ledger ─────────────────────────────────────────
  INSERT INTO public.bounty_payout_ledger (
    member_id, bounty_id, receipt_id, tier_class,
    standard_rate, tier_multiplier, completion_quality_factor, marks_earned,
    validation_pass_at, fork_compliant, membership_orthogonal
  ) VALUES (
    p_member_id, v_receipt.bounty_id, p_receipt_id, v_receipt.bounty_class,
    p_standard_rate, v_multiplier, v_quality, v_marks_earned,
    v_receipt.validated_at, true, true
  )
  RETURNING id INTO v_payout_id;

  -- ── b. UPDATE profiles.current_marks_balance (one-way ratchet: only earn()) ─
  UPDATE public.profiles
  SET current_marks_balance = current_marks_balance + v_marks_earned
  WHERE id = p_member_id;

  IF NOT FOUND THEN
    -- Profile may not exist yet — insert a minimal row (graceful degradation)
    INSERT INTO public.profiles (id, current_marks_balance)
    VALUES (p_member_id, v_marks_earned)
    ON CONFLICT (id) DO UPDATE
      SET current_marks_balance = profiles.current_marks_balance + EXCLUDED.current_marks_balance;
  END IF;

  -- ── c. INSERT backed_marks_ledger (full audit: source=bounty_payout) ────────
  INSERT INTO public.backed_marks_ledger (user_id, amount, direction, source)
  VALUES (p_member_id, v_marks_earned, 'credit', 'bounty_payout');

  -- ── d. UPDATE bounty_receipts_validation_log marks_payout_status ─────────
  UPDATE public.bounty_receipts_validation_log
  SET
    marks_payout_status = 'paid',
    marks_payout_at     = now()
  WHERE id = p_receipt_id;

  -- ── Build return JSON ─────────────────────────────────────────────────────
  v_result := jsonb_build_object(
    'ok',                       true,
    'payout_id',                v_payout_id,
    'receipt_id',               p_receipt_id,
    'member_id',                p_member_id,
    'bounty_id',                v_receipt.bounty_id,
    'tier_class',               v_receipt.bounty_class,
    'standard_rate',            p_standard_rate,
    'tier_multiplier',          v_multiplier,
    'completion_quality_factor',v_quality,
    'marks_earned',             v_marks_earned,
    'validation_pass_at',       v_receipt.validated_at,
    'payout_at',                now(),
    'fork_compliant',           true,
    'membership_orthogonal',    true,
    'payout_version',           'KN-H8-v1.0',
    'canon_reference',          'BP017-Three-Tier-Bounty-Poster-Addendum'
  );

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.process_bounty_marks_payout IS
  'KN-H8 / BP017 — Atomic Bounty Marks payout. FORK-compliant: payout is Marks-class only. '
  'SECURITY DEFINER: executes as owner for cross-table atomicity. '
  'Gates: pass=true, Founder review clear, not already paid. '
  'Tier multipliers: A=1.0×, B=1.25×, C=1.5×, Cross=2.0×. '
  'BRIDLE Rule 4: bare pass (margin<0.5) quality_factor capped at 0.70. '
  'Updates: bounty_payout_ledger + profiles.current_marks_balance + backed_marks_ledger.';

-- ─── 4. Grant execute to service_role ─────────────────────────────────────────
GRANT EXECUTE ON FUNCTION public.process_bounty_marks_payout TO service_role;
