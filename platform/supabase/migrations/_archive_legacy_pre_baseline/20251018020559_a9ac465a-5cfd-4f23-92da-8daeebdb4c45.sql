-- Add marketplace investor track preference to user_preferences
ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS marketplace_investor_track text CHECK (marketplace_investor_track IN ('product_only', 'investor'));
