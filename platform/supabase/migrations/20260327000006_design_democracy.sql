-- ============================================================================
-- K135: Design Democracy — Element Overlays, Page Themes, Voting, Preferences
-- Innovations: #2010-#2014 | Crown Jewel: #2011
-- ============================================================================

-- ── 1. ELEMENT OVERLAYS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS element_overlays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  element_ref TEXT NOT NULL,
  page_path TEXT NOT NULL,
  submitted_by UUID REFERENCES auth.users(id) NOT NULL,
  overlay_type TEXT NOT NULL CHECK (overlay_type IN ('text','image','svg','html')),
  overlay_content TEXT NOT NULL,
  screenshot_before TEXT,
  screenshot_after TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','voting','approved','rejected','featured')),
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  lark_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ
);

ALTER TABLE element_overlays ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read approved overlays" ON element_overlays;
CREATE POLICY "Anyone can read approved overlays"
  ON element_overlays FOR SELECT
  USING (status IN ('approved','featured') OR auth.uid() = submitted_by);

DROP POLICY IF EXISTS "Users can submit overlays" ON element_overlays;
CREATE POLICY "Users can submit overlays"
  ON element_overlays FOR INSERT
  WITH CHECK (auth.uid() = submitted_by);

DROP POLICY IF EXISTS "Users can update own pending overlays" ON element_overlays;
CREATE POLICY "Users can update own pending overlays"
  ON element_overlays FOR UPDATE
  USING (auth.uid() = submitted_by AND status = 'pending');

CREATE INDEX IF NOT EXISTS idx_element_overlays_page ON element_overlays(page_path);
CREATE INDEX IF NOT EXISTS idx_element_overlays_status ON element_overlays(status);
CREATE INDEX IF NOT EXISTS idx_element_overlays_user ON element_overlays(submitted_by);

-- ── 2. PAGE THEMES ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS page_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT,
  theme_name TEXT NOT NULL,
  submitted_by UUID REFERENCES auth.users(id) NOT NULL,
  css_content TEXT NOT NULL,
  preview_screenshot TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','voting','approved','rejected','featured')),
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  scope TEXT NOT NULL DEFAULT 'page' CHECK (scope IN ('element','page','site')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE page_themes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read approved themes" ON page_themes;
CREATE POLICY "Anyone can read approved themes"
  ON page_themes FOR SELECT
  USING (status IN ('approved','featured') OR auth.uid() = submitted_by);

DROP POLICY IF EXISTS "Users can submit themes" ON page_themes;
CREATE POLICY "Users can submit themes"
  ON page_themes FOR INSERT
  WITH CHECK (auth.uid() = submitted_by);

DROP POLICY IF EXISTS "Users can update own pending themes" ON page_themes;
CREATE POLICY "Users can update own pending themes"
  ON page_themes FOR UPDATE
  USING (auth.uid() = submitted_by AND status = 'pending');

CREATE INDEX IF NOT EXISTS idx_page_themes_status ON page_themes(status);
CREATE INDEX IF NOT EXISTS idx_page_themes_page ON page_themes(page_path);
CREATE INDEX IF NOT EXISTS idx_page_themes_scope ON page_themes(scope);

-- ── 3. DESIGN VOTES (polymorphic — overlays, themes, contest submissions) ───
CREATE TABLE IF NOT EXISTS design_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id UUID REFERENCES auth.users(id) NOT NULL,
  voteable_type TEXT NOT NULL CHECK (voteable_type IN ('element_overlay','page_theme','design_contest_submission')),
  voteable_id UUID NOT NULL,
  vote INTEGER NOT NULL CHECK (vote IN (-1, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(voter_id, voteable_type, voteable_id)
);

ALTER TABLE design_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read design votes" ON design_votes;
CREATE POLICY "Authenticated can read design votes"
  ON design_votes FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can cast design votes" ON design_votes;
CREATE POLICY "Users can cast design votes"
  ON design_votes FOR INSERT
  WITH CHECK (auth.uid() = voter_id);

DROP POLICY IF EXISTS "Users can change own design votes" ON design_votes;
CREATE POLICY "Users can change own design votes"
  ON design_votes FOR UPDATE
  USING (auth.uid() = voter_id);

DROP POLICY IF EXISTS "Users can delete own design votes" ON design_votes;
CREATE POLICY "Users can delete own design votes"
  ON design_votes FOR DELETE
  USING (auth.uid() = voter_id);

CREATE INDEX IF NOT EXISTS idx_design_votes_voteable ON design_votes(voteable_type, voteable_id);
CREATE INDEX IF NOT EXISTS idx_design_votes_voter ON design_votes(voter_id);

-- ── 4. THEME PREFERENCES (personal / guild / tribe) ────────────────────────
CREATE TABLE IF NOT EXISTS theme_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('personal','guild','tribe')),
  scope_id UUID,
  active_theme_id UUID REFERENCES page_themes(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, scope, scope_id)
);

ALTER TABLE theme_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own theme preferences" ON theme_preferences;
CREATE POLICY "Users can read own theme preferences"
  ON theme_preferences FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own theme preferences" ON theme_preferences;
CREATE POLICY "Users can manage own theme preferences"
  ON theme_preferences FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_theme_prefs_user ON theme_preferences(user_id);

-- ── 5. UPDATE CANONICAL STATS ───────────────────────────────────────────────
INSERT INTO platform_canonical (key, value, description)
VALUES
  ('innovation_count', 2050, 'K135 adds #2010-#2014 (5 new)')
ON CONFLICT (key) DO UPDATE SET value = 2050, description = 'K135 adds #2010-#2014 (5 new)';

INSERT INTO platform_canonical (key, value, description)
VALUES
  ('crown_jewels', 138, 'K135 adds #2011 Community-Governed Visual Design')
ON CONFLICT (key) DO UPDATE SET value = 138, description = 'K135 adds #2011 Community-Governed Visual Design';

INSERT INTO platform_canonical (key, value, description)
VALUES
  ('production_systems', 27, 'K135 adds Design Democracy system')
ON CONFLICT (key) DO UPDATE SET value = 27, description = 'K135 adds Design Democracy system';
