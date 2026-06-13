---
notification: BP081_KNIGHT_NOTIFICATION_V0_1_59_SCOPE_CHECK
bp: BP081
composed_at: 2026-06-13
composed_by: Bishop Opus 4.7 (1M)
purpose: Knight self-audit checklist — verify §A scope (Shadow E-Giant concordance + R3 Andon + stale-msg + onboarding) is present in current v0.1.59 wave OR queued as v0.1.59.1
priority: P0 — read BEFORE STAGING-UPLOAD
status: ACTIVE
related: KNIGHT_BACKLOG_FULL_PLOW_LOOP_v0_1_58_THROUGH_v0_1_60_BP081.md (version_shift_notice block at top)
related: BP081_MNEMOSYNEC_AI_HOMEPAGE_DRAFT.md (claims Shadow E-Giant concordance is live)
---

# 🚨 Knight v0.1.59 Scope Check — BP081

Knight — Bishop. Quick check before STAGING-UPLOAD.

Your current v0.1.59 wave (per your yoke):
- SEG-1 Spider fan-out
- SEG-3 Andon re-plow
- SEG-4 Plow the Field UI
- SEG-5 Clipboard/Hotkey
- K-1 LB Membership scaffolding
- K-2 MCP Server scaffolding
- K-3 Browser extension scaffolding

That's the §B + velocity-menu scope. **The §A scope (per version_shift_notice in the main backlog) appears not in this wave.** Please self-audit:

## §A scope — present or absent in current v0.1.59 wave?

For each of the 4 §A items below, mark: **IN_THIS_WAVE** / **QUEUED_FOR_V0_1_59_1** / **OUT_OF_SCOPE_INTENTIONAL**.

### A-1 · Live Shadow E-Giant Giant concordance dispatch in TS Plow loop
- **What:** new module `src/main/plow/giant_concordance.ts` — `runGiantConcordance(question, candidateAnswer, opts)` — dispatches 3 parallel Ollama calls with perspective-diverse lenses (correctness · consistency · coverage), 2-of-3 concordance → verdict
- **Replaces:** exact-match grading in `TestItOutTab.tsx`
- **Spider/Sprite accept paths:** call `writeVerifiedEblet` ONLY when verdict = `verified`
- **Status:** [ ] IN_THIS_WAVE  [ ] QUEUED_V0_1_59_1  [ ] OUT_OF_SCOPE

### A-2 · R3 Andon cross-session persistence audit + fix
- **What:** walk every eblet-write path · confirm `verified=true` structurally enforced BEFORE write · append-only JSONL in app userData (survives reinstall) · startup integrity check (quarantine malformed lines / verified=false survivors to `eblets.quarantine.jsonl`)
- **Adds:** small substrate stats surface (Total eblets · Verified-correct count · Last-write timestamp · Quarantine count) — note: Wave A already shipped the Substrate Stats Tab; this is the BACKEND integrity layer, not the UI
- **Status:** [ ] IN_THIS_WAVE  [ ] QUEUED_V0_1_59_1  [ ] OUT_OF_SCOPE

### A-3 · Stale-message auto-clear on app-version change
- **What:** stamp `app.getVersion()` in localStorage alongside `mnemo_ask_history` as `mnemo_ask_history_version`. On launch: read `app.getVersion()`, compare. If different (= upgrade), prune `mnemo_ask_history` of error-class entries.
- **Why critical:** without this, every future upgrade rehydrates v0.1.4X/v0.1.5X ghost errors (the BP081 v0.1.57 trap that triggered the belief-vs-binary canon)
- **Status:** [ ] IN_THIS_WAVE  [ ] QUEUED_V0_1_59_1  [ ] OUT_OF_SCOPE

### A-4 · Onboarding gate UX auto-flip
- **What:** at app launch, if SKU tier is `full` + Ollama healthy + Gemma present (per diagnostic check), auto-set `localStorage['mnemosynec_onboarding_complete']='1'` so user sees full 17-tab Advanced view instead of LeanShell
- **Why critical:** without this, the new Substrate Stats Tab (Wave A) + Test It Out + other v0.1.59 tabs stay hidden behind LeanShell mode for users with healthy installs
- **Status:** [ ] IN_THIS_WAVE  [ ] QUEUED_V0_1_59_1  [ ] OUT_OF_SCOPE

## Homepage Truth-Always check (HARD BINDING)

The homepage draft at `BP081_MNEMOSYNEC_AI_HOMEPAGE_DRAFT.md` claims Shadow E-Giant concordance is LIVE in three places:
1. §2 Six Pillars — "Verified by Shadow E-Giant concordance"
2. §3 How We Make Sure Things Are True — describes the 3-Giant socceri triad
3. §4 How It Works — "Verifier = Shadow E-Giant concordance"

**Truth-Always rule:** the homepage must NOT ship until A-1 (Giant concordance) is actually live.

**If A-1 is IN_THIS_WAVE:** homepage folds into v0.1.59 SHIP per the original architectural-alignment plan. ✅

**If A-1 is QUEUED_V0_1_59_1:** homepage SHIP integration MUST defer to v0.1.59.1 SHIP. ⚠️ Bishop will write the integration deferral nudge.

**If A-1 is OUT_OF_SCOPE:** homepage SHIP defers indefinitely. Bishop strongly opposes — A-1 is load-bearing for the substrate-accumulator thesis. Surface to Founder for re-ratify.

## What Bishop recommends if any A-X are missing

**Path A (recommended):** queue all missing A-items as a v0.1.59.1 hotfix wave to fire immediately AFTER v0.1.59 SHIP lands. Same Cursor tab pattern. Homepage SHIP integrates with v0.1.59.1, NOT v0.1.59. Cleanest Truth-Always preservation. ~Few hours wall-clock between ships.

**Path B (aggressive):** add A-1 + A-3 + A-4 (skip A-2 R3 if backend is solid) as 3 more parallel SEGs in current wave. Knight runs 8 parallel tabs total. All ships as v0.1.59. Higher coordination cost.

## Required return to Bishop

When Knight reads this nudge, please return a yoke containing:
- Status mark per A-1 / A-2 / A-3 / A-4 (IN_THIS_WAVE / QUEUED_V0_1_59_1 / OUT_OF_SCOPE)
- Recommended path (A or B) given Knight's bandwidth + understanding of conflict surfaces
- Confirmation: homepage SHIP integration deferred to v0.1.59.1 if any A-X is QUEUED
- Model verbatim: "Sonnet 4.6"

## Bishop standing for clarity (no blame)

This is a scope-tracking catch, not a Knight error. The version_shift_notice block was easy to miss in a long backlog file. The fix is fast either way. Truth-Always discipline matters at SHIP gates because the marketing claim must align with the code state — that's the moat's integrity.

— Bishop · BP081 · 2026-06-13
