-- Migration: Scheduled LB Card Funding via Stripe (#2008) + Community-Supported Card Funding (#2009)
--
-- IMPORTANT: LB Card is funded with REAL MONEY via Stripe Issuing.
-- NOT from Credits. Credits NEVER cash out to fiat. One-way valve. Irrevocable.

-- =============================================================================
-- TABLE 1: lb_card_funding_schedules
-- Innovation #2008 — Scheduled LB Card Funding via Stripe
-- Allows recurring funding of an LB Card via Stripe Billing subscriptions.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.lb_card_funding_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    funder_id UUID NOT NULL REFERENCES auth.users(id),
    recipient_id UUID NOT NULL REFERENCES auth.users(id),
    card_serial TEXT,
    stripe_subscription_id TEXT,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'usd' CHECK (currency IN ('usd')),
    frequency TEXT NOT NULL CHECK (frequency IN ('daily','weekly','biweekly','monthly','custom')),
    custom_interval_days INTEGER,
    purpose TEXT CHECK (purpose IN ('rent','food','transportation','education','childcare','tools','general','other')),
    purpose_note TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active','paused','cancelled','expired')),
    next_funding_at TIMESTAMPTZ,
    last_funded_at TIMESTAMPTZ,
    total_funded NUMERIC(10,2) DEFAULT 0,
    funding_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.lb_card_funding_schedules IS
    'Scheduled recurring funding of LB Cards via Stripe Issuing. '
    'LB Card is funded with REAL MONEY via Stripe Issuing. NOT from Credits. '
    'Credits NEVER cash out to fiat. One-way valve. Irrevocable. '
    'Innovation #2008 — Scheduled LB Card Funding via Stripe.';

-- =============================================================================
-- TABLE 2: lb_card_funding_transactions
-- Individual funding transaction records tied to schedules or one-off.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.lb_card_funding_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID REFERENCES public.lb_card_funding_schedules(id) ON DELETE SET NULL,
    funder_id UUID NOT NULL REFERENCES auth.users(id),
    recipient_id UUID NOT NULL REFERENCES auth.users(id),
    amount NUMERIC(10,2) NOT NULL,
    stripe_payment_intent_id TEXT,
    stripe_transfer_id TEXT,
    purpose TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed','refunded')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

COMMENT ON TABLE public.lb_card_funding_transactions IS
    'Individual LB Card funding transactions, each backed by a Stripe payment. '
    'LB Card is funded with REAL MONEY via Stripe Issuing. NOT from Credits. '
    'Credits NEVER cash out to fiat. One-way valve. Irrevocable.';

-- =============================================================================
-- TABLE 3: lb_card_funding_sources
-- Innovation #2009 — Community-Supported Card Funding
-- Card holders authorize other members (family, guild, tribe, community) to fund
-- their LB Card. Enables community-supported funding patterns.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.lb_card_funding_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_owner_id UUID NOT NULL REFERENCES auth.users(id),
    authorized_funder_id UUID NOT NULL REFERENCES auth.users(id),
    authorized_at TIMESTAMPTZ DEFAULT now(),
    revoked_at TIMESTAMPTZ,
    UNIQUE(card_owner_id, authorized_funder_id)
);

COMMENT ON TABLE public.lb_card_funding_sources IS
    'Authorization table: card holders grant permission for community members to fund their LB Card. '
    'Enables community-supported card funding (family, guild, tribe, sponsors). '
    'LB Card is funded with REAL MONEY via Stripe Issuing. NOT from Credits. '
    'Credits NEVER cash out to fiat. One-way valve. Irrevocable. '
    'Innovation #2009 — Community-Supported Card Funding.';

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Schedules indexes
CREATE INDEX idx_lb_card_funding_schedules_funder ON public.lb_card_funding_schedules(funder_id);
CREATE INDEX idx_lb_card_funding_schedules_recipient ON public.lb_card_funding_schedules(recipient_id);
CREATE INDEX idx_lb_card_funding_schedules_status ON public.lb_card_funding_schedules(status);

-- Transactions indexes
CREATE INDEX idx_lb_card_funding_transactions_funder ON public.lb_card_funding_transactions(funder_id);
CREATE INDEX idx_lb_card_funding_transactions_recipient ON public.lb_card_funding_transactions(recipient_id);
CREATE INDEX idx_lb_card_funding_transactions_schedule ON public.lb_card_funding_transactions(schedule_id);
CREATE INDEX idx_lb_card_funding_transactions_status ON public.lb_card_funding_transactions(status);

-- Funding sources indexes
CREATE INDEX idx_lb_card_funding_sources_owner ON public.lb_card_funding_sources(card_owner_id);
CREATE INDEX idx_lb_card_funding_sources_funder ON public.lb_card_funding_sources(authorized_funder_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Schedules RLS
ALTER TABLE public.lb_card_funding_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Funders can view their own funding schedules"
    ON public.lb_card_funding_schedules FOR SELECT
    USING (auth.uid() = funder_id);

CREATE POLICY "Recipients can view funding schedules directed to them"
    ON public.lb_card_funding_schedules FOR SELECT
    USING (auth.uid() = recipient_id);

CREATE POLICY "Funders can create funding schedules"
    ON public.lb_card_funding_schedules FOR INSERT
    WITH CHECK (auth.uid() = funder_id);

CREATE POLICY "Funders can update their own funding schedules"
    ON public.lb_card_funding_schedules FOR UPDATE
    USING (auth.uid() = funder_id)
    WITH CHECK (auth.uid() = funder_id);

-- Transactions RLS
ALTER TABLE public.lb_card_funding_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Funders can view their own funding transactions"
    ON public.lb_card_funding_transactions FOR SELECT
    USING (auth.uid() = funder_id);

CREATE POLICY "Recipients can view funding transactions directed to them"
    ON public.lb_card_funding_transactions FOR SELECT
    USING (auth.uid() = recipient_id);

CREATE POLICY "Funders can create funding transactions"
    ON public.lb_card_funding_transactions FOR INSERT
    WITH CHECK (auth.uid() = funder_id);

CREATE POLICY "Funders can update their own funding transactions"
    ON public.lb_card_funding_transactions FOR UPDATE
    USING (auth.uid() = funder_id)
    WITH CHECK (auth.uid() = funder_id);

-- Funding Sources RLS
ALTER TABLE public.lb_card_funding_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Card owners can view their authorized funders"
    ON public.lb_card_funding_sources FOR SELECT
    USING (auth.uid() = card_owner_id);

CREATE POLICY "Authorized funders can see their own authorization"
    ON public.lb_card_funding_sources FOR SELECT
    USING (auth.uid() = authorized_funder_id);

CREATE POLICY "Card owners can authorize funders"
    ON public.lb_card_funding_sources FOR INSERT
    WITH CHECK (auth.uid() = card_owner_id);

CREATE POLICY "Card owners can revoke funder authorization"
    ON public.lb_card_funding_sources FOR UPDATE
    USING (auth.uid() = card_owner_id)
    WITH CHECK (auth.uid() = card_owner_id);

-- =============================================================================
-- UPDATED_AT TRIGGER
-- =============================================================================
CREATE OR REPLACE FUNCTION public.update_lb_card_funding_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lb_card_funding_schedules_updated_at
    BEFORE UPDATE ON public.lb_card_funding_schedules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_lb_card_funding_schedules_updated_at();
