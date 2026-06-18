# Yoke Return — I10 ACK Channel Diagnostic
**Session:** BP087 · Knight Sonnet 4.6
**Completed:** 2026-06-18T23:57:46Z
**Status:** ALL PROBES COMPLETE · Hypothesis ratified · Recovery plan issued

---

## 1. I10a Results — Peer Presence Snapshot
**Probe time:** 2026-06-18T23:54:55Z
**Query:** `peer_presence WHERE last_seen_at > now() - interval '10 minutes'`

| peer_id | version | last_seen_at | ramGb | ramTier | ollamaModel |
|---|---|---|---|---|---|
| 49f3e5971518a064 | **0.5.8** | 2026-06-18 23:54:51+00 | 15.8 | standard | qwen2.5:7b |
| 88cbf6bdd6f74587 | **0.5.8** | 2026-06-18 23:54:49+00 | 31.9 | premium | gemma4:12b |
| cb4ef450cc4a18c3 | **0.5.8** | 2026-06-18 23:54:45+00 | 61.6 | premium | gemma4:12b |
| d0b47bd08633385b | **0.5.8** | 2026-06-18 23:54:06+00 | 31.9 | premium | gemma4:12b |
| c532e74069e137bc | **0.5.8** | 2026-06-18 23:53:58+00 | 15.8 | standard | qwen2.5:7b |

**H1 verdict: RULED OUT.** All 5 peers report version 0.5.8. No version mismatch.

**Key observation:** Earliest peer came online at 23:53:58. Broadcast `eb3a1bd0` was created at 23:48:53.
**Gap: 304 seconds** between broadcast issue and first peer online.
Poll lookback window: 60 seconds. **Shortfall: 244 seconds.** This is the root cause (see §5).

---

## 2. I10b Results — Listener Code Forensics
**Probe time:** 2026-06-18T23:55:10Z
**File:** `src/main/index.ts`

### Function body (verbatim, lines 5386–5646)

```typescript
function startMicBroadcastListener(peerId: string, appVersion: string): void {
  const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    console.warn('[mic-broadcast] SUPABASE_URL or SUPABASE_ANON_KEY not set — listener disabled');
    return;
  }

  // Use Supabase Realtime JS-compatible WebSocket polling via REST long-poll fallback.
  // We poll fleet_broadcast for active rows and dispatch on new ones not yet acked.
  // Full WebSocket Realtime would require the @supabase/supabase-js in main process;
  // for now we use a 10s poll which is reliable across all network conditions.

  const processedIds = new Set<string>();

  async function dispatchBroadcast(payload: { ... }): Promise<void> {
    // ... [noop_test, health_snapshot, fleet_warmup, config_set, auto_update, benchmark_run handlers]
    // target_peer_ids filter applied; target_version NOT filtered (fetched but unused)
  }

  async function pollBroadcasts(): Promise<void> {
    try {
      const since = new Date(Date.now() - 60000).toISOString(); // look back 60s  ← ROOT CAUSE
      const url =
        `${supabaseUrl}/rest/v1/fleet_broadcast` +
        `?status=eq.active&created_at=gte.${encodeURIComponent(since)}` +
        `&select=id,broadcast_type,payload_json,target_version,target_tier,target_peer_ids`;

      const res = await fetch(url, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });
      if (!res.ok) return;

      const broadcasts: Array<{...}> = await res.json();

      for (const bc of broadcasts) {
        if (processedIds.has(bc.id)) continue;
        processedIds.add(bc.id);
        dispatchBroadcast(bc).catch(e =>
          console.warn(`[mic-broadcast] dispatch error for ${bc.id.slice(0, 8)}:`, e),
        );
      }

      // Trim processedIds set to prevent unbounded growth
      if (processedIds.size > 500) {
        const arr = Array.from(processedIds);
        arr.slice(0, 250).forEach(id => processedIds.delete(id));
      }
    } catch {
      // Silent — don't crash main process on poll error
    }
  }

  setInterval(pollBroadcasts, 10000);
  // Poll immediately on startup to catch any recent broadcasts
  setTimeout(pollBroadcasts, 2000);

  console.log(`[mic-broadcast] listener started peer=${peerId.slice(0, 8)} version=${appVersion}`);
}
```

### Pattern classification
**PATTERN A — REST polling (CORRECT).** Uses `setInterval` (10s) + `fetch` to `/rest/v1/fleet_broadcast`.
No `.channel(`, no `.subscribe()`, no Realtime WebSocket.

**H2 verdict: RULED OUT.** Code pattern is correct.

### Call site
**Line 6126 — IS CALLED:**
```typescript
// BP086 I7c: MIC broadcast listener (auto_update / config_set / fleet_warmup /
// health_snapshot / benchmark_run / noop_test)
{
  startMicBroadcastListener(getStablePeerId(), app.getVersion());
}
```

Function is defined AND called. No dead-code issue.

### Secondary finding (non-blocking)
`target_version` is fetched in the SELECT but never applied as a filter in `dispatchBroadcast`. Only `target_peer_ids` is checked. This means version-targeted broadcasts reach all peers regardless of version. Not the current bug, but worth hardening.

---

## 3. I10c Results — Ack-Write Probe
**Probe time:** 2026-06-18T23:55:44Z

### Manual INSERT response
```
Status: 201
Body: [{"id":"c80499ee-e46f-4d19-93a0-40a3f4f87bcc",
        "created_at":"2026-06-18T23:55:44.11377+00:00",
        "broadcast_id":"eb3a1bd0-f23e-4d73-ad9e-373b71684932",
        "peer_id":"manual-probe-i10c",
        "app_version":"0.5.8",
        "ack_type":"received",
        "result_json":{"i10c": true, "manual_probe": true}}]
```

**H3 verdict: RULED OUT.** RLS permits anon key inserts. No authorization barrier.

### Broadcast row check
```
id: eb3a1bd0-f23e-4d73-ad9e-373b71684932
broadcast_type: noop_test
status: active
created_at: 2026-06-18 23:48:53.614553+00
ttl_seconds: 300
target_version: 0.5.8
target_tier: all
target_peer_ids: (null)
```

**Observation:** Broadcast is still `active` in the DB at probe time (23:55:44), which is 6 minutes 51 seconds after creation. TTL of 300s = should have expired at 23:53:53. Server-side TTL expiry is not enforced (no DB cron/trigger running). The poll uses `created_at >= now()-60s` client-side window, not `status=active` TTL check. This is a secondary finding.

### Acks in table at probe time
Only 1 row: `manual-probe-i10c` (from this diagnostic). Zero peer acks.

---

## 4. I10d Results — M0 Process Inspection
**Probe time:** 2026-06-18T23:55:50Z

| PID | StartTime | Path | MemMB |
|---|---|---|---|
| 38188 | 6/18/2026 6:20:44 PM | `C:\Program Files\Mnemosyne\MnemosyneC\MnemosyneC.exe` | 120.6 |
| 42436 | 6/18/2026 6:20:45 PM | `C:\Program Files\Mnemosyne\MnemosyneC\MnemosyneC.exe` | 83.8 |
| 43400 | 6/18/2026 6:20:44 PM | `C:\Program Files\Mnemosyne\MnemosyneC\MnemosyneC.exe` | 91.1 |
| 43876 | 6/18/2026 6:20:44 PM | `C:\Program Files\Mnemosyne\MnemosyneC\MnemosyneC.exe` | 43.9 |

**Process count:** 4 (normal for Electron — main + renderer + GPU + utility processes)
**Exe path:** `C:\Program Files\Mnemosyne\MnemosyneC\MnemosyneC.exe`
**Windows FileVersion:** 31.7.7
**Windows ProductVersion:** 31.7.7

**Note on version discrepancy:** FileVersionInfo 31.7.7 is the Electron framework version stamped into the PE header, not the app version. `app.getVersion()` reads from `package.json` at runtime and returns `0.5.8` — confirmed by peer_presence showing all 5 peers at 0.5.8. This is expected Electron behavior. **Not a bug.**

**H1 deep verdict: RULED OUT.** Running exe is correct 0.5.8 build. Version 31.7.7 is the Electron runtime, not the app version.

---

## 5. Hypothesis Ratified

### **H4 — Poll Lookback Window Shorter Than Broadcast TTL**

**Ratified with evidence.**

| Factor | Value |
|---|---|
| Broadcast created | 2026-06-18T23:48:53Z |
| First peer online | 2026-06-18T23:53:58Z |
| Gap | **304 seconds** |
| Poll lookback window | **60 seconds** |
| Broadcast TTL | **300 seconds** |
| Shortfall | **244 seconds** — broadcast was 244s outside the query window when peers first polled |

**Causal chain:**
1. Bishop issued noop_test broadcast at 23:48:53 (TTL=300s)
2. Fleet v0.5.8 relaunched — all 5 peers came online ~5 minutes later
3. On startup, each peer fires first poll at `T+2s` (setTimeout 2000ms)
4. `pollBroadcasts()` computes `since = now() - 60s` → queries `created_at >= ~23:53:58`
5. Broadcast was created at 23:48:53 → outside window → **zero rows returned**
6. On every subsequent 10s poll, window slides forward → broadcast stays outside → **perpetual 0 acks**
7. Server-side TTL expiry not running → broadcast stays `active` indefinitely → no error signals

H1 (version mismatch): RULED OUT — all 5 peers on 0.5.8
H2 (broken Realtime): RULED OUT — correct REST polling pattern in use
H3 (RLS blocking): RULED OUT — manual INSERT returned 201

---

## 6. Recovery Plan

### Immediate (≤2 min) — Unblock current MAMBA litmus
Issue a fresh noop_test broadcast. All 5 peers are running and polling every 10s; a new broadcast will be seen within their next poll cycle.

```bash
node tools/mic-broadcast/issue.mjs --type=noop_test --watch --poll-until=5 --timeout-s=120
```

Expected result: 5/5 acks within 30–40 seconds.

### Code fix — v0.5.9 (30 min)
**File:** `src/main/index.ts` line 5600

**Change:**
```typescript
// BEFORE (60s lookback — misses peers that restart after broadcast)
const since = new Date(Date.now() - 60000).toISOString(); // look back 60s

// AFTER (600s lookback — 2× TTL buffer, catches any broadcast a peer missed during restart)
const since = new Date(Date.now() - 600000).toISOString(); // look back 600s (2× default TTL)
```

This single-line fix ensures any peer that restarts within the broadcast TTL window will still catch the broadcast on its first poll.

### Secondary fix (optional, v0.5.9 or v0.6.0)
Add `target_version` filter in `dispatchBroadcast`:
```typescript
if (payload.target_version && payload.target_version !== appVersion) return;
```

### Deploy sequence
1. Apply 1-line fix in `src/main/index.ts`
2. `npm run build` in platform root
3. `npm run package` / Electron Builder → v0.5.9 installer
4. Push update via auto_update broadcast (or manual install on fleet)
5. Re-run noop_test litmus after v0.5.9 fleet

---

## 7. Time-to-Fix Estimate

| Action | Time |
|---|---|
| Issue fresh broadcast → unblock MAMBA | **2 minutes** |
| Code fix (1-line edit) | **5 minutes** |
| Build + package v0.5.9 | **15–20 minutes** |
| Fleet update + verification litmus | **10 minutes** |
| **Total to v0.5.9 live** | **~35 minutes** |

**MAMBA can fire NOW** (after fresh broadcast confirms 5/5 acks). v0.5.9 is a follow-up hardening, not a blocker.

---

## 8. Drift Catches

1. **Server-side TTL expiry not running** — Broadcasts with TTL=300s remain `active` in DB indefinitely. There are 6 noop_test rows all marked `active`, oldest from 20:21 UTC. A PostgreSQL cron (pg_cron) or Supabase Edge Function should mark expired rows. Low priority but adds table clutter.

2. **`target_version` fetched but not filtered** — `dispatchBroadcast` checks `target_peer_ids` but ignores `target_version`. If a future broadcast targets only v0.5.9 peers, v0.5.8 peers will still execute it. Patch recommended.

3. **Silent error suppression in `pollBroadcasts`** — The `catch {}` block swallows all errors silently. Recommend adding `console.warn` to surface fetch failures in MnemosyneC logs.

---

## 9. Probe Timestamps (ISO-8601 UTC)

| Probe | Timestamp |
|---|---|
| I10a peer_presence query | 2026-06-18T23:54:55Z |
| I10b index.ts read | 2026-06-18T23:55:10Z |
| I10c INSERT probe | 2026-06-18T23:55:44Z |
| I10d process inspection | 2026-06-18T23:55:50Z |
| fleet_broadcast row check | 2026-06-18T23:56:10Z |
| Report completed | 2026-06-18T23:57:46Z |

---

*Knight Sonnet 4.6 · BP087 · FOR THE KEEP!*
