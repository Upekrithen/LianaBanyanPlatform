# KNIGHT SESSION 226 — v2 Political Domain Migration
## Priority: MEDIUM | Complexity: MEDIUM (2-3 sessions)

---

## V1 INVENTORY
- **Tables (5)**: rep_cache (bioguide_id, party, state, district, chamber, committees), member_reps (address tracking), tracked_bills (Congress data, cosponsors, actions JSONB, is_live), bill_cosponsors, rep_letter_templates (5 seeded: cooperatives, food security, housing, small biz, transportation)
- **Edge Functions (1)**: congress-api-sync (multi-mode: bills/members/actions/search, pg_cron every 6h bills, 3am members, 2am actions)
- **Pages (4)**: PoliticalExpedition (bill tracking + rep directory + letter templates), Coalitions (storefront alliances, discount tiers), Arenas (Switzerland Rule, 4-tier moderation), PowerToThePeoplePage (congressional district voting simulator)
- **Components (4)**: political/BillDetailDrawer, political/BillSearch, areopagus/DictionaryPanel, areopagus/DoctrineExplorer

## V2 STRUCTURE
```
platform-v2/src/domains/political/
├── pages/
│   ├── PoliticalExpeditionPage.tsx  # Bill tracking + rep directory + templates (AppShell)
│   ├── CoalitionsPage.tsx           # Storefront alliances (AppShell)
│   ├── ArenasPage.tsx               # Switzerland Rule moderation (AppShell)
│   └── PowerToThePeoplePage.tsx     # District voting simulator (AppShell)
├── components/
│   ├── BillDetailDrawer.tsx, BillSearch.tsx, RepCard.tsx
│   ├── LetterTemplateSelector.tsx, CoalitionCard.tsx
├── hooks/
│   ├── useBills.ts, useReps.ts, useCoalitions.ts
├── lib/
│   ├── politicalTypes.ts, congressApi.ts, letterTemplates.ts (5 seeded)
├── routes.tsx
└── index.ts
```

## KEY RULES
- Congress API syncs via pg_cron (6h bills, 3am members, 2am actions)
- 5 seeded letter templates: cooperatives, food security, housing, small business, transportation
- Switzerland Rule: no-politics arenas use acknowledgment stamps for moderation
- All pages AppShell

## MANDATORY: `cd librarian-mcp && npx tsc && node dist/indexer/buildIndex.js`

*FOR THE KEEP!*
