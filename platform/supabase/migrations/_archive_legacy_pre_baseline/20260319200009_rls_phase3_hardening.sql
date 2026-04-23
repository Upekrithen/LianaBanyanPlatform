-- =============================================================================
-- RLS Phase 3: Comprehensive Hardening — Session 51
-- =============================================================================
-- Removes the blanket "Baseline Auth Write Access" policy that was applied to
-- ALL public tables by 20260305000002_security_advisor_rls_fix.sql.
-- Replaces with table-specific write policies based on actual requirements.
-- =============================================================================

-- =============================================================================
-- STEP 1: Drop "Baseline Auth Write Access" from ALL public tables
-- This policy grants any authenticated user full CRUD on every table.
-- =============================================================================

DO $$
DECLARE
    t RECORD;
BEGIN
    FOR t IN
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format(
            'DROP POLICY IF EXISTS "Baseline Auth Write Access" ON public.%I',
            t.tablename
        );
    END LOOP;
END;
$$;

-- =============================================================================
-- STEP 2: Add admin-only write policies for system/config tables
-- These tables should never be writable by regular users.
-- =============================================================================

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'dna_lock',
            'pricing_calculations',
            'platform_metrics',
            'ip_ledger',
            'content_versions',
            'sync_targets',
            'cephas_content_registry',
            'production_runs',
            'admin_notifications',
            'crown_letter_invitations',
            'aaron_pronunciations',
            'store_templates',
            'geographic_demand_signals',
            'cold_start_thresholds',
            'onboarding_cohorts',
            'scheduled_resources',
            'company_milestones',
            'blockchain_audit_log',
            'blockchain_gas_costs',
            'contract_scale_negotiations',
            'livekit_room_configs',
            'ghost_deployment_configs',
            'ghost_jwt_bridges',
            'keep_leases',
            'keep_sub_leases',
            'npc_shopkeepers',
            'local_listings',
            'qr_cue_cards',
            'print_bounties',
            'manufacturing_process_modules',
            'process_pioneer_ledger',
            'donation_commitments',
            'donation_commitment_transactions',
            'member_content_feeds',
            'patent_allocation_pools',
            'sponsorships',
            'sponsorship_splits',
            'sponsor_badges',
            'patent_bucket_allocations',
            'cloth_pouches',
            'swoop_initiatives',
            'swoop_activation_log',
            'hexisle_waitlist',
            'proteus_anchors',
            'proteus_manufacturing_compat',
            'proteus_transformations',
            'thought_experiments',
            'vector_change_effects',
            'experiment_snapshots',
            'experiment_extensions',
            'reality_snapshots',
            'co_factor_templates'
        ])
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format(
                'DROP POLICY IF EXISTS "Admin write %s" ON public.%I',
                tbl, tbl
            );
            EXECUTE format(
                'CREATE POLICY "Admin write %s" ON public.%I FOR ALL USING (public.is_admin())',
                tbl, tbl
            );
        END IF;
    END LOOP;
END;
$$;

-- =============================================================================
-- STEP 3: Fix admin_notifications — INSERT was "WITH CHECK (TRUE)"
-- Should only be insertable by service_role (edge functions), not end users
-- =============================================================================

DROP POLICY IF EXISTS "Service role inserts" ON admin_notifications;
CREATE POLICY "Service role inserts admin_notifications" ON admin_notifications
    FOR INSERT WITH CHECK (
        public.is_admin()
        OR (SELECT current_setting('role', true)) = 'service_role'
    );

-- =============================================================================
-- STEP 4: Fix creator_invites — original permissive UPDATE USING(true) policy
-- =============================================================================

DROP POLICY IF EXISTS "Authenticated users can update their invite" ON creator_invites;

-- =============================================================================
-- STEP 5: Fix project_drafts — original permissive INSERT/UPDATE policies
-- =============================================================================

DROP POLICY IF EXISTS "Anyone can upsert drafts" ON project_drafts;
DROP POLICY IF EXISTS "Anyone can update drafts" ON project_drafts;

-- =============================================================================
-- STEP 6: Owner-based write policies for user-owned tables
-- Users can only modify their own rows.
-- =============================================================================

-- profiles: users update their own profile
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Users update own profile" ON profiles';
        EXECUTE '
            CREATE POLICY "Users update own profile" ON profiles
                FOR UPDATE USING (auth.uid() = id)
        ';
    END IF;
END;
$$;

-- pledges: users create pledges with their own user_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'pledges')
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'pledges'
                     AND column_name = 'user_id') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Users create own pledges" ON pledges';
        EXECUTE '
            CREATE POLICY "Users create own pledges" ON pledges
                FOR INSERT WITH CHECK (auth.uid() = user_id)
        ';
        EXECUTE 'DROP POLICY IF EXISTS "Users read own pledges" ON pledges';
        EXECUTE '
            CREATE POLICY "Users read own pledges" ON pledges
                FOR SELECT USING (auth.uid() = user_id OR public.is_admin())
        ';
    END IF;
END;
$$;

-- proposals: users create proposals
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'proposals')
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'proposals'
                     AND column_name = 'user_id') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Users create own proposals" ON proposals';
        EXECUTE '
            CREATE POLICY "Users create own proposals" ON proposals
                FOR INSERT WITH CHECK (auth.uid() = user_id)
        ';
    END IF;
END;
$$;

-- votes: users cast their own votes
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'votes')
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'votes'
                     AND column_name = 'user_id') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Users cast own votes" ON votes';
        EXECUTE '
            CREATE POLICY "Users cast own votes" ON votes
                FOR INSERT WITH CHECK (auth.uid() = user_id)
        ';
    END IF;
END;
$$;

-- help_wanted_listings: users create their own listings
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'help_wanted_listings')
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'help_wanted_listings'
                     AND column_name = 'user_id') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Users create own help wanted" ON help_wanted_listings';
        EXECUTE '
            CREATE POLICY "Users create own help wanted" ON help_wanted_listings
                FOR INSERT WITH CHECK (auth.uid() = user_id)
        ';
        EXECUTE 'DROP POLICY IF EXISTS "Users update own help wanted" ON help_wanted_listings';
        EXECUTE '
            CREATE POLICY "Users update own help wanted" ON help_wanted_listings
                FOR UPDATE USING (auth.uid() = user_id)
        ';
    END IF;
END;
$$;

-- concentric_circle_feedback: users submit their own feedback
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'concentric_circle_feedback')
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'concentric_circle_feedback'
                     AND column_name = 'user_id') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Users submit own feedback" ON concentric_circle_feedback';
        EXECUTE '
            CREATE POLICY "Users submit own feedback" ON concentric_circle_feedback
                FOR INSERT WITH CHECK (auth.uid() = user_id)
        ';
    END IF;
END;
$$;

-- task_log: users manage their own tasks
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'task_log')
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'task_log'
                     AND column_name = 'user_id') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Users manage own tasks" ON task_log';
        EXECUTE '
            CREATE POLICY "Users manage own tasks" ON task_log
                FOR ALL USING (auth.uid() = user_id)
        ';
    END IF;
END;
$$;

-- =============================================================================
-- STEP 7: Analytics/tracking tables — authenticated INSERT only (no update/delete)
-- These tables capture user actions; users should not modify historical records.
-- =============================================================================

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'spotlight_impressions',
            'cue_card_share_clicks',
            'social_shares',
            'atti_engagement_clicks',
            'atti_engagement_progress'
        ])
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format(
                'DROP POLICY IF EXISTS "Authenticated insert %s" ON public.%I',
                tbl, tbl
            );
            EXECUTE format(
                'CREATE POLICY "Authenticated insert %s" ON public.%I FOR INSERT TO authenticated WITH CHECK (true)',
                tbl, tbl
            );
        END IF;
    END LOOP;
END;
$$;

-- =============================================================================
-- STEP 8: Swoop voting — users can vote but not manipulate system tables
-- =============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'swoop_votes')
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'swoop_votes'
                     AND column_name = 'user_id') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Users cast swoop votes" ON swoop_votes';
        EXECUTE '
            CREATE POLICY "Users cast swoop votes" ON swoop_votes
                FOR INSERT WITH CHECK (auth.uid() = user_id)
        ';
        EXECUTE 'DROP POLICY IF EXISTS "Users read swoop votes" ON swoop_votes';
        EXECUTE '
            CREATE POLICY "Users read swoop votes" ON swoop_votes
                FOR SELECT USING (true)
        ';
    END IF;
END;
$$;

-- =============================================================================
-- STEP 9: User preference/portfolio tables — owner-only access
-- =============================================================================

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'user_spotlight_prefs',
            'user_portfolios',
            'portfolio_inventory',
            'portfolio_notes',
            'portfolio_maps',
            'portfolio_contacts',
            'portfolio_achievements',
            'session_logs',
            'user_free_cue_card',
            'user_conduit_progress',
            'user_candles',
            'user_friend_words',
            'gate_passages',
            'user_content_rating',
            'user_treasure_maps',
            'treasure_map_completions',
            'user_hexisle_skills',
            'user_hexisle_preferences',
            'user_project_preferences'
        ])
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'public' AND table_name = tbl)
           AND EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_schema = 'public' AND table_name = tbl
                         AND column_name = 'user_id') THEN
            EXECUTE format(
                'DROP POLICY IF EXISTS "Owner access %s" ON public.%I',
                tbl, tbl
            );
            EXECUTE format(
                'CREATE POLICY "Owner access %s" ON public.%I FOR ALL USING (auth.uid() = user_id)',
                tbl, tbl
            );
        END IF;
    END LOOP;
END;
$$;

-- =============================================================================
-- STEP 10: Governance tables — read-only for users, admin write
-- round_tables, governance_events, guilds, tribes already have some policies
-- but the blanket write was the main vulnerability
-- =============================================================================

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'round_tables',
            'round_table_sessions',
            'governance_events',
            'guilds',
            'tribes',
            'doctrine_branches',
            'doctrinal_positions',
            'areopagus_dictionary',
            'practical_questions',
            'practical_positions',
            'archaeological_evidence',
            'scholar_credentials'
        ])
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format(
                'DROP POLICY IF EXISTS "Admin manage %s" ON public.%I',
                tbl, tbl
            );
            EXECUTE format(
                'CREATE POLICY "Admin manage %s" ON public.%I FOR ALL USING (public.is_admin())',
                tbl, tbl
            );
        END IF;
    END LOOP;
END;
$$;

-- mic_requests: authenticated users can create requests for themselves
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'mic_requests')
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'mic_requests'
                     AND column_name = 'user_id') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Users create mic requests" ON mic_requests';
        EXECUTE '
            CREATE POLICY "Users create mic requests" ON mic_requests
                FOR INSERT WITH CHECK (auth.uid() = user_id)
        ';
    END IF;
END;
$$;

-- guild_memberships / tribe_memberships: users manage their own memberships
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY['guild_memberships', 'tribe_memberships'])
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'public' AND table_name = tbl)
           AND EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_schema = 'public' AND table_name = tbl
                         AND column_name = 'user_id') THEN
            EXECUTE format(
                'DROP POLICY IF EXISTS "Users manage own %s" ON public.%I',
                tbl, tbl
            );
            EXECUTE format(
                'CREATE POLICY "Users manage own %s" ON public.%I FOR ALL USING (auth.uid() = user_id)',
                tbl, tbl
            );
        END IF;
    END LOOP;
END;
$$;

-- =============================================================================
-- STEP 11: Production/manufacturing tables — admin write, public read
-- =============================================================================

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'production_waves',
            'production_nodes',
            'wave_node_assignments',
            'wave_preorder_slots',
            'wave_premium_funds',
            'crew_call_assignments'
        ])
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format(
                'DROP POLICY IF EXISTS "Admin manage %s" ON public.%I',
                tbl, tbl
            );
            EXECUTE format(
                'CREATE POLICY "Admin manage %s" ON public.%I FOR ALL USING (public.is_admin())',
                tbl, tbl
            );
        END IF;
    END LOOP;
END;
$$;

-- =============================================================================
-- STEP 12: Financial tables — admin-only write
-- =============================================================================

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'credit_transactions',
            'user_marks',
            'marks_transactions',
            'user_joules',
            'joules_transactions',
            'user_credits',
            'eoi_vesting_schedules',
            'lb_funding_pool',
            'crowdfunding_pledges',
            'crowdfunding_platform_connections',
            'crowdfunding_sync_log',
            'kickstarter_sync_log',
            'derivative_royalties',
            'derivative_compliance_audits',
            'ledger_transactions',
            'defense_klaus_vouchers',
            'defense_klaus_lawyer_bounties',
            'defense_klaus_lawyer_applications',
            'defense_klaus_referrals'
        ])
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format(
                'DROP POLICY IF EXISTS "Admin manage %s" ON public.%I',
                tbl, tbl
            );
            EXECUTE format(
                'CREATE POLICY "Admin manage %s" ON public.%I FOR ALL USING (public.is_admin())',
                tbl, tbl
            );
        END IF;
    END LOOP;
END;
$$;

-- =============================================================================
-- STEP 13: Ambassador tables — users manage their own ambassador data
-- =============================================================================

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'ambassador_recruits',
            'ambassador_social_links',
            'ambassador_testimonials',
            'ambassador_certifications',
            'ambassador_business_plans',
            'ambassador_mentorships'
        ])
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'public' AND table_name = tbl)
           AND EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_schema = 'public' AND table_name = tbl
                         AND column_name = 'ambassador_id') THEN
            EXECUTE format(
                'DROP POLICY IF EXISTS "Ambassador own %s" ON public.%I',
                tbl, tbl
            );
            EXECUTE format(
                'CREATE POLICY "Ambassador own %s" ON public.%I FOR ALL USING (auth.uid() = ambassador_id)',
                tbl, tbl
            );
        END IF;
    END LOOP;
END;
$$;

-- ambassadors table: users can become ambassadors
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'ambassadors')
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'ambassadors'
                     AND column_name = 'user_id') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Users manage own ambassador" ON ambassadors';
        EXECUTE '
            CREATE POLICY "Users manage own ambassador" ON ambassadors
                FOR ALL USING (auth.uid() = user_id)
        ';
    END IF;
END;
$$;

-- =============================================================================
-- STEP 14: Paper quiz tables — authenticated INSERT for attempts
-- =============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'paper_quiz_attempts')
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'paper_quiz_attempts'
                     AND column_name = 'user_id') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Users create own attempts" ON paper_quiz_attempts';
        EXECUTE '
            CREATE POLICY "Users create own attempts" ON paper_quiz_attempts
                FOR INSERT WITH CHECK (auth.uid() = user_id)
        ';
        EXECUTE 'DROP POLICY IF EXISTS "Users read own attempts" ON paper_quiz_attempts';
        EXECUTE '
            CREATE POLICY "Users read own attempts" ON paper_quiz_attempts
                FOR SELECT USING (auth.uid() = user_id OR public.is_admin())
        ';
    END IF;
END;
$$;

-- paper_read_completions: users track their own reading
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'paper_read_completions')
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'paper_read_completions'
                     AND column_name = 'user_id') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Users track own reading" ON paper_read_completions';
        EXECUTE '
            CREATE POLICY "Users track own reading" ON paper_read_completions
                FOR ALL USING (auth.uid() = user_id)
        ';
    END IF;
END;
$$;

-- paper_quizzes, paper_quiz_questions: admin-only write, public read
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY['paper_quizzes', 'paper_quiz_questions'])
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format(
                'DROP POLICY IF EXISTS "Admin manage %s" ON public.%I',
                tbl, tbl
            );
            EXECUTE format(
                'CREATE POLICY "Admin manage %s" ON public.%I FOR ALL USING (public.is_admin())',
                tbl, tbl
            );
        END IF;
    END LOOP;
END;
$$;

-- =============================================================================
-- STEP 15: Family/gift tables — owner access
-- =============================================================================

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'family_gift_lists',
            'gift_list_items',
            'family_calendars',
            'family_events',
            'family_event_rsvps'
        ])
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'public' AND table_name = tbl)
           AND EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_schema = 'public' AND table_name = tbl
                         AND column_name = 'user_id') THEN
            EXECUTE format(
                'DROP POLICY IF EXISTS "Owner access %s" ON public.%I',
                tbl, tbl
            );
            EXECUTE format(
                'CREATE POLICY "Owner access %s" ON public.%I FOR ALL USING (auth.uid() = user_id)',
                tbl, tbl
            );
        END IF;
    END LOOP;
END;
$$;

-- gift_list_access: users who have been granted access
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'gift_list_access')
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'gift_list_access'
                     AND column_name = 'granted_to') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Grantee access gift_list" ON gift_list_access';
        EXECUTE '
            CREATE POLICY "Grantee access gift_list" ON gift_list_access
                FOR SELECT USING (auth.uid() = granted_to OR public.is_admin())
        ';
    END IF;
END;
$$;

-- =============================================================================
-- STEP 16: ATTI campaign tables — admin write
-- =============================================================================

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'atti_card_designs',
            'atti_campaign_scans',
            'atti_referral_chains'
        ])
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format(
                'DROP POLICY IF EXISTS "Admin manage %s" ON public.%I',
                tbl, tbl
            );
            EXECUTE format(
                'CREATE POLICY "Admin manage %s" ON public.%I FOR ALL USING (public.is_admin())',
                tbl, tbl
            );
        END IF;
    END LOOP;
END;
$$;

-- =============================================================================
-- STEP 17: Service node tables — admin write, public read
-- =============================================================================

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'service_node_types',
            'service_nodes',
            'node_leadership',
            'node_activation_log'
        ])
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format(
                'DROP POLICY IF EXISTS "Admin manage %s" ON public.%I',
                tbl, tbl
            );
            EXECUTE format(
                'CREATE POLICY "Admin manage %s" ON public.%I FOR ALL USING (public.is_admin())',
                tbl, tbl
            );
        END IF;
    END LOOP;
END;
$$;

-- node_preorders, demand_signals: users can create their own
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY['node_preorders', 'demand_signals'])
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'public' AND table_name = tbl)
           AND EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_schema = 'public' AND table_name = tbl
                         AND column_name = 'user_id') THEN
            EXECUTE format(
                'DROP POLICY IF EXISTS "Users create own %s" ON public.%I',
                tbl, tbl
            );
            EXECUTE format(
                'CREATE POLICY "Users create own %s" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id)',
                tbl, tbl
            );
        END IF;
    END LOOP;
END;
$$;

-- =============================================================================
-- STEP 18: Grocery/delivery tables — owner + admin
-- =============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'grocery_delivery_jobs') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admin manage grocery_delivery_jobs" ON grocery_delivery_jobs';
        EXECUTE '
            CREATE POLICY "Admin manage grocery_delivery_jobs" ON grocery_delivery_jobs
                FOR ALL USING (public.is_admin())
        ';
    END IF;
END;
$$;

-- =============================================================================
-- STEP 19: LMD meal requests — owner access (already has good policies,
-- but baseline write was layered on top)
-- =============================================================================
-- No action needed — baseline write was dropped in Step 1, existing
-- owner-check policies from 20260215001000 remain intact.

-- =============================================================================
-- STEP 20: Onboarding members — users can join cohorts
-- =============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'onboarding_members')
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'onboarding_members'
                     AND column_name = 'user_id') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Users manage own onboarding" ON onboarding_members';
        EXECUTE '
            CREATE POLICY "Users manage own onboarding" ON onboarding_members
                FOR ALL USING (auth.uid() = user_id)
        ';
    END IF;
END;
$$;

-- =============================================================================
-- STEP 21: Social/candle tables — owner or admin
-- =============================================================================

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'user_social_plugs',
            'candle_burst_pairs',
            'social_plug_features'
        ])
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format(
                'DROP POLICY IF EXISTS "Admin manage %s" ON public.%I',
                tbl, tbl
            );
            EXECUTE format(
                'CREATE POLICY "Admin manage %s" ON public.%I FOR ALL USING (public.is_admin())',
                tbl, tbl
            );
        END IF;
    END LOOP;
END;
$$;

-- =============================================================================
-- STEP 22: Catch-all — any remaining tables without specific write policies
-- get admin-only write access. Tables already handled above are skipped
-- because CREATE POLICY will fail on duplicate names, so we use IF NOT EXISTS.
-- =============================================================================

DO $$
DECLARE
    t RECORD;
    policy_exists BOOLEAN;
BEGIN
    FOR t IN
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        SELECT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE schemaname = 'public'
              AND tablename = t.tablename
              AND (policyname LIKE 'Admin%' OR policyname LIKE 'Owner%'
                   OR policyname LIKE 'Users%' OR policyname LIKE 'Authenticated%'
                   OR policyname LIKE 'Ambassador%' OR policyname LIKE 'Grantee%'
                   OR policyname LIKE 'Service%')
              AND cmd != 'r'
        ) INTO policy_exists;

        IF NOT policy_exists THEN
            EXECUTE format(
                'DROP POLICY IF EXISTS "Fallback admin write %s" ON public.%I',
                t.tablename, t.tablename
            );
            EXECUTE format(
                'CREATE POLICY "Fallback admin write %s" ON public.%I FOR ALL USING (public.is_admin())',
                t.tablename, t.tablename
            );
        END IF;
    END LOOP;
END;
$$;
