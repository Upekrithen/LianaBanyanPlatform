-- Session 47B: Node Captain Production System
-- "Pick Up The Tab" — Fund production, manage campaigns, build local economy

CREATE TABLE IF NOT EXISTS node_captain_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id),
  node_name text NOT NULL,
  node_location text NOT NULL,
  bio text,
  campaigns_completed integer NOT NULL DEFAULT 0,
  campaigns_active integer NOT NULL DEFAULT 0,
  total_backed_marks_used numeric NOT NULL DEFAULT 0,
  joules_collateralizing numeric NOT NULL DEFAULT 0,
  total_units_produced integer NOT NULL DEFAULT 0,
  average_quality_score numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'probation')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS production_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  captain_user_id uuid NOT NULL REFERENCES auth.users(id),
  product_name text NOT NULL,
  product_description text NOT NULL,
  units_target integer NOT NULL,
  units_completed integer NOT NULL DEFAULT 0,
  cost_per_unit numeric NOT NULL,
  price_per_unit numeric NOT NULL,
  backed_marks_allocated numeric NOT NULL DEFAULT 0,
  joules_backing numeric NOT NULL DEFAULT 0,
  quality_checkpoints jsonb NOT NULL DEFAULT '[]',
  status text NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'funded', 'in_production', 'quality_check', 'completed', 'cancelled')),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS production_stamps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES production_campaigns(id),
  stamper_user_id uuid NOT NULL REFERENCES auth.users(id),
  units_verified integer NOT NULL,
  quality_score numeric NOT NULL CHECK (quality_score >= 1 AND quality_score <= 5),
  notes text,
  xp_awarded numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE node_captain_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_stamps ENABLE ROW LEVEL SECURITY;

-- node_captain_profiles
CREATE POLICY "owner_select_node_captain" ON node_captain_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "owner_update_node_captain" ON node_captain_profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "all_browse_node_captains" ON node_captain_profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_node_captains" ON node_captain_profiles FOR ALL USING (auth.uid() IS NOT NULL);

-- production_campaigns
CREATE POLICY "captain_crud_own_campaigns" ON production_campaigns FOR ALL USING (captain_user_id = auth.uid());
CREATE POLICY "all_browse_campaigns" ON production_campaigns FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_campaigns" ON production_campaigns FOR ALL USING (auth.uid() IS NOT NULL);

-- production_stamps (immutable)
CREATE POLICY "stamper_insert_stamp" ON production_stamps FOR INSERT WITH CHECK (stamper_user_id = auth.uid());
CREATE POLICY "all_select_stamps" ON production_stamps FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_stamps" ON production_stamps FOR ALL USING (auth.uid() IS NOT NULL);

-- Seed: 3 node captains (commented out — references fake user IDs not in auth.users)
-- INSERT INTO node_captain_profiles (id, user_id, node_name, node_location, bio, campaigns_completed, campaigns_active, total_backed_marks_used, total_units_produced, average_quality_score, status) VALUES
--   ('c0000001-0047-0002-0001-000000000001', 'a0000001-0047-0001-0001-000000000001', 'Boise Maker Hub', 'Boise, ID', 'Veteran maker with 5 completed campaigns', 5, 1, 2500, 450, 4.6, 'active'),
--   ('c0000001-0047-0002-0002-000000000001', 'a0000001-0047-0001-0002-000000000001', 'Portland Print Lab', 'Portland, OR', 'New node captain, excited to start', 0, 0, 0, 0, 0, 'active'),
--   ('c0000001-0047-0002-0003-000000000001', 'a0000001-0047-0001-0003-000000000001', 'Denver Craft Works', 'Denver, CO', 'On probation after quality issue', 2, 0, 800, 120, 3.2, 'probation')
-- ON CONFLICT DO NOTHING;

-- Seed: 4 production campaigns (commented out — references fake user IDs not in auth.users)
-- INSERT INTO production_campaigns (id, captain_user_id, product_name, product_description, units_target, units_completed, cost_per_unit, price_per_unit, backed_marks_allocated, status) VALUES
--   ('d0000001-0047-0002-0001-000000000001', 'a0000001-0047-0001-0001-000000000001', 'HexIsle River Tile Set', 'Standard 6-pack river channel tiles', 200, 0, 3.00, 3.60, 720, 'planning'),
--   ('d0000001-0047-0002-0002-000000000001', 'a0000001-0047-0001-0001-000000000001', 'Sourdough Starter Kits', 'Organic sourdough starter with instructions', 100, 45, 8.00, 9.60, 960, 'in_production'),
--   ('d0000001-0047-0002-0003-000000000001', 'a0000001-0047-0001-0001-000000000001', 'Leather Bookmark Batch', 'Hand-cut leather bookmarks', 50, 50, 5.00, 6.00, 300, 'quality_check'),
--   ('d0000001-0047-0002-0004-000000000001', 'a0000001-0047-0001-0001-000000000001', 'Wooden Spoon Collection', 'Hand-carved wooden kitchen spoons', 75, 75, 12.00, 14.40, 1080, 'completed')
-- ON CONFLICT DO NOTHING;

-- Seed: 3 stamps for completed campaign (commented out — references fake user IDs not in auth.users)
-- INSERT INTO production_stamps (id, campaign_id, stamper_user_id, units_verified, quality_score, notes, xp_awarded) VALUES
--   ('e0000001-0047-0002-0001-000000000001', 'd0000001-0047-0002-0004-000000000001', 'a0000001-0047-0001-0002-000000000001', 25, 4.5, 'Excellent craftsmanship', 112.5),
--   ('e0000001-0047-0002-0002-000000000001', 'd0000001-0047-0002-0004-000000000001', 'a0000001-0047-0001-0003-000000000001', 25, 4.2, 'Good quality, minor variations', 105),
--   ('e0000001-0047-0002-0003-000000000001', 'd0000001-0047-0002-0004-000000000001', 'a0000001-0047-0001-0002-000000000001', 25, 4.8, 'Outstanding finish', 120)
-- ON CONFLICT DO NOTHING;
