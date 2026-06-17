---
title: "Yoke-Return — First-Install Live Mesh Empirical Test · BP084"
date: 2026-06-16
session: BP084
model: "Sonnet 4.6"
status: "MIRRORS GREEN · SEG-3 code built (binary rebuild needed) · SEG-4/5/6 await Founder action"
---

# YOKE-RETURN — First-Install Live Mesh Empirical Test · BP084

**Model used: Sonnet 4.6**
**Session:** BP084
**Date:** 2026-06-16 (updated 2026-06-17 after deploy-atomic + mirror verification)

---

## Mirror Verification (deploy-atomic.ps1 run 2026-06-17 00:29 UTC)

| Sharp | URL | Result |
|---|---|---|
| mnemosynec.ai binary | https://mnemosynec.ai/download/MnemosyneC-Setup-0.5.0.exe | ✅ **200** · 539,702,827 bytes |
| cephas CRITICAL GATE | https://cephas.lianabanyan.com/download/MnemosyneC-Setup-0.5.0.exe | ✅ **200** · 539,702,827 bytes (was split-brain; fixed) |
| mnemosynec.ai latest.yml | https://mnemosynec.ai/download/latest.yml | ✅ **200** · `version: 0.5.0` |
| cephas latest.yml | https://cephas.lianabanyan.com/download/latest.yml | ✅ **200** · `version: 0.5.0` |

Both mirrors serving v0.5.0 binary at correct size. Cephas split-brain resolved.

---

## SEG Status

| SEG | Description | Status | Notes |
|---|---|---|---|
| Binary | v0.5.0 exists on both mirrors | ✅ GREEN | Founder confirmed: `release/MnemosyneC-Setup-0.5.0.exe` 539,702,827 bytes Jun 15 22:40. Both HTTP mirrors verified 200. |
| SEG-1 | Smoke test v0.5.0 binary on M0 | ⏳ WAITING | Physical install on M0 — Founder action |
| SEG-2 | Relay smoke test script | ✅ BUILT | `scripts/relay-smoke-test.mjs` — exits 0 on GREEN, 1 on RED. Run: `node scripts/relay-smoke-test.mjs` |
| SEG-3 | Join Live Event UI gap fix | ✅ CODE BUILT | 5 files created/modified (see below). ⚠️ **BINARY TIMING AMBER**: code written after v0.5.0 binary was built. Existing installer does NOT include the Join Live Event panel. Rebuild needed for UI to appear in installed app. |
| SEG-4 | Empirical proof on 3 LAN boxes | ⏳ WAITING | Requires: F1-F6 complete + new binary with SEG-3 UI |
| SEG-5 | Remote sons 5-line card | ✅ DRAFTED | Email template + install card at `INSTALL_CARD_5_LINE_BP084.md`. Send after LAN boxes GREEN. |
| SEG-6 | Real distributed plow via MIC | ⏳ WAITING | Requires SEG-4 GREEN (4+ peers on mesh) |
| SEG-7 | Truth-Always Sharps | 🟡 PARTIAL | See below |
| SEG-8 | Yoke-return + canon eblet | ✅ This file |

---

## ⚠️ Binary Timing — TRUTH-ALWAYS AMBER

The v0.5.0 binary at `release/MnemosyneC-Setup-0.5.0.exe` was built **Jun 15 22:40**.

The SEG-3 Join Live Event UI code (5 files) was written by Knight in this session **Jun 16 ~19:13 local** — AFTER the binary was built.

**Result:** Existing v0.5.0 installer opens the app WITHOUT the Substrate Awakens Join panel in Settings. The panel code exists in source and will compile cleanly, but users installing the current binary will not see it.

**Resolution required:** `npm run dist:win` → builds new binary → ship as v0.5.0-patch or v0.5.1.

This is not cosmetic. Until a new binary is built and deployed, the "Settings → Substrate → Join Live Mesh" flow described in SEG-4 cannot be tested.

---

## SEG-3 Files Built

| File | Action | Status |
|---|---|---|
| `src/main/federation/substrate_awakens_ipc.ts` | NEW | 3 IPC handlers: register, handshake, get-state |
| `src/renderer/components/SubstrateAwakensJoinPanel.tsx` | NEW | 5-state React UI: loading → not-joined → token-sent → joining → joined/error |
| `src/main/preload.ts` | MODIFIED | Exposed `substrateAwakens` APIs via contextBridge |
| `src/main/index.ts` | MODIFIED | Registered `registerSubstrateAwakensIPC()` at startup |
| `src/renderer/components/SettingsTab.tsx` | MODIFIED | Renders `<SubstrateAwakensJoinPanel />` in Substrate section |

---

## Truth-Always Sharps — Honest Assessment

| Sharp | Claim | Result | Notes |
|---|---|---|---|
| Sharp 1 | mnemosynec.ai serves v0.5.0 binary (200 + 539MB) | ✅ **GREEN** | Verified 2026-06-17 via deploy-atomic |
| Sharp 2 | cephas serves v0.5.0 binary (200 + 539MB) | ✅ **GREEN** | Was split-brain; fixed by deploy-atomic |
| Sharp 3 | Join Live Event UI in installed app | ⚠️ **AMBER** | Code built. Binary predates code. New build needed. |
| Sharp 4 | Fresh install M0 → connected within 5 min | ❌ **RED** — NOT TESTED | Empirical test not yet run. Awaits Founder install + F1-F6. |
| Sharp 5 | Same on M1 (16 GB) | ❌ **RED** — NOT TESTED | Same blocker |
| Sharp 6 | Same on M2 (32 GB) | ❌ **RED** — NOT TESTED | Same blocker |
| Sharp 7 | Same on M3 (32 GB) | ❌ **RED** — NOT TESTED | Same blocker |
| Sharp 8 | Each peer shows on mesh within 30 sec | ❌ **RED** — NOT TESTED | Requires F3/F4 migrations + peer installs |
| Sharp 9 | NO PowerShell / Node / USB / CLI at any user step | ✅ **GREEN** — by design | 5-line card is zero-CLI. Join flow is email+token only. |
| Sharp 10 | Remote son completes install + join | ❌ **RED** — NOT YET | Card drafted. Waiting for LAN proof first. |
| Sharp 11 | Real distributed plow returns aggregate receipt | ❌ **RED** — NOT YET | Requires 6+ peers on mesh |

**Honest summary: 3/11 Sharps GREEN (binary mirrors + zero-CLI design). AMBER: Join UI in binary needs rebuild. 7 RED await empirical testing.**

This is Truth-Always. No cosmetic-green. No timeout-swallowed-yellow.

---

## What Knight Built (Code Artifacts)

| File | Action | Status |
|---|---|---|
| `src/main/federation/substrate_awakens_ipc.ts` | NEW — 3 IPC handlers: register, handshake, get-state. Relay primary+fallback. 60s heartbeat. State file. | ✅ |
| `src/renderer/components/SubstrateAwakensJoinPanel.tsx` | NEW — 5-state dark-theme React panel (loading→not-joined→token-sent→joining→joined+error). Every-click feedback. Hardware tier display. | ✅ |
| `src/main/preload.ts` | MODIFIED — `substrateAwakensRegister`, `substrateAwakensHandshake`, `substrateAwakensGetState` added at lines ~409–417 + interface at ~1669–1671 | ✅ |
| `src/main/index.ts` | MODIFIED — import at line 38, `registerSubstrateAwakensIPC()` call at line 2745 | ✅ |
| `src/renderer/components/SettingsTab.tsx` | MODIFIED — import at line 15, `<SubstrateAwakensJoinPanel />` at line 2145 (above Substrate Mode section, `id="settings-section-substrate"`) | ✅ |
| `scripts/relay-smoke-test.mjs` | NEW — SEG-2 standalone smoke test. Loads env safely, posts PeanutRoll, checks peer_presence row, cleans up. Never echoes secrets. | ✅ |
| `BISHOP_DROPZONE/00_FOUNDER_REVIEW/FIRST_INSTALL_MESH_PREFLIGHT_BP084.md` | NEW — F1-F6 preflight + v0.5.0 build notice | ✅ |
| `BISHOP_DROPZONE/00_FOUNDER_REVIEW/INSTALL_CARD_5_LINE_BP084.md` | NEW — 5-line card + son email | ✅ |

---

## What Must Happen For Sharps to Turn GREEN

```
STEP 1 (Founder, ~15 min):
  npm run dist:win  ← builds v0.5.0 with Join Live Event UI

STEP 2 (Founder, ~35 min total):
  F1: Fix Squarespace DNS (_acme-challenge.relay TXT — 30 sec)
  F2: Verify relay.lianabanyan.com in Supabase (1 min)
  F3: Run peer_presence migration in SQL Editor (2 min)
  F4: Run substrate_awakens migration (2 min)
  F5: Verify COMMENTS_HMAC_SECRET set (1 min)
  F6: Enable Realtime on peer_presence + substrate_awakens_registrations (1 min)

STEP 3 (Knight + Founder, ~10 min):
  Run: node scripts/relay-smoke-test.mjs  ← SEG-2 empirical verify
  Expected output: "SEG-2 RESULT: GREEN"

STEP 4 (Founder, ~5 min per box):
  Install v0.5.0 on M0 using 5-line card → confirm "Connected" appears
  Install on M1/M2/M3 → confirm each appears on dashboard

STEP 5 (Founder, ~5 min):
  Send sons the email from INSTALL_CARD_5_LINE_BP084.md

STEP 6 (after 6 peers on mesh):
  MIC plow: M0 as conductor → dispatch to all peers → aggregate receipt
```

---

## Once All Sharps Are GREEN — Canon Receipt

*[This section will be filled in after the empirical test completes]*

The publishable receipt will be:

> "The first real cooperative-class WAN mesh handshake — N peers, M questions across X domains,
> Y% accuracy, Z% Andon-quarantine, runtime W minutes. Architecture: MIC dispatch via
> relay.lianabanyan.com + heartbeat-attested peer presence + zero-CLI install. Reproducible:
> download v0.5.0 → install → join → mesh in <5 minutes."

---

*Partial yoke-return · Knight (Sonnet 4.6) · BP084 · June 16, 2026*
*Will be updated to FINAL after Founder completes F0-F6 and Sharps are verified.*

**FOR THE KEEP. The cooperative shows itself. From the download. From the first install.**
