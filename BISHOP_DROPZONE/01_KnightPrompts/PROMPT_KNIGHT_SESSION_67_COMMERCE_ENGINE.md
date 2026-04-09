# Knight Session 67 Prompt — COMMERCE ENGINE
## The Transactional Infrastructure That Makes Everything Real
## Priority: CRITICAL — This is the gap between "see the site" and "use the site"
## Innovation Count: 1,856

---

> **FOUNDER MANDATE:** "Can I hand a card to a neighbor and they can do that tomorrow?"
> This session builds the answer: YES.

---

## Overview

Sessions 65-66 built informational pages. Session 67 builds the TRANSACTION FLOW — the path from "scan QR" to "food delivered, money moved, Runner earns passive income."

**Build order matters.** Each piece depends on the previous:
1. Menu/Storefront builder (Runner creates a shop's menu)
2. Cart + Checkout (customer orders and pays)
3. Order aggregation (midnight cutoff, consolidated list to provider)
4. Dashboards (provider sees orders, Runner sees route, onboarder sees passive income)
5. Cue Card generator (Runner prints cards)
6. Onboarding Credit + Steward system (passive income for the work of bringing businesses onto LB)

---

## Task 1: Storefront Builder Page (`/tools/storefront-builder`)

**What it does:** An LB member (the Runner) creates a menu page for a local business.

### Build:
1. Create `src/pages/tools/StorefrontBuilder.tsx`
2. Route: `/tools/storefront-builder`
3. Layout: PortalPageLayout

### Flow:
```
Runner clicks "Create Storefront" →
  Step 1: Business name, category (food/service/retail), location
  Step 2: Upload logo/photo (or skip)
  Step 3: Add menu items:
    - Item name, Description (optional), Price
    - Photo (upload or skip)
    - Category (e.g., "Donuts", "Kolaches", "Drinks")
    - Available days (M-F, weekends, daily)
  Step 4: Set order cutoff time (midnight default, configurable)
  Step 5: Set delivery window ("7:00-8:00 AM")
  Step 6: Preview → Publish
```

### Database: migration `20260321000003_storefronts.sql`

```sql
CREATE TABLE IF NOT EXISTS storefronts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  business_name TEXT NOT NULL,
  business_category TEXT NOT NULL DEFAULT 'food',
  business_location TEXT,
  logo_url TEXT,
  order_cutoff_time TIME NOT NULL DEFAULT '00:00:00',
  delivery_window_start TIME NOT NULL DEFAULT '07:00:00',
  delivery_window_end TIME NOT NULL DEFAULT '08:00:00',
  is_active BOOLEAN DEFAULT true,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS storefront_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storefront_id UUID NOT NULL REFERENCES storefronts(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  photo_url TEXT,
  category TEXT DEFAULT 'general',
  available_days TEXT[] DEFAULT ARRAY['mon','tue','wed','thu','fri','sat','sun'],
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE storefronts ENABLE ROW LEVEL SECURITY;
ALTER TABLE storefront_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active storefronts" ON storefronts FOR SELECT USING (is_active = true);
CREATE POLICY "Owners manage own storefronts" ON storefronts FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Anyone can view active items" ON storefront_items FOR SELECT USING (is_active = true);
CREATE POLICY "Storefront owners manage items" ON storefront_items FOR ALL USING (
  storefront_id IN (SELECT id FROM storefronts WHERE owner_id = auth.uid())
);
```

---

## Task 2: Menu Page + Cart + Stripe Checkout (`/menu/:slug`)

**What it does:** Customer scans QR, sees the menu, adds items, checks out via existing Stripe.

### Build:
1. Create `src/pages/MenuPage.tsx`
2. Route: `/menu/:slug`
3. **PUBLIC page** — no login required to browse. Guest checkout via Stripe (email only).

### Stripe Checkout Integration:
- On "Order" click → Stripe Checkout Session (use EXISTING Stripe config)
- Line items: each menu item + delivery fee
- Success URL: `/order-confirmed/:orderId`
- Metadata: storefront_id, items, delivery_date

### Database: migration `20260321000004_orders.sql`

```sql
CREATE TABLE IF NOT EXISTS menu_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storefront_id UUID NOT NULL REFERENCES storefronts(id),
  customer_id UUID REFERENCES auth.users(id),
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  items JSONB NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 2.00,
  subtotal DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  stripe_session_id TEXT,
  stripe_payment_status TEXT DEFAULT 'pending',
  delivery_date DATE NOT NULL,
  delivery_status TEXT DEFAULT 'pending',
  stamp_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE menu_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers view own orders" ON menu_orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Storefront owners view their orders" ON menu_orders FOR SELECT USING (
  storefront_id IN (SELECT id FROM storefronts WHERE owner_id = auth.uid())
);
```

---

## Task 3: Order Aggregation + Provider Notification

### Build:
1. Supabase Edge Function: `aggregate-orders`
2. Triggered by cron at cutoff time (or manual for testing)
3. Groups orders by storefront → itemized list → sends to provider via email
4. Add SMS via Moneypenny/Twilio when A2P approved

---

## Task 4: Provider Dashboard (`/dashboard/provider`)

Shows: today's orders, tomorrow's pre-orders (live count), this week's revenue, payout date, item breakdown.

---

## Task 5: Runner Dashboard (`/dashboard/runner`)

Shows: tomorrow's route, pickups + deliveries in order, item counts, earnings, STAMP upload button.

---

## Task 6: QR Cue Card Generator (`/tools/cue-card-generator`)

Select storefront → upload logo → select template → preview 3.5"×2" card → download PDF (jsPDF). Front: shop name/logo + "Order by [time]." Back: QR code + LB branding.

---

## Task 7: Treasure Map Chest Page (`/treasure-maps`)

Cards for each map: Breakfast Runner, Lunch Runner, Taco Truck, Catering, Grocery, Service. Level badges, startup cost, monthly revenue estimate, "Start This Map" button. Content in A&A docs 019C and 019D.

---

## Task 8: Onboarding Credit + Steward System

**THE KEY INNOVATION:** When a Runner onboards a business onto LB and qualifies (10 orders + 30 days), they earn 3% passive income from that business's LB revenue — FOREVER — from the platform's 13.3% share, NOT from the business's 83.3%.

### Database: migration `20260321000005_onboarding_credits.sql`

```sql
-- Onboarding Credits: passive income for the member who brought a business onto LB
CREATE TABLE IF NOT EXISTS onboarding_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarder_id UUID NOT NULL REFERENCES auth.users(id),
  storefront_id UUID NOT NULL REFERENCES storefronts(id),
  qualification_date DATE,
  credit_percentage DECIMAL(4,2) DEFAULT 3.00,
  is_qualified BOOLEAN DEFAULT false,
  orders_count INT DEFAULT 0,
  first_order_date DATE,
  is_active BOOLEAN DEFAULT true,
  paused_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Steward Agreements: ongoing management fee for digital operations
CREATE TABLE IF NOT EXISTS steward_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  steward_id UUID NOT NULL REFERENCES auth.users(id),
  storefront_id UUID NOT NULL REFERENCES storefronts(id),
  management_fee_percentage DECIMAL(4,2) DEFAULT 2.00,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Storefront ownership transfer log
CREATE TABLE IF NOT EXISTS storefront_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storefront_id UUID NOT NULL REFERENCES storefronts(id),
  from_user_id UUID NOT NULL REFERENCES auth.users(id),
  to_user_id UUID NOT NULL REFERENCES auth.users(id),
  transfer_date DATE NOT NULL,
  reason TEXT,
  onboarding_credit_preserved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE onboarding_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE steward_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE storefront_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Onboarders view own credits" ON onboarding_credits
  FOR SELECT USING (auth.uid() = onboarder_id);
CREATE POLICY "Stewards view own agreements" ON steward_agreements
  FOR SELECT USING (auth.uid() = steward_id);
CREATE POLICY "Transfer participants view transfers" ON storefront_transfers
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Admin manages credits" ON onboarding_credits FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin manages agreements" ON steward_agreements FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin manages transfers" ON storefront_transfers FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
```

### Qualification Logic (Edge Function or trigger):
When an order is fulfilled for a storefront:
1. Check if storefront has an unqualified onboarding_credit record
2. Increment orders_count
3. If orders_count >= 10 AND first_order_date + 30 days <= today → set is_qualified = true, set qualification_date

### Revenue Split Logic (in payment processing):
```
On every paid order:
  total = order total
  business_share = total × 0.833          → to provider
  gleaners_share = total × 0.033          → to Gleaner's Corner
  platform_share = total × 0.134          → platform ops

  IF storefront has qualified onboarding_credit:
    onboarding_cut = total × 0.030        → to onboarder
    platform_share = total × 0.104        → reduced platform ops

  IF storefront has active steward_agreement:
    steward_cut = total × 0.020           → to steward
    platform_share = platform_share - 0.020 → further reduced
```

---

## Task 9: Passive Income Dashboard (`/dashboard/onboarder`)

Shows all businesses the member has onboarded, their monthly LB revenue, the 3% credit earned from each, steward fees if applicable, and total passive income. See A&A 019E for full mockup.

---

## Task 10: Innovation Count → 1,856

Update `useCanonicalStats.ts`.

---

## Build Order (Dependencies)

```
Task 1 (Storefront Builder) + Task 7 (Treasure Maps) + Task 10 (Count)  → PARALLEL
Task 2 (Menu + Cart + Stripe)                                            → after Task 1
Task 3 (Aggregation) + Task 4 (Provider Dash) + Task 5 (Runner Dash)    → after Task 2, PARALLEL
Task 6 (Cue Card Generator)                                              → after Task 1
Task 8 (Onboarding Credit tables)                                        → after Task 1
Task 9 (Passive Income Dashboard)                                         → after Task 8
```

**This may span 2-3 Knight sessions. Prioritize Tasks 1→2→3 first — that's the minimum viable "scan and order" flow.**

---

## A&A Reference Documents (all in BISHOP_DROPZONE)

| Document | Innovations |
|----------|------------|
| `AA_SESSION_019B_COALITION_AND_SUBSCRIPTION_TURNKEY.md` | #1819-#1828 |
| `AA_SESSION_019C_DONUT_DELIVERY_TREASURE_MAP.md` | #1829-#1835 |
| `AA_SESSION_019D_TREASURE_MAP_EXPANSION_PACK.md` | #1836-#1847 |
| `AA_SESSION_019E_ONBOARDING_CREDIT_AND_STEWARD_PATH.md` | #1848-#1856 |

---

**FOR THE KEEP.**
