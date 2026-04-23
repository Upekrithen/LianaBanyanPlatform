-- Out of Bounds: External posting pipeline (compose → post → track)
-- Innovation #1912: Out of Bounds (External Discussion Pipeline)

CREATE TABLE IF NOT EXISTS oob_plugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  platform TEXT NOT NULL,
  platform_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS oob_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  format_overrides JSONB DEFAULT '{}',
  target_plugs UUID[] NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  post_results JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE oob_plugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE oob_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own plugs" ON oob_plugs
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users manage own plugs" ON oob_plugs
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users see own oob posts" ON oob_posts
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users manage own oob posts" ON oob_posts
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

CREATE INDEX idx_oob_plugs_user ON oob_plugs(user_id);
CREATE INDEX idx_oob_posts_user ON oob_posts(user_id);
CREATE INDEX idx_oob_posts_status ON oob_posts(status);
