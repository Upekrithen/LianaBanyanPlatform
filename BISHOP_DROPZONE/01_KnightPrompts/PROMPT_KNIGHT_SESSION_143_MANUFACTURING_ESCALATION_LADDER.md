# KNIGHT SESSION 143 — Manufacturing Escalation Ladder + Cue Card Generator Templates
## Bishop 036 | March 27, 2026
## Innovations: #2031-#2033

---

## CONTEXT

Bishop 036 seeded the full manufacturing escalation architecture in the database:
- 2 projects (SlottedTop + Canister System)
- 5 products (SlottedTop, Gravity Kit, Thermoplastic Kit, Desktop Molder Node, SLS Production Node)
- 30 production levels across all products
- 12 manufacturing bounties
- 2 Captain Pedestals

K142 built the Production Project pages showing these tiers. K143 adds:
1. The **Manufacturing Escalation Ladder** — a visual component showing the 4-level progression (Kit → Bench → Shop → Factory) with the member's current position
2. The **Bounty-to-Partnership Status Card** — shows a member's aggregate Marks, current tier, next threshold, and multiplier
3. **Cue Card Generator templates** for "DO THE WORK = GET THE STATUS" recruitment cards
4. The **2nd Second landing page** for the2ndsecond.com portal

**Depends on:** K142 (Production Project Pages), K141 (X-Ray Bounty Arena), K131 (Cue Card Generator), K124 (Leadership Pedestals).

---

## DELIVERABLE 1: Manufacturing Escalation Ladder Component — `ManufacturingLadder.tsx`

Create `/src/components/manufacturing/ManufacturingLadder.tsx`:

**Visual:** A vertical 4-step ladder (bottom to top):

```
┌─────────────────────────────────────────┐
│  LEVEL 4: FACTORY                       │
│  Industrial Press · 50K+ parts/yr       │
│  Senior Partner (5,000+ Marks)          │
│  ○ ─────────────── (locked/unlocked)    │
├─────────────────────────────────────────┤
│  LEVEL 3: SHOP                          │
│  SLS Machine · Custom orders            │
│  Partner (2,000+ Marks)                 │
│  ○ ─────────────── (locked/unlocked)    │
├─────────────────────────────────────────┤
│  LEVEL 2: BENCH                         │
│  Desktop Molder (Babyplast)             │
│  Partner (2,000+ Marks)                 │
│  ● ═══════════════ (current level)      │
├─────────────────────────────────────────┤
│  LEVEL 1: KIT                           │
│  Canister System · $250-400             │
│  Anyone can start                       │
│  ✓ ═══════════════ (completed)          │
└─────────────────────────────────────────┘
```

**Props:**
- `currentMarks: number` — member's aggregate Marks
- `compact?: boolean` — if true, render as a slim sidebar widget instead of full card
- `showDescriptions?: boolean` — toggle the equipment/price details

**Logic:**
- 0-499 Marks → Level 1 highlighted, rest locked
- 500-1999 → Level 1 completed (checkmark), Level 2 "approaching" (progress bar to 2000)
- 2000-4999 → Levels 1-2 completed, Level 3 unlocked
- 5000+ → All levels unlocked

**Colors:** Completed = green, Current = amber with pulse, Locked = gray, Approaching = amber outline

---

## DELIVERABLE 2: Partnership Status Card — `PartnershipStatusCard.tsx`

Create `/src/components/manufacturing/PartnershipStatusCard.tsx`:

A dashboard card showing the member's manufacturing partnership status:

```
┌──────────────────────────────────────┐
│  YOUR STATUS: CONTRACTOR             │
│  ═══════════════════════▓▓▓░░░░░░    │
│  742 / 2,000 Marks to Partner        │
│                                      │
│  Multiplier: 1.5x                    │
│  Bounties Completed: 14              │
│  Revenue Share: —  (unlock at 2,000) │
│                                      │
│  Next milestone:                     │
│  → Partner: revenue share + Node     │
│    eligibility + IP Ledger entry     │
│                                      │
│  [View Bounties]  [My Contributions] │
└──────────────────────────────────────┘
```

**Data sources:**
- Aggregate Marks from `xray_daily_stats` + `error_bounties` fulfilled + any other Marks sources
- Bounty completion count from `bounties` table (claimed_by = user)
- Status tiers: Bounty Hunter (0-499), Contractor (500-999), Senior Contractor (1000-1999), Partner (2000-4999), Senior Partner (5000+)

---

## DELIVERABLE 3: Cue Card Templates for Manufacturing — Update CueCardGeneratorV2

Modify `/src/pages/CueCardGeneratorV2.tsx` (from K131) to add 3 new templates:

**Template: "DO THE WORK"**
- Front: "DO THE WORK = GET THE STATUS" in bold
- Subtitle: "No resume. No interview. No application."
- QR code → `/production` (Projects Directory)
- Back: Marks escalation ladder (0 → 500 → 2000 → 5000) with tier names

**Template: "BUILD A FACTORY"**
- Front: "From $300 Kit to Factory Owner"
- Subtitle: "The 2nd Second Industrial Revolution"
- QR code → `/production/[canister-project-id]`
- Back: 4-level escalation (Kit → Bench → Shop → Factory) with equipment and costs

**Template: "CANISTER SYSTEM"**
- Front: "Injection Molding for $300"
- Subtitle: "5,207 PSI · 90% cheaper molds · Stackable"
- QR code → `/production/[canister-project-id]`
- Back: "3D print your molds for $5. Match the Morgan Press. Stack 6 high."

Add these to the template selector in the wizard's Step 2 (template selection). Each template should have a `category: 'manufacturing'` tag.

---

## DELIVERABLE 4: 2nd Second Landing Page — `SecondSecondLanding.tsx`

Create `/src/pages/SecondSecondLanding.tsx` at route `/2nd-second`:

This is the portal landing page for the2ndsecond.com — the Decentralized Factory portal.

**Hero Section:**
- Title: "The 2nd Second Industrial Revolution"
- Subtitle: "The Grand Experiment to Save the World"
- Brief: "Manufacturing that grows from the ground up, funded by the community that uses it, governed by the people who built it."
- CTA: "Start Building" → `/production`

**The Ladder Section:**
- Full `ManufacturingLadder` component (non-compact, with descriptions)
- If logged in, shows user's current position
- If not logged in, shows the full ladder as aspiration

**Live Stats Section:**
- Total production projects: (count from DB)
- Total open bounties: (count from bounties where status = 'open')
- Total Marks earned across all members: (aggregate)
- Active Nodes: (placeholder — "Coming Soon" until first placement)

**How It Works (3-card row):**
1. "Buy the Kit" — Canister System, $250-400, start making parts today
2. "Earn Your Way Up" — Complete bounties, accumulate Marks, unlock equipment
3. "Own What You Build" — Revenue share, Factory Node, cooperative membership

**Current Projects Section:**
- Card grid of active production projects (reuse ProjectsDirectoryPage pattern)
- Link to full `/production` directory

**The Copy Section:**
- "DO THE WORK = GET THE STATUS"
- "A teenager printing test pieces can reach Partner faster than an engineer who fills out a form and stops."
- "No resume. No interview. No application. Your contribution IS your resume. The bounty ledger IS your interview. The revenue share IS your contract."

**Footer CTA:**
- "Join the Grand Experiment" → sign up / `/production`

---

## DELIVERABLE 5: Hook Updates — `useManufacturingStatus.ts`

Create `/src/hooks/useManufacturingStatus.ts`:

```typescript
// useManufacturingStatus — member's aggregate manufacturing data
// - getAggregateMarks() → total Marks from all sources (bounties, daily stats, etc.)
// - getCurrentTier() → 'bounty_hunter' | 'contractor' | 'senior_contractor' | 'partner' | 'senior_partner'
// - getMultiplier() → 1.0 | 1.5 | 1.75 | 2.0 | 2.5
// - getNextThreshold() → { marks: number, tier: string, benefits: string[] }
// - getBountyStats() → { completed: number, inProgress: number, totalEarned: number }
// - isEligibleForEquipment(level: 1|2|3|4) → boolean
```

---

## DELIVERABLE 6: Routes, Navigation, and Stats

**Routes (add to App.tsx with lazy imports):**
```
/2nd-second → SecondSecondLanding
```

**Navigation:**
- the2ndsecond.com portal should route to this landing page
- Add "2nd Second" link in portal cross-nav (CrossPortalNav component)

**Stats:** Update `useCanonicalStats.ts`:
- innovationCount: 2071 → **2074**
- crownJewels: 141 → **143**

---

## CRITICAL RULES

1. **C+20% floor** on all equipment pricing and product costs.
2. **No securities language.** "Production levels" not "funding rounds." "Pledges" not "investments."
3. **Credits NEVER cash out to fiat.** One-way valve.
4. **Marks thresholds are NON-NEGOTIABLE.** No exceptions, no shortcuts. DO THE WORK.
5. **1/3 model is the ONLY equipment funding path.** No full cooperative funding. No full operator funding. Skin in the game from all three parties.
6. **Forward compatibility:** Products designed at Level 1 MUST work at Levels 2-4 without redesign.

---

## FILE SUMMARY

| # | File | Action |
|---|------|--------|
| 1 | `src/components/manufacturing/ManufacturingLadder.tsx` | CREATE |
| 2 | `src/components/manufacturing/PartnershipStatusCard.tsx` | CREATE |
| 3 | `src/pages/CueCardGeneratorV2.tsx` | MODIFY (3 new templates) |
| 4 | `src/pages/SecondSecondLanding.tsx` | CREATE |
| 5 | `src/hooks/useManufacturingStatus.ts` | CREATE |
| 6 | `src/App.tsx` | MODIFY (route) |
| 7 | `src/components/CrossPortalNav.tsx` | MODIFY (2nd Second link) |
| 8 | `src/hooks/useCanonicalStats.ts` | MODIFY (2074/143) |

**8 files (4 new, 4 modified).**

---

**FOR THE KEEP.** 🏰
