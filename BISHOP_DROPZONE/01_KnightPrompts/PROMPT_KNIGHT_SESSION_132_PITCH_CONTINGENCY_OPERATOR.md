# Knight Session 132 — Pitch-Embedded Contingency Operator + Beacon Run Chain Bonus

**Priority:** HIGH
**Innovations:** #2001, #2002, #2003, #2004
**Depends on:** K127 (Business Campaigns), K131 (Programmable Card/Durin's Door), existing Contingency Operator system, Beacon Run system

---

## MISSION

Build the business-facing Contingency Operator that lives on the QR pitch landing page. When a business owner scans a Captain's card, they see an interactive calculator pre-loaded with THEIR scenario numbers. They can play with the sliders, save scenarios, and earn persistence through Beacon Run.

---

## DELIVERABLE 1: Pitch Contingency Operator Component

### New Files
- `src/components/pitch/PitchContingencyOperator.tsx` — Simplified CO calculator for business owners

### Requirements

**Pre-loaded Parameters (from campaign data):**
- Business type (from `business_campaigns.business_type`)
- Current pledge count (from `campaign_pledges` count)
- Estimated weekly order volume (derived from pledge count)
- Area demand signal (from Walking Billboard / LB Card usage data if available)

**Interactive Sliders:**
- Discount tier: C+20 / C+40 / C+60 / C+90 (maps to ~50% / ~40% / ~25% / ~10% off retail)
- Estimated weekly orders: 10 / 25 / 50 / 100 / 250 / 500 / 1000
- Average order value: $8 / $12 / $15 / $20 / $30 (default from business type)
- Delivery percentage: 0% / 25% / 50% / 75% / 100%

**Computed Outputs (update in real-time as sliders change):**
- Weekly revenue at selected tier
- Monthly revenue projection
- Revenue vs. current (if baseline provided)
- Mark earnings for the business owner
- "X customers already waiting" (from pledge count)
- Platform promotion level at selected tier (C+20 = BEST DEAL badge, maximum promotion)

**CTA at bottom:**
"Curious what happens if you adjust the numbers? Try different scenarios."
→ Button: "Save This Scenario" (requires login — Ghost Rules apply)

### Design
- Clean, mobile-first (most scans will be on phone)
- Use existing shadcn/ui Card, Slider, Badge components
- Match the Tiered Commitment Chart visual language (C+20 = green/best, C+90 = gray/entry)
- NO securities language. This is a "business research tool," not an "investment calculator"

---

## DELIVERABLE 2: Scenario Save + Ghost Persistence

### New Files
- `src/hooks/useSavedScenarios.ts` — CRUD for saved business scenarios
- `src/components/pitch/SavedScenariosPanel.tsx` — List/compare saved scenarios

### Migration
```sql
CREATE TABLE IF NOT EXISTS saved_business_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ, -- NULL = permanent (member), set = ghost timer
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT, -- For non-logged-in users (cookie/localStorage fallback)
  
  -- Scenario data
  campaign_id UUID REFERENCES business_campaigns(id),
  business_type TEXT NOT NULL,
  scenario_name TEXT DEFAULT 'Untitled Scenario',
  
  -- Parameters
  discount_tier TEXT NOT NULL, -- 'c20', 'c40', 'c60', 'c90'
  weekly_orders INTEGER NOT NULL,
  avg_order_value NUMERIC NOT NULL,
  delivery_pct NUMERIC NOT NULL,
  
  -- Computed results (stored for quick retrieval)
  weekly_revenue NUMERIC,
  monthly_revenue NUMERIC,
  mark_earnings NUMERIC,
  promotion_level TEXT
);

-- RLS: users see own scenarios, service role sees all
-- Ghost cleanup: cron deletes rows where expires_at < now()
```

### Ghost Rules
- **Non-member:** `expires_at = now() + interval '24 hours'`
- **Member:** `expires_at = NULL` (permanent)
- **Beacon Run extension:** Add hours to `expires_at` per completed run
- Cron job: `DELETE FROM saved_business_scenarios WHERE expires_at < now()` (run hourly)

---

## DELIVERABLE 3: Beacon Run Persistence Extension

### Modified Files
- `src/components/BeaconRunGame.tsx` or `src/components/WildfireBeaconRun.tsx` — Add persistence reward on completion
- `src/lib/beaconPoints.ts` — Add persistence time calculation

### Logic
On Beacon Run completion:
```typescript
// Calculate persistence extension
const PERSISTENCE_HOURS = [24, 48, 72, 96, 120, 144, 168]; // escalating
const runsCompleted = await getBeaconRunCount(userId);
const extensionHours = PERSISTENCE_HOURS[Math.min(runsCompleted, PERSISTENCE_HOURS.length - 1)];

// Extend all ghost scenarios for this user
await supabase
  .from('saved_business_scenarios')
  .update({ expires_at: `now() + interval '${extensionHours} hours'` })
  .eq('user_id', userId)
  .not('expires_at', 'is', null); // Don't touch permanent (member) scenarios
```

### UI
After Beacon Run completion, show: "Your saved scenarios just got [X] more hours of life!"

---

## DELIVERABLE 4: Consecutive Share Chain Bonus

### New Files
- `src/hooks/useShareChain.ts` — Track consecutive shares and compute bonus
- `src/components/beacon/ShareChainIndicator.tsx` — Visual chain progress (fire/streak metaphor)

### Migration
```sql
CREATE TABLE IF NOT EXISTS share_chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Chain state
  current_streak INTEGER NOT NULL DEFAULT 0,
  highest_streak INTEGER NOT NULL DEFAULT 0,
  bonus_pct NUMERIC NOT NULL DEFAULT 0, -- Current bonus percentage
  sustained BOOLEAN NOT NULL DEFAULT false, -- Hit 100%, now at 20% sustained
  
  -- Timing
  last_share_at TIMESTAMPTZ,
  chain_expires_at TIMESTAMPTZ, -- Chain breaks if no share before this
  
  -- Totals
  total_shares INTEGER NOT NULL DEFAULT 0,
  total_bonus_points NUMERIC NOT NULL DEFAULT 0,
  total_bonus_marks NUMERIC NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One chain per user
CREATE UNIQUE INDEX ON share_chains(user_id);
```

### Chain Logic
```typescript
function computeChainBonus(streak: number, sustained: boolean): number {
  if (sustained) return 20; // Permanent 20% after hitting 100%
  return Math.min(streak * 5, 100); // 0%, 5%, 10%... up to 100%
}

function computeChainExpiry(lastShareEngagement: number): Date {
  // Base: 48 hours
  // +1 hour per 10 views on last share
  // +4 hours per click-through
  // Max: 168 hours (1 week)
  const baseHours = 48;
  const viewBonus = Math.floor(lastShareEngagement.views / 10);
  const clickBonus = lastShareEngagement.clicks * 4;
  const totalHours = Math.min(baseHours + viewBonus + clickBonus, 168);
  return addHours(new Date(), totalHours);
}
```

### On Share via Plugin
1. Check if chain is still alive (`chain_expires_at > now()`)
2. If alive: increment streak, compute new bonus, extend expiry
3. If expired: reset streak to 1, bonus to 0%
4. Apply bonus to: Beacon Points, persistence extension, Marks earned
5. If streak hits 21 (100%): set `sustained = true`, reset streak display but keep 20% bonus

### ShareChainIndicator UI
- Show current streak as fire icons (like Duolingo streak)
- Show bonus percentage prominently
- Show time remaining on chain ("Share within 47h to keep your streak!")
- At 100%: celebration animation, then "SUSTAINED" badge (20% forever)

---

## DELIVERABLE 5: Integration — Wire CO into Pitch Packet Page

### Modified Files
- `src/pages/PitchPacketPage.tsx` — Add PitchContingencyOperator component below the pitch content

### Logic
- Fetch campaign data from URL params (`:slug`)
- Pre-load CO with campaign's business type, pledge count, area demand
- Default tier: C+60 (middle ground — let the business owner discover C+20 themselves)
- Below the CO: "Save this scenario to compare later" → Ghost Rules

---

## CANONICAL STATS

Update `useCanonicalStats.ts`:
- `innovationCount: 2045` (current canonical)
- `productionSystems: 25` (adding Pitch CO as #25)
- `crownJewels: 137`

---

## NAMING NOTE

The Founder is considering renaming "Member Portfolio" to "Bridge" — as in a ship's command center. The Helm (existing production system) has many Bridges. Each member's Bridge is their personal command center. If this is confirmed before K132, use "Bridge" instead of "Portfolio" or "Dashboard" throughout.

---

## SEC RULES
- This is a "business research tool" — NOT an "investment calculator"
- "Projected revenue" — NOT "projected returns"
- "Scenario" — NOT "forecast" or "financial projection"
- "Sponsorship Marks" — NOT "investment returns"
- ONE LEVEL attribution only on referral Marks

---

FOR THE KEEP.
