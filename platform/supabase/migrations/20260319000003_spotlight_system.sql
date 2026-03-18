-- Spotlight Carousel System — Universal content surface
-- Session 34 — March 19, 2026
-- "Build the rail once, feed it different cars"

-- Dynamic spotlight cards managed via Moneypenny or system
CREATE TABLE IF NOT EXISTS public.spotlight_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,  -- featured, campaigns, benefits, announcements, makers, projects
  title TEXT NOT NULL,
  subtitle TEXT,
  body_preview TEXT NOT NULL,
  body_full TEXT,
  stats JSONB,  -- [{ label, value, color }]
  cta_label TEXT,
  cta_route TEXT,
  priority INT DEFAULT 50,  -- 1-100
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  time_of_day_bias TEXT,  -- morning, afternoon, evening, null
  page_context TEXT DEFAULT 'landing',  -- which page this card belongs to
  is_active BOOLEAN DEFAULT true,
  created_by TEXT DEFAULT 'founder',  -- founder, moneypenny, system
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.spotlight_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active spotlight content"
  ON public.spotlight_content FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users manage spotlight content"
  ON public.spotlight_content FOR ALL USING (auth.role() = 'authenticated');

-- Impression tracking for Fly on the Wall
CREATE TABLE IF NOT EXISTS public.spotlight_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id TEXT NOT NULL,
  category TEXT NOT NULL,
  position_in_carousel INT,
  action TEXT DEFAULT 'impression',  -- impression, click, spotlight, cta_click, dismiss
  session_id TEXT,
  dwell_ms INT,
  algorithm_config JSONB,
  page_context TEXT DEFAULT 'landing',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.spotlight_impressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log impressions"
  ON public.spotlight_impressions FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users read impressions"
  ON public.spotlight_impressions FOR SELECT USING (auth.role() = 'authenticated');

-- Seed initial spotlight content (mirrors the 3 existing bottom cards + extras)
INSERT INTO public.spotlight_content (category, title, body_preview, stats, cta_label, cta_route, priority, page_context) VALUES
  ('featured', 'Built to Last', '8 Patent Applications · 1,748 Innovations · 47 Creators Identified',
   '[{"label":"Patents","value":"8","color":"#38a169"},{"label":"Innovations","value":"1,748","color":"#38a169"},{"label":"Creators","value":"47","color":"#38a169"}]',
   'View Portfolio', '/patent-portfolio', 90, 'landing'),
  ('featured', 'What''s In It For You?', 'Maker? Sell what you build. Shopper? Own the store. Curious? Start here.',
   NULL, 'Join the Red Carpet', '/RedCarpet', 85, 'landing'),
  ('featured', 'Know a Maker?', 'Invite them. Earn 10 Marks. 6-tier rewards. Everyone gets something. Forever.',
   NULL, 'Refer Someone', '/initiatives/brass-tacks', 80, 'landing'),
  ('benefits', '83.3% Creator Split', 'On every $500 transaction, creators keep $416.67. Locked forever by structural bylaws.',
   NULL, 'See the Economics', '/economics', 75, 'landing'),
  ('benefits', '$5/Year Membership', 'Full platform access. No hidden fees. No upsells. No data harvesting. Just $5.',
   NULL, 'Join Now', '/RedCarpet', 70, 'landing'),
  ('announcements', '8th Patent Filing Ready', '73 new innovations (#1676-#1748) across 6 technology domains. ~220 formal claims.',
   NULL, 'View Patent Portfolio', '/patent-portfolio', 85, 'landing'),
  ('announcements', 'New: Deterministic Combat', 'HexIsle replaces dice with a fixed attack wheel. No luck — only knowledge.',
   NULL, 'Try the Demo', '/hexisle', 80, 'landing'),
  ('campaigns', 'Initiative Launch Tracker', '16 initiatives with progress bars. When conditions are met, they go live.',
   NULL, 'View Tracker', '/launch-tracker', 75, 'landing')
ON CONFLICT DO NOTHING;
