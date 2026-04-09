-- K345 (B084): Stitchpunk archive pipeline integration
-- Phases 1 + 3 baseline wiring

-- Phase 1: Expand content_pipeline to support source-linked archive ingestion.
ALTER TABLE content_pipeline
  ADD COLUMN IF NOT EXISTS source_type TEXT,
  ADD COLUMN IF NOT EXISTS source_table TEXT,
  ADD COLUMN IF NOT EXISTS source_id TEXT,
  ADD COLUMN IF NOT EXISTS content_preview TEXT,
  ADD COLUMN IF NOT EXISTS distribution_channels TEXT[] DEFAULT '{}'::text[];

CREATE INDEX IF NOT EXISTS idx_content_pipeline_source_type
  ON content_pipeline (source_type);

CREATE INDEX IF NOT EXISTS idx_content_pipeline_source_ref
  ON content_pipeline (source_table, source_id);

-- Avoid duplicate archive rows for the same source document.
CREATE UNIQUE INDEX IF NOT EXISTS uq_content_pipeline_archive_source
  ON content_pipeline (source_type, source_table, source_id)
  WHERE source_type = 'archive_document';

-- Seed archive documents into the pipeline.
-- compiled_documents currently uses status values such as canonical/reviewed (not published),
-- so we treat canonical/reviewed as distributable content.
INSERT INTO content_pipeline (
  slug,
  title,
  category,
  current_stage,
  seed_content,
  status,
  source_type,
  source_table,
  source_id,
  content_preview,
  distribution_channels,
  cephas_path,
  cephas_sync_status
)
SELECT
  'archive-' || cd.slug AS slug,
  cd.title,
  COALESCE(cd.category, 'reference') AS category,
  'seed' AS current_stage,
  LEFT(COALESCE(cd.compiled_markdown, ''), 1200) AS seed_content,
  'approved' AS status,
  'archive_document' AS source_type,
  'compiled_documents' AS source_table,
  cd.id::text AS source_id,
  LEFT(COALESCE(cd.compiled_markdown, ''), 280) AS content_preview,
  ARRAY['social', 'cephas', 'bst']::text[] AS distribution_channels,
  '/cephas/archive/' || cd.slug AS cephas_path,
  'pending' AS cephas_sync_status
FROM compiled_documents cd
WHERE cd.status IN ('canonical', 'reviewed')
  AND cd.category IN ('founding_document', 'journal', 'economic_treatise', 'creative_lore', 'academic_document')
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  seed_content = EXCLUDED.seed_content,
  source_type = EXCLUDED.source_type,
  source_table = EXCLUDED.source_table,
  source_id = EXCLUDED.source_id,
  content_preview = EXCLUDED.content_preview,
  distribution_channels = EXCLUDED.distribution_channels,
  cephas_path = EXCLUDED.cephas_path,
  cephas_sync_status = EXCLUDED.cephas_sync_status,
  updated_at = now();

-- Phase 3: skipping-stone depth metadata on source links.
ALTER TABLE content_source_links
  ADD COLUMN IF NOT EXISTS skipping_stone_depth INTEGER DEFAULT 0;

-- Enforce valid range 0-4 without failing if constraint already exists.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'content_source_links_skipping_stone_depth_check'
  ) THEN
    ALTER TABLE content_source_links
      ADD CONSTRAINT content_source_links_skipping_stone_depth_check
      CHECK (skipping_stone_depth BETWEEN 0 AND 4);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_content_source_links_depth
  ON content_source_links (skipping_stone_depth);

-- Depth mapping:
-- 4 = archive/source docs, 3 = papers, 2 = puddings, 1 = social references.
UPDATE content_source_links
SET skipping_stone_depth = 4
WHERE source_type IN ('upekrithen_trunk', 'founding_document', 'archive_file')
  AND target_type = 'innovation';

UPDATE content_source_links
SET skipping_stone_depth = 3
WHERE source_path LIKE 'cephas_content_registry:%';

UPDATE content_source_links
SET skipping_stone_depth = 2
WHERE source_path LIKE 'cephas_puddings:%';

UPDATE content_source_links
SET skipping_stone_depth = 1
WHERE link_type = 'references'
  AND source_type = 'archive_file';
