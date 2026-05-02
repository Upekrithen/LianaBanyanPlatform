-- KN-H7 / BP017 — Bounty Empirical-Receipt Validator: Audit Log
-- ================================================================
-- Creates bounty_receipts_validation_log table for persisting all
-- validate_bounty_receipt MCP tool results as an immutable audit trail.
--
-- Design:
--   - Append-only: no UPDATE or DELETE on log rows (BRIDLE Rule 4 integrity)
--   - Founder review queue: requires_founder_review=true rows surface for manual approval
--   - Composes with bounty_posters table (KN-H6 migration 20260502180000)
--   - KN-H8 Marks payout integration gated on pass=true + requires_founder_review=false
--
-- RLS policy:
--   - SELECT: authenticated (own submissions) or service_role
--   - INSERT: authenticated (submit own receipts)
--   - No UPDATE / DELETE (append-only audit log)

-- ─── Tier Bounty class enum (mirrors TypeScript TierBountyClass) ──────────────
-- Already created in KN-H6 migration if it exists; guard with DO block.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'tier_bounty_class'
  ) THEN
    CREATE TYPE public.tier_bounty_class AS ENUM (
      'tier_a_floor_verification',
      'tier_b_uplift_verification',
      'tier_c_founder_replication',
      'cross_tier_comparison'
    );
  END IF;
END $$;

-- ─── bounty_receipts_validation_log ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.bounty_receipts_validation_log (
  -- Primary identity
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  validated_at            timestamptz NOT NULL DEFAULT now(),

  -- Bounty Poster reference
  bounty_id               uuid        NOT NULL,
  bounty_class            public.tier_bounty_class NOT NULL,

  -- Submitter
  submitted_by            uuid        REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Validation outcome
  pass                    boolean     NOT NULL,
  -- Numeric margin: lift_pp - 30 (primary threshold). Positive = above. Negative = failing.
  margin                  numeric(6,2) NOT NULL,

  -- JSONB arrays of failure + warning objects
  failures                jsonb       NOT NULL DEFAULT '[]'::jsonb,
  warnings                jsonb       NOT NULL DEFAULT '[]'::jsonb,

  -- Review routing
  requires_founder_review boolean     NOT NULL DEFAULT false,
  bridle_rule_4_applied   boolean     NOT NULL DEFAULT false,

  -- The full submitted receipt (for audit; no PII beyond what the submitter provided)
  receipt_json            jsonb       NOT NULL DEFAULT '{}'::jsonb,

  -- Founder review status (written by Founder or service_role, not submitter)
  founder_review_status   text        CHECK (founder_review_status IN ('pending', 'approved', 'rejected'))
                          DEFAULT NULL,
  founder_reviewed_at     timestamptz DEFAULT NULL,
  founder_review_note     text        DEFAULT NULL,

  -- KN-H8 Marks payout gating (written by payout integration, not submitter)
  marks_payout_status     text        CHECK (marks_payout_status IN ('pending', 'queued', 'paid', 'blocked'))
                          DEFAULT NULL,
  marks_payout_at         timestamptz DEFAULT NULL,

  -- Metadata
  validator_version       text        NOT NULL DEFAULT 'KN-H7-v1.0',
  canon_reference         text        NOT NULL DEFAULT 'BP017-Three-Tier-Bounty-Poster-Addendum'
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

-- Founder review queue: surface all rows requiring review that haven't been reviewed
CREATE INDEX IF NOT EXISTS idx_bounty_receipts_review_queue
  ON public.bounty_receipts_validation_log (requires_founder_review, founder_review_status)
  WHERE requires_founder_review = true AND founder_review_status IS NULL;

-- KN-H8 payout queue: passing receipts not yet paid
CREATE INDEX IF NOT EXISTS idx_bounty_receipts_payout_queue
  ON public.bounty_receipts_validation_log (pass, requires_founder_review, marks_payout_status)
  WHERE pass = true AND requires_founder_review = false AND marks_payout_status = 'pending';

-- Lookup by bounty_id (e.g. "has this Bounty Poster been validated before?")
CREATE INDEX IF NOT EXISTS idx_bounty_receipts_bounty_id
  ON public.bounty_receipts_validation_log (bounty_id);

-- Lookup by submitter
CREATE INDEX IF NOT EXISTS idx_bounty_receipts_submitted_by
  ON public.bounty_receipts_validation_log (submitted_by);

-- Lookup by class + pass status (e.g. "all passing Tier A receipts")
CREATE INDEX IF NOT EXISTS idx_bounty_receipts_class_pass
  ON public.bounty_receipts_validation_log (bounty_class, pass);

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE public.bounty_receipts_validation_log ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view their own validation results
CREATE POLICY "select_own_validations"
  ON public.bounty_receipts_validation_log
  FOR SELECT
  TO authenticated
  USING (submitted_by = auth.uid());

-- Authenticated users can insert their own validation results
-- (the validate_bounty_receipt MCP tool inserts on behalf of the caller)
CREATE POLICY "insert_own_validations"
  ON public.bounty_receipts_validation_log
  FOR INSERT
  TO authenticated
  WITH CHECK (submitted_by = auth.uid());

-- No UPDATE/DELETE for authenticated users — append-only audit log
-- service_role can UPDATE founder_review_status and marks_payout_status

-- ─── Comments ────────────────────────────────────────────────────────────────

COMMENT ON TABLE public.bounty_receipts_validation_log IS
  'KN-H7 / BP017 — Immutable audit log for all Bounty empirical-receipt validations. '
  'Append-only: no user-level UPDATE or DELETE. Founder review queue: '
  'requires_founder_review=true rows surface for manual approval. '
  'KN-H8 Marks payout integration gated on pass=true + requires_founder_review=false.';

COMMENT ON COLUMN public.bounty_receipts_validation_log.margin IS
  'Numeric margin relative to primary threshold (lift_pp - 30). '
  'Positive = above threshold. Negative = below threshold (failing). '
  'For cross-tier: min(tier_a_lift, tier_b_lift, tier_c_lift) - 30.';

COMMENT ON COLUMN public.bounty_receipts_validation_log.failures IS
  'JSONB array of FailureDetail objects: {field, criterion, actual?, expected?, bridle_rule?}. '
  'Empty array [] means all criteria passed.';

COMMENT ON COLUMN public.bounty_receipts_validation_log.warnings IS
  'JSONB array of WarningDetail objects: {code, message, requires_founder_review}. '
  'suspicious_inflation: lift_pp > 60pp (>20% above K477/K481/K499 50pp ceiling). '
  'borderline_velocity: Tier B velocity 1.5-2x (below 2x threshold, BRIDLE Rule 4 applied).';

COMMENT ON COLUMN public.bounty_receipts_validation_log.founder_review_status IS
  'Founder review decision for flagged receipts. '
  'pending: needs review. approved: Founder approved despite warning. rejected: rejected.';

COMMENT ON COLUMN public.bounty_receipts_validation_log.marks_payout_status IS
  'KN-H8 Marks payout lifecycle. '
  'pending: awaiting payout. queued: in payout queue. paid: payout complete. blocked: blocked.';
