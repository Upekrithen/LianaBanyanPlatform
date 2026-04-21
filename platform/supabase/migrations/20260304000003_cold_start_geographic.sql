-- Migration: Cold Start Geographic System
-- Date: 2026-03-04
-- Description: Adds geographic targeting for The 300 (Naval Fleet / Captains) and localized progress tracking
-- Milestone 2: The Cold Start & Stewardship System
--
-- NAVAL RANK PROGRESSION:
-- - Captain: 1 ship (your own) - Local leader for ONE initiative in ONE city
-- - Commodore: 3+ ships - Leader of 3+ initiatives OR 1 initiative across 3+ cities
-- - Rear Admiral: Squadron - Regional coordinator (state-level)
-- - Vice Admiral: Fleet division - Multi-state coordinator
-- - Admiral: Full fleet - National coordinator
-- - Fleet Admiral / Crown: The public figure who sets national vision

-- 1. Add geographic columns to stewardship_applications
ALTER TABLE public.stewardship_applications
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'USA',
ADD COLUMN IF NOT EXISTS region_type TEXT DEFAULT 'city'; -- 'city', 'county', 'state', 'national'

-- 2. Create geographic demand signals table (for "I want this in my area")
CREATE TABLE IF NOT EXISTS public.geographic_demand_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initiative_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    zip_code TEXT NOT NULL,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'USA',
    signal_type TEXT NOT NULL DEFAULT 'interest', -- 'interest', 'soft_pledge', 'hard_pledge'
    pledge_amount NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create geographic cold start thresholds table
CREATE TABLE IF NOT EXISTS public.cold_start_thresholds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initiative_id TEXT NOT NULL,
    tier TEXT NOT NULL, -- SPARK, EMBER, FLAME, FIRE, BLAZE, INFERNO, WILDFIRE
    families_required INTEGER NOT NULL DEFAULT 50,
    captains_required INTEGER NOT NULL DEFAULT 1, -- Naval rank: Captain = 1 ship
    funding_required NUMERIC DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(initiative_id, tier)
);

-- 4. Create geographic progress tracking view
CREATE OR REPLACE VIEW public.geographic_cold_start_progress AS
SELECT
    gds.initiative_id,
    gds.zip_code,
    gds.city,
    gds.state,
    gds.country,
    COUNT(DISTINCT gds.user_id) as interested_families,
    COUNT(DISTINCT CASE WHEN gds.signal_type = 'hard_pledge' THEN gds.user_id END) as committed_families,
    COALESCE(SUM(gds.pledge_amount), 0) as total_pledged,
    (SELECT COUNT(*) FROM public.stewardship_applications sa
     WHERE sa.initiative_id = gds.initiative_id
     AND sa.city = gds.city
     AND sa.state = gds.state
     AND sa.status = 'approved'
     AND sa.region_type = 'city') as active_captains, -- Naval rank: Captain = local leader
    CASE
        WHEN COUNT(DISTINCT gds.user_id) >= 500 THEN 'WILDFIRE'
        WHEN COUNT(DISTINCT gds.user_id) >= 250 THEN 'INFERNO'
        WHEN COUNT(DISTINCT gds.user_id) >= 150 THEN 'BLAZE'
        WHEN COUNT(DISTINCT gds.user_id) >= 100 THEN 'FIRE'
        WHEN COUNT(DISTINCT gds.user_id) >= 75 THEN 'FLAME'
        WHEN COUNT(DISTINCT gds.user_id) >= 50 THEN 'EMBER'
        ELSE 'SPARK'
    END as current_tier
FROM public.geographic_demand_signals gds
GROUP BY gds.initiative_id, gds.zip_code, gds.city, gds.state, gds.country;

-- 5. Seed default cold start thresholds for all initiatives
INSERT INTO public.cold_start_thresholds (initiative_id, tier, families_required, captains_required, description)
VALUES
    -- Let's Make Dinner
    ('lets_make_dinner', 'SPARK', 1, 0, 'Gathering interest'),
    ('lets_make_dinner', 'EMBER', 50, 1, 'Need 50 families and 1 Captain to launch'),
    ('lets_make_dinner', 'FLAME', 75, 1, 'Growing momentum'),
    ('lets_make_dinner', 'FIRE', 100, 2, 'Sustainable operations'),
    ('lets_make_dinner', 'BLAZE', 150, 3, 'Expanding reach'),
    ('lets_make_dinner', 'INFERNO', 250, 4, 'Regional impact'),
    ('lets_make_dinner', 'WILDFIRE', 500, 5, 'Full deployment'),

    -- Defense Klaus
    ('defense_klaus', 'SPARK', 1, 0, 'Gathering interest'),
    ('defense_klaus', 'EMBER', 100, 1, 'Need 100 families and 1 Captain to launch'),
    ('defense_klaus', 'FLAME', 200, 2, 'Growing network'),
    ('defense_klaus', 'FIRE', 500, 3, 'Sustainable protection'),
    ('defense_klaus', 'BLAZE', 1000, 4, 'Regional coverage'),
    ('defense_klaus', 'INFERNO', 2500, 5, 'Major metro coverage'),
    ('defense_klaus', 'WILDFIRE', 5000, 6, 'Full deployment'),

    -- Let's Get Groceries
    ('lets_get_groceries', 'SPARK', 1, 0, 'Gathering interest'),
    ('lets_get_groceries', 'EMBER', 25, 1, 'Need 25 families and 1 Captain to launch'),
    ('lets_get_groceries', 'FLAME', 50, 1, 'Growing buying power'),
    ('lets_get_groceries', 'FIRE', 100, 2, 'Sustainable volume'),
    ('lets_get_groceries', 'BLAZE', 200, 3, 'Major discounts unlocked'),
    ('lets_get_groceries', 'INFERNO', 500, 4, 'Regional buying power'),
    ('lets_get_groceries', 'WILDFIRE', 1000, 5, 'Full deployment'),

    -- Family Table
    ('family_table', 'SPARK', 1, 0, 'Gathering interest'),
    ('family_table', 'EMBER', 10, 1, 'Need 10 families and 1 Captain to launch'),
    ('family_table', 'FLAME', 25, 1, 'Growing connections'),
    ('family_table', 'FIRE', 50, 2, 'Sustainable community'),
    ('family_table', 'BLAZE', 100, 3, 'Expanding reach'),
    ('family_table', 'INFERNO', 250, 4, 'Regional impact'),
    ('family_table', 'WILDFIRE', 500, 5, 'Full deployment')
ON CONFLICT (initiative_id, tier) DO NOTHING;

-- 6. RLS Policies
ALTER TABLE public.geographic_demand_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cold_start_thresholds ENABLE ROW LEVEL SECURITY;

-- Anyone can view thresholds and aggregated progress
CREATE POLICY "Public can view cold start thresholds"
    ON public.cold_start_thresholds FOR SELECT USING (true);

-- Users can create and view their own demand signals
CREATE POLICY "Users can create demand signals"
    ON public.geographic_demand_signals FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view own demand signals"
    ON public.geographic_demand_signals FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

-- 7. Function to get progress for a specific city
CREATE OR REPLACE FUNCTION get_city_cold_start_progress(
    p_initiative_id TEXT,
    p_city TEXT,
    p_state TEXT
)
RETURNS TABLE (
    initiative_id TEXT,
    city TEXT,
    state TEXT,
    interested_families BIGINT,
    committed_families BIGINT,
    total_pledged NUMERIC,
    active_captains BIGINT,
    current_tier TEXT,
    next_tier TEXT,
    families_to_next_tier INTEGER,
    captains_to_next_tier INTEGER
) AS $$
DECLARE
    v_current_tier TEXT;
    v_families BIGINT;
    v_captains BIGINT;
BEGIN
    -- Get current counts
    SELECT
        COUNT(DISTINCT gds.user_id),
        (SELECT COUNT(*) FROM public.stewardship_applications sa
         WHERE sa.initiative_id = p_initiative_id
         AND sa.city = p_city
         AND sa.state = p_state
         AND sa.status = 'approved'
         AND sa.region_type = 'city')
    INTO v_families, v_captains
    FROM public.geographic_demand_signals gds
    WHERE gds.initiative_id = p_initiative_id
    AND gds.city = p_city
    AND gds.state = p_state;

    RETURN QUERY
    WITH current_progress AS (
        SELECT
            p_initiative_id as initiative_id,
            p_city as city,
            p_state as state,
            COALESCE(v_families, 0) as interested_families,
            (SELECT COUNT(DISTINCT user_id) FROM public.geographic_demand_signals
             WHERE initiative_id = p_initiative_id AND city = p_city AND state = p_state
             AND signal_type = 'hard_pledge') as committed_families,
            COALESCE((SELECT SUM(pledge_amount) FROM public.geographic_demand_signals
             WHERE initiative_id = p_initiative_id AND city = p_city AND state = p_state), 0) as total_pledged,
            COALESCE(v_captains, 0) as active_captains
    ),
    tier_calc AS (
        SELECT
            cp.*,
            CASE
                WHEN cp.interested_families >= 500 THEN 'WILDFIRE'
                WHEN cp.interested_families >= 250 THEN 'INFERNO'
                WHEN cp.interested_families >= 150 THEN 'BLAZE'
                WHEN cp.interested_families >= 100 THEN 'FIRE'
                WHEN cp.interested_families >= 75 THEN 'FLAME'
                WHEN cp.interested_families >= 50 THEN 'EMBER'
                ELSE 'SPARK'
            END as current_tier
        FROM current_progress cp
    ),
    next_tier_info AS (
        SELECT
            tc.*,
            CASE tc.current_tier
                WHEN 'SPARK' THEN 'EMBER'
                WHEN 'EMBER' THEN 'FLAME'
                WHEN 'FLAME' THEN 'FIRE'
                WHEN 'FIRE' THEN 'BLAZE'
                WHEN 'BLAZE' THEN 'INFERNO'
                WHEN 'INFERNO' THEN 'WILDFIRE'
                ELSE 'WILDFIRE'
            END as next_tier
        FROM tier_calc tc
    )
    SELECT
        nti.initiative_id,
        nti.city,
        nti.state,
        nti.interested_families,
        nti.committed_families,
        nti.total_pledged,
        nti.active_captains,
        nti.current_tier,
        nti.next_tier,
        GREATEST(0, cst.families_required - nti.interested_families::INTEGER) as families_to_next_tier,
        GREATEST(0, cst.captains_required - nti.active_captains::INTEGER) as captains_to_next_tier
    FROM next_tier_info nti
    LEFT JOIN public.cold_start_thresholds cst
        ON cst.initiative_id = nti.initiative_id
        AND cst.tier = nti.next_tier;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE public.geographic_demand_signals IS 'Cold Start Milestone 2: Geographic demand aggregation for The 300 (Naval Fleet / Captains)';
COMMENT ON TABLE public.cold_start_thresholds IS 'Cold Start Milestone 2: Tier thresholds for SPARK → WILDFIRE progression (Captain = 1 ship)';
COMMENT ON VIEW public.geographic_cold_start_progress IS 'Cold Start Milestone 2: Aggregated progress by city for all initiatives';
