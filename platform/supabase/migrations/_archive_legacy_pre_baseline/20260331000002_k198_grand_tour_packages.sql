-- K198: Grand Tour Packages with Marks Earning
-- Bishop B052 — themed tour "rides" that award Marks on completion

-- ── Tour packages (the "rides") ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS tour_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  estimated_minutes INT NOT NULL DEFAULT 15,
  marks_reward INT NOT NULL DEFAULT 10,
  stop_slugs TEXT[] NOT NULL,
  is_published BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tour_package_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  package_slug TEXT NOT NULL REFERENCES tour_packages(slug),
  current_stop_index INT DEFAULT 0,
  completed_stops TEXT[] DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  marks_awarded BOOLEAN DEFAULT false,
  UNIQUE(user_id, package_slug)
);

ALTER TABLE tour_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_package_progress ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view published packages' AND tablename = 'tour_packages') THEN
    CREATE POLICY "Anyone can view published packages" ON tour_packages FOR SELECT USING (is_published = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own progress' AND tablename = 'tour_package_progress') THEN
    CREATE POLICY "Users manage own progress" ON tour_package_progress FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── Seed 4 starter packages ─────────────────────────────────────────

INSERT INTO tour_packages (slug, title, subtitle, icon, category, difficulty, estimated_minutes, marks_reward, stop_slugs, sort_order) VALUES
('the-fable-trail', 'The Fable Trail', 'Meet the Little Red Hen and learn why we exist', '🐔', 'intro', 'beginner', 10, 10,
  ARRAY['the-little-red-hen', 'help-each-other', 'cost-plus-twenty', 'no-effort-is-wasted'], 1),

('the-makers-walk', 'The Maker''s Walk', 'See how things get built — from idea to shelf', '🔩', 'manufacturing', 'intermediate', 20, 15,
  ARRAY['decentralized-factory', 'six-production-levels', 'canister-system', 'proteus-manufacturing'], 2),

('the-money-map', 'The Money Map', 'Understand Credits, Marks, and Joules', '💰', 'economics', 'intermediate', 15, 15,
  ARRAY['three-currency-system', 'cost-plus-twenty', 'marks-explained', 'joules-forever-stamps'], 3),

('the-founders-path', 'The Founder''s Path', 'The complete deep dive — every system, every innovation', '🗺️', 'full', 'advanced', 60, 25,
  ARRAY['the-little-red-hen', 'help-each-other', 'three-currency-system', 'cost-plus-twenty', 'six-production-levels', 'decentralized-factory', 'sixteen-initiatives', 'crown-jewels-overview'], 4)
ON CONFLICT (slug) DO NOTHING;
