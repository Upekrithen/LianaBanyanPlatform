# Knight Session 10 — Full Build Queue
## Bishop → Knight | March 13, 2026
## Four tasks, in order. Build, test, commit after each.

---

## BEFORE YOU START

1. Run ALL pending migrations:
```bash
cd platform
npx supabase db push --linked
```
This applies: 000001 (patent_bag_filing_plan), 000002 (innovations 1541-1572), 000003 (skeleton 1573-1594), 000004 (filed vs single provisional — MAY NOT EXIST, skip if missing), 000005 (uspto_filed_ranges), 000006 (ambassador_assessment_questions).

2. Verify build passes: `npm run build`

3. Git state: Knight's patent propagation changes (29 files) are unstaged. Commit them first:
```
feat: patent claims 1,336 across 6 provisionals — propagate everywhere (Bishop audit)
```

---

## TASK 1: CO Role Templates (Medium)

**What exists:**
- `src/components/ambassador/AmbassadorMiniBusinessPlan.tsx` — navigates to `/pathway` with `{ state: { role } }`
- `src/pages/BusinessPathway.tsx` — three pathways (Existing Business, Have an Idea, Looking for Work)

**What to build:**
Add a `ContingencyOperatorDialog.tsx` component (modal/dialog) that opens from AmbassadorMiniBusinessPlan's "Play with these numbers" button.

Three role templates, each with sliders and real-time derived calculations:

### Ambassador Template
| Input (slider) | Range | Default |
|---|---|---|
| Recruits per month | 1–20 | 5 |
| Marks earned per recruit | 5–50 | 20 |
| Months active | 1–24 | 12 |
| Ambassadors you spawn | 0–10 | 2 |

**Derived:** Total Marks earned, Marks/month, implicit hourly rate (assume 10hrs/month)

### Meal Maker Template
| Input (slider) | Range | Default |
|---|---|---|
| Price per meal (Credits) | 5–25 | 12 |
| Meals per batch | 4–20 | 8 |
| Batches per week | 1–7 | 3 |
| Ingredient cost per batch | 10–100 | 40 |
| C+20 platform fee (%) | 20 | 20 (locked) |

**Derived:** Weekly revenue, weekly cost, weekly net, monthly net, implicit hourly rate (assume 4hrs/batch)

### Grocery Runner Template
| Input (slider) | Range | Default |
|---|---|---|
| Fee per household (Credits) | 3–15 | 8 |
| Households per run | 2–10 | 5 |
| Runs per week | 1–7 | 4 |
| Gas cost per run | 5–20 | 10 |
| C+20 platform fee (%) | 20 | 20 (locked) |

**Derived:** Weekly revenue, weekly cost, weekly net, monthly net, implicit hourly rate (assume 2hrs/run)

**UI:** shadcn Slider + Card. Show derived values updating in real time as sliders move. Include a "This is a planning tool, not a guarantee" disclaimer.

**data-xray-id:** `contingency-operator-dialog`, `co-ambassador-template`, `co-meal-maker-template`, `co-grocery-runner-template`

**Wire it:** AmbassadorMiniBusinessPlan opens this dialog instead of (or in addition to) navigating to /pathway. The dialog has a "Go to Full Pathway →" link at bottom.

---

## TASK 2: Temperament-Based Play Weighting (Medium)

**What exists:**
- `src/components/treasure-map/treasureMapQuestions.ts` — Q8-Q10 have temperament tags: `temperament_sj`, `temperament_sp`, `temperament_nf`, `temperament_nt`

**What to build:**

### 2a. Score accumulation
After quiz completion, accumulate temperament scores from Q8-Q10 answers:
```typescript
interface TemperamentScores {
  sj: number;  // Guardian — process-heavy initiatives
  sp: number;  // Artisan — hands-on, physical
  nf: number;  // Idealist — community, relationships
  nt: number;  // Rational — systems, economics
}
```

Each answer's tag adds 1 to that temperament bucket. Max score per type = 3 (one from each of Q8, Q9, Q10).

### 2b. Store on profile
Add `temperament_hint` column to user profile (or wherever Treasure Map results are stored). Store as JSONB: `{ sj: 2, sp: 0, nf: 1, nt: 0 }`.

If no migration table exists for Treasure Map results, store in localStorage for now with a TODO for migration.

### 2c. Weight initiative ordering
Use temperament scores to weight which initiative "plays" appear first in results:

| Temperament | Weighted initiatives |
|---|---|
| SJ (Guardian) | Grocery, Shopping, MSA, Brass Tacks |
| SP (Artisan) | HexIsle, Tereno, JukeBox, Let's Make Bread |
| NF (Idealist) | HEOHO, Harper Guild, Didasko, Political Expedition |
| NT (Rational) | The Battery, MoneyPenny, Household Concierge, Family Table |

Sort by: highest temperament score's initiatives first, then next highest, etc. Ties = original order.

**data-xray-id:** `temperament-results`, `temperament-weighted-plays`

---

## TASK 3: Session 6 — Reviewer Pipeline ("The Harper's Eye") (Large)

Full spec: `BISHOP_DROPZONE/PROMPT_KNIGHT_SESSION6_REVIEWER_PIPELINE.md`

**Build order:**
1. Migration 000007 (SQL in the spec — copy exactly)
2. Cycle 1: `ReviewerApplication.tsx`, `ReviewerDashboard.tsx`, `ReviewerBadge.tsx`
3. Cycle 2: `ReviewQueueItem.tsx`, `SECLanguageHighlighter.tsx`, `ReviewStatusBadge.tsx`
4. Cycle 3: Integration (auto-submit triggers, portfolio badge, routes)

**Routes to add:**
```
/reviewer/apply → ReviewerApplication
/reviewer/dashboard → ReviewerDashboard
```

**This adds 5 innovations (#1595-#1599).** Add to innovation_log with patent_bag = 'Single Provisional', status = 'pending'. Update the innovation count to 1,599.

---

## TASK 4: Innovation Count Update + Threshing

After all tasks are built, update the innovation count:
- 1,594 → 1,599 (5 from Reviewer Pipeline)
- If CO templates or temperament weighting introduce novel mechanisms, thresh those too and add to the count

Update in: 01_MASTER_CONTEXT.md, .cursor/rules/liana-banyan-context.mdc, and any platform files that show the count.

**Do NOT update the Tom Simon letter** — Bishop handles crown letters.

---

## BUILD RULES

- `data-xray-id` on every key element
- SEC-safe language: "back" not "invest", "participation" not "equity"
- DO NOT TOUCH `WelcomeGate.tsx`
- TypeScript: `npx tsc --noEmit` must pass
- Build: `npm run build` must pass
- Commit after each task completes (4 commits)
- Commit from repo root: `C:\Users\Administrator\Documents\LianaBanyanPlatform`

---

## FILING DEADLINE: 2100 HOURS

Founder is filing the single provisional at 2100. Any new innovations (like the 5 from Session 6) need to be in the registry before then so they're included in the 401+.

---

*FOR THE KEEP!*
