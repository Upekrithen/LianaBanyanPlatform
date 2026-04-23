-- ═══════════════════════════════════════════════════════════════════
-- VERIFIED MISSING TABLES — Feb 10, 2026
-- Only creates the 16 tables confirmed MISSING by diagnostic query.
-- Does NOT touch any existing tables.
-- ═══════════════════════════════════════════════════════════════════

-- 1. challenge_submissions
CREATE TABLE IF NOT EXISTS public.challenge_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  challenge_id uuid,
  submission_type text NOT NULL,
  content text,
  file_url text,
  score numeric,
  status text DEFAULT 'submitted',
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "challenge_submissions_select_own" ON public.challenge_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "challenge_submissions_insert_own" ON public.challenge_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. defense_claws_preorders
CREATE TABLE IF NOT EXISTS public.defense_claws_preorders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  quantity integer DEFAULT 1,
  recipient_name text,
  recipient_relationship text,
  shipping_address jsonb,
  payment_status text DEFAULT 'pending',
  payment_intent_id text,
  total_amount numeric NOT NULL DEFAULT 6.00,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.defense_claws_preorders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "defense_claws_select_own" ON public.defense_claws_preorders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "defense_claws_insert_own" ON public.defense_claws_preorders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. legal_defense_fund
CREATE TABLE IF NOT EXISTS public.legal_defense_fund (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT 'General Defense Fund',
  balance numeric DEFAULT 0,
  total_contributed numeric DEFAULT 0,
  total_disbursed numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.legal_defense_fund ENABLE ROW LEVEL SECURITY;
CREATE POLICY "legal_defense_fund_select_all" ON public.legal_defense_fund FOR SELECT USING (true);

-- 4. lifeline_requests
CREATE TABLE IF NOT EXISTS public.lifeline_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  medication_name text NOT NULL,
  dosage text,
  prescriber text,
  pharmacy_preference text,
  urgency text DEFAULT 'standard',
  status text DEFAULT 'submitted',
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.lifeline_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lifeline_requests_select_own" ON public.lifeline_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "lifeline_requests_insert_own" ON public.lifeline_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. meal_orders
CREATE TABLE IF NOT EXISTS public.meal_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_id uuid REFERENCES public.lmd_meals(id),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  servings_requested integer DEFAULT 1,
  status text DEFAULT 'pending',
  special_requests text,
  delivery_notes text,
  total_credits numeric,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.meal_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meal_orders_select_own" ON public.meal_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "meal_orders_insert_own" ON public.meal_orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. position_applications
CREATE TABLE IF NOT EXISTS public.position_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  position_id uuid NOT NULL,
  applicant_id uuid REFERENCES auth.users(id) NOT NULL,
  cover_letter text,
  resume_url text,
  status text DEFAULT 'submitted',
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.position_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "position_apps_select_own" ON public.position_applications FOR SELECT USING (auth.uid() = applicant_id);
CREATE POLICY "position_apps_insert_own" ON public.position_applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);

-- 7. product_images
CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL,
  image_url text NOT NULL,
  is_primary boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_images_select_all" ON public.product_images FOR SELECT USING (true);

-- 8. project_funding
CREATE TABLE IF NOT EXISTS public.project_funding (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL,
  funder_id uuid REFERENCES auth.users(id),
  amount numeric NOT NULL,
  funding_type text DEFAULT 'credit',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.project_funding ENABLE ROW LEVEL SECURITY;
CREATE POLICY "project_funding_select_all" ON public.project_funding FOR SELECT USING (true);

-- 9. project_images
CREATE TABLE IF NOT EXISTS public.project_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL,
  image_url text NOT NULL,
  caption text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "project_images_select_all" ON public.project_images FOR SELECT USING (true);

-- 10. project_invitations
CREATE TABLE IF NOT EXISTS public.project_invitations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL,
  invited_email text NOT NULL,
  invited_by uuid REFERENCES auth.users(id),
  role text DEFAULT 'member',
  status text DEFAULT 'pending',
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "project_invitations_select_auth" ON public.project_invitations FOR SELECT USING (auth.uid() IS NOT NULL);

-- 11. project_lifecycle_stages
CREATE TABLE IF NOT EXISTS public.project_lifecycle_stages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL,
  stage text NOT NULL,
  entered_at timestamptz DEFAULT now(),
  exited_at timestamptz,
  notes text
);
ALTER TABLE public.project_lifecycle_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "project_lifecycle_select_all" ON public.project_lifecycle_stages FOR SELECT USING (true);

-- 12. project_section_images
CREATE TABLE IF NOT EXISTS public.project_section_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id uuid,
  image_url text NOT NULL,
  caption text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.project_section_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "project_section_images_select_all" ON public.project_section_images FOR SELECT USING (true);

-- 13. project_sections
CREATE TABLE IF NOT EXISTS public.project_sections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL,
  title text NOT NULL,
  content text,
  section_type text DEFAULT 'text',
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.project_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "project_sections_select_all" ON public.project_sections FOR SELECT USING (true);

-- 14. project_subdomains
CREATE TABLE IF NOT EXISTS public.project_subdomains (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL,
  subdomain text NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  custom_domain text,
  ssl_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.project_subdomains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "project_subdomains_select_all" ON public.project_subdomains FOR SELECT USING (true);

-- 15. user_referrals
CREATE TABLE IF NOT EXISTS public.user_referrals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid REFERENCES auth.users(id) NOT NULL,
  referred_id uuid REFERENCES auth.users(id),
  referral_code text NOT NULL UNIQUE,
  status text DEFAULT 'pending',
  reward_given boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_referrals_select_own" ON public.user_referrals FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "user_referrals_insert_own" ON public.user_referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- 16. xml_access_credentials
CREATE TABLE IF NOT EXISTS public.xml_access_credentials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  api_key text NOT NULL UNIQUE,
  portal text NOT NULL,
  permissions text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.xml_access_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "xml_creds_select_own" ON public.xml_access_credentials FOR SELECT USING (auth.uid() = user_id);
