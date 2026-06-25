# BLACK MAMBA · YOKE · BP087 WAVE 4
# KEYS AND ENGINES · FRAME-TO-FRAME WILDFIRE PROPAGATION
# 2-of-3 IP Ledger Hash Quorum · Peer Artifact Server · Circle of Influence Query

---

## §0 BRICK WALL PRE-AUTHORIZED SCOPE

Brick Wall pre-authorized scope verbatim:

GADGET-FIRST PREAMBLE (canon_bp063 + STATUTES §17):
- Discovery / lookup of substrate state: pheromone_query · search_knowledge · consult_scribes · pearl_decode · brief_me
- FORBIDDEN for discovery: bash grep · find · Glob · PowerShell · Select-String
- Shell ALLOWED ONLY for: psql per §15 · curl per §14 REST · git mechanical · build/copy/deploy

Authorized scope:
- (KE-alpha) New files: src/main/keys_engines/key_signer.ts + key_verifier.ts + Supabase edge function keys-engines-sign-update/index.ts. Soccerball-hash + Ed25519 Thorax signature on update payload (latest.yml).
- (KE-beta) New files: src/main/keys_engines/quorum_check.ts + circle_query.ts. 2-of-3 hash quorum check before any install proceeds.
- (KE-gamma) New migration: platform/supabase/migrations/<ts>_frontier_reputation_log.sql. Knight ships .sql only. Bishop applies via psql per §15.
- (KE-delta) Edit: src/main/auto_updater.ts. Extend with quorum_check gate before install. Emit hash-mismatch event to frontier_reputation_log REST on failure. Show user "Update blocked · trust verification failed · check Reputation Log".
- (KE-epsilon) New files: src/main/keys_engines/peer_artifact_server.ts + peer_artifact_client.ts. Peer-to-peer LAN/WAN direct download, server-bypass when bytes available locally.
- (KE-zeta) New file: src/main/keys_engines/circle_membership.ts. Reads Circle of Influence from BP086 MIC-stamped peer table, filters by reputation threshold, feeds quorum_check.

NO scope beyond this list without Founder verbal ratify.
Knight does NOT apply Supabase migrations. Knight does NOT execute psql. Knight ships .sql to BISHOP_DROPZONE.

---

## §1 CONTEXT

Wave 3 shipped v0.5.13 on 2026-06-20 (Knight pearl aa7103ce). The auto-update pipeline now propagates via mnemosynec.ai/download/ using electron-updater with sha512 verification on the installer. The outstanding gap from the v0.5.13 release comments is visible in src/main/auto_updater.ts line 131-137: "Signed update manifest (latest.yml signed with private key) [PENDING]" and "Windows code-signed installer [PENDING]." Wave 4 closes both gaps architecturally, without requiring an EV certificate, by introducing the Keys and Engines layer: a soccerball-hash + Ed25519 Thorax signature on the update payload constitutes the Key; a 2-of-3 quorum of peer Frames confirming that hash constitutes the Engine. Together they implement the Frame-to-Frame Wildfire Propagation pattern ratified this session.

Wave 4 adds seven new TypeScript modules and one SQL migration. The Wildfire pattern reduces server bandwidth from N downloads per release to 1 download (Frame A from server) plus N-1 peer transfers (Frames B/C/D from Frame A). The Circle of Influence membership query ensures quorum participants are canonically trusted peers, not anonymous requestors. The frontier_reputation_log table records all hash-mismatch events publicly, creating an auditable trust surface. The IP Ledger propagation flow (§16 BP087) is updated inline via the refuse-install path: every blocked update emits a ledger-class event to frontier_reputation_log, satisfying the public accountability requirement without a separate ledger write path.

---

## §2 SEG FAN-OUT

use segs Sonnet 4.6 verbatim

All 6 SEGs may run in parallel. SEG-KE-delta depends on SEG-KE-beta (quorum_check.ts) existing first; start SEG-KE-delta after SEG-KE-beta writes its file.

---

**SEG-KE-alpha · Key: soccerball-hash + Thorax signature on update payload**

New files:

(1) C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\keys_engines\key_signer.ts

Purpose: Compute soccerball-hash of latest.yml bytes + sign with Ed25519 Thorax private key. Returns a SignedKey struct for embedding in latest.yml.sig.

```typescript
/**
 * key_signer.ts -- Keys and Engines: soccerball-hash + Thorax Ed25519 signature
 * BP087 Wave 4 · Keys and Engines canon
 *
 * Produces a SignedKey: { socceriHash, signature, publicKeyHex, version, timestamp }
 * Written by the build pipeline (Cephas edge function) at deploy time.
 * Consumed by key_verifier.ts at install time on each Frame.
 */

import { createHash, sign, createPrivateKey } from 'node:crypto';

export interface SignedKey {
  socceriHash: string;      // SHA-512 of payload bytes, hex-encoded (soccerball coordinate)
  signature: string;        // Ed25519 signature over socceriHash, 128 hex chars
  publicKeyHex: string;     // SPKI DER hex of Thorax public key (for offline verify)
  version: string;          // update version string matching latest.yml
  timestamp: string;        // ISO-8601 UTC
}

/**
 * Compute socceri-hash: SHA-512 of payload bytes, returned as lowercase hex.
 * Named "socceri" per Socceri naming convention (BP085 Soccerball DAG coordinate scheme).
 */
export function socceriHash(payloadBytes: Buffer): string {
  return createHash('sha512').update(payloadBytes).digest('hex');
}

/**
 * Sign a socceriHash string with the Thorax Ed25519 private key.
 * private_key_hex: DER-encoded private key as lowercase hex (PKCS8 format),
 * produced by ed25519_keypair.ts getOrCreateKeypair().
 */
export function signSocceriHash(hash: string, private_key_hex: string): string {
  const privKey = createPrivateKey({
    key: Buffer.from(private_key_hex, 'hex'),
    format: 'der',
    type: 'pkcs8',
  });
  const sigBuffer = sign(null, Buffer.from(hash, 'utf8'), privKey);
  return sigBuffer.toString('hex'); // 128 hex chars (64 bytes)
}

/**
 * Build a complete SignedKey from payload bytes + Thorax private key.
 * Called by the Cephas edge function at deploy time.
 */
export function buildSignedKey(
  payloadBytes: Buffer,
  private_key_hex: string,
  public_key_hex: string,
  version: string,
): SignedKey {
  const hash = socceriHash(payloadBytes);
  const signature = signSocceriHash(hash, private_key_hex);
  return {
    socceriHash: hash,
    signature,
    publicKeyHex: public_key_hex,
    version,
    timestamp: new Date().toISOString(),
  };
}
```

(2) C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\keys_engines\key_verifier.ts

Purpose: Verify a SignedKey against payload bytes + public key. Returns VerifyResult.

```typescript
/**
 * key_verifier.ts -- Keys and Engines: verify soccerball-hash + Thorax Ed25519 signature
 * BP087 Wave 4 · Keys and Engines canon
 */

import { createHash, verify as cryptoVerify, createPublicKey } from 'node:crypto';
import type { SignedKey } from './key_signer';

export interface VerifyResult {
  ok: boolean;
  socceriHash: string;
  signatureValid: boolean;
  hashMatchesPayload: boolean;
  error?: string;
}

export function verifySocceriKey(
  payloadBytes: Buffer,
  signedKey: SignedKey,
): VerifyResult {
  try {
    // Step 1: recompute hash from payload bytes
    const computedHash = createHash('sha512').update(payloadBytes).digest('hex');
    const hashMatchesPayload = computedHash === signedKey.socceriHash;

    // Step 2: verify Ed25519 signature over the claimed hash
    const pubKey = createPublicKey({
      key: Buffer.from(signedKey.publicKeyHex, 'hex'),
      format: 'der',
      type: 'spki',
    });
    const signatureValid = cryptoVerify(
      null,
      Buffer.from(signedKey.socceriHash, 'utf8'),
      pubKey,
      Buffer.from(signedKey.signature, 'hex'),
    );

    return {
      ok: hashMatchesPayload && signatureValid,
      socceriHash: computedHash,
      signatureValid,
      hashMatchesPayload,
    };
  } catch (err) {
    return {
      ok: false,
      socceriHash: '',
      signatureValid: false,
      hashMatchesPayload: false,
      error: String(err),
    };
  }
}
```

(3) C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\functions\keys-engines-sign-update\index.ts

Purpose: Supabase edge function called by Cephas deploy pipeline. Reads latest.yml bytes from request body, signs with build-time Thorax private key (from env), returns SignedKey JSON for writing to latest.yml.sig.

```typescript
// keys-engines-sign-update/index.ts
// BP087 Wave 4 · Keys and Engines · Cephas deploy-time signer
// Called by deploy pipeline after latest.yml is staged.
// Returns: SignedKey JSON → caller writes to Cephas-hugo/static/download/latest.yml.sig

import { buildSignedKey } from '../../src/main/keys_engines/key_signer.ts';

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const authHeader = req.headers.get('Authorization');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!authHeader || authHeader !== `Bearer ${serviceKey}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await req.json();
  const { payloadBase64, version } = body as { payloadBase64: string; version: string };

  const privateKeyHex = Deno.env.get('THORAX_PRIVATE_KEY_HEX') ?? '';
  const publicKeyHex = Deno.env.get('THORAX_PUBLIC_KEY_HEX') ?? '';

  if (!privateKeyHex || !publicKeyHex) {
    return new Response(
      JSON.stringify({ error: 'THORAX key env vars not set' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const payloadBytes = Buffer.from(payloadBase64, 'base64');
  const signedKey = buildSignedKey(payloadBytes, privateKeyHex, publicKeyHex, version);

  return new Response(JSON.stringify(signedKey), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
```

Acceptance: latest.yml has a sibling latest.yml.sig containing soccerball-hash + Ed25519 signature. key_verifier.ts verifySocceriKey() returns ok: true against a test payload. Run `npx tsc --noEmit` from LianaBanyanPlatform root after writing all 3 files. Gate: zero errors.

Return: 3 file paths + tsc exit code + one sample VerifyResult JSON from a smoke call.

---

**SEG-KE-beta · 2-of-3 Quorum Check (the Engine's Locks)**

New files:

(1) C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\keys_engines\circle_query.ts

Purpose: Query 2 paired Frames in Circle of Influence for their confirmed update hash. Returns array of PeerHashResponse.

```typescript
/**
 * circle_query.ts -- Keys and Engines: query paired Frames for their hash confirmation
 * BP087 Wave 4 · 2-of-3 quorum
 *
 * Each paired Frame runs a peer_artifact_server on a high port.
 * circle_query asks each: "what is your confirmed hash for version X?"
 * Returns: array of { peerId, hash, ok } from each peer.
 */

import { request as httpRequest } from 'node:http';

export interface PeerHashResponse {
  peerId: string;
  hash: string;
  ok: boolean;
  error?: string;
}

/**
 * Query a single peer Frame for its confirmed hash for a given version.
 * Peer must be running peer_artifact_server (SEG-KE-epsilon).
 */
export async function queryPeerHash(
  peerAddress: string, // host:port e.g. "192.168.1.42:47213"
  version: string,
  timeoutMs = 5000,
): Promise<PeerHashResponse> {
  return new Promise((resolve) => {
    const [host, portStr] = peerAddress.split(':');
    const port = parseInt(portStr, 10);

    const req = httpRequest(
      { host, port, path: `/hash/${encodeURIComponent(version)}`, method: 'GET', timeout: timeoutMs },
      (res) => {
        let data = '';
        res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
        res.on('end', () => {
          try {
            const json = JSON.parse(data) as { peerId: string; hash: string };
            resolve({ peerId: json.peerId, hash: json.hash, ok: true });
          } catch {
            resolve({ peerId: peerAddress, hash: '', ok: false, error: 'parse error' });
          }
        });
      },
    );

    req.on('error', (err: Error) => {
      resolve({ peerId: peerAddress, hash: '', ok: false, error: err.message });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ peerId: peerAddress, hash: '', ok: false, error: 'timeout' });
    });

    req.end();
  });
}

/**
 * Query all peers in the Circle and return their hash responses.
 */
export async function queryCircleHashes(
  peerAddresses: string[],
  version: string,
): Promise<PeerHashResponse[]> {
  return Promise.all(peerAddresses.map((addr) => queryPeerHash(addr, version)));
}
```

(2) C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\keys_engines\quorum_check.ts

Purpose: Compare 3 hashes (2 Circle peers + IP Ledger HEAD). Proceed only if 2-of-3 agree.

```typescript
/**
 * quorum_check.ts -- Keys and Engines: 2-of-3 hash quorum before install
 * BP087 Wave 4 · Keys and Engines canon
 *
 * Sources:
 *   1. Circle peer A (from circle_query.ts)
 *   2. Circle peer B (from circle_query.ts)
 *   3. IP Ledger HEAD hash (from ip_ledger_store.ts or REST query)
 *
 * Rule: at least 2 of 3 must agree on the same hash string.
 * If fewer than 2 agree: REFUSE + emit mismatch report.
 */

import { queryCircleHashes } from './circle_query';
import type { PeerHashResponse } from './circle_query';

export interface QuorumResult {
  passed: boolean;
  agreedHash: string | null;
  agreementCount: number;
  peerResponses: PeerHashResponse[];
  ledgerHash: string;
  mismatchDelta?: string; // JSON diff of disagreeing hashes for frontier_reputation_log
}

/**
 * Run 2-of-3 quorum check for a given update version + expected hash.
 * ledgerHash: the hash recorded in IP Ledger HEAD for this version.
 * peerAddresses: array of at least 2 Circle peer address strings (host:port).
 */
export async function runQuorumCheck(
  version: string,
  ledgerHash: string,
  peerAddresses: string[],
): Promise<QuorumResult> {
  const peerResponses = await queryCircleHashes(peerAddresses.slice(0, 2), version);

  const allHashes: string[] = [
    ...peerResponses.map((r) => (r.ok ? r.hash : '')),
    ledgerHash,
  ].filter(Boolean);

  // Count occurrences of each hash
  const counts = new Map<string, number>();
  for (const h of allHashes) {
    counts.set(h, (counts.get(h) ?? 0) + 1);
  }

  // Find hash with highest agreement
  let agreedHash: string | null = null;
  let agreementCount = 0;
  for (const [hash, count] of counts) {
    if (count > agreementCount) {
      agreedHash = hash;
      agreementCount = count;
    }
  }

  const passed = agreementCount >= 2;

  let mismatchDelta: string | undefined;
  if (!passed) {
    mismatchDelta = JSON.stringify({
      peer_a: peerResponses[0]?.hash ?? 'unavailable',
      peer_b: peerResponses[1]?.hash ?? 'unavailable',
      ledger: ledgerHash,
    });
  }

  return {
    passed,
    agreedHash: passed ? agreedHash : null,
    agreementCount,
    peerResponses,
    ledgerHash,
    mismatchDelta,
  };
}
```

Acceptance gate: smoke test with 2 mock peers agreeing + 1 disagreeing (ledger hash differs) -> quorum passes (2-of-3). Smoke test with all 3 hashes different -> quorum fails + mismatchDelta populated.

Return: 2 file paths + smoke test outputs (both scenarios printed to stdout) + tsc exit code.

---

**SEG-KE-gamma · frontier_reputation_log table + REST emit**

New migration file (Knight writes, Bishop applies):
C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\migrations\<TIMESTAMP>_frontier_reputation_log.sql

Also drop to BISHOP_DROPZONE:
C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\<TIMESTAMP>_frontier_reputation_log_BISHOP_APPLY.sql

Migration content:

```sql
-- frontier_reputation_log migration
-- BP087 Wave 4 · Keys and Engines · Knight ships · Bishop applies via psql per §15
-- Records all update hash-mismatch events for public trust auditability.

CREATE TABLE IF NOT EXISTS frontier_reputation_log (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_frame_id     text NOT NULL,          -- Frame that first reported the hash
  claimed_hash        text NOT NULL,          -- Hash claimed by source_frame (socceri-hash)
  ledger_hash         text NOT NULL,          -- Hash on record in IP Ledger HEAD
  mismatch_delta      jsonb,                  -- JSON diff of all 3 hash sources
  requesting_frame_id text NOT NULL,          -- Frame that ran quorum_check and refused install
  timestamp           timestamptz NOT NULL DEFAULT now(),
  update_version      text NOT NULL,          -- Version string from latest.yml
  severity            text NOT NULL DEFAULT 'mismatch',   -- 'mismatch' | 'quorum_fail' | 'sig_invalid'
  resolved            boolean NOT NULL DEFAULT false
);

-- RLS
ALTER TABLE frontier_reputation_log ENABLE ROW LEVEL SECURITY;

-- anon SELECT all rows (public trust surface)
CREATE POLICY "frontier_reputation_log_anon_select"
  ON frontier_reputation_log
  FOR SELECT
  TO anon
  USING (true);

-- anon INSERT (rate-limited at relay layer per Brick Wall)
CREATE POLICY "frontier_reputation_log_anon_insert"
  ON frontier_reputation_log
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- service_role full access
CREATE POLICY "frontier_reputation_log_service_role_all"
  ON frontier_reputation_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_frontier_reputation_log_version
  ON frontier_reputation_log (update_version);

CREATE INDEX IF NOT EXISTS idx_frontier_reputation_log_timestamp
  ON frontier_reputation_log (timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_frontier_reputation_log_requesting_frame
  ON frontier_reputation_log (requesting_frame_id);
```

Acceptance: migration applied (Bishop reports 0 errors). `curl -s 'https://<project>.supabase.co/rest/v1/frontier_reputation_log?select=id' -H 'apikey: <anon>'` returns empty array (200). Insert 1 test row via REST and confirm it appears in SELECT.

Return: .sql file path + BISHOP_DROPZONE copy path + content verbatim.

---

**SEG-KE-delta · Engine refuse-install + ledger-report wire**

Edit: C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\auto_updater.ts

Before any install command proceeds, run quorum_check. On FAIL: emit hash-mismatch event to frontier_reputation_log via REST POST. Show user the blocked message verbatim.

Knight edits the existing AutoUpdateManager class. Specific changes:

(a) Add imports at top of file after existing imports:
```typescript
import { runQuorumCheck } from './keys_engines/quorum_check';
import { getCircleMembership } from './keys_engines/circle_membership';
import { verifySocceriKey } from './keys_engines/key_verifier';
import { fetch as electronFetch } from 'electron';
```

(b) Add private method `_runTrustGate` to AutoUpdateManager:
```typescript
  private async _runTrustGate(version: string, payloadHash: string): Promise<boolean> {
    try {
      const circle = await getCircleMembership();
      if (circle.peers.length < 2) {
        console.warn('[AutoUpdater] Trust gate: fewer than 2 Circle peers available, bypassing quorum (AMBER)');
        return true; // degrade gracefully when Circle not yet populated
      }
      const peerAddresses = circle.peers.map((p) => p.address);

      // Fetch IP Ledger HEAD hash for this version via REST
      const ledgerUrl = `${process.env.SUPABASE_URL}/rest/v1/frontier_reputation_log?update_version=eq.${encodeURIComponent(version)}&select=claimed_hash&order=timestamp.desc&limit=1`;
      let ledgerHash = '';
      try {
        const ledgerRes = await electronFetch(ledgerUrl, {
          headers: { apikey: process.env.SUPABASE_ANON_KEY ?? '' },
        });
        const rows = await ledgerRes.json() as Array<{ claimed_hash: string }>;
        ledgerHash = rows[0]?.claimed_hash ?? payloadHash; // fallback to payload hash if no prior ledger entry
      } catch {
        ledgerHash = payloadHash; // network error: use payload hash as fallback
      }

      const quorum = await runQuorumCheck(version, ledgerHash, peerAddresses);

      if (!quorum.passed) {
        // Emit mismatch event to frontier_reputation_log
        const frameId = process.env.LB_FRAME_ID ?? 'unknown';
        await electronFetch(
          `${process.env.SUPABASE_URL}/rest/v1/frontier_reputation_log`,
          {
            method: 'POST',
            headers: {
              apikey: process.env.SUPABASE_ANON_KEY ?? '',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              source_frame_id: quorum.peerResponses[0]?.peerId ?? 'unknown',
              claimed_hash: payloadHash,
              ledger_hash: ledgerHash,
              mismatch_delta: quorum.mismatchDelta ? JSON.parse(quorum.mismatchDelta) : null,
              requesting_frame_id: frameId,
              update_version: version,
              severity: 'quorum_fail',
              resolved: false,
            }),
          },
        ).catch((e: Error) => console.error('[AutoUpdater] Ledger emit failed:', e.message));

        // Show user the blocked message verbatim (per Keys and Engines canon)
        this._setState({
          status: 'error',
          errorMessage: 'Update blocked · trust verification failed · check Reputation Log',
        });
        return false;
      }
      return true;
    } catch (err) {
      console.error('[AutoUpdater] Trust gate error:', err);
      return true; // degrade gracefully on unexpected error
    }
  }
```

(c) In the existing `downloadNow()` method, add trust gate call before `autoUpdater.downloadUpdate()`:
```typescript
  downloadNow(): void {
    if (this.state.status === 'available' && this.state.version) {
      const version = this.state.version;
      this._runTrustGate(version, '').then((trusted) => {
        if (!trusted) return;
        autoUpdater.downloadUpdate().catch((err: Error) => {
          this._setState({ status: 'error', errorMessage: err.message });
        });
      }).catch(() => {});
    }
  }
```

After edits: run `npx tsc --noEmit` from LianaBanyanPlatform root. Gate: zero errors.

Drift rule: if electron does not expose a global `fetch`, use `node-fetch` or `https` module instead and note in return.

Acceptance: simulated bad hash from a Circle peer causes `downloadNow()` to call `_runTrustGate`, which returns false, which sets state to error with message "Update blocked · trust verification failed · check Reputation Log" + emits one row to frontier_reputation_log.

Return: file path + diff of changes made (before/after for each edit block) + tsc exit code.

---

**SEG-KE-epsilon · Peer-to-peer LAN/WAN direct download (server-bypass)**

New files:

(1) C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\keys_engines\peer_artifact_server.ts

Purpose: Small HTTP listener on a high port (default 47213). Serves installer bytes from local replica to paired Frames. Also answers `/hash/:version` queries for quorum_check.

```typescript
/**
 * peer_artifact_server.ts -- Keys and Engines: serve installer bytes + hash to paired Frames
 * BP087 Wave 4 · Frame-to-Frame Wildfire Propagation
 *
 * Listens on PEER_ARTIFACT_PORT (default 47213).
 * Routes:
 *   GET /hash/:version       -> JSON { peerId, hash } (socceri-hash of local installer bytes)
 *   GET /artifact/:version   -> binary stream of local installer file
 *   GET /health              -> JSON { ok: true, peerId }
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { homedir } from 'node:os';

const PEER_ARTIFACT_PORT = parseInt(process.env.PEER_ARTIFACT_PORT ?? '47213', 10);
const ARTIFACT_CACHE_DIR = join(homedir(), '.lb_substrate', 'artifact_cache');
const FRAME_ID = process.env.LB_FRAME_ID ?? 'unknown';

function getArtifactPath(version: string): string {
  return join(ARTIFACT_CACHE_DIR, `MnemosyneC-Setup-${version}.exe`);
}

function computeLocalHash(version: string): string | null {
  const artifactPath = getArtifactPath(version);
  if (!existsSync(artifactPath)) return null;
  const bytes = readFileSync(artifactPath);
  return createHash('sha512').update(bytes).digest('hex');
}

export function startPeerArtifactServer(): void {
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const url = req.url ?? '/';

    if (url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, peerId: FRAME_ID }));
      return;
    }

    const hashMatch = url.match(/^\/hash\/(.+)$/);
    if (hashMatch) {
      const version = decodeURIComponent(hashMatch[1]);
      const hash = computeLocalHash(version);
      if (!hash) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'artifact not in local cache' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ peerId: FRAME_ID, hash }));
      return;
    }

    const artifactMatch = url.match(/^\/artifact\/(.+)$/);
    if (artifactMatch) {
      const version = decodeURIComponent(artifactMatch[1]);
      const artifactPath = getArtifactPath(version);
      if (!existsSync(artifactPath)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'artifact not in local cache' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
      createReadStream(artifactPath).pipe(res);
      return;
    }

    res.writeHead(404);
    res.end('Not found');
  });

  server.listen(PEER_ARTIFACT_PORT, () => {
    console.log(`[PeerArtifactServer] Listening on port ${PEER_ARTIFACT_PORT} (Frame: ${FRAME_ID})`);
  });
}
```

(2) C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\keys_engines\peer_artifact_client.ts

Purpose: Downloads installer from a paired Frame instead of mnemosynec.ai when bytes are available locally on that peer.

```typescript
/**
 * peer_artifact_client.ts -- Keys and Engines: download artifact from paired Frame
 * BP087 Wave 4 · Frame-to-Frame Wildfire Propagation · server-bypass
 *
 * Before downloading from mnemosynec.ai, check if any Circle peer has the artifact.
 * If yes: pull from peer directly (server bandwidth = 0 for this Frame).
 * If no: fall back to server download.
 */

import { request as httpRequest } from 'node:http';
import { createWriteStream, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const ARTIFACT_CACHE_DIR = join(homedir(), '.lb_substrate', 'artifact_cache');

export interface PeerArtifactResult {
  source: 'peer' | 'server';
  peerId?: string;
  localPath?: string;
  error?: string;
}

/**
 * Check if a peer has the artifact for a given version.
 * Returns the peer address if available, null otherwise.
 */
export async function findPeerWithArtifact(
  peerAddresses: string[],
  version: string,
  timeoutMs = 3000,
): Promise<string | null> {
  const checks = peerAddresses.map((addr) =>
    new Promise<string | null>((resolve) => {
      const [host, portStr] = addr.split(':');
      const port = parseInt(portStr, 10);
      const req = httpRequest(
        { host, port, path: `/hash/${encodeURIComponent(version)}`, method: 'GET', timeout: timeoutMs },
        (res) => {
          let data = '';
          res.on('data', (c: Buffer) => { data += c.toString(); });
          res.on('end', () => {
            try {
              const json = JSON.parse(data) as { hash?: string };
              resolve(json.hash ? addr : null);
            } catch {
              resolve(null);
            }
          });
        },
      );
      req.on('error', () => resolve(null));
      req.on('timeout', () => { req.destroy(); resolve(null); });
      req.end();
    }),
  );
  const results = await Promise.all(checks);
  return results.find((r) => r !== null) ?? null;
}

/**
 * Download artifact from a peer Frame to local ARTIFACT_CACHE_DIR.
 * Returns local file path on success.
 */
export async function downloadFromPeer(
  peerAddress: string,
  version: string,
): Promise<string> {
  mkdirSync(ARTIFACT_CACHE_DIR, { recursive: true });
  const destPath = join(ARTIFACT_CACHE_DIR, `MnemosyneC-Setup-${version}.exe`);

  return new Promise((resolve, reject) => {
    const [host, portStr] = peerAddress.split(':');
    const port = parseInt(portStr, 10);
    const req = httpRequest(
      { host, port, path: `/artifact/${encodeURIComponent(version)}`, method: 'GET' },
      (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Peer returned ${res.statusCode}`));
          return;
        }
        const writer = createWriteStream(destPath);
        res.pipe(writer);
        writer.on('finish', () => resolve(destPath));
        writer.on('error', reject);
      },
    );
    req.on('error', reject);
    req.end();
  });
}
```

Acceptance: 2 Frames on LAN. Frame A has v0.5.13 bytes in ~/.lb_substrate/artifact_cache/. Frame B calls findPeerWithArtifact() with Frame A address, gets a non-null result, calls downloadFromPeer(), receives bytes. mnemosynec.ai server receives zero download requests from Frame B.

Return: 2 file paths + tsc exit code + smoke test log showing peer-pull path taken.

---

**SEG-KE-zeta · Circle of Influence membership query at install time**

New file: C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\keys_engines\circle_membership.ts

Purpose: Reads Circle of Influence membership from BP086 MIC-stamped peer_presence table. Filters by reputation threshold. Returns at-least-2 paired peers. Feeds quorum_check and peer_artifact_client.

```typescript
/**
 * circle_membership.ts -- Keys and Engines: Circle of Influence peer query
 * BP087 Wave 4 · BP086 MIC-stamped trust list
 *
 * Queries peer_presence WHERE circle_of_influence = true AND reputation >= threshold.
 * Returns CircleMembership: { peers: CirclePeer[], count: number }
 *
 * Canon ref: canon_mic_stamped_user_approval_circle_of_influence_reciprocal_trust_bp086
 */

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? '';
const DEFAULT_REPUTATION_THRESHOLD = 0.8; // peers must have reputation >= 0.8 to join quorum

export interface CirclePeer {
  peerId: string;
  address: string;    // host:port for peer_artifact_server
  reputation: number; // 0.0-1.0
  micStamped: boolean;
}

export interface CircleMembership {
  peers: CirclePeer[];
  count: number;
  threshold: number;
}

/**
 * Fetch Circle of Influence peers from peer_presence table via Supabase REST.
 * Filters: circle_of_influence = true AND reputation >= threshold.
 * Returns empty list if table does not exist or network is unavailable.
 */
export async function getCircleMembership(
  threshold = DEFAULT_REPUTATION_THRESHOLD,
): Promise<CircleMembership> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('[CircleMembership] SUPABASE_URL or SUPABASE_ANON_KEY not set');
    return { peers: [], count: 0, threshold };
  }

  try {
    const url =
      `${SUPABASE_URL}/rest/v1/peer_presence` +
      `?circle_of_influence=eq.true` +
      `&reputation=gte.${threshold}` +
      `&select=peer_id,artifact_server_address,reputation,mic_stamped`;

    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.warn(`[CircleMembership] Supabase REST error: ${res.status}`);
      return { peers: [], count: 0, threshold };
    }

    const rows = await res.json() as Array<{
      peer_id: string;
      artifact_server_address: string;
      reputation: number;
      mic_stamped: boolean;
    }>;

    const peers: CirclePeer[] = rows.map((r) => ({
      peerId: r.peer_id,
      address: r.artifact_server_address,
      reputation: r.reputation,
      micStamped: r.mic_stamped,
    }));

    return { peers, count: peers.length, threshold };
  } catch (err) {
    console.error('[CircleMembership] Query failed:', err);
    return { peers: [], count: 0, threshold };
  }
}
```

Acceptance: Frame queries getCircleMembership(). If peer_presence has 2+ rows with circle_of_influence = true and reputation >= 0.8, returns count >= 2. quorum_check receives the peer list and uses the addresses. If peer_presence does not yet have those columns: HALT, return schema gap to Founder, do not crash.

Drift rule: if peer_presence does not have circle_of_influence, reputation, or artifact_server_address columns: return column names found + HALT. Bishop adds columns via migration before this SEG can proceed.

Return: file path + tsc exit code + peer_presence column audit (gadget: `curl -s 'https://<project>.supabase.co/rest/v1/peer_presence?select=*&limit=0'` headers reveal columns).

---

## §3 FILE TARGETS (ABSOLUTE PATHS)

New TypeScript files (Knight writes):
- C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\keys_engines\key_signer.ts
- C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\keys_engines\key_verifier.ts
- C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\keys_engines\quorum_check.ts
- C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\keys_engines\circle_query.ts
- C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\keys_engines\peer_artifact_server.ts
- C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\keys_engines\peer_artifact_client.ts
- C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\keys_engines\circle_membership.ts

New Supabase edge function (Knight writes):
- C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\functions\keys-engines-sign-update\index.ts

New SQL migration (Knight writes, Bishop applies via psql per §15):
- C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\migrations\<TIMESTAMP>_frontier_reputation_log.sql
- C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\<TIMESTAMP>_frontier_reputation_log_BISHOP_APPLY.sql

Edited file (Knight edits):
- C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\auto_updater.ts

---

## §4 ACCEPTANCE GATES (GADGET-VERIFIABLE)

Gate 1 (SEG-KE-alpha): All 3 Key files land. `npx tsc --noEmit` exits 0. Smoke call to verifySocceriKey() returns ok: true on a test payload.

Gate 2 (SEG-KE-beta): quorum_check.ts + circle_query.ts land. Smoke test 1 (2 peers agree, 1 disagrees) -> passed: true. Smoke test 2 (all 3 differ) -> passed: false + mismatchDelta non-null.

Gate 3 (SEG-KE-gamma): frontier_reputation_log.sql in supabase/migrations/ + BISHOP_DROPZONE copy. Bishop applies via psql: 0 errors. curl anon SELECT returns 200 + empty array. Insert 1 test row via REST, confirm appears in SELECT.

Gate 4 (SEG-KE-delta): auto_updater.ts edited. `npx tsc --noEmit` exits 0. Simulated bad hash: downloadNow() sets state to error with message "Update blocked · trust verification failed · check Reputation Log" + 1 row written to frontier_reputation_log.

Gate 5 (SEG-KE-epsilon): peer_artifact_server.ts + peer_artifact_client.ts land. 4-peer wildfire smoke test: Frame A downloads from server, Frames B/C/D download from Frame A via peer_artifact_client. mnemosynec.ai server-hit count = 1 (not 4).

Gate 6 (SEG-KE-zeta): circle_membership.ts lands. getCircleMembership() returns count >= 2 peers from peer_presence WHERE circle_of_influence = true AND reputation >= 0.8. quorum_check receives the peer list successfully.

All 6 gates GREEN before Wave 4 declared GREEN. Gate 3 AMBER until Bishop applies psql. If peer_presence missing columns, Gate 6 is AMBER until Bishop adds schema.

---

## §5 DRIFT SURFACE PROTOCOL (BP053 INLINE)

If src/main/keys_engines/ directory does not exist: Knight creates it. No Founder confirm needed for new directory under an existing path.

If peer_presence table is missing circle_of_influence, reputation, or artifact_server_address columns: HALT SEG-KE-zeta. Return column audit. Bishop adds missing columns via migration before refire.

If auto_updater.ts imports conflict with existing types (e.g. electron does not export `fetch`): use node built-in `https` module for REST calls instead. Note substitution in return.

If platform/supabase/functions/ path does not exist: HALT SEG-KE-alpha edge function only. Return the actual path of the Supabase edge functions directory from disk. Do not guess.

If frontier_reputation_log.sql conflicts with an existing migration of the same table: HALT. Return the existing migration path. Do not overwrite.

Drift = surface to Founder immediately. No silent workarounds.

---

## §6 COMPOSITION

Related canon slugs:
- canon_keys_and_engines_frame_to_frame_wildfire_propagation_2_of_3_ip_ledger_hash_quorum_bp087 (primary · this yoke implements it)
- canon_mic_stamped_user_approval_circle_of_influence_reciprocal_trust_bp086 (Circle of Influence membership, §KE-zeta)
- canon_mic_machine_in_charge_naming_lock_bp086 (MIC role in signing broadcast)
- canon_mnemosynec_assigns_reins_per_category_bp085 (reins registry: Keys and Engines domain)
- canon_persistent_active_memory_crown_jewel_bp085 (Frames are persistent memory nodes)
- canon_continuity_lift_across_vendor_churn_tagline_bp085 (wildfire propagation enforces continuity)
- canon_lan_as_wan_test_mode_4_machine_mesh_bp085 (LAN-AS-WAN hard constraint: peer download goes via public relay, not LAN-direct, during mesh test)
- BP087 §16 IP Ledger propagation flow (frontier_reputation_log is the §16 public accountability surface)
- BP087 beta3 Thorax PKI (Ed25519 key pair re-used in key_signer.ts / key_verifier.ts)
- Pearl + Substrace (mesh fabric peer_presence table that circle_membership.ts queries)
- LB Frame self-verifying replica (each Frame is a full substrate replica; artifact cache is local)
- Socceri naming convention (socceriHash function name per BP085 Soccerball DAG coordinate scheme)

---

## §7 KNIGHT RETURN TEMPLATE (BP053 §4 · EMPIRICAL RECEIPT ONLY)

Knight returns one block per SEG. Empirical only -- no assertions without gadget receipts.

```
YOKE WAVE 4 RETURN · BP087 KEYS AND ENGINES
SEG-KE-alpha: [GREEN|RED] · key_signer.ts: [written|MISSING] · key_verifier.ts: [written|MISSING] · edge fn: [written|path-drift] · tsc exit: ___ · verifySocceriKey smoke: [ok:true|FAIL]
SEG-KE-beta:  [GREEN|RED] · quorum_check.ts: [written|MISSING] · circle_query.ts: [written|MISSING] · tsc exit: ___ · smoke-2-of-3-agree: [PASS|FAIL] · smoke-all-disagree: [refused|FAIL]
SEG-KE-gamma: [GREEN|AMBER] · migration .sql: [path] · BISHOP_DROPZONE copy: [path] · Bishop apply: [0 errors|PENDING] · test row INSERT: [ok|PENDING]
SEG-KE-delta: [GREEN|RED] · auto_updater.ts edited: [YES|NO] · tsc exit: ___ · bad-hash-block test: [blocked+ledger-row|FAIL] · user message verbatim: [shown|FAIL]
SEG-KE-epsilon: [GREEN|RED] · peer_artifact_server.ts: [written|MISSING] · peer_artifact_client.ts: [written|MISSING] · tsc exit: ___ · Frame-B-from-Frame-A test: [0 server hits|N server hits]
SEG-KE-zeta:  [GREEN|AMBER] · circle_membership.ts: [written|MISSING] · tsc exit: ___ · peer_presence columns: [circle_of_influence|MISSING] [reputation|MISSING] [artifact_server_address|MISSING] · peer count returned: ___
YOKE WAVE 4 STATUS: [GREEN|AMBER|RED]
AMBER/RED NOTES: ______
```

---

## §8 STATUTES BINDING HEADER

§2 IMMUTABLES: Knight does not apply Supabase migrations. All .sql files go to BISHOP_DROPZONE. Knight does not run psql. Knight does not alter relay topology or auth flows. Knight does not generate or store Thorax private key material (edge function reads from env vars at runtime).

§3 SONNET 4.6 VERBATIM: use segs Sonnet 4.6 verbatim. All SEG workers run Sonnet 4.6. No model substitution.

§4 ABSOLUTE PATHS: All file operations use absolute paths as listed in §3. No relative paths.

§14 GADGET-FIRST: tsc --noEmit for all TypeScript gates. curl for frontier_reputation_log REST verify. No human-eyeball assertions for gadget-verifiable gates.

§15 BISHOP-DIRECT-SUPABASE: Knight ships .sql for frontier_reputation_log. Bishop applies via psql. Knight does not touch Supabase directly. This is non-negotiable.

§17 GADGET-FIRST DISCOVERY BLOOD: Knight uses pheromone_query / search_knowledge / consult_scribes / pearl_decode / brief_me for substrate state discovery. NEVER bash grep / find / Glob / PowerShell / Select-String for discovery. Shell allowed only for psql per §15, curl per §14 REST, git mechanical, build/copy/deploy.
