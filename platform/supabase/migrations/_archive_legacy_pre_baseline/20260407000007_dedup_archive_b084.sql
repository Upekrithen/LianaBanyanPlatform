-- ============================================================================
-- MIGRATION: Deduplicate compiled_documents archive (B084)
-- ============================================================================
-- 1. Delete the incorrect "a-considered-approach-to-sustained-economic-prosperity"
--    (missing "universal" in title). Keep the correct full-title version.
-- 2. For auto/BISHOP duplicate pairs sharing the same family_name, keep the one
--    with more content (larger compiled_markdown). Delete the smaller duplicate.
-- 3. Mark "Considered Approach 01/02/03" ECONOMIC_PHILOSOPHY drafts with a note
--    pointing to the canonical version.
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Delete the wrong "Considered Approach" (missing "Universal")
-- ============================================================================
-- ID: 75b0f7b2-d114-42c2-b897-79f4c661aa8c
-- slug: auto-compiled-a-considered-approach-to-sustained-economic-prosperity
-- family_name: a-considered-approach-to-sustained-economic-prosperity (wrong)
-- The correct entry has family_name containing "universal"
DELETE FROM compiled_documents
WHERE id = '75b0f7b2-d114-42c2-b897-79f4c661aa8c'
  AND slug = 'auto-compiled-a-considered-approach-to-sustained-economic-prosperity';

-- ============================================================================
-- STEP 2: Deduplicate auto vs BISHOP pairs (229 pairs)
-- Strategy: For each family_name that has both an 'auto' and 'BISHOP' entry,
-- keep the one with the larger compiled_markdown content. Delete the smaller.
-- When sizes are equal, prefer BISHOP (curated) over auto.
-- ============================================================================

-- Delete the 'auto' entry when BISHOP has equal or more content
DELETE FROM compiled_documents
WHERE id IN (
  SELECT a.id
  FROM compiled_documents a
  JOIN compiled_documents b ON a.family_name = b.family_name
  WHERE a.compiled_by = 'auto'
    AND b.compiled_by = 'BISHOP'
    AND COALESCE(length(b.compiled_markdown), 0) >= COALESCE(length(a.compiled_markdown), 0)
);

-- Delete the 'BISHOP' entry when auto has strictly more content
DELETE FROM compiled_documents
WHERE id IN (
  SELECT b.id
  FROM compiled_documents a
  JOIN compiled_documents b ON a.family_name = b.family_name
  WHERE a.compiled_by = 'auto'
    AND b.compiled_by = 'BISHOP'
    AND COALESCE(length(a.compiled_markdown), 0) > COALESCE(length(b.compiled_markdown), 0)
);

-- ============================================================================
-- STEP 3: Annotate "Considered Approach 01/02/03" drafts from ECONOMIC_PHILOSOPHY
-- These are draft versions; the canonical is "A Considered Approach to Sustained
-- Universal Economic Prosperity" in SACRED_TEXTS family.
-- ============================================================================
UPDATE compiled_documents
SET compilation_notes = COALESCE(compilation_notes, '') ||
  CASE WHEN compilation_notes IS NOT NULL AND compilation_notes != '' THEN ' | ' ELSE '' END ||
  'Draft version. Canonical: "A Considered Approach to Sustained Universal Economic Prosperity" (SACRED_TEXTS family, slug: a-considered-approach-to-sustained-universal-economic-prosperity)'
WHERE slug IN (
  'considered-approach-01-converted',
  'considered-approach-02-converted',
  'considered-approach-03-converted'
)
AND family_name = 'ECONOMIC_PHILOSOPHY';

-- ============================================================================
-- STEP 4: Backfill content_size_bytes for all rows that have content but no size
-- ============================================================================
UPDATE compiled_documents
SET content_size_bytes = length(compiled_markdown)
WHERE compiled_markdown IS NOT NULL
  AND content_size_bytes IS NULL;

COMMIT;
