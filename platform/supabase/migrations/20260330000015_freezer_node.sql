-- K185: Freezer Node — Innovation #2105
-- Batch meal prep, storage, and distribution hub

-- ============================================================
-- 1. freezer_nodes — Operator profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS freezer_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  kitchen_type TEXT NOT NULL DEFAULT 'home'
    CHECK (kitchen_type IN ('home', 'commercial', 'church', 'community')),
  max_batch_size INTEGER NOT NULL DEFAULT 20,
  delivery_radius_km INTEGER NOT NULL DEFAULT 10,
  offers_pickup BOOLEAN NOT NULL DEFAULT true,
  offers_delivery BOOLEAN NOT NULL DEFAULT true,
  prep_days TEXT[] DEFAULT '{}',
  pickup_days TEXT[] DEFAULT '{}',
  food_handler_cert BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  pioneer_number INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_freezer_nodes_operator ON freezer_nodes(operator_id);
CREATE INDEX idx_freezer_nodes_active ON freezer_nodes(active) WHERE active = true;

ALTER TABLE freezer_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active nodes" ON freezer_nodes
  FOR SELECT USING (active = true);
CREATE POLICY "Operators manage own nodes" ON freezer_nodes
  FOR ALL USING (auth.uid() = operator_id);

-- ============================================================
-- 2. freezer_inventory — What's in the freezer
-- ============================================================
CREATE TABLE IF NOT EXISTS freezer_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID NOT NULL REFERENCES freezer_nodes(id) ON DELETE CASCADE,
  meal_name TEXT NOT NULL,
  description TEXT,
  portions_available INTEGER NOT NULL DEFAULT 0,
  portions_reserved INTEGER NOT NULL DEFAULT 0,
  price_per_portion NUMERIC(10,2) NOT NULL,
  ingredient_cost_per_portion NUMERIC(10,2),
  dietary_tags TEXT[] DEFAULT '{}',
  frozen_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '90 days'),
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'reserved', 'sold_out', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_freezer_inv_node ON freezer_inventory(node_id);
CREATE INDEX idx_freezer_inv_status ON freezer_inventory(status) WHERE status = 'available';
CREATE INDEX idx_freezer_inv_expiry ON freezer_inventory(expiry_date);

ALTER TABLE freezer_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view available inventory" ON freezer_inventory
  FOR SELECT USING (status = 'available');
CREATE POLICY "Node operators manage inventory" ON freezer_inventory
  FOR ALL USING (
    node_id IN (SELECT id FROM freezer_nodes WHERE operator_id = auth.uid())
  );

-- ============================================================
-- 3. freezer_orders — Customer orders
-- ============================================================
CREATE TABLE IF NOT EXISTS freezer_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id),
  node_id UUID NOT NULL REFERENCES freezer_nodes(id),
  items JSONB NOT NULL DEFAULT '[]',
  total_amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'credits'
    CHECK (currency IN ('credits', 'marks', 'joules', 'dollars')),
  fulfillment_type TEXT NOT NULL DEFAULT 'pickup'
    CHECK (fulfillment_type IN ('pickup', 'delivery')),
  delivery_address TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'ready', 'delivered', 'completed', 'cancelled')),
  pickup_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_freezer_orders_customer ON freezer_orders(customer_id);
CREATE INDEX idx_freezer_orders_node ON freezer_orders(node_id);
CREATE INDEX idx_freezer_orders_status ON freezer_orders(status);

ALTER TABLE freezer_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers see own orders" ON freezer_orders
  FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers create orders" ON freezer_orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Node operators see their orders" ON freezer_orders
  FOR SELECT USING (
    node_id IN (SELECT id FROM freezer_nodes WHERE operator_id = auth.uid())
  );
CREATE POLICY "Node operators update order status" ON freezer_orders
  FOR UPDATE USING (
    node_id IN (SELECT id FROM freezer_nodes WHERE operator_id = auth.uid())
  );

-- ============================================================
-- 4. Cue Card Template: Freezer Node
-- ============================================================
INSERT INTO cue_card_templates (
  initiative_slug, template_type, title, subtitle, body_text, hashtags,
  background_type, background_value, accent_color, card_style
) VALUES (
  'freezer-node', 'initiative',
  'Freezer Node',
  'Cook once, feed the neighborhood. Keep 83.3%.',
  E'What you do: Batch-cook meals, freeze in portions, distribute through the cooperative.\nWhat you may earn: $800-2,000/month (depending on batch size and frequency).\nWhat you need: A kitchen, a freezer, a $5/year membership, basic food handler knowledge.\nMonthly example: 2 batches/week × 16 portions × $8/portion = $1,024/month (before platform share).\nPioneer bonus: First 10 get 50 Marks/month for 12 months.',
  ARRAY['#FreezerNode', '#LianaBanyan', '#CoopFood', '#BatchCook', '#KeepEightyThree'],
  'gradient', 'from-cyan-500/20 to-blue-500/20', 'cyan', 'bold'
);

-- ============================================================
-- 5. Auto-assign pioneer numbers to first 10 freezer node operators
-- ============================================================
CREATE OR REPLACE FUNCTION assign_freezer_node_pioneer()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(pioneer_number), 0) + 1 INTO next_num
  FROM freezer_nodes WHERE pioneer_number IS NOT NULL;
  IF next_num <= 10 THEN
    NEW.pioneer_number := next_num;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_freezer_node_pioneer
  BEFORE INSERT ON freezer_nodes
  FOR EACH ROW
  WHEN (NEW.pioneer_number IS NULL)
  EXECUTE FUNCTION assign_freezer_node_pioneer();

-- ============================================================
-- 6. Canonical stats bump
-- ============================================================
UPDATE platform_canonical SET value = 2109 WHERE key = 'innovation_count';
UPDATE platform_canonical SET value = 185 WHERE key = 'knight_sessions';
