# KNIGHT SESSION 197 — Action Portal + Beacon Guidance + Crow's Nest Trail Map
## Priority: HIGH — UX polish for Opening Gambit readiness
## Bishop B052

---

## CONTEXT

The Founder tested the full visitor flow and identified three issues:
1. "Portal" is too vague — rename to "Action Portal"
2. Beacons panel is empty with no guidance — first-time users don't know what beacons are
3. Crow's Nest is supposed to show a visual treasure-map-style progress trail but renders nothing meaningful

All three live in the Denken ecosystem and are critical for new member onboarding.

---

## TASK 1: Rename "Portal" → "Action Portal"

**Files to update:**
- `platform/src/pages/PortalGateway.tsx` — page title/heading
- `platform/src/components/builder/DenkenMenu.tsx` — menu item label (currently "Portal")
- `platform/src/pages/PlantSeeds.tsx` — breadcrumb "Portal" → "Action Portal"
- Any other breadcrumbs referencing "Portal" across pages that link back to /portal
- Sidebar references in `AppSidebar.tsx` if present

**What to change:**
- Display name: "Portal" → "Action Portal"
- Route stays `/portal` (no URL change)
- Subtitle on the page (if exists): should reinforce action — "Every door leads somewhere. Pick one."

---

## TASK 2: Beacon First-Time Guidance

**File:** `platform/src/components/builder/DenkenMenu.tsx` (Beacon Panel section, around line 338+)

**Current empty state:**
```
<MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
<p className="text-sm text-muted-foreground">No beacons yet</p>
<p className="text-[10px] text-muted-foreground/60 mt-1">Drop beacons on pages to find your way back.</p>
```

**Replace with richer guidance:**
```
<MapPin className="w-10 h-10 mx-auto mb-3 text-amber-500/40" />
<p className="text-sm font-medium text-slate-300">No beacons dropped yet</p>
<p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-[220px] mx-auto">
  As you explore, look for the <span className="text-amber-400">🔖 beacon icon</span> on any section.
  Tap it to drop a beacon — like a bookmark you can always come back to.
</p>
<p className="text-[10px] text-slate-500 mt-3">
  Beacons are color-coded: 🟢 green (interesting), 🟡 gold (important), 🔴 red (urgent), 🔵 blue (revisit later)
</p>
```

---

## TASK 3: Crow's Nest → Visual Treasure Map Trail

This is the biggest task. The Crow's Nest page (`/crows-nest`) currently doesn't render a meaningful visual. Rebuild it as a **vertical dotted-path trail** showing the member's journey through the platform.

**File:** Find and update the Crow's Nest page component (check routes for `/crows-nest`).

### Design: Vertical Trail Map

```
  [START]
     |
     ●──── "Joined" (completed, filled circle)
     |
     ●──── "Explored 3 pages" (completed)
     |
     ◎──── "Dropped first beacon" (current position — YOUR TRAIL MARKER HERE)
     :
     :     (dotted line = not yet reached)
     :
     ○──── "Earned first Marks" (upcoming, outlined)
     :
     ○──── "Backed a project" (upcoming)
     :
     ○──── "Completed Grand Tour" (upcoming)
     :
     ○──── "Reached 100 Marks" (upcoming — PRIZE!)
     :
  [HORIZON]
```

### Trail Marker (Member's Avatar)

The member's position on the trail is shown with a **Trail Marker** — their personal icon:

1. **Default**: Ghost icon (👻) — all members start as Ghost
2. **Custom**: Members can choose from a preset icon list (stored in `user_preferences`)
3. **Brand**: When a member creates a Brand via the Design Crew / Brand Bounty system, their brand icon becomes their Trail Marker automatically
4. **Lark opportunity**: Designing new Trail Marker icons is a Lark bounty — community members design markers, submit via the existing BrandBountyPanel system

**Trail Marker picker UI:**
- Small icon grid (8-12 options): Ghost, Ant, Hen, Acorn, Compass, Anchor, Lighthouse, Hammer, Sprout, Star, Key, Shield
- "Use My Brand" option (if they have one from Design Crew)
- Selection persists in `user_preferences` table (key: `trail_marker_icon`)

### Trail Stops Data

Trail stops come from actual platform actions tracked in existing tables:
- `ghost_sessions` — page visits
- `beacon_progress` — beacons dropped
- `mark_work_records` — Marks earned
- `campaign_pledges` — projects backed
- `tour_notes_submitted` — feedback given
- `member_subscriptions` — membership active

### Implementation

1. **New component**: `platform/src/components/crows-nest/TrailMap.tsx`
   - Vertical flexbox with alternating left/right detail cards
   - Completed stops: filled circles + solid connecting line
   - Current position: pulsing Trail Marker icon
   - Upcoming stops: outlined circles + dotted connecting line
   - Each stop has a title, description, and optional CTA button

2. **Trail stops config**: `platform/src/data/trailStops.ts`
   - Array of stop definitions with check functions
   - Each stop: `{ id, title, description, checkComplete: (userData) => boolean, ctaText?, ctaHref? }`

3. **Trail Marker picker**: `platform/src/components/crows-nest/TrailMarkerPicker.tsx`
   - Icon grid with selection state
   - Saves to `user_preferences` (key: `trail_marker_icon`, value: icon slug)
   - "Use My Brand" option checks `designer_profiles` or `brand_bounties` for user's brand

4. **Update Crow's Nest page**: Replace current content with TrailMap + TrailMarkerPicker

### Migration

```sql
-- K197: Trail Marker preferences (uses existing user_preferences table)
-- No new tables needed — trail_marker_icon stored as user_preferences key

-- Seed default trail stops for the progress system
INSERT INTO platform_canonical (key, value, updated_at)
VALUES ('trail_stop_count', 12, now())
ON CONFLICT (key) DO UPDATE SET value = 12, updated_at = now();
```

---

## VERIFICATION

1. Navigate to `/portal` — should say "Action Portal" in heading and breadcrumbs
2. Click Denken → Beacons → should show rich guidance text when empty
3. Click Denken → Crow's Nest → should show vertical dotted-line trail map
4. Trail Marker defaults to Ghost icon, can be changed via picker
5. Completed stops (joined, explored pages) should show as filled circles
6. Upcoming stops should show as outlined with dotted lines
7. Grand Tour link should go to `/tour`

---

## DEPLOY

```powershell
cd platform; npm run build; firebase deploy --only hosting -P default
```

All 8 hosting targets.

---

*Knight Session 197 — Bishop B052*
*Action Portal. Beacon guidance. The trail begins.*
*FOR THE KEEP!*
