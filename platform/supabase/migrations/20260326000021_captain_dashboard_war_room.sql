-- K129: Captain's Dashboard — "The War Room"
-- Tables: captain_corridors, corridor_businesses, captain_mentorships, demand_signals

-- Captain corridors (geographic territory segments)
CREATE TABLE IF NOT EXISTS captain_corridors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  captain_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Corridor businesses (businesses within a corridor)
CREATE TABLE IF NOT EXISTS corridor_businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corridor_id UUID NOT NULL REFERENCES captain_corridors(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  address TEXT,
  category TEXT CHECK (category IN ('food', 'service', 'retail', 'manufacturing', 'other')),
  status TEXT DEFAULT 'not_approached' CHECK (status IN ('onboarded', 'campaign_active', 'not_approached', 'declined', 'corporate_skip')),
  campaign_id UUID,
  onboarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Captain mentorship (master/apprentice pairings)
CREATE TABLE IF NOT EXISTS captain_mentorships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_captain_id UUID NOT NULL REFERENCES auth.users(id),
  apprentice_captain_id UUID NOT NULL REFERENCES auth.users(id),
  phase TEXT DEFAULT 'shadow' CHECK (phase IN ('shadow', 'co_lead', 'solo', 'graduated')),
  started_at TIMESTAMPTZ DEFAULT now(),
  graduated_at TIMESTAMPTZ
);

-- Walking Billboard demand signals (aggregated, anonymized)
CREATE TABLE IF NOT EXISTS demand_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_name TEXT NOT NULL,
  merchant_category TEXT,
  approximate_location TEXT,
  unique_cardholders INTEGER DEFAULT 0,
  monthly_spend_estimate NUMERIC DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'unassigned' CHECK (status IN ('unassigned', 'campaign_created', 'onboarded'))
);

-- RLS: Captains see only their own corridors
ALTER TABLE captain_corridors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Captains see own corridors" ON captain_corridors
  FOR ALL USING (captain_id = auth.uid());

-- RLS: Corridor businesses visible if parent corridor is owned
ALTER TABLE corridor_businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Captains manage corridor businesses" ON corridor_businesses
  FOR ALL USING (
    corridor_id IN (SELECT id FROM captain_corridors WHERE captain_id = auth.uid())
  );

-- RLS: Mentorships visible to participants
ALTER TABLE captain_mentorships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mentorship participants" ON captain_mentorships
  FOR ALL USING (
    master_captain_id = auth.uid() OR apprentice_captain_id = auth.uid()
  );

-- RLS: Demand signals visible to all captains (aggregated data only)
ALTER TABLE demand_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Captains see demand signals" ON demand_signals
  FOR SELECT USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_captain_corridors_captain ON captain_corridors(captain_id);
CREATE INDEX IF NOT EXISTS idx_corridor_businesses_corridor ON corridor_businesses(corridor_id);
CREATE INDEX IF NOT EXISTS idx_corridor_businesses_status ON corridor_businesses(status);
CREATE INDEX IF NOT EXISTS idx_demand_signals_status ON demand_signals(status);
