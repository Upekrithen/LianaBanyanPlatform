-- Session 49B: Modular Manufacturing Hub — The Forge
-- "Swappable stations. Expert operators. Continuous production."

CREATE TABLE IF NOT EXISTS manufacturing_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_type text NOT NULL UNIQUE CHECK (module_type IN ('slip_casting', 'sand_casting', 'sls', 'sla', 'injection_mold', 'desktop_extrusion', 'cnc', 'laser_cutting')),
  display_name text NOT NULL,
  description text NOT NULL,
  primary_operator_user_id uuid REFERENCES auth.users(id),
  secondary_operator_user_id uuid REFERENCES auth.users(id),
  backup_operator_user_id uuid REFERENCES auth.users(id),
  capacity_per_day integer NOT NULL DEFAULT 0,
  current_queue integer NOT NULL DEFAULT 0,
  process_pioneer_user_id uuid REFERENCES auth.users(id),
  process_pioneer_name text,
  status text NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'maintenance')),
  location text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS forge_crew_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  module_id uuid NOT NULL REFERENCES manufacturing_modules(id),
  role_requested text NOT NULL CHECK (role_requested IN ('primary', 'secondary', 'backup')),
  experience_description text NOT NULL,
  equipment_owned text,
  availability text NOT NULL,
  status text NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'accepted', 'rejected', 'waitlisted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

-- RLS
ALTER TABLE manufacturing_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE forge_crew_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "all_browse_modules" ON manufacturing_modules FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_modules" ON manufacturing_modules FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "applicant_select_own" ON forge_crew_applications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "applicant_insert_own" ON forge_crew_applications FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "admin_all_applications" ON forge_crew_applications FOR ALL USING (auth.uid() IS NOT NULL);

-- Seed: 8 manufacturing modules (using gen_random_uuid instead of invalid hex UUIDs)
INSERT INTO manufacturing_modules (module_type, display_name, description, capacity_per_day, current_queue, process_pioneer_name, status, location) VALUES
  ('slip_casting', 'Slip Casting', 'Ceramic slip casting for water-safe terrain tiles and decorative pieces', 40, 12, 'CeramicMaster Kim', 'active', 'Boise, ID'),
  ('sla', 'SLA — Stereolithography', 'High-precision resin printing for Tereno Certified components', 25, 8, 'Founder', 'active', 'Boise, ID'),
  ('injection_mold', 'Injection Molding', 'Mass production plastics — requires tooling investment', 200, 0, NULL, 'inactive', NULL),
  ('desktop_extrusion', 'Desktop Extrusion (FDM)', 'Standard FDM 3D printing for prototypes and HexIsle Compatible pieces', 50, 22, NULL, 'active', 'Portland, OR'),
  ('cnc', 'CNC Machining', 'Subtractive manufacturing for high-precision metal and wood components', 15, 0, NULL, 'maintenance', 'Denver, CO'),
  ('laser_cutting', 'Laser Cutting', 'Flat stock cutting for packaging, signage, and adapter rings', 100, 5, 'LaserPro Dan', 'active', 'Boise, ID'),
  ('sand_casting', 'Sand Casting', 'Traditional sand casting for metal terrain pieces and decorative items', 10, 0, NULL, 'inactive', NULL),
  ('sls', 'SLS — Selective Laser Sintering', 'Powder-bed fusion for complex geometries without support structures', 20, 0, NULL, 'inactive', NULL)
ON CONFLICT (module_type) DO NOTHING;

-- Seed: 6 crew applications (commented out — references fake user IDs not in auth.users)
-- INSERT INTO forge_crew_applications (id, user_id, module_id, role_requested, experience_description, equipment_owned, availability, status) VALUES
--   ('i0000001-0049-0002-0001-000000000001', 'a0000001-0047-0001-0001-000000000001', 'h0000001-0049-0002-0002-000000000001', 'primary', '5 years SLA experience, own Formlabs Form 3', 'Formlabs Form 3, wash + cure station', '20 hrs/week', 'accepted'),
--   ('i0000001-0049-0002-0002-000000000001', 'a0000001-0047-0001-0002-000000000001', 'h0000001-0049-0002-0002-000000000001', 'secondary', '2 years hobbyist SLA printing', 'Elegoo Mars 3 Pro', '10 hrs/week', 'accepted'),
--   ('i0000001-0049-0002-0003-000000000001', 'a0000001-0047-0001-0003-000000000001', 'h0000001-0049-0002-0004-000000000001', 'primary', 'Full-time maker, 3 FDM printers running daily', 'Prusa MK4 x2, Bambu X1C', '40 hrs/week', 'accepted'),
--   ('i0000001-0049-0002-0004-000000000001', 'a0000001-0047-0001-0001-000000000001', 'h0000001-0049-0002-0006-000000000001', 'primary', 'Industrial laser operator, 10yr experience', 'Epilog Fusion Pro 48', '15 hrs/week', 'accepted'),
--   ('i0000001-0049-0002-0005-000000000001', 'a0000001-0047-0001-0002-000000000001', 'h0000001-0049-0002-0001-000000000001', 'backup', 'Ceramics hobbyist, learning slip casting', NULL, '5 hrs/week', 'waitlisted'),
--   ('i0000001-0049-0002-0006-000000000001', 'a0000001-0047-0001-0003-000000000001', 'h0000001-0049-0002-0005-000000000001', 'primary', 'CNC machinist, metalworking background', 'Shapeoko 4 XXL', '20 hrs/week', 'applied')
-- ON CONFLICT DO NOTHING;
