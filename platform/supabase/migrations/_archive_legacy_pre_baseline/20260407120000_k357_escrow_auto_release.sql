-- ============================================================================
-- K357: 72-Hour Escrow Auto-Release
-- Creates auto_release_escrow() SQL function, escrow_disputes table,
-- pg_cron schedule (every 6h), and notification on release.
-- ============================================================================

-- =====================
-- 1. Escrow Disputes Table
-- =====================
CREATE TABLE IF NOT EXISTS escrow_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id UUID NOT NULL,
  disputant_id UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  resolution_notes TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_escrow_disputes_escrow ON escrow_disputes (escrow_id);
CREATE INDEX IF NOT EXISTS idx_escrow_disputes_status ON escrow_disputes (status);
CREATE INDEX IF NOT EXISTS idx_escrow_disputes_disputant ON escrow_disputes (disputant_id);

ALTER TABLE escrow_disputes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ed_disputant_create' AND tablename = 'escrow_disputes') THEN
    CREATE POLICY ed_disputant_create ON escrow_disputes
      FOR INSERT WITH CHECK (disputant_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ed_disputant_read_own' AND tablename = 'escrow_disputes') THEN
    CREATE POLICY ed_disputant_read_own ON escrow_disputes
      FOR SELECT USING (disputant_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ed_admin_manage' AND tablename = 'escrow_disputes') THEN
    CREATE POLICY ed_admin_manage ON escrow_disputes
      FOR ALL USING (public.is_admin());
  END IF;
END $$;


-- =====================
-- 2. auto_release_escrow() — SECURITY DEFINER
-- Releases held escrow entries older than 72 hours with no open disputes.
-- Inserts notification for project owner on each release.
-- =====================
CREATE OR REPLACE FUNCTION auto_release_escrow()
RETURNS TABLE(escrow_id UUID, project_id UUID, amount_cents INTEGER, action TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH releasable AS (
    SELECT pel.id, pel.project_id, pel.amount_cents, pel.contribution_id,
           p.owner_id AS project_owner, p.title AS project_title
    FROM project_escrow_ledger pel
    JOIN projects p ON p.id = pel.project_id
    WHERE pel.status = 'held'
      AND pel.deposited_at < now() - interval '72 hours'
      AND NOT EXISTS (
        SELECT 1 FROM escrow_disputes ed
        WHERE ed.escrow_id = pel.id AND ed.status = 'open'
      )
  ),
  released AS (
    UPDATE project_escrow_ledger pel
    SET status = 'released',
        released_at = now(),
        released_to = r.project_owner,
        notes = COALESCE(notes, '') || ' | Auto-released after 72h (no dispute)'
    FROM releasable r
    WHERE pel.id = r.id
    RETURNING pel.id AS eid, r.project_id, r.amount_cents, r.project_owner, r.project_title
  ),
  notified AS (
    INSERT INTO notifications (user_id, type, title, body, metadata)
    SELECT
      released.project_owner,
      'escrow_released',
      'Funds Released',
      'Escrow for ' || COALESCE(released.project_title, 'your project') || ' auto-released after 72 hours',
      jsonb_build_object(
        'project_id', released.project_id,
        'amount_cents', released.amount_cents,
        'escrow_id', released.eid
      )
    FROM released
    RETURNING (metadata->>'escrow_id')::UUID AS eid
  )
  SELECT released.eid AS escrow_id,
         released.project_id,
         released.amount_cents,
         'auto_released'::TEXT AS action
  FROM released;
END;
$$;


-- =====================
-- 3. force_release_escrow() — admin manual release
-- =====================
CREATE OR REPLACE FUNCTION force_release_escrow(p_escrow_id UUID, p_admin_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_owner UUID;
  v_project_title TEXT;
  v_amount INTEGER;
  v_project UUID;
BEGIN
  SELECT p.owner_id, p.title, pel.amount_cents, pel.project_id
  INTO v_owner, v_project_title, v_amount, v_project
  FROM project_escrow_ledger pel
  JOIN projects p ON p.id = pel.project_id
  WHERE pel.id = p_escrow_id AND pel.status = 'held';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Escrow % not found or not held', p_escrow_id;
  END IF;

  UPDATE project_escrow_ledger
  SET status = 'released',
      released_at = now(),
      released_to = v_owner,
      notes = COALESCE(notes, '') || ' | Force-released by admin ' || p_admin_id::TEXT
  WHERE id = p_escrow_id;

  INSERT INTO notifications (user_id, type, title, body, metadata)
  VALUES (
    v_owner, 'escrow_released', 'Funds Released',
    'Escrow for ' || COALESCE(v_project_title, 'your project') || ' was manually released by admin',
    jsonb_build_object('project_id', v_project, 'amount_cents', v_amount, 'escrow_id', p_escrow_id)
  );
END;
$$;


-- =====================
-- 4. pg_cron: Every 6 hours
-- =====================
SELECT cron.schedule(
  'escrow-auto-release-6h',
  '0 */6 * * *',
  $$
    SELECT net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/process-escrow-auto-release',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{"process_all": true}'::jsonb
    );
  $$
);
