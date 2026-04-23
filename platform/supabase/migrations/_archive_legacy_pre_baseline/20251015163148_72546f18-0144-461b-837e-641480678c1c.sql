-- Guild progression tracking table
CREATE TABLE IF NOT EXISTS public.user_guild_progression (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guild_id UUID REFERENCES public.guilds(id) ON DELETE SET NULL,

  -- Current progression state
  current_tier TEXT NOT NULL DEFAULT 'apprentice' CHECK (current_tier IN ('apprentice', 'journeyman', 'master', 'captain')),
  current_class INTEGER NOT NULL DEFAULT 1 CHECK (current_class >= 1 AND current_class <= 6),

  -- Stake tracking
  total_stake_paid NUMERIC NOT NULL DEFAULT 0,
  stakes_paid_by_class JSONB NOT NULL DEFAULT '{}', -- Maps class to payment info

  -- Progression metrics
  experience_hours INTEGER NOT NULL DEFAULT 0,
  completed_contracts INTEGER NOT NULL DEFAULT 0,
  peer_rating_average NUMERIC,

  -- Timestamps
  current_tier_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_class_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(user_id)
);

-- Guild stake payments table
CREATE TABLE IF NOT EXISTS public.guild_stake_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Payment details
  tier TEXT NOT NULL CHECK (tier IN ('journeyman', 'master')),
  class_level INTEGER NOT NULL CHECK (class_level >= 1 AND class_level <= 6),
  amount_paid NUMERIC NOT NULL,
  cumulative_total NUMERIC NOT NULL,

  -- Stripe tracking
  stripe_price_id TEXT NOT NULL,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,

  -- Status
  payment_status TEXT NOT NULL DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),

  -- Timestamps
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Ensure one payment per tier/class combo per user
  UNIQUE(user_id, tier, class_level)
);

-- Guild Investment Fund tracking
CREATE TABLE IF NOT EXISTS public.guild_investment_fund (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Fund totals
  total_fund_amount NUMERIC NOT NULL DEFAULT 0,
  total_journeyman_stakes NUMERIC NOT NULL DEFAULT 0,
  total_master_stakes NUMERIC NOT NULL DEFAULT 0,

  -- Allocation tracking
  allocated_to_gas NUMERIC NOT NULL DEFAULT 0, -- 1% for gas costs
  allocated_to_infrastructure NUMERIC NOT NULL DEFAULT 0,
  allocated_to_emergency_support NUMERIC NOT NULL DEFAULT 0,
  allocated_to_captain_badges NUMERIC NOT NULL DEFAULT 0,

  -- Metadata
  last_allocation_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Initialize the fund with a single row
INSERT INTO public.guild_investment_fund (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_guild_progression_user_id ON public.user_guild_progression(user_id);
CREATE INDEX IF NOT EXISTS idx_user_guild_progression_tier_class ON public.user_guild_progression(current_tier, current_class);
CREATE INDEX IF NOT EXISTS idx_guild_stake_payments_user_id ON public.guild_stake_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_guild_stake_payments_status ON public.guild_stake_payments(payment_status);

-- Enable RLS
ALTER TABLE public.user_guild_progression ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_stake_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_investment_fund ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_guild_progression
CREATE POLICY "Users can view own guild progression"
  ON public.user_guild_progression FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view guild progression for reputation"
  ON public.user_guild_progression FOR SELECT
  USING (true);

CREATE POLICY "System can manage guild progression"
  ON public.user_guild_progression FOR ALL
  USING (true);

-- RLS Policies for guild_stake_payments
CREATE POLICY "Users can view own stake payments"
  ON public.guild_stake_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all stake payments"
  ON public.guild_stake_payments FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can manage stake payments"
  ON public.guild_stake_payments FOR ALL
  USING (true);

-- RLS Policies for guild_investment_fund
CREATE POLICY "Anyone can view fund totals"
  ON public.guild_investment_fund FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage fund"
  ON public.guild_investment_fund FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Function to auto-initialize user guild progression on first position signup
CREATE OR REPLACE FUNCTION public.initialize_guild_progression()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_guild_progression (user_id)
  VALUES (NEW.applicant_id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger to initialize progression on first position application
CREATE TRIGGER initialize_user_guild_progression
  AFTER INSERT ON public.position_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_guild_progression();

COMMENT ON TABLE public.user_guild_progression IS 'Tracks user progression through guild tiers (Apprentice 1-6, Journeyman 1-6, Master 1-6)';
COMMENT ON TABLE public.guild_stake_payments IS 'Records all guild stake payments for tier/class unlocks';
COMMENT ON TABLE public.guild_investment_fund IS 'Central fund receiving all guild stakes (self-funding model)';
