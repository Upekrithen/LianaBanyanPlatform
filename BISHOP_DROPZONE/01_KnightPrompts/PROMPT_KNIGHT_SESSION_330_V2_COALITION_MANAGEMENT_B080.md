# KNIGHT SESSION 330 — V2 Coalition Management (AppShell)
## Bishop B080 | April 5, 2026 | Phase 6 page 4 of 6

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_37_V2_PAGE_DESIGN_SPECS_PHASE_3C_PRODUCT_SPEC.md` § 4
**Depends on**: K294 Foundation. Existing coalitions tables.
**Tracker row**: `Coalition Management` (B37 batch)

---

## PAGE PURPOSE

Captain-level storefront alliance management — shared discounts, cross-promotion, collective purchasing, no enterprise-software habits.

## ROUTE

`/coalitions` (AppShell). Post-auth, Captain-role gated.

## HERO SPEC (copy EXACTLY)

- **Eyebrow**: "Coalition Management"
- **Headline**: "Build stronger storefronts together"
- **Body**: "Coalitions let businesses coordinate discounts, share promotion, and combine purchasing power without requiring enterprise-software habits. This page makes coalition work accessible, visible, and action-oriented."
- **Primary CTA**: "Manage Coalition"
- **Secondary CTA**: "Invite a Storefront"
- **Utility strip**: "Shared discounts" · "Cross-promotion" · "Collective purchasing"

## SECTION FLOW

1. Hero
2. `MyCoalitionsOverview` — cards per coalition with status
3. `CoalitionDetailWorkspace` (opens in place)
4. `SharedDiscountManager`
5. `CrossPromotionBoard`
6. `CollectivePurchasingPanel`
7. `InviteStorefrontFlow`

## CRITICAL DESIGN RULES

- **Action-oriented, not report-oriented** — Captains should act, not just monitor
- **Accessible, visible** — no hidden admin surfaces
- **No enterprise-software habits** — avoid dense grids, permission matrices, jargon
- Captain role required

## COMPONENTS (build in `platform/src/components/v2/coalitions/`)

- `MyCoalitionsOverview.tsx`
- `CoalitionCard.tsx`
- `CoalitionDetailWorkspace.tsx`
- `SharedDiscountManager.tsx`
- `CrossPromotionBoard.tsx`
- `CollectivePurchasingPanel.tsx`
- `InviteStorefrontFlow.tsx`

## MOBILE

- Single-column coalition cards
- Detail workspace full-screen
- StickyMobileCTA: "Manage Coalition"

## DATA

- Existing coalition / storefront alliance tables

## BANNED

- NO enterprise permission-matrix UI
- NO red states
- NO "profit" / "ROI" framing
- NO "upgrade/premium/unlock"
- NO LLC / CEO language

## ACCEPTANCE

- [ ] Route `/coalitions` wired in AppSidebar
- [ ] Captain role-gated
- [ ] Hero copy matches spec EXACTLY
- [ ] Coalitions overview + detail workspace
- [ ] Discount / promo / purchasing sections all action-oriented
- [ ] Invite flow complete end-to-end
- [ ] `data-tour-target="coalitions"` + `data-xray-id` anchors
- [ ] `npm run build` passes; tracker K330 review; Librarian logged

## DO NOT

- Do not expose to non-Captains
- Do not use enterprise-software UI patterns
- Do not frame as profit maximization

---

*Bishop B080 — Phase 6 page 4 of 6 — Coalition Management*
*Captain-gated. Action-oriented. No enterprise habits.*
*FOR THE KEEP!*
