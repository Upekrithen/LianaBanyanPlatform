-- Session 48B: C+20 Reciprocity Dashboard
-- "Every product at Cost Plus 20%. Every penny accounted for."

CREATE TABLE IF NOT EXISTS c20_pricing_examples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text NOT NULL,
  category text NOT NULL,
  base_cost numeric NOT NULL,
  final_price numeric NOT NULL,
  margin_amount numeric NOT NULL,
  creator_share numeric NOT NULL,
  platform_share numeric NOT NULL,
  gleaners_share numeric NOT NULL,
  steward_share numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE c20_pricing_examples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "all_select_c20" ON c20_pricing_examples FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_c20" ON c20_pricing_examples FOR ALL USING (auth.uid() IS NOT NULL);

-- Seed: 10 pricing examples with accurate 83.3/13.3/3.3 split on margin
INSERT INTO c20_pricing_examples (product_name, category, base_cost, final_price, margin_amount, creator_share, platform_share, gleaners_share) VALUES
  ('Sarah''s Sourdough Starter Kit', 'food', 10.00, 12.00, 2.00, 1.67, 0.27, 0.07),
  ('3D-Printed Phone Stand', 'maker', 4.00, 4.80, 0.80, 0.67, 0.11, 0.03),
  ('Hand-Carved Wooden Spoon', 'craft', 15.00, 18.00, 3.00, 2.50, 0.40, 0.10),
  ('Guitar Lesson (1hr)', 'service', 40.00, 48.00, 8.00, 6.66, 1.06, 0.26),
  ('Organic Honey Jar (16oz)', 'food', 8.00, 9.60, 1.60, 1.33, 0.21, 0.05),
  ('Custom Pet Portrait', 'art', 25.00, 30.00, 5.00, 4.17, 0.67, 0.17),
  ('Resume Review Service', 'service', 20.00, 24.00, 4.00, 3.33, 0.53, 0.13),
  ('Handmade Leather Wallet', 'craft', 35.00, 42.00, 7.00, 5.83, 0.93, 0.23),
  ('Kids Coding Workshop (2hr)', 'education', 30.00, 36.00, 6.00, 5.00, 0.80, 0.20),
  ('HexIsle Terrain Set (6-pack)', 'game', 18.00, 21.60, 3.60, 3.00, 0.48, 0.12);
