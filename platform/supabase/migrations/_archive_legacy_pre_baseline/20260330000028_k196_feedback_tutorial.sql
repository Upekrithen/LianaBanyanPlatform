-- K196: Interactive Feedback Tutorial — Sequential Submission Numbers + User Preferences
-- Innovation #2118 (Crown Jewel)

-- Ensure tour_notes tables exist (K195 dependency — idempotent)
CREATE TABLE IF NOT EXISTS tour_notes_personal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  item_slug TEXT NOT NULL,
  item_title TEXT NOT NULL,
  content TEXT NOT NULL,
  detail_level TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tour_notes_submitted (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  item_slug TEXT NOT NULL,
  item_title TEXT NOT NULL,
  content TEXT NOT NULL,
  detail_level TEXT,
  category TEXT DEFAULT 'uncategorized'
    CHECK (category IN ('correction', 'suggestion', 'question', 'praise', 'criticism', 'idea', 'uncategorized')),
  section_librarian INTEGER
    CHECK (section_librarian BETWEEN 1 AND 7),
  status TEXT DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'categorized', 'assigned', 'processing', 'resolved', 'archived')),
  resolution TEXT,
  response_to_member TEXT,
  processed_by TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS librarian_section_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_number INTEGER NOT NULL CHECK (section_number BETWEEN 1 AND 7),
  section_name TEXT NOT NULL,
  categories TEXT[] NOT NULL,
  description TEXT
);

-- RLS (idempotent via IF NOT EXISTS pattern)
ALTER TABLE tour_notes_personal ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_notes_submitted ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tour_notes_personal' AND policyname = 'Users manage own personal notes') THEN
    CREATE POLICY "Users manage own personal notes" ON tour_notes_personal FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tour_notes_submitted' AND policyname = 'Users can create submitted notes') THEN
    CREATE POLICY "Users can create submitted notes" ON tour_notes_submitted FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tour_notes_submitted' AND policyname = 'Users can view own submitted notes') THEN
    CREATE POLICY "Users can view own submitted notes" ON tour_notes_submitted FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tour_notes_submitted' AND policyname = 'Service role manages all submitted notes') THEN
    CREATE POLICY "Service role manages all submitted notes" ON tour_notes_submitted FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_submitted_notes_status ON tour_notes_submitted(status);
CREATE INDEX IF NOT EXISTS idx_submitted_notes_section ON tour_notes_submitted(section_librarian);
CREATE INDEX IF NOT EXISTS idx_personal_notes_user_slug ON tour_notes_personal(user_id, item_slug);

-- Seed 7 Section Librarians (idempotent)
INSERT INTO librarian_section_map (section_number, section_name, categories, description) VALUES
(1, 'Economics & Currency', ARRAY['economics', 'currency-architecture', 'sacred-texts'], 'Three-Gear system, Cost+20%, Credits, Marks, Joules'),
(2, 'Letters & Outreach', ARRAY['letters', 'outreach'], 'Crown Letters, partnership letters, media pitches'),
(3, 'Initiatives & Programs', ARRAY['initiatives', 'The Fourteen Projects', 'rally-group'], 'Sweet Sixteen, Rally Group, HexIsle programs'),
(4, 'Technology & Architecture', ARRAY['architecture', 'Infrastructure', 'deployment', 'Configuration'], 'Yggdrasil, Bifrost, HELM, system architecture'),
(5, 'Legal & Compliance', ARRAY['Privacy', 'governance', 'Governance', 'IP Protection'], 'Patents, bylaws, privacy, regulatory'),
(6, 'Content & Articles', ARRAY['articles', 'pudding', 'academic', 'academic-papers', 'Academics', 'Academic Papers'], 'Articles, pudding essays, academic papers'),
(7, 'HexIsle & Manufacturing', ARRAY['hexisle', 'bounties', 'kickstarter', 'innovations'], 'HexIsle, Canister System, manufacturing, Kickstarter')
ON CONFLICT DO NOTHING;

-- Sequential submission number on tour_notes_submitted
ALTER TABLE tour_notes_submitted
  ADD COLUMN IF NOT EXISTS submission_number SERIAL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_notes_submission_number
  ON tour_notes_submitted(submission_number);

-- User preferences table (lightweight, extensible)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT 'true'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, key)
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'Users manage own preferences') THEN
    CREATE POLICY "Users manage own preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- Innovation log
INSERT INTO innovation_log (innovation_number, title, description, category, status, is_crown_jewel)
VALUES (
  2118,
  'Interactive Feedback Tutorial with Sequential Tracking',
  'First-visit interactive tutorial overlay teaching the cooperative feedback mechanism. Three guided steps: (1) welcome with FEEDBACK REQUESTED banner over live content, (2) spotlight + animated arrow directing user to click content item, (3) notes overlay opens for user to write and submit. Submissions get sequential 8-digit numbers (SAVED as 00000129) visible to user. Dismissable with persistent do-not-show preference. Feeds into MoneyPenny categorization → Librarian Guild processing pipeline.',
  'user_experience',
  'implemented',
  true
) ON CONFLICT (innovation_number) DO NOTHING;

UPDATE platform_canonical SET value = '2118', updated_at = now() WHERE key = 'innovation_count';
UPDATE platform_canonical SET value = '164', updated_at = now() WHERE key = 'crown_jewel_count';
