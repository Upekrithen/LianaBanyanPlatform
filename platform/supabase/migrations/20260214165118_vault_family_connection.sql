-- ============================================================================
-- VAULT SYSTEM → FAMILY TABLE CONNECTION
-- ============================================================================
-- Links the Upekrithen vault system to the new Family Table entities.
-- This allows vault unlocks to be associated with family members.
--
-- NOTE: Run this AFTER 20260214165115_family_entities.sql has been applied.
-- The family_members and families tables must exist first.
-- ============================================================================

-- Add family_member_id to vault_unlocks (if it exists)
-- Only run if both vault_unlocks AND family_members exist
DO $$
BEGIN
    -- First check if family_members exists (required dependency)
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'family_members') THEN
        RAISE NOTICE 'family_members table does not exist yet. Skipping vault_unlocks columns.';
        RETURN;
    END IF;

    -- Now check if vault_unlocks exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vault_unlocks') THEN
        -- Add column if not exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'vault_unlocks' AND column_name = 'family_member_id'
        ) THEN
            ALTER TABLE vault_unlocks
            ADD COLUMN family_member_id UUID REFERENCES family_members(id) ON DELETE SET NULL;
        END IF;

        -- Add family_id column
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'vault_unlocks' AND column_name = 'family_id'
        ) THEN
            ALTER TABLE vault_unlocks
            ADD COLUMN family_id UUID REFERENCES families(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- VAULT FAMILY MAPPING TABLE
-- ─────────────────────────────────────────────────────────────────────────────
-- Maps vault person identifiers (like "diana", "ben") to family members.
-- This supports migrating existing vault content to the Family Table system.
--
-- DEPENDENCY: Requires families and family_members tables from
-- 20260214165115_family_entities.sql to exist first.
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
    -- Only create these tables if the families table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'families') THEN
        RAISE NOTICE 'families table does not exist yet. Skipping vault_family_mapping and family_shared_memories tables.';
        RETURN;
    END IF;

    -- Create vault_family_mapping if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vault_family_mapping') THEN
        CREATE TABLE vault_family_mapping (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            vault_person TEXT NOT NULL, -- e.g., "diana", "ben", "jonathan"
            family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
            family_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
            symbol TEXT, -- Loteria card symbol
            email TEXT, -- For matching to users
            created_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(vault_person, family_id)
        );

        CREATE INDEX idx_vault_mapping_family ON vault_family_mapping(family_id);
        CREATE INDEX idx_vault_mapping_member ON vault_family_mapping(family_member_id);

        ALTER TABLE vault_family_mapping ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Create family_shared_memories if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'family_shared_memories') THEN
        CREATE TABLE family_shared_memories (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
            member_a UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
            member_b UUID REFERENCES family_members(id) ON DELETE CASCADE, -- NULL = shared with all
            title TEXT,
            description TEXT,
            photo_urls TEXT[], -- Array of photo URLs
            is_unlocked BOOLEAN DEFAULT false,
            unlocked_at TIMESTAMPTZ,
            created_by UUID REFERENCES family_members(id) ON DELETE SET NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(family_id, member_a, member_b)
        );

        CREATE INDEX idx_shared_memories_family ON family_shared_memories(family_id);
        CREATE INDEX idx_shared_memories_members ON family_shared_memories(member_a, member_b);

        ALTER TABLE family_shared_memories ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS POLICIES (only if tables exist)
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
    -- Only create policies if tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vault_family_mapping') THEN
        -- Vault Mapping: Family members can view mappings
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Members can view vault mappings') THEN
            CREATE POLICY "Members can view vault mappings"
                ON vault_family_mapping FOR SELECT
                USING (
                    family_id IN (
                        SELECT family_id FROM family_members
                        WHERE user_id = auth.uid() AND is_active = true
                    )
                );
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'family_shared_memories') THEN
        -- Shared Memories: Members can view their memories
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Members can view shared memories') THEN
            CREATE POLICY "Members can view shared memories"
                ON family_shared_memories FOR SELECT
                USING (
                    family_id IN (
                        SELECT family_id FROM family_members
                        WHERE user_id = auth.uid() AND is_active = true
                    )
                    AND (
                        member_a IN (SELECT id FROM family_members WHERE user_id = auth.uid())
                        OR member_b IN (SELECT id FROM family_members WHERE user_id = auth.uid())
                        OR member_b IS NULL
                    )
                );
        END IF;

        -- Shared Memories: Members can insert
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Members can create shared memories') THEN
            CREATE POLICY "Members can create shared memories"
                ON family_shared_memories FOR INSERT
                WITH CHECK (
                    family_id IN (
                        SELECT family_id FROM family_members
                        WHERE user_id = auth.uid() AND is_active = true
                    )
                );
        END IF;
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- HELPER FUNCTIONS (only create if dependencies exist)
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
    -- Only create functions if vault_family_mapping exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vault_family_mapping') THEN
        -- Link Vault Person to Family Member
        CREATE OR REPLACE FUNCTION link_vault_to_family(
            p_vault_person TEXT,
            p_family_id UUID,
            p_family_member_id UUID
        )
        RETURNS JSONB AS $func$
        BEGIN
            INSERT INTO vault_family_mapping (vault_person, family_id, family_member_id)
            VALUES (p_vault_person, p_family_id, p_family_member_id)
            ON CONFLICT (vault_person, family_id)
            DO UPDATE SET family_member_id = p_family_member_id;

            -- Update any existing vault_unlocks
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vault_unlocks') THEN
                EXECUTE format('
                    UPDATE vault_unlocks
                    SET family_id = %L, family_member_id = %L
                    WHERE person = %L AND family_id IS NULL
                ', p_family_id, p_family_member_id, p_vault_person);
            END IF;

            RETURN jsonb_build_object('success', true, 'linked', true);
        END;
        $func$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Check Memory Unlock Status
        CREATE OR REPLACE FUNCTION check_memory_unlock(
            p_family_id UUID,
            p_member_a UUID,
            p_member_b UUID
        )
        RETURNS BOOLEAN AS $func$
        DECLARE
            v_a_unlocked BOOLEAN;
            v_b_unlocked BOOLEAN;
        BEGIN
            -- Check if both members have unlocked their vaults
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vault_unlocks') THEN
                SELECT EXISTS(
                    SELECT 1 FROM vault_unlocks vu
                    JOIN vault_family_mapping vfm ON vu.person = vfm.vault_person
                    WHERE vfm.family_member_id = p_member_a AND vfm.family_id = p_family_id
                ) INTO v_a_unlocked;

                SELECT EXISTS(
                    SELECT 1 FROM vault_unlocks vu
                    JOIN vault_family_mapping vfm ON vu.person = vfm.vault_person
                    WHERE vfm.family_member_id = p_member_b AND vfm.family_id = p_family_id
                ) INTO v_b_unlocked;

                RETURN v_a_unlocked AND v_b_unlocked;
            END IF;

            RETURN false;
        END;
        $func$ LANGUAGE plpgsql SECURITY DEFINER;
    ELSE
        RAISE NOTICE 'vault_family_mapping does not exist. Skipping helper functions.';
    END IF;
END $$;
