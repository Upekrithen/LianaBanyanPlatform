-- I9_hiring_directors_schema.sql
-- BP089 -- Knight Marathon Session 2 -- 2026-06-20
-- §14 GADGET RECEIPT (Branch B):
--   hiring_directors table EXISTS (via migration 20260618000002_hiring_directors_node_operator.sql)
--   Existing columns: id, user_id, project_count, hired_user_count, node_operator_status,
--                     created_at, last_updated
--   MISSING columns required by yoke: peer_id, status, ratified_at
--   Action: ALTER TABLE to add missing columns (Branch B additive migration)
--   Table is NOT missing; only columns are absent.
-- Statute §15: Bishop applies. Knight ships only.

BEGIN;

ALTER TABLE public.hiring_directors
  ADD COLUMN IF NOT EXISTS peer_id TEXT DEFAULT NULL;

ALTER TABLE public.hiring_directors
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'suspended', 'pending', 'ratified'));

ALTER TABLE public.hiring_directors
  ADD COLUMN IF NOT EXISTS ratified_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_hiring_directors_peer_id
  ON public.hiring_directors (peer_id)
  WHERE peer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_hiring_directors_status
  ON public.hiring_directors (status);

COMMENT ON COLUMN public.hiring_directors.peer_id IS
  'Optional: MnemosyneC peer_id of the hiring director node. '
  'Links hiring director role to a specific substrate peer.';

COMMENT ON COLUMN public.hiring_directors.status IS
  'Hiring director lifecycle status: active, suspended, pending, ratified.';

COMMENT ON COLUMN public.hiring_directors.ratified_at IS
  'Timestamp of Founder ratification of this hiring director entry.';

COMMIT;
