# KNIGHT SESSION 189 — Monthly Pioneer Bonus Disbursement
## Bishop B050 | Integration Completion Phase
## Automate monthly Mark bonuses for all Pioneer tiers

---

## CONTEXT

K184 created the Pioneer Program with 5 tiers promising monthly Mark bonuses:
- Founders' Circle (#1-10): 50 Marks/month × 12 months
- Trailblazer (#11-100): 25 Marks/month × 6 months
- Pathfinder (#101-500): 15 Marks/month × 3 months
- Early Adopter (#501-1000): 5 Marks (ONE-TIME, not monthly)
- Standard (#1001+): No bonus

These bonuses are PROMISED but no mechanism exists to DISBURSE them. This session builds the automated disbursement system.

All Edge Functions are Deno. Existing ledgerWriter.ts for transaction deduplication.
Marks are transactional byproducts — effort-differential currency. NOT purchased, NOT investments.

---

## DELIVERABLE 1: Database Migration

```sql
-- Pioneer Bonus Log — tracks every disbursement
CREATE TABLE IF NOT EXISTS pioneer_bonus_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pioneer_id UUID REFERENCES pioneers(id) NOT NULL,
  member_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT NOT NULL,
  tier TEXT NOT NULL,
  bonus_marks INTEGER NOT NULL,
  billing_month TEXT NOT NULL, -- 'YYYY-MM' format
  status TEXT DEFAULT 'disbursed'
    CHECK (status IN ('disbursed', 'skipped', 'expired')),
  reason TEXT, -- for skips: 'inactive', 'duration_exceeded', 'already_disbursed'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (pioneer_id, billing_month) -- prevent double disbursement
);

ALTER TABLE pioneer_bonus_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own bonus log"
  ON pioneer_bonus_log FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "Service role can insert"
  ON pioneer_bonus_log FOR INSERT
  WITH CHECK (true); -- Edge Function uses service role
```

---

## DELIVERABLE 2: Disbursement Edge Function

**NEW FILE:** `supabase/functions/disburse-pioneer-bonuses/index.ts`

```typescript
// Called on 1st of each month (via pg_cron or manual admin trigger)
// 
// Algorithm:
// 1. Determine billing_month = current YYYY-MM
// 2. Query all pioneers with bonus_marks_monthly > 0
// 3. For each pioneer:
//    a. Calculate months_enrolled = months since enrolled_at
//    b. If months_enrolled >= bonus_duration_months → skip (reason: 'duration_exceeded')
//    c. Check pioneer_bonus_log for existing (pioneer_id, billing_month) → skip if exists
//    d. Special case: Early Adopter (one-time 5 Marks) → check if ANY prior disbursement exists
//    e. Insert pioneer_bonus_log record (status: 'disbursed')
//    f. Credit Marks to member:
//       - If credit_wallets table has a marks column, increment there
//       - OR insert transaction_ledger entry with category: 'pioneer_bonus'
//       - Use ledgerWriter for dedup with synthetic event_id: `pioneer_bonus_${pioneer_id}_${billing_month}`
// 4. Return summary: { disbursed: N, skipped: N, expired: N, total_marks: N }
//
// Edge cases:
// - Member enrolled mid-month: gets full month's bonus (no proration)
// - Member with multiple pioneer roles: each role processes independently
// - Concurrent invocation safety: UNIQUE constraint on (pioneer_id, billing_month) prevents doubles

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // Verify admin auth or cron secret
  // ... implementation ...
});
```

---

## DELIVERABLE 3: Admin Trigger in MoneyPenny

**MODIFY:** `MoneyPenny.tsx` or create a small admin panel section

Add a button in the admin interface:
- Label: "Disburse Pioneer Bonuses"
- Calls the Edge Function manually
- Shows result: "Disbursed X bonuses totaling Y Marks. Skipped Z (expired: W)."
- Only visible to admin users

---

## DELIVERABLE 4: Pioneer Bonus Display

**MODIFY:** `PioneerShowcasePage.tsx` or `HelmPage.tsx` (Pioneer Status card)

Add to the pioneer status section:
- **Last bonus:** "March 2026 — 50 Marks (Founders' Circle)"
- **Remaining:** "8 of 12 bonus months remaining"
- **Total earned:** "200 Marks from pioneer bonuses"
- Progress bar showing months completed / total months

Query from `pioneer_bonus_log` WHERE member_id = current user.

---

## DELIVERABLE 5: pg_cron Setup (if available)

If Supabase has pg_cron enabled:
```sql
-- Run disbursement on 1st of each month at 00:05 UTC
SELECT cron.schedule(
  'pioneer-bonus-monthly',
  '5 0 1 * *',
  $$SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/disburse-pioneer-bonuses',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')),
    body := '{}'
  )$$
);
```

If pg_cron is not available, the admin manual trigger in MoneyPenny is the fallback. Document this in the handoff.

---

## DELIVERABLE 6: Stats + Deploy

- Update useCanonicalStats: knightSessions=189
- Build: zero errors
- Deploy all 8 targets

---

## CRITICAL RULES

- Marks are transactional byproducts, NOT investments. SEC defense: Howey test defeated at threshold prong.
- Entity is Liana Banyan CORPORATION (Wyoming C-Corp). NOT an LLC.
- One-level attribution ONLY. Never 2nd-degree. NOT MLM.
- Credits NEVER cash out to fiat. One-way valve. Irrevocable.

---

## BUILD + DEPLOY CHECKLIST

```
[ ] pioneer_bonus_log table migration
[ ] disburse-pioneer-bonuses Edge Function
[ ] MoneyPenny admin trigger button
[ ] Pioneer bonus display in Helm/Showcase
[ ] pg_cron setup (if available) or document manual fallback
[ ] Update canonical stats
[ ] Build: zero errors
[ ] Deploy all 8 targets
```

---

*Knight Session 189 — Bishop (Foreman), B050*
*Make the Pioneer promises REAL. Monthly bonuses, automated.*
*FOR THE KEEP!*