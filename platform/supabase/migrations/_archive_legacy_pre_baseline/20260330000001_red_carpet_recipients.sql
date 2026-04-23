-- ============================================
-- MIGRATION: 20260329000012_red_carpet_recipients.sql
-- Knight Session 165: Red Carpet Personalization + Fallback (DD-7)
-- Tables: red_carpet_recipients, red_carpet_fallback_visits
-- ============================================

-- =====================
-- RED CARPET RECIPIENTS: Domain-matched walkthrough personalization
-- Matches email domains to personalized greeting + walkthrough config
-- =====================
CREATE TABLE IF NOT EXISTS red_carpet_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_domain TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  role_offered TEXT,
  initiative TEXT,
  wave INTEGER NOT NULL DEFAULT 1,
  personalized_greeting TEXT,
  walkthrough_sections JSONB DEFAULT '[]',
  photo_path TEXT,
  attachment_paths JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_visited TIMESTAMPTZ,
  visit_count INTEGER DEFAULT 0
);

ALTER TABLE red_carpet_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active recipients"
  ON red_carpet_recipients FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service role manages recipients"
  ON red_carpet_recipients FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Admin manages recipients"
  ON red_carpet_recipients FOR ALL
  USING (public.is_admin());

CREATE INDEX idx_rcp_domain ON red_carpet_recipients(email_domain);
CREATE INDEX idx_rcp_wave ON red_carpet_recipients(wave, is_active);
CREATE INDEX idx_rcp_name ON red_carpet_recipients(recipient_name);

-- =====================
-- SEED: Wave 1 Crown Letters (Leadership Seats)
-- =====================
INSERT INTO red_carpet_recipients (email_domain, recipient_name, role_offered, initiative, wave, personalized_greeting, walkthrough_sections) VALUES
-- Michael Seibel (CEO)
('ycombinator.com', 'Michael Seibel', 'CEO', 'Liana Banyan Corporation', 1,
 'Mr. Seibel, welcome to Liana Banyan. This walkthrough was built for you.',
 '["economics","governance","all_initiatives","patent_portfolio","team","founder"]'),
('yc.com', 'Michael Seibel', 'CEO', 'Liana Banyan Corporation', 1,
 'Mr. Seibel, welcome to Liana Banyan. This walkthrough was built for you.',
 '["economics","governance","all_initiatives","patent_portfolio","team","founder"]'),

-- Tom Simon (CFO)
('simoninvestigations.com', 'Tom Simon', 'CFO', 'Financial Integrity', 1,
 'Mr. Simon, welcome. The architecture is laid bare — exactly as promised in the letter.',
 '["economics","governance","all_initiatives","patent_portfolio","team","founder"]'),
('alumni.clemson.edu', 'Tom Simon', 'CFO', 'Financial Integrity', 1,
 'Mr. Simon, welcome. The architecture is laid bare — exactly as promised in the letter.',
 '["economics","governance","all_initiatives","patent_portfolio","team","founder"]'),

-- Sal Khan (Chancellor of Didasko)
('khanacademy.org', 'Sal Khan', 'Chancellor', 'Didasko Education', 1,
 'Sal, welcome to Didasko — the education initiative built on your principles.',
 '["initiative_spotlight","economics","governance","patent_portfolio","academic_papers","founder"]'),

-- Craig Newmark (Infrastructure Chancellor)
('craigslist.org', 'Craig Newmark', 'Infrastructure Chancellor', 'Platform Integrity', 1,
 'Mr. Newmark, welcome. No pitch deck, no salesperson — just the architecture.',
 '["economics","governance","patent_portfolio","all_initiatives","founder"]'),
('craignewmarkphilanthropies.org', 'Craig Newmark', 'Infrastructure Chancellor', 'Platform Integrity', 1,
 'Mr. Newmark, welcome. No pitch deck, no salesperson — just the architecture.',
 '["economics","governance","patent_portfolio","all_initiatives","founder"]'),

-- Maneet Chauhan (Grand Chef of Let's Make Dinner)
('maneetchauhan.com', 'Maneet Chauhan', 'Grand Chef', 'Let''s Make Dinner', 1,
 'Chef Chauhan, welcome. Let''s Make Dinner was built for a leader like you.',
 '["initiative_spotlight","economics","governance","founder"]'),

-- Dale Dougherty (Industry Chancellor of Let's Make Bread)
('make.co', 'Dale Dougherty', 'Industry Chancellor', 'Let''s Make Bread', 1,
 'Mr. Dougherty, you started a movement. We built the marketplace.',
 '["initiative_spotlight","economics","patent_portfolio","founder"]'),
('makermedia.com', 'Dale Dougherty', 'Industry Chancellor', 'Let''s Make Bread', 1,
 'Mr. Dougherty, you started a movement. We built the marketplace.',
 '["initiative_spotlight","economics","patent_portfolio","founder"]'),

-- MacKenzie Scott (Strategic Partnership)
('losthorsepress.org', 'MacKenzie Scott', 'Strategic Partner', 'Seed Capital + Credibility', 1,
 'Ms. Scott, welcome. We don''t want your money — we want your rolodex.',
 '["economics","governance","all_initiatives","patent_portfolio","founder"]');

-- =====================
-- SEED: Wave 2 Investors / Philanthropists
-- =====================
INSERT INTO red_carpet_recipients (email_domain, recipient_name, role_offered, initiative, wave, personalized_greeting, walkthrough_sections) VALUES
('berkshirehathaway.com', 'Warren Buffett', 'French Fleet', 'Seed Capital + Credibility', 2,
 'Mr. Buffett, welcome. The math is here. The sails are waiting.',
 '["economics","patent_portfolio","governance","founder"]');

-- =====================
-- SEED: Wave 3 Academics
-- =====================
INSERT INTO red_carpet_recipients (email_domain, recipient_name, role_offered, initiative, wave, personalized_greeting, walkthrough_sections) VALUES
('newschool.edu', 'Trebor Scholz', 'Academic Advisor', 'Platform Cooperativism', 3,
 'Professor Scholz, someone actually built it. Here''s how.',
 '["economics","academic_papers","patent_portfolio","press_junket","founder"]'),
('colorado.edu', 'Nathan Schneider', 'Academic Advisor', 'Cooperative Economics', 3,
 'Professor Schneider, everything for everyone — literally. The walkthrough is yours.',
 '["economics","academic_papers","governance","patent_portfolio","press_junket","founder"]'),
('stanford.edu', 'Erik Brynjolfsson', 'Academic Advisor', 'Digital Economy', 3,
 'Professor Brynjolfsson, the metrics are built in. Here''s the full architecture.',
 '["economics","academic_papers","patent_portfolio","governance","press_junket","founder"]'),
('bc.edu', 'Juliet Schor', 'Academic Advisor', 'Sharing Economy', 3,
 'Professor Schor, your research proved the sharing economy exploits workers. We built the fix.',
 '["economics","academic_papers","patent_portfolio","press_junket","founder"]'),
('law.harvard.edu', 'Yochai Benkler', 'Academic Advisor', 'Commons Theory', 3,
 'Professor Benkler, your theory of peer production — implemented at scale.',
 '["economics","academic_papers","patent_portfolio","governance","press_junket","founder"]'),
('harvard.edu', 'Yochai Benkler', 'Academic Advisor', 'Commons Theory', 3,
 'Professor Benkler, your theory of peer production — implemented at scale.',
 '["economics","academic_papers","patent_portfolio","governance","press_junket","founder"]'),
('stern.nyu.edu', 'Arun Sundararajan', 'Academic Advisor', 'Platform Economics', 3,
 'Professor Sundararajan, you wrote the book on platform models. Here''s one that breaks every rule.',
 '["economics","academic_papers","patent_portfolio","press_junket","founder"]'),
('nyu.edu', 'Arun Sundararajan', 'Academic Advisor', 'Platform Economics', 3,
 'Professor Sundararajan, you wrote the book on platform models. Here''s one that breaks every rule.',
 '["economics","academic_papers","patent_portfolio","press_junket","founder"]'),
('mit.edu', 'Daron Acemoglu', 'Academic Advisor', 'Institutional Economics', 3,
 'Professor Acemoglu, you proved institutions determine prosperity. We built one that can''t extract.',
 '["economics","governance","academic_papers","patent_portfolio","press_junket","founder"]');

-- =====================
-- SEED: Wave 4 Media / Journalists
-- =====================
INSERT INTO red_carpet_recipients (email_domain, recipient_name, role_offered, initiative, wave, personalized_greeting, walkthrough_sections) VALUES
('platformer.news', 'Casey Newton', 'Press Coverage', 'Platform Economics', 4,
 'Casey, you cover platform power every day. This one is constitutionally locked.',
 '["economics","press_kit","patent_portfolio","enshittification_defense","founder"]'),
('craphound.com', 'Cory Doctorow', 'Press Coverage', 'Anti-Enshittification', 4,
 'Cory, you named the disease. We built the cure.',
 '["economics","enshittification_defense","patent_portfolio","governance","founder"]'),
('pluralistic.net', 'Cory Doctorow', 'Press Coverage', 'Anti-Enshittification', 4,
 'Cory, you named the disease. We built the cure.',
 '["economics","enshittification_defense","patent_portfolio","governance","founder"]'),
('mollywhite.net', 'Molly White', 'Press Coverage', 'Platform Accountability', 4,
 'Molly, we''re not crypto. We''re not blockchain. Come be skeptical.',
 '["economics","patent_portfolio","governance","press_kit","founder"]');

-- =====================
-- RED CARPET FALLBACK VISITS: When email not recognized
-- Captures email so Founder can follow up
-- =====================
CREATE TABLE IF NOT EXISTS red_carpet_fallback_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  source TEXT DEFAULT 'unrecognized' CHECK (source IN ('unrecognized', 'error', 'direct')),
  user_agent TEXT,
  referrer_url TEXT,
  founder_notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE red_carpet_fallback_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert fallback visits"
  ON red_carpet_fallback_visits FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role reads all fallback visits"
  ON red_carpet_fallback_visits FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Admin reads fallback visits"
  ON red_carpet_fallback_visits FOR SELECT
  USING (public.is_admin());

CREATE INDEX idx_rcfv_created ON red_carpet_fallback_visits(created_at DESC);
CREATE INDEX idx_rcfv_email ON red_carpet_fallback_visits(email);

-- =====================
-- FUNCTION: Track recipient visits (increment visit_count, update last_visited)
-- Called from the Red Carpet page on successful domain match
-- =====================
CREATE OR REPLACE FUNCTION public.track_red_carpet_visit(p_domain TEXT)
RETURNS void AS $$
BEGIN
  UPDATE red_carpet_recipients
  SET last_visited = now(),
      visit_count = visit_count + 1
  WHERE email_domain = p_domain
    AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.track_red_carpet_visit TO anon, authenticated;
