# KNIGHT SESSION 216 — v2 Captain Domain Migration
## Priority: MEDIUM | Source: Bishop B057 Domain Audit
## Prerequisite: K209 (Currency) + K215 (Financial/RoleDashboardTemplate)
## Design Reference: `BISHOP_DROPZONE/PAWN_BATCH_30_MASTER_DESIGN_PACKET_B057.md` — Captain Dashboard spec

---

## CONTEXT

Captain is the 9th v2 domain — the business-owner operating system. Captains are the Moses-model local leaders who manage territory, pipeline, intelligence, and photo coverage. The Captain level system (10/50/100/1000) gates capabilities by Marks staked, reputation, and fulfillment rate. This domain also includes business campaigns and the Captain onboarding path.

**CRITICAL**: Pawn B30 has a full design spec for the Captain Dashboard. Read the master packet BEFORE building.

---

## V1 INVENTORY (from B056 deep audit)

### Tables (3+ across 3 migrations)
- `captains` (1:1 user, Moses-model levels: 10/50/100/1000, marks_staked, joules_backing, orders_managed/fulfilled, fulfillment_rate, reputation 0-100, medallion tracking)
- `captain_level_requirements` (thresholds per level)
- `business_campaigns` (campaign planning + execution)

### Edge Functions (3)
- `generate-business-plan` — AI-generated with system-analysis template
- 2 campaign management functions

### Pages (9)
CaptainDashboardPage (territory, pipeline, intelligence, photo coverage), CaptainLanding, CaptainOnboardingPage, BusinessCampaignDetail, BusinessCampaignDirectory, BusinessLanding, BusinessPathway, BuildBusiness, BrowseBusiness

### Components (8+)
CaptainTerritory, CaptainPhotoCoverage, CaptainStakeForm, CaptainIntelligence, CaptainLevelCards (10/50/100/1000), CaptainPipeline, ShipMedallionCard, BusinessSimulator + BusinessPlanTreeChart

### Hooks (7)
useCaptain, useBecomeCaptain, useCaptainCorridors, useCaptainOrders, useCaptainPipeline, useBusinessCampaigns, useBuyCredits

---

## V2 MODULE STRUCTURE

```
platform-v2/src/domains/captain/
├── pages/
│   ├── CaptainDashboardPage.tsx    # ACTION-FIRST command view (AppShell) — USE PAWN B30 SPEC
│   ├── CaptainLandingPage.tsx      # Become a Captain pitch (FocusShell)
│   ├── CaptainOnboardingPage.tsx   # Captain setup flow (AppShell)
│   ├── BusinessCampaignPage.tsx    # Campaign detail (AppShell)
│   ├── BusinessDirectoryPage.tsx   # Browse businesses (AppShell)
│   └── BuildBusinessPage.tsx       # Business creation wizard (AppShell)
├── components/
│   ├── CaptainLevelCards.tsx       # 4 levels: 10/50/100/1000 with requirements
│   ├── CaptainTerritory.tsx        # Territory map + coverage
│   ├── CaptainPipeline.tsx         # Business pipeline tracker
│   ├── CaptainIntelligence.tsx     # Local market intelligence
│   ├── CaptainPhotoCoverage.tsx    # Photo verification coverage
│   ├── CaptainStakeForm.tsx        # Marks staking for level advancement
│   ├── PriorityQueue.tsx           # THE DOMINANT CARD — action-first summary
│   └── BusinessSimulator.tsx       # Business plan simulation
├── hooks/
│   ├── useCaptain.ts               # Captain state + level
│   ├── useCaptainPipeline.ts       # Pipeline management
│   ├── useCaptainTerritory.ts      # Territory + corridors
│   └── useBusinessCampaigns.ts     # Campaign CRUD
├── lib/
│   ├── captainTypes.ts             # Types
│   ├── captainLevels.ts            # Moses model: 10 (100 marks, 50 rep) → 50 (500, 85%) → 100 (2000, 90%) → 1000 (10000, 95%)
│   └── territoryRules.ts           # Territory assignment logic
├── routes.tsx
└── index.ts
```

---

## KEY DESIGN DECISIONS

1. **Captain Dashboard follows Pawn B30 spec EXACTLY:**
   - Eyebrow: "Captain Dashboard."
   - Headline: "Run the field from one screen."
   - Priority Queue is the DOMINANT card. NOT 4 equal-weight panels.
   - Top summary band: 1 dominant + 3 supporting cards
   - 2-column below: pipeline/territory left, intelligence/photos right
   - Progressive disclosure per block

2. **Moses Model levels**: Captain 10 (100 marks, 50 rep) → Captain 50 (500 marks, 85% fulfillment) → Captain 100 (2000 marks, 90%) → Captain 1000 (10000 marks, 95%). Each level unlocks new capabilities.

3. **CaptainLandingPage is FocusShell** — it's a conversion page for members considering the Captain path. All other captain pages are AppShell.

4. **Territory system**: Captains manage geographic corridors. Photo coverage verifies business listings. Intelligence aggregates local market data.

---

## BUILD STEPS

1. Use Librarian: `get_schema("captains")`, `get_schema("business_campaigns")`
2. Read Pawn B30 master packet for dashboard spec
3. Build PriorityQueue component FIRST — it's the dashboard's dominant element
4. Build CaptainDashboardPage following B30 spec exactly
5. Build remaining pages
6. Wire routes, export API, register in AppRouter

---

## MANDATORY: REBUILD LIBRARIAN INDEXES

```bash
cd librarian-mcp && npx tsc && node dist/indexer/buildIndex.js
```

---

## VERIFICATION

1. `npm run build` passes
2. `/captain/dashboard` shows Priority Queue as dominant card
3. Captain levels display correct thresholds
4. Dashboard pre-completion checklist from B30 passes
5. `get_migration_status("captain")` shows v2 pages > 0
6. Librarian indexes rebuilt

---

*Bishop B057 — v2 Captain Domain*
*Moses model + Priority Queue dashboard + Territory system*
*FOR THE KEEP!*
