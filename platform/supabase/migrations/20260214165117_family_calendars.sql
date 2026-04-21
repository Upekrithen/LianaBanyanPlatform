-- ============================================================================
-- FAMILY TABLE EXPANSION: Family Calendars
-- ============================================================================
-- Creates tables for shared family calendars with:
-- - Multiple calendars per family (main, sports, medical, etc.)
-- - Google Calendar sync support
-- - Auto-generated events from meal plans, shopping, gifts
-- - Recurring event support (RRULE format)
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- FAMILY CALENDARS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS family_calendars (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6', -- Hex color for display
    is_default BOOLEAN DEFAULT false, -- Main family calendar

    -- Google Calendar Integration
    google_calendar_id TEXT, -- Google Calendar ID for sync
    google_account_email TEXT, -- Which Google account owns this
    sync_enabled BOOLEAN DEFAULT false,
    sync_direction TEXT DEFAULT 'both' CHECK (sync_direction IN ('pull', 'push', 'both')),
    last_sync_at TIMESTAMPTZ,
    sync_token TEXT, -- For incremental sync

    -- Settings
    default_reminder_minutes INT DEFAULT 30,
    timezone TEXT DEFAULT 'America/Chicago',

    created_by UUID REFERENCES family_members(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_family_calendars_family ON family_calendars(family_id);
CREATE INDEX IF NOT EXISTS idx_family_calendars_google ON family_calendars(google_calendar_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- FAMILY EVENTS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS family_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    calendar_id UUID NOT NULL REFERENCES family_calendars(id) ON DELETE CASCADE,

    -- Event Details
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    event_type TEXT DEFAULT 'custom' CHECK (event_type IN (
        'birthday', 'holiday', 'anniversary',
        'appointment', 'medical',
        'meal', 'shopping',
        'sports', 'school', 'work',
        'reminder', 'custom'
    )),

    -- Timing
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    all_day BOOLEAN DEFAULT false,
    timezone TEXT,

    -- Recurrence (RRULE format: "FREQ=WEEKLY;BYDAY=MO,WE,FR")
    recurrence_rule TEXT,
    recurrence_end DATE,
    is_recurring BOOLEAN DEFAULT false,
    parent_event_id UUID REFERENCES family_events(id) ON DELETE CASCADE, -- For recurrence exceptions

    -- Attendees (family members)
    attendees UUID[] DEFAULT '{}', -- Array of family_member IDs

    -- Integration Links
    google_event_id TEXT, -- For Google Calendar sync
    source TEXT DEFAULT 'manual' CHECK (source IN (
        'manual', 'google', 'meal_plan', 'shopping', 'gift_occasion', 'recurring'
    )),
    source_id UUID, -- Link to meal_plan, shopping_order, gift_list, etc.

    -- Reminders
    reminder_minutes INT[], -- Array of reminder times (e.g., [30, 60, 1440])

    -- Metadata
    color TEXT, -- Override calendar color
    is_private BOOLEAN DEFAULT false, -- Only show to attendees
    created_by UUID REFERENCES family_members(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_family_events_calendar ON family_events(calendar_id);
CREATE INDEX IF NOT EXISTS idx_family_events_start ON family_events(start_time);
CREATE INDEX IF NOT EXISTS idx_family_events_type ON family_events(event_type);
CREATE INDEX IF NOT EXISTS idx_family_events_google ON family_events(google_event_id);
CREATE INDEX IF NOT EXISTS idx_family_events_source ON family_events(source, source_id);
CREATE INDEX IF NOT EXISTS idx_family_events_recurring ON family_events(is_recurring) WHERE is_recurring = true;

-- ─────────────────────────────────────────────────────────────────────────────
-- GOOGLE CALENDAR OAUTH TOKENS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS google_calendar_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    google_email TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_expiry TIMESTAMPTZ NOT NULL,
    scopes TEXT[] DEFAULT ARRAY['https://www.googleapis.com/auth/calendar'],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, family_id, google_email)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_google_tokens_user ON google_calendar_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_google_tokens_family ON google_calendar_tokens(family_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- EVENT RSVPS (For Attendee Responses)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS family_event_rsvps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES family_events(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'tentative')),
    responded_at TIMESTAMPTZ,
    notes TEXT,
    UNIQUE(event_id, member_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event ON family_event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_member ON family_event_rsvps(member_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY POLICIES
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE family_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_calendar_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_event_rsvps ENABLE ROW LEVEL SECURITY;

-- CALENDARS: Family members can view calendars
CREATE POLICY "Members can view family calendars"
    ON family_calendars FOR SELECT
    USING (
        family_id IN (
            SELECT family_id FROM family_members
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- CALENDARS: Members can create calendars
CREATE POLICY "Members can create calendars"
    ON family_calendars FOR INSERT
    WITH CHECK (
        family_id IN (
            SELECT family_id FROM family_members
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- CALENDARS: Creators can update their calendars
CREATE POLICY "Creators can update calendars"
    ON family_calendars FOR UPDATE
    USING (
        created_by IN (
            SELECT id FROM family_members WHERE user_id = auth.uid()
        )
        OR family_id IN (
            SELECT family_id FROM family_members
            WHERE user_id = auth.uid() AND role = 'founder'
        )
    );

-- EVENTS: Family members can view events
CREATE POLICY "Members can view family events"
    ON family_events FOR SELECT
    USING (
        calendar_id IN (
            SELECT fc.id FROM family_calendars fc
            JOIN family_members fm ON fc.family_id = fm.family_id
            WHERE fm.user_id = auth.uid() AND fm.is_active = true
        )
        AND (
            -- Public events or user is attendee
            is_private = false
            OR created_by IN (SELECT id FROM family_members WHERE user_id = auth.uid())
            OR (SELECT id FROM family_members WHERE user_id = auth.uid()) = ANY(attendees)
        )
    );

-- EVENTS: Members can create events
CREATE POLICY "Members can create events"
    ON family_events FOR INSERT
    WITH CHECK (
        calendar_id IN (
            SELECT fc.id FROM family_calendars fc
            JOIN family_members fm ON fc.family_id = fm.family_id
            WHERE fm.user_id = auth.uid() AND fm.is_active = true
        )
    );

-- EVENTS: Creators can update their events
CREATE POLICY "Creators can update events"
    ON family_events FOR UPDATE
    USING (
        created_by IN (
            SELECT id FROM family_members WHERE user_id = auth.uid()
        )
    );

-- EVENTS: Creators can delete their events
CREATE POLICY "Creators can delete events"
    ON family_events FOR DELETE
    USING (
        created_by IN (
            SELECT id FROM family_members WHERE user_id = auth.uid()
        )
    );

-- GOOGLE TOKENS: Users can only see their own tokens
CREATE POLICY "Users can view their own tokens"
    ON google_calendar_tokens FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own tokens"
    ON google_calendar_tokens FOR ALL
    USING (user_id = auth.uid());

-- EVENT RSVPS: Members can view RSVPs
CREATE POLICY "Members can view RSVPs"
    ON family_event_rsvps FOR SELECT
    USING (
        event_id IN (
            SELECT fe.id FROM family_events fe
            JOIN family_calendars fc ON fe.calendar_id = fc.id
            JOIN family_members fm ON fc.family_id = fm.family_id
            WHERE fm.user_id = auth.uid() AND fm.is_active = true
        )
    );

-- EVENT RSVPS: Members can manage their own RSVPs
CREATE POLICY "Members can manage their RSVPs"
    ON family_event_rsvps FOR ALL
    USING (
        member_id IN (
            SELECT id FROM family_members WHERE user_id = auth.uid()
        )
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- HELPER FUNCTIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- Function to create events from meal plans
CREATE OR REPLACE FUNCTION create_meal_plan_events(
    p_family_id UUID,
    p_meal_plan_id UUID,
    p_meal_date DATE,
    p_meal_slot TEXT, -- 'breakfast', 'lunch', 'dinner'
    p_meal_title TEXT
)
RETURNS UUID AS $$
DECLARE
    v_calendar_id UUID;
    v_event_id UUID;
    v_start_time TIMESTAMPTZ;
BEGIN
    -- Get default family calendar
    SELECT id INTO v_calendar_id
    FROM family_calendars
    WHERE family_id = p_family_id AND is_default = true
    LIMIT 1;

    -- If no default, get first calendar
    IF v_calendar_id IS NULL THEN
        SELECT id INTO v_calendar_id
        FROM family_calendars
        WHERE family_id = p_family_id
        LIMIT 1;
    END IF;

    -- If still no calendar, can't create event
    IF v_calendar_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Determine start time based on slot
    v_start_time := p_meal_date::timestamp + CASE p_meal_slot
        WHEN 'breakfast' THEN INTERVAL '8 hours'
        WHEN 'lunch' THEN INTERVAL '12 hours'
        WHEN 'dinner' THEN INTERVAL '18 hours'
        ELSE INTERVAL '12 hours'
    END;

    -- Create the event
    INSERT INTO family_events (
        calendar_id, title, event_type, start_time, end_time,
        source, source_id
    ) VALUES (
        v_calendar_id,
        p_meal_title,
        'meal',
        v_start_time,
        v_start_time + INTERVAL '1 hour',
        'meal_plan',
        p_meal_plan_id
    ) RETURNING id INTO v_event_id;

    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create events from gift list occasions
CREATE OR REPLACE FUNCTION create_gift_occasion_event(
    p_gift_list_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_list RECORD;
    v_calendar_id UUID;
    v_event_id UUID;
    v_member_name TEXT;
BEGIN
    -- Get the gift list
    SELECT gl.*, fm.nickname INTO v_list
    FROM family_gift_lists gl
    JOIN family_members fm ON gl.owner_id = fm.id
    WHERE gl.id = p_gift_list_id;

    IF v_list.occasion_date IS NULL THEN
        RETURN NULL;
    END IF;

    -- Get default family calendar
    SELECT id INTO v_calendar_id
    FROM family_calendars
    WHERE family_id = v_list.family_id AND is_default = true
    LIMIT 1;

    IF v_calendar_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Create the event
    INSERT INTO family_events (
        calendar_id,
        title,
        event_type,
        start_time,
        all_day,
        source,
        source_id
    ) VALUES (
        v_calendar_id,
        v_list.nickname || '''s ' || COALESCE(v_list.occasion, 'Gift Day'),
        CASE v_list.occasion
            WHEN 'birthday' THEN 'birthday'
            WHEN 'anniversary' THEN 'anniversary'
            WHEN 'holiday' THEN 'holiday'
            ELSE 'custom'
        END,
        v_list.occasion_date::timestamp,
        true,
        'gift_occasion',
        p_gift_list_id
    ) RETURNING id INTO v_event_id;

    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATED_AT TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS trigger_calendars_updated_at ON family_calendars;
CREATE TRIGGER trigger_calendars_updated_at
    BEFORE UPDATE ON family_calendars
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_events_updated_at ON family_events;
CREATE TRIGGER trigger_events_updated_at
    BEFORE UPDATE ON family_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_google_tokens_updated_at ON google_calendar_tokens;
CREATE TRIGGER trigger_google_tokens_updated_at
    BEFORE UPDATE ON google_calendar_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- AUTO-CREATE DEFAULT CALENDAR FOR NEW FAMILIES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION create_default_family_calendar()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO family_calendars (family_id, name, is_default, color)
    VALUES (NEW.id, NEW.name || ' Calendar', true, '#3B82F6');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_create_default_calendar ON families;
CREATE TRIGGER trigger_create_default_calendar
    AFTER INSERT ON families
    FOR EACH ROW
    EXECUTE FUNCTION create_default_family_calendar();
