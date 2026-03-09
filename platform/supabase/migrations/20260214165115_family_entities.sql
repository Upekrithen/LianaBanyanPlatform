-- ============================================================================
-- FAMILY TABLE EXPANSION: Core Family Entities
-- ============================================================================
-- Creates the foundational tables for the Family Table system:
-- - families: Groups (Family, Crew, Troupe, etc.)
-- - family_members: Members with roles and symbols
-- - family_invites: Pending invitations requiring unanimous approval
-- - family_invite_votes: Individual votes on invitations
-- - member_relationships: Individual connection toggles
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- FAMILIES TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS families (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    display_name TEXT DEFAULT 'Family', -- What members call it: Family, Crew, Troupe
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    settings JSONB DEFAULT '{}'::jsonb
);

-- Index for creator lookup
CREATE INDEX IF NOT EXISTS idx_families_created_by ON families(created_by);

-- ─────────────────────────────────────────────────────────────────────────────
-- FAMILY MEMBERS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS family_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    email TEXT, -- For invited members who haven't joined yet
    nickname TEXT NOT NULL,
    symbol TEXT DEFAULT '👤', -- Emoji like Loteria cards
    role TEXT DEFAULT 'member' CHECK (role IN ('founder', 'member', 'pending')),
    invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    joined_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(family_id, user_id),
    UNIQUE(family_id, email)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_family_members_family ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_email ON family_members(email);

-- ─────────────────────────────────────────────────────────────────────────────
-- FAMILY INVITES TABLE (Requires Unanimous Approval)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS family_invites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    invitee_email TEXT NOT NULL,
    invitee_name TEXT NOT NULL,
    invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    votes_needed INT NOT NULL DEFAULT 1, -- Count of active members at time of invite
    votes_received INT DEFAULT 0,
    message TEXT, -- Optional message to family about why they're inviting
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    resolved_at TIMESTAMPTZ,
    UNIQUE(family_id, invitee_email, status) -- Only one pending invite per email per family
);

-- Index for pending invites lookup
CREATE INDEX IF NOT EXISTS idx_family_invites_family_status ON family_invites(family_id, status);
CREATE INDEX IF NOT EXISTS idx_family_invites_email ON family_invites(invitee_email);

-- ─────────────────────────────────────────────────────────────────────────────
-- FAMILY INVITE VOTES TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS family_invite_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invite_id UUID NOT NULL REFERENCES family_invites(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    vote BOOLEAN NOT NULL, -- true = approve, false = reject
    voted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(invite_id, voter_id)
);

-- Index for vote lookup
CREATE INDEX IF NOT EXISTS idx_family_invite_votes_invite ON family_invite_votes(invite_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- MEMBER RELATIONSHIPS TABLE (Individual Connection Toggles)
-- ─────────────────────────────────────────────────────────────────────────────
-- Allows members to disconnect from specific family members without leaving
-- If Isa is mad at Ama, she can toggle off the connection - her content
-- won't be shared with Ama and vice versa, but everyone else is unaffected.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS member_relationships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    from_member UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    to_member UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    is_connected BOOLEAN DEFAULT true,
    disconnected_at TIMESTAMPTZ,
    reconnected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(family_id, from_member, to_member),
    CHECK (from_member != to_member) -- Can't have relationship with self
);

-- Indexes for relationship lookups
CREATE INDEX IF NOT EXISTS idx_member_relationships_from ON member_relationships(from_member);
CREATE INDEX IF NOT EXISTS idx_member_relationships_to ON member_relationships(to_member);
CREATE INDEX IF NOT EXISTS idx_member_relationships_family ON member_relationships(family_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY POLICIES
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invite_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_relationships ENABLE ROW LEVEL SECURITY;

-- FAMILIES: Members can view their families
CREATE POLICY "Users can view families they belong to"
    ON families FOR SELECT
    USING (
        id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- FAMILIES: Founders can update their families
CREATE POLICY "Founders can update their families"
    ON families FOR UPDATE
    USING (
        id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND role = 'founder' AND is_active = true
        )
    );

-- FAMILIES: Any authenticated user can create a family
CREATE POLICY "Authenticated users can create families"
    ON families FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- FAMILY_MEMBERS: Members can view other members in their families
CREATE POLICY "Members can view family members"
    ON family_members FOR SELECT
    USING (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- FAMILY_MEMBERS: Users can update their own membership
CREATE POLICY "Users can update their own membership"
    ON family_members FOR UPDATE
    USING (user_id = auth.uid());

-- FAMILY_MEMBERS: Founders can insert new members (for approved invites)
CREATE POLICY "System can insert family members"
    ON family_members FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- FAMILY_INVITES: Members can view invites for their families
CREATE POLICY "Members can view family invites"
    ON family_invites FOR SELECT
    USING (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- FAMILY_INVITES: Members can create invites
CREATE POLICY "Members can create invites"
    ON family_invites FOR INSERT
    WITH CHECK (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- FAMILY_INVITES: System can update invite status
CREATE POLICY "System can update invites"
    ON family_invites FOR UPDATE
    USING (auth.uid() IS NOT NULL);

-- FAMILY_INVITE_VOTES: Members can view votes on their family's invites
CREATE POLICY "Members can view invite votes"
    ON family_invite_votes FOR SELECT
    USING (
        invite_id IN (
            SELECT fi.id FROM family_invites fi
            JOIN family_members fm ON fi.family_id = fm.family_id
            WHERE fm.user_id = auth.uid() AND fm.is_active = true
        )
    );

-- FAMILY_INVITE_VOTES: Members can cast votes
CREATE POLICY "Members can cast votes"
    ON family_invite_votes FOR INSERT
    WITH CHECK (voter_id = auth.uid());

-- MEMBER_RELATIONSHIPS: Members can view relationships in their families
CREATE POLICY "Members can view relationships"
    ON member_relationships FOR SELECT
    USING (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- MEMBER_RELATIONSHIPS: Members can manage their own relationships
CREATE POLICY "Members can manage their relationships"
    ON member_relationships FOR ALL
    USING (
        from_member IN (
            SELECT id FROM family_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- HELPER FUNCTIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- Function to check if two members are connected (respects individual toggles)
CREATE OR REPLACE FUNCTION are_members_connected(member_a UUID, member_b UUID)
RETURNS BOOLEAN AS $$
DECLARE
    a_to_b BOOLEAN;
    b_to_a BOOLEAN;
BEGIN
    -- Check if A has disconnected from B
    SELECT COALESCE(is_connected, true) INTO a_to_b
    FROM member_relationships
    WHERE from_member = member_a AND to_member = member_b;
    
    -- Check if B has disconnected from A
    SELECT COALESCE(is_connected, true) INTO b_to_a
    FROM member_relationships
    WHERE from_member = member_b AND to_member = member_a;
    
    -- Both must be connected for the relationship to be active
    RETURN COALESCE(a_to_b, true) AND COALESCE(b_to_a, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get connected members for a given member
CREATE OR REPLACE FUNCTION get_connected_members(member_id UUID)
RETURNS TABLE(connected_member_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT fm.id
    FROM family_members fm
    WHERE fm.family_id = (SELECT family_id FROM family_members WHERE id = member_id)
      AND fm.id != member_id
      AND fm.is_active = true
      AND are_members_connected(member_id, fm.id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if all members have approved an invite
CREATE OR REPLACE FUNCTION check_invite_approval()
RETURNS TRIGGER AS $$
DECLARE
    invite_record RECORD;
    total_votes INT;
    approve_votes INT;
BEGIN
    -- Get the invite
    SELECT * INTO invite_record FROM family_invites WHERE id = NEW.invite_id;
    
    -- Count votes
    SELECT COUNT(*), COUNT(*) FILTER (WHERE vote = true)
    INTO total_votes, approve_votes
    FROM family_invite_votes
    WHERE invite_id = NEW.invite_id;
    
    -- Update votes_received
    UPDATE family_invites 
    SET votes_received = approve_votes
    WHERE id = NEW.invite_id;
    
    -- If anyone rejects, the invite is rejected
    IF NEW.vote = false THEN
        UPDATE family_invites 
        SET status = 'rejected', resolved_at = NOW()
        WHERE id = NEW.invite_id;
    -- If all have approved (unanimous), approve the invite
    ELSIF approve_votes >= invite_record.votes_needed THEN
        UPDATE family_invites 
        SET status = 'approved', resolved_at = NOW()
        WHERE id = NEW.invite_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to check invite approval after each vote
DROP TRIGGER IF EXISTS trigger_check_invite_approval ON family_invite_votes;
CREATE TRIGGER trigger_check_invite_approval
    AFTER INSERT ON family_invite_votes
    FOR EACH ROW
    EXECUTE FUNCTION check_invite_approval();

-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATED_AT TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_families_updated_at ON families;
CREATE TRIGGER trigger_families_updated_at
    BEFORE UPDATE ON families
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
