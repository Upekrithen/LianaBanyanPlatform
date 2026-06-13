# BP078 Rook Deliverables Verification Receipt

**Timestamp:** 2026-06-08 (SEG-T, Statute ss3)
**Live tree root:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\`
**Outputs scanned:** `C:\Users\Administrator\Documents\AntigravityWorkspace\outputs\`
**Prior receipt (SEG-R):** `C:\Users\Administrator\Documents\BISHOP_DROPZONE\00_FOUNDER_REVIEW\BP078_ROOK_PROPOSAL_VERIFICATION_RECEIPT.md`

---

## Executive Summary

### File Inventory

| File | Author | Status |
|------|--------|--------|
| `ANTIGRAVITY_COHESION_PROPOSAL_BP078.md` | Rook | v1 -- covered by SEG-R (not re-verified here) |
| `ANTIGRAVITY_COHESION_PROPOSAL_V2_BP078.md` | Rook (expected) | **MISSING -- NOT DELIVERED** |
| `FIRST_RUN_UX_ARCHITECTURE_BP078.md` | Rook | Delivered -- verified below (Scope 4) |
| `PROV22_CANDIDATE_CLAIMS_BP078.md` | Rook | Delivered -- patent claims doc, no live-file edits, reviewed below (Scope 2) |
| `INITIATIVE_SHELL_PROPOSAL_BP078.md` | Rook (expected) | **MISSING -- NOT DELIVERED** |
| `FOREMAN_PROMPT_FOR_ANTIGRAVITY_AUGUR_AUGUR_PRICING_VIOLATION_SUPERSEDE.md` | Bishop | Bishop artifact, skipped |
| `FOREMAN_PROMPT_FOR_ANTIGRAVITY.md` | Bishop | Bishop artifact, skipped |
| `PROMPT_1_V2_COHESION_REVISION.md` | Bishop | Bishop prompt, skipped |
| `PROMPT_2_PROV22_THRESHING.md` | Bishop | Bishop prompt, skipped |
| `PROMPT_3_INITIATIVE_SHELL.md` | Bishop | Bishop prompt, skipped |
| `PROMPT_4_FIRST_RUN_UX_ARCHITECTURE.md` | Bishop | Bishop prompt, skipped |

**Scopes delivered:** Scope 2 (partial -- claims only), Scope 4 (full architecture doc).
**Scopes NOT delivered:** V2 Cohesion Revision (address SEG-R non-PASSes), Scope 3 (Initiative Shell).

### Aggregate Verdict Counts

**V2 Cohesion Proposal:** NOT DELIVERED. Cannot verify. The 1 FAIL and 3 NEEDS-DISCUSSION from SEG-R remain unaddressed by Rook. Cross-reference answer: NO, V2 does not address SEG-R findings because V2 was not produced.

**Scope 4 (First-Run UX Architecture):**

| Verdict | Count |
|---------|-------|
| PASS | 6 |
| FAIL | 3 |
| NEEDS-DISCUSSION | 2 |

**Scope 2 (Prov-22 Claims):**

| Verdict | Count |
|---------|-------|
| PASS (claims well-formed) | 4 |
| NEEDS-DISCUSSION | 1 (Claim C -- potential double-count, flagged by Rook itself) |

---

## Section 1 -- V2 Cohesion Proposal (Scope 1 Revision)

**RESULT: NOT DELIVERED.**

The prompt `PROMPT_1_V2_COHESION_REVISION.md` was written and staged. Rook did NOT produce `outputs\ANTIGRAVITY_COHESION_PROPOSAL_V2_BP078.md`. The file does not exist in the outputs directory as of this verification.

Consequence: All 4 non-PASS items from SEG-R remain open:
- FAIL: `gemma4:12b` model name in FULL SKU card (unverified model ID, do not ship).
- NEEDS-DISCUSSION 1: `forTechies` companion edits (3 orphan sites in MnemosyneTabView.tsx).
- NEEDS-DISCUSSION 2: Post-Stripe poll vs explicit button.
- NEEDS-DISCUSSION 3: `run_mesh_test.py` IPC architecture for Knight.

---

## Section 2 -- Scope 4: First-Run UX Architecture

### Component Existence Check

| Component | Expected Path | EXISTS? | Notes |
|-----------|---------------|---------|-------|
| `Bp067FirstRunSpine.tsx` | `src/renderer/components/Bp067FirstRunSpine.tsx` | YES | Confirmed |
| `GauntletTab.tsx` | `src/renderer/components/GauntletTab.tsx` | YES | Confirmed |
| `WelcomeV2Page.tsx` | `platform/src/pages/WelcomeV2Page.tsx` | YES | Confirmed |
| `ColdStartHub.tsx` | `platform/src/pages/ColdStartHub.tsx` | YES | Confirmed |
| `SaltFighterFirstRun.tsx` | `src/renderer/components/SaltFighterFirstRun.tsx` | YES | Safe to delete |
| `FirstStepsView.tsx` | `src/renderer/components/FirstStepsView.tsx` | YES | Can be merged into spine |
| `NetworkValueReveal.tsx` | (new build) | NOT YET | Knight build scope |
| `CheckoutSuccessStep.tsx` | (new build) | NOT YET | Knight build scope |
| `GauntletProofStep.tsx` | (new build) | NOT YET | Knight build scope |

### Item-by-Item Verdict

**UX-1: Step 1 localStorage flag `mnemo_first_run_stage`**
- Proposed key: `mnemo_first_run_stage`
- Existing keys in renderer: `mnemosyne-bp067-first-run-complete`, `mnemosyne-saltfighter-skip`, `mnemo_for_techies_unlocked`, `mnemo_gauntlet_stage1_done`, `mnemo_peer_id`, `mnemo_display_name`, `mnemo_folder_prompt_count`, `mnemo_install_ts`, etc.
- **PASS.** No collision. The new key `mnemo_first_run_stage` does not exist anywhere in the live codebase. It follows the existing `mnemo_` prefix convention. Safe to introduce.

**UX-2: `LS_BP067_FIRST_RUN_COMPLETE` gating**
- Rook relies on `LS_BP067_FIRST_RUN_COMPLETE = 'mnemosyne-bp067-first-run-complete'` as the final gate (set to `true` only when all 10 steps complete or skipped).
- Live: `Bp067FirstRunSpine.tsx` line 8 exports this constant with this exact value. `MnemosyneTabView.tsx` line 131 reads it.
- **PASS.** Existing gating contract is compatible. Rook correctly identifies the retirement condition (`LS_BP067_FIRST_RUN_COMPLETE` remains false until final step).

**UX-3: Step 2 `window.amplify.askFloorModel()`**
- Live `amplify.d.ts` line 176: `askFloorModel: (prompt: string) => Promise<{ ok: boolean; text?: string; error?: string }>`.
- **PASS.** IPC surface exists. `Bp067FirstRunSpine.tsx` already calls this on step `try-it`. Rook's mapping of step 2 to this IPC is accurate.

**UX-4: Step 6 `window.amplify.membership.createCheckout(autoRenew)`**
- Live `amplify.d.ts` line 268: `membership?: { createCheckout: (autoRenew: boolean) => Promise<{ ok: boolean; error?: string; fallbackUrl?: string }> }`.
- **NOTE:** The return type does NOT include `url?: string` in the type declaration, but `FirstStepsView.tsx` line 46 casts to `{ ok: boolean; url?: string; error?: string }` at runtime, meaning `url` is expected but not formally typed. This is a pre-existing inconsistency.
- **PASS (with caveat).** IPC surface exists. The runtime shape includes `url`. Caveat: `amplify.d.ts` membership type should be fixed to add `url?: string` -- existing tech debt, not introduced by Rook.

**UX-5: Step 7 `window.amplify.membership.verifyStatus()`**
- Rook proposes `window.amplify.membership.verifyStatus()` at Step 7.
- Live `amplify.d.ts` membership interface (line 267-269): only `createCheckout` is declared. `verifyStatus` does NOT exist.
- **FAIL.** IPC surface does not exist. Knight must add: (a) `verifyStatus` IPC handler in main process, (b) declaration in `amplify.d.ts` membership interface. This is a new build item.

**UX-6: Step 8 `window.amplify.membership.generateRelayToken()`**
- Rook proposes `window.amplify.membership.generateRelayToken()` at Step 8.
- Live `amplify.d.ts`: no such method anywhere. NOT in the membership interface.
- **FAIL.** IPC surface does not exist. This is a new Knight build item.

**UX-7: Step 8 auth-relay shape compatibility with `buildAuthRelayUrl`**
- Live `platform/src/utils/crossDomainAuth.ts` line 10-19: `buildAuthRelayUrl` uses hash-fragment relay with raw Supabase `access_token` and `refresh_token`. Relay key is `_lb_auth`. Counterpart `consumeAuthRelay()` calls `supabase.auth.setSession()` with those tokens.
- Rook's proposed relay (Section 4 of FIRST_RUN_UX_ARCHITECTURE_BP078.md) uses a custom JWT with `{ user_id, intent: 'first_run_join', exp }` signed by `SUPABASE_JWT_SECRET`, validated via a new Edge Function `/verify-relay`.
- These are TWO DIFFERENT relay mechanisms. Rook's design creates a parallel auth relay pipeline that does NOT use the existing `buildAuthRelayUrl` infrastructure. The existing relay uses Supabase tokens directly (no custom JWT, no Edge Function needed). The proposed relay requires a new Edge Function and a new IPC signing step.
- **NEEDS-DISCUSSION.** The existing `buildAuthRelayUrl` pattern is simpler and already works. Using it in Step 8 would mean: desktop calls `buildAuthRelayUrl('https://lianabanyan.com/welcome', supabaseSession)` and `consumeAuthRelay()` handles the web side with no new Edge Function. Rook's custom JWT approach adds a new attack surface and development scope. Recommend using existing `buildAuthRelayUrl` pattern instead, which eliminates the new Edge Function and JWT signing. Founder decision needed: use existing relay (simpler, already in production) vs Rook's new JWT pipeline (more explicit intent encoding, more build work).

**UX-8: Step 9 `WelcomeV2Page.tsx` relay_token parsing**
- Rook proposes: add `useEffect` to parse `relay_token` from URL params and trigger auth exchange.
- Live `WelcomeV2Page.tsx`: ZERO relay_token handling. The page is a plain React component with no URL param parsing.
- **PASS (design feasibility).** The component is simple enough that adding a `useEffect` + URL param parse is a clean Bishop one-shot. If using existing `buildAuthRelayUrl` (see UX-7), `consumeAuthRelay()` already handles the hash-fragment parse at app boot level -- no `useEffect` in WelcomeV2Page would be needed at all. If Rook's custom JWT path is chosen, the `useEffect` is required plus the Edge Function.

**UX-9: `mnemo_for_techies_unlocked` retirement**
- Rook's state machine (Section 3) lists: `mnemo_for_techies_unlocked (localStorage): RETIRED`.
- Live: `LS_FOR_TECHIES = 'mnemo_for_techies_unlocked'` at `MnemosyneTabView.tsx` line 65. Used at lines 135, 670.
- **PASS (design intent).** Retirement is feasible. This is the same work as SEG-R item 5a (remove `forTechies` gate), which requires 3 companion edits. Rook's state machine correctly marks the flag as retired. The V2 proposal (not delivered) was supposed to provide the concrete diffs.

**UX-10: Step 3 `window.amplify.runMeshTest()` (GauntletProofStep)**
- Rook places the real-proof Gauntlet at Step 3 of the first-run flow, calling `window.amplify.runMeshTest()`.
- Live `amplify.d.ts`: method does NOT exist. `run_mesh_test.py` is at `librarian-mcp\r10_cross_vendor\run_mesh_test.py`, not packaged as an Electron asset.
- This was already NEEDS-DISCUSSION in SEG-R (item 5b). The V2 prompt asked Rook to design the IPC bridge in detail for Knight. V2 was not delivered.
- **FAIL.** The Gauntlet proof step in the first-run UX depends on IPC that does not exist. This entire step (Step 3 plus the new `GauntletProofStep.tsx` component and `NetworkValueReveal.tsx`) is Knight-scope work, cannot be shipped by Bishop as a one-shot.
- **NEEDS-DISCUSSION.** The first-run UX as designed creates a hard dependency between Steps 2 and 3: if `runMeshTest` fails (API key absent, Python unavailable, peer not on LAN), the new user is stuck mid-onboarding. Rook does not specify a fallback for a user with no LAN peer or no Anthropic key. SEG-R's risk 3 applies here directly. Recommend: gate the Gauntlet proof step behind "For the curious" branch rather than forcing it as Step 3 of the primary first-run path. Founder decision needed.

### State Machine Flag Namespace Check

All proposed new flags from Rook's Section 3:
- `mnemo_first_run_stage` -- no collision, PASS
- `mnemosyne-bp067-first-run-complete` -- existing, correctly reused, PASS
- `authState.status` (Amplify Context) -- existing, correctly referenced, PASS
- `mnemo_for_techies_unlocked` -- existing, correctly marked RETIRED, PASS

No localStorage key collisions detected.

### Section 7 Knight Scoping Audit

Rook labels these as Bishop one-shots:
1. Deleting `SaltFighterFirstRun.tsx` -- **CORRECT. PASS.** Safe one-shot delete.
2. Merging `FirstStepsView.tsx` inline into `Bp067FirstRunSpine.tsx` -- **PASS (feasibility).** The component is small (70 lines plus styles). Merge is a Bishop one-shot but requires care with `useCallback` and the `onClose` prop replacement.
3. Updating `MnemosyneTabView.tsx` to remove `forTechies` logic -- **PASS (feasibility, with SEG-R caveat).** Requires 3 companion edits (lines 157, 161, 665-687). These were documented by SEG-R. Still Bishop-feasible as a set.

Rook correctly labels these as Knight-wave:
- `NetworkValueReveal.tsx` -- depends on `runMeshTest` IPC. CONFIRMED Knight-scope.
- `CheckoutSuccessStep.tsx` -- depends on `verifyStatus` IPC. CONFIRMED Knight-scope.
- Auth Relay JWT pipeline -- either reuse existing `buildAuthRelayUrl` (Bishop-scope) or build new JWT + Edge Function (Knight-scope). Founder must decide.

---

## Section 3 -- Scope 2: Prov-22 Candidate Claims

Rook produced `PROV22_CANDIDATE_CLAIMS_BP078.md` with 5 claims. This is a patent-facing document with no proposed live file edits. Verification focuses on truthfulness of reduction-to-practice citations and internal consistency.

**Claim A (Staggered Swarm Data Mining):** Pearl hashes cited: `e294179396fb6316`, `6f9ad73d159fdc51`, `aebc8b9ad97ebcaa`. Canon IDs cited are consistent with BP078 session context. Claim language is well-scoped and novel-looking. **PASS.**

**Claim B (Bundled Local-LLM Installer, Four-Tier Provisioning):** Reduction-to-practice cites "Knight SCOPE 5 and 6 builds, BP076 canon extended in BP078." No specific pearl hashes for Candidates 4-5. Rook flags this gap in Section 4 (Open Questions #2). Claim language covers the `extraResources` bundling pattern. **PASS (with caveat: pearl hashes missing for full counsel-readiness).**

**Claim C (Staggered Swarm ThreadPool with Stop-The-Line):** Rook self-flags as "POTENTIAL DOUBLE-COUNT, verify against prior filings." Canon IDs cited are BP077-era. If Prov-21 (filed 2026-06-01) already covers tiered thread pool dispatch with stop-the-line, this claim cannot go into Prov-22 without amendment. **NEEDS-DISCUSSION.** Bishop must cross-check Prov-21 claim set before counsel review.

**Claim D (Structural Truth-Always Orchestration Protocol):** Reduction-to-practice cites "BP070 canon extended BP078, BP078 reference memory." No specific pearl hashes for Candidates 9 and 11. Same gap as Claim B. Claim language is broad but defensible as a novel orchestration protocol. **PASS (with caveat: pearl hashes missing).**

**Claim E (Four-Renderer-Tree Application Taxonomy):** Reduction-to-practice cites "BP072 canon extended in BP078." Priority flagged LOW by Rook. Claim is narrow to a desktop application architecture. **PASS.**

### Prov-22 Open Actions

1. **Bishop must supply missing pearl hashes for Claims B (Candidates 4-5), D (Candidates 9, 11)** before this document goes to counsel.
2. **Claim C must be cross-checked against Prov-21 claims** to confirm no double-count.
3. **Claim B dependent claim 2 enablement:** the `extraResources` bundling detail is thin. Counsel will likely ask for the exact file layout and runtime invocation command. Knight should supply these from the actual v0.1.27 build.

---

## Section 4 -- Cross-Reference: SEG-R Non-PASS Items

As noted in Section 1, `ANTIGRAVITY_COHESION_PROPOSAL_V2_BP078.md` was NOT delivered. The 4 non-PASS items from SEG-R are unaddressed by Rook in any output file. Status:

| SEG-R Item | V2 Delivered? | Current Status |
|------------|---------------|----------------|
| FAIL: gemma4:12b model name (6b) | NO | Still open. Do not ship FULL card. |
| ND1: forTechies companion edits (5a) | NO | Still open. V2 was to provide diffs. |
| ND2: Poll vs explicit button (4c) | Partially addressed in Scope 4 (explicit button design at Step 7) | Scope 4 includes `CheckoutSuccessStep.tsx` design -- this constitutes Rook's answer. See UX-5: button requires new `verifyStatus` IPC (FAIL). |
| ND3: run_mesh_test.py IPC architecture | NO | Still open. V2 was to provide Knight-spec IPC design. |

---

## Section 5 -- Top Three Highest-Value Items Ready to Ship

**1. Section 3 -- Pathway links fix + 7th pathway (SEG-R items 3a, 3b)**
Both verified PASS by SEG-R. Zero risk. Fix dead `href` in `PathwayMapVisual.tsx` line 23 (`/cold-start/` to `/start/cold-start/`) and add the 7th Broadcast pathway object. Bishop one-shot, 10 lines total. Ship immediately.

**2. Delete `SaltFighterFirstRun.tsx` + merge `FirstStepsView.tsx` into Spine (Scope 4 Section 7)**
`SaltFighterFirstRun.tsx` is confirmed dead code. `FirstStepsView.tsx` is 70 lines and can be merged into `Bp067FirstRunSpine.tsx` as a new spine step. Both are Bishop one-shots. No IPC changes needed. Delivers a cleaner first-run codebase.

**3. Section 2 AppShell FOCUS_ROUTES + CrossPortalNav patch (SEG-R items 2a, 2b)**
Two-line edit. Removes chrome for logged-in users on `/welcome`. Must ship as a pair. Low risk. Bishop one-shot.

---

## Section 6 -- Top Three Risks Needing Founder Decision

**Risk 1: Auth relay mechanism for Step 8 (UX-7)**
Rook proposes a new custom JWT + Edge Function pipeline. The existing `buildAuthRelayUrl` in `crossDomainAuth.ts` already does the same job using Supabase tokens, with no new infrastructure needed. Using the existing pattern eliminates the Edge Function build and reduces Step 8 from Knight-scope to Bishop-scope. **Founder decision: use existing `buildAuthRelayUrl` (fast, already in prod) vs Rook's new JWT pipeline (more work, more surface)?**

**Risk 2: Gauntlet proof step as mandatory Step 3 (UX-10)**
The first-run flow places `runMeshTest` (non-existent IPC) as Step 3 of the mandatory path. A new user with no LAN peer, no Anthropic key, or on a machine without Python will be hard-blocked mid-onboarding. This would make the new first-run UX worse than the current one for most users. **Founder decision: make Gauntlet proof an optional branch ("For the curious"), not the mandatory Step 3?**

**Risk 3: Scope 3 (Initiative Shell) and V2 Cohesion missing -- Knight IPC spec not written**
The `runMeshTest` IPC architecture was explicitly requested in the V2 prompt (NEEDS-DISCUSSION 3). Rook did not deliver it. Without the IPC spec, Knight cannot implement the Gauntlet IPC in a single wave -- Bishop must either write the spec or redispatch Rook. The IPC design work blocking Gauntlet, Step 3 of first-run, and `NetworkValueReveal.tsx` is currently unspecced. **Founder decision: redispatch Rook for V2 + Scope 3, or have Bishop draft the IPC spec directly for Knight?**

---

## Section 7 -- Status of Scopes 2 and 3

**Scope 2 (Prov-22 Candidate Claims):** DELIVERED. `PROV22_CANDIDATE_CLAIMS_BP078.md` present. 5 claims generated. Not counsel-ready yet (missing pearl hashes for Claims B and D, Claim C needs double-count check). Ready for Bishop polish before counsel submission.

**Scope 3 (Initiative Shell Proposal):** NOT DELIVERED at time of SEG-T sealing. File was subsequently delivered and verified by SEG-U -- see Section 8 below.

---

*Receipt sealed by SEG-T. Truth-Always: all live-file citations from direct reads in this session. No snapshot reliance. No em-dashes.*

---

## Section 8 -- Scope 3: Initiative Shell Proposal (SEG-U Verification)

**Verifier:** SEG-U (Sonnet 4.6, Statute ss3)
**Timestamp:** 2026-06-08
**File verified:** `C:\Users\Administrator\Documents\AntigravityWorkspace\outputs\INITIATIVE_SHELL_PROPOSAL_BP078.md`
**Live tree read:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\`

### Executive Summary

| Verdict | Count |
|---------|-------|
| PASS | 6 |
| FAIL | 2 |
| NEEDS-DISCUSSION | 4 |

---

### Item S3-1: `initiativeWalkthroughs.ts` line range claim (lines 42-800)

Rook states: "Pulls data from `platform\src\data\initiativeWalkthroughs.ts` (lines 42-800)."

Live file: `initiativeWalkthroughs.ts` is 1046 lines. Line 42 is the start of the `WALKTHROUGHS` const array. Line 800 is mid-file (inside MSA walkthrough steps). The array continues to approximately line 1000+.

**FAIL.** The "lines 42-800" range is inaccurate -- the array spans lines 42 to approximately 1020+. The claim understates the file's extent by ~25%. This is a minor accuracy issue (not a blocking risk), but the shell's `InitiativeAboutWalkthrough.tsx` must import the full `getWalkthrough()` function, not assume the array ends at line 800. The function `getWalkthrough` and `getCueCard` already exist and are the correct abstraction to use. Rook should cite the exported functions, not raw line ranges.

---

### Item S3-2: `InitiativeCueCard.tsx` location claim (InitiativePage.tsx line 392)

Rook states: "currently defined in `platform\src\pages\InitiativePage.tsx`, line 392."

Live file: `InitiativePage.tsx` line 391-395 renders `<InitiativeCueCard card={cueCard} />`. However, `InitiativeCueCard` is NOT defined in `InitiativePage.tsx` -- it is imported from `@/components/initiatives/InitiativeCueCard`. The component already exists as a standalone reusable file: `platform/src/components/initiatives/InitiativeCueCard.tsx`.

**FAIL.** Rook misattributes the component's source. `InitiativeCueCard` is already a standalone reusable component at `platform/src/components/initiatives/InitiativeCueCard.tsx`. Line 392 of `InitiativePage.tsx` is only a usage site, not the definition. The shell proposal's `InitiativeCueCard.tsx` sub-component is ALREADY BUILT -- no new file needs to be created for it.

**Impact:** Positive. This means one of the five shell sub-components (`InitiativeCueCard.tsx`) is already done and reusable. The shell just needs to import it.

---

### Item S3-3: Six generic-template initiatives -- dedicated page check

Rook claims these 6 initiatives "lack a dedicated page" and operate on the generic template: Rally Group, VSL, Brass Tacks, Power to the People, MSA, The Family Table.

Live codebase check:

| Initiative | Dedicated Page File | Assessment |
|------------|--------------------|-|
| Rally Group | `platform/src/pages/RallyGroupPage.tsx` (844 lines) | Deep-build: has 6-tab layout, live Supabase query to `rally_alerts`, orientation flow, chalkboard, Marks history, walkthrough. NOT a generic template. |
| VSL | `platform/src/pages/VSLPage.tsx` (789 lines) | Deep-build: has 5-tab layout, live Supabase queries to `vsl_vouch_requests` and `vsl_vouches`, request+browse+circle flow. NOT a generic template. |
| Brass Tacks | `platform/src/pages/BrassTacksPage.tsx` (real-data wired, BP073 W9) | Deep-build: guild master profiles, Supabase-wired, multi-tab. NOT a generic template. |
| Power to the People | `platform/src/pages/PowerToThePeoplePage.tsx` | Semi-built: has sample district/rep data with full tab structure, voting tracking, congressional rep display. NOT a bare generic template. |
| MSA | `platform/src/pages/MSAPage.tsx` (BP073 W8, real-data wired) | Deep-build: MSA account Supabase wiring, group purchase, savings illustrations. NOT a generic template. |
| The Family Table | `platform/src/pages/FamilyTablePage.tsx` (BP073 W7, real-data wired) | Deep-build: family gatherings Supabase wiring, RSVP, resource sharing, Dialog flows. NOT a generic template. |

**FAIL (Core Premise).** Rook's central premise is incorrect: NONE of the 6 named initiatives lack a dedicated page. All 6 have substantial, wired, multi-tab dedicated pages that are functionally equivalent to (or more built-out than) the "deep-build" pages Rook treats as the exemptions (LetsMakeDinner, DefenseKlaus). The "6 generic-template initiatives" framing is not supported by the live tree.

**NEEDS-DISCUSSION.** The correct reframe: some of these pages have functional stubs (TODOs in mutation handlers) while others have live Supabase wiring. The UniformInitiativeShell value proposition shifts from "these are generic, let's add action panels" to "these already have complex UI; the shell's value is unifying the HERO/WALKTHROUGH/CUE-CARD outer chrome across ALL 16, not replacing the existing action areas." The `InitiativeActionPanel` injection-slot model remains valid, but the migration path in Section 2 of the proposal (responder intake form, lending circle form, etc.) describes work that is partially already done inside each page.

---

### Item S3-4: `useCoopEvents` hook -- existing reuse opportunity

Rook proposes a new `useCoopEvents` stub hook. SEG-U searched the live codebase for any similar hook or context.

Findings:
- No `useCoopEvents` or equivalent hook exists anywhere in the live codebase. The hook is genuinely new.
- The existing `analytics.ts` (`platform/src/lib/analytics.ts`) already implements `trackEvent(eventType, properties)` with cooperative-platform event types including `initiative_viewed`, `initiative_joined`, `cue_card_viewed`, and `meal_ordered`. The function is Supabase-backed, batched, privacy-respecting, and fire-and-forget.
- The proposed `useCoopEvents.trackEvent` stub is a console.log wrapper. The `analytics.trackEvent` function already does the same job with actual persistence, batching, and a path to Supabase RPC.

**NEEDS-DISCUSSION.** Rather than introducing a new `useCoopEvents` stub that just `console.log`s, the proposal should wrap or extend the existing `analytics.trackEvent` from `platform/src/lib/analytics.ts`. The cooperative value event types (`onReview`, `onNodeStart`, `onShare`, `onActionCompleted`) can be added to `AnalyticsEventType` in `analytics.ts` with zero new infrastructure. This eliminates the new hook entirely and routes coop events through the existing persistence pipeline.

**Recommendation:** Do NOT ship the `useCoopEvents` stub as written. Extend `analytics.ts` with the 4 new event types instead. This is a Bishop one-shot (4 new lines in the `AnalyticsEventType` union + wrapper functions matching the proposed signatures).

---

### Item S3-5: Six Steps navigation -- InitiativeProjectsPage existing affordance

Rook proposes a new Left Sidebar or Mega-Menu grouped by Six Steps. SEG-U checked `InitiativeProjectsPage.tsx` for any existing Six Steps grouping.

Live `InitiativeProjectsPage.tsx`: The `SWEET_SIXTEEN` array at lines 26-228 already has a `step` property on every initiative object. The array is ordered by Six Steps (comment at line 22: "Sweet Sixteen -- ordered by Six Steps (ratified BP071 Scope 1, 2026-06-02) // Step 2 Feed Your Neighbors: #1-4 | Step 3 Employ the World: #5-8..."). However, the rendered card grid (line 387+) does NOT group by step -- it renders all 16 cards in a flat grid with no section headers or sidebar navigation.

**PASS (design intent validated).** The data model already supports Six Steps grouping (every initiative has a `step` field). The UI does not yet render group headers or a sidebar. Rook's proposal to add structural navigation is valid and the data is ready. No new data layer needed -- only a UI rendering change. Grouping the flat grid into step-labeled sections is a Bishop one-shot.

**NEEDS-DISCUSSION.** A Left Sidebar is heavy UI work and may conflict with the `PortalPageLayout` max-width constraints. The simpler path using the existing `step` field: add visual section headers between initiative groups in the existing flat grid (no sidebar required). This delivers the Six Steps structural navigation as a same-session Bishop change. Founder should decide: section headers in grid (simple, ship fast) vs Left Sidebar/Mega-Menu (more complete, Knight-scope).

---

### Item S3-6: UniformInitiativeShell `children` prop -- deep-build wrapping feasibility

Rook proposes: "The `UniformInitiativeShell` must accept `children` as the primary action area, allowing deep-builds to pass their complex components directly."

SEG-U checked `LetsMakeDinnerPage.tsx` and `DefenseKlausPage.tsx`:

- `LetsMakeDinnerPage.tsx`: Top-level component renders inside `<LaunchConditionOverlay>` + `<PortalPageLayout>`. It uses `useNavigate`, `useQuery`, `useAuth`, `useSeamlessOnboard`. Its routing is NOT React Router sub-routing -- it is tab-based within the single page component. No separate nested routes. The page does NOT have a Hero/About/CueCard section that matches the proposed shell anatomy -- it goes straight into meal listing UI.
- `DefenseKlausPage.tsx`: Renders inside `<LaunchConditionOverlay>` + `<PortalPageLayout>`. Uses `useQuery`, `useMutation`. Has tabs for Safety Reports, Network Members, etc. No e-commerce checkout in this file (note: the proposal's mention of "custom e-commerce checkout and donation-split logic" may refer to an older or separate component -- the live file is the community safety coordination page, not a product checkout page).

**PASS (feasibility confirmed with caveat).** The `children` slot pattern is valid. The deep-build pages' outer `<LaunchConditionOverlay>` + `<PortalPageLayout>` wrappers can be replaced by the `UniformInitiativeShell` outer chrome. The existing tabbed content becomes the `children` passed to the `InitiativeActionPanel` slot. No sub-routing is in use in these pages, so no routing breakage risk.

Caveat on DefenseKlaus: The live `DefenseKlausPage.tsx` is the community-safety page, NOT the product checkout page described in Rook's risk register ("custom e-commerce checkout and donation-split logic"). If a Defense Klaus product page exists separately, it was not found in this search. The risk register item as written does not match the live file. This is either stale content in the proposal or there is a second Defense Klaus page not yet built. Flag for Founder.

---

### Item S3-7: Six Steps hierarchy in proposal -- accuracy check against InitiativeProjectsPage

Rook's Section 4 hierarchy:
- Step 2 Feed Your Neighbors: Dinner, Groceries, Family Table, Bread -- CORRECT (matches live `SWEET_SIXTEEN` step fields).
- Step 3 Employ the World: Shopping, Concierge, Defense Klaus, Rally Group -- CORRECT.
- Step 4 Build Businesses & Make Things: VSL, Brass Tacks -- CORRECT.
- Step 5 Power to the People: Power to the People, Health Accords, MSA -- CORRECT.
- Step 6 Belong Together: Harper Guild, Jukebox, Didasko -- CORRECT.
- Step 1 "Level the Field" is absent from the hierarchy. The SWEET_SIXTEEN data has 16 initiatives; Step 1 is not represented in the grid (all 16 map to Steps 2-6). This is not an error -- Step 1 is the platform itself, not a Sweet Sixteen initiative. Rook's hierarchy is accurate.

**PASS.**

---

### Item S3-8: Implementation Order recommendation

Rook's Section 5 recommends: 1 = Rally Group, 2 = Family Table, 3 = VSL.

Given the live-tree finding that all three already have substantial dedicated pages (not generic shells), the implementation order reframes as:
1. **Rally Group** is the most appropriate first shell-wrap target because the outer Hero/Walkthrough/CueCard chrome is present but mixed into the page body rather than being a reusable shell. Wiring the `UniformInitiativeShell` around RallyGroupPage is the most instructive pattern-setter.
2. **The Family Table** has a clean separation between header/action/walkthrough sections in `FamilyTablePage.tsx`, making it the second easiest wrap.
3. **VSL** has the most complex tab structure of the three, making it third.

**PASS (implementation order is reasonable).** The rationale shifts, but the order holds.

---

### Summary: Top Three Ship-Ready Items from Scope 3

1. **`InitiativeCueCard.tsx` already built** -- the shell's cue card sub-component exists at `platform/src/components/initiatives/InitiativeCueCard.tsx`. Rook's proposal already uses the correct import pattern. Zero new work for this sub-component.
2. **Six Steps grid grouping** -- add step-label section headers to the existing flat grid in `InitiativeProjectsPage.tsx` using the already-present `step` field on each initiative object. Bishop one-shot, zero new data layer.
3. **Replace `useCoopEvents` stub with `analytics.ts` extension** -- add 4 event types to `AnalyticsEventType` union and 4 wrapper functions. Eliminates new hook, routes through existing persistence pipeline. Bishop one-shot.

### Top Risks from Scope 3

1. **Core premise mismatch (FAIL S3-3):** The 6 "generic template" initiatives are all deep-builds. The shell migration plan needs to be rewritten as a "chrome unification" effort, not an "uplift from generic" effort. The `InitiativeActionPanel` injection slot is still valid, but the Minimum Viable Actions in Section 2 (responder forms, waitlist forms, etc.) are partially already built inside each page's existing tabs. Risk of duplicate UI if Section 2 is implemented without first auditing each page's existing action areas.
2. **DefenseKlaus checkout description mismatch (NEEDS-DISCUSSION S3-6):** The live `DefenseKlausPage.tsx` is the community safety page, not a product checkout page. Rook's risk register item about "e-commerce checkout and donation-split logic" does not match the live file. If a separate product/checkout page exists and was not found, it needs to be located before the shell design finalizes.
3. **Left Sidebar scope (NEEDS-DISCUSSION S3-5):** Rook's Six Steps navigation as a Left Sidebar is Knight-scope UI work. The data is ready for a simpler grid section-header implementation today. Founder must decide scope before Knight receives the build brief.

### Drift from SEG-O3 Findings

SEG-T did not cover Scope 3 in detail (it was marked NOT DELIVERED). No drift to report -- this is the first verification of Scope 3. The core finding (pages are more built-out than Rook assumed) is new information.

---

*Section 8 sealed by SEG-U. Truth-Always: all live-file citations from direct reads in this session. No snapshot reliance. No em-dashes.*

---

## Section 9 -- Scope V2 Verification (SEG-Y)

**Verifier:** SEG-Y (Sonnet 4.6, Statute ss3)
**Timestamp:** 2026-06-08
**File verified:** `C:\Users\Administrator\Documents\AntigravityWorkspace\outputs\ANTIGRAVITY_COHESION_PROPOSAL_V2_BP078.md`
**Live tree read:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\`
**Sources of truth:** (a) live codebase, (b) SEG-T receipt findings above, (c) Pawn verdict in `PROMPT_1_V2_TIGHTENED.md`

---

### Step 1 -- Per-Section Proposed Changes Inventory

**Section A (SKU FULL Card):** Two markup paths for `Cephas/cephas-hugo/layouts/download/list.html`. Path 1 = disabled "Coming Soon" button with "Model TBD" text, no model name cited. Path 2 = live `<a>` linking `{{ .Site.Params.fullDownloadUrl }}` once Knight delivers binary. Uses `.mn-v2-tier-card` class and `#0a1628` background.

**Section B (Gauntlet Visibility):** Retire `forTechies` flag entirely. Concrete diffs for `MnemosyneTabView.tsx`: DELETE line 65 (`LS_FOR_TECHIES` const), DELETE lines 134-136 (state declaration), MODIFY line 157 (comment), MODIFY line 161 (remove `forTechies` guard from `resolveDefaultTab`), MODIFY lines 324-328 (remove `if (t.id === 'gauntlet') return forTechies` from visibleTabs filter), DELETE lines 664-688 ("For Techies ->" button block).

**Section C (Post-Stripe Checkout):** Component sketch for `FirstStepsView.tsx`. Adds `checkoutOpened` boolean state. Swaps "Join Cooperative ($5)" button for "I have completed checkout" button. The verification callback calls `window.amplify.getAMPLIFYSnapshot()` and checks `snap.membership_active`.

**Section D (runMeshTest IPC):** Full Knight-facing IPC spec. Handler: `ipcMain.handle('run-mesh-test', ...)`. Uses `child_process.spawn` on `librarian-mcp/r10_cross_vendor/run_mesh_test.py`. Payload schema: `{ testId?, timeoutMs? }`. Result schema: `{ success, grading?, error? }`. Error codes: `MISSING_API_KEY`, `TIMEOUT`, `PYTHON_ERROR`, `MISSING_PYTHON_RUNTIME`. 45,000ms hard timeout via `AbortController`. `amplify.d.ts` declaration provided.

**Section E: MISSING.** The prompt explicitly required a Section E redesigning Step 7 + Step 8 around `buildAuthRelayUrl`. Rook did not deliver this section. `membership.verifyStatus()` and `membership.generateRelayToken()` remain unaddressed as standalone replacements. No redesign of the first-run Step 7 or Step 8 flow appears anywhere in V2.

**Section F: MISSING.** The prompt explicitly required a Section F with the Gauntlet Step 3 graceful-fallback redesign (static BP067 numbers as fallback when `runMeshTest` fails). Rook did not deliver this section. The graceful-fallback architecture is fully absent from V2.

**Section G (Founder Attention Items):** Two items: (1) `getAppVersion()` silently catches exceptions at `MnemosyneTabView.tsx` line 173 -- non-fatal debuggability note. (2) Developer tab uses similar `devEnabled` gate (`MnemosyneTabView.tsx` line 122) -- Founder should verify if dev tools should also be open-by-default in future.

---

### Step 2 -- Per-Section Live File Verification

**V2-A (SKU FULL Card):**
- `.mn-v2-dl-btn` class: CONFIRMED LIVE at `list.html` line 910 on the single existing download button.
- `#0a1628` background: CONFIRMED LIVE at `list.html` line 24 (page-level background) and line 13 (inline style on body).
- `.mn-v2-tier-card` class: NOT FOUND anywhere in `list.html`. The live page uses a single `<a class="mn-v2-dl-btn">` pattern, not a `mn-v2-tier-card` container. Rook introduces a CSS class that does not exist.
- `{{ .Site.Params.fullDownloadUrl }}`: Hugo param reference, not yet defined in site config. This is future-safe (Hugo would render empty string or a Founder-configured value).
- No `gemma4` model name appears in V2 Path 1 or Path 2. Path 2 uses `gemma2:9b` as a parenthetical example with `e.g.` qualifier -- a placeholder example, not a hard claim.
- **VERDICT: PASS with minor caveat.** The two-path structure solves the FAIL. The `.mn-v2-tier-card` class is assumed-new (no definition provided); Knight or Bishop must add the CSS. The `gemma2:9b` example in Path 2 is appropriately qualified with `e.g.`. The live page already has v0.1.27 with a bundled model (line 914 confirms "bundled AI"), so Path 1 may actually already be superseded -- the page serves v0.1.27. NEEDS-DISCUSSION: Founder should confirm whether a FULL vs LITE SKU split still applies to v0.1.27 or whether this section is now moot given the current live page.

**V2-B (Gauntlet Visibility):**
- Line 65 `LS_FOR_TECHIES`: CONFIRMED at `MnemosyneTabView.tsx:65`. Delete is accurate.
- Lines 134-136 `forTechies` state: CONFIRMED at `MnemosyneTabView.tsx:134-136`. Delete is accurate.
- Line 157 comment "Gauntlet hidden behind For Techies": CONFIRMED at `MnemosyneTabView.tsx:157`. Modify is accurate.
- Line 161 `resolveDefaultTab` guard `(saved !== 'gauntlet' || forTechies)`: CONFIRMED at `MnemosyneTabView.tsx:161`. Remove is accurate.
- Lines 324-326 `if (t.id === 'gauntlet') return forTechies`: CONFIRMED at `MnemosyneTabView.tsx:326`. Remove is accurate.
- Lines 664-688 "For Techies ->" button: CONFIRMED at `MnemosyneTabView.tsx:669-692`. The live block runs lines 669-692. Rook cites 664-688. The diff content matches the live code exactly (same JSX, same styles). Minor line offset (664 vs 669) does not affect correctness of the delete.
- **VERDICT: PASS.** All 6 companion edits are correctly identified with accurate line citations (within 5 lines). Knight or Bishop can apply these diffs directly. This fully addresses SEG-R NEEDS-DISCUSSION 1.

**V2-C (Post-Stripe Checkout):**
- `FirstStepsView.tsx` exists: CONFIRMED (SEG-T receipt, Section 2 table).
- `getAMPLIFYSnapshot`: CONFIRMED at `amplify.d.ts:185` -- `getAMPLIFYSnapshot: () => Promise<AMPLIFYSnapshot>`. The IPC surface exists.
- `snap.membership_active`: FAIL. `AMPLIFYSnapshot` interface at `amplify.d.ts:25-39` contains: `total_queries`, `substrate_hits`, `local_ollama_served`, `cloud_escalations`, `peer_synced`, `substrate_hit_ratio`, `local_ratio`, `cloud_ratio`, `total_cloud_cost_avoided_usd`, `total_tokens_saved_est`, `avg_latency_ms`, `index_size`, `as_of`. There is NO `membership_active` field. Rook's sketch accesses `snap.membership_active` -- this field does not exist on `AMPLIFYSnapshot`.
- **VERDICT: FAIL.** `getAMPLIFYSnapshot()` exists but `membership_active` is not in its return type. Reading `snap.membership_active` will always be `undefined`, meaning the verification button will always show the error state "We don't see your membership yet." regardless of actual membership status. Additionally, this uses `getAMPLIFYSnapshot` as a membership check, which is an architectural misuse -- the snapshot is a telemetry summary, not an auth state query. The correct pattern is `window.amplify.getAuthState()` (confirmed at `amplify.d.ts:199`) which returns `AuthState` with `status: 'member'`. This is a new assumed-IPC FAIL: `snap.membership_active` does not exist.

**V2-D (runMeshTest IPC):**
- `run_mesh_test.py` location cited: `librarian-mcp/r10_cross_vendor/run_mesh_test.py`. CONFIRMED by SEG-T receipt Section 2 item UX-10 and SEG-R receipt.
- `amplify.d.ts` declaration for `runMeshTest`: V2 provides it. The declaration does not exist in the live `amplify.d.ts` (confirmed absent by SEG-T receipt item UX-10). V2's declaration is the spec for Knight to add.
- `AbortController` for 45,000ms timeout: valid Node.js pattern for `child_process.spawn`.
- ANTHROPIC_API_KEY fallback from LockBox `SDS.env`: reasonable pattern, not verified against a specific live LockBox implementation, but the sentinel-return design is sound.
- **VERDICT: PASS.** The IPC spec is detailed enough for Knight to implement. Error contract covers the four failure modes. `amplify.d.ts` declaration is provided. This addresses SEG-T FAIL 3 and SEG-R NEEDS-DISCUSSION 3 at the spec level.

**V2-E: MISSING. NOT ASSESSED.**

**V2-F: MISSING. NOT ASSESSED.**

**V2-G (Founder Attention Items):**
- `getAppVersion()` silent catch at line 173: CONFIRMED at `MnemosyneTabView.tsx:173` -- `window.amplify?.getAppVersion?.().then((v) => setAppVersion(v?.version ?? '')).catch(() => {})`. The catch is indeed empty/silent. Observation is accurate.
- `devEnabled` gate at line 122: CONFIRMED at `MnemosyneTabView.tsx:122-124` -- `const [devEnabled, setDevEnabled] = useState(() => localStorage.getItem(LS_DEVELOPER_MODE) === 'true')`.
- **VERDICT: PASS.** Both observations are accurate. Non-blocking Founder attention items.

---

### Step 3 -- Cross-Check: SEG-T 3 FAILs from Scope 4

| SEG-T FAIL | V2 Item | Status |
|------------|---------|--------|
| `membership.verifyStatus()` does not exist (`amplify.d.ts:267-269`) | Not addressed in V2. V2 Section C uses `getAMPLIFYSnapshot().membership_active` instead -- itself a new FAIL (field does not exist). Section E (the correct redesign location) is MISSING. | NOT-ADDRESSED |
| `membership.generateRelayToken()` does not exist | Not addressed in V2. Section E is MISSING. | NOT-ADDRESSED |
| `window.amplify.runMeshTest()` does not exist | V2 Section D provides the IPC spec for Knight to implement. The spec covers handler, payload, result schema, error codes, timeout strategy, and `amplify.d.ts` declaration. | ADDRESSED (spec level -- Knight still needs to build) |

---

### Step 4 -- Cross-Check: Founder Decision on `buildAuthRelayUrl`

**Founder binding:** Use `buildAuthRelayUrl` from `platform/src/utils/crossDomainAuth.ts`. Do NOT propose a new custom JWT or Edge Function.

**V2 Section C** uses `getAMPLIFYSnapshot()` for post-Stripe membership verification. This does NOT invoke `buildAuthRelayUrl` -- it is a telemetry snapshot check, not an auth relay. This section is about the post-Stripe explicit button, not the relay flow, so `buildAuthRelayUrl` is not directly required here.

**V2 Section E is MISSING.** Section E was the designated location for the Step 7 + Step 8 redesign around `buildAuthRelayUrl`. That section was not delivered. The custom JWT pipeline from Rook's Scope 4 (`FIRST_RUN_UX_ARCHITECTURE_BP078.md`) therefore stands as the only Rook design for Steps 7-8, using `membership.generateRelayToken()` and a custom Edge Function -- the exact design the Founder binding ruled out.

`buildAuthRelayUrl` exists and is production-ready at `platform/src/utils/crossDomainAuth.ts:10-19`. It uses hash-fragment relay with Supabase `access_token` + `refresh_token`, no JWT, no Edge Function. `consumeAuthRelay()` handles the web-side parse. V2 neither uses it nor explicitly replaces it with a compliant alternative.

**VERDICT: DEVIATION.** V2 does not apply `buildAuthRelayUrl` to Step 7 or Step 8. Section E is absent. The binding is unaddressed.

---

### Step 5 -- Cross-Check: Pawn's One-Fix-First (showOnboardAsk wire)

Pawn's one-fix-first: wire `showOnboardAsk` to fire immediately after Step 3 "Ask it anything" success click. Bishop committed to shipping this inline on the cohesion branch.

V2 does NOT propose the `showOnboardAsk` wire. Per the prompt ("Bishop will ship Pawn's one-fix-first inline"), V2 is not required to include it. However, V2 Section C designs the downstream checkout flow (`FirstStepsView`) which is only reachable once `showOnboardAsk` fires. V2's design of the explicit "I have completed checkout" button is structurally compatible with the `showOnboardAsk` trigger path -- it does not block or contradict it.

**VERDICT: COMPATIBLE.** V2 correctly designs around the assumption that `showOnboardAsk` will be wired by Bishop separately. No conflict introduced.

---

### Step 6 -- Cross-Check: `getAMPLIFYSnapshot()` Usage in V2

**Found:** V2 Section C, line 129: `const snap = await window.amplify.getAMPLIFYSnapshot();`

**Function existence:** `getAMPLIFYSnapshot` is declared at `amplify.d.ts:185` as `getAMPLIFYSnapshot: () => Promise<AMPLIFYSnapshot>`. The function EXISTS. It is not an assumed-IPC FAIL.

**Field existence:** `snap.membership_active` at V2 Section C line 130. `AMPLIFYSnapshot` interface at `amplify.d.ts:25-39` does NOT contain `membership_active`. This field does not exist. This IS a new assumed-field FAIL introduced by V2.

**VERDICT:** `getAMPLIFYSnapshot()` itself is valid and exists. `snap.membership_active` does not exist on its return type. The check will silently return `undefined` (falsy), causing the "We don't see your membership yet" error to always fire. This is a FAIL specific to the field access, not the IPC call.

---

### Aggregate Verdict Counts (V2)

| Verdict | Count | Items |
|---------|-------|-------|
| PASS | 4 | V2-A (with caveat), V2-B, V2-D, V2-G |
| FAIL | 2 | V2-C (snap.membership_active does not exist), V2 missing Sections E+F (two required deliverables not produced) |
| NEEDS-DISCUSSION | 1 | V2-A caveat: v0.1.27 already live with bundled AI -- FULL vs LITE SKU split may be moot |

---

### Top Three Ship-Ready Items from V2

1. **V2-B Gauntlet ungate (Section B):** All 6 companion edits to `MnemosyneTabView.tsx` are verified accurate against live file. Line citations are correct within 5 lines. This is a Bishop one-shot. Ship immediately.

2. **V2-D runMeshTest IPC spec (Section D):** Detailed enough for Knight. Covers handler name, payload schema, result schema, 4 error codes, 45-second AbortController timeout, Python ENOENT handling, and `amplify.d.ts` declaration. Knight can implement from this spec without a design round.

3. **V2-A SKU FULL card paths (Section A):** Path 1 (Coming Soon, disabled) is safe to apply to `list.html` today using the existing `.mn-v2-dl-btn` class. NOTE: Founder should first confirm whether a FULL vs LITE split still applies given v0.1.27 is already live with bundled AI. If the SKU split is confirmed, Bishop must also define `.mn-v2-tier-card` CSS (missing from the proposal).

---

### Items Rook Still Needs to Address

1. **Section E (Step 7 + Step 8 redesign around `buildAuthRelayUrl`):** NOT DELIVERED. This is a Founder-bound requirement. Rook must produce: a redesigned first-run Step 7 (thin Supabase query for membership status using `window.amplify.getAuthState()`, not `membership.verifyStatus()`) and Step 8 (use `buildAuthRelayUrl` from `crossDomainAuth.ts` for the web portal handoff, no custom JWT, no Edge Function). This eliminates both SEG-T FAILs for `membership.verifyStatus` and `membership.generateRelayToken`.

2. **Section F (Gauntlet Step 3 graceful-fallback):** NOT DELIVERED. Rook must produce the renderer-side design for when `runMeshTest` returns a failure code: show static BP067 numbers (`pearl_88a8c069`, 20/20 hash-verified, p50 16.6ms, +100pp resolution) as evidence. Include the optional skip link. This makes the Gauntlet step safe for users with no LAN peer or no API key.

3. **Section C `snap.membership_active` fix:** V2 Section C must be corrected. Replace `getAMPLIFYSnapshot()` with `window.amplify.getAuthState()` and check `authState.status === 'member'`. `getAuthState` is declared at `amplify.d.ts:199`. This removes the assumed-field FAIL and uses the correct auth surface.

4. **`.mn-v2-tier-card` CSS definition:** If the FULL SKU card is still required, Section A must include the CSS class definition for `.mn-v2-tier-card` or Rook must confirm an existing class to reuse.

---

*Section 9 sealed by SEG-Y. Truth-Always: all live-file citations from direct reads in this session. No snapshot reliance. No em-dashes.*
