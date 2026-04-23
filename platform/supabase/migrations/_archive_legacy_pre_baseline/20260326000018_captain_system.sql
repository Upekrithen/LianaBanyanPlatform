-- Captain System + Leadership Pedestals + The 300 Integration
-- K124: Governance onramp — Moses model (leaders of 10s, 50s, 100s, 1000s)

-- Captain profiles (operational leaders, NOT investors)
CREATE TABLE IF NOT EXISTS captains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,

  level TEXT DEFAULT 'captain_10' CHECK (level IN (
    'captain_10', 'captain_50', 'captain_100', 'captain_1000'
  )),

  marks_staked INT DEFAULT 0,
  joules_backing INT DEFAULT 0,

  orders_managed INT DEFAULT 0,
  orders_fulfilled INT DEFAULT 0,
  fulfillment_rate NUMERIC(5,2) DEFAULT 0,

  reputation_score NUMERIC(5,2) DEFAULT 50.0,

  region TEXT,
  city TEXT,

  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'probation', 'suspended', 'graduated')),

  medallion_produced BOOLEAN DEFAULT false,
  medallion_qr_code TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Captain level requirements (Moses model thresholds)
CREATE TABLE IF NOT EXISTS captain_level_requirements (
  level TEXT PRIMARY KEY,
  min_marks_staked INT NOT NULL,
  min_orders_fulfilled INT NOT NULL,
  min_fulfillment_rate NUMERIC(5,2) NOT NULL,
  min_reputation_score NUMERIC(5,2) NOT NULL,
  max_concurrent_orders INT NOT NULL
);

INSERT INTO captain_level_requirements VALUES
  ('captain_10', 100, 0, 0, 50, 10),
  ('captain_50', 500, 10, 85, 60, 50),
  ('captain_100', 2000, 50, 90, 70, 100),
  ('captain_1000', 10000, 100, 95, 80, 1000)
ON CONFLICT DO NOTHING;

-- Order assignments (Captain manages batches)
CREATE TABLE IF NOT EXISTS captain_order_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  captain_id UUID REFERENCES captains(id) NOT NULL,

  project_id UUID,
  batch_description TEXT NOT NULL,
  total_units INT NOT NULL,
  total_fiat_value NUMERIC(10,2) NOT NULL,

  marks_staked INT NOT NULL,

  recipients_total INT NOT NULL,
  confirmations_received INT DEFAULT 0,
  confirmation_threshold NUMERIC(5,2) DEFAULT 33.33,

  status TEXT DEFAULT 'active' CHECK (status IN (
    'active', 'shipped', 'confirmed', 'failed', 'disputed'
  )),

  fulfillment_deadline TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Delivery confirmations
CREATE TABLE IF NOT EXISTS delivery_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES captain_order_assignments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  confirmed BOOLEAN DEFAULT true,
  issue_reported TEXT,
  confirmed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(assignment_id, user_id)
);

-- Leadership Pedestals (Crown seats + The 300)
CREATE TABLE IF NOT EXISTS leadership_pedestals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  seat_title TEXT NOT NULL,
  seat_type TEXT NOT NULL CHECK (seat_type IN (
    'crown', 'board', 'advisory', 'ambassador', 'captain_regional'
  )),
  initiative TEXT,

  invited_name TEXT NOT NULL,
  invited_description TEXT,
  invited_image_url TEXT,
  letter_summary TEXT,

  support_count INT DEFAULT 0,

  status TEXT DEFAULT 'invited' CHECK (status IN (
    'invited', 'accepted', 'active', 'declined', 'open'
  )),
  claimed_by UUID REFERENCES auth.users(id),
  claimed_at TIMESTAMPTZ,

  tier TEXT CHECK (tier IN ('shield', 'spear', 'phalanx')),
  circle TEXT CHECK (circle IN (
    'patrons', 'media', 'academics', 'initiative_leaders', 'amplifiers', 'infrastructure'
  )),

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pedestal support signals (like Red Carpet demand signals)
CREATE TABLE IF NOT EXISTS pedestal_support_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedestal_id UUID REFERENCES leadership_pedestals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  signal_type TEXT DEFAULT 'support' CHECK (signal_type IN ('support', 'comment')),
  comment_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(pedestal_id, user_id, signal_type)
);

-- RLS
ALTER TABLE captains ENABLE ROW LEVEL SECURITY;
ALTER TABLE captain_order_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE leadership_pedestals ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedestal_support_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view captains" ON captains FOR SELECT USING (true);
CREATE POLICY "Users manage own captain profile" ON captains FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view order assignments" ON captain_order_assignments FOR SELECT USING (true);
CREATE POLICY "Captains manage own assignments" ON captain_order_assignments FOR ALL
  USING (captain_id IN (SELECT id FROM captains WHERE user_id = auth.uid()));
CREATE POLICY "Anyone can view delivery confirmations" ON delivery_confirmations FOR SELECT USING (true);
CREATE POLICY "Users manage own confirmations" ON delivery_confirmations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view pedestals" ON leadership_pedestals FOR SELECT USING (true);
CREATE POLICY "Anyone can view support signals" ON pedestal_support_signals FOR SELECT USING (true);
CREATE POLICY "Users manage own signals" ON pedestal_support_signals FOR ALL USING (auth.uid() = user_id);

-- Seed initial Crown Pedestals from The 300
INSERT INTO leadership_pedestals (seat_title, seat_type, initiative, invited_name, invited_description, tier, circle, status) VALUES
  ('Provisioner Mentor', 'crown', 'Let''s Get Groceries', 'José Andrés', 'Founder of World Central Kitchen. Bipartisan respect. Feeds the world.', 'shield', 'initiative_leaders', 'invited'),
  ('Grand Chef Mentor', 'crown', 'Let''s Make Dinner', 'Maneet Chauhan', 'James Beard Foundation. Food Network Iron Chef. Nashville restaurateur.', 'shield', 'initiative_leaders', 'invited'),
  ('First Shield Mentor', 'crown', 'Defense Klaus', 'Ruth Glenn', 'CEO of National Coalition Against Domestic Violence.', 'shield', 'initiative_leaders', 'invited'),
  ('First Shield Knight UK', 'crown', 'Defense Klaus', 'Robert Kaiser', 'UK domestic violence advocate and security expert.', 'shield', 'initiative_leaders', 'invited'),
  ('Responder General', 'crown', 'Rally Group', 'Kimberly Williams', 'Crisis response coordinator.', 'shield', 'initiative_leaders', 'invited'),
  ('Apothecary Mentor', 'crown', 'Lifeline Medications', 'Alex Oshmyansky', 'Founder of Mark Cuban Cost Plus Drug Company.', 'shield', 'initiative_leaders', 'invited'),
  ('Lender Mentor', 'crown', 'VSL / Let''s Make Bread', 'Jessica Jackley', 'Co-founder of Kiva. Microfinance pioneer.', 'shield', 'initiative_leaders', 'invited'),
  ('Maker Chancellor', 'crown', 'HexIsle / Manufacturing', 'Dale Dougherty', 'Founder of Make: Magazine and Maker Faire.', 'shield', 'initiative_leaders', 'invited'),
  ('CEO', 'board', 'Liana Banyan Corporation', 'Michael Seibel', 'Former Managing Director, Y Combinator.', 'shield', 'initiative_leaders', 'invited'),
  ('CFO', 'board', 'Liana Banyan Corporation', 'Tom Simon', 'Financial operations leader.', 'shield', 'initiative_leaders', 'invited'),
  ('Infrastructure Chancellor', 'crown', 'Platform Infrastructure', 'Craig Newmark', 'Founder of Craigslist. Civic tech philanthropist.', 'shield', 'infrastructure', 'invited'),
  ('Board Chair', 'board', 'Liana Banyan Corporation', 'MacKenzie Scott', 'Philanthropist. Systems-level giver.', 'shield', 'patrons', 'invited')
ON CONFLICT DO NOTHING;
