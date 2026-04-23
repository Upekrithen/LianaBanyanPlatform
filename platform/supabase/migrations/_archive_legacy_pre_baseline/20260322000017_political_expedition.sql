-- ═══════════════════════════════════════════════════════════════
-- Political Expedition — Initiative #15 (Power to the People)
-- Tables: rep_cache, member_reps, tracked_bills,
--         member_bill_tracking, rep_letter_templates
-- ═══════════════════════════════════════════════════════════════

-- Cached representative data (refreshed periodically)
CREATE TABLE IF NOT EXISTS rep_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bioguide_id TEXT UNIQUE,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  party TEXT,
  state TEXT NOT NULL,
  district TEXT,
  chamber TEXT,
  phone TEXT,
  website TEXT,
  office_address TEXT,
  photo_url TEXT,
  social_twitter TEXT,
  social_facebook TEXT,
  next_election TEXT,
  committees TEXT[] DEFAULT '{}',
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- Member-saved representatives
CREATE TABLE IF NOT EXISTS member_reps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  rep_id UUID REFERENCES rep_cache(id) NOT NULL,
  address_used TEXT,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, rep_id)
);

-- Bill tracker
CREATE TABLE IF NOT EXISTS tracked_bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_number TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  sponsor_name TEXT,
  sponsor_party TEXT,
  status TEXT,
  introduced_date DATE,
  last_action_date DATE,
  last_action TEXT,
  tags TEXT[] DEFAULT '{}',
  lb_relevance TEXT,
  cached_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member bill tracking
CREATE TABLE IF NOT EXISTS member_bill_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  bill_id UUID REFERENCES tracked_bills(id) NOT NULL,
  tracking_since TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, bill_id)
);

-- Letter templates
CREATE TABLE IF NOT EXISTS rep_letter_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  template_body TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- RLS
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE rep_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reps" ON rep_cache FOR SELECT USING (true);
CREATE POLICY "Admin manages reps" ON rep_cache FOR ALL USING (public.is_admin());

ALTER TABLE member_reps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own saved reps" ON member_reps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users save own reps" ON member_reps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own reps" ON member_reps FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE tracked_bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view bills" ON tracked_bills FOR SELECT USING (true);
CREATE POLICY "Admin manages bills" ON tracked_bills FOR ALL USING (public.is_admin());

ALTER TABLE member_bill_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own bill tracking" ON member_bill_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own bill tracking" ON member_bill_tracking FOR ALL USING (auth.uid() = user_id);

ALTER TABLE rep_letter_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active templates" ON rep_letter_templates FOR SELECT USING (is_active = true);
CREATE POLICY "Admin manages templates" ON rep_letter_templates FOR ALL USING (public.is_admin());

-- ═══════════════════════════════════════════════════════════════
-- Seed letter templates
-- ═══════════════════════════════════════════════════════════════

INSERT INTO rep_letter_templates (title, topic, template_body) VALUES
('Support for Cooperatives', 'cooperative_support', 'Dear {{rep_name}},

I am writing as a constituent from {{district}} and a member of Liana Banyan, a cooperative platform that serves working families in our community. I am asking you to support legislation that strengthens cooperative businesses.

Cooperatives create local jobs, keep money in communities, and give workers real ownership of their economic future. Liana Banyan alone has documented over 1,900 innovations in cooperative economics, and our platform helps families access affordable food, housing, and transportation.

I would appreciate the opportunity to discuss how cooperatives benefit {{district}} and how federal policy can support this model.

Thank you for your service.

Sincerely,
{{name}}'),
('Food Security Initiative', 'food_security', 'Dear {{rep_name}},

I am writing as a constituent from {{district}} to urge your support for food security programs in our community.

Through Liana Banyan cooperative, I have seen firsthand how local food networks can reduce food insecurity. Our Mission ONE — "EVERYONE Eats Tonight" — connects local restaurants with families who need affordable meals, using a cooperative model where 83.3% of every dollar goes directly to the food provider.

I urge you to support legislation that funds local food cooperatives and community-based food distribution.

Thank you,
{{name}}'),
('Affordable Housing', 'housing', 'Dear {{rep_name}},

I am writing about the critical need for affordable housing in {{district}}.

Our cooperative, Liana Banyan, is developing innovative approaches to cooperative housing — where members collectively acquire and maintain properties at cost-plus-20%, eliminating profit extraction from housing. This model has precedent in successful cooperatives like Mondragon and the cooperative housing movements in New York and other cities.

I ask for your support of legislation that enables cooperative housing acquisition and protects tenants'' rights to organize cooperative ownership.

Thank you for your attention to this issue.

Sincerely,
{{name}}'),
('Small Business Support', 'small_business', 'Dear {{rep_name}},

I am writing as a constituent from {{district}} to advocate for policies that support small businesses and local entrepreneurs.

Through Liana Banyan, our cooperative platform, we help creators and small business operators retain 83.3% of every dollar they earn — far more than traditional gig platforms. We believe economic policy should prioritize the smallest businesses, not just the largest corporations.

I ask you to support legislation that reduces regulatory barriers for micro-enterprises, expands SBA loan access for cooperatives, and incentivizes local procurement.

Thank you for your time.

Sincerely,
{{name}}'),
('Transportation Access', 'transportation', 'Dear {{rep_name}},

I am writing about the need for affordable, community-driven transportation in {{district}}.

Through our cooperative, Liana Banyan, we are building Rally Group — a cooperative ride and delivery network where drivers keep 83.3% of fares instead of the 50-60% typical of corporate platforms. This model creates better-paying jobs while delivering affordable rides to families who need them.

I urge you to support legislation that allows cooperative transportation networks to operate alongside traditional ride-hailing companies, and that invests in rural and suburban transportation infrastructure.

Sincerely,
{{name}}');

-- ═══════════════════════════════════════════════════════════════
-- Seed tracked bills (manually curated — no live API yet)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO tracked_bills (bill_number, title, summary, sponsor_name, sponsor_party, status, introduced_date, last_action_date, last_action, tags, lb_relevance) VALUES
('HR-2024', 'Worker Ownership Incentive Act', 'Tax incentives for companies that transition to worker ownership models, including ESOPs and cooperatives.', 'Rep. Torres (NY)', 'D', 'committee', '2026-01-15', '2026-03-05', 'Referred to Ways and Means subcommittee', ARRAY['cooperative'], 'Could reduce cooperative formation costs by 30% in the first year. Directly supports LB''s model of worker-owned cooperative commerce.'),
('S-2025', 'Cooperative Commerce Enhancement Act', 'Reduces regulatory burden for cooperative business structures with under 5,000 members.', 'Sen. Collins (ME)', 'R', 'committee', '2026-02-01', '2026-03-10', 'Hearing scheduled in Small Business Committee', ARRAY['cooperative'], 'Simplifies annual reporting for co-ops with fewer than 1,000 members — exactly LB''s target size during growth phase.'),
('HR-3030', 'Community Food Security Act', 'Expands USDA grants for local food systems, neighborhood meal sharing programs, and cottage food operations.', 'Rep. Pingree (ME)', 'D', 'passed_house', '2025-11-20', '2026-03-01', 'Passed House 278-145', ARRAY['food_security'], 'Enables cottage food licenses in all 50 states. Supports Let''s Make Dinner and Let''s Get Groceries initiatives.'),
('S-1890', 'Small Business Zoning Reform Act', 'Allows mixed-use home-based manufacturing in residential zones for businesses under $100K annual revenue.', 'Sen. Rubio (FL)', 'R', 'introduced', '2026-02-28', '2026-02-28', 'Introduced and referred to Commerce Committee', ARRAY['small_business'], 'Would let LB operators run micro-manufacturing nodes from home legally — key for Let''s Make Bread and Emporium sellers.'),
('HR-4101', 'Cooperative Tax Credit Extension', 'Extends and expands Section 1042 tax-free rollovers for sales to worker cooperatives through 2036.', 'Rep. Khanna (CA)', 'D', 'committee', '2026-01-28', '2026-03-18', 'Hearing scheduled in Financial Services Committee', ARRAY['cooperative'], 'Makes employee buyouts 40% more affordable for retiring business owners — pipeline for cooperative conversions.'),
('S-3456', 'Rural Transportation Access Act', 'Federal grants for community-based transportation cooperatives in rural and underserved areas.', 'Sen. Tester (MT)', 'D', 'introduced', '2026-03-01', '2026-03-15', 'Referred to Commerce, Science and Transportation', ARRAY['transportation'], 'Directly funds the type of cooperative transportation Rally Group provides. Could bring federal support to LB''s ride-share model.'),
('HR-5500', 'Affordable Housing Cooperative Act', 'Creates a federal loan guarantee program for housing cooperatives and community land trusts.', 'Rep. Ocasio-Cortez (NY)', 'D', 'committee', '2025-12-10', '2026-03-08', 'Markup scheduled in Financial Services Committee', ARRAY['housing', 'cooperative'], 'Supports LB''s cooperative housing initiative — federal backing would dramatically reduce financing costs for member-owned housing.');
