-- ============================================================================
-- GIFT LIST → SHOPPING INTEGRATION
-- ============================================================================
-- Connects family gift lists to Let's Go Shopping for volume discounts.
-- Family members can "cold start" shopping aggregations for gift items.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- GIFT SHOPPING AGGREGATIONS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
-- When a family member says "I'm buying this Nintendo Switch 2 on Thursday",
-- this creates a cold start that others can join for volume discounts.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gift_shopping_aggregations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Link to gift item (optional - can be standalone)
    gift_item_id UUID REFERENCES gift_list_items(id) ON DELETE SET NULL,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,

    -- Shopping details
    product_name TEXT NOT NULL,
    product_url TEXT,
    product_price DECIMAL(10,2),
    quantity_needed INT DEFAULT 1,

    -- Cold start window
    shopping_date DATE NOT NULL,
    shopping_time TIME,
    window_closes_at TIMESTAMPTZ NOT NULL,

    -- Aggregation status
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'purchased', 'cancelled')),
    min_participants INT DEFAULT 2,
    current_participants INT DEFAULT 1,

    -- Discount tiers
    discount_tier INT DEFAULT 0, -- 0=none, 1=10%, 2=15%, 3=20%

    -- Creator
    created_by UUID REFERENCES family_members(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gift_shopping_family ON gift_shopping_aggregations(family_id);
CREATE INDEX IF NOT EXISTS idx_gift_shopping_status ON gift_shopping_aggregations(status);
CREATE INDEX IF NOT EXISTS idx_gift_shopping_date ON gift_shopping_aggregations(shopping_date);
CREATE INDEX IF NOT EXISTS idx_gift_shopping_window ON gift_shopping_aggregations(window_closes_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- SHOPPING PARTICIPANTS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gift_shopping_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    aggregation_id UUID NOT NULL REFERENCES gift_shopping_aggregations(id) ON DELETE CASCADE,
    family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    quantity INT DEFAULT 1,
    for_gift_item_id UUID REFERENCES gift_list_items(id) ON DELETE SET NULL, -- Which wishlist item this is for
    notes TEXT,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(aggregation_id, family_member_id)
);

CREATE INDEX IF NOT EXISTS idx_shopping_participants_agg ON gift_shopping_participants(aggregation_id);
CREATE INDEX IF NOT EXISTS idx_shopping_participants_member ON gift_shopping_participants(family_member_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS POLICIES
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE gift_shopping_aggregations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_shopping_participants ENABLE ROW LEVEL SECURITY;

-- Aggregations: Family members can view
CREATE POLICY "Members can view shopping aggregations"
    ON gift_shopping_aggregations FOR SELECT
    USING (
        family_id IN (
            SELECT family_id FROM family_members
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Aggregations: Members can create
CREATE POLICY "Members can create aggregations"
    ON gift_shopping_aggregations FOR INSERT
    WITH CHECK (
        family_id IN (
            SELECT family_id FROM family_members
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Aggregations: Creators can update
CREATE POLICY "Creators can update aggregations"
    ON gift_shopping_aggregations FOR UPDATE
    USING (
        created_by IN (
            SELECT id FROM family_members WHERE user_id = auth.uid()
        )
    );

-- Participants: Members can view
CREATE POLICY "Members can view participants"
    ON gift_shopping_participants FOR SELECT
    USING (
        aggregation_id IN (
            SELECT gsa.id FROM gift_shopping_aggregations gsa
            JOIN family_members fm ON gsa.family_id = fm.family_id
            WHERE fm.user_id = auth.uid() AND fm.is_active = true
        )
    );

-- Participants: Members can join
CREATE POLICY "Members can join aggregations"
    ON gift_shopping_participants FOR INSERT
    WITH CHECK (
        family_member_id IN (
            SELECT id FROM family_members WHERE user_id = auth.uid()
        )
    );

-- Participants: Members can update their own participation
CREATE POLICY "Members can update participation"
    ON gift_shopping_participants FOR UPDATE
    USING (
        family_member_id IN (
            SELECT id FROM family_members WHERE user_id = auth.uid()
        )
    );

-- Participants: Members can leave
CREATE POLICY "Members can leave aggregations"
    ON gift_shopping_participants FOR DELETE
    USING (
        family_member_id IN (
            SELECT id FROM family_members WHERE user_id = auth.uid()
        )
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- TRIGGER: Update participant count
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_shopping_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE gift_shopping_aggregations
        SET current_participants = current_participants + 1,
            discount_tier = CASE
                WHEN current_participants + 1 >= 10 THEN 3
                WHEN current_participants + 1 >= 5 THEN 2
                WHEN current_participants + 1 >= 2 THEN 1
                ELSE 0
            END,
            updated_at = NOW()
        WHERE id = NEW.aggregation_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE gift_shopping_aggregations
        SET current_participants = GREATEST(0, current_participants - 1),
            discount_tier = CASE
                WHEN current_participants - 1 >= 10 THEN 3
                WHEN current_participants - 1 >= 5 THEN 2
                WHEN current_participants - 1 >= 2 THEN 1
                ELSE 0
            END,
            updated_at = NOW()
        WHERE id = OLD.aggregation_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_shopping_participant_count ON gift_shopping_participants;
CREATE TRIGGER trigger_shopping_participant_count
    AFTER INSERT OR DELETE ON gift_shopping_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_shopping_participant_count();

-- ─────────────────────────────────────────────────────────────────────────────
-- HELPER FUNCTION: Create Shopping Aggregation from Gift Item
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION create_gift_shopping_aggregation(
    p_gift_item_id UUID,
    p_family_member_id UUID,
    p_shopping_date DATE,
    p_shopping_time TIME DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_item RECORD;
    v_list RECORD;
    v_agg_id UUID;
BEGIN
    -- Get the gift item
    SELECT * INTO v_item FROM gift_list_items WHERE id = p_gift_item_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Gift item not found';
    END IF;

    -- Get the list for family_id
    SELECT * INTO v_list FROM family_gift_lists WHERE id = v_item.list_id;

    -- Create the aggregation
    INSERT INTO gift_shopping_aggregations (
        gift_item_id,
        family_id,
        product_name,
        product_url,
        product_price,
        quantity_needed,
        shopping_date,
        shopping_time,
        window_closes_at,
        created_by
    ) VALUES (
        p_gift_item_id,
        v_list.family_id,
        v_item.name,
        v_item.url,
        v_item.price_estimate,
        v_item.quantity_wanted,
        p_shopping_date,
        p_shopping_time,
        (p_shopping_date::timestamp + COALESCE(p_shopping_time, '12:00'::time) - INTERVAL '2 hours')::timestamptz,
        p_family_member_id
    ) RETURNING id INTO v_agg_id;

    -- Add creator as first participant
    INSERT INTO gift_shopping_participants (aggregation_id, family_member_id, for_gift_item_id)
    VALUES (v_agg_id, p_family_member_id, p_gift_item_id);

    -- Create calendar event
    PERFORM create_shopping_calendar_event(v_agg_id);

    RETURN v_agg_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- HELPER FUNCTION: Create Calendar Event from Shopping Aggregation
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION create_shopping_calendar_event(p_aggregation_id UUID)
RETURNS UUID AS $$
DECLARE
    v_agg RECORD;
    v_calendar_id UUID;
    v_event_id UUID;
BEGIN
    -- Get the aggregation
    SELECT * INTO v_agg FROM gift_shopping_aggregations WHERE id = p_aggregation_id;
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- Get default family calendar
    SELECT id INTO v_calendar_id
    FROM family_calendars
    WHERE family_id = v_agg.family_id AND is_default = true
    LIMIT 1;

    IF v_calendar_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Create the event
    INSERT INTO family_events (
        calendar_id,
        title,
        description,
        event_type,
        start_time,
        end_time,
        source,
        source_id,
        created_by
    ) VALUES (
        v_calendar_id,
        'Shopping: ' || v_agg.product_name,
        'Window closes at ' || v_agg.window_closes_at::text,
        'shopping',
        v_agg.shopping_date::timestamp + COALESCE(v_agg.shopping_time, '12:00'::time),
        v_agg.shopping_date::timestamp + COALESCE(v_agg.shopping_time, '12:00'::time) + INTERVAL '1 hour',
        'shopping',
        p_aggregation_id,
        v_agg.created_by
    ) RETURNING id INTO v_event_id;

    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
