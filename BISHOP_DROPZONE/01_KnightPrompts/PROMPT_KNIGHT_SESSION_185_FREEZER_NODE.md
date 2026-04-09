# KNIGHT SESSION 185 — Freezer Node (#2105)
## Bishop B049 | New Feature Build
## Priority: LOW — deferred until Family Table is functional
## PREREQUISITE: Family Table (#1980/K130), Let's Make Dinner, Let's Get Groceries must be working

---

## CONTEXT

Innovation #2105: Freezer Node — batch meal preparation, storage, and distribution hub. The food equivalent of a Decentralized Factory Node (#1939). A member prepares meals in bulk from home or a rented commercial kitchen, freezes in portioned containers, and distributes through the cooperative's meal coordination system.

Key economics: Preparing 20 servings costs ~40% more than 4 servings. The Freezer Node operator keeps 4 for family, sells 16 at Cost+20%. Fixed costs (oven, prep, cleanup) spread across 5x output.

---

## DELIVERABLE 1: Freezer Node Profile in Helm

### Setup Flow

1. **Freezer Node Registration (`FreezerNodeSetup.tsx`)**
   ```
   Fields:
   - Node name: "Maria's Kitchen" or "The Vigil Family Freezer"
   - Location: address (for pickup/delivery radius calculation)
   - Kitchen type: Home kitchen / Rented commercial / Church kitchen / Community center
   - Capacity: max meals per batch (dropdown: 10, 20, 50, 100)
   - Delivery options: Pickup only / Local delivery (radius) / Both
   - Schedule: which days are batch prep days? Which days are pickup/delivery?
   - Food handler cert: upload or attestation (state requirements vary)
   ```

2. **Database: `freezer_nodes` table**
   ```sql
   CREATE TABLE freezer_nodes (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     operator_id UUID REFERENCES members(id),
     name TEXT NOT NULL,
     location GEOGRAPHY(POINT, 4326),
     address TEXT,
     kitchen_type TEXT DEFAULT 'home', -- home, commercial, church, community
     max_batch_size INTEGER DEFAULT 20,
     delivery_radius_km INTEGER DEFAULT 10,
     offers_pickup BOOLEAN DEFAULT true,
     offers_delivery BOOLEAN DEFAULT true,
     prep_days TEXT[], -- ['monday', 'thursday']
     pickup_days TEXT[], -- ['tuesday', 'friday']
     food_handler_cert BOOLEAN DEFAULT false,
     active BOOLEAN DEFAULT true,
     created_at TIMESTAMPTZ DEFAULT now()
   );
   ```

---

## DELIVERABLE 2: Freezer Inventory Management

### What the operator manages

```sql
CREATE TABLE freezer_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID REFERENCES freezer_nodes(id),
  recipe_id UUID REFERENCES family_table_recipes(id) NULL, -- link to cookbook
  meal_name TEXT NOT NULL,
  description TEXT,
  portions_available INTEGER NOT NULL,
  portions_reserved INTEGER DEFAULT 0,
  price_per_portion NUMERIC NOT NULL, -- at Cost+20%
  ingredient_cost_per_portion NUMERIC, -- for margin verification
  dietary_tags TEXT[], -- vegetarian, gluten-free, halal, etc.
  frozen_date DATE NOT NULL,
  expiry_date DATE NOT NULL, -- typically frozen_date + 90 days
  photo_url TEXT, -- social media URL (zero-storage pattern)
  status TEXT DEFAULT 'available', -- available, reserved, sold_out, expired
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Helm Inventory Card
- Grid of current inventory items with portions available
- Color-coded freshness: Green (< 30 days), Yellow (30-60 days), Red (> 60 days)
- "Add Batch" button → recipe selector from Family Table Cookbook → portion count → price
- Auto-calculate price from ingredient cost + Cost+20% margin
- Expiring items highlighted with "Discount" option

---

## DELIVERABLE 3: Order Flow

1. **Customer browses:** `/freezer-nodes` shows nearby nodes with available meals
   - Filter by: distance, dietary tags, meal type, price
   - Map view + list view
   - Each node card shows: name, available meals count, next pickup day, rating

2. **Customer orders:**
   - Select meals → add to cart → choose pickup or delivery
   - Payment via Universal Subscriptions engine (#2102) — all 4 currencies
   - Confirmation with pickup time/location or delivery estimate

3. **Operator fulfills:**
   - Order notification in Helm
   - Mark order as "Ready for pickup" or "Out for delivery"
   - Delivery coordination with Rideshare Routes / Local Wheels driver
   - Customer confirms receipt → Marks allocated to operator

4. **Database: `freezer_orders` table**
   ```sql
   CREATE TABLE freezer_orders (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     customer_id UUID REFERENCES members(id),
     node_id UUID REFERENCES freezer_nodes(id),
     items JSONB NOT NULL, -- [{inventory_id, quantity, price}]
     total_amount NUMERIC NOT NULL,
     currency TEXT DEFAULT 'credits',
     fulfillment_type TEXT DEFAULT 'pickup', -- pickup, delivery
     delivery_address TEXT,
     status TEXT DEFAULT 'pending', -- pending, confirmed, ready, delivered, completed
     pickup_date DATE,
     subscription_id UUID REFERENCES member_subscriptions(id) NULL, -- for recurring orders
     created_at TIMESTAMPTZ DEFAULT now()
   );
   ```

---

## DELIVERABLE 4: Cooperative Purchasing Integration

When a Freezer Node operator creates a batch:
- System calculates total ingredient needs from recipe × portions
- Checks Let's Get Groceries cooperative purchasing for bulk deals
- Shows operator: "Buy flour at $2.50/5lb (retail) or $1.60/5lb (cooperative bulk) — save 36%"
- Operator can join or create a cooperative bulk buy for their batch ingredients

This connects Family Table → Cooperative Purchasing → Freezer Node in a single flow.

---

## DELIVERABLE 5: Freezer Node Cue Card

**Front:** "Freezer Node — Cook once, feed the neighborhood. Keep 83.3%."
**Back:**
- What you do: Batch-cook meals, freeze in portions, distribute through the cooperative
- What you earn: $800-2,000/month (depending on batch size and frequency)
- What you need: A kitchen, a freezer, a $5/year membership, basic food handler knowledge
- Monthly example: 2 batches/week × 16 portions × $8/portion = $1,024/month (before platform share)
- Pioneer bonus: First 10 get 50 Marks/month for 12 months

---

## BUILD + DEPLOY CHECKLIST

```
[ ] freezer_nodes table migration
[ ] freezer_inventory table migration
[ ] freezer_orders table migration
[ ] FreezerNodeSetup.tsx registration
[ ] Inventory management in Helm
[ ] /freezer-nodes browse + map route
[ ] Order flow with payment (via K182)
[ ] Delivery coordination integration
[ ] Cooperative purchasing integration
[ ] Freezer Node Cue Card template
[ ] Pioneer Program integration (K184)
[ ] Build: zero errors
[ ] Deploy all 8 targets
```

---

*Knight Session 185 — Bishop (Foreman), B049*
*Innovation #2105 — Freezer Node*
*DEFERRED: Build after Family Table + Let's Make Dinner + Let's Get Groceries are functional.*
*FOR THE KEEP!*
