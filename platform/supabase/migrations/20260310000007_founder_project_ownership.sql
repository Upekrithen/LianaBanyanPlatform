-- ================================================================
-- FOUNDER PROJECT OWNERSHIP — Auto-assign on first sign-up
-- ================================================================
-- When either Founder email signs up, claim all unowned projects.
-- Uses a trigger on auth.users insert. Idempotent.
-- ================================================================

-- Function: claim unowned projects for Founder accounts
CREATE OR REPLACE FUNCTION public.claim_founder_projects()
RETURNS TRIGGER AS $$
BEGIN
  -- Only fire for known Founder emails
  IF NEW.email IN ('upekrithen@gmail.com', 'support@lianabanyan.com') THEN
    UPDATE public.projects
    SET owner_id = NEW.id,
        user_id = NEW.id,
        updated_at = NOW()
    WHERE owner_id IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on new user creation
DROP TRIGGER IF EXISTS claim_founder_projects_trigger ON auth.users;
CREATE TRIGGER claim_founder_projects_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.claim_founder_projects();

-- Also: if Founder already exists, run the claim now
DO $$
DECLARE
  founder_id UUID;
BEGIN
  SELECT id INTO founder_id FROM auth.users
  WHERE email IN ('upekrithen@gmail.com', 'support@lianabanyan.com')
  LIMIT 1;

  IF founder_id IS NOT NULL THEN
    UPDATE public.projects
    SET owner_id = founder_id,
        user_id = founder_id,
        updated_at = NOW()
    WHERE owner_id IS NULL;
  END IF;
END $$;
