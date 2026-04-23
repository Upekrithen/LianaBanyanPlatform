-- ============================================================================
-- VAULT CONTENT SHARING AUTHORIZATION SYSTEM
-- ============================================================================
-- Allows family members (Loteria members) to authorize their personal vault
-- content to be accessible by other family members, even when offline.
--
-- Authorization persists until the authorizing member revokes it.
--
-- Key concepts:
-- - SHARE AUTHORIZATION: A member authorizes their content to be shared
-- - SHARE SCOPE: Who can see (specific member, or all family)
-- - REVOCABLE: Authorization can be withdrawn at any time
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- VAULT SHARING AUTHORIZATIONS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
-- Tracks which members have authorized sharing of their vault content.
-- When shared_with_member_id IS NULL, content is shared with all family members.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vault_sharing_authorizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Who is granting access
    granter_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    granter_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- The family this belongs to
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,

    -- Who receives access (NULL = all family members)
    shared_with_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,

    -- What content is shared
    content_scope TEXT NOT NULL DEFAULT 'all', -- 'all', 'photos', 'memories', 'messages'

    -- Authorization status
    is_active BOOLEAN DEFAULT true,
    authorized_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    revoked_reason TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicate authorizations for the same recipient
    UNIQUE(granter_member_id, family_id, shared_with_member_id, content_scope)
);

CREATE INDEX IF NOT EXISTS idx_vault_share_auth_granter ON vault_sharing_authorizations(granter_member_id);
CREATE INDEX IF NOT EXISTS idx_vault_share_auth_recipient ON vault_sharing_authorizations(shared_with_member_id);
CREATE INDEX IF NOT EXISTS idx_vault_share_auth_family ON vault_sharing_authorizations(family_id);
CREATE INDEX IF NOT EXISTS idx_vault_share_auth_active ON vault_sharing_authorizations(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE vault_sharing_authorizations ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- SHARED VAULT CONTENT TABLE
-- ─────────────────────────────────────────────────────────────────────────────
-- Stores actual content that has been shared under an authorization.
-- Content remains accessible as long as the authorization is active.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vault_shared_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Link to the authorization
    authorization_id UUID NOT NULL REFERENCES vault_sharing_authorizations(id) ON DELETE CASCADE,

    -- Content details
    content_type TEXT NOT NULL, -- 'photo', 'memory', 'message', 'document'
    title TEXT,
    description TEXT,

    -- For photos/documents
    file_url TEXT,
    thumbnail_url TEXT,

    -- For text content
    content_text TEXT,

    -- For memories (can have multiple photos)
    photo_urls TEXT[],

    -- Metadata
    original_date TIMESTAMPTZ, -- When the memory/photo was originally from
    location TEXT,
    tags TEXT[],

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_vault_shared_content_auth ON vault_shared_content(authorization_id);

-- Enable RLS
ALTER TABLE vault_shared_content ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS POLICIES
-- ─────────────────────────────────────────────────────────────────────────────

-- Authorization: Granters can manage their own authorizations
CREATE POLICY "Granters can manage their authorizations"
    ON vault_sharing_authorizations FOR ALL
    USING (
        granter_user_id = auth.uid()
        OR granter_member_id IN (
            SELECT id FROM family_members WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        granter_user_id = auth.uid()
        OR granter_member_id IN (
            SELECT id FROM family_members WHERE user_id = auth.uid()
        )
    );

-- Authorization: Recipients can view authorizations shared with them
CREATE POLICY "Recipients can view shared authorizations"
    ON vault_sharing_authorizations FOR SELECT
    USING (
        is_active = true
        AND (
            -- Shared with specific member
            shared_with_member_id IN (
                SELECT id FROM family_members WHERE user_id = auth.uid()
            )
            -- OR shared with all family members
            OR (
                shared_with_member_id IS NULL
                AND family_id IN (
                    SELECT family_id FROM family_members
                    WHERE user_id = auth.uid() AND is_active = true
                )
            )
        )
    );

-- Shared Content: Accessible if authorization is active
CREATE POLICY "View shared content with active authorization"
    ON vault_shared_content FOR SELECT
    USING (
        authorization_id IN (
            SELECT id FROM vault_sharing_authorizations vsa
            WHERE vsa.is_active = true
            AND (
                -- User is the granter
                vsa.granter_user_id = auth.uid()
                -- OR user is the specific recipient
                OR vsa.shared_with_member_id IN (
                    SELECT id FROM family_members WHERE user_id = auth.uid()
                )
                -- OR shared with all family and user is family member
                OR (
                    vsa.shared_with_member_id IS NULL
                    AND vsa.family_id IN (
                        SELECT family_id FROM family_members
                        WHERE user_id = auth.uid() AND is_active = true
                    )
                )
            )
        )
    );

-- Shared Content: Granters can manage their shared content
CREATE POLICY "Granters can manage shared content"
    ON vault_shared_content FOR ALL
    USING (
        authorization_id IN (
            SELECT id FROM vault_sharing_authorizations
            WHERE granter_user_id = auth.uid()
        )
    )
    WITH CHECK (
        authorization_id IN (
            SELECT id FROM vault_sharing_authorizations
            WHERE granter_user_id = auth.uid()
        )
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- FUNCTIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- Authorize vault sharing for a family member
CREATE OR REPLACE FUNCTION authorize_vault_sharing(
    p_family_id UUID,
    p_shared_with_member_id UUID DEFAULT NULL, -- NULL = share with all
    p_content_scope TEXT DEFAULT 'all'
)
RETURNS JSONB AS $$
DECLARE
    v_granter_member_id UUID;
    v_auth_id UUID;
BEGIN
    -- Get the granter's family member ID
    SELECT id INTO v_granter_member_id
    FROM family_members
    WHERE user_id = auth.uid() AND family_id = p_family_id AND is_active = true;

    IF v_granter_member_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'You are not a member of this family');
    END IF;

    -- Create or reactivate authorization
    INSERT INTO vault_sharing_authorizations (
        granter_member_id,
        granter_user_id,
        family_id,
        shared_with_member_id,
        content_scope,
        is_active,
        authorized_at
    ) VALUES (
        v_granter_member_id,
        auth.uid(),
        p_family_id,
        p_shared_with_member_id,
        p_content_scope,
        true,
        NOW()
    )
    ON CONFLICT (granter_member_id, family_id, shared_with_member_id, content_scope)
    DO UPDATE SET
        is_active = true,
        authorized_at = NOW(),
        revoked_at = NULL,
        revoked_reason = NULL,
        updated_at = NOW()
    RETURNING id INTO v_auth_id;

    RETURN jsonb_build_object(
        'success', true,
        'authorization_id', v_auth_id,
        'shared_with', CASE WHEN p_shared_with_member_id IS NULL THEN 'all_family' ELSE 'specific_member' END,
        'scope', p_content_scope
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revoke vault sharing authorization
CREATE OR REPLACE FUNCTION revoke_vault_sharing(
    p_authorization_id UUID,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
BEGIN
    UPDATE vault_sharing_authorizations
    SET
        is_active = false,
        revoked_at = NOW(),
        revoked_reason = p_reason,
        updated_at = NOW()
    WHERE id = p_authorization_id
    AND granter_user_id = auth.uid();

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authorization not found or not yours');
    END IF;

    RETURN jsonb_build_object('success', true, 'revoked', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get all content shared with the current user
CREATE OR REPLACE FUNCTION get_shared_vault_content(
    p_family_id UUID
)
RETURNS TABLE (
    content_id UUID,
    content_type TEXT,
    title TEXT,
    description TEXT,
    file_url TEXT,
    thumbnail_url TEXT,
    content_text TEXT,
    photo_urls TEXT[],
    original_date TIMESTAMPTZ,
    location TEXT,
    tags TEXT[],
    shared_by_member_id UUID,
    shared_by_name TEXT,
    shared_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        vsc.id AS content_id,
        vsc.content_type,
        vsc.title,
        vsc.description,
        vsc.file_url,
        vsc.thumbnail_url,
        vsc.content_text,
        vsc.photo_urls,
        vsc.original_date,
        vsc.location,
        vsc.tags,
        vsa.granter_member_id AS shared_by_member_id,
        fm.nickname AS shared_by_name,
        vsa.authorized_at AS shared_at
    FROM vault_shared_content vsc
    JOIN vault_sharing_authorizations vsa ON vsc.authorization_id = vsa.id
    JOIN family_members fm ON vsa.granter_member_id = fm.id
    WHERE vsa.family_id = p_family_id
    AND vsa.is_active = true
    AND (
        -- Specific to this user
        vsa.shared_with_member_id IN (
            SELECT id FROM family_members WHERE user_id = auth.uid()
        )
        -- OR shared with all family
        OR vsa.shared_with_member_id IS NULL
    )
    ORDER BY vsc.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add shared content to your authorization
CREATE OR REPLACE FUNCTION add_shared_vault_content(
    p_authorization_id UUID,
    p_content_type TEXT,
    p_title TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_file_url TEXT DEFAULT NULL,
    p_content_text TEXT DEFAULT NULL,
    p_photo_urls TEXT[] DEFAULT NULL,
    p_original_date TIMESTAMPTZ DEFAULT NULL,
    p_location TEXT DEFAULT NULL,
    p_tags TEXT[] DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_content_id UUID;
BEGIN
    -- Verify ownership of authorization
    IF NOT EXISTS (
        SELECT 1 FROM vault_sharing_authorizations
        WHERE id = p_authorization_id AND granter_user_id = auth.uid()
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authorization not found or not yours');
    END IF;

    INSERT INTO vault_shared_content (
        authorization_id,
        content_type,
        title,
        description,
        file_url,
        content_text,
        photo_urls,
        original_date,
        location,
        tags,
        created_by
    ) VALUES (
        p_authorization_id,
        p_content_type,
        p_title,
        p_description,
        p_file_url,
        p_content_text,
        p_photo_urls,
        p_original_date,
        p_location,
        p_tags,
        auth.uid()
    )
    RETURNING id INTO v_content_id;

    RETURN jsonb_build_object('success', true, 'content_id', v_content_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- VIEW: Active Family Sharing Status
-- ─────────────────────────────────────────────────────────────────────────────
-- Shows who has authorized sharing in a family

CREATE OR REPLACE VIEW vault_family_sharing_status AS
SELECT
    vsa.family_id,
    vsa.granter_member_id,
    fm.nickname AS granter_name,
    fm.symbol AS loteria_symbol,
    vsa.content_scope,
    vsa.shared_with_member_id,
    CASE
        WHEN vsa.shared_with_member_id IS NULL THEN 'All Family'
        ELSE (SELECT nickname FROM family_members WHERE id = vsa.shared_with_member_id)
    END AS shared_with_name,
    vsa.authorized_at,
    vsa.is_active,
    (SELECT COUNT(*) FROM vault_shared_content WHERE authorization_id = vsa.id) AS content_count
FROM vault_sharing_authorizations vsa
JOIN family_members fm ON vsa.granter_member_id = fm.id
WHERE vsa.is_active = true;

-- ─────────────────────────────────────────────────────────────────────────────
-- COMMENTS
-- ─────────────────────────────────────────────────────────────────────────────

COMMENT ON TABLE vault_sharing_authorizations IS
'Tracks which family members have authorized their vault content to be shared with others, even when offline.';

COMMENT ON TABLE vault_shared_content IS
'Content that has been explicitly shared under a vault sharing authorization.';

COMMENT ON FUNCTION authorize_vault_sharing IS
'Authorize your vault content to be shared with a specific member or all family. Returns authorization_id.';

COMMENT ON FUNCTION revoke_vault_sharing IS
'Revoke a previously granted vault sharing authorization. Content becomes inaccessible.';

COMMENT ON FUNCTION get_shared_vault_content IS
'Get all vault content that has been shared with the current user in a family.';
