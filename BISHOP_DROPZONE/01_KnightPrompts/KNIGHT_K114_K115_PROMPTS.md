# Knight Sprint — K114 + K115

## K114: Subscription Engine + Coalition Formation

### Context
The marketplace is live (K107-K109). Products, makers, and production pipeline are wired. Next revenue multiplier: subscriptions and coalitions — the cooperative economic engine.

### Deliverables

**D1: Subscription Plans Page**
New page: `/subscribe` on lianabanyan.com

Three tiers:
- **Explorer (Free):** Browse marketplace, view products, basic profile
- **Member ($10/mo):** List products, join coalitions, earn Credits, access Crew Tables
- **Builder ($25/mo):** All Member features + priority production queue, Marks eligibility, Ghost Credit allocation, Maker Dashboard access

Use existing `subscriptions` table if it exists, or create migration. Integrate with Stripe (existing Stripe Connect setup from K101-K103).

Wire into UnifiedNavigation under marketplace portal.

**D2: Coalition Formation Page**
New page: `/coalitions/create` on lianabanyan.com

Form for creating a new coalition:
- Coalition name, description, category
- Minimum members to activate
- Shared discount tier (Hybrid Discount from innovation #1758)
- Coalition treasury display (pooled Credits)

List page `/coalitions` showing active coalitions with member counts, categories, join buttons.

Use existing `coalitions` table or create migration.

**D3: Hybrid Discount Engine**
When a coalition reaches its member threshold, apply automatic discount:
- 5 members: 5% discount on coalition-listed products
- 10 members: 10% discount
- 25 members: 15% discount
- 50+: 20% cap

Display discount badge on product cards when user is in a qualifying coalition.

This is the Cost+20% floor in action — discounts come from the platform margin, not from the creator's price.

Build + deploy all 8 targets.

---

## K115: Ghost World Storefront Mapping + Calendar Infrastructure

### Context
Ghost World is the "wow" feature — storefronts mapped to HexIsle islands. Calendar is the cross-portal scheduling backbone.

### Deliverables

**D1: Ghost World Map Page**
New page: `/ghost-world` on lianabanyan.com

Visual hex grid showing storefronts as "islands":
- Each storefront gets a hex tile on the map
- Hex color/icon based on storefront category
- Click a hex → navigates to storefront detail page
- Empty hexes show as "unclaimed" with "Start Your Storefront" CTA

Use the storefronts table for data. Hex grid rendering via CSS grid or SVG (keep it simple — this is the first version, not the full 3D island).

**D2: Calendar Page**
New page: `/calendar` on lianabanyan.com

Unified calendar showing events from multiple source types:
- Storefront events (order cutoffs, flash sales)
- Coalition events (meetings, group buys)
- Platform events (launches, maintenance)

Use FullCalendar (MIT license) for rendering. Each source type gets a color.

Role-based default source activation:
- All users see platform events
- Members see their coalition events
- Storefront owners see their storefront events
- Sources toggle on/off in sidebar

**D3: Calendar Plug Interface**
Create a typed source registration system:
- `CalendarSourceType` enum: 'storefront' | 'coalition' | 'platform' | 'route' | 'crew'
- `useCalendarSources` hook that queries relevant tables based on user's roles
- Standard event schema: { id, title, start, end, sourceType, sourceId, metadata }

This is Innovation #1868 — the plug architecture where sources attach via a standard interface.

Build + deploy all 8 targets.
