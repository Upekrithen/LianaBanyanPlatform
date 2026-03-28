-- ============================================
-- MISSION TWO: Cooperative Housing
-- Innovations #1927-#1935
-- Session K89
-- ============================================

CREATE TABLE IF NOT EXISTS housing_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT DEFAULT 'US',
  property_type TEXT NOT NULL CHECK (property_type IN ('residential', 'commercial', 'vacation', 'garage')),
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'acquiring', 'owned', 'leased', 'listed')),
  acquisition_cost NUMERIC,
  current_value NUMERIC,
  monthly_revenue NUMERIC DEFAULT 0,
  monthly_expenses NUMERIC DEFAULT 0,
  airbnb_units INT DEFAULT 0,
  housing_units INT DEFAULT 0,
  max_occupants INT,
  contributed_by UUID REFERENCES auth.users(id),
  node_id UUID,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS housing_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id UUID NOT NULL REFERENCES auth.users(id),
  property_id UUID REFERENCES housing_properties(id),
  contribution_type TEXT NOT NULL CHECK (contribution_type IN (
    'property_donation', 'airbnb_revenue', 'maintenance_labor',
    'credit_allocation', 'mark_pledge', 'cash_contribution'
  )),
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'credits' CHECK (currency IN ('credits', 'marks', 'backed_marks', 'usd')),
  description TEXT,
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS housing_occupancy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES housing_properties(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT NOT NULL DEFAULT 'tenant' CHECK (role IN ('tenant', 'steward', 'contributor', 'caretaker')),
  monthly_rate NUMERIC,
  currency TEXT DEFAULT 'credits',
  move_in_date DATE NOT NULL,
  move_out_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(property_id, member_id, move_in_date)
);

CREATE TABLE IF NOT EXISTS housing_waterwheel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES housing_properties(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  gross_revenue NUMERIC NOT NULL DEFAULT 0,
  airbnb_share NUMERIC DEFAULT 0,
  tenant_subsidy NUMERIC DEFAULT 0,
  maintenance_fund NUMERIC DEFAULT 0,
  cooperative_fund NUMERIC DEFAULT 0,
  jobs_created INT DEFAULT 0,
  multiplier_effect NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vacation_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES housing_properties(id) ON DELETE CASCADE,
  available_from DATE NOT NULL,
  available_to DATE NOT NULL,
  nightly_rate NUMERIC NOT NULL,
  currency TEXT DEFAULT 'credits',
  max_guests INT DEFAULT 4,
  amenities TEXT[],
  house_rules TEXT,
  priority_tier TEXT DEFAULT 'member' CHECK (priority_tier IN ('property_contributor', 'any_contributor', 'member', 'public')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vacation_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES vacation_listings(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES auth.users(id),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  total_cost NUMERIC NOT NULL,
  currency TEXT DEFAULT 'credits',
  guests INT DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE housing_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE housing_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE housing_occupancy ENABLE ROW LEVEL SECURITY;
ALTER TABLE housing_waterwheel ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacation_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacation_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view properties" ON housing_properties FOR SELECT USING (true);
CREATE POLICY "Admins manage properties" ON housing_properties FOR ALL USING (is_admin());
CREATE POLICY "Members can propose properties" ON housing_properties FOR INSERT WITH CHECK (auth.uid() = contributed_by);

CREATE POLICY "Members view own contributions" ON housing_contributions FOR SELECT USING (auth.uid() = contributor_id OR is_admin());
CREATE POLICY "Members create contributions" ON housing_contributions FOR INSERT WITH CHECK (auth.uid() = contributor_id);
CREATE POLICY "Admins manage contributions" ON housing_contributions FOR ALL USING (is_admin());

CREATE POLICY "Occupants view own" ON housing_occupancy FOR SELECT USING (auth.uid() = member_id OR is_admin());
CREATE POLICY "Admins manage occupancy" ON housing_occupancy FOR ALL USING (is_admin());

CREATE POLICY "Anyone can view waterwheel" ON housing_waterwheel FOR SELECT USING (true);
CREATE POLICY "Admins manage waterwheel" ON housing_waterwheel FOR ALL USING (is_admin());

CREATE POLICY "Anyone can view vacation listings" ON vacation_listings FOR SELECT USING (true);
CREATE POLICY "Admins manage listings" ON vacation_listings FOR ALL USING (is_admin());

CREATE POLICY "Members view own bookings" ON vacation_bookings FOR SELECT USING (auth.uid() = guest_id OR is_admin());
CREATE POLICY "Members create bookings" ON vacation_bookings FOR INSERT WITH CHECK (auth.uid() = guest_id);
CREATE POLICY "Admins manage bookings" ON vacation_bookings FOR ALL USING (is_admin());

-- Seed: 3 proof-of-concept properties
INSERT INTO housing_properties (title, description, city, state, property_type, status, acquisition_cost, max_occupants, airbnb_units, housing_units) VALUES
  ('Founders House', 'First cooperative residence — proof of concept. Dual-use: 2 AirBnB units subsidize 2 cooperative housing units.', 'San Antonio', 'TX', 'residential', 'proposed', 200000, 4, 2, 2),
  ('Maker Workshop Loft', 'Live-work space above shared workshop. Commercial ground floor, residential loft. Let''s Make Bread incubator space.', 'San Antonio', 'TX', 'commercial', 'proposed', 120000, 2, 0, 2),
  ('Ozarks Retreat Cabin', 'Member vacation property. Available to all members at Cost+20%. Priority to Housing Fund contributors.', 'Branson', 'MO', 'vacation', 'proposed', 150000, 6, 0, 0);

-- Seed vacation listing
INSERT INTO vacation_listings (property_id, available_from, available_to, nightly_rate, max_guests, amenities, house_rules, priority_tier)
SELECT id, '2026-06-01', '2026-12-31', 64, 6,
  ARRAY['wifi', 'kitchen', 'fireplace', 'lake_access', 'parking'],
  'No smoking indoors. Quiet hours 10pm-7am. Check-in 3pm, check-out 11am.',
  'any_contributor'
FROM housing_properties WHERE title = 'Ozarks Retreat Cabin';

-- Seed WaterWheel projection
INSERT INTO housing_waterwheel (property_id, period_start, period_end, gross_revenue, airbnb_share, tenant_subsidy, maintenance_fund, cooperative_fund, jobs_created, multiplier_effect, notes)
SELECT id, '2026-04-01', '2026-04-30', 4000, 3000, 400, 300, 300, 4, 2.23,
  'Projected Month 1: 2 AirBnB units at $1,500/mo + 2 housing units at $500/mo (Cost+20%). Jobs: cleaner, guest steward, maintenance, supply runner.'
FROM housing_properties WHERE title = 'Founders House';
