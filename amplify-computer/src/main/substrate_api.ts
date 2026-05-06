// AMPLIFY Computer — Local Substrate API Server
// B37 Phase 3-4 — Full implementation with TelemetryStore
//
// HTTP endpoints on 127.0.0.1:11480:
//   GET  /health                    — liveness
//   GET  /mode                      — current + forced mode
//   POST /mode/force                — force or clear override mode
//   POST /substrate/query           — three-mode routed query
//   POST /substrate/write           — write record to local index + federation queue
//   GET  /amplify/snapshot          — session telemetry snapshot
//   GET  /amplify/summary           — full historical summary (today/week/month/all-time)
//   GET  /federation/status         — peer count, last sync, online status

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import { SubstrateLocalIndex, SubstrateRouter, type FrameMode } from './substrate_router';
import { TelemetryStore, type RoutingSource } from './telemetry_store';
import type { FederationClient } from './federation_client';

// ─── Constants ────────────────────────────────────────────────────────────────

export const API_PORT = 11480;

const LOG_DIR = resolve(
  process.env.APPDATA || process.env.HOME || '.',
  'AMPLIFY Computer',
  'logs',
);

// ─── Substrate API Server ─────────────────────────────────────────────────────

export class SubstrateAPIServer {
  private server: ReturnType<typeof createServer> | null = null;
  private index: SubstrateLocalIndex;
  private router: SubstrateRouter;
  private federation: FederationClient | null = null;
  private telemetry: TelemetryStore;

  constructor() {
    this.index = new SubstrateLocalIndex();
    this.router = new SubstrateRouter(this.index);
    this.telemetry = new TelemetryStore();
  }

  setFederationClient(client: FederationClient): void {
    this.federation = client;
  }

  getTelemetryStore(): TelemetryStore {
    return this.telemetry;
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
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    const url = req.url?.split('?')[0];

    // ── GET /health ───────────────────────────────────────────────────────────
    if (req.method === 'GET' && url === '/health') {
      res.end(JSON.stringify({
        ok: true,
        version: '0.4.0',
        port: API_PORT,
        index_size: this.index.size,
        mode: this.router.getEffectiveMode(),
        forced_mode: this.router.getForcedMode(),
      }));
      return;
    }

    // ── GET /mode ─────────────────────────────────────────────────────────────
    if (req.method === 'GET' && url === '/mode') {
      res.end(JSON.stringify({
        mode: this.router.getEffectiveMode(),
        forced_mode: this.router.getForcedMode(),
      }));
      return;
    }

    // ── POST /mode/force ──────────────────────────────────────────────────────
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

    // ── GET /amplify/snapshot — session stats ─────────────────────────────────
    if (req.method === 'GET' && url === '/amplify/snapshot') {
      res.end(JSON.stringify(this.getAMPLIFYSnapshot()));
      return;
    }

    // ── GET /amplify/summary — full historical summary ────────────────────────
    if (req.method === 'GET' && url === '/amplify/summary') {
      res.end(JSON.stringify(this.telemetry.getSummary()));
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
          const { query, model } = JSON.parse(body) as { query: string; model?: string };
          if (!query || typeof query !== 'string') {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'query field required' }));
            return;
          }

          const result = await this.router.query(query, model);

          // Fallback: try peer sync on miss
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
                  this._recordTelemetry(
                    retryResult.routing as RoutingSource,
                    retryResult.latency_ms,
                    retryResult.cloud_cost_avoided_usd,
                  );
                  res.end(JSON.stringify({ ...retryResult, peer_sync_exchanged: exchanged }));
                  return;
                }
              }
            }
          }

          this._recordTelemetry(
            result.routing as RoutingSource,
            result.latency_ms,
            result.cloud_cost_avoided_usd,
          );
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

  // ─── Telemetry ────────────────────────────────────────────────────────────

  private _recordTelemetry(
    routing: RoutingSource,
    latency_ms: number,
    cloud_cost_avoided_usd: number,
  ): void {
    this.telemetry.record({
      routing,
      latency_ms,
      cloud_cost_avoided_usd,
      tokens_saved_est: Math.round(cloud_cost_avoided_usd / 0.000003),
    });
  }

  getAMPLIFYSnapshot(): object {
    const s = this.telemetry.getSessionStats();
    return {
      total_queries: s.total_queries,
      substrate_hits: s.substrate_hits,
      local_ollama_served: s.local_ollama_served,
      cloud_escalations: s.cloud_escalations,
      peer_synced: s.peer_synced,
      substrate_hit_ratio: s.substrate_hit_ratio,
      local_ratio: s.local_ratio,
      cloud_ratio: s.cloud_ratio,
      total_cloud_cost_avoided_usd: s.cloud_cost_avoided_usd,
      total_tokens_saved_est: s.tokens_saved_est,
      avg_latency_ms: s.avg_latency_ms,
      avg_local_latency_ms: s.avg_local_latency_ms,
      latency_improvement_pct: s.latency_improvement_pct,
      index_size: this.index.size,
      as_of: new Date().toISOString(),
    };
  }

  // ─── Utilities ────────────────────────────────────────────────────────────

  private _readBody(req: IncomingMessage, cb: (body: string) => void): void {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => cb(body));
  }

  private _hashQuery(query: string): string {
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
