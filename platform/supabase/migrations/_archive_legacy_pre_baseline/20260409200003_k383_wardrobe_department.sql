-- K383: Wardrobe Department
-- Game-mode gated character customization system.
-- Members unlock wardrobe items through gameplay, achievements, and purchases.
-- Wardrobe items are cosmetic — they change the visual appearance of
-- the member's avatar/character across HexIsle without gameplay effects.

BEGIN;

-- ═══ Wardrobe Items Catalog ═══
CREATE TABLE IF NOT EXISTS wardrobe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL
    CHECK (category IN ('hat', 'outfit', 'accessory', 'banner', 'aura', 'emote', 'title', 'frame')),
  rarity TEXT NOT NULL DEFAULT 'common'
    CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  game_mode TEXT
    CHECK (game_mode IS NULL OR game_mode IN ('adventure', 'raid', 'puzzle', 'trade', 'siege')),
  unlock_condition JSONB DEFAULT '{}'::jsonb,
  preview_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wardrobe_items_category ON wardrobe_items (category);
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_rarity ON wardrobe_items (rarity);
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_game_mode ON wardrobe_items (game_mode);

-- ═══ Member Wardrobes (owned items) ═══
CREATE TABLE IF NOT EXISTS member_wardrobes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES auth.users(id) NOT NULL,
  item_id UUID REFERENCES wardrobe_items(id) NOT NULL,
  equipped BOOLEAN DEFAULT false,
  acquired_via TEXT DEFAULT 'gameplay'
    CHECK (acquired_via IN ('gameplay', 'achievement', 'purchase', 'gift', 'event')),
  acquired_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_member_wardrobe_member ON member_wardrobes (member_id);
CREATE INDEX IF NOT EXISTS idx_member_wardrobe_equipped ON member_wardrobes (member_id)
  WHERE equipped = true;

-- ═══ RLS ═══
ALTER TABLE wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_wardrobes ENABLE ROW LEVEL SECURITY;

-- Catalog: public read
DROP POLICY IF EXISTS "wardrobe_items_read" ON wardrobe_items;
CREATE POLICY "wardrobe_items_read" ON wardrobe_items FOR SELECT USING (true);

-- Member wardrobes: own read/write
DROP POLICY IF EXISTS "member_wardrobe_own" ON member_wardrobes;
CREATE POLICY "member_wardrobe_own" ON member_wardrobes FOR ALL
  USING (auth.uid() = member_id)
  WITH CHECK (auth.uid() = member_id);

-- ═══ Seed: Starter Wardrobe Items ═══
INSERT INTO wardrobe_items (item_code, name, description, category, rarity, game_mode, unlock_condition) VALUES
  ('starter-explorer-hat', 'Explorer''s Hat', 'A well-worn hat for those who dare to explore.', 'hat', 'common', NULL, '{"type":"free"}'::jsonb),
  ('harvest-overalls', 'Harvest Overalls', 'Sturdy workwear from the fields of Harvest Island.', 'outfit', 'common', NULL, '{"type":"visit_island","island":"harvest"}'::jsonb),
  ('navigator-compass', 'Navigator''s Compass', 'A brass compass that always points toward opportunity.', 'accessory', 'uncommon', NULL, '{"type":"visit_island","island":"navigate"}'::jsonb),
  ('engineer-goggles', 'Engineer''s Goggles', 'See the world through the lens of innovation.', 'accessory', 'uncommon', NULL, '{"type":"visit_island","island":"engineer"}'::jsonb),
  ('battle-banner', 'Battle Standard', 'Fly your colors on the field of competition.', 'banner', 'rare', 'adventure', '{"type":"complete_campaign"}'::jsonb),
  ('seeker-aura', 'Seeker''s Glow', 'A faint golden aura earned by finding all five keys.', 'aura', 'epic', 'puzzle', '{"type":"collect_keys","count":5}'::jsonb),
  ('dm-crown', 'Dungeon Master''s Crown', 'For those who forge campaigns and guide others.', 'hat', 'legendary', NULL, '{"type":"create_campaigns","count":3}'::jsonb),
  ('ghost-frame', 'Ghost World Frame', 'A spectral frame from the space between worlds.', 'frame', 'rare', NULL, '{"type":"tour_complete"}'::jsonb)
ON CONFLICT (item_code) DO NOTHING;

-- ═══ Wardrobe Deck Card ═══
INSERT INTO deck_cards (card_code, name, front_title, back_title, back_instructions, description, front_icon, card_type, rarity, deep_link_url, credit_cost)
VALUES (
  'wardrobe-department',
  'Wardrobe Department',
  'Wardrobe Department',
  'The Style Card',
  'Unlocked when you equip your first wardrobe item. Express yourself across the Archipelago.',
  'Customize your character appearance.',
  '👔',
  'access',
  'uncommon',
  '/hexisle/wardrobe',
  0
) ON CONFLICT (card_code) DO NOTHING;

COMMIT;
