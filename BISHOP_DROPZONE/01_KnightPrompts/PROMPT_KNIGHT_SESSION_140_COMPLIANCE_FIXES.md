# KNIGHT SESSION 140 — Compliance Fixes + Mobile UX Polish
## LB Card Funding Architecture Update + Pitch CO Mobile Optimization
**Bishop:** 035 | **Date:** March 27, 2026
**Source:** Pawn B21 #4 (Prepaid Compliance) + Pawn B22-3 (Mobile UX)

---

## CONTEXT

Two Pawn research deliveries require code changes:

1. **LB Card Funding** (#2008-#2009): Stripe Issuing PROHIBITS direct Person A → Person B card loading. The edge functions `create-funding-schedule` and `process-scheduled-funding` must route through the cooperative platform account, not direct card loading.

2. **Pitch CO Mobile** (#2001): Pawn's UX research shows sliders cause 37% longer completion time on mobile. The PitchContingencyOperator needs result-first layout and numeric inputs instead of sliders for monetary values.

## DELIVERABLES

### Deliverable 1: Update LB Card Funding Edge Functions

**Current (WRONG) flow:**
```
Person A → Stripe charge → direct top-up to Person B's Issuing card
```

**Required (COMPLIANT) flow:**
```
Person A → Stripe charge → Platform Issuing Balance (cooperative account)
         → AML velocity check ($5,000 flag, $9,500 daily cap)
         → Platform increases Person B's card spending_limit
         → Person B spends via Stripe Issuing card
```

Update `supabase/functions/create-funding-schedule/index.ts`:
- Change Stripe flow from direct card top-up to platform balance deposit
- Add `funding_relationship` field to the schedule (employer, family, sponsor, self, guild, other)
- Both parties must be KYC-verified members (check profiles table for `kyc_verified` flag)
- Log the funding relationship for AML compliance

Update `supabase/functions/process-scheduled-funding/index.ts`:
- Replace direct `stripe.issuing.cards.fund()` with:
  1. Charge Person A's payment method (existing)
  2. Deposit to platform Issuing Balance (new)
  3. Velocity check: if Person B's daily inbound > $5,000, flag for review; if > $9,500, BLOCK and notify
  4. Increase Person B's card `spending_limit` by the funded amount
  5. Log transaction in `lb_card_funding_transactions` with compliance fields

### Deliverable 2: Add Velocity Controls Migration

Create `20260327000011_funding_compliance.sql`:

**Add columns to lb_card_funding_schedules:**
- funding_relationship TEXT CHECK ('employer','family','sponsor','self','guild','other') NOT NULL
- kyc_verified_funder BOOLEAN DEFAULT false
- kyc_verified_recipient BOOLEAN DEFAULT false

**Add columns to lb_card_funding_transactions:**
- compliance_status TEXT CHECK ('clear','flagged','blocked','reviewed') DEFAULT 'clear'
- daily_total_to_recipient NUMERIC — running daily total for velocity check
- reviewed_by UUID REFERENCES profiles(id) — who cleared the flag
- reviewed_at TIMESTAMPTZ

**Create table: funding_velocity_alerts**
- id UUID PK
- recipient_id UUID REFERENCES profiles(id)
- funder_id UUID REFERENCES profiles(id)
- alert_type TEXT CHECK ('daily_5k_flag','daily_9500_block','pattern_flag')
- daily_total NUMERIC
- alert_date DATE
- status TEXT CHECK ('open','reviewed','cleared','escalated')
- reviewed_by UUID
- created_at TIMESTAMPTZ
- RLS: admin/founder only

### Deliverable 3: Update FundMyCard Page

Update `platform/src/pages/FundMyCard.tsx`:
- Add "Funding Relationship" dropdown (employer, family, sponsor, self, guild, other)
- Add KYC verification check — if either party not verified, show "Complete your identity verification to enable card funding" with link to verification flow
- Add daily limit display: "Daily funding limit: $9,500 per recipient"
- Add compliance notice: "All card funding is processed through the cooperative's regulated financial infrastructure."

### Deliverable 4: Pitch CO Mobile Optimization

Update `platform/src/components/pitch/PitchContingencyOperator.tsx`:

**Result-first layout:**
- Move the results card (monthly revenue, annual projection, cooperative savings) ABOVE the inputs
- Populate with sensible defaults on load (campaign's actual pledge count, C+60 tier, $15 avg order)
- Large-format number display (min 32px, high contrast)

**Replace sliders with numeric inputs:**
- KEEP the tier selector as buttons (C+20/C+40/C+60/C+90) — this is the ONE visual selector
- REPLACE the 3 sliders with numeric input fields:
  - Pledge count: `<Input type="number" />` with stepper arrows
  - Average order value: `<Input type="number" />` with $ prefix
  - Monthly frequency: `<Input type="number" />` with "orders/month" suffix
- Use `inputMode="numeric"` for mobile numeric keyboard
- Real-time recalculation on every keystroke (no submit button)

**3-screen flow:**
- Screen 1: Results card + tier buttons + inputs (ALL above fold on mobile)
- Screen 2: Detailed breakdown (scroll for it) — only if user wants more
- Screen 3: Save scenario (only if authenticated, ghost otherwise)

**Performance:**
- Target TTI < 2.5 seconds
- No external API calls on load — all calculations are client-side
- Pre-populate from campaign data passed via props

### Deliverable 5: Canonical Stats
Update useCanonicalStats.ts:
- innovationCount: 2051 → 2063 (catching up to canonical)
- crownJewels: 138 → 137 (correcting to actual)
- productionSystems: 27

## RULES
- Credits NEVER cash out. One-way valve. Irrevocable.
- LB Card is funded with REAL MONEY via Stripe Issuing. NOT from Credits.
- C+20 constitutional floor.
- No securities language. The CO is a "business research tool" not "investment calculator."
- Closed-loop cards at ≤$2,000/day are EXEMPT from Prepaid Access Rule — this is the target architecture.
- Person A → Platform → Person B. NEVER Person A → Person B directly.
- Both parties must be KYC-verified cooperative members.
- $5,000 daily flag, $9,500 daily block. These are hard limits.

## BUILD ORDER
1. Compliance migration → 2. Edge function updates → 3. FundMyCard page update → 4. PitchCO mobile optimization → 5. Stats → Build → Deploy

FOR THE KEEP!
