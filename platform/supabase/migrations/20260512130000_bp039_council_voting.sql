-- BP039: Council member voting mechanism for Initiative #15
-- Migration: 20260512130000_bp039_council_voting.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create council_voting_cycles table
CREATE TABLE IF NOT EXISTS public.council_voting_cycles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    initiative_id text NOT NULL REFERENCES public.initiatives(id) ON DELETE CASCADE,
    cycle_label text NOT NULL,
    cycle_start timestamptz NOT NULL,
    cycle_end timestamptz NOT NULL,
    status text DEFAULT 'open' CHECK (status IN ('open', 'closed', 'tallied')),
    created_at timestamptz DEFAULT now(),
    UNIQUE(initiative_id, cycle_label)
);

-- Create council_votes table
CREATE TABLE IF NOT EXISTS public.council_votes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id uuid NOT NULL REFERENCES public.council_voting_cycles(id) ON DELETE CASCADE,
    voter_member_id uuid NOT NULL REFERENCES public.member_profiles(id) ON DELETE CASCADE,
    candidate_crown_id uuid NOT NULL REFERENCES public.initiative_crowns(id) ON DELETE CASCADE,
    vote_class text DEFAULT 'support' CHECK (vote_class IN ('support', 'abstain', 'reject')),
    cast_at timestamptz DEFAULT now(),
    UNIQUE(cycle_id, voter_member_id, candidate_crown_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_council_votes_cycle
    ON public.council_votes(cycle_id);

CREATE INDEX IF NOT EXISTS idx_council_votes_candidate
    ON public.council_votes(candidate_crown_id);

CREATE INDEX IF NOT EXISTS idx_council_voting_cycles_initiative
    ON public.council_voting_cycles(initiative_id);

CREATE INDEX IF NOT EXISTS idx_council_voting_cycles_status
    ON public.council_voting_cycles(status);

-- Enable RLS on council_votes
ALTER TABLE public.council_votes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to make migration idempotent)
DROP POLICY IF EXISTS votes_read_aggregated ON public.council_votes;
DROP POLICY IF EXISTS votes_write_own ON public.council_votes;

-- Policy: Anyone can read votes (for aggregation/transparency)
CREATE POLICY votes_read_aggregated ON public.council_votes
    FOR SELECT
    USING (true);

-- Policy: Members can only insert their own votes
CREATE POLICY votes_write_own ON public.council_votes
    FOR INSERT
    WITH CHECK (auth.uid() = voter_member_id);

-- Enable RLS on council_voting_cycles
ALTER TABLE public.council_voting_cycles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS cycles_read_all ON public.council_voting_cycles;
DROP POLICY IF EXISTS cycles_write_admin ON public.council_voting_cycles;

-- Policy: Anyone can read voting cycles
CREATE POLICY cycles_read_all ON public.council_voting_cycles
    FOR SELECT
    USING (true);

-- Policy: Only service_role can manage voting cycles
CREATE POLICY cycles_write_admin ON public.council_voting_cycles
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Create a view for vote tallies (useful for reporting)
CREATE OR REPLACE VIEW public.council_vote_tallies AS
SELECT
    cv.cycle_id,
    cv.candidate_crown_id,
    COUNT(*) FILTER (WHERE cv.vote_class = 'support') as support_count,
    COUNT(*) FILTER (WHERE cv.vote_class = 'abstain') as abstain_count,
    COUNT(*) FILTER (WHERE cv.vote_class = 'reject') as reject_count,
    COUNT(*) FILTER (WHERE cv.vote_class = 'support') -
    COUNT(*) FILTER (WHERE cv.vote_class = 'reject') as net_support_score
FROM public.council_votes cv
GROUP BY cv.cycle_id, cv.candidate_crown_id;

-- Grant appropriate permissions
GRANT SELECT ON public.council_voting_cycles TO anon, authenticated;
GRANT SELECT ON public.council_votes TO anon, authenticated;
GRANT INSERT ON public.council_votes TO authenticated;
GRANT SELECT ON public.council_vote_tallies TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE public.council_voting_cycles IS 'Voting cycles for council member elections in Initiative #15';
COMMENT ON TABLE public.council_votes IS 'Individual council member votes on crown candidates';
COMMENT ON COLUMN public.council_votes.vote_class IS 'Vote type: support (positive), abstain (neutral), or reject (negative)';
COMMENT ON VIEW public.council_vote_tallies IS 'Aggregated vote counts per candidate per cycle';
