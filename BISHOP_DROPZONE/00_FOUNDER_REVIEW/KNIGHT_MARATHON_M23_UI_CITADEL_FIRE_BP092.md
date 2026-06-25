# Knight Marathon M23 · UI Citadel · Fire-Ratification Wrapper
## BP092 · Founder Direct Ratify · Post-M22 v0.6.0 Ship

**Date:** 2026-06-22
**Bishop SEG:** Sonnet 4.6
**Status:** STAGED FOR KNIGHT FIRE · Founder ratify in wrapper below
**Companion:** BISHOP_SYNTHESIS_M23_UI_CITADEL_FIRE_BP092.md (1-page ratify summary)

---

## Founder Ratify Line

> **BP092 Founder direct: M23 UI Citadel fires (gate cleared post-M22 v0.6.0 ship)**

That line is the gate. Knight reads it, notes BP092, fires.

---

## R1-R10 DISPOSITIONS — BP092 FOUNDER RATIFIED 2026-06-23 ~02:00 UTC

| Gate | Founder | Meaning |
|---|---|---|
| R1 | Y | "Peer / Power" vocabulary locked |
| R2 | Y | Full M23 Citadel (NOT Swift Fix Option B) |
| **R3** | **RESOLVED 2026-06-23 ~02:15 UTC** | **TWO-BUTTON semantic: (1) CLOSE button = close-to-background/tray; app stays alive; mesh participation continues; substrate stays available. (2) QUIT button = full app exit; mesh participation ends. Knight implements both as distinct user actions.** |
| R4 | Y | Diagnostics 4-surface scope locked: raw logs · process list · config JSON editor · inference override sliders |
| R5 | Y | "Models" nav label locked |
| R6 | Y | M22 sequencing satisfied (M22 already merged + v0.6.0 shipped — gadget-verified) |
| R7 | Y | Mobile MVP in scope: 44px touch targets · tab-bar narrow viewport · phone walkthrough smoke |
| R8 | Y | Quickstart Card copy locked (verbatim from R8 in dispatch) |
| R9 | Y | "MnemosyneC" name appears ONLY in title bar + About page; sidebar/settings/chrome use neutral words |
| R10 | Y | M23 ships as v0.6.1 (NOT v0.6.0 — already shipped by M22) |

R3 RESOLVED — Block 2 fully unblocked. Knight implements Close=tray-or-background and Quit=full-exit as two distinct controls.

---

## MIC REPORTING BINDING

Per `canon_mic_reporting_regular_job_easier_than_work_bp092` · Knight emits per-Block-close progress report to `BISHOP_DROPZONE/00_KNIGHT_PROGRESS/M23_<block>_<timestamp>.md` · not just KniPr at end. Block-close report = gate receipt + issues + next-block intent. Failure to emit = Bishop escalates to Founder.

---

## Primary Spec Files — Knight Reads These First

Knight MUST read all three before any code edits. They supersede any summary in this wrapper.

1. **Dispatch (full block-by-block work orders):**
   `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_MARATHON_SESSION_23_UI_CITADEL_REFACTOR_PEER_POWER_MODE_SIDEBAR_QUICKSTART_BP091.md`

2. **Bishop Strategic Synthesis (rationale + design decisions + R1-R10 full text):**
   `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\BISHOP_SYNTHESIS_CITADEL_MASTER_PLAN_MNEMOSYNEC_UI_REFACTOR_BP091.md`

3. **Empirical Component Map (ground-truth src/ structure — Rook discrepancies resolved):**
   `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_M23_PREBLOCK_EMPIRICAL_COMPONENT_MAP_BP091.md`

The Component Map (file 3) is pre-fire intelligence gathered by a read-only SEG. Knight's Pre-Block task is to RE-VERIFY these findings against the current src/ tree (M22 may have touched some targets), then proceed with Block 1. The Map accelerates the Pre-Block gate; it does not eliminate it.

---

## R1-R10 Disposition — Post-M22 Gate Clearance

Founder ratified "Gate 2: same" at BP092 session open, confirming M23 fires. The R-gates below are resolved from that ratify plus empirical evidence from the M22 ship.

**BP092 Founder verbatim answers (2026-06-23 ~02:00 UTC): R1=Y · R2=Y · R3=N · R4=Y · R5=Y · R6=Y · R7=Y · R8=Y · R9=Y · R10=Y**

| Gate | Question | Disposition | Evidence |
|---|---|---|---|
| R1 | "Peer / Power" as official mode vocabulary? | **RESOLVED — use "Peer / Power"** | Founder Y · BP092 direct ratify. |
| R2 | Unified M23 (not Option B Swift Fix)? | **RESOLVED — full Citadel scope** | Founder Y · Option B off the table. |
| **R3** | **Quit = exit Electron process, no background residue?** | **RESOLVED 2026-06-23 ~02:15 UTC — TWO-BUTTON: (1) CLOSE = close-to-background/tray; mesh alive; substrate available. (2) QUIT = full exit; mesh ends. Knight implements both as distinct controls.** | Founder verbatim BP092: "I mean YES if you QUIT instead of close. I want it to run without being open, so substrate is avail." Canon: `canon_close_keeps_mesh_alive_quit_exits_two_button_semantic_bp092`. Supersedes `canon_quit_must_not_kill_mesh_participation_tray_resident_bp092`. |
| R4 | Diagnostics 4-surface scope confirmed? | **RESOLVED — 4 surfaces** | Founder Y · Logs viewer + Config JSON editor + Process list + Inference sliders. |
| R5 | "Models" as nav label for AI Power Tier? | **RESOLVED — "Models"** | Founder Y · SkuUpgradePanel.tsx render target confirmed. |
| R6 | M23 fires after M22 lands (not immediately)? | **RESOLVED — M22 HAS LANDED** | Founder Y · Empirical: 5 peers on v0.6.0 confirmed. |
| R7 | Mobile MVP in M23 scope (not deferred)? | **RESOLVED — mobile in scope** | Founder Y · T12 + T5b verification gates required. |
| R8 | Quickstart Card copy confirmed? | **RESOLVED — copy locked** | Founder Y · Proposed copy ratified. Knight implements verbatim. |
| R9 | MnemosyneC name only in title bar + About page? | **RESOLVED — substrate-neutral nav** | Founder Y · Nav labels substrate-neutral. |
| R10 | Version bump? | **RESOLVED — v0.6.1** | Founder Y · M22 shipped v0.6.0; M23 = v0.6.1. |

**R-gate summary: 10 RESOLVED · R3 RESOLVED 2026-06-23 ~02:15 UTC (two-button semantic: Close=tray/background · Quit=full-exit) — Block 2 fully unblocked.**

---

## Pre-Fire Empirical Fleet State

**Snapshot time:** 2026-06-23T01:45 UTC (Bishop SEG REST query against Supabase peer_presence)

| Peer ID (12-char) | State | Tier | RAM Tier | Version | Last Seen |
|---|---|---|---|---|---|
| 88cbf6bdd6f7 | active | base | full | 0.6.0 | 2026-06-23T01:45:48 |
| 49f3e5971518 | active | base | core | 0.6.0 | 2026-06-23T01:45:36 |
| cb4ef450cc4a | active | base | ultra | 0.6.0 | 2026-06-23T01:45:29 |
| c532e74069e1 | active | base | core | 0.6.0 | 2026-06-23T01:45:18 |
| d0b47bd08633 | active | base | full | 0.6.0 | 2026-06-23T01:45:08 |

**Fleet: 5 peers · 5/5 on v0.6.0 · 5/5 active · 0 on legacy version**

This confirms M22 has propagated to the full known fleet. R6 gate cleared with empirical receipt.

---

## Session Split Recommendation

M23 is estimated at 11.5–19.75 hours. Bishop recommends a two-session split for manageable context burn:

### M23a (Session 1)
- Pre-Block: Re-verify empirical component map against post-M22 src/ tree
- Block 1: Foundations (§1a–§1f)
- Block 2: Citadel Gate Architecture (§2a–§2d)
- End: Block 2 verification gate passed. Ship intermediate build if possible. Report to Bishop via KniPr.

### M23b (Session 2)
- Block 3: Inner Keep + Quickstart Card (§3a–§3e)
- Block 4: Build, version bump to v0.6.1, Tower deploy, version_trust.json update
- Block 5: Empirical smoke tests (phone walkthrough + mobile + accessibility + regression)
- End: Full M23 receipt returned to Bishop.

Knight may collapse M23a+b into a single session if context permits. The split is a context-management tool, not an architectural split. No branch split needed — M23a and M23b both work on the same M23 branch.

---

## Branch Isolation (Per BP089 Parallel Sessions Canon)

**M23 branch:** Knight creates a fresh branch off main before any edits:
```
git checkout main
git pull
git checkout -b knight-marathon-23-ui-citadel
```

This branch is SEPARATE from `knight-marathon-10-v0-5-16-build-ship-plow-loop` (the M22 working branch). M22 work is already on main via commits tagged [M22]. The M23 branch starts clean from main HEAD (currently at commit `7ee1a6b`).

**If M13c fires concurrently** (parallel session per BP089 override): M13c uses its own separate branch (`knight-marathon-13c-thunderclap`). The two sessions share no branch. Build gate at end of each session: each session produces its own build artifact before Tower deploy. Bishop coordinates the merge order (M13c first if it completes first, or M23 first — whichever produces a clean build).

---

## Block Reference Table

Knight reads full block specs from the BP091 dispatch file (primary spec). Summary reference only:

| Block | Work | Estimated Time | A15 Tag |
|---|---|---|---|
| Pre-Block | Re-verify empirical component map post-M22 | 30-45 min | [SEG] |
| Block 1 | Foundations: nav promote + Quit + copy + model names | 2-4 hrs | [MAIN] |
| Block 2 | Citadel Gate: ModeToggle + SidebarNav + localStorage | 4-6 hrs | [MAIN] |
| Block 3 | Inner Keep: Quickstart + Advanced + Diagnostics + Mesh | 3-5 hrs | [MAIN] |
| Block 4 | Build + v0.6.1 bump + Tower deploy + version_trust.json | 1-2 hrs | [SEG+MAIN] |
| Block 5 | Smoke tests: phone walkthrough + mobile + a11y + regression | 1-2 hrs | [SEG] |

**A15 BLOOD:** [SEG] blocks = pure verification/tooling. [MAIN] blocks = production code edits. Knight main-thread burn target: [MAIN] blocks only. [SEG] work (grep verification, build commands, smoke test protocol) runs as sub-agent dispatch where possible. Target: ≤ 5% of Knight main-thread on [SEG]-tagged work.

---

## MIC Progress Reports — Required

Per periodic-MIC-reporting canon: Knight sends a KniPr block-close report to Bishop after each block completes. Not just at Marathon end.

**Protocol:**
- After Pre-Block: KniPr listing component map verification results and any M22 deltas
- After Block 1: KniPr with T1-T7 gate checklist completed + any §1x discrepancies
- After Block 2: KniPr with T8-T13 gate checklist completed + localStorage persistence confirmed
- After Block 3: KniPr with T14-T18 gate checklist completed + R8 copy note if Founder revised
- After Block 4: KniPr with build result + v0.6.1 bump receipt + Tower deploy confirmation + version_trust.json update confirmed
- After Block 5: Full M23 smoke receipt (T19-T20) + all return artifacts listed in BP091 §Anticipated Return Artifacts

**KniPr format:**
```
KniPr [Block N close]: [block name]
  Gates passed: T[x]-T[y] all confirmed
  Issues: [none / list]
  Notable discrepancies: [none / list]
  Next: Block [N+1] / Session M23b / Marathon complete
```

---

## Pre-Block: M22 Delta Check (MANDATORY BEFORE EDITING)

M22 added significant new components. Knight must check for any M22 edits that affect M23 targets before Block 1 edits land. Specifically:

1. Grep for M22 additions in `src/renderer/components/`:
   ```
   git log --oneline --name-only -10 | grep -E "\.tsx|\.ts" | sort -u
   ```
2. Check if M22 added any mesh/tab components that should compose into M23's SidebarNav (the Coop Mesh Activity panel from M22 Blk6 is a candidate for the Home nav item content area).
3. Verify SettingsTab.tsx current line count has not changed materially from the empirical map's 2633 lines (M22 may have touched Settings for the Coop Mesh Activity panel).
4. Verify `app:request-quit` still exists at `src/main/index.ts:2900` (M22 touched index.ts).

If M22 introduced structural changes to the Settings tab or IPC layer, Knight surfaces a KniPr update before Block 1 edits.

---

## Deploy-All-Touched Gate

**Mandatory at Block 4:** Knight deploys every file touched during M23. No partial deploys.

Verification protocol:
```
git diff --name-only main..HEAD
```
Every file in that diff is deployed in the Block 4 build. If any touched file is NOT in the built artifact, Knight documents why (dead code, test-only, etc.) and confirms with Bishop before shipping.

---

## Compose Relationships

**M22 composes in:** The Coop Mesh Activity panel (added in M22 Blk6 as a SettingsTab section) should be MIGRATED by M23 to the Home nav item content area. Knight checks if M22 already wired a standalone panel or if it's embedded in SettingsTab, then extracts/references it appropriately. This is the §3d mesh widget task from the dispatch — M22 is now confirmed landed, so stub is NOT needed. Knight wires M22's mesh data layer to the Home content area directly.

**M18b composes in:** M18b (v0.5.18) shipped: multi-ACTIVE-tile fix, dynamic model names, Caithedral sweep. This means:
- §1f (radio semantics fix): SKIP — already strict `===` per both M18b and the empirical map
- §1d (Caithedral sweep): SKIP — M18b §4 sweep confirmed in version_trust.json notes
- §1e (hardcoded model names): CHECK — M18b notes say "dynamic model names" — Knight verifies before editing. If M18b already extracted SKU_TIERS to config, §1e may be a no-op.

**M13c parallel session:** If M13c (THUNDERCLAP 70Q re-run) fires concurrently, it operates on `platform/src/` and backend substrate layers — no file overlap with M23's `src/renderer/` + `src/main/` scope. Branch isolation is sufficient; no code conflict expected.

---

## Caithedral · Substrate-Cure · Always

Every rendered string Knight writes is substrate-neutral vocabulary. "The Substrate Cure to AI Amnesia" is the only tagline that appears in the Quickstart Card. MnemosyneC name appears in title bar and About page only. Caithedral is spelled "Caithedral" everywhere in the cooperative context.

---

## Estimated Wall-Clock

11.5 – 19.75 hours total (per BP091 dispatch). With the M22 compose-in landed (no stub needed), Block 3 loses approximately 30 minutes of stub work and gains approximately 45 minutes of M22 data layer wiring. Net estimate unchanged.

---

## Session Wake Message (Copy for Knight)

```
Knight M23 · UI Citadel Refactor · BP092

You are Knight Marathon Session 23. BP092 Founder direct: M23 UI Citadel fires (gate cleared post-M22 v0.6.0 ship).

READ THESE FILES FIRST:
1. C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_MARATHON_SESSION_23_UI_CITADEL_REFACTOR_PEER_POWER_MODE_SIDEBAR_QUICKSTART_BP091.md
2. C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\BISHOP_SYNTHESIS_CITADEL_MASTER_PLAN_MNEMOSYNEC_UI_REFACTOR_BP091.md
3. C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_M23_PREBLOCK_EMPIRICAL_COMPONENT_MAP_BP091.md

THEN READ THE FIRE WRAPPER:
C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_MARATHON_M23_UI_CITADEL_FIRE_BP092.md

CANON CARRIES:
- SQL: Postgres only. gen_random_uuid() / TIMESTAMPTZ / BIGSERIAL. No SQLite primitives.
- Files: MnemosyneC Electron app lives in src/ (root). NOT platform/src/ (web SPA).
- IPC: app:request-quit (NOT app:quit) — handler at src/main/index.ts:2900.
- Settings: Monolithic SettingsTab.tsx (2633 lines). No Section_*.tsx files exist.
- Tier tiles: SkuUpgradePanel.tsx (976 lines). No TierTile.tsx exists.
- Version: Bump to v0.6.1 (M22 already shipped v0.6.0).
- Branch: Create knight-marathon-23-ui-citadel off main before any edit.
- M18b status: LANDED (v0.5.18). §1d + §1f are verify-only, not edit-first.
- M22 status: LANDED (v0.6.0). §3d mesh widget is LIVE, not stub. Wire M22 data layer directly.
- R8 PENDING: Quickstart Card copy — proceed with proposed text; Founder may revise mid-session.

KniPr after every block close. Send progress before moving to next block.
```

---

*Knight Marathon M23 · UI Citadel · Fire-Ratification Wrapper*
*BP092 · Composed by Sonnet 4.6 SEG · 2026-06-22*
*Bishop composes. Knight executes. Founder paste or Yoke-send is the fire mechanism.*
