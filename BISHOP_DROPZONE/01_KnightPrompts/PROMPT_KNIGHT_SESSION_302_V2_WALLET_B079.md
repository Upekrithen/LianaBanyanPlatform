# KNIGHT SESSION 302 — V2 Wallet (AppShell) — PHASE 2 BEGINS
## Bishop B079 | April 5, 2026

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_30_MASTER_DESIGN_PACKET_B057.md` § 5
**Depends on**: K294 Foundation primitives (especially `AppShell`)
**Tracker row**: `Wallet` (B30 batch)

**Phase shift**: this is the first AppShell page. Member workspace. Sidebar + persistent chrome + operational density.

---

## PAGE PURPOSE

Unified view of Credits, Marks, and Joules with semantic separation of three currencies. **Operating wallet, NOT trading cockpit.** No crypto aesthetics, no candlestick charts, no speculative language.

## ROUTE

`/wallet` (AppShell). Member-authenticated only.

## HERO SPEC (copy EXACTLY)

- **Eyebrow**: "Wallet"
- **Headline**: "Your balances, clearly separated."
- **Body**: "Track Credits, Marks, and Joules in one place, with distinct roles, movement history, and actions for each."
- **Primary CTA**: "Review activity"
- **Secondary CTA**: "Open transfer tools"
- **Utility strip** (not proof strip — this is AppShell): "3 currencies" · "Unified history" · "Role-based labels"

## SECTION FLOW

1. Hero (AppShell variant, orientation card — NOT conversion)
2. **3 currency summary cards** (hierarchy: Credits = most visual weight → Marks second → Joules specialized)
3. **One-line role definitions** under each card
4. **Tabbed activity feed** (Credits / Marks / Joules / All)
5. **Action panel** (transfer, send, receive, history)
6. **"How these currencies differ" explainer** (educational footer band)

## HIERARCHY AND VISUAL WEIGHT

- **Credits**: largest card, most prominent — day-to-day currency, $1 = 1 Credit equivalent value
- **Marks**: second card — effort-differential, governance weight, backed vs pledged distinction visible
- **Joules**: third card — surplus/"forever stamp", specialized use

Use K294 design tokens:
- `--currency-credits` for Credits visual
- `--currency-marks` for Marks visual
- `--currency-joules` for Joules visual
- `tabular-nums` class on ALL balance and amount displays

## DESIGN INSTRUCTIONS

- Operating wallet aesthetic — think bank statement meets civic utility, NOT Coinbase
- No crypto styling: no candlesticks, no price charts, no "market" framing, no "trading" language
- Each currency is a **platform function** (Credits = transact, Marks = participate/govern, Joules = persist/contribute)
- Activity feed tabs default to "All"; switching tabs filters + changes color accent
- All monetary displays use `tabular-nums` for alignment

## MOBILE

- Vertical currency cards (stacked, Credits top)
- Sticky mini-summary for currently-selected currency (scroll-triggered)
- Segmented controls for activity tab switching
- StickyMobileCTA if the action panel is below-the-fold primary action

## COMPONENTS TO USE (from K294)

- `<AppShell pageTitle="Wallet" breadcrumbs={...}>` wrapper
- `<Hero variant="app">` for top orientation card
- `<StickyMobileCTA>` for mobile primary action
- `useTourTarget('wallet')` on the Credits card (tour landmark per K294 spec)

## NEW COMPONENTS (build in `platform/src/components/v2/wallet/`)

- `CurrencySummaryCard.tsx` — prop: `currency: "credits" | "marks" | "joules"`, `balance`, `roleLabel`, `lastTransaction?`
- `CurrencyHierarchyRow.tsx` — renders all 3 cards in correct visual hierarchy
- `RoleDefinitionStrip.tsx` — one-line role per currency
- `ActivityFeedTabs.tsx` — tabbed transaction list with currency filter
- `WalletActionPanel.tsx` — transfer/send/receive/history actions
- `CurrencyExplainerBand.tsx` — educational footer explaining the three currencies

## BANNED (pre-completion check)

- NO crypto aesthetics (no candlesticks, no price charts, no "trading" framing)
- NO "invest/equity/ROI/shares/dividends" language
- NO red styling on balance decreases (use neutral/amber)
- NO speculative or market language
- Marks ≠ tokens. Credits ≠ crypto. Joules ≠ stakes.
- NO "LLC" (use "CORPORATION")
- NO "CEO" (use "Founder & General Manager")
- NO demographic fields

## DATA

- Wallet balances likely come from existing Supabase `wallets` / `currency_balances` tables — audit and use the current canonical source
- Activity feed likely from `transactions` table — audit current shape
- Do NOT create new tables in this session. Use what exists. If missing, flag to Bishop.

## ACCEPTANCE

- [ ] Route `/wallet` wired in `App.tsx` + AppShell sidebar
- [ ] Hero copy matches spec EXACTLY
- [ ] 3 currency cards render in hierarchy: Credits (largest) → Marks → Joules
- [ ] `tabular-nums` applied to all balance and amount displays
- [ ] Activity feed has 4 tabs (All / Credits / Marks / Joules)
- [ ] `data-tour-target="wallet"` on Credits summary card
- [ ] Mobile: vertical stack, sticky mini-summary on scroll, segmented tab controls
- [ ] `useTourTarget('wallet')` anchor placed correctly (for K330 Guided Tour)
- [ ] `npm run build` passes
- [ ] Tracker: `assignee='K302'`, `status='in_progress'` → `status='review'`
- [ ] Librarian `update_session` K302 logged
- [ ] Screenshots desktop + mobile added to `BISHOP_DROPZONE/99_Misc/PHASE_2_VISUAL_REVIEW_B079/`

## DO NOT

- Do not build transfer-flow subpages in this session (stub the CTAs, link to placeholder routes)
- Do not add crypto integration or blockchain wiring
- Do not change Supabase schema
- Do not rebuild currency backend logic — this is a UI-layer session

---

*Bishop B079 — Phase 2 page 1 of 6 — Wallet (AppShell debut)*
*First AppShell page. Sets pattern for K303-K307.*
*FOR THE KEEP!*
