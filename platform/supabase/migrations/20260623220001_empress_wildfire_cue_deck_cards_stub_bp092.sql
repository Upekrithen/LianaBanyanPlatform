-- Wildfire Cue Deck Cards — stub schema · BP092 Block 5
-- Empress Campaign integration. Full Wildfire Marathon is a separate dispatch.
-- Postgres-only syntax per canon_knight_sql_target_postgres_syntax_only_no_sqlite_primitives_bp089

CREATE TABLE IF NOT EXISTS wildfire_cue_deck_cards (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_type       TEXT NOT NULL,
  subject_id      UUID,
  subject_type    TEXT,
  member_share_url TEXT,
  card_data       JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: cards are publicly readable; insert via service_role only
ALTER TABLE wildfire_cue_deck_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY wildfire_cards_public_read ON wildfire_cue_deck_cards
  FOR SELECT USING (true);

CREATE POLICY wildfire_cards_service_insert ON wildfire_cue_deck_cards
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Index for proposal lookups
CREATE INDEX IF NOT EXISTS idx_wildfire_cue_deck_cards_subject ON wildfire_cue_deck_cards (subject_type, subject_id);
CREATE INDEX IF NOT EXISTS idx_wildfire_cue_deck_cards_type ON wildfire_cue_deck_cards (card_type);

COMMENT ON TABLE wildfire_cue_deck_cards IS 'Wildfire Cue Deck Cards — stub BP092. Full Wildfire schema = separate Marathon.';
