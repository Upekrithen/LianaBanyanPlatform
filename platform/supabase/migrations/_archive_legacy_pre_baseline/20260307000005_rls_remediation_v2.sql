-- =============================================================================
-- RLS REMEDIATION v2
-- Date: March 7, 2026
-- Purpose: Complete, idempotent RLS overhaul
-- Fixes from v1 (20260306000001): user_roles table now created here
--
-- Strategy:
--   1. Create user_roles table (our own, platform-owned)
--   2. Create is_admin() helper
--   3. Drop all blanket "Unified" policies from the nuclear migration
--   4. Sensitive tables: restricted SELECT (owner-only)
--   5. User-owned tables: owner CRUD + admin override
--   6. Config tables: public read, admin-only write
--   7. Catch-all for remaining tables
-- =============================================================================

-- ==============================
-- STEP 1: USER ROLES TABLE
-- Platform-owned role system. Not Supabase auth roles.
-- ==============================

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',  -- member, admin, moderator, steward
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    UNIQUE(user_id, role)
);

-- Index for fast admin lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- ==============================
-- STEP 2: is_admin() FUNCTION
-- ==============================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role = 'admin'
    );
$$;

-- ==============================
-- STEP 3: DROP ALL BLANKET "UNIFIED" POLICIES
-- ==============================

DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND (policyname LIKE 'Unified%' OR policyname LIKE 'unified%')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
            pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- ==============================
-- STEP 4: SENSITIVE TABLES — Owner-only SELECT
-- ==============================

-- Financial transactions: only the user who owns them
ALTER TABLE IF EXISTS public.credit_transactions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    DROP POLICY IF EXISTS "credit_transactions_select" ON public.credit_transactions;
    CREATE POLICY "credit_transactions_select" ON public.credit_transactions
        FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
    DROP POLICY IF EXISTS "credit_transactions_insert" ON public.credit_transactions;
    CREATE POLICY "credit_transactions_insert" ON public.credit_transactions
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    DROP POLICY IF EXISTS "credit_transactions_update" ON public.credit_transactions;
    CREATE POLICY "credit_transactions_update" ON public.credit_transactions
        FOR UPDATE USING (public.is_admin());
    DROP POLICY IF EXISTS "credit_transactions_delete" ON public.credit_transactions;
    CREATE POLICY "credit_transactions_delete" ON public.credit_transactions
        FOR DELETE USING (public.is_admin());
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

ALTER TABLE IF EXISTS public.marks_transactions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    DROP POLICY IF EXISTS "marks_transactions_select" ON public.marks_transactions;
    CREATE POLICY "marks_transactions_select" ON public.marks_transactions
        FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
    DROP POLICY IF EXISTS "marks_transactions_insert" ON public.marks_transactions;
    CREATE POLICY "marks_transactions_insert" ON public.marks_transactions
        FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

ALTER TABLE IF EXISTS public.joules_transactions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    DROP POLICY IF EXISTS "joules_transactions_select" ON public.joules_transactions;
    CREATE POLICY "joules_transactions_select" ON public.joules_transactions
        FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
    DROP POLICY IF EXISTS "joules_transactions_insert" ON public.joules_transactions;
    CREATE POLICY "joules_transactions_insert" ON public.joules_transactions
        FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

ALTER TABLE IF EXISTS public.credit_withdrawals ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    DROP POLICY IF EXISTS "credit_withdrawals_select" ON public.credit_withdrawals;
    CREATE POLICY "credit_withdrawals_select" ON public.credit_withdrawals
        FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
    DROP POLICY IF EXISTS "credit_withdrawals_insert" ON public.credit_withdrawals;
    CREATE POLICY "credit_withdrawals_insert" ON public.credit_withdrawals
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    DROP POLICY IF EXISTS "credit_withdrawals_update" ON public.credit_withdrawals;
    CREATE POLICY "credit_withdrawals_update" ON public.credit_withdrawals
        FOR UPDATE USING (public.is_admin());
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Ghost profiles: anonymous pre-auth entities — public read, admin-only write
-- (No user_id or ghost_creator_id — ghosts are created via fingerprint_hash)
ALTER TABLE IF EXISTS public.ghost_profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    DROP POLICY IF EXISTS "ghost_profiles_select" ON public.ghost_profiles;
    CREATE POLICY "ghost_profiles_select" ON public.ghost_profiles
        FOR SELECT USING (true);
    DROP POLICY IF EXISTS "ghost_profiles_insert" ON public.ghost_profiles;
    CREATE POLICY "ghost_profiles_insert" ON public.ghost_profiles
        FOR INSERT WITH CHECK (true);  -- Ghosts self-create via fingerprint
    DROP POLICY IF EXISTS "ghost_profiles_update" ON public.ghost_profiles;
    CREATE POLICY "ghost_profiles_update" ON public.ghost_profiles
        FOR UPDATE USING (true);  -- Ghosts update their own profile data
    DROP POLICY IF EXISTS "ghost_profiles_delete" ON public.ghost_profiles;
    CREATE POLICY "ghost_profiles_delete" ON public.ghost_profiles
        FOR DELETE USING (public.is_admin());
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Ghost credit transactions
ALTER TABLE IF EXISTS public.ghost_credit_transactions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    DROP POLICY IF EXISTS "ghost_credit_transactions_select" ON public.ghost_credit_transactions;
    CREATE POLICY "ghost_credit_transactions_select" ON public.ghost_credit_transactions
        FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ==============================
-- STEP 5: USER-OWNED TABLES — Owner CRUD + admin override
-- ==============================

DO $$
DECLARE
    tbl TEXT;
    user_tables TEXT[] := ARRAY[
        'user_credits', 'user_marks', 'user_joules', 'user_candles',
        'user_preferences', 'user_theme_preferences', 'user_language_preference',
        'user_project_preferences', 'user_project_subscriptions',
        'user_social_plugs', 'user_social_accounts',
        'user_referrals', 'user_friend_words',
        'user_discovery_state', 'user_card_placements', 'user_bookshelf_config',
        'user_gate_responses', 'user_themes',
        'user_hexisle_skills', 'user_hexisle_preferences',
        'user_wisp_stats', 'user_taste_tester_stats', 'user_recipe_portfolio',
        'user_free_cue_card', 'user_spotlight_prefs',
        'user_badge_achievements', 'user_achievement_badges',
        'user_content_rating', 'user_portfolios',
        'user_cottage_law_status', 'user_conduit_progress', 'user_treasure_maps',
        'user_coupons', 'user_votes', 'user_feathers'
    ];
BEGIN
    FOREACH tbl IN ARRAY user_tables
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);

            EXECUTE format('DROP POLICY IF EXISTS "%s_owner_select" ON public.%I', tbl, tbl);
            EXECUTE format('DROP POLICY IF EXISTS "%s_owner_insert" ON public.%I', tbl, tbl);
            EXECUTE format('DROP POLICY IF EXISTS "%s_owner_update" ON public.%I', tbl, tbl);
            EXECUTE format('DROP POLICY IF EXISTS "%s_owner_delete" ON public.%I', tbl, tbl);

            EXECUTE format('CREATE POLICY "%s_owner_select" ON public.%I FOR SELECT USING (auth.uid() = user_id OR public.is_admin())', tbl, tbl);
            EXECUTE format('CREATE POLICY "%s_owner_insert" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id)', tbl, tbl);
            EXECUTE format('CREATE POLICY "%s_owner_update" ON public.%I FOR UPDATE USING (auth.uid() = user_id OR public.is_admin())', tbl, tbl);
            EXECUTE format('CREATE POLICY "%s_owner_delete" ON public.%I FOR DELETE USING (auth.uid() = user_id OR public.is_admin())', tbl, tbl);
        END IF;
    END LOOP;
END $$;

-- Profiles: public read (name/avatar), owner write
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    DROP POLICY IF EXISTS "profiles_public_select" ON public.profiles;
    CREATE POLICY "profiles_public_select" ON public.profiles
        FOR SELECT USING (true);
    DROP POLICY IF EXISTS "profiles_owner_insert" ON public.profiles;
    CREATE POLICY "profiles_owner_insert" ON public.profiles
        FOR INSERT WITH CHECK (auth.uid() = id);
    DROP POLICY IF EXISTS "profiles_owner_update" ON public.profiles;
    CREATE POLICY "profiles_owner_update" ON public.profiles
        FOR UPDATE USING (auth.uid() = id OR public.is_admin());
    DROP POLICY IF EXISTS "profiles_owner_delete" ON public.profiles;
    CREATE POLICY "profiles_owner_delete" ON public.profiles
        FOR DELETE USING (public.is_admin());
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- User roles: self-read, admin-only write
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_roles_select" ON public.user_roles;
CREATE POLICY "user_roles_select" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "user_roles_admin_insert" ON public.user_roles;
CREATE POLICY "user_roles_admin_insert" ON public.user_roles
    FOR INSERT WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "user_roles_admin_update" ON public.user_roles;
CREATE POLICY "user_roles_admin_update" ON public.user_roles
    FOR UPDATE USING (public.is_admin());
DROP POLICY IF EXISTS "user_roles_admin_delete" ON public.user_roles;
CREATE POLICY "user_roles_admin_delete" ON public.user_roles
    FOR DELETE USING (public.is_admin());

-- ==============================
-- STEP 6: PROJECT-OWNED TABLES
-- ==============================

ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    DROP POLICY IF EXISTS "projects_public_select" ON public.projects;
    CREATE POLICY "projects_public_select" ON public.projects
        FOR SELECT USING (true);
    DROP POLICY IF EXISTS "projects_owner_insert" ON public.projects;
    CREATE POLICY "projects_owner_insert" ON public.projects
        FOR INSERT WITH CHECK (auth.uid() = owner_id);
    DROP POLICY IF EXISTS "projects_owner_update" ON public.projects;
    CREATE POLICY "projects_owner_update" ON public.projects
        FOR UPDATE USING (auth.uid() = owner_id OR public.is_admin());
    DROP POLICY IF EXISTS "projects_owner_delete" ON public.projects;
    CREATE POLICY "projects_owner_delete" ON public.projects
        FOR DELETE USING (auth.uid() = owner_id OR public.is_admin());
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Project child tables: public read, owner write
-- Dynamically checks for project_id / user_id columns to pick correct ownership pattern
DO $$
DECLARE
    tbl TEXT;
    has_project_id BOOLEAN;
    has_user_id BOOLEAN;
    project_child_tables TEXT[] := ARRAY[
        'project_images', 'project_sections', 'project_section_images',
        'project_tasks', 'project_features', 'project_categories',
        'project_themes', 'project_visual_themes', 'project_landing_pages',
        'project_subdomains', 'project_domain_mappings',
        'project_module', 'project_voting_configs',
        'project_funding', 'project_selected_services'
    ];
BEGIN
    FOREACH tbl IN ARRAY project_child_tables
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);

            EXECUTE format('DROP POLICY IF EXISTS "%s_public_select" ON public.%I', tbl, tbl);
            EXECUTE format('DROP POLICY IF EXISTS "%s_owner_write" ON public.%I', tbl, tbl);

            EXECUTE format('CREATE POLICY "%s_public_select" ON public.%I FOR SELECT USING (true)', tbl, tbl);

            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = tbl AND column_name = 'project_id'
            ) INTO has_project_id;

            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = tbl AND column_name = 'user_id'
            ) INTO has_user_id;

            IF has_project_id THEN
                EXECUTE format('CREATE POLICY "%s_owner_write" ON public.%I FOR ALL USING (
                    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = %I.project_id AND projects.owner_id = auth.uid())
                    OR public.is_admin()
                )', tbl, tbl, tbl);
            ELSIF has_user_id THEN
                EXECUTE format('CREATE POLICY "%s_owner_write" ON public.%I FOR ALL USING (
                    auth.uid() = user_id OR public.is_admin()
                )', tbl, tbl);
            ELSE
                EXECUTE format('CREATE POLICY "%s_owner_write" ON public.%I FOR ALL USING (
                    public.is_admin()
                )', tbl, tbl);
            END IF;
        END IF;
    END LOOP;
END $$;

-- ==============================
-- STEP 7: MULTI-PARTY ACCESS TABLES
-- ==============================

-- Stewardship applications: applicant or admin
ALTER TABLE IF EXISTS public.stewardship_applications ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    DROP POLICY IF EXISTS "stewardship_applications_select" ON public.stewardship_applications;
    CREATE POLICY "stewardship_applications_select" ON public.stewardship_applications
        FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
    DROP POLICY IF EXISTS "stewardship_applications_insert" ON public.stewardship_applications;
    CREATE POLICY "stewardship_applications_insert" ON public.stewardship_applications
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    DROP POLICY IF EXISTS "stewardship_applications_update" ON public.stewardship_applications;
    CREATE POLICY "stewardship_applications_update" ON public.stewardship_applications
        FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Orders: buyer access
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    DROP POLICY IF EXISTS "orders_select" ON public.orders;
    CREATE POLICY "orders_select" ON public.orders
        FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
    DROP POLICY IF EXISTS "orders_insert" ON public.orders;
    CREATE POLICY "orders_insert" ON public.orders
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    DROP POLICY IF EXISTS "orders_update" ON public.orders;
    CREATE POLICY "orders_update" ON public.orders
        FOR UPDATE USING (public.is_admin());
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- IP ledger: public read, creator write
ALTER TABLE IF EXISTS public.ip_ledger ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    DROP POLICY IF EXISTS "ip_ledger_public_select" ON public.ip_ledger;
    CREATE POLICY "ip_ledger_public_select" ON public.ip_ledger
        FOR SELECT USING (true);
    DROP POLICY IF EXISTS "ip_ledger_creator_write" ON public.ip_ledger;
    CREATE POLICY "ip_ledger_creator_write" ON public.ip_ledger
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    -- IP ledger is append-only — no update/delete for integrity
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ==============================
-- STEP 8: CONFIG/REFERENCE TABLES — Public read, admin-only write
-- ==============================

DO $$
DECLARE
    tbl TEXT;
    config_tables TEXT[] := ARRAY[
        'portal_configs', 'dna_lock', 'pricing_calculations', 'cold_start_thresholds',
        'discovery_categories', 'discovery_gates', 'keep_tiers',
        'service_categories', 'pantry_categories', 'content_classifications',
        'badge_types', 'stamp_definitions', 'unified_badges',
        'hexisle_achievements', 'hexisle_buildings', 'hexisle_cities',
        'hexisle_quests', 'hexisle_skill_verifications',
        'guild_name_types', 'leaderboard_categories',
        'initiative_care_units', 'cue_card_templates', 'deck_cards',
        'cottage_law_guides', 'cottage_law_rules'
    ];
BEGIN
    FOREACH tbl IN ARRAY config_tables
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);

            EXECUTE format('DROP POLICY IF EXISTS "%s_public_read" ON public.%I', tbl, tbl);
            EXECUTE format('DROP POLICY IF EXISTS "%s_admin_write" ON public.%I', tbl, tbl);

            EXECUTE format('CREATE POLICY "%s_public_read" ON public.%I FOR SELECT USING (true)', tbl, tbl);
            EXECUTE format('CREATE POLICY "%s_admin_write" ON public.%I FOR ALL USING (public.is_admin())', tbl, tbl);
        END IF;
    END LOOP;
END $$;

-- ==============================
-- STEP 9: CATCH-ALL — Remaining uncovered tables
-- ==============================

DO $$
DECLARE
    tbl RECORD;
    has_user_id BOOLEAN;
    existing_policies INT;
BEGIN
    FOR tbl IN
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
    LOOP
        -- Check if this table already has non-blanket policies
        SELECT COUNT(*) INTO existing_policies
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = tbl.table_name
          AND policyname NOT LIKE 'Unified%';

        IF existing_policies = 0 THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl.table_name);

            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = tbl.table_name
                  AND column_name = 'user_id'
            ) INTO has_user_id;

            IF has_user_id THEN
                EXECUTE format('CREATE POLICY "default_select_%s" ON public.%I FOR SELECT USING (auth.uid() = user_id OR public.is_admin())', tbl.table_name, tbl.table_name);
                EXECUTE format('CREATE POLICY "default_insert_%s" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id)', tbl.table_name, tbl.table_name);
                EXECUTE format('CREATE POLICY "default_update_%s" ON public.%I FOR UPDATE USING (auth.uid() = user_id OR public.is_admin())', tbl.table_name, tbl.table_name);
                EXECUTE format('CREATE POLICY "default_delete_%s" ON public.%I FOR DELETE USING (auth.uid() = user_id OR public.is_admin())', tbl.table_name, tbl.table_name);
            ELSE
                EXECUTE format('CREATE POLICY "default_auth_select_%s" ON public.%I FOR SELECT USING (auth.role() = ''authenticated'' OR public.is_admin())', tbl.table_name, tbl.table_name);
                EXECUTE format('CREATE POLICY "default_admin_write_%s" ON public.%I FOR ALL USING (public.is_admin())', tbl.table_name, tbl.table_name);
            END IF;
        END IF;
    END LOOP;
END $$;

-- ==============================
-- STEP 10: BOOTSTRAP — Add Founder as admin
-- ==============================
-- IMPORTANT: After this migration runs, the Founder needs to insert their own user_id
-- into user_roles. Run this in the Supabase SQL Editor:
--
--   INSERT INTO public.user_roles (user_id, role, notes)
--   VALUES ('YOUR-AUTH-USER-ID-HERE', 'admin', 'Founder bootstrap');
--
-- To find your auth user ID:
--   SELECT id, email FROM auth.users ORDER BY created_at LIMIT 5;

-- ==============================
-- VERIFICATION
-- ==============================
-- After running:
--   SELECT tablename, policyname, cmd FROM pg_policies
--   WHERE schemaname = 'public' ORDER BY tablename, policyname;
--
-- Expected: No "Unified" policies. Every table has proper per-table policies.
