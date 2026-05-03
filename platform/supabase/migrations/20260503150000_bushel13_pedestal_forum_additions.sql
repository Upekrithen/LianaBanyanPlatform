-- ============================================================================
-- Bushel 13 Phase D — Pedestal Forum append-only ledger
-- Mordecai-Esther Decree-Composition Pattern
-- BP021 Ratified / 2026-05-03
-- ============================================================================
-- Composes:
--   mordecai_esther_pedestal_forum_decree_composition_paper_collaboration_canon_bp021.eblet.md
--   project_year_of_jubilee_ledger_architecture.md (append-only semantics)
--   pedestal_forum_section_11_boilerplate_for_all_save_the_world_papers_canon_bp021.eblet.md
--
-- Architecture:
--   APPEND-ONLY. No UPDATE or DELETE on rows. RLS enforces insert-only for members.
--   year_of_jubilee_stamp is auto-generated at insert time (UUID-based immutable handle).
--   Auditor may soft-hide abusive content via is_visible flag, but the row is never deleted.
--
-- Note: Augur-Pricing exemption — IP-Pedestal / patent-class context; membership-orthogonal.
-- ============================================================================

-- ── Addition class enum ──────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'pedestal_addition_class'
  ) THEN
    CREATE TYPE pedestal_addition_class AS ENUM (
      'contradictory',  -- challenges the original paper
      'extending',      -- builds on the original paper
      'both'            -- challenges AND builds on the original paper
    );
  END IF;
END$$;

-- ── Main table ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS paper_pedestal_forum_additions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Paper reference
  paper_id            text NOT NULL,
  -- paper_id is a free-text canonical ID (e.g. '1', '2', ..., '12', '6-steps')
  -- Not a FK — papers are canonical Eblet artifacts, not DB rows

  -- Authorship
  member_user_id      uuid NOT NULL REFERENCES auth.users(id),
  author_display_name text NOT NULL DEFAULT 'Anonymous Member',

  -- The decree-composition
  addition_class      pedestal_addition_class NOT NULL,
  title               text NOT NULL,
  body                text NOT NULL,

  -- Year of Jubilee append-only ledger stamp
  -- Immutable handle generated at insert — serves as Jubilee-ledger provenance anchor
  year_of_jubilee_stamp text NOT NULL DEFAULT 'JUB-' || gen_random_uuid()::text,

  -- Visibility (soft-hide only — row is never deleted per append-only contract)
  is_visible          boolean NOT NULL DEFAULT true,

  -- Timestamps
  created_at          timestamptz NOT NULL DEFAULT now(),

  -- Content constraints
  CONSTRAINT title_not_empty CHECK (char_length(trim(title)) > 0),
  CONSTRAINT body_not_empty  CHECK (char_length(trim(body)) > 0),
  CONSTRAINT paper_id_not_empty CHECK (char_length(trim(paper_id)) > 0)
);

-- ── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_pedestal_additions_paper_id
  ON paper_pedestal_forum_additions (paper_id, created_at);

CREATE INDEX IF NOT EXISTS idx_pedestal_additions_member
  ON paper_pedestal_forum_additions (member_user_id);

CREATE INDEX IF NOT EXISTS idx_pedestal_additions_jubilee
  ON paper_pedestal_forum_additions (year_of_jubilee_stamp);

-- ── Row-Level Security ───────────────────────────────────────────────────────

ALTER TABLE paper_pedestal_forum_additions ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can read visible additions
CREATE POLICY "pedestal_additions_read_visible"
  ON paper_pedestal_forum_additions
  FOR SELECT
  USING (is_visible = true);

-- Authenticated members can insert their own additions
CREATE POLICY "pedestal_additions_member_insert"
  ON paper_pedestal_forum_additions
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = member_user_id
  );

-- No UPDATE policy — append-only contract enforced at DB layer
-- No DELETE policy — append-only contract enforced at DB layer

-- ── Append-only enforcement trigger ──────────────────────────────────────────
-- Prevents UPDATE on any column except is_visible (auditor soft-hide only)

CREATE OR REPLACE FUNCTION enforce_pedestal_append_only()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.id              <> NEW.id              OR
     OLD.paper_id        <> NEW.paper_id        OR
     OLD.member_user_id  <> NEW.member_user_id  OR
     OLD.addition_class  <> NEW.addition_class  OR
     OLD.title           <> NEW.title           OR
     OLD.body            <> NEW.body            OR
     OLD.year_of_jubilee_stamp <> NEW.year_of_jubilee_stamp OR
     OLD.created_at      <> NEW.created_at
  THEN
    RAISE EXCEPTION
      'Pedestal Forum is append-only — decree-composition additions cannot be modified. Year of Jubilee contract.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_pedestal_append_only
  BEFORE UPDATE ON paper_pedestal_forum_additions
  FOR EACH ROW EXECUTE FUNCTION enforce_pedestal_append_only();

-- ── Comment ───────────────────────────────────────────────────────────────────

COMMENT ON TABLE paper_pedestal_forum_additions IS
  'Append-only ledger for Mordecai-Esther Decree-Composition additions to Save-the-World Series papers. '
  'Composes with paper_class_a_considered_approach_to_universal_series_12_papers_canon_bp021.eblet.md. '
  'Each addition has co-equal authority with the original paper (contradictory | extending | both). '
  'No row is ever deleted. Year of Jubilee stamp is the provenance anchor. BP021/Bushel 13 Phase D.';

COMMENT ON COLUMN paper_pedestal_forum_additions.year_of_jubilee_stamp IS
  'Immutable append-only-ledger stamp — UUID-prefixed Jubilee handle. Permanent once set. '
  'Composes with project_year_of_jubilee_ledger_architecture.md (#2308 BP127).';

COMMENT ON COLUMN paper_pedestal_forum_additions.addition_class IS
  'Per Mordecai-Esther canon: contradictory = challenges original; extending = builds on original; '
  'both = challenges AND builds. All three have co-equal authority with the original paper.';
