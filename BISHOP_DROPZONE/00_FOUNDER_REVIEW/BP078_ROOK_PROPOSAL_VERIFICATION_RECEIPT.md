# BP078 Rook Proposal Verification Receipt

**Timestamp:** 2026-06-08T00:00:00Z (UTC approximate; SEG-R verification run)
**Source proposal:** `C:\Users\Administrator\Documents\AntigravityWorkspace\outputs\ANTIGRAVITY_COHESION_PROPOSAL_BP078.md`
**Missing-file note:** `C:\Users\Administrator\Documents\AntigravityWorkspace\notes\MISSING_FILE_run_mesh_test.md`
**Live tree root:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\`
**Verified by:** SEG-R (Sonnet 4.6, Statute ss3)

---

## Executive Summary

| Metric | Count |
|--------|-------|
| Total concrete change items evaluated | 11 |
| PASS | 7 |
| FAIL | 1 |
| NEEDS-DISCUSSION | 3 |

Top-line: Section 2 (AppShell chrome-light) has significant live-tree drift from Rook's description. Sections 3, 6 are clean PASS. Section 4 has a PASS because the relay pattern already exists. Section 5 splits: visibility change is NEEDS-DISCUSSION (side-effects), IPC wiring is NEEDS-DISCUSSION (no IPC surface yet). Section 7 risks are noted but not blocking. Section 8 order is sound.

---

## Item Table

| # | ITEM | FILE | REC | NOTE |
|---|------|------|-----|------|
| 2a | Add `/welcome` to FOCUS_ROUTES (line 52) | `platform/src/AppShell.tsx` | FAIL | DRIFT. `/welcome` is already in HIDDEN_ROUTES (line 54), suppressing BetaBanner. But it is NOT in FOCUS_ROUTES, so `showChrome` is still true for logged-in users. However, Rook's proposed line number is wrong: the live FOCUS_ROUTES is on line 52 exactly as Rook says, but the array is `['/membership', '/membership/confirm', '/ghost', '/explore', '/free-explore']`. Adding `/welcome` and `/pathways` here will flip `showChrome` false only when `!!user` -- non-logged users are already chrome-free because `showChrome = !!user && ...`. The fix is valid but narrower than Rook framed it: it only matters for logged-in users hitting `/welcome`. Line number 52 is CORRECT. |
| 2b | Modify line 82 to exclude `/welcome` from CrossPortalNav | `platform/src/AppShell.tsx` | PASS (with caveat) | Line 82 in live file is `{!isLanding && <CrossPortalNav />}`. The change compiles cleanly. Caveat: since `/welcome` is in HIDDEN_ROUTES but not FOCUS_ROUTES, if a logged-in user visits `/welcome` they currently get the full chrome sidebar + brand bar + CrossPortalNav. Rook's line 82 patch alone does not suppress the sidebar or brand bar -- that requires the FOCUS_ROUTES fix (2a) too. Both 2a and 2b are needed together. |
| 3a | Change `href` in PathwayMapVisual.tsx from `/cold-start/` to `/start/cold-start/` | `platform/src/components/v2/welcome/PathwayMapVisual.tsx` | PASS | Live file line 23 has `href={\`/cold-start/${pathway.slug}\`}`. ColdStartHub.tsx uses `/start/cold-start/` prefix (verified lines 18, 30, 44 etc.). Rook's fix is correct and exact. Zero drift. |
| 3b | Add 7th pathway "Broadcast" to PathwayMapVisual PATHWAYS array | `platform/src/components/v2/welcome/PathwayMapVisual.tsx` | PASS | Live PathwayMapVisual has 6 pathways (food, manufacturing, service, local-business, guild, tribe). ColdStartHub has 7 (adds broadcast with slug `broadcast`). The sync is valid. Slug and href match ColdStartHub exactly. |
| 4a | Wrap Stripe URL in `buildAuthRelayUrl` in FirstStepsView.tsx | `src/renderer/components/FirstStepsView.tsx` | PASS (design) | `buildAuthRelayUrl` EXISTS at `platform/src/utils/crossDomainAuth.ts`. It takes `(targetUrl: string, session: Session | null)` and appends auth tokens in the hash fragment. Pattern is already used in CrossPortalNav. The IPC flow in FirstStepsView.tsx calls `window.amplify.membership.createCheckout(autoRenew)` which returns `result.url`. Wrapping that url with `buildAuthRelayUrl(result.url, session)` before passing to `openExternal` is architecturally clean. NOTE: FirstStepsView does not currently import useAuth -- that import would be needed to get the current session. This is new code but fits the existing pattern. |
| 4b | Stripe success_url redirects to `/welcome?checkout=success` | Design only (no live file change yet) | PASS (design) | Consistent with AppShell HIDDEN_ROUTES having `/welcome`. The web platform already handles `/welcome`. No conflicting pattern found. |
| 4c | Desktop polls `getAMPLIFYSnapshot()` or user clicks "I have joined" | Design only | NEEDS-DISCUSSION | `getAMPLIFYSnapshot` is called in existing code (MnemosyneTabView line 182). But the polling loop for post-checkout state refresh is not specified in detail. Rook leaves this as two options without specifying which. Needs Founder decision: silent poll (simpler) vs explicit button (more honest to user). |
| 5a | Remove `if (t.id === 'gauntlet') return forTechies` from visibleTabs | `src/renderer/components/MnemosyneTabView.tsx` | NEEDS-DISCUSSION | The filter is at line 324-328. Removing the gauntlet gate has two side-effects: (1) `resolveDefaultTab()` at line 161 has `(saved !== 'gauntlet' || forTechies)` as a guard -- if gauntlet is now always visible, this guard becomes dead logic and should be removed too. (2) The "For Techies ->" button (lines 665-687) would become orphaned UI -- it sets `forTechies=true` and navigates to gauntlet, but if gauntlet is already visible, the button is confusing. (3) The comment at line 157 "BP067: default Tab 1 Frame (daily driver) -- Gauntlet hidden behind For Techies" would be stale. Rook's proposed fix is one line but requires cleaning 3 companion code sites. Feasibility: YES. Requires 3 companion edits for clean ship. Recommend Founder confirm the UX intent: expose Gauntlet to all users by default, retire "For Techies" button? |
| 5b | Replace simulateDelta/simulateBanyanMetric with IPC `window.amplify.runMeshTest()` | `src/renderer/components/GauntletTab.tsx` | NEEDS-DISCUSSION | `simulateDelta` (line 221) and `simulateBanyanMetric` (line 215) are confirmed present. However, `window.amplify.runMeshTest` does NOT exist in `amplify.d.ts` and is not wired in the main process. `run_mesh_test.py` lives at `librarian-mcp/r10_cross_vendor/run_mesh_test.py` (not `src/renderer/run_mesh_test.py` as Rook believed). Wiring this requires: (a) new IPC handler in main.ts, (b) `amplify.d.ts` declaration, (c) Python subprocess call from Node, (d) ANTHROPIC_API_KEY forwarding for the Haiku grader. This is a Knight-scope build item, not a one-shot edit. |
| 6a | Replace single download button with 2-column SKU grid in list.html | `Cephas/cephas-hugo/layouts/download/list.html` | PASS (structure valid) | Live file uses plain CSS (no Tailwind, no Hugo partials for download section). The `.mn-v2-dl-btn` class exists (line 227-247). Rook's proposed markup reuses `.mn-v2-dl-btn` and inline styles -- fully compatible with existing pattern. However: the FULL build (`v0.1.27-full`) does NOT yet exist as a release. The FULL card should be marked "Coming Soon" or gated behind a date. Inserting a dead download link will break the page for users. Structure is sound; the FULL release URL must not go live until the binary exists. |
| 6b | `gemma4:12b` model reference in FULL card | Design | FAIL (Truth-Always) | The live codebase and all existing copy reference `gemma2:2b` as the bundled model (NANO). `gemma4:12b` does not appear anywhere in the codebase. This model name may not exist or may be a hallucination by Rook. Needs verification before publishing. Do not ship the FULL card with this model name without confirming the actual model identifier and size. |

---

## Section-by-Section Verdict

### Section 1 -- Verification of Findings
PASS. Rook's 5 findings are accurate against the live tree. One minor clarification: the "For Techies" button (finding 4) is confirmed at line 665 in the live MnemosyneTabView. Rook's drift note is accurate.

### Section 2 -- Chrome-light /welcome
MIXED. Item 2a has a drift in framing (HIDDEN_ROUTES already partially handles /welcome but not chrome suppression for logged-in users). Fix is valid but narrower than described. Item 2b PASS. Both changes are needed together as a pair.

### Section 3 -- Broken Explore-this-path Fix
PASS. Both changes (3a href fix, 3b 7th pathway) are correct, verified against live files, zero drift. These are the lowest-risk, highest-value items in the proposal.

### Section 4 -- Desktop to Platform Handoff
PASS (design layer). `buildAuthRelayUrl` already exists and the pattern matches exactly. The FirstStepsView wiring requires adding `useAuth` import. The polling vs button choice (4c) needs Founder decision.

### Section 5 -- Gauntlet Visibility and Real-Proof Wiring
MIXED. 5a (remove forTechies gate) is feasible but requires 3 companion edits to avoid orphaned code. 5b (IPC to run_mesh_test.py) is a multi-step Knight build, not a Bishop one-shot. The Python file is not in src/renderer as Rook believed -- it is in librarian-mcp.

### Section 6 -- SKU Tier Picker
MIXED. Structure and CSS approach PASS. The gemma4:12b model name FAILS Truth-Always (unverified model ID). The FULL release binary does not exist yet. Do not publish the FULL card live until binary and model name are confirmed.

### Section 7 -- Risk Register
NOTED. All three risks are real. Risk 3 (Python dependency failure) is especially relevant given the true location of run_mesh_test.py: it lives in librarian-mcp, which is a developer/internal tool path, not a packaged renderer asset. Bundling it into the Electron app for user-facing Gauntlet IPC is a significant packaging decision.

### Section 8 -- Implementation Order
PASS. The ordering is sound. One addition: Step 3 (unhide Gauntlet) should include the 3 companion edits (resolveDefaultTab guard, For Techies button removal, stale comment) or it will ship with orphaned logic.

---

## run_mesh_test.py Status

**File EXISTS in the live tree.**
Path: `C:\Users\Administrator\Documents\LianaBanyanPlatform\librarian-mcp\r10_cross_vendor\run_mesh_test.py`

This is NOT in `src/renderer/` as Rook assumed. It lives in the librarian MCP tooling directory, not in the renderer. It requires `ANTHROPIC_API_KEY` for the Haiku grader. It is a CLI Python script, not a packaged Electron asset.

Consequence for Section 5b: wiring `window.amplify.runMeshTest()` to call this script requires: (a) moving or symlinking the script into a packaged path, (b) a new IPC handler in main.ts, (c) ANTHROPIC_API_KEY secret forwarding from the renderer, (d) Python runtime available on user machines. This is a multi-week Knight build scope item, not a one-shot edit.

---

## forTechies Gate Side-Effects

Searching the entire renderer codebase, `forTechies` and `LS_FOR_TECHIES` appear only in `MnemosyneTabView.tsx`. There is no external component that reads this flag. Removing the gate will not cause cascading failures in sibling files.

However, within MnemosyneTabView itself, three sites must be cleaned together:
1. Line 161: `(saved !== 'gauntlet' || forTechies)` in `resolveDefaultTab` -- becomes dead/confusing if gauntlet is always visible.
2. Lines 665-687: the "For Techies ->" button -- renders only when `!forTechies`, would be orphaned UI serving no purpose once gauntlet is unconditionally visible.
3. Line 157 comment: stale once the gate is removed.

The `forTechies` state variable and `LS_FOR_TECHIES` const could also be removed entirely (cleaning 4 additional lines), but that is optional hygiene.

---

## buildAuthRelayUrl Handoff Design

`buildAuthRelayUrl` is REAL and COMPLETE at `platform/src/utils/crossDomainAuth.ts`. It uses hash-fragment token relay (safe: hash never sent to server). The companion `consumeAuthRelay()` function handles consumption on the web platform side on app boot.

This is NOT brand-new code. The relay infrastructure is already built. The only new work is:
- Import `useAuth` in `FirstStepsView.tsx` to obtain the current Supabase session.
- Call `buildAuthRelayUrl(result.url, session)` before passing to `window.amplify.openExternal`.

This is a Bishop-scope one-shot edit (2-3 lines in FirstStepsView.tsx). PASS.

---

## list.html Styling System

The download page at `Cephas/cephas-hugo/layouts/download/list.html` uses plain CSS via a large inline `<style>` block. There is no Tailwind, no Hugo partial, no component system. All styles are custom classes prefixed `mn-v2-` or `mn-`. Rook's proposed SKU grid uses inline styles, which is consistent with the existing pattern throughout the file (Pick-Six section, Bounty Row, etc.). The `.mn-v2-dl-btn` class is defined and would apply to the download anchors in both tier cards. The flex/grid markup is consistent with the existing `.mn-v2-bounty-row` flex pattern.

One alignment note: Rook's FULL card background `#11241a` and NANO card have no background (white/transparent). The existing page has `#0a1628` dark backgrounds everywhere. The NANO card should also receive a dark background for visual consistency. Minor styling concern only.

---

## Bishop's Recommendation

### Ship Now (Bishop SEG one-shots)

1. **Section 3 -- Pathway links + 7th pathway** (items 3a, 3b): Zero risk. Dead links fixed. 7th pathway sync is a 6-line PATHWAYS object addition. Ship immediately.

2. **Section 2 -- AppShell FOCUS_ROUTES + CrossPortalNav patch** (items 2a, 2b): Low risk. Two-line edit. Must be shipped as a pair. Confirm: logged-in users on /welcome will lose chrome -- is that correct for all auth states?

3. **Section 4 -- buildAuthRelayUrl wiring in FirstStepsView** (item 4a): Relay infrastructure exists. ~3-line change in FirstStepsView.tsx to add `useAuth` and wrap the URL. Ship in current cycle.

### Needs Knight (build, test, IPC surface)

4. **Section 5b -- Gauntlet real-proof IPC**: Multi-step build. run_mesh_test.py must be packaged into the Electron app, new IPC handler written, amplify.d.ts updated, Python runtime dependency resolved. This is a Knight wave scope item (multi-scope, multi-day).

5. **Section 5a -- Gauntlet visibility (remove forTechies gate)**: Feasible as Bishop one-shot IF all 3 companion edits are included. However, if this goes to Knight bundled with 5b, the companion cleanup can travel together. Recommend bundling with 5b Knight wave.

### Needs Founder Decision

6. **Section 4c -- Poll vs button for post-checkout state refresh**: Silent polling vs explicit "I have joined" CTA. UX philosophy question -- cooperative transparency suggests the button is more honest. Needs Founder call.

7. **Section 6a -- FULL build SKU card**: Structural approach approved. Do not ship the FULL card until (a) gemma4:12b model name is verified or corrected, (b) v0.1.27-full binary exists on GitHub releases. Needs Founder to confirm model identifier and release timeline.

### Defer

8. **Section 7 Risk Register items**: Not action items; already noted in Knight build scope.
9. **gemma4:12b model name (item 6b)**: Block on ship until confirmed. Do not let unverified model identifier reach production copy.

---

*Receipt sealed by SEG-R. Truth-Always: all live-file citations are from direct file reads in this session. No snapshot reliance.*
