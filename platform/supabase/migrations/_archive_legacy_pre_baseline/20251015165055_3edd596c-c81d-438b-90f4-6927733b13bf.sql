-- Add bonus tracking fields to user_credits
ALTER TABLE public.user_credits
ADD COLUMN IF NOT EXISTS bonus_purchases_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_bonus_purchase_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS current_bonus_tier INTEGER DEFAULT 1;

-- Create function to calculate current bonus percentage
CREATE OR REPLACE FUNCTION public.calculate_user_bonus_percentage(_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _credits RECORD;
  _reputation NUMERIC;
  _is_guild_member BOOLEAN;
  _base_bonus NUMERIC;
  _engagement_bonus NUMERIC;
  _total_bonus NUMERIC;
  _can_purchase BOOLEAN := true;
  _message TEXT := '';
BEGIN
  -- Get user credits info
  SELECT * INTO _credits FROM public.user_credits WHERE user_id = _user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'can_purchase', false,
      'message', 'User credits not found',
      'bonus_percentage', 0
    );
  END IF;

  -- Check monthly restriction (max 1 bonus purchase per month)
  IF _credits.last_bonus_purchase_at IS NOT NULL
     AND _credits.last_bonus_purchase_at > (NOW() - INTERVAL '30 days') THEN
    _can_purchase := false;
    _message := 'You can purchase one bonus package per month. Next available: ' ||
                TO_CHAR(_credits.last_bonus_purchase_at + INTERVAL '30 days', 'Mon DD, YYYY');
    RETURN jsonb_build_object(
      'can_purchase', _can_purchase,
      'message', _message,
      'bonus_percentage', 0,
      'next_available', _credits.last_bonus_purchase_at + INTERVAL '30 days'
    );
  END IF;

  -- Calculate graduated bonus based on purchase count
  -- 1st: 20%, 2nd: 15%, 3rd: 10%, 4th+: 5%
  _base_bonus := CASE
    WHEN _credits.bonus_purchases_count = 0 THEN 20.0
    WHEN _credits.bonus_purchases_count = 1 THEN 15.0
    WHEN _credits.bonus_purchases_count = 2 THEN 10.0
    ELSE 5.0
  END;

  -- Get user reputation
  SELECT AVG(rating) INTO _reputation
  FROM public.user_reputation_ratings
  WHERE rated_user_id = _user_id;

  -- Check guild membership
  SELECT EXISTS(
    SELECT 1 FROM public.guild_members
    WHERE user_id = _user_id AND is_active = true
  ) INTO _is_guild_member;

  -- Calculate engagement bonuses
  _engagement_bonus := 0;
  IF _reputation >= 4.0 THEN
    _engagement_bonus := _engagement_bonus + 5.0;
  END IF;
  IF _is_guild_member THEN
    _engagement_bonus := _engagement_bonus + 5.0;
  END IF;

  _total_bonus := _base_bonus + _engagement_bonus;

  RETURN jsonb_build_object(
    'can_purchase', true,
    'bonus_percentage', _total_bonus,
    'base_bonus', _base_bonus,
    'engagement_bonus', _engagement_bonus,
    'reputation_bonus', CASE WHEN _reputation >= 4.0 THEN 5.0 ELSE 0 END,
    'guild_bonus', CASE WHEN _is_guild_member THEN 5.0 ELSE 0 END,
    'purchase_count', _credits.bonus_purchases_count,
    'reputation_score', COALESCE(_reputation, 0),
    'is_guild_member', _is_guild_member,
    'message', 'Eligible for bonus credits'
  );
END;
$$;
