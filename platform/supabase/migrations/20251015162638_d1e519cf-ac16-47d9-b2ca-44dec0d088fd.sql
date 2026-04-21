-- Add membership stake tracking to user_credits table
ALTER TABLE public.user_credits
ADD COLUMN IF NOT EXISTS membership_stake_paid BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS membership_stake_paid_at TIMESTAMP WITH TIME ZONE;

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_user_credits_membership_stake
ON public.user_credits(user_id, membership_stake_paid);

COMMENT ON COLUMN public.user_credits.membership_stake_paid IS 'Tracks if user has paid $5 LB membership stake for portal access';
COMMENT ON COLUMN public.user_credits.membership_stake_paid_at IS 'Timestamp when membership stake was paid';
