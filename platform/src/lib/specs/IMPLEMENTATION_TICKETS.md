# Implementation Tickets — Muffled Rule & Phase MimicTrunks

## Source of Truth: `platform/src/lib/specs/MUFFLED_RULE_AND_PHASE_MIMICTRUNKS.md`

All agents read from that single spec. No agent invents interfaces or data models.
Every ticket references the spec by section number.

---

## BISHOP TICKETS (Claude Desktop — Architecture + Code)

### B-001: Data Models — Coverage Minutes System
**Spec Section:** 1, 2, 7
**File:** `src/lib/discourse/coverageMinutes.ts`
**Deliverable:** TypeScript interfaces + constants for CoverageMinuteAccount, CoverageMinuteDonation, DonationRecordView, ReadingProgress. Accumulation increment = 3 minutes. Max session = 180 minutes. Earning/spending/donation logic functions.
**Status:** DONE (Session 6M)

### B-002: Data Models — Round Tables
**Spec Section:** 1, 7
**File:** `src/lib/discourse/roundTables.ts`
**Deliverable:** RoundTable interface, one-mic-at-a-time enforcement, topic-per-table structure, session tracking. Functions: createTable, joinTable, requestMic, releaseMic, checkCoverageBalance.
**Status:** DONE (Session 6M)

### B-003: Data Models — Phase MimicTrunks
**Spec Section:** 3, 4, 7
**File:** `src/lib/discourse/phaseMimicTrunks.ts`
**Deliverable:** PhaseMimicTrunk interface (member/guild/tribe ownership), ledger snapshot reference, source code checksum (DNA chain), connection validation protocol, Special Deck Card access link.
**Status:** DONE (Session 6M)

### B-004: Data Models — Pedestals
**Spec Section:** 5, 7
**File:** `src/lib/discourse/pedestals.ts`
**Deliverable:** Pedestal interface, PedestalContribution with 5K cap per person, 20K public threshold, subscription feed references, ledger section ID. Functions: contribute, checkPublicEligibility, getFundingSources.
**Status:** DONE (Session 6M)

### B-005: Data Models — Guild & Tribe Phase Structure
**Spec Section:** 6, 7
**File:** `src/lib/discourse/guildTribePhases.ts`
**Deliverable:** Guild with default Phase MimicTrunk, Tribe as chapter/sub-guild, Tribe optional Phase, nesting structure. Governance hierarchy: LB -> Guild -> Tribe -> Sub-tribe.
**Status:** DONE (Session 6M)

### B-006: Data Models — Source Code Distribution
**Spec Section:** 4, 7
**File:** `src/lib/discourse/sourceDistribution.ts`
**Deliverable:** Download package structure, validation checksum protocol, connection handshake, immutable ledger snapshot bundling. Functions: generatePackage, validateConnection, checkIntegrity.
**Status:** DONE (Session 6M)

### B-007: Data Models — Real World Puzzles
**Spec Section:** 2, 7
**File:** `src/lib/discourse/realWorldPuzzles.ts`
**Deliverable:** Puzzle creation within Library/publications/emails/sites. NOT in LB islands unless paid + Shirley Temple Policy. One Golden Key per plane. Plane entry/exit tracking.
**Status:** DONE (Session 6M)

### B-008: Supabase Schema — All New Tables
**Spec Section:** 7
**File:** `supabase/migrations/20260307100000_coverage_minutes_and_phases.sql`
**Deliverable:** 26 tables with RLS policies + indexes + updated_at triggers. Coverage Minutes, Round Tables, Mic Requests, Phase MimicTrunks, Validation Attempts, Phase Access, Pedestals, Contributions, Subscription Feeds, Private Subscriptions, Guilds, Tribes, Guild/Tribe Memberships, Source Distribution Packages, Connection Handshakes, Real World Puzzles, Puzzle Attempts, Plane Entries, Governance Events, Special Deck Card Links.
**Status:** DONE (Session 6M)

### B-009: Context Provider — Coverage Minutes
**Spec Section:** 1, 2
**File:** `src/contexts/CoverageMinutesContext.tsx`
**Deliverable:** React context managing coverage minute balance, earning from reading/listening, spending on speaking/publishing, donation flow, accumulation level tracking.
**Status:** DONE (Session 6M)

### B-010: Context Provider — Round Tables
**Spec Section:** 1
**File:** `src/contexts/RoundTableContext.tsx`
**Deliverable:** Active table state, mic request queue, active speaker tracking, coverage minute consumption per participant, topic management.
**Status:** DONE (Session 6M)

### B-011: Context Provider — Phase MimicTrunks
**Spec Section:** 3, 4
**File:** `src/contexts/PhaseMimicTrunkContext.tsx`
**Deliverable:** Current phase state, connection validation, ledger sync status, access card verification.
**Status:** DONE (Session 6M)

### B-012: Ledger Section Definitions
**Spec Section:** 7 (Immutable Ledger Sections)
**File:** `src/lib/discourse/ledgerSections.ts`
**Deliverable:** Type definitions for all 8 ledger sections: Coverage Minutes Transactions, Donation Record Views, Pedestal Funding, Phase MimicTrunk Registry, Source Code Validation, Round Table Sessions, Reading Verification, Guild/Tribe Governance.
**Status:** DONE (Session 6M)

---

## ROOK TICKETS (Gemini — Research & Analysis)

### R-001: External Newsletter/Newspaper Partnership Landscape
**Spec Section:** 5
**Question:** What existing newsletter platforms (Substack, Ghost, Buttondown, Revue) and newspaper co-ops offer API integration for subscription management and reading tracking? Which ones support co-op models?
**Deliverable:** Report with API capabilities, pricing, integration complexity ratings.

### R-002: Immutable Ledger Implementation Options
**Spec Section:** 4, 7
**Question:** Compare blockchain vs. append-only database vs. Merkle tree hash chain for the immutable ledger. Consider: cost, speed, tamper-evidence, snapshot bundling for Phase MimicTrunks, offline validation.
**Deliverable:** Comparison matrix with recommendation.

### R-003: MMORPG Hosting Infrastructure Requirements
**Spec Section:** 6
**Question:** What infrastructure does a Guild Phase need to host Warhammer 40K-scale games? What are the compute, networking, and storage requirements? Can this run on existing cloud platforms within LB's architecture?
**Deliverable:** Infrastructure spec with cost estimates at 100/1K/10K concurrent player tiers.

### R-004: Legal Analysis — Source Code Distribution
**Spec Section:** 4
**Question:** What license model allows downloading full source code while maintaining connection validation (tamper-proof via ledger)? Precedents in open-core, BSL, SSPL, or custom licenses?
**Deliverable:** License recommendation with legal considerations.

### R-005: Earn-to-Speak System Precedents
**Spec Section:** 1
**Question:** Are there existing platforms with "earn the right to speak" mechanics? How do they handle edge cases: silent lurkers accumulating massive balances, Coverage Minutes farming, bot-driven reading?
**Deliverable:** Case studies + anti-abuse recommendations.

---

## PAWN TICKETS (Perplexity — Discovery)

### P-001: Co-op Newspaper/Newsletter Platforms
**Spec Section:** 5
**Question:** What existing co-op or cooperative newspaper/newsletter platforms exist that could be integrated with LB? Focus on: community-owned media, co-op publishing models, reader-funded journalism.
**Deliverable:** List of 10+ platforms with integration feasibility.

### P-002: Tamper-Proof Code Distribution Precedents
**Spec Section:** 4
**Question:** What existing systems distribute source code with integrity verification? Examples: Docker content trust, code signing, reproducible builds, Nix, Guix. Which patterns fit Phase MimicTrunks?
**Deliverable:** Pattern catalog with applicability notes.

### P-003: MMO Hosting Cost Benchmarks
**Spec Section:** 6
**Question:** What do existing MMORPG hosting services charge? Compare: self-hosted, cloud-hosted (AWS/GCP), specialized game hosting (Nitrado, GameServers). What would a Guild Phase MimicTrunk cost monthly?
**Deliverable:** Cost comparison table.

### P-004: Reading Engagement Verification
**Spec Section:** 2
**Question:** What existing systems verify that someone actually READ content (not just scrolled past)? Methods: scroll tracking, quiz gates, time-on-page, eye tracking, interaction requirements. What works without being annoying?
**Deliverable:** Method comparison with UX impact ratings.

---

## DEPENDENCY ORDER

```
Phase 1 (Bishop, immediate):
  B-001 → B-002 → B-003 → B-004 → B-005 → B-006 → B-007
  (All data models, no dependencies between them)

Phase 2 (Bishop, after Phase 1):
  B-012 (Ledger sections — needs all data models)
  B-008 (Supabase schema — needs all data models + ledger)

Phase 3 (Bishop, after Phase 2):
  B-009, B-010, B-011 (Context providers — need schema)

Research (Rook + Pawn, parallel with Bishop Phase 1):
  R-001 through R-005 (all independent)
  P-001 through P-004 (all independent)
  Results feed back into spec before Phase 2
```
