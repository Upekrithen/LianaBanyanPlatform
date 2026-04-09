# Knight Build Prompt — Session 14: Steward UI + Proposals + Deploy Prep
# FOR KNIGHT: Build the Steward dashboard, add governance browsing, and prep for Firebase deploy

**Date:** March 14, 2026
**Source:** Bishop (Session 11B continued)
**Goal:** Fill the last major UI gaps for demo-readiness. After this session, the platform should be deployable.

---

## IMPORTANT: SEC Language Rules

Throughout ALL code, comments, UI text, and variable names:
- "investment return" → "earned allocation authority" / "Service Allocation Authority (SAA)"
- "collateral" → "allocation budget" / "backing authority"
- "profit" / "dividend" → "operational surplus" / "service margin"
- "pick winners" → "identify and sponsor high-quality projects"
- "equity" → "participation" / "service allocation"
- "invest" → "sponsor" / "contribute" / "back"
- "ROI" / "returns" → "service value" / "utility benefit"
- "shares" / "ownership" → "membership participation" / "service units"

The cooperative OWNS Joules. Members earn authority to DIRECT them, not own them.

---

## Task 1: Steward Dashboard Component

Create `src/pages/StewardDashboard.tsx`

The schema exists (`steward_profiles`, `pledged_marks_escrow` — migration 000005). Build the UI.

### 1a. Dashboard View (for users who ARE Stewards)
- Current tier with badge (Apprentice → Grand Steward)
- Stats: total projects managed, successful projects, trust score
- Concurrent project limit (from dna_lock per tier)
- Available pledge capacity (max_pledge_limit minus currently held pledges)
- Active pledged escrows list:
  - Project name, amount pledged, status (held/released/absorbed)
  - For each: progress indicator if project is active
- Historical completed projects with outcome (success/failure) and surplus earned
- "Pizza Oven" indicator: if managing 2+ concurrent, show bonus badge

### 1b. "Become a Steward" Application (for users who are NOT yet Stewards)
- Simple application form:
  - Motivation (textarea)
  - Relevant experience (textarea)
  - Which initiative(s) they want to steward
  - Submit creates a `steward_profiles` row with tier='apprentice'
- After submission: redirect to Steward Dashboard

### 1c. Route
- Add route: `/steward` → StewardDashboard (protected, auth required)
- Add route: `/steward/apply` → Steward application (protected)
- Update `BecomeAStewardCard.tsx` CTA link to `/steward/apply`
- Add "Steward" to UnifiedNavigation for authenticated users with steward_profiles row

---

## Task 2: Proposals Listing Page

Currently only ProposalDetail exists at `/governance/proposals/:id`. There's no way to browse all proposals.

### 2a. Create `src/pages/ProposalsListing.tsx`
- Fetch all proposals from the `proposals` table (or equivalent governance table)
- Display as cards with:
  - Title
  - Status (open, voting, passed, rejected)
  - Vote count / progress
  - Submission date
  - Link to ProposalDetail
- Filter by status (All / Open / Passed / Rejected)
- Sort by date or vote count

### 2b. Route
- Add route: `/governance/proposals` → ProposalsListing (ExplorerRoute — visible to all)
- Add "Governance" nav item linking to `/governance/proposals` if not already in nav

### 2c. "Submit a Proposal" CTA
- On the listing page, show a "Submit a Proposal" button for authenticated users
- This can link to an existing proposal creation flow if one exists, or be a placeholder

---

## Task 3: Pledge Flow Component

Create `src/components/steward/PledgeFlow.tsx`

This is the heart of the Steward system — pledging Marks to a project.

### Flow:
1. Steward selects a project to manage (from a project listing or initiative page)
2. Shows: project funding needed, current funding (Steward + BandWagon + LB), gap remaining
3. Steward enters pledge amount (capped at their available capacity from steward_profiles.max_pledge_limit minus active pledges)
4. Shows: "You're pledging X Marks (Y% of project need). LB covers the remaining Z%."
5. Confirmation with "As You Wish" button
6. Creates `pledged_marks_escrow` row with status='held'
7. Updates steward_profiles.total_pledged
8. Post-pledge: shows updated Tri-Source Funding breakdown

### Tri-Source Funding Display
```
Project: [name]
Total needed: 1,000 Marks
├── Steward Pledged: 500 (50%) ████████░░
├── BandWagon Backed: 300 (30%) ██████░░░░
└── LB Allocation:   200 (20%) ████░░░░░░
```

---

## Task 4: Deploy Prep

### 4a. Build verification
- Run `npm run build` and fix any TypeScript or build errors
- Run `npx tsc --noEmit` for type checking
- Ensure no broken imports from the new components

### 4b. Firebase hosting check
- Verify `firebase.json` is configured for the correct hosting targets
- Check that `vite.config.ts` output is compatible with Firebase hosting
- Do NOT deploy yet — just verify the build succeeds

### 4c. Environment check
- Verify `.env` or `.env.local` has all required Supabase keys
- Verify no API keys are hardcoded in source (check for exposed keys in components)

---

## Task 5: Verify Innovation Count

After all changes:
- `SELECT COUNT(*) FROM innovation_log;` — expected **1,630**
- All platform UI locations should show **1,630**

---

## Task 6: Commit

```
feat: Steward dashboard, Proposals listing, Pledge flow, deploy prep (Session 14)

- Create StewardDashboard with tier, stats, active pledges, pizza oven indicator
- Create Steward application flow (Apprentice onboarding)
- Create ProposalsListing page for governance browsing
- Create PledgeFlow component for Tri-Source Funding
- Verify build succeeds for Firebase deploy
- All SEC-safe language verified

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

---

## References

- Steward design: `BISHOP_DROPZONE/STEWARD_PIZZA_OVEN_DESIGN_DOCUMENT.md`
- Steward schema: `platform/supabase/migrations/20260314000005_steward_system.sql`
- BandWagon components: `src/components/bandwagon/*`
- Existing cue cards: `src/components/cue-cards/BecomeAStewardCard.tsx`
- ProposalDetail: `src/pages/ProposalDetail.tsx`
- SEC rules: MEMORY.md
- Founder Corrections: MEMORY.md

---

*Prepared by Bishop. March 14, 2026.*
*FOR THE KEEP.*
