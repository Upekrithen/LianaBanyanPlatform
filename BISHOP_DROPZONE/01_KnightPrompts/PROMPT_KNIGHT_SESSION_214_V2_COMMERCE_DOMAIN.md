# KNIGHT SESSION 214 — v2 Commerce Domain Migration
## Priority: HIGH | Source: Bishop B057 Domain Audit
## Prerequisite: K212 (Content) or K213 (Outreach) complete
## Design Reference: `platform-v2/src/app/FOCUS_SHELL_DESIGN_SPEC.md`

---

## CONTEXT

Commerce is the 7th v2 domain — the marketplace and storefront engine. It covers Storefronts (4 types: food, crafts, services, digital), Marketplace browsing, Product Catalog (crowdfunding), Production Pipeline (Canister System integration), Crew Call (service marketplace), and order management. This is one of the largest domains with 23 v1 pages and 8 edge functions. **Key rule: Cost+20% floor on all marketplace transactions.** Creator keeps 83.3%.

---

## V1 INVENTORY (from B056 deep audit)

### Tables (8+ across 7 migrations)
- `storefronts` (20 cols) — food/crafts/services/digital types
- `storefront_items` (11 cols) — menu items, products
- `storefront_products` (7 cols) — product catalog
- `storefront_transfers` (8 cols) — owner transfers
- `store_templates` (11 cols) — 6 themes
- `menu_orders` — food/service orders
- `catalog_products` — crowdfunding products
- `catalog_product_backers` — backer tracking
- `makers` — creator profiles
- `biz_storefront_items` — aggregated external (Etsy, Shopify)

### Edge Functions (8)
- `aggregate-orders` — consolidated emails via Resend
- `distribute-order-earnings` — 83.3% creator split
- `create-menu-checkout` — Stripe checkout for food/service
- `stripe-create-checkout-session` — generic Stripe checkout
- `verify-preorder-payment` — preorder verification
- `create-preorder-checkout` — crowdfunding checkout
- `printful-api` — Print-on-Demand proxy
- `calendar-sync-commerce` — Google Calendar auto-events from orders

### Pages (23)
**Storefront (3)**: StoreFrontAggregation, StoreTemplates, StorefrontBuilder (504 lines)
**Marketplace (5)**: Marketplace (352), BrowseMarketplace, DocumentationMarketplacePage (378), ChefMarketplacePage, LetsGoShoppingPage
**Product (4)**: ProductCatalog (307), ProductDetail (496), CatalogProductDetail (372), CanisterProductCatalog
**Orders (4)**: PreOrderFlow (537), PreOrderSuccess, OrderManifestPage, ProductionOrderFlow (305)
**Production (6)**: CampaignProduction, ProductionPathways, ProductionProjectPage, ProductionQueue, ProductionRuns, ProductionSchedules
**Alt Commerce (1)**: CrewCallPage (600 lines)

### Components (21+)
**Order/Shopping (5)**: CreateShoppingOrderDialog, MealOrderDialog (498 lines), GroceryOrderForm, ShoppingListGenerator (454), ShoppingOrderCard
**Marketplace (5)**: BusinessListing, ChefMarketplace (724 lines), IslandMarketplaceListings, CreateIslandListing, GiftShoppingAggregation
**Production (6+)**: ProductionQueueDisplay, ProductionRunDraft, ProductionWaveManager (423), MedallionProductionTracker, PreorderVotingExplainer, RealTimeProductStats

### Hooks (3)
useCaptainOrders, useScheduledOrders, useProductionProjects (246 lines)

### Lib (1)
printOrderService.ts (createPrintOrder, getPrintOrder, updatePrintOrderStatus)

---

## V2 MODULE STRUCTURE

```
platform-v2/src/domains/commerce/
├── pages/
│   ├── MarketplacePage.tsx          # Main marketplace browse (AppShell)
│   ├── StorefrontBuilderPage.tsx    # Create/edit storefront (AppShell)
│   ├── StorefrontPage.tsx           # Individual storefront view (AppShell)
│   ├── ProductDetailPage.tsx        # Product detail + purchase (AppShell)
│   ├── ProductCatalogPage.tsx       # Crowdfunding catalog (AppShell)
│   ├── PreOrderPage.tsx             # Pre-order flow (AppShell)
│   ├── OrderManifestPage.tsx        # Order tracking (AppShell)
│   ├── ProductionDashboardPage.tsx  # Production pipeline overview (AppShell)
│   ├── ProductionProjectPage.tsx    # Individual production project (AppShell)
│   ├── CrewCallPage.tsx             # Service marketplace (AppShell)
│   └── ChefMarketplacePage.tsx      # Food-specific marketplace (AppShell)
├── components/
│   ├── storefront/
│   │   ├── StorefrontCard.tsx       # Storefront listing card
│   │   ├── StorefrontEditor.tsx     # Storefront creation/editing
│   │   ├── TemplateSelector.tsx     # 6 storefront themes
│   │   └── MenuBuilder.tsx          # Food storefront menu editor
│   ├── marketplace/
│   │   ├── ProductGrid.tsx          # Product listing grid
│   │   ├── MarketplaceFilters.tsx   # Category/type/price filters
│   │   ├── BusinessListing.tsx      # Business listing card
│   │   └── ShoppingCart.tsx         # Cart + checkout flow
│   ├── production/
│   │   ├── ProductionQueue.tsx      # Production pipeline queue
│   │   ├── ProductionWaveManager.tsx # Wave scheduling
│   │   ├── ProductionRunDraft.tsx   # Run configuration
│   │   └── PreorderTracker.tsx      # Preorder progress + voting
│   ├── orders/
│   │   ├── OrderCard.tsx            # Order summary card
│   │   ├── MealOrderDialog.tsx      # Food order dialog
│   │   └── ShoppingOrderCard.tsx    # Shopping order card
│   └── CrewCallBoard.tsx            # Service request board
├── hooks/
│   ├── useStorefront.ts            # Storefront CRUD
│   ├── useMarketplace.ts           # Browse + search + filter
│   ├── useOrders.ts                # Order management
│   ├── useProductionProjects.ts    # Production pipeline
│   └── usePreorders.ts             # Crowdfunding preorders
├── lib/
│   ├── commerceTypes.ts            # Types
│   ├── storefrontTemplates.ts      # 6 template definitions
│   ├── pricingRules.ts             # Cost+20% FLOOR. Creator keeps 83.3%. ALWAYS.
│   ├── orderService.ts             # Order creation + status tracking
│   └── printOrderService.ts        # Printful POD integration
├── routes.tsx
└── index.ts
```

---

## KEY DESIGN DECISIONS

1. **Cost+20% FLOOR.** Every marketplace transaction has a minimum 20% platform margin. Creator keeps 83.3% (5/6). This is architectural — hardcoded, not configurable. See `pricingRules.ts`.

2. **4 Storefront types**: Food (restaurants, meal prep), Crafts (handmade, Canister products), Services (Crew Call), Digital (courses, templates). Each has different checkout flows.

3. **6 Store Templates**: Pre-built visual themes for storefronts. Members select a template, customize colors/logo, add products.

4. **Production Pipeline**: Ties into Manufacturing domain's Canister System. Products go through: Design → Prototype → Production Run → Fulfillment. Wave-based scheduling.

5. **External Aggregation**: `biz_storefront_items` pulls from Etsy, Shopify via API. Members can display their existing e-commerce products alongside LB storefront items.

6. **Crew Call**: Service marketplace where members post service requests and service providers bid. Connected to Captain system for territory management.

7. **Google Calendar sync**: Orders auto-create calendar events for cutoff dates, delivery windows.

8. **All pages are AppShell** — commerce is fully member-facing, post-auth.

---

## BUILD STEPS

1. Use Librarian: `get_schema("storefronts")`, `get_schema("storefront_items")`, `get_schema("store_templates")`, `get_schema("catalog_products")`, `get_schema("menu_orders")`
2. Build pages — start with MarketplacePage (browse), then StorefrontBuilderPage (create), then orders
3. Port pricing rules — Cost+20% must be enforced
4. Wire routes in `routes.tsx`
5. Export public API: `useStorefront`, `useMarketplace`, `ProductGrid`, `commerceRoutes`
6. Register in `AppRouter.tsx`

---

## IMPORTS FROM OTHER DOMAINS

```tsx
import { useMembership, MembershipGate } from '../membership';
// All commerce is member-gated
```

---

## MANDATORY: REBUILD LIBRARIAN INDEXES

```bash
cd librarian-mcp && npx tsc && node dist/indexer/buildIndex.js
```

---

## VERIFICATION

1. `npm run build` passes
2. `/marketplace` shows product grid with filters
3. `/storefront/new` shows builder with 6 templates
4. `/orders` shows order manifest
5. Price displays show Cost+20% floor applied
6. `get_migration_status("commerce")` shows v2 pages > 0
7. Librarian indexes rebuilt

---

*Bishop B057 — v2 Commerce Domain*
*Marketplace + Storefronts + Production Pipeline + Crew Call*
*Cost+20% FLOOR. Creator keeps 83.3%. ALWAYS.*
*FOR THE KEEP!*
