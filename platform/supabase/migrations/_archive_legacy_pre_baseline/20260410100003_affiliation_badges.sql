-- K387: Affiliation Badge System (Innovation #2234, B093)

CREATE TABLE IF NOT EXISTS public.affiliation_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_id uuid NOT NULL,
  group_name text NOT NULL DEFAULT '',
  group_type text NOT NULL CHECK (group_type IN ('professional','business','sports','gaming','casual','political','religious')),
  display_enabled boolean NOT NULL DEFAULT true,
  equipped_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, group_id)
);

CREATE TABLE IF NOT EXISTS public.affiliation_visibility_prefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('professional','business','sports','gaming','casual','political','religious')),
  show_on_profile boolean NOT NULL DEFAULT true,
  show_others boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, category)
);

CREATE OR REPLACE FUNCTION public.seed_affiliation_prefs(p_user_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO public.affiliation_visibility_prefs (user_id, category, show_on_profile, show_others)
  VALUES
    (p_user_id, 'professional', true, true),
    (p_user_id, 'business', true, true),
    (p_user_id, 'sports', true, true),
    (p_user_id, 'gaming', true, true),
    (p_user_id, 'casual', true, true),
    (p_user_id, 'political', false, false),
    (p_user_id, 'religious', false, false)
  ON CONFLICT (user_id, category) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.set_badge_default_visibility()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.group_type IN ('political', 'religious') THEN
    NEW.display_enabled := false;
  ELSE
    NEW.display_enabled := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_badge_default_visibility
  BEFORE INSERT ON public.affiliation_badges
  FOR EACH ROW
  EXECUTE FUNCTION public.set_badge_default_visibility();

ALTER TABLE public.affiliation_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliation_visibility_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges" ON public.affiliation_badges
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON public.affiliation_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own badges" ON public.affiliation_badges
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own badges" ON public.affiliation_badges
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Public can view displayed badges" ON public.affiliation_badges
  FOR SELECT USING (display_enabled = true);

CREATE POLICY "Users can view own prefs" ON public.affiliation_visibility_prefs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own prefs" ON public.affiliation_visibility_prefs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own prefs" ON public.affiliation_visibility_prefs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_affiliation_badges_user ON public.affiliation_badges(user_id);
CREATE INDEX idx_affiliation_badges_group ON public.affiliation_badges(group_id);
CREATE INDEX idx_affiliation_badges_type ON public.affiliation_badges(group_type);
CREATE INDEX idx_affiliation_visibility_user ON public.affiliation_visibility_prefs(user_id);
