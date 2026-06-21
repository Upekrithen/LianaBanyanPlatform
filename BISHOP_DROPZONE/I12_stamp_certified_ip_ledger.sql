-- I12_stamp_certified_ip_ledger.sql
-- BP089 -- Knight Marathon Session 2 -- 2026-06-20
-- §16 ARCHITECTURAL HARD CANON BP087
-- Statute §15: Bishop applies. Knight ships only.
-- Canon: Stamp-Certified IP Ledger -- Ring Bearer -- local-first -- mesh Merkle-diff
--
-- §14 GADGET RECEIPT:
--   ip_ledger table EXISTS in production with DIFFERENT schema:
--     columns: id, sequence_number, previous_hash, record_hash, record_type, record_data,
--              medallion_id, recorded_at, verified_by, verification_hash, user_id
--   This schema is the original "Nervous System Initialization" ledger (Feb 2026).
--   CREATE TABLE IF NOT EXISTS will be a no-op for ip_ledger.
--
--   BISHOP ACTION REQUIRED before apply:
--     Option A: Rename existing table: ALTER TABLE ip_ledger RENAME TO ip_ledger_legacy;
--               Then this migration creates the new ip_ledger with the §16 schema.
--     Option B: Create as ip_ledger_v2 (safe, non-destructive).
--   Recommend Option A -- flag to Founder if uncertain.
--
--   ip_ledger_merkle_diff does NOT exist -- will be created fresh.
--   stamp tables: NONE found matching '%stamp%' pattern.

BEGIN;

-- If Bishop chose Option A above (renamed existing to ip_ledger_legacy),
-- this CREATE TABLE creates the new §16 schema ip_ledger.
-- If Bishop chose Option B, change table name to ip_ledger_v2 throughout.

CREATE TABLE IF NOT EXISTS ip_ledger (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ring_bearer_id  UUID NOT NULL,
  entry_type      TEXT NOT NULL,
  payload_hash    TEXT NOT NULL,
  payload_json    JSONB NOT NULL,
  ed25519_sig     TEXT,
  stamp_seq       BIGINT NOT NULL DEFAULT 0,
  stamped_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  merkle_node     TEXT,
  replicated_at   TIMESTAMPTZ,
  CONSTRAINT ip_ledger_ring_seq UNIQUE (ring_bearer_id, stamp_seq)
);

CREATE TABLE IF NOT EXISTS ip_ledger_merkle_diff (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_peer_id  UUID NOT NULL,
  target_peer_id  UUID NOT NULL,
  root_hash       TEXT NOT NULL,
  diff_payload    JSONB NOT NULL,
  transmitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acked_at        TIMESTAMPTZ
);

ALTER TABLE ip_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_ledger_merkle_diff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ip_ledger_anon_select" ON ip_ledger FOR SELECT TO anon USING (true);
CREATE POLICY "ip_ledger_anon_insert" ON ip_ledger FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "ip_ledger_service_role_all" ON ip_ledger FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "ip_ledger_merkle_diff_anon_select" ON ip_ledger_merkle_diff FOR SELECT TO anon USING (true);
CREATE POLICY "ip_ledger_merkle_diff_anon_insert" ON ip_ledger_merkle_diff FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "ip_ledger_merkle_diff_service_role_all" ON ip_ledger_merkle_diff FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS ip_ledger_ring_bearer_idx ON ip_ledger (ring_bearer_id, stamped_at DESC);
CREATE INDEX IF NOT EXISTS ip_ledger_unreplicated_idx ON ip_ledger (stamped_at DESC) WHERE replicated_at IS NULL;

COMMIT;
