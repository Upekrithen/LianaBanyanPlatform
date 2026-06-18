# YOKE RETURN I7 — MIC Fleet Broadcast + v0.5.7

**Session:** BP086 · **Filed:** 2026-06-18 · **Filed by:** Knight (Sonnet 4.6)
**Yoke:** KNIGHT_YOKE_I7_MIC_FLEET_BROADCAST_v0_5_7_BP086.md

---

## Sharps Table

| # | Sharp | Status | Notes |
|---|-------|--------|-------|
| I7a | TABLES_LIVE | **GREEN** | `fleet_broadcast` + `fleet_broadcast_ack` created, RLS enabled, both in `supabase_realtime` publication |
| I7b | EDGE_FN_LIVE | **GREEN** | `mic-broadcast` deployed to `ruuxzilgmuwddcofqecc`; smoke POST returned `broadcast_id=d49a3651` |
| I7c | LISTENER_WIRED | **GREEN** | `startMicBroadcastListener()` added to `src/main/index.ts`; 6 PATH X handlers (real implementations, not stubs); tsc clean |
| I7d | CLI_USABLE | **GREEN** | `tools/mic-broadcast/issue.mjs` — supports all 6 types, `--watch`, `--poll-until=N`, `--timeout-s`; file-based key loading fixed for Windows `\r\n` |
| I7e | V0_5_7_BUILT | **GREEN** | `release/MnemosyneC-Setup-0.5.7.exe` — 514.9 MB, all IPC/SKU/ollama asserts PASS |
| I7f | V0_5_7_LIVE | **GREEN** | mnemosynec.ai + mnemosynec.org both return `version: 0.5.7` (verified HTTP 200) |
| I7g | CHANNEL_PROVEN | **BOOTSTRAP** | 0/5 acks — expected; see caveat below |

---

## v0.5.7 Build Artifacts

- **Installer:** `release/MnemosyneC-Setup-0.5.7.exe`
- **Size:** 539,916,006 bytes (514.9 MB)
- **SHA512 (first 20):** `xcch97wvj90IAK8lZBmc`
- **SHA512 (full):** `xcch97wvj90IAK8lZBmciQ5/47ssfuv2WWtmEUfJKj4t9vtZvTDg4AaN6MaU6BpdxrDdrXipIpXoWn3hG47EvA==`
- **Release date:** 2026-06-18

---

## I7c — Desktop Listener: 6 PATH X Handlers

`startMicBroadcastListener(peerId, appVersion)` in `src/main/index.ts`:

| broadcast_type | Implementation |
|----------------|----------------|
| `noop_test` | Acks immediately with `completed` + peer metadata |
| `health_snapshot` | Queries `/api/ps` + `/api/tags` from Ollama; reports loaded/available models + VRAM |
| `fleet_warmup` | POSTs actual warmup prompt to `/api/generate` with `keep_alive: '24h'`; reports load_latency_ms |
| `config_set` | If `key === 'ollama.model_pull'`: runs `ollama pull <model>` via `execFile`; acks `processing` → `completed`; generic config_set acks immediately |
| `auto_update` | Logs + acks `received`; calls `autoUpdater.checkForUpdates()` |
| `benchmark_run` | Logs + acks `received`; instructs peer to participate via wan-relay-route |

Acks use `fleet_broadcast_ack` via Supabase REST with `on_conflict=broadcast_id,peer_id` (merge-upsert, not duplicate insert).

Broadcasts are polled every 10s via REST (with 60s lookback window). A `processedIds` Set prevents double-dispatch.

---

## I7g — noop_test Broadcast Result

**Broadcast ID:** `f58b7cde-b9e4-45bd-b5fb-268c41324a67`
**Acks received at 60s:** **0 / 5**

**This is correct and expected.** See bootstrap caveat below.

---

## Bootstrap Caveat (MANDATORY READ)

> **v0.5.5 → v0.5.7 requires one manual relaunch per peer.**

v0.5.6 and earlier do NOT have the `startMicBroadcastListener` in their Electron main process. They cannot receive fleet broadcasts. The listener only exists in v0.5.7 and later.

**What Founder must do:**

> Tell all 5 peers to quit MnemosyneC and relaunch it. The auto-updater will pull v0.5.7 automatically on relaunch.

The sequence:
1. Peer quits MnemosyneC (Electron app)
2. On relaunch, `electron-updater` detects `latest.yml` advertises v0.5.7 (served from mnemosynec.ai + mnemosynec.org)
3. Downloads and installs v0.5.7
4. App restarts — `startMicBroadcastListener` is now live
5. After this single manual step, all future updates can be pushed via `auto_update` broadcast — **no manual steps ever again**

**After all 5 peers are on v0.5.7:** Issue another `noop_test` to confirm CHANNEL_PROVEN. Then fire the 5-peer cross-WAN diagnostic via `wan-relay-route`.

---

## Edge Function

- **URL:** `https://ruuxzilgmuwddcofqecc.supabase.co/functions/v1/mic-broadcast`
- **POST:** issue broadcast → returns `{ ok: true, broadcast_id, created_at, status: 'active' }`
- **GET ?broadcast_id=<uuid>:** fetch ack status for a broadcast

---

## CLI Usage

```powershell
# From workspace root — no env pre-loading needed (reads key from secrets file)
node tools/mic-broadcast/issue.mjs --type=noop_test --version=0.5.7 --watch
node tools/mic-broadcast/issue.mjs --type=health_snapshot --watch
node tools/mic-broadcast/issue.mjs --type=fleet_warmup --payload='{"model":"gemma4:12b"}' --watch
node tools/mic-broadcast/issue.mjs --type=config_set --payload='{"key":"ollama.model_pull","value":"gemma4:12b"}' --poll-until=5 --timeout-s=1800
node tools/mic-broadcast/issue.mjs --type=auto_update --version=0.5.8 --issued-by=mic
```

---

## Files Changed

| File | Change |
|------|--------|
| `platform/supabase/migrations/20260618000009_mic_fleet_broadcast_tables.sql` | NEW — fleet_broadcast + ack tables, RLS, Realtime publication |
| `platform/supabase/functions/mic-broadcast/index.ts` | NEW — Edge Function POST/GET |
| `src/main/index.ts` | + `postAck()` helper + `startMicBroadcastListener()` + call after relay poll |
| `tools/mic-broadcast/issue.mjs` | NEW — CLI broadcast tool |
| `package.json` | `version: 0.5.6 → 0.5.7` |
| `Cephas/cephas-hugo/static/download/latest.yml` | Updated to v0.5.7 |
| `Cephas/cephas-hugo/static/download/MnemosyneC-Setup-0.5.7.exe` | NEW — installer (514.9 MB) |

---

## Next Action (after fleet relaunches to v0.5.7)

1. `node tools/mic-broadcast/issue.mjs --type=noop_test --version=0.5.7 --watch`
   - Target: 5/5 acks within 10s for LAN peers
2. Confirm CHANNEL_PROVEN — all peers ack `completed`
3. Issue 5-peer cross-WAN diagnostic via `wan-relay-route`
4. Future: v0.5.8 ships via `auto_update` broadcast — zero manual steps

---

*Knight (Sonnet 4.6) · BP086 · 2026-06-18 · FOR THE KEEP!*
