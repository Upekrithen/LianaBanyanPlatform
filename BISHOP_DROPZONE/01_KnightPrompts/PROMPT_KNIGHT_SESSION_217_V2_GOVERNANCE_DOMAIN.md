# KNIGHT SESSION 217 — v2 Governance Domain Migration
## Priority: HIGH | Source: Bishop B057 Domain Audit
## Prerequisite: K209 (Currency — Marks staking for votes) + K218 (Guild — Harper Guild oversight)
## Note: Can start without K218; Harper Guild integration added later

---

## CONTEXT

Governance is the 10th v2 domain — the democratic operating system. It covers Star Chamber (4 AI judges for dispute resolution), The 300 (leadership pedestals), Senate (6 halls + Tower of Peace), Round Tables (Muffled Rule, Coverage Minutes, WebRTC), Chain Voting (0-100% bonus, pledged Marks), and the Areopagus (4-level dispute escalation). This is one of the most architecturally complex domains.

---

## V1 INVENTORY (from B056 deep audit)

### Tables (6+ core)
- `star_chamber_cases` (20 cols) — 4 AI judge columns, founder_override
- `star_chamber_verdicts` (6 cols) — verdict records
- `round_tables` (16 cols) — table definitions
- `round_table_sessions` (10 cols) — session tracking
- `round_table_messages` (7 cols) — chat messages
- Plus: chain_voting_chains, chain_voting_proposals, chain_voting_votes, crown_positions, pedestals, proposals, votable_items, structural_bylaws

### Edge Functions (7)
- `star-chamber-analyze` — Claude + Perplexity AI judges
- `api-submit-vote`, `process-vote-safe`, `check-expired-votes`, `process-expired-votes`, `revert-expired-votes`
- `family-vote` — family-level voting

### Pages (13)
StarChamber, The300Page, Senate (6 halls + Tower of Peace), RoundTableHall (Muffled Rule), ChainVoting, Governance, ProposalsListing, HexIsleVote, Petitions, StewardLegalDashboard, StewardDashboard, StewardApply, RoleManagement

### Components (20+)
the300/ (5 files), VotingDialog, VotingConfigManager, SWOOPVoting, RoundTableChat, TreasuryGovernance + more

### Hooks (6)
useTreasuryGovernance, useDesignDemocracy, useDesignContests, useContests, useRealTimeCalculations, useDiscovery

### Lib Modules (20+)
areopagusGovernance.ts, areopagusDoctrine.ts, chainVotingService.ts, discourse/roundTables.ts (LiveKit WebRTC), discourse/coverageMinutes.ts (Muffled Rule), discourse/pedestalGovernance.ts + 14 more

---

## V2 MODULE STRUCTURE

```
platform-v2/src/domains/governance/
├── pages/
│   ├── GovernancePage.tsx           # Hub: overview of all governance mechanisms (AppShell)
│   ├── StarChamberPage.tsx          # AI dispute resolution (AppShell)
│   ├── The300Page.tsx               # 300 leadership pedestals (AppShell)
│   ├── SenatePage.tsx               # 6 halls + Tower of Peace (AppShell)
│   ├── RoundTablePage.tsx           # Muffled Rule discussion (AppShell)
│   ├── ChainVotingPage.tsx          # Chain voting with Marks pledging (AppShell)
│   ├── ProposalsPage.tsx            # Active proposals listing (AppShell)
│   ├── PetitionsPage.tsx            # Member petitions (AppShell)
│   └── StewardPage.tsx              # Steward dashboard + application (AppShell)
├── components/
│   ├── star-chamber/
│   │   ├── CaseSubmission.tsx       # Submit a case
│   │   ├── VerdictDisplay.tsx       # AI judge verdicts (Oracle, Morpheus, Red Queen, Dredd)
│   │   └── FounderOverride.tsx      # Founder override mechanism
│   ├── the300/
│   │   ├── PedestalGrid.tsx         # 300 pedestal positions
│   │   ├── PedestalCard.tsx         # Individual pedestal
│   │   └── PedestalElection.tsx     # Voting for pedestals
│   ├── voting/
│   │   ├── VotingDialog.tsx         # Universal voting UI
│   │   ├── ChainVotingVisualizer.tsx # Chain bonus visualization
│   │   └── ProposalCard.tsx         # Proposal display
│   ├── round-table/
│   │   ├── RoundTableChat.tsx       # Muffled Rule chat (WebRTC)
│   │   └── CoverageMinutes.tsx      # Time-gated discussion
│   └── StewardApplication.tsx       # Steward role application
├── hooks/
│   ├── useStarChamber.ts            # Case submission + verdict tracking
│   ├── useVoting.ts                 # Universal voting (chain, proposals, pedestals)
│   ├── useRoundTable.ts             # Round table sessions + messages
│   ├── useThe300.ts                 # Pedestal state
│   └── useSteward.ts               # Steward role state
├── lib/
│   ├── governanceTypes.ts           # Types
│   ├── starChamberJudges.ts         # 4 AI judges: Oracle, Morpheus, Red Queen, Dredd
│   ├── chainVotingRules.ts          # 0-100% bonus, Marks pledging
│   ├── senateHalls.ts               # 6 halls + Tower of Peace (Swiss neutrality)
│   ├── areopagusLevels.ts           # 4-level escalation: Steward → Ombudsperson → Panel → AAA
│   └── muffledRule.ts               # Coverage Minutes time-gating
├── routes.tsx
└── index.ts
```

---

## KEY DESIGN DECISIONS

1. **Star Chamber — 4 AI judges**: Oracle (pattern analysis), Morpheus (scenario modeling), Red Queen (adversarial challenge), Dredd (rule enforcement). Plus founder_override for exceptional cases.

2. **The 300 — 300 leadership pedestals**: Public voting. Members compete for positions. Pedestals grant governance visibility, not executive power.

3. **Senate — 6 halls + Tower of Peace**: Swiss neutrality model. Tower of Peace is a mediation space, not a power center.

4. **Chain Voting**: Marks-backed voting with 0-100% bonus for early chains. Pledged Marks are escrowed during vote.

5. **Muffled Rule**: Round Tables use Coverage Minutes — time-gated discussion to prevent domination. WebRTC via LiveKit.

6. **Areopagus — 4-level escalation**: Steward Review → Ombudsperson → Panel → AAA Arbitration. Harper Guild provides oversight.

7. **All pages AppShell** — governance is fully member-facing, operational.

---

## BUILD STEPS

1. Use Librarian: `get_schema("star_chamber_cases")`, `get_schema("round_tables")`, `get_schema("round_table_sessions")`
2. Build GovernancePage hub first — links to all sub-systems
3. Build StarChamber + The300 + ChainVoting (core mechanisms)
4. Build Senate + RoundTable (discussion systems)
5. Wire routes, export API, register in AppRouter

---

## MANDATORY: REBUILD LIBRARIAN INDEXES

```bash
cd librarian-mcp && npx tsc && node dist/indexer/buildIndex.js
```

---

## VERIFICATION

1. `npm run build` passes
2. `/governance` shows hub with all mechanisms
3. `/governance/star-chamber` shows case submission + 4 AI judges
4. `/governance/chain-voting` shows Marks-backed voting
5. `get_migration_status("governance")` shows v2 pages > 0
6. Librarian indexes rebuilt

---

*Bishop B057 — v2 Governance Domain*
*Star Chamber + The 300 + Senate + Chain Voting + Areopagus*
*FOR THE KEEP!*
