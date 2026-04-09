# Knight Session 71 Prompt — LB Calendar + Beacon Two-Bite Teaching + HexIsle Ghost Storefronts
## Three foundational UX systems
## Innovation Count: 1,896
## Priority: HIGH — Calendar is a membership benefit, Beacons are the save/organize system, Ghost World is the discovery layer

---

## Task 1: Beacon System — Two-Bite Teaching

**Innovations:** #1861-#1864
**This is the platform's save/organize/return mechanic. It touches EVERYTHING.**

### 1A: Beacon Data Model

Create migration `20260322000003_beacons.sql`:

```sql
CREATE TABLE IF NOT EXISTS member_beacons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id),
  beacon_type TEXT NOT NULL, -- 'save_later', 'not_interested', 'share', 'important', 'permanent'
  beacon_color TEXT NOT NULL, -- 'gold', 'gray', 'blue', 'star', 'purple'
  target_type TEXT NOT NULL, -- 'page', 'storefront', 'article', 'treasure_map', 'design', 'crew_table'
  target_id TEXT NOT NULL, -- route path or entity UUID
  target_title TEXT NOT NULL, -- display name
  status TEXT DEFAULT 'active', -- 'active', 'sleeping', 'picked_up', 'expired'
  expires_at TIMESTAMPTZ, -- null for permanent beacons
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE member_beacons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members manage own beacons" ON member_beacons
  FOR ALL USING (auth.uid() = member_id);
```

### 1B: Denken Component

Create `src/components/Denken.tsx`:

**Collapsed state:** Small avatar icon in bottom-right corner (like a chat widget, but it's Denken). Shows beacon count badge if active beacons exist.

**Expanded state (click to open):**
```
┌─ Denken's Toolkit ──────────────────────┐
│                                          │
│  💛 Saved for Later (3)                  │
│  ├── Benefits Sheet                [→]   │
│  ├── Breakfast Runner Map          [→]   │
│  └── Joe's Donuts Menu             [→]   │
│                                          │
│  ⭐ Important (1)                        │
│  └── My Subscription Dashboard     [→]   │
│                                          │
│  📌 Permanent (2)                        │
│  ├── My Family Calendar            [→]   │
│  └── Runner Dashboard              [→]   │
│                                          │
│  💙 Shared (1)                           │
│  └── Sent: Defense Klaus → Mom     [→]   │
│                                          │
│  [Clear Sleeping]  [Manage All]          │
└──────────────────────────────────────────┘
```

Clicking any item → navigates to that page/entity.

### 1C: Bite 1 — First Encounter (After Slideshow)

**Trigger:** First time a new member sees the Benefits Sheet page (after the Welcome slideshow).

**Implementation:** Check `member_beacons` for the current user. If zero beacons exist, trigger the Bite 1 tutorial.

**Flow:**
1. Benefits Sheet renders normally
2. After 2-second delay, Denken avatar slides in from bottom-right
3. Speech bubble appears above Denken: "Want to save this for later? Drop a beacon." 💛
4. A pulsing 💛 button appears on the Benefits Sheet (anchored to the page title area)
5. **Demo-n-Action:** If user doesn't click within 5 seconds, Denken's hand animates pointing to the button. If they still don't click, the demo auto-clicks it.
6. Benefits Sheet slides toward Denken with a smooth animation (scale down + translate)
7. Denken catches it — avatar blinks the gold beacon color once
8. Speech bubble: "Got it. Click me anytime to get it back."
9. Short pause (1.5s)
10. Speech bubble: "Now you try — click me!"
11. User clicks Denken → expanded panel shows the saved Benefits Sheet → clicking it navigates back
12. Speech bubble: "Nice! You can drop beacons on anything."
13. Two buttons: **[OK Let's Roll]** — dismisses tutorial. **[Show Me Again]** — replays from step 3.

**Store tutorial completion:** `localStorage` flag `beacon_bite1_complete = true`

### 1D: Bite 2 — Full Palette (On Second Beacon Attempt)

**Trigger:** User tries to drop a beacon on something OTHER than the Benefits Sheet (any page with a beacon-droppable target). Check: `beacon_bite1_complete === true && beacon_bite2_complete !== true`.

**Flow:**
1. Side panel slides open from right
2. Header: "You know 💛 Save for Later. Here's the full toolkit:"
3. Shows 5 beacon types with colors and one-line descriptions:
   - 💛 **Save for Later** — "I want to come back to this"
   - ❌ **Don't Bother** — "Not interested, don't show again"  
   - 💙 **Share This** — "Send to someone"
   - ⭐ **Important** — "Pin this high in my list"
   - 📌 **Permanent** — "Always keep this accessible"
4. **[Got It]** button closes panel
5. Store: `beacon_bite2_complete = true`

### 1E: Beacon Drop Button (Universal)

Every page/entity that can be beaconed gets a small beacon icon in the top-right area (near the page title or card header).

- Default: subtle outline icon (not distracting)
- Hover: fills with gold
- Click: opens beacon type selector (5 options)
- Select type → beacon created → Denken badge count updates
- If the item already has a beacon: icon shows that beacon's color. Click → options: change type, pick up (remove), sleep.

**Pages that should be beacon-droppable:**
- All storefront menu pages (`/menu/:slug`)
- All treasure map pages
- All initiative pedestal pages
- All articles on Cephas
- Benefits Sheet
- Subscription page
- Crown Letter Update pages
- Any Emporium/Arena listing

---

## Task 2: LB Calendar (Cal.com Fork)

**Innovations:** #1859, #1865-#1868

### 2A: Cal.com Integration Approach

**DO NOT fork Cal.com source code.** Instead, use Cal.com's embed SDK:

```bash
npm install @calcom/embed-react
```

Cal.com provides an embeddable scheduling widget. We wrap it in LB branding and connect it to our data.

**Alternative if Cal.com embed is too limited:** Use FullCalendar.io (MIT licensed React calendar component) + our own backend. This gives us full control.

**Recommendation: FullCalendar.io.** It's a React component, MIT licensed, highly customizable, and we don't need Cal.com's booking features — we need a CALENDAR VIEW with pluggable data sources.

```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
```

### 2B: Calendar Page

Create `src/pages/Calendar.tsx`:
- Route: `/calendar`
- Layout: PortalPageLayout
- FullCalendar component with day/week/month views

### 2C: Calendar Events Data Model

Create migration `20260322000004_calendar.sql`:

```sql
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  calendar_type TEXT NOT NULL, -- 'personal', 'family', 'business', 'coalition', 'route', 'defense', 'education'
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT false,
  recurrence_rule TEXT, -- iCal RRULE format: 'FREQ=WEEKLY;BYDAY=MO,WE,FR'
  location TEXT,
  color TEXT, -- hex color for display
  source_type TEXT, -- 'manual', 'storefront', 'subscription', 'order_cutoff', 'delivery_window'
  source_id UUID, -- links to storefront, subscription, etc.
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Shared calendar access (family members, Coalition partners, etc.)
CREATE TABLE IF NOT EXISTS calendar_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_owner_id UUID NOT NULL REFERENCES auth.users(id),
  calendar_type TEXT NOT NULL,
  shared_with_id UUID NOT NULL REFERENCES auth.users(id),
  permission TEXT DEFAULT 'view', -- 'view', 'edit'
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own events" ON calendar_events
  FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Shared users can view" ON calendar_events
  FOR SELECT USING (
    owner_id IN (
      SELECT calendar_owner_id FROM calendar_shares 
      WHERE shared_with_id = auth.uid() AND calendar_type = calendar_events.calendar_type
    )
  );
CREATE POLICY "Members manage own shares" ON calendar_shares
  FOR ALL USING (auth.uid() = calendar_owner_id);
```

### 2D: Plug System (Auto-Populated Events)

**Storefront Plug:** When a storefront is created/updated, auto-create calendar events:
- Business hours (recurring daily events)
- Order cutoff time (recurring, marked as deadline)
- Delivery window (recurring)

**Subscription Plug:** When a member has active subscriptions:
- Delivery days (recurring weekly)
- "Choose your meals" reminder (day before cutoff)

**Route Plug:** For Runners:
- Tomorrow's pickups and deliveries as time-blocked events
- Auto-generated from `menu_orders` for the delivery date

**Implementation:** Edge function `sync-calendar-events` that runs when storefronts, subscriptions, or orders change. Creates/updates corresponding `calendar_events` rows with `source_type` and `source_id` linking back to the origin.

### 2E: Calendar Toggle Plugs UI

On the Calendar page, left sidebar shows toggleable plugs:

```
CALENDARS:
  ☑ 📅 Personal
  ☑ 👨‍👩‍👧‍👦 Family (Jones)
  ☑ 🍩 Joe's Donuts (business)
  ☐ 🤝 Downtown Coalition
  ☑ 🚚 My Delivery Route
  ☐ 🛡️ Defense Klaus
  ☐ 📚 Didasko Tutoring

[+ Add Calendar]
```

Toggle on/off to show/hide event types. Each calendar has its own color.

---

## Task 3: HexIsle Ghost World — Storefront Buildings

**Innovations:** #1857-#1858, #1869-#1875

### 3A: Ghost World Map Page

Create `src/pages/GhostWorld.tsx`:
- Route: `/ghost-world` (or `/hexisle/explore`)
- Full-screen map view (no PortalPageLayout — immersive)

**Phase 1 (build NOW):** 2D hex grid with clickable building icons. Not full 3D — that's future.

**Implementation:** Use a hex grid library (honeycomb-grid or custom SVG) to render islands based on Node data.

### 3B: Island Generation from Storefronts

Each island is generated from the `storefronts` table:

```sql
-- View that groups storefronts by area for island generation
CREATE VIEW ghost_world_islands AS
SELECT 
  business_location as area,
  COUNT(*) as storefront_count,
  ARRAY_AGG(id) as storefront_ids,
  ARRAY_AGG(business_name) as business_names,
  ARRAY_AGG(business_category) as categories
FROM storefronts
WHERE is_active = true
GROUP BY business_location;
```

### 3C: Island Visual

Each island is a hex cluster:
- Center hex: Node info (name, member count, Captain if assigned)
- Surrounding hexes: one per storefront (building icon + name)
- Building icon matches category (🍩 food, 🔧 service, 🛒 retail, 🎨 creative)
- Building SIZE: proportional to monthly order volume (bigger = more popular)
- Coalition connections: gold lines between islands that share a Coalition

### 3D: Click-Through to Real Storefronts

Click a building on Ghost World → popup shows:
- Business name + category
- "Open today: 6 AM - 2 PM"
- "23 pre-orders for tomorrow" (social proof)
- Star rating
- **[View Menu]** → navigates to `/menu/:slug`
- **[Drop a Beacon 💛]** → saves for later via beacon system

**Ghost browsing (non-members):** Can explore, click buildings, see info. "View Menu" works (menus are public). "Order" requires Stripe checkout (guest or member).

### 3E: Pop-Up Kiosks (Deck Cards)

When a business places a Pop-Up on another island (#1869-#1870):
- Small booth icon appears on the target island (distinct from home buildings)
- Labeled: "[Business Name] — Pop-Up"
- Duration countdown: "Here for 12 more days"
- Click → same popup as home building, but with "Pop-Up from [home island]" tag

**For Phase 1:** Pop-ups are manual (admin-placed via database). Self-service Deck Card placement is Phase 2.

---

## Task 4: Add Calendar + Ghost World to Navigation

- Calendar: sidebar entry under "My Tools" or "Personal"
- Ghost World: sidebar entry under "Explore" or top-level
- Both should also be on the Benefits Sheet (#1860)

---

## Task 5: Innovation Count → 1,896

Update `useCanonicalStats.ts`.

---

## Build Order

```
Task 1A-1B (Beacon data + Denken component) → FIRST (everything else uses beacons)
Task 1C (Bite 1 tutorial) → after 1B
Task 1D-1E (Bite 2 + universal beacon button) → after 1C

Task 2A-2C (Calendar page + data model) → PARALLEL with Task 1
Task 2D-2E (Plugs + toggle UI) → after 2C

Task 3A-3C (Ghost World map + islands) → PARALLEL with Tasks 1-2
Task 3D-3E (Click-through + Pop-ups) → after 3C

Task 4 (Navigation) → after all above
Task 5 (Count) → any time
```

**Estimated scope:** 2-3 Knight sessions. Beacons first (they're used everywhere). Calendar and Ghost World can parallel.

---

## Key Verification

Before building beacons, Knight should check the existing Wildfire Beacon Tour code to see if any beacon infrastructure already exists:
- Search for `beacon` in `src/`
- Check if Wildfire Tours use a beacon data model
- If existing infrastructure exists, EXTEND it rather than replacing

---

**FOR THE KEEP.**
