-- Founding Runs — Cooperative production campaigns
-- ================================================
-- Supports the HexIsle Founding Run and future product campaigns.

-- Campaign metadata
CREATE TABLE IF NOT EXISTS founding_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  target_amount numeric(10,2) NOT NULL DEFAULT 0,
  current_amount numeric(10,2) NOT NULL DEFAULT 0,
  backer_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'funding' CHECK (status IN ('funding', 'production', 'shipping', 'complete', 'cancelled')),
  estimated_delivery_range text,
  cost_breakdown_materials numeric(5,2) DEFAULT 45,
  cost_breakdown_production numeric(5,2) DEFAULT 20,
  cost_breakdown_shipping numeric(5,2) DEFAULT 15,
  cost_breakdown_platform numeric(5,2) DEFAULT 20,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Items available in a campaign
CREATE TABLE IF NOT EXISTS founding_run_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES founding_runs(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  image_url text,
  unit_cost numeric(10,2) NOT NULL,
  cost_materials numeric(10,2),
  cost_production numeric(10,2),
  cost_shipping numeric(10,2),
  cost_platform numeric(10,2),
  available_quantity integer,
  created_at timestamptz DEFAULT now()
);

-- Individual pledges
CREATE TABLE IF NOT EXISTS founding_run_pledges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES founding_runs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  items jsonb NOT NULL DEFAULT '[]',
  total_amount numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pledged' CHECK (status IN ('pledged', 'paid', 'shipped', 'delivered', 'refunded')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Build Journal entries
CREATE TABLE IF NOT EXISTS founding_run_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES founding_runs(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Grocery distribution nodes
CREATE TABLE IF NOT EXISTS grocery_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  vehicle_type text NOT NULL,
  vehicle_description text,
  has_refrigeration boolean DEFAULT false,
  storage_address text,
  storage_city text,
  storage_state text,
  storage_zip text,
  delivery_radius_miles integer DEFAULT 10,
  delivery_zips text,
  weekly_delivery_runs integer DEFAULT 2,
  orders_per_run integer DEFAULT 20,
  available_days text[] DEFAULT '{}',
  operator_name text NOT NULL,
  operator_phone text,
  operator_email text NOT NULL,
  has_driving_record boolean DEFAULT true,
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'paused', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS policies
ALTER TABLE founding_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE founding_run_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE founding_run_pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE founding_run_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "founding_runs_public_read" ON founding_runs FOR SELECT USING (true);
CREATE POLICY "founding_run_items_public_read" ON founding_run_items FOR SELECT USING (true);
CREATE POLICY "founding_run_updates_public_read" ON founding_run_updates FOR SELECT USING (true);
CREATE POLICY "founding_run_pledges_own" ON founding_run_pledges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "founding_run_pledges_insert" ON founding_run_pledges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "grocery_nodes_own" ON grocery_nodes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "grocery_nodes_insert" ON grocery_nodes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_founding_run_items_run ON founding_run_items(run_id);
CREATE INDEX IF NOT EXISTS idx_founding_run_pledges_run ON founding_run_pledges(run_id);
CREATE INDEX IF NOT EXISTS idx_founding_run_pledges_user ON founding_run_pledges(user_id);
CREATE INDEX IF NOT EXISTS idx_founding_run_updates_run ON founding_run_updates(run_id);
CREATE INDEX IF NOT EXISTS idx_grocery_nodes_user ON grocery_nodes(user_id);
CREATE INDEX IF NOT EXISTS idx_grocery_nodes_zip ON grocery_nodes(storage_zip);
