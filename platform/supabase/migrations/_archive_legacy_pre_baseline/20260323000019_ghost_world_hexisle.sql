-- Ghost World HexIsle Enhancements — K88
-- Adds category, max_slots, placed_by; seeds 4 starter islands; member self-place policy

-- Islands: add category + max_slots
ALTER TABLE ghost_world_islands ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'general';
ALTER TABLE ghost_world_islands ADD COLUMN IF NOT EXISTS max_slots INT NOT NULL DEFAULT 12;

-- Buildings: add placed_by + placed_at for ownership tracking
ALTER TABLE ghost_world_buildings ADD COLUMN IF NOT EXISTS placed_by UUID REFERENCES auth.users(id);
ALTER TABLE ghost_world_buildings ADD COLUMN IF NOT EXISTS placed_at TIMESTAMPTZ DEFAULT now();

-- Allow members to place their own storefront in an empty slot
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'members_place_own_building' AND tablename = 'ghost_world_buildings'
  ) THEN
    CREATE POLICY "members_place_own_building" ON ghost_world_buildings
      FOR INSERT WITH CHECK (
        auth.uid() = placed_by
        AND EXISTS (SELECT 1 FROM storefronts WHERE id = storefront_id AND user_id = auth.uid())
      );
  END IF;
END $$;

-- Seed 4 starter islands (upsert on coordinate uniqueness)
INSERT INTO ghost_world_islands (name, description, hex_q, hex_r, category, theme_color, max_slots) VALUES
  ('Founders Row', 'Where it all begins', 0, 0, 'general', '#f59e0b', 12),
  ('Maker Marina', 'Crafts, art, and handmade goods', 2, -1, 'maker', '#8b5cf6', 12),
  ('Food Court', 'Restaurants, bakeries, and meal prep', -1, 2, 'food', '#ef4444', 12),
  ('Service Harbor', 'Professional services and repairs', 1, 1, 'service', '#06b6d4', 12)
ON CONFLICT (hex_q, hex_r) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  theme_color = EXCLUDED.theme_color,
  max_slots = EXCLUDED.max_slots;
