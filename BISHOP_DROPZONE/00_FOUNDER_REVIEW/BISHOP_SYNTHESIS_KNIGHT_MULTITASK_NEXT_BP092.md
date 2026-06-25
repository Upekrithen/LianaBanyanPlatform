# BISHOP SYNTHESIS — Knight Multitask NEXT · BP092

**Bishop SEG · Sonnet 4.6 · 2026-06-22**

---

## What Each NEXT Does

**NEXT-1 — Ship v0.6.1 to Fleet (30-60 min)**
Runs `npm run dist:win` on the already-clean `fix/m22-ws-transport-v061` branch (commit `db0fa88`). Copies the .exe + blockmap + latest.yml to Hugo static. Deploys Hugo to Firebase. Verifies HTTP 200 at the live download URL and confirms `latest.yml` shows v0.6.1. This triggers the Electron auto-update mechanism for all 5 active peers — without it, the WS-transport fix sits compiled but never reaches the fleet.

**NEXT-2 — Member CTA Ghost World Fix (2-3 hrs)**
The Founder clicked "Become a Member $5/yr" in the Electron topbar and hit a full-page "Your Access Key" barrier with no exit path. Ghost World canon (and BP085 ratified modal copy) require a "Maybe later" dismiss. The fix is platform-side only (`platform/src/pages/MembershipGate.tsx` + `ProtectedRoute.tsx`) — no Electron renderer touch, so zero worktree collision with M23. The dispatch also includes an auth-gate audit across all platform routes (output as CSV) and a stub survey of dual-price display points for a future session.

**NEXT-3 — M23b UI Citadel Blocks 3-5 (4-8 hrs)**
Continues the UI Citadel buildout on `knight-marathon-23-ui-citadel`. Block 3 adds QuickstartCard, an Advanced collapsible panel, Diagnostics (4 surfaces: raw logs, process list, config viewer, inference override sliders), and M22 mesh relay status compose-in. Block 4 builds the new Electron version with M23 changes and deploys to Tower. Block 5 runs empirical smoke tests with a full phone walkthrough.

**NEXT-4 — M13c THUNDERCLAP Investigation + Re-Fire (90-150 min)**
Bishop found at 03:00 UTC that M13c's prior "background worker" claim left the DB untouched — `mesh_task_queue` 0 rows, `peer_marks_log` 0 rows. Knight investigates first (orphaned process? dry-run mode? error exit?), writes an investigation receipt, then re-fires the canonical 42Q sweep against the 5-peer fleet via `validate-relay.mjs` with tier-aware routing, ABSTAIN protocol, and contested-vote cascade. All traffic via `relay.lianabanyan.com` (LAN-AS-WAN canon). KniPr emitted after Q42.

---

## Why This Ordering

**NEXT-1 goes first** because it is the smallest task and unblocks the most. The WS-transport fix is already compiled — it just needs dist:win and a deploy. Every minute it sits unshipped is a minute the fleet is not auto-updating. While dist:win runs (which takes wall-clock time with no Knight input needed), the other three SEGs spin in parallel — maximum concurrency, zero idle time.

**NEXT-2 and NEXT-3 are parallel** because they touch different parts of the codebase with zero overlap. NEXT-2 is entirely `platform/src/` (lianabanyan.com React app). NEXT-3 is entirely `src/renderer/` (Electron renderer on a separate branch). Running them serial would double the wall-clock for no reason.

**NEXT-4 is independent** of all build and UI work. It needs the fleet (which is already live at v0.6.0, and may be v0.6.1 by the time it fires). It writes no code. Spinning it as its own SEG means the empirical headline can land while Knight is still mid-UI-work on NEXT-3.

---

## Where the Empirical Headline Lands After All 4 Close

After all four SEGs complete:

- **Fleet is on v0.6.1** with WS-transport fix live and Ghost World member CTA compliant.
- **Electron UI has a full Citadel shell** — QuickstartCard, Diagnostics 4-surface, Advanced panel, M22 relay status in-view.
- **M13c delivers the canonical THUNDERCLAP 42Q receipt** — per-tier accuracy (ULTRA llama3.3:70b / FULL gemma4:12b / CORE gemma2:9b), ABSTAIN counts, contested resolution log, and comparison against M12 (61.9%). This is the BP092 empirical headline: cooperative substrate accuracy at 42Q tier-stratified, ready for Founder ratify and social blast hold.
- **Auth-gate audit CSV** gives a full disposition map of every protected route — Founder review triggers the next Ghost World compliance wave.

The session that closes last is NEXT-3 (4-8 hrs wall-clock). Total parallel elapsed = 4-8 hrs. Serial elapsed would be 8-14 hrs.

---

*Bishop SEG · Sonnet 4.6 · BP092 · 2026-06-22*
