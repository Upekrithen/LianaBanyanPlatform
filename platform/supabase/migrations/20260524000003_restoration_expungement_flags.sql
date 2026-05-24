-- ============================================================================
-- NOVACULI SAGA-v · Stand in the Gap — Restoration™
-- Expungement-aware Mnemosyne™ capture gating
-- Migration: 20260524000003_restoration_expungement_flags.sql
-- Founder-ratified BP053 · the ONE Library-of-Congress deletion exception
-- ============================================================================
-- Schema adjustments from spec:
--   FK targets auth.users(id) (platform convention; no public.members table)
--   gen_random_uuid() used (builtin PG14+)
-- ============================================================================
-- NOTE: This is the ONE case where platform deletion IS appropriate.
-- If a member's criminal record is expunged (legally erased), any Eblets
-- referencing that record MUST be flagged and may be deleted at member request.
-- Never federate expungement-flagged Eblets to any peer.
-- ============================================================================

BEGIN;

-- ── restoration_expungement_flags ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.restoration_expungement_flags (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id           uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flagged_at          timestamptz NOT NULL DEFAULT now(),
  expungement_date    date        NOT NULL,
  affected_eblet_ids  uuid[]      NOT NULL DEFAULT '{}',
  status              text        NOT NULL DEFAULT 'pending_review'
                        CHECK (status IN ('pending_review', 'cleared', 'deleted'))
);

COMMENT ON TABLE public.restoration_expungement_flags IS
  'SAGA-v BP053 (Founder-ratified) — Restoration™ expungement-aware capture gating. '
  'When a member''s criminal record is legally expunged, Mnemosyne™ must not preserve '
  'data about that record. affected_eblet_ids = Eblets flagged for member review. '
  'status: pending_review → cleared (member reviewed, safe to retain) '
  '              or deleted (member requested deletion per legal expungement). '
  'NEVER federate expungement-flagged Eblets to any peer. '
  'This is the ONE Library-of-Congress deletion exception.';

CREATE INDEX IF NOT EXISTS idx_restoration_expungement_member
  ON public.restoration_expungement_flags(member_id);
CREATE INDEX IF NOT EXISTS idx_restoration_expungement_status
  ON public.restoration_expungement_flags(status)
  WHERE status = 'pending_review';

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE public.restoration_expungement_flags ENABLE ROW LEVEL SECURITY;

-- Strictly member-sovereign: member manages their own expungement flags only
CREATE POLICY "restoration_expungement_member_manages_own"
  ON public.restoration_expungement_flags FOR ALL
  USING (auth.uid() = member_id);

-- Service role can manage for legal compliance workflows
CREATE POLICY "restoration_expungement_service_role_manages"
  ON public.restoration_expungement_flags FOR ALL
  USING (auth.role() = 'service_role');

COMMIT;
