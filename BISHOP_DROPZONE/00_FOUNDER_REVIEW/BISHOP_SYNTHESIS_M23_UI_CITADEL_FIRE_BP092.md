# Bishop Synthesis · BP092
## M23 UI Citadel — Fire-Order Summary

**Date:** 2026-06-22 · **SEG:** Sonnet 4.6
**Status:** READY TO FIRE · R6 gate cleared empirically · 9/10 R-gates resolved

---

## Ratify Confirmation

BP092 Founder direct: M23 UI Citadel fires (gate cleared post-M22 v0.6.0 ship).

M22 empirically confirmed shipped: 5 active peers, all on v0.6.0, last seen 2026-06-23T01:45 UTC. version_trust.json lists v0.6.0 as "latest". The R6 gate ("M23 fires after M22 lands") is cleared with receipt.

---

## R1-R10 Disposition Table

| Gate | Question | Status | Note |
|---|---|---|---|
| R1 | "Peer / Power" vocabulary? | RESOLVED | Use Peer / Power. Ratified BP092. |
| R2 | Unified M23 (not Option B)? | RESOLVED | Full Citadel scope. Option B retired. |
| R3 | Quit = exit Electron process? | RESOLVED | `app:request-quit` at `src/main/index.ts:2900`. Wire button. |
| R4 | Diagnostics 4-surface scope? | RESOLVED | Logs + Config editor + Process list + Inference sliders. |
| R5 | "Models" as nav label? | RESOLVED | SkuUpgradePanel.tsx is the render target. |
| R6 | M23 fires after M22 lands? | RESOLVED | M22 confirmed shipped. 5/5 peers on v0.6.0. Receipt: 2026-06-23T01:45 UTC. |
| R7 | Mobile MVP in M23 scope? | RESOLVED | T12 (360px) + T5b (375px smoke) are required gates. |
| R8 | Quickstart Card copy? | **PENDING** | Proposed copy in BP091 §3a. Proceed with it. Founder may revise mid-session via KniPr. |
| R9 | MnemosyneC name only in title bar + About? | RESOLVED | Substrate-neutral nav labels throughout. |
| R10 | Version bump to v0.6.0? | RESOLVED (adjusted) | v0.6.0 already shipped (M22). M23 bumps to **v0.6.1**. Founder may override to v0.7.0. |

**Count: 9 RESOLVED · 1 PENDING (R8 · safe to fire, Founder may revise in-session)**

---

## M22 Compose-In Status (Critical for M23 Scope)

M18b (v0.5.18) landed: multi-ACTIVE-tile fix, Caithedral sweep, dynamic model names.
- §1d (Caithedral sweep): SKIP — already done. Verify only.
- §1f (radio semantics): SKIP — `getTileState()` already uses strict `===`. Verify only.
- §1e (hardcoded models): CHECK — M18b notes "dynamic model names." Knight verifies before editing; may be no-op.

M22 (v0.6.0) landed: Coop Mesh Activity panel, tier-aware routing, MIC rotation, MeshTaskQueue.
- §3d (mesh widget): LIVE — not a stub. Knight wires M22 data layer to Home nav item directly.
- Coop Mesh Activity was added to SettingsTab. M23 migrates it to the Home content area as the mesh widget.

---

## Fire Order Recommendation

**Parallel sessions, per BP089 override, with scope isolation:**

| Session | Branch | Scope | Files Touched | Conflict Risk |
|---|---|---|---|---|
| M23 UI Citadel | `knight-marathon-23-ui-citadel` | `src/renderer/` + `src/main/` (Electron app UI) | SettingsTab.tsx, MnemosyneTabView.tsx, App.tsx, SkuUpgradePanel.tsx, new components | Low |
| M13c THUNDERCLAP | `knight-marathon-13c-thunderclap` | `platform/src/` + backend (MMLU-Pro 70Q re-run) | Plow loop orchestration, substrate backend | None with M23 |

No file overlap between M23 and M13c. Parallel fire is safe. M13c fires from its own sibling SEG concurrently.

**Frame-to-Frame Download:** This marathon is not yet staged. Fire sequentially after M23 completes (it depends on the Tower download page which M23 will update via version_trust.json at Block 4).

**Recommended order:**
1. M13c (THUNDERCLAP) — fires NOW, sibling SEG, own branch, no M23 dependency
2. M23 UI Citadel — fires NOW, own branch, per this wrapper
3. Frame-to-Frame Download — fires AFTER M23 Block 4 ships v0.6.1 Tower deploy

---

## Open Questions for Founder

**R8 (only open gate):** Quickstart Card copy. The proposed text is:

> Welcome to MnemosyneC
> The Substrate Cure to AI Amnesia
>
> 1. Choose your AI tier under Models
> 2. Connect to the cooperative mesh
> 3. You're in.
>
> [Got it — let me in]

If Founder wants a revision to steps 2-3 or the button label, supply it before Knight reaches Block 3 or via in-session KniPr. No other gates are open.

**Version v0.6.1 vs v0.7.0:** M23 is a full architectural change (sidebar system, mode toggle, Quickstart Card, Diagnostics). Bishop recommends v0.6.1 since v0.6.0 just shipped the mesh core and the two are one coordinated release. Founder may ratify v0.7.0 if they judge the UI architecture warrants a minor-version marker.

---

## M23 Empirical Targets (Summary)

The planned Citadel resolves 7 documented friction points. The highest-value single change: AI Power Tier promoted from buried 5th-scroll position in SettingsTab to first-class nav item (position 2). This alone eliminates the phone-walkthrough failure mode Founder demonstrated at BP091.

T-gate count: 20 gates across 5 blocks. Success criterion for M23: T1-T20 all pass. Phone walkthrough target: tier selection confirmed in < 60 seconds, ≤ 3 verbal instructions, zero scrolling required.

---

*Bishop Synthesis · BP092 · M23 UI Citadel Fire Order*
*Sonnet 4.6 SEG · 2026-06-22 · Empirical receipts only*
