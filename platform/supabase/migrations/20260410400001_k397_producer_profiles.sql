-- Migration: Create producer_profiles table
-- Session: K397

CREATE TABLE IF NOT EXISTS public.producer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  business_type text NOT NULL CHECK (business_type IN (
    'print_shop', 'screen_printer', 'embroidery',
    '3d_printing', 'cnc', 'general_manufacturing', 'other'
  )),
  capabilities text[] NOT NULL DEFAULT '{}',
  location_city text,
  location_state text,
  location_country text NOT NULL DEFAULT 'US',
  turnaround_days int NOT NULL DEFAULT 5,
  min_quantity int NOT NULL DEFAULT 50,
  pricing_json jsonb DEFAULT '{}',
  verified boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  rating numeric(3,2) NOT NULL DEFAULT 0.00,
  total_orders int NOT NULL DEFAULT 0,
  total_units int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  portfolio_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_producer_user UNIQUE (user_id)
);

-- Indexes
CREATE INDEX idx_producer_profiles_status ON public.producer_profiles(status);
CREATE INDEX idx_producer_profiles_business_type ON public.producer_profiles(business_type);
CREATE INDEX idx_producer_profiles_capabilities ON public.producer_profiles USING GIN(capabilities);
CREATE INDEX idx_producer_profiles_location ON public.producer_profiles(location_state, location_city);

-- RLS
ALTER TABLE public.producer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own producer profile"
  ON public.producer_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own producer profile"
  ON public.producer_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own producer profile"
  ON public.producer_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view active verified producers"
  ON public.producer_profiles FOR SELECT
  USING (status = 'active' AND verified = true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_producer_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_producer_updated_at
  BEFORE UPDATE ON public.producer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_producer_updated_at();

-- Seed a cue card template for producer onboarding
-- cue_card_templates has: template_type, initiative_slug, title, subtitle, body_text, is_active (no route_url or category)
INSERT INTO public.cue_card_templates (
  template_type, initiative_slug, title, subtitle, body_text, is_active
) VALUES (
  'initiative',
  'decentralized-factory',
  'We Need Producers',
  'Join as a local producer — /become-a-producer',
  'Got a print shop? CNC machine? 3D printer? Join Liana Banyan as a Producer. Claim orders from the community, set your pricing, earn at Cost+20%.',
  true
) ON CONFLICT DO NOTHING;
