# Knight Session 73 — HexIsle Ghost World Storefronts
## Innovation Count: 1,897
## Priority: HIGH — Discovery layer that turns storefronts into explorable islands
## Depends on: Sessions 71-72 (Beacons + Calendar) should be complete

---

## Task 1: Ghost World Map Page

Create `src/pages/GhostWorld.tsx`:
- Route: `/ghost-world` (public — non-members can browse)
- Also register at `/hexisle/explore`
- **Full-width layout** — no PortalPageLayout sidebar. Immersive map experience.

**Phase 1 (build NOW):** 2D hex grid with clickable building icons. NOT full 3D — that's future work. Simple, clean, navigable.

### Implementation Approach

Use SVG-based hex grid rendering. Each island is a cluster of hexagons.

```tsx
// Hex math (flat-top hexagons, 60mm conceptual)
const HEX_SIZE = 40; // pixels
const HEX_WIDTH = HEX_SIZE * 2;
const HEX_HEIGHT = Math.sqrt(3) * HEX_SIZE;

function hexToPixel(q: number, r: number) {
  const x = HEX_SIZE * (3/2 * q);
  const y = HEX_SIZE * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
  return { x, y };
}
```

Each island = a node/geographic area. Islands are positioned on a macro grid. Buildings (storefronts) cluster around each island's center.

---

## Task 2: Island Data Model

Create migration `20260323000002_ghost_world.sql`:

```sql
-- Islands represent geographic Node areas
CREATE TABLE IF NOT EXISTS ghost_world_islands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  hex_q INT NOT NULL, -- macro grid position
  hex_r INT NOT NULL,
  node_captain_id UUID REFERENCES auth.users(id),
  member_count INT DEFAULT 0,
  theme_color TEXT DEFAULT '#D4A843',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(hex_q, hex_r)
);

-- Buildings are storefronts placed on islands
CREATE TABLE IF NOT EXISTS ghost_world_buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  island_id UUID NOT NULL REFERENCES ghost_world_islands(id),
  storefront_id UUID NOT NULL REFERENCES storefronts(id),
  building_slot INT NOT NULL, -- 0=center, 1-6=surrounding hexes
  building_size TEXT DEFAULT 'small' CHECK (building_size IN ('small', 'medium', 'large')),
  is_popup BOOLEAN DEFAULT false,
  popup_expires_at TIMESTAMPTZ,
  popup_source_island_id UUID REFERENCES ghost_world_islands(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(island_id, building_slot)
);

-- Pop-up kiosks (Deck Card placement)
CREATE TABLE IF NOT EXISTS ghost_world_popups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storefront_id UUID NOT NULL REFERENCES storefronts(id),
  home_island_id UUID NOT NULL REFERENCES ghost_world_islands(id),
  target_island_id UUID NOT NULL REFERENCES ghost_world_islands(id),
  deck_card_id UUID, -- links to future deck card system
  duration_days INT DEFAULT 14,
  starts_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ghost_world_islands ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghost_world_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghost_world_popups ENABLE ROW LEVEL SECURITY;

-- Public read, admin write
CREATE POLICY "public_read_islands" ON ghost_world_islands FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_manage_islands" ON ghost_world_islands FOR ALL USING (public.is_admin());

CREATE POLICY "public_read_buildings" ON ghost_world_buildings FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_manage_buildings" ON ghost_world_buildings FOR ALL USING (public.is_admin());

CREATE POLICY "public_read_popups" ON ghost_world_popups FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_manage_popups" ON ghost_world_popups FOR ALL USING (public.is_admin());
```

### Seed Data (One Demo Island)

```sql
INSERT INTO ghost_world_islands (name, description, hex_q, hex_r, theme_color) VALUES
  ('Downtown', 'The first LB node — downtown food district', 0, 0, '#D4A843');
```

Buildings auto-populate from `storefronts` table — either via a join view or admin placement.

---

## Task 3: Island Renderer Component

Create `src/components/ghost-world/IslandRenderer.tsx`:

Each island renders as a hex cluster:
- **Center hex**: Island name + node info (member count, Captain name if assigned)
- **Surrounding hexes (1-6)**: One per storefront building
- Building icon matches category:
  - 🍩 Food: amber
  - 🔧 Service: blue
  - 🛒 Retail: green
  - 🎨 Creative: pink
  - 📚 Education: purple
- Building SIZE: `small` (default), `medium` (50+ orders/month), `large` (200+ orders/month)
- Coalition connections: gold dashed lines between islands that share a Coalition

### Visual Style
- Dark background (slate-900) with subtle hex grid watermark
- Islands glow slightly (drop shadow with theme color)
- Buildings have micro-animations on hover (slight scale up)
- Empty building slots show as outline hexes (available space = growth potential)

---

## Task 4: Building Click-Through

Click a building on Ghost World → popup card appears:

```
┌─────────────────────────────────┐
│  🍩 Joe's Donuts                │
│  Downtown Island                │
│                                 │
│  Open: 5 AM - 2 PM             │
│  ⭐ 4.8 (23 reviews)           │
│  📦 18 pre-orders for tomorrow  │
│                                 │
│  [View Menu]  [Drop Beacon 💛]  │
└─────────────────────────────────┘
```

- **[View Menu]** → navigates to `/menu/:slug` (works for guests too)
- **[Drop Beacon]** → saves via beacon system (Session 71) — requires auth
- Social proof: show order count (from menu_orders for tomorrow's date)
- For Pop-Ups: add "Pop-Up from [home island] — X days remaining" tag

**Non-members:** Can explore, click buildings, see info. Ordering works via guest Stripe checkout. Full features require membership.

---

## Task 5: Ghost World Navigation

- Main nav/sidebar: "Ghost World" under "Explore" section with a globe/map icon
- Benefits Sheet: Add Ghost World as an explorable feature
- Homepage: Optional "Explore your neighborhood" CTA linking to Ghost World

---

## Task 6: Pop-Up Kiosk Display

When a business has an active pop-up on another island:
- Small booth icon (distinct from permanent buildings — maybe a tent/kiosk shape)
- Labeled: "[Business Name] — Pop-Up"
- Duration countdown badge: "12 days left"
- Click → same popup as permanent building, but tagged as "Visiting from [home island]"

**For Phase 1:** Pop-ups are admin-placed via database. Self-service Deck Card placement is Phase 2.

---

## Task 7: Map Controls

- Zoom in/out (scroll wheel + buttons)
- Pan (click and drag)
- "Fit All" button — zooms to show all islands
- Search bar — type business name → highlights the building on the map
- Filter by category (Food, Service, Retail, Creative, Education)

**Mobile:** Pinch-to-zoom. Tap to select building. Swipe to pan. Filter bar at top.

---

## Build Order

```
Task 2 (migration + seed data) → FIRST
Task 3 (Island renderer component) → after migration
Task 4 (Building click-through) → after renderer
Task 6 (Pop-up display) → after click-through
Task 7 (Map controls) → after basic rendering works
Task 5 (Navigation) → last
Task 1 (Page wrapper) → wraps everything, build alongside Task 3
```

---

## Key Notes

- Ghost World is a DISCOVERY layer, not a replacement for existing pages
- Keep it lightweight — SVG rendering, not WebGL or canvas (those are Phase 2)
- Every building links to a REAL storefront page — Ghost World is a visual front door
- The "If it fits, it sits" Root Lock principle: any storefront can go on any island that has an empty slot
- Coalition lines between islands make the network visible

---

**FOR THE KEEP.**
