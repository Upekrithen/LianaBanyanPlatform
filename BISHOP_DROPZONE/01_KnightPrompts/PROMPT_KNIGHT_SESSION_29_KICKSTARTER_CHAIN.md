# Knight Session 29 — Kickstarter Chain + HexIsle Downloads + X-Ray→FAQ Pipeline
## March 17, 2026 (Bishop Session 011)

---

## CONTEXT

Bishop Session 011 produced a comprehensive Kickstarter rolling campaign strategy for HexIsle. The Founder is hiring a Kickstarter manager and needs the LB platform to support a 13-campaign biweekly cadence with a chain loyalty mechanic, STL downloads, community improvement submissions, and X-Ray integration. Knight Session 28 completed Charity Card 3D flip, Browse Projects, and 8th provisional.

**Full strategy document**: `BISHOP_DROPZONE/KICKSTARTER_STRATEGY_HEXISLE_ROLLING_CAMPAIGNS.md`

**Key concept**: Backers who pledge on consecutive Kickstarter campaigns earn a 5% stacking Joule bonus per link (up to 100%, drops to 20% floor on break). The chain mechanic drives retention across 13 campaigns. Chain tracking lives on the LB dashboard — every Kickstarter backer who claims their chain becomes an LB member.

**CoLab/Zoo outreach is FOUNDER APPROVED.** Activate the draft brief at `tools/outreach/COLAB_ZOO_OUTREACH_BRIEF.md`.

---

## TASK 1: Chain Dashboard Page (`/chain`)

### Build
New route: `/chain` — the HexIsle Chain loyalty dashboard.

**Components:**
1. **Visual chain** — horizontal chain of 13 links, lit (backed) vs unlit (not yet)
2. **Chain timer** — countdown showing days until chain expires (14-day lifespan, extends on each backing)
3. **Next campaign** — name, description, launch date, "Back on Kickstarter →" button
4. **Joule bonus display** — current bonus (chain length × 5%) and what next link would give
5. **Perk list** — which chain perks are unlocked at current length (from strategy doc discount ladder)
6. **Referral link** — shareable link with `?ref=USERNAME` for TasteMaker Trust Chain
7. **Chain leaderboard** — top 10 longest chains in the community

### Data
- Link to existing `crowdfunding_pledges` table for backer data
- Chain length = count of consecutive HexIsle campaign backings within 14-day windows
- If gap > 14 days between backings → chain resets to floor (keep 20% bonus, reset growth)
- Holiday exception: Thanksgiving and Christmas weeks extend timer to 21 days

### Integration
- Login required (LB account)
- First visit triggers account creation flow if needed
- Kickstarter backer ID linking (manual input or sync)

---

## TASK 2: HexIsle Downloads Page (`/hexisle/downloads`)

### Build
New route: `/hexisle/downloads` — STL file library with tier classification.

**Components:**
1. **Grid of HexIsle pieces** — card per component from `hexelPieceGrammar.ts` (27 pieces)
2. **Tier badge** on each card — using the 6-tier Tereno Compatibility system:
   - 🥇 Tereno Certified (Gold)
   - 🥈 Tereno Approved (Silver)
   - 🔵 HexIsle Official (Blue)
   - 🟢 HexIsle Compatible (Green)
   - 🟡 HexIsle Adaptable (Yellow)
   - ⚪ HexIsle Inspired (White)
3. **Download button** — links to STL file (gated by Kickstarter backer status or $5 membership)
4. **"How it fits" section** — explanation of piece's role in the 27-piece taxonomy
5. **Patent reference** — innovation number from the grammar
6. **Submit Improvement button** → links to Piggy-Back submission form
7. **Community versions** — grid of community-submitted variants with their tier classifications

### Data Source
- Piece metadata from `hexelPieceGrammar.ts`
- STL files stored in Firebase Storage or linked externally
- Community submissions in a new `piggyback_submissions` table

### Piggy-Back Submission Form
- Upload STL/OBJ file
- Self-declare tier (system validates)
- Description of improvement
- Reference to original piece
- Automatically creates IP Ledger entry on approval

---

## TASK 3: X-Ray → FAQ Pipeline

### Current State
- 67 X-Ray glossary entries in `xrayGlossary.ts`
- FAQ page at `/faq` with anchor-based deep linking
- **NOT CONNECTED** — no `faqAnchorId` in glossary entries

### Build

**Step 1:** Extend the `XRayGlossaryEntry` interface in `xrayGlossary.ts`:

```typescript
interface XRayGlossaryEntry {
  explanation: string;
  connectedTo?: string;
  why?: string;
  learnMoreUrl?: string;
  learnMoreLabel?: string;
  // NEW:
  faqAnchorId?: string;        // Links to /faq#[anchor]
  downloadUrl?: string;         // STL download (HexIsle pieces)
  piggybackUrl?: string;        // Improvement submission
  innovationNumber?: number;    // Patent cross-reference
}
```

**Step 2:** Add `faqAnchorId` to existing 67 entries where a matching FAQ entry exists.

**Step 3:** Add 27 new X-Ray entries for HexIsle pieces (one per grammar entry) with all new fields populated.

**Step 4:** In `XRayOverlay.tsx`, render additional links when new fields are present:
- 📋 See FAQ → `/faq#${faqAnchorId}` (new tab)
- 📥 Download STL → `${downloadUrl}` (download)
- 🏗️ Submit improvement → `/hexisle/downloads#submit`
- 🔗 Innovation #${innovationNumber}

**Step 5:** Add 27 matching FAQ entries in `knowledgeBase.ts` with anchors matching the X-Ray glossary IDs.

---

## TASK 4: Pledged Mark Voting Page (`/hexisle/vote`)

### Build
New route: `/hexisle/vote` — vote on which HexIsle product launches next.

**Components:**
1. **Product cards** — all upcoming/planned HexIsle products
2. **Pledge Marks** — slider or input to pledge Marks to a product
3. **Live vote totals** — bar chart showing Marks pledged per product
4. **Your pledges** — which products you've voted for and how many Marks
5. **Voting rules** — Marks escrowed during voting, released after campaign launches
6. **Winner highlight** — the product with most Marks gets "Launching Next" badge

### Integration
- Uses existing Pledged Mark Voting from Session 11B
- Marks escrowed in `pledged_marks_escrow` table
- Results feed the Leap Frog cadence — Founder uses vote totals to decide launch order

---

## TASK 5: Crew Call HexIsle Bounties

### Current State
`CrewCallPage.tsx` exists with the role claiming system. 10 manufacturing process modules seeded.

### Build
Add 5+ HexIsle-specific engineering bounties to the Crew Call page:

| Bounty | Credits | Marks | Description |
|--------|---------|-------|-------------|
| Hydraulic Seal Design | 2,000 | 50 | Waterproof seal for Swan Neck inter-Hexel connector |
| 42→60mm Port | 3,000 | 75 | Complete Football/wave gen dimensional port |
| Tesla Valve Optimization | 2,500 | 60 | Validate Golden Lotus geometry for injection molding |
| Reservoir Pressure Testing | 1,500 | 40 | Test protocol for Y/Z reservoir oscillation |
| Ouralis Gear Train QC | 2,000 | 50 | Quality control spec for 20-tooth gear |

Each bounty uses existing bounty system (Team Lead Ante, STAMP verification, XP formula).

---

## TASK 6: HexIsle-Specific Cue Card

### Build
Add a new card to `CueCardDeck.tsx`:

**"Know a Gamer? Know an Engineer?"**
- Destination: `/hexisle?ref=USERNAME`
- Icon: Hexagon (from lucide-react)
- Description: "HexIsle is launching 13 Kickstarter campaigns. Chain backers earn escalating rewards. Engineers can help build the world's first gravity-powered gaming table."
- Share text: "Check out HexIsle — 13 Kickstarter campaigns, chain loyalty rewards, and they're recruiting engineers to build a water-powered gaming table."

---

## FILES TO MODIFY

| File | Changes |
|------|---------|
| `src/data/xrayGlossary.ts` | Add 4 new fields to interface + 27 HexIsle entries + faqAnchorId on existing entries |
| `src/components/builder/XRayOverlay.tsx` | Render FAQ, download, piggyback, innovation links |
| `src/lib/nervous-system/knowledgeBase.ts` | Add 27 HexIsle FAQ entries |
| `src/components/cue-cards/CueCardDeck.tsx` | Add HexIsle cue card |
| `src/pages/CrewCallPage.tsx` | Add 5 HexIsle bounties |

## NEW FILES

| File | Purpose |
|------|---------|
| `src/pages/ChainDashboard.tsx` | `/chain` — Chain loyalty dashboard |
| `src/pages/HexIsleDownloads.tsx` | `/hexisle/downloads` — STL library + tier classification |
| `src/pages/HexIsleVote.tsx` | `/hexisle/vote` — Pledged Mark Voting |

## NEW ROUTES (in App.tsx)

```
/chain → ChainDashboard
/hexisle/downloads → HexIsleDownloads
/hexisle/vote → HexIsleVote
```

---

## PRIORITY ORDER

1. **X-Ray → FAQ Pipeline** (Task 3) — connects 67 existing entries, enables HexIsle deep linking
2. **Chain Dashboard** (Task 1) — the conversion funnel centerpiece
3. **HexIsle Downloads** (Task 2) — enables Open IP model for campaign launches
4. **Pledged Mark Voting** (Task 4) — community-driven launch order
5. **Crew Call Bounties** (Task 5) — engineering recruitment
6. **HexIsle Cue Card** (Task 6) — quick addition

---

## DEPLOY INFO
- Build: `node node_modules\vite\bin\vite.js build`
- Deploy: `npx firebase deploy --only hosting`
- Exit code 1 = normal (chunk warnings). Success = "✓ built in XXs"

---

**FOR THE KEEP**
*BISHOP Session 011 → Knight Session 29*
*March 17, 2026*
*Status: Kickstarter infrastructure implementation*
