# KNIGHT SESSION 305 — V2 Marketplace (AppShell)
## Bishop B079 | April 5, 2026 | Phase 2 page 4 of 6

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_31_MASTER_DESIGN_PACKET_B057.md` § 3
**Depends on**: K294 Foundation primitives
**Tracker row**: `Marketplace` (B31 batch)

---

## PAGE PURPOSE

Unified commerce browse across 4 storefront types + Crew Call. **One marketplace, NOT four silos.**

## ROUTE

`/marketplace` (AppShell). Member or ghost (limited) access.

## HERO SPEC (copy EXACTLY)

- **Eyebrow**: "Marketplace"
- **Headline**: "Browse the whole economy without switching worlds."
- **Body**: "Explore food, crafts, services, digital goods, and Crew Call listings in one marketplace shaped by the Cost+20% floor and the 83.3% creator keep model."
- **Primary CTA**: "Browse all listings"
- **Secondary CTA**: "Explore storefronts"
- **Proof strip**: "4 storefront types" · "6 templates" · "external aggregation" · "Crew Call built in"

## SECTION FLOW

1. Hero + universal search
2. **Mode switch** — 4 tabs: All / Products / Storefronts / Crew Call (default: All)
3. **Featured collections** (curated rails)
4. **Unified results grid** (standardized result cards)
5. **Filter rail** (collapsible sidebar on desktop, drawer on mobile)
6. **Cost+20% explainer strip** (trust scaffolding, NOT promotional banner)
7. **Storefront highlights** band

## RESULT CARD (standardized)

Every result card answers:
- **What** (product name / service title / storefront name)
- **Who** (creator / crew member / storefront owner)
- **How fulfilled** (shipping, pickup, service, digital delivery)
- **Type badge** (Product / Storefront / Service / Crew Call)

Fields: image, name, creator, type badge, price (Credits), fulfillment tag, ADAPT score (for services/crew)

## FILTER HIERARCHY

**Tier 1 (always visible)**:
- Listing type (product/storefront/service/crew)
- Storefront type (food/crafts/services/digital)
- Price range (Credits)
- Fulfillment (shipping/pickup/service/digital)
- Availability

**Tier 2 (expandable)**:
- Rating / ADAPT
- Newest
- Featured
- Local (geographic)
- External source (aggregated listings)
- Production-linked (Canister System output)

## DESIGN INSTRUCTION

- **Object-first**, NOT category-first — show listings immediately, let filtering happen afterward
- **Universal search** sits in hero, searches across all 4 modes
- **Mode switch** filters results but keeps same result-card shape (not 4 different layouts)
- Cost+20% strip = **trust scaffolding**, not promotional ("Every listing follows the Cost + 20% floor. Creators keep 83.3%.")
- **Crew Call = native mode**, not a separate tab. It's a service-marketplace mode alongside products.
- NO Amazon-style infinite scroll chaos. Clean grid, 12-24 items per page.

## MOBILE

- Default mode: "All listings"
- Persistent search bar in sticky header
- Filter drawer accessible via button (not persistent sidebar)
- Clear type badges on every card
- StickyMobileCTA: current mode's primary action ("Browse all" / "Browse products" / etc.)

## COMPONENTS TO USE (from K294)

- `<AppShell pageTitle="Marketplace">`
- `<Hero variant="app">`
- `<StickyMobileCTA>`
- `useTourTarget('marketplace')` on hero or results grid

## NEW COMPONENTS (build in `platform/src/components/v2/marketplace/`)

- `MarketplaceSearchBar.tsx` — universal search in hero
- `ModeSwitchTabs.tsx` — 4-tab switcher (All/Products/Storefronts/Crew Call)
- `FeaturedCollectionsRail.tsx` — curated collection rails
- `UnifiedResultsGrid.tsx` — the main grid
- `MarketplaceResultCard.tsx` — standardized card (what/who/how/type)
- `FilterRail.tsx` — desktop sidebar filter
- `FilterDrawer.tsx` — mobile filter drawer
- `CostPlusTrustStrip.tsx` — civic-tone trust anchor (not promo)
- `StorefrontHighlightsBand.tsx` — featured storefronts

## DATA

- Listings from existing `storefronts`, `products`, `crew_listings`, `services` tables (audit canonical sources)
- External-aggregation listings likely come from Etsy/Shopify connectors — audit
- Do NOT rebuild marketplace backend
- If any table is missing, stub with realistic placeholder data and flag

## BANNED

- NO infinite scroll
- NO "deal of the day" / urgency tactics
- NO "flash sale" / "limited time" framing
- NO red price styling
- NO "buy now" hard-sell language (use "View" / "Claim" / "Request")
- NO 4 different result-card shapes (standardize)
- NO LLC / CEO / invest / ROI language
- NO demographic filters

## ACCEPTANCE

- [ ] Route `/marketplace` wired in AppShell sidebar
- [ ] Hero copy matches spec EXACTLY
- [ ] Universal search bar in hero, functional
- [ ] 4-mode tab switcher (All/Products/Storefronts/Crew Call), default "All"
- [ ] Unified result grid with standardized cards
- [ ] Filter rail (desktop) + drawer (mobile)
- [ ] Cost+20% trust strip present, civic tone
- [ ] `data-tour-target="marketplace"` anchor
- [ ] Mobile: search persistent, filter drawer, type badges clear
- [ ] `npm run build` passes
- [ ] Tracker: `assignee='K305'`, `in_progress` → `review`
- [ ] Librarian K305 logged
- [ ] Screenshots → `PHASE_2_VISUAL_REVIEW_B079/`

## DO NOT

- Do not rebuild listing detail pages (link to existing `/listings/:id`)
- Do not wire new external aggregation connectors
- Do not change pricing logic (Cost+20% is structural, read-only here)
- Do not add cart/checkout flows

---

*Bishop B079 — Phase 2 page 4 of 6 — Marketplace*
*FOR THE KEEP!*
