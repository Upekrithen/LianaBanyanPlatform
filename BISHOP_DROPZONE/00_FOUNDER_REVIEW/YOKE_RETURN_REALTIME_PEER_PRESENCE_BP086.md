# YOKE RETURN — Realtime Publication + peer_presence Diagnosis
**Session:** BP086 · **Filed:** 2026-06-18 · **Knight:** Knight #2 (fresh wake)
**Model:** Sonnet 4.6

---

## Consolidated Sharps Table — This Session

### STREAM I — Realtime + peer_presence Hotfix

| Sharp | Status | Evidence |
|---|---|---|
| I1 REALTIME_PUBLICATION_FIXED | ✅ GREEN | Migration `20260618000007_realtime_publication_help_and_presence.sql` applied. `pg_publication_tables` confirms `help_messages` + `peer_presence` both present in `supabase_realtime`. Commit `660507a`. |
| I2 WRITE_PATH_DIAGNOSED | ✅ GREEN | Root cause: `registerPresenceConfig()` never called in `index.ts` → `publishPresence()` exits null-guard every 60s without ever POSTing. Smoke POST (corrected PeanutRoll payload) confirmed peer_presence write works end-to-end. Diagnosis doc filed. |

---

### STREAM G — CT Bounty Wall Real-Copy (CONFIRMED COMPLETE, prior session)

| Sharp | Status | Evidence |
|---|---|---|
| G1 RECON_DONE | ✅ GREEN | Placeholder blocks located in `become-boss.html` + `bounties.html` partials. Prior session. |
| G2 CARDS_APPLIED | ✅ GREEN | All 7 drafts applied — card-flip + a11y preserved. Prior session, commit `4deecab`. |
| G3 CT_LIVE_VERIFIED | ✅ GREEN | Hugo build exit 0 · Firebase deploy exit 0 · all 7 cards live on cerostechnology.com. Disk-verified this session: `bounties.html` 16,999 bytes, real mac-port copy confirmed. |

---

### STREAM H — E5 Hooks Gap (CONFIRMED COMPLETE, prior session)

| Sharp | Status | Evidence |
|---|---|---|
| H1 HOOK_RECON_DONE | ✅ GREEN | Hook gap pinpointed — `.cursor/hooks/` empty at E5 time. Prior session. |
| H2 HEALTH_CHECK_HOOK_LIVE | ✅ GREEN | `.cursor/hooks.json` + `~/.claude/hooks/bp086_post_deploy_health_check.ps1` written. Commit `582b0d1`. Disk-verified this session: both files present. Hook fires on `firebase deploy.*hosting:` matcher. |

---

## Preflight Gadget Checks (§14 verified this wake)

| Check | Result |
|---|---|
| peer_presence rows (last 15m) | **0** — A3 still gated (expected; I1 fixes Realtime, I3 fixes write path) |
| peer_presence rows (all) | **0** |
| v0.5.3 HEAD | **200 OK, 539,908,059 bytes** ✅ |
| relay.lianabanyan.com | **405 on GET (POST-only, service UP)** ✅ |
| hooks.json on disk | **FOUND** at `.cursor/hooks.json` ✅ |
| CT bounties real copy | **CONFIRMED** — mac-port content in bounties.html ✅ |

---

## I2 Root Cause Summary

**File:** `src/main/federation/peer_server.ts` exports `registerPresenceConfig()` which sets module-level vars `_peerId`, `_wanSoccerballId`, `_supabaseUrl`.

**File:** `src/main/index.ts` calls `startPeerServer()` at line 5685. `startPeerServer()` fires `publishPresence()` on a 60-second interval. But `publishPresence()` opens with:
```typescript
if (!_peerId || !_wanSoccerballId || !_supabaseUrl) return;
```
...and since `registerPresenceConfig()` is never called from `index.ts`, all three vars are permanently `null` → every tick exits silently without ever POSTing to wan-relay-publish.

**Smoke test:** Corrected PeanutRoll payload (with `s`, `v:1`, `p`, `b`, `ts` fields + valid hex SID) → HTTP 202 → row confirmed in `peer_presence` within 3 seconds. The edge function and table are healthy.

---

## What Bishop Should Compose Next (I3)

**I3 fix target:** `src/main/index.ts` — call `registerPresenceConfig()` immediately after `startPeerServer()` at line ~5685, passing:
- `peerId` from wherever the app generates/stores its node identity
- `wanSoccerballId` (relay session ID)
- `supabaseUrl` (the anon-accessible Supabase URL)

Estimated effort: ~20 lines, 1 file, <30 minutes. This is a v0.5.4 hotfix.

**After I3 lands:** Rebuild → re-ship v0.5.4 installer → Founder relaunches MnemosyneC on M0-M3 → `peer_presence` fills → A3 GREEN → A6 smoke → A7 MMLU-Pro → THUNDERCLAP 🌩️

---

## State Cascade

| Gate | Status | Unblocked by |
|---|---|---|
| Pipeline tab ● Connected | 🟡 PENDING RELAUNCH | I1 (server-side change already applied; app must reconnect) |
| peer_presence writes | 🔴 BLOCKED | I3 (registerPresenceConfig wiring — Bishop to compose) |
| A3 FLEET_AWAKE | 🔴 FOUNDER-GATED | peer_presence ≥2 rows after I3 + M1-M3 online |
| A6 SMOKE_PASS | ⏳ PENDING | A3 |
| A7 MMLU_RECEIPT | ⏳ PENDING | A6 |
| THUNDERCLAP 🌩️ | ⏳ PENDING | A7 |

---

**Knight #2 sign-off · Sonnet 4.6 · BP086**

FOR THE KEEP.
