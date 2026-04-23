-- ============================================================================
-- PIONEER NODES TABLE
-- ============================================================================
-- Innovation #1493: Pioneer Nodes table for distributed manufacturing network
--
-- DIAGNOSTIC CONFIRMED:
--   - pioneer_nodes: DOES NOT EXIST → creating it
--   - manufacturing_products: ALREADY EXISTS → skipping
--   - manufacturing_orders: ALREADY EXISTS → skipping
--
-- Created: 2026-03-07 (Session 6i, corrected after diagnostic)
-- ============================================================================

CREATE TABLE public.pioneer_nodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  node_number SERIAL,
  display_name TEXT NOT NULL,
  location_city TEXT NOT NULL,
  location_state TEXT NOT NULL,
  equipment_type TEXT NOT NULL CHECK (equipment_type IN (
    'sla_printer', 'fdm_printer', 'resin_printer',
    'cnc_router', 'laser_cutter', 'injection_molder', 'desktop_extruder'
  )),
  capabilities TEXT[] DEFAULT '{}',
  verified BOOLEAN DEFAULT false,
  subsidy_claimed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT pioneer_nodes_user_unique UNIQUE (user_id),
  CONSTRAINT pioneer_nodes_max_100 CHECK (node_number <= 100)
);

CREATE INDEX idx_pioneer_nodes_user ON public.pioneer_nodes(user_id);
CREATE INDEX idx_pioneer_nodes_number ON public.pioneer_nodes(node_number);

ALTER TABLE public.pioneer_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
  ON public.pioneer_nodes FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON public.pioneer_nodes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for authenticated users"
  ON public.pioneer_nodes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for authenticated users"
  ON public.pioneer_nodes FOR DELETE
  USING (auth.uid() = user_id);
