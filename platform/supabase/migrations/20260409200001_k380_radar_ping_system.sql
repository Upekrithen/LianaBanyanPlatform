-- K380: RADAR Ping System
-- Enables members to send location-based pings to other members
-- within HexIsle campaigns. Pings expire, have types, and can
-- carry short messages. Used by DM Summoning Protocol (K384).

BEGIN;

-- ═══ RADAR Pings Table ═══
CREATE TABLE IF NOT EXISTS radar_pings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  target_id UUID REFERENCES auth.users(id),
  target_type TEXT NOT NULL DEFAULT 'member'
    CHECK (target_type IN ('member', 'guild', 'campaign', 'island', 'district', 'broadcast')),
  ping_type TEXT NOT NULL DEFAULT 'location'
    CHECK (ping_type IN ('location', 'summon', 'alert', 'sos', 'rally', 'waypoint')),
  message TEXT,
  island_slug TEXT,
  district_slug TEXT,
  map_x NUMERIC(6,2),
  map_y NUMERIC(6,2),
  metadata JSONB DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_radar_pings_sender ON radar_pings (sender_id);
CREATE INDEX IF NOT EXISTS idx_radar_pings_target ON radar_pings (target_id);
CREATE INDEX IF NOT EXISTS idx_radar_pings_type ON radar_pings (ping_type);
CREATE INDEX IF NOT EXISTS idx_radar_pings_island ON radar_pings (island_slug);
CREATE INDEX IF NOT EXISTS idx_radar_pings_expires ON radar_pings (expires_at)
  WHERE expires_at > now();

-- ═══ RADAR Ping Subscriptions ═══
-- Members opt in to receive pings per island/campaign
CREATE TABLE IF NOT EXISTS radar_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES auth.users(id) NOT NULL,
  scope_type TEXT NOT NULL DEFAULT 'island'
    CHECK (scope_type IN ('island', 'campaign', 'guild', 'global')),
  scope_slug TEXT NOT NULL,
  notify_types TEXT[] DEFAULT ARRAY['summon', 'alert', 'rally'],
  muted_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, scope_type, scope_slug)
);

CREATE INDEX IF NOT EXISTS idx_radar_subs_member ON radar_subscriptions (member_id);
CREATE INDEX IF NOT EXISTS idx_radar_subs_scope ON radar_subscriptions (scope_type, scope_slug);

-- ═══ RLS ═══
ALTER TABLE radar_pings ENABLE ROW LEVEL SECURITY;
ALTER TABLE radar_subscriptions ENABLE ROW LEVEL SECURITY;

-- Pings: members can read pings sent to them or broadcast pings
DROP POLICY IF EXISTS "radar_pings_read_own" ON radar_pings;
CREATE POLICY "radar_pings_read_own" ON radar_pings FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = target_id OR target_type = 'broadcast');

-- Pings: members can send pings
DROP POLICY IF EXISTS "radar_pings_insert" ON radar_pings;
CREATE POLICY "radar_pings_insert" ON radar_pings FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Pings: members can mark their received pings as read
DROP POLICY IF EXISTS "radar_pings_update_read" ON radar_pings;
CREATE POLICY "radar_pings_update_read" ON radar_pings FOR UPDATE
  USING (auth.uid() = target_id)
  WITH CHECK (auth.uid() = target_id);

-- Subscriptions: members manage their own
DROP POLICY IF EXISTS "radar_subs_own" ON radar_subscriptions;
CREATE POLICY "radar_subs_own" ON radar_subscriptions FOR ALL
  USING (auth.uid() = member_id)
  WITH CHECK (auth.uid() = member_id);

-- ═══ RADAR Ping Deck Card ═══
INSERT INTO deck_cards (card_code, name, front_title, back_title, back_instructions, description, front_icon, card_type, rarity, deep_link_url, credit_cost)
VALUES (
  'radar-ping-unlocked',
  'RADAR Ping — The Signal Card',
  'RADAR Ping',
  'The Signal Card',
  'Unlocked when you send your first ping on any island. Pings let you signal allies, summon your crew, or mark waypoints on the map.',
  'Signal your crew across the Archipelago.',
  '📡',
  'utility',
  'uncommon',
  '/hexisle',
  0
) ON CONFLICT (card_code) DO NOTHING;

COMMIT;
