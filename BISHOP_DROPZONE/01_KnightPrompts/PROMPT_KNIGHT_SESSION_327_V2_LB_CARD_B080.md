# KNIGHT SESSION 327 — V2 LB Card (AppShell)
## Bishop B080 | April 5, 2026 | Phase 6 page 1 of 6 (OPENS Specialized Surfaces)

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_36_MASTER_DESIGN_PACKET_B058.md` § PAGE 4
**Depends on**: K294 Foundation. DD-2 (Stripe/Lithic approval) BLOCKED — build UI against stubs.
**Tracker row**: `LB Card` (B36 batch)

---

## PAGE PURPOSE

Banking-grade dashboard for members to manage their LB Card — fund, freeze, transact, understand. Substitution Method canon: **Credits/Marks/Joules NEVER fund card. Cash only.**

## ROUTE

`/lb-card` (AppShell). Post-auth.

## HERO SPEC (copy EXACTLY)

- **Eyebrow**: "LB Card"
- **Headline**: "A cooperative card that funds from cash, not from your contribution history."
- **Body**: "Add funds from your bank, freeze instantly, and see where your money lands in the local economy."
- **Primary CTA**: "Add funds"
- **Secondary CTA**: "Card controls"
- **Proof strip**: "Cash-only funding" · "Instant freeze" · "Member-business insights"

## LAYOUT — BANKING-GRADE DASHBOARD

- **Top**: `CardOverviewHeader` — card preview (last 4), main balance, Add Funds / Freeze / View Details
- **Funding**: `FundingOptions` — 1 card: "From Bank Account" (Plaid-connected, stubbed)
- **Feed**: `TransactionsList` — merchant, amount, date, category chip, expandable details
- **Insights**: `InsightsPanel` — category bar chart + "X% spent at local/member businesses"
- **Controls**: `CardControls` — Freeze toggle, replace card, notifications, `VirtualCardDetails` (auto-hide timeout)

## CRITICAL DESIGN RULES

- **Cash-only funding** — NEVER display Credits/Marks/Joules as funding options
- **Card details auto-hide** after timeout (virtual PAN, CVV)
- **Freeze is instant** and reversible
- **Insights surface member-business spending** to reinforce cooperative loop

## COMPONENTS (build in `platform/src/components/v2/lb-card/`)

- `CardOverviewHeader.tsx`
- `FundingOptions.tsx` (bank account only)
- `TransactionsList.tsx` + `TransactionRow.tsx`
- `InsightsPanel.tsx`
- `CardControls.tsx`
- `VirtualCardDetails.tsx` (auto-hide)

## MOBILE

- Single-column stack
- Card preview prominent at top
- Transaction list infinite scroll
- StickyMobileCTA: "Add funds"

## DATA

- Existing LB Card schema stubs (DD-2 BLOCKED — use fixtures)
- Transactions from existing `transaction_ledger` table

## BANNED

- NO Credits/Marks/Joules as funding options (cash only)
- NO exposing raw PAN without auto-hide
- NO "rewards" / "cash back" language
- NO red states
- NO "upgrade/premium/unlock"
- NO LLC / CEO / invest language

## ACCEPTANCE

- [ ] Route `/lb-card` wired in AppSidebar
- [ ] Hero copy matches spec EXACTLY
- [ ] Card overview header with balance + freeze
- [ ] Funding options: bank account only (no cooperative currencies)
- [ ] Virtual card details auto-hide
- [ ] Insights panel shows local/member % spend
- [ ] `data-tour-target="lb-card"` + `data-xray-id` anchors
- [ ] `npm run build` passes; tracker K327 review; Librarian logged

## DO NOT

- Do not allow Credits/Marks/Joules to fund card
- Do not persist PAN/CVV without auto-hide
- Do not unblock DD-2 dependency — stub until external approval

---

*Bishop B080 — Phase 6 page 1 of 6 — LB Card — OPENS Specialized Surfaces*
*Cash-only funding. Instant freeze. Member-business insights.*
*FOR THE KEEP!*
