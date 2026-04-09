# Knight Session 72 — LB Calendar with FullCalendar.io
## Innovation Count: 1,897
## Priority: HIGH — Calendar is a core membership benefit
## Depends on: Session 71 (Beacons) should be complete first

---

> **EVALUATION RESULT (Bishop 020):** FullCalendar.io is the CLEAR winner over Cal.com. Cal.com is a booking platform (wrong tool). FullCalendar is a true React component, MIT-licensed free tier covers 4/6 plugs. See `BISHOP_DROPZONE/EVAL_FULLCALENDAR_VS_CALCOM.md` for full analysis.

---

## Task 1: Install FullCalendar

```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction @fullcalendar/list @fullcalendar/rrule rrule
```

These are ALL MIT-licensed (free tier). Premium plugins (timeline, resource) are NOT needed yet — those are for Route and Defense scheduling (Phase 2).

---

## Task 2: Calendar Data Model

Create migration `20260323000001_calendar.sql`:

```sql
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  calendar_type TEXT NOT NULL CHECK (calendar_type IN ('personal', 'family', 'business', 'coalition', 'route', 'defense', 'education')),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT false,
  recurrence_rule TEXT, -- iCal RRULE format
  location TEXT,
  color TEXT,
  source_type TEXT CHECK (source_type IN ('manual', 'storefront', 'subscription', 'order_cutoff', 'delivery_window', 'beacon')),
  source_id UUID,
  is_private BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS calendar_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_owner_id UUID NOT NULL REFERENCES auth.users(id),
  calendar_type TEXT NOT NULL,
  shared_with_id UUID NOT NULL REFERENCES auth.users(id),
  permission TEXT DEFAULT 'view' CHECK (permission IN ('view', 'edit')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(calendar_owner_id, calendar_type, shared_with_id)
);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_shares ENABLE ROW LEVEL SECURITY;

-- Owner full access
CREATE POLICY "owners_manage_events" ON calendar_events
  FOR ALL USING (auth.uid() = owner_id);

-- Shared users can view
CREATE POLICY "shared_users_view" ON calendar_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM calendar_shares 
      WHERE shared_with_id = auth.uid() 
        AND calendar_owner_id = calendar_events.owner_id 
        AND calendar_type = calendar_events.calendar_type
    )
  );

-- Admin full access
CREATE POLICY "admin_manage_events" ON calendar_events
  FOR ALL USING (public.is_admin());

CREATE POLICY "owners_manage_shares" ON calendar_shares
  FOR ALL USING (auth.uid() = calendar_owner_id);

CREATE INDEX idx_calendar_events_owner ON calendar_events(owner_id);
CREATE INDEX idx_calendar_events_type ON calendar_events(calendar_type);
CREATE INDEX idx_calendar_events_start ON calendar_events(start_time);
```

---

## Task 3: Calendar Page

Create `src/pages/Calendar.tsx`:
- Route: `/calendar` (protected)
- Layout: PortalPageLayout with `maxWidth="xl"` (calendars need width)

**Left sidebar (collapsible on mobile):**
```
MY CALENDARS:
  ☑ 📅 Personal          (custom color picker)
  ☑ 👨‍👩‍👧‍👦 Family           (emerald)
  ☐ 🍩 Joe's Donuts      (amber — auto from storefront)
  ☐ 🤝 Downtown Coalition (purple — auto from coalition)
  ☑ 🚚 My Delivery Route  (blue — auto from runner dashboard)

[+ Add Calendar]
[Share Calendar...]
```

**Main area:** FullCalendar component
- Default view: `dayGridMonth`
- Toggle buttons: Month | Week | Day | List
- Click on date → create event dialog
- Click on event → view/edit dialog
- Drag to resize/move events

**Service layer:** `src/lib/calendarService.ts`
- `fetchEvents(userId, calendarTypes[], dateRange)` → queries calendar_events
- `createEvent(event)` → inserts
- `updateEvent(id, changes)` → updates
- `deleteEvent(id)` → deletes
- `shareCalendar(calendarType, shareWithId, permission)` → creates share
- `getSharedCalendars(userId)` → lists calendars shared with this user

---

## Task 4: Auto-Populated Business Events

Create `src/lib/calendarSync.ts`:

When a storefront is created or updated, auto-create calendar events:
- **Order cutoff**: recurring daily event at the cutoff time (e.g., midnight), color: red, source_type: 'order_cutoff'
- **Delivery window**: recurring daily event for the delivery time slot, color: blue, source_type: 'delivery_window'
- **Business hours**: if storefront has hours data, recurring events, color: storefront theme color

When a Runner has deliveries scheduled for tomorrow:
- Create time-blocked events from `menu_orders` for that delivery date
- Each event: pickup time + delivery route stop

**Implementation:** This can be a client-side sync function that runs when the Calendar page loads, checking for missing auto-events and creating them. OR an edge function triggered by storefront/order changes.

**Recommendation:** Client-side sync for Phase 1 (simpler). Edge function for Phase 2 (real-time).

---

## Task 5: Event Create/Edit Dialog

Create `src/components/CalendarEventDialog.tsx`:
- Title, description, start/end time pickers
- All-day toggle
- Calendar type dropdown (only calendars the user owns)
- Recurrence picker: None, Daily, Weekly (pick days), Monthly, Custom RRULE
- Color picker
- Location (text input)
- Private toggle
- Save / Cancel / Delete

---

## Task 6: Calendar in Navigation

- Sidebar: add "Calendar" entry under appropriate section
- Homepage: show next 3 upcoming events in a compact widget (optional, if time permits)

---

## Task 7: Innovation Count → 1,897

Update `useCanonicalStats.ts` default to 1,897.

---

## Build Order

```
Task 2 (migration) → FIRST
Task 3 (Calendar page + service) → after migration
Task 5 (Event dialog) → after page renders
Task 4 (Auto-populated events) → after dialog works
Task 6 (Navigation) → after all above
Task 7 (Count) → any time
```

---

## Key Notes

- Do NOT install Cal.com packages — we evaluated it and it's the wrong tool
- Use FullCalendar's `eventSources` prop to separate calendar types with different colors
- The RRule plugin handles complex recurrence for free (MIT licensed)
- Mobile: FullCalendar's `listWeek` view is the best mobile fallback — calendar grids are cramped on phones
- Supabase real-time subscriptions can power live calendar updates (Phase 2)

---

**FOR THE KEEP.**
