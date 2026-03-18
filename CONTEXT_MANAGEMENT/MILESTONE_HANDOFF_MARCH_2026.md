# MILESTONE HANDOFF — March 2026
## Pick up here at start of next session

---

## HANDOFF PROTOCOL

**At the end of every session:** Add a **Session End / Handoff** block (under "WHAT WAS DONE THIS SESSION" or a new dated section). Include: what was built/threshed, latest commit(s), current innovation count, and any pending steps (e.g. `supabase db push`). This file is the persistent place for runway stops and handoffs.

---

## RUNWAY / SESSION STOP (current) — Session 30 (March 18, 2026)

**Latest commit:** `bf6a7bd` — Session 30: Shadow Mark Demand Signaling, FAQ chain linking, 10 innovations #1710-#1719

**Morning Status (March 18, 2026):**
- All code committed and pushed. Working tree clean (only this handoff file modified).
- Both sites deployed and live: lianabanyan-main.web.app + cephas-lianabanyan.web.app
- All Supabase migrations pushed (through `20260318000001`). DB canonical count = 1,719.
- **Last night's marathon:** Sessions 29 → 29b → 30 ran consecutively. 39 innovations threshed (#1681-#1719), 3 new pages built (`/chain`, `/hexisle/downloads`, `/demand`), 7 Crew Call bounties posted, Shadow Mark Demand Signaling system built, FAQ chain linking + Chapter 9 added, 3 POLLINATION sweeps completed.
- **No blockers.** Ready for Session 31.

### What Was Done This Session (Session 30 — Knight)

1. **Thresh 10 innovations (#1710-#1719)** — Shadow Mark Demand Signaling cluster from Bishop Session 012. Per-Area Allocation, Brewster's Forced Distribution, 50% Carry-Forward, 3-Day Crystallization, Beacon Streak Amplifier, Feature Thermometer, Ranked Choice Tier Lock-In, Cascade-Down Amplification, Shadow Mark Persistence, Moneypenny Admin. Migration `20260318000001` pushed to Supabase.

2. **POLLINATION 1,709 → 1,719** across 23 files (47 replacements).

3. **Feature 1: Shadow Mark Demand Signaling System** — Full implementation:
   - `demandSignalingService.ts` — Per-area allocation config (6 area categories with SM amounts), Beacon streak persistence boost tiers (50%-75% carry-forward), carry-forward math (geometric series), crystallization logic, thermometer data builder, ranked choice cascade calculation, 8 sample pre-operational pedestals (Business Cards, Letterhead, Medallion Coins, T-Shirts, Stickers, HexIsle Expansions, Posters, Labels)
   - `components/demand/FeatureThermometer.tsx` — Full and compact thermometer cards with: progress bar, Credits/SM/est. days stats, Alpha→Beta→Operational milestone timeline, user allocation display with persistence day count and crystallization countdown, action buttons, expandable how-it-works with FAQ deep links, ThermometerGrid component
   - `pages/DemandSignaling.tsx` at `/demand` — Dashboard with: platform-wide stats, Beacon streak display with tier ladder, area category filter buttons, thermometer grid, 3-step "How It Works" explainer, SEC disclosure, FAQ cross-links

4. **Feature 2: FAQ Chain Linking (`relatedEntries`)** — Extended `FAQEntry` interface with `relatedEntries?: string[]` field. Added `getRelatedEntries()` utility function. Added relatedEntries cross-links to: brewster-bonus, how-marks-work, production-runs, hexisle-overview, hexisle-chain, hexisle-swan-neck, hexisle-golden-lotus, hexisle-ouralis + all 9 new Shadow Mark entries.

5. **Feature 3: Shadow Mark FAQ Chapter + HexIsle Supplement** — Added Chapter 9 "Shadow Mark Demand Signaling" to knowledgeBase with 9 entries: shadow-marks, brewster-distribution, carry-forward, crystallization, beacon-persistence, pre-operational, ranked-choice, cascade-amplification, moneypenny-admin. Enriched HexIsle FAQ entries (Swan Neck, Golden Lotus, Ouralis) with deeper Bishop content including detail fields.

### Innovations Filed (#1710-#1719)

| # | Innovation | Category |
|---|-----------|----------|
| 1710 | Shadow Mark Per-Area Demand Allocation | platform-economics |
| 1711 | Brewster's Millions Forced Distribution | platform-economics |
| 1712 | 50% Carry-Forward Persistence Compounding | platform-economics |
| 1713 | 3-Day Crystallization Threshold | platform-economics |
| 1714 | Beacon Streak Persistence Amplifier | platform-economics |
| 1715 | Pre-Operational Feature Thermometer | ux-design |
| 1716 | Ranked Choice Production Tier Lock-In | platform-economics |
| 1717 | Cascade-Down Unit Amplification | platform-economics |
| 1718 | Shadow Mark Persistence Regardless of Credit Return | platform-economics |
| 1719 | Moneypenny Administrative Threshold Monitor | ux-design |

### Files Created/Changed (Session 30)

| File | Change |
|------|--------|
| `platform/src/lib/demandSignalingService.ts` | **NEW** — Demand signaling engine (allocations, carry-forward, crystallization, thermometers, ranked choice) |
| `platform/src/components/demand/FeatureThermometer.tsx` | **NEW** — Thermometer display component + compact grid |
| `platform/src/pages/DemandSignaling.tsx` | **NEW** — /demand dashboard page |
| `platform/src/App.tsx` | Added DemandSignaling lazy import + route |
| `platform/src/lib/nervous-system/knowledgeBase.ts` | Extended FAQEntry with relatedEntries[], Ch 9 (9 entries), enriched HexIsle entries, getRelatedEntries() utility |
| `platform/supabase/migrations/20260318000001_*.sql` | **NEW** — 10 innovations + canonical count 1719 |
| 23 platform/src + Cephas files | POLLINATION: 1,709 → 1,719 (47 replacements) |

### Migrations Pushed (Session 30)

- `20260318000001_innovation_log_session30_shadow_marks.sql` — Applied successfully to remote

### Deployment (Session 30)

- **Platform**: lianabanyan-main.web.app (600 files, 207 new)
- **Cephas**: cephas-lianabanyan.web.app (1410 files, 980 pages)

### Pending Work (Session 31+)

| Item | Status |
|------|--------|
| **Pledged Mark Voting** (`/hexisle/vote`) — Task 4 from Bishop Session 011 | **NEXT** |
| **HexIsle Cue Card** — "Know a Gamer? Know an Engineer?" (Task 6) | **NEXT** |
| **POLITICAL EXPEDITION FULL BUILD** — See Session 28 spec | **PRIORITY — Founder directive** |
| Shadow Mark Demand Signaling — wire to Supabase backend (real data) | MEDIUM |
| Moneypenny Phase 1 — daily digest cron + threshold alerts | MEDIUM |
| FAQ page "See Also" rendering for relatedEntries | MEDIUM |
| Founder files 8th provisional with USPTO | FOUNDER ACTION — PDF ready |
| Content Pipeline build | MEDIUM |
| Battery Dispatch — Grassroots Intelligence | MEDIUM |
| Treasure Key injection | MEDIUM |
| SEC language cleanup (broader pass) | MEDIUM |
| RLS security hardening | MEDIUM |

---

## Session 29b (March 17, 2026) — Previous

**Latest commit:** `6ab9899` — Session 29b: Bishop 012 thresh (19 innovations #1691-#1709), POLLINATE 1690→1709, 7 HexIsle bounties on /crew-call

### What Was Done This Session (Session 29b — Knight, continued)

1. **Thresh 19 innovations (#1691-#1709)** from Bishop Session 012. Renumbered from Bishop's original #1663-#1681 to avoid collision with Knight Sessions 28-29. Sources: XRAY_FAQ content (3), Campaign Copy (7), Crew Call Bounties (3), Character Lore (6). Supabase migration `20260317000003_innovation_log_session29b_bishop_012.sql` pushed successfully.

2. **POLLINATION 1,690 → 1,709** across 23 files (47 replacements). All platform/src and Cephas content files updated.

3. **7 HexIsle Engineering Bounties on /crew-call** — Added full bounty board to `CrewCallPage.tsx` with:
   - CREW-HEXISLE-001: Hydraulic Seal Design (CRITICAL, 2000 Credits / 50 Marks / 200 XP)
   - CREW-HEXISLE-002: 42→60mm Dimensional Port (HIGH, 3000 / 75 / 300)
   - CREW-HEXISLE-003: Tesla Valve Optimization (HIGH, 2500 / 60 / 250)
   - CREW-HEXISLE-004: Reservoir Pressure Testing (MEDIUM, 1500 / 40 / 150)
   - CREW-HEXISLE-005: Ouralis Gear Train QC (MEDIUM, 2000 / 50 / 200)
   - CREW-HEXISLE-006: Compliant Mechanism Durability (MEDIUM, 1500 / 40 / 150)
   - CREW-HEXISLE-007: Pneumatic Plant Growth (LOW, 2500 / 60 / 250)
   - Each bounty card: problem statement, skills required, 5 deliverables, 5-point STAMP criteria, XP formula, priority/difficulty badges
   - Total: 15,000 Credits + 375 Marks + 1,500 XP across 7 bounties
   - Assignment rules section (Primary/Secondary/Backup, Process Pioneer bonus)

### Innovations Filed (#1691-#1709)

| # | Innovation | Category |
|---|-----------|----------|
| 1691 | X-Ray Hexel Piece Tooltips | ux-design |
| 1692 | FAQ Deep-Link Architecture | ux-design |
| 1693 | Piece-Level Open Build Integration | ux-design |
| 1694 | Dual-Mode Character Miniatures | manufacturing |
| 1695 | Mountable Creature System | manufacturing |
| 1696 | King-Class Adjacent Hex Influence | manufacturing |
| 1697 | Queen-Class Hydraulic Modulation | manufacturing |
| 1698 | Chain Backer Dynamic Pricing | platform-economics |
| 1699 | Community-Refined Assembly Launch | manufacturing |
| 1700 | Scale-Tiered Water Table Fulfillment | platform-economics |
| 1701 | Structured Bounty Specification Format | platform-economics |
| 1702 | Pneumatic Plant Growth Bounty | manufacturing |
| 1703 | Compliant Mechanism Fatigue Bounty | manufacturing |
| 1704 | Dual-Path Character Progression Narrative | ux-design |
| 1705 | Character-Hexel Mechanical Interaction Tiers | manufacturing |
| 1706 | Character Interaction Matrix | ux-design |
| 1707 | Healer Counter-Mechanism | manufacturing |
| 1708 | Queen Pneumatic Resonance | manufacturing |
| 1709 | Character-as-Cooperative-Metaphor | ux-design |

### Files Created/Changed (Session 29b)

| File | Change |
|------|--------|
| `platform/src/pages/CrewCallPage.tsx` | Added 7 HexIsle bounty cards + BountyCard/HexIsleBountyBoard components |
| `platform/supabase/migrations/20260317000003_*.sql` | **NEW** — 19 innovations + canonical count 1709 |
| 23 platform/src + Cephas files | POLLINATION: 1,690 → 1,709 (47 replacements) |

### Migrations Pushed (Session 29b)

- `20260317000003_innovation_log_session29b_bishop_012.sql` — Applied successfully to remote

### Deployment (Session 29b)

- **Platform**: lianabanyan-main.web.app (599 files, 174 new)
- **Cephas**: cephas-lianabanyan.web.app (1410 files, 980 pages)

### Pending Work (Session 30+)

| Item | Status |
|------|--------|
| **Pledged Mark Voting** (`/hexisle/vote`) — Task 4 from Bishop Session 011 | **NEXT** |
| **HexIsle Cue Card** — "Know a Gamer? Know an Engineer?" (Task 6) | **NEXT** |
| **POLITICAL EXPEDITION FULL BUILD** — See Session 28 spec | **PRIORITY — Founder directive** |
| Founder files 8th provisional with USPTO | FOUNDER ACTION — PDF ready |
| Content Pipeline build | MEDIUM |
| Battery Dispatch — Grassroots Intelligence | MEDIUM |
| Treasure Key injection | MEDIUM |
| SEC language cleanup (broader pass) | MEDIUM |
| RLS security hardening | MEDIUM |

---

## Session 29 (March 17, 2026) — Previous

**Latest commit:** `ffa1ca2` — Session 29: X-Ray→FAQ Pipeline, Chain Dashboard, HexIsle Downloads + 10 innovations threshed

### What Was Done This Session (Session 29 — Knight)

1. **Feature 1: X-Ray → FAQ Pipeline** — Extended `XRayGlossaryEntry` interface with 4 new fields: `faqAnchorId`, `downloadUrl`, `piggybackUrl`, `innovationNumber`. Added `faqAnchorId` cross-links to 18 existing glossary entries (credits, marks, joules, babylon candles, cue cards, bandwagon, production runs, steward, ghost world, golden keys, xp, coverage minutes, fly on the wall, cost+20, guilds, six degrees, chalk outline, double-dipping, star chamber, why-no-ads). Added 27 new HexIsle piece entries with full explanations, FAQ anchors, piggyback URLs, and innovation references. Updated `XRayOverlay.tsx` with 4 new rendered link types: FAQ (amber), Download STL (green), Submit Improvement (orange), Innovation # (purple). Added complete HexIsle FAQ chapter (Chapter 8) to `knowledgeBase.ts` with 27 piece entries + overview + chain + open IP + leap frog entries.

2. **Feature 2: Chain Dashboard (`/chain`)** — New `ChainDashboard.tsx` page with: visual 13-link chain (lit/unlit), 14-day chain timer with countdown, Joule bonus display (current + next link), next campaign card with "Back on Kickstarter" CTA, full 13-campaign roadmap grid with type badges (character/component/assembly/capstone), chain perk ladder (9 tiers from founding badge to Complete Collection pricing), referral link with copy button (TasteMaker Trust Chain attribution), top-10 chain leaderboard. Routed at `/chain` as ExplorerRoute.

3. **Feature 3: HexIsle Downloads (`/hexisle/downloads`)** — New `HexIsleDownloads.tsx` page with: 27-piece card grid from hexelPieceGrammar taxonomy, 6-tier Tereno badge system (Certified/Approved/Official/Compatible/Adaptable/Inspired), search bar + tier filter dropdown, STL download buttons (3 pieces marked available: Golden Lotus, Ouralis, Sawtooth Coral), Piggy-Back Improvement submission form (piece select, tier self-declare, description, STL upload), community version counts, innovation number cross-references, tier classification explainer section. Routed at `/hexisle/downloads` as ExplorerRoute.

4. **Thresh 10 Innovations (#1681-#1690)** — Chain Loyalty Engine, Leap Frog Cadence, Open IP Kickstarter Model, Campaign-Funded Engineering, Maker-to-Node Pipeline, Character Progression Campaigns, X-Ray Patent Integration, Chain Backer Cross-Pollination, 14-Day Chain Timer, Kickstarter-to-LB Conversion Funnel.

5. **POLLINATION** — Innovation count 1,680 → **1,690** propagated across 23 files (49 replacements): 20 platform/src files + 3 Cephas content files.

### Innovations Filed (#1681-#1690)

| # | Innovation | Category |
|---|-----------|----------|
| 1681 | Chain Loyalty Engine | platform-economics |
| 1682 | Leap Frog Cadence | manufacturing |
| 1683 | Open IP Kickstarter Model | manufacturing |
| 1684 | Campaign-Funded Engineering | platform-economics |
| 1685 | Maker-to-Node Pipeline | manufacturing |
| 1686 | Character Progression Campaigns | ux-design |
| 1687 | X-Ray Patent Integration | ux-design |
| 1688 | Chain Backer Cross-Pollination | platform-economics |
| 1689 | 14-Day Chain Timer | ux-design |
| 1690 | Kickstarter-to-LB Conversion Funnel | platform-economics |

### Files Created/Changed (Session 29)

| File | Change |
|------|--------|
| `platform/src/data/xrayGlossary.ts` | Extended interface + faqAnchorId on 18 entries + 27 HexIsle entries |
| `platform/src/components/builder/XRayOverlay.tsx` | Render FAQ/STL/Improve/Innovation# links |
| `platform/src/lib/nervous-system/knowledgeBase.ts` | HexIsle FAQ chapter (30 entries) |
| `platform/src/pages/ChainDashboard.tsx` | **NEW** — Chain loyalty dashboard at /chain |
| `platform/src/pages/HexIsleDownloads.tsx` | **NEW** — STL library + tier classification at /hexisle/downloads |
| `platform/src/App.tsx` | Added ChainDashboard + HexIsleDownloads lazy imports + routes |
| `platform/supabase/migrations/20260317000002_*.sql` | **NEW** — 10 innovations + canonical count update |
| 23 platform/src + Cephas files | POLLINATION: 1,680 → 1,690 (49 replacements) |

### Migrations Pushed (Session 29)

- `20260317000002_innovation_log_session29_kickstarter_chain.sql` — Applied successfully to remote

### Deployment

- **Platform**: lianabanyan-main.web.app (599 files, 286 new)
- **Cephas**: cephas-lianabanyan.web.app (1410 files, 980 pages)

### Pending Work (Session 30+)

| Item | Status |
|------|--------|
| **Pledged Mark Voting** (`/hexisle/vote`) — Task 4 from Bishop Session 011 | **NEXT** |
| **Crew Call HexIsle Bounties** — 5 engineering bounties (Task 5) | **NEXT** |
| **HexIsle Cue Card** — "Know a Gamer? Know an Engineer?" (Task 6) | **NEXT** |
| **POLITICAL EXPEDITION FULL BUILD** — See Session 28 spec | **PRIORITY — Founder directive** |
| Founder files 8th provisional with USPTO | FOUNDER ACTION — PDF ready |
| Content Pipeline build | MEDIUM |
| Battery Dispatch — Grassroots Intelligence | MEDIUM |
| Treasure Key injection | MEDIUM |
| SEC language cleanup (broader pass) | MEDIUM |
| RLS security hardening | MEDIUM |

---

## Session 28 (March 17, 2026) — Previous

### What Was Done This Session (Session 28 — Knight)

1. **Feature 3: 8th Provisional Patent Application — Six Degrees Crown Jewel** — Extracted 18 innovations (#1663-#1680) from Bishop Session 010 transcripts (Claude Opus 4.6.021-024.docx). Converted 4 Bishop .docx files to .md. Six Degrees Universal Connection Engine designated Crown Jewel by Bishop ("the connective tissue that ties all 16 initiatives together"). Full patent-quality specifications written for all 18 innovations. PDF generated (PROVISIONAL_APPLICATION_8_SIX_DEGREES.pdf, 27.3 KB). Supabase migration pushed (20260317000001). Innovation count: 1,662 → **1,680**.

2. **Feature 1: Charity Card Phase 2 — CSS 3D Flip + SWEET_SIXTEEN Wiring** — Replaced conditional render (fade-in) with true CSS 3D flip animation (`perspective: 1200px`, `rotateY(180deg)`, `backface-visibility: hidden`). Eliminated hardcoded `INITIATIVE_DATA` and hardcoded pill arrays — now imports `SWEET_SIXTEEN` from `daisyChainLink.ts` as single source of truth. Added `emoji` field to the `Initiative` interface. Updated patent count from 7 to 8 on the "Built to Last" deck card. Initiative detail view now also shows `category` from SWEET_SIXTEEN.

3. **Feature 2: Browse Projects — Filterable Grid** — `Projects.tsx` at `/projects` now has: a search bar with real-time text filtering, a 16-initiative filter bar (pills from SWEET_SIXTEEN), URL-synced `?initiative=slug` query param, active filter summary with clear buttons, clickable initiative badges on project cards that cross-filter, and a "No Matching Projects" empty state with Clear Filters button. All data still comes from Supabase `projects` table — filters operate client-side on the `initiative_slug` column.

### Innovations Filed (#1663-#1680)

| # | Innovation | Category |
|---|-----------|----------|
| 1663 | **Six Degrees Universal Connection Engine** (CROWN JEWEL) | platform-economics |
| 1664 | Fractional Degree Bounty System | platform-economics |
| 1665 | Time-Decay Bounty Valuation | platform-economics |
| 1666 | Six Degrees of Opportunity (Job/Business Matching) | platform-economics |
| 1667 | Six Medical Degrees of Separation (Diagnostic Chains) | health-safety |
| 1668 | Double-Dipping and Stacking Reward Architecture | platform-economics |
| 1669 | Milestone-Based Bounty Progression | platform-economics |
| 1670 | Service Allocation Authority as Backer Return | platform-economics |
| 1671 | Connection XP (Social Capital Reputation) | reputation-identity |
| 1672 | Six-Scoop Ice Cream Cone Reward Visualization | ux-design |
| 1673 | Campaign Cooldown Rate Limiting | platform-economics |
| 1674 | Crowdfunded Social Capital Bounties | platform-economics |
| 1675 | Medical Treasure Map Diagnostic Trails | health-safety |
| 1676 | Zero-Demographic Architecture (Anti-Discrimination) | platform-economics |
| 1677 | Named Accessibility Preset System | ux-design |
| 1678 | Quad-Crown Bipartisan Proof Architecture | governance |
| 1679 | Mirror Mirror Triple-Meaning Interface | ux-design |
| 1680 | Crown Letter Votable Pedestals (Attention-as-Funding) | platform-economics |

### Files Created/Changed (Session 28)

| File | Change |
|------|--------|
| `BISHOP_DROPZONE/PROVISIONAL_ADDENDUM_1663_1680.md` | **NEW** — Full patent specs for 18 innovations |
| `BISHOP_DROPZONE/PROVISIONAL_APPLICATION_8_SIX_DEGREES.pdf` | **NEW** — USPTO-ready PDF |
| `BISHOP_DROPZONE/build_provisional_pdf_v3.py` | **NEW** — PDF generator for 8th provisional |
| `BISHOP_DROPZONE/Claude_Opus_4_6_021.md` | **NEW** — Converted from .docx |
| `BISHOP_DROPZONE/Claude_Opus_4_6_022.md` | **NEW** — Converted from .docx |
| `BISHOP_DROPZONE/Claude_Opus_4_6_023.md` | **NEW** — Converted from .docx |
| `BISHOP_DROPZONE/Claude_Opus_4_6_024.md` | **NEW** — Converted from .docx |
| `platform/supabase/migrations/20260317000001_*.sql` | **NEW** — 18 innovations + canonical count update |
| 20 platform/src files | POLLINATION: 1,662 → 1,680 (32 replacements) |
| 3 Cephas content files | Innovation count + 8th provisional in patent table |
| `platform/src/lib/daisyChainLink.ts` | Added `emoji` field to `Initiative` interface + all 16 entries |
| `platform/src/pages/Index.tsx` | Charity Card: CSS 3D flip, SWEET_SIXTEEN import, patent count 7→8 |
| `platform/src/pages/Projects.tsx` | Browse Projects: initiative filter bar, search, URL query sync |
| `platform/src/styles/landing.css` | `.charity-flip-container/inner/front/back` CSS 3D flip classes |

### Migrations Pushed (Session 28)

- `20260317000001_innovation_log_session28_six_degrees.sql` — Applied successfully to remote

### What Was Done This Session (Bishop Session 011)

1. **HexIsle Kickstarter Strategy (Rev 3 Final)** — `BISHOP_DROPZONE/KICKSTARTER_STRATEGY_HEXISLE_ROLLING_CAMPAIGNS.md`. Key Rev 3 changes:
   - Character progression lines: Peasant→Farmer→Warrior→King (Sword Path) and Merchant→Healer→Assassin→Queen (Crown Path) — each character evolves across 4 campaigns
   - Leap Frog cadence: Characters (ready NOW) alternate with components (need dev time). If a component needs more time, the next character launches instead. Cadence never breaks.
   - Open IP model: Each Hexel component gets its own mini-campaign with STL download. Community prints, experiments, submits improvements via Piggy-Back Protocol with tier classification. Best improvements become official products.
   - Hexels moved to end: Complete Hexel assembly is Campaign 12 (only after all pieces finalized by community + Founder). Individual known-good pieces (Golden Lotus, Sawtooth Coral) launch as standalone campaigns earlier.
   - Water Table stays capstone: Campaign 13, launches only when engineering is complete. Earlier campaigns fund the Crew Call bounties that pay the engineers.
   - Chain mechanic upfront: Backers see "Campaign 1 of 13 / Chain rewards grow" BEFORE first pledge.
   - CoLab/Zoo outreach APPROVED.

2. **Knight Prompts Written:**
   - `PROMPT_KNIGHT_SESSION_27.md` — Portal routing, production levels, DenkenMenu nav (DONE by Knight Session 27)
   - `PROMPT_KNIGHT_SESSION_29_KICKSTARTER_CHAIN.md` — Chain dashboard, HexIsle downloads, X-Ray→FAQ pipeline, Pledged Mark Voting, Crew Call bounties, HexIsle Cue Card

3. **10 Innovations to Thresh (Session 29):** Chain Loyalty Engine, Leap Frog Cadence, Open IP Kickstarter Model, Campaign-Funded Engineering, Maker-to-Node Pipeline, Character Progression Campaigns, X-Ray Patent Integration, Chain Backer Cross-Pollination, 14-Day Chain Timer, Kickstarter-to-LB Conversion Funnel

4. **X-Ray → FAQ Confirmation:** 67 glossary entries exist but are NOT linked to FAQ anchors yet. Need `faqAnchorId` field added + 27 HexIsle piece entries. Knight Session 29 task.

5. **Cephas Firebase Fix:** `the2ndsecond-trunk` → `cephas-lianabanyan` corrected and redeployed. Cephas = knowledge repository, The2ndSecond = Makers' trunk.

### Pending Work (Session 29+)

| Item | Status |
|------|--------|
| **Knight Session 29 Prompt** — `PROMPT_KNIGHT_SESSION_29_KICKSTARTER_CHAIN.md` | **NEXT** |
| Thresh 10 innovations from Bishop Session 011 (Chain Loyalty Engine, Leap Frog Cadence, etc.) | **NEXT (Session 29)** |
| X-Ray→FAQ pipeline: add `faqAnchorId` to 67 glossary entries + 27 HexIsle piece entries | **NEXT (Session 29)** |
| **Founder files 8th provisional with USPTO** | FOUNDER ACTION — PDF ready at `BISHOP_DROPZONE/PROVISIONAL_APPLICATION_8_SIX_DEGREES.pdf` |
| Charity Card Phase 2 — CSS 3D flip + SWEET_SIXTEEN wiring | **DONE (Session 28)** |
| Browse Projects — filterable grid with initiative/search filters at /projects | **DONE (Session 28)** |
| Deploy platform + Cephas | **DONE** — Platform deployed to `lianabanyan-main`. Cephas deployed to `cephas-lianabanyan` (FIXED: was incorrectly targeting `the2ndsecond-trunk` since Session 22) |
| Fix Cephas firebase.json site target | **DONE** — `the2ndsecond-trunk` → `cephas-lianabanyan` (bug since commit 89d9b27, March 15) |
| **POLITICAL EXPEDITION FULL BUILD** — See detailed spec below | **PRIORITY — Founder directive** |
| Arena visualization on Power to the People | ASK FOUNDER |
| Accessibility presets (Mirror Mirror panel) | Deferred |
| X-Ray Goggles deep interconnection mode | Deferred |
| Six Degrees voting system implementation | Deferred |
| Profile Preview (Mirror Mirror View) | Deferred |
| Fairness Dashboard | Deferred |

### FOUNDER DIRECTIVE: Political Expedition / Power to the People — Full Build Spec

**Context (Session 28):** Founder wants the Political Expedition fully operational — not just philosophy, but all the working parts that make it real. This is the only initiative without a finalized crown assignment, and it has the most complex operational requirements. The Quad-Crown structure (AOC/Schwarzenegger/Keanu/Sandra Bullock) is designed but the PLATFORM TOOLS need to be built and wired.

**What exists today (already built):**
- `PowerToThePeoplePage.tsx` — Philosophy section (Ella Wheeler Wilcox poem, Switzerland Protocol, Quad-Crown sidebar) + operational tabs (Representatives, Tracked Bills, Take Action) merged in Session 26
- Four Crown Letters drafted in `BISHOP_DROPZONE/` (AOC, Schwarzenegger, Keanu, Sandra Bullock)
- Six Degrees system documented and innovations filed (#1663-#1680)
- Votable Pedestals concept (#1680) — Crown Letters on public display with SWOOP voting

**What needs to be built (Founder's full vision):**

1. **Political Expedition Gateway Page** — Entry point explaining what this initiative IS and HOW it works. Not philosophy — the actual mechanics: we track elected officials' votes, we have a listening rule, we connect citizens to their representatives, we make political engagement cooperative instead of adversarial.

2. **Power to the People Pedestal** — The initiative described on a public Innovation Pedestal (like the Cephas pedestals) with three reading levels (glance/more/full). This is the public face that anyone — including Crown Letter recipients — sees.

3. **FAQ Entries** — X-Ray Goggles and FAQ must explain:
   - What the Listening Rule is (listen before you legislate — track what representatives actually DO, not what they SAY)
   - How vote tracking works (alignment scores, YES/NO badges, color-coded)
   - What the Quad-Crown structure means and why it exists
   - How Six Degrees campaigns work for reaching the four Crown recipients
   - How the Switzerland Protocol works (different tribes, shared infrastructure)
   - Why "Not Left, Not Right — Forward Together" is the operating principle

4. **Vote Tracking System** — The operational core: track elected officials' voting records, compute alignment scores against cooperative values, display with color-coded cards. Already partially built in Session 26 (sample rep cards with alignment scores in the Representatives tab).

5. **Listening Rule Implementation** — Members can see what their representatives ACTUALLY voted for, not just what they campaigned on. This is transparency as a service.

6. **All parts working together** — Gateway → Pedestal → FAQ → Vote Tracking → Listening Rule → Six Degrees bounty campaigns → Crown Letter Votable Pedestals → Take Action panel. Every piece connects.

**CRITICAL FOUNDER NOTE (Session 28):**
> "Those campaigns are completely contingent on me getting other people to take charge of LB and all its parts and pieces. I cannot possibly focus on the campaigns if I'm also running each of all the things I am doing now."

This means: The Six Degrees bounty campaigns to reach AOC/Arnold/Keanu/Sandra CANNOT launch until the Founder has delegated operational control of LB's day-to-day. The platform tools must be built NOW so they're ready when delegation happens, but the campaigns themselves are gated on organizational readiness.

**AOC Analysis (Session 28):**
The Founder asked whether AOC (as an elected official) would be willing to participate in a platform that tracks elected officials' votes. The Quad-Crown architecture HELPS — she's one of four, paired with Schwarzenegger (opposite side), making it structurally bipartisan. Vote-tracking transparency is something AOC has publicly advocated for. The risk is bandwidth, not ideology — which is why the Delegation Protocol (#1660) exists: she can delegate to staff or accept at an advisory level.

**FOUNDER STRATEGY CHANGE (Session 28): SEND ALL CROWN LETTERS AT ONCE**

> "There's no time to let the blood dry. We're hitting the ground running. And building in public."

The Founder's directive is to send ALL crown letters simultaneously — not drip them out over weeks. Every letter goes at once. The rationale:
- Building in public means showing intent, not hiding strategy
- If recipients find out before and want to engage, great — the pedestals are already live
- The simultaneous launch prevents any single letter from being mischaracterized in isolation
- The Quad-Crown political pair (AOC + Arnold) goes together as part of the full wave

**This means ALL of the following must be ready before launch:**
- All Crown Letters displayed on Votable Pedestals (public, visible, even before sending)
- Cephas pages for every Crown Letter recipient
- Press Junket entries for every letter
- Six Degrees bounty campaigns pre-configured (activate after letters send)
- FAQ entries explaining the full Political Expedition system
- The "turn the key" infrastructure described below

**"TURN THE KEY" READINESS — Political Expedition Detail Page**

The Founder wants the PowerToThePeoplePage (or a dedicated Political Expedition gateway) to present the FULL operational vision with explanations and examples, so that when someone takes charge, everything is laid out:

1. **Fully-built vote tracker** — Track elected officials, alignment scores, YES/NO badges (already partially built in Session 26 tabs)
2. **Quad-Crown framework** — Four crowns explained with examples (AOC Left, Arnold Right, Keanu Culture, Sandra Action)
3. **Four Crown Letters ready to send** — Displayed on pedestals even BEFORE sending. The letters ARE the pitch. Show them publicly. Let the community see what we're doing.
4. **Six Degrees bounty system** — Pre-configured campaigns for each Crown recipient, ready to activate
5. **FAQ explaining every piece** — Listening Rule, vote tracking, Switzerland Protocol, "Not Left Not Right — Forward Together"

**Crown Letters on Pedestals BEFORE Sending:**
The Founder explicitly wants the crown letters displayed on Innovation Pedestals NOW — not after they're sent. This preps the community, shows intent, builds anticipation, and means if anyone in the community has a connection to a recipient, they can start working the Six Degrees chain organically before the formal bounty launches.

**Delegation Gate Remains:**
All Six Degrees bounty campaigns are gated on the Founder delegating operational control. The tools get built. The letters go on pedestals. The FAQ gets written. But the bounty campaigns activate only when someone other than the Founder is running the day-to-day.

**POLLINATION NOTE:** The innovation count is now **1,680** (18 new from Session 28). All platform files updated. Cephas updated. DB canonical value updated. 8th provisional PDF ready for USPTO filing.

---

## Session 27 (March 17, 2026) — Previous

**Commit:** `9bc090f` — Session 27: Action-first Portal, production level Pledge buttons, DenkenMenu nav wiring

### What Was Done (Session 27 — Knight, Bishop-Managed)

Bishop managed this session via `PROMPT_KNIGHT_SESSION_27.md`. Three features per 3-feature cap.

1. **Feature 1: Portal Routing Hub (Action-First)** — `PortalGateway.tsx` rebuilt from scratch. Dark gradient theme. 4 primary action cards: Earn Money → /treasure-map, Build a Business → /build-a-business, Back a Project → /plant-seeds, Sponsor a Member → /sponsor. 4 secondary quick-link buttons: Browse Projects → /projects, Create Project → /create, Join a Guild → /guilds, Bounty Board → /bounties. No explanation cards in default view — every card is a door. Founder directive: "I want to DO IT, not read about it."

2. **Feature 2: Production Level Pledge Buttons** — `BuildBusiness.tsx` production level cards now have "Pledge" buttons (Sprout icon) routing to /plant-seeds. Risk/credit tier detail text hidden by default, only visible in X-Ray Goggles mode. "Key Insight" explainer box also X-Ray-only. Uses `useBuilderMode()` for conditional rendering.

3. **Feature 3: DenkenMenu Nav + Breadcrumbs** — `DenkenMenu.tsx` expanded from 2 items (Crow's Nest, X-Ray) to 5 items: Portal, Plant Seeds, Build a Business, Crow's Nest, X-Ray Goggles. Both `PlantSeeds.tsx` and `BuildBusiness.tsx` now have breadcrumb nav (Portal → Page Name) at top.

### Files Changed (Session 27)

| File | Change |
|------|--------|
| `platform/src/pages/PortalGateway.tsx` | Rebuilt: action-first hub with dark theme, 4 primary + 4 secondary action cards |
| `platform/src/pages/BuildBusiness.tsx` | Added Pledge buttons to production levels, X-Ray conditional tier details, breadcrumb |
| `platform/src/pages/PlantSeeds.tsx` | Added breadcrumb nav (Portal → Plant Seeds) |
| `platform/src/components/builder/DenkenMenu.tsx` | Added Portal, Plant Seeds, Build a Business nav items (2→5 items) |

### Migrations Pushed (Session 27)

None — no database changes this session.

### Pending Work (Session 27+)

| Item | Status |
|------|--------|
| Charity Card Phase 2 — wire `daisyChainLink.ts`, CSS 3D flip, real taglines from `SWEET_SIXTEEN_CANONICAL.md` | **NEXT (Task 4 from Bishop Session 011)** |
| Browse Projects page — filterable grid with mock data at `/projects` or new page | **NEXT (Task 5 from Bishop Session 011)** |
| Arena visualization on Power to the People | ASK FOUNDER |
| Accessibility presets (Mirror Mirror panel) | Deferred |
| X-Ray Goggles deep interconnection mode | Deferred |
| Six Degrees voting system | Deferred |
| Profile Preview (Mirror Mirror View) | Deferred |
| Fairness Dashboard | Deferred |

---

## Session 26 (March 16, 2026) — Previous

**Commit:** `b7908fa` — Session 26: Pnyx merge, WhyNoAds/VC pages, Chalk Outline wiring, X-Ray FAQ additions

### What Was Done (Session 26 — Knight, Bishop-Managed)

Bishop managed this session via `PROMPT_KNIGHT_SESSION_26_ADDENDUM.md`. Three features + FAQ, exactly as directed.

1. **Feature 1: Political Expedition Merge into PowerToThePeoplePage** — Merged operational tools from old `escape-velocity PoliticalExpeditionPage.tsx` into `PowerToThePeoplePage.tsx`. Existing philosophy section (Ella Wheeler Wilcox poem, Switzerland Protocol, Quad-Crown sidebar, Council of Crowns nomination) preserved intact. Added tabbed section below with three tabs:
   - **Representatives tab**: Sample rep cards with vote alignment scores (color-coded), YES/NO vote badges with aligned/misaligned icons, ZIP code lookup input, Full Record + Contact buttons
   - **Tracked Bills tab**: 3 tracked bills with bill number badges, relevance priority badges, status, sponsor/cosponsor counts, Track This Bill button
   - **Take Action tab**: Contact Your Rep, Register to Vote, Join the Pnyx action cards + motivational quote footer
   - **Arena visualization**: Skipped per Bishop directive ("ASK FOUNDER before placing Arena")
   - Sample Data badge displayed prominently

2. **Feature 2: WhyNoAds + WhyNoVC Philosophy Pages** — Created two new pages ported from old codebase:
   - `WhyNoAds.tsx` — Ad-Funded Trap analysis, Herald System alternative, growth budget economics ($100K comparison showing $0 to members vs $100K to members), viral vs paid growth statistics, Vanguard Effect, What This Means For YOU section
   - `WhyNoVC.tsx` — VC Strings analysis, Patent-Backed Bootstrap (**corrected**: 7 provisional applications with 1,662 documented innovations), organic growth projections table (Year 1-10), Seed→Forest organic growth path visualization, What This Means For YOU section
   - Both wired as public routes: `/why-no-ads` and `/why-no-vc`
   - Cross-links to `/herald`, `/the-300`, `/fly-on-the-wall`, and each other

3. **Feature 3: Chalk Outline Onboarding Wiring** — Wired existing `ChalkOutlineOnboarding.tsx` component (573 lines, already built with Lock/Unlock, progress bar, Launch button, preview toggle, two field templates) to a live route:
   - `CreateProject.tsx` page: reads `?invite=CREATOR_ID` from URL, fetches invite from Supabase `creator_invites`, pre-fills creator name/handle, renders `ChalkOutlineOnboarding` with `CREATOR_INVITE_FIELDS` template, `onSave` persists to `project_drafts`, `onLaunch` creates `products` entry with status `live` and links back to invite
   - Migration `20260316000002_creator_invites.sql`: `creator_invites` table (uuid PK, creator_handle, invite_code unique, status, project_id nullable FK) + `project_drafts` table (text PK, invite_id FK, field_data JSONB, progress_percent, updated_at) + RLS policies
   - Public `/create` route (no auth required — creators can start before signing up)

4. **FAQ / X-Ray Glossary Additions** — 6 new entries added to `xrayGlossary.ts`:
   - `six-degrees`: Universal connection engine (Outreach/Medical/Opportunity domains, referral chains, bounty campaigns)
   - `chalk-outline-onboarding`: Coloring-book project creation UX, progress bar, lock/unlock, preview
   - `double-dipping-stacking`: Ice cream cone reward stacking philosophy
   - `star-chamber`: Multi-AI governance (7 agents, 5/7 consensus, dissenting opinions published)
   - `life-compass`: Personal goal tracking with personality-matched recommendations
   - `why-no-ads-vc`: Philosophy pages explaining no-ad/no-VC funding model

### Files Changed (Session 26)

| File | Change |
|------|--------|
| `platform/src/pages/PowerToThePeoplePage.tsx` | Merged Pnyx operational tools (Reps/Bills/Actions tabs) below philosophy section |
| `platform/src/pages/WhyNoAds.tsx` | **NEW** — Why No Ads philosophy page |
| `platform/src/pages/WhyNoVC.tsx` | **NEW** — Why No VC philosophy page (corrected patent numbers) |
| `platform/src/pages/CreateProject.tsx` | Rewired as Chalk Outline route handler for `/create?invite=` |
| `platform/src/App.tsx` | Added lazy imports for WhyNoAds/WhyNoVC + routes `/why-no-ads`, `/why-no-vc`, `/create` |
| `platform/src/components/ChalkOutlineOnboarding.tsx` | Tracked (already existed, now committed) |
| `platform/src/data/xrayGlossary.ts` | Added 6 new FAQ entries (Six Degrees, Chalk Outline, Double-Dipping, Star Chamber, LifeCompass, WhyNoAds/VC) |
| `platform/supabase/migrations/20260316000002_creator_invites.sql` | **NEW** — creator_invites + project_drafts tables + RLS |

### Migrations Pushed (Session 26)

- `20260316000002_creator_invites.sql` — Applied successfully to remote

### Deployment

- **Build**: Vite build succeeded (37.2s, 588 files)
- **Firebase**: Deployed to `lianabanyan-main.web.app` (284 new files uploaded)
- **Commit**: `b7908fa` on main

### Pending Work (Session 27+)

| Item | Status |
|------|--------|
| Arena visualization placement on Power to the People | **ASK FOUNDER** — Bishop says get approval before adding |
| Accessibility presets (Mirror Mirror panel) | Deferred per Bishop |
| X-Ray Goggles deep interconnection mode | Deferred per Bishop |
| Six Degrees voting system implementation | Deferred per Bishop |
| Profile Preview ("Mirror Mirror View") | Deferred per Bishop |
| Fairness Dashboard | Deferred per Bishop |
| The 300 dedicated page (update Canada Visa Crisis section) | Backlog |
| Star Chamber 7-agent UI | Backlog |
| Santa Evermore → Let's Go Shopping full build | Backlog (scoping only) |
| Boaz Principle visualization | Backlog |
| Castle/12-Door hub (confirm dashboard nav with Founder) | Backlog |
| Alexandrian Library | Backlog |
| Letter Observatory | Backlog |
| Fleet Formation | Backlog |
| LifeCompass (approved for merge) | Backlog |
| TheBattery → dispatch-executor wiring | Deferred |
| Medium Integration Token (Founder action) | Blocked |
| LINKEDIN_ACCESS_TOKEN / X_BEARER_TOKEN setup (Founder action) | Blocked |

---

## RUNWAY / SESSION STOP (previous) — Session 25 (March 15, 2026)

**Latest commit:** `40e4003` — Session 25: dispatch queue seeded, landing page restored, golden key pipeline

### What Was Done This Session (Session 25 — Knight)

1. **Dispatch Queue Seeded** — 18 new articles seeded into `outbound_dispatch` (5 tiers: open letters, op-eds, bot defense, platform mechanics, academic papers). Migration `20260315000006` adds `content_type`, `content_path`, `metadata JSONB` columns to table. 21 total items in queue (18 new + 3 existing).
2. **UniversalDispatch Copy-to-Clipboard** — "Copy for Manual" button added with per-channel text formatting (title, first paragraph, URL, hashtags). Fallback for channels without API tokens (Medium, LinkedIn, X).
3. **Cue Card Auto-Generation** — On dispatch, auto-inserts into `hofund_cue_cards` with title, hook, QR URL, golden key hint.
4. **Golden Key Pipeline** — `registerDispatchKeys()` function in `treasureKeyEmbed.ts` reads dispatch metadata JSONB and auto-registers golden keys in `treasure_keys` table. `dispatch-executor` edge function wired to call this after successful dispatch + update `key_registered: true` in metadata.
5. **Quiz System** — Migration `20260315000007` adds `title`, `source_path`, `dispatch_id`, `questions_per_attempt`, `self_attest_marks` columns to `paper_quizzes`. Scott quiz: 8 questions seeded. Buffett quiz: 8 questions seeded. Config: 5 random per attempt, 2 Marks each, max 3 attempts, self-attest path 10 Marks.
6. **Landing Page Restoration** (Founder-approved):
   - WelcomeGate: first-visit-only (`lb_visit_count === 0`), Fable-only (tabs 2+3 removed), dismisses permanently.
   - Index.tsx: unauthenticated visitors now see `PublicLandingView` directly (HEOHO + Hero flip + Fable + keyhole).
   - Hero card flip re-enabled (professional mode guard removed).
   - PortalGatewayPage: now behind `ProtectedRoute` (authenticated-only).
7. **Deployed** — lianabanyan.com (569 files), dispatch-executor edge function redeployed.
8. **Committed + pushed** — `40e4003` on main.

### Files Changed (Session 25)

| File | Change |
|------|--------|
| `platform/src/pages/Index.tsx` | Unauthenticated → PublicLandingView; hero flip guard removed |
| `platform/src/components/WelcomeGate.tsx` | First-visit Fable-only; tabs 2+3 removed; dismiss → `/` not `/portal` |
| `platform/src/lib/welcomeGateContent.ts` | `shouldShowWelcomeGate()` checks `lb_visit_count > 0` → skip |
| `platform/src/App.tsx` | PortalGateway routes wrapped in ProtectedRoute |
| `platform/src/components/UniversalDispatch.tsx` | Copy-to-Clipboard button + cue card auto-gen + toast |
| `platform/src/lib/treasureKeyEmbed.ts` | `registerDispatchKeys()` function + dispatch key metadata types |
| `platform/supabase/functions/dispatch-executor/index.ts` | Golden key registration after dispatch |
| `platform/supabase/migrations/20260315000006_dispatch_columns_and_seed.sql` | 18 article seed + metadata columns |
| `platform/supabase/migrations/20260315000007_quiz_tables_and_seed.sql` | Quiz tables + 16 questions (Scott + Buffett) |

### Pending Work (Session 26+)

| Item | Status |
|------|--------|
| TheBattery → dispatch-executor wiring | Deferred |
| Bluesky/Threads API integration in process-scheduled-posts | Deferred |
| Admin approval UI for print orders | Deferred |
| Moo API integration (waiting on Business Services team) | Blocked |
| Full SESSION_7E_LAUNCH_QUEUE migration to DB (13 items) | Deferred |
| Content Pipeline → Outbound Dispatch auto-linking | Deferred |
| Medium Integration Token (Founder action) | Blocked |
| LINKEDIN_ACCESS_TOKEN / X_BEARER_TOKEN setup (Founder action) | Blocked |

---

## Session 24 (March 15, 2026)

**Commit:** `6127a12` — Session 24: Dispatch pipeline, print order service, canonical stats migration

### What Was Done This Session (Session 24 — Knight)

1. **dispatch-executor edge function** — Central dispatch router: email (via outreach template), Medium, social (Twitter/LinkedIn/Facebook/Bluesky/Threads via scheduled_posts), Cephas flagging. Updates outbound_dispatch status on completion.
2. **medium-publish edge function** — Medium API integration with markdown content format, auto-draft, tag support. Awaits `MEDIUM_INTEGRATION_TOKEN` Supabase secret from Founder.
3. **UniversalDispatch.tsx wired** — `handleDispatch()` now calls `dispatch-executor` edge function for each selected target channel. No more dead callback pattern.
4. **outbound_dispatch DB table** — Migration `20260315000005` creates persistent dispatch queue with full approval workflow columns. 3 seed items: Dead Internet article (Medium), Moo outreach (email), Coins For Anything outreach (email). RLS for authenticated read + admin full control.
5. **outboundDispatch.ts rewired to DB** — All helper functions (createOutboundDraft, submitForReview, stampItem, queueForDispatch, markDispatched, recordResponse, requestRevision) now async DB-backed operations via Supabase. Added `insertOutboundDraft()`, `getAllDispatchItems()`. SESSION_7E_LAUNCH_QUEUE retained as in-memory seed data for backward compat.
6. **printOrderService.ts** — Full CRUD: `createPrintOrder` (pending_approval), `approvePrintOrder` (creates Printful draft), `confirmPrintfulOrder` (sends to production), `getPendingOrders`. Two-step Founder approval pattern preserved.
7. **printful-api: confirm_order action** — Added `POST /orders/{id}/confirm` routing to edge function. Redeployed.
8. **useCanonicalStats() migration** — 4 priority components now pull live numbers from `platform_canonical`: HallOfInnovations (innovation count, claims, applications, Crown Jewels), ProfessionalLanding (innovation count), DevelopmentBadge (innovations + claims), PlatformFooter (claims + innovations).
9. **Both sites deployed** — lianabanyan.com (274 files updated) + cephas.lianabanyan.com (964 pages)
10. **Migration pushed** — `20260315000005_outbound_dispatch_table.sql` applied to remote

### Files Changed (Platform)

- `src/components/UniversalDispatch.tsx` — Wired to dispatch-executor edge function
- `src/components/DevelopmentBadge.tsx` — useCanonicalStats() migration
- `src/components/PlatformFooter.tsx` — useCanonicalStats() migration
- `src/components/ProfessionalLanding.tsx` — useCanonicalStats() migration
- `src/pages/HallOfInnovations.tsx` — useCanonicalStats() migration (4 stats)
- `src/lib/outboundDispatch.ts` — Rewired from in-memory to DB-backed
- `src/lib/services/printOrderService.ts` — NEW (Printful order lifecycle)
- `supabase/functions/dispatch-executor/index.ts` — NEW (central dispatch router)
- `supabase/functions/medium-publish/index.ts` — NEW (Medium API)
- `supabase/functions/printful-api/index.ts` — Added confirm_order action
- `supabase/migrations/20260315000005_outbound_dispatch_table.sql` — NEW

### Edge Functions Now Deployed on Supabase

| Function | Purpose | Status |
|----------|---------|--------|
| `dispatch-executor` | Central dispatch router (email/medium/social/cephas) | LIVE |
| `medium-publish` | Medium API publishing | LIVE (awaits token) |
| `ipfs-pin` | Real IPFS pinning via Pinata | LIVE |
| `printful-api` | Merch catalog, estimates, orders, confirm | LIVE |
| `send-transactional-email` | 6 email types (incl. outreach) | LIVE |

---

## RUNWAY / SESSION STOP (previous) — Session 23 (March 15, 2026)

**Latest commit:** `dfde988` — Session 23: Live IPFS (Pinata), Printful API, outreach email, Hugo canonical pipeline

### What Was Done This Session (Session 23 — Knight)

1. **Supabase secrets set** — PINATA_API_KEY, PINATA_SECRET_KEY, PRINTFUL_API_TOKEN pushed to project ruuxzilgmuwddcofqecc
2. **IPFS edge function (ipfs-pin)** — Real Pinata pinning via `pinJSONToIPFS`. Tested and verified: CID `QmWw8LW742nzQJgMeDTrsW9vVJa3Y6DaAGENLLPQAjDNRQ` resolves on gateway. Mock mode is dead.
3. **ipfsService.ts rewired** — Replaced direct Pinata client call + mock fallback with Edge Function routing via `supabase.functions.invoke('ipfs-pin')`. Graceful fallback to mock only if edge function is unreachable (dev/offline).
4. **Printful API edge function (printful-api)** — Product catalog browse, pricing estimates, draft/confirmed order creation. Tested: returns code 200 from live API.
5. **Outreach email type** — Added `outreach` case to `send-transactional-email` edge function with Georgia-serif template, CTA button, cue card attribution, and platform footer. Deployed.
6. **Hugo canonical data pipeline** — `Cephas/cephas-hugo/scripts/fetch-canonical.js` pulls all 14 rows from `platform_canonical` table at build time, writes `data/canonical.json`. Hugo templates can use `{{ .Site.Data.canonical.innovation_count }}`. Tested: 14 rows fetched live.
7. **platform_metrics.json updated** — Replaced stale v1 data (984 innovations, 210 claims) with current v2 (1,662 innovations, 1,336 claims, 7 provisionals, $630K valuation).
8. **BEHEMOTH REBORN valuation page** — Already created in Session 22, now deployed and live on Cephas at `/patents/behemoth-reborn/`.
9. **Both sites deployed** — lianabanyan.com (566 files) + the2ndsecond.com (964 pages, 1387 files)
10. **All 3 edge functions deployed** — ipfs-pin, printful-api, send-transactional-email (updated)
11. **Git pushed** — Commit `dfde988` pushed to remote

### Files Changed (Platform)

- `src/lib/ipfsService.ts` — Replaced mock/direct Pinata with Edge Function routing
- `supabase/functions/ipfs-pin/index.ts` — NEW (Pinata IPFS pinning)
- `supabase/functions/printful-api/index.ts` — NEW (Printful catalog/order API)
- `supabase/functions/send-transactional-email/index.ts` — Added outreach email type + template

### Files Changed (Cephas)

- `scripts/fetch-canonical.js` — NEW (build-time Supabase → Hugo data pipeline)
- `data/canonical.json` — NEW (live canonical data, 14 rows)
- `data/platform_metrics.json` — Updated from v1 (stale) to v2 (current)
- `content/patents/_index.md` — Minor (already had BEHEMOTH link from Session 22)

### Edge Functions Now Deployed on Supabase

| Function | Purpose | Status |
|----------|---------|--------|
| `ipfs-pin` | Real IPFS pinning via Pinata | LIVE ✓ |
| `printful-api` | Merch catalog, estimates, orders | LIVE ✓ |
| `send-transactional-email` | 6 email types (welcome, pledge, credit, cancel, milestone, outreach) | LIVE ✓ |

---

## RUNWAY / SESSION STOP (previous) — Session 22 (March 15, 2026)

**Latest commit:** `a9e24fe` — Session 22 addendum: Print pipeline refinement + Dead Internet Defense article

### What Was Done This Session (Session 22 — Knight)

1. **Stale value corrections** — Updated "6 provisional" → "7 provisional" across 12 platform source files + 2 Cephas content files. Updated "1,200+" → "1,662" in redCarpetRecipients. Updated "1,594/1,623" → "1,662" in platformBlueprint. Added 7th application (64/006,010) to Cephas patents table.
2. **Canonical DB propagation** — Created `platform_canonical` table with 14 seed values (single source of truth for all critical numbers). Created `useCanonicalStats()` React hook with 5-minute cache, typed defaults, and DB fallback.
3. **QR → Innovation linkage** — `pedestal_innovations` junction table, `pedestal_innovation_history` (immutable ledger), `portfolio_qr_codes` for brand/pedestal/ledger/initiative/bag QR routing.
4. **Medallion → Innovation FK** — `medallion_innovations` junction table with `seed_medallion_innovations()` trigger (auto-populates 123 Crown Jewels on medallion mint).
5. **Print pipeline schema** — `print_orders` and `print_batches` tables with volume discount aggregation, status tracking (draft → delivered), batch thresholds.
6. **IP Portfolio page** — `IPPortfolioPage.tsx` — unified QR-routed page with overview, ledger, and bag views. Context-sensitive display based on QR code prefix (PQR-, BAG-, PED-, INIT-, LEDGER).
7. **Hofund channel 5** — IP Portfolio channel added for all existing users.
8. **Migration pushed** — `20260315000003_canonical_qr_medallion_portfolio.sql` pushed to Supabase remote. All tables created.
9. **Both sites deployed** — lianabanyan.com (276 new files) + the2ndsecond.com (2 updated files). Both LIVE.
10. **Print pipeline refinement** — Three-vendor model (Moo/Printful/Challenge Coin), Founder approval gate, `print_production_levels` table with real vendor pricing (5 products seeded), expanded order types and statuses, Credits payment tracking, Crew Call local producer claiming.
11. **Dead Internet Defense article** — Ingested to `Cephas/cephas-hugo/content/articles/dead-internet-defense.md`. Deployed to the2ndsecond.com (957 pages, up from 948).
12. **Migration `20260315000004`** pushed — print pipeline refinement applied to remote.

### Files Changed (Platform)

- `src/lib/platformBlueprint.ts` — 3 stale value fixes
- `src/lib/guildSystem.ts` — 6→7 provisionals
- `src/lib/ipfsService.ts` — 6→7 provisionals
- `src/lib/alcoveSystem.ts` — 6→7 provisionals
- `src/lib/guildHandshakeProtocol.ts` — 6→7 provisionals + 1,540→1,662
- `src/lib/nervous-system/platformMetrics.ts` — already correct (1662)
- `src/lib/nervous-system/index.ts` — already correct (7, 123)
- `src/data/redCarpetRecipients.ts` — 6→7 (5 instances) + 1,200+→1,662 (5 instances)
- `src/data/crowsNestItems.ts` — 3 stale references fixed
- `src/pages/LBInternalPositions.tsx` — 6→7 provisionals
- `src/components/ShowMeHelp.tsx` — 6→7 provisionals
- `src/hooks/useCanonicalStats.ts` — NEW (canonical stats hook)
- `src/pages/IPPortfolioPage.tsx` — NEW (unified QR-routed IP portfolio)
- `src/App.tsx` — Added IPPortfolioPage route
- `supabase/migrations/20260315000003_canonical_qr_medallion_portfolio.sql` — NEW

### Files Changed (Cephas)

- `content/patents/_index.md` — 6→7 provisionals, added 7th application row
- `content/innovations/_index.md` — 6→7 provisionals (4 instances)

---

## RUNWAY / SESSION STOP (previous) — Session 21 (March 15, 2026)

**Latest commit:** `5f0fd6d` — Fix build: supabaseClient import, operator precedence, Hugo shortcode stubs

### What Was Done This Session (Session 21 — Knight)

1. **SEC cleanup committed** — Bishop committed 13 SEC files as `2f80abc` in prior session
2. **2 new migrations committed** (`8ed58b3`) — skeleton fill #1573-#1594 + creator share fix
3. **3 Supabase migrations pushed to remote** — `20260314000021` (creator share), `20260315000001` (568 spec expansions), `20260315000002` (22 skeleton fills). All prior migrations already pushed.
4. **Cephas Crown Jewels 123 page** — `Cephas/cephas-hugo/content/innovations/crown-jewels.md` — definitive list of all 123 flagship innovations across 7 provisional applications, categorized by filing bag
5. **Cephas Prior Art Research page** — `Cephas/cephas-hugo/content/patents/prior-art-research.md` — 16 innovations screened, all found structurally novel or defensibly distinct
6. **Cephas innovations _index.md updated** — 1,662 innovations, 1,336 claims, 7 provisionals (was 90+/380+/3)
7. **Cephas patents _index.md updated** — Full filing table with all 7 applications
8. **Build fixes** — `CephasInnovationPedestalsPage.tsx` import path, `DelegationResponseButtons.tsx` operator precedence
9. **Hugo shortcode stubs** — `related-innovations`, `vote-to-elevate`, `alert`, `dead-end`
10. **Both sites built** — Cephas (948 pages), Platform (38.38s, zero errors)
11. **Firebase deployed** — both lianabanyan.com and the2ndsecond.com LIVE
12. **Provisional PDF rebuilt** with embedded fonts (653 innovations, 615.9 KB)
13. **7th provisional FILED** — Application 64/006,010, March 15, 2026, 2:13 AM ET
14. **Filing documents archived** to `Asteroid-ProofVault/03_PATENT_BAGS/2026/15 Mar 2026 - Application 64006010/`
15. **Git pushed** to remote (all commits through `adc17b7`)

### Commits This Session (Session 21)

```
5f0fd6d Fix build: supabaseClient import path, operator precedence, Hugo shortcode stubs
32b5081 Cephas: Crown Jewels 123 registry, prior art research, updated innovation/patent indexes
8ed58b3 Add skeleton fill migration (#1573-#1594) and creator share fix migration
2f80abc SEC cleanup: remove EIN/Wyoming from footer, fix SEC-sensitive language across 13 files
```

---

## RUNWAY / SESSION STOP (previous) — Session 20+ (March 13–14, 2026)

**Latest commit:** `b3d196f` — Session 20+: Spec expansion harvest — 568 innovation descriptions + Cephas Innovation Pedestals

### What Was Done This Mega-Session (Sessions 12–20+)

**Session 12:** BandWagon taste-prediction influence system — TasteRangerDashboard, ProjectBackingFlow, FantasyBridge, positive-only QA. Threshed 8 BandWagon innovations (#1615-#1622).

**Session 13:** Wired BandWagon, LMD reviews, cue cards into nav. Steward schema + Ghost flow audit. Threshed Steward + Pizza Oven innovations (#1623-#1630).

**Session 14:** Steward dashboard, Proposals listing, Pledge flow. Deploy prep.

**Session 15:** Creator Draft Pick system, Pitch Page, referral tiers, showcase.

**Session 16:** LB-native Creator Showcase, Crew Call, modular manufacturing system.

**Session 17:** Delegation protocol (Vouched By), XP scoring, trickle onboarding, STAMP verification. **POLLINATION** run — innovation count propagated to **1,662** across all platform files.

**Session 18:** XP aggregation trigger, product/production XP paths, box notation display, preorder lock badge.

**Session 19:** Cephas content registry (Migration 000020), ingestion script, Under the Hood, Fly on the Wall, Cephas Gateway, pudding/academic component scaffolds.

**Session 20:** Launch runway QA — Cephas category listing/detail pages, full-text search page, Press Junket, SEC language fixes, innovation count 1,662.

**Session 20+:** Spec expansion harvest — `parse_spec_expansions.cjs` parsed Bishop spec expansion batches, generated SQL migration (`20260315000001_innovation_log_spec_expansion.sql`) with **568 UPDATE statements** enriching descriptions for innovations #1001-#1572. Built `InnovationPedestal` component (three reading levels: glance/more/full) and `CephasInnovationPedestalsPage`. Built `ingest_spec_pedestals.cjs` for Cephas registry population.

**This session also completed:**
- Pushed **8 Supabase migrations** to remote database (required extensive troubleshooting — repair migration for 26 discourse tables, table name fixes, missing columns, unique constraints)
- Successfully pushed migrations through `20260308000014_innovation_log_cad_tools.sql` (innovations through #1540 in DB)
- SEC language cleanup on multiple files (EIN/Wyoming removal from footers, terminology fixes)
- Founders Journal .docx files analyzed — contain early business strategy (v33-v36), not innovation definitions
- Confirmed #1595-#1599 already defined; #1573-#1594 titles derived from MASTER-BLUEPRINT-034 (22 items awaiting Founder confirmation)

### Uncommitted Changes

**None** — all changes committed as of Session 21.

---

## DATABASE STATE (Supabase Remote)

### Migrations Successfully Pushed (in order)
1. `20260307100000_coverage_minutes_and_phases.sql` — 26 discourse tables
2. `20260307150000_repair_migration_session7d.sql` — Comprehensive repair (fixed guilds.leader_id + all 26 tables)
3. `20260307200000_rls_hardening_and_phase2_tables.sql` — RLS + Phase 2
4. `20260308000001_treasure_keys_new_content.sql` — Treasure keys
5. `20260308000002_innovation_log_session7b.sql` — Innovations #1498-#1510
6. `20260308000003_content_pipeline_table.sql` — Content pipeline
7. `20260308000004_innovation_log_session7c.sql` — Innovations #1511-#1515 + schema fixes
8. `20260308000005_areopagus_doctrine_engine.sql` — 10 Areopagus tables + seed data
9. `20260308000006_innovation_log_session7d.sql` — Innovations #1516-#1522
10. `20260308000008_innovation_log_session7e.sql` — Innovations #1523-#1528
11. `20260308000009_innovation_log_gap_bridging.sql` — Innovations #1529-#1534
12. `20260308000010_hexel_spec_fix.sql` — #1535 Hexel spec correction
13. `20260308000013_innovation_log_piece_grammar.sql` — Innovations #1536-#1537
14. `20260308000014_innovation_log_cad_tools.sql` — Innovations #1538-#1540

### Migrations NOT YET Pushed

**None** — all migrations pushed as of Session 30. Last 10 pushed:
- `20260315000001` — 568 spec expansion UPDATEs
- `20260315000002` — 22 skeleton fill UPDATEs (#1573-#1594)
- `20260315000003` — Canonical DB + QR linkage + Medallion FK + Print pipeline
- `20260315000004` — Print pipeline refinement (3-vendor, approval gate, production levels)
- `20260315000005` — Outbound dispatch table + 3 seed items (Session 24)
- `20260316000002` — Creator invites + project drafts tables (Session 26)
- `20260317000001` — 18 Six Degrees innovations (#1663-#1680) + canonical count (Session 28)
- `20260317000002` — 10 Kickstarter Chain innovations (#1681-#1690) + canonical count (Session 29)
- `20260317000003` — 19 Bishop 012 innovations (#1691-#1709) + canonical count (Session 29b)
- `20260318000001` — 10 Shadow Mark Demand innovations (#1710-#1719) + canonical count (Session 30)

---

## CRITICAL NUMBERS

| Metric | Value | Source |
|--------|-------|--------|
| **Creator keeps** | 83.3% (never round to 83%) | Immutable |
| **Platform margin** | Cost + 20% | Immutable |
| **Innovations (canonical)** | **1,719** | Session 30 POLLINATION; propagated everywhere |
| **Innovations in DB** | Through #1719 (all pushed) | All migrations applied as of Session 30 |
| **Spec expansions written** | 593 (568 batch + 22 skeleton + 3 overflow) | Migrations `20260315000001` + `20260315000002` |
| **Formal patent claims** | 1,336 across 7 provisional applications | USPTO receipts |
| **8th provisional** | 18 innovations (#1663-#1680) — PDF ready, awaiting filing | Six Degrees Crown Jewel |
| **7th provisional** | Application 64/006,010 — filed March 15, 2026 | 653 innovations with full specs |
| **Crown Jewels** | 123 definitive (see Cephas crown-jewels page) | Cephas + DB |
| **Membership** | $5/year | Immutable |

---

## INNOVATION GAP STATUS

| Range | Status | Notes |
|-------|--------|-------|
| #1-#1000 | Filed (7 provisionals) | Covered by existing USPTO filings |
| #1001-#1049 | **Unfiled gap** | Need single provisional |
| #1050-#1140 | Filed | Covered |
| #1141-#1227 | **Unfiled gap** | Need single provisional |
| #1228-#1329 | Filed | Covered |
| #1330-#1572 | **Unfiled gap** | Includes blueprint skeletons #1573-#1594 |
| #1573-#1594 | **SOURCE MATERIAL FOUND** | See INBOX_FOR_SYNTHESIS section below |
| #1595-#1599 | Defined | Already have definitions |
| #1600-#1662 | Defined | Session 11B threshing (LMD, BandWagon, Steward, Creator, Manufacturing, etc.) |

**Single provisional filing planned** for all 401 unfiled innovations. See `BISHOP_DROPZONE/SINGLE_PROVISIONAL_FILING_PREP.md`.

### SOURCE MATERIAL FOR #1573-#1594 (DISCOVERED!)

The 22 skeleton placeholders now have source material. The following files in `Asteroid-ProofVault/00_INBOX_FOR_SYNTHESIS/` contain **24 fully-documented innovations** from December 2025 Founder sessions. Next Knight must cross-reference against existing `innovation_log` entries, map uncatalogued ones to #1573-#1594, and write spec expansion UPDATEs.

**Files to ingest:**

| File | Innovations Inside |
|------|-------------------|
| `INNOVATIONS_BAG_6_KICKSTARTER_SESSION_DEC_14_2025.md` | POCF (PrintOnceConnectForever dual-ready printing), Root Lock System, Forever Stamp Reward, Huckleberry Finn Fence Reward, The Maker Reward ($1K design tier), Hydraulic Hexel System (Ouralis/Pgears/GoldenLotus/SawTooth60/Football), Character Base Mechanism, Timer Belt Rings, Keeps/Dragons/Noids/Sparks mythology, Biome Progression (7-island additive) |
| `INNOVATIONS_BAG_6_HEXISLE_MECHANICS.md` | Diceless Combat HP/Mana system, Drachma Life Extension (diminishing returns), DANGER TAB Mana Ratio Switch, Terrain Hexel Trigger System (extension rods + timer belts), Character piston/ratchet mechanism |
| `INNOVATION_CAPTAIN_COLLATERAL.md` | Captain Collateral (Marks-staked fulfillment), Decentralized Delivery Confirmation (1/3 rule oracle), "Do It Here Instead" volume discount model |
| `INNOVATION_CHAIN_VOTING_ADVANTAGE.md` | Chain Voting Advantage (stacking 5%→100%→20% loyalty), Distributed Node Scheduled Runs (6-month guaranteed revenue) |
| `INNOVATION_CARE_UNIT_STEWARDSHIP_SYSTEM.md` | Care Unit System (SPARK→WILDFIRE thresholds), Nine AI Steward Advisors (Red Queen, Dredd, Oracle, Morpheus, MirrorMirror, Moneypenny, Jarvis, HAL, Daneel), Six-Person Stewardship Vetting, Financial Transparency System, Command Path Transfer Protocol |
| `INNOVATION_PWA_ROLLING_PERSISTENCE.md` | PWA Rolling Persistence (achievement-based Ghost World decay bypass), Game Master Mode (custom Treasure Maps at 30-day tier), Ghost World Bounties (single-session contests) |
| `INNOVATION_SPECKLES_CURRENCY.md` | Speckles generative currency ("mess is planting"), Speckle Garden metaphor |
| `INNOVATION_ROOT_LOCK_SYSTEM.md` | Root Lock configurations (single/twin/tri/quad/ring), variable terrain compatibility |
| `INNOVATION_CONSIDERED_APPROACH_SUMMARY.md` | Nine Core Innovations summary (Three-Gear Currency, Tab System, Commitment-Triggered Funding, Recursive Fractional Ownership, Star Chamber, Castle Portal Nav, Distributed Manufacturing Redundancy, Ghost→Physical, Omnibus Launch) |
| `HEXISLE_PATENT_CLAIMS.md` | 130 patent claim extractions across 4 categories: Hydraulic Computing (31), AC Pressure Waves (36), Clock-as-Game-State (39), Tereno/Slotted Mechanisms (37) |
| `HEXISLE_DICELESS_COMBAT_FULL_DESCRIPTION.md` | Founder's verbatim transcript describing complete diceless combat system |
| `HEXISLE_COMPONENT_GLOSSARY.md` | Ouralis, GoldenLotus, Pgears, SawTooth60, Bell-Weight Football, Tide Cycle definitions |
| `ACADEMIC_PAPER_GAME_THEORY_MECHANICS.md` | Academic paper: self-validating placement, "design for the weakest," intergenerational play |

**Action for next Knight:** Cross-reference these 24+ innovations against `innovation_log` to find which are uncatalogued, then map to #1573-#1594 and write UPDATE migration.

---

## PENDING WORK (Next Session Priority Order)

| # | Priority | Item | Notes |
|---|----------|------|-------|
| 1 | ~~DONE~~ | ~~Commit SEC cleanup changes~~ | Committed as `2f80abc` (Session 21) |
| 2 | ~~DONE~~ | ~~Push Supabase migrations~~ | All pushed (Session 21) |
| 3 | ~~DONE~~ | ~~Map INBOX innovations to #1573-#1594~~ | 22 skeleton slots filled with full specs (Session 21) |
| 4 | ~~DONE~~ | ~~Deploy to Firebase~~ | Both sites live (Session 21) |
| 4b | ~~DONE~~ | ~~File 7th provisional~~ | Application 64/006,010 filed March 15, 2026 |
| 5 | **MEDIUM** | **Content Pipeline build** | Sequential pipeline: tl;dr → blog → article → academic paper (system designed but not automated) |
| 6 | **MEDIUM** | **Battery Dispatch — Grassroots Intelligence** | Create campaign from 4 new academic papers + Political Expedition cue card |
| 7 | **MEDIUM** | **Treasure Key injection** | Inject keys into all letters, articles, social posts for real treasure hunt |
| 8 | **MEDIUM** | **SEC language cleanup (pre-existing files)** | Broader pass on older files per audit |
| 9 | **MEDIUM** | **RLS security hardening** | Per `RLS_AUDIT_REPORT.md` |
| 10 | **LOW** | **CoLab/Zoo outreach** | AI-CAD partnership brief ready, pending Founder approval |
| 11 | **LOW** | **Letter rewrites** | Founder wants to review/rewrite 30+ Crown Letters |
| 12 | **LOW** | **the2ndsecond.com storyboard images** | 12 son's storyboard PNGs identified for front page |
| 13 | **LOW** | **HexIsle MimicTrunk integration** | Phase MimicTrunk bridge exists but needs deeper wiring |
| 14 | **FUTURE** | **42mm→60mm Hexel port** | Founder's CAD task, not blocking launch |

---

## KEY FILE LOCATIONS

| What | Where |
|------|-------|
| Master Context | `CONTEXT_MANAGEMENT/01_MASTER_CONTEXT.md` |
| This Handoff | `CONTEXT_MANAGEMENT/MILESTONE_HANDOFF_MARCH_2026.md` |
| Unified Agent Sync | `CONTEXT_MANAGEMENT/04_UNIFIED_AGENT_SYNC.md` |
| Letter Sync Protocol | `CONTEXT_MANAGEMENT/LETTER_SYNC_PROTOCOL.md` |
| Social Media System | `CONTEXT_MANAGEMENT/SOCIAL_MEDIA_POSTING_SYSTEM.md` |
| Show Me & Help System | `CONTEXT_MANAGEMENT/SHOW_ME_HELP_SYSTEM.md` |
| Innovation Canonical Count | `CONTEXT_MANAGEMENT/CANONICAL_INNOVATION_COUNT.md` |
| Patent Filing Manifest | `CONTEXT_MANAGEMENT/MASTER_PATENT_FILING_MANIFEST.md` |
| Single Provisional Prep | `BISHOP_DROPZONE/SINGLE_PROVISIONAL_FILING_PREP.md` |
| Spec Expansion Parser | `platform/scripts/parse_spec_expansions.cjs` |
| Spec Pedestal Ingestor | `platform/scripts/ingest_spec_pedestals.cjs` |
| Cephas Registry Ingestor | `platform/scripts/cephas_ingest_registry.cjs` |
| RLS Audit Report | Workspace root or CONTEXT_MANAGEMENT (search for it) |
| **INBOX Innovation Source Files** | `Asteroid-ProofVault/00_INBOX_FOR_SYNTHESIS/INNOVATION_*.md` + `INNOVATIONS_BAG_6_*.md` + `HEXISLE_*.md` + `ACADEMIC_PAPER_*.md` — **24+ innovations for #1573-#1594 mapping** |
| Founders Journal (.docx) | `Founders Journal/` (6 files, early biz strategy v33-v36, no innovation defs) |
| Bishop Conversations (.docx) | `C:\Users\Administrator\Documents\LianaBanyanBISHOP\` — 19 Claude Opus session transcripts + Bishop/Knight/Rook docs |
| CAD Evidence | `USPTO_FILING_DEC_10_2025/05_CAD_EVIDENCE/` |
| Storyboard PNGs | `Asteroid-ProofVault/mediaFiles/01 New KS/.../Kickstarter Art from Son/` |
| API Keys (SENSITIVE) | `Asteroid-ProofVault/LockBox/DOUBLESECRET.env` |

---

## LATEST COMMITS

```
9bc090f Session 27: Action-first Portal, production level Pledge buttons, DenkenMenu nav wiring
b7908fa Session 26: Pnyx merge, WhyNoAds/VC pages, Chalk Outline wiring, X-Ray FAQ additions
ee62ad3 Session 25B: Crown Letters (Political Expedition) + Six Degrees system
602c909 Add Cold Start Recipe Cards, Production Run Draft, Success Stories & Ticker
cb859c9 Fix Ghost World crash, remove auth wall from registration, add sponsor milestones
40e4003 Session 25: dispatch queue seeded, landing page restored, golden key pipeline
6127a12 Session 24: Dispatch pipeline, print order service, canonical stats migration
dfde988 Session 23: Live IPFS (Pinata), Printful API, outreach email, Hugo canonical pipeline
a9e24fe Session 22 addendum: Print pipeline refinement (3-vendor, approval gate, production levels) + Dead Internet Defense
70cb23a Session 22: Canonical DB propagation, QR-Innovation linkage, 7th provisional stale value sweep
5f0fd6d Fix build: supabaseClient import path, operator precedence, Hugo shortcode stubs
32b5081 Cephas: Crown Jewels 123 registry, prior art research, updated innovation/patent indexes
8ed58b3 Add skeleton fill migration (#1573-#1594) and creator share fix migration
2f80abc SEC cleanup: remove EIN/Wyoming from footer, fix SEC-sensitive language across 13 files
b3d196f Session 20+: Spec expansion harvest — 568 innovation descriptions + Cephas Innovation Pedestals
e8e0321 Session 20: Launch runway — Cephas category pages, search, Press Junket, SEC fixes, innovation count
ff57032 Session 19: Cephas content registry, Under the Hood, Fly on the Wall, pudding/academic components
d5e5067 Session 18: XP aggregation trigger, product/production XP paths, box notation display, preorder lock
b3f54d1 Session 17: delegation protocol, XP scoring, trickle onboarding, STAMP verification
4307ae2 Session 16: LB-native Creator Showcase, Crew Call, modular manufacturing system
4f9f4b3 Session 15: Creator Draft Pick system, Pitch Page, referral tiers, showcase
1f6ad59 Session 14: Steward dashboard, Proposals listing, Pledge flow, deploy prep
d9da212 Session 13: wire BandWagon, LMD reviews, cue cards into navigation + Steward schema
8c8461e Session 11B: thresh Steward system & Pizza Oven innovations (#1624-#1630)
```

---

## DEPLOYMENT COMMANDS (PowerShell — use `;` not `&&`)

```powershell
# Main platform (lianabanyan.com)
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\platform"; npm run build; firebase deploy --only hosting:main -P default

# Full deploy (main + Cephas + biz)
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\platform"; npm run build; firebase deploy --only hosting:main -P default; cd "..\Cephas\cephas-hugo"; hugo --minify; firebase deploy; cd "..\business-trunk"; firebase deploy --only hosting:biz

# Push Supabase migrations
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\platform"; npx supabase db push --linked

# Firebase reauth if needed
firebase login --reauth
```

---

## RULES REMINDERS

- **SEC-safe:** "participation" not "equity" in user-facing text; "back" not "invest"; no ROI/shares/dividend in UI.
- **data-xray-id** on key elements.
- **Do not touch** WelcomeGate.tsx.
- **Commit from repo root:** `C:\Users\Administrator\Documents\LianaBanyanPlatform`
- **PowerShell:** Use `;` to chain commands, NOT `&&`.
- **MAX 3 features per session.** Context compression causes looping after ~10 major tool call sequences.
- **Use Edit, not Write, for files over 200 lines.** Surgical edits preserve context.
- **Session end:** Always add a Session End / Handoff summary to this file.
- **Letter Sync is MANDATORY** — When ANY letter is updated in `LAUNCH_DOCUMENTS_MASTER/letters/`, the corresponding Cephas letter MUST be updated immediately.
- **WildFire Tours vs Real Data** — Mock data ONLY shown in WildFire Tour mode. Default state = empty/zeroed.

---

## AGENT ROLES

- **KNIGHT:** Tech, code, deployment, data (this agent)
- **BISHOP:** Letters, articles, communications
- **ROOK:** Patents, innovation extraction, deep research
- **PAWN:** Legal review, compliance, QA

---

## SESSION START CHECKLIST (for next Knight)

1. Read this file (`CONTEXT_MANAGEMENT/MILESTONE_HANDOFF_MARCH_2026.md`)
2. Read `CONTEXT_MANAGEMENT/01_MASTER_CONTEXT.md`
3. Read `CONTEXT_MANAGEMENT/04_UNIFIED_AGENT_SYNC.md`
4. Run `firebase login --reauth` then deploy both sites (see Deployment Commands)
5. Check `BISHOP_DROPZONE/` for any new task prompts
6. Check if Bishop completed the full-spec provisional PDF for USPTO filing
7. Resume from the Pending Work table above

---

FOR THE KEEP!
