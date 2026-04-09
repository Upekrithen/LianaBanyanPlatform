# KNIGHT SESSION 313 — V2 Canister Configurator (AppShell)
## Bishop B080 | April 5, 2026 | Phase 3 page 6 of 6 (CLOSES Creator Workspaces)

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_32_MASTER_DESIGN_PACKET_B057.md` § 2
**Depends on**: K294 Foundation primitives. Canister System architecture LIVE.
**Tracker row**: `Canister Configurator` (B32 batch)

---

## PAGE PURPOSE

Turn Canister System from parts list into understandable machine matched to real work. Step the member through their actual work — materials, batch sizes, constraints — and map to the right kit.

## ROUTE

`/canister/configurator` (AppShell). Post-auth, member-facing.

## HERO SPEC (copy EXACTLY)

- **Eyebrow**: "Design your first serious shop, not a toy"
- **Headline**: "Configure a Canister that fits the work you really do."
- **Body**: "The Configurator walks you through your actual work—materials, batch sizes, constraints—then maps to Gravity ($249), Thermoplastic ($329), or Complete ($499)."
- **Primary CTA**: "Describe my work"
- **Secondary CTA**: "Show me kits side by side"
- **Proof strip**: "Gravity $249" · "Thermoplastic $329" · "Complete $499"

## SECTION FLOW — QUESTION-PER-STEP

1. Hero (AppShell variant)
2. **Step 0: WorkProfileQuestionnaire** — seeds all downstream recommendations
3. **Step 1: StrengthQuestion** — "How strong does the output need to be?"
4. **Step 2: MaterialQuestion** — "What are you injecting / pressing / printing?"
5. **Step 3: BatchQuestion** — "How many pieces per run? How often?"
6. **Step 4: ConstraintsQuestion** — space, power, noise, venting
7. **Step 5: NodeAmbitionQuestion** — "How far toward Pioneer Node status?"
8. **KitRecommendation** — Gravity / Thermoplastic / Complete mapping with concrete payoff sentence
9. **KitComparisonView** — side-by-side if requested
10. **PioneerNodeProgressBar** — where the chosen kit places the member on the Node path

## CRITICAL DESIGN RULES

- **EACH STEP IS A QUESTION**, not a form field list. One question per screen.
- **"Shop notes" educational content** = just-in-time diagrams + short notes, inline. NOT help-text footers.
- **Pioneer Node progress bar** includes a concrete payoff sentence (e.g., "Complete kit + 3 successful batches = first Pioneer Node qualification").
- NEVER gamified framing.
- NEVER "upgrade path" as promotional framing — Node status is descriptive.

## KIT TIERS (canonical, verify pricing in canonical numbers)

- **Gravity** — $249 entry tier
- **Thermoplastic** — $329 mid tier
- **Complete** — $499 full kit

## COMPONENTS (build in `platform/src/components/v2/canister/`)

- `WorkProfileQuestionnaire.tsx` — step 0 seed questionnaire
- `QuestionStep.tsx` — reusable one-question-per-screen wrapper
- `ShopNote.tsx` — inline just-in-time educational card with diagram slot
- `KitRecommendation.tsx` — mapped result with payoff sentence
- `KitComparisonView.tsx` — side-by-side kit table
- `PioneerNodeProgressBar.tsx` — node-path indicator with concrete payoff

## MOBILE

- Single-column, one question per screen
- Shop notes inline with question
- Kit comparison stacks vertically
- StickyMobileCTA: "Continue" / "Show me my kit" / "Show side by side"

## DATA

- Work profile answers stored in `canister_configurator_sessions` (add migration if needed)
- Kit recommendations = rule-based mapping (no ML)
- Pioneer Node progression reads existing node tables if present, else stub

## BANNED (pre-completion check)

- NO multi-question form pages (one question per screen)
- NO gamified progress bar
- NO promotional "upgrade path" framing
- NO help-text footers (shop notes inline only)
- NO "premium tier" language for Complete kit
- NO red states
- NO LLC / CEO / invest language
- NO demographic intake

## ACCEPTANCE

- [ ] Route `/canister/configurator` wired in AppSidebar
- [ ] Hero copy matches spec EXACTLY
- [ ] Work Profile questionnaire is step 0
- [ ] Each step is a single question
- [ ] Shop notes render inline with diagrams
- [ ] Kit recommendation outputs Gravity / Thermoplastic / Complete with payoff sentence
- [ ] Kit comparison view available via "Show me kits side by side"
- [ ] Pioneer Node progress bar shows concrete payoff
- [ ] `data-tour-target="canister-configurator"` anchor placed
- [ ] Mobile: single-column, one-question-per-screen, StickyMobileCTA
- [ ] `npm run build` passes
- [ ] Tracker: `assignee='K313'`, `in_progress` → `review`
- [ ] Librarian `update_session` K313
- [ ] Screenshots → `BISHOP_DROPZONE/99_Misc/PHASE_3_VISUAL_REVIEW_B080/`

## DO NOT

- Do not build real Kickstarter pledge flow (link to existing campaign page if present)
- Do not introduce gamified Pioneer Node mechanics
- Do not reformat questions into traditional forms
- Do not omit the Work Profile step 0 seed

---

*Bishop B080 — Phase 3 page 6 of 6 — Canister Configurator — CLOSES Phase 3*
*Question-per-step. Shop notes inline. Gravity/Thermoplastic/Complete. Pioneer Node progression.*
*FOR THE KEEP!*
