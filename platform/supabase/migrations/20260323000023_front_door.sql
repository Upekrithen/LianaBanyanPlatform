-- ============================================
-- MIGRATION: 20260323000023_front_door.sql
-- Knight Session 91: The Front Door
-- member_profiles + notifications
-- ============================================

-- Member Profiles
CREATE TABLE IF NOT EXISTS member_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  is_public BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  attribution_source TEXT,
  joined_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE member_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles viewable by anyone"
  ON member_profiles FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view own profile always"
  ON member_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own profile"
  ON member_profiles FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admin manages all profiles"
  ON member_profiles FOR ALL
  USING (public.is_admin());

-- Username generation helper
CREATE OR REPLACE FUNCTION generate_username(base_name TEXT)
RETURNS TEXT AS $$
DECLARE
  candidate TEXT;
  suffix INT;
BEGIN
  candidate := lower(regexp_replace(base_name, '[^a-zA-Z0-9]', '', 'g'));
  IF length(candidate) < 3 THEN
    candidate := 'member';
  END IF;
  candidate := left(candidate, 20);
  IF NOT EXISTS (SELECT 1 FROM member_profiles WHERE username = candidate) THEN
    RETURN candidate;
  END IF;
  suffix := 1;
  WHILE EXISTS (SELECT 1 FROM member_profiles WHERE username = candidate || suffix::TEXT) LOOP
    suffix := suffix + 1;
  END LOOP;
  RETURN candidate || suffix::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can mark own notifications read"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System creates notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin manages all notifications"
  ON notifications FOR ALL
  USING (public.is_admin());

-- Indexes
CREATE INDEX idx_notifications_user_unread
  ON notifications(user_id)
  WHERE read_at IS NULL;

CREATE INDEX idx_notifications_user_created
  ON notifications(user_id, created_at DESC);

CREATE INDEX idx_member_profiles_username
  ON member_profiles(username);

-- Trigger: auto-update updated_at on member_profiles
CREATE OR REPLACE FUNCTION update_member_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_member_profiles_updated
  BEFORE UPDATE ON member_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_member_profile_timestamp();
