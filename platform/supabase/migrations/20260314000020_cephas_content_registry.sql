-- Cephas Content Registry — document deployment, Under the Hood, Fly on the Wall (Session 19)

CREATE TABLE IF NOT EXISTS public.cephas_content_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'academic_paper', 'crown_letter', 'outreach_letter', 'open_letter',
    'system_design', 'initiative', 'innovation', 'hexisle',
    'article', 'vault_archive', 'reference'
  )),
  subcategory TEXT,
  source_path TEXT NOT NULL,
  content_markdown TEXT,
  style TEXT NOT NULL CHECK (style IN ('clean_academic', 'pudding')),
  version TEXT DEFAULT '1.0',

  -- Under the Hood (technical transparency)
  technical_summary TEXT,
  innovation_ids TEXT[],
  related_patents TEXT[],
  system_components TEXT[],
  implementation_status TEXT DEFAULT 'planned' CHECK (implementation_status IN ('live', 'planned', 'in_development')),

  -- Fly on the Wall (observation log)
  creation_context TEXT,
  revision_history TEXT[],
  bishop_session TEXT,
  knight_session TEXT,
  decision_log TEXT[],

  -- Full-text search
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(technical_summary, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(content_markdown, '')), 'C')
  ) STORED,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cephas_search ON public.cephas_content_registry USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_cephas_category ON public.cephas_content_registry(category);
CREATE INDEX IF NOT EXISTS idx_cephas_style ON public.cephas_content_registry(style);
CREATE INDEX IF NOT EXISTS idx_cephas_slug ON public.cephas_content_registry(slug);

ALTER TABLE public.cephas_content_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read cephas content registry" ON public.cephas_content_registry FOR SELECT USING (true);
CREATE POLICY "Service role manage cephas content registry" ON public.cephas_content_registry FOR ALL USING (auth.role() = 'service_role');
