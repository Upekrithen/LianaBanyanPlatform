-- Create user profiles table for SSO members
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create user credits/wallet table
CREATE TABLE IF NOT EXISTS public.user_credits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_credits numeric DEFAULT 100.00 NOT NULL,
  used_credits numeric DEFAULT 0 NOT NULL,
  available_credits numeric GENERATED ALWAYS AS (total_credits - used_credits) STORED,
  initial_credit_accepted boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Create votes table to track user votes on production levels
CREATE TABLE IF NOT EXISTS public.user_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  production_level_id uuid NOT NULL REFERENCES public.production_levels(id) ON DELETE CASCADE,
  vote_amount numeric NOT NULL CHECK (vote_amount > 0),
  source text DEFAULT 'initial_credit',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, production_level_id)
);

-- Update QR codes table for access tracking
ALTER TABLE public.qr_codes
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS scanned_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_scanned_at timestamp with time zone;

-- Create QR code scans tracking table
CREATE TABLE IF NOT EXISTS public.qr_scans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_code_id uuid NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  scanned_at timestamp with time zone DEFAULT now(),
  ip_address text,
  user_agent text
);

-- Create Kickstarter integration tracking
CREATE TABLE IF NOT EXISTS public.kickstarter_pledges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  backer_email text NOT NULL,
  pledge_amount numeric NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  kickstarter_pledge_id text UNIQUE,
  synced_at timestamp with time zone DEFAULT now(),
  is_processed boolean DEFAULT false
);

-- Enable RLS on all new tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kickstarter_pledges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles (users can only see their own)
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for user_credits (users can only see their own)
CREATE POLICY "Users can view own credits"
  ON public.user_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits"
  ON public.user_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_votes (users can manage their own votes)
CREATE POLICY "Users can view own votes"
  ON public.user_votes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own votes"
  ON public.user_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes"
  ON public.user_votes FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for qr_scans (public can insert, users can view their own)
CREATE POLICY "Anyone can record QR scans"
  ON public.qr_scans FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own scans"
  ON public.qr_scans FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for kickstarter_pledges (users can view their own)
CREATE POLICY "Users can view own pledges"
  ON public.kickstarter_pledges FOR SELECT
  USING (auth.uid() = user_id);

-- Create trigger function for new user profile creation
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

  -- Create initial credit entry
  INSERT INTO public.user_credits (user_id, total_credits, used_credits, initial_credit_accepted)
  VALUES (NEW.id, 100.00, 0, false);

  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update user votes and credits
CREATE OR REPLACE FUNCTION public.update_user_vote_totals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update used credits
  UPDATE public.user_credits
  SET used_credits = (
    SELECT COALESCE(SUM(vote_amount), 0)
    FROM public.user_votes
    WHERE user_id = NEW.user_id
  ),
  updated_at = now()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- Create trigger for vote tracking
DROP TRIGGER IF EXISTS on_user_vote_changed ON public.user_votes;
CREATE TRIGGER on_user_vote_changed
  AFTER INSERT OR UPDATE ON public.user_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_user_vote_totals();
