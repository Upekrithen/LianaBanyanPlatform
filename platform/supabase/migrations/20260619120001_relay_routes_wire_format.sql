-- BP087 MAMBA-δ4: add wire_format column to relay_routes
-- Tracks whether each route was dispatched as hex-mcode-v1 or json-legacy.
-- Used for δ6 receipt logging (byte delta between wire formats).

ALTER TABLE relay_routes
  ADD COLUMN IF NOT EXISTS wire_format TEXT NOT NULL DEFAULT 'json-legacy'
    CHECK (wire_format IN ('json-legacy', 'hex-mcode-v1'));

COMMENT ON COLUMN relay_routes.wire_format IS
  'MAMBA-δ4: hex-mcode-v1 = compact flat-header hex frame; '
  'json-legacy = original JSON payload body. '
  'Enables δ6 receipt: byte/parse-time delta between formats.';
