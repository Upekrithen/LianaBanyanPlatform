-- ═══════════════════════════════════════════════════════════════════
-- MISSING PLATFORM TABLES — Feb 10, 2026
-- Creates all tables referenced in TypeScript code that don't yet
-- have CREATE TABLE statements in existing migrations.
-- ═══════════════════════════════════════════════════════════════════

-- ─── PROFILES (core, referenced everywhere) ───
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  bio text,
  website text,
  location text,
  postal_code text,
  member_since timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ─── MEMBER MEDALLION COLLECTION ───
CREATE TABLE IF NOT EXISTS public.member_medallion_collection (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  medallion_id uuid,
  project_id uuid,
  medallion_type text NOT NULL DEFAULT 'member',
  chalk_level integer NOT NULL DEFAULT 1,
  earned_date timestamptz DEFAULT now(),
  display_order integer,
  is_featured boolean DEFAULT false,
  sponsor_attribution text,
  ip_ledger_entry_id uuid,
  blockchain_tx text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.member_medallion_collection ENABLE ROW LEVEL SECURITY;
CREATE POLICY "medallions_select_own" ON public.member_medallion_collection FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "medallions_insert_system" ON public.member_medallion_collection FOR INSERT WITH CHECK (true);

-- ─── GOVERNANCE: PROPOSALS, VOTES, STAR CHAMBER ───
CREATE TABLE IF NOT EXISTS public.proposals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  proposal_type text NOT NULL DEFAULT 'general',
  status text NOT NULL DEFAULT 'draft',
  created_by uuid REFERENCES auth.users(id),
  voting_starts_at timestamptz,
  voting_ends_at timestamptz,
  required_majority numeric DEFAULT 0.51,
  votes_for integer DEFAULT 0,
  votes_against integer DEFAULT 0,
  votes_abstain integer DEFAULT 0,
  result text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "proposals_select_all" ON public.proposals FOR SELECT USING (true);
CREATE POLICY "proposals_insert_auth" ON public.proposals FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE TABLE IF NOT EXISTS public.votes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid REFERENCES public.proposals(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  vote text NOT NULL CHECK (vote IN ('for', 'against', 'abstain')),
  weight numeric DEFAULT 1,
  reason text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(proposal_id, user_id)
);
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "votes_select_all" ON public.votes FOR SELECT USING (true);
CREATE POLICY "votes_insert_own" ON public.votes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.votable_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  item_type text NOT NULL,
  item_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.star_chamber_verifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type text NOT NULL,
  content_id uuid NOT NULL,
  ai_reviewer_1 text,
  ai_reviewer_2 text,
  ai_score_1 numeric,
  ai_score_2 numeric,
  human_reviewer_id uuid REFERENCES auth.users(id),
  human_decision text,
  final_status text DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now()
);

-- ─── CONTRACTS & ORDERS ───
CREATE TABLE IF NOT EXISTS public.contracts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  contract_type text NOT NULL DEFAULT 'service',
  status text NOT NULL DEFAULT 'draft',
  creator_id uuid REFERENCES auth.users(id),
  counterparty_id uuid REFERENCES auth.users(id),
  project_id uuid,
  terms jsonb DEFAULT '{}',
  value_credits numeric DEFAULT 0,
  value_joules numeric DEFAULT 0,
  signed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contracts_select_parties" ON public.contracts FOR SELECT USING (auth.uid() = creator_id OR auth.uid() = counterparty_id);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  project_id uuid,
  product_id uuid,
  order_type text NOT NULL DEFAULT 'purchase',
  status text NOT NULL DEFAULT 'pending',
  quantity integer DEFAULT 1,
  total_credits numeric DEFAULT 0,
  shipping_address jsonb,
  tracking_info jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── HEXISLE TABLES ───
CREATE TABLE IF NOT EXISTS public.hexisle_cities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  island_number integer NOT NULL,
  biome text DEFAULT 'temperate',
  difficulty integer DEFAULT 1,
  is_unlocked boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hexisle_player_state (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
  current_city_id uuid REFERENCES public.hexisle_cities(id),
  level integer DEFAULT 1,
  experience integer DEFAULT 0,
  inventory jsonb DEFAULT '[]',
  unlocked_cities uuid[] DEFAULT '{}',
  achievements jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hexisle_quests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id uuid REFERENCES public.hexisle_cities(id),
  title text NOT NULL,
  description text,
  quest_type text DEFAULT 'main',
  difficulty integer DEFAULT 1,
  reward_credits integer DEFAULT 0,
  reward_marks integer DEFAULT 0,
  reward_joules integer DEFAULT 0,
  prerequisites jsonb DEFAULT '[]',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hexisle_player_quests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  quest_id uuid REFERENCES public.hexisle_quests(id) NOT NULL,
  status text DEFAULT 'available',
  progress jsonb DEFAULT '{}',
  started_at timestamptz,
  completed_at timestamptz,
  UNIQUE(user_id, quest_id)
);

CREATE TABLE IF NOT EXISTS public.hexisle_buildings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id uuid REFERENCES public.hexisle_cities(id),
  name text NOT NULL,
  building_type text NOT NULL,
  description text,
  level integer DEFAULT 1,
  capacity integer DEFAULT 10,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- ─── LET'S MAKE DINNER (LMD) ───
CREATE TABLE IF NOT EXISTS public.lmd_chefs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  chef_name text NOT NULL,
  specialties text[],
  bio text,
  rating numeric DEFAULT 0,
  total_meals integer DEFAULT 0,
  is_active boolean DEFAULT true,
  postal_code text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lmd_meals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  chef_id uuid REFERENCES public.lmd_chefs(id) NOT NULL,
  title text NOT NULL,
  description text,
  cuisine_type text,
  servings integer DEFAULT 4,
  price_credits numeric NOT NULL,
  dietary_tags text[],
  available_date date,
  available_time text,
  status text DEFAULT 'available',
  image_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.meal_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_id uuid REFERENCES public.lmd_meals(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  servings_requested integer DEFAULT 1,
  status text DEFAULT 'pending',
  special_requests text,
  delivery_notes text,
  total_credits numeric,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lmd_charity_accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  balance_credits numeric DEFAULT 0,
  total_donated numeric DEFAULT 0,
  total_distributed numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ─── GOLDEN KEY / TREASURE SYSTEM ───
CREATE TABLE IF NOT EXISTS public.user_feathers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  feather_type text NOT NULL,
  count integer DEFAULT 0,
  source text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.golden_key_multipliers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key_type text NOT NULL,
  multiplier numeric NOT NULL DEFAULT 1.0,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.treasure_winners (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  treasure_type text NOT NULL,
  prize_description text,
  claimed boolean DEFAULT false,
  claimed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.key_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  key_code text NOT NULL,
  is_valid boolean DEFAULT false,
  response text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.golden_ticket_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  ticket_id uuid,
  attempt_code text,
  is_correct boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ─── SPONSOR SYSTEM ───
CREATE TABLE IF NOT EXISTS public.sponsor_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
  tier text NOT NULL DEFAULT 'seedling',
  total_sponsored numeric DEFAULT 0,
  total_memberships_funded integer DEFAULT 0,
  patent_selections uuid[],
  is_trailblazer boolean DEFAULT false,
  badge_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sponsor_commitments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id uuid REFERENCES public.sponsor_profiles(id) NOT NULL,
  amount numeric NOT NULL,
  tier text NOT NULL,
  payment_intent_id text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sponsored_recipients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id uuid REFERENCES public.sponsor_profiles(id) NOT NULL,
  recipient_user_id uuid REFERENCES auth.users(id),
  recipient_email text,
  membership_activated boolean DEFAULT false,
  activated_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bracket_standings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id uuid REFERENCES public.sponsor_profiles(id) NOT NULL,
  bracket_name text NOT NULL,
  position integer DEFAULT 0,
  score numeric DEFAULT 0,
  period text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.johnny_appleseed_offers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id uuid REFERENCES public.sponsor_profiles(id) NOT NULL,
  offer_type text NOT NULL,
  quantity integer DEFAULT 1,
  remaining integer DEFAULT 1,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ─── HELP WANTED / SERVICES ───
CREATE TABLE IF NOT EXISTS public.help_wanted_listings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  posted_by uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  budget_credits numeric,
  budget_marks numeric,
  location text,
  postal_code text,
  status text DEFAULT 'open',
  applications_count integer DEFAULT 0,
  deadline timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.help_wanted_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "help_wanted_select_all" ON public.help_wanted_listings FOR SELECT USING (true);
CREATE POLICY "help_wanted_insert_auth" ON public.help_wanted_listings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ─── REFERRALS ───
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid REFERENCES auth.users(id) NOT NULL,
  referred_email text NOT NULL,
  referred_user_id uuid REFERENCES auth.users(id),
  status text DEFAULT 'pending',
  reward_credits numeric DEFAULT 0,
  reward_marks numeric DEFAULT 0,
  converted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_referrals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid REFERENCES auth.users(id) NOT NULL,
  referred_id uuid REFERENCES auth.users(id),
  referral_code text NOT NULL UNIQUE,
  status text DEFAULT 'pending',
  reward_given boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ─── PROJECT EXTENSIONS ───
CREATE TABLE IF NOT EXISTS public.project_backings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  amount_credits numeric NOT NULL,
  joules_earned numeric DEFAULT 0,
  backing_stage text DEFAULT 'established',
  multiplier_used numeric DEFAULT 1,
  backed_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_lifecycle_stages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL,
  stage text NOT NULL,
  entered_at timestamptz DEFAULT now(),
  exited_at timestamptz,
  notes text
);

CREATE TABLE IF NOT EXISTS public.project_funding (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL,
  funder_id uuid REFERENCES auth.users(id),
  amount numeric NOT NULL,
  funding_type text DEFAULT 'credit',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS public.project_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL,
  image_url text NOT NULL,
  caption text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_sections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL,
  title text NOT NULL,
  content text,
  section_type text DEFAULT 'text',
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_section_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id uuid REFERENCES public.project_sections(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL,
  image_url text NOT NULL,
  is_primary boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_subdomains (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL,
  subdomain text NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  custom_domain text,
  ssl_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- ─── SOCIAL / HERALD ───
CREATE TABLE IF NOT EXISTS public.member_social_accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  platform text NOT NULL,
  platform_user_id text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  username text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, platform)
);

CREATE TABLE IF NOT EXISTS public.member_scheduled_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  social_account_id uuid REFERENCES public.member_social_accounts(id),
  content text NOT NULL,
  media_urls text[],
  scheduled_for timestamptz NOT NULL,
  posted_at timestamptz,
  status text DEFAULT 'scheduled',
  platform text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ─── POSITION APPLICATIONS ───
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

-- ─── CHALLENGE SUBMISSIONS ───
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

-- ─── DEFENSE KLAUS / LIFELINE ───
CREATE TABLE IF NOT EXISTS public.legal_defense_fund (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT 'General Defense Fund',
  balance numeric DEFAULT 0,
  total_contributed numeric DEFAULT 0,
  total_disbursed numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

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

-- ─── GHOST WORLD ───
CREATE TABLE IF NOT EXISTS public.ghost_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL UNIQUE,
  ghost_name text,
  pages_visited text[] DEFAULT '{}',
  golden_keys_found text[] DEFAULT '{}',
  duration_seconds integer DEFAULT 0,
  converted_to_user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  last_active_at timestamptz DEFAULT now()
);

-- ─── PORTAL ACCESS ───
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

-- ─── INNOVATION LOG (for Fly on the Wall) ───
CREATE TABLE IF NOT EXISTS public.innovation_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  innovation_number integer NOT NULL,
  title text NOT NULL,
  description text,
  category text,
  patent_bag text,
  status text DEFAULT 'documented',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.current_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_key text NOT NULL UNIQUE,
  metric_value numeric NOT NULL,
  metric_label text,
  updated_at timestamptz DEFAULT now()
);

-- ─── VIEWS ───
CREATE OR REPLACE VIEW public.v_current_transparency_metrics AS
SELECT
  (SELECT COUNT(*) FROM public.innovation_log) AS total_innovations,
  (SELECT COUNT(*) FROM public.proposals WHERE status = 'active') AS active_proposals,
  (SELECT COUNT(*) FROM public.profiles WHERE is_active = true) AS active_members,
  (SELECT COUNT(*) FROM public.orders WHERE status = 'completed') AS completed_orders,
  (SELECT COALESCE(SUM(total_credits), 0) FROM public.orders WHERE status = 'completed') AS total_transaction_volume,
  now() AS snapshot_at;

CREATE OR REPLACE VIEW public.initiative_stats AS
SELECT
  i.id,
  i.name,
  i.initiative_slug AS slug,
  i.description,
  (SELECT COUNT(*) FROM public.profiles) AS member_count,
  0 AS order_count
FROM public.initiatives i;
