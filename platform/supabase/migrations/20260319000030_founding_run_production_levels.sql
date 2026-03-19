-- Founding Run: production level tracking + HexIsle seed data
-- =============================================================

-- Add production level tracking to founding_runs
ALTER TABLE founding_runs ADD COLUMN IF NOT EXISTS current_production_level integer DEFAULT 1;
ALTER TABLE founding_runs ADD COLUMN IF NOT EXISTS slug text;

-- Add item_key for frontend matching + production level price tiers
ALTER TABLE founding_run_items ADD COLUMN IF NOT EXISTS item_key text;
ALTER TABLE founding_run_items ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- Production level price tiers per item
CREATE TABLE IF NOT EXISTS founding_run_item_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES founding_run_items(id) ON DELETE CASCADE,
  production_level integer NOT NULL CHECK (production_level BETWEEN 1 AND 6),
  unit_cost numeric(10,2) NOT NULL,
  cost_materials numeric(10,2),
  cost_production numeric(10,2),
  cost_shipping numeric(10,2),
  cost_platform numeric(10,2),
  UNIQUE(item_id, production_level)
);

ALTER TABLE founding_run_item_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "item_tiers_public_read" ON founding_run_item_tiers FOR SELECT USING (true);

-- Seed HexIsle Founding Run #1
INSERT INTO founding_runs (
  id, title, description, slug, target_amount, current_amount, backer_count,
  status, estimated_delivery_range, current_production_level,
  cost_breakdown_materials, cost_breakdown_production, cost_breakdown_shipping, cost_breakdown_platform
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'HexIsle Founding Run #1',
  'The first cooperative production run for HexIsle — Tereno Water Table. No batteries. No arguments. Just physics.',
  'hexisle-founding-run-1',
  5000.00, 0.00, 0,
  'funding', '8-12 weeks from funding',
  1,
  45, 20, 15, 20
) ON CONFLICT (id) DO UPDATE SET
  current_production_level = EXCLUDED.current_production_level,
  slug = EXCLUDED.slug;

-- Seed items at Level 1 prices (SLA Prototyping tier)
INSERT INTO founding_run_items (id, run_id, item_key, name, description, unit_cost, cost_materials, cost_production, cost_shipping, cost_platform, sort_order)
VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
   'starter-set', 'Starter Set — 6 Miniatures',
   'Kai, Mira, Zephyr, Flint, Coral, Sage. Unpainted resin.',
   35.00, 15.75, 7.00, 5.25, 7.00, 1),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
   'island-tiles', 'Island Hex Tiles (Set of 12)',
   'Modular terrain tiles. Interlocking PLA+.',
   25.00, 11.25, 5.00, 3.75, 5.00, 2),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
   'slotted-top', 'Slotted Top — Signature Piece',
   'Hex-slot spinning top with brass insert.',
   15.00, 6.75, 3.00, 2.25, 3.00, 3),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
   'full-collection', 'Full Founding Collection',
   'Everything + Pioneer paint guide, stand, Founder''s Wall.',
   85.00, 38.25, 17.00, 12.75, 17.00, 4)
ON CONFLICT (id) DO UPDATE SET
  unit_cost = EXCLUDED.unit_cost,
  cost_materials = EXCLUDED.cost_materials,
  cost_production = EXCLUDED.cost_production,
  cost_shipping = EXCLUDED.cost_shipping,
  cost_platform = EXCLUDED.cost_platform;

-- Seed price tiers for each item across all 6 production levels
-- Price scaling: L1=100%, L2=85%, L3=70%, L4=60%, L5=50%, L6=40%
-- (Matches hexisleProjectSpec.ts production level pricing)
DO $$
DECLARE
  item RECORD;
  lvl integer;
  scales numeric[] := ARRAY[1.00, 0.85, 0.70, 0.60, 0.50, 0.40];
  base_cost numeric;
  scaled_cost numeric;
  mat_ratio numeric;
  prod_ratio numeric;
  ship_ratio numeric;
  plat_ratio numeric;
BEGIN
  FOR item IN SELECT * FROM founding_run_items WHERE run_id = '00000000-0000-0000-0000-000000000001' LOOP
    base_cost := item.unit_cost;
    mat_ratio := COALESCE(item.cost_materials / NULLIF(base_cost, 0), 0.45);
    prod_ratio := COALESCE(item.cost_production / NULLIF(base_cost, 0), 0.20);
    ship_ratio := COALESCE(item.cost_shipping / NULLIF(base_cost, 0), 0.15);
    plat_ratio := COALESCE(item.cost_platform / NULLIF(base_cost, 0), 0.20);

    FOR lvl IN 1..6 LOOP
      scaled_cost := ROUND(base_cost * scales[lvl], 2);
      INSERT INTO founding_run_item_tiers (item_id, production_level, unit_cost, cost_materials, cost_production, cost_shipping, cost_platform)
      VALUES (
        item.id, lvl, scaled_cost,
        ROUND(scaled_cost * mat_ratio, 2),
        ROUND(scaled_cost * prod_ratio, 2),
        ROUND(scaled_cost * ship_ratio, 2),
        ROUND(scaled_cost * plat_ratio, 2)
      )
      ON CONFLICT (item_id, production_level) DO UPDATE SET
        unit_cost = EXCLUDED.unit_cost,
        cost_materials = EXCLUDED.cost_materials,
        cost_production = EXCLUDED.cost_production,
        cost_shipping = EXCLUDED.cost_shipping,
        cost_platform = EXCLUDED.cost_platform;
    END LOOP;
  END LOOP;
END $$;
