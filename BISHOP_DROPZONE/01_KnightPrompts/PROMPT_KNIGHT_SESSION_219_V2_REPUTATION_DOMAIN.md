# KNIGHT SESSION 219 — v2 Reputation Domain Migration
## Priority: LOW | Source: Bishop B057 Domain Audit
## Prerequisite: K209 (Currency) — bounty payouts use Credits
## Complexity: LOW — smallest domain in the migration

---

## CONTEXT

Reputation is the 12th v2 domain — the trust and verification engine. It covers ADAPT Score (member reputation across 5 axes), Coverage Minutes (time-gated contribution tracking), Bounty Photography (photo verification for listings), and Phase Mimic Trunk management. This is one of the smallest domains — 3 tables, 0 edge functions, 3 pages.

---

## V1 INVENTORY (from B056 deep audit)

### Tables (3)
- `adapt_scores` (7 cols) — composite reputation score per member
- `adapt_baselines` (5 cols) — baseline thresholds for scoring
- `coverage_minutes` (8 cols) — time-gated contribution tracking

### Edge Functions: 0

### Pages (3-4)
AdaptScore, XRayBountyDashboard, BountyPhotographyPage, PhaseMimicTrunkManager

### Components (5)
adapt/BountyCard, adapt/AdaptRadarChart, adapt/AdaptScoreCard, adapt/SOPPipeline, bounty/STAMPVerification

---

## V2 MODULE STRUCTURE

```
platform-v2/src/domains/reputation/
├── pages/
│   ├── AdaptScorePage.tsx          # Member's reputation dashboard (AppShell)
│   ├── BountyBoardPage.tsx         # Photo bounty listing + claims (AppShell)
│   └── CoverageMinutesPage.tsx     # Contribution tracking (AppShell)
├── components/
│   ├── AdaptScoreCard.tsx          # Score summary card
│   ├── AdaptRadarChart.tsx         # 5-axis radar visualization
│   ├── BountyCard.tsx              # Individual bounty listing
│   ├── STAMPVerification.tsx       # Photo stamp verification UI
│   └── CoverageMinutesTracker.tsx  # Time-gated progress
├── hooks/
│   ├── useAdaptScore.ts            # Score queries
│   ├── useBounties.ts              # Bounty listing + claims
│   └── useCoverageMinutes.ts       # Coverage tracking
├── lib/
│   ├── reputationTypes.ts          # Types
│   ├── adaptScoring.ts             # 5-axis scoring: reliability, quality, timeliness, community, growth
│   └── bountyRules.ts              # Photo bounty rules + payout rates
├── routes.tsx
└── index.ts
```

---

## KEY DESIGN DECISIONS

1. **ADAPT Score — 5 axes**: Reliability, Quality, Timeliness, Community contribution, Growth trajectory. Composite score 0-100.

2. **Coverage Minutes**: Time-gated contribution tracking. Members earn coverage minutes by participating in governance, reviews, and service. Used for Muffled Rule eligibility in Round Tables.

3. **Bounty Photography**: Members claim photo bounties for verifying business listings. STAMP verification ensures photo authenticity. Payouts in Credits.

4. **No edge functions** — all scoring is computed client-side or via Supabase RPC.

5. **All pages AppShell** — reputation is member-facing.

---

## BUILD STEPS

1. Use Librarian: `get_schema("adapt_scores")`, `get_schema("adapt_baselines")`, `get_schema("coverage_minutes")`
2. Build AdaptScorePage with radar chart
3. Build BountyBoardPage with claim flow
4. Wire routes, export API, register in AppRouter

---

## MANDATORY: REBUILD LIBRARIAN INDEXES

```bash
cd librarian-mcp && npx tsc && node dist/indexer/buildIndex.js
```

---

## VERIFICATION

1. `npm run build` passes
2. `/reputation` shows ADAPT score with radar chart
3. `/reputation/bounties` shows bounty board
4. `get_migration_status("reputation")` shows v2 pages > 0
5. Librarian indexes rebuilt

---

*Bishop B057 — v2 Reputation Domain*
*ADAPT Score + Bounty Photography + Coverage Minutes*
*Smallest domain. Quick build.*
*FOR THE KEEP!*
