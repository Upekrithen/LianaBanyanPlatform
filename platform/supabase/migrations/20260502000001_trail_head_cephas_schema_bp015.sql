-- Trail Head Cephas Schema Extension
-- KN100/BP015 Priority 6 — post-Reckoning readiness
-- Ratified: 2026-05-02 Founder direct (BP015 post-fire)
--
-- Adds Trail Head, Cue Card, and Deck/Golden Key fields to
-- cephas_content_registry so Bishop can seed Trail Heads in Bushel 2
-- (Cephas Trail Heads) immediately post-Reckoning.
--
-- Schema migration only — canonical Trail Head seed data is Bishop's
-- Bushel 2 work. This unblocks Bushel 2 readiness.
--
-- Architecture:
--   Trail Head: entry-point content (discovery primitive for members)
--   Cue Card:   micro-content unit within a Trail Head
--   Deck:       collection of Cue Cards at a Trail Head
--   Golden Key: milestone card threshold unlocking next Trail Head
--
-- Ref: trail_head_cue_card_deck_golden_key_bp015.eblet.md

-- Trail Head classification (NULL = not a Trail Head)
ALTER TABLE cephas_content_registry
  ADD COLUMN IF NOT EXISTS trail_head_class TEXT;

-- Number of Cue Cards at this Trail Head (default 1 = single-card entry)
ALTER TABLE cephas_content_registry
  ADD COLUMN IF NOT EXISTS card_count INTEGER DEFAULT 1;

-- Golden Key threshold: number of Deck cards to unlock next Trail Head
-- NULL = no Golden Key gate (open access)
ALTER TABLE cephas_content_registry
  ADD COLUMN IF NOT EXISTS golden_key_threshold INTEGER;

-- Demonstration tier for Trail Head progressive disclosure
-- skipping_stones: surface-level entry (anyone can engage)
-- wading:          mid-depth engagement (some commitment)
-- diving_in:       deep engagement (full commitment / expert track)
ALTER TABLE cephas_content_registry
  ADD COLUMN IF NOT EXISTS demonstration_tier TEXT
  CHECK (demonstration_tier IN ('skipping_stones', 'wading', 'diving_in'));

-- Parent Trail Head for nested/branching trail structures
-- NULL = root Trail Head (top-level discovery entry point)
ALTER TABLE cephas_content_registry
  ADD COLUMN IF NOT EXISTS parent_trail_head_id UUID
  REFERENCES cephas_content_registry(id);

-- Index for Trail Head discovery queries (find all root Trail Heads)
CREATE INDEX IF NOT EXISTS idx_cephas_trail_head_class
  ON cephas_content_registry(trail_head_class)
  WHERE trail_head_class IS NOT NULL;

-- Index for hierarchical trail navigation
CREATE INDEX IF NOT EXISTS idx_cephas_parent_trail_head
  ON cephas_content_registry(parent_trail_head_id)
  WHERE parent_trail_head_id IS NOT NULL;

-- Index for demonstration tier filtering
CREATE INDEX IF NOT EXISTS idx_cephas_demonstration_tier
  ON cephas_content_registry(demonstration_tier)
  WHERE demonstration_tier IS NOT NULL;

COMMENT ON COLUMN cephas_content_registry.trail_head_class IS
  'Trail Head classification (BP015). NULL = not a Trail Head entry point. '
  'Canonical seed classes defined in Bushel 2 (Bishop). '
  'E.g. sweet-sixteen-initiative, mechanical-computer-canon, founder-story, member-onboarding.';

COMMENT ON COLUMN cephas_content_registry.card_count IS
  'Number of Cue Cards composing this Trail Head Deck (BP015). Default 1.';

COMMENT ON COLUMN cephas_content_registry.golden_key_threshold IS
  'Cards collected to unlock the next Trail Head (BP015 Golden Key gate). NULL = no gate.';

COMMENT ON COLUMN cephas_content_registry.demonstration_tier IS
  'Progressive disclosure tier: skipping_stones (surface) | wading (mid) | diving_in (deep). BP015.';

COMMENT ON COLUMN cephas_content_registry.parent_trail_head_id IS
  'Parent Trail Head for nested trails (BP015). NULL = root Trail Head.';
