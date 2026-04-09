# K353: Neighborhood System — Member-Customizable Local Sections
# Priority: HIGH — enables the "my corner of the Galactic Empire" vision
# Bishop: B084 | Date: 2026-04-07
# Related: Innovation #2205 (Trunk Mirror Developer Sandbox), #2162 (Company Island)

## THE VISION

A member in Chicago should be able to take a section of the platform — like the Storefront page for their area — and customize it on a platform-provided environment. When someone visits "Chicago Storefronts," they can browse MULTIPLE neighborhoods, each developed by a different member or team, all with reputation scores and Harper Guild quality assurance.

Think of it as: you get a block on the street. You decorate YOUR block. Visitors walk through the neighborhood and see everyone's unique corner. But the sidewalks, utilities, and building codes (Cost+20%, Harper Guild, Star Chamber) are the same for everyone.

## ARCHITECTURE: Neighborhoods as HexIsle Islands

The HexIsle system already has:
- `hex_islands` — individual islands with governance
- `hex_island_portals` — connections between islands
- Island ownership models (Innovation #2218: Solo, Guild, Project-Sponsored, Rogue)
- Island governance standards (Innovation #2219: amendment process, charter enforcement)

**A Neighborhood IS an Island.** The geographic metaphor maps directly:
- City = Region (collection of Neighborhood Islands)
- Neighborhood = Individual Island
- Storefront = Building on the Island
- Street = Portal path between Islands

## PHASE 1: Neighborhood Table + Schema

```sql
CREATE TABLE IF NOT EXISTS neighborhoods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,                    -- "Chicago", "San Antonio", "Austin"
  state TEXT,
  region TEXT,                           -- "Midwest", "Southwest", "West Coast"

  -- Ownership
  owner_id UUID REFERENCES auth.users,
  owner_type TEXT DEFAULT 'member' CHECK (owner_type IN ('member', 'guild', 'tribe', 'cooperative')),

  -- Customization
  theme_config JSONB DEFAULT '{}'::jsonb,  -- Colors, layout, branding
  hero_image_url TEXT,
  description TEXT,
  custom_css TEXT,                        -- Scoped CSS for this neighborhood only

  -- Governance
  harper_score NUMERIC(4,2) DEFAULT 0,   -- Harper Guild quality score
  star_chamber_compliant BOOLEAN DEFAULT true,
  governance_charter TEXT,               -- Optional custom charter within platform rules

  -- Content
  featured_storefronts UUID[],           -- Ordered list of highlighted storefronts
  welcome_message TEXT,

  -- Platform compliance (immutable)
  cost_plus_margin NUMERIC DEFAULT 20 CHECK (cost_plus_margin >= 20),  -- Can only be 20% or higher
  creator_keeps_pct NUMERIC DEFAULT 83.3,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'suspended', 'archived'))
);

CREATE INDEX idx_neighborhoods_city ON neighborhoods (city);
CREATE INDEX idx_neighborhoods_owner ON neighborhoods (owner_id);
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
```

## PHASE 2: Neighborhood Builder UI

Route: `/neighborhoods/builder` (or `/my-neighborhood`)

A member creates/customizes their neighborhood:
1. **Choose city** — dropdown or map-based selector
2. **Name your neighborhood** — "Rogers Park Creative District", "Pilsen Makers Row"
3. **Customize theme** — colors, hero image, layout (from approved templates)
4. **Add storefronts** — select from your own storefronts or invite other members
5. **Write welcome message** — what visitors see when they enter
6. **Set custom CSS** — scoped to this neighborhood only (sandboxed, no !important)

### Template System:
Pre-built neighborhood templates:
- "Main Street" — traditional storefront row
- "Art District" — gallery-style grid
- "Food Court" — restaurant/food focused
- "Tech Hub" — digital services focused
- "Market Square" — open-air market feel

## PHASE 3: Neighborhood Browser

Route: `/neighborhoods` or `/marketplace/neighborhoods`

1. **City filter** — Browse by city (Chicago, San Antonio, Austin, etc.)
2. **Neighborhood cards** — Show name, owner, Harper score, storefront count, visitor count
3. **Enter neighborhood** — Click to view that member's customized storefront section
4. **Reputation visible** — Harper Guild score, Star Chamber compliance badge, member since date

Route: `/neighborhoods/:slug`

1. **Custom theme applied** — the neighborhood owner's chosen colors/layout
2. **Storefronts displayed** — the curated list of shops in this neighborhood
3. **Welcome message** — owner's personal greeting
4. **"Visit next neighborhood"** — portal to adjacent neighborhoods in the same city

## PHASE 4: Trunk Mirror Integration (Innovation #2205)

For advanced neighborhood builders:
1. **Local development** — clone the neighborhood section to a local environment
2. **Custom components** — build unique UI elements within sandboxed constraints
3. **Preview + submit** — test locally, then submit for Harper Guild review
4. **Deploy** — approved changes go live on the platform

```
Two immutable conditions (from Innovation #2205):
1. Core protocol preserved (Cost+20%, governance, currency)
2. Must use LB ecosystem currency without breaking compatibility
```

The Trunk Mirror gives the neighborhood builder a LOCAL copy of the platform section they can customize. When they push changes, it goes through Harper Guild review before going live.

## PHASE 5: Reputation + Quality

- **Harper Guild** reviews each neighborhood for quality standards
- **Star Chamber** enforces platform rules (no securities language, no misleading claims)
- **Member reputation** visible: ADAPT score, XP level, member since date
- **Neighborhood rating** from visitors (1-5 stars)
- **Automatic suspension** if Harper score drops below threshold

## PHASE 6: City-Level Aggregation

Route: `/cities/:city` or `/marketplace/cities/chicago`

1. Shows all neighborhoods in a city
2. Map visualization (if possible) — neighborhoods as blocks on a street grid
3. "Start a neighborhood" CTA for members in that city
4. City-level stats: total storefronts, total creators, active orders

## CONNECTION TO GALACTIC EMPIRE

In the Northern Province (past Snow Gate), this becomes the **Company Island Program**:
- Neighborhoods are NOID territories
- Rebel NOID = solo neighborhood
- Colony NOID = guild-owned neighborhood cluster
- Kingdom NOID = multi-guild city district
- Empire NOID = corporate-sponsored regional presence

The Southern Province (main platform) sees neighborhoods as local marketplace sections.
The Northern Province sees them as territories in the Galactic Empire.
Same data, different metaphor, different governance layer.

## VALIDATION

1. Member can create a neighborhood with custom theme
2. Visitors can browse neighborhoods by city
3. Storefronts within a neighborhood use the neighborhood's theme
4. Harper score visible on each neighborhood
5. Platform rules (Cost+20%) cannot be overridden in custom CSS/config
6. `npm run build` passes

## REFERENCE

- Trunk Mirror: Innovation #2205 (already documented)
- Company Island: Innovation #2162 (B2B integration)
- Island Ownership: Innovation #2218 (4 types)
- Island Governance: Innovation #2219 (charter + amendment process)
- HexIsle islands: `hex_islands` table
- Storefronts: `storefronts` + `storefront_items`
- Harper Guild: `harper_cases` + `harper_votes`
- Star Chamber: `star_chamber_cases` + `star_chamber_verdicts`
- San Antonio Landing: `platform/src/pages/SanAntonioLanding.tsx` (existing local landing)
