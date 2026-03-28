-- Lemon Lot: Peer-to-peer vehicle sharing
CREATE TABLE lemon_lot_vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  color TEXT,
  license_plate TEXT,
  vin TEXT,
  mileage INTEGER,
  daily_rate NUMERIC(10,2) NOT NULL,
  weekly_rate NUMERIC(10,2),
  monthly_rate NUMERIC(10,2),
  photos TEXT[] DEFAULT '{}',
  description TEXT,
  features TEXT[] DEFAULT '{}',
  insurance_verified BOOLEAN DEFAULT false,
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  location_city TEXT,
  location_state TEXT,
  location_zip TEXT,
  availability_status TEXT DEFAULT 'available',
  total_rentals INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lemon Lot rentals
CREATE TABLE lemon_lot_rentals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES lemon_lot_vehicles(id) NOT NULL,
  renter_id UUID REFERENCES auth.users(id) NOT NULL,
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  daily_rate NUMERIC(10,2) NOT NULL,
  total_cost NUMERIC(10,2) NOT NULL,
  platform_fee NUMERIC(10,2) NOT NULL,
  owner_payout NUMERIC(10,2) NOT NULL,
  gleaners_share NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  pickup_location TEXT,
  return_location TEXT,
  renter_rating INTEGER,
  owner_rating INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Local Wheels: Fleet vehicles with Earn-Down
CREATE TABLE local_wheels_fleet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES lemon_lot_vehicles(id),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  purchase_price NUMERIC(10,2) NOT NULL,
  remaining_balance NUMERIC(10,2) NOT NULL,
  earn_down_percentage NUMERIC(5,2) DEFAULT 20.0,
  driver_percentage NUMERIC(5,2) DEFAULT 80.0,
  assigned_driver_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'available',
  total_earned NUMERIC(10,2) DEFAULT 0,
  total_earn_down NUMERIC(10,2) DEFAULT 0,
  payoff_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rideshare Routes: Recurring commute matching
CREATE TABLE rideshare_routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID REFERENCES auth.users(id) NOT NULL,
  origin_address TEXT NOT NULL,
  origin_city TEXT NOT NULL,
  origin_zip TEXT NOT NULL,
  origin_lat NUMERIC(10,7),
  origin_lng NUMERIC(10,7),
  destination_address TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  destination_zip TEXT NOT NULL,
  destination_lat NUMERIC(10,7),
  destination_lng NUMERIC(10,7),
  departure_time TIME NOT NULL,
  return_time TIME,
  days_available TEXT[] DEFAULT '{}',
  seats_available INTEGER DEFAULT 3,
  cost_per_ride NUMERIC(10,2),
  vehicle_description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rideshare_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID REFERENCES rideshare_routes(id) NOT NULL,
  rider_id UUID REFERENCES auth.users(id) NOT NULL,
  pickup_address TEXT,
  pickup_lat NUMERIC(10,7),
  pickup_lng NUMERIC(10,7),
  days_requested TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  matched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(route_id, rider_id)
);

-- Safety Ledger: Photos of driver + passenger with timestamps/GPS
CREATE TABLE safety_ledger (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_type TEXT NOT NULL,
  trip_id UUID NOT NULL,
  driver_id UUID REFERENCES auth.users(id) NOT NULL,
  passenger_id UUID REFERENCES auth.users(id),
  driver_photo_url TEXT,
  passenger_photo_url TEXT,
  start_location_lat NUMERIC(10,7),
  start_location_lng NUMERIC(10,7),
  end_location_lat NUMERIC(10,7),
  end_location_lng NUMERIC(10,7),
  start_timestamp TIMESTAMPTZ DEFAULT NOW(),
  end_timestamp TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE lemon_lot_vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view available vehicles" ON lemon_lot_vehicles FOR SELECT USING (true);
CREATE POLICY "Owner manages own vehicles" ON lemon_lot_vehicles FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Admin manages all vehicles" ON lemon_lot_vehicles FOR ALL USING (public.is_admin());

ALTER TABLE lemon_lot_rentals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view rentals" ON lemon_lot_rentals FOR SELECT USING (auth.uid() = renter_id OR auth.uid() = owner_id OR public.is_admin());
CREATE POLICY "Renter can create rental" ON lemon_lot_rentals FOR INSERT WITH CHECK (auth.uid() = renter_id);
CREATE POLICY "Participants can update rental" ON lemon_lot_rentals FOR UPDATE USING (auth.uid() = renter_id OR auth.uid() = owner_id OR public.is_admin());

ALTER TABLE local_wheels_fleet ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view fleet" ON local_wheels_fleet FOR SELECT USING (true);
CREATE POLICY "Admin manages fleet" ON local_wheels_fleet FOR ALL USING (public.is_admin());

ALTER TABLE rideshare_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active routes" ON rideshare_routes FOR SELECT USING (is_active = true OR auth.uid() = driver_id);
CREATE POLICY "Driver manages own routes" ON rideshare_routes FOR ALL USING (auth.uid() = driver_id);

ALTER TABLE rideshare_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view matches" ON rideshare_matches FOR SELECT USING (auth.uid() = rider_id OR auth.uid() IN (SELECT driver_id FROM rideshare_routes WHERE id = route_id));
CREATE POLICY "Rider can request match" ON rideshare_matches FOR INSERT WITH CHECK (auth.uid() = rider_id);

ALTER TABLE safety_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view safety ledger" ON safety_ledger FOR SELECT USING (auth.uid() = driver_id OR auth.uid() = passenger_id OR public.is_admin());
CREATE POLICY "Driver or passenger can create safety entry" ON safety_ledger FOR INSERT WITH CHECK (auth.uid() = driver_id OR auth.uid() = passenger_id);
CREATE POLICY "Admin can view all safety entries" ON safety_ledger FOR SELECT USING (public.is_admin());
