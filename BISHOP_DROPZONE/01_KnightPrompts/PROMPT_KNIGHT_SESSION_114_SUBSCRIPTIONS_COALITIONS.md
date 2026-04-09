# KNIGHT SESSION 114: Subscription Engine + Coalition Formation + Hybrid Discount

## Brief
Call `brief_me("subscription engine, coalition formation, hybrid discount for cooperative commerce")`

## Context
K107-K113 complete and deployed. All 7 portals operational. Product catalog, makers, production pipeline, factory node visualization all live. Now we wire the cooperative economic engine — the thing that makes members stay and revenue recur.

Canonical stats: 1,981 innovations | 1,511 claims | 10 provisionals | 21 production systems

**CRITICAL RULE:** Platform tokens/credits are NOT securities. Never use 'equity', 'shares', 'dividends', 'ROI', or 'invest'. Use 'participation', 'allocation', 'contribution', 'back'. Never promise passive income. Use 'may earn' not 'will earn'.

## Deliverable 1: Subscription Plans Page

New page: `/subscribe` on lianabanyan.com (marketplace portal)

Three tiers:
- **Explorer (Free):** Browse marketplace, view products, basic profile, WildFire tour access
- **Member ($10/mo):** List products, join coalitions, earn Credits, access Crew Tables, demand signaling (Ghost Credits)
- **Builder ($25/mo):** All Member features + priority production queue, Marks eligibility, Ghost Credit allocation, Maker Dashboard access, coalition creation

**Migration:** `20260326000005_subscriptions_engine.sql`
```sql
CREATE TABLE IF NOT EXISTS member_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('explorer', 'member', 'builder')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE member_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own subscription" ON member_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own subscription" ON member_subscriptions FOR ALL USING (auth.uid() = user_id);
```

Page layout: Three cards side by side. Current plan highlighted. Upgrade/downgrade buttons. Feature comparison grid below.

**DO NOT connect to Stripe yet** — just the UI and database. Stripe integration is a separate session.

## Deliverable 2: Coalition Formation + Directory

**Migration:** `20260326000006_coalitions_engine.sql`
```sql
CREATE TABLE IF NOT EXISTS coalitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT,
  creator_id UUID REFERENCES auth.users(id) NOT NULL,
  min_members INT DEFAULT 5,
  current_members INT DEFAULT 1,
  discount_tier NUMERIC(4,2) DEFAULT 0,
  treasury_credits INT DEFAULT 0,
  status TEXT DEFAULT 'forming' CHECK (status IN ('forming', 'active', 'paused', 'dissolved')),
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Check if coalitions table already exists before creating
-- If it exists, ALTER to add missing columns

CREATE TABLE IF NOT EXISTS coalition_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coalition_id UUID REFERENCES coalitions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  role TEXT DEFAULT 'member' CHECK (role IN ('founder', 'officer', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(coalition_id, user_id)
);
ALTER TABLE coalitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coalition_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view coalitions" ON coalitions FOR SELECT USING (true);
CREATE POLICY "Creator manages coalition" ON coalitions FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY "Anyone can view members" ON coalition_members FOR SELECT USING (true);
CREATE POLICY "Members manage own membership" ON coalition_members FOR ALL USING (auth.uid() = user_id);
```

**Pages:**
- `/coalitions` — Directory listing all coalitions. Search, filter by category. Card grid showing name, description, member count, discount tier, "Join" button.
- `/coalitions/create` — Form for Builder-tier members to create a coalition. Name, description, category, minimum members, slug auto-generated.
- `/coalitions/:slug` — Coalition detail page. Member list, treasury balance, current discount tier, activity feed placeholder, "Join Coalition" / "Leave Coalition" buttons.

Wire into App.tsx and UnifiedNavigation under marketplace portal.

## Deliverable 3: Hybrid Discount Display

When a user is a member of an active coalition, product cards in the marketplace show the coalition discount:

| Coalition Members | Discount |
|-------------------|----------|
| 5-9 | 5% |
| 10-24 | 10% |
| 25-49 | 15% |
| 50+ | 20% (cap) |

- Green "Coalition Discount" badge on product cards when user qualifies
- Discount calculated from platform margin (Cost+20%), NOT from creator's price
- Creator always gets their full price — the platform absorbs the discount
- Show "Save X%" on product detail page with tooltip explaining coalition economics

**Implementation:** 
- `useCoalitionDiscount(userId)` hook that checks user's coalition memberships and returns highest applicable discount
- Apply discount display (NOT actual price change yet) on ProductCatalog.tsx and CatalogProductDetail.tsx

## Build + Deploy
Build and deploy all 8 hosting targets when complete.

## FOR THE KEEP.
