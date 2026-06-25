-- 20260624_wildfire_share_referrer_bp094.sql
-- BP094 Session 4 - Mamba 6.5
-- Adds wildfire_share_referrer_id to profiles table for Wildfire viral tracking.
-- §14 discipline: migration is additive-only and guarded by IF NOT EXISTS.
-- Apply via: psql $LB_DB_URL -f this_file.sql
-- Or via Supabase SQL editor.
-- Founder action required: verify table name before applying.
-- Per §14 gadget: remote DB not queryable from this environment.
-- Fallback: migration targets public.profiles (the primary auth-linked member table).

-- Add wildfire_share_referrer_id to profiles if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'wildfire_share_referrer_id'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN wildfire_share_referrer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

    COMMENT ON COLUMN public.profiles.wildfire_share_referrer_id IS
      'BP094 Wildfire viral tracking. Populated at signup when the new member arrived via '
      'a shared card deep link from mnemosynec.org/how-it-all-works. '
      'The wildfire-credit-referrer edge function credits 5 Marks to this referrer '
      'once the new member''s signup is confirmed.';

    RAISE NOTICE 'wildfire_share_referrer_id column added to public.profiles';
  ELSE
    RAISE NOTICE 'wildfire_share_referrer_id already exists on public.profiles - no change';
  END IF;
END;
$$;

-- Grant: anon read so referrer name can be looked up client-side
-- (profiles.display_name is assumed public; adjust if profiles has RLS blocking anon select)
-- This grant is idempotent.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    GRANT SELECT (id, display_name, wildfire_share_referrer_id)
      ON public.profiles TO anon;
  END IF;
END;
$$;
