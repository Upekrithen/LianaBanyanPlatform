-- BP039: Ambassador Position Schema & Coalition Substrate Plumbing
-- Enables members to declare coalition ambassador positions and track matching contributions

-- ============================================================================
-- TABLE: coalition_ambassadors
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.coalition_ambassadors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    coalition_id text NOT NULL,
    coalition_label text NOT NULL,
    initiative_id uuid REFERENCES public.initiatives(id) ON DELETE SET NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'withdrawn', 'suspended')),
    declared_at timestamptz NOT NULL DEFAULT now(),
    activated_at timestamptz,
    withdrawn_at timestamptz,
    notes text,
    CONSTRAINT unique_member_coalition_declaration UNIQUE (member_id, coalition_id, declared_at)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_coalition_ambassadors_status
    ON public.coalition_ambassadors(status);

CREATE INDEX IF NOT EXISTS idx_coalition_ambassadors_coalition
    ON public.coalition_ambassadors(coalition_id);

CREATE INDEX IF NOT EXISTS idx_coalition_ambassadors_member
    ON public.coalition_ambassadors(member_id);

-- ============================================================================
-- RLS POLICIES: coalition_ambassadors
-- ============================================================================
ALTER TABLE public.coalition_ambassadors ENABLE ROW LEVEL SECURITY;

-- Public read: anyone can see ambassador declarations
CREATE POLICY ambassadors_read_all
    ON public.coalition_ambassadors
    FOR SELECT
    USING (true);

-- Members can declare their own ambassador positions
CREATE POLICY ambassadors_write_own
    ON public.coalition_ambassadors
    FOR INSERT
    WITH CHECK (auth.uid() = member_id);

-- Members can update their own ambassador positions
CREATE POLICY ambassadors_update_own
    ON public.coalition_ambassadors
    FOR UPDATE
    USING (auth.uid() = member_id);

-- ============================================================================
-- TABLE: coalition_matches
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.coalition_matches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ambassador_id uuid NOT NULL REFERENCES public.coalition_ambassadors(id) ON DELETE CASCADE,
    matcher_member_id uuid REFERENCES public.members(id),
    contribution_credits numeric NOT NULL CHECK (contribution_credits > 0),
    contribution_currency text NOT NULL CHECK (contribution_currency IN ('credits', 'marks', 'joules')),
    matched_at timestamptz NOT NULL DEFAULT now(),
    ledger_entry_id uuid,
    CONSTRAINT no_fiat_conversion CHECK (contribution_currency IN ('credits', 'marks', 'joules'))
);

CREATE INDEX IF NOT EXISTS idx_coalition_matches_ambassador
    ON public.coalition_matches(ambassador_id);

CREATE INDEX IF NOT EXISTS idx_coalition_matches_matcher
    ON public.coalition_matches(matcher_member_id);

-- ============================================================================
-- RLS POLICIES: coalition_matches
-- ============================================================================
ALTER TABLE public.coalition_matches ENABLE ROW LEVEL SECURITY;

-- Public read: anyone can see matching contributions
CREATE POLICY coalition_matches_read_all
    ON public.coalition_matches
    FOR SELECT
    USING (true);

-- Authenticated users can create matches
CREATE POLICY coalition_matches_create_authenticated
    ON public.coalition_matches
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- TABLE: coalition_redistribution_batches
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.coalition_redistribution_batches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_period_start timestamptz NOT NULL,
    batch_period_end timestamptz NOT NULL,
    total_pool_credits numeric NOT NULL,
    active_coalitions_count integer NOT NULL,
    per_coalition_share numeric NOT NULL,
    computed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coalition_redistribution_period
    ON public.coalition_redistribution_batches(batch_period_start, batch_period_end);

-- ============================================================================
-- RLS POLICIES: coalition_redistribution_batches
-- ============================================================================
ALTER TABLE public.coalition_redistribution_batches ENABLE ROW LEVEL SECURITY;

-- Public read: anyone can see redistribution computations
CREATE POLICY coalition_redistribution_read_all
    ON public.coalition_redistribution_batches
    FOR SELECT
    USING (true);

-- Only service role can write redistribution batches
CREATE POLICY coalition_redistribution_service_write
    ON public.coalition_redistribution_batches
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
