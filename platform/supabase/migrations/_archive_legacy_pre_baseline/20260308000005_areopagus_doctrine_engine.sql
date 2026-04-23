-- ═══════════════════════════════════════════════════════════════════════════
-- AREOPAGUS DOCTRINE ENGINE
-- Session 7D — March 8, 2026
-- Innovation #1517
--
-- Doctrine-based knowledge system organized by BELIEF at divergence points.
-- Three Columns: Believed | Taught | Practiced
-- Definitive Dictionary with linked terms
-- CTA system for empty Column 3 → 16 Initiatives
--
-- "Say what you Do. Do what you Say." — The Contract Principle
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. DOCTRINE BRANCHES (The Tree) ───

CREATE TABLE IF NOT EXISTS doctrine_branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  parent_branch_id UUID REFERENCES doctrine_branches(id),
  divergence_point TEXT NOT NULL,
  divergence_date TEXT,
  divergence_event TEXT,
  domain TEXT NOT NULL DEFAULT 'theology'
    CHECK (domain IN ('theology','soteriology','ecclesiology','sacraments','ethics',
      'eschatology','cosmology','epistemology','practice','anthropology','pneumatology','hermeneutics')),
  scope TEXT NOT NULL DEFAULT 'universal'
    CHECK (scope IN ('universal','abrahamic','christian','eastern','indigenous','philosophical','esoteric')),
  depth_level INT NOT NULL DEFAULT 0,
  loc_reference TEXT,
  scholar_consensus TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_doctrine_branches_parent ON doctrine_branches(parent_branch_id);
CREATE INDEX IF NOT EXISTS idx_doctrine_branches_domain ON doctrine_branches(domain);
CREATE INDEX IF NOT EXISTS idx_doctrine_branches_scope ON doctrine_branches(scope);

-- ─── 2. DOCTRINAL POSITIONS (Three Columns) ───

CREATE TABLE IF NOT EXISTS doctrinal_positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES doctrine_branches(id) ON DELETE CASCADE,
  position_label TEXT NOT NULL,
  believed TEXT NOT NULL,
  taught TEXT NOT NULL,
  practiced TEXT,  -- NULL = empty → triggers CTA
  adherent_groups JSONB DEFAULT '[]'::jsonb,
  estimated_adherents BIGINT,
  evidence_basis JSONB DEFAULT '[]'::jsonb,
  scholar_support TEXT NOT NULL DEFAULT 'debated'
    CHECK (scholar_support IN ('strong_consensus','majority_view','debated','minority_view','no_scholarly_basis','interdisciplinary')),
  scholar_notes TEXT,
  popular_notes TEXT,
  scripture_references JSONB DEFAULT '[]'::jsonb,
  historical_sources JSONB DEFAULT '[]'::jsonb,
  loc_references TEXT[] DEFAULT '{}',
  key_term_links JSONB DEFAULT '[]'::jsonb,
  quality_score INT DEFAULT 0,
  dispute_status TEXT DEFAULT 'active_debate'
    CHECK (dispute_status IN ('consensus','active_debate','disputed','fringe')),
  call_to_action JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_doctrinal_positions_branch ON doctrinal_positions(branch_id);
CREATE INDEX IF NOT EXISTS idx_doctrinal_positions_scholar ON doctrinal_positions(scholar_support);

-- ─── 3. AREOPAGUS DICTIONARY ───

CREATE TABLE IF NOT EXISTS areopagus_dictionary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  term TEXT NOT NULL,
  original_language TEXT NOT NULL,
  original_script TEXT NOT NULL,
  transliteration TEXT NOT NULL,
  pronunciation TEXT,
  definitions JSONB NOT NULL DEFAULT '[]'::jsonb,
  scripture_occurrences JSONB DEFAULT '[]'::jsonb,
  root_word TEXT,
  cognates TEXT[] DEFAULT '{}',
  historical_evolution TEXT,
  lexicon_entries JSONB DEFAULT '[]'::jsonb,
  loc_classification TEXT,
  quality_score INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_areopagus_dict_term ON areopagus_dictionary(term);
CREATE INDEX IF NOT EXISTS idx_areopagus_dict_language ON areopagus_dictionary(original_language);

-- ─── 4. PRACTICAL QUESTIONS (Dell Decision Matrix) ───

CREATE TABLE IF NOT EXISTS practical_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'ethics',
  scope TEXT NOT NULL DEFAULT 'universal',
  related_branches UUID[] DEFAULT '{}',
  equal_time_status TEXT DEFAULT 'needs_more_voices'
    CHECK (equal_time_status IN ('balanced','needs_more_voices','under_review')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- ─── 5. PRACTICAL POSITIONS ───

CREATE TABLE IF NOT EXISTS practical_positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES practical_questions(id) ON DELETE CASCADE,
  position_label TEXT NOT NULL,
  summary TEXT NOT NULL,
  believed TEXT NOT NULL,
  taught TEXT NOT NULL,
  practiced TEXT,
  traditions TEXT[] DEFAULT '{}',
  notable_figures TEXT[] DEFAULT '{}',
  evidence_basis JSONB DEFAULT '[]'::jsonb,
  scripture_refs JSONB DEFAULT '[]'::jsonb,
  steelman_opposing TEXT NOT NULL,
  scholar_level TEXT DEFAULT 'debated',
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_practical_positions_question ON practical_positions(question_id);

-- ─── 6. ARCHAEOLOGICAL EVIDENCE ───

CREATE TABLE IF NOT EXISTS archaeological_evidence (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  discovery_date TEXT,
  location TEXT,
  related_branches UUID[] DEFAULT '{}',
  significance TEXT NOT NULL,
  loc_reference TEXT,
  museum_location TEXT,
  image_url TEXT,
  scholar_consensus TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- ─── 7. CONTRIBUTOR STAMPS (Areopagus-specific reputation) ───

CREATE TABLE IF NOT EXISTS areopagus_stamps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  stamp_type TEXT NOT NULL
    CHECK (stamp_type IN ('first_contribution','source_verified','scholar_endorsed',
      'balanced_voice','steelman_master','archaeological_link','loc_reference_added',
      'dispute_resolved','deep_dive','cross_tradition','community_trust')),
  branch_id UUID REFERENCES doctrine_branches(id),
  value INT DEFAULT 1,
  earned_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_areopagus_stamps_user ON areopagus_stamps(user_id);

-- ─── 8. SCHOLAR CREDENTIALS ───

CREATE TABLE IF NOT EXISTS scholar_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  degree TEXT NOT NULL,
  institution TEXT NOT NULL,
  field TEXT NOT NULL,
  verified_by_lb BOOLEAN DEFAULT false,
  verification_stamp TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scholar_creds_user ON scholar_credentials(user_id);

-- ─── 9. EQUAL TIME TRACKING ───

CREATE TABLE IF NOT EXISTS equal_time_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES doctrine_branches(id),
  position_counts JSONB DEFAULT '{}'::jsonb,
  is_balanced BOOLEAN DEFAULT false,
  underrepresented TEXT[] DEFAULT '{}',
  call_for_voices JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_equal_time_branch ON equal_time_tracking(branch_id);

-- ─── 10. DOCTRINE EDIT HISTORY (Wikipedia-style) ───

CREATE TABLE IF NOT EXISTS doctrine_edits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('branch','position','term','question','evidence')),
  entity_id UUID NOT NULL,
  editor_id UUID REFERENCES auth.users(id),
  edit_type TEXT NOT NULL CHECK (edit_type IN ('create','update','delete','revert')),
  previous_value JSONB,
  new_value JSONB,
  edit_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_doctrine_edits_entity ON doctrine_edits(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_doctrine_edits_editor ON doctrine_edits(editor_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA — Exemplar doctrine branches to demonstrate the system
-- ═══════════════════════════════════════════════════════════════════════════

-- Root: Worship Practice
INSERT INTO doctrine_branches (slug, title, description, parent_branch_id, divergence_point, domain, scope, depth_level)
VALUES (
  'worship-practice',
  'Worship Practice',
  'How different traditions approach corporate worship, prayer, and religious observance.',
  NULL,
  'How should humans worship?',
  'practice',
  'universal',
  0
);

-- Child: Music in Worship
INSERT INTO doctrine_branches (slug, title, description, parent_branch_id, divergence_point, divergence_event, domain, scope, depth_level)
VALUES (
  'music-in-worship',
  'Music in Worship',
  'The role of music, singing, and instruments in religious services.',
  (SELECT id FROM doctrine_branches WHERE slug = 'worship-practice'),
  'Should music be part of worship?',
  'Ancient debate across multiple traditions',
  'practice',
  'universal',
  1
);

-- Grandchild: Instrumental Music in Christian Worship
INSERT INTO doctrine_branches (slug, title, description, parent_branch_id, divergence_point, divergence_date, divergence_event, domain, scope, depth_level)
VALUES (
  'instrumental-music-christian',
  'Instrumental Music in Christian Worship',
  'Whether instruments are authorized in New Testament worship. The divergence point that split the Stone-Campbell Restoration Movement.',
  (SELECT id FROM doctrine_branches WHERE slug = 'music-in-worship'),
  'Is instrumental music in corporate worship authorized by scripture?',
  '~1906',
  'Stone-Campbell Restoration Movement splits into Churches of Christ (a cappella) and Christian Churches/Disciples of Christ (instrumental)',
  'practice',
  'christian',
  2
);

-- Root: Salvation
INSERT INTO doctrine_branches (slug, title, description, parent_branch_id, divergence_point, domain, scope, depth_level)
VALUES (
  'salvation',
  'Salvation & Redemption',
  'How different traditions understand salvation, liberation, redemption, enlightenment, or the ultimate destiny of humanity.',
  NULL,
  'What must a person do (if anything) to be saved/redeemed/enlightened?',
  'soteriology',
  'universal',
  0
);

-- Child: Baptism and Salvation
INSERT INTO doctrine_branches (slug, title, description, parent_branch_id, divergence_point, domain, scope, depth_level)
VALUES (
  'baptism-and-salvation',
  'Baptism and Salvation',
  'Whether baptism is required for salvation or is a symbolic act of obedience after salvation.',
  (SELECT id FROM doctrine_branches WHERE slug = 'salvation'),
  'Is baptism required for the remission of sins?',
  'soteriology',
  'christian',
  1
);

-- ─── SEED: Dictionary entry for "eis" ───

INSERT INTO areopagus_dictionary (term, original_language, original_script, transliteration, pronunciation, definitions, scripture_occurrences, lexicon_entries, root_word)
VALUES (
  'eis',
  'Greek',
  'εἰς',
  'eis',
  'ice (rhymes with "ice")',
  '[
    {
      "id": "eis-purpose",
      "definition": "for the purpose of, in order to",
      "usageContext": "Indicates purpose or goal of an action",
      "traditions": ["Church of Christ", "Catholic", "Eastern Orthodox"],
      "doctrinalImplication": "Baptism is required for the remission of sins — it is the purpose of the act",
      "lexiconSupport": ["BDAG lists purposive sense", "Thayer: unto, for the purpose of"],
      "contextualArgument": "Same construction in Matthew 26:28 (blood shed FOR remission) — if eis means because of here, Jesus blood was shed BECAUSE sins were already forgiven, which contradicts Christian soteriology",
      "scholarLevel": "debated",
      "counterArguments": ["Some argue the causal sense is equally valid in Koine Greek"]
    },
    {
      "id": "eis-causal",
      "definition": "because of, on account of (causal)",
      "usageContext": "Indicates the reason or cause of an action",
      "traditions": ["Southern Baptist Convention", "Many Evangelical denominations"],
      "doctrinalImplication": "Baptism is because of sins already remitted through faith — symbolic, not salvific",
      "lexiconSupport": ["Some grammarians argue causal eis in certain contexts"],
      "contextualArgument": "Matthew 12:41 — repented AT (eis) the preaching of Jonah — they did not repent FOR THE PURPOSE OF the preaching, but BECAUSE OF it",
      "scholarLevel": "minority_view",
      "counterArguments": ["BDAG does not list causal as primary meaning", "Matthew 26:28 parallel breaks this reading"]
    },
    {
      "id": "eis-directional",
      "definition": "into, toward, unto (directional/spatial)",
      "usageContext": "Primary spatial meaning — movement toward or into",
      "traditions": ["Various scholarly positions"],
      "doctrinalImplication": "Baptism moves one into the state of forgiveness — directional metaphor",
      "lexiconSupport": ["BDAG primary definition", "Strong G1519"],
      "contextualArgument": "This is the most common NT usage — eis often indicates movement into a state or location",
      "scholarLevel": "majority_view",
      "counterArguments": ["Does not definitively settle the baptism debate as both sides can accommodate directional meaning"]
    }
  ]'::jsonb,
  '[
    {
      "reference": {"canon": "new_testament", "book": "Acts", "chapter": 2, "verse": "38"},
      "contextQuote": "Repent, and be baptized every one of you in the name of Jesus Christ for (eis) the remission of sins",
      "translationComparison": [
        {"translation": "KJV", "rendering": "for the remission of sins", "definitionApplied": "eis-purpose"},
        {"translation": "NIV", "rendering": "for the forgiveness of your sins", "definitionApplied": "eis-purpose"},
        {"translation": "ESV", "rendering": "for the forgiveness of your sins", "definitionApplied": "eis-purpose"},
        {"translation": "NASB", "rendering": "for the forgiveness of your sins", "definitionApplied": "eis-purpose"}
      ]
    },
    {
      "reference": {"canon": "new_testament", "book": "Matthew", "chapter": 26, "verse": "28"},
      "contextQuote": "For this is my blood of the new testament, which is shed for (eis) many for (eis) the remission of sins",
      "translationComparison": [
        {"translation": "KJV", "rendering": "for the remission of sins", "definitionApplied": "eis-purpose"},
        {"translation": "NIV", "rendering": "for the forgiveness of sins", "definitionApplied": "eis-purpose"}
      ]
    }
  ]'::jsonb,
  '[
    {"lexiconName": "BDAG", "entryNumber": "εἰς", "definition": "marker of goals: into, in, toward, to; marker of purpose: for, in order to; marker of result: so that, with the result that", "isAcademicStandard": true},
    {"lexiconName": "Strongs", "entryNumber": "G1519", "definition": "a primary preposition; to or into (indicating the point reached or entered)", "isAcademicStandard": true},
    {"lexiconName": "Thayers", "entryNumber": "εἰς", "definition": "into, unto, to, towards, for, among", "isAcademicStandard": true}
  ]'::jsonb,
  'ἐν (en) — related preposition meaning in/within'
);

-- ─── SEED: Practical question ───

INSERT INTO practical_questions (question, domain, scope)
VALUES (
  'Can a Christian serve in the military?',
  'ethics',
  'christian'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS POLICIES (read: arena members, write: tier-gated)
-- NOTE: These are permissive for now. Full RLS hardening tracked in
-- RLS_AUDIT_REPORT.md as a separate migration.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE doctrine_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctrinal_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE areopagus_dictionary ENABLE ROW LEVEL SECURITY;
ALTER TABLE practical_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practical_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE archaeological_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE areopagus_stamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholar_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE equal_time_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctrine_edits ENABLE ROW LEVEL SECURITY;

-- Read access: authenticated users (arena members check deferred to app layer)
CREATE POLICY "Anyone can read doctrine branches" ON doctrine_branches FOR SELECT USING (true);
CREATE POLICY "Anyone can read doctrinal positions" ON doctrinal_positions FOR SELECT USING (true);
CREATE POLICY "Anyone can read dictionary" ON areopagus_dictionary FOR SELECT USING (true);
CREATE POLICY "Anyone can read practical questions" ON practical_questions FOR SELECT USING (true);
CREATE POLICY "Anyone can read practical positions" ON practical_positions FOR SELECT USING (true);
CREATE POLICY "Anyone can read archaeological evidence" ON archaeological_evidence FOR SELECT USING (true);
CREATE POLICY "Anyone can read equal time tracking" ON equal_time_tracking FOR SELECT USING (true);
CREATE POLICY "Users can read own stamps" ON areopagus_stamps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can read own credentials" ON scholar_credentials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read doctrine edits" ON doctrine_edits FOR SELECT USING (true);

-- Write access: authenticated users (tier gating in app layer)
CREATE POLICY "Auth users can insert positions" ON doctrinal_positions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can insert dictionary terms" ON areopagus_dictionary FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can insert practical positions" ON practical_positions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can earn stamps" ON areopagus_stamps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth users can submit credentials" ON scholar_credentials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth users can log edits" ON doctrine_edits FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
