# KNIGHT SESSION 126: Creator Dashboard + Global Search + Mobile Polish

## Brief
Call `brief_me("creator dashboard, global search, mobile optimization, unified dashboard, full-text search")`

## Context
K116-K125 built. Platform has all major systems deployed. K126 is the "quality of life" session — giving creators a unified dashboard, giving users a search bar, and polishing mobile experience. After K126, the platform should feel COMPLETE enough for outreach.

Canonical stats: 2,007 innovations | 1,511 claims | 10 provisionals | 23 production systems

**CRITICAL RULE:** No securities language.

---

## Deliverable 1: Creator Dashboard

### Page: `/dashboard` (Protected Route)

A single unified page showing everything a creator needs:

```
┌────────────────────────────────────────────────────────┐
│  👋 Welcome back, [Name]                                │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Projects │ │ Earnings │ │ Orders   │ │ Reputation│  │
│  │    3     │ │  $127    │ │  12/14   │ │  ⭐ 72    │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                         │
│  📦 YOUR PROJECTS                                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │ SlottedTop Terrain   │ 5 backers │ $45 pledged  │   │
│  │ Leather Journal      │ 2 backers │ $30 pledged  │   │
│  │ [+ Create New Project]                          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  🗺️ YOUR TREASURE MAP                                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ████████████░░░░░ 67% — Next: Set up Stripe     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  🎨 YOUR CUE CARDS                                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Terrain Builder — 4 templates available          │   │
│  │ Leatherworking — 3 templates available           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  📬 NOTIFICATIONS                                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │ • New backer on SlottedTop Terrain (2h ago)     │   │
│  │ • Contest "Capstone" deadline in 3 days          │   │
│  │ • Your Turn-Key project was approved             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ⚓ CAPTAIN STATUS (if applicable)                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Level: Captain of 10 │ Orders: 8/10 │ Rate: 88% │   │
│  │ [Manage Orders]  [View Reputation]               │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

### Components
- `CreatorDashboard.tsx` — Main page layout
- `DashboardStatCards.tsx` — 4 stat cards (projects, earnings, orders, reputation)
- `DashboardProjects.tsx` — Project list with backer/pledge counts
- `DashboardTreasureMap.tsx` — Current treasure map progress bar
- `DashboardCueCards.tsx` — Active cue card campaigns
- `DashboardNotifications.tsx` — Recent notifications feed
- `DashboardCaptain.tsx` — Captain status (conditional, only if user is a Captain)

### Hooks
- `useDashboard()` — Aggregate query: projects, earnings, orders, reputation, notifications
- Pull from existing tables: turnkey_projects, red_carpet_showcase, captain_order_assignments, etc.

### Route
```tsx
<Route path="/dashboard" element={<ProtectedRoute><CreatorDashboard /></ProtectedRoute>} />
```

### Navigation
- Add "Dashboard" to UnifiedNavigation (when authenticated)
- After login, redirect to /dashboard instead of /

---

## Deliverable 2: Global Search

### Search Bar Component: `GlobalSearch.tsx`

Position: Top nav bar, right side (or center on desktop).

```
┌──────────────────────────────────────┐
│ 🔍 Search products, projects, makers… │
└──────────────────────────────────────┘
```

**Behavior:**
- Debounced input (300ms)
- Dropdown results grouped by type: Products, Projects, Makers, Cue Cards
- Max 3 results per type in dropdown
- "View all results" link → `/search?q=...`
- Keyboard navigation (arrow keys + Enter)
- Escape closes dropdown
- Mobile: Tap search icon → full-width search bar slides in

### Full Search Page: `/search`

```
┌────────────────────────────────────────────────────────┐
│  Search: "terrain"                          [Clear]    │
│                                                         │
│  Filters: [All] [Products] [Projects] [Makers] [Cards] │
│                                                         │
│  📦 PRODUCTS (12 results)                               │
│  ├─ SlottedTop Modular Terrain System                   │
│  ├─ HexIsle Forest Tiles                                │
│  └─ Terrain Building Starter Kit                        │
│                                                         │
│  🚀 PROJECTS (5 results)                                │
│  ├─ Open-Source Terrain Board System                    │
│  └─ Community Terrain Library                           │
│                                                         │
│  👤 MAKERS (3 results)                                   │
│  └─ TerrainCrafter (Austin, TX)                         │
│                                                         │
│  🎨 CUE CARDS (2 results)                               │
│  └─ Terrain Builder — "Build Your First Tile Set"       │
└────────────────────────────────────────────────────────┘
```

### Backend: Supabase Full-Text Search

```sql
-- Add text search vectors to key tables
ALTER TABLE products ADD COLUMN IF NOT EXISTS fts tsvector 
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED;

CREATE INDEX IF NOT EXISTS products_fts_idx ON products USING gin(fts);

-- Similar for turnkey_projects, profiles (makers), cue_card_campaigns
```

### Hook: `useSearch(query, filter)`
```ts
export function useSearch(query: string, filter?: 'products' | 'projects' | 'makers' | 'cards') {
  return useQuery({
    queryKey: ['search', query, filter],
    queryFn: async () => {
      // Parallel queries across tables
      const [products, projects, makers, cards] = await Promise.all([
        !filter || filter === 'products' ? searchProducts(query) : [],
        !filter || filter === 'projects' ? searchProjects(query) : [],
        !filter || filter === 'makers' ? searchMakers(query) : [],
        !filter || filter === 'cards' ? searchCueCards(query) : [],
      ]);
      return { products, projects, makers, cards };
    },
    enabled: query.length >= 2,
  });
}
```

### Routes
```tsx
<Route path="/search" element={<SearchResultsPage />} />
```

---

## Deliverable 3: Mobile Polish Pass

### Known Issues to Check/Fix:
1. **Navigation:** Hamburger menu must show all nav items. Test on 375px width.
2. **Deck Cards (K123):** Must stack 1-column on mobile. Tap-to-flip must work.
3. **Turn-Key Wizard:** Multi-step form must be usable on mobile. Buttons must be tappable.
4. **Red Carpet Cards:** Must be readable on small screens. Pledge buttons tappable.
5. **Contest Entry Form:** File upload + description must work on mobile.
6. **Dashboard (this session):** Stat cards 2×2 grid on mobile. Projects list full-width.
7. **Search:** Full-width search bar on mobile. Results must be scrollable.

### Fixes:
- Add `@media (max-width: 640px)` overrides where needed
- Ensure all tap targets are at least 44×44px
- Test horizontal scroll — nothing should overflow
- Bottom nav should not overlap content

---

## Build + Deploy all 8 Firebase hosting targets.

## Quality Checks
- [ ] /dashboard shows projects, earnings, treasure map progress, notifications
- [ ] Dashboard loads with real data from Supabase (even if empty state)
- [ ] Search bar appears in top nav on all pages
- [ ] Search returns results from products, projects, makers, cue cards
- [ ] /search page shows grouped results with type filters
- [ ] Mobile: All pages usable at 375px width
- [ ] Mobile: No horizontal scroll on any page
- [ ] Mobile: All tap targets >= 44px
- [ ] All 8 Firebase targets deployed

## FOR THE KEEP.
