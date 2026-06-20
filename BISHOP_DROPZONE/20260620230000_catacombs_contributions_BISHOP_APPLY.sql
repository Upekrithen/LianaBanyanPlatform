-- catacombs_contributions migration
-- BP087 Wave 5 -- Alexandrian Library Catacombs
-- Knight ships -- Bishop applies via psql per section 15

CREATE TABLE IF NOT EXISTS catacombs_contributions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id        text NOT NULL,
  category_slug    text NOT NULL,
  eblet_uuid       uuid NOT NULL,
  corroboration_score  numeric(4,3) NOT NULL,
  star_chamber_verdict text NOT NULL CHECK (star_chamber_verdict IN ('GREEN','RED')),
  scrambler_verdict    text NOT NULL CHECK (scrambler_verdict IN ('GREEN','RED')),
  keys_engines_verdict text NOT NULL CHECK (keys_engines_verdict IN ('GREEN','RED')),
  marks_earned     numeric(10,4) NOT NULL DEFAULT 0,
  published_at     timestamptz NOT NULL DEFAULT now(),
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE catacombs_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catacombs_contributions_anon_select"
  ON catacombs_contributions FOR SELECT TO anon USING (true);

CREATE POLICY "catacombs_contributions_anon_insert"
  ON catacombs_contributions FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "catacombs_contributions_service_role_all"
  ON catacombs_contributions FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_catacombs_contributions_member
  ON catacombs_contributions (member_id);

CREATE INDEX IF NOT EXISTS idx_catacombs_contributions_category
  ON catacombs_contributions (category_slug);
