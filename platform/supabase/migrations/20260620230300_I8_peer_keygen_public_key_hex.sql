-- I8_peer_keygen_public_key_hex.sql
-- BP089 -- Knight Marathon Session 2 -- 2026-06-20
-- Purpose: Add public_key_hex and private_key_hex_encrypted columns to peer_presence
--          (yoke references 'peers' table; §14 gadget confirms actual table is peer_presence)
-- Statute §15: Bishop applies. Knight ships only.
--
-- §14 GADGET RECEIPT:
--   Table queried: peer_presence (anon REST confirmed accessible; 'peers' returned 404)
--   peer_presence columns (from migration + REST): peer_id (PK), email_hash,
--     wan_soccerball_id, lan_addresses, relay_session_id, capabilities (JSONB),
--     last_seen_at, state, tier, version, circle_of_influence, reputation,
--     artifact_server_address
--
--   public_key_hex currently stored in capabilities JSONB for some peers.
--   Peers missing public_key_hex in capabilities JSONB:
--     - 88cbf6bdd6f74587 (version 0.5.12, gemma4:12b -- confirmed missing from capabilities JSON)
--   Peers WITH public_key_hex in capabilities (but not as dedicated column):
--     - d0b47bd08633385b (0.5.13)
--     - cb4ef450cc4a18c3 (0.5.13)
--     - 49f3e5971518a064 (0.5.13, qwen2.5:7b)
--
--   NOTE: Yoke referenced 'peers.id' and 'peers.peer_label' -- peer_presence uses
--         peer_id TEXT as PK, no peer_label column. peerKeyGen.ts adapted accordingly.

BEGIN;

ALTER TABLE peer_presence
  ADD COLUMN IF NOT EXISTS public_key_hex TEXT DEFAULT NULL;

ALTER TABLE peer_presence
  ADD COLUMN IF NOT EXISTS private_key_hex_encrypted TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_peer_presence_public_key_hex
  ON peer_presence (public_key_hex)
  WHERE public_key_hex IS NOT NULL;

COMMENT ON COLUMN peer_presence.public_key_hex IS
  'Ed25519 public key hex (DER SubjectPublicKeyInfo format). '
  'Populated by peerKeyGen.ts on first launch. '
  'Separate from capabilities JSONB for indexed query access.';

COMMENT ON COLUMN peer_presence.private_key_hex_encrypted IS
  'Ed25519 private key hex -- AES-256-GCM encrypted with device-local key. '
  'NEVER stored plaintext. NEVER logged. '
  'peerKeyGen.ts manages encryption/decryption via node:crypto.';

COMMIT;
