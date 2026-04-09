# KNIGHT SESSION 188 — Cross-Role Purchasing Chain
## Bishop B050 | Integration Completion Phase
## Wire Pearl Diver → Bulk Buy → Freezer Node → Family Table

---

## CONTEXT

Four systems are BUILT but NOT CONNECTED:
- **Pearl Diver** (ResourceBoardPage.tsx) — posts deal tips with upvote/downvote
- **Freezer Node** (FreezerNodesPage.tsx, FreezerNodeSetup.tsx) — batch meal prep
- **Family Table** (FamilyTableHub.tsx) — weekly meal planner with tabs: This Week, Cookbook, My Lists
- **Let's Get Groceries** (LetsGetGroceriesPage.tsx) — scheduled grocery delivery

Existing bulk pricing library: `src/lib/bulkPricing.ts` (volume tiers: 5+: 5%, 10+: 10%, 20+: 15%, 40+: 20%)

The CHAIN should be: Pearl Diver finds deal → members group-buy → Freezer Node sources ingredients → batch-cooks meals → meals appear in Family Table planner.

Platform margin: Cost + 20%. Creators keep 83.3%.

---

## DELIVERABLE 1: Database Migration

**NEW MIGRATION:** `cooperative_purchases` table

```sql
CREATE TABLE IF NOT EXISTS cooperative_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tip_id UUID REFERENCES resource_board_tips(id),
  initiator_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  store_name TEXT,
  store_location TEXT,
  unit_price_retail NUMERIC,
  unit_price_cooperative NUMERIC,
  savings_percentage NUMERIC GENERATED ALWAYS AS (
    CASE WHEN unit_price_retail > 0 
    THEN ROUND((1 - unit_price_cooperative / unit_price_retail) * 100, 1)
    ELSE 0 END
  ) STORED,
  target_quantity INTEGER NOT NULL,
  threshold_quantity INTEGER NOT NULL DEFAULT 5,
  current_quantity INTEGER DEFAULT 0,
  status TEXT DEFAULT 'gathering'
    CHECK (status IN ('gathering', 'threshold_met', 'ordered', 'delivered', 'canceled', 'expired')),
  participants JSONB DEFAULT '[]',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '72 hours'),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-expire: trigger or pg_cron to set status='expired' when expires_at passes
-- RLS: public read on active purchases, authenticated insert, initiator update
ALTER TABLE cooperative_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active purchases"
  ON cooperative_purchases FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create purchases"
  ON cooperative_purchases FOR INSERT
  WITH CHECK (auth.uid() = initiator_id);

CREATE POLICY "Initiator can update own purchases"
  ON cooperative_purchases FOR UPDATE
  USING (auth.uid() = initiator_id);
```

---

## DELIVERABLE 2: Pearl Diver → Group Buy

**MODIFY:** `ResourceBoardPage.tsx`

On deal tip cards with 5+ net upvotes (upvotes - downvotes >= 5):
1. Show a **"Start Group Buy"** button (ShoppingCart icon)
2. Clicking opens a dialog/modal:
   - Pre-filled from tip: store name, location, deal description
   - Fields: target quantity, threshold quantity (default 5), unit price retail, unit price cooperative, expiry (default 72h)
3. On submit: insert `cooperative_purchases` record with `tip_id` linked
4. After creation, the tip card shows "Group Buy Active — X/Y joined" with a progress bar
5. Other members see **"Join Group Buy"** button → adds their member_id + quantity to participants JSONB, increments current_quantity
6. When `current_quantity >= threshold_quantity`, update status to 'threshold_met' (show celebration toast)

---

## DELIVERABLE 3: Freezer Node → Cooperative Purchasing

**MODIFY:** `FreezerNodeSetup.tsx` or `FreezerNodesPage.tsx`

When a Freezer Node operator creates a new inventory batch:
1. Show a **"Source Ingredients"** collapsible panel below the batch form
2. Panel queries:
   - Active `cooperative_purchases` where status IN ('gathering', 'threshold_met') and category matches food/grocery
   - Recent Pearl Diver tips in food/grocery categories with high confidence
3. Display comparison cards:
   ```
   🥕 Flour (5lb)
   Retail: $2.50 | Cooperative: $1.60 | Save 36%
   [Join Group Buy] or [Start Group Buy from this tip]
   ```
4. Use existing `bulkPricing.ts` volume tiers for savings calculation
5. Link ingredient sourcing to the batch record (optional: `ingredient_sources JSONB` on freezer_inventory)

---

## DELIVERABLE 4: Freezer Node → Family Table

**MODIFY:** `FamilyTableHub.tsx`

In the "This Week" tab:
1. Add a section: **"Available from Freezer Nodes"** (Snowflake icon)
2. Query nearby active `freezer_nodes` with `freezer_inventory` where `status = 'available'` and `portions_available > 0`
3. Show meal cards:
   - Meal name, price per portion, portions available
   - Dietary tags (vegetarian, gluten-free, halal, etc.)
   - Node name + distance (if location data available)
   - Freshness indicator: Green (< 30 days), Yellow (30-60), Red (> 60)
4. **"Order"** button navigates to `/freezer-nodes` with the node pre-selected
5. If no nearby Freezer Nodes, show: "No Freezer Nodes in your area yet. [Become a Freezer Node operator →](/freezer-nodes/setup)"

---

## DELIVERABLE 5: Shared Hook

**NEW FILE:** `src/hooks/useCooperativePurchasing.ts`

```typescript
export function useCooperativePurchasing() {
  // startGroupBuy(tipId, options) — create cooperative_purchase from a Pearl Diver tip
  // joinGroupBuy(purchaseId, quantity) — add member to participants
  // leaveGroupBuy(purchaseId) — remove member from participants
  // getActiveGroupBuys(filters?) — query active cooperative_purchases
  // getGroupBuyStatus(purchaseId) — single purchase with progress
  // getNearbyDeals(category?) — Pearl Diver tips matching food/grocery
}
```

---

## DELIVERABLE 6: Stats + Deploy

- Update useCanonicalStats: knightSessions=188
- Build: zero errors
- Deploy all 8 targets

---

## CRITICAL RULES

- Cost + 20% is CONSTITUTIONAL. Creators keep 83.3%.
- Credits NEVER cash out to fiat. One-way valve.
- Entity is Liana Banyan CORPORATION. NOT an LLC.
- Use existing `bulkPricing.ts` — do NOT create a new pricing system.

---

## BUILD + DEPLOY CHECKLIST

```
[ ] cooperative_purchases table migration
[ ] ResourceBoardPage.tsx — Group Buy button + join flow
[ ] FreezerNodeSetup.tsx — Source Ingredients panel
[ ] FamilyTableHub.tsx — Freezer Node meals section
[ ] useCooperativePurchasing.ts hook
[ ] Update canonical stats
[ ] Build: zero errors
[ ] Deploy all 8 targets
```

---

*Knight Session 188 — Bishop (Foreman), B050*
*Wire the food chain. Pearl Diver → Bulk Buy → Freezer Node → Family Table.*
*FOR THE KEEP!*