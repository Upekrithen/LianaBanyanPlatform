-- Create function to calculate equity/cash ratios based on time commitment
-- Longer commitment = more equity (max 90% equity at longest)
-- Shorter commitment = more cash (max 90% cash at shortest)
CREATE OR REPLACE FUNCTION public.calculate_commitment_ratios(
  _time_commitment_days INTEGER,
  _product_lead_time_days INTEGER
)
RETURNS TABLE(equity_ratio NUMERIC, cash_ratio NUMERIC)
LANGUAGE plpgsql
IMMUTABLE
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

-- Create function to revert expired votes that didn't meet goals
CREATE OR REPLACE FUNCTION public.revert_expired_votes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update pledges that expired without meeting goals
  UPDATE public.pledges p
  SET status = 'reverted',
      reverted_at = now()
  FROM public.production_levels pl
  WHERE p.production_level_id = pl.id
    AND p.status = 'active'
    AND p.commitment_deadline < now()
    AND pl.current_votes < pl.votes_needed;
  
  -- Restore credits to users for reverted votes
  UPDATE public.user_credits uc
  SET total_credits = total_credits + reverted_amount,
      used_credits = used_credits - reverted_amount,
      updated_at = now()
  FROM (
    SELECT uv.user_id, SUM(uv.vote_amount) as reverted_amount
    FROM public.user_votes uv
    WHERE uv.status = 'active'
      AND uv.commitment_deadline < now()
      AND EXISTS (
        SELECT 1 FROM public.production_levels pl
        WHERE pl.id = uv.production_level_id
          AND pl.current_votes < pl.votes_needed
      )
    GROUP BY uv.user_id
  ) reverted
  WHERE uc.user_id = reverted.user_id;
  
  -- Mark user_votes as reverted
  UPDATE public.user_votes uv
  SET status = 'reverted',
      reverted_at = now()
  FROM public.production_levels pl
  WHERE uv.production_level_id = pl.id
    AND uv.status = 'active'
    AND uv.commitment_deadline < now()
    AND pl.current_votes < pl.votes_needed;
END;
$$;