# BP079 Wave B — Sections B.4 & B.5 Completion Report
**Agent:** SEG-RC-B-Subscription+Libs (Sonnet 4.6, Statute §3)  
**Date:** 2026-06-10  
**Session:** BP079 Red Carpet Wave B

---

## B.4: Cue Card Library Wiring — BLOCKER IDENTIFIED

### Files Found
✅ `platform/src/lib/cueCardClickTracking.ts` (545 lines)  
✅ `platform/src/lib/cueCardDestinationService.ts` (462 lines)

Both files are imported and used in:
- `platform/src/pages/RedCarpet.tsx`
- `platform/src/components/BeaconRunCueCard.tsx`
- `platform/src/components/CandleBurstReward.tsx`
- `platform/src/components/DeckCardFrame.tsx`
- `platform/src/components/CueCardDestinationConfig.tsx`

### ❌ CRITICAL SCHEMA MISMATCH — BLOCKING ISSUE

**Problem:** The lib files were written for an **older schema** that does NOT match the Wave A migration (`20260610173000_bp079_red_carpet_substrate.sql`) that was just deployed.

#### Mismatch Details

**1. cueCardClickTracking.ts → cue_card_share_clicks table:**

| What lib expects (lines 213-217) | What Wave A created |
|----------------------------------|---------------------|
| `sharer_id` | ❌ Column does not exist |
| `template_id` | ❌ Column does not exist |
| (No mention of these) | `cue_card_id` (FK to leviathan_cue_cards) |
| | `click_token` (unique) |
| | `anonymous_session_id` |
| | `ip_country`, `user_agent_class` |
| | `converted`, `conversion_event_id` |

**2. cueCardDestinationService.ts → leviathan_cue_cards table:**

| What lib expects (lines 193-201) | What Wave A created |
|----------------------------------|---------------------|
| `card_code` | ❌ Column does not exist (Wave A uses `short_token`) |
| `stamp_owner_id` | ❌ Column does not exist (Wave A uses `creator_user_id`) |
| `destination_id` | ❌ Column does not exist |

**3. cueCardDestinationService.ts → cue_card_destinations table:**

| What lib expects (lines 134-155) | What Wave A created |
|----------------------------------|---------------------|
| `user_id` | ❌ Not a column (Wave A doesn't have this) |
| `cue_card_template_id` | ❌ Not a column |
| `project_ids` (array) | ❌ Not a column |
| `category_slug` | ❌ Not a column |
| `include_owned_only` | ❌ Not a column |
| `portfolio_filter` | ❌ Not a column |
| `is_own_project` | ❌ Not a column |
| `promotion_credit_rate` | ❌ Not a column |
| `display_name` | ❌ Not a column |
| (No mention of these) | `cue_card_id` (FK) |
| | `destination_type` (enum: 'onboard','storefront','walkthrough') |
| | `destination_url` |
| | `ab_variant` |
| | `priority` |
| | `active` |

### Decision Required

**Option 1:** Rewrite both lib files to match Wave A schema (RECOMMENDED)
- Pros: Wave A is the canonical production schema
- Cons: May break existing imports in 5+ files

**Option 2:** Amend Wave A migration to match lib schema
- Pros: Libs remain unchanged
- Cons: Wave A was just deployed; changing it is risky

**Recommendation:** Option 1 — Treat Wave A migration as source of truth. The libs appear to be from an earlier design iteration and need to be updated to match current production schema.

---

## B.5: Food Node Subscription Shape — ✅ COMPLETE

### Decision: Option A (New Table)

**Rationale:**
- `excalibur_subscriptions` is tightly coupled to Excalibur Class commercial product (topic/category Scribe slices)
- Food node subscriptions have distinct business model (weekly meal deliveries with physical delivery logistics)
- No usage of `excalibur_subscriptions` found in React codebase (only in migrations)
- Clean separation = better maintainability

### ✅ Migration Created

**File:** `platform/supabase/migrations/20260610180000_bp079_food_node_subscription.sql` (169 lines)

**Schema:**
```sql
CREATE TABLE food_node_subscriptions (
  id                        uuid PRIMARY KEY,
  subscriber_user_id        uuid NOT NULL REFERENCES auth.users(id),
  food_business_entity_id   uuid NOT NULL REFERENCES entity_memberships(id),
  
  -- Stripe integration
  stripe_subscription_id    text UNIQUE,
  stripe_customer_id        text,
  stripe_price_id           text,
  
  -- Subscription config
  weekly_intake             int (1-7 meals/week),
  delivery_day              text (monday-sunday),
  delivery_address          jsonb,
  
  -- State machine
  status                    text (pending | active | paused | canceled | suspended),
  
  -- Red Carpet attribution
  introducer_user_id        uuid REFERENCES auth.users(id),
  
  -- Timestamps (auto-tracked via trigger)
  created_at, activated_at, paused_at, canceled_at, suspended_at
)
```

**Features:**
- State tracking trigger (auto-sets timestamp columns on status transitions)
- RLS policies (subscribers can view own; business owners can view their subs)
- Indexes on subscriber, business, introducer, stripe IDs
- FK to `entity_memberships` table (verified exists in production)

### ✅ Edge Function Created

**File:** `platform/supabase/functions/create-food-node-subscription-checkout/index.ts` (205 lines)

**Features:**
- Creates Stripe Checkout Session in `subscription` mode
- Validates `food_business_entity_id` via `entity_memberships` lookup
- Checks for duplicate active/pending subscriptions
- Stores metadata: `subscriber_user_id`, `food_business_entity_id`, `weekly_intake`, `delivery_day`, `introducer_user_id`
- Creates pending subscription record in `food_node_subscriptions` table
- Uses env var: `STRIPE_PRICE_FOOD_NODE_WEEKLY` (placeholder — needs to be set in Supabase dashboard)

**Request body:**
```typescript
{
  food_business_entity_id: string,  // entity_memberships.id
  weekly_intake: number,            // 1-7 meals per week
  delivery_day: string,             // 'monday' | 'tuesday' | ...
  introducer_user_id?: string       // Red Carpet attribution (optional)
}
```

**Response:**
```typescript
{
  url: string  // Stripe Checkout URL
}
```

### 🔶 Webhook Handler — FUTURE WORK

**File:** `platform/supabase/functions/handle-membership-webhook/index.ts`

**Status:** Existing webhook handler handles membership payments only (checks `metadata.type === 'membership'`).

**Action Required (future wave):**
1. Add `food_node` branch to `handleCheckoutCompleted()` function
2. Check for `metadata.subscription_type === 'food_node'`
3. On `checkout.session.completed`:
   - Update `food_node_subscriptions` set `status = 'active'`, `activated_at = now()`, `stripe_subscription_id`, `stripe_customer_id`
   - If `introducer_user_id` present, create `promotion_attributions` row with `attribution_event = 'food_node_first_sub'`
4. On `customer.subscription.deleted`:
   - Update `food_node_subscriptions` set `status = 'canceled'`, `canceled_at = now()`
5. On `invoice.payment_succeeded` (recurring):
   - If `introducer_user_id` present, create `promotion_attributions` with `attribution_event = 'food_node_recurring'`

**Alternative:** Create separate `handle-food-node-subscription-webhook` function for cleaner separation.

---

## Summary of Deliverables

| Item | Status | File | Lines |
|------|--------|------|-------|
| B.4 Lib Schema Analysis | ❌ BLOCKED | (analysis only) | — |
| B.5 Migration | ✅ DONE | `20260610180000_bp079_food_node_subscription.sql` | 169 |
| B.5 Edge Function | ✅ DONE | `create-food-node-subscription-checkout/index.ts` | 205 |
| B.5 Webhook Handler | 🔶 FUTURE | (documented above) | — |

---

## Next Steps

### Immediate (Wave B continuation):
1. **Resolve B.4 blocker:** Decide whether to rewrite libs or amend Wave A migration
2. **Test food node checkout flow:** Deploy edge function, test with Stripe test mode
3. **Set env var:** Add `STRIPE_PRICE_FOOD_NODE_WEEKLY` to Supabase dashboard

### Future Waves:
4. **Webhook handler:** Extend `handle-membership-webhook` with food_node branch
5. **UI components:** Build food node subscription sign-up flow in React
6. **Delivery address capture:** Build address input component (tied to `delivery_address` jsonb column)

---

## Environment Variables Needed

**Supabase Edge Functions Dashboard:**
```
STRIPE_PRICE_FOOD_NODE_WEEKLY=price_XXXXXXXXXXXXXXXX
```
(This is a placeholder; actual Stripe Price ID must be created in Stripe Dashboard first)

---

## Truth-Always Constraints Applied

✅ Read every file before editing  
✅ Surgical edits only (no full rewrites)  
✅ FK to `entity_memberships` verified (table exists in production)  
✅ Env var placeholders used (no hardcoded values)  
✅ Migration follows BP079 naming convention  
✅ Edge function follows existing patterns from `create-membership-checkout`

---

**End of Report**
