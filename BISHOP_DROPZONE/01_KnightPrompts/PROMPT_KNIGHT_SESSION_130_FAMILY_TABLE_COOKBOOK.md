# Knight Session 130 — Family Table: Recipe/Menu Cookbook + Scheduled Meal Pipeline
## Dependencies: K127 (Business Onboarding Campaigns), K128 (Cold Start Cue Cards)
## Priority: HIGH — this is the "zero risk" fallback AND the long-term meal planning infrastructure

---

## CONTEXT

The Family Table is the meal planning hub for LB members. It connects home cooking, restaurant orders, and grocery sourcing into a single weekly planner. This is CRITICAL for the restaurant pitch because even if a restaurant says NO to any discount, we can still list their menu in the Cookbook and send them customers.

The Family Table Cookbook is both:
1. **The worst-case fallback** — "Change nothing, we list your menu, families see it"
2. **The growth engine** — scheduled pre-orders aggregate into guaranteed demand

---

## BUILD ORDER

### Step 1: Family Table Page (`/family-table`)

The main hub with three sections:

```
┌──────────────────────────────────────────────────────────────┐
│  FAMILY TABLE — Plan Your Week                                │
│                                                               │
│  [This Week]  [Cookbook]  [My Lists]                          │
│                                                               │
│  ┌─ THIS WEEK ───────────────────────────────────────────┐   │
│  │ Mon  Tue  Wed  Thu  Fri  Sat  Sun                     │   │
│  │                                                        │   │
│  │ 🏠    🍽️    🏠    🍽️    🍽️    🏠    🍽️                      │   │
│  │ Home  La    Home  Lupi- La    BBQ   La                │   │
│  │ cook  Cap.  cook  ta's  Cap.        Cap.              │   │
│  │                                                        │   │
│  │ Weekly spend: $47.12 (saved $5.22 vs retail)          │   │
│  │ [Submit Orders] → sends pre-orders to restaurants     │   │
│  └────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

**Data model:**
```typescript
interface MealPlan {
  id: string;
  user_id: string;
  week_start: string; // ISO date (Monday)
  meals: MealSlot[];
}

interface MealSlot {
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  meal_type: 'breakfast' | 'lunch' | 'dinner';
  source: 'home' | 'restaurant' | 'grocery';
  // If restaurant:
  restaurant_id?: string;
  menu_items?: MenuItem[];
  scheduled_pickup_time?: string;
  servings: number;
  // If home:
  recipe_id?: string;
  // Calculated:
  estimated_cost: number;
  discount_tier?: string; // C+90, C+60, etc.
}
```

### Step 2: Restaurant Menu Catalog (`/cookbook`)

Browse partner restaurants and their menus:

```
┌─ COOKBOOK ─────────────────────────────────────────────────┐
│                                                            │
│  🔍 Search restaurants, dishes, or cuisines...             │
│                                                            │
│  📍 Near you:                                               │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 🍽️ La Capital del Sabor                              │  │
│  │    Bandera Rd · Mexican · $6.99-$14.55              │  │
│  │    ★ Tier 2 Partner — 10% off for LB members        │  │
│  │    Popular: Borrego, Lunch Special, Consome          │  │
│  │    [View Menu]  [Add to Meal Plan]                  │  │
│  └─────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 🧁 Lupita's Bakery                                   │  │
│  │    Bandera Rd · Bakery · $2.99-$8.99                │  │
│  │    ☆ Listed — Full Price (no discount yet)           │  │
│  │    Popular: Pan dulce, Tres Leches, Pastry Box      │  │
│  │    [View Menu]  [Add to Meal Plan]                  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  Filter: [All] [Partners] [Best Deals] [Cuisine ▼]       │
└────────────────────────────────────────────────────────────┘
```

**Data model:**
```typescript
interface RestaurantListing {
  id: string;
  name: string;
  address: string;
  cuisine: string[];
  price_range: string;
  partnership_tier: 'none' | 'cookbook' | 'c90' | 'c60' | 'c40' | 'c20';
  discount_pct: number; // 0, 10, 25, 40, 50
  menu_items: MenuItem[];
  hours: BusinessHours;
  delivery_options: ('pickup' | 'own_delivery' | 'crew_call' | 'third_party')[];
  scheduling_available: boolean;
}

interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price_retail: number;
  price_lb: number; // After discount
  category: string; // 'lunch_special', 'dinner', 'breakfast', etc.
  dietary: string[]; // 'vegetarian', 'gluten-free', etc.
  available_days: string[]; // ['mon', 'tue', 'wed', 'thu', 'fri']
  available_hours: string; // '11:00-15:00'
  image_url?: string;
}
```

### Step 3: Scheduled Pre-Order System

When a member submits their weekly meal plan:

```typescript
// Pre-order aggregation
interface ScheduledOrder {
  id: string;
  user_id: string;
  restaurant_id: string;
  items: { menu_item_id: string; quantity: number }[];
  scheduled_date: string;
  pickup_window: string;
  servings: number;
  total_retail: number;
  total_lb: number; // After discount
  status: 'scheduled' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'cancelled';
  advance_payment_amount?: number; // For C+40/C+20 partners
}

// Daily prep manifest (sent to restaurant)
interface DailyManifest {
  restaurant_id: string;
  date: string;
  orders: ScheduledOrder[];
  summary: { item_name: string; total_quantity: number }[];
  total_orders: number;
  total_revenue: number;
  advance_paid: number;
  pickup_windows: string[];
}
```

### Step 4: Price Comparison Display

On every restaurant menu item, show the tier pricing:

```
┌──────────────────────────────────────────────────┐
│  Lunch Special (Rotating Daily)                   │
│                                                   │
│  Retail:    $9.49                                 │
│  LB Card:  $8.54  (C+90 Partner — save $0.95)   │
│                                                   │
│  [Add to Monday Lunch]  [Add to Meal Plan]       │
│                                                   │
│  Available: Mon-Fri, 11AM-3PM                    │
│  Includes: Rotating entrée + tea                 │
└──────────────────────────────────────────────────┘
```

For C+40/C+20 partners, also show:
```
│  If they were C+40: $5.69  (save $3.80)          │
│  If they were C+20: $4.75  (save $4.74) ← BEST  │
```

This subtly educates members about the tier system AND creates pressure on restaurants to deepen their commitment ("my customers can see they'd save more if I went to Tier 4...").

### Step 5: Supabase Migration

```sql
-- Restaurant listings
CREATE TABLE restaurant_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  cuisine TEXT[],
  price_range TEXT,
  partnership_tier TEXT DEFAULT 'none' CHECK (partnership_tier IN ('none', 'cookbook', 'c90', 'c60', 'c40', 'c20')),
  discount_pct NUMERIC DEFAULT 0,
  hours JSONB,
  delivery_options TEXT[],
  scheduling_available BOOLEAN DEFAULT false,
  captain_id UUID REFERENCES auth.users(id),
  onboarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Menu items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurant_listings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_retail NUMERIC NOT NULL,
  price_lb NUMERIC, -- Calculated from restaurant tier
  category TEXT,
  dietary TEXT[],
  available_days TEXT[],
  available_hours TEXT,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Meal plans
CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  week_start DATE NOT NULL,
  meals JSONB NOT NULL DEFAULT '[]',
  submitted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- Scheduled orders
CREATE TABLE scheduled_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  restaurant_id UUID REFERENCES restaurant_listings(id),
  meal_plan_id UUID REFERENCES meal_plans(id),
  items JSONB NOT NULL,
  scheduled_date DATE NOT NULL,
  pickup_window TEXT,
  servings INTEGER DEFAULT 1,
  total_retail NUMERIC,
  total_lb NUMERIC,
  advance_payment NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'preparing', 'ready', 'picked_up', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Daily manifests (materialized view or generated)
CREATE TABLE daily_manifests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurant_listings(id),
  manifest_date DATE NOT NULL,
  summary JSONB NOT NULL, -- { item_name, total_quantity }[]
  total_orders INTEGER,
  total_revenue NUMERIC,
  advance_paid NUMERIC DEFAULT 0,
  sent_at TIMESTAMPTZ,
  UNIQUE(restaurant_id, manifest_date)
);

-- RLS
ALTER TABLE restaurant_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON restaurant_listings FOR SELECT USING (true);
CREATE POLICY "Captains manage own" ON restaurant_listings FOR ALL USING (captain_id = auth.uid());

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own plans" ON meal_plans FOR ALL USING (user_id = auth.uid());

ALTER TABLE scheduled_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own orders" ON scheduled_orders FOR ALL USING (user_id = auth.uid());
```

### Step 6: Restaurant Dashboard Addition

Add a `/business/orders` view for restaurant owners:

```
┌─ YOUR ORDERS (Restaurant View) ──────────────────────────┐
│                                                           │
│  📋 Tomorrow's Manifest (Friday, March 28)                │
│  ──────────────────────────────────────────               │
│  23 orders | $131.42 revenue | $65.71 advance paid       │
│                                                           │
│  Items to prep:                                          │
│  ├── Lunch Special (enchilada): 11                       │
│  ├── Lunch Special (taco): 8                             │
│  ├── Borrego plate: 4                                    │
│  ├── Agua fresca (guava): 12                             │
│  └── Consome: 3                                          │
│                                                           │
│  Pickup windows:                                         │
│  ├── 11:30-12:00: 14 orders                             │
│  └── 12:00-12:30: 9 orders                              │
│                                                           │
│  [Print Manifest]  [Confirm All]  [Flag Issue]           │
└──────────────────────────────────────────────────────────┘
```

---

## FILES TO CREATE/MODIFY

| File | Action |
|------|--------|
| `src/pages/FamilyTable.tsx` | CREATE — Main Family Table hub |
| `src/pages/Cookbook.tsx` | CREATE — Restaurant/menu browser |
| `src/pages/RestaurantDetail.tsx` | CREATE — Individual restaurant + menu |
| `src/pages/MealPlanBuilder.tsx` | CREATE — Weekly meal plan editor |
| `src/pages/business/OrderManifest.tsx` | CREATE — Restaurant order view |
| `src/hooks/useMealPlan.ts` | CREATE — Meal plan CRUD |
| `src/hooks/useRestaurants.ts` | CREATE — Restaurant listing queries |
| `src/hooks/useScheduledOrders.ts` | CREATE — Pre-order management |
| `supabase/migrations/family_table.sql` | CREATE — Tables above |
| `src/App.tsx` (or route file) | MODIFY — Add /family-table/*, /cookbook/* routes |

---

## CANONICAL NUMBERS

- **Innovation count: 2,025**
- Production systems: 23 (this becomes 24 when K121 deploys, 25 when Family Table deploys)
- Patent claims: 1,511
- Applications: 10

## RULES

- Credits NEVER cash out to fiat. One-way valve. Irrevocable.
- LB Card funded separately (direct deposit/bank transfer), NOT from Credits.
- No securities language anywhere.
- Prices shown as C+X% are ILLUSTRATIVE for the pitch — actual prices set by restaurant.
- The 20% margin is CONSTITUTIONAL — C+20 is the absolute floor.

---

FOR THE KEEP.
