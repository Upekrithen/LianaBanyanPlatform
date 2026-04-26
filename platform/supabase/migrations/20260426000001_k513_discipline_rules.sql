-- K513: Discipline Rule Editor — opt-in cloud mirror table
-- Default: rules stay in chrome.storage.local (personal scope).
-- This table is only populated when a member explicitly opts to cloud-mirror a rule
-- (preview for K518 federation). RLS-locked: members can only access their own rules.
--
-- A&A #2294 — Personal Discipline Enforcement Layer.
-- K513 / B126 (2026-04-26)

CREATE TABLE IF NOT EXISTS "public"."member_discipline_rules" (
  "id"              uuid    DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  "member_id"       uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "rule_id"         text    NOT NULL,           -- matches chrome.storage.local rule.id
  "name"            text    NOT NULL,
  "trigger_patterns" text[] NOT NULL DEFAULT '{}',
  "consult_source"  text    NOT NULL DEFAULT 'cathedral'
    CHECK (consult_source IN ('cathedral', 'member_substrate', 'daemon', 'custom')),
  "consult_domain"  text,
  "freshness_seconds" integer NOT NULL DEFAULT 3600 CHECK (freshness_seconds BETWEEN 60 AND 86400),
  "failure_action"  text    NOT NULL DEFAULT 'warn'
    CHECK (failure_action IN ('block', 'warn', 'enrich', 'substitute')),
  "block_message"   text    NOT NULL DEFAULT '',
  "enabled"         boolean NOT NULL DEFAULT true,
  "scope"           text    NOT NULL DEFAULT 'personal'
    CHECK (scope IN ('personal', 'guild', 'tribe', 'cooperative')),  -- guild/tribe/coop = K518+
  "cloud_mirror"    boolean NOT NULL DEFAULT false,   -- opt-in; false = local-only
  "created_at"      timestamptz NOT NULL DEFAULT now(),
  "updated_at"      timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("member_id", "rule_id")
);

COMMENT ON TABLE "public"."member_discipline_rules" IS
  'Opt-in cloud mirror of personal Augur discipline rules. Default scope is personal (chrome.storage.local). Cloud-mirror is opt-in per rule. Cross-tier federation (guild/tribe/coop) is K518+ territory. A&A #2294.';

COMMENT ON COLUMN "public"."member_discipline_rules"."cloud_mirror" IS
  'When false, rule lives only in chrome.storage.local and never touches this table. When true, rule is mirrored here for portability across devices. Member-controlled.';

-- Updated-at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER "trg_member_discipline_rules_updated_at"
  BEFORE UPDATE ON "public"."member_discipline_rules"
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Index for member lookup
CREATE INDEX IF NOT EXISTS "idx_mdr_member"
  ON "public"."member_discipline_rules" ("member_id");

-- RLS: members can only access their own rules
ALTER TABLE "public"."member_discipline_rules" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_own_rules_select"
  ON "public"."member_discipline_rules" FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "member_own_rules_insert"
  ON "public"."member_discipline_rules" FOR INSERT
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "member_own_rules_update"
  ON "public"."member_discipline_rules" FOR UPDATE
  USING (auth.uid() = member_id)
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "member_own_rules_delete"
  ON "public"."member_discipline_rules" FOR DELETE
  USING (auth.uid() = member_id);
