# Knight Session 10 — Build Order
## Bishop → Knight | March 13, 2026
## Scope: Migration 000006 + 000001, CO Role Templates, Temperament Weighting, Reviewer Pipeline

---

## PRE-FLIGHT

1. **Read these files first:**
   - `CONTEXT_MANAGEMENT/MILESTONE_HANDOFF_MARCH_2026.md`
   - This file (you're reading it)

2. **Patent claims propagation changes are UNSTAGED.**
   Knight's previous session left 29 modified files (1,336 claims update). These are NOT committed yet. Founder may want to commit these before or after this session. Ask Founder.

3. **Current HEAD:** `c0356fb` (Session 5 certification quiz + mentee grid + Patriotic Interdependentalist page)

---

## PHASE 1: Migrations (5 minutes)

Run both pending migrations:

```bash
cd /c/Users/Administrator/Documents/LianaBanyanPlatform/platform
npx supabase db push --linked
```

This applies:
- **000006:** `ambassador_assessment_questions` — 10 questions for Level 1→2 certification quiz (already wired in AmbassadorCertificationQuiz.tsx)
- **000001 (March 13):** `patent_bag_filing_plan` — tracking table for unfiled patent bags

Verify both applied:
```bash
npx supabase db dump --linked | grep -E "ambassador_assessment|patent_bag"
```

---

## PHASE 2: CO Role Templates (Medium — ~45 min)

**Spec:** `BISHOP_DROPZONE/SPEC_CO_ROLE_TEMPLATES.md`

**Summary:**
1. Create `ContingencyOperatorDialog.tsx` in `src/components/ambassador/`
2. Three role templates (Ambassador, Meal Maker, Grocery Runner) with sliders and real-time derived calculations
3. Wire into `AmbassadorMiniBusinessPlan.tsx` — change onClick to open dialog instead of navigating
4. SEC-safe language throughout (no "ROI", "returns", "invest")
5. `data-xray-id` on dialog and each slider

**Build check:** `npm run build` after this phase.

---

## PHASE 3: Temperament Weighting (Medium — ~30 min)

**Spec:** `BISHOP_DROPZONE/SPEC_TEMPERAMENT_WEIGHTING.md`

**Summary:**
1. After Treasure Map quiz completion, accumulate temperament scores from Q8-Q10
2. Store dominant temperament as `temperament_hint` in `profiles.pathway_progress` JSONB (no migration needed)
3. Create `temperamentWeighting.ts` utility with initiative affinity weights
4. Apply `sortByTemperament()` in TreasureMapGame results, BusinessSimulator dropdown, pathway card rendering
5. Ghost users: localStorage, convert on signup

**Build check:** `npm run build` after this phase.

---

## PHASE 4: Reviewer Pipeline — "The Harper's Eye" (Large — ~2 hours)

**Spec:** `BISHOP_DROPZONE/PROMPT_KNIGHT_SESSION6_REVIEWER_PIPELINE.md`

**Build in 3 cycles:**

### Cycle 1: Foundation (~45 min)
1. Create migration `20260313000007_reviewer_pipeline.sql` (SQL provided in spec)
2. Run migration: `npx supabase db push --linked`
3. Build `ReviewerApplication.tsx` → route `/reviewer/apply`
4. Build `ReviewerDashboard.tsx` → route `/reviewer/dashboard`
5. Build `ReviewerBadge.tsx`
6. Add routes to `App.tsx`

### Cycle 2: Queue + Highlighter (~45 min)
1. Build `ReviewQueueItem.tsx` — polymorphic content renderer with action buttons
2. Build `SECLanguageHighlighter.tsx` — reusable term scanner with inline highlights
3. Build `ReviewStatusBadge.tsx`
4. Wire SECLanguageHighlighter into ReviewQueueItem

### Cycle 3: Integration (~30 min)
1. Add auto-submit triggers to Marketplace, ProposalDetail, Pantry recipe, BusinessSimulator adoption
2. Add ReviewStatusBadge to Portfolio items
3. Add "Become a Reviewer" CTA to HarperGuildPage
4. Add reviewer dashboard link to member Dashboard (if user is a reviewer)

**Build check:** `npm run build` after each cycle.

---

## PHASE 5: Commit + Build

```bash
cd /c/Users/Administrator/Documents/LianaBanyanPlatform

# Stage all new and modified files
git add platform/src/components/ambassador/ContingencyOperatorDialog.tsx
git add platform/src/lib/temperamentWeighting.ts
git add platform/src/components/reviewer/
git add platform/src/pages/TreasureMapGame.tsx
git add platform/src/components/BusinessSimulator.tsx
git add platform/src/components/ambassador/AmbassadorMiniBusinessPlan.tsx
git add platform/src/pages/HarperGuildPage.tsx
git add platform/src/App.tsx
# ... plus any other modified files

npm run build

git commit -m "feat: Session 10 — CO role templates, temperament weighting, reviewer pipeline (The Harper's Eye)"
```

---

## CRITICAL RULES

- `data-xray-id` on every key element
- SEC-safe language: "back" not "invest", "participation" not "equity"
- DO NOT TOUCH `WelcomeGate.tsx`
- TypeScript: `npx tsc --noEmit` must pass
- Build: `npm run build` must pass
- Commit from repo root: `/c/Users/Administrator/Documents/LianaBanyanPlatform`
- Innovation count after this session: **1,599** (1,594 + 5 from Reviewer Pipeline)

---

## CANONICAL NUMBERS (Current)

| Metric | Value |
|--------|-------|
| Innovations | 1,594 (update to 1,599 after Reviewer Pipeline) |
| Patent claims filed | 1,336 across 6 provisional applications |
| Crown Jewels | 8 definite + 9 probable |
| Creator keeps | 83.3% |
| Platform margin | Cost + 20% |
| Membership | $5/year |

---

*FOR THE KEEP!*
