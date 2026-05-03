-- KN-J1: House Scribe — jars_of_honey table + RLS + indexes
-- BP017 turn 27 Founder-ratified canon: long-term archive keeper at population-scale.
-- Jar lifecycle: created → indexed → sealed → retrievable
-- Sealed jars are structurally-immutable (forever-stamp class).
-- Composes with pheromone substrate + Hive-thread state machine (KN-D3).

-- ─── Enum types ─────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE jar_state AS ENUM ('created', 'indexed', 'sealed', 'retrievable');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE jar_content_type AS ENUM (
    'synthesis',
    'comb_artifact',
    'royal_jelly_class',
    'innovation_corpus',
    'session_archive',
    'detective_finding'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE cohort_minimum AS ENUM (
    'lone_wolf',
    'pied_piper_tier_1',
    'federation_member',
    'excalibur_subscriber',
    'thirteenth_warrior'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ─── jars_of_honey table ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS jars_of_honey (
  -- Identity
  jar_id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cathedral_prefixed_serial text,                 -- LB-BISHOP.HS-NNNN (assigned at seal)
  chronos_hmac              text,                 -- tamper-evidence (computed at seal)

  -- Lifecycle
  state                     jar_state NOT NULL DEFAULT 'created',
  created_at                timestamptz NOT NULL DEFAULT now(),
  indexed_at                timestamptz,
  sealed_at                 timestamptz,
  retrievable_at            timestamptz,

  -- Provenance
  cathedral                 text NOT NULL,        -- bishop / knight / pawn / rook
  source_hive_thread_id     text NOT NULL,        -- Apiarist Hive thread that closed
  contributing_members      text[] NOT NULL DEFAULT '{}',
  queen_member_id           text,

  -- 8-digit-grid coordinate (per KN-J2)
  coordinate                text,                 -- e.g., "04-05-03-17"

  -- Content
  content_type              jar_content_type NOT NULL DEFAULT 'synthesis',
  content_summary           text NOT NULL DEFAULT '' CHECK (char_length(content_summary) <= 500),
  content_blob_pointer      text NOT NULL DEFAULT '',
  excalibur_class_eligible  boolean NOT NULL DEFAULT true,

  -- Access control
  read_cohort_minimum       cohort_minimum NOT NULL DEFAULT 'lone_wolf',
  write_cohort_minimum      cohort_minimum NOT NULL DEFAULT 'federation_member',

  -- Metadata
  layer                     integer NOT NULL DEFAULT 6 CHECK (layer = 6),
  created_by_member_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

COMMENT ON TABLE jars_of_honey IS
  'House Scribe long-term archive: Jars of Honey (Layer 6). '
  'Sealed jars are structurally-immutable forever-stamp class per BP017 FORK doctrine.';

COMMENT ON COLUMN jars_of_honey.cathedral_prefixed_serial IS 'Format: LB-{CATHEDRAL}.HS-NNNN. Null until sealed.';
COMMENT ON COLUMN jars_of_honey.state IS 'created → indexed → sealed → retrievable lifecycle.';
COMMENT ON COLUMN jars_of_honey.layer IS 'Always 6: Layer 6 Jars of Honey (between Layer 5 Excalibur and Layer 7 Codex).';

-- ─── Structural-immutability trigger ─────────────────────────────────────────
-- Sealed / retrievable jars cannot be mutated (FORK doctrine enforcement).

CREATE OR REPLACE FUNCTION reject_sealed_jar_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.state IN ('sealed', 'retrievable') THEN
    RAISE EXCEPTION
      'FORK doctrine: Jar % is in state % and is STRUCTURALLY-IMMUTABLE. '
      'No mutation allowed. Create a new Jar with corrected content.',
      OLD.jar_id, OLD.state;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reject_sealed_jar_mutation ON jars_of_honey;
CREATE TRIGGER trg_reject_sealed_jar_mutation
  BEFORE UPDATE ON jars_of_honey
  FOR EACH ROW EXECUTE FUNCTION reject_sealed_jar_mutation();

-- ─── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_jars_state ON jars_of_honey (state);
CREATE INDEX IF NOT EXISTS idx_jars_cathedral ON jars_of_honey (cathedral);
CREATE INDEX IF NOT EXISTS idx_jars_coordinate ON jars_of_honey (coordinate) WHERE coordinate IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jars_content_type ON jars_of_honey (content_type);
CREATE INDEX IF NOT EXISTS idx_jars_serial ON jars_of_honey (cathedral_prefixed_serial) WHERE cathedral_prefixed_serial IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jars_hive_thread ON jars_of_honey (source_hive_thread_id);
CREATE INDEX IF NOT EXISTS idx_jars_excalibur ON jars_of_honey (excalibur_class_eligible) WHERE excalibur_class_eligible = true;
CREATE INDEX IF NOT EXISTS idx_jars_created_at ON jars_of_honey (created_at DESC);

-- ─── Row-level security ───────────────────────────────────────────────────────

ALTER TABLE jars_of_honey ENABLE ROW LEVEL SECURITY;

-- Cohort rank helper (mirrors jar_lifecycle.ts rank mapping)
CREATE OR REPLACE FUNCTION cohort_rank(c cohort_minimum) RETURNS integer
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE c
    WHEN 'lone_wolf'           THEN 1
    WHEN 'pied_piper_tier_1'   THEN 2
    WHEN 'federation_member'   THEN 3
    WHEN 'excalibur_subscriber' THEN 4
    WHEN 'thirteenth_warrior'  THEN 5
    ELSE 0
  END
$$;

-- Read access: requester's cohort rank must meet jar's read_cohort_minimum.
-- For MVP, any authenticated user gets lone_wolf rank; actual cohort resolution
-- will compose with the member tier system (KN102).
CREATE POLICY "jar_read_cohort_check" ON jars_of_honey
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND cohort_rank(read_cohort_minimum) <= 1  -- lone_wolf baseline; expand via tier join in KN-J4
  );

-- Service role bypasses RLS (for MCP server write-back).
CREATE POLICY "jar_service_role_full_access" ON jars_of_honey
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ─── jar_events table ─────────────────────────────────────────────────────────
-- Mirrors the local jar_events.jsonl for Supabase-backed provenance.

CREATE TABLE IF NOT EXISTS jar_events (
  event_id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jar_id      uuid NOT NULL REFERENCES jars_of_honey(jar_id) ON DELETE CASCADE,
  event_type  text NOT NULL CHECK (event_type IN (
    'jar_created', 'jar_indexed', 'jar_sealed', 'jar_retrieved', 'jar_mutation_rejected'
  )),
  timestamp   timestamptz NOT NULL DEFAULT now(),
  cathedral   text NOT NULL,
  detail      text
);

CREATE INDEX IF NOT EXISTS idx_jar_events_jar_id ON jar_events (jar_id);
CREATE INDEX IF NOT EXISTS idx_jar_events_type ON jar_events (event_type);
CREATE INDEX IF NOT EXISTS idx_jar_events_ts ON jar_events (timestamp DESC);

ALTER TABLE jar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "jar_events_service_role" ON jar_events
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "jar_events_authenticated_read" ON jar_events
  FOR SELECT
  USING (auth.role() = 'authenticated');
