-- Check if an email is already registered in auth.users.
-- Used by DenkenAuthGate to auto-route between Sign In / Sign Up flows.
-- SECURITY DEFINER: runs with owner privileges to read auth.users.
-- B080.

CREATE OR REPLACE FUNCTION public.check_email_registered(email_input text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = auth, public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = lower(email_input)
  );
$$;

-- Allow anon + authenticated to call it (used on the auth page before sign-in)
GRANT EXECUTE ON FUNCTION public.check_email_registered(text) TO anon;
GRANT EXECUTE ON FUNCTION public.check_email_registered(text) TO authenticated;
