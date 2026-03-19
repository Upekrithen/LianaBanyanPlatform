-- Demand Signaling + Pledged Mark Voting — Supabase Wiring
-- Session 37: Wire both systems from mock data to live DB
-- Tables: demand_pedestals, demand_pedestal_allocations, hexisle_vote_candidates, pledged_mark_votes

-- ═══════════════════════════════════════════════════════
-- 1. DEMAND PEDESTALS — Pre-operational features tracked
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.demand_pedestals (
  id text PRIMARY KEY,
  feature_name text NOT NULL,
  description text NOT NULL,
  area text NOT NULL CHECK (area IN ('marketplace','services','infrastructure','governance','hexisle','community')),
  status text NOT NULL DEFAULT 'pre-operational' CHECK (status IN ('pre-operational','alpha','beta','operational')),
  activation_threshold integer NOT NULL DEFAULT 100,
  current_commitments integer NOT NULL DEFAULT 0,
  credit_pledges numeric NOT NULL DEFAULT 0,
  shadow_mark_total numeric NOT NULL DEFAULT 0,
  alpha_lead_weeks integer NOT NULL DEFAULT 4,
  beta_lead_weeks integer NOT NULL DEFAULT 8,
  operational_lead_weeks integer NOT NULL DEFAULT 12,
  icon text DEFAULT '📦',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.demand_pedestals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read pedestals"
  ON public.demand_pedestals FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update pedestal aggregates"
  ON public.demand_pedestals FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- ═══════════════════════════════════════════════════════
-- 2. DEMAND SIGNAL ALLOCATIONS — User SM per pedestal
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.demand_pedestal_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  pedestal_id text NOT NULL REFERENCES public.demand_pedestals(id),
  signal_type text NOT NULL DEFAULT 'want' CHECK (signal_type IN ('want','need','would_buy')),
  fresh_today numeric NOT NULL DEFAULT 0,
  carry_forward numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  consecutive_days integer NOT NULL DEFAULT 0,
  crystallized numeric NOT NULL DEFAULT 0,
  last_allocated_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, pedestal_id)
);

ALTER TABLE public.demand_pedestal_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own allocations"
  ON public.demand_pedestal_allocations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own allocations"
  ON public.demand_pedestal_allocations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own allocations"
  ON public.demand_pedestal_allocations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own allocations"
  ON public.demand_pedestal_allocations FOR DELETE
  USING (auth.uid() = user_id);

-- Aggregate view: total signals per pedestal (publicly readable)
CREATE OR REPLACE VIEW public.demand_pedestal_stats AS
SELECT
  pedestal_id,
  COUNT(DISTINCT user_id) AS unique_signalers,
  SUM(total) AS total_shadow_marks,
  SUM(crystallized) AS total_crystallized,
  SUM(CASE WHEN signal_type = 'would_buy' THEN 1 ELSE 0 END) AS would_buy_count
FROM public.demand_pedestal_allocations
GROUP BY pedestal_id;

-- ═══════════════════════════════════════════════════════
-- 3. HEXISLE VOTE CANDIDATES
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.hexisle_vote_candidates (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  campaign integer NOT NULL,
  type text NOT NULL CHECK (type IN ('component','character','creature','assembly')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','leading','funded','closed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.hexisle_vote_candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read candidates"
  ON public.hexisle_vote_candidates FOR SELECT
  USING (true);

-- ═══════════════════════════════════════════════════════
-- 4. PLEDGED MARK VOTES
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.pledged_mark_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  candidate_id text NOT NULL REFERENCES public.hexisle_vote_candidates(id),
  marks_pledged numeric NOT NULL CHECK (marks_pledged > 0),
  vote_direction text NOT NULL DEFAULT 'for' CHECK (vote_direction IN ('for','against')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','released','absorbed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.pledged_mark_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own votes"
  ON public.pledged_mark_votes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own votes"
  ON public.pledged_mark_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes"
  ON public.pledged_mark_votes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
  ON public.pledged_mark_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Aggregate view: total pledged per candidate (publicly readable)
CREATE OR REPLACE VIEW public.hexisle_vote_tallies AS
SELECT
  candidate_id,
  COUNT(DISTINCT user_id) AS voter_count,
  SUM(CASE WHEN vote_direction = 'for' THEN marks_pledged ELSE 0 END) AS marks_for,
  SUM(CASE WHEN vote_direction = 'against' THEN marks_pledged ELSE 0 END) AS marks_against,
  SUM(marks_pledged) AS total_pledged
FROM public.pledged_mark_votes
WHERE status = 'active'
GROUP BY candidate_id;

-- ═══════════════════════════════════════════════════════
-- 5. SEED DATA — Demand Pedestals
-- ═══════════════════════════════════════════════════════

INSERT INTO public.demand_pedestals (id, feature_name, description, area, status, activation_threshold, current_commitments, credit_pledges, shadow_mark_total, alpha_lead_weeks, beta_lead_weeks, operational_lead_weeks, icon) VALUES
  ('business-cards', 'Business Cards', 'Premium business cards printed through our cooperative network. Moo, Vistaprint, GotPrint. Cost+20%.', 'services', 'pre-operational', 200, 47, 1250, 890, 2, 4, 6, '💳'),
  ('letterhead', 'Letterhead', 'Custom letterhead with cooperative branding. Multiple paper stocks and finishes.', 'services', 'pre-operational', 150, 12, 300, 180, 2, 4, 6, '📄'),
  ('medallion-coins', 'Medallion Coins', 'Custom challenge coins and medallions. Die-cast metal with enamel fill.', 'services', 'pre-operational', 100, 34, 2100, 620, 4, 6, 8, '🪙'),
  ('tshirt-printing', 'T-Shirt Printing', 'DTG and screen print t-shirts. Volume discounts shared with members.', 'services', 'pre-operational', 300, 89, 4500, 1340, 2, 3, 4, '👕'),
  ('sticker-sheets', 'Sticker Sheets', 'Custom die-cut stickers. Full color, weatherproof vinyl or paper.', 'services', 'pre-operational', 250, 156, 3800, 2100, 1, 2, 3, '🏷️'),
  ('hexisle-expansion-packs', 'HexIsle Expansion Packs', 'Custom Hexel terrain packs: Desert, Arctic, Volcanic. 7-tile sets with unique mechanisms.', 'hexisle', 'pre-operational', 500, 78, 9500, 3200, 8, 12, 16, '⬡'),
  ('poster-printing', 'Poster Printing', 'Large format poster printing. Archival quality, multiple sizes and substrates.', 'services', 'pre-operational', 200, 23, 680, 340, 2, 3, 4, '🖼️'),
  ('label-printing', 'Label Printing', 'Product labels, jar labels, shipping labels. Roll and sheet formats.', 'services', 'pre-operational', 150, 8, 120, 90, 2, 3, 4, '🏷️'),
  ('hitbase-counter', 'Hitbase Counter System', 'Patented mechanical boots base: coin-loaded Pez-style HP, sliding tab (HP/Mana/Both), level overlays with weapon scabbard slots, dice-face terrain compatibility. Push to hit — physics tracks damage.', 'hexisle', 'pre-operational', 400, 112, 6800, 2850, 6, 10, 14, '🎯'),
  ('character-layer-kits', 'Character Layer Kits', 'Snap-on equipment layers for character progression. Same body, different layers: Peasant→Farmer→Warrior→King. Compliant mechanism clips.', 'hexisle', 'pre-operational', 350, 95, 5400, 2200, 4, 8, 12, '🛡️')
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════
-- 6. SEED DATA — HexIsle Vote Candidates
-- ═══════════════════════════════════════════════════════

INSERT INTO public.hexisle_vote_candidates (id, name, description, campaign, type, status) VALUES
  ('slotted-top', 'SlottedTop', 'Universal hex tile adapter with compliant mechanism snap-locks. The first piece of the 27-piece Hexel system.', 1, 'component', 'open'),
  ('peasant', 'Peasant (Base Body)', 'The base body that becomes every character. Same body for Peasant, Farmer, Warrior, King — layers snap on top.', 2, 'character', 'open'),
  ('merchant', 'Merchant (Base Body + Cloak)', 'Same base body + snap-on Merchant Cloak. Remove the cloak and the Assassin is underneath.', 3, 'character', 'open'),
  ('golden-lotus', 'Golden Lotus', 'Tesla Valve flow-to-rotation converter. Six cups, bidirectional input, unidirectional output. The heart of every Hexel.', 4, 'component', 'open'),
  ('farmer-warrior', 'Farmer / Warrior', 'Peasant body + tool belt + cart (Farmer) or + ScaleMail + Terrain Armor (Warrior). Ships complete body with all layers.', 5, 'character', 'open'),
  ('character-base', 'Character Base (Hitbase Counter)', 'Patented mechanical boots base: coin-loaded Pez-style HP, 3-position sliding tab (HP/Mana/Both), level overlays with weapon slots, dice-face terrain lock. Push to hit — physics tracks damage.', 6, 'component', 'open'),
  ('sawtooth-coral', 'Sawtooth Coral + Timing Belt', 'The ocean floor piece. Six asymmetric slant angles create trade winds and currents. Hidden Timing Belt counts trap revolutions.', 7, 'component', 'open'),
  ('healer-assassin', 'Healer / Assassin', 'Crown Path layers: Healer adds herbs + staff over cloak. Assassin = cloak removed (subtraction reveals what was always there).', 8, 'character', 'open'),
  ('war-horse', 'War Horse', 'Same horse body: WildHorse → FarmHorse (bridle+yoke+cart) → WarHorse (remove cart, add armor). Layer system for creatures.', 9, 'creature', 'open'),
  ('king', 'King (Sword Path Capstone)', 'Same body wearing ALL layers: tunic + ScaleMail + Terrain Armor + Boots + Crown. Ships with 4-body evolution display.', 10, 'character', 'open'),
  ('pneumatic-palm', 'Pneumatic Palm Tree', 'Telescoping mechanism powered by pneumatic system. Plants a seed, grows during play. Trunk is harvestable for ship masts.', 11, 'component', 'open'),
  ('queen', 'Queen (Crown Path Capstone)', 'Same body + cloak + herbs + Orbs of Wisdom + Fiery Wings + Crown Helmet. Ships with 4-body evolution display.', 12, 'character', 'open'),
  ('hexel-assembly', 'Hexel Assembly', 'All 12 internal pieces assembled into a single working Hexel unit. Community-refined from earlier campaign improvements.', 13, 'assembly', 'open'),
  ('tereno-water-table', 'Tereno Water Table', '420 Hexels, gravity-powered hydraulic surface. No batteries. No motors. 9 years of engineering. The crown jewel.', 14, 'assembly', 'open')
ON CONFLICT (id) DO NOTHING;
