-- K193: Replace hardcoded stat numbers in helm_content_queue and cephas_content_registry
-- with {{variableName}} template tokens so the Content Command Center renders live values.
-- LOCKED / already-approved items are excluded to preserve finalized documents.

-- ============================================================
-- HELM CONTENT QUEUE — templatize content_markdown
-- ============================================================

-- Innovation counts (various stale numbers)
UPDATE helm_content_queue
SET content_markdown = regexp_replace(content_markdown, '2,10[0-9] innovations', '{{innovationCount}} innovations', 'g'),
    updated_at = now()
WHERE content_markdown ~ '2,10[0-9] innovations'
  AND status NOT IN ('sent', 'published', 'archived');

UPDATE helm_content_queue
SET content_markdown = regexp_replace(content_markdown, '2,11[0-9] innovations', '{{innovationCount}} innovations', 'g'),
    updated_at = now()
WHERE content_markdown ~ '2,11[0-9] innovations'
  AND status NOT IN ('sent', 'published', 'archived');

UPDATE helm_content_queue
SET content_markdown = regexp_replace(content_markdown, '2,12[0-9] innovations', '{{innovationCount}} innovations', 'g'),
    updated_at = now()
WHERE content_markdown ~ '2,12[0-9] innovations'
  AND status NOT IN ('sent', 'published', 'archived');

-- Crown Jewels (various counts)
UPDATE helm_content_queue
SET content_markdown = regexp_replace(content_markdown, '1[56][0-9] Crown Jewels', '{{crownJewelCount}} Crown Jewels', 'g'),
    updated_at = now()
WHERE content_markdown ~ '1[56][0-9] Crown Jewels'
  AND status NOT IN ('sent', 'published', 'archived');

UPDATE helm_content_queue
SET content_markdown = regexp_replace(content_markdown, '1[56][0-9] crown jewels', '{{crownJewelCount}} crown jewels', 'g'),
    updated_at = now()
WHERE content_markdown ~ '1[56][0-9] crown jewels'
  AND status NOT IN ('sent', 'published', 'archived');

-- Patent applications (11 provisional)
UPDATE helm_content_queue
SET content_markdown = regexp_replace(content_markdown, '11 provisional', '{{provisionalApps}} provisional', 'g'),
    updated_at = now()
WHERE content_markdown ~ '11 provisional'
  AND content_markdown !~ '\{\{provisionalApps\}\}'
  AND status NOT IN ('sent', 'published', 'archived');

-- Formal claims (various counts)
UPDATE helm_content_queue
SET content_markdown = regexp_replace(content_markdown, '2,0[5-9][0-9] formal claims', '{{formalClaimsCount}} formal claims', 'g'),
    updated_at = now()
WHERE content_markdown ~ '2,0[5-9][0-9] formal claims'
  AND status NOT IN ('sent', 'published', 'archived');

-- Charitable initiatives count (only in stat contexts, not prose like "16 years")
UPDATE helm_content_queue
SET content_markdown = regexp_replace(content_markdown, '16 charitable initiatives', '{{initiativeCount}} charitable initiatives', 'g'),
    updated_at = now()
WHERE content_markdown ~ '16 charitable initiatives'
  AND status NOT IN ('sent', 'published', 'archived');

-- ============================================================
-- CEPHAS CONTENT REGISTRY — same templatization
-- ============================================================

UPDATE cephas_content_registry
SET content_markdown = regexp_replace(content_markdown, '2,10[0-9] innovations', '{{innovationCount}} innovations', 'g'),
    updated_at = now()
WHERE content_markdown ~ '2,10[0-9] innovations';

UPDATE cephas_content_registry
SET content_markdown = regexp_replace(content_markdown, '2,11[0-9] innovations', '{{innovationCount}} innovations', 'g'),
    updated_at = now()
WHERE content_markdown ~ '2,11[0-9] innovations';

UPDATE cephas_content_registry
SET content_markdown = regexp_replace(content_markdown, '2,12[0-9] innovations', '{{innovationCount}} innovations', 'g'),
    updated_at = now()
WHERE content_markdown ~ '2,12[0-9] innovations';

UPDATE cephas_content_registry
SET content_markdown = regexp_replace(content_markdown, '1[56][0-9] Crown Jewels', '{{crownJewelCount}} Crown Jewels', 'g'),
    updated_at = now()
WHERE content_markdown ~ '1[56][0-9] Crown Jewels';

UPDATE cephas_content_registry
SET content_markdown = regexp_replace(content_markdown, '1[56][0-9] crown jewels', '{{crownJewelCount}} crown jewels', 'g'),
    updated_at = now()
WHERE content_markdown ~ '1[56][0-9] crown jewels';

UPDATE cephas_content_registry
SET content_markdown = regexp_replace(content_markdown, '11 provisional', '{{provisionalApps}} provisional', 'g'),
    updated_at = now()
WHERE content_markdown ~ '11 provisional'
  AND content_markdown !~ '\{\{provisionalApps\}\}';

UPDATE cephas_content_registry
SET content_markdown = regexp_replace(content_markdown, '2,0[5-9][0-9] formal claims', '{{formalClaimsCount}} formal claims', 'g'),
    updated_at = now()
WHERE content_markdown ~ '2,0[5-9][0-9] formal claims';

UPDATE cephas_content_registry
SET content_markdown = regexp_replace(content_markdown, '16 charitable initiatives', '{{initiativeCount}} charitable initiatives', 'g'),
    updated_at = now()
WHERE content_markdown ~ '16 charitable initiatives';
