# KNIGHT SESSION 76 — LB Card via Stripe Issuing (Two-Domain Architecture)
## Bishop Session 021 | March 23, 2026 | UPDATED v3 — Pawn research integrated
## Author: Bishop (Claude Desktop)
## Scope: Stripe Issuing integration — two-domain cash/cooperative separation, War Chest system, card management UI

---

> **CONTEXT**: Stripe Checkout is LIVE (7 checkout functions, webhook handler, all working). LB Card (#1758) is the next step. CRITICAL DESIGN: The LB Card operates in the **Cash Domain**, completely separate from the Credit/Mark/Joule cooperative economy. The card is a PAYROLL RAIL — funded only by LB paying members for work performed. Credits NEVER load onto the card. See Innovation #1911 (Two-Domain Architecture).
>
> **PAWN RESEARCH (Batch 10)**: Tax treatment confirmed. Substitution = clean 1099-NEC. Sponsorship = SAA is non-transferable governance, NOT §83 property, NO taxable event. Commission = constructive receipt applies, STAYS GRAYED OUT. See detailed findings in session handoff.
>
> **PREREQUISITE (FOUNDER)**: Before Knight starts, Founder must enable Stripe Issuing in the Stripe Dashboard. Application submitted — awaiting approval (24-48 hours).

---

## ARCHITECTURE: TWO HERMETICALLY SEALED DOMAINS

```
┌──────────────────────────┐     ┌──────────────────────────┐
│    COOPERATIVE DOMAIN    │     │      CASH DOMAIN         │
│                          │     │                          │
│  Credits (purchased)     │     │  LB Card (fiat USD)      │
│  Marks (work-earned)     │     │                          │
│  Joules (surplus stored) │     │  Funded ONLY by:         │
│  SAA (governance)        │     │  - Delivery fees         │
│                          │ ══╪══  - Creator 83.3% share   │
│  CLOSED LOOP             │ NO │  - Service payments      │
│  Never exits to cash     │CROSS│  - Bounty payouts        │
│                          │ ING│  - Project compensation   │
│  One-way IN:             │     │                          │
│  Cash → Credits (buy)    │     │  Purchase-only           │
│  Credits → Cash: NEVER   │     │  No ATM, no cash-out     │
└──────────────────────────┘     └──────────────────────────┘
```

**The LB Card is NOT funded by Credits.** It is funded by LB's operational Stripe account paying members for work — the same way any business pays contractors.

---

## WHAT WE'RE BUILDING

### Phase 1 (This Session)
1. Virtual cards via Stripe Issuing
2. Card funded by LB operational payments (payroll rail)
3. Separate card cash balance (NOT Credit balance)
4. War Chest system: eligible Mark tracking
5. **Substitution — LIVE** (clean tax: 1099-NEC for labor)
6. **Sponsorship — LIVE** (SAA is non-transferable governance = not §83 property = no taxable event)
7. **Commission — BUILT but GRAYED OUT** (constructive receipt confirmed by Pawn research — needs counsel)
8. Founder Portfolio feature flag toggles
9. Spending controls, freeze/unfreeze, transaction history

### Phase 2 (Future)
- Physical cards, Charity Linking (#1759), Business Accounts (#1760)

---

## EXISTING STRIPE INFRASTRUCTURE

| Component | Status | Location |
|-----------|--------|----------|
| @stripe/stripe-js | Installed (^8.7.0) | package.json |
| Checkout functions (7) | LIVE | supabase/functions/create-*-checkout/ |
| Webhook handler | LIVE | supabase/functions/stripe-webhook/ |
| user_credits table | LIVE | Tracks Credit balances |
| credit_transactions table | LIVE | Payment audit log |

**Pattern:** Continue using raw `fetch()` to `api.stripe.com/v1/`. Use `STRIPE_SECRET_KEY` from env.

---

## TASK 1: Database Schema

### Migration: `20260323000010_lb_card_and_war_chest.sql`

```sql
-- =============================================
-- LB CARD SYSTEM (Cash Domain)
-- Innovation #1758 + #1911 (Two-Domain Architecture)
-- =============================================

-- Cardholders (maps to Stripe Issuing cardholders)
CREATE TABLE lb_cardholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  stripe_cardholder_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  card_balance_cents INTEGER NOT NULL DEFAULT 0, -- CASH balance, NOT Credits
  spending_limit_daily INTEGER DEFAULT 5000,
  spending_limit_monthly INTEGER DEFAULT 50000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Individual cards
CREATE TABLE lb_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cardholder_id UUID NOT NULL REFERENCES lb_cardholders(id),
  stripe_card_id TEXT UNIQUE,
  card_type TEXT NOT NULL DEFAULT 'virtual',
  status TEXT NOT NULL DEFAULT 'inactive',
  last_four TEXT,
  exp_month INTEGER,
  exp_year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Card transactions (cash domain only)
CREATE TABLE lb_card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES lb_cards(id),
  stripe_authorization_id TEXT UNIQUE,
  amount_cents INTEGER NOT NULL,
  merchant_name TEXT,
  merchant_category TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  storefront_id UUID REFERENCES storefronts(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Card funding events (how cash arrives on the card)
CREATE TABLE lb_card_funding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cardholder_id UUID NOT NULL REFERENCES lb_cardholders(id),
  amount_cents INTEGER NOT NULL,
  funding_type TEXT NOT NULL,
  source_description TEXT,
  related_order_id UUID,
  related_project_id UUID,
  stripe_transfer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- WAR CHEST SYSTEM (Cooperative Domain tracking)
-- Innovation #1911
-- =============================================

-- Mark work records (tracks work done for Marks per project)
CREATE TABLE mark_work_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  project_id UUID,
  marks_earned NUMERIC(12,2) NOT NULL,
  work_description TEXT,
  is_funded BOOLEAN DEFAULT false,
  funded_at TIMESTAMPTZ,
  eligible_amount NUMERIC(12,2) DEFAULT 0,
  allocated_amount NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- War chest allocations (how eligible Marks are deployed)
CREATE TABLE war_chest_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  source_work_record_id UUID NOT NULL REFERENCES mark_work_records(id),
  allocation_type TEXT NOT NULL, -- 'substitution', 'commission', 'sponsorship'
  amount NUMERIC(12,2) NOT NULL,
  target_project_id UUID,
  target_bounty_id UUID,
  cash_paid_cents INTEGER,
  saa_earned NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Eligible marks summary view (for dashboard)
CREATE OR REPLACE VIEW war_chest_summary AS
SELECT
  user_id,
  SUM(marks_earned) AS total_marks_earned,
  SUM(CASE WHEN is_funded THEN eligible_amount ELSE 0 END) AS total_eligible,
  SUM(allocated_amount) AS total_allocated,
  SUM(CASE WHEN is_funded THEN eligible_amount - allocated_amount ELSE 0 END) AS available_eligible
FROM mark_work_records
GROUP BY user_id;

-- =============================================
-- FOUNDER FEATURE FLAGS
-- =============================================

CREATE TABLE founder_feature_flags (
  feature_key TEXT PRIMARY KEY,
  is_enabled BOOLEAN DEFAULT false,
  enabled_at TIMESTAMPTZ,
  enabled_by UUID REFERENCES auth.users(id),
  notes TEXT
);

INSERT INTO founder_feature_flags VALUES
  ('war_chest_substitution', true, NOW(), NULL, 'LIVE — clean 1099-NEC tax treatment confirmed'),
  ('war_chest_sponsorship', true, NOW(), NULL, 'LIVE — SAA is non-transferable governance, not §83 property per Pawn Batch 10'),
  ('war_chest_commission', false, NULL, NULL, 'GRAYED OUT — constructive receipt confirmed, needs tax counsel for §125-style design');

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE lb_cardholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE lb_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE lb_card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lb_card_funding ENABLE ROW LEVEL SECURITY;
ALTER TABLE mark_work_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE war_chest_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_feature_flags ENABLE ROW LEVEL SECURITY;

-- Members see only their own
CREATE POLICY "Users view own cardholder" ON lb_cardholders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own cards" ON lb_cards
  FOR SELECT USING (
    cardholder_id IN (SELECT id FROM lb_cardholders WHERE user_id = auth.uid())
  );
CREATE POLICY "Users view own card txns" ON lb_card_transactions
  FOR SELECT USING (
    card_id IN (
      SELECT lc.id FROM lb_cards lc
      JOIN lb_cardholders lch ON lc.cardholder_id = lch.id
      WHERE lch.user_id = auth.uid()
    )
  );
CREATE POLICY "Users view own funding" ON lb_card_funding
  FOR SELECT USING (
    cardholder_id IN (SELECT id FROM lb_cardholders WHERE user_id = auth.uid())
  );
CREATE POLICY "Users view own work records" ON mark_work_records
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own allocations" ON war_chest_allocations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "All read feature flags" ON founder_feature_flags
  FOR SELECT USING (true);

-- Admins manage all
CREATE POLICY "Admins manage cardholders" ON lb_cardholders FOR ALL USING (is_admin());
CREATE POLICY "Admins manage cards" ON lb_cards FOR ALL USING (is_admin());
CREATE POLICY "Admins manage card txns" ON lb_card_transactions FOR ALL USING (is_admin());
CREATE POLICY "Admins manage funding" ON lb_card_funding FOR ALL USING (is_admin());
CREATE POLICY "Admins manage work records" ON mark_work_records FOR ALL USING (is_admin());
CREATE POLICY "Admins manage allocations" ON war_chest_allocations FOR ALL USING (is_admin());
CREATE POLICY "Admins manage flags" ON founder_feature_flags FOR ALL USING (is_admin());
```

---

## TASK 2: Supabase Edge Functions

### Function 1: `create-lb-cardholder/index.ts`
Creates Stripe Issuing cardholder. Auth check, POST to Stripe, INSERT to db.

### Function 2: `create-lb-card/index.ts`
Issues virtual card. Auth check, POST to Stripe, INSERT to db.

### Function 3: `get-lb-card-details/index.ts`
Reveals card number/CVC. Rate-limited (3/hour). Auth check — owner only.

### Function 4: `update-lb-card-controls/index.ts`
Freeze/unfreeze, update limits. Auth check — owner or admin.

### Function 5: `lb-card-webhook/index.ts`

**Authorization logic (`issuing_authorization.request`):**
1. Look up cardholder → user
2. Check **card_balance_cents** on lb_cardholders (NOT Credits)
3. If card_balance_cents >= amount → approve
4. If card_balance_cents < amount → decline
5. On approval: deduct amount from card_balance_cents
6. Log to lb_card_transactions

**Must respond < 2 seconds.** Keep logic minimal. Async everything else.

### Function 6: `fund-lb-card/index.ts` (Admin/System Only)

How cash gets ON the card. Called by the system when LB pays a member.

**Trigger events:** delivery fee earned, creator 83.3% share, bounty payout, substitution.

### Function 7: `war-chest-substitute/index.ts` — LIVE

**The Substitution mechanic.**
1. Auth check
2. Check `founder_feature_flags` — 'war_chest_substitution' must be enabled
3. Verify member is actively doing work (has pending/active bounty or work record)
4. Verify requested amount ≤ available eligible (from war_chest_summary)
5. Deduct from mark_work_records (update allocated_amount)
6. INSERT war_chest_allocations (type: 'substitution')
7. Call `fund-lb-card` → cash to member's card
8. Return updated balances

### Function 8: `war-chest-sponsor/index.ts` — LIVE

**The Sponsorship mechanic.**
1. Auth check
2. Check `founder_feature_flags` — 'war_chest_sponsorship' must be enabled
3. Verify target project exists and has open bounties
4. Verify requested amount ≤ available eligible
5. Deduct from mark_work_records (update allocated_amount)
6. INSERT war_chest_allocations (type: 'sponsorship', target_project_id, saa_earned)
7. Call `fund-lb-card` for the bounty WORKER (not the sponsoring member)
8. Credit SAA to the sponsoring member (update user's SAA in cooperative domain)
9. Return updated balances + SAA earned

**SAA MUST remain non-transferable and bylaw-embedded.** This is what keeps it outside §83. If SAA ever becomes tradable, this function needs a tax review gate.

### Function 9: `war-chest-commission/index.ts` — BUILT, GRAYED OUT

Same pattern as sponsorship but:
- Target is member's OWN project bounty
- Cash goes to bounty worker
- Member does NOT earn SAA (they already own the project)
- Check `founder_feature_flags` — 'war_chest_commission' must be enabled
- If disabled → return `{ error: 'Pending tax counsel review', code: 'FEATURE_DISABLED' }`

**Constructive receipt issue:** When member has a right to cash (eligible Marks) and directs it to pay a contractor, IRS treats this as receiving cash and spending it. Member has taxable income even though they never touched the money. Needs §125-style irrevocable prospective election design from counsel.

---

## TASK 3: Frontend Components

### Component 1: `LBCardManager.tsx`

**Card Visual:**
```
┌─────────────────────────────────────┐
│  LIANA BANYAN                       │
│  COOPERATIVE                        │
│                                     │
│  •••• •••• •••• 4242               │
│  EXP 03/28                          │
│                                     │
│  JONATHAN JONES                     │
│                                     │
│  Cash Balance: $47.50               │
│  ───────────────────                │
│  [Reveal Details] [Freeze] [Settings]│
└─────────────────────────────────────┘
```

Navy (#1A1F36), gold text (#D4A843), white details.

### Component 2: `LBCardTransactions.tsx`
Transaction history. Shows dollars, not Credits.

### Component 3: `LBCardSettings.tsx`
Spending controls, freeze/unfreeze, daily/monthly limits.

### Component 4: `WarChestDashboard.tsx`

```
┌─────────────────────────────────────────┐
│  Your War Chest                         │
│  ───────────────────                    │
│  Total Marks Earned: 10,000             │
│  Eligible: 7,000                        │
│    Allocated: 3,500                     │
│    Available: 3,500                     │
│  Not Yet Eligible: 3,000                │
│    (from unfunded projects)             │
│  ───────────────────                    │
│  Deploy Your War Chest:                 │
│  ───────────────────                    │
│  [💵 Get Paid]  ACTIVE                 │
│   Substitute eligible Marks for cash    │
│                                         │
│  [🤝 Sponsor]   ACTIVE                 │
│   Sponsor other projects,              │
│   earn IP governance (SAA)              │
│                                         │
│  [🔨 Commission] COMING SOON           │
│   Fund bounties on your own project     │
│   (pending tax counsel)                 │
└─────────────────────────────────────────┘
```

**Substitution and Sponsorship are LIVE.** Commission is grayed out with tooltip.
Check `founder_feature_flags` for each — when Commission is enabled, it lights up.

### Component 5: `SubstitutionModal.tsx`
"Get Paid" flow — show eligible, confirm work active, input amount, confirm, execute.

### Component 6: `SponsorshipModal.tsx` (NEW — LIVE)

When member clicks "Sponsor":
1. Show available eligible amount
2. Browse available projects with open bounties (from BandWagon or project list)
3. Select project and bounty to sponsor
4. Input amount (up to available eligible)
5. Show: "You'll sponsor $X toward [Project Name]. The bounty worker gets paid. You earn SAA on this project."
6. Confirm → call `war-chest-sponsor`
7. Show updated balances + SAA earned

### Routes

- `/dashboard/lb-card` — Card management + transactions
- `/dashboard/war-chest` — War Chest dashboard + deploy options

---

## TASK 4: Founder Portfolio Feature Flags UI

```
┌─────────────────────────────────────────┐
│  Feature Flags                          │
│  ───────────────                        │
│  Mercury Bank             [Connected]   │
│                                         │
│  War Chest Features:                    │
│  ☑ Substitution (Get Paid)    [LIVE]   │
│  ☑ Sponsorship (IP Governance) [LIVE]  │
│  ☐ Commission (Fund Bounties)  [OFF]   │
│                                         │
│  Toggle = updates founder_feature_flags │
│  Requires is_admin() to modify          │
└─────────────────────────────────────────┘
```

---

## TASK 5: Wire Card Funding Into Existing Flows

### Delivery Fee
Order delivered → calculate fee → `fund-lb-card` → runner's card

### Creator Share
Storefront sale paid → 83.3% → `fund-lb-card` → creator's card

### Bounty Payout
Bounty completed + signed off:
- If funded: `fund-lb-card` → worker's card
- If unfunded: record in mark_work_records (work-for-Marks)

### Sponsorship Payout
War chest sponsor → `fund-lb-card` → bounty worker's card (funded from LB coffers backed by sponsor's eligible Marks)

---

## TASK 6: Issuing Webhook (Separate)

New function: `lb-card-webhook/index.ts`
Separate `STRIPE_ISSUING_WEBHOOK_SECRET` env var.
Events: `issuing_authorization.request`, `.created`, `issuing_transaction.created`, `issuing_card.updated`
Authorization < 2 seconds. Check card_balance_cents. Approve or decline. Log.

---

## SECURITY REQUIREMENTS

1. **Purchase-only:** Block `cash_advance` and `atm` categories
2. **No transfers:** Cards cannot send money to other cards or accounts
3. **Rate limiting:** Card detail reveal: 3/hour. Substitution: 5/day. Sponsorship: 10/day.
4. **Audit trail:** Every funding, authorization, substitution, and sponsorship logged
5. **Auto-freeze:** 5 declines in 1 hour → freeze + notify
6. **Domain separation at DB level:** No foreign keys between card tables and credit tables
7. **SAA non-transferability enforced:** No transfer/sell/trade function for SAA. Bylaw-embedded only. If this ever changes, tax review required before re-enabling sponsorship.

---

## FOUNDER PREREQUISITES

| Step | What | Status |
|------|------|--------|
| 1 | Enable Stripe Issuing | ✅ Application submitted |
| 2 | Wait for approval | ⏳ 24-48 hours |
| 3 | Create Issuing webhook endpoint | Ready when approved |
| 4 | Add STRIPE_ISSUING_WEBHOOK_SECRET to Supabase | Ready when approved |

**Knight starts when Stripe approves.**

---

## VERIFICATION

1. Create test cardholder → verify in Stripe Dashboard
2. Issue virtual card → verify in UI ($0.00 cash balance)
3. Admin funds card $50 → card shows $50.00
4. Simulate authorization → card_balance_cents decreases
5. Record Mark work → appears in War Chest
6. Mark project funded → eligible amount updates
7. Substitute 10 eligible → $10 on card, eligible drops by 10
8. **Sponsor a project bounty → bounty worker gets cash, sponsoring member gets SAA**
9. Try Commission → get "COMING SOON" message
10. Admin enables Commission flag → Commission button activates
11. Freeze/unfreeze → card status updates

---

## SESSION WEIGHT: HEAVY
New webhook, 8 new tables, 10 edge functions (including sponsorship), 6 frontend components, integration hooks into Commerce Engine. Two of three War Chest features launch live. The two-domain separation simplifies authorization — just check card_balance_cents.

---

**FOR THE KEEP.**
