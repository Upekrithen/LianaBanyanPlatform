# KNIGHT SESSION 277 — Role-Based Platform Staggering
## Bishop B076 | April 4, 2026
## Source: Pawn B48 Distribution Strategy Analysis

---

## Mission

Decouple X/Threads/LinkedIn/Meta dispatch schedules from strict hour-level synchronization. Implement **role-based platform staggering**: each platform posts in its own optimal window based on its role and audience rhythm, not in lockstep with the others.

## Why This Matters

Pawn B48 research: platform rhythms differ. Strict hour-sync across channels misses peak engagement for each platform. Role-based staggering maximizes total reach and engagement for the same content.

**Platform roles** (from Pawn B48):
- **X** = "live fire" primary channel — late morning + early evening
- **Threads** = community/conversation — 30–120 min after X
- **LinkedIn** = professional narrative — weekday mornings (local time), independent of X
- **Meta (Facebook/Instagram)** = evergreen + episodic Reels — late afternoon/evening

---

## Implementation

### Part 1 — Extend platform config

Add scheduling window fields to `battery_dispatch_platform_config` (from K276, or create if K276 not yet deployed):

```sql
ALTER TABLE public.battery_dispatch_platform_config
  ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('live_fire','community','professional','evergreen','episodic')),
  ADD COLUMN IF NOT EXISTS preferred_windows JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS stagger_offset_minutes INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS weekday_only BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tz TEXT NOT NULL DEFAULT 'America/Chicago';

-- Seed role-based windows per Pawn B48
UPDATE public.battery_dispatch_platform_config
  SET role = 'live_fire',
      preferred_windows = '[{"start":"10:00","end":"12:00"},{"start":"17:00","end":"19:00"}]'::jsonb,
      stagger_offset_minutes = 0
  WHERE platform = 'x';

UPDATE public.battery_dispatch_platform_config
  SET role = 'community',
      preferred_windows = '[{"start":"11:00","end":"13:00"},{"start":"18:00","end":"21:00"}]'::jsonb,
      stagger_offset_minutes = 60
  WHERE platform = 'threads';

UPDATE public.battery_dispatch_platform_config
  SET role = 'professional',
      preferred_windows = '[{"start":"07:30","end":"09:30"}]'::jsonb,
      stagger_offset_minutes = 0,
      weekday_only = true
  WHERE platform = 'linkedin';

UPDATE public.battery_dispatch_platform_config
  SET role = 'evergreen',
      preferred_windows = '[{"start":"16:00","end":"20:00"}]'::jsonb,
      stagger_offset_minutes = 0
  WHERE platform = 'facebook';

UPDATE public.battery_dispatch_platform_config
  SET role = 'episodic',
      preferred_windows = '[{"start":"17:00","end":"21:00"}]'::jsonb,
      stagger_offset_minutes = 0
  WHERE platform = 'instagram';
```

### Part 2 — Update Battery Dispatch scheduler

Change the scheduler to:

1. **For each post**, look up the platform's `preferred_windows` + `stagger_offset_minutes` + `weekday_only` + `tz`
2. **Find the next slot** within a preferred window (respecting weekday_only)
3. **Apply stagger_offset** (so Threads lands 60 min after X for same content; LinkedIn posts in its own morning regardless)
4. **Skip to next window** if current time is outside all preferred windows

Pseudocode:
```ts
function scheduleForPlatform(post, platform, now) {
  const config = getPlatformConfig(platform);
  const tz = config.tz;
  const localNow = toLocal(now, tz);

  // Respect weekday_only
  if (config.weekday_only && isWeekend(localNow)) {
    return nextWeekdayWindow(localNow, config.preferred_windows, tz);
  }

  // Find next slot in preferred windows
  const nextSlot = nextAvailableSlot(localNow, config.preferred_windows, tz);

  // Apply stagger (e.g., Threads = X scheduled time + 60 min)
  return addMinutes(nextSlot, config.stagger_offset_minutes);
}
```

### Part 3 — Stagger chain logic

When dispatching the same content across multiple platforms:

- Compute X's slot first (stagger_offset = 0)
- Threads dispatched at X's slot + 60 min (respects own window bounds — if +60 falls outside window, pushes to next window)
- LinkedIn computed independently on its own schedule (does not chain off X)
- Meta computed independently

**Do not chain LinkedIn or Meta off X's timing** — they operate on their own rhythms.

### Part 4 — Admin UI hook (if applicable)

If there's a staff dashboard for viewing upcoming dispatches, add columns:
- Platform role
- Window used
- Staggered from (X chain shown; LinkedIn/Meta marked independent)

### Part 5 — Verification

After deploy:
1. Queue a test BST burst on a chapter
2. Verify X posts in 10:00–12:00 or 17:00–19:00 local window
3. Verify Threads posts ~60 min after X (within its own window)
4. Verify LinkedIn posts next weekday 07:30–09:30, regardless of X
5. Verify Meta posts in late afternoon window, independent of X

---

## Deliverables

1. **Migration**: `platform/supabase/migrations/20260404000031_role_based_platform_staggering.sql`
2. **Code changes**: Battery Dispatch scheduler honors `preferred_windows`, `stagger_offset_minutes`, `weekday_only`, `tz`
3. **Verification report**: confirmed staggering matches roles
4. **Session log**: what changed, any edge cases encountered

---

## Context References

- **Pawn B48**: `BISHOP_DROPZONE/PAWN_B48_DISTRIBUTION_STRATEGY_ANALYSIS.md` (§5 Cross-Platform Synchronization, §8 Implementation)
- **Depends on K276** (burst pacing config table) — if K276 not yet deployed, include that table creation in this migration

*Knight: execute end-to-end. FOR THE KEEP.*
