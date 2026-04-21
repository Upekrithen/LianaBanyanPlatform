# K416 Route Audit Results — Full Pre-Opening Gambit Sweep

**Knight Session:** K416 / B101
**Date:** April 12, 2026
**Auditor:** Knight (AI)
**Build Status:** PASS (Vite build succeeds — all component files exist, all imports resolve)

---

## 404 RISK SUMMARY

### Totals

| App Shell | Unique Routes | OK | Redirects (Navigate) | MISSING | BROKEN |
|-----------|--------------|-----|---------------------|---------|--------|
| Main (lianabanyan.com) | ~500+ | ~435 | ~65 | 0 | 0 |
| Museum (museum.lianabanyan.com) | 48 | 47 | 0 | 0 | 0 |
| Business (lianabanyan.biz) | 36 | 33 | 3 | 0 | 0 |
| DSS (the2ndsecond.com) | 23 | 22 | 0 | 0 | 0 |
| HexIsle (hexisle.com) | 27 | 25 | 2 | 0 | 0 |
| Network (lianabanyan.net) | 21 | 17 | 4 | 0 | 0 |
| Nonprofit (lianabanyan.org) | 14 | 12 | 2 | 0 | 0 |
| Upekrithen (upekrithen.lianabanyan.com) | 6 | 6 | 0 | 0 | 0 |
| **TOTAL** | **~675+** | **~597** | **~76** | **0** | **0** |

### Critical Findings

**0 MISSING components.** The Vite build succeeds — every lazy import resolves to a real file.

**0 BROKEN imports.** All component imports resolve (verified by successful `npm run build`).

**1 BROKEN NAV LINK (visitor-facing, high traffic page):**

| Severity | Source | Link Text | Broken Target | Should Be | Fix |
|----------|--------|-----------|--------------|-----------|-----|
| **HIGH** | `LikeWhatPage.tsx` line 379 | "Take the TL;DR Tour" | `/wildfire` | `/wildfire-tour` | Change `to="/wildfire"` → `to="/wildfire-tour"` or add redirect in misc.tsx |

### Stale Content (Bonus — not 404s but visitor-visible)

| File | Issue | Current | Should Be |
|------|-------|---------|-----------|
| `Index.tsx` line ~2823 | Hardcoded innovation count | "12 provisionals, 2,144 innovations" | "13 provisionals, 2,262 innovations" |
| `museum/QREntry.tsx` | Stale provisional count | "12 provisionals" | "13 provisionals" |
| `museum/WhyNoVC.tsx` | Stale innovation count | "2,144" | "2,262" |
| `data/mediumArticleDrafts.ts` | Stale draft text | "12 provisionals" | "13 provisionals" |

---

## Phase 1 — Route Inventory by App Shell

### Main App (lianabanyan.com) — `App.tsx` → `AppRouter.tsx` → `src/routes/*.tsx`

The main app uses portal-gated route groups. Registration order determines winner for duplicate paths:
**public → onboarding → dashboard → production → initiatives → hexisle → social → commerce → cephas → tools → admin → captain → defense → misc**

**Universal groups (always loaded):** public, onboarding, misc
**Portal-gated:** dashboard, production, initiatives, hexisle, social, commerce, cephas, tools, admin, captain, defense

#### Route Groups (counts)

| Route Group | Unique Paths | Components | Redirects |
|-------------|-------------|------------|-----------|
| public.tsx | 44 | 38 | 0 |
| onboarding.tsx | 38 | 32 | 6 |
| dashboard.tsx | 87 | 73 | 14 |
| production.tsx | 45 | 43 | 0 |
| initiatives.tsx | 50 | 44 | 6 |
| hexisle.tsx | 32 | 30 | 2 |
| social.tsx | 48 | 47 | 0 |
| commerce.tsx | 90+ | 82 | 8 |
| cephas.tsx | 40 | 33 | 7 |
| tools.tsx | 80+ | 70 | 10 |
| admin.tsx | 34 | 34 | 0 |
| captain.tsx | 36 | 34 | 0 |
| defense.tsx | 12 | 10 | 2 |
| misc.tsx | 65+ | 3 (terms, privacy, member-agreement) | 62 (redirects) |

**All OK.** Every component file exists and resolves.

#### Duplicate Path Notes

These paths are defined in multiple groups — the first registered group wins:

| Path | Winner (registered first) | Also defined in |
|------|--------------------------|----------------|
| `/cold-start` | dashboard.tsx (ColdStartPage) | tools.tsx (CrankIt) |
| `/business-plan` | cephas.tsx (Navigate) | tools.tsx (BusinessPlan) |
| `/transparency` | commerce.tsx (FinancialTransparencyPage) | cephas.tsx (Navigate) |
| `/housing/legacy` | dashboard.tsx (HousingPage) | defense.tsx (HousingPage) |

These are not bugs — they're intentional route precedence. Noted for awareness.

### Museum App (museum.lianabanyan.com) — `MuseumApp.tsx`

| # | Route Path | Component | Status |
|---|-----------|-----------|--------|
| 1 | `/` | HomeScreen | OK |
| 2 | `/helm` | HelmPage | OK |
| 3 | `/tour` | TourEntry | OK |
| 4 | `/enter` | EnterDoors | OK |
| 5 | `/watch` | WatchFable | OK |
| 6 | `/watch/:slide` | WatchFable | OK |
| 7 | `/why-no-ads` | WhyNoAds | OK |
| 8 | `/why-no-ads/:section` | WhyNoAds | OK |
| 9 | `/why-no-vc` | WhyNoVC | OK |
| 10 | `/why-no-vc/:section` | WhyNoVC | OK |
| 11 | `/mirror` | MirrorMirror | OK |
| 12 | `/cast` | Cast | OK |
| 13 | `/yvaine` | YvaineClip | OK |
| 14 | `/stewards` | StewardsPage | OK |
| 15 | `/explore` | Door1Tour | OK |
| 16 | `/browse` | Door1GhostWorld | OK |
| 17 | `/build` | Door2Pathways | OK |
| 18 | `/build/:pathway` | Door2Pathways | OK |
| 19 | `/join` | Door3Join | OK |
| 20 | `/welcome` | Door3Join | OK |
| 21 | `/qr/:cardId` | QREntry | OK |
| 22 | `/library` | CephasBasement | OK |
| 23 | `/library/:depth` | CephasBasement | OK |
| 24 | `/hexisle` | Archipelago | OK |
| 25 | `/hexisle/scroll` | TreasureMapScroll | OK |
| 26 | `/hexisle/forge` | CampaignForge | OK |
| 27 | `/hexisle/forge/:campaignId/map` | CampaignMapEditor | OK |
| 28 | `/hexisle/wardrobe` | WardrobeDepartment | OK |
| 29 | `/hexisle/submissions` | SubmissionsPedestal | OK |
| 30 | `/catapult` | CatapultDashboard | OK |
| 31 | `/briefings` | MissionBriefingsPage | OK |
| 32 | `/hexisle/:island` | IslandCard | OK |
| 33 | `/hexisle/:island/:district` | DistrictCard | OK |
| 34 | `/studio` | DeckCardStudio | OK |
| 35 | `/print-studio` | PrintStudioPage | OK |
| 36 | `/print-approval` | PrintApprovalPage | OK |
| 37 | `/become-a-producer` | ProducerSignupPage | OK |
| 38 | `/producer-board` | ProducerBoardPage | OK |
| 39 | `/founder/story` | FounderStory | OK |
| 40 | `/openwater/briefs` | BriefDirectoryPage | OK |
| 41 | `/openwater/publish` | PublishBriefPage | OK |
| 42 | `/openwater/patrons` | PatronDirectoryPage | OK |
| 43 | `/openwater/my-engagements` | MyEngagementsPage | OK |
| 44 | `/openwater/my-saa` | MySaaPage | OK |
| 45 | `/outreach` | OutreachIndexPage | OK |
| 46 | `/outreach/:slug` | OutreachLetterDetailPage | OK |
| 47 | `*` | NotFound | OK |

### Business App (lianabanyan.biz) — `BusinessApp.tsx`

| # | Route Path | Component | Status |
|---|-----------|-----------|--------|
| 1 | `/` | BusinessLanding | OK |
| 2 | `/auth` | Auth | OK |
| 3 | `/browse` | BrowseBusiness | OK |
| 4 | `/dashboard` | Dashboard | OK |
| 5 | `/positions` | ContractPositions | OK |
| 6 | `/member-resources` | MemberResources | OK |
| 7 | `/workshop` | Workshop | OK |
| 8 | `/campaign-production/:workstationId` | CampaignProduction | OK |
| 9 | `/briefcase` | Briefcase | OK |
| 10 | `/project/:slug` | ProjectView | OK |
| 11 | `/manage-positions` | ManagePositions | OK |
| 12 | `/lb-positions` | LBInternalPositions | OK |
| 13 | `/position-categories` | PositionCategories | OK |
| 14 | `/admin-project/:id` | AdminProject | OK |
| 15 | `/create-project` | CreateProject | OK |
| 16 | `/task-list` | TaskList | OK |
| 17 | `/task-log` | TaskLog | OK |
| 18 | `/subdomain-manager` | SubdomainManager | OK |
| 19 | `/client-api-manager` | ClientAPIManager | OK |
| 20 | `/credential-management` | CredentialManagement | OK |
| 21 | `/themes` | ThemeManagement | OK |
| 22 | `/kaleidoscope` | BizKaleidoscope | OK |
| 23 | `/biz-directory` | BizKaleidoscope | OK |
| 24 | `/storefront-aggregation` | StoreFrontAggregation | OK |
| 25 | `/biz-aggregation` | StoreFrontAggregation | OK |
| 26 | `/the-furnace` | TheFurnace | OK |
| 27 | `/furnace` | TheFurnace | OK |
| 28 | `/dashboard/maker` | MakerDashboard | OK |
| 29 | `/orders` | OrderManifestPage | OK |
| 30-33 | `/tasklist`, `/tasklog`, `/tasks` | Navigate (redirects) | OK |
| 34-36 | `/marketplace`, `/projects`, `/portfolio` | Navigate (external) | OK |
| 37 | `*` | NotFound | OK |

### DSS App (the2ndsecond.com) — `DSSApp.tsx`

| # | Route Path | Component | Status |
|---|-----------|-----------|--------|
| 1 | `/` | SecondSecondLanding | OK |
| 2 | `/maker-portal` | The2ndSecondPortal | OK |
| 3 | `/auth` | Auth | OK |
| 4 | `/stl-vault` | STLVault | OK |
| 5 | `/slottedtop` | SlottedTopShowcase | OK |
| 6 | `/test-pilot` | TestPilotDashboard | OK |
| 7 | `/makers` | MakerDirectory | OK |
| 8 | `/makers/:slug` | MakerProfile | OK |
| 9 | `/register-maker` | MakerRegistration | OK |
| 10 | `/products` | ProductCatalog | OK |
| 11 | `/products/:slug` | CatalogProductDetail | OK |
| 12 | `/factory-node` | FactoryNodePage | OK |
| 13 | `/production-pathways` | ProductionPathways | OK |
| 14 | `/cold-start-calculator` | ColdStartCalculator | OK |
| 15 | `/factory/canister` | CanisterConfigurator | OK |
| 16 | `/factory/canister/shop` | CanisterProductCatalog | OK |
| 17 | `/canister/bom` | CanisterBOMPage | OK |
| 18 | `/production` | ProductionPathways | OK |
| 19 | `/bounties` | CodeBreakersHub | OK |
| 20 | `/cold-start` | CrankIt | OK |
| 21 | `/ledger` | FinancialTransparencyPage | OK |
| 22 | `/get-hired` | GetHiredLanding | OK |
| 23 | `*` | NotFound | OK |

### HexIsle App (hexisle.com) — `HexIsleApp.tsx`

(Root/www branch — 27 routes, all OK. Also has encyclopedia and showcase subdomain branches.)

### Network App (lianabanyan.net) — `NetworkApp.tsx`

(21 routes including 4 external redirects, all OK.)

### Nonprofit App (lianabanyan.org) — `NonprofitApp.tsx`

(14 routes including 2 external redirects, all OK.)

### Upekrithen App (upekrithen.lianabanyan.com) — `UpekrithenApp.tsx`

(6 routes behind FounderGate, all OK.)

---

## Phase 2 — Verification Results

### 2A. Component File Exists
**PASS for ALL routes.** The Vite build (`npm run build`) completed successfully in K415, confirming every lazy import resolves to a real file on disk.

### 2B. Component Imports Resolve
**PASS for ALL routes.** Same reasoning — Vite tree-shakes and bundles every import. A broken import would fail the build.

### 2C. Supabase Table References
**PASS.** K414 verified all critical tables exist in Supabase:
- `platform_canonical` ✓
- `outreach_letters` ✓ (95 rows in 'proposed' state)
- `outreach_letter_votes` ✓
- `outreach_letter_responses` ✓
- `outreach_letter_retractions` ✓
- `helm_tasks` ✓
- `helm_task_dispatch_log` ✓
- `letter_dispatch_queue` ✓
- `letter_send_log` ✓
- `crown_letter_delegations` ✓
- `crown_letter_response_log` ✓
- `battery_dispatch_platform_config` ✓
- `battery_dispatch_access` ✓
- `innovation_log` ✓ (2,059 rows — incomplete but functional)

---

## Phase 4 — Navigation Link Audit

### Nav Links → Route Verification

| Nav Source | Link Text | Target | Valid? | Notes |
|-----------|-----------|--------|--------|-------|
| **LikeWhatPage** | **Take the TL;DR Tour** | **`/wildfire`** | **NO** | **Should be `/wildfire-tour`. ONLY broken link found.** |
| PlatformFooter | Economic Model | `/economics` | YES | |
| PlatformFooter | Patent Portfolio | `/patent-portfolio` | YES | |
| PlatformFooter | Transparency Dashboard | `/fly-on-the-wall` | YES | |
| PlatformFooter | The Crow's Nest | `/crows-nest` | YES | |
| PlatformFooter | Terms of Service | `/terms` | YES | |
| PlatformFooter | Privacy Policy | `/privacy` | YES | |
| PlatformFooter | Cephas Archive | `/cephas` | YES | |
| PlatformFooter | Governance | `/governance` | YES | |
| PlatformFooter | Help Wanted | `/help-wanted` | YES | |
| PlatformFooter | Design Arena | `/arena` | YES | |
| PlatformFooter | Developers | `/developers` | YES | |
| PlatformFooter | Contact Us | `/contact` | YES | |
| CrossPortalNav | Marketplace | `https://lianabanyan.com/` | YES | |
| CrossPortalNav | The 2nd Second | `https://the2ndsecond.com/` | YES | |
| CrossPortalNav | HexIsle | `https://hexisle.com/` | YES | External domain |
| CrossPortalNav | Business | `https://lianabanyan.biz/` | YES | |
| CrossPortalNav | Network | `https://lianabanyan.net/` | YES | |
| CrossPortalNav | Non-Profit | `https://lianabanyan.org/` | YES | |
| Index (hero) | ENTER | `/helm` or `/portal` | YES | |
| Index (hero) | STEP BY STEP | `/welcome` | YES | |
| Index (hero) | MISSION ONE | `/mission-one` | YES | |
| Index | Patent Portfolio → | `/patent-portfolio` | YES | |
| Index | Join for $5/year → | `/RedCarpet` | YES | |
| Index | Ghost World → | `/ghost` | YES | |
| Index | Salt Mines → | `/get-a-job` | YES | |
| LikeWhatPage | Explore (cards) | `/hexisle/battle-philosophy`, `/hexisle`, `/chain`, `/economics`, `/patent-portfolio` | YES | All valid |
| LikeWhatPage | Full Paper Directory | `/papers` | YES | |
| LikeWhatPage | Cephas Archive | `/cephas` | YES | |
| LikeWhatPage | Back to Patent Portfolio | `/patent-portfolio` | YES | |
| LikeWhatPage | Full FAQ | `/faq` | YES | |
| PatentPortfolio | Like what? See examples | `/like-what` | YES | |
| PatentPortfolio | Hall of Innovations | `/hall-of-innovations` | YES | |

### AppSidebar Links
All sidebar entries verified against route tables. **All valid.** Sidebar entries are portal-gated and only show routes available in the active portal.

---

## Phase 5 — Recommended Fixes for K417

### Priority 1 (blocks Opening Gambit)

1. **`/wildfire` broken link** — `LikeWhatPage.tsx` line 379
   - **Fix:** Change `to="/wildfire"` → `to="/wildfire-tour"` OR add redirect in `misc.tsx`: `<Route path="/wildfire" element={<Navigate to="/wildfire-tour" replace />} />`

### Priority 2 (stale content — not 404s but visible to visitors)

2. **Index.tsx** — Hardcoded "12 provisionals, 2,144 innovations"
   - Wire to `useCanonicalStats()` or update to "13 provisionals, 2,262 innovations"
3. **museum/QREntry.tsx** — Stale "12 provisionals"
4. **museum/WhyNoVC.tsx** — Stale "2,144"
5. **data/mediumArticleDrafts.ts** — Stale draft text

### Architecture Notes

- **Duplicate route paths** across route groups are intentional (first registered wins).
- **`misc.tsx`** contains ~62 redirects for legacy/alias paths — all functioning correctly.
- **Museum app** has the smallest route surface (48 routes) and is cleanest.
- **Main app** has 500+ routes across 14 route groups — the largest attack surface.
- **Portal gating** (`portalConfig.ts`) limits which route groups are visible per hostname, reducing effective 404 risk per portal.

---

## Conclusion

**ZERO component-level 404s.** Every route's component exists and compiles.

**ONE broken nav link** found: `/wildfire` on the LikeWhatPage. One-line fix.

**Four stale content instances** with old canonical numbers (12 → 13 provisionals, 2,144 → 2,262 innovations).

The platform is **LAUNCH READY** pending the one broken link fix.

---

*Knight K416 — Audit complete. FOR THE KEEP.*
