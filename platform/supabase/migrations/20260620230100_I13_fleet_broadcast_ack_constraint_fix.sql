-- I13_fleet_broadcast_ack_constraint_fix.sql
-- BP089 -- Knight Marathon Session 2 -- 2026-06-20
-- Purpose: Remove/relax overly-tight unique constraint on fleet_broadcast_ack
--          so duplicate acks are idempotent rather than rejected (Coffee §4 fix)
-- Statute §15: Bishop applies this file. Knight ships only.
--
-- §14 GADGET RECEIPT:
--   Constraint inspected via migration source: 20260618000009_mic_fleet_broadcast_tables.sql
--   Constraint name: fleet_broadcast_ack_broadcast_id_peer_id_key
--   (PostgreSQL auto-naming for UNIQUE(broadcast_id, peer_id) in CREATE TABLE)
--   Columns confirmed: id, created_at, broadcast_id, peer_id, app_version, ack_type, result_json
--   NOTE: No 'status' column exists. Yoke spec said WHERE status = 'ack'.
--         Partial index uses ack_type = 'completed' (terminal state) instead.
--         Bishop confirm before apply.

BEGIN;

-- Step 1: Drop the offending unique constraint
ALTER TABLE fleet_broadcast_ack
  DROP CONSTRAINT IF EXISTS fleet_broadcast_ack_broadcast_id_peer_id_key;

-- Step 2: Partial unique index -- unique on (broadcast_id, peer_id) only when ack_type = 'completed'
-- (Yoke specified WHERE status = 'ack' but table has ack_type not status -- using ack_type = 'completed')
CREATE UNIQUE INDEX IF NOT EXISTS fleet_broadcast_ack_idempotent_idx
  ON fleet_broadcast_ack (broadcast_id, peer_id)
  WHERE ack_type = 'completed';

COMMIT;
