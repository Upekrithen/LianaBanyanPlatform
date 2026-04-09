-- B084: Update paper source paths and status now that Hugo files exist
-- Papers #36-#38 were created as placeholders; now full content is in Hugo

UPDATE cephas_content_registry
SET source_path = 'Cephas/cephas-hugo/content/academics/paper-36-wave-based-pricing.md',
    implementation_status = 'in_development',
    content_markdown = 'Full content now in Hugo file. See source_path.',
    updated_at = now()
WHERE slug = 'wave-based-pricing-impatience-tax';

UPDATE cephas_content_registry
SET source_path = 'Cephas/cephas-hugo/content/academics/paper-37-corporate-island.md',
    implementation_status = 'in_development',
    content_markdown = 'Full content now in Hugo file. See source_path.',
    updated_at = now()
WHERE slug = 'corporate-island-b2b-integration';

UPDATE cephas_content_registry
SET source_path = 'Cephas/cephas-hugo/content/academics/paper-38-gamified-generosity.md',
    implementation_status = 'in_development',
    content_markdown = 'Full content now in Hugo file. See source_path.',
    updated_at = now()
WHERE slug = 'gamified-generosity-corner-contributions';

-- Also update letter source paths now that Hugo files exist
UPDATE cephas_content_registry
SET source_path = 'Cephas/cephas-hugo/content/letters/circle-3-academics/LETTER-ANDREW-MCAFEE.md',
    content_markdown = 'Full content now in Hugo file. See source_path.',
    updated_at = now()
WHERE slug = 'letter-andrew-mcafee';

UPDATE cephas_content_registry
SET source_path = 'Cephas/cephas-hugo/content/letters/circle-3-academics/LETTER-CHAD-JONES.md',
    content_markdown = 'Full content now in Hugo file. See source_path.',
    updated_at = now()
WHERE slug = 'letter-chad-jones';

UPDATE cephas_content_registry
SET source_path = 'Cephas/cephas-hugo/content/letters/circle-3-academics/LETTER-CHRISTOPHER-TONETTI.md',
    content_markdown = 'Full content now in Hugo file. See source_path.',
    updated_at = now()
WHERE slug = 'letter-christopher-tonetti';

UPDATE cephas_content_registry
SET source_path = 'Cephas/cephas-hugo/content/letters/circle-3-academics/LETTER-DANIEL-ROCK.md',
    content_markdown = 'Full content now in Hugo file. See source_path.',
    updated_at = now()
WHERE slug = 'letter-daniel-rock';

UPDATE cephas_content_registry
SET source_path = 'Cephas/cephas-hugo/content/letters/circle-3-academics/LETTER-ETHAN-MOLLICK.md',
    content_markdown = 'Full content now in Hugo file. See source_path.',
    updated_at = now()
WHERE slug = 'letter-ethan-mollick';

UPDATE cephas_content_registry
SET source_path = 'Cephas/cephas-hugo/content/letters/circle-3-academics/RESPONSE-MCAFEE-NEWSLETTER.md',
    content_markdown = 'Full content now in Hugo file. See source_path.',
    updated_at = now()
WHERE slug = 'response-mcafee-newsletter';
