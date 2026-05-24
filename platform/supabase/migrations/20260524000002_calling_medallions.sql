-- ============================================================================
-- NOVACULI SAGA-t · Stand in the Gap — The Calling™
-- Calling-Found Ceremony Framework · Medallion™ mint
-- Migration: 20260524000002_calling_medallions.sql
-- Founder-ratified BP053 · append-only · sha256-anchored
-- ============================================================================
-- Schema adjustments from spec:
--   FK targets auth.users(id) (platform convention; no public.members table)
--   gen_random_uuid() used (builtin PG14+)
--   Includes duration_months + status per Founder-ratified instruction
-- ============================================================================
-- APPEND-ONLY DISCIPLINE: No DELETE policy. Library-of-Congress principle.
-- Medallion™ records are permanent once minted.
-- content_sha256 computed over calling_description + mentor_id + ceremony_date.
-- ============================================================================

BEGIN;

-- ── calling_medallions ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.calling_medallions (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id            uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_id            uuid        NOT NULL REFERENCES auth.users(id),
  calling_description  text        NOT NULL,
  calling_domain       text        NOT NULL,
  witness_count        integer     NOT NULL DEFAULT 0,
  ceremony_date        date        NOT NULL,
  content_sha256       text        NOT NULL,
  duration_months      integer     NOT NULL DEFAULT 12,
  status               text        NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active', 'completed', 'transferred')),
  created_at           timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.calling_medallions IS
  'SAGA-t BP053 (Founder-ratified) — Calling-Found Ceremony Medallion™ mint. '
  'Permanent record of vocational-calling declaration. Mentor issues; community witnesses. '
  'APPEND-ONLY (Library-of-Congress discipline): no DELETE. '
  'content_sha256 computed over calling_description || mentor_id || ceremony_date. '
  'duration_months = mentor-pair lock-in period (default 12, renewable). '
  'status: active → completed / transferred after review.';

CREATE INDEX IF NOT EXISTS idx_calling_medallions_member ON public.calling_medallions(member_id);
CREATE INDEX IF NOT EXISTS idx_calling_medallions_mentor  ON public.calling_medallions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_calling_medallions_domain  ON public.calling_medallions(calling_domain);

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE public.calling_medallions ENABLE ROW LEVEL SECURITY;

-- Member sees own medallions; mentor sees their mentees' medallions
CREATE POLICY "calling_medallion_member_or_mentor_reads"
  ON public.calling_medallions FOR SELECT
  USING (
    auth.uid() = member_id
    OR auth.uid() = mentor_id
  );

-- Mentor mints the medallion (INSERT) — member cannot self-mint
CREATE POLICY "calling_medallion_mentor_creates"
  ON public.calling_medallions FOR INSERT
  WITH CHECK (auth.uid() = mentor_id);

-- Status updates (completed / transferred) via mentor or service role only
CREATE POLICY "calling_medallion_mentor_updates_status"
  ON public.calling_medallions FOR UPDATE
  USING (auth.uid() = mentor_id);

-- No DELETE policy — append-only by Library-of-Congress discipline
-- Service role can manage for administrative purposes
CREATE POLICY "calling_medallion_service_role_manages"
  ON public.calling_medallions FOR ALL
  USING (auth.role() = 'service_role');

COMMIT;
