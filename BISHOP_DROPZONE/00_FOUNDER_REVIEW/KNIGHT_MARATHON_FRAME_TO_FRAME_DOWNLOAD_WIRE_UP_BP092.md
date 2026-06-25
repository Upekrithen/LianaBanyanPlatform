# KNIGHT MARATHON — FRAME-TO-FRAME DOWNLOAD WIRE-UP
## BP092 · Caithedral · Dispatch Staged for Founder Ratify · DO NOT FIRE UNTIL RATIFIED

**Composed by:** Bishop SEG · Sonnet 4.6 · [MAIN]
**Session:** BP092 · Date: 2026-06-22
**Tagging protocol:** [MAIN] = coordinator blocks · [SEG] = substantive work blocks (per A15 BLOOD)
**Dispatch class:** COMPOSE ONLY — not fired

---

## MANDATORY PREAMBLE

### BP085 §14 — GADGET-FIRST DISCOVERY RECEIPT (per §17 protocol)

All file state below is empirically read from disk via Read tool — no Glob/grep for discovery.
Files confirmed present before dispatch composition:

| File | Path | Lines | Status |
|------|------|-------|--------|
| peer_artifact_server.ts | `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\keys_engines\peer_artifact_server.ts` | 79 | EXISTS — no auth gate |
| peer_artifact_client.ts | `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\keys_engines\peer_artifact_client.ts` | 92 | EXISTS — findPeerWithArtifact + downloadFromPeer wired |
| auto_updater.ts | `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\auto_updater.ts` | 345 | EXISTS — _runTrustGate wired, NO peer-first download path |
| circle_membership.ts | `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\keys_engines\circle_membership.ts` | 79 | EXISTS — queries mic_stamped + circle_of_influence + reputation |
| MyIPLedger.tsx | `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\components\MyIPLedger.tsx` | 212 | EXISTS — component built, NOT routed to any tab |
| I12 migration | `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\migrations\20260620230200_I12_stamp_certified_ip_ledger.sql` | 67 | EXISTS — ip_ledger §16 schema + ip_ledger_merkle_diff |
| index.ts | `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\index.ts` | 6500+ | startPeerServer() at line 6538 — startPeerArtifactServer() NOT called |
| SettingsTab.tsx | `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\components\SettingsTab.tsx` | 1400+ | EXISTS — multiple sections, no IP Ledger section |
| MnemosyneTabView.tsx | `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\components\MnemosyneTabView.tsx` | 1300+ | SettingsTab mounted at gear icon — can receive new section |

App version: `0.6.0` (confirmed from package.json line 3).
Battery-aware powerMonitor: NOT yet used anywhere in `src/main/` — will be introduced fresh.
No existing Merkle-diff replication loop found anywhere in codebase.

### BP085 §15 BLOOD — Bishop-direct Supabase

All Supabase schema work (ip_ledger §16 confirmation, ip_ledger_merkle_diff RLS) is
handled via the existing I12 migration file. Knight does NOT touch migrations directly.
If any migration edit is needed, Bishop will apply §15-direct before Knight ships.
Knight's Supabase work is limited to: service-role REST reads in peer_artifact_server.ts
auth gate (no schema changes).

### §16 RING BEARER ARCHITECTURAL INTENT — VERBATIM QUOTE

From BP087 STAMP-CERTIFIED IP LEDGER · RING BEARER · FRONTIER MESH REPLICATING:

> "Every Frame holds a Ring Bearer keypair (Ed25519). Every locally-witnessed
> IP event is stamped with the Ring Bearer's signature and written to the local
> ip_ledger (§16 schema). The ledger Merkle-diff replicates peer-to-peer across
> the Circle of Influence mesh. When a peer Frame needs an update installer, it
> first asks Circle peers — byte-serving is gated by reciprocal trust
> (mic_stamped + circle_of_influence + reputation). The server is the fallback,
> not the primary distribution path. This makes every installed Frame a
> distribution node, eliminating server bandwidth costs at mesh scale."

### PATH-B YOKE CHECK (session-open)

- [ ] Is this a Path-B environment (LAN-as-WAN · relay.lianabanyan.com active)?
  Knight MUST confirm `relay.lianabanyan.com` is live before Block 7 smoke test.
  Canon ref: `canon_lan_as_wan_test_mode_4_machine_mesh_bp085.eblet.md`
  HARD CONSTRAINT: All 4 Founder machines route via public relay — NEVER LAN-shortcut.

### PERIODIC PROGRESS REPORT CANON

Knight must emit a console-logged progress report every 30 minutes of wall-clock work
per `canon_mic_reporting_regular_job_easier_than_work_bp092`. Format:
```
[KM-FTFD] Block N/9 — <status> — elapsed: Xm — next: <description>
```

---

## WHAT IS ALREADY WIRED (empirical receipts from prior BP092 SEG)

| Artifact | Commit | Status |
|----------|--------|--------|
| Ring Bearer Ed25519 keypair generation | a5e72d7 | LIVE |
| ip_ledger §16 schema + ip_ledger_merkle_diff | I12 migration (staged, pending Bishop apply) | STAGED |
| peer_presence: circle_of_influence / reputation / artifact_server_address columns | prior migration | LIVE |
| _runTrustGate quorum hash check | eb63ede | LIVE in auto_updater.ts |
| peer_artifact_server.ts | BP087 Wave 4 | EXISTS — not called at startup |
| peer_artifact_client.ts (findPeerWithArtifact / downloadFromPeer) | BP087 Wave 4 | EXISTS — not wired in auto_updater |

---

## THE 5 MISSING PIECES THIS MARATHON DELIVERS

1. **Piece 1** — Call `startPeerArtifactServer()` from `src/main/index.ts` at app startup
2. **Piece 2** — Reciprocal-trust auth gate in `peer_artifact_server.ts`
3. **Piece 3** — Peer-first download path in `auto_updater.ts` before server fallback
4. **Piece 4** — Merkle-diff replication loop (15-min interval, battery-aware)
5. **Piece 5** — `MyIPLedger.tsx` routed into Package Store tab (Q4 LOCKED BP092 — NOT Settings tab)

---

## BLOCK STRUCTURE

Each Block = [MAIN] coordination header + [SEG] for all substantive work.
Full absolute paths required everywhere. No relative paths.

---

## BLOCK 0 — [MAIN] PRE-BLOCK: CURRENT STATE AUDIT

**[MAIN]** Establish baseline before any edits. Knight reads four files via Read tool
(gadget-first — no Glob/grep for discovery). Confirm exact line numbers for insertion
points. Log all findings to KM progress report.

**[SEG] Tasks:**

**0-A: peer_artifact_server.ts current state**
Read: `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\keys_engines\peer_artifact_server.ts`
Confirm:
- `startPeerArtifactServer()` is exported at line 33
- Default port: 47213 (`PEER_ARTIFACT_PORT`)
- Routes: `/health` · `/hash/:version` · `/artifact/:version`
- Zero auth gate (confirmed from read — all requests served without peer identity check)
- ARTIFACT_CACHE_DIR: `~/.lb_substrate/artifact_cache`
- No import of circle_membership or Supabase client

**0-B: peer_artifact_client.ts current state**
Read: `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\keys_engines\peer_artifact_client.ts`
Confirm:
- `findPeerWithArtifact(peerAddresses: string[], version: string, timeoutMs?)` exported at line 28
- `downloadFromPeer(peerAddress: string, version: string)` exported at line 65
- Uses raw HTTP (node:http) — no TLS (acceptable for LAN-as-WAN behind relay TLS termination)
- Writes to same ARTIFACT_CACHE_DIR: `~/.lb_substrate/artifact_cache`

**0-C: auto_updater.ts integration point**
Read: `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\auto_updater.ts`
Confirm:
- `downloadNow()` at line 95 calls `_runTrustGate` then `autoUpdater.downloadUpdate()`
- `getCircleMembership` is NOT imported (peer download not wired)
- `findPeerWithArtifact` / `downloadFromPeer` NOT imported
- Peer-download insertion point: inside `downloadNow()` BEFORE `autoUpdater.downloadUpdate()` call
- Fallback path: existing `autoUpdater.downloadUpdate()` remains as-is

**0-D: I12 migration schema verification**
Read: `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\migrations\20260620230200_I12_stamp_certified_ip_ledger.sql`
Confirm:
- ip_ledger §16 columns: id, ring_bearer_id, entry_type, payload_hash, payload_json, ed25519_sig, stamp_seq, stamped_at, merkle_node, replicated_at
- ip_ledger_merkle_diff exists: source_peer_id, target_peer_id, root_hash, diff_payload, transmitted_at, acked_at
- RLS: anon SELECT + INSERT; service_role ALL
- BISHOP ACTION NOTE: if `ip_ledger` already exists with old schema in prod, Bishop must apply
  `ALTER TABLE ip_ledger RENAME TO ip_ledger_legacy;` before migration runs.
  This is a §15 Bishop-direct action — Knight does NOT touch migrations.

**Estimated wall-clock: 20 minutes**

---

## BLOCK 1 — [MAIN] WIRE startPeerArtifactServer() IN src/main/index.ts

**[MAIN]** Add `startPeerArtifactServer()` call immediately after the existing `startPeerServer()`
call at line 6538. Both servers start in parallel; both are non-fatal on failure.

**[SEG] Exact edit:**

File: `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\index.ts`

**1-A: Add import** (near line 140, after existing peer_server import):

```typescript
// BP092 Frame-to-Frame: artifact byte-serving server
import { startPeerArtifactServer } from './keys_engines/peer_artifact_server';
```

**1-B: Add startup call** (after line 6542, inside the same `app.whenReady()` block):

```typescript
  // BP092 Frame-to-Frame: start artifact HTTP server for peer installer distribution
  // Port: PEER_ARTIFACT_PORT env (default 47213). Non-fatal if port in use.
  try {
    startPeerArtifactServer();
    console.log('[BP092] Peer artifact server started on port', process.env.PEER_ARTIFACT_PORT ?? '47213');
  } catch (e) {
    console.warn('[BP092] Peer artifact server start failed (non-fatal):', e);
  }
```

**1-C: Port-conflict guard** — `peer_artifact_server.ts` already calls `server.listen()` which
will emit an `'error'` event on EADDRINUSE. Add an error handler to that server instance
so the process does not crash. Knight must add this to `peer_artifact_server.ts`:

Inside `startPeerArtifactServer()`, after `server.listen(...)`:
```typescript
  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[PeerArtifactServer] Port ${PEER_ARTIFACT_PORT} in use — artifact serving disabled for this session`);
    } else {
      console.error('[PeerArtifactServer] Server error:', err);
    }
  });
```

**1-D: Permission gating** — Knight must verify: does the app's Electron `net` or `http`
module require any `allowedOrigins` config for a local HTTP server? For Node's
`node:http` (not `net.request`), no Electron content-security-policy restriction applies
to the main process. Confirm by reading any existing Content-Security-Policy in
`C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\index.ts` near the
`session.defaultSession.webRequest.onHeadersReceived` handler. If CSP blocks main-process
outbound HTTP on non-standard ports, add an exception. Most likely: no action needed.

**Verification:** After edit, `console.log('[BP092] Peer artifact server started...')` must
appear in dev console on next `npm run dev` launch (or packaged run).

**Estimated wall-clock: 25 minutes**

---

## BLOCK 2 — [MAIN] RECIPROCAL-TRUST AUTH GATE IN peer_artifact_server.ts

**[MAIN]** This is the security-critical block. Canon ref:
`canon_mic_stamped_user_approval_circle_of_influence_reciprocal_trust_bp086.eblet.md`
Current state: open relay — any HTTP caller on port 47213 receives bytes.
Required: Before streaming any bytes, verify requesting peer has:
  - `mic_stamped = true`
  - `circle_of_influence = true`
  - `reputation >= 0.8` (matching _runTrustGate threshold)
in the `peer_presence` table (Supabase service-role REST, NOT anon — auth gate is
security-critical and must not be bypassable via anon key).

**[SEG] Exact edit to peer_artifact_server.ts:**

File: `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\keys_engines\peer_artifact_server.ts`

**2-A: Add auth-gate imports** at top of file:

```typescript
// BP092: reciprocal-trust auth gate
const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const REPUTATION_GATE = parseFloat(process.env.PEER_ARTIFACT_REPUTATION_GATE ?? '0.8');
```

**2-B: Add `verifyPeerTrust()` function** (insert before `startPeerArtifactServer()`):

```typescript
/**
 * BP092 auth gate — verify requesting peer is reciprocally trusted.
 * Uses service-role key (not anon) — security-critical gate.
 * Checks peer_presence: mic_stamped=true + circle_of_influence=true + reputation>=REPUTATION_GATE.
 * Returns true if trusted, false if not found or untrusted.
 */
async function verifyPeerTrust(peerId: string): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('[PeerArtifactServer] Auth gate: Supabase not configured — DENYING request (fail-closed)');
    return false;
  }
  try {
    const url =
      `${SUPABASE_URL}/rest/v1/peer_presence` +
      `?peer_id=eq.${encodeURIComponent(peerId)}` +
      `&mic_stamped=eq.true` +
      `&circle_of_influence=eq.true` +
      `&reputation=gte.${REPUTATION_GATE}` +
      `&select=peer_id&limit=1`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
    if (!res.ok) {
      console.warn(`[PeerArtifactServer] Auth gate Supabase error: ${res.status} — DENYING`);
      return false;
    }
    const rows = await res.json() as Array<{ peer_id: string }>;
    return rows.length > 0;
  } catch (err) {
    console.error('[PeerArtifactServer] Auth gate error — DENYING:', err);
    return false; // fail-closed
  }
}
```

**2-C: Wire auth gate into request handler**

The requesting peer must send its `LB-Frame-ID` header. Knight adds header extraction
and gate call to BOTH the `/hash/:version` and `/artifact/:version` routes.
The `/health` route remains open (no auth required — used by findPeerWithArtifact).

Replace the handler body (inside `createServer(...)`) with:

```typescript
  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url ?? '/';

    // /health — open, no auth (used for peer discovery ping)
    if (url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, peerId: FRAME_ID }));
      return;
    }

    // /hash/:version and /artifact/:version — auth gated
    const requestingPeerId = req.headers['lb-frame-id'] as string | undefined;
    if (!requestingPeerId) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'LB-Frame-ID header required' }));
      return;
    }
    const trusted = await verifyPeerTrust(requestingPeerId);
    if (!trusted) {
      console.warn(`[PeerArtifactServer] Untrusted peer denied: ${requestingPeerId}`);
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'peer not in Circle of Influence or insufficient trust' }));
      return;
    }

    const hashMatch = url.match(/^\/hash\/(.+)$/);
    if (hashMatch) {
      // ... existing hash handler unchanged ...
    }
    const artifactMatch = url.match(/^\/artifact\/(.+)$/);
    if (artifactMatch) {
      // ... existing artifact handler unchanged ...
    }
    res.writeHead(404);
    res.end('Not found');
  });
```

**2-D: Update peer_artifact_client.ts** to send `LB-Frame-ID` header in requests.

File: `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\keys_engines\peer_artifact_client.ts`

In both `findPeerWithArtifact()` and `downloadFromPeer()`, add header to `httpRequest` options:

```typescript
headers: { 'lb-frame-id': process.env.LB_FRAME_ID ?? 'unknown' },
```

For `findPeerWithArtifact` (line 37 `httpRequest` options object):
```typescript
{ host, port, path: `/hash/${encodeURIComponent(version)}`, method: 'GET',
  timeout: timeoutMs, headers: { 'lb-frame-id': process.env.LB_FRAME_ID ?? 'unknown' } }
```

For `downloadFromPeer` (line 75 `httpRequest` options object):
```typescript
{ host, port, path: `/artifact/${encodeURIComponent(version)}`, method: 'GET',
  headers: { 'lb-frame-id': process.env.LB_FRAME_ID ?? 'unknown' } }
```

**Security note:** `SUPABASE_SERVICE_ROLE_KEY` must be in the Electron main process env —
it is never exposed to renderer. Confirm it is loaded via `env_loader.ts` at startup.
Knight reads `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\env_loader.ts`
to verify.

**Estimated wall-clock: 45 minutes**

---

## BLOCK 3 — [MAIN] auto_updater.ts: PEER-FIRST DOWNLOAD, SERVER FALLBACK

**[MAIN]** Wire `findPeerWithArtifact()` + `downloadFromPeer()` into `downloadNow()`
BEFORE the existing `autoUpdater.downloadUpdate()` server path.
If a Circle peer has the artifact: download from peer, skip server.
If no peer has it: fall through to existing `autoUpdater.downloadUpdate()`.
Hash verification must use the quorum hash already established by `_runTrustGate`.

**[SEG] Exact edit to auto_updater.ts:**

File: `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\auto_updater.ts`

**3-A: Add imports** (near top, after existing imports):

```typescript
import { getCircleMembership } from './keys_engines/circle_membership';
import { findPeerWithArtifact, downloadFromPeer } from './keys_engines/peer_artifact_client';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
```

**3-B: Replace `downloadNow()` method** (lines 95–105):

```typescript
  async downloadNow(): Promise<void> {
    if (this.state.status !== 'available') return;
    const version = this.state.version ?? '';

    const trusted = await this._runTrustGate(version, '');
    if (!trusted) return;

    // BP092: try peer download first, server fallback second
    try {
      const circle = await getCircleMembership();
      const peerAddresses = circle.peers
        .filter((p) => p.micStamped && p.reputation >= 0.8)
        .map((p) => p.address)
        .filter(Boolean);

      if (peerAddresses.length > 0) {
        console.log(`[AutoUpdater] BP092 — trying peer download from ${peerAddresses.length} Circle peer(s)`);
        const peerAddr = await findPeerWithArtifact(peerAddresses, version);
        if (peerAddr) {
          console.log(`[AutoUpdater] BP092 — downloading v${version} from peer ${peerAddr}`);
          this._setState({ status: 'downloading', downloadProgress: 0 });
          try {
            const localPath = await downloadFromPeer(peerAddr, version);
            // Verify hash matches quorum hash
            const verified = await this._verifyPeerDownloadHash(version, localPath);
            if (verified) {
              console.log(`[AutoUpdater] BP092 — peer download complete + hash verified: ${localPath}`);
              this._setState({ status: 'downloaded', version, downloadProgress: 100 });
              this._showSystemNotification(
                'MnemosyneC ready to update',
                `v${version} downloaded from peer Frame — restart to apply`,
              );
              return; // skip server download
            } else {
              console.warn('[AutoUpdater] BP092 — peer download hash mismatch; falling back to server');
            }
          } catch (peerErr) {
            console.warn('[AutoUpdater] BP092 — peer download failed; falling back to server:', peerErr);
          }
        }
      }
    } catch (circleErr) {
      console.warn('[AutoUpdater] BP092 — Circle lookup failed; falling back to server:', circleErr);
    }

    // Server fallback (existing path)
    autoUpdater.downloadUpdate().catch((err: Error) => {
      this._setState({ status: 'error', errorMessage: err.message });
    });
  }
```

Note: `downloadNow()` was `void` returning — promote to `async Promise<void>`.
Update the `ipcMain.on('download-update', ...)` handler to `.catch()` properly:
```typescript
ipcMain.on('download-update', () => {
  this.downloadNow().catch(() => {});
});
```

**3-C: Add `_verifyPeerDownloadHash()` private method:**

```typescript
  private async _verifyPeerDownloadHash(version: string, localPath: string): Promise<boolean> {
    try {
      if (!existsSync(localPath)) return false;
      const bytes = readFileSync(localPath);
      const computedHash = createHash('sha512').update(bytes).digest('hex');

      // Fetch quorum hash from frontier_reputation_log (same source as _runTrustGate)
      const ledgerUrl =
        `${process.env.SUPABASE_URL}/rest/v1/frontier_reputation_log` +
        `?update_version=eq.${encodeURIComponent(version)}` +
        `&select=claimed_hash&order=timestamp.desc&limit=1`;
      const ledgerRes = await fetch(ledgerUrl, {
        headers: { apikey: process.env.SUPABASE_ANON_KEY ?? '' },
      });
      const rows = await ledgerRes.json() as Array<{ claimed_hash: string }>;
      const quorumHash = rows[0]?.claimed_hash ?? '';
      if (!quorumHash) {
        console.warn('[AutoUpdater] _verifyPeerDownloadHash: no quorum hash in ledger — accepting (AMBER)');
        return true;
      }
      const match = computedHash === quorumHash;
      if (!match) {
        console.error(`[AutoUpdater] Hash mismatch! computed=${computedHash.slice(0,16)}... quorum=${quorumHash.slice(0,16)}...`);
      }
      return match;
    } catch (err) {
      console.error('[AutoUpdater] _verifyPeerDownloadHash error:', err);
      return false;
    }
  }
```

**Estimated wall-clock: 50 minutes**

---

## BLOCK 4 — [MAIN] MERKLE-DIFF REPLICATION LOOP

**[MAIN]** Create `src/main/keys_engines/merkle_replicator.ts` and wire into index.ts.
Loop: every 15 minutes, fetch local ip_ledger entries without `replicated_at`, diff against
each Circle peer's ledger (via Supabase), write diff to `ip_ledger_merkle_diff`, mark
local entries as replicated. Battery-aware: pause when on battery power.

**[SEG]**

**4-A: Create new file:**
`C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\keys_engines\merkle_replicator.ts`

```typescript
/**
 * merkle_replicator.ts -- Merkle-diff IP ledger replication
 * BP092 · Piece 4 · Frame-to-Frame Wildfire Distribution
 *
 * Every REPLICATION_INTERVAL_MS (default 15 min):
 *   1. Fetch local ip_ledger rows WHERE replicated_at IS NULL
 *   2. For each Circle peer: compare root hash
 *   3. If mismatch: POST diff to ip_ledger_merkle_diff
 *   4. Mark local rows as replicated (SET replicated_at = NOW())
 *
 * Battery-aware: pauses replication when Electron powerMonitor reports on battery.
 * Configurable via env: MERKLE_REPLICATION_INTERVAL_MS, MERKLE_PAUSE_ON_BATTERY.
 */

import { powerMonitor } from 'electron';
import { createHash } from 'node:crypto';
import { getCircleMembership } from './circle_membership';

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const REPLICATION_INTERVAL_MS = parseInt(
  process.env.MERKLE_REPLICATION_INTERVAL_MS ?? String(15 * 60 * 1000),
  10,
);
const PAUSE_ON_BATTERY = (process.env.MERKLE_PAUSE_ON_BATTERY ?? 'true') === 'true';

let replicationTimer: ReturnType<typeof setInterval> | null = null;

// ─── Internal helpers ─────────────────────────────────────────────────────────

function isOnBattery(): boolean {
  try {
    // powerMonitor.isOnBatteryPower() available since Electron 7
    return (powerMonitor as unknown as { isOnBatteryPower?: () => boolean }).isOnBatteryPower?.() ?? false;
  } catch {
    return false;
  }
}

async function fetchUnreplicatedEntries(): Promise<Array<{ id: string; payload_hash: string; payload_json: unknown; stamp_seq: number; ring_bearer_id: string }>> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return [];
  try {
    const url = `${SUPABASE_URL}/rest/v1/ip_ledger?replicated_at=is.null&select=id,ring_bearer_id,stamp_seq,payload_hash,payload_json&order=stamp_seq.asc&limit=500`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
    if (!res.ok) return [];
    return await res.json() as Array<{ id: string; payload_hash: string; payload_json: unknown; stamp_seq: number; ring_bearer_id: string }>;
  } catch {
    return [];
  }
}

function computeRootHash(entries: Array<{ payload_hash: string }>): string {
  const combined = entries.map((e) => e.payload_hash).join('|');
  return createHash('sha256').update(combined).digest('hex');
}

async function fetchPeerRootHash(peerId: string): Promise<string | null> {
  // Query peer's ip_ledger root hash via Supabase (same DB — mesh peers share Supabase instance in v0.6.x)
  // In a fully P2P future this would be a direct HTTP call to the peer's API port.
  // For now: read peer's entries from shared Supabase, compute root hash.
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  try {
    const url = `${SUPABASE_URL}/rest/v1/ip_ledger?ring_bearer_id=eq.${encodeURIComponent(peerId)}&select=payload_hash&order=stamp_seq.asc&limit=500`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
    if (!res.ok) return null;
    const rows = await res.json() as Array<{ payload_hash: string }>;
    return rows.length > 0 ? computeRootHash(rows) : null;
  } catch {
    return null;
  }
}

async function postMerkleDiff(sourcePeerId: string, targetPeerId: string, rootHash: string, diffPayload: unknown): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/ip_ledger_merkle_diff`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ source_peer_id: sourcePeerId, target_peer_id: targetPeerId, root_hash: rootHash, diff_payload: diffPayload }),
    });
  } catch (err) {
    console.error('[MerkleReplicator] postMerkleDiff error:', err);
  }
}

async function markAsReplicated(ids: string[]): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || ids.length === 0) return;
  try {
    // Supabase REST bulk update via IN filter
    const idList = ids.map((id) => `"${id}"`).join(',');
    await fetch(
      `${SUPABASE_URL}/rest/v1/ip_ledger?id=in.(${idList})`,
      {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ replicated_at: new Date().toISOString() }),
      },
    );
  } catch (err) {
    console.error('[MerkleReplicator] markAsReplicated error:', err);
  }
}

// ─── Main replication tick ────────────────────────────────────────────────────

async function replicationTick(localPeerId: string): Promise<void> {
  if (PAUSE_ON_BATTERY && isOnBattery()) {
    console.log('[MerkleReplicator] On battery — skipping replication tick');
    return;
  }

  const entries = await fetchUnreplicatedEntries();
  if (entries.length === 0) {
    console.log('[MerkleReplicator] No unreplicated entries — tick done');
    return;
  }

  const localRootHash = computeRootHash(entries);
  const circle = await getCircleMembership();

  let anyDiffPosted = false;
  const idsToMark: string[] = [];

  for (const peer of circle.peers) {
    if (!peer.micStamped || peer.reputation < 0.8) continue;
    const peerRootHash = await fetchPeerRootHash(peer.peerId);
    if (peerRootHash === localRootHash) {
      console.log(`[MerkleReplicator] Peer ${peer.peerId.slice(0,8)}... root hash matches — no diff needed`);
      continue;
    }
    // Root hash differs: post diff
    await postMerkleDiff(localPeerId, peer.peerId, localRootHash, { entries });
    anyDiffPosted = true;
    console.log(`[MerkleReplicator] Diff posted to peer ${peer.peerId.slice(0,8)}... (${entries.length} entries)`);
  }

  if (anyDiffPosted || entries.length > 0) {
    // Mark all entries as replicated after attempting to push to all Circle peers
    for (const e of entries) idsToMark.push(e.id);
    await markAsReplicated(idsToMark);
    console.log(`[MerkleReplicator] Marked ${idsToMark.length} entries replicated`);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Start the Merkle-diff replication loop.
 * Call from index.ts after app startup, passing the stable local peer ID.
 */
export function startMerkleReplicator(localPeerId: string): void {
  if (replicationTimer) {
    console.warn('[MerkleReplicator] Already running — ignoring duplicate start');
    return;
  }
  console.log(`[MerkleReplicator] Starting — interval: ${REPLICATION_INTERVAL_MS / 60000} min · battery-pause: ${PAUSE_ON_BATTERY}`);

  // Initial tick after 60s (let app settle)
  setTimeout(() => {
    replicationTick(localPeerId).catch((e) => console.error('[MerkleReplicator] tick error:', e));
  }, 60_000);

  replicationTimer = setInterval(() => {
    replicationTick(localPeerId).catch((e) => console.error('[MerkleReplicator] tick error:', e));
  }, REPLICATION_INTERVAL_MS);
}

export function stopMerkleReplicator(): void {
  if (replicationTimer) {
    clearInterval(replicationTimer);
    replicationTimer = null;
    console.log('[MerkleReplicator] Stopped');
  }
}
```

**4-B: Wire into index.ts**

Add import (near line 140):
```typescript
import { startMerkleReplicator, stopMerkleReplicator } from './keys_engines/merkle_replicator';
```

Add startup call (after `startPeerArtifactServer()` call in Block 1):
```typescript
  // BP092 Merkle-diff replication loop
  try {
    const localPeerId = getStablePeerId(); // already called earlier in init
    startMerkleReplicator(localPeerId);
    console.log('[BP092] Merkle replicator started');
  } catch (e) {
    console.warn('[BP092] Merkle replicator start failed (non-fatal):', e);
  }
```

Add to app `before-quit` or `will-quit` handler (find existing quit handler in index.ts):
```typescript
  stopMerkleReplicator();
```

**Open question for Founder (Q2):** Is 15-min default interval correct? See Open Questions.
**Open question for Founder (Q5):** Battery-aware default pause = true. See Open Questions.

**Estimated wall-clock: 60 minutes**

---

## BLOCK 5 — [MAIN] MyIPLedger.tsx UI INTEGRATION INTO PACKAGE STORE TAB

**⚠️ SCOPE CHANGE — Q4 LOCKED BP092:**
Founder ratified: Package Store tab, NOT Settings tab.
Canon ref: `canon_package_store_tab_member_helm_nonmember_personal_library_eblet_chocolates_foodstuffs_bp092`

**[MAIN]** Route `src/components/MyIPLedger.tsx` into the NEW Package Store tab in MnemosyneTabView.
MyIPLedger is NOT currently imported anywhere in the renderer.
This block now creates a new "Package Store" tab in MnemosyneTabView with:
- Authenticated (member) mode: helm navigation links + MyIPLedger section
- Unauthenticated (non-member) mode: read-only Eblet chocolate/foodstuff library view (Ghost World)

MyIPLedger renders within the Package Store tab as a named section below the helm/library content.
Settings tab is NOT touched by this Marathon.

**[SEG]**

**5-A: Gadget MnemosyneTabView current tab list**

File: `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\components\MnemosyneTabView.tsx`
Read: confirm existing tab keys, tab panel switch structure, and auth-state prop flow.
Capture: exact insertion point for new "Package Store" tab entry.

**5-B: Create PackageStoreTab.tsx**

File: `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\components\PackageStoreTab.tsx`

```tsx
/**
 * PackageStoreTab.tsx — BP092 · Package Store tab
 * Members: helm navigation + MyIPLedger section
 * Non-members: read-only Eblet chocolate/foodstuff library (Ghost World)
 * Canon: canon_package_store_tab_member_helm_nonmember_personal_library_eblet_chocolates_foodstuffs_bp092
 */
import React from 'react';
import { MyIPLedger } from '../../components/MyIPLedger';

interface PackageStoreTabProps {
  isAuthenticated: boolean;
  peerId?: string;
  memberId?: string;
}

export const PackageStoreTab: React.FC<PackageStoreTabProps> = ({
  isAuthenticated,
  peerId,
}) => {
  if (isAuthenticated) {
    return (
      <div className="package-store-tab member-mode">
        <h2>Package Store</h2>
        {/* Helm navigation links — Knight reads existing helm nav pattern and composes here */}
        <section className="helm-nav">
          {/* TODO: Knight pulls existing helm nav links from member context */}
        </section>
        <section className="ip-ledger-section">
          <h3>§16 IP Ledger</h3>
          <MyIPLedger peerId={peerId} />
        </section>
      </div>
    );
  }
  return (
    <div className="package-store-tab ghost-mode">
      <h2>Package Store</h2>
      {/* Non-member: read-only Eblet library — the stuff you'd see in your helm */}
      <p className="ghost-notice">
        This is your personal Eblet library — chocolates and foodstuffs waiting for you.
        <button className="join-cta" onClick={() => {/* trigger join modal */}}>
          Join ($5/yr) to unlock your helm →
        </button>
      </p>
      {/* TODO: Knight reads existing Eblet library data pattern and renders here (read-only) */}
      <section className="eblet-library-preview">
        {/* Ghost World read-only Eblet chocolates/foodstuffs library */}
      </section>
    </div>
  );
};
```

**5-C: Add Package Store tab to MnemosyneTabView**

In the tab list: add `{ key: 'package-store', label: 'Package Store', icon: '📦' }` (or
appropriate icon matching existing tab style — Knight reads existing tab icon pattern).

In the tab panel switch: add case for 'package-store' rendering `<PackageStoreTab isAuthenticated={isAuthenticated} peerId={peerId} />`.

Pass `isAuthenticated` and `peerId` from existing MnemosyneTabView state/props.

**5-D: Expose `getFrameId` in preload if not already present**

Read `C:\Users\Administrator\Documents\LianaBanyanPlatform\preload.js` or
`src/preload.ts` (whichever exists). If `electronAPI.getFrameId` is not already exposed, add:
```javascript
getFrameId: () => ipcRenderer.sendSync('get-frame-id'),
```
And add IPC handler in index.ts:
```typescript
ipcMain.on('get-frame-id', (event) => {
  event.returnValue = getStablePeerId();
});
```

**Note:** Settings tab is NOT touched by this Marathon. SettingsTab.tsx scope unchanged.

**Estimated wall-clock: 40 minutes**

---

## BLOCK 6 — [MAIN] EMPIRICAL SMOKE TEST

**[MAIN]** Three smoke tests. All run on LAN-as-WAN topology (relay.lianabanyan.com).
HARD CONSTRAINT per `canon_lan_as_wan_test_mode_4_machine_mesh_bp085`:
Never LAN-shortcut. All traffic via public relay.

**[SEG] Smoke test protocol:**

**6-A: Peer artifact server boot test**
1. Build dev: `npm run dev` on Machine M0
2. Confirm log: `[BP092] Peer artifact server started on port 47213`
3. From Machine M1: `curl http://<M0-relay-addr>:47213/health`
   Expected response: `{"ok":true,"peerId":"<M0-frame-id>"}`
4. Confirm server is running and /health is open

**6-B: Auth gate rejection test (non-Circle peer)**
1. On Machine M1: ensure M1's `peer_id` is NOT in `peer_presence` with circle_of_influence=true
2. From M1: attempt `curl http://<M0-relay-addr>:47213/hash/0.6.1 -H "LB-Frame-ID: <M1-frame-id>"`
   Expected: `HTTP 403` — `{"error":"peer not in Circle of Influence or insufficient trust"}`
3. Log: `[PeerArtifactServer] Untrusted peer denied: <M1-frame-id>`

**6-C: Full peer download test (Circle peer)**
1. On Machine M0: ensure v0.6.1 .exe is present in `~/.lb_substrate/artifact_cache/MnemosyneC-Setup-0.6.1.exe`
2. On Machine M1: add M1's peer_id to peer_presence with mic_stamped=true, circle_of_influence=true, reputation=0.9
3. On Machine M1: trigger "Check for Updates" → update-available v0.6.1
4. Click "Download" — watch logs
   Expected log on M1: `[AutoUpdater] BP092 — downloading v0.6.1 from peer <M0-addr>`
   Expected log on M0: `[PeerArtifactServer] Listening...` (serving bytes)
   Expected M1 result: `status: 'downloaded'` with notification "downloaded from peer Frame"
5. Confirm: M0's server access logs show the artifact was served
6. Confirm: M1's `auto_updater` log shows hash verified

**6-D: Fallback test (no peer has artifact)**
1. Remove artifact from M0's cache
2. Repeat update download on M1
3. Expected: `[AutoUpdater] BP092 — peer download failed; falling back to server`
4. Confirm electron-updater downloads from mnemosynec.ai/download/ as normal

**6-E: Merkle replication smoke**
1. Wait 60 seconds after M0 boot (initial replication delay)
2. Confirm log: `[MerkleReplicator] Starting — interval: 15 min`
3. At T+60s: confirm log: `[MerkleReplicator] No unreplicated entries` (if no new entries)
   OR: `[MerkleReplicator] Diff posted to peer...` (if new entries exist)
4. Confirm ip_ledger_merkle_diff table receives rows in Supabase

**Estimated wall-clock: 45 minutes (includes multi-machine setup time)**

---

## BLOCK 7 — [MAIN] EDGE FUNCTION DEPLOY GATE

**[MAIN]** Per standard Marathon protocol: enumerate every Supabase Edge Function touched.
This Marathon adds NO new Edge Functions. The Merkle diff and artifact auth gate use
Supabase REST directly from the main process (service-role key).

**[SEG] Gate check:**

Functions touched by this Marathon: NONE.

If Knight discovers during implementation that a new Edge Function is warranted
(e.g., for batched merkle diff processing), Knight must STOP, emit a progress report,
and await Bishop coordination before adding any Edge Function. This gate protects
against unreviewed server-side changes.

Edge functions NOT touched: confirmed by inspection of Blocks 1–5 above.
All Supabase interaction: direct REST from Electron main process, service-role key.

**Estimated wall-clock: 5 minutes (gate check only)**

---

## BLOCK 8 — [MAIN] BUILD + SHIP v0.6.1

**[MAIN]** After all 5 pieces verified in smoke tests:

**[SEG] Ship checklist:**

**8-A: Version bump — ✅ LOCKED v0.6.1 (BP092 Founder-direct)**
Founder ratified: v0.6.1

File: `C:\Users\Administrator\Documents\LianaBanyanPlatform\package.json`
Change line 3: `"version": "0.6.1"`

**8-B: Build NSIS installer**
```
npm run build:win
```
Confirms: NSIS .exe output at `C:\Users\Administrator\Documents\LianaBanyanPlatform\dist\`
Expected: `MnemosyneC-Setup-0.6.1.exe`

**8-C: SHA-512 + latest.yml**
electron-builder auto-generates `latest.yml` and `.blockmap` with SHA-512.
Knight must confirm `latest.yml` contains correct version + SHA before deploy.

**8-D: version_trust.json update**
Per `canon_hugo_tower_version_data_source_is_version_trust_json_bp090.eblet.md`:
`version_trust.json` is canonical — NOT `version.json`.
Knight updates: `C:\Users\Administrator\Documents\LianaBanyanPlatform\static\version_trust.json`
(or wherever Hugo Tower reads it — Knight confirms path via Read before editing)
```json
{
  "version": "0.6.1",
  "sha512": "<hash from latest.yml>",
  "releaseDate": "2026-06-22",
  "notes": "BP092: Frame-to-Frame download distribution — peer-first installer, auth gate, Merkle replication, IP Ledger UI"
}
```

**8-E: Firebase deploy (hosting:mnemosyne)**
Per canon: KNIGHT executes deploy. Bishop does NOT deploy to Firebase.
```
firebase deploy --only hosting:mnemosyne
```
Confirm: Tower download button at mnemosynec.org reads updated version_trust.json.

**8-F: Artifact cache seed**
Copy `MnemosyneC-Setup-0.6.1.exe` to `~/.lb_substrate/artifact_cache/` on M0 (primary Founder machine)
so M0 can immediately serve bytes to Circle peers on next check.

**Estimated wall-clock: 60 minutes**

---

## OPEN QUESTIONS — FOUNDER RATIFY BEFORE FIRE

**Q1 — Version bump:**
Current: v0.6.0
Option A: v0.6.1 (patch — 5 wiring changes, no new user features per semver)
Option B: v0.7.0 (minor — new distribution architecture is a meaningful capability uplift)
Bishop recommendation: v0.6.1. The changes are internal plumbing; user-visible change
is only the IP Ledger tab addition. However if Founder considers peer distribution
a "minor feature", v0.7.0 is also defensible.
**Founder: please ratify v0.6.1 or v0.7.0.**

**Q2 — Merkle-diff interval default: ✅ LOCKED — 15 minutes (BP092 Founder-direct)**
Founder ratified: 15 minutes. MERKLE_REPLICATION_INTERVAL_MS = 900000.
Knight uses this value. No env-var override needed at launch (configurable post-ship).
Canon ref: `canon_empress_campaign_event_driven_rolling_3_week_cohorts_bp092_proposed`

**Q3 — Reputation threshold for byte-serving: ✅ LOCKED — 0.8 (BP092 Founder-direct)**
Founder ratified: 0.8. Same threshold as _runTrustGate.
`PEER_ARTIFACT_REPUTATION_GATE = 0.8` confirmed. Knight uses this in Block 2 verifyPeerTrust().

**Q4 — MyIPLedger UI placement: ✅ LOCKED — Package Store tab (BP092 Founder-direct)**
Founder ratified: "Package Store tab. Members → can go to your helm from there.
Non-members → shows your personal library of Eblet chocolates and foodstuffs."
MyIPLedger lives as a SECTION within the Package Store tab — NOT in Settings tab.
Knight Block 5 scope change: add Package Store tab to MnemosyneTabView, render MyIPLedger
within it as a sub-section. Mode-aware: member = helm nav + ledger; non-member = read-only
eblet library view.
Canon ref: `canon_package_store_tab_member_helm_nonmember_personal_library_eblet_chocolates_foodstuffs_bp092`

**Q5 — Battery-aware replication: ⚠️ FOUNDER EXPLANATION REQUESTED (re-asked below)**

BATTERY-AWARE EXPLANATION FOR FOUNDER:
"Battery-aware" means: when the laptop is running on battery power (not plugged in),
the 15-minute Merkle replication loop PAUSES. When AC power is detected (plugged back in),
the loop RESUMES automatically.

Tradeoff:
- Pause-on-battery (MERKLE_PAUSE_ON_BATTERY = true): Slower mesh sync when unplugged.
  Your local ip_ledger entries queue until you plug in. Battery life protected.
- Always-on (MERKLE_PAUSE_ON_BATTERY = false): Mesh stays in sync even on battery.
  Small but real battery drain every 15 minutes for network + CPU work.

Default proposal: PAUSE on battery (true) — polite to user hardware. Replication is
periodic and non-urgent; a short delay (max 15 min after plugging in) is acceptable.

**Founder: is pause-on-battery=true acceptable? Or always-on?**

---

## WALL-CLOCK ESTIMATE (Block-by-Block)

| Block | Description | Estimate |
|-------|-------------|----------|
| Block 0 | Pre-block: gadget audit | 20 min |
| Block 1 | startPeerArtifactServer() wiring | 25 min |
| Block 2 | Reciprocal-trust auth gate | 45 min |
| Block 3 | Peer-first download in auto_updater | 50 min |
| Block 4 | Merkle-diff replication loop | 60 min |
| Block 5 | MyIPLedger UI integration | 40 min |
| Block 6 | Smoke tests (multi-machine) | 45 min |
| Block 7 | Edge function deploy gate | 5 min |
| Block 8 | Build + ship v0.6.1 | 60 min |
| **Total** | | **~6 hours wall-clock** |

Note: Smoke tests (Block 6) assume multi-machine setup is pre-configured and
relay.lianabanyan.com is live. If relay is down, add 30 min for triage.

---

## SEQUENCING RECOMMENDATION vs M23 UI DISPATCH

Per `canon_knight_parallel_sessions_permitted_under_scope_branch_isolation_brick_wall_override_bp089`:
Parallel Knights are PERMITTED under Brick Wall override with 4 mitigations:
1. Scope isolation — this Marathon touches `src/main/` + `src/components/MyIPLedger.tsx` + `src/renderer/components/SettingsTab.tsx`
   M23 UI dispatch touches: `src/renderer/` components (different subtree except SettingsTab)
2. Branch isolation — this Marathon: `git checkout -b bp092/frame-to-frame-download`
   M23 UI: `git checkout -b bp092/m23-ui`
3. Serialized build — BOTH dispatches merge to `main` BEFORE `npm run build:win`
4. Bishop coord — Bishop monitors both; merges are sequential (this Marathon first, then M23)

**Conflict risk:** If M23 touches `SettingsTab.tsx` for unrelated UI work, there will be
a merge conflict at Block 5 (IP Ledger section insertion). Mitigate: Bishop checks M23
scope before firing parallel. If M23 does NOT touch SettingsTab, parallel is clean.

**Recommendation:** Fire this Marathon FIRST (it is unblocked). Fire M23 in parallel IF
M23 does not touch SettingsTab.tsx. If M23 does touch SettingsTab, sequence: this Marathon
merges first, M23 rebases.

**Fire order:** This dispatch is UNBLOCKED. Fire immediately upon Founder ratify of 5 open questions.

---

*Bishop SEG · Sonnet 4.6 · BP092 · Caithedral · Staged at BISHOP_DROPZONE · DO NOT FIRE UNTIL RATIFIED*
