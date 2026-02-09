-- Separate contribution credits from earned credits in user_credits
ALTER TABLE public.user_credits 
ADD COLUMN contribution_credits NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN earned_credits NUMERIC NOT NULL DEFAULT 0;

-- Update existing records: all current total_credits become contribution_credits
UPDATE public.user_credits 
SET contribution_credits = total_credits,
    earned_credits = 0;

-- Create withdrawals table to track cash-out requests
CREATE TABLE public.credit_withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  withdrawal_type TEXT NOT NULL CHECK (withdrawal_type IN ('contribution', 'earned_instant', 'earned_vested')),
  fee_percentage NUMERIC NOT NULL,
  fee_amount NUMERIC NOT NULL,
  net_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  stripe_payout_id TEXT,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_withdrawals ENABLE ROW LEVEL SECURITY;

-- Users can view own withdrawals
CREATE POLICY "Users can view own withdrawals"
ON public.credit_withdrawals
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create withdrawal requests
CREATE POLICY "Users can create withdrawal requests"
ON public.credit_withdrawals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all withdrawals
CREATE POLICY "Admins can view all withdrawals"
ON public.credit_withdrawals
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can update withdrawal status
CREATE POLICY "Admins can update withdrawals"
ON public.credit_withdrawals
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Create withdrawal config table
CREATE TABLE public.withdrawal_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contribution_fee_percentage NUMERIC NOT NULL DEFAULT 3.0,
  earned_instant_fee_percentage NUMERIC NOT NULL DEFAULT 10.0,
  earned_vest_days INTEGER NOT NULL DEFAULT 100,
  min_withdrawal_amount NUMERIC NOT NULL DEFAULT 10.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default config
INSERT INTO public.withdrawal_configs (contribution_fee_percentage, earned_instant_fee_percentage, earned_vest_days, min_withdrawal_amount)
VALUES (3.0, 10.0, 100, 10.00);

-- Enable RLS
ALTER TABLE public.withdrawal_configs ENABLE ROW LEVEL SECURITY;

-- Anyone can view withdrawal configs
CREATE POLICY "Anyone can view withdrawal configs"
ON public.withdrawal_configs
FOR SELECT
USING (true);

-- Only admins can update configs
CREATE POLICY "Admins can manage withdrawal configs"
ON public.withdrawal_configs
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Function to calculate withdrawal amounts
CREATE OR REPLACE FUNCTION public.calculate_withdrawal(
  _user_id UUID,
  _amount NUMERIC,
  _withdrawal_type TEXT
)
RETURNS TABLE(
  eligible BOOLEAN,
  fee_percentage NUMERIC,
  fee_amount NUMERIC,
  net_amount NUMERIC,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _config RECORD;
  _credits RECORD;
  _available NUMERIC;
BEGIN
  -- Get config
  SELECT * INTO _config FROM public.withdrawal_configs LIMIT 1;
  
  -- Get user credits
  SELECT * INTO _credits FROM public.user_credits WHERE user_id = _user_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0::NUMERIC, 0::NUMERIC, 0::NUMERIC, 'User credits not found'::TEXT;
    RETURN;
  END IF;
  
  -- Check minimum withdrawal
  IF _amount < _config.min_withdrawal_amount THEN
    RETURN QUERY SELECT false, 0::NUMERIC, 0::NUMERIC, 0::NUMERIC, 
      format('Minimum withdrawal is $%s', _config.min_withdrawal_amount);
    RETURN;
  END IF;
  
  -- Check available balance and calculate fee
  IF _withdrawal_type = 'contribution' THEN
    _available := _credits.contribution_credits;
    IF _amount > _available THEN
      RETURN QUERY SELECT false, 0::NUMERIC, 0::NUMERIC, 0::NUMERIC, 
        format('Insufficient contribution credits. Available: $%s', _available);
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

-- Update trigger for withdrawals
CREATE TRIGGER update_credit_withdrawals_updated_at
BEFORE UPDATE ON public.credit_withdrawals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_withdrawal_configs_updated_at
BEFORE UPDATE ON public.withdrawal_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();