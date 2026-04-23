-- ═══════════════════════════════════════════════════════════════════════════════
-- SUBSTACK & DISCORD PLUG FEATURES
-- Session 6L — Phase 4: Substack RSS + Discord deepening
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Substack: Content Feed Plug (RSS-based, no OAuth needed) ────────────────
-- social_plug_features stores one row per platform with features as JSONB

INSERT INTO social_plug_features (platform, display_name, icon, color, features, is_available, requires_approval)
VALUES (
  'substack',
  'Substack',
  'rss',
  '#FF6719',
  '{"rss_feed": true, "cross_post": false, "newsletter_link": true}'::jsonb,
  true,
  false
)
ON CONFLICT (platform) DO UPDATE SET
  features = EXCLUDED.features,
  is_available = EXCLUDED.is_available,
  updated_at = now();

-- ─── Discord: Ensure exists with deepened features ───────────────────────────

INSERT INTO social_plug_features (platform, display_name, icon, color, features, is_available, requires_approval)
VALUES (
  'discord',
  'Discord',
  'hash',
  '#5865F2',
  '{"webhook_post": true, "server_invite": true, "rally_group_channel": false}'::jsonb,
  true,
  false
)
ON CONFLICT (platform) DO UPDATE SET
  features = EXCLUDED.features,
  is_available = EXCLUDED.is_available,
  updated_at = now();

-- ─── Imgur: Ensure exists with full features ─────────────────────────────────

INSERT INTO social_plug_features (platform, display_name, icon, color, features, is_available, requires_approval)
VALUES (
  'imgur',
  'Imgur',
  'image',
  '#1BB76E',
  '{"image_upload": true, "gallery_post": true, "deck_card_export": true}'::jsonb,
  true,
  false
)
ON CONFLICT (platform) DO UPDATE SET
  features = EXCLUDED.features,
  is_available = EXCLUDED.is_available,
  updated_at = now();

-- ─── Member Content Feeds table (for Substack + future RSS sources) ──────────

CREATE TABLE IF NOT EXISTS member_content_feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT 'substack',
  feed_url TEXT NOT NULL,
  display_name TEXT,
  publication_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  show_on_profile BOOLEAN NOT NULL DEFAULT true,
  max_posts_displayed INTEGER NOT NULL DEFAULT 5,
  last_fetched_at TIMESTAMPTZ,
  last_post_title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, feed_url)
);

ALTER TABLE member_content_feeds ENABLE ROW LEVEL SECURITY;

-- Users can manage their own feeds
CREATE POLICY member_content_feeds_own ON member_content_feeds
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Anyone can see active feeds (for profile display)
CREATE POLICY member_content_feeds_public_read ON member_content_feeds
  FOR SELECT USING (is_active = true AND show_on_profile = true);

-- Index for profile lookups
CREATE INDEX IF NOT EXISTS idx_member_content_feeds_user_active
  ON member_content_feeds(user_id) WHERE is_active = true;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_content_feeds_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_content_feeds_updated_at ON member_content_feeds;
CREATE TRIGGER trg_content_feeds_updated_at
  BEFORE UPDATE ON member_content_feeds
  FOR EACH ROW EXECUTE FUNCTION update_content_feeds_updated_at();

-- ─── Discord Server Invites (add columns to user_social_plugs) ───────────────

ALTER TABLE user_social_plugs
  ADD COLUMN IF NOT EXISTS server_invite_url TEXT,
  ADD COLUMN IF NOT EXISTS webhook_url TEXT;

COMMENT ON COLUMN user_social_plugs.server_invite_url IS 'Discord server invite link displayed in profile';
COMMENT ON COLUMN user_social_plugs.webhook_url IS 'Discord webhook URL for posting from The Battery';
