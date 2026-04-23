-- K195: Content Notes Overlay + Librarian Processing Pipeline
-- Innovation #2117 (Crown Jewel)

-- ═══════════════════════════════════════════════════════════════
-- Personal notes (saved in DB for authenticated users)
-- ═══════════════════════════════════════════════════════════════
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

-- ═══════════════════════════════════════════════════════════════
-- Submitted notes — cooperative review pipeline
-- ═══════════════════════════════════════════════════════════════
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

-- ═══════════════════════════════════════════════════════════════
-- Section Librarian assignments (content domain → section)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS librarian_section_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_number INTEGER NOT NULL CHECK (section_number BETWEEN 1 AND 7),
  section_name TEXT NOT NULL,
  categories TEXT[] NOT NULL,
  description TEXT
);

-- ═══════════════════════════════════════════════════════════════
-- RLS
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE tour_notes_personal ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_notes_submitted ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own personal notes" ON tour_notes_personal
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can create submitted notes" ON tour_notes_submitted
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own submitted notes" ON tour_notes_submitted
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role manages all submitted notes" ON tour_notes_submitted
  FOR ALL USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════
-- Indexes
-- ═══════════════════════════════════════════════════════════════
CREATE INDEX idx_submitted_notes_status ON tour_notes_submitted(status);
CREATE INDEX idx_submitted_notes_section ON tour_notes_submitted(section_librarian);
CREATE INDEX idx_personal_notes_user_slug ON tour_notes_personal(user_id, item_slug);

-- ═══════════════════════════════════════════════════════════════
-- Seed 7 Section Librarians
-- ═══════════════════════════════════════════════════════════════
INSERT INTO librarian_section_map (section_number, section_name, categories, description) VALUES
(1, 'Economics & Currency', ARRAY['economics', 'currency-architecture', 'sacred-texts'], 'Three-Gear system, Cost+20%, Credits, Marks, Joules'),
(2, 'Letters & Outreach', ARRAY['letters', 'outreach'], 'Crown Letters, partnership letters, media pitches'),
(3, 'Initiatives & Programs', ARRAY['initiatives', 'The Fourteen Projects', 'rally-group'], 'Sweet Sixteen, Rally Group, HexIsle programs'),
(4, 'Technology & Architecture', ARRAY['architecture', 'Infrastructure', 'deployment', 'Configuration'], 'Yggdrasil, Bifrost, HELM, system architecture'),
(5, 'Legal & Compliance', ARRAY['Privacy', 'governance', 'Governance', 'IP Protection'], 'Patents, bylaws, privacy, regulatory'),
(6, 'Content & Articles', ARRAY['articles', 'pudding', 'academic', 'academic-papers', 'Academics', 'Academic Papers'], 'Articles, pudding essays, academic papers'),
(7, 'HexIsle & Manufacturing', ARRAY['hexisle', 'bounties', 'kickstarter', 'innovations'], 'HexIsle, Canister System, manufacturing, Kickstarter');

-- ═══════════════════════════════════════════════════════════════
-- Innovation #2117 — Crown Jewel
-- ═══════════════════════════════════════════════════════════════
INSERT INTO innovation_log (innovation_number, title, description, category, status)
VALUES (
  2117,
  'Content Notes Overlay with Librarian Processing Pipeline',
  'Floating overlay for annotating any content item during Guided Tour or content browsing. Dual-path: save locally as personal notes or submit for cooperative review. Submitted notes categorized by MoneyPenny (correction/suggestion/question/praise/criticism/idea), routed to 7 Section Librarians by content domain. Librarians process notes: incorporate corrections, answer questions (response sent to member), flag suggestions for Founder. Reuses XRayOverlay floating panel pattern.',
  'community',
  'implemented'
) ON CONFLICT (innovation_number) DO NOTHING;

UPDATE platform_canonical SET value = 2117, updated_at = now() WHERE key = 'innovation_count';

UPDATE innovation_log SET is_crown_jewel = true WHERE innovation_number = 2117;
UPDATE innovation_log SET is_crown_jewel = true WHERE innovation_number = 2115;

UPDATE platform_canonical SET value = 163, updated_at = now() WHERE key = 'crown_jewel_count';
UPDATE platform_canonical SET value = 195, updated_at = now() WHERE key = 'knight_sessions';
