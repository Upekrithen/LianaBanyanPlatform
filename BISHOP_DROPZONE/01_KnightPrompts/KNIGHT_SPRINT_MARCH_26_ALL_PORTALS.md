# KNIGHT SPRINT — March 26, 2026 — ALL PORTALS OPERATIONAL
## 6 Hours. No Bandaids. Real Infrastructure.
## Sessions K107–K112 (give sequentially, each builds on prior)

**Canonical stats:** 1,979 innovations | 1,511 claims | 10 provisionals | 21 production systems | 7 portals

**Read order before starting:** This file top to bottom. Each session is self-contained.

---

# K107 — PRODUCT SHOWCASE + SLOTTEDTOP + KICKSTARTER PIPELINE (90 min)

## Context
lianabanyan.com needs a real product marketplace. Right now Marketplace.tsx shows projects, not products. We need a product catalog that showcases the SlottedTop hinge system and the first 12 Kickstarter-bound products. This is the FIRST thing Crown Letter recipients will see.

## Database

```sql
-- Migration: 20260326000001_product_catalog.sql

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id),
  storefront_id UUID REFERENCES storefronts(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  long_description TEXT,
  category TEXT NOT NULL CHECK (category IN ('terrain','hinge','miniature','accessory','tool','game','furniture','art','craft','digital','service','other')),
  price_cents INTEGER NOT NULL,
  cost_cents INTEGER, -- for Cost+20% verification
  currency TEXT DEFAULT 'USD',
  images JSONB DEFAULT '[]', -- array of {url, alt, order}
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','active','funded','producing','shipping','archived')),
  crowdfund_goal_cents INTEGER, -- null if not crowdfunding
  crowdfund_raised_cents INTEGER DEFAULT 0,
  crowdfund_backer_count INTEGER DEFAULT 0,
  crowdfund_deadline TIMESTAMPTZ,
  maker_id UUID, -- references maker who will produce it
  production_status TEXT CHECK (production_status IN ('design','prototype','testing','production_ready','in_production','fulfilled')),
  stl_file_count INTEGER DEFAULT 0,
  is_hexisle BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_backers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  backer_id UUID NOT NULL REFERENCES auth.users(id),
  amount_cents INTEGER NOT NULL,
  tier TEXT, -- reward tier name
  status TEXT DEFAULT 'pledged' CHECK (status IN ('pledged','charged','fulfilled','refunded')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS makers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  business_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  capabilities JSONB DEFAULT '[]', -- ['3d_printing','cnc','laser','woodwork','metalwork','electronics']
  equipment JSONB DEFAULT '[]', -- [{name, type, specs}]
  location_city TEXT,
  location_state TEXT,
  location_country TEXT DEFAULT 'US',
  capacity_weekly INTEGER, -- units per week
  rating NUMERIC(3,2) DEFAULT 0,
  completed_orders INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_accepting_orders BOOLEAN DEFAULT true,
  portfolio_images JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS production_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  maker_id UUID NOT NULL REFERENCES makers(id),
  quantity INTEGER NOT NULL,
  unit_cost_cents INTEGER NOT NULL,
  total_cost_cents INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','printing','quality_check','shipped','delivered','disputed')),
  due_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_backers ENABLE ROW LEVEL SECURITY;
ALTER TABLE makers ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products visible to all" ON products FOR SELECT USING (status != 'draft' OR creator_id = auth.uid());
CREATE POLICY "Creators manage own products" ON products FOR ALL USING (creator_id = auth.uid());
CREATE POLICY "Backers see own pledges" ON product_backers FOR SELECT USING (backer_id = auth.uid());
CREATE POLICY "Anyone can back" ON product_backers FOR INSERT WITH CHECK (auth.uid() = backer_id);
CREATE POLICY "Makers visible to all" ON makers FOR SELECT USING (true);
CREATE POLICY "Makers manage own" ON makers FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Production orders visible to parties" ON production_orders FOR SELECT USING (
  maker_id IN (SELECT id FROM makers WHERE user_id = auth.uid()) OR
  product_id IN (SELECT id FROM products WHERE creator_id = auth.uid())
);
```

## Pages to Build

### 1. ProductCatalog.tsx — `/products`
The main marketplace product grid. This replaces/supplements the current Marketplace.tsx project carousel.

```
Layout:
┌─────────────────────────────────────────────────┐
│  LIANA BANYAN MARKETPLACE                        │
│  [All] [HexIsle] [Terrain] [Hinges] [Tools]     │
│  [Crowdfunding Now] [Production Ready] [New]     │
├─────────┬─────────┬─────────┬─────────┬─────────┤
│ Product │ Product │ Product │ Product │ Product  │
│  Card   │  Card   │  Card   │  Card   │  Card   │
│ [image] │ [image] │ [image] │ [image] │ [image] │
│ Title   │ Title   │ Title   │ Title   │ Title   │
│ $price  │ $price  │ $price  │ $price  │ $price  │
│ ██░░░   │ READY   │ ██████  │ ██░░░   │ NEW     │
│ 67%fund │ TO SHIP │ FUNDED! │ 45%fund │         │
├─────────┴─────────┴─────────┴─────────┴─────────┤
│  FEATURED MAKER: [Maker Card with portfolio]     │
└─────────────────────────────────────────────────┘
```

- Query `products` table filtered by category tabs
- Each card shows: image, title, price, production_status or crowdfund progress bar
- "Crowdfunding Now" filter shows products with active crowdfund_deadline
- Featured maker section at bottom rotates through verified makers
- Link to `/products/:slug` for detail

### 2. ProductDetail.tsx — `/products/:slug`
Full product page with backing/ordering capability.

```
Layout:
┌──────────────────────┬──────────────────────────┐
│                      │ SLOTTEDTOP HINGE SYSTEM  │
│   [Product Image     │ by Jonathan Jones         │
│    Gallery]          │                          │
│                      │ $24.99                   │
│   [thumb] [thumb]    │ ████████░░ 80% funded    │
│   [thumb] [thumb]    │ 127 backers | 23 days    │
│                      │                          │
│                      │ [BACK THIS PROJECT]      │
│                      │ [ORDER NOW] (if ready)   │
├──────────────────────┴──────────────────────────┤
│ DESCRIPTION                                      │
│ The SlottedTop universal hinge system...         │
├─────────────────────────────────────────────────┤
│ PRODUCTION STATUS                                │
│ ✅ Design  ✅ Prototype  🔄 Testing  ⬜ Production │
├─────────────────────────────────────────────────┤
│ MAKER: [Maker name] | [View maker profile]      │
│ Capability: 3D Printing, CNC                     │
│ Capacity: 200 units/week                         │
├─────────────────────────────────────────────────┤
│ REWARD TIERS (if crowdfunding)                   │
│ $25 — 1 SlottedTop kit + sticker                │
│ $75 — 3 kits + terrain base                     │
│ $200 — Full collection + signed art              │
└─────────────────────────────────────────────────┘
```

- Image gallery with thumbnails
- Crowdfunding progress OR "Order Now" button depending on status
- Production status timeline (design → prototype → testing → production → shipping)
- Maker profile card
- Reward tiers if crowdfunding

### 3. MakerDirectory.tsx — `/makers`
Browse all registered makers.

```
Layout:
┌─────────────────────────────────────────────────┐
│  THE FORGE — MAKER DIRECTORY                     │
│  [All] [3D Printing] [CNC] [Laser] [Wood] [Metal]│
├──────────────┬──────────────┬───────────────────┤
│ [Maker Card] │ [Maker Card] │ [Maker Card]      │
│ PrintShop TX │ CNC Masters  │ LaserWorks CA     │
│ ⭐ 4.8 (47)  │ ⭐ 4.9 (23)  │ ⭐ 4.7 (15)       │
│ 3D, Resin    │ CNC, Wood    │ Laser, Acrylic    │
│ 500/week     │ 200/week     │ 300/week          │
│ [View] [Hire]│ [View] [Hire]│ [View] [Hire]     │
└──────────────┴──────────────┴───────────────────┘
```

### 4. MakerProfile.tsx — `/makers/:slug`
Individual maker page with portfolio, capabilities, and "Hire for Production" button.

### 5. MakerRegistration.tsx — `/register-maker`
Form to register as a maker. Saves to `makers` table. Fields: business name, capabilities (multi-select), equipment list, location, capacity, portfolio images.

### 6. ProductionOrderFlow.tsx — `/production/new`
When a product hits funding goal or a creator wants to start production:
- Select product → select maker (from directory, filtered by capability) → specify quantity → confirm unit cost at Cost+20% → create production_order
- Maker sees order on their dashboard

### 7. Seed Data
Create a Supabase migration seeding the SlottedTop product and 12 placeholder Kickstarter products:

```js
const SEED_PRODUCTS = [
  { title: "SlottedTop Universal Hinge System", slug: "slottedtop-hinge", category: "hinge", price_cents: 2499, is_hexisle: true, is_featured: true, status: "active", production_status: "prototype" },
  { title: "HexIsle Terrain Base Set (6-pack)", slug: "hexisle-base-6", category: "terrain", price_cents: 4999, is_hexisle: true, status: "draft", production_status: "design" },
  { title: "Modular Stone Wall Set", slug: "stone-wall-set", category: "terrain", price_cents: 3499, is_hexisle: true, status: "draft", production_status: "design" },
  { title: "Snap-In River Tiles", slug: "river-tiles", category: "terrain", price_cents: 2999, is_hexisle: true, status: "draft", production_status: "design" },
  { title: "Dungeon Floor Pack", slug: "dungeon-floor", category: "terrain", price_cents: 2499, is_hexisle: true, status: "draft", production_status: "design" },
  { title: "Forest Canopy Module", slug: "forest-canopy", category: "terrain", price_cents: 3999, is_hexisle: true, status: "draft", production_status: "design" },
  { title: "Castle Tower Kit", slug: "castle-tower", category: "terrain", price_cents: 5999, is_hexisle: true, status: "draft", production_status: "design" },
  { title: "Hydraulic Wave Generator", slug: "wave-generator", category: "accessory", price_cents: 14999, is_hexisle: true, status: "draft", production_status: "design" },
  { title: "LED Lava Flow Insert", slug: "lava-flow", category: "accessory", price_cents: 1999, is_hexisle: true, status: "draft", production_status: "design" },
  { title: "Magnetic Cliff Face Set", slug: "cliff-face", category: "terrain", price_cents: 3499, is_hexisle: true, status: "draft", production_status: "design" },
  { title: "Village Building Kit (12 structures)", slug: "village-kit", category: "terrain", price_cents: 7999, is_hexisle: true, status: "draft", production_status: "design" },
  { title: "Battle Grid Overlay (transparent)", slug: "battle-grid", category: "accessory", price_cents: 999, is_hexisle: true, status: "draft", production_status: "design" },
  { title: "Campaign Carry Case", slug: "carry-case", category: "accessory", price_cents: 4999, is_hexisle: false, status: "draft", production_status: "design" },
];
```

### Navigation Integration
- Add "Products" to main nav on lianabanyan.com (marketplace portal)
- Add "Makers" to main nav
- Link from existing Marketplace.tsx to ProductCatalog
- Cross-link: product detail → maker profile → hire for production

## Build + Deploy
```bash
cd platform && npm run build && firebase deploy --only hosting -P default
supabase db push --linked
```

---

# K108 — DSS PORTAL: THE FORGE + PROTOTYPER GUILD + STL VAULT (90 min)

## Context
the2ndsecond.com is the maker/prototyper portal. The landing page is beautiful but nothing behind it works. Wire it up.

## Pages to Build/Fix

### 1. Fix PrototyperGuild Registration — wire to Supabase
The "Register My Printer" button currently sets local state only. Wire it to the `makers` table from K107.

In `The2ndSecondPortal.tsx`, replace the placeholder handler:
```tsx
// REPLACE the isJoined local state with real Supabase insert
const handleRegisterPrinter = () => {
  navigate('/register-maker'); // Use the real MakerRegistration page from K107
};
```

### 2. STLVault.tsx — `/stl-vault`
The file management system for CAD files. This is the core of the DSS portal.

```
Layout:
┌─────────────────────────────────────────────────┐
│  STL VAULT — 1,200+ Design Files                │
│  [Search] [Filter: Category ▾] [Sort: Newest ▾] │
├─────────┬─────────┬─────────┬─────────┬─────────┤
│ [3D     │ [3D     │ [3D     │ [3D     │ [3D     │
│  prev]  │  prev]  │  prev]  │  prev]  │  prev]  │
│ SlottedT│ Base Hex│ Wall Set│ River   │ Tower   │
│ v2.3    │ v1.0    │ v1.2    │ v1.0    │ v3.1    │
│ .STL    │ .STL    │ .STL    │ .STL    │ .STL    │
│ [DL]    │ [DL]    │ [DL]    │ [DL]    │ [DL]    │
└─────────┴─────────┴─────────┴─────────┴─────────┘
```

Database:
```sql
-- Migration: 20260326000002_stl_vault.sql
CREATE TABLE IF NOT EXISTS stl_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  uploader_id UUID NOT NULL REFERENCES auth.users(id),
  filename TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  version TEXT DEFAULT '1.0',
  file_url TEXT NOT NULL, -- Supabase storage URL
  thumbnail_url TEXT, -- rendered preview
  file_size_bytes BIGINT,
  category TEXT CHECK (category IN ('terrain','hinge','miniature','building','accessory','tool','component','other')),
  tags JSONB DEFAULT '[]',
  download_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  license TEXT DEFAULT 'cc-by-nc-sa-4.0',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE stl_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public STL files visible to all" ON stl_files FOR SELECT USING (is_public = true OR uploader_id = auth.uid());
CREATE POLICY "Uploaders manage own" ON stl_files FOR ALL USING (uploader_id = auth.uid());
```

- Grid view with 3D preview thumbnails (use placeholder images for now, real STL rendering later)
- Download button (tracks download_count)
- Filter by category, sort by newest/popular
- Upload button (for registered makers/creators)
- Version history per file

### 3. SlottedTopShowcase.tsx — `/slottedtop`
Dedicated showcase page for the SlottedTop hinge system. This is the hero product.

```
Layout:
┌─────────────────────────────────────────────────┐
│  [HERO IMAGE: SlottedTop hinge in action]        │
│  THE SLOTTEDTOP UNIVERSAL HINGE SYSTEM           │
│  "The last hinge you'll ever need"               │
├─────────────────────────────────────────────────┤
│ [Gallery of SlottedTop images — real photos]     │
│ [Photo 1] [Photo 2] [Photo 3] [Photo 4]         │
├─────────────────────────────────────────────────┤
│ HOW IT WORKS                                     │
│ [Diagram or photos showing the slot mechanism]   │
├─────────────────────────────────────────────────┤
│ SPECIFICATIONS                                   │
│ Material: PLA/PETG/Resin | Load: 5kg per hinge  │
│ Sizes: S/M/L | Compatibility: All HexIsle bases  │
├─────────────────────────────────────────────────┤
│ [BACK ON KICKSTARTER] [DOWNLOAD STL] [ORDER NOW] │
├─────────────────────────────────────────────────┤
│ COMPATIBLE PRODUCTS                              │
│ [Grid of HexIsle terrain that uses SlottedTop]   │
└─────────────────────────────────────────────────┘
```

- Pull real SlottedTop images from platform assets or Supabase storage
- Link to product detail page from K107
- Link to STL Vault for downloadable files
- Cross-link to compatible HexIsle products

### 4. TestPilotDashboard.tsx — `/test-pilot`
For makers running test prints. Quorum aggregation system.

```sql
-- Add to stl_vault migration
CREATE TABLE IF NOT EXISTS test_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stl_file_id UUID NOT NULL REFERENCES stl_files(id),
  tester_id UUID NOT NULL REFERENCES auth.users(id),
  maker_id UUID REFERENCES makers(id),
  printer_type TEXT,
  material TEXT,
  settings JSONB, -- {layer_height, infill, supports, etc}
  result TEXT CHECK (result IN ('success','partial','fail')),
  notes TEXT,
  photos JSONB DEFAULT '[]',
  print_time_minutes INTEGER,
  material_grams NUMERIC(8,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE test_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Test reports visible to all" ON test_reports FOR SELECT USING (true);
CREATE POLICY "Testers manage own" ON test_reports FOR ALL USING (tester_id = auth.uid());
```

- Submit test print results with photos, settings, and outcome
- Quorum view: "3/5 testers report success with PLA at 0.2mm layer height"
- Aggregated success rates by material and printer type

### 5. DSS Navigation
Update DSSApp.tsx routes:
- `/` — The2ndSecondPortal (existing, working)
- `/stl-vault` — STLVault (new)
- `/slottedtop` — SlottedTopShowcase (new)
- `/test-pilot` — TestPilotDashboard (new)
- `/makers` — redirect to main MakerDirectory (shared with .com)
- `/register-maker` — redirect to MakerRegistration (shared)
- `/help-wanted` — existing, keep

## Build + Deploy

---

# K109 — CROSS-PORTAL COMMERCE LOOP + .BIZ BOUNTIES (60 min)

## Context
The portals need to feel like ONE system. A visitor on lianabanyan.com sees a product → clicks "Hire a Maker" → lands on the2ndsecond.com maker directory → maker accepts → production order appears on .biz dashboard → completed order shows on .net manifest.

## What to Build

### 1. CrossPortalNav.tsx — Shared navigation component
A subtle "portal switcher" in the top nav that shows which portal you're on and lets you jump to others.

```
[🏪 Marketplace] [🔨 The Forge] [💼 Business] [🌐 Network] [❤️ Non-Profit]
```

- Detects current portal via detectPortal()
- Highlights current portal
- Links go to the actual domains (.com, DSS, .biz, .net, .org)
- Appears below the main nav, small and unobtrusive
- Only shows on authenticated pages (don't confuse new visitors)

### 2. Wire Product → Maker → Production Flow
On ProductDetail.tsx (K107), the "Hire for Production" button should:
1. Open a modal listing compatible makers (filtered by product category → maker capabilities)
2. Selecting a maker navigates to `/production/new?product={slug}&maker={slug}`
3. ProductionOrderFlow creates the production_order record
4. Maker sees it on their MakerDashboard

### 3. MakerDashboard.tsx — `/dashboard/maker`
The maker's home on .biz portal. Shows incoming production orders, active prints, completed orders.

```
Layout:
┌─────────────────────────────────────────────────┐
│  YOUR FORGE — [Maker Business Name]              │
├──────────────────┬──────────────────────────────┤
│ INCOMING ORDERS  │ ACTIVE PRODUCTION            │
│ 3 new requests   │ 2 in progress               │
│ ┌──────────────┐ │ ┌──────────────────────────┐│
│ │ SlottedTop ×50│ │ │ Base Hex ×200           ││
│ │ $1,249.50    │ │ │ 60% complete  [Update]  ││
│ │ [Accept][Dec]│ │ │ Due: March 30           ││
│ └──────────────┘ │ └──────────────────────────┘│
├──────────────────┴──────────────────────────────┤
│ COMPLETED: 47 orders | ⭐ 4.8 rating | $12,340 earned │
└─────────────────────────────────────────────────┘
```

### 4. BountyBoard Enhancement on .biz
The existing `/manage-positions` and `/positions` pages should include:
- "Production Bounties" tab showing open production orders that need makers
- Links to MakerDirectory for capability matching
- This is the .biz → maker connection

### 5. NetworkManifest.tsx — `/manifests` on .net
Replace the "coming soon" placeholder with a real manifest view:
- Shows completed production orders ready for shipping
- Tracks: product, maker, quantity, ship-to address, status
- This is the .net → fulfillment connection

Query production_orders WHERE status IN ('shipped', 'delivered') with joins to products and makers.

## Build + Deploy

---

# K110 — .ORG CHARITABLE FEATURES + MISSION ONE (60 min)

## Context
.org is the charitable portal. It needs Mission ONE, Gleaner's Corner, charitable subscriptions, and the earmarked credit system.

## Pages to Build

### 1. NonprofitLanding.tsx — `/` on .org
Replace the basic landing with a real Mission ONE experience.

```
Layout:
┌─────────────────────────────────────────────────┐
│  ██████████████████████████████████████████████  │
│  MISSION ONE: EVERYONE EATS TONIGHT             │
│  "For it rains on the Just and the Unjust"      │
│  [Full-width hero banner — entire thing is a link│
│   to /mission-one]                               │
│  ██████████████████████████████████████████████  │
├─────────────────────────────────────────────────┤
│ [Impact Stats]                                   │
│ Meals served: [count] | Members fed: [count]    │
│ Charitable subs: [count] | Cities: [count]      │
├────────────┬────────────┬───────────────────────┤
│ GLEANER'S  │ EARMARK    │ SUBSCRIBE TO          │
│ CORNER     │ CREDITS    │ FEED SOMEONE          │
│ 3.3% of    │ Direct your│ Fund a monthly        │
│ every sale │ Credits to │ meal subscription     │
│ goes here  │ what you   │ for someone in        │
│            │ care about │ need                   │
│ [See Fund] │ [Earmark]  │ [Subscribe]           │
└────────────┴────────────┴───────────────────────┘
```

### 2. MissionOnePage.tsx — `/mission-one`
The full Mission ONE page explaining the charitable food program.

- Mission ONE explainer with Les Mis Bishop Myriel framing
- How it works: Charity Medallion QR Cards → same menu, same food, no stigma
- How to contribute: Earmark Credits, fund subscriptions, volunteer as Driver
- Live statistics from the database

### 3. GleanersCorner.tsx — `/gleaners-corner`
Shows the 3.3% charitable fund.

```sql
-- Gleaners data comes from existing transaction splits
-- Query: SUM of 3.3% from all transactions
SELECT SUM(total_cents * 0.033) as gleaners_total FROM menu_orders WHERE stripe_payment_status = 'paid';
```

- Running total of Gleaner's Corner fund
- Where funds are directed (by initiative, by area)
- "Earmark Your Credits" CTA

### 4. EarmarkCredits.tsx — `/earmark`
Interface for members to earmark their Credits to specific causes.

```sql
-- Migration: 20260326000003_earmark_credits.sql
CREATE TABLE IF NOT EXISTS earmarked_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id),
  amount_cents INTEGER NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('initiative','area','guild','general')),
  target_id TEXT, -- initiative slug, area code, guild id
  target_label TEXT NOT NULL, -- human-readable: "LMD in San Antonio"
  status TEXT DEFAULT 'active' CHECK (status IN ('active','deployed','expired')),
  deployed_at TIMESTAMPTZ,
  deployed_to TEXT, -- what node/storefront received the funds
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE earmarked_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members see own earmarks" ON earmarked_credits FOR SELECT USING (member_id = auth.uid());
CREATE POLICY "Members create earmarks" ON earmarked_credits FOR INSERT WITH CHECK (member_id = auth.uid());
```

### 5. CharitableSubscription.tsx — `/subscribe-to-feed`
Fund ongoing meal subscriptions for people in need.
- Select number of subscriptions to fund (1, 5, 10)
- Select area (or "wherever needed most")
- Monthly recurring via Stripe (reuse existing Stripe integration)
- Shows: "Your 5 subscriptions = 140 meals/month of variety from 10 restaurants"

### 6. .org Navigation
Update NonprofitApp.tsx:
- `/` — NonprofitLanding (Mission ONE hero)
- `/mission-one` — MissionOnePage
- `/gleaners-corner` — GleanersCorner
- `/earmark` — EarmarkCredits
- `/subscribe-to-feed` — CharitableSubscription
- `/dashboard` — existing, keep

## Build + Deploy

---

# K111 — .NET NETWORK FEATURES + SUPPLY CHAIN (45 min)

## Context
.net is the B2B portal. Replace ALL "coming soon" placeholders with real pages connected to real data.

## Pages to Build

### 1. Replace ProductionSchedules placeholder
`/production-schedules` → Real page querying `production_orders` table.

Shows: all active production orders grouped by maker, with status tracking (pending → accepted → printing → QC → shipped → delivered), due dates, and quantity progress bars.

### 2. Replace B2BContracts placeholder
`/b2b-contracts` → Real page for inter-business agreements.

```sql
-- Migration: 20260326000004_b2b_contracts.sql
CREATE TABLE IF NOT EXISTS b2b_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES auth.users(id),
  client_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  contract_type TEXT CHECK (contract_type IN ('production','supply','service','coalition')),
  terms JSONB, -- {duration, pricing, volume, penalties}
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','proposed','active','completed','cancelled')),
  start_date DATE,
  end_date DATE,
  total_value_cents BIGINT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE b2b_contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contract parties see own" ON b2b_contracts FOR SELECT USING (provider_id = auth.uid() OR client_id = auth.uid());
CREATE POLICY "Either party manages" ON b2b_contracts FOR ALL USING (provider_id = auth.uid() OR client_id = auth.uid());
```

### 3. Replace SupplyChain placeholder
`/supply-chain` → Shows material flow from supplier → maker → product → customer.

Visual: A simple flow diagram built from production_orders + products + makers data showing the supply chain for each active product.

### 4. Replace Manifests placeholder
`/manifests` → Shipping manifests for completed production orders.

Query production_orders WHERE status IN ('shipped','delivered') with product and maker joins. Show tracking info, quantities, destinations.

### 5. .net Navigation
Update NetworkApp.tsx with real components replacing all placeholder text.

## Build + Deploy

---

# K112 — WILDFIRE BEACON TOURS + POLISH + FINAL DEPLOY (45 min)

## Context
Last session. Make sure all Wildfire Beacon Tours trigger correctly, navigation is seamless, and nothing looks broken.

## Tasks

### 1. Verify all 14 Wildfire Beacon Runs
Check that each beacon run triggers correctly across all portals. The beacon system from K106 needs to work on every portal.

### 2. Portal-specific landing page polish
Each portal should have a clear, professional landing page:
- .com → ProductCatalog as the hero (not the old project carousel)
- DSS → The2ndSecondPortal (already good) with new nav links
- .biz → BusinessLanding with position/bounty count stats
- .net → NetworkLanding with active production orders stats
- .org → NonprofitLanding with Mission ONE hero

### 3. 404 and Empty State Polish
Every page that could show "no data" should have a dignified empty state:
- Products: "The first products are coming. Drop a beacon to get notified."
- Makers: "Be the first maker in your area. [Register]"
- Production orders: "No active orders yet."
- NOT "coming soon" or blank white page

### 4. Cross-Portal Link Verification
Click-test every cross-portal link:
- .com product → DSS maker profile
- DSS maker → .biz bounty board
- .biz production order → .net manifest
- .org earmark → .com storefront
- All should open in the correct portal domain

### 5. Update useCanonicalStats.ts
```ts
patentApplications: 10, // was 9
// Add if not present:
totalClaims: 1511,
```

### 6. Final Build + Deploy ALL targets
```bash
cd platform && npm run build && firebase deploy --only hosting -P default
supabase db push --linked
```

Verify all 7 domains load correctly. Take screenshots.

---

## FOUNDER CONTENT NEEDED (While Knight Builds)

The Founder needs to provide these during the sprint:

| Item | Where It Goes | Priority |
|------|-------------|----------|
| SlottedTop product photos (3-5 images) | ProductDetail + SlottedTopShowcase | CRITICAL |
| SlottedTop description (2-3 paragraphs) | ProductDetail | CRITICAL |
| SlottedTop specs (dimensions, materials, load) | ProductDetail | HIGH |
| HexIsle terrain photos (any existing renders) | Product seed data | HIGH |
| Short descriptions for 12 Kickstarter products | Product seed data | MEDIUM |
| Any existing maker contacts (for seed data) | Maker seed data | MEDIUM |

If photos aren't ready, Knight should use clean placeholder images with "RENDER COMING" badges — NOT broken image links.

---

## TOTAL ESTIMATED TIME

| Session | Time | What |
|---------|------|------|
| K107 | 90 min | Product catalog + makers + production orders |
| K108 | 90 min | DSS portal: Forge, STL Vault, SlottedTop, Test Pilot |
| K109 | 60 min | Cross-portal commerce loop + .biz bounties |
| K110 | 60 min | .org charitable: Mission ONE, Gleaner's, Earmarks |
| K111 | 45 min | .net: Replace all placeholders with real pages |
| K112 | 45 min | Wildfire, polish, empty states, final deploy |
| **TOTAL** | **~6.5 hrs** | **All portals operational** |

---

**FOR THE KEEP.**
