-- ═══════════════════════════════════════════════════════════════════════════════
-- STACK OVERFLOW SUPPORT PLUG
-- Session 6L — Community-driven support via Stack Overflow (Imgur's model)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Instead of building a help desk, leverage Stack Overflow's infrastructure:
--   - Public Q&A (transparency)
--   - Community voting (members help members)
--   - Searchable knowledge base (every question = permanent documentation)
--   - Engineer monitoring via tag
--
-- Tag: "lianabanyan" on Stack Overflow
-- Integrates with: Didasko (learning), Harper Guild (verification), Dispatch
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── 1. Add Stack Overflow to social_plug_features ─────────────────────────────

INSERT INTO social_plug_features (platform, display_name, icon, color, features, is_available, requires_approval)
VALUES (
  'stackoverflow',
  'Stack Overflow',
  'help-circle',
  '#F48024',
  '{"community_qa": true, "tag_monitoring": true, "rss_feed": true, "api_search": true}'::jsonb,
  true,
  false
)
ON CONFLICT (platform) DO UPDATE SET
  features = EXCLUDED.features,
  is_available = EXCLUDED.is_available,
  updated_at = now();

-- ─── 2. Add "community-support" to platform_features for discovery tracking ───

INSERT INTO platform_features (slug, display_name, description, area, route, difficulty_tier, display_order)
VALUES (
  'community-support',
  'Community Support',
  'Ask questions and find answers via Stack Overflow',
  'social',
  '/support',
  1,
  5
)
ON CONFLICT (slug) DO NOTHING;

-- ─── 3. Add "stackoverflow" content topic (preference category) ────────────────

INSERT INTO content_topics (slug, display_name, description, icon, category, is_default_hidden, display_order)
VALUES (
  'developer',
  'Developer & Technical',
  'Code, APIs, technical implementation, Stack Overflow discussions',
  '💻',
  'preference',
  false,
  20
)
ON CONFLICT (slug) DO NOTHING;

-- ─── 4. DNA_LOCK: Stack Overflow configuration ────────────────────────────────

INSERT INTO dna_lock (parameter_key, parameter_value, data_type, is_locked, locked_by, description, category)
VALUES
  ('stackoverflow_tag', 'lianabanyan', 'text', true, 'CONSTITUTIONAL_FOUNDING',
   'Primary Stack Overflow tag for community support', 'support'),
  ('stackoverflow_api_daily_limit', '300', 'integer', false, 'PLATFORM_CONFIG',
   'Stack Exchange API daily request limit (300 free, 10K with key)', 'support'),
  ('support_method', 'community-first', 'text', true, 'CONSTITUTIONAL_FOUNDING',
   'Support model: community-driven via Stack Overflow, not private tickets', 'support')
ON CONFLICT (parameter_key) DO NOTHING;
