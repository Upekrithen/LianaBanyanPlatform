-- K373: Translation contribution tracking + Mirror Mirror deck card
-- Enables members to earn Marks by translating or confirming translations.

BEGIN;

-- ═══ Translation Contributions Table ═══
CREATE TABLE IF NOT EXISTS translation_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES auth.users(id),
  page_route TEXT NOT NULL,
  source_lang TEXT NOT NULL DEFAULT 'en',
  target_lang TEXT NOT NULL,
  original_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  marks_awarded NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE translation_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can submit translations"
  ON translation_contributions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Members can view own translations"
  ON translation_contributions FOR SELECT
  TO authenticated
  USING (auth.uid() = member_id);

CREATE INDEX IF NOT EXISTS idx_translation_lang_pair
  ON translation_contributions(source_lang, target_lang);

CREATE INDEX IF NOT EXISTS idx_translation_page
  ON translation_contributions(page_route, target_lang);

-- ═══ Mirror Mirror Deck Card ═══
INSERT INTO deck_cards (card_key, title, description, icon, card_type, rarity, destination_route, unlock_cost_type, unlock_cost_amount)
VALUES (
  'mirror-mirror-translate',
  'Mirror Mirror — The Translation Card',
  'Unlocked by speaking friend in any language. Every language matters.',
  '💎',
  'museum',
  'uncommon',
  '/mirror',
  'free',
  0
) ON CONFLICT (card_key) DO NOTHING;

COMMIT;
