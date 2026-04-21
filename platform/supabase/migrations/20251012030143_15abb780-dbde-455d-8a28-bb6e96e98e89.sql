-- Fix search_path security warning for calculate_commitment_ratios function
DROP FUNCTION IF EXISTS public.calculate_commitment_ratios(INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION public.calculate_commitment_ratios(
  _time_commitment_days INTEGER,
  _product_lead_time_days INTEGER
)
RETURNS TABLE(equity_ratio NUMERIC, cash_ratio NUMERIC)
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _ratio_factor NUMERIC;
BEGIN
  -- Calculate ratio factor: 0 (shortest) to 1 (longest)
  _ratio_factor := LEAST(1.0, GREATEST(0.0,
    _time_commitment_days::NUMERIC / NULLIF(_product_lead_time_days, 0)
  ));

  -- Equity increases from 10% to 90% as commitment lengthens
  -- Cash decreases from 90% to 10% as commitment lengthens
  RETURN QUERY SELECT
    (0.1 + (_ratio_factor * 0.8))::NUMERIC as equity_ratio,
    (0.9 - (_ratio_factor * 0.8))::NUMERIC as cash_ratio;
END;
$$;
