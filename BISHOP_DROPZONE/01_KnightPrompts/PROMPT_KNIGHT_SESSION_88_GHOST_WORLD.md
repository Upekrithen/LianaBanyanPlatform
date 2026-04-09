# KNIGHT SESSION 88 — Ghost World: HexIsle Storefronts
**Bishop Session**: 028
**Date**: March 23, 2026
**Innovation Count**: 1,935 (no change)
**Base**: K87 Design Pipeline (Arena/Emporium/Crew Tables)

## MISSION
Build the Ghost World visual discovery layer — an SVG-based hex grid map where real storefronts appear as buildings on islands. Members explore a 2D hex world to discover businesses, browse menus, and drop Beacons. Non-members can browse freely. Ghost World is the "window shopping" layer that turns the platform into a place, not just a tool.

Root Lock: "If it fits, it sits" — any storefront can occupy any empty slot on any island.

## PREVIOUS SESSION
K87 built Design Pipeline: Arena submissions + STAMP review + Battle auto-trigger + Emporium gallery + purchase flow + Crew Tables with stage tracker + Storefront→Pipeline wiring. Migration 20260322000018. 689 files deployed.

## CONTEXT: WHAT EXISTS

| Component | Route | Status | Session |
|-----------|-------|--------|---------|
| Storefronts | /tools/storefront-builder | LIVE | K63 |
| Storefront Items | storefront_items table | LIVE | K80 |
| Menu Orders | /orders | LIVE | K80 |
| Design Arena | /arena | LIVE | K87 |
| Emporium | /emporium | LIVE | K87 |
| Crew Tables | /crew-tables | LIVE | K87 |
| Beacon System | beacon_* tables | LIVE | K82 |
| Star Chamber | /star-chamber | LIVE | K79 |

## TASK 1: Ghost World Page + Layout
**Route**: `/ghost-world`
**File**: `src/pages/GhostWorld.tsx`

Create full-width immersive page:
- Dark background (slate-900)
- SVG viewport fills available space (below nav)
- Floating control panel (top-right): zoom +/−, fit-all, search input, category filter dropdown
- Mobile: pinch-to-zoom, swipe-to-pan
- Map title overlay: "Ghost World" with subtitle "Explore the Islands"
- Loading state: hex grid skeleton pulse animation

## TASK 2: Data Model — Migration 20260323000019
**File**: `supabase/migrations/20260323000019_ghost_world.sql`

```sql
-- Ghost World Islands
CREATE TABLE ghost_world_islands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  hex_q INT NOT NULL,
  hex_r INT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  node_id UUID REFERENCES nodes(id),
  theme_color TEXT DEFAULT '#64748b',
  max_slots INT NOT NULL DEFAULT 12,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ghost World Buildings (storefronts on islands)
CREATE TABLE ghost_world_buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  island_id UUID NOT NULL REFERENCES ghost_world_islands(id) ON DELETE CASCADE,
  storefront_id UUID NOT NULL REFERENCES storefronts(id) ON DELETE CASCADE,
  slot_index INT NOT NULL,
  size TEXT NOT NULL DEFAULT 'small' CHECK (size IN ('small', 'medium', 'large')),
  placed_at TIMESTAMPTZ DEFAULT now(),
  placed_by UUID REFERENCES auth.users(id),
  UNIQUE(island_id, slot_index),
  UNIQUE(storefront_id)
);

-- Ghost World Pop-Up Kiosks (temporary cross-island presence)
CREATE TABLE ghost_world_popups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES ghost_world_buildings(id) ON DELETE CASCADE,
  target_island_id UUID NOT NULL REFERENCES ghost_world_islands(id) ON DELETE CASCADE,
  slot_index INT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  placed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(target_island_id, slot_index, starts_at)
);

-- RLS
ALTER TABLE ghost_world_islands ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghost_world_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghost_world_popups ENABLE ROW LEVEL SECURITY;

-- Public read for everyone (Ghost World is the window-shopping layer)
CREATE POLICY "Anyone can view islands" ON ghost_world_islands FOR SELECT USING (true);
CREATE POLICY "Anyone can view buildings" ON ghost_world_buildings FOR SELECT USING (true);
CREATE POLICY "Anyone can view popups" ON ghost_world_popups FOR SELECT USING (true);

-- Admin write
CREATE POLICY "Admins manage islands" ON ghost_world_islands FOR ALL USING (is_admin());
CREATE POLICY "Admins manage buildings" ON ghost_world_buildings FOR ALL USING (is_admin());
CREATE POLICY "Admins manage popups" ON ghost_world_popups FOR ALL USING (is_admin());

-- Members can place their own storefront
CREATE POLICY "Members place own building" ON ghost_world_buildings
  FOR INSERT WITH CHECK (
    auth.uid() = placed_by
    AND EXISTS (SELECT 1 FROM storefronts WHERE id = storefront_id AND owner_id = auth.uid())
  );

-- Seed 4 starter islands
INSERT INTO ghost_world_islands (name, description, hex_q, hex_r, category, theme_color, max_slots) VALUES
  ('Founders Row', 'Where it all begins', 0, 0, 'general', '#f59e0b', 12),
  ('Maker Marina', 'Crafts, art, and handmade goods', 2, -1, 'maker', '#8b5cf6', 12),
  ('Food Court', 'Restaurants, bakeries, and meal prep', -1, 2, 'food', '#ef4444', 12),
  ('Service Harbor', 'Professional services and repairs', 1, 1, 'service', '#06b6d4', 12);
```

## TASK 3: Hex Grid Renderer
**File**: `src/components/ghost-world/HexGrid.tsx`

SVG-based hex grid renderer:
- Flat-top hexagons, 40px size
- Axial coordinate system (q, r) — convert to pixel with standard hex math:
  - `x = size * (3/2 * q)`
  - `y = size * (sqrt(3)/2 * q + sqrt(3) * r)`
- Each island = cluster of hexes arranged in a ring around center hex
  - 12-slot island = 1 center hex + 6 inner ring + 5 outer partial ring (or use a flower layout)
  - Gap of 3 hex widths between island clusters
- Island name label centered below cluster
- Category border color from `island.theme_color`
- Building icons inside hexes:
  - Small = simple circle icon (12px)
  - Medium = larger circle with inner icon (20px)
  - Large = full hex fill with soft glow effect (drop-shadow filter)
- Building size determined by storefront order count: 0-10 = small, 11-50 = medium, 51+ = large
  - Query order count from `menu_orders` grouped by `storefront_id`
- Empty slots = dashed hex outline, slightly transparent
  - If user owns an unplaced storefront: dashed outline turns green on hover, cursor becomes pointer
- Pop-up kiosks = pulsing border animation (CSS `@keyframes pulse`)
- Coalition lines: thin dashed SVG `<line>` elements connecting buildings whose storefronts share a `coalition_id` (fetch from `coalition_members` table)
- Pan: mouse drag on SVG background (track `mousedown` → `mousemove` → `mouseup` for viewBox offset)
- Zoom: mouse wheel adjusts viewBox scale; clamp between 0.3x and 3x
- Mobile: use touch events for pinch-to-zoom and swipe-to-pan

Performance notes:
- Render only islands/buildings visible in current viewBox (culling)
- Use `React.memo` on individual hex components
- Debounce pan/zoom state updates (16ms frame target)

## TASK 4: Building Click-Through
**File**: `src/components/ghost-world/BuildingCard.tsx`

Click a building hex → slide-up card (absolute positioned over map):
- Storefront name + logo (from `storefronts.logo_url`)
- Category badge (from island category) + size badge (small/medium/large with color coding)
- Owner name (link to `/profile/:id`)
- Rating: average from `menu_orders` where `storefront_id` matches, display as stars (1-5)
- "Browse Menu" button → navigates to `/storefront/:storefront_id`
- "Drop Beacon" button → inserts into `beacons` table for this storefront (requires auth)
  - If not authenticated: button says "Sign in to Drop Beacon"
- Recent activity: last 3 orders (anonymized)
  - Format: "Someone ordered [item_name], [time_ago]"
  - Query: `menu_orders` JOIN `storefront_items` WHERE `storefront_id` matches, ORDER BY `created_at` DESC LIMIT 3
- Pop-up badge: if this building is a kiosk (exists in `ghost_world_popups` where current time is between `starts_at` and `ends_at`), show badge with home island name
- Close: X button top-right + click-outside-to-close (use `useRef` + `useEffect` click listener)
- Animation: slide up from bottom with `transition-transform duration-300`

## TASK 5: Island Detail Panel
**File**: `src/components/ghost-world/IslandPanel.tsx`

Click island background (not a building hex) → side panel slides in from right:
- Island name + description
- Building count: "7 of 12 slots filled" with progress bar
- Category breakdown: count of buildings per storefront category
- "Place Your Storefront" button:
  - Visible only if authenticated user owns a storefront NOT yet in `ghost_world_buildings`
  - On click: enters placement mode (see Task 7)
- List of all buildings on this island as mini cards:
  - Storefront name + size badge + owner name
  - Click → opens BuildingCard for that building
- Coalition presence: list unique coalitions represented on this island (from `coalition_members` JOIN)
- Close: X button + click-outside
- Animation: slide in from right with `transition-transform duration-300`
- Mobile: panel becomes bottom sheet (full width, slides up from bottom)

## TASK 6: Navigation Wiring
Modify existing files:

**`src/components/layout/Sidebar.tsx`**:
- Add "Ghost World" link with a map/globe icon
- Place under Discover section (near Arena/Emporium)
- Icon suggestion: `Map` from lucide-react

**`src/pages/Index.tsx`** (or homepage component):
- Add Ghost World CTA card in the discovery/explore section
- Card text: "Ghost World" / "Explore the Islands — discover storefronts on a hex map"
- Link to `/ghost-world`
- Use dark theme card styling (slate-800 bg, amber accent) to match Ghost World aesthetic

**`src/App.tsx`**:
- Add route: `<Route path="/ghost-world" element={<GhostWorld />} />`
- Import `GhostWorld` from `src/pages/GhostWorld`

**Storefront Builder success screen** (find the success/completion state in storefront-builder):
- After storefront creation, add button: "Place on Ghost World"
- Links to `/ghost-world?place=true`

## TASK 7: Place Storefront Flow
When a user clicks an empty slot on an island OR arrives via `?place=true`:

1. **Detect placement mode**: check URL param `place=true` OR user clicks empty slot while owning an unplaced storefront
2. **Highlight available slots**: all empty slots on the current island glow green with dashed border animation
3. **Slot selection**: user clicks a green slot
4. **Confirm dialog**: shadcn `AlertDialog` — "Place [Storefront Name] at [Island Name], Slot [N]?"
   - Show island theme color as accent
   - "Confirm" and "Cancel" buttons
5. **On confirm**:
   - INSERT into `ghost_world_buildings` with `island_id`, `storefront_id`, `slot_index`, `size` (default 'small'), `placed_by` = current user
   - Animate: building icon fades in with `scale(0) → scale(1)` over 400ms
   - Show success toast: "Your storefront is now on [Island Name]!"
6. **Exit placement mode**: remove green highlights, return to normal map interaction
7. **Edge case — no storefront**: if user has no unplaced storefront, show dialog: "Create a Storefront First" with link to `/tools/storefront-builder`
8. **Edge case — already placed**: if user's only storefront is already placed, show: "Your storefront is already on [Island Name]. Pop-Up Kiosks coming soon!"

## TASK 8: Map Controls Component
**File**: `src/components/ghost-world/MapControls.tsx`

Floating control panel (top-right corner, absolute positioned):
- **Zoom in** (+) button: decrease viewBox dimensions by 20%
- **Zoom out** (−) button: increase viewBox dimensions by 20%
- **Fit all** button (expand icon): reset viewBox to show all islands
- **Search input**: filter buildings by storefront name (client-side filter, highlight matching hexes)
- **Category dropdown**: filter by island category (general/maker/food/service/all)
  - "All Categories" default
  - On select: dim non-matching islands (opacity 0.3)
- Styling: semi-transparent dark bg (bg-slate-800/80 backdrop-blur), rounded, shadow-lg
- Mobile: collapse to hamburger icon, expand on tap

## FILES TO CREATE

| File | Purpose |
|------|---------|
| `src/pages/GhostWorld.tsx` | Main map page |
| `src/components/ghost-world/HexGrid.tsx` | SVG hex renderer with pan/zoom |
| `src/components/ghost-world/BuildingCard.tsx` | Building popup card |
| `src/components/ghost-world/IslandPanel.tsx` | Island detail side panel |
| `src/components/ghost-world/MapControls.tsx` | Zoom/search/filter controls |
| `supabase/migrations/20260323000019_ghost_world.sql` | 3 tables + RLS + seed |

## FILES TO MODIFY

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/ghost-world` route |
| `src/components/layout/Sidebar.tsx` | Add Ghost World nav link with map icon |
| `src/pages/Index.tsx` | Add Ghost World CTA card |
| Storefront builder success component | Add "Place on Ghost World" button |

## DO NOT TOUCH
- Any `arena_*`, `crew_table*`, emporium files (K87)
- Any `political_expedition` files (K86)
- Any vehicle files — `lemon_lot`, `local_wheels`, `rideshare_routes` (K85)
- Star Chamber files (K79)
- Commerce engine files — `distribute-order-earnings`, `menu_orders` logic (K80)
- Calendar/Beacon wiring files (K82)
- Crew Call dispatch files (K83)

## BUILD ORDER
```
Task 2 (migration)
  → Task 1 (page wrapper) + Task 8 (map controls) [parallel]
    → Task 3 (hex renderer)
      → Task 4 (building card) + Task 5 (island panel) [parallel]
        → Task 7 (place flow)
          → Task 6 (nav wiring)
```

## DEPLOY CHECKLIST
1. Push migration: `npx supabase db push`
2. Verify 3 tables created with RLS policies
3. Verify 4 seed islands exist: `SELECT * FROM ghost_world_islands;`
4. `npm run build` — zero errors
5. `firebase deploy --only hosting:main`
6. Test paths:
   - `/ghost-world` → see 4 islands on hex grid with correct theme colors
   - Pan and zoom work (mouse drag + scroll wheel)
   - Click a building → popup card with storefront name, rating, menu link
   - Click island background → side panel with building list and slot count
   - Place a storefront on an empty slot (full confirm flow)
   - "Drop Beacon" button works for authenticated users
   - Category filter dims non-matching islands
   - Search highlights matching buildings
   - Pop-up kiosks show pulsing border (if any exist)
   - Mobile: pinch-to-zoom and swipe-to-pan functional

## SUCCESS CRITERIA
- [ ] 3 tables created with RLS (public read, admin write, member self-place)
- [ ] 4 seed islands visible on hex grid with correct category colors
- [ ] Buildings render at correct sizes based on order count
- [ ] Building click → popup card with name, rating, menu link, beacon button
- [ ] Island click → side panel with building list, slot count, place button
- [ ] Place storefront flow works end-to-end (select slot → confirm → animate)
- [ ] Navigation links added (sidebar + homepage CTA)
- [ ] Map controls: zoom, fit-all, search, category filter all functional
- [ ] Mobile pinch/zoom and swipe/pan functional
- [ ] Pop-up kiosks display with pulsing animation
- [ ] Coalition lines connect related buildings
- [ ] Zero console errors on all Ghost World paths
- [ ] Clean build, clean deploy

---

The islands are alive. The buildings are waiting. Let the members explore.

**FOR THE KEEP.**
