-- ============================================================================
-- Migration: 20260319000011_ghost_world.sql
-- Session 41 Task A: Ghost World Mall (locations + transactions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ghost_world_locations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storefront_id uuid NOT NULL UNIQUE REFERENCES storefronts(id) ON DELETE CASCADE,
  zone          text NOT NULL CHECK (zone IN ('market_row','artisan_alley','tech_quarter','food_court','garden_path','health_hub','academy_lane')),
  position_x    integer,
  position_y    integer,
  claimed_at    timestamptz DEFAULT now()
);

ALTER TABLE ghost_world_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ghost_locations_select_auth" ON ghost_world_locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "ghost_locations_insert_owner" ON ghost_world_locations FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM storefronts WHERE storefronts.id = ghost_world_locations.storefront_id AND storefronts.user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS ghost_transactions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storefront_id       uuid REFERENCES storefronts(id),
  product_id          uuid,
  ghost_credits_spent numeric NOT NULL,
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE ghost_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ghost_tx_select_own" ON ghost_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "ghost_tx_insert_own" ON ghost_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Seed ghost locations for the 8 sample storefronts
DO $$
DECLARE s RECORD;
  zone_arr text[] := ARRAY['market_row','market_row','artisan_alley','artisan_alley','tech_quarter','food_court','garden_path','health_hub'];
  i int := 0;
BEGIN
  FOR s IN SELECT id FROM storefronts ORDER BY created_at ASC LIMIT 8 LOOP
    i := i + 1;
    INSERT INTO ghost_world_locations (storefront_id, zone, position_x, position_y)
    VALUES (s.id, zone_arr[i], i * 10, i * 10)
    ON CONFLICT (storefront_id) DO NOTHING;
  END LOOP;
END $$;
