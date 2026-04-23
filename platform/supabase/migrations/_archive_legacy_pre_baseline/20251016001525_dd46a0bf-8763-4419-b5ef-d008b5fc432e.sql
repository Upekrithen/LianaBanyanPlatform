-- Free 30-Day Membership System
-- Anyone can sign up without credit card, inactive after 30 days unless confirmed

-- Add membership tracking columns to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS membership_status text DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS membership_activated_at timestamptz,
ADD COLUMN IF NOT EXISTS membership_expires_at timestamptz,
ADD COLUMN IF NOT EXISTS membership_reminder_sent_at timestamptz,
ADD COLUMN IF NOT EXISTS membership_confirmation_token text;

-- Create index for membership queries
CREATE INDEX IF NOT EXISTS idx_profiles_membership_status ON profiles(membership_status);
CREATE INDEX IF NOT EXISTS idx_profiles_membership_expires_at ON profiles(membership_expires_at);

-- Function to activate free 30-day membership
CREATE OR REPLACE FUNCTION activate_free_membership(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE profiles
  SET
    membership_status = 'active',
    membership_activated_at = now(),
    membership_expires_at = now() + interval '30 days',
    membership_reminder_sent_at = NULL,
    membership_confirmation_token = encode(gen_random_bytes(32), 'hex')
  WHERE id = _user_id;
END;
$$;

-- Function to extend membership (when user confirms)
CREATE OR REPLACE FUNCTION extend_membership(_confirmation_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _profile RECORD;
BEGIN
  -- Find profile with matching token
  SELECT * INTO _profile
  FROM profiles
  WHERE membership_confirmation_token = _confirmation_token
    AND membership_status = 'active';

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid or expired confirmation token'
    );
  END IF;

  -- Extend membership by 30 days from current expiration
  UPDATE profiles
  SET
    membership_expires_at = membership_expires_at + interval '30 days',
    membership_reminder_sent_at = NULL,
    membership_confirmation_token = encode(gen_random_bytes(32), 'hex')
  WHERE id = _profile.id;

  RETURN jsonb_build_object(
    'success', true,
    'new_expiration', (membership_expires_at + interval '30 days')::text
  );
END;
$$;

-- Function to check and deactivate expired memberships
CREATE OR REPLACE FUNCTION deactivate_expired_memberships()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE profiles
  SET membership_status = 'expired'
  WHERE membership_status = 'active'
    AND membership_expires_at < now();
END;
$$;

-- Function to get users needing reminder (7 days before expiration)
CREATE OR REPLACE FUNCTION get_membership_reminder_candidates()
RETURNS TABLE(
  user_id uuid,
  email text,
  expires_at timestamptz,
  confirmation_token text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.email,
    p.membership_expires_at,
    p.membership_confirmation_token
  FROM profiles p
  WHERE p.membership_status = 'active'
    AND p.membership_expires_at <= (now() + interval '7 days')
    AND p.membership_expires_at > now()
    AND (p.membership_reminder_sent_at IS NULL
         OR p.membership_reminder_sent_at < (now() - interval '6 days'));
END;
$$;

-- Function to mark reminder as sent
CREATE OR REPLACE FUNCTION mark_reminder_sent(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE profiles
  SET membership_reminder_sent_at = now()
  WHERE id = _user_id;
END;
$$;

-- Automatically activate membership on signup
CREATE OR REPLACE FUNCTION auto_activate_membership()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only auto-activate if not already set
  IF NEW.membership_status IS NULL OR NEW.membership_status = 'inactive' THEN
    NEW.membership_status := 'active';
    NEW.membership_activated_at := now();
    NEW.membership_expires_at := now() + interval '30 days';
    NEW.membership_confirmation_token := encode(gen_random_bytes(32), 'hex');
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_activate_membership_trigger
BEFORE INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION auto_activate_membership();

-- Add comment explaining the system
COMMENT ON COLUMN profiles.membership_status IS 'Membership status: active, expired, inactive';
COMMENT ON COLUMN profiles.membership_expires_at IS 'Free 30-day membership expiration date';
COMMENT ON COLUMN profiles.membership_confirmation_token IS 'Token for extending membership via email confirmation';
