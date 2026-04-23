-- K204: Dual-Render Publication System — academic metadata for cephas_content_registry
ALTER TABLE cephas_content_registry ADD COLUMN IF NOT EXISTS abstract TEXT;
ALTER TABLE cephas_content_registry ADD COLUMN IF NOT EXISTS paper_number TEXT;
ALTER TABLE cephas_content_registry ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'Jonathan Jones';
ALTER TABLE cephas_content_registry ADD COLUMN IF NOT EXISTS author_title TEXT DEFAULT 'Founder & General Manager, Liana Banyan Corporation';
ALTER TABLE cephas_content_registry ADD COLUMN IF NOT EXISTS publication_date DATE;
ALTER TABLE cephas_content_registry ADD COLUMN IF NOT EXISTS publication_type TEXT DEFAULT 'article';
ALTER TABLE cephas_content_registry ADD COLUMN IF NOT EXISTS related_slugs TEXT[] DEFAULT '{}';
ALTER TABLE cephas_content_registry ADD COLUMN IF NOT EXISTS citation_text TEXT;

-- Bump canonical innovation count
UPDATE platform_canonical SET value = '2128', updated_at = now()
WHERE key = 'innovation_count' AND value::int < 2128;

-- Log innovation
INSERT INTO innovation_log (innovation_number, title, description, category, status)
VALUES (2128, 'Dual-Render Publication System',
  'Academic view (Stanford-style: abstract, citation, author bio, PDF download, related papers) and Member view (three-level progressive disclosure with beacons, notes, X-Ray) for the same content. Toggle between modes.',
  'content', 'implemented')
ON CONFLICT (innovation_number) DO NOTHING;
