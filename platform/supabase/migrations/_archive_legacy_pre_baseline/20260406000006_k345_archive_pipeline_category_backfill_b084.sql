-- K345 follow-up: adapt archive seeding to live compiled_documents taxonomy.
-- Existing data uses categories like system_design/reference/founders-journal/article.

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
WHERE cd.status IN ('canonical', 'reviewed', 'published')
  AND COALESCE(cd.category, '') IN (
    'founding_document',
    'journal',
    'economic_treatise',
    'creative_lore',
    'academic_document',
    'system_design',
    'reference',
    'founders-journal',
    'article',
    'innovation',
    'academic-paper'
  )
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
