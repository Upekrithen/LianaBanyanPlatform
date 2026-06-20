-- BP087 THUNDERCLAP Trial 02 -- peer_presence version column
-- Gate 1 fix: add version column so peers can report their software version
-- Bishop must apply this migration before fire

ALTER TABLE peer_presence ADD COLUMN IF NOT EXISTS version TEXT;
CREATE INDEX IF NOT EXISTS idx_peer_presence_version ON peer_presence(version);
