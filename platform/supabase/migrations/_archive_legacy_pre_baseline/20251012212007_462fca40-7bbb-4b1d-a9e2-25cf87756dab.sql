-- Create user project preference rankings
CREATE TABLE public.user_project_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_category TEXT NOT NULL,
  ranking INTEGER NOT NULL CHECK (ranking >= 1 AND ranking <= 10),
  default_eoi_conversion_days INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, project_category)
);

ALTER TABLE public.user_project_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences"
ON public.user_project_preferences
FOR ALL
USING (auth.uid() = user_id);

-- Create LB Fronting Pool tracking
CREATE TABLE public.lb_funding_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_pool_amount NUMERIC NOT NULL DEFAULT 0,
  allocated_to_eoi NUMERIC NOT NULL DEFAULT 0,
  available_for_eoi NUMERIC GENERATED ALWAYS AS (total_pool_amount - allocated_to_eoi) STORED,
  medallion_contribution_percentage NUMERIC NOT NULL DEFAULT 33.33,
  last_contribution_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lb_funding_pool ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pool stats"
ON public.lb_funding_pool
FOR SELECT
USING (true);

CREATE POLICY "System can manage pool"
ON public.lb_funding_pool
FOR ALL
USING (true);

-- Insert initial pool record
INSERT INTO public.lb_funding_pool (total_pool_amount) VALUES (0);

-- Create EOI vesting schedules
CREATE TABLE public.eoi_vesting_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  eoi_amount NUMERIC NOT NULL,
  vesting_start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_vesting_days INTEGER NOT NULL,
  days_elapsed INTEGER NOT NULL DEFAULT 0,
  amount_vested NUMERIC NOT NULL DEFAULT 0,
  equity_ratio NUMERIC NOT NULL,
  cash_ratio NUMERIC NOT NULL,
  ranking_score INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.eoi_vesting_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vesting schedules"
ON public.eoi_vesting_schedules
FOR SELECT
USING (auth.uid() = user_id);

-- Function to calculate conversion ratios based on ranking and time
CREATE OR REPLACE FUNCTION public.calculate_eoi_conversion_ratios(
  _ranking_score INTEGER,
  _vesting_days INTEGER
)
RETURNS TABLE(equity_ratio NUMERIC, cash_ratio NUMERIC, daily_conversion_rate NUMERIC)
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  _base_equity_ratio NUMERIC;
  _time_penalty NUMERIC;
  _ranking_bonus NUMERIC;
  _final_equity_ratio NUMERIC;
BEGIN
  -- Base equity ratio: 50%
  _base_equity_ratio := 0.50;

  -- Time penalty: longer vesting = lower equity (0.5% penalty per 10 days over 100)
  _time_penalty := GREATEST(0, (_vesting_days - 100) * 0.0005);

  -- Ranking bonus: higher ranking = better equity (5% bonus per rank, max 50% at rank 10)
  _ranking_bonus := (_ranking_score / 10.0) * 0.50;

  -- Calculate final equity ratio (between 10% and 90%)
  _final_equity_ratio := LEAST(0.90, GREATEST(0.10,
    _base_equity_ratio + _ranking_bonus - _time_penalty
  ));

  -- Daily conversion rate based on 100-day model
  RETURN QUERY SELECT
    _final_equity_ratio,
    (1.0 - _final_equity_ratio),
    (1.0 / NULLIF(_vesting_days, 0)::NUMERIC);
END;
$$;

-- Function to contribute to LB pool from medallion pledges
CREATE OR REPLACE FUNCTION public.contribute_to_lb_pool(
  _pledge_amount NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _contribution NUMERIC;
  _pool_percentage NUMERIC;
BEGIN
  -- Get current pool percentage (default 33.33%)
  SELECT medallion_contribution_percentage INTO _pool_percentage
  FROM public.lb_funding_pool
  LIMIT 1;

  -- Calculate contribution (1/3 of pledge)
  _contribution := _pledge_amount * (_pool_percentage / 100.0);

  -- Add to pool
  UPDATE public.lb_funding_pool
  SET
    total_pool_amount = total_pool_amount + _contribution,
    last_contribution_at = now(),
    updated_at = now();
END;
$$;

-- Enhanced EOI conversion function with vesting and pool management
CREATE OR REPLACE FUNCTION public.convert_eoi_credits_with_vesting()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _schedule RECORD;
  _conversion_amount NUMERIC;
  _available_pool NUMERIC;
  _ratios RECORD;
BEGIN
  -- Get available pool amount
  SELECT available_for_eoi INTO _available_pool
  FROM public.lb_funding_pool
  LIMIT 1;

  -- Process active vesting schedules
  FOR _schedule IN
    SELECT * FROM public.eoi_vesting_schedules
    WHERE status = 'active'
    AND days_elapsed < total_vesting_days
  LOOP
    -- Get conversion ratios for this schedule
    SELECT * INTO _ratios
    FROM public.calculate_eoi_conversion_ratios(
      _schedule.ranking_score,
      _schedule.total_vesting_days
    );

    -- Calculate daily conversion amount
    _conversion_amount := _schedule.eoi_amount * _ratios.daily_conversion_rate;

    -- Check if pool has enough funds
    IF _available_pool >= _conversion_amount THEN
      -- Update user credits
      UPDATE public.user_credits
      SET
        eoi_credits = eoi_credits - _conversion_amount,
        total_credits = total_credits + _conversion_amount,
        eoi_last_conversion_at = now(),
        updated_at = now()
      WHERE user_id = _schedule.user_id;

      -- Update vesting schedule
      UPDATE public.eoi_vesting_schedules
      SET
        days_elapsed = days_elapsed + 1,
        amount_vested = amount_vested + _conversion_amount,
        status = CASE
          WHEN days_elapsed + 1 >= total_vesting_days THEN 'completed'
          ELSE 'active'
        END,
        updated_at = now()
      WHERE id = _schedule.id;

      -- Deduct from pool
      UPDATE public.lb_funding_pool
      SET
        allocated_to_eoi = allocated_to_eoi + _conversion_amount,
        updated_at = now();

      -- Update available pool
      _available_pool := _available_pool - _conversion_amount;
    END IF;
  END LOOP;
END;
$$;

-- Trigger to contribute to pool when medallion pledges are made
CREATE OR REPLACE FUNCTION public.auto_contribute_medallion_pledge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_medallion BOOLEAN;
BEGIN
  -- Check if this is a medallion product
  SELECT EXISTS (
    SELECT 1
    FROM public.products p
    JOIN public.production_levels pl ON pl.product_id = p.id
    WHERE pl.id = NEW.production_level_id
    AND p.name = 'Medallion'
  ) INTO _is_medallion;

  -- If medallion pledge, contribute to LB pool
  IF _is_medallion AND NEW.source = 'user' THEN
    PERFORM public.contribute_to_lb_pool(NEW.amount);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER contribute_medallion_to_pool
AFTER INSERT ON public.pledges
FOR EACH ROW
EXECUTE FUNCTION public.auto_contribute_medallion_pledge();

-- Update project categories for better ranking
ALTER TABLE public.user_project_preferences
ADD COLUMN project_tags TEXT[];

CREATE INDEX idx_user_preferences_ranking ON public.user_project_preferences(user_id, ranking);
CREATE INDEX idx_vesting_schedules_active ON public.eoi_vesting_schedules(user_id, status) WHERE status = 'active';
