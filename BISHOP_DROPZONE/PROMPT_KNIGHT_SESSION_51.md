# Knight Session 51 — Work Order

**Issued by**: Bishop (Claude Desktop)
**Date**: 2026-03-18
**Base commit**: Latest from Session 48
**Platform root**: `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\`
**Stack**: React/Vite SPA, Supabase, Firebase (8 hosting targets), TypeScript, shadcn/ui

This session bundles THREE tasks. Priority order: A → B → C.

---

## TASK A: Wire GleanersCorner + ChainVoting + ConcentricCircles to Supabase

### Context

These three pages were built by Bishop 012 but still use SAMPLE_DATA fallback. Their Supabase tables may or may not exist — if not, create migrations.

### Steps:

1. **Check if tables exist** for each:
   - `gleaners_corner_funds` or similar — for the Gleaner's Corner revenue split tracker
   - `chain_votes` / `chain_voting_proposals` — for Chain Voting proposals + votes
   - `concentric_circle_members` / `concentric_circle_feedback` — for the testing circles dashboard

2. **If tables don't exist, create migrations** following the pattern in `20260319100021_santa_gifts.sql`:
   - Include RLS policies (authenticated SELECT, admin-only writes)
   - Include seed data that matches the SAMPLE arrays in each service file
   - Use snake_case columns, map to camelCase in the service layer

3. **Wire each service file** to query Supabase with sample fallback:
   - `src/lib/gleanersCornerService.ts` — fetchFunds, fetchImpactStats
   - `src/lib/chainVotingService.ts` — fetchProposals, castVote, fetchVoteHistory
   - `src/lib/concentricCircleService.ts` — fetchMembers, fetchFeedback, fetchRingStats

4. **Add write operations** where appropriate:
   - ChainVoting: `castVote()`, `createProposal()`
   - ConcentricCircles: `submitFeedback()`, `updateRingStatus()`
   - GleanersCorner: read-only is fine (revenue splits are system-calculated)

5. **Wire UI buttons** in each page component to call the new write functions.

### Verification:
- Each page loads without errors
- Sample fallback works when Supabase tables are empty
- Write operations create rows in Supabase

---

## TASK B: "Lovable" Reference Cleanup

### Context

There are 18 references to "Lovable" (the original development platform) in non-user-facing files. These need to be cleaned up.

### Steps:

1. **Search the entire `platform/` directory** for "Lovable" (case-insensitive)
2. **For each occurrence:**
   - If in a comment: remove or replace with "Liana Banyan"
   - If in a README: replace with "Liana Banyan"
   - If in package.json description: replace with "Liana Banyan Platform"
   - If in a config file: evaluate if it's functional (don't break anything)
3. **Do NOT change** any npm package names that reference lovable (like `@lovable/cli` if it exists — those are functional dependencies)

### Verification:
- `grep -ri "lovable" platform/` returns only functional package references (node_modules excluded)
- Build passes with zero errors

---

## TASK C: Maker Spotlight Supabase Wiring

### Context

The Maker Spotlight page (`/maker-spotlight`) currently uses SAMPLE_SPOTLIGHTS (12 of 47 makers). Migration `20260319100027_maker_spotlights.sql` seeds all 47 into the `maker_spotlights` table. The service file `makerSpotlightService.ts` already has `fetchSpotlights()` querying Supabase with sample fallback — but the sample array only has 12 entries.

### Steps:

1. **Verify** migration `20260319100027` is pushed to remote Supabase (should already be done in Session 47/48)
2. **Expand SAMPLE_SPOTLIGHTS** in `src/lib/makerSpotlightService.ts` to include all 47 makers (copy data from the migration SQL INSERT)
3. **Test** that the page shows all 47 makers from Supabase, or falls back to all 47 from sample data

### Verification:
- Page at `/maker-spotlight` shows 47 maker cards
- Tier filters show correct counts: Tier 1 (24), Tier 2 (15), Tier 3 (8)
- HexIsle filter shows 5 makers, Slip Casting filter shows 4

---

## Deploy

After all three tasks:
1. `git push origin main`
2. Deploy to Firebase: `firebase deploy --only hosting:main`
3. Update `MILESTONE_HANDOFF_MARCH_2026.md` with session summary

**FOR THE KEEP!**
