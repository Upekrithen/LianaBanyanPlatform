-- MoneyPenny Social Media — Daily Digests
-- Aggregate daily summaries of social media activity

CREATE TABLE IF NOT EXISTS social_daily_digests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  digest_date date NOT NULL UNIQUE,
  total_interactions integer NOT NULL DEFAULT 0,
  requires_response integer NOT NULL DEFAULT 0,
  highlights text[] NOT NULL DEFAULT '{}',
  channel_breakdown jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE social_daily_digests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on social_daily_digests"
  ON social_daily_digests FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Seed: one daily digest for today
INSERT INTO social_daily_digests (digest_date, total_interactions, requires_response, highlights, channel_breakdown)
VALUES (
  CURRENT_DATE,
  20,
  15,
  ARRAY[
    'TechCrunch reporter requesting founder interview — highest priority press opportunity',
    '@fusefoxdesign (Tactocrat) reached out about HexIsle collaboration — Creator Draft Pick target',
    'TikTok creator @craftqueenbee (156K followers) asking for ELI5 on pricing model — viral potential',
    'YouTube reviewer @techreviewdave (45K) wants to do a platform deep dive',
    'Discord spam bot impersonating brand with fake NFT drop — needs moderation action'
  ],
  '{"twitter": 5, "instagram": 3, "facebook": 2, "linkedin": 2, "tiktok": 2, "discord": 2, "reddit": 2, "youtube": 2}'::jsonb
);
