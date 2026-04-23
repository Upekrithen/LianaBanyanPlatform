-- Add theme and language preferences to existing user_preferences table
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS preferred_theme TEXT DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'es'));
