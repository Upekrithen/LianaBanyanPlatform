-- ============================================
-- MIGRATION: 20260323000025_red_carpet_slingshot.sql
-- Knight Session 93: Personal Red Carpet + Cue Card Slingshot
-- 5 tables: invitations, invitation_beacon_stops, slingshot_slots, slingshot_history, role_initiative_map
-- ============================================

-- =====================
-- INVITATIONS: Context-encoded invitation links
-- =====================
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES auth.users(id),
  invite_code TEXT UNIQUE NOT NULL,
  suggested_role TEXT,
  initiative_connection TEXT,
  personal_message TEXT,
  inviter_node TEXT,
  inviter_business_id UUID,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
  invitee_id UUID REFERENCES auth.users(id),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inviters manage own invitations"
  ON invitations FOR ALL
  USING (auth.uid() = inviter_id);

CREATE POLICY "Anyone can read active invitations by code"
  ON invitations FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admin manages all invitations"
  ON invitations FOR ALL
  USING (public.is_admin());

CREATE UNIQUE INDEX idx_invitations_code ON invitations(invite_code);
CREATE INDEX idx_invitations_inviter ON invitations(inviter_id);
CREATE INDEX idx_invitations_status ON invitations(status, expires_at);

-- =====================
-- INVITATION BEACON STOPS: Which beacon stops are prioritized for this invitation
-- =====================
CREATE TABLE IF NOT EXISTS invitation_beacon_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  beacon_key TEXT NOT NULL,
  priority_order INT NOT NULL,
  is_required BOOLEAN DEFAULT true
);

ALTER TABLE invitation_beacon_stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read beacon stops"
  ON invitation_beacon_stops FOR SELECT
  USING (true);

CREATE POLICY "Admin manages beacon stops"
  ON invitation_beacon_stops FOR ALL
  USING (public.is_admin());

CREATE INDEX idx_beacon_stops_invitation ON invitation_beacon_stops(invitation_id, priority_order);

-- =====================
-- SLINGSHOT SLOTS: Auto-slot tracking for Shepherds
-- =====================
CREATE TABLE IF NOT EXISTS slingshot_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shepherd_id UUID NOT NULL REFERENCES auth.users(id),
  origin_business_id UUID NOT NULL,
  origin_submission_id UUID REFERENCES arena_submissions(id),
  service_type TEXT NOT NULL,
  generation INT DEFAULT 1 CHECK (generation >= 1 AND generation <= 3),
  is_active BOOLEAN DEFAULT true,
  total_jobs_from_slot INT DEFAULT 0,
  total_earnings_from_slot NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_job_at TIMESTAMPTZ
);

ALTER TABLE slingshot_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shepherds view own slots"
  ON slingshot_slots FOR SELECT
  USING (auth.uid() = shepherd_id);

CREATE POLICY "Members view active slots for matching"
  ON slingshot_slots FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin manages all slots"
  ON slingshot_slots FOR ALL
  USING (public.is_admin());

CREATE INDEX idx_slingshot_shepherd ON slingshot_slots(shepherd_id, is_active);
CREATE INDEX idx_slingshot_origin ON slingshot_slots(origin_business_id, service_type);
CREATE INDEX idx_slingshot_generation ON slingshot_slots(generation, is_active);

-- =====================
-- SLINGSHOT HISTORY: Job tracking from slingshot-matched work
-- =====================
CREATE TABLE IF NOT EXISTS slingshot_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES slingshot_slots(id),
  customer_id UUID NOT NULL REFERENCES auth.users(id),
  accepted BOOLEAN,
  override_shepherd_id UUID REFERENCES auth.users(id),
  job_amount NUMERIC(10,2),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE slingshot_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shepherds view own history"
  ON slingshot_history FOR SELECT
  USING (auth.uid() = (SELECT shepherd_id FROM slingshot_slots WHERE id = slot_id));

CREATE POLICY "Customers view own history"
  ON slingshot_history FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Admin manages all history"
  ON slingshot_history FOR ALL
  USING (public.is_admin());

CREATE INDEX idx_slingshot_history_slot ON slingshot_history(slot_id);
CREATE INDEX idx_slingshot_history_customer ON slingshot_history(customer_id);

-- =====================
-- ROLE-TO-INITIATIVE MAPPING: Used by Red Carpet to select beacon stops
-- =====================
CREATE TABLE IF NOT EXISTS role_initiative_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  primary_initiatives TEXT[] NOT NULL,
  recommended_treasure_map TEXT,
  first_bounty_type TEXT,
  beacon_stop_keys TEXT[] NOT NULL
);

ALTER TABLE role_initiative_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read role map"
  ON role_initiative_map FOR SELECT
  USING (true);

CREATE POLICY "Admin manages role map"
  ON role_initiative_map FOR ALL
  USING (public.is_admin());

-- SEED: Role-to-initiative mappings
INSERT INTO role_initiative_map (role_key, display_name, primary_initiatives, recommended_treasure_map, first_bounty_type, beacon_stop_keys) VALUES
  ('delivery_driver', 'Delivery Driver', ARRAY['rally_group', 'local_wheels'], 'routes', 'delivery', ARRAY['rally_group', 'local_wheels', 'commerce_engine', 'crew_calls', 'lemon_lot', 'calendar', 'treasure_map', 'notifications']),
  ('shade_tree_mechanic', 'Shade-Tree Mechanic', ARRAY['rally_group', 'crew_calls'], 'service_runner', 'vehicle_inspection', ARRAY['crew_calls', 'lemon_lot', 'local_wheels', 'safety_ledger', 'commerce_engine', 'calendar', 'treasure_map', 'notifications']),
  ('storefront_owner', 'Business Owner', ARRAY['lets_make_bread', 'commerce_engine'], 'breakfast', 'setup_storefront', ARRAY['commerce_engine', 'emporium', 'crew_tables', 'design_arena', 'calendar', 'subscriptions', 'treasure_map', 'notifications']),
  ('cook', 'Cook / Food Service', ARRAY['stocked_local_larder', 'lets_make_bread'], 'breakfast', 'first_menu_item', ARRAY['commerce_engine', 'stocked_local_larder', 'crew_calls', 'calendar', 'emporium', 'treasure_map', 'subscriptions', 'notifications']),
  ('designer', 'Designer / Artist', ARRAY['the_forge', 'arena'], 'maker', 'arena_submission', ARRAY['design_arena', 'emporium', 'crew_tables', 'commerce_engine', 'ghost_world', 'treasure_map', 'calendar', 'notifications']),
  ('volunteer', 'Volunteer', ARRAY['mission_one', 'lifeline'], 'helper', 'first_volunteer_shift', ARRAY['mission_one', 'crew_calls', 'stocked_local_larder', 'calendar', 'notifications', 'treasure_map', 'beacon', 'ghost_world']),
  ('family_member', 'Family Member', ARRAY['household_concierge', 'family_table'], 'family', 'family_table_accept', ARRAY['notifications', 'calendar', 'commerce_engine', 'treasure_map', 'ghost_world', 'beacon', 'crew_calls', 'housing']),
  ('neighbor', 'Neighbor', ARRAY['mission_one', 'stocked_local_larder'], 'helper', 'first_delivery_accept', ARRAY['mission_one', 'stocked_local_larder', 'commerce_engine', 'crew_calls', 'housing', 'calendar', 'treasure_map', 'notifications']),
  ('teacher', 'Teacher / Educator', ARRAY['didasko', 'academy'], 'educator', 'first_lesson', ARRAY['didasko', 'ghost_world', 'design_arena', 'treasure_map', 'calendar', 'notifications', 'beacon', 'crew_tables']),
  ('musician', 'Musician / Creator', ARRAY['jukebox', 'the_forge'], 'maker', 'first_track_upload', ARRAY['jukebox', 'design_arena', 'emporium', 'crew_tables', 'ghost_world', 'commerce_engine', 'treasure_map', 'notifications'])
ON CONFLICT (role_key) DO NOTHING;
