-- BP065 · Tier-2 Onboarding · Part A (SEG-A2a)
-- mnemosyne_device_links: links a Mnemosyne Electron install (peer_id) to a LB account (user_id)
-- RLS enabled + own-row policies in same migration (§4 discipline)
-- Authored: 2026-05-30T21:30:00Z · Knight BP065

SET search_path = public, pg_catalog;

CREATE TABLE IF NOT EXISTS mnemosyne_device_links (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  peer_id          text NOT NULL,
  device_label     text,
  platform         text NOT NULL DEFAULT 'mnemosyne',
  app_version      text,
  linked_at        timestamptz NOT NULL DEFAULT now(),
  last_seen_at     timestamptz NOT NULL DEFAULT now(),
  revoked_at       timestamptz,
  UNIQUE(user_id, peer_id)
);

-- RLS
ALTER TABLE mnemosyne_device_links ENABLE ROW LEVEL SECURITY;

-- Own-row read
CREATE POLICY "mnemosyne_device_links_own_read"
  ON mnemosyne_device_links
  FOR SELECT
  USING (user_id = auth.uid());

-- Own-row insert
CREATE POLICY "mnemosyne_device_links_own_insert"
  ON mnemosyne_device_links
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Own-row update
CREATE POLICY "mnemosyne_device_links_own_update"
  ON mnemosyne_device_links
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Index for lookups by user
CREATE INDEX IF NOT EXISTS mnemosyne_device_links_user_id_idx
  ON mnemosyne_device_links(user_id);

COMMENT ON TABLE mnemosyne_device_links IS
  'BP065 Tier-2 · Links a Mnemosyne device (peer_id) to a Liana Banyan account. One row per device per user.';
