-- ═══════════════════════════════════════════════════════════════════════════════
-- CONTENT PIPELINE TABLE — Sequential Content Evolution
-- March 8, 2026 — Innovation #1505
-- ═══════════════════════════════════════════════════════════════════════════════
-- Pipeline: SEED → TLDR → BLOG → ARTICLE → PAPER
-- Each stage builds from the previous. Nothing is lost.
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS content_pipeline (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Identity
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',

  -- Author
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT NOT NULL DEFAULT 'Unknown',

  -- Pipeline state
  current_stage TEXT NOT NULL DEFAULT 'seed'
    CHECK (current_stage IN ('seed', 'tldr', 'blog', 'article', 'paper')),
  stages JSONB DEFAULT '[]',

  -- Content at each stage (all preserved, never overwritten)
  seed_content TEXT,          -- < 50 words
  tldr_content TEXT,          -- 100-300 words
  blog_content TEXT,          -- 500-1500 words
  article_content TEXT,       -- 1500-5000 words
  paper_content TEXT,         -- 3000-15000 words

  -- Status
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived')),
  published_at TIMESTAMPTZ,

  -- Metrics
  word_count INTEGER DEFAULT 0,
  reading_time_minutes INTEGER DEFAULT 0,
  coverage_minutes_value INTEGER DEFAULT 0,

  -- References
  related_content_ids UUID[] DEFAULT '{}',
  innovation_numbers INTEGER[] DEFAULT '{}',
  patent_series TEXT,
  treasure_key_ids UUID[] DEFAULT '{}',

  -- Cue Card / Battery integration
  cue_card_id UUID,
  battery_campaign_id TEXT,

  -- Cephas sync
  cephas_path TEXT,
  cephas_sync_status TEXT DEFAULT 'new'
    CHECK (cephas_sync_status IN ('synced', 'pending', 'outdated', 'new')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Constraints
  UNIQUE(slug)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_content_pipeline_stage ON content_pipeline(current_stage);
CREATE INDEX IF NOT EXISTS idx_content_pipeline_status ON content_pipeline(status);
CREATE INDEX IF NOT EXISTS idx_content_pipeline_category ON content_pipeline(category);
CREATE INDEX IF NOT EXISTS idx_content_pipeline_author ON content_pipeline(author_id);
CREATE INDEX IF NOT EXISTS idx_content_pipeline_slug ON content_pipeline(slug);
CREATE INDEX IF NOT EXISTS idx_content_pipeline_updated ON content_pipeline(updated_at DESC);

-- Comment
COMMENT ON TABLE content_pipeline IS
  'Sequential content evolution pipeline. SEED → TLDR → BLOG → ARTICLE → PAPER. '
  'Each stage builds from the previous. All content at every stage is preserved. '
  'Innovation #1505. March 8, 2026.';

-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS POLICIES (read-only for now — admin writes via service role)
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE content_pipeline ENABLE ROW LEVEL SECURITY;

-- Public read for published content
CREATE POLICY "Anyone can read published content"
  ON content_pipeline FOR SELECT
  USING (status = 'published');

-- Authors can read their own drafts
CREATE POLICY "Authors can read own content"
  ON content_pipeline FOR SELECT
  USING (auth.uid() = author_id);

-- Authors can insert their own content
CREATE POLICY "Authors can create content"
  ON content_pipeline FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Authors can update their own content
CREATE POLICY "Authors can update own content"
  ON content_pipeline FOR UPDATE
  USING (auth.uid() = author_id);
