-- BM30 Scope 28: LinkedIn credential verification columns

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS linkedin_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS linkedin_headline TEXT;

COMMENT ON COLUMN public.profiles.linkedin_verified IS
  'True when the member has connected and verified their LinkedIn profile via OAuth.';
COMMENT ON COLUMN public.profiles.linkedin_headline IS
  'LinkedIn professional headline, stored after OAuth callback.';
