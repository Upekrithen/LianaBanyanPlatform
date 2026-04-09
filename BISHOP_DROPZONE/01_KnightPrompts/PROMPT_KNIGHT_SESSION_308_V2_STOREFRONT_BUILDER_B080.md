# KNIGHT SESSION 308 — V2 Storefront Builder (AppShell)
## Bishop B080 | April 5, 2026 | Phase 3 page 1 of 6 (OPENS Creator Workspaces)

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_36_MASTER_DESIGN_PACKET_B058.md` § PAGE 2
**Depends on**: K294 Foundation primitives. Enhances K214 existing `StorefrontBuilderPage`.
**Tracker row**: `Storefront Builder` (B36 batch)

---

## PAGE PURPOSE

5-step wizard for creators to launch their storefront with live preview. Cooperative math surfaced descriptively, never promotionally.

## ROUTE

`/storefront/builder` (AppShell). Post-auth, creator-facing. URL-safe step tracking via `?step=` param.

## HERO SPEC (copy EXACTLY)

- **Eyebrow**: "Storefront Builder."
- **Headline**: "Open your doors in five steps."
- **Body**: "Pick a type, choose a template, bring in inventory, set cooperative pricing, and go live. Save a draft any time."
- **Primary CTA**: (contextual per-step: "Continue" / "Publish Storefront")
- **Secondary CTA**: "Save Draft"
- **Utility strip**: "5 steps" · "Cost+20% pricing" · "83.3% creator keep"

## LAYOUT — 2-COLUMN DESKTOP / STACKED MOBILE

**Left column**: `BuilderStepsColumn` with `Stepper` navigation (5 steps, current highlighted)
**Right column**: `LivePreviewPane` with `SegmentedControl` (Desktop / Mobile toggle)
**Mobile**: Steps full-width. Preview via "Preview" button → full-screen modal.

## THE 5 STEPS

1. **`StorefrontTypeSelector`** — 4 radio cards: Food, Crafts, Services, Digital
2. **`TemplatePicker`** — 6 templates per type. Hover preview. "Recommended for:" line on each.
3. **`InventoryImportTabs`** — 3 tabs: Start Fresh / Connect Etsy / Connect Shopify. Contains `ProductImportTable`.
4. **`PricingGrid`** — DataTable columns: Cost | Suggested (Cost+20%) | Take-Home (83.3%). Includes `InfoAlert` explaining Cost+20% as descriptive floor.
5. **`LaunchChecklist`** — Checkbox list. "Publish Storefront" button activates only when ALL checks pass.

## COMPONENTS (build in `platform/src/components/v2/storefront/`)

- `BuilderStepsColumn.tsx`
- `Stepper.tsx` (if K294 didn't build a shared one — otherwise reuse)
- `LivePreviewPane.tsx` with Desktop/Mobile `SegmentedControl`
- `StorefrontTypeSelector.tsx` (4 radio cards)
- `TemplatePicker.tsx` (6 templates per type)
- `InventoryImportTabs.tsx` (3 tabs)
- `ProductImportTable.tsx`
- `PricingGrid.tsx` with `InfoAlert`
- `LaunchChecklist.tsx`

## COOPERATIVE MATH — DESCRIPTIVE ONLY

- Pricing grid shows Cost+20% as the math, not as a pitch
- Take-Home column shows 83.3% as math, not as a promise
- `InfoAlert` text: "Cooperative pricing: 20% above cost covers operations. Creator keeps 83.3% of the transaction."
- NEVER: "Earn more", "Higher margins", "Maximize revenue", "Profit", "ROI", "Investment"

## SAVE DRAFT

- Available at EVERY step (not just final)
- Draft persists in `storefront_drafts` table (use existing if it exists, else create migration)
- Returns to in-progress step on reload

## MOBILE

- Steps full-width, one step per screen
- "Preview" button in header opens full-screen modal preview with Desktop/Mobile toggle
- StickyMobileCTA: contextual per step ("Continue" / "Publish Storefront")
- "Save Draft" accessible from header

## DATA

- 4 storefront types: Food, Crafts, Services, Digital (canonical — enum)
- 6 templates per type = 24 total. Stub template data if not in DB.
- Inventory import: stub Etsy/Shopify OAuth (real connectors are later)
- `product_drafts` staging table used for import

## BANNED (pre-completion check)

- NO promotional framing of Cost+20% or 83.3% (descriptive math only)
- NO "upgrade/premium/unlock"
- NO "earn more / maximize / profit / ROI / invest"
- NO red states
- NO demographic intake
- NO LLC / CEO language

## ACCEPTANCE

- [ ] Route `/storefront/builder` enhances existing K214 page
- [ ] Hero copy matches spec EXACTLY
- [ ] 5-step wizard navigable via URL `?step=` param
- [ ] Live preview pane toggles Desktop/Mobile
- [ ] Cost+20% and 83.3% appear ONLY in descriptive grid + info alert
- [ ] "Save Draft" available at every step
- [ ] "Publish Storefront" disabled until all checklist items pass
- [ ] `data-tour-target="storefront-builder"` anchor placed
- [ ] Mobile: full-screen preview modal, StickyMobileCTA per step
- [ ] `npm run build` passes
- [ ] Tracker: `assignee='K308'`, `in_progress` → `review`
- [ ] Librarian `update_session` K308
- [ ] Screenshots → `BISHOP_DROPZONE/99_Misc/PHASE_3_VISUAL_REVIEW_B080/`

## DO NOT

- Do not build real Etsy/Shopify OAuth (stubs only)
- Do not publish real storefronts yet (wire to existing publish path if present, else stub)
- Do not change creator onboarding flows
- Do not replace K214 entirely — ENHANCE with B36 spec

---

*Bishop B080 — Phase 3 page 1 of 6 — Storefront Builder*
*Opens Creator Workspaces phase. Battery Dispatch integration lands at K310.*
*FOR THE KEEP!*
