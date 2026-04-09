# KNIGHT SESSION 277 — Extract Shared Scheduling Primitive (Three-Surface Unification)
## Bishop B075 | April 4, 2026

---

## MISSION

Refactor existing scheduling code into a shared `components/scheduling/` module used by three surfaces: Cue Card Battery Dispatch, Staff TV Broadcast Schedule (Social Media Dashboard), and Scheduled Viewing Beacons (K276).

One primitive. Three contexts. DRY architecture.

---

## CONTEXT

**Current state**: Scheduling logic is duplicated across:
1. Cue Card Battery Dispatch (scheduling dispatch times)
2. `LaunchSchedulePage.tsx` / `SocialMediaDashboard.tsx` (staff broadcast scheduling)
3. `SchedulingEntryBox.tsx` (built in K276 for Viewing Beacons)

**Goal**: Extract the common primitive, migrate all three to use it.

---

## DELIVERABLES

### 1. Shared Scheduling Module

```
platform/src/components/scheduling/
  ├── SchedulingEntryBox.tsx        # Primary entry form (from K276)
  ├── SchedulingControlPanel.tsx    # Bulk management view
  ├── ScheduleRotator.tsx           # "Next up" rotation widget
  ├── RecurrenceBuilder.tsx         # RRULE builder UI
  ├── ReminderSelector.tsx          # Reminder offset picker
  ├── hooks/
  │   ├── useScheduling.ts          # Shared state + mutations
  │   ├── useRecurrence.ts          # RRULE parsing/generation
  │   └── useCalendarSync.ts        # Calendar integration
  └── types.ts                      # Shared TypeScript types
```

### 2. Shared Types

```typescript
// types.ts
export type SchedulingTarget =
  | 'helm-calendar'      // member viewing beacons
  | 'distribution-grid'  // staff broadcast
  | 'cue-card-dispatch'; // business action

export type ContentType =
  | 'pudding' | 'bst_episode' | 'spoonful' | 'skipping_stone' | 'paper'
  | 'cue_card' | 'distribution_post';

export interface SchedulingEntry {
  id?: string;
  contentType: ContentType;
  contentId: string;
  contentTitle: string;
  scheduledAt: Date;
  reminderOffset?: string; // ISO 8601 duration
  recurrenceRule?: string; // RFC 5545 RRULE
  label?: string;
  target: SchedulingTarget;
}
```

### 3. Migrate Cue Card Battery Dispatch

Find existing Cue Card scheduling code. Refactor to use `<SchedulingEntryBox target="cue-card-dispatch" />`. Preserve all existing behavior. Remove duplicate scheduling UI.

### 4. Migrate Social Media Dashboard

Refactor `SocialMediaDashboard.tsx` and `LaunchSchedulePage.tsx` to use:
- `<SchedulingControlPanel>` for bulk management
- `<SchedulingEntryBox>` for individual post scheduling
- `<ScheduleRotator>` for "Now Airing" / "Up Next" widget

### 5. Migrate Viewing Beacons

Ensure K276's implementation uses the extracted primitives. Remove any duplicate code.

---

## BEHAVIOR PRESERVATION

Each surface keeps its context-specific behavior:

| Context | Unique Behavior |
|---------|----------------|
| Cue Card Dispatch | Links to business action, can be assigned to member or team |
| Staff Broadcast | Links to distribution platform accounts, supports burst/thread dispatching |
| Viewing Beacon | Links to content item, syncs to Helm Calendar |

The primitive handles the common 80%. Each integration handles the context-specific 20%.

---

## ACCEPTANCE CRITERIA

- [ ] `components/scheduling/` module created with 5 components + 3 hooks
- [ ] Shared TypeScript types defined
- [ ] Cue Card Battery Dispatch migrated to shared primitive
- [ ] Social Media Dashboard migrated
- [ ] Viewing Beacons using shared primitive (from K276)
- [ ] All three surfaces maintain existing behavior
- [ ] No duplicate scheduling code remains
- [ ] `npm run build` passes

## DO NOT

- Break any existing scheduling functionality
- Change the visible behavior of any surface (pure refactor)
- Add features during the refactor (just extract, don't enhance)
- Skip the RRULE/recurrence logic (critical for all three surfaces)
