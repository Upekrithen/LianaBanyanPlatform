# KNIGHT SESSION 245 — Concurrent Distribution Grid + Viewing Schedule + Bring Popcorn Page
## Dispatched by: Bishop B072
## Date: April 3, 2026
## Priority: HIGH — Public-facing content infrastructure + cross-channel scheduling

---

## MISSION

Implement the Concurrent Distribution Grid (#2141) and Bring Popcorn experience layer (#2144):
1. Grid Scheduler edge function (assigns series × channel × time_slot)
2. Cross-Reference Generator (pairs posts with cross-refs to other channels)
3. Viewing Schedule page ("Bring Popcorn" — the public TV Guide)
4. Migration extending crewman_episodes for grid scheduling

---

## CONTEXT (READ FIRST)

### A&A Formals
- `BISHOP_DROPZONE/AA_FORMAL_2141_CONCURRENT_DISTRIBUTION_GRID_B072.md`
- `BISHOP_DROPZONE/AA_FORMAL_2144_BRING_POPCORN_B072.md`

### Dependencies
- K240 DONE (Crewman Battery — crewman_chapters + crewman_episodes + dispatch)
- K242 DONE (Reading Beacons)
- K243 DONE (Interest Signal + Linchpin Bridge)

### IMPORTANT — Reality Show Framing
The show is about **Liana Banyan** — the platform, the cooperative, the innovations. The Founder provides initial authenticity but is NOT the star. Frame everything as "watch a cooperative being built" not "watch a founder build."

---

## IMPLEMENTATION

### 1. Migration: Grid Scheduling Extensions

File: `platform/supabase/migrations/20260404000006_distribution_grid.sql`

```sql
ALTER TABLE public.crewman_episodes ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'bst'
  CHECK (channel IN ('bst', 'spoonfuls', 'skipping_stones'));
ALTER TABLE public.crewman_episodes ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;
ALTER TABLE public.crewman_episodes ADD COLUMN IF NOT EXISTS content_type TEXT;
ALTER TABLE public.crewman_episodes ADD COLUMN IF NOT EXISTS cross_ref_post_id UUID REFERENCES public.crewman_episodes(id);
ALTER TABLE public.crewman_episodes ADD COLUMN IF NOT EXISTS cross_ref_text TEXT;
ALTER TABLE public.crewman_episodes ADD COLUMN IF NOT EXISTS engagement_clicks INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.crewman_episodes ADD COLUMN IF NOT EXISTS engagement_cross_ref_clicks INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.crewman_episodes ADD COLUMN IF NOT EXISTS engagement_beacon_creates INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_crewman_episodes_schedule
  ON public.crewman_episodes (channel, scheduled_for) WHERE status = 'queued';
CREATE INDEX IF NOT EXISTS idx_crewman_episodes_channel
  ON public.crewman_episodes (channel);
```

### 2. Edge Function: Grid Scheduler

File: `platform/supabase/functions/schedule-distribution-grid/index.ts`

Accepts:
```json
{
  "date": "2026-04-04",
  "channels": ["twitter", "linkedin", "threads", "bluesky", "instagram", "facebook"],
  "slots_per_day": 6,
  "series_mix": { "bst": 1, "spoonfuls": 2, "skipping_stones": 1 }
}
```

Logic:
1. Pull next unscheduled episodes from each series (channel column)
2. Assign to time_slot × platform grid using stagger rules:
   - No same-series on two channels at same time
   - Rotate series across channels daily
   - Prefer each channel's peak hours (configurable per channel)
3. Generate cross-reference pairings (each post references a different-series post on a different channel)
4. Set `scheduled_for` timestamps + `cross_ref_post_id` + `cross_ref_text`
5. Return the full day's grid

### 3. Edge Function: Cross-Reference Generator

File: `platform/supabase/functions/generate-cross-references/index.ts`

Called by Grid Scheduler or standalone. For each post in a day's grid:
1. Find a post from a DIFFERENT series in an ADJACENT time slot on a DIFFERENT channel
2. Generate cross-ref text: "Following BST on X? Today's Spoonful on LinkedIn: [hook]. #Spoonfuls"
3. Store as cross_ref_text on the source post, cross_ref_post_id pointing to target

### 4. Viewing Schedule Page ("Bring Popcorn")

File: `platform/src/pages/ViewingSchedulePage.tsx`

Route: `/watch` (public — no auth required)

Sections:
- **Hero**: "Bring Popcorn" header + "Watch a cooperative being built, live, across six channels"
- **Now Playing**: Current active posts across all channels (real-time)
- **Today's Grid**: Full day schedule — rows = time slots, columns = channels, cells = series + title
- **Season Progress**: Active BST chapter, episode count, vote-gate % progress bar
- **Spice Filter**: Toggle to show only content tagged with specific spices
- **Series Guide**: Three cards (BST, Spoonfuls, Skipping Stones) with descriptions + channel links
- **Join the Show**: CTA — "$5/year to go from audience to cast member"

Wire route in `platform/src/routes/public.tsx`.

---

## VALIDATION CHECKLIST

- [ ] Migration applies cleanly
- [ ] Grid Scheduler produces valid staggered schedule
- [ ] No same-series overlap on same time slot
- [ ] Cross-references pair different series on different channels
- [ ] Viewing Schedule renders with mock/real data
- [ ] Public route (no auth required)
- [ ] `npm run build` succeeds
- [ ] Session logged via Librarian (K245)
