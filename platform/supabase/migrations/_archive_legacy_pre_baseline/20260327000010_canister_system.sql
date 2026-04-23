-- K139: Canister System Configurator (Innovation #2022)
-- Modular injection molding configuration + product catalog

-- Saved configurations
CREATE TABLE IF NOT EXISTS canister_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  canister_size TEXT NOT NULL CHECK (canister_size IN ('S','M','L','XL')),
  stack_count INTEGER NOT NULL DEFAULT 1 CHECK (stack_count BETWEEN 1 AND 6),
  pressure_method TEXT NOT NULL CHECK (pressure_method IN ('gravity','screw_press')),
  weight_kg NUMERIC,
  handle_length_inches NUMERIC DEFAULT 8,
  hand_force_lbs NUMERIC DEFAULT 30,
  materials_compatible JSONB DEFAULT '[]'::jsonb,
  estimated_pressure_psi NUMERIC DEFAULT 0,
  total_cost_estimate NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE canister_configurations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own canister configs"
  ON canister_configurations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Product catalog for the canister system
CREATE TABLE IF NOT EXISTS canister_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_type TEXT NOT NULL CHECK (product_type IN (
    'gravity_kit','thermoplastic_kit','combined_kit',
    'canister_pair','screw_press','heated_barrel',
    'sleeve','base','cap','sprue_plug','mold_library'
  )),
  size TEXT NOT NULL CHECK (size IN ('S','M','L','XL','universal')),
  name TEXT NOT NULL,
  description TEXT,
  price_credits NUMERIC,
  price_usd NUMERIC NOT NULL,
  bom_cost NUMERIC NOT NULL,
  in_stock BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE canister_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read canister products"
  ON canister_products FOR SELECT
  USING (true);
CREATE POLICY "Admins manage canister products"
  ON canister_products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Seed products (Cost + 20% pricing)
INSERT INTO canister_products (product_type, size, name, description, price_credits, price_usd, bom_cost, in_stock) VALUES
  ('gravity_kit', 'M', 'Gravity Starter Kit (M/L)', 'Resin, wax, slip, silicone — M and L sleeves + canisters', NULL, 249, 168, false),
  ('thermoplastic_kit', 'S', 'Thermoplastic Kit (S + Screw Press)', 'PE, PP, ABS — S sleeve + screw press + heated barrel', NULL, 329, 224, false),
  ('combined_kit', 'universal', 'Complete System', 'Both gravity and thermoplastic capabilities', NULL, 499, 340, false),
  ('canister_pair', 'S', 'Custom A/B Canister Pair (S)', '3D printed SLA, max 25cm³ cavity', NULL, 29, 18, false),
  ('canister_pair', 'M', 'Custom A/B Canister Pair (M)', '3D printed SLA, max 100cm³ cavity', NULL, 39, 24, false),
  ('canister_pair', 'L', 'Custom A/B Canister Pair (L)', '3D printed SLA, max 400cm³ cavity', NULL, 59, 38, false),
  ('canister_pair', 'XL', 'Custom A/B Canister Pair (XL)', '3D printed SLA, max 1200cm³ cavity', NULL, 79, 52, false),
  ('screw_press', 'S', 'Screw Press (8" handle)', '1/2" ACME thread, 327:1 effective MA, up to 5,207 PSI', NULL, 99, 60, false),
  ('heated_barrel', 'S', 'Heated Barrel Module', 'PID controller + heating band + thermocouple, 180–260°C', NULL, 129, 80, false),
  ('sleeve', 'S', 'Extra Sleeve (S)', 'For stacking or parallel runs', NULL, 19, 12, false),
  ('sleeve', 'M', 'Extra Sleeve (M)', 'For stacking or parallel runs', NULL, 29, 18, false),
  ('sleeve', 'L', 'Extra Sleeve (L)', 'For stacking or parallel runs', NULL, 39, 24, false),
  ('mold_library', 'S', 'HexIsle Terrain Library (10 tiles)', '10 standard hex terrain A/B pairs', NULL, 149, 95, false);

-- Bump canonical innovation count
UPDATE platform_canonical SET value = value + 1 WHERE key = 'innovation_count';
