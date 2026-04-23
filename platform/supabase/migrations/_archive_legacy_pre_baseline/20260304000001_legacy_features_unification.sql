-- ============================================================================
-- LEGACY FEATURES UNIFICATION MIGRATION
-- Brings over missing tables from escape-velocity Lovable Site
-- ============================================================================

-- 1. $5 SANTA INITIATIVE
CREATE TABLE IF NOT EXISTS santa_gift_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID REFERENCES profiles(id),
    child_age INTEGER NOT NULL,
    child_interests TEXT NOT NULL,
    gift_description TEXT NOT NULL,
    estimated_cost NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'funded', 'delivered')),
    votes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS santa_donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID REFERENCES profiles(id),
    amount NUMERIC NOT NULL,
    tier TEXT NOT NULL, -- Spark, Kindle, Flame, Blaze, Inferno, Full Sponsor
    votes_granted INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ISLAND MANAGEMENT SYSTEM (HexIsle / Tereno)
CREATE TABLE IF NOT EXISTS hex_islands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id),
    name TEXT NOT NULL,
    island_type TEXT NOT NULL, -- Harvest, Navigate, Engineer, etc.
    governance_model TEXT DEFAULT 'owner' CHECK (governance_model IN ('owner', 'democratic', 'council', 'consensus')),
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hex_island_portals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_island_id UUID REFERENCES hex_islands(id),
    target_island_id UUID REFERENCES hex_islands(id),
    toll_amount NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. NOID JOB BOARD & VOLUNTEER SYSTEM
CREATE TABLE IF NOT EXISTS noid_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poster_id UUID REFERENCES profiles(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    role_type TEXT NOT NULL, -- Sámi, Santa/Klaus, Jesper, etc.
    reward_credits NUMERIC NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS noid_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID REFERENCES noid_opportunities(id),
    applicant_id UUID REFERENCES profiles(id),
    proposal_text TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STAR CHAMBER (AI Consensus Circuit)
CREATE TABLE IF NOT EXISTS star_chamber_verdicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID REFERENCES proposals(id), -- Assuming proposals table exists
    agent_name TEXT NOT NULL, -- Oracle, Morpheus, Red Queen, etc.
    decision TEXT NOT NULL CHECK (decision IN ('approve', 'reject', 'escalate')),
    reasoning TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TREASURY & ASSET VAULT
CREATE TABLE IF NOT EXISTS treasury_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_name TEXT NOT NULL,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('digital', 'physical', 'ip')),
    estimated_value NUMERIC NOT NULL,
    owner_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CONTRACTS SYSTEM
CREATE TABLE IF NOT EXISTS peer_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES profiles(id),
    acceptor_id UUID REFERENCES profiles(id),
    terms TEXT NOT NULL,
    joules_collateral NUMERIC NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'disputed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. GUILDS & TRIBES
CREATE TABLE IF NOT EXISTS guilds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    portal_association TEXT NOT NULL, -- .biz, .net, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guild_members (
    guild_id UUID REFERENCES guilds(id),
    user_id UUID REFERENCES profiles(id),
    role TEXT DEFAULT 'member',
    staked_marks NUMERIC DEFAULT 0,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (guild_id, user_id)
);

-- RLS Policies (Basic setup)
ALTER TABLE santa_gift_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE santa_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hex_islands ENABLE ROW LEVEL SECURITY;
ALTER TABLE hex_island_portals ENABLE ROW LEVEL SECURITY;
ALTER TABLE noid_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE noid_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE star_chamber_verdicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_members ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users for most tables
CREATE POLICY "Allow public read access" ON hex_islands FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON noid_opportunities FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON guilds FOR SELECT USING (true);
