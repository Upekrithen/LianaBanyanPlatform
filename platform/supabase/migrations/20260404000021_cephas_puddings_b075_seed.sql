CREATE TABLE IF NOT EXISTS cephas_puddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pudding_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  source_paper TEXT,
  source_paper_word_count INTEGER,
  pudding_text TEXT NOT NULL,
  not_pudding_summary TEXT,
  primary_spice TEXT NOT NULL,
  secondary_spices TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  innovations_referenced INTEGER[] NOT NULL DEFAULT '{}'::INTEGER[],
  bishop_session TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT cephas_puddings_status_check CHECK (status IN ('draft', 'review', 'published', 'archived'))
);

CREATE INDEX IF NOT EXISTS idx_cephas_puddings_bishop_session
  ON cephas_puddings (bishop_session);

CREATE INDEX IF NOT EXISTS idx_cephas_puddings_primary_spice
  ON cephas_puddings (primary_spice);

ALTER TABLE cephas_puddings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read cephas_puddings" ON cephas_puddings;
CREATE POLICY "Public read cephas_puddings"
  ON cephas_puddings
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Auth write cephas_puddings" ON cephas_puddings;
CREATE POLICY "Auth write cephas_puddings"
  ON cephas_puddings
  FOR ALL
  USING (true)
  WITH CHECK (true);

INSERT INTO cephas_puddings (
  pudding_number, title, slug, source_paper, source_paper_word_count,
  pudding_text, not_pudding_summary, primary_spice, secondary_spices,
  innovations_referenced, bishop_session, status
)
VALUES
  (
    109,
    'The Lighthouse Ladder',
    'the-lighthouse-ladder',
    'Paper 1: The Lighthouse Ladder — A Fixed-Capacity, Quality-Gated Mentorship Architecture',
    10000,
    'How do you personally welcome 100,000 people? You do not. That is the honest answer...',
    'Full academic paper with formalized interaction-load model, five-level mentoring hierarchy, 30+ APA references, and research agenda for empirical evaluation.',
    'basil',
    ARRAY['oregano', 'paprika'],
    ARRAY[]::INTEGER[],
    'B075',
    'draft'
  ),
  (
    110,
    'The Invisible Temperament',
    'the-invisible-temperament',
    'Paper 2: Invisible Temperament Assessment — Embedding Platform-Specific Temperament Detection',
    8000,
    'Every platform wants to know who you are. LinkedIn asks for your job title...',
    'Full academic paper with four-factor temperament model, implicit-feedback inference, progressive disclosure ethics, cooperative data governance, and Lighthouse Ladder validation plan.',
    'cinnamon',
    ARRAY['basil', 'pepper'],
    ARRAY[]::INTEGER[],
    'B075',
    'draft'
  ),
  (
    111,
    'Self-Funding Economics',
    'self-funding-economics',
    'Paper 3: Self-Funding Platform Economics — How Cost+20% and $5/Year Eliminate VC Dependency',
    12000,
    'Uber lost thirty-one billion dollars before it made a dime...',
    'Full academic paper with formal solvency analysis, five-scenario revenue modeling, Howey test securities analysis, and comparison with venture-subsidized platforms.',
    'garlic',
    ARRAY['pepper', 'salt'],
    ARRAY[]::INTEGER[],
    'B075',
    'draft'
  ),
  (
    112,
    'The Portable Reputation',
    'the-portable-reputation',
    'Paper 4: The Portable Reputation — User-Controlled, Platform-Verified Influence Portfolios',
    12000,
    'An Uber driver completes 10,000 trips. Five stars. A decade of excellent work. Then they leave...',
    'Full academic paper with five-category scoring architecture, blocks-stars-suns aggregation, Shadow Mark mechanism, blockchain provenance, and comparative analysis against Uber/Amazon/LinkedIn.',
    'ginger',
    ARRAY['oregano', 'cinnamon'],
    ARRAY[]::INTEGER[],
    'B075',
    'draft'
  ),
  (
    113,
    'The Patent Bags',
    'the-patent-bags',
    'Patent Bags 5-10 + 21-26 (compiled B075)',
    NULL,
    'Somewhere in a vault, filed under a system invented by four AI agents and one Founder, there are twelve numbered bags...',
    'Full patent specifications for Bags 5-10 (mechanical systems, cooperative commerce, platform simulation) and Bags 21-26 (quality assurance, engagement, efficiency, UX) across 11 provisional filings.',
    'ginger',
    ARRAY['pepper', 'cumin'],
    ARRAY[]::INTEGER[],
    'B075',
    'draft'
  ),
  (
    114,
    'Play With These Numbers',
    'play-with-these-numbers',
    'Paper 5: Contingency Operators as Financial Literacy Tools',
    12000,
    'What will I earn? Every platform gets asked. And every platform lies...',
    'Full paper with FTC compliance analysis, behavioral economics nudge framework, MLM comparison across 10 dimensions, temperament-adaptive presentation, and SEC-safe language architecture.',
    'garlic',
    ARRAY['basil', 'pepper'],
    ARRAY[]::INTEGER[],
    'B075',
    'draft'
  ),
  (
    115,
    'What the Attic Knows',
    'what-the-attic-knows',
    'B075 compilation grind — 6 families from content archive',
    NULL,
    'Every organization accumulates an Attic. Documents. Drafts. Letters to people who might matter someday...',
    'Six compilation documents from the Liana Banyan content archive documenting Patent Bags, Kickstarter Campaigns, Pitch Templates, and Crown-Tier Letters with canonical version identification and variant audits.',
    'oregano',
    ARRAY['pepper', 'basil'],
    ARRAY[]::INTEGER[],
    'B075',
    'draft'
  ),
  (
    116,
    'The Missing Claims',
    'the-missing-claims',
    'Patent Bag 8 (LMD + JukeBox + VSL) — variant audit discovery',
    NULL,
    'Patent Bag 8 is 795 lines long in the Emperor directory. It is 683 lines long in the Archive copy. That is 112 missing lines...',
    'Patent Bag 8 specifications including 14 innovations covering cooperative meal coordination, creative licensing, and micro-duration lending (VSL).',
    'pepper',
    ARRAY['oregano', 'cumin'],
    ARRAY[88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101],
    'B075',
    'draft'
  ),
  (
    117,
    'The Locked Folders',
    'the-locked-folders',
    'Crown-Tier Letters archive discipline (Bishop B075 compilation)',
    NULL,
    'In the archive for Craig Newmark Infrastructure Chancellor letter, there are seven files...',
    'Crown-Tier letter archive structure documenting version chains and LOCKED snapshot discipline across 5 letter families.',
    'oregano',
    ARRAY['paprika', 'pepper'],
    ARRAY[]::INTEGER[],
    'B075',
    'draft'
  ),
  (
    118,
    'The Cleanest Family',
    'the-cleanest-family',
    'Pitch Templates & Media Outreach (Bishop B075 compilation)',
    NULL,
    'There are seventy-plus pitch documents in the Liana Banyan archive...',
    'The Dynamic Stats Template System architecture enabling 70+ pitch templates to auto-update from a single canonical database.',
    'sugar',
    ARRAY['cumin', 'oregano'],
    ARRAY[]::INTEGER[],
    'B075',
    'draft'
  ),
  (
    119,
    'The Strategic Pivot',
    'the-strategic-pivot',
    'Kickstarter Campaigns 1-7 (Bishop B075 compilation) + Pawn B45 synthesis request',
    NULL,
    'There are two versions of Kickstarter Campaign 1. The first version is Tereno...',
    'Both Campaign 1 strategic versions ($12K Tereno vs $1K Slotted Top) preserved in archive, with Pawn B45 hybrid synthesis analysis dispatched.',
    'sugar',
    ARRAY['paprika', 'oregano'],
    ARRAY[]::INTEGER[],
    'B075',
    'draft'
  ),
  (
    120,
    'Load-Bearing Fables',
    'load-bearing-fables',
    'Fable Arc (Bishop B075 compilation of 07_REFERENCE_MATERIALS)',
    NULL,
    'Most platforms decorate their marketing with stories. Liana Banyan built its platform from the fables outward...',
    'The Fable Arc narrative architecture connecting Little Red Hen, Stone Soup, and Grasshopper/Ants to Recipe Pot, cooperative labor, and Pudding #108.',
    'basil',
    ARRAY['paprika', 'sugar'],
    ARRAY[2143],
    'B075',
    'draft'
  )
ON CONFLICT (pudding_number) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  source_paper = EXCLUDED.source_paper,
  source_paper_word_count = EXCLUDED.source_paper_word_count,
  pudding_text = EXCLUDED.pudding_text,
  not_pudding_summary = EXCLUDED.not_pudding_summary,
  primary_spice = EXCLUDED.primary_spice,
  secondary_spices = EXCLUDED.secondary_spices,
  innovations_referenced = EXCLUDED.innovations_referenced,
  bishop_session = EXCLUDED.bishop_session,
  status = EXCLUDED.status,
  updated_at = now();
