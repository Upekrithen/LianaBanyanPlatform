-- BP095 M05: License selections table for download gate
CREATE TABLE IF NOT EXISTS public.license_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text,
  user_agent text,
  license_tier text NOT NULL CHECK (
    license_tier IN ('SSPL_PLEDGE', 'APACHE_ENDORSEMENT', 'SANDERS_FORK_TIER2')
  ),
  version_downloaded text NOT NULL,
  sha256_verified text,
  selected_at timestamptz NOT NULL DEFAULT now(),
  member_user_id uuid REFERENCES auth.users(id)
);

ALTER TABLE public.license_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY ins_anon ON public.license_selections
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY sel_self ON public.license_selections
  FOR SELECT TO authenticated
  USING (auth.uid() = member_user_id);

CREATE INDEX IF NOT EXISTS idx_license_selections_tier ON public.license_selections(license_tier);
CREATE INDEX IF NOT EXISTS idx_license_selections_member ON public.license_selections(member_user_id);
CREATE INDEX IF NOT EXISTS idx_license_selections_selected_at ON public.license_selections(selected_at);
