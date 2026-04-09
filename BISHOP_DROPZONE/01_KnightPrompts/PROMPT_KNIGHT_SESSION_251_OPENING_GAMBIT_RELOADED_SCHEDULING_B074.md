# KNIGHT SESSION 251 — Opening Gambit Reloaded: Schedule Episodes for 10-Day Launch
## Dispatched by: Bishop B074
## Date: April 4, 2026
## Priority: HIGH — Easter soft open is TOMORROW (Apr 5). Grid scheduling must be live.

---

## MISSION

Wire the 10-day Opening Gambit Reloaded launch schedule into the staged episodes:
1. Assign `scheduled_for` timestamps to episodes following the 10-day grid (Apr 5-14)
2. Build a Launch Scheduler admin page to visualize and adjust the schedule
3. Configure the dispatch cron to respect `scheduled_for` timestamps
4. Set up Day 1 (Easter) with BST EP-001 across all channels

---

## CONTEXT

### What Exists
- 744 episodes staged in `crewman_episodes` (after K249): 194 BST + 550 Spoonfuls
- All spice-tagged (after K250)
- `dispatch-crewman-episode` edge function (K240 DEPLOYED): hourly cron, currently dispatches next `queued` episode
- `schedule-distribution-grid` edge function (K245 DEPLOYED): accepts date + channels + slots_per_day + series_mix, assigns `scheduled_for` timestamps
- `dispatch_platform_accounts` table (K248): multi-platform posting support
- Opening Gambit Reloaded 10-Day Plan: `BISHOP_DROPZONE/OPENING_GAMBIT_RELOADED_10DAY_LAUNCH_B072.md`

### The 10-Day Grid Summary
| Day | Date | Posts | Focus |
|-----|------|-------|-------|
| 1 | Apr 5 (Easter) | 1 | BST EP-001, all channels, 10am CT |
| 2 | Apr 6 | 4 | BST EP-002-005, Twitter hourly |
| 3 | Apr 7 | ~8 | LinkedIn Spoonfuls go live (Garlic+Paprika) + BST Twitter |
| 4 | Apr 8 | ~24 | ALL channels, full grid, cross-references begin |
| 5 | Apr 9 | ~24 | Media Day, Skipping Stones featured |
| 6 | Apr 10 | ~24 | Deep Dive, Viewing Schedule semi-public |
| 7 | Apr 11 | ~24 | Community Day, Wildfire Run |
| 8 | Apr 12 | ~12 | Reflection, metrics post |
| 9 | Apr 13 | ~24 | Chapter 2 launch if vote-gate crossed |
| 10 | Apr 14 | ~24+ | Viewing Schedule fully public, "Bring Popcorn" |

---

## IMPLEMENTATION

### 1. Update dispatch-crewman-episode for scheduled_for

File: `platform/supabase/functions/dispatch-crewman-episode/index.ts`

Current behavior: picks next `queued` episode by sequence_number.
New behavior: picks next `queued` episode WHERE `scheduled_for <= NOW()`.

```typescript
// REPLACE the episode selection query:
const { data: episode } = await supabase
  .from('crewman_episodes')
  .select('*, crewman_chapters!inner(title, source_document)')
  .eq('status', 'queued')
  .not('scheduled_for', 'is', null)           // Must have a schedule
  .lte('scheduled_for', new Date().toISOString()) // Must be due
  .order('scheduled_for', { ascending: true })
  .limit(1)
  .single();

// If no scheduled episode is due, check for unscheduled fallback:
if (!episode) {
  const { data: fallback } = await supabase
    .from('crewman_episodes')
    .select('*, crewman_chapters!inner(title, source_document)')
    .eq('status', 'queued')
    .is('scheduled_for', null)
    .order('sequence_number', { ascending: true })
    .limit(1)
    .single();
  // Use fallback if available
}
```

Also check the `platform` field on the episode to determine which platform account to use from `dispatch_platform_accounts`.

### 2. Build Launch Schedule Script

File: `platform/scripts/schedule-opening-gambit.ts`

This script assigns `scheduled_for` timestamps to specific episodes per the 10-day plan:

```typescript
const CT_OFFSET = '-05:00'; // Central Time

const schedule = [
  // DAY 1 — Easter Apr 5: Single BST EP-001 at 10am CT on all channels
  { day: '2026-04-05', time: '10:00', channel: 'bst', chapter: 1, seq: 1, platforms: ['twitter', 'linkedin', 'threads', 'bluesky'] },

  // DAY 2 — Apr 6: BST EP-002 through EP-005 hourly on Twitter
  { day: '2026-04-06', time: '09:00', channel: 'bst', chapter: 1, seq: 2, platforms: ['twitter'] },
  { day: '2026-04-06', time: '10:00', channel: 'bst', chapter: 1, seq: 3, platforms: ['twitter'] },
  { day: '2026-04-06', time: '11:00', channel: 'bst', chapter: 1, seq: 4, platforms: ['twitter'] },
  { day: '2026-04-06', time: '12:00', channel: 'bst', chapter: 1, seq: 5, platforms: ['twitter'] },

  // DAY 3 — Apr 7: LinkedIn Spoonfuls (Garlic + Paprika) + BST Twitter
  // LinkedIn Spoonfuls at 9am, 11am, 1pm, 3pm CT
  { day: '2026-04-07', time: '09:00', channel: 'spoonfuls', spoonful_id: 'SP-050-01', platforms: ['linkedin'] },
  { day: '2026-04-07', time: '11:00', channel: 'spoonfuls', spoonful_id: 'SP-097-01', platforms: ['linkedin'] },
  { day: '2026-04-07', time: '13:00', channel: 'spoonfuls', spoonful_id: 'SP-066-01', platforms: ['linkedin'] },
  { day: '2026-04-07', time: '15:00', channel: 'spoonfuls', spoonful_id: 'SP-100-05', platforms: ['linkedin'] },
  // BST hourly on Twitter (EP-006 through EP-009)
  { day: '2026-04-07', time: '09:00', channel: 'bst', chapter: 1, seq: 6, platforms: ['twitter'] },
  { day: '2026-04-07', time: '10:00', channel: 'bst', chapter: 1, seq: 7, platforms: ['twitter'] },
  { day: '2026-04-07', time: '11:00', channel: 'bst', chapter: 1, seq: 8, platforms: ['twitter'] },
  { day: '2026-04-07', time: '12:00', channel: 'bst', chapter: 1, seq: 9, platforms: ['twitter'] },

  // DAY 4+ — Apr 8 onward: Full grid via schedule-distribution-grid function
  // After Day 3, switch to automated Grid Scheduler for remaining days
];

// For Days 1-3: direct UPDATE with specific scheduled_for timestamps
// For Days 4-10: call schedule-distribution-grid with increasing slots_per_day
```

#### Days 4-10: Automated Grid Scheduling

After manual Day 1-3 scheduling, call `schedule-distribution-grid` for each remaining day:

```typescript
for (let day = 8; day <= 14; day++) {
  const date = `2026-04-${day.toString().padStart(2, '0')}`;
  const slotsPerDay = day === 12 ? 3 : 6; // Day 8 (reflection) = reduced

  await fetch(`${SUPABASE_URL}/functions/v1/schedule-distribution-grid`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      date,
      channels: ['twitter', 'linkedin', 'threads', 'bluesky', 'instagram', 'facebook'],
      slots_per_day: slotsPerDay,
      series_mix: { bst: 1, spoonfuls: 2, skipping_stones: 1 }
    })
  });
}
```

### 3. Launch Schedule Dashboard

File: `platform/src/pages/staff/LaunchSchedulePage.tsx`
Route: `/staff/launch-schedule`

#### Layout

```
+------------------------------------------------------------------+
| OPENING GAMBIT RELOADED — LAUNCH SCHEDULE                        |
+------------------------------------------------------------------+
| [◀ Apr 5] [Apr 6] [Apr 7] [Apr 8] ... [Apr 14 ▶]  [Run Grid]  |
+------------------------------------------------------------------+
|          | Twitter | LinkedIn | Threads | Bluesky | IG  | FB    |
| 9:00 AM  | BST #6  | SP-050   |         |         |     |       |
| 10:00 AM | BST #7  |          |         |         |     |       |
| 11:00 AM | BST #8  | SP-097   |         |         |     |       |
| 12:00 PM | BST #9  |          |         |         |     |       |
| 1:00 PM  |         | SP-066   |         |         |     |       |
| 3:00 PM  |         | SP-100   |         |         |     |       |
+------------------------------------------------------------------+
| Status: 8 scheduled | 0 dispatched | 0 failed                   |
+------------------------------------------------------------------+
```

#### Features
- Day tabs showing the 10-day grid
- Grid cells show episode excerpt + spice badge + status indicator
- Click cell to see full content + edit scheduled time
- "Run Grid" button calls `schedule-distribution-grid` for the selected day
- Status bar: scheduled / dispatched / failed counts per day
- Drag-to-reschedule (optional — lower priority)

#### Data Query
```typescript
const { data: episodes } = await supabase
  .from('crewman_episodes')
  .select('id, sequence_number, content, channel, platform, scheduled_for, status, primary_spice, tags')
  .gte('scheduled_for', `${selectedDate}T00:00:00-05:00`)
  .lt('scheduled_for', `${nextDate}T00:00:00-05:00`)
  .order('scheduled_for');
```

### 4. Day 1 Verification

Before Easter morning, verify:
```sql
-- Day 1 schedule check
SELECT id, channel, platform, scheduled_for, content, status
FROM crewman_episodes
WHERE scheduled_for >= '2026-04-05T00:00:00-05:00'
  AND scheduled_for < '2026-04-06T00:00:00-05:00'
ORDER BY scheduled_for;
-- Should show: 1 BST episode at 10am CT across multiple platform entries
```

---

## DELIVERABLES

1. Updated `dispatch-crewman-episode` respecting `scheduled_for` timestamps
2. `platform/scripts/schedule-opening-gambit.ts` — schedules Days 1-3 manually + Days 4-10 via Grid
3. `LaunchSchedulePage.tsx` — visual grid showing 10-day schedule with day tabs
4. Route `/staff/launch-schedule` wired + sidebar link added
5. Day 1 (Easter Apr 5) verified: BST EP-001 scheduled for 10am CT

---

## IMPORTANT NOTES

- Central Time (CT = UTC-5 in CDT). All `scheduled_for` timestamps must be in ISO 8601 with offset.
- The show is about **Liana Banyan** — frame all episode content as "watch a cooperative being built"
- Day 1 is a SOFT open. One post. No pressure. The real push is Day 3.
- LinkedIn goes FIRST for Spoonfuls (Day 3) because media contacts check LinkedIn before responding to Opening Gambit letters
- The dispatch cron runs hourly — episodes scheduled for :00 of any hour will dispatch on the next cron tick
- Do NOT modify episode content — only set `scheduled_for` and `platform` fields
- The `schedule-distribution-grid` function handles cross-reference pairing — let it do its job for Days 4+
- Deploy updated dispatch function BEFORE running the scheduling script
