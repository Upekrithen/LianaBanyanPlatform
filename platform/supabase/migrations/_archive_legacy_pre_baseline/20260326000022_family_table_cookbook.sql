-- K130: Family Table Cookbook — Restaurant Listings, Menus, Meal Plans, Scheduled Orders
-- Restaurant listings
CREATE TABLE IF NOT EXISTS restaurant_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  cuisine TEXT[],
  price_range TEXT,
  partnership_tier TEXT DEFAULT 'none' CHECK (partnership_tier IN ('none', 'cookbook', 'c90', 'c60', 'c40', 'c20')),
  discount_pct NUMERIC DEFAULT 0,
  hours JSONB,
  delivery_options TEXT[] DEFAULT '{}',
  scheduling_available BOOLEAN DEFAULT false,
  captain_id UUID REFERENCES auth.users(id),
  campaign_id UUID,
  description TEXT,
  phone TEXT,
  website TEXT,
  image_url TEXT,
  onboarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Menu items
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurant_listings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_retail NUMERIC NOT NULL,
  price_lb NUMERIC,
  category TEXT,
  dietary TEXT[],
  available_days TEXT[],
  available_hours TEXT,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Meal plans (weekly planner)
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  week_start DATE NOT NULL,
  meals JSONB NOT NULL DEFAULT '[]',
  submitted BOOLEAN DEFAULT false,
  total_estimated_cost NUMERIC DEFAULT 0,
  total_savings NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- Scheduled orders (pre-orders generated from meal plans)
CREATE TABLE IF NOT EXISTS scheduled_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  restaurant_id UUID REFERENCES restaurant_listings(id),
  meal_plan_id UUID REFERENCES meal_plans(id),
  items JSONB NOT NULL,
  scheduled_date DATE NOT NULL,
  pickup_window TEXT,
  servings INTEGER DEFAULT 1,
  total_retail NUMERIC,
  total_lb NUMERIC,
  advance_payment NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'preparing', 'ready', 'picked_up', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Daily manifests (aggregated order view for restaurants)
CREATE TABLE IF NOT EXISTS daily_manifests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurant_listings(id),
  manifest_date DATE NOT NULL,
  summary JSONB NOT NULL DEFAULT '[]',
  total_orders INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  advance_paid NUMERIC DEFAULT 0,
  sent_at TIMESTAMPTZ,
  UNIQUE(restaurant_id, manifest_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_restaurant_listings_city ON restaurant_listings(city);
CREATE INDEX IF NOT EXISTS idx_restaurant_listings_tier ON restaurant_listings(partnership_tier);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_week ON meal_plans(user_id, week_start);
CREATE INDEX IF NOT EXISTS idx_scheduled_orders_restaurant_date ON scheduled_orders(restaurant_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_orders_user ON scheduled_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_manifests_restaurant_date ON daily_manifests(restaurant_id, manifest_date);

-- RLS
ALTER TABLE restaurant_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read restaurants" ON restaurant_listings FOR SELECT USING (true);
CREATE POLICY "Captains manage own restaurants" ON restaurant_listings FOR ALL USING (captain_id = auth.uid());

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read menu items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Restaurant captain manages menu" ON menu_items FOR ALL
  USING (EXISTS (SELECT 1 FROM restaurant_listings r WHERE r.id = menu_items.restaurant_id AND r.captain_id = auth.uid()));

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own meal plans" ON meal_plans FOR ALL USING (user_id = auth.uid());

ALTER TABLE scheduled_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own scheduled orders" ON scheduled_orders FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Restaurant captains view orders" ON scheduled_orders FOR SELECT
  USING (EXISTS (SELECT 1 FROM restaurant_listings r WHERE r.id = scheduled_orders.restaurant_id AND r.captain_id = auth.uid()));

ALTER TABLE daily_manifests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Restaurant captains view manifests" ON daily_manifests FOR SELECT
  USING (EXISTS (SELECT 1 FROM restaurant_listings r WHERE r.id = daily_manifests.restaurant_id AND r.captain_id = auth.uid()));
CREATE POLICY "Service role manages manifests" ON daily_manifests FOR ALL USING (auth.role() = 'service_role');

-- Seed: La Capital del Sabor (from K127 campaign)
INSERT INTO restaurant_listings (name, address, city, state, cuisine, price_range, partnership_tier, discount_pct, description, scheduling_available, delivery_options)
VALUES (
  'La Capital del Sabor',
  'Bandera Rd',
  'San Antonio',
  'TX',
  ARRAY['Mexican', 'Latin American'],
  '$6.99-$14.55',
  'c90',
  10,
  'Authentic Mexican cuisine featured on mysanantonio.com/food. Known for Borrego, Lunch Specials, and Consome.',
  true,
  ARRAY['pickup', 'own_delivery']
) ON CONFLICT DO NOTHING;

-- Seed menu items for La Capital
INSERT INTO menu_items (restaurant_id, name, description, price_retail, price_lb, category, dietary, available_days, available_hours)
SELECT r.id, v.name, v.description, v.price_retail, v.price_lb, v.category, v.dietary, v.available_days, v.available_hours
FROM restaurant_listings r,
(VALUES
  ('Lunch Special (Rotating Daily)', 'Rotating entrée with rice, beans, and tea', 9.49, 8.54, 'lunch_special', ARRAY['affordable']::TEXT[], ARRAY['mon','tue','wed','thu','fri']::TEXT[], '11:00-15:00'),
  ('Borrego Plate', 'Slow-roasted lamb with handmade tortillas', 14.55, 13.10, 'dinner', ARRAY[]::TEXT[], ARRAY['mon','tue','wed','thu','fri','sat','sun']::TEXT[], '11:00-21:00'),
  ('Consome', 'Traditional beef consommé with garnishes', 8.99, 8.09, 'soup', ARRAY[]::TEXT[], ARRAY['sat','sun']::TEXT[], '08:00-14:00'),
  ('Agua Fresca (Guava)', 'Fresh guava agua fresca', 3.99, 3.59, 'beverage', ARRAY['vegetarian','vegan']::TEXT[], ARRAY['mon','tue','wed','thu','fri','sat','sun']::TEXT[], '11:00-21:00'),
  ('Pan Dulce Assortment', 'Mixed box of fresh pan dulce (6 pieces)', 6.99, 6.29, 'bakery', ARRAY['vegetarian']::TEXT[], ARRAY['mon','tue','wed','thu','fri','sat','sun']::TEXT[], '07:00-18:00')
) AS v(name, description, price_retail, price_lb, category, dietary, available_days, available_hours)
WHERE r.name = 'La Capital del Sabor';

-- Seed: Lupita's Bakery (no partnership — cookbook only)
INSERT INTO restaurant_listings (name, address, city, state, cuisine, price_range, partnership_tier, discount_pct, description, scheduling_available, delivery_options)
VALUES (
  'Lupita''s Bakery',
  'Bandera Rd',
  'San Antonio',
  'TX',
  ARRAY['Bakery', 'Mexican'],
  '$2.99-$8.99',
  'cookbook',
  0,
  'Neighborhood bakery specializing in pan dulce, tres leches, and custom pastry boxes.',
  false,
  ARRAY['pickup']
) ON CONFLICT DO NOTHING;

INSERT INTO menu_items (restaurant_id, name, description, price_retail, price_lb, category, dietary, available_days, available_hours)
SELECT r.id, v.name, v.description, v.price_retail, v.price_lb, v.category, v.dietary, v.available_days, v.available_hours
FROM restaurant_listings r,
(VALUES
  ('Pan Dulce Box (12pc)', 'Assorted fresh-baked pan dulce', 8.99, 8.99, 'bakery', ARRAY['vegetarian']::TEXT[], ARRAY['mon','tue','wed','thu','fri','sat','sun']::TEXT[], '06:00-18:00'),
  ('Tres Leches Cake (whole)', 'Classic three-milk cake', 6.99, 6.99, 'bakery', ARRAY['vegetarian']::TEXT[], ARRAY['mon','tue','wed','thu','fri','sat','sun']::TEXT[], '06:00-18:00'),
  ('Pastry Box (6pc)', 'Chef''s selection of pastries', 4.99, 4.99, 'bakery', ARRAY['vegetarian']::TEXT[], ARRAY['mon','tue','wed','thu','fri','sat','sun']::TEXT[], '06:00-18:00'),
  ('Conchas (3pc)', 'Fresh conchas — vanilla, chocolate, strawberry', 2.99, 2.99, 'bakery', ARRAY['vegetarian']::TEXT[], ARRAY['mon','tue','wed','thu','fri','sat','sun']::TEXT[], '06:00-18:00')
) AS v(name, description, price_retail, price_lb, category, dietary, available_days, available_hours)
WHERE r.name = 'Lupita''s Bakery';
