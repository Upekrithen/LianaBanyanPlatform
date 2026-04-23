-- ============================================================================
-- SWOOP VOTING SYSTEM — Service Waiting On Operational Participation
-- ============================================================================
-- Implements the 500-vote threshold for initiatives to go live.
-- Members vote with Credits to signal demand before services launch.
--
-- Key Features:
-- - 500-vote minimum threshold for initiative activation
-- - Credit-weighted voting (1 Credit = 1 vote)
-- - Automatic activation trigger when threshold reached
-- - Vote pledges returned if threshold not met
--
-- Migration: 20260222000001_swoop_voting_system.sql
-- ============================================================================

-- ============================================================================
-- SWOOP INITIATIVES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS swoop_initiatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initiative_slug TEXT NOT NULL UNIQUE,
    initiative_name TEXT NOT NULL,
    description TEXT,
    threshold INTEGER NOT NULL DEFAULT 500,
    current_votes INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'paused', 'completed', 'cancelled')),
    activation_date TIMESTAMPTZ,
    deactivation_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for status lookups
CREATE INDEX IF NOT EXISTS idx_swoop_initiatives_status ON swoop_initiatives(status);
CREATE INDEX IF NOT EXISTS idx_swoop_initiatives_slug ON swoop_initiatives(initiative_slug);

-- ============================================================================
-- SWOOP VOTES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS swoop_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initiative_id UUID NOT NULL REFERENCES swoop_initiatives(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    credit_amount INTEGER NOT NULL CHECK (credit_amount > 0),
    display_name TEXT NOT NULL,
    vote_status TEXT NOT NULL DEFAULT 'pledged' CHECK (vote_status IN ('pledged', 'activated', 'returned', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(initiative_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_swoop_votes_initiative ON swoop_votes(initiative_id);
CREATE INDEX IF NOT EXISTS idx_swoop_votes_user ON swoop_votes(user_id);

-- ============================================================================
-- SWOOP ACTIVATION LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS swoop_activation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initiative_id UUID NOT NULL REFERENCES swoop_initiatives(id),
    action TEXT NOT NULL CHECK (action IN ('activated', 'paused', 'resumed', 'completed', 'cancelled')),
    triggered_by UUID REFERENCES auth.users(id),
    vote_count_at_action INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- CHECK AND ACTIVATE INITIATIVE FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION check_swoop_activation()
RETURNS TRIGGER AS $$
DECLARE
    v_initiative RECORD;
    v_new_total INTEGER;
BEGIN
    -- Get current initiative state
    SELECT * INTO v_initiative
    FROM swoop_initiatives
    WHERE id = NEW.initiative_id;

    -- Calculate new total
    v_new_total := v_initiative.current_votes + NEW.credit_amount;

    -- Update initiative total
    UPDATE swoop_initiatives
    SET
        current_votes = v_new_total,
        updated_at = NOW()
    WHERE id = NEW.initiative_id;

    -- Check if threshold reached
    IF v_new_total >= v_initiative.threshold AND v_initiative.status = 'waiting' THEN
        -- Activate the initiative
        UPDATE swoop_initiatives
        SET
            status = 'active',
            activation_date = NOW(),
            updated_at = NOW()
        WHERE id = NEW.initiative_id;

        -- Update all votes to 'activated'
        UPDATE swoop_votes
        SET vote_status = 'activated'
        WHERE initiative_id = NEW.initiative_id
        AND vote_status = 'pledged';

        -- Log activation
        INSERT INTO swoop_activation_log (
            initiative_id,
            action,
            triggered_by,
            vote_count_at_action,
            notes
        ) VALUES (
            NEW.initiative_id,
            'activated',
            NEW.user_id,
            v_new_total,
            'Threshold reached via vote'
        );

        RAISE NOTICE 'Initiative % activated with % votes', v_initiative.initiative_name, v_new_total;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vote insertion
DROP TRIGGER IF EXISTS trigger_check_swoop_activation ON swoop_votes;
CREATE TRIGGER trigger_check_swoop_activation
    AFTER INSERT ON swoop_votes
    FOR EACH ROW
    EXECUTE FUNCTION check_swoop_activation();

-- ============================================================================
-- RETURN PLEDGES FUNCTION (for cancelled initiatives)
-- ============================================================================

CREATE OR REPLACE FUNCTION return_swoop_pledges(p_initiative_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_returned_count INTEGER := 0;
    v_vote RECORD;
BEGIN
    -- Update all pledged votes to returned
    FOR v_vote IN
        SELECT * FROM swoop_votes
        WHERE initiative_id = p_initiative_id
        AND vote_status = 'pledged'
    LOOP
        -- Return credits to user (would integrate with user_balances)
        -- For now, just mark as returned
        UPDATE swoop_votes
        SET vote_status = 'returned'
        WHERE id = v_vote.id;

        v_returned_count := v_returned_count + 1;
    END LOOP;

    -- Update initiative status
    UPDATE swoop_initiatives
    SET
        status = 'cancelled',
        updated_at = NOW()
    WHERE id = p_initiative_id;

    -- Log cancellation
    INSERT INTO swoop_activation_log (
        initiative_id,
        action,
        vote_count_at_action,
        notes
    ) VALUES (
        p_initiative_id,
        'cancelled',
        (SELECT current_votes FROM swoop_initiatives WHERE id = p_initiative_id),
        'Initiative cancelled, pledges returned'
    );

    RETURN v_returned_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE swoop_initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE swoop_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE swoop_activation_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Anyone can view swoop initiatives" ON swoop_initiatives;
DROP POLICY IF EXISTS "System can manage swoop initiatives" ON swoop_initiatives;
DROP POLICY IF EXISTS "Anyone can view swoop votes" ON swoop_votes;
DROP POLICY IF EXISTS "Users can create swoop votes" ON swoop_votes;
DROP POLICY IF EXISTS "Anyone can view activation log" ON swoop_activation_log;

-- Initiatives: Anyone can view
CREATE POLICY "Anyone can view swoop initiatives"
    ON swoop_initiatives FOR SELECT
    USING (true);

CREATE POLICY "System can manage swoop initiatives"
    ON swoop_initiatives FOR ALL
    USING (true);

-- Votes: Anyone can view, users can create their own
CREATE POLICY "Anyone can view swoop votes"
    ON swoop_votes FOR SELECT
    USING (true);

CREATE POLICY "Users can create swoop votes"
    ON swoop_votes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Activation Log: Anyone can view
CREATE POLICY "Anyone can view activation log"
    ON swoop_activation_log FOR SELECT
    USING (true);

-- ============================================================================
-- SEED DATA — Pre-populate key initiatives
-- ============================================================================

INSERT INTO swoop_initiatives (initiative_slug, initiative_name, description, threshold, status)
VALUES
    ('msa', 'Medical Savings Account', 'Healthcare savings with LB matching contributions', 500, 'waiting'),
    ('lifeline-medications', 'LifeLine Medications', 'Cooperative prescription drug purchasing for better prices', 500, 'waiting'),
    ('lets-make-dinner', 'Let''s Make Dinner', 'Community meal preparation and delivery service', 500, 'waiting'),
    ('lets-get-groceries', 'Let''s Get Groceries', 'Cooperative grocery purchasing with bulk discounts', 500, 'waiting'),
    ('defense-klaus', 'Defense Klaus', 'Legal defense fund for members facing unjust actions', 500, 'waiting'),
    ('rally-group', 'Rally Group', 'Transportation cooperative for ridesharing', 500, 'waiting'),
    ('vsl', 'VSL Credit Union', 'Member-owned financial services', 500, 'waiting'),
    ('harper-guild', 'Harper Guild', 'Creative professionals cooperative', 500, 'waiting'),
    ('jukebox', 'JukeBox', 'Music streaming with fair artist compensation', 500, 'waiting'),
    ('didasko', 'Didasko Academic', 'Educational resources and tutoring cooperative', 500, 'waiting')
ON CONFLICT (initiative_slug) DO NOTHING;

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_swoop_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_swoop_initiative_updated
    BEFORE UPDATE ON swoop_initiatives
    FOR EACH ROW
    EXECUTE FUNCTION update_swoop_timestamp();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE swoop_initiatives IS 'Initiatives waiting for 500-vote threshold to activate';
COMMENT ON TABLE swoop_votes IS 'Credit pledges toward initiative activation';
COMMENT ON TABLE swoop_activation_log IS 'History of initiative status changes';
COMMENT ON FUNCTION check_swoop_activation() IS 'Auto-activates initiative when threshold reached';
COMMENT ON FUNCTION return_swoop_pledges(UUID) IS 'Returns pledged credits when initiative is cancelled';
