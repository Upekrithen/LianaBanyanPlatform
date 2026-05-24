-- ============================================================================
-- NOVACULI SAGA-w · Stand in the Gap — Steady™
-- No-shame relapse-aware recovery tracking
-- Migration: 20260524000004_steady_recovery_log.sql
-- Founder-ratified BP053 · member-sovereign · no aggregate access
-- ============================================================================
-- Schema adjustments from spec:
--   FK targets auth.users(id) (platform convention; no public.members table)
--   gen_random_uuid() used (builtin PG14+)
--   IF NOT EXISTS guard added for idempotency
-- ============================================================================
-- UX PRINCIPLES (binding per SAGA-w spec):
--   No streak counters that reset to zero
--   Relapse = data point, NOT failure — "Logged. This is data. You're still here."
--   Longitudinal view: whole recovery arc, not current streak
--   PRIVATE by default — relapse events NEVER federated
--   note_encrypted = client-side encrypted; platform NEVER reads plaintext
-- ============================================================================

BEGIN;

-- ── steady_recovery_log ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.steady_recovery_log (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date        date        NOT NULL,
  event_type      text        NOT NULL CHECK (event_type IN ('clean', 'relapse', 'milestone')),
  note_encrypted  text,
  cycle_number    integer     NOT NULL DEFAULT 1,
  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.steady_recovery_log IS
  'SAGA-w BP053 (Founder-ratified) — Steady™ no-shame relapse-aware recovery log. '
  'Relapse = data point (not failure). Longitudinal arc view; no shame-inducing streak counters. '
  'note_encrypted: client-side encrypted — platform NEVER reads plaintext note content. '
  'cycle_number: tracks recovery cycles (relapse increments cycle; streak does not reset to zero in UI). '
  'PRIVATE by default: no aggregate access, no community reads, no federation of relapse events.';

CREATE INDEX IF NOT EXISTS idx_steady_recovery_member
  ON public.steady_recovery_log(member_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_steady_recovery_cycle
  ON public.steady_recovery_log(member_id, cycle_number);

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE public.steady_recovery_log ENABLE ROW LEVEL SECURITY;

-- Strictly member-sovereign: ONLY the member manages their own recovery log
-- No aggregate access. No community reads. No volunteer reads.
CREATE POLICY "steady_recovery_member_manages_own"
  ON public.steady_recovery_log FOR ALL
  USING (auth.uid() = member_id);

-- Service role NOT granted broad access — recovery data is member-sovereign only.
-- Platform analytics: aggregate patterns on opt-in milestones only (via application logic,
-- never via direct DB policy grant to service_role on this table).

COMMIT;
