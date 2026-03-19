-- ============================================================================
-- SEC ENUM COMPLETION — Update remaining compensation_type enum values
-- Completes the work started in 20260310000002_sec_column_renames.sql
-- ============================================================================

-- 1. peer_member_contracts: update CHECK constraint and data
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'peer_member_contracts') THEN
    -- Update existing data
    UPDATE public.peer_member_contracts SET compensation_type = 'participation' WHERE compensation_type = 'equity';

    -- Drop old CHECK constraint if it exists
    ALTER TABLE public.peer_member_contracts DROP CONSTRAINT IF EXISTS peer_member_contracts_compensation_type_check;

    -- Add new CHECK constraint
    ALTER TABLE public.peer_member_contracts ADD CONSTRAINT peer_member_contracts_compensation_type_check
      CHECK (compensation_type IN ('participation', 'cash', 'hybrid'));
  END IF;
END $$;

-- 2. contract_position_templates: update default and CHECK constraint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contract_position_templates') THEN
    -- Update existing data
    UPDATE public.contract_position_templates SET compensation_type = 'participation' WHERE compensation_type = 'equity';

    -- Update default
    ALTER TABLE public.contract_position_templates ALTER COLUMN compensation_type SET DEFAULT 'participation';

    -- Drop old CHECK constraint if it exists
    ALTER TABLE public.contract_position_templates DROP CONSTRAINT IF EXISTS contract_position_templates_compensation_type_check;

    -- Add new CHECK constraint
    ALTER TABLE public.contract_position_templates ADD CONSTRAINT contract_position_templates_compensation_type_check
      CHECK (compensation_type IN ('participation', 'cash', 'hybrid'));
  END IF;
END $$;

-- 3. peer_contracts: update any remaining enum values (column may not exist)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'peer_contracts' AND column_name = 'compensation_type') THEN
    UPDATE public.peer_contracts SET compensation_type = 'participation' WHERE compensation_type = 'equity';
  END IF;
END $$;

-- 4. external_collaborator_agreements: update any remaining enum values (column may not exist)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'external_collaborator_agreements' AND column_name = 'compensation_type') THEN
    UPDATE public.external_collaborator_agreements SET compensation_type = 'participation' WHERE compensation_type = 'equity';
  END IF;
END $$;

-- 5. Remove star_chamber from launch_conditions (Founder decision: not a Sweet Sixteen initiative)
DELETE FROM public.launch_conditions WHERE initiative_slug = 'star-chamber';
