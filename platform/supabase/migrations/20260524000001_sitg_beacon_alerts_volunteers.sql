-- ============================================================================
-- NOVACULI SAGA-s · Stand in the Gap — Such-a-Time-as-This™
-- Atlas Edge-of-Abyss Beacon Schema
-- Migration: 20260524000001_sitg_beacon_alerts_volunteers.sql
-- Founder-ratified BP053 · volunteer-only RLS · human-to-human only
-- ============================================================================
-- Schema adjustments from spec:
--   FK targets auth.users(id) (platform convention; no public.members table)
--   gen_random_uuid() used (builtin PG14+; uuid-ossp in extensions schema only)
-- ============================================================================

BEGIN;

-- ── sitg_beacon_alerts ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.sitg_beacon_alerts (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signal_type  text        NOT NULL CHECK (signal_type IN ('edge_of_abyss', 'seeking_connection', 'need_anchor')),
  signal_text  text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL DEFAULT (now() + interval '72 hours'),
  resolved_at  timestamptz,
  resolved_by  uuid        REFERENCES auth.users(id),
  is_active    boolean     NOT NULL DEFAULT true
);

COMMENT ON TABLE public.sitg_beacon_alerts IS
  'SAGA-s BP053 (Founder-ratified) — Atlas Edge-of-Abyss Beacon. '
  'Member signals critical crossroads; trained volunteers respond. '
  'NEVER automated — human-to-human only. AI surfaces signal; humans respond. '
  'Beacons auto-expire 72h; resolved by volunteer UPDATE on resolved_by.';

CREATE INDEX IF NOT EXISTS idx_sitg_beacon_member   ON public.sitg_beacon_alerts(member_id);
CREATE INDEX IF NOT EXISTS idx_sitg_beacon_active    ON public.sitg_beacon_alerts(is_active, expires_at)
  WHERE is_active = true;

-- ── sitg_volunteers ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.sitg_volunteers (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id           uuid        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  certified_at        timestamptz NOT NULL,
  active              boolean     NOT NULL DEFAULT true,
  capacity            integer     NOT NULL DEFAULT 3,
  response_radius_km  integer
);

COMMENT ON TABLE public.sitg_volunteers IS
  'SAGA-s BP053 (Founder-ratified) — Certified Such-a-Time-as-This™ volunteers. '
  'capacity = max concurrent open cases. response_radius_km is geographic preference (opt-in). '
  'Volunteers receive Supabase Realtime notifications on new beacon_alerts.';

CREATE INDEX IF NOT EXISTS idx_sitg_volunteers_active ON public.sitg_volunteers(active)
  WHERE active = true;

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE public.sitg_beacon_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sitg_volunteers     ENABLE ROW LEVEL SECURITY;

-- Beacon alerts: member sees own; active volunteers see all active alerts
CREATE POLICY "sitg_beacon_member_sees_own"
  ON public.sitg_beacon_alerts FOR SELECT
  USING (
    auth.uid() = member_id
    OR auth.uid() IN (SELECT member_id FROM public.sitg_volunteers WHERE active = true)
  );

-- Any authenticated member can signal (INSERT own row)
CREATE POLICY "sitg_beacon_member_inserts_own"
  ON public.sitg_beacon_alerts FOR INSERT
  WITH CHECK (auth.uid() = member_id);

-- Member can withdraw own beacon; volunteer can resolve (set resolved_by)
CREATE POLICY "sitg_beacon_member_or_volunteer_updates"
  ON public.sitg_beacon_alerts FOR UPDATE
  USING (
    auth.uid() = member_id
    OR auth.uid() IN (SELECT member_id FROM public.sitg_volunteers WHERE active = true)
  );

-- Volunteers see only their own record
CREATE POLICY "sitg_volunteer_sees_own"
  ON public.sitg_volunteers FOR SELECT
  USING (auth.uid() = member_id);

-- Volunteer management via service-role only (certification process is server-side)
CREATE POLICY "sitg_service_role_manages_volunteers"
  ON public.sitg_volunteers FOR ALL
  USING (auth.role() = 'service_role');

COMMIT;
