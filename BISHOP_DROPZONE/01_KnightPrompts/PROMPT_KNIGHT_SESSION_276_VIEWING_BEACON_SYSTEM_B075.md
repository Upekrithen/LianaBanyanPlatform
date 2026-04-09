# KNIGHT SESSION 276 — Scheduled Viewing Beacon System
## Bishop B075 | April 4, 2026

---

## MISSION

Build the Scheduled Viewing Beacon — a member-controlled content scheduling system that lets members add future content viewings to their Helm Calendar via a tooltip-style entry box, using the shared scheduling primitive also used by Cue Card Battery Dispatch and Staff TV Broadcast Schedule.

---

## CONTEXT

**The core insight**: ONE scheduling primitive, THREE surfaces:
1. Cue Card Battery Dispatch (individual cue cards)
2. Staff TV Broadcast Schedule (Social Media Dashboard)
3. Scheduled Viewing Beacon (member content scheduling) ← THIS ONE

Same underlying code, different contexts.

**The UX pattern**: Like a phone alarm. Click "Schedule Viewing" on any Pudding/Episode/Spoonful → tooltip-style entry box appears asking: time, date, repeating, when-to-remind → saves to member's Helm Calendar.

---

## STEP 1: Database Schema

```sql
CREATE TABLE IF NOT EXISTS viewing_beacons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('pudding', 'bst_episode', 'spoonful', 'skipping_stone', 'paper')),
  content_id TEXT NOT NULL,
  content_title TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  reminder_offset INTERVAL DEFAULT '15 minutes',
  recurrence_rule TEXT, -- RFC 5545 RRULE format, NULL = one-time
  label TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'dispatched', 'cancelled', 'completed')),
  dispatched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_viewing_beacons_member ON viewing_beacons(member_id, scheduled_at);
CREATE INDEX idx_viewing_beacons_status ON viewing_beacons(status, scheduled_at);

-- RLS
ALTER TABLE viewing_beacons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members manage own beacons" ON viewing_beacons
  FOR ALL USING (auth.uid() = member_id);
```

## STEP 2: Shared Scheduling Primitive Component

`platform/src/components/scheduling/SchedulingEntryBox.tsx`

```tsx
interface SchedulingEntryBoxProps {
  contentType: 'pudding' | 'bst_episode' | 'spoonful' | 'skipping_stone' | 'paper';
  contentId: string;
  contentTitle: string;
  target: 'helm-calendar' | 'distribution-grid' | 'cue-card-dispatch';
  defaultTime?: string; // e.g., "09:00"
  defaultDate?: Date;
  onSave?: (beacon: ViewingBeacon) => void;
  onCancel?: () => void;
}

// Renders:
// - Date picker
// - Time picker
// - Recurrence selector (Once / Daily / Weekly / Monthly / Custom)
// - Reminder offset selector (5 min / 15 min / 1 hour / 1 day before)
// - Label text field
// - Save + Cancel buttons
```

Key behaviors:
- Defaults to tomorrow at 9:00 AM local time
- Custom recurrence opens an RRULE builder (days of week, interval, end date)
- Preview text: "You'll be reminded 15 minutes before on April 10 at 9:00 AM"
- On save: insert into `viewing_beacons`, trigger Helm Calendar sync, show toast

## STEP 3: Helm Calendar Integration

When a beacon is created:
- Insert a corresponding event into the member's existing Helm Calendar
- Event title: "📖 {content_title}"
- Event description: link back to content + Pudding/Episode number
- Event time: matches beacon scheduled_at
- Store helm_calendar_event_id in viewing_beacons (for cross-updates)

When member edits beacon → update calendar event
When member deletes beacon → delete calendar event

## STEP 4: Beacon Management Panel in Helm

Add to member's Helm page:
- New section: "Scheduled Viewings"
- Shows next 7 days of upcoming beacons
- Each entry: content title, scheduled time, "View Now" / "Snooze" / "Cancel" buttons
- Link to full beacon list

## STEP 5: Reminder Dispatch

Edge function `dispatch-viewing-beacons` (runs every 5 minutes via cron):
- Queries beacons where `scheduled_at - reminder_offset <= NOW()` AND `status = 'active'`
- Sends reminder (email? push? in-app toast?)
- Marks beacon as `dispatched`
- Handles recurrence: if RRULE present, creates next occurrence

## STEP 6: Usage Integration

Add `<SchedulingEntryBox>` to:
- Every Pudding detail page (`/cephas/pudding/{number}`)
- Every BST Episode detail page
- Every Spoonful detail page
- The "All the Pudding" TV Guide page (from K275)

Each integration passes its contentType, contentId, contentTitle, and target='helm-calendar'.

## STEP 7: Innovation Registration

Register these as new innovations:
- **Scheduled Viewing Beacon** (primary innovation)
- **Shared Scheduling Primitive** (architectural pattern)

Bishop will assign innovation numbers and file A&A formals.

---

## ACCEPTANCE CRITERIA

- [ ] `viewing_beacons` table created with RLS
- [ ] `SchedulingEntryBox.tsx` shared component built
- [ ] Helm Calendar sync working (create/update/delete)
- [ ] Beacon management panel in Helm
- [ ] Reminder dispatch edge function deployed
- [ ] Entry box integrated on at least 2 content page types
- [ ] `npm run build` passes

## DO NOT

- Build separate scheduling components for different content types (use the shared primitive)
- Skip RLS policies (member data privacy is critical)
- Send reminders without member opt-in defaults (use sensible defaults, allow disable)
- Overwrite existing Helm Calendar events (create new events, don't mutate)
