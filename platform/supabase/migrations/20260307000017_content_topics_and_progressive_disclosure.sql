-- ═══════════════════════════════════════════════════════════════════════════════
-- CONTENT TOPIC PREFERENCES + PROGRESSIVE DISCLOSURE
-- Session 6L — Imgur-inspired topic controls + 60/30/10 learning system
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- The Shirley Temple Policy has VERTICAL gating (ST → UV rating levels).
-- This adds HORIZONTAL filtering: topic-based content preferences.
--
-- Users choose which TOPICS they want to see less of (like Imgur's
-- Content Controls), independent of their rating level. A GA-rated user
-- might still want to filter out "politics" or "gore" topics.
--
-- The 60/30/10 progressive disclosure system tracks what the user has
-- LEARNED so they see the right balance of familiar (60%), next-step (30%),
-- and action-item (10%) content in the UI.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── 1. CONTENT TOPIC DEFINITIONS (platform-wide, admin-managed) ─────────────

CREATE TABLE IF NOT EXISTS content_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,            -- 'politics', 'scary', 'health', etc.
  display_name TEXT NOT NULL,           -- 'Politics & Current Events'
  description TEXT,                     -- 'News, elections, policy debate'
  icon TEXT,                            -- emoji or lucide icon name
  category TEXT NOT NULL DEFAULT 'general', -- 'safety', 'preference', 'sensitivity'
  is_default_hidden BOOLEAN NOT NULL DEFAULT false, -- Hidden by default for new users?
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE content_topics ENABLE ROW LEVEL SECURITY;

-- Everyone can read topic definitions
CREATE POLICY content_topics_read ON content_topics
  FOR SELECT USING (true);

-- Only admins can modify
CREATE POLICY content_topics_admin ON content_topics
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ─── 2. USER TOPIC PREFERENCES (per-user filtering choices) ─────────────────

CREATE TABLE IF NOT EXISTS user_topic_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES content_topics(id) ON DELETE CASCADE,
  visibility TEXT NOT NULL DEFAULT 'normal'
    CHECK (visibility IN ('normal', 'reduced', 'hidden')),
    -- 'normal' = show as usual
    -- 'reduced' = show less (de-prioritize in feeds)
    -- 'hidden' = don't show at all (unless explicitly searched)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

ALTER TABLE user_topic_preferences ENABLE ROW LEVEL SECURITY;

-- Users manage their own preferences
CREATE POLICY user_topic_prefs_own ON user_topic_preferences
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_topic_prefs_user
  ON user_topic_preferences(user_id);

-- ─── 3. CONTENT TOPIC TAGS (tag content with topics for filtering) ───────────

CREATE TABLE IF NOT EXISTS content_topic_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,           -- 'project', 'product', 'post', 'island', 'article'
  content_id UUID NOT NULL,             -- FK to the content item
  topic_id UUID NOT NULL REFERENCES content_topics(id) ON DELETE CASCADE,
  tagged_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(content_type, content_id, topic_id)
);

ALTER TABLE content_topic_tags ENABLE ROW LEVEL SECURITY;

-- Anyone can read tags (needed for filtering)
CREATE POLICY content_topic_tags_read ON content_topic_tags
  FOR SELECT USING (true);

-- Content owners and admins can tag
CREATE POLICY content_topic_tags_write ON content_topic_tags
  FOR INSERT WITH CHECK (auth.uid() = tagged_by);

CREATE INDEX IF NOT EXISTS idx_content_topic_tags_content
  ON content_topic_tags(content_type, content_id);

CREATE INDEX IF NOT EXISTS idx_content_topic_tags_topic
  ON content_topic_tags(topic_id);

-- ─── 4. BLOCKED TAGS (per-user tag blocking, like Imgur) ─────────────────────

CREATE TABLE IF NOT EXISTS user_blocked_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,                    -- Free-form tag to block
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, tag)
);

ALTER TABLE user_blocked_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_blocked_tags_own ON user_blocked_tags
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── 5. SEED DEFAULT CONTENT TOPICS ─────────────────────────────────────────

INSERT INTO content_topics (slug, display_name, description, icon, category, is_default_hidden, display_order) VALUES
  -- Safety topics (may be hidden by default for sensitive users)
  ('politics',      'Politics & Current Events',  'Political discussion, elections, policy debate',           '🏛️', 'sensitivity', false, 1),
  ('religion',      'Religion & Spirituality',     'Religious content, spiritual practices, faith discussion', '🙏', 'sensitivity', false, 2),
  ('scary',         'Scary & Horror',              'Horror content, creepy imagery, disturbing themes',        '👻', 'sensitivity', false, 3),
  ('sad',           'Sad & Heavy Topics',          'Grief, loss, depression, heavy emotional content',         '💙', 'sensitivity', false, 4),
  ('health_medical','Health & Medical',             'Medical conditions, health advice, body topics',           '🏥', 'sensitivity', false, 5),
  ('violence',      'Violence & Conflict',         'Combat, fighting, weapons, physical confrontation',        '⚔️', 'safety',      false, 6),

  -- Preference topics (never hidden by default, just personal preference)
  ('sports',        'Sports & Athletics',          'Sports news, competition, athletic content',               '⚽', 'preference',  false, 10),
  ('gaming',        'Gaming & Esports',            'Video games, tabletop gaming, game development',           '🎮', 'preference',  false, 11),
  ('food',          'Food & Cooking',              'Recipes, restaurant reviews, food culture',                '🍳', 'preference',  false, 12),
  ('music',         'Music & Audio',               'Music creation, concerts, audio production',               '🎵', 'preference',  false, 13),
  ('finance',       'Finance & Business',          'Business strategy, market analysis, entrepreneurship',     '📊', 'preference',  false, 14),
  ('tech',          'Technology & Code',           'Programming, hardware, AI, tech news',                     '💻', 'preference',  false, 15),
  ('art',           'Art & Creative',              'Visual art, photography, design, crafts',                  '🎨', 'preference',  false, 16),
  ('nature',        'Nature & Environment',        'Wildlife, environmental topics, outdoor activities',       '🌿', 'preference',  false, 17),
  ('parenting',     'Parenting & Family',          'Child-rearing, family dynamics, education',                '👨‍👩‍👧‍👦', 'preference',  false, 18),
  ('diy',           'DIY & Maker',                 'Building, crafting, 3D printing, maker culture',           '🔧', 'preference',  false, 19)
ON CONFLICT (slug) DO NOTHING;

-- ─── 6. PROGRESSIVE DISCLOSURE TRACKING (60/30/10 Rule) ─────────────────────
--
-- Tracks which features/areas a user has DISCOVERED and LEARNED.
-- Used to calculate the 60/30/10 balance:
--   60% familiar (mastered) → comfort zone, fast paths
--   30% next-step (discovered but not mastered) → gentle nudges
--   10% action-item (new, undiscovered) → bright CTA, draw-the-eye
--
-- Inspired by Samurai Jack's use of the 60/30/10 color rule:
-- vast calm backgrounds, supporting secondary elements, then the
-- small bright accent that your eye is drawn to.

CREATE TABLE IF NOT EXISTS user_feature_discovery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_slug TEXT NOT NULL,           -- 'deck-card-studio', 'payment-plugs', 'hex-isle', etc.
  feature_area TEXT NOT NULL,           -- 'navigation', 'portfolio', 'commerce', 'social', 'governance'
  discovery_level TEXT NOT NULL DEFAULT 'undiscovered'
    CHECK (discovery_level IN (
      'undiscovered',   -- Never seen (10% zone — bright accent CTA)
      'glimpsed',       -- Saw it once, didn't engage
      'explored',       -- Clicked in, looked around (30% zone — gentle nudge)
      'practiced',      -- Used it at least once
      'comfortable',    -- Used it multiple times (60% zone — familiar)
      'mastered'        -- Power user, no guidance needed
    )),
  first_seen_at TIMESTAMPTZ,           -- When user first encountered it
  first_used_at TIMESTAMPTZ,           -- When user first interacted
  use_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, feature_slug)
);

ALTER TABLE user_feature_discovery ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_feature_discovery_own ON user_feature_discovery
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_feature_discovery_user_level
  ON user_feature_discovery(user_id, discovery_level);

-- ─── 7. FEATURE CATALOG (what features exist for discovery tracking) ─────────

CREATE TABLE IF NOT EXISTS platform_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  area TEXT NOT NULL,                   -- 'navigation', 'portfolio', 'commerce', 'social', 'governance'
  icon TEXT,
  route TEXT,                           -- '/deck-card-studio', '/portfolio', etc.
  prerequisite_slugs TEXT[],            -- Features that should be learned first
  difficulty_tier INTEGER NOT NULL DEFAULT 1, -- 1=basic, 2=intermediate, 3=advanced
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE platform_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY platform_features_read ON platform_features
  FOR SELECT USING (true);

-- ─── 8. SEED PLATFORM FEATURES FOR DISCOVERY TRACKING ────────────────────────

INSERT INTO platform_features (slug, display_name, description, area, route, difficulty_tier, display_order) VALUES
  -- Tier 1: Basics (first session)
  ('profile',           'Your Profile',           'Set up your name, bio, and avatar',                    'navigation', '/profile',            1, 1),
  ('portfolio',         'Portfolio',               'Your public-facing project showcase',                  'portfolio',  '/portfolio',           1, 2),
  ('dispatch-plugs',    'Dispatch Plugins',        'Connect your social media accounts',                   'social',     '/dispatch',            1, 3),
  ('cold-start',        'Cold Start Dashboard',    'Platform transparency and status',                     'navigation', '/cold-start',          1, 4),

  -- Tier 2: Core Features (first week)
  ('deck-card-studio',  'Deck Card Studio',        'Create digital and physical business cards',            'portfolio',  '/deck-card-studio',    2, 10),
  ('payment-plugs',     'Payment Rails',           'Connect PayPal, Ko-fi, Venmo for tips',                'commerce',   '/payment-plugs',       2, 11),
  ('social-battery',    'The Battery',             'Schedule social media posts across platforms',           'social',     '/battery',             2, 12),
  ('content-feeds',     'Content Feeds',           'Add your Substack or RSS feeds to profile',             'social',     '/content-feeds',       2, 13),

  -- Tier 3: Advanced (power users)
  ('hex-isle',          'HexIsle',                 'Hexagonal terrain and island creation system',           'portfolio',  '/hex-isle',            3, 20),
  ('quest-system',      'Quest System',            'HexIsle quests and achievements',                       'governance', '/quests',              3, 21),
  ('ip-ledger',         'IP Ledger',               'Innovation tracking and IPFS proof chain',              'governance', '/ip-registration',     3, 22),
  ('three-gear',        'Three-Gear Currency',     'Credits, Marks, and Joules explained',                  'commerce',   '/currency',            3, 23),
  ('rally-group',       'Rally Group',             'Join and contribute to charitable initiatives',          'governance', '/rally-group',         3, 24),
  ('content-controls',  'Content Controls',        'Shirley Temple Policy topic filtering',                 'navigation', '/content-controls',    3, 25)
ON CONFLICT (slug) DO NOTHING;

-- ─── 9. DNA_LOCK: Constitutional content topic rules ─────────────────────────

INSERT INTO dna_lock (parameter_key, parameter_value, data_type, is_locked, locked_by, description, category)
VALUES
  ('content_topic_max_blocked', '100', 'integer', true, 'CONSTITUTIONAL_FOUNDING',
   'Maximum number of tags a user can block (matches Imgur limit)', 'content'),
  ('content_topic_filter_method', 'de-prioritize', 'text', true, 'CONSTITUTIONAL_FOUNDING',
   'Content filtering de-prioritizes rather than hard-blocks (user always has override)', 'content'),
  ('progressive_disclosure_ratio', '60/30/10', 'text', true, 'CONSTITUTIONAL_FOUNDING',
   'UI balance: 60% familiar, 30% next-step, 10% action-item (Samurai Jack principle)', 'ux')
ON CONFLICT (parameter_key) DO NOTHING;
