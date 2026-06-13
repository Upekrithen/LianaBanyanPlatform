# BP078 Final Implementation Spec
**Synthesized by SEG-Z (Sonnet 4.6, Statute ss3) · 2026-06-08**
**Sources:** Rook v1 + v2, FIRST_RUN_UX_ARCHITECTURE, INITIATIVE_SHELL_PROPOSAL, PROV22_CANDIDATE_CLAIMS; SEG-R, SEG-T, SEG-U verification receipts; Pawn independent verdict (all inlined in PROMPT_1_V2_TIGHTENED.md); Founder binding decisions.
**No em-dashes. Truth-Always. Brick Wall applied throughout.**

---

## Section 1: BISHOP-SHIPPED on bp078-cohesion-ship-ready branch

These items are either already done (via SEG-V / SEG-X) or are confirmed Bishop one-shots that can ride the same branch before merge.

**Item 1.1 -- PathwayMapVisual route fix + 7th pathway sync**
- File: `platform/src/components/v2/welcome/PathwayMapVisual.tsx` line 23
- Change: `href={\`/cold-start/${pathway.slug}\`}` to `href={\`/start/cold-start/${pathway.slug}\`}`
- Add: 7th pathway object `{ name: 'Broadcast', slug: 'broadcast' }` to the PATHWAYS array to match ColdStartHub.tsx (which lists 7 pathways at lines 18, 30, 44+)
- Verified PASS by SEG-R items 3a and 3b. Zero risk. Dead links fixed. 6-line PATHWAYS addition.

**Item 1.2 -- AppShell FOCUS_ROUTES /welcome + CrossPortalNav /welcome guard**
- File: `platform/src/AppShell.tsx`
- Change 2a: Add `'/welcome'` and `'/pathways'` to FOCUS_ROUTES array at line 52. This flips `showChrome = false` for logged-in users on /welcome. (Non-logged users are already chrome-free. This fix targets logged-in users only -- narrower than Rook framed, but still correct.)
- Change 2b: Modify line 82 from `{!isLanding && <CrossPortalNav />}` to `{!isLanding && location.pathname !== '/welcome' && <CrossPortalNav />}`
- Both changes must ship as a pair. Verified PASS by SEG-R items 2a/2b.

**Item 1.3 -- SaltFighterFirstRun retire**
- File: `src/renderer/components/SaltFighterFirstRun.tsx`
- Action: Delete the file entirely. SEG-T confirmed it is dead code (safe delete). Note from Pawn: this component holds the only 16-initiatives grid presentation -- but that grid is NOT in the active onboarding path and Rook's FIRST_RUN_UX_ARCHITECTURE replaces it. Deleting is correct.

**Item 1.4 -- Pawn one-fix-first: wire showOnboardAsk after Step 3 success**
- Pawn verdict: "Wire `showOnboardAsk` to fire immediately after the Step 3 success screen 'Ask it anything' click." This single wire restores the broken join path and makes FirstStepsView reachable for the first time. SEG-X is building this inline on the branch. It is one line in `Bp067FirstRunSpine.tsx` in the `handleOnboardChoice` callback / success screen handler. Confirm SEG-X landed it before merge.

**Item 1.5 -- buildAuthRelayUrl wiring in FirstStepsView.tsx**
- File: `src/renderer/components/FirstStepsView.tsx`
- Change: Add `import { useAuth } from '@/hooks/useAuth'` (or equivalent auth hook). In the checkout URL generation block, wrap `result.url` with `buildAuthRelayUrl(result.url, session)` from `platform/src/utils/crossDomainAuth.ts` before passing to `window.amplify.openExternal`.
- SEG-R item 4a: PASS. Infrastructure exists. 2-3 line change. Relay is hash-fragment-based (safe; hash not sent to server). Companion `consumeAuthRelay()` on web side already handles consumption at app boot. No new Edge Function needed (Founder binding 1 is honored).

**Section 1 total: 5 items (1 confirmed in-flight via SEG-X, 4 ready to ship or verify)**

---

## Section 2: BISHOP SEG One-Shots (small, safe, ship after Section 1 merges)

**Item 2.1 -- Drop useCoopEvents stub; extend analytics.ts with 4 new event types**
- File: `platform/src/lib/analytics.ts`
- Action: Do NOT create the `useCoopEvents` hook Rook proposed in INITIATIVE_SHELL_PROPOSAL section 3. SEG-U verified that `analytics.ts` already implements `trackEvent(eventType, properties)` with Supabase-backed persistence, batching, and a fire-and-forget pipeline. The 4 coop event types (`onReview`, `onNodeStart`, `onShare`, `onActionCompleted`) are new additions to the existing `AnalyticsEventType` union.
- Concrete change: Add 4 new string literals to the `AnalyticsEventType` union in `analytics.ts`. Add 4 thin wrapper functions with the payload types Rook specified in Scope 3 section 3. Zero new infrastructure. Routes cooperative value events through the existing persistence pipeline.
- SEG-U item S3-4: NEEDS-DISCUSSION resolved by Brick Wall -- use analytics.ts, do not create the stub.

**Item 2.2 -- Six Steps section headers on InitiativeProjectsPage.tsx using existing step field**
- File: `platform/src/pages/InitiativeProjectsPage.tsx`
- Context: `SWEET_SIXTEEN` array at lines 26-228 already has a `step` property on every initiative (ordered by Six Steps per BP071 comment at line 22). The rendered card grid (line 387+) renders all 16 in a flat grid with no section headers.
- Change: Before rendering each initiative card, check if it is the first card for its `step` value. If so, insert a section header `<h3>` or `<div>` with the Six Steps label (e.g., "Step 2: Feed Your Neighbors"). No sidebar, no mega-menu -- those are Knight-scope. This is a Bishop one-shot using data that already exists.
- SEG-U item S3-5: NEEDS-DISCUSSION resolved by Brick Wall -- section headers in the existing grid, not a Left Sidebar. Sidebar is deferred to Section 6.

**Item 2.3 -- Reuse existing InitiativeCueCard.tsx (do not rebuild)**
- File: `platform/src/components/initiatives/InitiativeCueCard.tsx`
- Status: ALREADY EXISTS as a standalone reusable component. SEG-U item S3-2 confirmed: Rook misattributed it to InitiativePage.tsx line 392 (that is a usage site, not the definition). The UniformInitiativeShell proposal just needs to import it -- no new file needed.
- Action for Bishop: When the UniformInitiativeShell wrapper is built (see Section 3), import InitiativeCueCard from the existing path. Document this in the Knight wave brief.

**Item 2.4 -- MnemosyneTabView.tsx forTechies full removal with all 3 companion edits**
- File: `src/renderer/components/MnemosyneTabView.tsx`
- All diffs are provided verbatim in Rook V2 Section B. Bishop can apply these directly. The 4 changes are:
  - DELETE line 65: `const LS_FOR_TECHIES = 'mnemo_for_techies_unlocked';`
  - DELETE lines 134-136: `forTechies` useState declaration
  - MODIFY line 157: update stale comment
  - MODIFY line 161: remove `(saved !== 'gauntlet' || forTechies)` guard
  - MODIFY lines 324-328: remove `if (t.id === 'gauntlet') return forTechies;` from visibleTabs filter
  - DELETE lines 664-688: the "For Techies ->" button block
- SEG-R confirmed forTechies appears ONLY in MnemosyneTabView.tsx -- no cascading failures in sibling files.
- Ship after Section 1 merges (Gauntlet will now be visible to all users by default).

**Item 2.5 -- amplify.d.ts membership.createCheckout url field fix**
- File: `amplify.d.ts` (renderer types)
- SEG-T UX-4 caveat: `membership.createCheckout` return type declaration is missing `url?: string`, but FirstStepsView.tsx line 46 casts to include it at runtime. Add `url?: string` to the declared return type to eliminate the pre-existing type inconsistency.
- One-line change. Zero risk.

**Section 2 total: 5 items**

---

## Section 3: KNIGHT-WAVE BUILDS

### Item 3.1 -- window.amplify.runMeshTest() IPC handler

**Handler name:** `ipcMain.handle('run-mesh-test', async (event, payload) => { ... })`

**Source file location:** `librarian-mcp/r10_cross_vendor/run_mesh_test.py` (confirmed by SEG-R). This is NOT in src/renderer. Knight must decide: (a) shell-out to this path directly (developer/internal only, not suitable for packaged user installs) OR (b) copy the script to an `extraResources` path for packaging. For BP078, use sandbox-shell-out (option a) because this feature is Gauntlet-tab targeted at users who have a LAN peer and an Anthropic API key. It is NOT in the mandatory first-run path (Founder binding 2: optional branch with graceful fallback). Packaging for general users is deferred.

**Payload schema (renderer to main):**
```typescript
interface RunMeshTestPayload {
  testId?: string;      // optional: which test to run (defaults to full mesh test)
  timeoutMs?: number;   // optional: override default 45000ms
}
```

**Result schema (main to renderer):**
```typescript
interface RunMeshTestResult {
  success: boolean;
  grading?: {
    accuracy: number;        // fraction 0-1
    hash_verified: number;   // count of hash-verified results
    p50_latency_ms: number;
    p95_latency_ms?: number;
    total_questions: number;
  };
  error?: 'MISSING_API_KEY' | 'TIMEOUT' | 'PYTHON_ERROR' | 'MISSING_PYTHON_RUNTIME' | 'NO_PEER';
  static_fallback?: boolean; // true if returning BP067 canonical numbers
}
```

**Error contract:**
- MISSING_API_KEY: Handler reads ANTHROPIC_API_KEY from LockBox SDS.env or process.env. If missing, immediately return `{ success: false, error: 'MISSING_API_KEY', static_fallback: true }`.
- MISSING_PYTHON_RUNTIME: If `child_process.spawn` throws ENOENT, return `{ success: false, error: 'MISSING_PYTHON_RUNTIME', static_fallback: true }`.
- TIMEOUT: Enforce 45,000ms via AbortController. Kill subprocess on timeout, return `{ success: false, error: 'TIMEOUT', static_fallback: true }`.
- NO_PEER: If run_mesh_test.py exits with a "no peer found" sentinel, return `{ success: false, error: 'NO_PEER', static_fallback: true }`.
- PYTHON_ERROR: Any other non-zero exit from the script.

**Graceful fallback (Founder binding 2):** When `static_fallback: true` is returned, the renderer (GauntletTab.tsx or GauntletProofStep.tsx) displays the BP067 canonical mesh test results as static evidence: 20/20 hash-verified, p50 16.6ms, +100pp resolution (pearl_88a8c069). Copy: "Here are previously-recorded results from our verified benchmark run." Optional skip link must always be present.

**amplify.d.ts declaration:**
```typescript
runMeshTest: (payload?: RunMeshTestPayload) => Promise<RunMeshTestResult>;
```

**Python sandbox-shell-out vs packaging decision:** Shell-out to the existing librarian-mcp path for this wave. Document in the Knight return that full packaging (extraResources) is a future wave gate once Gauntlet proves value with power-users.

---

### Item 3.2 -- membership.verifyStatus() IPC handler

**Context:** SEG-T UX-5 confirmed this IPC does not exist. Rook V2 Section C and FIRST_RUN_UX_ARCHITECTURE Step 7 both require it. Founder binding 1 (use buildAuthRelayUrl, not a custom JWT) is honored here.

**Handler name:** `ipcMain.handle('membership-verify-status', async (event) => { ... })`

**Implementation:** Call Supabase client in main process to query the `members` table (or equivalent) for `user_id = session.user.id`. Return membership status. Do NOT use a polling loop -- the renderer triggers this explicitly via the "I have completed checkout" button.

**Result schema:**
```typescript
interface MembershipVerifyResult {
  ok: boolean;
  membership_active: boolean;
  error?: string;
}
```

**amplify.d.ts declaration (add to membership interface):**
```typescript
membership?: {
  createCheckout: (autoRenew: boolean) => Promise<{ ok: boolean; url?: string; error?: string; fallbackUrl?: string }>;
  verifyStatus: () => Promise<MembershipVerifyResult>;
}
```

Note: Also add `url?: string` to createCheckout return type (Section 2 Item 2.5 above, but if Knight is touching the interface anyway, do both in one pass).

---

### Item 3.3 -- Gauntlet step: optional branch with graceful fallback design

**Context:** Founder binding 2: Step 3 of first-run fires by default. If runMeshTest IPC succeeds, show real numbers. If it fails (any error), show BP067 canonical static evidence. Skip link always present.

**GauntletProofStep.tsx (new component, Knight builds):**
- Calls `window.amplify.runMeshTest()` on mount.
- If `result.success === true`: render live Banyan Metric comparison (local vs mesh, using result.grading values).
- If `result.static_fallback === true`: render static card with "Previously-recorded benchmark results" copy and the canonical numbers (20/20 hash-verified, p50 16.6ms, +100pp resolution, pearl_88a8c069). Same visual design, different data source.
- Always renders a "Skip for now" link that advances the spine to the next step.
- Note on FIRST_RUN_UX_ARCHITECTURE Section 5 failure path: "If Stripe fails / user cancels -- user returns to app still parked on Step 5." This is consistent. The skip link on Step 3 also ensures no new user is hard-blocked mid-onboarding regardless of their setup.

**NetworkValueReveal.tsx (new component, Knight builds):**
- Receives the grading result (live or static) as a prop.
- Renders the side-by-side comparison: "Cathedral Alone" vs "Yoked AI" (local vs mesh resolution).
- This is the "aha" screen. Keep copy plain. Reference the specific pearl_88a8c069 result for the static case.

---

### Item 3.4 -- Initiative shell chrome unification (reframed from Scope 3)

**REFRAME:** SEG-U found that all 6 of Rook's "generic template" initiatives (Rally Group, VSL, Brass Tacks, Power to the People, MSA, Family Table) already have substantial multi-tab deep-built pages. The correct framing is NOT "uplift 6 generic initiatives" -- it is "unify the Hero/Walkthrough/CueCard outer chrome across all 16 initiative pages."

**UniformInitiativeShell.tsx (new wrapper component, Knight builds):**
- Accepts `children` as the primary action area (confirmed feasible by SEG-U S3-6 for LetsMakeDinnerPage and DefenseKlausPage).
- Sub-components: `InitiativeHero` (new -- emoji/logo/name/tagline), `InitiativeAboutWalkthrough` (new -- imports from `initiativeWalkthroughs.ts` via existing `getWalkthrough()` and `getCueCard()` functions, NOT by line number), `InitiativeCueCard` (REUSE from `platform/src/components/initiatives/InitiativeCueCard.tsx` -- already built), `InitiativeStatistics` (new -- optional placeholder).
- The existing deep-build page content (tabs, mutations, queries) passes through the `children` slot. The outer `<LaunchConditionOverlay>` + `<PortalPageLayout>` wrappers in each page are replaced by `<UniformInitiativeShell>`.
- Do NOT build the `InitiativeActionPanel` injection slots for the 6 "generic" initiatives this wave -- the pages already have action panels inside their tabs. The MVP is just the outer chrome unification.
- Do NOT implement the Section 2 Minimum Viable Actions from INITIATIVE_SHELL_PROPOSAL (responder intake, lending circle waitlist, etc.) this wave. Those are partially already built inside each page. Audit before building to avoid duplicate UI. Defer to Section 6.

**Implementation order (from SEG-U S3-8):** 1. RallyGroupPage -- best pattern-setter for chrome wrapping. 2. FamilyTablePage -- cleanest separation. 3. VSLPage -- most complex tabs, do last.

**DefenseKlaus risk register note from Rook:** SEG-U found the live `DefenseKlausPage.tsx` is the community safety coordination page, NOT a product checkout page. Rook's risk register item about "e-commerce checkout and donation-split logic" does not match the live file. Knight: confirm whether a separate Defense Klaus product/checkout page exists before wrapping DefenseKlausPage. If no checkout page exists, Rook's risk item is stale.

---

### Item 3.5 -- CheckoutSuccessStep.tsx and membership flow

**Context:** Rook V2 Section C provides the component sketch. SEG-T UX-5 confirms `verifyStatus` IPC is needed (built in Item 3.2 above). Explicit "I have completed checkout" button is Founder-ratified (cooperative transparency principle).

**CheckoutSuccessStep.tsx (new component, Knight builds):**
- Use Rook V2 Section C sketch as the spec. State: `checkoutOpened` boolean.
- Pre-checkout: "Join Cooperative ($5)" button. On click: generate Stripe URL via `window.amplify.membership.createCheckout(autoRenew)`, wrap with `buildAuthRelayUrl(result.url, session)` (Founder binding 1 -- existing infrastructure, no custom JWT), call `window.amplify.openExternal(wrappedUrl)`, set `checkoutOpened = true`.
- Post-checkout: "I have completed checkout" button. On click: call `window.amplify.membership.verifyStatus()`. If `membership_active === true`: advance spine. If false: show "We don't see your membership yet. Please wait a moment and try again." (Rook V2 Section C copy).
- Failure path (from Scope 4 Section 5): If user cancels / Stripe fails, user returns to app still parked on Step 5 ($5 CTA) and can click "Join for $5" again to generate a new checkout session. checkoutOpened state resets if the component remounts.

**Auth relay for Step 8 (web handoff):** Per Founder binding 1, use existing `buildAuthRelayUrl`. On membership verified: call `buildAuthRelayUrl('https://lianabanyan.com/welcome', supabaseSession)` and open in browser. `consumeAuthRelay()` on the web side handles session establishment -- no new Edge Function, no custom JWT. `WelcomeV2Page.tsx` does not need a `useEffect` for relay parsing because `consumeAuthRelay()` runs at app boot level.

---

### Item 3.6 -- SKU FULL card on download page (list.html), gated pattern

**File:** `Cephas/cephas-hugo/layouts/download/list.html`

**Use Rook V2 Section A "Markup Path 1: FULL In-Flight" immediately** -- disabled button, "Coming Soon", no model name, `background: #0a1628` to match existing page dark backgrounds. The `gemma4:12b` model name from Rook v1 fails Truth-Always (SEG-R item 6b FAIL -- not found anywhere in the codebase). Do not ship any model name until Knight confirms the actual bundled model from the v0.1.27-full build.

**Transition to Markup Path 2 ("FULL Shipped"):** Triggered when Knight Yoke-returns the confirmed binary SHA, bundled model name, and approximate size. Bishop or Founder swaps the disabled card for the live download card at that time. The Hugo template variable approach (`{{ .Site.Params.fullDownloadUrl }}`) from Rook V2 Path 2 is the right pattern -- no hardcoded GitHub release URL until it exists.

**Knight note:** The NANO card should also receive `background: #0a1628` for visual consistency with the existing page (SEG-R noted both cards should share the dark background). Confirm this when touching the file.

---

**Section 3 total: 6 items (3.1 runMeshTest IPC, 3.2 verifyStatus IPC, 3.3 GauntletProofStep+NetworkValueReveal, 3.4 UniformInitiativeShell, 3.5 CheckoutSuccessStep + auth relay, 3.6 SKU FULL card)**

---

## Section 4: FOUNDER ACTIONS

**Item 4.1 -- Push bp078-cohesion-ship-ready to main after diff review**
- Confirm SEG-X landed Pawn's one-fix-first (showOnboardAsk wire) before merge.
- Review diff against Section 1 items: PathwayMapVisual fix, AppShell FOCUS_ROUTES pair, SaltFighterFirstRun delete, buildAuthRelayUrl wiring in FirstStepsView.
- After merge, existing users with `LS_BP067_FIRST_RUN_COMPLETE === 'true'` bypass the new spine entirely (per Scope 4 Section 6 migration plan -- confirmed correct).

**Item 4.2 -- Physical Ollama upgrade on M2 and M3**
- M2 ran v0.1.21 during the BP067 mesh test. M3 status unknown.
- Option A: Install v0.1.27-full when Knight delivers it (the bundled installer auto-upgrades Ollama).
- Option B: Manual Ollama upgrade on each machine now to ensure the runMeshTest IPC has a compatible peer for LAN testing.
- Recommend waiting for v0.1.27-full (Option A) to test the full packaged upgrade path.

**Item 4.3 -- FIREBASE_TOKEN refresh in repo secrets**
- Listed as a potential staleness risk (firebase headless deploy wired in BP069). Verify token is not expired before Knight's next CI-triggered deploy.

**Item 4.4 -- Confirm developer tab open-by-default question (Rook V2 Section E)**
- Rook flagged: the `developer` tab uses a similar `devEnabled` gate as `forTechies` (MnemosyneTabView.tsx line 122). After Gauntlet is ungated, the developer tab pattern is the last gated tab. Founder should decide: should developer tools follow the same open-by-default architecture in a future revision, or remain gated? This does NOT block BP078. Flag for BP079 or next Knight wave.

**Item 4.5 -- Confirm DefenseKlaus product/checkout page existence**
- Rook's Scope 3 risk register cited "custom e-commerce checkout and donation-split logic" for DefenseKlaus. The live `DefenseKlausPage.tsx` is the community safety coordination page, not a checkout page. If a separate DefenseKlaus product page exists, it needs to be found before the UniformInitiativeShell wraps DefenseKlausPage. Founder: confirm whether this is stale content in Rook's spec or a missing page.

**Section 4 total: 5 items**

---

## Section 5: ROOK NEXT IF NEEDED

**Item 5.1 -- ROOK REDISPATCH for Initiative Shell uplift per initiative (deferred)**
- The chrome-unification shell (Section 3.4) can be specced by Bishop for Knight without Rook. BUT if Founder wants Rook to design the per-initiative action-panel uplifts (new forms, waitlists, civic integrations per INITIATIVE_SHELL_PROPOSAL Section 2), that requires a Rook redispatch with corrected framing.
- Corrected framing for redispatch: "All 6 initiatives already have multi-tab deep-built pages. Your task is NOT to add generic intake forms -- it is to audit each page's existing action areas and identify what is TODOed vs wired, then recommend the delta needed to make each page fully functional. Start with RallyGroupPage, VSLPage, FamilyTablePage."
- Trigger: Only after chrome-unification shell (Item 3.4) ships and Founder wants to evaluate per-initiative completeness.

**Item 5.2 -- ROOK REDISPATCH for Left Sidebar / Mega-Menu (deferred)**
- SEG-U item S3-5: Left Sidebar for Six Steps navigation is Knight-scope UI work (PortalPageLayout constraints, responsive design). If Founder wants this beyond the grid section-headers (Item 2.2), Rook should produce a full layout spec.
- Trigger: Founder decides section-headers are insufficient and wants persistent Six Steps sidebar.

**Section 5 total: 2 conditional redispatches, neither triggered yet**

---

## Section 6: KILLED / DEFERRED

**KILLED: Rook's "6 generic-template initiatives" premise**
- SEG-U S3-3 FAIL: All 6 named initiatives (Rally Group, VSL, Brass Tacks, Power to the People, MSA, Family Table) have substantial multi-tab deep-built pages with live Supabase wiring. The framing is false. Rook's Section 2 Minimum Viable Actions (responder intake, lending circle waitlist, etc.) describe work that is partially already built inside each page's existing tabs. Do NOT implement these forms this wave -- risk of duplicate UI.

**KILLED: gemma4:12b model name in FULL card**
- SEG-R item 6b FAIL: Not found anywhere in the codebase. Do not publish until Knight confirms actual model identifier from v0.1.27-full build. The "Coming Soon" path (Item 3.6) is the gate.

**KILLED: Rook V2 custom JWT relay pipeline**
- Rook FIRST_RUN_UX_ARCHITECTURE Section 4 proposed a new custom JWT signed by SUPABASE_JWT_SECRET + new Edge Function `/verify-relay`. Founder binding 1 kills this: use existing `buildAuthRelayUrl` instead. Simpler, already in production, no new attack surface.

**DEFERRED: Marks persistence (non-persistent, session-only)**
- Pawn gap: Marks are session-only, non-persistent. Earn events for review submission and node hosting are unwired.
- Trigger to un-defer: After Supabase RPC for `log_coop_event` is built and the cooperative value loop has paying members to reward.

**DEFERRED: BroadcastScheduleTab backend persistence**
- Pawn gap: BroadcastScheduleTab is localStorage-only, no backend persistence, no actual send.
- Trigger to un-defer: When Broadcast initiative backend is scoped as a Knight wave (post-launch).

**DEFERRED: "Your substrate helped someone" notifications**
- Pawn gap (LOW priority): No notification surface for cooperative substrate contributions.
- Trigger to un-defer: After organic N=3 mesh is proven end-to-end with the watcher-to-DAG bridge complete (BP067 open item: SubstratedFolderWatcher.handleFileEvent() TODO still open per MEMORY.md).

**DEFERRED: Left Sidebar / Mega-Menu for Six Steps navigation**
- Heavy UI work, PortalPageLayout constraint risk. Grid section-headers (Item 2.2) ship first.
- Trigger: Founder decides post-launch after seeing section-header reception.

**DEFERRED: run_mesh_test.py packaging for general user installs (extraResources)**
- Currently: shell-out to librarian-mcp path (developer only). Full packaging requires extraResources bundling + Python runtime decision.
- Trigger: After Gauntlet proves value with power-users and Founder wants it universally accessible in packaged builds.

**DEFERRED: Rook MCP Wire-In (rook-bishop-bridge + librarian-rook-readonly)**
- SEG-W spec exists at `BISHOP_DROPZONE/00_FOUNDER_REVIEW/BP078_ROOK_MCP_WIRE_IN_SPEC.md`. Top risk: Antigravity may not support MCP tool calls for Rook (Gemini). Founder must verify Antigravity MCP support before Knight builds. This is independent of the Antigravity cohesion work above.
- Trigger: Founder verifies Antigravity supports MCP tool calls for Rook.

**Section 6 total: 3 killed, 6 deferred (each with explicit trigger)**

---

## Section 7: PROV-22 CLAIMS NEXT STEPS

**Claim A (Staggered Swarm Data Mining -- HIGH PRIORITY)**
- Pearl hashes cited: `e294179396fb6316`, `6f9ad73d159fdc51`, `aebc8b9ad97ebcaa`. Canon IDs cited are BP078-era.
- Status: PASS per SEG-T. Claim language is well-scoped. Counsel-ready pending standard patent attorney review.
- Recommendation: FILE FIRST. Claim A is the most novel and directly covers the core compounding substrate traffic sign architecture.

**Claim B (Bundled Local-LLM Installer, Four-Tier Provisioning -- HIGH PRIORITY)**
- Missing pearl hashes: Candidates 4 and 5 have no explicit pearl IDs. Rook self-flagged this gap (PROV22 Section 4 Open Question 2).
- Status: PASS per SEG-T (with caveat). Claim language covers extraResources bundling.
- Bishop action before counsel: Locate and append pearl hashes for Candidates 4 and 5 (BP076 Knight SCOPE 5/6 builds). Check Knight's Yoke return from the v0.1.27 build for the confirmed file layout and runtime invocation command to satisfy Dependent Claim 2 enablement.
- Recommendation: FILE SECOND alongside Claim A, after pearl hashes appended.

**Claim C (Staggered Swarm ThreadPool with Stop-The-Line -- MEDIUM PRIORITY, POTENTIAL DOUBLE-COUNT)**
- Rook self-flagged: "POTENTIAL DOUBLE-COUNT, verify against prior filings."
- SEG-T: Bishop must cross-check Prov-21 (filed 2026-06-01, App 64/079,336) claim set before counsel review. Prov-21 covered BP059-67 addendum. Canon `canon_bp077_six_sigma_stop_the_line_andon_cord_faster_period_bp077` was created in BP077 which may fall within Prov-21 scope.
- Bishop action: Pull the Prov-21 claims from the codex/gold_tablet and compare the tiered thread pool + stop-the-line language against Claim C's independent claim language. If Prov-21 already covers this, Claim C cannot go to Prov-22 without amendment to distinguish over it.
- Recommendation: HOLD pending double-count check. Do not file until verified.

**Claim D (Structural Truth-Always Orchestration Protocol -- MEDIUM PRIORITY)**
- Missing pearl hashes: Candidates 9 and 11 have no explicit pearl IDs. Same gap as Claim B.
- Status: PASS per SEG-T (with caveat). Claim language is broad but defensible.
- Bishop action before counsel: Locate pearl hashes for BP070 canon (orchestration protocol with embedded wake-up verification) and BP078 reference memory.
- Recommendation: FILE THIRD after Claims A and B, once pearl hashes appended.

**Claim E (Four-Renderer-Tree Application Taxonomy -- LOW PRIORITY)**
- Reduction-to-practice cites BP072 canon extended in BP078. Pearl from BP072 (pearl_c39dcf27 = Denken/LRH characters) is not the renderer-tree canon -- Bishop must confirm the correct pearl for the renderer-tree taxonomy.
- Status: PASS per SEG-T. Priority is LOW.
- Recommendation: HOLD. File after A, B, D are in. Use the time to verify the correct BP072 canon pearl for the renderer-tree claim.

**Top-priority filing order: A then B (together, after Claim B pearl hashes appended), then D, then E. Hold C pending double-count check.**

**Section 7 total: 5 claims. File now: 0. File after minor work: 2 (A, B). Hold pending check: 1 (C). File third wave: 2 (D, E).**

---

## Report to Bishop

**Item counts per section:**
- Section 1 (Bishop-shipped, bp078-cohesion-ship-ready): 5 items
- Section 2 (Bishop SEG one-shots): 5 items
- Section 3 (Knight-wave builds): 6 items
- Section 4 (Founder actions): 5 items
- Section 5 (Rook redispatch conditions): 2 conditional items (neither triggered)
- Section 6 (Killed/deferred): 3 killed, 6 deferred
- Section 7 (Prov-22 claims): 5 claims, prioritized and gated

**Top 3 highest-leverage Knight-wave items:**

1. **Item 3.1 -- runMeshTest() IPC with graceful fallback.** This unblocks the entire Gauntlet proof flow (GauntletProofStep.tsx, NetworkValueReveal.tsx) AND the first-run UX Step 3. The static fallback design (BP067 canonical numbers when IPC fails) means even users without a LAN peer see the cooperative value story. Without this IPC, the Gauntlet tab shows simulated noise (Pawn's CRITICAL credibility risk). With it, the biggest trust-building moment in the app is live.

2. **Item 3.5 -- CheckoutSuccessStep.tsx + membership.verifyStatus() IPC.** Pawn's one-fix-first (Section 1 Item 1.4) wires showOnboardAsk so FirstStepsView is reachable for the first time. But reaching it is not enough if the "I have completed checkout" flow is broken. verifyStatus() IPC plus the explicit-button design closes the entire join funnel. This converts a user who has been convinced by the Gauntlet into a paying member.

3. **Item 3.4 -- UniformInitiativeShell chrome unification.** After join, the first thing a new member sees is the cooperative surface. Currently 16 initiative pages have inconsistent outer chrome. The shell unification (Hero/Walkthrough/CueCard standardization) is the first impression of the cooperative's depth and seriousness. It also unblocks the analytics extension (Item 2.1) and the Six Steps visual hierarchy (Item 2.2).

**Spec receipt path:** `C:\Users\Administrator\Documents\BISHOP_DROPZONE\00_FOUNDER_REVIEW\BP078_FINAL_IMPLEMENTATION_SPEC.md`

**Source conflicts requiring Founder decision (none remaining -- all resolved by Brick Wall or prior Founder bindings):**

The three items that previously required Founder decision are resolved:
- Auth relay mechanism: Founder binding 1 -- use `buildAuthRelayUrl`. Custom JWT pipeline killed.
- Gauntlet as mandatory Step 3: Founder binding 2 -- optional branch with static fallback. Hard-block risk eliminated.
- Poll vs explicit button: Founder binding (cooperative transparency principle) -- explicit "I have completed checkout" button. Ratified.

One new item surfaces from SEG-U that does NOT have a Founder decision yet and is NOT blocking: whether the `developer` tab should follow the open-by-default architecture in a future revision (Section 4 Item 4.4). This is a BP079+ question. No decision needed before BP078 ships.

---

*Spec sealed by SEG-Z (Sonnet 4.6, Statute ss3). Truth-Always: all live-file citations sourced from SEG-R, SEG-T, and SEG-U direct reads in their respective sessions. No em-dashes.*
