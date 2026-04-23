-- K404: Anecdotes Table + Founder Seed Data
-- Innovation #2234 (CJ candidate: Founder-First Anecdote Mapping). Bishop B096.
-- Tables: anecdotes, anecdote_innovation_links
-- ALTER: innovation_log gets primary_anecdote_id

-- ══════════════════════════════════════════════════════════════
-- 1. Anecdotes table
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS anecdotes (
  id BIGSERIAL PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body_markdown TEXT NOT NULL,
  photo_urls TEXT[] DEFAULT '{}',
  privacy_level TEXT NOT NULL DEFAULT 'public'
    CHECK (privacy_level IN ('public', 'members_only', 'private')),
  when_it_happened DATE,
  where_it_happened TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_anecdotes_author ON anecdotes(author_id);
CREATE INDEX idx_anecdotes_public ON anecdotes(created_at DESC)
  WHERE privacy_level = 'public';

-- ══════════════════════════════════════════════════════════════
-- 2. Join table: anecdotes ↔ innovation_log (many-to-many)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS anecdote_innovation_links (
  anecdote_id BIGINT NOT NULL REFERENCES anecdotes(id) ON DELETE CASCADE,
  innovation_id UUID NOT NULL REFERENCES innovation_log(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL DEFAULT 'origin'
    CHECK (relationship IN ('origin', 'example', 'confirmation', 'counterexample')),
  PRIMARY KEY (anecdote_id, innovation_id, relationship)
);

-- ══════════════════════════════════════════════════════════════
-- 3. Nullable back-pointer on innovation_log for PRIMARY anecdote
-- ══════════════════════════════════════════════════════════════
ALTER TABLE innovation_log
  ADD COLUMN IF NOT EXISTS primary_anecdote_id BIGINT
    REFERENCES anecdotes(id);

-- ══════════════════════════════════════════════════════════════
-- 4. RLS
-- ══════════════════════════════════════════════════════════════
ALTER TABLE anecdotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anecdotes_public_read" ON anecdotes
  FOR SELECT USING (privacy_level = 'public');

CREATE POLICY "anecdotes_members_read" ON anecdotes
  FOR SELECT USING (
    privacy_level = 'members_only'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "anecdotes_author_all" ON anecdotes
  FOR ALL USING (auth.uid() = author_id);

ALTER TABLE anecdote_innovation_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anecdote_links_public_read" ON anecdote_innovation_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM anecdotes a
      WHERE a.id = anecdote_id
        AND (a.privacy_level = 'public' OR a.author_id = auth.uid())
    )
  );

CREATE POLICY "anecdote_links_author_insert" ON anecdote_innovation_links
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM anecdotes a
      WHERE a.id = anecdote_id AND a.author_id = auth.uid()
    )
  );

CREATE POLICY "anecdote_links_author_delete" ON anecdote_innovation_links
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM anecdotes a
      WHERE a.id = anecdote_id AND a.author_id = auth.uid()
    )
  );

-- ══════════════════════════════════════════════════════════════
-- 5. Seed: Founder goes first — two anecdotes from Pudding #182 and #183
-- ══════════════════════════════════════════════════════════════

-- Pudding #182: The Shop That Fixed My Son's Car
INSERT INTO anecdotes (author_id, title, body_markdown, privacy_level, when_it_happened, where_it_happened)
SELECT
  u.id,
  'The Shop That Fixed My Son''s Car',
  E'My son''s car broke down in Universal City, Texas. The shop that fixed it didn''t just hand him a bill — they explained every part, showed him the damage, and charged him a price that made sense. No markup games. No mystery labor rate. Just the cost of the part, the cost of the work, and a margin that was written on the wall.\n\nI sat in that waiting room for two hours thinking: *this is how the whole economy should work*. A transparent price. A fair split. A relationship where both sides can see the math.\n\nThat shop became the origin story for Cost+20%. For Marks. For Joules. For the entire Three-Currency System that powers Liana Banyan. Every time a creator on this platform sees their 83.3% share, every time a member earns Marks for helping, every time the platform takes its honest margin and no more — that shop in Universal City is the reason.\n\nThe mechanic didn''t know he was designing a platform. He was just being honest. I took notes.\n\n---\n\n*Pudding #182 — The Shop That Fixed My Son''s Car. Liana Banyan Platform.*',
  'public',
  '2025-06-15',
  'Universal City, Texas'
FROM auth.users u
WHERE u.email = 'upekrithen@gmail.com'
LIMIT 1;

-- Pudding #183: Hit the Triple Double
INSERT INTO anecdotes (author_id, title, body_markdown, privacy_level, when_it_happened, where_it_happened)
SELECT
  u.id,
  'Hit the Triple Double',
  E'The lottery is a tax on people who can''t do the math. The average American spends $300 a year on tickets. The bottom third spends over $400. The odds of Powerball are roughly 1 in 292 million. Nobody plans their retirement around those odds — but millions plan their *hope* around them.\n\nThe Triple Double is the opposite of a lottery ticket. It''s a ladder with four rungs.\n\nPick your daily base — whatever you can honestly imagine earning in a day. The Founder picked $100. Yours might be $50, or $200. The math works either way.\n\n| Rung | Daily | Annual (×5 days × 48 weeks) |\n|------|-------|----------------------------|\n| 0 | $100/day | $24,000 |\n| 1 | $200/day | $48,000 |\n| 2 | $400/day | $96,000 |\n| 3 | $800/day | $192,000 |\n\nThree doubles. That''s it. No lottery odds. No magical thinking. Just: can you double what you''re doing? Then can you double it again? Then once more?\n\nThe top rung is $192,000 a year. That isn''t rich. That''s the number where ambition stops being cosplay and starts having consequences. Where you can actually *do things* — back a friend''s business, pay for someone''s surgery, hire the kid who needs a break.\n\nEvery rung is reachable. Not easy — reachable. The gap between rungs is work, not luck. And the platform is built to help you do that work: Cue Cards, Campaigns, Treasure Maps, the whole system.\n\n**Swing for the fences.** When you don''t get what you want, you get experience. Babe Ruth hit 714 home runs and struck out 1,330 times. Nobody remembers the strikeouts.\n\nNo effort is wasted.\n\n---\n\n*Pudding #183 — The Triple Double and the Lottery Ticket Monkeys. Liana Banyan Platform.*',
  'public',
  '2026-04-10',
  'San Antonio, Texas'
FROM auth.users u
WHERE u.email = 'upekrithen@gmail.com'
LIMIT 1;

-- ══════════════════════════════════════════════════════════════
-- 6. Link anecdotes to innovations
-- ══════════════════════════════════════════════════════════════

-- Auto shop story → innovations that trace to it
INSERT INTO anecdote_innovation_links (anecdote_id, innovation_id, relationship)
SELECT
  (SELECT id FROM anecdotes WHERE title = 'The Shop That Fixed My Son''s Car' LIMIT 1),
  il.id,
  'origin'
FROM innovation_log il
WHERE il.title IN (
  'Three-Currency System',
  'Marks System',
  'Joules',
  'Backed Marks',
  'Reciprocal Maintenance',
  'Cost+20% Floor'
)
ON CONFLICT DO NOTHING;

-- Triple Double story → innovations
INSERT INTO anecdote_innovation_links (anecdote_id, innovation_id, relationship)
SELECT
  (SELECT id FROM anecdotes WHERE title = 'Hit the Triple Double' LIMIT 1),
  il.id,
  'origin'
FROM innovation_log il
WHERE il.canonical_number = 2235
   OR il.title IN (
     'Cold Start Hub',
     'Unlimited Throws',
     'The Five Dollar Career'
   )
ON CONFLICT DO NOTHING;
