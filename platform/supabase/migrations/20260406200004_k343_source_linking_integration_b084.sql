-- K343 (B084): Source-linking integration
-- Phases 1-4: schema + B083 backfill + cross-reference seeding

-- Phase 1a: innovation_log source metadata
ALTER TABLE innovation_log
  ADD COLUMN IF NOT EXISTS source_documents JSONB DEFAULT '[]'::jsonb;

ALTER TABLE innovation_log
  ADD COLUMN IF NOT EXISTS source_session TEXT;

UPDATE innovation_log
SET source_documents = '[]'::jsonb
WHERE source_documents IS NULL;

CREATE INDEX IF NOT EXISTS idx_innovation_log_source_docs
  ON innovation_log USING gin (source_documents);

-- Phase 1c: cross-reference backbone table
CREATE TABLE IF NOT EXISTS content_source_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL CHECK (
    source_type IN ('archive_file', 'compiled_document', 'upekrithen_trunk', 'founding_document')
  ),
  source_path TEXT NOT NULL,
  source_section TEXT,
  target_type TEXT NOT NULL CHECK (
    target_type IN ('innovation', 'pudding', 'paper', 'letter', 'cephas_concept')
  ),
  target_id TEXT NOT NULL,
  link_type TEXT DEFAULT 'derived_from' CHECK (
    link_type IN ('derived_from', 'describes', 'formalizes', 'references', 'implements')
  ),
  confidence TEXT DEFAULT 'high' CHECK (confidence IN ('high', 'medium', 'low')),
  bishop_session TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source_path, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_content_source_links_target
  ON content_source_links (target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_content_source_links_source
  ON content_source_links (source_path);

ALTER TABLE content_source_links ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'content_source_links'
      AND policyname = 'Public read content_source_links'
  ) THEN
    CREATE POLICY "Public read content_source_links"
      ON content_source_links
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'content_source_links'
      AND policyname = 'Auth insert content_source_links'
  ) THEN
    CREATE POLICY "Auth insert content_source_links"
      ON content_source_links
      FOR INSERT
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- Phase 2: mark all B083 innovation rows with source_session
UPDATE innovation_log
SET source_session = 'B083'
WHERE innovation_number BETWEEN 2162 AND 2222;

-- Phase 2: high-confidence source_documents backfill (remainder intentionally left empty)
WITH source_map AS (
  SELECT *
  FROM (
    VALUES
      (2162, 'Upekrithen-Trunk/HEXISLE_CREATIVE/Lore/THE GALACTIC EMPIRE OF LIANA BANYAN.md', 'lines 46-100', 'upekrithen_trunk'),
      (2164, 'Upekrithen-Trunk/HEXISLE_CREATIVE/Lore/THE GALACTIC EMPIRE OF LIANA BANYAN.md', 'line 118', 'upekrithen_trunk'),
      (2165, 'Upekrithen-Trunk/SACRED_TEXTS/SECRET_PLANS/THE_SENATE_ARCHITECTURE.md', 'Agora pattern', 'founding_document'),
      (2169, 'Upekrithen-Trunk/SACRED_TEXTS/SECRET_PLANS/', 'IP protection docs', 'founding_document'),
      (2170, 'Upekrithen-Trunk/SACRED_TEXTS/THE LABYRINTH - PROGRAMMING COMPLEX.docx', 'full document', 'founding_document'),
      (2174, 'Upekrithen-Trunk/SACRED_TEXTS/THE CHRONICLER''S HALL & BOAZ PRINCIPLE.md', 'lines 220-278', 'founding_document'),
      (2176, 'Upekrithen-Trunk/SACRED_TEXTS/STAR CHAMBER AS A SERVICE (SCaaS).docx', 'full document', 'founding_document'),
      (2183, 'Upekrithen-Trunk/SACRED_TEXTS/SECRET_PLANS/THE_SENATE_ARCHITECTURE.md', 'full document', 'founding_document'),
      (2184, 'Upekrithen-Trunk/SACRED_TEXTS/SECRET_PLANS/THE_SENATE_ARCHITECTURE.md', 'lines 155-161', 'founding_document'),
      (2185, 'Upekrithen-Trunk/SACRED_TEXTS/SECRET_PLANS/DEFENSE_KLAUS_FAMILY_TABLE_INTEGRATION.md', 'lines 62-116', 'founding_document'),
      (2186, 'Upekrithen-Trunk/SACRED_TEXTS/SECRET_PLANS/DEFENSE_KLAUS_FAMILY_TABLE_INTEGRATION.md', 'lines 32-57', 'founding_document'),
      (2187, 'Upekrithen-Trunk/SACRED_TEXTS/SECRET_PLANS/DEFENSE_KLAUS_FAMILY_TABLE_INTEGRATION.md', 'lines 15-29', 'founding_document'),
      (2188, 'Upekrithen-Trunk/SACRED_TEXTS/GrandMaster_Blueprint_01.md', 'core section', 'founding_document'),
      (2188, 'Upekrithen-Trunk/SACRED_TEXTS/LUDICROUS_SPEED_CHRONICLE_MASTER.md', 'core section', 'founding_document'),
      (2189, 'Upekrithen-Trunk/MASTERS_ACADEMIC/Liana Banyan Business Plan Final Corrected.md', 'lines 161-165', 'archive_file'),
      (2190, 'Upekrithen-Trunk/SACRED_TEXTS/THE CASTLE -TURNKEY DEVELOPER ECOSYSTEM.docx', 'full document', 'founding_document'),
      (2192, 'Upekrithen-Trunk/MASTERS_ACADEMIC/Liana Banyan Business Plan Final Corrected.md', 'lines 160-161', 'archive_file'),
      (2194, 'Upekrithen-Trunk/SACRED_TEXTS/THE CHRONICLER''S HALL & BOAZ PRINCIPLE.md', 'lines 381-399', 'founding_document'),
      (2195, 'Upekrithen-Trunk/HEXISLE_CREATIVE/Lore/HEXISLE - THE COMPLETE GAMIFICATION.md', 'lines 206-278', 'upekrithen_trunk'),
      (2197, 'Upekrithen-Trunk/FOUNDERS_LORE/48HoursNotes', 'converted', 'archive_file'),
      (2199, 'Upekrithen-Trunk/FOUNDERS_LORE/186KHandwrittenNotes', 'converted', 'archive_file'),
      (2200, 'Upekrithen-Trunk/FOUNDERS_LORE/186KHandwrittenNotes', 'converted', 'archive_file'),
      (2201, 'Upekrithen-Trunk/FOUNDERS_LORE/186KHandwrittenNotes', 'converted', 'archive_file'),
      (2202, 'Upekrithen-Trunk/FOUNDERS_LORE/186KHandwrittenNotes', 'converted', 'archive_file'),
      (2203, 'Upekrithen-Trunk/FOUNDERS_LORE/186KHandwrittenNotes', 'converted', 'archive_file'),
      (2212, 'Upekrithen-Trunk/ECONOMIC_PHILOSOPHY/', 'pricing models', 'archive_file'),
      (2222, 'Upekrithen-Trunk/FOUNDERS_JOURNALS/', 'core loop analysis', 'archive_file')
  ) AS t(innovation_number, source_path, source_section, source_type)
),
agg_source_docs AS (
  SELECT
    innovation_number,
    jsonb_agg(
      jsonb_build_object(
        'path', source_path,
        'section', source_section,
        'type', source_type
      )
      ORDER BY source_path
    ) AS docs
  FROM source_map
  GROUP BY innovation_number
)
UPDATE innovation_log il
SET source_documents = agg.docs
FROM agg_source_docs agg
WHERE il.innovation_number = agg.innovation_number;

-- Phase 3: backfill B083 pudding innovation references
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2179] WHERE pudding_number = 160;
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2167] WHERE pudding_number = 161;
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2165] WHERE pudding_number = 162;
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2166] WHERE pudding_number = 163;
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2217] WHERE pudding_number = 164;
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2221] WHERE pudding_number = 165;
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2170] WHERE pudding_number = 166;
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2216] WHERE pudding_number = 167;
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2167, 2168, 2199] WHERE pudding_number = 168;
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2176] WHERE pudding_number = 169;
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2220] WHERE pudding_number = 170;
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2174] WHERE pudding_number = 171;
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2194] WHERE pudding_number = 172;
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2175] WHERE pudding_number = 173;
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2204] WHERE pudding_number = 174;
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2179] WHERE pudding_number = 175;
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2171, 2172] WHERE pudding_number = 176;
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2218, 2219] WHERE pudding_number = 177;
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2162] WHERE pudding_number = 178;
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2198] WHERE pudding_number = 179;
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2212] WHERE pudding_number = 180;
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2222] WHERE pudding_number = 181;

-- Phase 4: seed cross-reference links for mapped innovations
WITH source_map AS (
  SELECT *
  FROM (
    VALUES
      ('upekrithen_trunk', 'Upekrithen-Trunk/HEXISLE_CREATIVE/Lore/THE GALACTIC EMPIRE OF LIANA BANYAN.md', 'lines 46-100', 'innovation', '2162', 'derived_from', 'high', 'B084'),
      ('upekrithen_trunk', 'Upekrithen-Trunk/HEXISLE_CREATIVE/Lore/THE GALACTIC EMPIRE OF LIANA BANYAN.md', 'line 118', 'innovation', '2164', 'derived_from', 'high', 'B084'),
      ('founding_document', 'Upekrithen-Trunk/SACRED_TEXTS/SECRET_PLANS/THE_SENATE_ARCHITECTURE.md', 'Agora pattern', 'innovation', '2165', 'derived_from', 'high', 'B084'),
      ('founding_document', 'Upekrithen-Trunk/SACRED_TEXTS/THE LABYRINTH - PROGRAMMING COMPLEX.docx', 'full document', 'innovation', '2170', 'derived_from', 'high', 'B084'),
      ('founding_document', 'Upekrithen-Trunk/SACRED_TEXTS/THE CHRONICLER''S HALL & BOAZ PRINCIPLE.md', 'lines 220-278', 'innovation', '2174', 'derived_from', 'high', 'B084'),
      ('founding_document', 'Upekrithen-Trunk/SACRED_TEXTS/STAR CHAMBER AS A SERVICE (SCaaS).docx', 'full document', 'innovation', '2176', 'derived_from', 'high', 'B084'),
      ('founding_document', 'Upekrithen-Trunk/SACRED_TEXTS/SECRET_PLANS/THE_SENATE_ARCHITECTURE.md', 'full document', 'innovation', '2183', 'derived_from', 'high', 'B084'),
      ('founding_document', 'Upekrithen-Trunk/SACRED_TEXTS/SECRET_PLANS/THE_SENATE_ARCHITECTURE.md', 'lines 155-161', 'innovation', '2184', 'derived_from', 'high', 'B084'),
      ('founding_document', 'Upekrithen-Trunk/SACRED_TEXTS/SECRET_PLANS/DEFENSE_KLAUS_FAMILY_TABLE_INTEGRATION.md', 'lines 62-116', 'innovation', '2185', 'derived_from', 'high', 'B084'),
      ('founding_document', 'Upekrithen-Trunk/SACRED_TEXTS/SECRET_PLANS/DEFENSE_KLAUS_FAMILY_TABLE_INTEGRATION.md', 'lines 32-57', 'innovation', '2186', 'derived_from', 'high', 'B084'),
      ('founding_document', 'Upekrithen-Trunk/SACRED_TEXTS/SECRET_PLANS/DEFENSE_KLAUS_FAMILY_TABLE_INTEGRATION.md', 'lines 15-29', 'innovation', '2187', 'derived_from', 'high', 'B084'),
      ('founding_document', 'Upekrithen-Trunk/SACRED_TEXTS/GrandMaster_Blueprint_01.md', 'core section', 'innovation', '2188', 'derived_from', 'high', 'B084'),
      ('founding_document', 'Upekrithen-Trunk/SACRED_TEXTS/LUDICROUS_SPEED_CHRONICLE_MASTER.md', 'core section', 'innovation', '2188', 'derived_from', 'high', 'B084'),
      ('archive_file', 'Upekrithen-Trunk/MASTERS_ACADEMIC/Liana Banyan Business Plan Final Corrected.md', 'lines 161-165', 'innovation', '2189', 'derived_from', 'high', 'B084'),
      ('founding_document', 'Upekrithen-Trunk/SACRED_TEXTS/THE CASTLE -TURNKEY DEVELOPER ECOSYSTEM.docx', 'full document', 'innovation', '2190', 'derived_from', 'high', 'B084'),
      ('archive_file', 'Upekrithen-Trunk/MASTERS_ACADEMIC/Liana Banyan Business Plan Final Corrected.md', 'lines 160-161', 'innovation', '2192', 'derived_from', 'high', 'B084'),
      ('founding_document', 'Upekrithen-Trunk/SACRED_TEXTS/THE CHRONICLER''S HALL & BOAZ PRINCIPLE.md', 'lines 381-399', 'innovation', '2194', 'derived_from', 'high', 'B084'),
      ('upekrithen_trunk', 'Upekrithen-Trunk/HEXISLE_CREATIVE/Lore/HEXISLE - THE COMPLETE GAMIFICATION.md', 'lines 206-278', 'innovation', '2195', 'derived_from', 'high', 'B084'),
      ('archive_file', 'Upekrithen-Trunk/FOUNDERS_LORE/48HoursNotes', 'converted', 'innovation', '2197', 'derived_from', 'medium', 'B084'),
      ('archive_file', 'Upekrithen-Trunk/FOUNDERS_LORE/186KHandwrittenNotes', 'converted', 'innovation', '2199', 'derived_from', 'medium', 'B084'),
      ('archive_file', 'Upekrithen-Trunk/FOUNDERS_LORE/186KHandwrittenNotes', 'converted', 'innovation', '2200', 'derived_from', 'medium', 'B084'),
      ('archive_file', 'Upekrithen-Trunk/FOUNDERS_LORE/186KHandwrittenNotes', 'converted', 'innovation', '2201', 'derived_from', 'medium', 'B084'),
      ('archive_file', 'Upekrithen-Trunk/FOUNDERS_LORE/186KHandwrittenNotes', 'converted', 'innovation', '2202', 'derived_from', 'medium', 'B084'),
      ('archive_file', 'Upekrithen-Trunk/FOUNDERS_LORE/186KHandwrittenNotes', 'converted', 'innovation', '2203', 'derived_from', 'medium', 'B084'),
      ('archive_file', 'Upekrithen-Trunk/ECONOMIC_PHILOSOPHY/', 'pricing models', 'innovation', '2212', 'derived_from', 'high', 'B084'),
      ('archive_file', 'Upekrithen-Trunk/FOUNDERS_JOURNALS/', 'core loop analysis', 'innovation', '2222', 'derived_from', 'medium', 'B084')
  ) AS t(source_type, source_path, source_section, target_type, target_id, link_type, confidence, bishop_session)
)
INSERT INTO content_source_links (
  source_type, source_path, source_section, target_type, target_id, link_type, confidence, bishop_session
)
SELECT source_type, source_path, source_section, target_type, target_id, link_type, confidence, bishop_session
FROM source_map
ON CONFLICT (source_path, target_type, target_id) DO NOTHING;

-- Phase 4: pudding -> innovation links
INSERT INTO content_source_links (
  source_type, source_path, source_section, target_type, target_id, link_type, confidence, bishop_session
)
VALUES
  ('compiled_document', 'cephas_puddings:160', 'pudding #160', 'innovation', '2179', 'describes', 'high', 'B084'),
  ('compiled_document', 'cephas_puddings:161', 'pudding #161', 'innovation', '2167', 'describes', 'high', 'B084'),
  ('compiled_document', 'cephas_puddings:162', 'pudding #162', 'innovation', '2165', 'describes', 'high', 'B084'),
  ('compiled_document', 'cephas_puddings:163', 'pudding #163', 'innovation', '2166', 'describes', 'high', 'B084'),
  ('compiled_document', 'cephas_puddings:164', 'pudding #164', 'innovation', '2217', 'describes', 'high', 'B084'),
  ('compiled_document', 'cephas_puddings:165', 'pudding #165', 'innovation', '2221', 'describes', 'high', 'B084'),
  ('compiled_document', 'cephas_puddings:166', 'pudding #166', 'innovation', '2170', 'describes', 'high', 'B084'),
  ('compiled_document', 'cephas_puddings:167', 'pudding #167', 'innovation', '2216', 'describes', 'high', 'B084'),
  ('compiled_document', 'cephas_puddings:168', 'pudding #168', 'innovation', '2167', 'describes', 'high', 'B084'),
  ('compiled_document', 'cephas_puddings:168', 'pudding #168', 'innovation', '2168', 'describes', 'high', 'B084'),
  ('compiled_document', 'cephas_puddings:168', 'pudding #168', 'innovation', '2199', 'describes', 'high', 'B084'),
  ('compiled_document', 'cephas_puddings:169', 'pudding #169', 'innovation', '2176', 'describes', 'high', 'B084'),
  ('compiled_document', 'cephas_puddings:170', 'pudding #170', 'innovation', '2220', 'describes', 'high', 'B084'),
  ('compiled_document', 'cephas_puddings:171', 'pudding #171', 'innovation', '2174', 'describes', 'high', 'B084'),
  ('compiled_document', 'cephas_puddings:172', 'pudding #172', 'innovation', '2194', 'describes', 'high', 'B084'),
  ('compiled_document', 'cephas_puddings:173', 'pudding #173', 'innovation', '2175', 'describes', 'high', 'B084'),
  ('compiled_document', 'cephas_puddings:174', 'pudding #174', 'innovation', '2204', 'describes', 'high', 'B084'),
  ('compiled_document', 'cephas_puddings:175', 'pudding #175', 'innovation', '2179', 'describes', 'high', 'B084'),
  ('compiled_document', 'cephas_puddings:176', 'pudding #176', 'innovation', '2171', 'describes', 'high', 'B084'),
  ('compiled_document', 'cephas_puddings:176', 'pudding #176', 'innovation', '2172', 'describes', 'high', 'B084'),
  ('compiled_document', 'cephas_puddings:177', 'pudding #177', 'innovation', '2218', 'describes', 'high', 'B084'),
  ('compiled_document', 'cephas_puddings:177', 'pudding #177', 'innovation', '2219', 'describes', 'high', 'B084'),
  ('compiled_document', 'cephas_puddings:178', 'pudding #178', 'innovation', '2162', 'describes', 'high', 'B084'),
  ('compiled_document', 'cephas_puddings:179', 'pudding #179', 'innovation', '2198', 'describes', 'high', 'B084'),
  ('compiled_document', 'cephas_puddings:180', 'pudding #180', 'innovation', '2212', 'describes', 'high', 'B084'),
  ('compiled_document', 'cephas_puddings:181', 'pudding #181', 'innovation', '2222', 'describes', 'high', 'B084')
ON CONFLICT (source_path, target_type, target_id) DO NOTHING;

-- Phase 4: paper -> innovation links (B083 papers)
INSERT INTO content_source_links (
  source_type, source_path, source_section, target_type, target_id, link_type, confidence, bishop_session
)
VALUES
  ('compiled_document', 'cephas_content_registry:wave-based-pricing-impatience-tax', 'paper #36', 'innovation', '2212', 'formalizes', 'high', 'B084'),
  ('compiled_document', 'cephas_content_registry:corporate-island-b2b-integration', 'paper #37', 'innovation', '2162', 'formalizes', 'high', 'B084'),
  ('compiled_document', 'cephas_content_registry:gamified-generosity-corner-contributions', 'paper #38', 'innovation', '2194', 'formalizes', 'high', 'B084')
ON CONFLICT (source_path, target_type, target_id) DO NOTHING;
