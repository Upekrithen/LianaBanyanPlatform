-- =============================================================================
-- RLS Phase 3b: Enable RLS on ALL remaining public tables
-- =============================================================================
-- Phase 3a (20260319200009) replaced blanket policies with table-specific ones.
-- This migration ensures every single public table has RLS ENABLED, so no table
-- is inadvertently wide-open. Tables that already have RLS enabled are unaffected.
--
-- Additionally adds public SELECT policies to locked-out tables (RLS enabled
-- but no SELECT policy = application can't read them).
-- =============================================================================

-- STEP 1: Enable RLS on every public table that doesn't already have it
DO $$
DECLARE
    t RECORD;
BEGIN
    FOR t IN
        SELECT c.relname AS tablename
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relkind = 'r'
          AND NOT c.relrowsecurity
    LOOP
        RAISE NOTICE 'Enabling RLS on: %', t.tablename;
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
    END LOOP;
END;
$$;

-- =============================================================================
-- STEP 2: Add public SELECT policies to tables that have RLS but no SELECT policy
-- Without a SELECT policy, the table is completely inaccessible.
-- =============================================================================

DO $$
DECLARE
    t RECORD;
    has_select BOOLEAN;
BEGIN
    FOR t IN
        SELECT c.relname AS tablename
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relkind = 'r'
          AND c.relrowsecurity
    LOOP
        -- Check if any SELECT or ALL policy exists
        SELECT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE schemaname = 'public'
              AND tablename = t.tablename
              AND (cmd = 'r' OR cmd = '*')
        ) INTO has_select;

        IF NOT has_select THEN
            RAISE NOTICE 'Adding authenticated SELECT to locked-out table: %', t.tablename;
            EXECUTE format(
                'CREATE POLICY "Authenticated read %s" ON public.%I FOR SELECT TO authenticated USING (true)',
                t.tablename, t.tablename
            );
        END IF;
    END LOOP;
END;
$$;

-- =============================================================================
-- STEP 3: Specific fixes for high-risk tables found in Phase 3 audit
-- These need user_id owner checks, not just blanket authenticated access.
-- =============================================================================

-- ghost_profiles: users own their own ghost profile
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'ghost_profiles')
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'ghost_profiles'
                     AND column_name = 'user_id') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated read ghost_profiles" ON ghost_profiles';
        EXECUTE '
            CREATE POLICY "Owner read ghost_profiles" ON ghost_profiles
                FOR SELECT USING (auth.uid() = user_id OR public.is_admin())
        ';
        EXECUTE 'DROP POLICY IF EXISTS "Owner write ghost_profiles" ON ghost_profiles';
        EXECUTE '
            CREATE POLICY "Owner write ghost_profiles" ON ghost_profiles
                FOR ALL USING (auth.uid() = user_id OR public.is_admin())
        ';
    END IF;
END;
$$;

-- hexisle_player_state: users own their own game state
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'hexisle_player_state')
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'hexisle_player_state'
                     AND column_name = 'user_id') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated read hexisle_player_state" ON hexisle_player_state';
        EXECUTE '
            CREATE POLICY "Owner access hexisle_player_state" ON hexisle_player_state
                FOR ALL USING (auth.uid() = user_id OR public.is_admin())
        ';
    END IF;
END;
$$;

-- hexisle_player_quests: users own their own quests
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'hexisle_player_quests')
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'hexisle_player_quests'
                     AND column_name = 'user_id') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated read hexisle_player_quests" ON hexisle_player_quests';
        EXECUTE '
            CREATE POLICY "Owner access hexisle_player_quests" ON hexisle_player_quests
                FOR ALL USING (auth.uid() = user_id OR public.is_admin())
        ';
    END IF;
END;
$$;

-- map_progress: users own their own map progress
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'map_progress')
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'map_progress'
                     AND column_name = 'user_id') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated read map_progress" ON map_progress';
        EXECUTE '
            CREATE POLICY "Owner access map_progress" ON map_progress
                FOR ALL USING (auth.uid() = user_id OR public.is_admin())
        ';
    END IF;
END;
$$;

-- referrals: users own their own referrals
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'referrals')
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'referrals'
                     AND column_name = 'referrer_id') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated read referrals" ON referrals';
        EXECUTE '
            CREATE POLICY "Owner read referrals" ON referrals
                FOR SELECT USING (auth.uid() = referrer_id OR public.is_admin())
        ';
        EXECUTE 'DROP POLICY IF EXISTS "Owner insert referrals" ON referrals';
        EXECUTE '
            CREATE POLICY "Owner insert referrals" ON referrals
                FOR INSERT WITH CHECK (auth.uid() = referrer_id)
        ';
    END IF;
END;
$$;

-- sponsor_profiles: users own their own sponsor profile
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'sponsor_profiles')
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'sponsor_profiles'
                     AND column_name = 'user_id') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated read sponsor_profiles" ON sponsor_profiles';
        EXECUTE '
            CREATE POLICY "Owner access sponsor_profiles" ON sponsor_profiles
                FOR ALL USING (auth.uid() = user_id OR public.is_admin())
        ';
    END IF;
END;
$$;

-- user_feathers: users own their own feathers
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'user_feathers')
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'user_feathers'
                     AND column_name = 'user_id') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated read user_feathers" ON user_feathers';
        EXECUTE '
            CREATE POLICY "Owner access user_feathers" ON user_feathers
                FOR ALL USING (auth.uid() = user_id OR public.is_admin())
        ';
    END IF;
END;
$$;

-- deck_card_collection: users own their own card collection
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'deck_card_collection')
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'deck_card_collection'
                     AND column_name = 'user_id') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated read deck_card_collection" ON deck_card_collection';
        EXECUTE '
            CREATE POLICY "Owner access deck_card_collection" ON deck_card_collection
                FOR ALL USING (auth.uid() = user_id OR public.is_admin())
        ';
    END IF;
END;
$$;

-- deck_card_drops: users own their own drops
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'deck_card_drops')
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'deck_card_drops'
                     AND column_name = 'user_id') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated read deck_card_drops" ON deck_card_drops';
        EXECUTE '
            CREATE POLICY "Owner access deck_card_drops" ON deck_card_drops
                FOR ALL USING (auth.uid() = user_id OR public.is_admin())
        ';
    END IF;
END;
$$;

-- ghost_pouch: users own their own ghost pouch
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'ghost_pouch')
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'ghost_pouch'
                     AND column_name = 'user_id') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated read ghost_pouch" ON ghost_pouch';
        EXECUTE '
            CREATE POLICY "Owner access ghost_pouch" ON ghost_pouch
                FOR ALL USING (auth.uid() = user_id OR public.is_admin())
        ';
    END IF;
END;
$$;

-- =============================================================================
-- STEP 4: Public-read config/reference tables
-- These are system reference data that should be readable by all but admin-writable
-- =============================================================================

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'hexisle_buildings',
            'hexisle_cities',
            'hexisle_quests',
            'leaderboard_categories',
            'research_tier_definitions',
            'service_node_types',
            'pantry_ingredients_master',
            'cottage_law_rules',
            'innovation_log',
            'current_metrics',
            'votable_items'
        ])
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format(
                'DROP POLICY IF EXISTS "Authenticated read %s" ON public.%I',
                tbl, tbl
            );
            EXECUTE format(
                'CREATE POLICY "Public read %s" ON public.%I FOR SELECT USING (true)',
                tbl, tbl
            );
        END IF;
    END LOOP;
END;
$$;

-- =============================================================================
-- STEP 5: Admin-only tables (system internals, legal, SEC)
-- =============================================================================

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'legal_formation_tracking',
            'sec_dangerous_terms',
            'star_chamber_verifications',
            'patent_allocation_pools',
            'golden_key_multipliers',
            'icing_pool',
            'icing_recipe_stats',
            'charitable_matching_pool',
            'swoop_master_fund',
            'beacon_folders',
            'bracket_standings',
            'defense_klaus_lawyer_applications',
            'defense_klaus_lawyer_bounties',
            'documentation_contributor_stats',
            'lmd_charity_accounts',
            'lmd_chefs',
            'lmd_meals',
            'sponsor_commitments',
            'sponsored_recipients',
            'treasure_winners',
            'uspto_filed_application',
            'uspto_filed_innovation_range'
        ])
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format(
                'DROP POLICY IF EXISTS "Authenticated read %s" ON public.%I',
                tbl, tbl
            );
            EXECUTE format(
                'CREATE POLICY "Admin access %s" ON public.%I FOR ALL USING (public.is_admin())',
                tbl, tbl
            );
        END IF;
    END LOOP;
END;
$$;

-- =============================================================================
-- STEP 6: User interaction tables (durin doors, golden tickets, key submissions)
-- =============================================================================

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'durin_door_attempts',
            'durin_door_unlocks',
            'golden_ticket_attempts',
            'key_submissions',
            'map_beacons'
        ])
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'public' AND table_name = tbl)
           AND EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_schema = 'public' AND table_name = tbl
                         AND column_name = 'user_id') THEN
            EXECUTE format(
                'DROP POLICY IF EXISTS "Authenticated read %s" ON public.%I',
                tbl, tbl
            );
            EXECUTE format(
                'CREATE POLICY "Owner access %s" ON public.%I FOR ALL USING (auth.uid() = user_id OR public.is_admin())',
                tbl, tbl
            );
        END IF;
    END LOOP;
END;
$$;

-- johnny_appleseed_offers: public read, admin write
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'johnny_appleseed_offers') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated read johnny_appleseed_offers" ON johnny_appleseed_offers';
        EXECUTE '
            CREATE POLICY "Public read johnny_appleseed_offers" ON johnny_appleseed_offers
                FOR SELECT USING (true)
        ';
    END IF;
END;
$$;

-- deck_card_forges: admin write, public read
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'deck_card_forges') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated read deck_card_forges" ON deck_card_forges';
        EXECUTE '
            CREATE POLICY "Public read deck_card_forges" ON deck_card_forges
                FOR SELECT USING (true)
        ';
    END IF;
END;
$$;

-- =============================================================================
-- AUDIT COMPLETE — Every public table now has:
-- 1. RLS ENABLED (Step 1)
-- 2. At least one SELECT policy (Step 2 catch-all)
-- 3. Appropriate write policies (Steps 3-6 + Phase 3a migration)
-- =============================================================================
