-- Function to update user credits after withdrawal
CREATE OR REPLACE FUNCTION public.update_user_credits_withdrawal(
  _user_id UUID,
  _amount NUMERIC,
  _credit_type TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _credit_type = 'contribution_credits' THEN
    UPDATE public.user_credits
    SET contribution_credits = contribution_credits - _amount,
        updated_at = now()
    WHERE user_id = _user_id;
  ELSIF _credit_type = 'earned_credits' THEN
    UPDATE public.user_credits
    SET earned_credits = earned_credits - _amount,
        updated_at = now()
    WHERE user_id = _user_id;
  ELSE
    RAISE EXCEPTION 'Invalid credit type: %', _credit_type;
  END IF;
END;
$$;
