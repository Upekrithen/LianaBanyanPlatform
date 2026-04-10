-- Deck Card System Expansion — B089/B090
-- deck_cards already exists (from 20260223000007). Add level column + new tables.

-- Add level to existing deck_cards
ALTER TABLE deck_cards ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
CREATE INDEX IF NOT EXISTS idx_deck_cards_level ON deck_cards (level);

-- golden_keys: member key inventory
CREATE TABLE IF NOT EXISTS golden_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES auth.users(id) NOT NULL,
  key_count INTEGER DEFAULT 0,
  keys_earned_from JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id)
);
CREATE INDEX IF NOT EXISTS idx_golden_keys_member ON golden_keys (member_id);

-- member_deck: which cards a member has unlocked
CREATE TABLE IF NOT EXISTS member_deck (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES auth.users(id) NOT NULL,
  card_id UUID REFERENCES deck_cards(id) NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  slot_position INTEGER,
  UNIQUE(member_id, card_id)
);
CREATE INDEX IF NOT EXISTS idx_member_deck_member ON member_deck (member_id);
CREATE INDEX IF NOT EXISTS idx_member_deck_card ON member_deck (card_id);

-- deck_recipes: card combination recipes
CREATE TABLE IF NOT EXISTS deck_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  required_cards JSONB NOT NULL,
  result_type TEXT NOT NULL,
  result_description TEXT
);

-- RLS
ALTER TABLE golden_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_deck ENABLE ROW LEVEL SECURITY;
ALTER TABLE deck_recipes ENABLE ROW LEVEL SECURITY;

-- golden_keys: members read/update their own
DROP POLICY IF EXISTS "golden_keys_own_read" ON golden_keys;
CREATE POLICY "golden_keys_own_read" ON golden_keys FOR SELECT USING (auth.uid() = member_id);
DROP POLICY IF EXISTS "golden_keys_own_insert" ON golden_keys;
CREATE POLICY "golden_keys_own_insert" ON golden_keys FOR INSERT WITH CHECK (auth.uid() = member_id);
DROP POLICY IF EXISTS "golden_keys_own_update" ON golden_keys;
CREATE POLICY "golden_keys_own_update" ON golden_keys FOR UPDATE USING (auth.uid() = member_id);

-- member_deck: members read their own, insert when unlocking
DROP POLICY IF EXISTS "member_deck_own_read" ON member_deck;
CREATE POLICY "member_deck_own_read" ON member_deck FOR SELECT USING (auth.uid() = member_id);
DROP POLICY IF EXISTS "member_deck_own_insert" ON member_deck;
CREATE POLICY "member_deck_own_insert" ON member_deck FOR INSERT WITH CHECK (auth.uid() = member_id);

-- deck_recipes: public read
DROP POLICY IF EXISTS "deck_recipes_public_read" ON deck_recipes;
CREATE POLICY "deck_recipes_public_read" ON deck_recipes FOR SELECT USING (true);

-- Seed: HEOHO Museum Card (mapped to actual deck_cards schema)
INSERT INTO deck_cards (card_code, name, front_title, back_title, back_instructions, description, front_icon, card_type, rarity, deep_link_url, credit_cost)
VALUES (
  'heoho-museum-first',
  'HEOHO — The First Card',
  'HEOHO — The First Card',
  'Welcome to the Museum',
  'Help Each Other Help Ourselves. This is your first Deck Card. It proves you found the Museum and explored it.',
  'The Museum entrance card.',
  '🏛️',
  'access',
  'common',
  '/enter',
  0
) ON CONFLICT (card_code) DO NOTHING;
