-- K262: Preface + Burst dispatch pattern for Crewman episode distribution

CREATE TABLE IF NOT EXISTS public.episode_preface_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series TEXT NOT NULL CHECK (series IN ('bst', 'spoonfuls')),
  chapter INTEGER,
  chapter_title TEXT,
  source_description TEXT,
  cephas_url TEXT,
  preface_template TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_episode_preface_templates_series_chapter
  ON public.episode_preface_templates (series, chapter);

ALTER TABLE public.episode_preface_templates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'episode_preface_templates'
      AND policyname = 'Episode preface templates service role full access'
  ) THEN
    CREATE POLICY "Episode preface templates service role full access"
      ON public.episode_preface_templates
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

INSERT INTO public.episode_preface_templates (
  series,
  chapter,
  chapter_title,
  source_description,
  cephas_url,
  preface_template
)
VALUES
  ('bst', 1, 'StarScreaming', 'A 52-episode series on a Founder''s first encounter with AI', 'cephas.lianabanyan.com/bst/ch1',
   '🧵 BST {{episode_range}} — Chapter 1: "StarScreaming"' || E'\n' || 'A Founder''s first encounter with AI — 72 hours that changed everything.' || E'\n' || 'Full story: {{cephas_url}}' || E'\n' || '↓'),
  ('bst', 2, 'The Blizzard', 'A 42-episode series on building through crisis', 'cephas.lianabanyan.com/bst/ch2',
   '🧵 BST {{episode_range}} — Chapter 2: "The Blizzard"' || E'\n' || 'When the ice storm hit and the platform kept building.' || E'\n' || 'Full story: {{cephas_url}}' || E'\n' || '↓'),
  ('bst', 3, 'Genesis', 'A 48-episode series on how the first systems were born', 'cephas.lianabanyan.com/bst/ch3',
   '🧵 BST {{episode_range}} — Chapter 3: "Genesis"' || E'\n' || 'The birth of the vocabulary, the vision, and the first nine systems.' || E'\n' || 'Full story: {{cephas_url}}' || E'\n' || '↓'),
  ('bst', 4, 'AI Cake', 'A 52-episode series on how four AI agents learned to collaborate', 'cephas.lianabanyan.com/bst/ch4',
   '🧵 BST {{episode_range}} — Chapter 4: "AI Cake"' || E'\n' || 'How to bake an AI Cake — four agents, one architecture, zero hallucinations (eventually).' || E'\n' || 'Full story: {{cephas_url}}' || E'\n' || '↓'),
  ('bst', 5, 'The $5 Career', 'A 52-episode series on six new economic roles for $5/year', 'cephas.lianabanyan.com/bst/ch5',
   '🧵 BST {{episode_range}} — Chapter 5: "The $5 Career"' || E'\n' || 'Six entirely new careers. $5 to start. 83.3% to keep.' || E'\n' || 'Full story: {{cephas_url}}' || E'\n' || '↓'),
  ('bst', 6, 'The WaterWheel', 'A 42-episode series on how every dollar does the work of three', 'cephas.lianabanyan.com/bst/ch6',
   '🧵 BST {{episode_range}} — Chapter 6: "The WaterWheel"' || E'\n' || 'How every dollar does the work of three inside a cooperative economy.' || E'\n' || 'Full story: {{cephas_url}}' || E'\n' || '↓'),
  ('bst', 7, 'The Lighthouse Ladder', 'A 52-episode series on mentoring 100,000 people through 10-person caps', 'cephas.lianabanyan.com/bst/ch7',
   '🧵 BST {{episode_range}} — Chapter 7: "The Lighthouse Ladder"' || E'\n' || 'One to one hundred thousand — through ten honest relationships stacked five levels deep.' || E'\n' || 'Full story: {{cephas_url}}' || E'\n' || '↓'),
  ('bst', 8, 'The Invisible Temperament', 'A 48-episode series on personality without the test', 'cephas.lianabanyan.com/bst/ch8',
   '🧵 BST {{episode_range}} — Chapter 8: "The Invisible Temperament"' || E'\n' || 'How the platform learns who you are without asking — and gives you the off switch.' || E'\n' || 'Full story: {{cephas_url}}' || E'\n' || '↓'),
  ('bst', 9, 'Self-Funding Economics', 'A 52-episode series on killing the need for venture capital', 'cephas.lianabanyan.com/bst/ch9',
   '🧵 BST {{episode_range}} — Chapter 9: "Self-Funding Economics"' || E'\n' || 'Uber lost $31B before profit. We made money on transaction one. Cost+20%. Forever.' || E'\n' || 'Full story: {{cephas_url}}' || E'\n' || '↓'),
  ('spoonfuls', NULL, NULL, 'Bite-sized insights from the Proof is in the Pudding series', 'cephas.lianabanyan.com/pudding',
   '🥄 A Spoonful of Cephas' || E'\n' || 'From the "Proof is in the Pudding" series — accessible explanations of cooperative economics.' || E'\n' || 'Full series: {{cephas_url}}')
ON CONFLICT (series, chapter) DO UPDATE
SET
  chapter_title = EXCLUDED.chapter_title,
  source_description = EXCLUDED.source_description,
  cephas_url = EXCLUDED.cephas_url,
  preface_template = EXCLUDED.preface_template;

CREATE TABLE IF NOT EXISTS public.dispatch_platform_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL UNIQUE CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'instagram', 'threads', 'bluesky')),
  batch_size INTEGER NOT NULL DEFAULT 1 CHECK (batch_size > 0),
  include_preface BOOLEAN NOT NULL DEFAULT true,
  preface_style TEXT NOT NULL DEFAULT 'separate' CHECK (preface_style IN ('separate', 'inline')),
  post_delay_ms INTEGER NOT NULL DEFAULT 1000 CHECK (post_delay_ms >= 0),
  max_chars INTEGER,
  thread_support BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.dispatch_platform_config ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'dispatch_platform_config'
      AND policyname = 'Dispatch platform config service role full access'
  ) THEN
    CREATE POLICY "Dispatch platform config service role full access"
      ON public.dispatch_platform_config
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

INSERT INTO public.dispatch_platform_config (
  platform,
  batch_size,
  include_preface,
  preface_style,
  post_delay_ms,
  max_chars,
  thread_support,
  active
)
VALUES
  ('twitter', 3, true, 'separate', 1000, 280, true, true),
  ('linkedin', 1, true, 'inline', 0, 3000, false, true),
  ('facebook', 1, true, 'separate', 1000, NULL, false, true),
  ('instagram', 1, true, 'inline', 0, 2200, false, true),
  ('threads', 2, true, 'separate', 1000, 500, true, true),
  ('bluesky', 2, true, 'separate', 1000, 300, true, true)
ON CONFLICT (platform) DO UPDATE
SET
  batch_size = EXCLUDED.batch_size,
  include_preface = EXCLUDED.include_preface,
  preface_style = EXCLUDED.preface_style,
  post_delay_ms = EXCLUDED.post_delay_ms,
  max_chars = EXCLUDED.max_chars,
  thread_support = EXCLUDED.thread_support,
  active = EXCLUDED.active;
