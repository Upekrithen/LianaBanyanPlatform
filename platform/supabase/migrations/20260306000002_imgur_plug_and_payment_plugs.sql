-- =====================================================================
-- Migration: Imgur Social Plug + Payment Plugs + As You Wish Confirmation
-- Date: March 6, 2026
-- Author: Bishop (Claude) under direction of Jonathan Jones, Founder
-- =====================================================================

-- =====================================================================
-- PART 1: Add Imgur to social_plug_features
-- =====================================================================

INSERT INTO social_plug_features (
  id, platform, display_name, icon, color, features,
  oauth_config, is_available, requires_approval, approval_status
) VALUES (
  gen_random_uuid(),
  'imgur',
  'Imgur',
  '🖼️',
  'bg-emerald-600',
  '{"login": true, "share": true, "upload": true, "gallery": true}'::jsonb,
  '{"authUrl": "https://api.imgur.com/oauth2/authorize", "tokenUrl": "https://api.imgur.com/oauth2/token", "scope": ""}'::jsonb,
  true,
  false,
  'approved'
) ON CONFLICT (platform) DO NOTHING;

-- =====================================================================
-- PART 2: Add Substack to social_plug_features (RSS-based, no OAuth)
-- =====================================================================

INSERT INTO social_plug_features (
  id, platform, display_name, icon, color, features,
  oauth_config, is_available, requires_approval, approval_status
) VALUES (
  gen_random_uuid(),
  'substack',
  'Substack',
  '📰',
  'bg-orange-500',
  '{"content_feed": true, "share": false, "login": false}'::jsonb,
  '{"type": "rss", "feedPattern": "https://{handle}.substack.com/feed"}'::jsonb,
  true,
  false,
  'approved'
) ON CONFLICT (platform) DO NOTHING;

-- =====================================================================
-- PART 3: Payment Plugs — External peer-to-peer payment rails
-- These are NOT payment processing (Stripe handles that).
-- These are member-exposed tip jars / donation rails.
-- =====================================================================

CREATE TABLE IF NOT EXISTS member_payment_plugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN (
    'paypal', 'kofi', 'venmo', 'cashapp', 'zelle'
  )),
  handle_or_url TEXT NOT NULL,
  display_name TEXT, -- e.g., "My PayPal" or "Business Venmo"
  is_active BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One entry per platform per user
  UNIQUE(user_id, platform)
);

-- RLS: Users manage only their own payment plugs
ALTER TABLE member_payment_plugs ENABLE ROW LEVEL SECURITY;

CREATE POLICY view_own_payment_plugs ON member_payment_plugs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY manage_own_payment_plugs ON member_payment_plugs
  FOR ALL USING (auth.uid() = user_id);

-- Public can view active payment plugs (for profile display)
CREATE POLICY view_active_payment_plugs ON member_payment_plugs
  FOR SELECT USING (is_active = true);

-- Trigger: Only one primary per user
CREATE OR REPLACE FUNCTION enforce_single_primary_payment_plug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = true THEN
    UPDATE member_payment_plugs
    SET is_primary = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_primary = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_single_primary_payment_plug
  BEFORE INSERT OR UPDATE ON member_payment_plugs
  FOR EACH ROW
  EXECUTE FUNCTION enforce_single_primary_payment_plug();

-- Index for profile lookups
CREATE INDEX IF NOT EXISTS idx_payment_plugs_user
  ON member_payment_plugs(user_id) WHERE is_active = true;

-- =====================================================================
-- PART 4: "As You Wish" Confirmation Phrase
-- Default is "As You Wish" — members can customize
-- =====================================================================

ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS confirmation_phrase TEXT DEFAULT 'As You Wish';

-- Add comment explaining the field
COMMENT ON COLUMN user_preferences.confirmation_phrase IS
  'Custom transaction confirmation phrase. Default: "As You Wish". '
  'Displayed on the confirmation button for all transactions (credit purchases, '
  'Swoop donations, orders, etc). Members may customize to their preference.';

-- =====================================================================
-- PART 5: Payment platform metadata (lookup table)
-- =====================================================================

CREATE TABLE IF NOT EXISTS payment_platform_registry (
  platform TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  url_pattern TEXT, -- e.g., 'paypal.me/{handle}'
  url_prefix TEXT,  -- e.g., 'https://paypal.me/'
  handle_prefix TEXT, -- e.g., '$' for Cash App, '@' for Venmo
  validation_regex TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO payment_platform_registry (platform, display_name, icon, color, url_pattern, url_prefix, handle_prefix, validation_regex, is_available)
VALUES
  ('paypal', 'PayPal', '💳', 'bg-blue-600', 'paypal.me/{handle}', 'https://paypal.me/', NULL, '^[a-zA-Z0-9._-]+$', true),
  ('kofi', 'Ko-fi', '☕', 'bg-sky-400', 'ko-fi.com/{handle}', 'https://ko-fi.com/', NULL, '^[a-zA-Z0-9_]+$', true),
  ('venmo', 'Venmo', '💙', 'bg-blue-500', '@{handle}', 'https://venmo.com/', '@', '^@?[a-zA-Z0-9._-]+$', true),
  ('cashapp', 'Cash App', '💚', 'bg-green-500', '${handle}', 'https://cash.app/', '$', '^\$?[a-zA-Z0-9_]+$', true),
  ('zelle', 'Zelle', '💜', 'bg-purple-600', '{handle}', NULL, NULL, '^[a-zA-Z0-9.@+_-]+$', true)
ON CONFLICT (platform) DO NOTHING;

-- Public read access for the registry
ALTER TABLE payment_platform_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY view_payment_platforms ON payment_platform_registry
  FOR SELECT USING (true);
