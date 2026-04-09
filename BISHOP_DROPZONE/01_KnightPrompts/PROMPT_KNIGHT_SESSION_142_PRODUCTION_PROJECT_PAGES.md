# KNIGHT SESSION 142 — Production Project Pages
## Bishop 036 | March 27, 2026
## Innovations: #2029-#2030

---

## CONTEXT

Bishop 036 seeded two production projects in the database:
1. **HexIsle SlottedTop** — 15,000 unit target, 6 production levels, Kickstarter Campaign 1
2. **Canister System** — 5,000 unit target, 2 products (Gravity Kit + Thermoplastic Kit), 6 levels each

Also seeded: 12 manufacturing bounties and 2 Captain Pedestals (both OPEN).

This session builds the UI to display these projects, their production tiers, associated bounties, and Captain recruitment. This is the "Industry Backbone" — where members see what's being built, how they can contribute, and how they can escalate from Bounty Hunter to Partner.

**Depends on:** K141 (X-Ray Bounty Arena — bounties table), K135 (Design Democracy), K124 (Leadership Pedestals), K120 (Crew Call bounties).

---

## DELIVERABLE 1: Hook — `useProductionProjects.ts`

Create `/src/hooks/useProductionProjects.ts`:

```typescript
// useProjects — fetch all projects with products and production levels
// - getProjects() → list all projects with nested products + levels + pledge totals
// - getProject(id) → single project with full data
// - pledgeToLevel(levelId, amount, source) → create pledge

// useProjectBounties — fetch bounties associated with a project's category
// - getBounties(category) → open bounties filtered by category (e.g., 'manufacturing')
// - claimBounty(bountyId) → claim a bounty (if authenticated)

// useProjectCaptains — fetch leadership pedestals for a project
// - getCaptainSeats(initiative) → open + filled Captain seats for an initiative
// - nominateCaptain(pedestalId) → support/nominate for an open seat
```

Query the existing `projects`, `products`, `production_levels`, `pledges`, `bounties`, and `leadership_pedestals` tables.

For production levels, calculate:
- `votes_needed` = `units_count * unit_price` (already a GENERATED column)
- `current_votes` = sum of pledges for that level
- `progress_pct` = `current_votes / votes_needed * 100`
- `is_funded` = `current_votes >= votes_needed`

---

## DELIVERABLE 2: Production Project Page — `ProductionProjectPage.tsx`

Create `/src/pages/ProductionProjectPage.tsx` at route `/projects/:projectId`:

**Layout:**

**Hero Section:**
- Project name (large)
- Project description
- Overall funding progress bar (sum of all level pledges vs sum of all level targets)
- "DO THE WORK = GET THE STATUS" tagline (if Canister project)

**Production Tiers Section:**
- 6 tiers displayed as horizontal progress bars or stacked cards
- Each tier shows:
  - Level name (Prototype Run → Full Production)
  - Units count
  - Unit price
  - Funding progress: `$current / $target` with percentage
  - Visual progress bar (amber fill)
  - "Pledge" button → opens pledge modal (Credits or direct)
- Color coding: unfunded = gray, in progress = amber, funded = green
- Current active level highlighted (the lowest unfunded tier)

**Products Section (for Canister System with 2 products):**
- Tab or card layout showing each product
- Product name, description
- Its own 6-tier production ladder
- "Add to Wishlist" button

**Bounty Board Section:**
- List of open bounties related to this project (filtered by category = 'manufacturing' for Canister, 'design' for others)
- Each bounty card: title, description, reward_marks, difficulty badge, "Claim" button
- Links to full bounty detail or the Bounty Arena dashboard
- Running total: "12 bounties open | 1,825 Marks available"

**Captain Seats Section:**
- Display open Leadership Pedestals for this initiative
- Each seat shows: title, description, status, support count
- "Nominate" or "Apply" button for open seats
- If seat is filled: Captain name + avatar + their campaign stats

**Bounty-to-Partnership Ladder (sidebar or bottom section):**
- Visual escalation showing:
  - 0 Marks → Bounty Hunter
  - 500 → Contractor (1.5x)
  - 1,000 → Senior Contractor (1.75x)
  - 2,000 → Partner (2.0x, revenue share)
  - 5,000 → Senior Partner (2.5x)
- Member's current position highlighted if logged in

---

## DELIVERABLE 3: Projects Directory — `ProjectsDirectoryPage.tsx`

Create `/src/pages/ProjectsDirectoryPage.tsx` at route `/projects`:

**Layout:**
- Grid of project cards (like the existing campaign/initiative card pattern)
- Each card shows:
  - Project name
  - Lead product image/icon
  - Overall funding progress
  - Number of products
  - Number of open bounties
  - Captain status (open/filled)
  - "View Project" button

- Sort: by funding progress, by bounty count, alphabetical
- Filter: by category (HexIsle, Manufacturing, etc.)

---

## DELIVERABLE 4: Pledge Modal — `PledgeModal.tsx`

Create `/src/components/projects/PledgeModal.tsx`:

- Triggered from "Pledge" button on any production level
- Shows: level name, units, unit price, funding progress
- Input: pledge amount (Credits)
- Source selector: QR Code / Kickstarter / Direct
- Confirmation: "Pledge $X toward [Level Name]?"
- On submit: creates row in `pledges` table, updates `current_votes` on the production level
- Success state: coin animation (reuse CoinFlipAnimation from K141)

---

## DELIVERABLE 5: Routes, Navigation, and Stats

**Routes (add to App.tsx with lazy imports):**
```
/projects → ProjectsDirectoryPage
/projects/:projectId → ProductionProjectPage
```

**Navigation:**
- Marketplace sidebar: "Projects" with Package icon (replace or add alongside existing)
- Dashboard sidebar: "My Projects" linking to /projects filtered by user's pledges

**Stats:** Update `useCanonicalStats.ts`:
- innovationCount: 2069 → **2071**
- crownJewels: 140 → **141**

---

## CRITICAL RULES

1. **C+20% floor** on all unit pricing. Already baked into the seeded data.
2. **Credits NEVER cash out to fiat.** Pledges are in cooperative Credits, one-way valve.
3. **No securities language.** "Pledges" not "investments." "Production levels" not "funding rounds."
4. **Captain seats are open.** Anyone with sufficient Marks can nominate or apply.
5. **Bounty claiming requires authentication.** Anonymous users can browse but not claim.
6. **Production levels are sequential.** Level 2 doesn't activate until Level 1 is funded.

---

## FILE SUMMARY

| # | File | Action |
|---|------|--------|
| 1 | `src/hooks/useProductionProjects.ts` | CREATE |
| 2 | `src/pages/ProductionProjectPage.tsx` | CREATE |
| 3 | `src/pages/ProjectsDirectoryPage.tsx` | CREATE |
| 4 | `src/components/projects/PledgeModal.tsx` | CREATE |
| 5 | `src/App.tsx` | MODIFY (routes) |
| 6 | `src/components/AppSidebar.tsx` | MODIFY (nav) |
| 7 | `src/hooks/useCanonicalStats.ts` | MODIFY (2071/141) |

**7 files (4 new, 3 modified).**

---

**FOR THE KEEP.** 🏰
