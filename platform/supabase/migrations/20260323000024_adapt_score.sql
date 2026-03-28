-- ============================================
-- MIGRATION: 20260323000024_adapt_score.sql
-- Knight Session 92: ADAPT Score Dashboard
-- 6 tables: adapt_scores, adapt_baselines, local_sop,
--           integration_partners, integration_bounties, sop_adaptations
-- ============================================

-- ADAPT Scores: individual dimension measurements
CREATE TABLE IF NOT EXISTS adapt_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID,
  system_id TEXT NOT NULL,
  dimension TEXT NOT NULL CHECK (dimension IN ('effectiveness','adaptability','durability','alignment','participation','transmission')),
  score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  measured_at TIMESTAMPTZ DEFAULT now(),
  measured_by UUID REFERENCES auth.users(id)
);

ALTER TABLE adapt_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view adapt scores"
  ON adapt_scores FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin manages adapt scores"
  ON adapt_scores FOR ALL
  USING (public.is_admin());

CREATE INDEX idx_adapt_scores_system ON adapt_scores(system_id, dimension);
CREATE INDEX idx_adapt_scores_node ON adapt_scores(node_id, system_id);
CREATE INDEX idx_adapt_scores_measured ON adapt_scores(measured_at DESC);

-- ADAPT Baselines: canonical configuration per system
CREATE TABLE IF NOT EXISTS adapt_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id TEXT UNIQUE NOT NULL,
  initiative_id INT,
  baseline_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE adapt_baselines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view baselines"
  ON adapt_baselines FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin manages baselines"
  ON adapt_baselines FOR ALL
  USING (public.is_admin());

-- Local SOP: proposed and approved local adaptations
CREATE TABLE IF NOT EXISTS local_sop (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID,
  system_id TEXT NOT NULL,
  title TEXT NOT NULL,
  modification_description TEXT NOT NULL,
  status TEXT DEFAULT 'proposed' CHECK (status IN ('proposed','constitutional_check','initiative_check','approved','rejected','monitoring','promoted','rolled_back')),
  constitutional_violation BOOLEAN DEFAULT false,
  initiative_violation BOOLEAN DEFAULT false,
  adapt_impact NUMERIC(5,2),
  approved_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE local_sop ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view local SOPs"
  ON local_sop FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Members can propose SOPs"
  ON local_sop FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own proposed SOPs"
  ON local_sop FOR UPDATE
  USING (auth.uid() = created_by AND status = 'proposed');

CREATE POLICY "Admin manages all SOPs"
  ON local_sop FOR ALL
  USING (public.is_admin());

CREATE INDEX idx_local_sop_system ON local_sop(system_id, status);
CREATE INDEX idx_local_sop_node ON local_sop(node_id, status);

-- Integration Partners: external cooperatives
CREATE TABLE IF NOT EXISTS integration_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit_union','food_coop','housing_coop','worker_coop','agricultural_coop','other')),
  tier TEXT DEFAULT 'data_mirror' CHECK (tier IN ('data_mirror','credit_bridge','full_mesh')),
  adapt_score NUMERIC(5,2),
  website TEXT,
  contact_info JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE integration_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view partners"
  ON integration_partners FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin manages partners"
  ON integration_partners FOR ALL
  USING (public.is_admin());

-- Integration Bounties: rewards for building integrations
CREATE TABLE IF NOT EXISTS integration_bounties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES integration_partners(id),
  title TEXT NOT NULL,
  description TEXT,
  reward_credits NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','claimed','in_progress','review','completed','cancelled')),
  claimed_by UUID REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE integration_bounties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view bounties"
  ON integration_bounties FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Members can claim open bounties"
  ON integration_bounties FOR UPDATE
  USING (auth.uid() IS NOT NULL AND status = 'open');

CREATE POLICY "Admin manages bounties"
  ON integration_bounties FOR ALL
  USING (public.is_admin());

CREATE INDEX idx_integ_bounties_status ON integration_bounties(status);
CREATE INDEX idx_integ_bounties_partner ON integration_bounties(partner_id);

-- SOP Adaptations: the review/check records for each SOP change
CREATE TABLE IF NOT EXISTS sop_adaptations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID,
  local_sop_id UUID REFERENCES local_sop(id),
  proposed_change TEXT NOT NULL,
  constitutional_check_passed BOOLEAN,
  initiative_check_passed BOOLEAN,
  auto_approved BOOLEAN DEFAULT false,
  adapt_delta NUMERIC(5,2),
  reviewer_id UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sop_adaptations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view adaptations"
  ON sop_adaptations FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin manages adaptations"
  ON sop_adaptations FOR ALL
  USING (public.is_admin());

CREATE INDEX idx_sop_adaptations_sop ON sop_adaptations(local_sop_id);

-- ============================================
-- SEED DATA: Baselines for 19 production systems
-- ============================================

INSERT INTO adapt_baselines (system_id, initiative_id, baseline_config) VALUES
  ('ghost_world', NULL, '{"description": "Risk-free practice environment with time dilation", "constitutional_rules": ["no_real_currency_in_ghost"], "route": "/ghost-world", "session": "K88"}'),
  ('housing', 2, '{"description": "Cooperative Housing Acquisition and listings", "constitutional_rules": ["cost_plus_20", "one_way_valve", "margin_lock"], "route": "/housing", "session": "K89"}'),
  ('congress_api', 15, '{"description": "Live bill tracking and member-to-bill mapping", "constitutional_rules": ["nonpartisan_data_only"], "route": "/political-expedition", "session": "K90"}'),
  ('front_door', NULL, '{"description": "Guided Discovery wizard, $5 Access Key, member profiles", "constitutional_rules": ["five_dollar_flat_fee"], "route": "/welcome", "session": "K91"}'),
  ('political_expedition', 15, '{"description": "Political Expedition with Congress.gov integration", "constitutional_rules": ["nonpartisan_data_only"], "route": "/political-expedition", "session": "K86"}'),
  ('lemon_lot', 9, '{"description": "Peer-to-peer vehicle sharing marketplace", "constitutional_rules": ["cost_plus_20", "member_insured", "lb_marketplace_only"], "route": "/lemon-lot", "session": "K85"}'),
  ('local_wheels', 9, '{"description": "LB fleet vehicles with 20% Earn-Down", "constitutional_rules": ["cost_plus_20", "earn_down_20_percent"], "route": "/local-wheels", "session": "K85"}'),
  ('rideshare_routes', 9, '{"description": "Recurring commute matching under Rally Group", "constitutional_rules": ["person_to_person", "own_insurance"], "route": "/rideshare-routes", "session": "K85"}'),
  ('commerce_engine', NULL, '{"description": "Scan-order-pay-distribute-earnings loop", "constitutional_rules": ["cost_plus_20", "one_way_valve", "margin_lock", "creator_keeps_83_percent"], "route": null, "session": "K80"}'),
  ('star_chamber', NULL, '{"description": "AI-powered dispute resolution with mutual fallback", "constitutional_rules": ["four_judge_system", "human_appeal_right"], "route": "/star-chamber", "session": "K79"}'),
  ('moneypenny', NULL, '{"description": "AI virtual assistant with intelligence layer", "constitutional_rules": ["sec_safe_prompts", "no_financial_advice"], "route": null, "session": "K84"}'),
  ('crew_calls', NULL, '{"description": "Real dispatch for cooperative work requests", "constitutional_rules": ["cost_plus_20", "worker_accepts_voluntarily"], "route": "/crew-calls", "session": "K83"}'),
  ('calendar', NULL, '{"description": "FullCalendar with 6 plug types", "constitutional_rules": ["family_plug_private"], "route": "/calendar", "session": "K82"}'),
  ('design_arena', NULL, '{"description": "Design Battle auto-trigger and competition", "constitutional_rules": ["you_didnt_lose_portfolio", "maker_spotlight_tiers"], "route": "/design-battle", "session": "K87"}'),
  ('emporium', NULL, '{"description": "Maker Spotlight voting and gallery", "constitutional_rules": ["established_rising_pioneer_tiers"], "route": "/emporium", "session": "K87"}'),
  ('crew_tables', NULL, '{"description": "Round Table with role slots around Treasure Map center", "constitutional_rules": ["strangers_assemble"], "route": "/crew-tables", "session": "K87"}'),
  ('beacon', NULL, '{"description": "Two-Bite Teaching system with Save for Later", "constitutional_rules": ["bite_1_save", "bite_2_full_palette"], "route": null, "session": "K75"}'),
  ('treasure_map', NULL, '{"description": "12 maps with 4-level progression", "constitutional_rules": ["starter_to_network_progression"], "route": "/treasure-maps", "session": "K81"}'),
  ('notifications', NULL, '{"description": "Bell + panel notification spine", "constitutional_rules": ["user_owns_notifications"], "route": null, "session": "K91"}')
ON CONFLICT (system_id) DO NOTHING;

-- ============================================
-- SEED DATA: 3 sample integration partners
-- ============================================

INSERT INTO integration_partners (name, type, tier, adapt_score, website, contact_info) VALUES
  ('Mountain West Credit Union', 'credit_union', 'data_mirror', NULL, 'https://example-credit-union.com', '{"note": "Sample partner for development"}'),
  ('Boise Food Co-op', 'food_coop', 'data_mirror', NULL, 'https://example-food-coop.com', '{"note": "Sample partner for development"}'),
  ('Community Housing Partners NW', 'housing_coop', 'data_mirror', NULL, 'https://example-housing-coop.com', '{"note": "Sample partner for development"}');

-- ============================================
-- SEED DATA: 3 sample bounties
-- ============================================

INSERT INTO integration_bounties (partner_id, title, description, reward_credits, status)
SELECT
  ip.id,
  'Build Credit Union Data Mirror',
  'Create read-only API bridge to pull member account summaries from credit union core banking system. Data mirror tier only — no write operations. Must use OAuth2 with member consent flow.',
  500.00,
  'open'
FROM integration_partners ip WHERE ip.name = 'Mountain West Credit Union'
UNION ALL
SELECT
  ip.id,
  'Food Co-op Inventory Sync',
  'Build bidirectional inventory sync between LB Commerce Engine and food co-op POS system. Map product categories to LB storefront items. Real-time stock level updates.',
  350.00,
  'open'
FROM integration_partners ip WHERE ip.name = 'Boise Food Co-op'
UNION ALL
SELECT
  ip.id,
  'Housing Co-op Listing Feed',
  'Create automated feed of available cooperative housing units into LB Housing system. Include unit details, availability dates, cooperative membership requirements, and cost information.',
  400.00,
  'open'
FROM integration_partners ip WHERE ip.name = 'Community Housing Partners NW';
