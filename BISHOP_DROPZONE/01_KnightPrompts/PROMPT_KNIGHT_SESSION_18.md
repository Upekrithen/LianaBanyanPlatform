# Knight Build Prompt — Session 18: XP Aggregation, Product Creator XP, Box Notation Display
# FOR KNIGHT: Build the XP rollup trigger, product/production XP paths, and box notation UI

**Date:** March 14, 2026
**Source:** Bishop (Founder's Product Creator XP concept, box notation display, preorder lock)

---

## IMPORTANT: SEC Language Rules

Throughout ALL code, comments, UI text, and variable names:
- "investment return" → "earned allocation authority" / "Service Allocation Authority (SAA)"
- "collateral" → "allocation budget" / "backing authority"
- "profit" / "dividend" → "operational surplus" / "service margin"
- "equity" → "participation" / "service allocation"
- "invest" → "sponsor" / "contribute" / "back"
- "revenue share" → "deferred payment for design services rendered"

The cooperative OWNS Joules. Members earn authority to DIRECT them, not own them.

---

## Task 1: XP Aggregation Trigger

**Context:** Session 17 created `xp_scores` and `xp_transactions` tables but did NOT create a trigger to roll up transaction data into the scores table. Currently STAMP inserts into `xp_transactions` but `xp_scores` never updates.

Create migration: `20260314000018_xp_aggregation_trigger.sql`

```sql
-- Trigger function: recalculate xp_scores when xp_transactions change
CREATE OR REPLACE FUNCTION public.recalculate_xp_scores()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.xp_scores (user_id, total_xp, bounties_completed, average_accomplishment_score, highest_single_xp, updated_at)
  SELECT
    NEW.user_id,
    COALESCE(SUM(xp_earned), 0),
    COUNT(*),
    COALESCE(AVG(accomplishment_score), 0),
    COALESCE(MAX(xp_earned), 0),
    NOW()
  FROM public.xp_transactions
  WHERE user_id = NEW.user_id
  ON CONFLICT (user_id) DO UPDATE SET
    total_xp = EXCLUDED.total_xp,
    bounties_completed = EXCLUDED.bounties_completed,
    average_accomplishment_score = EXCLUDED.average_accomplishment_score,
    highest_single_xp = EXCLUDED.highest_single_xp,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on insert
CREATE TRIGGER trg_xp_transaction_rollup
  AFTER INSERT ON public.xp_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_xp_scores();
```

**Test:** After deploying, verify that inserting an `xp_transaction` row automatically updates the corresponding `xp_scores` row.

---

## Task 2: Product Creator & Production Labor XP Schema

**Context:** Session 17's `xp_transactions` table only handles bounty XP. The Founder has designed two additional XP paths:

1. **Product Creator XP:** XP = unit_price × preorder_volume × (accomplishment_score / 5.0)
   - For makers/designers whose products are preordered and manufactured
   - Quality score acts as a FRACTION (always < 1.0), so XP is always LESS than price × volume
   - Higher quality = closer to theoretical max

2. **Production Labor XP:** XP = bounty_points_per_unit × units_produced × (quality_score / 5.0)
   - For workers who manufacture/assemble/STAMP production runs
   - Same fractional quality mechanic

3. **Preorder Lock:** Preorder volume is locked at production start — cannot inflate XP by adding orders after.

Create migration: `20260314000019_xp_product_production.sql`

```sql
-- Add xp_type and product/production fields to xp_transactions
ALTER TABLE public.xp_transactions
  ADD COLUMN IF NOT EXISTS xp_type TEXT NOT NULL DEFAULT 'bounty'
    CHECK (xp_type IN ('bounty', 'product', 'production')),
  ADD COLUMN IF NOT EXISTS preorder_volume INTEGER,
  ADD COLUMN IF NOT EXISTS unit_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS production_run_id UUID,
  ADD COLUMN IF NOT EXISTS volume_locked_at TIMESTAMPTZ;

-- XP calculation per type:
-- bounty:     xp_earned = bounty_points × accomplishment_score
-- product:    xp_earned = unit_price × preorder_volume × (accomplishment_score / 5.0)
-- production: xp_earned = bounty_points × preorder_volume × (accomplishment_score / 5.0)

COMMENT ON COLUMN public.xp_transactions.xp_type IS 'bounty = task completion, product = maker/designer preorder, production = manufacturing labor';
COMMENT ON COLUMN public.xp_transactions.preorder_volume IS 'Number of units preordered (locked at production start)';
COMMENT ON COLUMN public.xp_transactions.unit_price IS 'Price per unit in Credits (for product XP calculation)';
COMMENT ON COLUMN public.xp_transactions.production_run_id IS 'Reference to the production run (for production labor XP)';
COMMENT ON COLUMN public.xp_transactions.volume_locked_at IS 'Timestamp when preorder volume was locked — prevents post-lock inflation';

-- Production runs table (tracks manufacturing batches)
CREATE TABLE IF NOT EXISTS public.production_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  product_id UUID,
  certification_tier INTEGER CHECK (certification_tier BETWEEN 1 AND 6),
  total_units INTEGER NOT NULL,
  preorder_volume INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  designer_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_production', 'quality_check', 'completed', 'cancelled')),
  volume_locked_at TIMESTAMPTZ,
  production_started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.production_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read production runs" ON production_runs FOR SELECT USING (true);
CREATE POLICY "Service role manage production runs" ON production_runs FOR ALL USING (
  (SELECT auth.role()) = 'service_role'
);

-- Preorder lock function: locks volume at production start
CREATE OR REPLACE FUNCTION public.lock_preorder_volume(run_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.production_runs
  SET volume_locked_at = NOW(),
      status = 'in_production',
      production_started_at = NOW()
  WHERE id = run_id
    AND volume_locked_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- dna_lock entries
INSERT INTO public.dna_lock (parameter_key, parameter_value, data_type, description, category)
VALUES
  ('product_creator_xp', 'true', 'boolean', 'Product Creator XP path: price × volume × quality fraction', 'xp'),
  ('production_labor_xp', 'true', 'boolean', 'Production Labor XP path: bounty_points × volume × quality fraction', 'xp'),
  ('preorder_volume_lock', 'true', 'boolean', 'Lock preorder volume at production start to prevent XP inflation', 'xp')
ON CONFLICT (parameter_key) DO NOTHING;
```

---

## Task 3: Box Notation Display Component

**Context:** XP numbers can get very large (a viral product with 4M preorders could generate 100M+ XP). The Founder designed a compression display:

- Every 10,000 XP = 1 "box"
- Display shows: [box_count] + remainder (0-9,999)
- Box count goes 1-9999, then "solid box" (maxed display)
- Tier colors based on box count for visual progression

Create or update `src/components/reputation/XPBoxDisplay.tsx`:

```typescript
// Box notation conversion
function xpToBoxNotation(totalXp: number): {
  boxes: number;
  remainder: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'obsidian';
  isSolid: boolean;
} {
  const boxes = Math.floor(totalXp / 10000);
  const remainder = totalXp % 10000;
  const isSolid = boxes >= 10000;

  let tier: string;
  if (boxes === 0) tier = 'bronze';        // 0 - 9,999 XP
  else if (boxes <= 9) tier = 'silver';     // 10,000 - 99,999
  else if (boxes <= 99) tier = 'gold';      // 100,000 - 999,999
  else if (boxes <= 999) tier = 'platinum'; // 1,000,000 - 9,999,999
  else if (boxes <= 9999) tier = 'diamond'; // 10,000,000 - 99,999,999
  else tier = 'obsidian';                   // 100,000,000+

  return { boxes, remainder, tier, isSolid };
}
```

### Display Rules:
- **Bronze (no box):** Show raw number: `7,560 XP`
- **Silver-Diamond:** Show box + remainder: `[5] 4,000 XP` — box number in a colored square/badge
- **Obsidian (solid box):** Show filled/solid box icon — no number needed, it's the cap
- Box badge color matches tier (silver shimmer, gold glow, platinum shine, diamond sparkle, obsidian matte black)
- Tooltip on hover shows raw XP number for transparency

### Integration:
- Update `XPScoreDisplay` component (created Session 17) to use `XPBoxDisplay` for the total XP number
- Show XP type breakdown if member has multiple types: "Bounty: [2] 3,400 | Product: [28] 8,000 | Production: [16] 0"
- Add to member profile cards, leaderboards, and reputation displays

---

## Task 4: STAMP Verification Update for Product/Production XP

Update `src/components/bounty/STAMPVerification.tsx` to handle all three XP types:

### Bounty STAMP (existing — no change):
- Client/sponsor rates work 0.5-5.0
- XP = bounty_points × accomplishment_score
- Preview: "At score 3.5, [member] earns 140 XP"

### Product STAMP (new):
- Quality inspector/cooperative QA rates completed product run 0.5-5.0
- XP = unit_price × preorder_volume × (score / 5.0)
- Preview: "At score 4.2, [designer] earns 75,600 XP from 2,000 units at $45"
- Show box notation in preview: "That's [7] 5,600 XP!"
- Must reference a production_run with volume_locked_at set (preorders locked)

### Production STAMP (new):
- Receiving inspector/QA rates production worker output 0.5-5.0
- XP = bounty_points_per_unit × units_produced × (score / 5.0)
- Preview: "At score 4.0, [worker] earns 160,000 XP from 40,000 units"
- Show box notation: "That's [16] 0 XP!"

### Shared rules (all types):
- Cannot self-STAMP (stamped_by !== user_id)
- Score 0.5 to 5.0 in half-step increments
- XP earned is always calculated, never manually entered
- For product/production: preorder volume must be locked before STAMP is allowed

---

## Task 5: Update XP Aggregation Trigger for New Fields

Update the trigger from Task 1 to account for xp_type breakdown:

```sql
-- Add type-specific aggregation columns to xp_scores
ALTER TABLE public.xp_scores
  ADD COLUMN IF NOT EXISTS bounty_xp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS product_xp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS production_xp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS products_completed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS production_runs_completed INTEGER DEFAULT 0;

-- Update trigger function to aggregate by type
CREATE OR REPLACE FUNCTION public.recalculate_xp_scores()
RETURNS TRIGGER AS $$
DECLARE
  v_total_xp INTEGER;
  v_bounty_xp INTEGER;
  v_product_xp INTEGER;
  v_production_xp INTEGER;
  v_bounties INTEGER;
  v_products INTEGER;
  v_productions INTEGER;
  v_avg_score NUMERIC;
  v_highest INTEGER;
BEGIN
  SELECT
    COALESCE(SUM(xp_earned), 0),
    COALESCE(SUM(CASE WHEN xp_type = 'bounty' THEN xp_earned ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN xp_type = 'product' THEN xp_earned ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN xp_type = 'production' THEN xp_earned ELSE 0 END), 0),
    COUNT(*) FILTER (WHERE xp_type = 'bounty'),
    COUNT(*) FILTER (WHERE xp_type = 'product'),
    COUNT(*) FILTER (WHERE xp_type = 'production'),
    COALESCE(AVG(accomplishment_score), 0),
    COALESCE(MAX(xp_earned), 0)
  INTO v_total_xp, v_bounty_xp, v_product_xp, v_production_xp,
       v_bounties, v_products, v_productions, v_avg_score, v_highest
  FROM public.xp_transactions
  WHERE user_id = NEW.user_id;

  INSERT INTO public.xp_scores (
    user_id, total_xp, bounty_xp, product_xp, production_xp,
    bounties_completed, products_completed, production_runs_completed,
    average_accomplishment_score, highest_single_xp, updated_at
  ) VALUES (
    NEW.user_id, v_total_xp, v_bounty_xp, v_product_xp, v_production_xp,
    v_bounties, v_products, v_productions,
    v_avg_score, v_highest, NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_xp = EXCLUDED.total_xp,
    bounty_xp = EXCLUDED.bounty_xp,
    product_xp = EXCLUDED.product_xp,
    production_xp = EXCLUDED.production_xp,
    bounties_completed = EXCLUDED.bounties_completed,
    products_completed = EXCLUDED.products_completed,
    production_runs_completed = EXCLUDED.production_runs_completed,
    average_accomplishment_score = EXCLUDED.average_accomplishment_score,
    highest_single_xp = EXCLUDED.highest_single_xp,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Task 6: Preorder-Funded Production UI Indicator

Add a visual indicator wherever products are displayed showing the preorder-funded model:

- Badge/tag: "Pre-Sold • Paid Before Production"
- Tooltip: "All preorders are paid in full before manufacturing begins. No speculative production."
- Show on: Product listings, Creator Showcase cards, production run status pages
- This is NOT optional — it's a core SEC-safety signal

---

## Task 7: Verify & Commit

1. `npx tsc --noEmit` — fix any TypeScript errors
2. Commit with message: "Session 18: XP aggregation trigger, product/production XP paths, box notation display, preorder lock"
3. Bishop will push migrations 000018-000019

---

## NOTES FOR KNIGHT

- Bishop has pushed migrations through 000017. Knight creates 000018-000019, Bishop will push.
- Innovation count remains 1,662.
- The XP aggregation trigger (Task 1) is the HIGHEST PRIORITY — without it, STAMP verification creates transactions that never roll up into visible scores.
- Box notation display should degrade gracefully — if XP is 0, just show "0 XP" with no box.
- The `volume_locked_at` field is critical: Product/Production STAMP must be BLOCKED if the production run's preorder volume hasn't been locked yet. This prevents XP calculation on a moving target.
- Product Creator XP uses `accomplishment_score / 5.0` as a fraction (not raw multiplication). This means max quality (5.0/5.0 = 1.0) gives exactly price × volume. Any lower score reduces it.
- Production Labor XP uses the same fraction: `bounty_points × volume × (score / 5.0)`.
- XP types are additive — a member can have bounty XP + product XP + production XP. Total XP = sum of all three. Box notation applies to the total.

---

*Generated by Bishop for Knight. March 14, 2026.*
*FOR THE KEEP.*
