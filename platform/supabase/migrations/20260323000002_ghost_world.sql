-- Ghost World storefront map — hex islands with buildings
-- Innovation references: #1857-#1858, #1869-#1875

CREATE TABLE IF NOT EXISTS ghost_world_islands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  hex_q INT NOT NULL,
  hex_r INT NOT NULL,
  node_captain_id UUID REFERENCES auth.users(id),
  member_count INT DEFAULT 0,
  theme_color TEXT DEFAULT '#D4A843',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(hex_q, hex_r)
);

CREATE TABLE IF NOT EXISTS ghost_world_buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  island_id UUID NOT NULL REFERENCES ghost_world_islands(id),
  storefront_id UUID NOT NULL,
  building_slot INT NOT NULL,
  building_size TEXT DEFAULT 'small' CHECK (building_size IN ('small', 'medium', 'large')),
  is_popup BOOLEAN DEFAULT false,
  popup_expires_at TIMESTAMPTZ,
  popup_source_island_id UUID REFERENCES ghost_world_islands(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(island_id, building_slot)
);

CREATE TABLE IF NOT EXISTS ghost_world_popups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storefront_id UUID NOT NULL,
  home_island_id UUID NOT NULL REFERENCES ghost_world_islands(id),
  target_island_id UUID NOT NULL REFERENCES ghost_world_islands(id),
  deck_card_id UUID,
  duration_days INT DEFAULT 14,
  starts_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ghost_world_islands ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghost_world_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghost_world_popups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_islands" ON ghost_world_islands FOR SELECT USING (true);
CREATE POLICY "admin_manage_islands" ON ghost_world_islands FOR ALL USING (public.is_admin());

CREATE POLICY "public_read_buildings" ON ghost_world_buildings FOR SELECT USING (true);
CREATE POLICY "admin_manage_buildings" ON ghost_world_buildings FOR ALL USING (public.is_admin());

CREATE POLICY "public_read_popups" ON ghost_world_popups FOR SELECT USING (true);
CREATE POLICY "admin_manage_popups" ON ghost_world_popups FOR ALL USING (public.is_admin());

CREATE INDEX idx_gw_buildings_island ON ghost_world_buildings(island_id);
CREATE INDEX idx_gw_popups_target ON ghost_world_popups(target_island_id);

-- Seed: first demo island
INSERT INTO ghost_world_islands (name, description, hex_q, hex_r, theme_color)
VALUES ('Downtown', 'The first LB node — downtown food district', 0, 0, '#D4A843')
ON CONFLICT (hex_q, hex_r) DO NOTHING;
