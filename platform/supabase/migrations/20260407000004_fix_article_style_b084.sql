-- Fix: 3 B084 Cephas articles have style='pudding' which causes inferFamily()
-- to classify them as puddings instead of articles.
-- Change to 'clean_academic' so they fall through to the articles bucket.

UPDATE cephas_content_registry
SET style = 'clean_academic', updated_at = now()
WHERE slug IN ('seven-ways-to-work', 'escape-velocity-program', 'documentation-as-democracy')
  AND category = 'article';
