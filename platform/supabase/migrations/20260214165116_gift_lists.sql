-- ============================================================================
-- FAMILY TABLE EXPANSION: Gift Lists with Secret Sharing
-- ============================================================================
-- Creates tables for gift wishlists where:
-- - Owners can see their list items but NOT who claimed them
-- - Family members can claim items (hidden from owner)
-- - Supports Notion sync for importing existing lists
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- FAMILY GIFT LISTS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS family_gift_lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    occasion TEXT CHECK (occasion IN ('birthday', 'holiday', 'anniversary', 'general', 'other')),
    occasion_date DATE, -- When gifts are needed by
    visibility TEXT DEFAULT 'family' CHECK (visibility IN ('family', 'specific_members')),
    notion_sync_url TEXT, -- Optional Notion database URL for sync
    notion_database_id TEXT, -- Notion database ID for API calls
    last_synced_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gift_lists_family ON family_gift_lists(family_id);
CREATE INDEX IF NOT EXISTS idx_gift_lists_owner ON family_gift_lists(owner_id);
CREATE INDEX IF NOT EXISTS idx_gift_lists_occasion_date ON family_gift_lists(occasion_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- GIFT LIST ITEMS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gift_list_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    list_id UUID NOT NULL REFERENCES family_gift_lists(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    url TEXT, -- Product link
    image_url TEXT, -- Product image
    price_estimate DECIMAL(10,2),
    price_currency TEXT DEFAULT 'USD',
    priority INT DEFAULT 2 CHECK (priority BETWEEN 1 AND 3), -- 1=high, 2=medium, 3=low
    quantity_wanted INT DEFAULT 1,
    quantity_claimed INT DEFAULT 0,
    claimed_by UUID REFERENCES family_members(id) ON DELETE SET NULL, -- HIDDEN FROM OWNER!
    claimed_at TIMESTAMPTZ,
    purchased BOOLEAN DEFAULT false,
    purchased_by UUID REFERENCES family_members(id) ON DELETE SET NULL,
    purchased_at TIMESTAMPTZ,
    notion_block_id TEXT, -- For Notion sync
    notes TEXT, -- Private notes from claimer (hidden from owner)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gift_items_list ON gift_list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_gift_items_claimed ON gift_list_items(claimed_by);
CREATE INDEX IF NOT EXISTS idx_gift_items_purchased ON gift_list_items(purchased);

-- ─────────────────────────────────────────────────────────────────────────────
-- GIFT LIST ACCESS TABLE (Who Can See Which Lists)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gift_list_access (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    list_id UUID NOT NULL REFERENCES family_gift_lists(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    can_view BOOLEAN DEFAULT true,
    can_claim BOOLEAN DEFAULT true,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID REFERENCES family_members(id) ON DELETE SET NULL,
    UNIQUE(list_id, member_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_gift_access_list ON gift_list_access(list_id);
CREATE INDEX IF NOT EXISTS idx_gift_access_member ON gift_list_access(member_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- GIFT CLAIM HISTORY (For Tracking Claim/Unclaim Actions)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gift_claim_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID NOT NULL REFERENCES gift_list_items(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('claim', 'unclaim', 'purchase')),
    action_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_gift_claim_history_item ON gift_claim_history(item_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY POLICIES
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE family_gift_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_list_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_claim_history ENABLE ROW LEVEL SECURITY;

-- GIFT LISTS: Family members can view lists in their family
CREATE POLICY "Members can view family gift lists"
    ON family_gift_lists FOR SELECT
    USING (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- GIFT LISTS: Members can create lists
CREATE POLICY "Members can create gift lists"
    ON family_gift_lists FOR INSERT
    WITH CHECK (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- GIFT LISTS: Owners can update their lists
CREATE POLICY "Owners can update their lists"
    ON family_gift_lists FOR UPDATE
    USING (
        owner_id IN (
            SELECT id FROM family_members 
            WHERE user_id = auth.uid()
        )
    );

-- GIFT LISTS: Owners can delete their lists
CREATE POLICY "Owners can delete their lists"
    ON family_gift_lists FOR DELETE
    USING (
        owner_id IN (
            SELECT id FROM family_members 
            WHERE user_id = auth.uid()
        )
    );

-- GIFT LIST ITEMS: Complex policy - owners see items WITHOUT claimed_by
-- We handle this via a view instead (see below)
CREATE POLICY "Members can view gift list items"
    ON gift_list_items FOR SELECT
    USING (
        list_id IN (
            SELECT gl.id FROM family_gift_lists gl
            JOIN family_members fm ON gl.family_id = fm.family_id
            WHERE fm.user_id = auth.uid() AND fm.is_active = true
        )
    );

-- GIFT LIST ITEMS: Owners can insert items to their lists
CREATE POLICY "Owners can insert items"
    ON gift_list_items FOR INSERT
    WITH CHECK (
        list_id IN (
            SELECT gl.id FROM family_gift_lists gl
            JOIN family_members fm ON gl.owner_id = fm.id
            WHERE fm.user_id = auth.uid()
        )
    );

-- GIFT LIST ITEMS: Owners can update their items (except claimed_by)
-- Members can update claimed_by on items they're claiming
CREATE POLICY "Members can update items"
    ON gift_list_items FOR UPDATE
    USING (
        list_id IN (
            SELECT gl.id FROM family_gift_lists gl
            JOIN family_members fm ON gl.family_id = fm.family_id
            WHERE fm.user_id = auth.uid() AND fm.is_active = true
        )
    );

-- GIFT LIST ACCESS: Members can view access settings
CREATE POLICY "Members can view access"
    ON gift_list_access FOR SELECT
    USING (
        list_id IN (
            SELECT gl.id FROM family_gift_lists gl
            JOIN family_members fm ON gl.family_id = fm.family_id
            WHERE fm.user_id = auth.uid() AND fm.is_active = true
        )
    );

-- GIFT CLAIM HISTORY: Members can view history for items they can see
CREATE POLICY "Members can view claim history"
    ON gift_claim_history FOR SELECT
    USING (
        item_id IN (
            SELECT gi.id FROM gift_list_items gi
            JOIN family_gift_lists gl ON gi.list_id = gl.id
            JOIN family_members fm ON gl.family_id = fm.family_id
            WHERE fm.user_id = auth.uid() AND fm.is_active = true
            -- Exclude history for items on lists the user owns
            AND gl.owner_id NOT IN (
                SELECT id FROM family_members WHERE user_id = auth.uid()
            )
        )
    );

-- GIFT CLAIM HISTORY: Members can insert their own history
CREATE POLICY "Members can insert claim history"
    ON gift_claim_history FOR INSERT
    WITH CHECK (
        member_id IN (
            SELECT id FROM family_members WHERE user_id = auth.uid()
        )
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- VIEW: Gift Items for Owner (Hides claimed_by)
-- ─────────────────────────────────────────────────────────────────────────────
-- This view is used when the list owner views their own items.
-- They can see all item details EXCEPT who claimed them.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW gift_list_items_for_owner AS
SELECT 
    gi.id,
    gi.list_id,
    gi.name,
    gi.description,
    gi.url,
    gi.image_url,
    gi.price_estimate,
    gi.price_currency,
    gi.priority,
    gi.quantity_wanted,
    gi.quantity_claimed,
    -- Show that it's claimed, but NOT by whom
    CASE WHEN gi.claimed_by IS NOT NULL THEN true ELSE false END AS is_claimed,
    CASE WHEN gi.purchased THEN true ELSE false END AS is_purchased,
    gi.notion_block_id,
    gi.created_at,
    gi.updated_at
FROM gift_list_items gi
JOIN family_gift_lists gl ON gi.list_id = gl.id
JOIN family_members fm ON gl.owner_id = fm.id
WHERE fm.user_id = auth.uid();

-- ─────────────────────────────────────────────────────────────────────────────
-- VIEW: Gift Items for Family (Shows claimed_by for non-owners)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW gift_list_items_for_family AS
SELECT 
    gi.*,
    fm_claimer.nickname AS claimed_by_name,
    fm_claimer.symbol AS claimed_by_symbol
FROM gift_list_items gi
JOIN family_gift_lists gl ON gi.list_id = gl.id
JOIN family_members fm ON gl.family_id = fm.family_id
LEFT JOIN family_members fm_claimer ON gi.claimed_by = fm_claimer.id
WHERE fm.user_id = auth.uid() 
  AND fm.is_active = true
  -- Only show full details if user is NOT the owner
  AND gl.owner_id NOT IN (
      SELECT id FROM family_members WHERE user_id = auth.uid()
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- HELPER FUNCTIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- Function to claim a gift item
CREATE OR REPLACE FUNCTION claim_gift_item(
    p_item_id UUID,
    p_member_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_item RECORD;
    v_list RECORD;
    v_is_owner BOOLEAN;
BEGIN
    -- Get the item
    SELECT * INTO v_item FROM gift_list_items WHERE id = p_item_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Item not found');
    END IF;
    
    -- Check if already claimed
    IF v_item.claimed_by IS NOT NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Item already claimed');
    END IF;
    
    -- Get the list
    SELECT * INTO v_list FROM family_gift_lists WHERE id = v_item.list_id;
    
    -- Check if claimer is the owner (can't claim your own items!)
    SELECT EXISTS(
        SELECT 1 FROM family_members fm
        WHERE fm.id = p_member_id 
        AND fm.id = v_list.owner_id
    ) INTO v_is_owner;
    
    IF v_is_owner THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cannot claim your own items');
    END IF;
    
    -- Claim the item
    UPDATE gift_list_items
    SET claimed_by = p_member_id,
        claimed_at = NOW(),
        quantity_claimed = quantity_claimed + 1,
        updated_at = NOW()
    WHERE id = p_item_id;
    
    -- Record in history
    INSERT INTO gift_claim_history (item_id, member_id, action)
    VALUES (p_item_id, p_member_id, 'claim');
    
    RETURN jsonb_build_object('success', true, 'message', 'Item claimed successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unclaim a gift item
CREATE OR REPLACE FUNCTION unclaim_gift_item(
    p_item_id UUID,
    p_member_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_item RECORD;
BEGIN
    -- Get the item
    SELECT * INTO v_item FROM gift_list_items WHERE id = p_item_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Item not found');
    END IF;
    
    -- Check if this member claimed it
    IF v_item.claimed_by != p_member_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'You did not claim this item');
    END IF;
    
    -- Unclaim the item
    UPDATE gift_list_items
    SET claimed_by = NULL,
        claimed_at = NULL,
        quantity_claimed = GREATEST(0, quantity_claimed - 1),
        updated_at = NOW()
    WHERE id = p_item_id;
    
    -- Record in history
    INSERT INTO gift_claim_history (item_id, member_id, action)
    VALUES (p_item_id, p_member_id, 'unclaim');
    
    RETURN jsonb_build_object('success', true, 'message', 'Item unclaimed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark item as purchased
CREATE OR REPLACE FUNCTION mark_gift_purchased(
    p_item_id UUID,
    p_member_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_item RECORD;
BEGIN
    -- Get the item
    SELECT * INTO v_item FROM gift_list_items WHERE id = p_item_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Item not found');
    END IF;
    
    -- Check if this member claimed it
    IF v_item.claimed_by != p_member_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'You must claim an item before marking it purchased');
    END IF;
    
    -- Mark as purchased
    UPDATE gift_list_items
    SET purchased = true,
        purchased_by = p_member_id,
        purchased_at = NOW(),
        updated_at = NOW()
    WHERE id = p_item_id;
    
    -- Record in history
    INSERT INTO gift_claim_history (item_id, member_id, action)
    VALUES (p_item_id, p_member_id, 'purchase');
    
    RETURN jsonb_build_object('success', true, 'message', 'Item marked as purchased');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATED_AT TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS trigger_gift_lists_updated_at ON family_gift_lists;
CREATE TRIGGER trigger_gift_lists_updated_at
    BEFORE UPDATE ON family_gift_lists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_gift_items_updated_at ON gift_list_items;
CREATE TRIGGER trigger_gift_items_updated_at
    BEFORE UPDATE ON gift_list_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
