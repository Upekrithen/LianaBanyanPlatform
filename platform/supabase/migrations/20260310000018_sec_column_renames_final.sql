-- ════════════════════════════════════════════════════════════════════
-- SEC LANGUAGE COMPLIANCE — FINAL COLUMN RENAMES
-- ════════════════════════════════════════════════════════════════════
-- Catches remaining columns missed by 20260310000002 and 20260310000010.
--   equity_split_* → participation_split_*
--   equity_adjustment → participation_adjustment
--   equity_awarded → participation_awarded
--   profit_sharing_model → service_credit_sharing_model
--   profit_share_percentage → service_credit_percentage (guild_stewards)
-- ════════════════════════════════════════════════════════════════════

-- ── 1. salt_mines_tiers ──
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salt_mines_tiers' AND column_name = 'equity_split_creator') THEN
    ALTER TABLE public.salt_mines_tiers RENAME COLUMN equity_split_creator TO participation_split_creator;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salt_mines_tiers' AND column_name = 'equity_split_lb') THEN
    ALTER TABLE public.salt_mines_tiers RENAME COLUMN equity_split_lb TO participation_split_lb;
  END IF;
END $$;

-- ── 2. salt_mines_arbitration ──
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salt_mines_arbitration' AND column_name = 'equity_adjustment') THEN
    ALTER TABLE public.salt_mines_arbitration RENAME COLUMN equity_adjustment TO participation_adjustment;
  END IF;
END $$;

-- ── 3. medallion_awards ──
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'medallion_awards' AND column_name = 'equity_awarded') THEN
    ALTER TABLE public.medallion_awards RENAME COLUMN equity_awarded TO participation_awarded;
  END IF;
END $$;

-- ── 4. guild_stewards ──
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'guild_stewards' AND column_name = 'profit_sharing_model') THEN
    ALTER TABLE public.guild_stewards RENAME COLUMN profit_sharing_model TO service_credit_sharing_model;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'guild_stewards' AND column_name = 'profit_share_percentage') THEN
    ALTER TABLE public.guild_stewards RENAME COLUMN profit_share_percentage TO service_credit_percentage;
  END IF;
END $$;

-- ════════════════════════════════════════════════════════════════════
-- DONE — All remaining SEC-violating column names renamed.
-- Combined with 20260310000002 and 20260310000010, the database is
-- now fully SEC-clean on column naming.
-- ════════════════════════════════════════════════════════════════════
