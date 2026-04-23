-- K194: Guided Tour Engine — beacons, topics, category ordering + seeds
-- Bishop B051 | Innovations #2115, #2116
-- guided_tour_state already exists from K195 (000026)

CREATE TABLE IF NOT EXISTS tour_return_beacons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  item_slug TEXT NOT NULL,
  item_title TEXT NOT NULL,
  category TEXT NOT NULL,
  detail_level TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE tour_return_beacons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own beacons" ON tour_return_beacons
  FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_tour_beacons_user ON tour_return_beacons(user_id);

CREATE TABLE IF NOT EXISTS tour_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  category TEXT NOT NULL,
  item_slugs TEXT[] NOT NULL,
  estimated_minutes INTEGER,
  icon TEXT DEFAULT 'BookOpen',
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE tour_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read topics" ON tour_topics FOR SELECT USING (true);
CREATE POLICY "Service role manages topics" ON tour_topics FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS tour_category_order (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Folder',
  sort_order INTEGER NOT NULL,
  item_count INTEGER DEFAULT 0
);
ALTER TABLE tour_category_order ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read category order" ON tour_category_order FOR SELECT USING (true);
CREATE POLICY "Service role manages category order" ON tour_category_order FOR ALL USING (auth.role() = 'service_role');

INSERT INTO tour_topics (slug, title, subtitle, category, item_slugs, estimated_minutes, is_featured, sort_order) VALUES
('getting-started', 'Your First Day on Liana Banyan', 'From $5 Membership to First Mark', 'article',
  ARRAY['how-liana-banyan-actually-works','how-liana-banyan-actually-works-full-guide','member-benefits-overview','the-liana-banyan-origin-story','the-founders-story'], 20, true, 0),
('local-manufacturing', 'How to Restart Local Manufacturing', 'From 3D Printer to Injection Molder to Factory Node', 'system_design',
  ARRAY['the-canister-system-injection-molding-without-the-factory','injection-molding-for-the-rest-of-us-the-canister-system','hexisle-technical-system','the-superstructure','yggdrasil-architecture'], 25, true, 1),
('three-gear-economics', 'Understanding the Three-Gear Economy', 'Credits, Marks, and Joules — Why Three Currencies?', 'system_design',
  ARRAY['three-gear-currency-system','cost20-model','credits-joules','the-joules-pouch-seeds-for-tomorrow','ghost-credits-demand-validation','hivi-deterministic-economics','the-cloth-bag-analogy-why-joules-beat-credits'], 35, true, 2),
('cooperative-governance', 'How a Cooperative Governs Itself', 'From The 300 to Star Chamber to the Founder''s Creed', 'system_design',
  ARRAY['the-300-governance-system','star-chamber-verification','how-the-founder-gets-paid-complete-transparency','structural-bylaws-master-document','the-liana-banyan-covenant-imd-v20','the-founders-creed'], 30, true, 3),
('defense-and-safety', 'Defense Klaus: Protecting Every Member', 'Harbor Defense, Rally Group, and the Family Shield', 'system_design',
  ARRAY['defense-klaus-family-shield-harbor-defense-network','the-rally-group-safety-at-every-entry','privacy-architecture','zero-pii-policy','sentinel-monitoring-system'], 20, true, 4),
('patent-portfolio', 'The Innovation Engine', 'How 2,100+ Ideas Become Protected IP', 'system_design',
  ARRAY['the-behemoth-patent-portfolio','patent-prior-art-research-deep-analysis','-crown-jewels-patent-portfolio','patent-ownership-mechanics-upekrithen-lb-ironclad','patent-ownership-offering-for-crowns-sponsors'], 25, true, 5)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tour_category_order (category, display_name, description, icon, sort_order, item_count) VALUES
('article',         'Articles & Stories',       'Platform explanations and origin stories',            'FileText',      1,  30),
('system_design',   'System Design',            'Architecture, economics, governance, infrastructure', 'Building',      2,  70),
('initiative',      'The Sweet Sixteen',        'All 16 charitable initiatives',                       'Heart',         3,  15),
('academic_paper',  'Academic Papers',          'Peer-level research on cooperative economics',        'GraduationCap', 4,   7),
('crown_letter',    'Crown Letters',            'Letters to Crown candidates and holders',             'Crown',         5,  30),
('outreach_letter', 'Outreach Letters',         'Letters to academics, media, and partners',           'Mail',          6,  40),
('open_letter',     'Open Letters',             'Public letters published for broad audiences',        'Globe',         7,   5),
('innovation',      'Innovation Registry',      'Individual innovation documentation',                'Lightbulb',     8,  20),
('hexisle',         'HexIsle',                  'Modular terrain, game design, manufacturing',         'Hexagon',       9,  10),
('vault_archive',   'Vault Archives',           'Historical documents and foundational records',       'Archive',      10,  15),
('reference',       'Reference',               'Technical references and configuration guides',       'BookOpen',     11,  10)
ON CONFLICT (category) DO NOTHING;

INSERT INTO innovation_log (innovation_number, title, description, category, status, is_crown_jewel)
VALUES
(2115, 'Guided Tour Engine (Three-Mode Content Navigation)',
  'Three-mode content navigation: Topic Focus, Category Browse, and Guided Tour with skip/save/exit. 6-depth mapped to 3 user levels. Return Beacons.',
  'user_experience', 'implemented', true),
(2116, 'Adaptive Detail Level Switcher',
  'Three-position detail toggle that changes content rendering in real-time. Persists in localStorage.',
  'user_experience', 'implemented', false)
ON CONFLICT (innovation_number) DO NOTHING;
