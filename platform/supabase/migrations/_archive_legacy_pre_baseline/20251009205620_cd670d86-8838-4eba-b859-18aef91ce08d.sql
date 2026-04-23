-- Fix search_path for existing functions that might be missing it
-- Re-create functions with proper search_path

CREATE OR REPLACE FUNCTION public.auto_subscribe_on_vote()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _project_id uuid;
BEGIN
  -- Get project_id from the vote
  SELECT products.project_id INTO _project_id
  FROM public.production_levels
  JOIN public.products ON products.id = production_levels.product_id
  WHERE production_levels.id = NEW.production_level_id;

  -- Insert subscription if not exists
  INSERT INTO public.user_project_subscriptions (user_id, project_id)
  VALUES (NEW.user_id, _project_id)
  ON CONFLICT (user_id, project_id) DO NOTHING;

  RETURN NEW;
END;
$$;

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

CREATE OR REPLACE FUNCTION public.update_production_level_votes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.production_levels
  SET current_votes = (
    SELECT COALESCE(SUM(amount), 0)
    FROM public.pledges
    WHERE production_level_id = NEW.production_level_id
  )
  WHERE id = NEW.production_level_id;

  RETURN NEW;
END;
$$;

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

  -- Create initial credit entry with 0 credits
  INSERT INTO public.user_credits (user_id, total_credits, used_credits, initial_credit_accepted)
  VALUES (NEW.id, 0, 0, false);

  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  RETURN NEW;
END;
$$;
