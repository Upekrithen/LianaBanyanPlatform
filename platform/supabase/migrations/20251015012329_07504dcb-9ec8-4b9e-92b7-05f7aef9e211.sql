-- Add tracking for medallion credit origin in invitations
ALTER TABLE public.project_invitations
ADD COLUMN IF NOT EXISTS is_medallion_credit BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS medallion_grant_date TIMESTAMPTZ;

-- Update accept_invitation function to propagate medallion credit lock
CREATE OR REPLACE FUNCTION public.accept_invitation(_invitation_id uuid, _qr_scan_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _invitation record;
  _user_id uuid;
  _funding record;
  _result jsonb;
BEGIN
  -- Get the current user
  _user_id := auth.uid();
  
  -- Get invitation details
  SELECT * INTO _invitation
  FROM public.project_invitations
  WHERE id = _invitation_id
    AND status = 'pending'
    AND email = (SELECT email FROM public.profiles WHERE id = _user_id);
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;
  
  -- Verify QR code email match
  IF _invitation.email != _qr_scan_email THEN
    RETURN jsonb_build_object('success', false, 'error', 'Email does not match QR scan entry');
  END IF;
  
  -- Get project funding
  SELECT * INTO _funding
  FROM public.project_funding
  WHERE project_id = _invitation.project_id;
  
  IF NOT FOUND OR _funding.available_pot < _invitation.credits_allocated THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient funds in project pot');
  END IF;
  
  -- Update invitation status
  UPDATE public.project_invitations
  SET status = 'accepted',
      accepted_at = now()
  WHERE id = _invitation_id;
  
  -- Allocate credits to user - if from medallion credit, set the lock
  IF _invitation.is_medallion_credit THEN
    UPDATE public.user_credits
    SET total_credits = total_credits + _invitation.credits_allocated,
        contribution_credits = contribution_credits + _invitation.credits_allocated,
        initial_medallion_credit = initial_medallion_credit + _invitation.credits_allocated,
        initial_medallion_granted_at = COALESCE(initial_medallion_granted_at, _invitation.medallion_grant_date),
        initial_credit_accepted = true,
        updated_at = now()
    WHERE user_id = _user_id;
  ELSE
    UPDATE public.user_credits
    SET total_credits = total_credits + _invitation.credits_allocated,
        contribution_credits = contribution_credits + _invitation.credits_allocated,
        initial_credit_accepted = true,
        updated_at = now()
    WHERE user_id = _user_id;
  END IF;
  
  -- Update project funding
  UPDATE public.project_funding
  SET allocated_credits = allocated_credits + _invitation.credits_allocated,
      updated_at = now()
  WHERE project_id = _invitation.project_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'credits_allocated', _invitation.credits_allocated,
    'message', 'Credits successfully allocated'
  );
END;
$$;

-- Update user credit deduction to prioritize non-medallion credits first
CREATE OR REPLACE FUNCTION public.deduct_user_credits(
  _user_id uuid,
  _amount numeric,
  _deduct_from_medallion boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _credits RECORD;
  _available_non_medallion numeric;
  _deduct_from_total numeric;
  _deduct_from_medallion_credit numeric := 0;
BEGIN
  -- Get current credits
  SELECT * INTO _credits FROM public.user_credits WHERE user_id = _user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User credits not found';
  END IF;
  
  -- Calculate available non-medallion credits
  _available_non_medallion := _credits.contribution_credits - COALESCE(_credits.initial_medallion_credit, 0);
  
  -- If forcing medallion deduction OR insufficient non-medallion credits
  IF _deduct_from_medallion OR _available_non_medallion < _amount THEN
    -- Deduct from non-medallion first, then from medallion if needed
    IF _available_non_medallion >= _amount THEN
      _deduct_from_total := _amount;
    ELSE
      _deduct_from_total := _amount;
      _deduct_from_medallion_credit := _amount - _available_non_medallion;
    END IF;
  ELSE
    _deduct_from_total := _amount;
  END IF;
  
  -- Update credits
  UPDATE public.user_credits
  SET 
    contribution_credits = contribution_credits - _deduct_from_total,
    used_credits = used_credits + _deduct_from_total,
    initial_medallion_credit = GREATEST(0, initial_medallion_credit - _deduct_from_medallion_credit),
    updated_at = now()
  WHERE user_id = _user_id;
END;
$$;