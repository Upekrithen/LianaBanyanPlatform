-- Session 49A: Tereno Certification System
-- "The Gold Standard — Six tiers of compatibility. One ecosystem."

CREATE TABLE IF NOT EXISTS tereno_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text NOT NULL,
  product_description text NOT NULL,
  designer_user_id uuid REFERENCES auth.users(id),
  designer_name text NOT NULL,
  tier integer NOT NULL CHECK (tier >= 1 AND tier <= 6),
  tier_name text NOT NULL CHECK (tier_name IN ('Tereno Certified', 'Tereno Approved', 'HexIsle Official', 'HexIsle Compatible', 'HexIsle Adaptable', 'HexIsle Inspired')),
  manufacturing_process text NOT NULL,
  dimensions_compliant boolean NOT NULL DEFAULT false,
  water_safe boolean NOT NULL DEFAULT false,
  stack_compatible boolean NOT NULL DEFAULT false,
  compliant_mechanisms boolean NOT NULL DEFAULT false,
  cost_under_ceiling boolean NOT NULL DEFAULT false,
  lithographic_manufacturing boolean NOT NULL DEFAULT false,
  deviation_notes text,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'certified', 'rejected')),
  rejection_reason text,
  ip_ledger_entry text,
  deferred_payment numeric NOT NULL DEFAULT 0,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  certified_at timestamptz
);

CREATE TABLE IF NOT EXISTS tereno_exclusions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text NOT NULL,
  designer_name text NOT NULL,
  exclusion_reason text NOT NULL CHECK (exclusion_reason IN ('electronics_near_water', 'water_soluble', 'damages_other_pieces', 'hydraulic_obstruction', 'other')),
  details text NOT NULL,
  reviewed_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE tereno_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tereno_exclusions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "all_browse_certifications" ON tereno_certifications FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "designer_insert_own" ON tereno_certifications FOR INSERT WITH CHECK (designer_user_id = auth.uid());
CREATE POLICY "designer_update_own" ON tereno_certifications FOR UPDATE USING (designer_user_id = auth.uid());
CREATE POLICY "admin_all_certifications" ON tereno_certifications FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "all_browse_exclusions" ON tereno_exclusions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "admin_crud_exclusions" ON tereno_exclusions FOR ALL USING (auth.uid() IS NOT NULL);

-- Seed: 8 certifications across all 6 tiers (using gen_random_uuid instead of invalid hex UUIDs)
INSERT INTO tereno_certifications (product_name, product_description, designer_name, tier, tier_name, manufacturing_process, dimensions_compliant, water_safe, stack_compatible, compliant_mechanisms, cost_under_ceiling, lithographic_manufacturing, status, certified_at) VALUES
  ('Founder''s Compliant Mechanism Flip-Top', 'Original flip-top terrain tile with compliant mechanism lid', 'Founder', 1, 'Tereno Certified', 'SLA', true, true, true, true, true, true, 'certified', now()),
  ('Standard River Channel Tile', 'Basic hexagonal river channel with water flow integration', 'LB Cooperative', 2, 'Tereno Approved', 'Injection Mold', true, true, true, true, true, true, 'certified', now()),
  ('Near-Spec Mountain Tile', 'Mountain terrain hex — slightly over cost ceiling', 'LB Cooperative', 2, 'Tereno Approved', 'SLA', true, true, true, true, false, true, 'certified', now()),
  ('Cooperative Forest Hex', 'Dense forest canopy tile made in-house', 'LB Makers Guild', 3, 'HexIsle Official', 'FDM', true, true, true, true, true, false, 'certified', now()),
  ('@fusefoxdesign Magnetic Terrain', 'Third-party terrain with magnetic snap instead of compliant mechanisms', '@fusefoxdesign', 4, 'HexIsle Compatible', 'FDM', true, true, true, false, true, false, 'certified', now()),
  ('Oversized Display Hex (80mm)', 'Large display piece requiring adapter ring for 60mm stack', 'DisplayCraft', 5, 'HexIsle Adaptable', 'CNC', false, true, false, true, true, false, 'certified', now()),
  ('Decorative Crystal Hex', 'Resin art piece — aesthetic compatibility only', 'CrystalArtisan', 6, 'HexIsle Inspired', 'Resin Casting', false, false, false, false, true, false, 'certified', now()),
  ('Volcanic Vent Tile', 'Geothermal terrain piece with steam channel', 'IndieHexMaker', 1, 'Tereno Certified', 'SLA', true, true, true, true, true, true, 'submitted', NULL);

-- Deviation notes
UPDATE tereno_certifications SET deviation_notes = 'Slightly over cost ceiling ($3.80 vs $3.50 max)' WHERE product_name = 'Near-Spec Mountain Tile';
UPDATE tereno_certifications SET deviation_notes = 'Uses magnets instead of compliant mechanisms — adds cost but provides stronger hold' WHERE product_name = '@fusefoxdesign Magnetic Terrain';
UPDATE tereno_certifications SET deviation_notes = '80mm flat-to-flat requires adapter ring for standard 60mm stack compatibility' WHERE product_name = 'Oversized Display Hex (80mm)';

-- Seed: 2 exclusions
INSERT INTO tereno_exclusions (product_name, designer_name, exclusion_reason, details) VALUES
  ('LED Water Hex', 'TechHex Co', 'electronics_near_water', 'Embedded LED circuitry in water channel path — electrical hazard near water table'),
  ('Sugar Crystal Terrain', 'CandyCraft', 'water_soluble', 'Sugar-based resin dissolves when exposed to water table — incompatible with core HexIsle water mechanics');
