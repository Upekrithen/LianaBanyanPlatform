-- ════════════════════════════════════════════════════════════════════
-- SEC LANGUAGE COMPLIANCE — DATABASE COLUMN RENAMES
-- ════════════════════════════════════════════════════════════════════
-- Renames database columns that use SEC-violating terminology:
--   equity → participation
--   investor → backer
--   profit → service_credit / service_value
--   vesting → milestone
--
-- Uses ALTER TABLE ... RENAME COLUMN which is atomic and preserves data.
-- Each rename is wrapped in a DO block with IF EXISTS check to be idempotent.
-- ════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────
-- 1. project_voting_configs
-- ────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'project_voting_configs' AND column_name = 'min_equity_ratio') THEN
    ALTER TABLE public.project_voting_configs RENAME COLUMN min_equity_ratio TO min_participation_ratio;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'project_voting_configs' AND column_name = 'max_equity_ratio') THEN
    ALTER TABLE public.project_voting_configs RENAME COLUMN max_equity_ratio TO max_participation_ratio;
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────────────
-- 2. user_votes
-- ────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_votes' AND column_name = 'equity_ratio') THEN
    ALTER TABLE public.user_votes RENAME COLUMN equity_ratio TO participation_ratio;
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────────────
-- 3. user_preferences
-- ────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_preferences' AND column_name = 'marketplace_investor_track') THEN
    ALTER TABLE public.user_preferences RENAME COLUMN marketplace_investor_track TO marketplace_backer_track;
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────────────
-- 4. service_positions
-- ────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'service_positions' AND column_name = 'equity_percentage') THEN
    ALTER TABLE public.service_positions RENAME COLUMN equity_percentage TO participation_percentage;
  END IF;
END $$;

-- Update compensation_type enum values: 'equity' → 'participation'
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'service_positions') THEN
    UPDATE public.service_positions SET compensation_type = 'participation' WHERE compensation_type = 'equity';
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────────────
-- 5. peer_contracts
-- ────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'peer_contracts' AND column_name = 'equity_percentage') THEN
    ALTER TABLE public.peer_contracts RENAME COLUMN equity_percentage TO participation_percentage;
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────────────
-- 6. position_assignments
-- ────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'position_assignments' AND column_name = 'original_equity_percentage') THEN
    ALTER TABLE public.position_assignments RENAME COLUMN original_equity_percentage TO original_participation_percentage;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'position_assignments' AND column_name = 'adjusted_equity_percentage') THEN
    ALTER TABLE public.position_assignments RENAME COLUMN adjusted_equity_percentage TO adjusted_participation_percentage;
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────────────
-- 7. eoi_vesting_schedules → Keep table name (rename would break RLS policies)
--    but rename columns
-- ────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'eoi_vesting_schedules' AND column_name = 'vesting_start_date') THEN
    ALTER TABLE public.eoi_vesting_schedules RENAME COLUMN vesting_start_date TO milestone_start_date;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'eoi_vesting_schedules' AND column_name = 'total_vesting_days') THEN
    ALTER TABLE public.eoi_vesting_schedules RENAME COLUMN total_vesting_days TO total_milestone_days;
  END IF;
END $$;

-- Also rename equity_ratio in this table if it exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'eoi_vesting_schedules' AND column_name = 'equity_ratio') THEN
    ALTER TABLE public.eoi_vesting_schedules RENAME COLUMN equity_ratio TO participation_ratio;
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────────────
-- 8. external_collaborator_agreements
-- ────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'external_collaborator_agreements' AND column_name = 'equity_percentage') THEN
    ALTER TABLE public.external_collaborator_agreements RENAME COLUMN equity_percentage TO participation_percentage;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'external_collaborator_agreements' AND column_name = 'profit_share_percentage') THEN
    ALTER TABLE public.external_collaborator_agreements RENAME COLUMN profit_share_percentage TO service_credit_percentage;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'external_collaborator_agreements' AND column_name = 'equity_vesting_months') THEN
    ALTER TABLE public.external_collaborator_agreements RENAME COLUMN equity_vesting_months TO participation_milestone_months;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'external_collaborator_agreements' AND column_name = 'equity_vested') THEN
    ALTER TABLE public.external_collaborator_agreements RENAME COLUMN equity_vested TO participation_vested;
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────────────
-- 9. medallion_type_definitions
-- ────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'medallion_type_definitions' AND column_name = 'profit_share_percentage') THEN
    ALTER TABLE public.medallion_type_definitions RENAME COLUMN profit_share_percentage TO service_credit_percentage;
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────────────
-- 10. user_wisp_stats
-- ────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_wisp_stats' AND column_name = 'net_profit') THEN
    ALTER TABLE public.user_wisp_stats RENAME COLUMN net_profit TO net_service_value;
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────────────
-- 11. guild_stakes
-- ────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'guild_stakes' AND column_name = 'vesting_start') THEN
    ALTER TABLE public.guild_stakes RENAME COLUMN vesting_start TO milestone_start;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'guild_stakes' AND column_name = 'vesting_end') THEN
    ALTER TABLE public.guild_stakes RENAME COLUMN vesting_end TO milestone_end;
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────────────
-- 12. withdrawal_configs
-- ────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'withdrawal_configs' AND column_name = 'vesting_days') THEN
    ALTER TABLE public.withdrawal_configs RENAME COLUMN vesting_days TO milestone_days;
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────────────
-- 13. user_shadow_marks_summary
-- ────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_shadow_marks_summary' AND column_name = 'vesting_count') THEN
    ALTER TABLE public.user_shadow_marks_summary RENAME COLUMN vesting_count TO milestone_completion_count;
  END IF;
END $$;

-- ════════════════════════════════════════════════════════════════════
-- DONE — All SEC-violating column names renamed
-- Tables left with original names (renaming would break RLS policies,
-- triggers, and views — can be done in a separate migration if needed):
--   eoi_vesting_schedules
-- ════════════════════════════════════════════════════════════════════
