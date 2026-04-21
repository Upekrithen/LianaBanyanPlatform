-- Add EOI (Expression of Interest) tracking to user_credits
ALTER TABLE public.user_credits
ADD COLUMN eoi_credits NUMERIC DEFAULT 0,
ADD COLUMN eoi_used_credits NUMERIC DEFAULT 0,
ADD COLUMN eoi_conversion_rate NUMERIC DEFAULT 0.01,
ADD COLUMN eoi_last_conversion_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN eoi_reminder_sent_at TIMESTAMP WITH TIME ZONE;

-- Add EOI toggle to user preferences (create table if needed for user settings)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  show_eoi_data BOOLEAN DEFAULT false,
  eoi_daily_reminders BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_preferences
CREATE POLICY "Users can view own preferences"
ON public.user_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
ON public.user_preferences FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
ON public.user_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add EOI tracking to pledges
ALTER TABLE public.pledges
ADD COLUMN is_eoi BOOLEAN DEFAULT false,
ADD COLUMN eoi_conversion_percentage NUMERIC DEFAULT 0,
ADD COLUMN converted_at TIMESTAMP WITH TIME ZONE;

-- Add EOI tracking to user_votes
ALTER TABLE public.user_votes
ADD COLUMN is_eoi BOOLEAN DEFAULT false,
ADD COLUMN eoi_conversion_percentage NUMERIC DEFAULT 0,
ADD COLUMN converted_at TIMESTAMP WITH TIME ZONE;

-- Function to convert EOI credits to real credits (daily 1% conversion)
CREATE OR REPLACE FUNCTION public.convert_eoi_credits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user RECORD;
  _conversion_amount NUMERIC;
BEGIN
  -- Loop through users with EOI credits
  FOR _user IN
    SELECT user_id, eoi_credits, eoi_conversion_rate
    FROM public.user_credits
    WHERE eoi_credits > 0
  LOOP
    -- Calculate 1% (or custom rate) conversion
    _conversion_amount := _user.eoi_credits * _user.eoi_conversion_rate;

    -- Update credits
    UPDATE public.user_credits
    SET
      eoi_credits = eoi_credits - _conversion_amount,
      total_credits = total_credits + _conversion_amount,
      eoi_last_conversion_at = now(),
      updated_at = now()
    WHERE user_id = _user.user_id;
  END LOOP;
END;
$$;

-- Function to send EOI conversion reminders
CREATE OR REPLACE FUNCTION public.check_eoi_reminders()
RETURNS TABLE(user_id UUID, email TEXT, eoi_credits NUMERIC, conversion_amount NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    uc.user_id,
    p.email,
    uc.eoi_credits,
    (uc.eoi_credits * uc.eoi_conversion_rate) as conversion_amount
  FROM public.user_credits uc
  JOIN public.profiles p ON p.id = uc.user_id
  JOIN public.user_preferences up ON up.user_id = uc.user_id
  WHERE uc.eoi_credits > 0
    AND up.eoi_daily_reminders = true
    AND (uc.eoi_reminder_sent_at IS NULL
         OR uc.eoi_reminder_sent_at < now() - interval '1 day');
END;
$$;

-- Function to toggle EOI conversion for specific pledges
CREATE OR REPLACE FUNCTION public.update_pledge_eoi_conversion(
  _pledge_id UUID,
  _conversion_percentage NUMERIC
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.pledges
  SET
    eoi_conversion_percentage = _conversion_percentage,
    updated_at = now()
  WHERE id = _pledge_id
    AND is_eoi = true;
END;
$$;

COMMENT ON TABLE public.user_preferences IS 'User preferences including EOI data visibility toggle';
COMMENT ON COLUMN public.user_credits.eoi_credits IS 'Expression of Interest credits - ghost credits for testing';
COMMENT ON COLUMN public.user_credits.eoi_conversion_rate IS 'Daily conversion rate from EOI to real credits (default 1% = 0.01)';
COMMENT ON FUNCTION public.convert_eoi_credits IS 'Converts EOI credits to real credits daily at the specified rate (called by cron job)';
COMMENT ON FUNCTION public.check_eoi_reminders IS 'Returns users who need EOI conversion reminders';
COMMENT ON FUNCTION public.update_pledge_eoi_conversion IS 'Updates conversion percentage for EOI pledges in ranked choice system';
