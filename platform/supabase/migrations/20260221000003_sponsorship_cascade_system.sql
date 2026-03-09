-- SPONSORSHIP CASCADE SYSTEM
-- ===========================
-- 60/10/20/10 Patent Allocation with Cascade Sponsorship
-- 
-- Allocation:
-- - 60% Platform & Sponsors (primes the well)
-- - 10% Patent Buckets (member voting, 5K max per person)
-- - 20% Founder Reserve (development, emergency)
-- - 10% Prosecution Fund (legal + implementation)
--
-- Key Features:
-- - 25 Credit minimum to sponsor
-- - 5K Sponsor Badge for community seeders
-- - $10M cap with reset cycle
-- - Cloth Pouches (Forever Stamp model)

-- Patent Allocation Pools
CREATE TABLE IF NOT EXISTS patent_allocation_pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_code TEXT UNIQUE NOT NULL,
    pool_name TEXT NOT NULL,
    allocation_percent DECIMAL(5, 2) NOT NULL,
    description TEXT,
    
    -- Pool limits
    cap_amount DECIMAL(15, 2), -- $10M for platform pool
    current_allocated DECIMAL(15, 2) DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    cycle_number INTEGER DEFAULT 1, -- Increments at cap reset
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed the four allocation pools
INSERT INTO patent_allocation_pools (pool_code, pool_name, allocation_percent, description, cap_amount)
VALUES 
    ('platform_sponsors', 'Platform & Sponsors', 60.00, 'Operations + Cascade Pool (primes the well)', 10000000),
    ('patent_buckets', 'Patent Buckets', 10.00, 'Member voting, 5K max per person', NULL),
    ('founder_reserve', 'Founder Reserve', 20.00, 'Development reserve, emergency protection', NULL),
    ('prosecution_fund', 'Prosecution Fund', 10.00, 'Legal fees + Implementation costs', NULL)
ON CONFLICT (pool_code) DO NOTHING;

-- Sponsorship Records
CREATE TABLE IF NOT EXISTS sponsorships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Sponsor info
    sponsor_id UUID REFERENCES auth.users(id),
    sponsor_type TEXT NOT NULL DEFAULT 'member', -- 'founder', 'member', 'cascade'
    
    -- Recipient info
    recipient_id UUID REFERENCES auth.users(id),
    recipient_email TEXT, -- For pending invitations
    
    -- Amount
    credit_amount DECIMAL(10, 2) NOT NULL,
    joule_equivalent DECIMAL(10, 2),
    
    -- Source tracking
    source_sponsorship_id UUID REFERENCES sponsorships(id), -- For cascade tracking
    pool_id UUID REFERENCES patent_allocation_pools(id),
    cycle_number INTEGER DEFAULT 1,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending',
    -- pending: Awaiting recipient claim
    -- active: Recipient has claimed
    -- split: Recipient has split to others
    -- expired: Unclaimed after timeout
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    claimed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days')
);

-- Sponsorship Splits (tracking cascade)
CREATE TABLE IF NOT EXISTS sponsorship_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_sponsorship_id UUID REFERENCES sponsorships(id) ON DELETE CASCADE,
    target_sponsorship_id UUID REFERENCES sponsorships(id),
    split_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5K Sponsor Badges
CREATE TABLE IF NOT EXISTS sponsor_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    badge_type TEXT NOT NULL DEFAULT 'community_seeder',
    
    -- Metrics
    total_sponsored DECIMAL(10, 2) NOT NULL,
    people_sponsored INTEGER NOT NULL,
    cascade_depth INTEGER DEFAULT 0, -- How many levels deep their sponsorships went
    
    -- Badge earned
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Display
    is_visible BOOLEAN DEFAULT TRUE
);

-- Patent Bucket Allocations (10% pool, 5K max per person)
CREATE TABLE IF NOT EXISTS patent_bucket_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    bucket_id TEXT NOT NULL, -- 'crown_jewels', 'platform_tech', 'game_systems', etc.
    
    -- Allocation
    joule_amount DECIMAL(10, 2) NOT NULL,
    credit_equivalent DECIMAL(10, 2) NOT NULL,
    
    -- Voting
    vote_weight DECIMAL(10, 4), -- Proportional to contribution
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint: 5K max per person across all buckets
    CONSTRAINT max_5k_per_person CHECK (credit_equivalent <= 5000)
);

-- Cloth Pouches (Forever Stamp model)
CREATE TABLE IF NOT EXISTS cloth_pouches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    
    -- Creation
    credit_amount DECIMAL(10, 2) NOT NULL, -- Credits committed
    service_units DECIMAL(10, 2) NOT NULL, -- Service amount locked in
    creation_rate DECIMAL(10, 4) NOT NULL, -- Rate at creation time
    
    -- Purpose
    purpose TEXT NOT NULL, -- 'patent_purchase', 'sponsorship', 'service_prepay'
    target_id UUID, -- What this pouch is for (patent, bucket, etc.)
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active',
    -- active: Can be invoked
    -- invoked: Has been used
    -- expired: Cancelled/expired
    
    -- Invocation
    invoked_at TIMESTAMPTZ,
    invoked_for TEXT, -- Description of what it was used for
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint: Non-transferable (enforced by user_id)
    CONSTRAINT non_transferable CHECK (user_id IS NOT NULL)
);

-- Sponsorship Cascade View
CREATE OR REPLACE VIEW sponsorship_cascade_view AS
WITH RECURSIVE cascade AS (
    -- Base case: direct sponsorships from founder/platform
    SELECT 
        s.id,
        s.sponsor_id,
        s.recipient_id,
        s.credit_amount,
        s.status,
        1 as depth,
        ARRAY[s.id] as path
    FROM sponsorships s
    WHERE s.source_sponsorship_id IS NULL
    
    UNION ALL
    
    -- Recursive case: sponsorships that came from other sponsorships
    SELECT 
        s.id,
        s.sponsor_id,
        s.recipient_id,
        s.credit_amount,
        s.status,
        c.depth + 1,
        c.path || s.id
    FROM sponsorships s
    JOIN cascade c ON s.source_sponsorship_id = c.id
    WHERE NOT s.id = ANY(c.path) -- Prevent cycles
)
SELECT 
    c.*,
    p_sponsor.display_name as sponsor_name,
    p_recipient.display_name as recipient_name
FROM cascade c
LEFT JOIN profiles p_sponsor ON c.sponsor_id = p_sponsor.id
LEFT JOIN profiles p_recipient ON c.recipient_id = p_recipient.id;

-- Function to check if user can sponsor
CREATE OR REPLACE FUNCTION can_sponsor(p_user_id UUID, p_amount DECIMAL)
RETURNS BOOLEAN AS $$
DECLARE
    user_credits DECIMAL;
BEGIN
    -- Get user's available credits
    SELECT COALESCE(credits, 0) INTO user_credits
    FROM user_balances
    WHERE user_id = p_user_id;
    
    -- Must have at least 25 credits AND the amount they want to sponsor
    RETURN user_credits >= 25 AND user_credits >= p_amount;
END;
$$ LANGUAGE plpgsql;

-- Function to create a sponsorship
CREATE OR REPLACE FUNCTION create_sponsorship(
    p_sponsor_id UUID,
    p_recipient_email TEXT,
    p_amount DECIMAL,
    p_source_sponsorship_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_sponsorship_id UUID;
    pool_id UUID;
BEGIN
    -- Validate sponsor can afford this
    IF NOT can_sponsor(p_sponsor_id, p_amount) THEN
        RAISE EXCEPTION 'Insufficient credits or below 25 credit minimum';
    END IF;
    
    -- Get platform pool ID
    SELECT id INTO pool_id FROM patent_allocation_pools WHERE pool_code = 'platform_sponsors';
    
    -- Create the sponsorship
    INSERT INTO sponsorships (
        sponsor_id,
        recipient_email,
        credit_amount,
        source_sponsorship_id,
        pool_id,
        sponsor_type
    )
    VALUES (
        p_sponsor_id,
        p_recipient_email,
        p_amount,
        p_source_sponsorship_id,
        pool_id,
        CASE WHEN p_source_sponsorship_id IS NOT NULL THEN 'cascade' ELSE 'member' END
    )
    RETURNING id INTO new_sponsorship_id;
    
    -- Deduct from sponsor's balance
    UPDATE user_balances
    SET credits = credits - p_amount,
        updated_at = NOW()
    WHERE user_id = p_sponsor_id;
    
    -- Update pool allocation
    UPDATE patent_allocation_pools
    SET current_allocated = current_allocated + p_amount,
        updated_at = NOW()
    WHERE id = pool_id;
    
    -- Check for 5K badge
    PERFORM check_sponsor_badge(p_sponsor_id);
    
    RETURN new_sponsorship_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check and award 5K sponsor badge
CREATE OR REPLACE FUNCTION check_sponsor_badge(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    total_sponsored DECIMAL;
    people_count INTEGER;
    max_depth INTEGER;
BEGIN
    -- Calculate total sponsored
    SELECT 
        COALESCE(SUM(credit_amount), 0),
        COUNT(DISTINCT recipient_id)
    INTO total_sponsored, people_count
    FROM sponsorships
    WHERE sponsor_id = p_user_id
    AND status IN ('active', 'split');
    
    -- Calculate cascade depth
    SELECT COALESCE(MAX(depth), 0) INTO max_depth
    FROM sponsorship_cascade_view
    WHERE sponsor_id = p_user_id;
    
    -- Award badge if >= 5000
    IF total_sponsored >= 5000 THEN
        INSERT INTO sponsor_badges (user_id, total_sponsored, people_sponsored, cascade_depth)
        VALUES (p_user_id, total_sponsored, people_count, max_depth)
        ON CONFLICT (user_id) DO UPDATE
        SET total_sponsored = EXCLUDED.total_sponsored,
            people_sponsored = EXCLUDED.people_sponsored,
            cascade_depth = EXCLUDED.cascade_depth;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to create a cloth pouch
CREATE OR REPLACE FUNCTION create_cloth_pouch(
    p_user_id UUID,
    p_credit_amount DECIMAL,
    p_purpose TEXT,
    p_target_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_pouch_id UUID;
    current_rate DECIMAL := 1.0; -- In production, this would come from HIVI
BEGIN
    -- Create the pouch
    INSERT INTO cloth_pouches (
        user_id,
        credit_amount,
        service_units,
        creation_rate,
        purpose,
        target_id
    )
    VALUES (
        p_user_id,
        p_credit_amount,
        p_credit_amount * current_rate, -- Same service amount as credits
        current_rate,
        p_purpose,
        p_target_id
    )
    RETURNING id INTO new_pouch_id;
    
    RETURN new_pouch_id;
END;
$$ LANGUAGE plpgsql;

-- Function to invoke a cloth pouch
CREATE OR REPLACE FUNCTION invoke_cloth_pouch(
    p_pouch_id UUID,
    p_user_id UUID,
    p_description TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    pouch_record RECORD;
BEGIN
    -- Get and lock the pouch
    SELECT * INTO pouch_record
    FROM cloth_pouches
    WHERE id = p_pouch_id
    AND user_id = p_user_id
    AND status = 'active'
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Mark as invoked
    UPDATE cloth_pouches
    SET status = 'invoked',
        invoked_at = NOW(),
        invoked_for = p_description
    WHERE id = p_pouch_id;
    
    -- Add the service units to user's balance as Joules
    UPDATE user_balances
    SET joules = COALESCE(joules, 0) + pouch_record.service_units,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Pool cap reset function
CREATE OR REPLACE FUNCTION check_pool_cap_reset()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if platform pool hit cap
    IF NEW.pool_code = 'platform_sponsors' AND NEW.current_allocated >= NEW.cap_amount THEN
        -- Reset the pool
        NEW.current_allocated := 0;
        NEW.cycle_number := NEW.cycle_number + 1;
        NEW.updated_at := NOW();
        
        -- Log the reset
        RAISE NOTICE 'Platform pool reached $10M cap. Resetting to cycle %', NEW.cycle_number;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for pool cap reset
DROP TRIGGER IF EXISTS pool_cap_reset_trigger ON patent_allocation_pools;
CREATE TRIGGER pool_cap_reset_trigger
    BEFORE UPDATE OF current_allocated ON patent_allocation_pools
    FOR EACH ROW
    EXECUTE FUNCTION check_pool_cap_reset();

-- RLS Policies
ALTER TABLE sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE patent_bucket_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloth_pouches ENABLE ROW LEVEL SECURITY;

-- Users can view sponsorships they're involved in
CREATE POLICY "Users can view own sponsorships"
    ON sponsorships FOR SELECT
    USING (auth.uid() = sponsor_id OR auth.uid() = recipient_id);

-- Users can create sponsorships
CREATE POLICY "Users can create sponsorships"
    ON sponsorships FOR INSERT
    WITH CHECK (auth.uid() = sponsor_id);

-- Badges are public
CREATE POLICY "Badges are public"
    ON sponsor_badges FOR SELECT
    USING (is_visible = TRUE);

-- Users can view own bucket allocations
CREATE POLICY "Users can view own bucket allocations"
    ON patent_bucket_allocations FOR SELECT
    USING (auth.uid() = user_id);

-- Users can manage own cloth pouches
CREATE POLICY "Users can manage own cloth pouches"
    ON cloth_pouches FOR ALL
    USING (auth.uid() = user_id);

COMMENT ON TABLE sponsorships IS 'Sponsorship Cascade: 25 Credit minimum, tracks cascade depth';
COMMENT ON TABLE sponsor_badges IS '5K Sponsor Badge: Community Seeder recognition';
COMMENT ON TABLE cloth_pouches IS 'Cloth Pouches: Forever Stamp model for prepaid service access';
COMMENT ON TABLE patent_allocation_pools IS '60/10/20/10 allocation with $10M cap reset';
