-- K381: Campaign Forge Foundation
-- Campaigns are DM-run adventures in the HexIsle world.
-- A campaign has a map, objectives, crew roster, and progression state.
-- Foundation for K382 (Map Editor) and K384 (DM Summoning Protocol).

BEGIN;

-- ═══ Campaigns Table ═══
CREATE TABLE IF NOT EXISTS hexisle_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  campaign_type TEXT NOT NULL DEFAULT 'adventure'
    CHECK (campaign_type IN ('adventure', 'raid', 'puzzle', 'trade', 'siege', 'custom')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'recruiting', 'active', 'paused', 'completed', 'archived')),
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  island_slug TEXT,
  district_slug TEXT,
  map_data JSONB DEFAULT '{}'::jsonb,
  objectives JSONB DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  max_crew INTEGER DEFAULT 6,
  entry_fee NUMERIC(10,2) DEFAULT 0,
  reward_pool JSONB DEFAULT '{}'::jsonb,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_creator ON hexisle_campaigns (creator_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON hexisle_campaigns (status);
CREATE INDEX IF NOT EXISTS idx_campaigns_island ON hexisle_campaigns (island_slug);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON hexisle_campaigns (campaign_type);

-- ═══ Campaign Crew (roster) ═══
CREATE TABLE IF NOT EXISTS campaign_crew (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES hexisle_campaigns(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT NOT NULL DEFAULT 'adventurer'
    CHECK (role IN ('dm', 'adventurer', 'scout', 'healer', 'sentinel', 'merchant')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'benched', 'departed')),
  UNIQUE(campaign_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_crew_campaign ON campaign_crew (campaign_id);
CREATE INDEX IF NOT EXISTS idx_crew_member ON campaign_crew (member_id);

-- ═══ Campaign Events (turn log) ═══
CREATE TABLE IF NOT EXISTS campaign_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES hexisle_campaigns(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL
    CHECK (event_type IN ('move', 'encounter', 'objective', 'loot', 'chat', 'dm_note', 'system')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_campaign ON campaign_events (campaign_id, created_at);
CREATE INDEX IF NOT EXISTS idx_events_type ON campaign_events (event_type);

-- ═══ RLS ═══
ALTER TABLE hexisle_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_crew ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_events ENABLE ROW LEVEL SECURITY;

-- Campaigns: public read for recruiting/active, full access for creator
DROP POLICY IF EXISTS "campaigns_public_read" ON hexisle_campaigns;
CREATE POLICY "campaigns_public_read" ON hexisle_campaigns FOR SELECT
  USING (status IN ('recruiting', 'active', 'completed') OR auth.uid() = creator_id);

DROP POLICY IF EXISTS "campaigns_creator_insert" ON hexisle_campaigns;
CREATE POLICY "campaigns_creator_insert" ON hexisle_campaigns FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "campaigns_creator_update" ON hexisle_campaigns;
CREATE POLICY "campaigns_creator_update" ON hexisle_campaigns FOR UPDATE
  USING (auth.uid() = creator_id);

-- Crew: visible to campaign members, insertable by self
DROP POLICY IF EXISTS "crew_read" ON campaign_crew;
CREATE POLICY "crew_read" ON campaign_crew FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "crew_join" ON campaign_crew;
CREATE POLICY "crew_join" ON campaign_crew FOR INSERT
  WITH CHECK (auth.uid() = member_id);

DROP POLICY IF EXISTS "crew_leave" ON campaign_crew;
CREATE POLICY "crew_leave" ON campaign_crew FOR UPDATE
  USING (auth.uid() = member_id);

-- Events: visible to crew members
DROP POLICY IF EXISTS "events_crew_read" ON campaign_events;
CREATE POLICY "events_crew_read" ON campaign_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaign_crew
      WHERE campaign_crew.campaign_id = campaign_events.campaign_id
        AND campaign_crew.member_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM hexisle_campaigns
      WHERE hexisle_campaigns.id = campaign_events.campaign_id
        AND hexisle_campaigns.creator_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "events_actor_insert" ON campaign_events;
CREATE POLICY "events_actor_insert" ON campaign_events FOR INSERT
  WITH CHECK (auth.uid() = actor_id);

-- ═══ Campaign Forge Deck Card ═══
INSERT INTO deck_cards (card_code, name, front_title, back_title, back_instructions, description, front_icon, card_type, rarity, deep_link_url, credit_cost)
VALUES (
  'campaign-forge-creator',
  'Campaign Forge — The DM Card',
  'Campaign Forge',
  'The Dungeon Master Card',
  'Unlocked when you create your first campaign. You are now a Dungeon Master in the Archipelago.',
  'Create and run campaigns in HexIsle.',
  '🗡️',
  'access',
  'rare',
  '/hexisle/forge',
  0
) ON CONFLICT (card_code) DO NOTHING;

COMMIT;
