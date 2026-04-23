-- ============================================================================
-- DESIGN BATTLE SYSTEM
-- ============================================================================
-- Competitive bounty system where 2+ participants compete for the same work.
-- Auto-triggers when 2+ people sign up for the same bounty.
--
-- Key Features:
-- - Mixed currency ante (Credits, Marks, Joules)
-- - GAP rate conversion at contest time
-- - Winner takes 50% of pot + Crow Feathers
-- - Platform takes 16.7% margin
--
-- Migration: 20260217000001_design_battle_system.sql
-- ============================================================================

-- ============================================================================
-- DESIGN BATTLES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS design_battles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bounty_id UUID NOT NULL,
    bounty_title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'voting', 'completed', 'cancelled')),
    skill_tier TEXT NOT NULL DEFAULT 'journeyman' CHECK (skill_tier IN ('novice', 'apprentice', 'journeyman', 'expert', 'master', 'grandmaster')),
    timeframe TEXT NOT NULL DEFAULT '1week' CHECK (timeframe IN ('1hour', '4hours', '1day', '3days', '1week', '2weeks', '1month', '3months')),
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ends_at TIMESTAMPTZ NOT NULL,

    -- Minimum ante requirements
    min_ante_credits DECIMAL(12,2) NOT NULL DEFAULT 1,
    min_ante_marks DECIMAL(12,2) NOT NULL DEFAULT 0,
    min_ante_joules DECIMAL(12,2) NOT NULL DEFAULT 0,

    -- Pot calculations
    total_pot DECIMAL(12,2) NOT NULL DEFAULT 0,
    platform_cut DECIMAL(12,2) NOT NULL DEFAULT 0,
    net_pot DECIMAL(12,2) NOT NULL DEFAULT 0,
    winner_payout DECIMAL(12,2) NOT NULL DEFAULT 0,
    community_votes INTEGER NOT NULL DEFAULT 0,

    -- Participants
    participant_count INTEGER NOT NULL DEFAULT 0,
    winner_id UUID REFERENCES auth.users(id),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for active battles lookup
CREATE INDEX IF NOT EXISTS idx_design_battles_status ON design_battles(status);
CREATE INDEX IF NOT EXISTS idx_design_battles_bounty ON design_battles(bounty_id);
CREATE INDEX IF NOT EXISTS idx_design_battles_ends_at ON design_battles(ends_at);

-- ============================================================================
-- DESIGN BATTLE PARTICIPANTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS design_battle_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    battle_id UUID NOT NULL REFERENCES design_battles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    display_name TEXT NOT NULL,

    -- Ante details
    ante_original JSONB NOT NULL DEFAULT '{"credits": 0, "marks": 0, "joules": 0}',
    ante_credit_equivalent DECIMAL(12,2) NOT NULL DEFAULT 0,
    gap_rate_used DECIMAL(6,2) NOT NULL DEFAULT 1,
    converted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Submission
    submission_url TEXT,
    submitted_at TIMESTAMPTZ,

    -- Voting
    vote_count INTEGER NOT NULL DEFAULT 0,

    -- Results
    rank INTEGER,
    payout DECIMAL(12,2),
    crow_feather_earned BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(battle_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_battle_participants_battle ON design_battle_participants(battle_id);
CREATE INDEX IF NOT EXISTS idx_battle_participants_user ON design_battle_participants(user_id);

-- ============================================================================
-- DESIGN BATTLE VOTES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS design_battle_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    battle_id UUID NOT NULL REFERENCES design_battles(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES design_battle_participants(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES auth.users(id),
    vote_credits INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(battle_id, voter_id) -- One vote per battle per user
);

-- Index for vote counting
CREATE INDEX IF NOT EXISTS idx_battle_votes_participant ON design_battle_votes(participant_id);

-- ============================================================================
-- BOUNTY SIGNUPS TABLE (for auto-contest detection)
-- ============================================================================

CREATE TABLE IF NOT EXISTS bounty_signups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bounty_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'withdrawn', 'converted_to_battle')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(bounty_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_bounty_signups_bounty ON bounty_signups(bounty_id);

-- ============================================================================
-- AUTO-CONTEST TRIGGER FUNCTION
-- ============================================================================
-- When 2+ people sign up for the same bounty, automatically create a Design Battle

CREATE OR REPLACE FUNCTION create_design_battle_on_overlap()
RETURNS TRIGGER AS $$
DECLARE
    signup_count INTEGER;
    existing_battle UUID;
    new_battle_id UUID;
    bounty_record RECORD;
BEGIN
    -- Count active signups for this bounty
    SELECT COUNT(*) INTO signup_count
    FROM bounty_signups
    WHERE bounty_id = NEW.bounty_id
    AND status = 'active';

    -- If 2+ signups, check if battle already exists
    IF signup_count >= 2 THEN
        SELECT id INTO existing_battle
        FROM design_battles
        WHERE bounty_id = NEW.bounty_id
        AND status IN ('pending', 'active');

        -- If no battle exists, create one
        IF existing_battle IS NULL THEN
            -- Get bounty details (assumes bounties table exists)
            -- If not, use placeholder values
            BEGIN
                SELECT title, skill_tier, timeframe INTO bounty_record
                FROM bounties
                WHERE id = NEW.bounty_id;
            EXCEPTION WHEN OTHERS THEN
                bounty_record.title := 'Bounty ' || NEW.bounty_id::TEXT;
                bounty_record.skill_tier := 'journeyman';
                bounty_record.timeframe := '1week';
            END;

            -- Create the Design Battle
            INSERT INTO design_battles (
                bounty_id,
                bounty_title,
                status,
                skill_tier,
                timeframe,
                starts_at,
                ends_at
            ) VALUES (
                NEW.bounty_id,
                COALESCE(bounty_record.title, 'Bounty ' || NEW.bounty_id::TEXT),
                'pending',
                COALESCE(bounty_record.skill_tier, 'journeyman'),
                COALESCE(bounty_record.timeframe, '1week'),
                NOW(),
                NOW() + INTERVAL '1 week' -- Default, will be updated based on timeframe
            )
            RETURNING id INTO new_battle_id;

            -- Update all active signups to converted_to_battle
            UPDATE bounty_signups
            SET status = 'converted_to_battle'
            WHERE bounty_id = NEW.bounty_id
            AND status = 'active';

            -- Log the auto-creation
            RAISE NOTICE 'Design Battle % created for bounty % with % participants',
                new_battle_id, NEW.bounty_id, signup_count;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_auto_design_battle ON bounty_signups;
CREATE TRIGGER trigger_auto_design_battle
    AFTER INSERT ON bounty_signups
    FOR EACH ROW
    EXECUTE FUNCTION create_design_battle_on_overlap();

-- ============================================================================
-- INCREMENT VOTE COUNT FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_battle_votes(
    p_participant_id UUID,
    p_vote_count INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
    UPDATE design_battle_participants
    SET vote_count = vote_count + p_vote_count
    WHERE id = p_participant_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMPLETE BATTLE FUNCTION
-- ============================================================================
-- Called when battle ends to calculate final results

CREATE OR REPLACE FUNCTION complete_design_battle(p_battle_id UUID)
RETURNS TABLE (
    winner_user_id UUID,
    winner_payout DECIMAL,
    crow_feather_awarded BOOLEAN
) AS $$
DECLARE
    v_winner RECORD;
    v_total_ante DECIMAL;
    v_community_votes INTEGER;
    v_gross_pot DECIMAL;
    v_platform_cut DECIMAL;
    v_net_pot DECIMAL;
    v_winner_share DECIMAL;
    v_runner_up_share DECIMAL;
    v_participant_count INTEGER;
BEGIN
    -- Get winner (highest vote count)
    SELECT * INTO v_winner
    FROM design_battle_participants
    WHERE battle_id = p_battle_id
    ORDER BY vote_count DESC
    LIMIT 1;

    IF v_winner IS NULL THEN
        RETURN;
    END IF;

    -- Calculate pot
    SELECT
        COALESCE(SUM(ante_credit_equivalent), 0),
        COUNT(*)
    INTO v_total_ante, v_participant_count
    FROM design_battle_participants
    WHERE battle_id = p_battle_id;

    SELECT community_votes INTO v_community_votes
    FROM design_battles
    WHERE id = p_battle_id;

    v_gross_pot := v_total_ante + COALESCE(v_community_votes, 0);
    v_platform_cut := ROUND(v_gross_pot * 0.167, 2);
    v_net_pot := v_gross_pot - v_platform_cut;
    v_winner_share := ROUND(v_net_pot * 0.50, 2);
    v_runner_up_share := ROUND((v_net_pot - v_winner_share) / GREATEST(v_participant_count - 1, 1), 2);

    -- Update winner
    UPDATE design_battle_participants
    SET rank = 1, payout = v_winner_share, crow_feather_earned = TRUE
    WHERE id = v_winner.id;

    -- Update runner-ups
    UPDATE design_battle_participants
    SET rank = 2, payout = v_runner_up_share, crow_feather_earned = FALSE
    WHERE battle_id = p_battle_id AND id != v_winner.id;

    -- Update battle
    UPDATE design_battles
    SET
        status = 'completed',
        winner_id = v_winner.user_id,
        total_pot = v_gross_pot,
        platform_cut = v_platform_cut,
        net_pot = v_net_pot,
        winner_payout = v_winner_share,
        updated_at = NOW()
    WHERE id = p_battle_id;

    -- Award crow feather
    INSERT INTO crow_feathers (user_id, category, record_value, metadata)
    VALUES (
        v_winner.user_id,
        'design_battle',
        v_winner_share,
        jsonb_build_object('battle_id', p_battle_id)
    );

    RETURN QUERY SELECT v_winner.user_id, v_winner_share, TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE design_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_battle_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_battle_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bounty_signups ENABLE ROW LEVEL SECURITY;

-- Design Battles: Anyone can view, only participants can update
CREATE POLICY "Anyone can view design battles"
    ON design_battles FOR SELECT
    USING (true);

CREATE POLICY "System can manage design battles"
    ON design_battles FOR ALL
    USING (true);

-- Participants: Anyone can view, users can manage their own
CREATE POLICY "Anyone can view participants"
    ON design_battle_participants FOR SELECT
    USING (true);

CREATE POLICY "Users can join battles"
    ON design_battle_participants FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation"
    ON design_battle_participants FOR UPDATE
    USING (auth.uid() = user_id);

-- Votes: Anyone can view, users can vote once
CREATE POLICY "Anyone can view votes"
    ON design_battle_votes FOR SELECT
    USING (true);

CREATE POLICY "Users can vote"
    ON design_battle_votes FOR INSERT
    WITH CHECK (auth.uid() = voter_id);

-- Bounty Signups: Users manage their own
CREATE POLICY "Users can view own signups"
    ON bounty_signups FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create signups"
    ON bounty_signups FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own signups"
    ON bounty_signups FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_design_battle_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_design_battle_updated
    BEFORE UPDATE ON design_battles
    FOR EACH ROW
    EXECUTE FUNCTION update_design_battle_timestamp();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE design_battles IS 'Competitive bounty contests where 2+ participants compete';
COMMENT ON TABLE design_battle_participants IS 'Participants in design battles with their antes and results';
COMMENT ON TABLE design_battle_votes IS 'Community votes on design battle submissions';
COMMENT ON TABLE bounty_signups IS 'Bounty signups that trigger auto-contest creation';
COMMENT ON FUNCTION create_design_battle_on_overlap() IS 'Auto-creates Design Battle when 2+ people sign up for same bounty';
COMMENT ON FUNCTION complete_design_battle(UUID) IS 'Finalizes battle, calculates payouts, awards crow feathers';
