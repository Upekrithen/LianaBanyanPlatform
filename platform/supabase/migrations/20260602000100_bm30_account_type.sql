-- BM30 Scope 27: Add account_type to profiles
-- personal = individual member
-- business = organization / company account
-- professional = Guild Master tier

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_type TEXT NOT NULL DEFAULT 'personal'
    CHECK (account_type IN ('personal', 'business', 'professional'));

COMMENT ON COLUMN public.profiles.account_type IS
  'personal = individual member; business = organization; professional = Guild Master tier';
