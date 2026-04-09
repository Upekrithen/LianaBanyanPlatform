-- B084: Sync missing puddings into cephas_content_registry
-- Problem: CephasGatewayV2Page queries only cephas_content_registry,
-- but B083/B084 puddings (#160-#187) are in cephas_puddings only.

-- Step 1: Add 'pudding' to the category check constraint
ALTER TABLE cephas_content_registry DROP CONSTRAINT IF EXISTS cephas_content_registry_category_check;
ALTER TABLE cephas_content_registry ADD CONSTRAINT cephas_content_registry_category_check
  CHECK (category = ANY(ARRAY[
    'academic_paper','academic','crown_letter','outreach_letter','open_letter',
    'system_design','initiative','innovation','hexisle',
    'article','vault_archive','reference','under_the_hood','founder','pitch',
    'business-plan','pudding'
  ]));

-- Step 2: Sync B083 puddings (#160-#181) into registry
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
  AND p.pudding_number <= 181
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  style = EXCLUDED.style,
  source_path = EXCLUDED.source_path,
  bishop_session = EXCLUDED.bishop_session,
  updated_at = now();

-- Step 3: Sync B084 puddings (#182-#187) into registry
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
WHERE p.pudding_number >= 182
  AND p.pudding_number <= 187
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  style = EXCLUDED.style,
  source_path = EXCLUDED.source_path,
  bishop_session = EXCLUDED.bishop_session,
  updated_at = now();

-- Step 4: Fix article style for proper classification
UPDATE cephas_content_registry
SET style = 'article'
WHERE slug IN ('seven-ways-to-work', 'escape-velocity-program', 'documentation-as-democracy')
  AND style = 'pudding';
