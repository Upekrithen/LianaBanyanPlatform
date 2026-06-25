# KNIGHT MULTITASK PASTE — dist:win + Member CTA + M23b + M13c · BP092

**Sonnet 4.6 ONLY for all SEGs. [SEG]/[MAIN] tagging per A15 BLOOD. MIC reporting canon binds: per-Block-close progress to `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_KNIGHT_PROGRESS\`. Path-B Yoke check first. brief_me only if you haven't called it this session. §14 BLOOD throughout (Bishop has direct Supabase; if Knight hits a DB-blocked action, surface to Bishop via dropzone instead of asking Founder).**

---

## PRIORITY MAP

| Task | Priority | Concurrency | Wall-Clock |
|---|---|---|---|
| NEXT-1: Ship v0.6.1 to fleet | HIGHEST — unblocks auto-update for all peers | Solo first, then parallel | 30-60 min |
| NEXT-2: Member CTA Ghost World fix | HIGH — parallel SEG | Parallel with NEXT-3 | 2-3 hrs |
| NEXT-3: M23b UI Citadel Blocks 3–5 | HIGH — parallel SEG | Parallel with NEXT-2 | 4-8 hrs |
| NEXT-4: M13c THUNDERCLAP investigation + re-fire | INDEPENDENT — own SEG | Parallel with NEXT-2 + NEXT-3 | 90-150 min |

**Execution model:** Dispatch NEXT-1 first (blocking: fleet needs this). While NEXT-1 runs dist:win, spin NEXT-2, NEXT-3, NEXT-4 as parallel SEGs. NEXT-2 and NEXT-3 have zero worktree collision (confirmed below). NEXT-4 is a measurement run with no build — fully independent.

---

## NEXT-1 · SHIP v0.6.1 TO FLEET

**Priority: HIGHEST. Start immediately. Unblocks fleet auto-update.**
**Branch:** `fix/m22-ws-transport-v061`
**Prior work:** WS-transport quick fix landed at commit `db0fa88`. Build was clean. dist:win not yet run.

### N1-1. Run dist:win

```powershell
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform"
git checkout fix/m22-ws-transport-v061
npm run dist:win
```

Expected output: `dist/MnemosyneC-Setup-0.6.1.exe` + `dist/MnemosyneC-Setup-0.6.1.exe.blockmap` + `dist/latest.yml`.

If dist:win fails: surface error to Bishop at `BISHOP_DROPZONE\00_KNIGHT_PROGRESS\M22_QUICKFIX_BLOCK6_DISTWIN_<timestamp>.md` with full error output. Do NOT attempt to fix build failures in-session without Bishop dispatch.

### N1-2. Copy release artifacts to Hugo static

Source:
```
C:\Users\Administrator\Documents\LianaBanyanPlatform\dist\MnemosyneC-Setup-0.6.1.exe
C:\Users\Administrator\Documents\LianaBanyanPlatform\dist\MnemosyneC-Setup-0.6.1.exe.blockmap
C:\Users\Administrator\Documents\LianaBanyanPlatform\dist\latest.yml
```

Destination:
```
C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\static\download\
```

Verify `version_trust.json` at `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\static\download\version_trust.json` reads `"version": "0.6.1"`. This is the canonical Hugo Tower data source (per canon — `version.json` is stale fork, NOT read by Tower template). If it reads a prior version, update it now.

### N1-3. Hugo build + Firebase deploy

```powershell
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo"
hugo --minify
firebase deploy --only hosting:mnemosyne
```

### N1-4. Verify live

- HTTP 200 at `https://mnemosynec.org/download/MnemosyneC-Setup-0.6.1.exe`
- `latest.yml` live at `https://mnemosynec.org/download/latest.yml` confirms `version: 0.6.1`

### N1-5. MIC Report — Block 6 Close

Knight writes:
`C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_KNIGHT_PROGRESS\M22_QUICKFIX_BLOCK6_DISTWIN_<timestamp>.md`

Report includes: dist:win output (pass/fail), file sizes of .exe + .blockmap + latest.yml, HTTP 200 confirms, version_trust.json value, Firebase deploy receipt.

---

## NEXT-2 · MEMBER CTA GHOST WORLD BARRIER FIX

**Priority: HIGH. Parallel SEG — spin after NEXT-1 launches dist:win.**
**Branch: branch off `main` — NOT off `knight-marathon-23-ui-citadel`.**
**Full dispatch:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_QUICK_FIX_MEMBER_CTA_NO_THANKS_BARRIER_GHOST_WORLD_BP092.md`

Knight reads that dispatch in full before starting. Key summary:

**Problem:** Founder clicked "Become a Member $5/yr" in the Electron app topbar → browser opened to full-page "Your Access Key" barrier with no dismiss path. Ghost World violation.

**Fix path (Option A — Bishop recommendation):** Fix the landing page `MembershipGate.tsx` (platform side), not the Electron renderer. Zero worktree collision with M23 UI Citadel (M23 touches `src/renderer/`; this fix touches `platform/src/` only).

**Block structure from the dispatch:**
- Pre-Block: Gadget-verify current wiring (read 5 files, confirm barrier)
- Block 1: Add "Maybe later" dismiss to `platform/src/pages/MembershipGate.tsx` + apply BP085-ratified copy + resolve handlePayment auth-guard (verify edge function first)
- Block 2: Auth-gate audit across all platform routes → output CSV to `BISHOP_DROPZONE\00_FOUNDER_REVIEW\AUTH_GATE_AUDIT_GHOST_WORLD_BP092.csv`
- Block 3: Wire Ghost World inline modal in `platform/src/components/ProtectedRoute.tsx` — minimum: replace `Navigate to="/auth"` with `Navigate to="/join"` everywhere; enhanced: blurred-preview + modal
- Block 4: Survey + stub dual-price display (no implementation — stub only this session)
- Block 5: Platform build + deploy `lianabanyan.com` + smoke-test `/join` page
- Block 6: If v0.6.1 has already shipped (NEXT-1 complete): these are platform-side changes only, no Electron version bump needed. Ship as platform hotfix. If Founder wants a v0.6.2 Electron build, that is a separate session.

**MIC reports:** Per-Block-close. Write to `BISHOP_DROPZONE\00_KNIGHT_PROGRESS\` with filename pattern `M22_CTA_BLOCK<N>_<timestamp>.md`.

**WORKTREE COLLISION CHECK:**
- M23 UI Citadel touches: `src/renderer/` (LeanShell, CitadelShell, SidebarNav, ModeToggle)
- NEXT-2 touches: `platform/src/pages/MembershipGate.tsx`, `platform/src/components/ProtectedRoute.tsx`
- **RESULT: ZERO COLLISION. Safe to run parallel.**

---

## NEXT-3 · M23b UI CITADEL BLOCKS 3–5

**Priority: HIGH. Parallel SEG — spin simultaneously with NEXT-2.**
**Branch:** `knight-marathon-23-ui-citadel`
**Prior work:** M23a landed Blocks 1+2 at commit `24e4977`: ModeToggle + SidebarNav + CitadelShell + R3 two-button (CLOSE + QUIT). The two-button Close/Quit semantic is canonical going forward — do not revisit.

### Block 3 — QuickstartCard + Advanced + Diagnostics + M22 Mesh Compose-In

Knight implements the following on `knight-marathon-23-ui-citadel`:

**B3-1. QuickstartCard component**
A concise card shown in the Citadel main view for new/disconnected peers. Provides 1-2-3 onboarding actions. Bishop does not prescribe implementation details — Knight reads existing `CitadelShell.tsx` and `SidebarNav.tsx` first, then designs the card to fit the established shell pattern.

**B3-2. Advanced section**
Collapsible "Advanced" panel in the Citadel shell. Gate behind the existing ModeToggle "Advanced" mode (already wired in M23a). Contents: peer configuration, relay override, model selection.

**B3-3. Diagnostics — 4 surfaces**

| Surface | Description |
|---|---|
| Raw logs | Live-tail of Electron main process log — read from existing log path, render in scrollable `<pre>` |
| Process list | List of active Ollama processes + mesh worker sub-processes — refresh every 5s |
| Config JSON editor | Read/display current `config.json` path — view-only in this block, edit in a future block |
| Inference override sliders | RAM tier override + model selection override — write to `peer_presence.overrideActive` and matching fields via existing IPC (read M18b implementation for the override IPC pattern before implementing) |

**B3-4. M22 mesh compose-in**
Surface the WS relay status in the Citadel diagnostic panel. Read from the existing relay heartbeat/status mechanism (confirmed live in M22). Show: relay URL, connection state (connected/disconnected/reconnecting), last heartbeat timestamp. This is display-only — no new relay logic.

### Block 4 — v0.6.1 (or v0.6.2) Build + Tower Deploy with M23 Changes

After Block 3 is clean and passing typecheck:

- If NEXT-1 has already shipped v0.6.1: coordinate with Bishop whether this ships as v0.6.2 or is held for a subsequent release cycle. Check `BISHOP_DROPZONE\00_KNIGHT_PROGRESS\` for M22 NEXT-1 Block 6 receipt before deciding version.
- Run `npm run dist:win` on `knight-marathon-23-ui-citadel` branch.
- Copy artifacts to `Cephas\cephas-hugo\static\download\`.
- Hugo build + Firebase deploy `hosting:mnemosyne`.
- Update `version_trust.json` to the new version.

### Block 5 — Empirical Smoke Tests + Phone Walkthrough

- Launch the built Electron app.
- Walk through: connect, QuickstartCard visible, Diagnostics open (all 4 surfaces render), Advanced panel toggles, inference override sliders write correctly, M22 relay status shows live.
- Document any failures as surface-to-Bishop items — do NOT fix UI regressions in-session without Bishop dispatch.
- Write smoke test receipt to `BISHOP_DROPZONE\00_KNIGHT_PROGRESS\M23b_BLOCK5_SMOKE_<timestamp>.md`.

**MIC reports:** Per-Block-close. Filename pattern `M23b_BLOCK<N>_<timestamp>.md`.

**WORKTREE COLLISION CHECK:**
- NEXT-3 touches: `src/renderer/` (CitadelShell, new Diagnostics, new QuickstartCard)
- NEXT-2 touches: `platform/src/` only
- NEXT-1 touches: `fix/m22-ws-transport-v061` branch (separate branch)
- NEXT-4: no code edits (measurement run)
- **RESULT: ZERO COLLISION between all four. Safe to run all parallel.**

---

## NEXT-4 · M13c INVESTIGATION + RE-FIRE

**Priority: INDEPENDENT. Own SEG — spin immediately, runs parallel to build/UI work.**
**Full dispatch:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_MARATHON_M13c_THUNDERCLAP_V060_FIRE_BP092.md`

Knight reads that dispatch in full. Key context for this wake:

### Investigation First (pre-Block 0)

Bishop empirical at 03:00 UTC found:
- `peer_presence`: all peers `role='worker'`, `wave_id=NULL`
- `mesh_task_queue`: 0 rows
- `peer_marks_log`: 0 rows

M13c's prior session claimed "background worker" fired `validate-relay.mjs` against the mesh — but the empirical DB state says otherwise. Fleet was NOT exercised.

Knight investigates before re-firing:

**INV-1:** Check for orphaned `validate-relay.mjs` process on M0 (or whichever machine ran M13c). Look for lingering node processes:
```powershell
Get-Process node -ErrorAction SilentlyContinue | Select-Object Id, CPU, StartTime
```

**INV-2:** Check for validate-relay.mjs error output in any log file at:
```
C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\
```
Look for any `.log` or error file from the prior session.

**INV-3:** Was validate-relay.mjs run in `--local-only` mode or `--dry-run` mode that bypassed peer dispatch? Read the actual command used in M13c session (check git log, transcript, or any receipt file at `BISHOP_DROPZONE\00_KNIGHT_PROGRESS\`).

**INV-4:** Report findings to Bishop in batch at `BISHOP_DROPZONE\00_KNIGHT_PROGRESS\M13c_INVESTIGATION_<timestamp>.md`. If the investigation reveals a bug in validate-relay.mjs that would affect the re-fire, surface to Bishop before firing 42Q — do NOT fire a broken test harness.

### Re-Fire (if investigation passes)

After investigation receipt is written, execute the full dispatch at `KNIGHT_MARATHON_M13c_THUNDERCLAP_V060_FIRE_BP092.md` starting at §1.

Key parameters from dispatch:
- **42Q sweep** via `validate-relay.mjs` with tier-aware routing
- **ULTRA:** `cb4ef450cc4a18c3` (M0 llama3.3:70b)
- **FULL:** `d0b47bd08633385b` + `88cbf6bdd6f74587` (M2/M3 gemma4:12b)
- **CORE:** `c532e74069e137bc` + `49f3e5971518a064` (MS/M1 gemma2:9b)
- **LAN-AS-WAN:** all traffic via `relay.lianabanyan.com` — no LAN shortcuts
- **ABSTAIN protocol active** (commit dde5e5c)
- **Contested-vote cascade** Tier 1/2/3 (commit dde5e5c)

If v0.6.1 fleet auto-update has completed by the time the re-fire begins, run against v0.6.1 fleet. Verify all 5 peers show `version: 0.6.1` before firing. If fleet is still v0.6.0 (auto-update in progress), fire against v0.6.0 — that is the original dispatch target. State exact fleet version in the receipt.

**MIC reports:** Every 10 questions. Write to `BISHOP_DROPZONE\00_KNIGHT_PROGRESS\` with filename pattern `M13c_Q<N>_<timestamp>.md`.

**KniPr emission:** After Q42, write full receipt to:
`C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIPR_M13c_THUNDERCLAP_V060_RECEIPT_BP092.md`

Receipt must include the `fleet_composition` JSON block from §5 of the M13c dispatch — non-canonical without it.

---

## FOUNDER-DIRECT REMINDERS (active for all 4 SEGs)

- **Caithedral always.** Every schema touch is Postgres only. gen_random_uuid() / TIMESTAMPTZ / BIGSERIAL / BYTEA. No SQLite primitives.
- **Substrate Cure framing always.** "The Substrate Cure to AI Amnesia" — not "the AI that remembers." On any public-facing copy touched during these sessions.
- **Two-button Close/Quit semantic is canonical going forward.** R3 resolved in M23a at commit `24e4977`. CLOSE = hide to tray. QUIT = full exit. Do not revisit or relitigate.
- **Full absolute paths in all returns.** No relative paths in any MIC report, receipt, or surface-to-Bishop item.
- **Blocker surface protocol:** If any blocker emerges across any SEG, surface to Bishop in batch to `BISHOP_DROPZONE\00_KNIGHT_PROGRESS\BLOCKERS_<timestamp>.md`. Maximum 25-word context per item. Batch all blockers from all SEGs into one file — do not send one-at-a-time.

---

## CONCURRENCY GUARD — FINAL WORKTREE COLLISION MATRIX

| | NEXT-1 `fix/m22-ws-transport-v061` | NEXT-2 `platform/src/` | NEXT-3 `knight-marathon-23-ui-citadel` `src/renderer/` | NEXT-4 no edits |
|---|---|---|---|---|
| NEXT-1 | — | SAFE | SAFE (different branch) | SAFE |
| NEXT-2 | SAFE | — | SAFE (`platform/src/` vs `src/renderer/`) | SAFE |
| NEXT-3 | SAFE | SAFE | — | SAFE |
| NEXT-4 | SAFE | SAFE | SAFE | — |

**All four parallel. Zero collision. Go.**

---

*Bishop SEG · Sonnet 4.6 · BP092 · 2026-06-22*
*Compose only — do NOT fire independently. Founder pastes this into Knight.*
