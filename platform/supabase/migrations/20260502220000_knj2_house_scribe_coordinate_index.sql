-- KN-J2: House Scribe — 8-digit grid coordinate scheme indexes
-- Extends jars_of_honey (KN-J1) with optimized coordinate-based retrieval.
-- Wildcard / prefix / exact queries on 4-field composite NN-NN-NN-NN.

-- ─── coordinate column is already present in KN-J1 migration ─────────────────
-- KN-J1 added: coordinate text (nullable, indexed with idx_jars_coordinate)
-- KN-J2 extends: GIN/B-tree indexes for wildcard and prefix queries.

-- Standard index for exact coordinate lookup (already in KN-J1)
-- Ensure it exists (idempotent):
CREATE INDEX IF NOT EXISTS idx_jars_coordinate_exact
  ON jars_of_honey (coordinate)
  WHERE coordinate IS NOT NULL;

-- B-tree prefix index for cathedral-wildcard queries (01-*)
-- text_pattern_ops enables LIKE 'NN-%' matching:
CREATE INDEX IF NOT EXISTS idx_jars_coordinate_prefix
  ON jars_of_honey (coordinate text_pattern_ops)
  WHERE coordinate IS NOT NULL;

-- Cathedral-field index (first 2 chars of coordinate):
CREATE INDEX IF NOT EXISTS idx_jars_coordinate_cathedral
  ON jars_of_honey (substring(coordinate, 1, 2))
  WHERE coordinate IS NOT NULL;

-- Cathedral + tier index (first 5 chars, e.g. "01-06"):
CREATE INDEX IF NOT EXISTS idx_jars_coordinate_cat_tier
  ON jars_of_honey (substring(coordinate, 1, 5))
  WHERE coordinate IS NOT NULL;

-- Cathedral + tier + flavor index (first 8 chars, e.g. "01-06-02"):
CREATE INDEX IF NOT EXISTS idx_jars_coordinate_cell_prefix
  ON jars_of_honey (substring(coordinate, 1, 8))
  WHERE coordinate IS NOT NULL;

-- ─── Cell occupancy view (for Swarming population management) ────────────────

CREATE OR REPLACE VIEW house_scribe_cell_occupancy AS
SELECT
  substring(coordinate, 1, 8) AS cell_prefix,
  substring(coordinate, 1, 2) AS cathedral_id,
  substring(coordinate, 4, 2) AS tier_id,
  substring(coordinate, 7, 2) AS flavor_id,
  count(*)                     AS jar_count,
  count(*) >= 100              AS is_full,
  bool_or(state IN ('sealed', 'retrievable')) AS has_sealed
FROM jars_of_honey
WHERE coordinate IS NOT NULL
GROUP BY cell_prefix, cathedral_id, tier_id, flavor_id;

COMMENT ON VIEW house_scribe_cell_occupancy IS
  'Per-cell Jar count and fill status. is_full=true triggers Swarming (daughter-cell spawn). KN-J2.';

-- ─── Coordinate validation function ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION validate_jar_coordinate(coord text)
RETURNS boolean
LANGUAGE sql IMMUTABLE STRICT AS $$
  SELECT coord ~ '^\d{2}-\d{2}-\d{2}-\d{2}$'
$$;

COMMENT ON FUNCTION validate_jar_coordinate IS
  'Validates 8-digit NN-NN-NN-NN coordinate format per KN-J2 House Scribe canon.';

-- Add check constraint to jars_of_honey for valid coordinate format:
DO $$ BEGIN
  ALTER TABLE jars_of_honey
    ADD CONSTRAINT jars_coordinate_format_check
    CHECK (coordinate IS NULL OR validate_jar_coordinate(coordinate));
EXCEPTION WHEN duplicate_object THEN null;
END $$;
