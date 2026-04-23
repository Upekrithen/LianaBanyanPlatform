-- Create referral tracking table
CREATE TABLE public.user_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referee_email TEXT NOT NULL,
  shared_credit_amount NUMERIC NOT NULL CHECK (shared_credit_amount >= 10),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'matched', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(referrer_id, referee_email)
);

-- Create credit matching ledger
CREATE TABLE public.credit_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL REFERENCES public.user_referrals(id) ON DELETE CASCADE,
  referee_pledge_id UUID NOT NULL REFERENCES public.pledges(id) ON DELETE CASCADE,
  matched_amount NUMERIC NOT NULL,
  referrer_credit_amount NUMERIC NOT NULL,
  referee_credit_amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create medallion eligibility tracking
CREATE TABLE public.medallion_eligibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  total_direct_pledges NUMERIC NOT NULL DEFAULT 0,
  total_matched_credits NUMERIC NOT NULL DEFAULT 0,
  total_contribution NUMERIC GENERATED ALWAYS AS (total_direct_pledges + total_matched_credits) STORED,
  is_eligible BOOLEAN GENERATED ALWAYS AS (total_direct_pledges + total_matched_credits >= 1000) STORED,
  medallion_minted BOOLEAN NOT NULL DEFAULT false,
  medallion_token_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, project_id)
);

-- Create medallion batch minting queue
CREATE TABLE public.medallion_mint_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  batch_number INTEGER NOT NULL,
  production_schedule_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  eligible_users_count INTEGER NOT NULL DEFAULT 0,
  minted_count INTEGER NOT NULL DEFAULT 0,
  transaction_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(project_id, batch_number)
);

-- Enable RLS
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medallion_eligibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medallion_mint_batches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_referrals
CREATE POLICY "Users can view own referrals"
  ON public.user_referrals FOR SELECT
  USING (referrer_id = auth.uid() OR referee_id = auth.uid());

CREATE POLICY "Users can create referrals"
  ON public.user_referrals FOR INSERT
  WITH CHECK (referrer_id = auth.uid());

-- RLS Policies for credit_matches
CREATE POLICY "Anyone can view credit matches"
  ON public.credit_matches FOR SELECT
  USING (true);

-- RLS Policies for medallion_eligibility
CREATE POLICY "Users can view own eligibility"
  ON public.medallion_eligibility FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can view eligibility stats"
  ON public.medallion_eligibility FOR SELECT
  USING (true);

-- RLS Policies for medallion_mint_batches
CREATE POLICY "Anyone can view mint batches"
  ON public.medallion_mint_batches FOR SELECT
  USING (true);

CREATE POLICY "Project owners can manage batches"
  ON public.medallion_mint_batches FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = medallion_mint_batches.project_id
      AND projects.owner_id = auth.uid()
  ));

-- Function to update medallion eligibility after pledge
CREATE OR REPLACE FUNCTION public.update_medallion_eligibility()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _project_id UUID;
  _user_id UUID;
BEGIN
  -- Get project_id from production_level
  SELECT p.project_id INTO _project_id
  FROM public.production_levels pl
  JOIN public.products p ON p.id = pl.product_id
  WHERE pl.id = NEW.production_level_id;

  -- Only track for external_client pledges (votes from clients)
  IF NEW.source = 'external_client' THEN
    -- Get user_id if this pledge is associated with a user
    -- For now, we'll need to add user tracking to pledges
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for updating eligibility
CREATE TRIGGER update_eligibility_on_pledge
  AFTER INSERT ON public.pledges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_medallion_eligibility();

-- Create indexes for performance
CREATE INDEX idx_user_referrals_referrer ON public.user_referrals(referrer_id);
CREATE INDEX idx_user_referrals_referee ON public.user_referrals(referee_email);
CREATE INDEX idx_credit_matches_referral ON public.credit_matches(referral_id);
CREATE INDEX idx_medallion_eligibility_user ON public.medallion_eligibility(user_id);
CREATE INDEX idx_medallion_eligibility_project ON public.medallion_eligibility(project_id);
CREATE INDEX idx_medallion_eligibility_eligible ON public.medallion_eligibility(is_eligible) WHERE is_eligible = true;
