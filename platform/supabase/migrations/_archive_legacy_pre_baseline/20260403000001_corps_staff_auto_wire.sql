-- ============================================================
-- CORPS → STAFF AUTO-WIRE: Domain Taxonomy Bridge + Schema Updates
-- Innovation: Staff of Librarians Pipeline (#2117)
-- B064 / Knight Session
-- ============================================================

-- 1. Domain taxonomy bridge — canonical mapping between SP-3, Section Librarians, MCP domains
CREATE TABLE IF NOT EXISTS domain_taxonomy_bridge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sp3_section TEXT NOT NULL,
  section_librarian INTEGER NOT NULL CHECK (section_librarian BETWEEN 1 AND 7),
  mcp_domains TEXT[] DEFAULT '{}',
  cephas_category TEXT,
  helm_content_type TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed the 10 canonical mappings
INSERT INTO domain_taxonomy_bridge (sp3_section, section_librarian, mcp_domains, cephas_category, helm_content_type, description) VALUES
  ('01_BLUEPRINTS', 4, ARRAY['helm','innovation'], 'system_design', 'cephas_article', 'Blueprints → Technology & Architecture'),
  ('02_WRITTEN', 6, ARRAY['content','outreach'], 'article', 'pudding_essay', 'Written content → Content & Articles'),
  ('03_PATENT_BAGS', 5, ARRAY['innovation','defense'], 'innovation', NULL, 'Patents → Legal & Compliance (manual review)'),
  ('04_PRESS_ARTICLES', 2, ARRAY['outreach','social_media'], 'article', 'press_material', 'Press → Letters & Outreach'),
  ('05_TECHNICAL_SPECS', 4, ARRAY['helm','manufacturing','governance'], 'system_design', 'cephas_article', 'Tech specs → Technology & Architecture'),
  ('06_CAMPAIGN_MATERIALS', 3, ARRAY['beacon','storefront','hex_isle'], 'initiative', 'media_post', 'Campaigns → Initiatives & Programs'),
  ('07_REFERENCE_MATERIALS', 6, ARRAY['content','ghost_world'], 'reference', 'cephas_article', 'Reference → Content & Articles'),
  ('08_JOURNALS', 6, ARRAY['content'], 'article', 'cephas_article', 'Journals → Content & Articles'),
  ('09_CONTEXT_MANAGEMENT', 4, ARRAY['helm'], 'system_design', NULL, 'Context → Technology & Architecture (internal)'),
  ('10_LETTERS', 2, ARRAY['outreach','political'], 'crown_letter', 'crown_letter', 'Letters → Letters & Outreach')
ON CONFLICT DO NOTHING;

ALTER TABLE domain_taxonomy_bridge ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read domain_taxonomy_bridge" ON domain_taxonomy_bridge FOR SELECT USING (true);

-- 2. Add corps_source columns to content_pipeline
ALTER TABLE content_pipeline
  ADD COLUMN IF NOT EXISTS corps_source JSONB,
  ADD COLUMN IF NOT EXISTS section_librarian INTEGER;

-- 3. Add corps columns + staff review fields to helm_content_queue
ALTER TABLE helm_content_queue
  ADD COLUMN IF NOT EXISTS corps_source JSONB,
  ADD COLUMN IF NOT EXISTS section_librarian INTEGER,
  ADD COLUMN IF NOT EXISTS auto_ingested BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS creation_context TEXT,
  ADD COLUMN IF NOT EXISTS bishop_session TEXT,
  ADD COLUMN IF NOT EXISTS knight_session TEXT,
  ADD COLUMN IF NOT EXISTS decision_log TEXT[],
  ADD COLUMN IF NOT EXISTS technical_summary TEXT,
  ADD COLUMN IF NOT EXISTS implementation_status TEXT;

CREATE INDEX IF NOT EXISTS idx_helm_content_queue_auto_ingested
  ON helm_content_queue (auto_ingested) WHERE auto_ingested = true;

-- 4. Expand helm_content_queue status CHECK to include ready_to_send
ALTER TABLE helm_content_queue DROP CONSTRAINT IF EXISTS helm_content_queue_status_check;
ALTER TABLE helm_content_queue ADD CONSTRAINT helm_content_queue_status_check
  CHECK (status IN (
    'draft', 'in_review', 'approved', 'rejected', 'sent', 'published', 'archived',
    'ready_to_send'
  ));

-- 5. Expand cephas_content_registry category CHECK to include fly_on_the_wall
--    (under_the_hood already present from 20260328000005)
ALTER TABLE cephas_content_registry DROP CONSTRAINT IF EXISTS cephas_content_registry_category_check;
ALTER TABLE cephas_content_registry ADD CONSTRAINT cephas_content_registry_category_check
  CHECK (category = ANY(ARRAY[
    'academic_paper','academic','crown_letter','outreach_letter','open_letter',
    'system_design','initiative','innovation','hexisle',
    'article','vault_archive','reference','under_the_hood','founder','pitch',
    'business-plan','fly_on_the_wall'
  ]));
