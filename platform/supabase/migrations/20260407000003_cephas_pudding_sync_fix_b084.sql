-- B084: Sync missing puddings into cephas_content_registry (fix)
-- Previous migration 000002 rolled back due to style constraint error.
-- This migration does ONLY the working parts.

-- Step 1: Add 'pudding' to category constraint
ALTER TABLE cephas_content_registry DROP CONSTRAINT IF EXISTS cephas_content_registry_category_check;
ALTER TABLE cephas_content_registry ADD CONSTRAINT cephas_content_registry_category_check
  CHECK (category = ANY(ARRAY[
    'academic_paper','academic','crown_letter','outreach_letter','open_letter',
    'system_design','initiative','innovation','hexisle',
    'article','vault_archive','reference','under_the_hood','founder','pitch',
    'business-plan','pudding'
  ]));

-- Step 2: Sync ALL puddings from cephas_puddings that aren't in registry yet
INSERT INTO cephas_content_registry (
  slug, title, category, style, source_path,
  implementation_status, bishop_session, content_markdown
)
SELECT
  p.slug,
  p.title,
  'pudding',
  'pudding',
  'Cephas/cephas-hugo/content/pudding/' || p.slug || '.md',
  'in_development',
  p.bishop_session,
  COALESCE(LEFT(p.pudding_text, 500), 'See Hugo file for full content.')
FROM cephas_puddings p
WHERE p.pudding_number >= 160
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  style = EXCLUDED.style,
  source_path = EXCLUDED.source_path,
  bishop_session = EXCLUDED.bishop_session,
  updated_at = now();
