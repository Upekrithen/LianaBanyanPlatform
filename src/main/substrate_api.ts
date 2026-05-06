// AMPLIFY Computer — Local Substrate API Server
// B37 Phase 3 — Full implementation (replaces Phase 1 stub)
//
// HTTP endpoints exposed on 127.0.0.1:11481 for any local app to query:
//   GET  /health                    — liveness
//   GET  /mode                      — current + forced mode
//   POST /mode/force                — force or clear override mode
//   POST /substrate/query           — three-mode routed query
//   POST /substrate/write           — write a record to local index + queue federation sync
//   GET  /amplify/snapshot          — cost telemetry snapshot
//   GET  /federation/status         — peer count, last sync, online status

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { appendFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import { SubstrateLocalIndex, SubstrateRouter, type FrameMode } from './substrate_router';
import type { FederationClient } from './federation_client';

// ─── Constants ────────────────────────────────────────────────────────────────

export const API_PORT = 11480; // LB CAI Hearth substrate local port

const LOG_DIR = resolve(
  process.env.APPDATA || process.env.HOME || '.',
  'AMPLIFY Computer',
  'logs',
);

// ─── Telemetry record ─────────────────────────────────────────────────────────

interface QueryRecord {
  ts: string;
  query_hash: string;
  routing: 'substrate_hit' | 'local_ollama' | 'cloud_escalation' | 'peer_sync' | 'miss';
  latency_ms: number;
  cloud_cost_avoided_usd: number;
}

// ─── Substrate API Server ─────────────────────────────────────────────────────

export class SubstrateAPIServer {
  private server: ReturnType<typeof createServer> | null = null;
  private queryLog: QueryRecord[] = [];
  private index: SubstrateLocalIndex;
  private router: SubstrateRouter;
  private federation: FederationClient | null = null;

  constructor() {
    this.index = new SubstrateLocalIndex();
    this.router = new SubstrateRouter(this.index);
  }

  setFederationClient(client: FederationClient): void {
    this.federation = client;
  }

  getIndex(): SubstrateLocalIndex {
    return this.index;
  }

  setMode(mode: FrameMode): void {
    this.router.setMode(mode);
  }

  setForcedMode(mode: FrameMode | null): void {
    this.router.setForcedMode(mode);
  }

  getForcedMode(): FrameMode | null {
    return this.router.getForcedMode();
  }

  getEffectiveMode(): FrameMode {
    return this.router.getEffectiveMode();
  }

  async start(): Promise<void> {
    if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });

    // Load substrate index
    await this.index.load();

    this.server = createServer((req, res) => this._handleRequest(req, res));

    return new Promise((resolve, reject) => {
      this.server!.listen(API_PORT, '127.0.0.1', () => {
        console.log(
          `[SubstrateAPI] Listening on http://127.0.0.1:${API_PORT} — ` +
          `${this.index.size} records indexed`,
        );
        resolve();
      });
      this.server!.on('error', reject);
    });
  }

  private _handleRequest(req: IncomingMessage, res: ServerResponse): void {
    res.setHeader('Content-Type', 'application/json');
    // Allow requests from the local AMPLIFY renderer + any local app
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    const url = req.url?.split('?')[0];

    // ── GET /health ──────────────────────────────────────────────────────────
    if (req.method === 'GET' && url === '/health') {
      res.end(
        JSON.stringify({
          ok: true,
          version: '0.3.0',
          port: API_PORT,
          index_size: this.index.size,
          mode: this.router.getEffectiveMode(),
          forced_mode: this.router.getForcedMode(),
        }),
      );
      return;
    }

    // ── GET /mode ────────────────────────────────────────────────────────────
    if (req.method === 'GET' && url === '/mode') {
      res.end(
        JSON.stringify({
          mode: this.router.getEffectiveMode(),
          forced_mode: this.router.getForcedMode(),
        }),
      );
      return;
    }

    // ── POST /mode/force ─────────────────────────────────────────────────────
    if (req.method === 'POST' && url === '/mode/force') {
      this._readBody(req, (body) => {
        try {
          const { mode } = JSON.parse(body) as { mode: FrameMode | null };
          this.router.setForcedMode(mode);
          res.end(JSON.stringify({ ok: true, forced_mode: this.router.getForcedMode() }));
        } catch {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    // ── GET /amplify/snapshot ─────────────────────────────────────────────────
    if (req.method === 'GET' && url === '/amplify/snapshot') {
      res.end(JSON.stringify(this.getAMPLIFYSnapshot()));
      return;
    }

    // ── GET /federation/status ────────────────────────────────────────────────
    if (req.method === 'GET' && url === '/federation/status') {
      const status = this.federation?.getStatus() ?? {
        online: false,
        peerCount: 0,
        lastSyncTs: null,
        lastSyncRecordsExchanged: 0,
        pendingWriteCount: 0,
        peers: [],
      };
      res.end(JSON.stringify(status));
      return;
    }

    // ── POST /substrate/query ─────────────────────────────────────────────────
    if (req.method === 'POST' && url === '/substrate/query') {
      this._readBody(req, async (body) => {
        try {
          const { query, model } = JSON.parse(body) as {
            query: string;
            model?: string;
          };

          if (!query || typeof query !== 'string') {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'query field required' }));
            return;
          }

          const result = await this.router.query(query, model);

          // If in fallback and local missed, try peer sync
          if (
            result.routing === 'peer_sync' &&
            this.federation &&
            this.federation.getStatus().peerCount > 0
          ) {
            const peers = this.federation.getStatus().peers;
            if (peers.length > 0) {
              const exchanged = await this.federation.syncWithPeer(peers[0]);
              if (exchanged > 0) {
                const retryResult = await this.router.query(query, model);
                if (retryResult.hit) {
                  this._recordQuery({
                    ts: new Date().toISOString(),
                    query_hash: this._hashQuery(query),
                    routing: retryResult.routing as QueryRecord['routing'],
                    latency_ms: retryResult.latency_ms,
                    cloud_cost_avoided_usd: retryResult.cloud_cost_avoided_usd,
                  });
                  this._appendTelemetry(retryResult.routing, retryResult.latency_ms, retryResult.cloud_cost_avoided_usd);
                  res.end(JSON.stringify({ ...retryResult, peer_sync_exchanged: exchanged }));
                  return;
                }
              }
            }
          }

          this._recordQuery({
            ts: new Date().toISOString(),
            query_hash: this._hashQuery(query),
            routing: result.routing as QueryRecord['routing'],
            latency_ms: result.latency_ms,
            cloud_cost_avoided_usd: result.cloud_cost_avoided_usd,
          });
          this._appendTelemetry(result.routing, result.latency_ms, result.cloud_cost_avoided_usd);
          res.end(JSON.stringify(result));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: String(err) }));
        }
      });
      return;
    }

    // ── POST /substrate/write ─────────────────────────────────────────────────
    if (req.method === 'POST' && url === '/substrate/write') {
      this._readBody(req, (body) => {
        try {
          const { id, text, source, keywords } = JSON.parse(body) as {
            id?: string;
            text: string;
            source?: string;
            keywords?: string[];
          };

          if (!text || typeof text !== 'string') {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'text field required' }));
            return;
          }

          const record = {
            id: id ?? this._hashQuery(text),
            text,
            source: source ?? 'external_write',
            keywords: keywords ?? [],
            ts: new Date().toISOString(),
          };

          this.index.writeRecord(record);
          this.federation?.queueWrite(record);

          res.end(JSON.stringify({ ok: true, id: record.id }));
        } catch {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
  }

  // ─── Telemetry ───────────────────────────────────────────────────────────────

  private _recordQuery(record: QueryRecord): void {
    this.queryLog.push(record);
    if (this.queryLog.length > 2000) this.queryLog.shift();
  }

  private _appendTelemetry(
    routing: QueryRecord['routing'],
    latency_ms: number,
    cloud_cost_avoided_usd: number,
  ): void {
    const telemetryPath = resolve(
      process.env.APPDATA || process.env.HOME || '.',
      'AMPLIFY Computer',
      'logs',
      'query_telemetry.jsonl',
    );
    const entry = JSON.stringify({
      ts: new Date().toISOString(),
      routing,
      latency_ms,
      cloud_cost_avoided_usd,
      tokens_saved_est: Math.round(cloud_cost_avoided_usd / 0.000003),
    });
    try {
      appendFileSync(telemetryPath, entry + '\n', 'utf8');
    } catch {
      // Non-fatal
    }
  }

  getAMPLIFYSnapshot(): object {
    const total = this.queryLog.length;
    const substrate = this.queryLog.filter((r) => r.routing === 'substrate_hit').length;
    const local = this.queryLog.filter((r) => r.routing === 'local_ollama').length;
    const cloud = this.queryLog.filter((r) => r.routing === 'cloud_escalation').length;
    const peer = this.queryLog.filter((r) => r.routing === 'peer_sync').length;
    const avoided = this.queryLog.reduce((sum, r) => sum + r.cloud_cost_avoided_usd, 0);
    const avgLatencyMs =
      total > 0
        ? Math.round(this.queryLog.reduce((s, r) => s + r.latency_ms, 0) / total)
        : 0;

    return {
      total_queries: total,
      substrate_hits: substrate,
      local_ollama_served: local,
      cloud_escalations: cloud,
      peer_synced: peer,
      substrate_hit_ratio: total > 0 ? substrate / total : 0,
      local_ratio: total > 0 ? local / total : 0,
      cloud_ratio: total > 0 ? cloud / total : 0,
      total_cloud_cost_avoided_usd: avoided,
      total_tokens_saved_est: Math.round(avoided / 0.000003),
      avg_latency_ms: avgLatencyMs,
      index_size: this.index.size,
      as_of: new Date().toISOString(),
    };
  }

  // ─── Utilities ───────────────────────────────────────────────────────────────

  private _readBody(req: IncomingMessage, cb: (body: string) => void): void {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => cb(body));
  }

  private _hashQuery(query: string): string {
    // Inline hash without crypto import at top level (already in substrate_router)
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      hash = ((hash << 5) - hash + query.charCodeAt(i)) | 0;
    }
    return Math.abs(hash).toString(36).padStart(8, '0');
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }
}
