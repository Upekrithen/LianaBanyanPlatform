-- K127: Business Campaign Onboarding System
-- Innovation #1972 (Crown Jewel) — Universal business onboarding engine

CREATE TABLE IF NOT EXISTS business_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL CHECK (business_type IN (
    'restaurant', 'food_truck', 'bakery', 'catering',
    'barber', 'salon', 'spa',
    'mechanic', 'auto_service',
    'dry_cleaner', 'laundry',
    'grocery', 'convenience',
    'tutoring', 'education',
    'gym', 'fitness',
    'pet_service', 'veterinary',
    'home_service', 'plumbing', 'electrical', 'cleaning',
    'retail', 'other'
  )),
  business_address TEXT,
  business_city TEXT NOT NULL,
  business_state TEXT,
  business_website TEXT,
  business_phone TEXT,

  nominated_by UUID REFERENCES auth.users(id) NOT NULL,
  nomination_reason TEXT,

  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  proposed_discount_pct NUMERIC(5,2) DEFAULT 10.0,
  image_url TEXT,

  pledge_count INT DEFAULT 0,
  pledge_total_credits NUMERIC(10,2) DEFAULT 0,
  pledge_threshold INT DEFAULT 30,

  status TEXT DEFAULT 'gathering' CHECK (status IN (
    'gathering',
    'threshold_met',
    'pitched',
    'accepted',
    'active',
    'declined',
    'expired'
  )),

  captain_id UUID REFERENCES auth.users(id),
  pitched_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '90 days')
);

CREATE TABLE IF NOT EXISTS campaign_pledges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES business_campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,

  pledge_type TEXT DEFAULT 'advance_order' CHECK (pledge_type IN (
    'advance_order',
    'recurring',
    'marks_seed'
  )),
  credit_amount NUMERIC(10,2) DEFAULT 0,
  marks_amount INT DEFAULT 0,

  note TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(campaign_id, user_id)
);

CREATE TABLE IF NOT EXISTS pitch_packets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES business_campaigns(id) NOT NULL,
  captain_id UUID REFERENCES auth.users(id) NOT NULL,

  pledge_count INT NOT NULL,
  total_pledged NUMERIC(10,2) NOT NULL,
  avg_order_value NUMERIC(10,2),
  proposed_discount TEXT,

  qr_code_url TEXT,

  generated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE business_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_packets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view campaigns" ON business_campaigns FOR SELECT USING (true);
CREATE POLICY "Authenticated users create campaigns" ON business_campaigns FOR INSERT WITH CHECK (auth.uid() = nominated_by);
CREATE POLICY "Campaign nominators or captains can update" ON business_campaigns FOR UPDATE USING (auth.uid() = nominated_by OR auth.uid() = captain_id);
CREATE POLICY "Anyone can view pledges" ON campaign_pledges FOR SELECT USING (true);
CREATE POLICY "Users manage own pledges" ON campaign_pledges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Captains view own packets" ON pitch_packets FOR SELECT USING (auth.uid() = captain_id);
CREATE POLICY "Captains create packets" ON pitch_packets FOR INSERT WITH CHECK (auth.uid() = captain_id);

INSERT INTO business_campaigns (
  business_name, business_type, business_city, business_state,
  slug, description, nominated_by, nomination_reason,
  proposed_discount_pct, pledge_threshold
) VALUES (
  'La Capital del Sabor', 'restaurant', 'San Antonio', 'TX',
  'la-capital-del-sabor',
  'Featured on mysanantonio.com/food for their incredible lunch specials. Local favorite on Bandera Road. Let''s bring them 50+ guaranteed customers with LB Card volume pricing.',
  (SELECT id FROM auth.users LIMIT 1),
  'Featured Sunday on mysanantonio.com/food. Amazing lunch specials. This is our first Captain''s Pitch.',
  10.0, 30
) ON CONFLICT (slug) DO NOTHING;
