-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'project_owner', 'user');

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Add owner_id to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create project_funding table for managing credit pots
CREATE TABLE IF NOT EXISTS public.project_funding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE UNIQUE,
  total_pot numeric NOT NULL DEFAULT 0 CHECK (total_pot >= 0),
  allocated_credits numeric NOT NULL DEFAULT 0 CHECK (allocated_credits >= 0),
  available_pot numeric GENERATED ALWAYS AS (total_pot - allocated_credits) STORED,
  credit_per_user numeric NOT NULL DEFAULT 100.00,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on project_funding
ALTER TABLE public.project_funding ENABLE ROW LEVEL SECURITY;

-- Create project_invitations table
CREATE TABLE IF NOT EXISTS public.project_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  email text NOT NULL,
  qr_code_id uuid REFERENCES public.qr_codes(id) ON DELETE SET NULL,
  invited_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  credits_allocated numeric DEFAULT 100.00,
  accepted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  UNIQUE (project_id, email)
);

-- Enable RLS on project_invitations
ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for project_funding
CREATE POLICY "Project owners can view own project funding"
  ON public.project_funding FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_funding.project_id
        AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can update own project funding"
  ON public.project_funding FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_funding.project_id
        AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can insert project funding"
  ON public.project_funding FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_funding.project_id
        AND projects.owner_id = auth.uid()
    )
  );

-- RLS policies for project_invitations
CREATE POLICY "Project owners can manage invitations"
  ON public.project_invitations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_invitations.project_id
        AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own invitations"
  ON public.project_invitations FOR SELECT
  USING (
    email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

-- Update handle_new_user to NOT automatically give credits
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  );
  
  -- Create initial credit entry with 0 credits (will be allocated via invitation)
  INSERT INTO public.user_credits (user_id, total_credits, used_credits, initial_credit_accepted)
  VALUES (NEW.id, 0, 0, false);
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Function to process invitation acceptance and allocate credits
CREATE OR REPLACE FUNCTION public.accept_invitation(
  _invitation_id uuid,
  _qr_scan_email text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _invitation record;
  _user_id uuid;
  _funding record;
  _result jsonb;
BEGIN
  -- Get the current user
  _user_id := auth.uid();
  
  -- Get invitation details
  SELECT * INTO _invitation
  FROM public.project_invitations
  WHERE id = _invitation_id
    AND status = 'pending'
    AND email = (SELECT email FROM public.profiles WHERE id = _user_id);
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;
  
  -- Verify QR code email match
  IF _invitation.email != _qr_scan_email THEN
    RETURN jsonb_build_object('success', false, 'error', 'Email does not match QR scan entry');
  END IF;
  
  -- Get project funding
  SELECT * INTO _funding
  FROM public.project_funding
  WHERE project_id = _invitation.project_id;
  
  IF NOT FOUND OR _funding.available_pot < _invitation.credits_allocated THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient funds in project pot');
  END IF;
  
  -- Update invitation status
  UPDATE public.project_invitations
  SET status = 'accepted',
      accepted_at = now()
  WHERE id = _invitation_id;
  
  -- Allocate credits to user
  UPDATE public.user_credits
  SET total_credits = total_credits + _invitation.credits_allocated,
      initial_credit_accepted = true,
      updated_at = now()
  WHERE user_id = _user_id;
  
  -- Update project funding
  UPDATE public.project_funding
  SET allocated_credits = allocated_credits + _invitation.credits_allocated,
      updated_at = now()
  WHERE project_id = _invitation.project_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'credits_allocated', _invitation.credits_allocated,
    'message', 'Credits successfully allocated'
  );
END;
$$;