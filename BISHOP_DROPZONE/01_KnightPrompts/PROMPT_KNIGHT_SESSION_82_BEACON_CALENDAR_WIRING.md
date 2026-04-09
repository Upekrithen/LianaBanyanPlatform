# KNIGHT SESSION 82 — Beacon + Calendar Wiring
## Bishop 025 | March 22, 2026
## Innovation Count: 1,935 (unchanged — wiring session)

---

## MISSION

Connect the Beacon system and the Calendar system so they talk to each other, and wire both to Commerce Engine events. Currently all three systems work independently. After this session, completing a beacon logs a calendar event, placing an order creates a delivery calendar event in real-time, and the calendar shows a unified view of platform activity.

---

## CONTEXT: WHAT EXISTS

| System | Status | Key Files |
|--------|--------|-----------|
| Personal Beacons | ✅ LIVE | `beacons.ts`, `BeaconDropButton.tsx` |
| Snow Door Beacon Chain | ✅ LIVE (7 beacons, Joules + Deck Card rewards) | `beaconPoints.ts` |
| Wildfire Beacon Tours | ✅ LIVE (4 modes, Golden Keys gating) | `WildfireBeaconRun.tsx` |
| Two-Bite Teaching | ✅ Bite 1 LIVE | `BeaconBiteNudge.tsx` |
| FullCalendar | ✅ LIVE (CRUD, drag-drop, 7 types) | `Calendar.tsx`, `calendarService.ts` |
| Calendar Sync | ✅ Client-side on page load | `calendarSync.ts` |
| Calendar Sharing | ✅ LIVE | `calendarService.ts` (shareCalendar) |
| Family Calendar | ✅ LIVE (separate component) | `FamilyCalendar.tsx` |
| Commerce Engine | ✅ LIVE (full earn loop) | `stripe-webhook`, `distribute-order-earnings` |

---

## TASK 1: Calendar Plug Registry

Create `src/lib/calendarPlugs.ts` — a plug configuration system for calendar types.

```typescript
export interface CalendarPlug {
  id: string;           // 'personal' | 'family' | 'business' | 'coalition' | 'route' | 'defense' | 'education'
  label: string;
  emoji: string;
  color: string;
  description: string;
  autoSources: string[]; // what auto-populates this calendar type
  editable: boolean;     // can user manually add events to this type
}

export const CALENDAR_PLUGS: CalendarPlug[] = [
  {
    id: 'personal',
    label: 'Personal',
    emoji: '📌',
    color: '#6366f1',
    description: 'Your personal events and reminders',
    autoSources: ['beacon_completion', 'wildfire_tour'],
    editable: true
  },
  {
    id: 'family',
    label: 'Family',
    emoji: '👨‍👩‍👧‍👦',
    color: '#ec4899',
    description: 'Family events, birthdays, appointments',
    autoSources: [],
    editable: true
  },
  {
    id: 'business',
    label: 'Business',
    emoji: '🏪',
    color: '#f97316',
    description: 'Storefront hours, order cutoffs, business meetings',
    autoSources: ['storefront_cutoff', 'storefront_hours'],
    editable: true
  },
  {
    id: 'coalition',
    label: 'Coalition',
    emoji: '🤝',
    color: '#14b8a6',
    description: 'Coalition events, joint promotions, alliance meetings',
    autoSources: ['coalition_event'],
    editable: true
  },
  {
    id: 'route',
    label: 'Route',
    emoji: '🚗',
    color: '#eab308',
    description: 'Delivery windows, pickup times, route schedules',
    autoSources: ['delivery_window', 'order_pickup'],
    editable: true
  },
  {
    id: 'defense',
    label: 'Defense',
    emoji: '⚖️',
    color: '#ef4444',
    description: 'Star Chamber hearings, Defense Klaus deadlines',
    autoSources: ['star_chamber_hearing'],
    editable: false  // system-generated only
  },
  {
    id: 'education',
    label: 'Education',
    emoji: '📚',
    color: '#8b5cf6',
    description: 'Didasko classes, quiz deadlines, certification dates',
    autoSources: ['quiz_completion', 'certification'],
    editable: true
  }
];
```

Update `Calendar.tsx` to use this registry instead of the hardcoded calendar type config. The toggle sidebar should render from `CALENDAR_PLUGS`.

---

## TASK 2: Beacon → Calendar Events

### 2A: Snow Door Beacon Completion → Calendar

In `beaconPoints.ts`, after the `completeBeacon()` function succeeds:

1. Call `calendarService.createEvent()` with:
   - `calendar_type: 'personal'`
   - `title: 'Beacon ${beaconNumber} Completed: ${beaconName}'`
   - `source_type: 'beacon'`
   - `source_id: beaconPoint.id`
   - `start_time: now()`
   - `end_time: now() + 1 hour` (placeholder duration)
   - `color: '#22c55e'` (green for completion)
   - `metadata: { beacon_number, joules_earned, snowflake_keys_earned }`

2. If it's Beacon 7 (Summit — full chain complete), also create a milestone event:
   - `title: 'Snow Door Complete — Teleportation Deck Card Earned!'`
   - `color: '#eab308'` (gold)

### 2B: Wildfire Tour → Calendar

In `WildfireBeaconRun.tsx`, wire two calendar events:

1. **Tour Start** — when user begins a Wildfire run:
   - `title: 'Wildfire Tour: ${runName}'`
   - `calendar_type: 'personal'`
   - `source_type: 'beacon'`
   - `start_time: now()`

2. **Tour Complete** — when user finishes (in the end-choices dialog):
   - Update the start event with actual `end_time`
   - Add `metadata: { nodes_visited, mode, duration_seconds }`

Only create calendar events for logged-in users (ghost users skip this).

---

## TASK 3: Commerce → Calendar (Real-Time Edge Function)

### 3A: Create Edge Function `calendar-sync-commerce`

Create `supabase/functions/calendar-sync-commerce/index.ts`:

This function is called from existing edge functions (stripe-webhook, distribute-order-earnings) to create calendar events when commerce events occur.

```typescript
// Called with: { event_type, user_id, metadata }
// event_type: 'order_placed' | 'order_paid' | 'delivery_scheduled' | 'earnings_distributed'

// For order_placed:
//   Create route calendar event for the Runner:
//   "Delivery: [storefront_name] → [order count] items"
//   start_time = storefront delivery_window_start
//   calendar_type = 'route'

// For order_paid:
//   Create business calendar event for the storefront owner:
//   "Payment received: $X from [order_id]"
//   calendar_type = 'business'

// For earnings_distributed:
//   Create business calendar event:
//   "Earnings split: Creator $X, Onboarder $X, Steward $X"
//   calendar_type = 'business'
```

### 3B: Wire Calls

In `stripe-webhook/index.ts` — after `handleMenuOrder()` marks the order paid, call `calendar-sync-commerce` with `event_type: 'order_paid'`.

In `distribute-order-earnings/index.ts` — after splits are calculated, call `calendar-sync-commerce` with `event_type: 'earnings_distributed'`.

Use the same internal call pattern as `fund-lb-card` (fetch with `x-system-key` header).

### 3C: Replace Client-Side Sync

In `calendarSync.ts`, the current `runCalendarSync()` runs on Calendar page load and creates events client-side. After this edge function is deployed:

1. Keep `runCalendarSync()` as a fallback for any events missed by the edge function
2. Add a `last_synced_at` check so it only processes events newer than the last sync
3. Add a comment: `// Phase 2: This will be fully replaced by calendar-sync-commerce edge function`

---

## TASK 4: Star Chamber → Calendar

When a Star Chamber case is filed (in the existing case filing handler):

1. Create a `defense` calendar event:
   - `title: 'Star Chamber Case Filed: ${case_type}'`
   - `calendar_type: 'defense'`
   - `source_type: 'star_chamber'`
   - `source_id: case.id`
   - `start_time: now()`
   - `is_private: true` (only visible to case participants)
   - `metadata: { case_id, case_type, severity }`

2. When admin renders verdict, update the event:
   - `title: 'Star Chamber Verdict: ${verdict}' `
   - Set `end_time` to verdict timestamp

This wires Defense Klaus into the calendar automatically.

---

## TASK 5: Calendar Summary on Helm

Add a "Today's Schedule" card to TheHelm.tsx:

1. Fetch today's calendar events for the current user (all types they have toggled on)
2. Show a compact list: time, emoji (from plug config), title
3. Max 5 events shown, "View All →" links to `/calendar`
4. If no events today, show: "Nothing scheduled. Drop a beacon to start exploring."

Keep it lightweight — one card in the existing Helm grid.

---

## FILES TO CREATE

| File | Purpose |
|------|---------|
| `src/lib/calendarPlugs.ts` | Calendar plug registry |
| `supabase/functions/calendar-sync-commerce/index.ts` | Real-time commerce → calendar sync |

## FILES TO MODIFY

| File | Change |
|------|--------|
| `src/pages/Calendar.tsx` | Use plug registry for type config + toggle sidebar |
| `src/lib/beaconPoints.ts` | Add calendar event on beacon completion |
| `src/components/WildfireBeaconRun.tsx` | Add calendar events on tour start/complete |
| `supabase/functions/stripe-webhook/index.ts` | Call calendar-sync-commerce after order_paid |
| `supabase/functions/distribute-order-earnings/index.ts` | Call calendar-sync-commerce after splits |
| Star Chamber case filing handler | Add defense calendar event on case filed + verdict |
| `src/pages/TheHelm.tsx` | Add "Today's Schedule" card |
| `src/lib/calendarSync.ts` | Add last_synced_at check, Phase 2 comment |

## DO NOT TOUCH

- `FamilyCalendar.tsx` — separate system, leave it alone
- `BeaconBiteNudge.tsx` — Two-Bite Teaching works, no changes
- `TreasureMapGame.tsx` — 52-card game is separate
- `calendarService.ts` — CRUD functions are fine, just use them

---

## DEPLOY CHECKLIST

1. Deploy `calendar-sync-commerce` edge function
2. Deploy updated `stripe-webhook` and `distribute-order-earnings`
3. Deploy frontend to Firebase
4. Test: Complete a beacon → check calendar for green event
5. Test: Place an order → check runner's route calendar for delivery event
6. Test: File Star Chamber case → check defense calendar for case event
7. Test: Helm shows "Today's Schedule" with any of the above

---

## SUCCESS CRITERIA

- [ ] Calendar plug registry drives the Calendar page UI
- [ ] Beacon completions auto-create calendar events (personal type, green)
- [ ] Wildfire tour start/end logged as calendar events
- [ ] Commerce events (order paid, earnings distributed) create calendar events via edge function
- [ ] Star Chamber cases create defense calendar events (private)
- [ ] Helm shows "Today's Schedule" card with today's events
- [ ] No duplicate events (dedup by source_type + source_id)

---

**Three systems that worked alone now work together. Every action on the platform shows up on the calendar. The calendar becomes the heartbeat.**

**FOR THE KEEP.**
