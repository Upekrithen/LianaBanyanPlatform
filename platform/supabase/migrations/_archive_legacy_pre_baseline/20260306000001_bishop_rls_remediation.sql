-- =============================================================================
-- BISHOP RLS REMEDIATION MIGRATION
-- Date: March 6, 2026
-- Purpose: Fix the wide-open database left by nuclear migration 20260305000008
-- Strategy:
--   1. Drop all blanket "Unified" policies from the nuclear migration
--   2. Apply proper per-category policies
--   3. Sensitive tables get restricted SELECT
--   4. User-owned tables use their natural ownership column
--   5. Config tables get public READ, admin-only WRITE
-- =============================================================================

-- ==============================
-- STEP 1: DROP ALL BLANKET POLICIES
-- ==============================
-- The nuclear migration created "Unified Auth Access" and "Unified Public Read"
-- on every table. We need to drop these before creating proper policies.

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
-- STEP 2: HELPER FUNCTION - is_admin
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
-- STEP 3: SENSITIVE TABLES — Restricted SELECT
-- These tables should NOT be publicly readable
-- ==============================

-- Financial transaction tables: only the user who owns them
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

-- Ghost profiles: only the ghost creator or admin
ALTER TABLE IF EXISTS public.ghost_profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    DROP POLICY IF EXISTS "ghost_profiles_select" ON public.ghost_profiles;
    CREATE POLICY "ghost_profiles_select" ON public.ghost_profiles
        FOR SELECT USING (auth.uid() = ghost_creator_id OR public.is_admin());
    DROP POLICY IF EXISTS "ghost_profiles_insert" ON public.ghost_profiles;
    CREATE POLICY "ghost_profiles_insert" ON public.ghost_profiles
        FOR INSERT WITH CHECK (auth.uid() = ghost_creator_id);
    DROP POLICY IF EXISTS "ghost_profiles_update" ON public.ghost_profiles;
    CREATE POLICY "ghost_profiles_update" ON public.ghost_profiles
        FOR UPDATE USING (auth.uid() = ghost_creator_id OR public.is_admin());
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
-- STEP 4: USER-OWNED TABLES — Owner access + admin override
-- These tables use user_id as ownership column
-- ==============================

-- Macro for user-owned tables
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
        -- Check if table exists before applying policies
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);

            -- Drop any existing policies
            EXECUTE format('DROP POLICY IF EXISTS "%s_owner_select" ON public.%I', tbl, tbl);
            EXECUTE format('DROP POLICY IF EXISTS "%s_owner_insert" ON public.%I', tbl, tbl);
            EXECUTE format('DROP POLICY IF EXISTS "%s_owner_update" ON public.%I', tbl, tbl);
            EXECUTE format('DROP POLICY IF EXISTS "%s_owner_delete" ON public.%I', tbl, tbl);

            -- Create owner-based policies
            EXECUTE format('CREATE POLICY "%s_owner_select" ON public.%I FOR SELECT USING (auth.uid() = user_id OR public.is_admin())', tbl, tbl);
            EXECUTE format('CREATE POLICY "%s_owner_insert" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id)', tbl, tbl);
            EXECUTE format('CREATE POLICY "%s_owner_update" ON public.%I FOR UPDATE USING (auth.uid() = user_id OR public.is_admin())', tbl, tbl);
            EXECUTE format('CREATE POLICY "%s_owner_delete" ON public.%I FOR DELETE USING (auth.uid() = user_id OR public.is_admin())', tbl, tbl);
        END IF;
    END LOOP;
END $$;

-- Profiles table: public read (name/avatar), owner write
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

-- User roles: admin-only write, self-read
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
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
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ==============================
-- STEP 5: PROJECT-OWNED TABLES — Owner access via project lookup
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

-- Project child tables: public read, owner write (via project lookup)
DO $$
DECLARE
    tbl TEXT;
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

            -- Public read
            EXECUTE format('CREATE POLICY "%s_public_select" ON public.%I FOR SELECT USING (true)', tbl, tbl);

            -- Owner write (via project ownership lookup)
            EXECUTE format('CREATE POLICY "%s_owner_write" ON public.%I FOR ALL USING (
                EXISTS (SELECT 1 FROM public.projects WHERE projects.id = %I.project_id AND projects.owner_id = auth.uid())
                OR public.is_admin()
            )', tbl, tbl, tbl);
        END IF;
    END LOOP;
END $$;

-- ==============================
-- STEP 6: MULTI-PARTY ACCESS TABLES
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

-- IP assets: creator access
ALTER TABLE IF EXISTS public.ip_assets ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    DROP POLICY IF EXISTS "ip_assets_public_select" ON public.ip_assets;
    CREATE POLICY "ip_assets_public_select" ON public.ip_assets
        FOR SELECT USING (true);
    DROP POLICY IF EXISTS "ip_assets_creator_write" ON public.ip_assets;
    CREATE POLICY "ip_assets_creator_write" ON public.ip_assets
        FOR ALL USING (auth.uid() = creator_id OR public.is_admin());
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ==============================
-- STEP 7: CONFIG/REFERENCE TABLES — Public read, admin-only write
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

            -- Public read
            EXECUTE format('CREATE POLICY "%s_public_read" ON public.%I FOR SELECT USING (true)', tbl, tbl);

            -- Admin-only write
            EXECUTE format('CREATE POLICY "%s_admin_write" ON public.%I FOR ALL USING (public.is_admin())', tbl, tbl);
        END IF;
    END LOOP;
END $$;

-- ==============================
-- STEP 8: DEFAULT POLICY FOR REMAINING TABLES
-- Any table not explicitly covered above gets:
--   SELECT: authenticated users only (no anonymous)
--   INSERT/UPDATE/DELETE: authenticated users with matching user_id (if column exists) or admin
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
        -- Check if this table already has non-blanket policies from above
        SELECT COUNT(*) INTO existing_policies
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = tbl.table_name
          AND policyname NOT LIKE 'Unified%';

        -- Only apply defaults to tables without explicit policies
        IF existing_policies = 0 THEN
            -- Enable RLS
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl.table_name);

            -- Check if table has user_id column
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = tbl.table_name
                  AND column_name = 'user_id'
            ) INTO has_user_id;

            IF has_user_id THEN
                -- User-owned: owner read/write + admin
                EXECUTE format('CREATE POLICY "default_select_%s" ON public.%I FOR SELECT USING (auth.uid() = user_id OR public.is_admin())', tbl.table_name, tbl.table_name);
                EXECUTE format('CREATE POLICY "default_insert_%s" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id)', tbl.table_name, tbl.table_name);
                EXECUTE format('CREATE POLICY "default_update_%s" ON public.%I FOR UPDATE USING (auth.uid() = user_id OR public.is_admin())', tbl.table_name, tbl.table_name);
                EXECUTE format('CREATE POLICY "default_delete_%s" ON public.%I FOR DELETE USING (auth.uid() = user_id OR public.is_admin())', tbl.table_name, tbl.table_name);
            ELSE
                -- No user_id: authenticated read, admin write
                EXECUTE format('CREATE POLICY "default_auth_select_%s" ON public.%I FOR SELECT USING (auth.role() = ''authenticated'' OR public.is_admin())', tbl.table_name, tbl.table_name);
                EXECUTE format('CREATE POLICY "default_admin_write_%s" ON public.%I FOR ALL USING (public.is_admin())', tbl.table_name, tbl.table_name);
            END IF;
        END IF;
    END LOOP;
END $$;

-- ==============================
-- VERIFICATION COMMENT
-- ==============================
-- After running this migration:
-- 1. No table should have "Unified Auth Access" or "Unified Public Read" policies
-- 2. Sensitive tables (transactions, ghost profiles) should restrict SELECT to owner
-- 3. User-owned tables should restrict CRUD to the owning user
-- 4. Config tables should allow public read but admin-only write
-- 5. All remaining tables should at minimum require authentication for read access
--
-- To verify: SELECT schemaname, tablename, policyname, cmd, qual FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;
