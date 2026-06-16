-- BP084 · SEG-2 · peer_presence table for NAT traversal via Supabase relay
-- =========================================================================
-- Each MnemosyneC node publishes its presence here every 60 s.
-- The relay reads presence to route WAN payloads cross-NAT.
-- Rows expire after 5 min of inactivity (TTL enforced by wan-relay-publish /
-- presence pruning on read).  A pg_cron job below hard-deletes stale rows.

CREATE TABLE IF NOT EXISTS peer_presence (
  peer_id           text PRIMARY KEY,
  email_hash        text,
  wan_soccerball_id text,
  lan_addresses     text[],
  relay_session_id  text,
  capabilities      jsonb,
  last_seen_at      timestamptz DEFAULT now()
);

-- Index for email-hash lookups (privacy boundary: email never stored, only hash)
CREATE INDEX IF NOT EXISTS peer_presence_email_hash_idx ON peer_presence (email_hash);

-- Index for wan_soccerball_id lookups
CREATE INDEX IF NOT EXISTS peer_presence_wan_soccerball_id_idx ON peer_presence (wan_soccerball_id);

-- TTL: delete rows not updated in the last 5 minutes
-- Requires pg_cron extension enabled in Supabase Dashboard → Database → Extensions
-- If pg_cron is not enabled, rows are pruned lazily on read in the edge functions.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    PERFORM cron.schedule(
      'peer_presence_ttl_prune',
      '* * * * *',
      $$DELETE FROM peer_presence WHERE last_seen_at < now() - interval '5 minutes'$$
    );
  END IF;
END;
$$;

-- ── Routed payloads table (wan-relay-route SEG-2) ───────────────────────────
-- Stores encrypted payloads in-flight; target long-polls for inbound.
-- Rows expire after 60 s (relay route TTL).

CREATE TABLE IF NOT EXISTS wan_relay_routed (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  target_peer_id text NOT NULL,
  payload_encrypted text NOT NULL,
  created_at    timestamptz DEFAULT now(),
  expires_at    timestamptz DEFAULT (now() + interval '60 seconds'),
  claimed       boolean DEFAULT false
);

CREATE INDEX IF NOT EXISTS wan_relay_routed_target_peer_id_idx
  ON wan_relay_routed (target_peer_id, claimed, expires_at);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    PERFORM cron.schedule(
      'wan_relay_routed_ttl_prune',
      '* * * * *',
      $$DELETE FROM wan_relay_routed WHERE expires_at < now()$$
    );
  END IF;
END;
$$;
