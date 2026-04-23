-- Add creator_type and creator_external_url to profiles for Creator Showcase
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_type TEXT
  CHECK (creator_type IS NULL OR creator_type IN ('physical', 'art', 'food', 'music', 'business'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_external_url TEXT;
