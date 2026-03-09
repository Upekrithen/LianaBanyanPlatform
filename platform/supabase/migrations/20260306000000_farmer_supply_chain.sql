-- ═══════════════════════════════════════════════════════════════════════
-- FARMER SUPPLY CHAIN — $5/Serving Vertical Integration
-- March 6, 2026
-- LMD (#1) + LGG (#2) + Brass Tacks (#16)
-- ═══════════════════════════════════════════════════════════════════════

-- 1. FARMER PROFILES
CREATE TABLE IF NOT EXISTS farmer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  farm_name TEXT NOT NULL,
  farmer_name TEXT NOT NULL,
  county TEXT,
  state TEXT,
  distance_to_nearest_node NUMERIC,
  lat NUMERIC,
  lng NUMERIC,
  challenges TEXT[],
  advance_order_enabled BOOLEAN DEFAULT true,
  minimum_advance_order_days INTEGER DEFAULT 2,
  pickup_schedule TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. FARMER PRODUCE LISTINGS
CREATE TABLE IF NOT EXISTS farmer_produce (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmer_profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('vegetables','fruits','herbs','dairy','eggs','meat','grains','honey','preserves','flowers')),
  item_name TEXT NOT NULL,
  seasonal_availability TEXT,
  organic_certified BOOLEAN DEFAULT false,
  estimated_weekly_volume TEXT,
  price_per_unit NUMERIC,
  unit TEXT DEFAULT 'lb',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. DISTRIBUTION NODES
CREATE TABLE IF NOT EXISTS distribution_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('keep','guild-hall','member-home','church','school','business','mobile','farm-gate')),
  address TEXT,
  operator_id UUID REFERENCES auth.users(id),
  operator_share NUMERIC DEFAULT 0.833,
  has_refrigeration BOOLEAN DEFAULT false,
  has_freezer BOOLEAN DEFAULT false,
  has_freeze_dry BOOLEAN DEFAULT false,
  has_meal_prep_kitchen BOOLEAN DEFAULT false,
  parking_spaces INTEGER DEFAULT 0,
  max_weekly_volume TEXT,
  distribution_days TEXT[],
  advance_order_cutoff TEXT,
  zip_codes TEXT[],
  member_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ADVANCE ORDERS — $5/serving
CREATE TABLE IF NOT EXISTS advance_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES auth.users(id),
  node_id UUID REFERENCES distribution_nodes(id),
  status TEXT NOT NULL DEFAULT 'advance-placed' CHECK (status IN ('advance-placed','farmer-confirmed','harvested','in-transit','at-node','picked-up','delivered')),
  subtotal NUMERIC NOT NULL DEFAULT 0,
  farmer_share NUMERIC DEFAULT 0,
  driver_share NUMERIC DEFAULT 0,
  node_operator_share NUMERIC DEFAULT 0,
  platform_margin NUMERIC DEFAULT 0,
  driver_id UUID REFERENCES auth.users(id),
  delivery_window_start TIMESTAMPTZ,
  delivery_window_end TIMESTAMPTZ,
  actual_delivery_at TIMESTAMPTZ,
  order_placed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. ADVANCE ORDER ITEMS
CREATE TABLE IF NOT EXISTS advance_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES advance_orders(id) ON DELETE CASCADE,
  farmer_id UUID REFERENCES farmer_profiles(id),
  produce_category TEXT,
  item_name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  price_credits NUMERIC NOT NULL,
  organic BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. FREEZE-DRIED MEAL KITS
CREATE TABLE IF NOT EXISTS meal_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  servings INTEGER NOT NULL DEFAULT 4,
  shelf_life TEXT DEFAULT '25 years',
  cost_basis NUMERIC NOT NULL,
  c20_price NUMERIC NOT NULL,
  advance_price_per_serving NUMERIC NOT NULL DEFAULT 5.00,
  walkup_price_per_serving NUMERIC NOT NULL DEFAULT 7.00,
  bulk_price_per_serving NUMERIC NOT NULL DEFAULT 4.00,
  cook_time TEXT DEFAULT '15 minutes',
  difficulty TEXT DEFAULT 'easy' CHECK (difficulty IN ('easy','medium','advanced')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. MEAL KIT INGREDIENTS
CREATE TABLE IF NOT EXISTS meal_kit_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id UUID REFERENCES meal_kits(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  source TEXT CHECK (source IN ('local-farm','bulk-cooperative','specialty')),
  farmer_id UUID REFERENCES farmer_profiles(id),
  preservation_method TEXT CHECK (preservation_method IN ('freeze-dried','dehydrated','fresh','canned')),
  weight TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. STANDING ORDERS (recurring advance orders)
CREATE TABLE IF NOT EXISTS standing_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES auth.users(id),
  node_id UUID REFERENCES distribution_nodes(id),
  frequency TEXT NOT NULL CHECK (frequency IN ('one-time','weekly','biweekly','monthly')),
  preferred_day TEXT,
  preferred_time_window TEXT,
  advance_notice_days INTEGER DEFAULT 2,
  next_delivery_date DATE,
  pricing_tier TEXT NOT NULL DEFAULT 'advance' CHECK (pricing_tier IN ('advance','bulk')),
  price_per_serving NUMERIC NOT NULL DEFAULT 5.00,
  weekly_total NUMERIC DEFAULT 0,
  distributor_id UUID REFERENCES auth.users(id),
  distributor_earnings NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_paused BOOLEAN DEFAULT false,
  pause_until DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. STANDING ORDER ITEMS
CREATE TABLE IF NOT EXISTS standing_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  standing_order_id UUID REFERENCES standing_orders(id) ON DELETE CASCADE,
  kit_id UUID REFERENCES meal_kits(id),
  kit_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  servings INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. LOCAL DISTRIBUTOR BUSINESSES
CREATE TABLE IF NOT EXISTS local_distributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES auth.users(id),
  business_name TEXT NOT NULL,
  service_area TEXT[],
  node_ids UUID[],
  kit_types_offered TEXT[],
  weekly_capacity INTEGER DEFAULT 50,
  cost_per_serving_c20 NUMERIC DEFAULT 1.35,
  advance_retail_per_serving NUMERIC DEFAULT 5.00,
  walkup_retail_per_serving NUMERIC DEFAULT 7.00,
  bulk_retail_per_serving NUMERIC DEFAULT 4.00,
  active_standing_orders INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  member_since DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. PICKUP DRIVERS
CREATE TABLE IF NOT EXISTS pickup_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  vehicle_type TEXT CHECK (vehicle_type IN ('car','van','truck','refrigerated-van')),
  vehicle_capacity TEXT,
  has_refrigeration BOOLEAN DEFAULT false,
  service_area TEXT[],
  available_days TEXT[],
  route_optimized BOOLEAN DEFAULT false,
  earnings_per_route NUMERIC DEFAULT 0,
  weekly_routes INTEGER DEFAULT 0,
  monthly_earnings NUMERIC DEFAULT 0,
  creator_share NUMERIC DEFAULT 0.833,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. PICKUP ROUTES
CREATE TABLE IF NOT EXISTS pickup_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES pickup_drivers(id),
  route_date DATE NOT NULL,
  total_miles NUMERIC DEFAULT 0,
  total_stops INTEGER DEFAULT 0,
  estimated_duration TEXT,
  fuel_cost NUMERIC DEFAULT 0,
  driver_earnings NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned','in-progress','completed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 13. PICKUP ROUTE STOPS
CREATE TABLE IF NOT EXISTS pickup_route_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES pickup_routes(id) ON DELETE CASCADE,
  stop_order INTEGER NOT NULL,
  stop_type TEXT CHECK (stop_type IN ('farm-pickup','node-delivery')),
  location_id UUID,
  location_name TEXT,
  estimated_arrival TIMESTAMPTZ,
  items TEXT[],
  weight TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. MEAL-PREP PARTIES
CREATE TABLE IF NOT EXISTS meal_prep_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES auth.users(id),
  host_name TEXT NOT NULL,
  party_type TEXT NOT NULL CHECK (party_type IN ('fresh-cook','freeze-dried-kit','mixed','preservation')),
  node_id UUID REFERENCES distribution_nodes(id),
  home_address TEXT,
  max_participants INTEGER DEFAULT 10,
  current_participants INTEGER DEFAULT 0,
  participant_fee NUMERIC NOT NULL DEFAULT 20.00,
  party_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration TEXT DEFAULT '2 hours',
  total_revenue NUMERIC DEFAULT 0,
  host_share NUMERIC DEFAULT 0,
  ingredient_cost NUMERIC DEFAULT 0,
  platform_margin NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming','in-progress','completed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 15. MEAL-PREP PARTY KITS
CREATE TABLE IF NOT EXISTS meal_prep_party_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID REFERENCES meal_prep_parties(id) ON DELETE CASCADE,
  kit_id UUID REFERENCES meal_kits(id),
  kit_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════
-- SEED DATA: Initial meal kits at $5/serving
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO meal_kits (name, description, servings, cost_basis, c20_price, advance_price_per_serving, walkup_price_per_serving, bulk_price_per_serving, cook_time, difficulty)
VALUES
  ('Hearty Harvest Stew', 'Farm-fresh vegetables in a savory broth. Just add water, simmer 15 minutes.', 4, 4.50, 5.40, 5.00, 7.00, 4.00, '15 minutes', 'easy'),
  ('Garden Pasta Primavera', 'Seasonal vegetables over pasta with garlic herb sauce. Just add water, cook 20 minutes.', 4, 5.00, 6.00, 5.00, 7.00, 4.00, '20 minutes', 'easy'),
  ('Farm Breakfast Scramble', 'Eggs, peppers, onions, potatoes, cheese. Just add water, cook 10 minutes in skillet.', 2, 3.50, 4.20, 5.00, 7.00, 4.00, '10 minutes', 'easy'),
  ('Farmhouse Chicken Veggie Soup', 'Hearty chicken with farm vegetables in savory broth. Just add water, simmer 15 minutes.', 4, 5.50, 6.60, 5.00, 7.00, 4.00, '15 minutes', 'easy'),
  ('Frontier Chili Con Carne', 'Spiced ground beef with beans, tomatoes, peppers. Just add water, simmer 20 minutes.', 4, 6.00, 7.20, 5.00, 7.00, 4.00, '20 minutes', 'easy')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════
-- RLS NOTE: These tables need proper RLS policies.
-- For now, enable RLS on all tables. Proper policies will be
-- added in the RLS audit migration.
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_produce ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE advance_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE advance_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_kit_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE standing_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE standing_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE local_distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_prep_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_prep_party_kits ENABLE ROW LEVEL SECURITY;

-- Public read access for meal kits and distribution nodes (public-facing data)
CREATE POLICY "meal_kits_public_read" ON meal_kits FOR SELECT USING (true);
CREATE POLICY "distribution_nodes_public_read" ON distribution_nodes FOR SELECT USING (true);
CREATE POLICY "farmer_profiles_public_read" ON farmer_profiles FOR SELECT USING (is_active = true);

-- Authenticated users can create orders
CREATE POLICY "advance_orders_user_insert" ON advance_orders FOR INSERT WITH CHECK (auth.uid() = member_id);
CREATE POLICY "advance_orders_user_select" ON advance_orders FOR SELECT USING (auth.uid() = member_id OR auth.uid() = driver_id);
CREATE POLICY "standing_orders_user_insert" ON standing_orders FOR INSERT WITH CHECK (auth.uid() = member_id);
CREATE POLICY "standing_orders_user_select" ON standing_orders FOR SELECT USING (auth.uid() = member_id OR auth.uid() = distributor_id);
CREATE POLICY "standing_orders_user_update" ON standing_orders FOR UPDATE USING (auth.uid() = member_id);

-- Farmers manage their own profiles
CREATE POLICY "farmer_profiles_owner" ON farmer_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "farmer_produce_owner" ON farmer_produce FOR ALL USING (
  farmer_id IN (SELECT id FROM farmer_profiles WHERE user_id = auth.uid())
);

-- Drivers manage their own records
CREATE POLICY "pickup_drivers_owner" ON pickup_drivers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "pickup_routes_driver" ON pickup_routes FOR ALL USING (
  driver_id IN (SELECT id FROM pickup_drivers WHERE user_id = auth.uid())
);

-- Distributors manage their own businesses
CREATE POLICY "local_distributors_owner" ON local_distributors FOR ALL USING (auth.uid() = member_id);

-- Party hosts manage their own events
CREATE POLICY "meal_prep_parties_host" ON meal_prep_parties FOR ALL USING (auth.uid() = host_id);
CREATE POLICY "meal_prep_parties_public_read" ON meal_prep_parties FOR SELECT USING (status = 'upcoming');
