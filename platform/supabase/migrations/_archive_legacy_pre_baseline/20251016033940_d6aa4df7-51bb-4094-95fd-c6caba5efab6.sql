-- Create function to increment violation count on service links
CREATE OR REPLACE FUNCTION public.increment_violation_count(link_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.member_service_links
  SET violations_count = violations_count + 1,
      last_violation_date = now(),
      rate_differential_flagged = true,
      updated_at = now()
  WHERE id = link_id;
END;
$$;

-- Create function to apply reputation penalty
CREATE OR REPLACE FUNCTION public.apply_reputation_penalty(user_id UUID, penalty INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.user_reputation
  SET overall_reputation_score = GREATEST(0, overall_reputation_score - penalty),
      updated_at = now()
  WHERE user_id = apply_reputation_penalty.user_id;

  -- If user doesn't have a reputation record yet, create one
  INSERT INTO public.user_reputation (user_id, overall_reputation_score, provisional_period)
  VALUES (apply_reputation_penalty.user_id, GREATEST(0, 100 - penalty), true)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.increment_violation_count(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.apply_reputation_penalty(UUID, INTEGER) TO service_role;
