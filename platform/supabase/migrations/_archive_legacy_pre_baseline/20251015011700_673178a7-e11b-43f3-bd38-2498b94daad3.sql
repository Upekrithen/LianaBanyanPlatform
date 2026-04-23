-- Add column to track initial medallion credit separately
ALTER TABLE public.user_credits
ADD COLUMN IF NOT EXISTS initial_medallion_credit NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS initial_medallion_granted_at TIMESTAMPTZ;

-- Update calculate_withdrawal function to exclude locked medallion credit
CREATE OR REPLACE FUNCTION public.calculate_withdrawal(_user_id uuid, _amount numeric, _withdrawal_type text)
RETURNS TABLE(eligible boolean, fee_percentage numeric, fee_amount numeric, net_amount numeric, error_message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _config RECORD;
  _credits RECORD;
  _available NUMERIC;
  _locked_medallion NUMERIC := 0;
BEGIN
  -- Get config
  SELECT * INTO _config FROM public.withdrawal_configs LIMIT 1;

  -- Get user credits
  SELECT * INTO _credits FROM public.user_credits WHERE user_id = _user_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0::NUMERIC, 0::NUMERIC, 0::NUMERIC, 'User credits not found'::TEXT;
    RETURN;
  END IF;

  -- Check if initial medallion credit is still locked (within 100 days)
  IF _credits.initial_medallion_granted_at IS NOT NULL
     AND _credits.initial_medallion_granted_at + interval '100 days' > now() THEN
    _locked_medallion := _credits.initial_medallion_credit;
  END IF;

  -- Check minimum withdrawal
  IF _amount < _config.min_withdrawal_amount THEN
    RETURN QUERY SELECT false, 0::NUMERIC, 0::NUMERIC, 0::NUMERIC,
      format('Minimum withdrawal is $%s', _config.min_withdrawal_amount);
    RETURN;
  END IF;

  -- Check available balance and calculate fee
  IF _withdrawal_type = 'contribution' THEN
    _available := _credits.contribution_credits - _locked_medallion;
    IF _available < 0 THEN _available := 0; END IF;

    IF _amount > _available THEN
      RETURN QUERY SELECT false, 0::NUMERIC, 0::NUMERIC, 0::NUMERIC,
        format('Insufficient contribution credits. Available: $%s (Initial medallion credit locked for 100 days)', _available);
      RETURN;
    END IF;

    RETURN QUERY SELECT
      true,
      _config.contribution_fee_percentage,
      (_amount * _config.contribution_fee_percentage / 100.0),
      (_amount - (_amount * _config.contribution_fee_percentage / 100.0)),
      NULL::TEXT;

  ELSIF _withdrawal_type = 'earned_instant' THEN
    _available := _credits.earned_credits;
    IF _amount > _available THEN
      RETURN QUERY SELECT false, 0::NUMERIC, 0::NUMERIC, 0::NUMERIC,
        format('Insufficient earned credits. Available: $%s', _available);
      RETURN;
    END IF;

    RETURN QUERY SELECT
      true,
      _config.earned_instant_fee_percentage,
      (_amount * _config.earned_instant_fee_percentage / 100.0),
      (_amount - (_amount * _config.earned_instant_fee_percentage / 100.0)),
      NULL::TEXT;

  ELSE
    RETURN QUERY SELECT false, 0::NUMERIC, 0::NUMERIC, 0::NUMERIC,
      'Invalid withdrawal type'::TEXT;
  END IF;
END;
$$;
