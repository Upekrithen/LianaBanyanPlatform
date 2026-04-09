# KNIGHT SESSION 221 — v2 Manufacturing Domain Migration
## Priority: MEDIUM | Prerequisite: K209 (Currency)

---

## V1 INVENTORY
- **Tables**: canister_configurations (13 cols), canister_products (10 cols), design_battles, design_battle_participants, design_battle_votes, bounty_signups, pioneer_nodes (100 max, 7 equipment types), manufacturing_modules
- **Edge Functions**: printful-api (POD proxy)
- **Pages (8)**: CanisterConfigurator (544 lines), CanisterProductCatalog, CanisterBOMPage, FactoryHub (522 lines), FactoryNodePage, ManufacturingStore, ManufacturingNodeCueCard, ModularManufacturing
- **Components (9)**: CanisterStackDiagram, FactoryPipeline, PioneerNodeRegistry, ProductionLevelThermometer, ManufacturingLadder, PartnershipStatusCard, ProcessModuleCard + indexes
- **Hooks (4)**: useCanisterSystem, useDesignContests, useDesignDemocracy, useManufacturingStatus

## V2 STRUCTURE
```
platform-v2/src/domains/manufacturing/
├── pages/
│   ├── CanisterConfiguratorPage.tsx  # Interactive builder (AppShell)
│   ├── CanisterCatalogPage.tsx       # Product catalog: Gravity $249, Thermo $329, Complete $499
│   ├── CanisterBOMPage.tsx           # Bill of materials
│   ├── FactoryHubPage.tsx            # Factory overview (AppShell)
│   ├── FactoryNodePage.tsx           # Individual node detail
│   ├── DesignBattlePage.tsx          # Design democracy contests
│   └── PioneerNodePage.tsx           # Pioneer node registry (100 max)
├── components/
│   ├── CanisterStackDiagram.tsx, FactoryPipeline.tsx, PioneerNodeRegistry.tsx
│   ├── ProductionLevelThermometer.tsx, ManufacturingLadder.tsx
│   └── DesignContestCard.tsx
├── hooks/
│   ├── useCanisterSystem.ts, useDesignContests.ts, usePioneerNodes.ts
├── lib/
│   ├── manufacturingTypes.ts, canisterProducts.ts, pioneerNodeRules.ts
├── routes.tsx
└── index.ts
```

## KEY RULES
- Pioneer Nodes: 100 max, 7 equipment types (SLA, FDM, resin, CNC, laser, injection molder, desktop extruder)
- Canister products: Gravity Kit $249, Thermoplastic Kit $329, Complete System $499
- S piston: screw press, ~5,207 PSI, thermoplastic injection
- Design Democracy: community votes on product designs before production runs

## MANDATORY: `cd librarian-mcp && npx tsc && node dist/indexer/buildIndex.js`

*FOR THE KEEP!*
