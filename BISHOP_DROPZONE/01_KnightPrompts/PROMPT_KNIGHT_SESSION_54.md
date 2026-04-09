# Knight Session 54 — Work Order

**Issued by**: Bishop (Claude Desktop)
**Date**: 2026-03-18
**Base commit**: Latest from Session 53
**Platform root**: `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\`
**Stack**: React/Vite SPA, Supabase, Firebase (8 hosting targets), TypeScript, shadcn/ui

This session bundles THREE tasks. Cleanup and hardening focus.

---

## TASK A: RLS Phase 3 — Complete Audit

### Context

RLS Phase 1 (Session 47) hardened 13+ tables. RLS Phase 2 (Session 48) hit matchtrade, missing_admin_tables, project_invitations. This phase catches EVERYTHING remaining.

### Steps:

1. **Run a complete RLS audit**: For every table in the Supabase schema, verify:
   - RLS is ENABLED
   - SELECT policies exist and are appropriately scoped
   - INSERT/UPDATE/DELETE policies use `auth.uid()` owner checks or `public.is_admin()`
   - No table has a blanket `auth.uid() IS NOT NULL` for write operations (that's the vulnerability Pattern — any authenticated user could write)

2. **List of tables to check** (run `SELECT tablename FROM pg_tables WHERE schemaname = 'public'` or check all migration files):
   - All `20260319*` tables (recent sessions)
   - `profiles`, `projects`, `bounties`, `medallions`, `contributions`
   - `guild_memberships`, `clan_memberships`, `peer_contracts`
   - `bandwagon_*`, `steward_*`, `xp_*`
   - `coverage_minutes`, `chain_votes`, `gleaners_*`
   - `maker_spotlights`, `santa_gifts`, `star_chamber_cases`
   - Any other tables found in migrations

3. **Create a single migration** `20260319200003_rls_phase3.sql` that:
   - Fixes any remaining gaps
   - Documents each fix with a comment explaining what was wrong

4. **Push migration to remote Supabase**

### Verification:
- Every public table has RLS enabled
- No write-all policies remain for non-admin users
- Migration applies cleanly

---

## TASK B: Golden Key Quiz Seeding — Crown Letters

### Context

Only Buffett and Scott have quiz questions. Bishop has noted (POST_LAUNCH_GOLDEN_KEY_EXPANSION.md) that all 102 letters need quizzes. Start with the Crown Initiative letters since they have the highest engagement value.

### Steps:

1. **Read the existing quiz seed pattern** in `20260315000007_quiz_tables_and_seed.sql`

2. **Create migration** `20260319200004_golden_key_crown_quizzes.sql` with quizzes for these Crown letters (8 questions each, 3 difficulty tiers):
   - Dale Dougherty (Industry Chancellor)
   - José Andrés (Food Security)
   - Sal Khan (Education Chancellor)
   - Muhammad Yunus (International)
   - Craig Newmark (Infrastructure Chancellor)
   - Michael Seibel (CEO candidate)
   - Ai-jen Poo (Household Steward)
   - Brené Brown (Harper Guild)

3. **Question format**: Each question has:
   - `question_text`: Comprehension question about the letter content
   - `option_a/b/c/d`: Four multiple choice answers
   - `correct_option`: 'a', 'b', 'c', or 'd'
   - `difficulty`: 1 (easy), 2 (medium), 3 (hard)
   - `explanation`: Brief explanation shown after answering

4. **Question topics should test actual comprehension**:
   - Easy: What role is being offered? What initiative does this relate to?
   - Medium: Why was this specific person chosen? What's the key qualification?
   - Hard: How does this role connect to the broader cooperative model? What specific innovation does it reference?

### Verification:
- Migration applies cleanly
- GoldenKeyQuest page shows new quizzes
- PaperQuizDialog opens and displays questions correctly

---

## TASK C: Comprehensive Platform Smoke Test

### Context

With 472 routes, 309 page imports, and 354+ migrations, we need a smoke test to verify nothing is broken.

### Steps:

1. **Test critical routes** — visit each and verify no console errors:
   - `/` (homepage)
   - `/dashboard`
   - `/marketplace`
   - `/projects`
   - `/bandwagon`
   - `/steward`
   - `/xp-leaderboard`
   - `/star-chamber`
   - `/c-plus-20`
   - `/maker-spotlight`
   - `/designed-to-be-broken`
   - `/the-forge`
   - `/santa`
   - `/node-captain`
   - `/tereno-certification`
   - `/chain-voting`
   - `/gleaners-corner`
   - `/testing/circles`
   - `/golden-key-quest`
   - `/moneypenny/qa`
   - `/moneypenny/social`

2. **For each route**, check:
   - Page renders (no blank screen / infinite loading)
   - No console errors
   - Data loads (either from Supabase or sample fallback)
   - Navigation works (sidebar links to the page, back button works)

3. **Document any broken routes** and fix them in this session

4. **Run `npx tsc --noEmit`** to verify zero TypeScript errors

### Verification:
- All 21 critical routes render
- Zero TypeScript errors
- No console errors on any page
- Document results in handoff

---

## Deploy

After all three tasks:
1. `git push origin main`
2. `firebase deploy --only hosting:main`
3. Update handoff with session summary and smoke test results

**FOR THE KEEP!**
