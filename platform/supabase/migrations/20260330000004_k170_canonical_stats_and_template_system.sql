-- K170: Dynamic Stats Template System
-- Adds new canonical stat rows for Cephas template interpolation.
-- Expands cephas_content_registry category constraint for 'business-plan'.

-- ═══════════════════════════════════════════════════════════
-- 1. New platform_canonical rows for template variables
-- ═══════════════════════════════════════════════════════════

INSERT INTO platform_canonical (key, value) VALUES
  ('charitable_initiatives', 16),
  ('founder_age', 53),
  ('dirty_dozen_green', 5),
  ('pudding_articles', 22),
  ('academic_papers', 7),
  ('knight_sessions', 170),
  ('bishop_sessions', 48),
  ('pawn_batches', 28)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- ═══════════════════════════════════════════════════════════
-- 2. Expand category CHECK for 'business-plan'
-- ═══════════════════════════════════════════════════════════

ALTER TABLE cephas_content_registry DROP CONSTRAINT IF EXISTS cephas_content_registry_category_check;
ALTER TABLE cephas_content_registry ADD CONSTRAINT cephas_content_registry_category_check
  CHECK (category = ANY(ARRAY[
    'academic_paper','academic','crown_letter','outreach_letter','open_letter',
    'system_design','initiative','innovation','hexisle',
    'article','vault_archive','reference','under_the_hood','founder','pitch',
    'business-plan'
  ]));
