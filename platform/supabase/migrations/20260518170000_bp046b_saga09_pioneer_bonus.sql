-- ============================================================================
-- SAGA 09 — Pioneer Bonus (Founder R10 RATIFIED)
-- Migration: 20260518170000_bp046b_saga09_pioneer_bonus.sql
-- BP046B W1 NOVACULA · 2026-05-18
-- ============================================================================
-- Extends Code Breakers Corps canon (BP022 / 20260503170000) with:
--   - New ip_stamp_class value: code_breakers_pioneer_first_model_test
--   - gauntlet_pioneer_registry table (permanent attribution per SAGA 09 spec)
--   - pioneer_bonus_ledger table (multiplier record per run)
--
-- Pioneer Bonus multiplier tier table (Founder R10 RATIFIED):
--   1st tester  → 3×   · Named in community Banyan Metric registry · permanent
--   2nd tester  → 2×   · Named · Co-validator tier
--   3rd tester  → 1.5× · Named · Verifier tier
--   4th-10th    → 1.2× · Early-adopter tag · cohort listing
--   11th+       → 1×   · Standard Gauntlet run payout
--
-- Edge cases:
--   - Model version bumps = NEW model = NEW Pioneer slot
--   - Founder self-tests = Conductor-Class registry separate (no Pioneer marks)
--   - Min quality verification gate must pass (prevents gaming per BP022)
--
-- *** FOUNDER FIRE PENDING ***
-- ============================================================================

BEGIN;

-- ── Extend ip_stamp_class enum ────────────────────────────────────────────────
-- ALTER TYPE ... ADD VALUE is idempotent in PG 14+ only if we check first.
-- Use DO block for safety.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'public.ip_stamp_class'::regtype
      AND enumlabel = 'code_breakers_pioneer_first_model_test'
  ) THEN
    ALTER TYPE public.ip_stamp_class ADD VALUE 'code_breakers_pioneer_first_model_test';
  END IF;
EXCEPTION WHEN undefined_object THEN
  -- ip_stamp_class enum does not exist yet (prior migration not applied)
  -- Safe to skip; prior migration will create it, then this will add the value
  NULL;
END $$;

-- ── Gauntlet Pioneer Registry (permanent attribution) ─────────────────────────

CREATE TABLE IF NOT EXISTS public.gauntlet_pioneer_registry (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_key            text NOT NULL,          -- canonical model key e.g. "claude-opus-4-7" or "gpt-5.3"
  model_display_name   text NOT NULL,          -- display string "Claude Opus 4.7"
  model_version_tag    text NOT NULL DEFAULT '',  -- version tag; bump = new Pioneer slot
  pioneer_position     integer NOT NULL,       -- 1st, 2nd, 3rd, 4th-10th, 11th+
  marks_multiplier     numeric(5,3) NOT NULL,  -- 3.0, 2.0, 1.5, 1.2, 1.0
  pioneer_tier_label   text NOT NULL,          -- "Named · First tested by…" etc.
  member_id            uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_stamp_id          uuid,                   -- FK to ip_ledger_stamp after stamp fires
  gauntlet_run_id      text NOT NULL DEFAULT '',  -- local run UUID from Gauntlet scaffold
  banyan_metric_score  numeric(10,4),          -- BM score from the pioneering run
  registered_at        timestamptz NOT NULL DEFAULT now(),
  is_founder_class     boolean NOT NULL DEFAULT false,  -- Conductor-Class self-test (no marks)
  quality_gate_passed  boolean NOT NULL DEFAULT false,  -- min quality verification gate
  metadata             jsonb NOT NULL DEFAULT '{}'::jsonb
);

COMMENT ON TABLE public.gauntlet_pioneer_registry IS
  'SAGA 09 BP046B (Founder R10 RATIFIED) — Gauntlet Pioneer Registry. '
  'Permanent attribution table. Every first-N test of a model version is recorded here. '
  'Pioneer position determines marks multiplier. Model version bump = NEW Pioneer slot. '
  'Founder self-tests recorded with is_founder_class=true; no marks credited. '
  'Append-only: no UPDATE/DELETE (cryptographic peer-witness real).';

-- Composite unique constraint: one row per (model_key, model_version_tag, pioneer_position)
-- Allows up to N pioneers per model/version, tracked by position.
-- We do NOT unique-constrain on member+model: same member could pioneer different model versions.
CREATE UNIQUE INDEX IF NOT EXISTS idx_pioneer_model_version_position
  ON public.gauntlet_pioneer_registry(model_key, model_version_tag, pioneer_position);

-- FK to ip_ledger_stamp (nullable; set after stamp fires)
-- Added as separate ALTER to handle the case where ip_ledger_stamp may not exist yet
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ip_ledger_stamp') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'fk_pioneer_ip_stamp'
        AND table_name = 'gauntlet_pioneer_registry'
    ) THEN
      ALTER TABLE public.gauntlet_pioneer_registry
        ADD CONSTRAINT fk_pioneer_ip_stamp
        FOREIGN KEY (ip_stamp_id) REFERENCES public.ip_ledger_stamp(id);
    END IF;
  END IF;
END $$;

-- ── Pioneer Bonus Ledger (multiplier record per Gauntlet run) ─────────────────

CREATE TABLE IF NOT EXISTS public.pioneer_bonus_ledger (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id            uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pioneer_registry_id  uuid REFERENCES public.gauntlet_pioneer_registry(id),
  model_key            text NOT NULL,
  model_display_name   text NOT NULL,
  pioneer_position     integer NOT NULL,
  marks_multiplier     numeric(5,3) NOT NULL,
  base_marks           numeric(18,6) NOT NULL DEFAULT 0,
  bonus_marks          numeric(18,6) NOT NULL DEFAULT 0,  -- base × (multiplier - 1)
  total_marks          numeric(18,6) NOT NULL DEFAULT 0,  -- base × multiplier
  credited_at          timestamptz NOT NULL DEFAULT now(),
  gauntlet_run_id      text NOT NULL DEFAULT '',
  metadata             jsonb NOT NULL DEFAULT '{}'::jsonb
);

COMMENT ON TABLE public.pioneer_bonus_ledger IS
  'SAGA 09 BP046B — Pioneer Bonus Ledger. Records marks multiplier events per Gauntlet run. '
  'bonus_marks = base × (multiplier − 1). total_marks = base × multiplier. '
  'Composes with Code Breakers Corps cumulative_marks_earned (BP022).';

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_pioneer_reg_member ON public.gauntlet_pioneer_registry(member_id);
CREATE INDEX IF NOT EXISTS idx_pioneer_reg_model ON public.gauntlet_pioneer_registry(model_key, model_version_tag);
CREATE INDEX IF NOT EXISTS idx_pioneer_bonus_member ON public.pioneer_bonus_ledger(member_id);
CREATE INDEX IF NOT EXISTS idx_pioneer_bonus_model ON public.pioneer_bonus_ledger(model_key);

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE public.gauntlet_pioneer_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pioneer_bonus_ledger ENABLE ROW LEVEL SECURITY;

-- Pioneer Registry: public read (permanent attribution = public per spec)
CREATE POLICY "pioneer_reg_public_read"
  ON public.gauntlet_pioneer_registry FOR SELECT
  USING (true);

-- Insert only via service-role (Gauntlet backend validates quality gate)
-- Direct member insert blocked; quality_gate_passed must be verified server-side.
-- (service-role bypasses RLS; member-facing Gauntlet flow routes via Edge Function)

-- Pioneer Bonus Ledger: member sees own rows; public cannot read (marks are private)
CREATE POLICY "pioneer_bonus_member_read"
  ON public.pioneer_bonus_ledger FOR SELECT
  USING (member_id = auth.uid());

-- ── View: pioneer_leaderboard (community-facing attribution surface) ───────────

CREATE OR REPLACE VIEW public.pioneer_leaderboard AS
  SELECT
    r.model_display_name,
    r.model_key,
    r.model_version_tag,
    r.pioneer_position,
    r.marks_multiplier,
    r.pioneer_tier_label,
    r.registered_at::date AS pioneer_date,
    r.banyan_metric_score,
    -- Omit member_id from public view; member can verify own attribution via ip_stamp_id
    r.ip_stamp_id
  FROM public.gauntlet_pioneer_registry r
  WHERE r.quality_gate_passed = true
    AND r.is_founder_class = false
  ORDER BY r.model_key, r.model_version_tag, r.pioneer_position;

COMMENT ON VIEW public.pioneer_leaderboard IS
  'SAGA 09 — Public Pioneer Leaderboard. Omits member_id (privacy); '
  'member verifies own attribution via ip_stamp_id cross-reference to IP Ledger. '
  'Founder-class rows excluded (is_founder_class=true).';

-- ── Helper function: get_pioneer_position ─────────────────────────────────────
-- Returns (position, multiplier) for next Pioneer slot for a given model+version.
-- Position 1 = first → 3×; 2 = second → 2×; 3 = third → 1.5×; 4-10 → 1.2×; 11+ → 1×

CREATE OR REPLACE FUNCTION public.get_pioneer_position(
  p_model_key text,
  p_model_version_tag text DEFAULT ''
)
RETURNS TABLE (
  next_position integer,
  marks_multiplier numeric(5,3),
  tier_label text
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COALESCE(MAX(pioneer_position), 0) + 1 AS next_position,
    CASE COALESCE(MAX(pioneer_position), 0) + 1
      WHEN 1 THEN 3.000::numeric(5,3)
      WHEN 2 THEN 2.000::numeric(5,3)
      WHEN 3 THEN 1.500::numeric(5,3)
      ELSE CASE
        WHEN COALESCE(MAX(pioneer_position), 0) + 1 <= 10 THEN 1.200::numeric(5,3)
        ELSE 1.000::numeric(5,3)
      END
    END AS marks_multiplier,
    CASE COALESCE(MAX(pioneer_position), 0) + 1
      WHEN 1 THEN 'First tested · Named · Permanent attribution · Pioneer #1'
      WHEN 2 THEN 'Co-validator · Named · Pioneer #2'
      WHEN 3 THEN 'Verifier · Named · Pioneer #3'
      ELSE CASE
        WHEN COALESCE(MAX(pioneer_position), 0) + 1 <= 10 THEN 'Early-adopter · cohort listing'
        ELSE 'Standard Gauntlet run'
      END
    END AS tier_label
  FROM public.gauntlet_pioneer_registry
  WHERE model_key = p_model_key
    AND model_version_tag = p_model_version_tag
    AND quality_gate_passed = true;
$$;

COMMENT ON FUNCTION public.get_pioneer_position IS
  'SAGA 09 — Returns next available Pioneer position + multiplier for a model+version. '
  'Call before Stage 3+ Gauntlet run to display Pioneer Bonus opportunity to member.';

COMMIT;
