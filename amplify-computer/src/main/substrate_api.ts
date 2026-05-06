// AMPLIFY Computer — Local Substrate API Server
// B37 Phase 3 scaffold (Phase 1: stub HTTP server, Phase 3: full implementation)
// Exposes local substrate index via HTTP for any app to query

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { resolve } from 'path';
import { existsSync, readFileSync, appendFileSync, mkdirSync } from 'fs';

const API_PORT = 11480; // LB CAI Hearth substrate local port
const LOG_DIR = resolve(process.env.APPDATA || process.env.HOME || '.', 'AMPLIFY Computer', 'logs');

interface QueryRecord {
  ts: string;
  query_hash: string;
  routing: 'substrate_hit' | 'local_ollama' | 'cloud_escalation';
  latency_ms: number;
  cloud_cost_avoided_usd: number;
}

export class SubstrateAPIServer {
  private server: ReturnType<typeof createServer> | null = null;
  private queryLog: QueryRecord[] = [];

  async start(): Promise<void> {
    if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });

    this.server = createServer((req, res) => this._handleRequest(req, res));
    return new Promise((resolve, reject) => {
      this.server!.listen(API_PORT, '127.0.0.1', () => {
        console.log(`[SubstrateAPI] Listening on http://127.0.0.1:${API_PORT}`);
        resolve();
      });
      this.server!.on('error', reject);
    });
  }

  private _handleRequest(req: IncomingMessage, res: ServerResponse): void {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');

    if (req.method === 'GET' && req.url === '/health') {
      res.end(JSON.stringify({ ok: true, version: '0.1.0', port: API_PORT }));
      return;
    }

    if (req.method === 'GET' && req.url === '/amplify/snapshot') {
      res.end(JSON.stringify(this.getAMPLIFYSnapshot()));
      return;
    }

    if (req.method === 'POST' && req.url === '/substrate/query') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        try {
          const { query } = JSON.parse(body);
          // Phase 3: full substrate lookup; Phase 1 stub returns miss
          const result = { hit: false, query, ts: new Date().toISOString() };
          this._recordQuery({
            ts: result.ts,
            query_hash: Buffer.from(query).toString('base64').slice(0, 16),
            routing: 'cloud_escalation',
            latency_ms: 1,
            cloud_cost_avoided_usd: 0,
          });
          res.end(JSON.stringify(result));
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

  private _recordQuery(record: QueryRecord): void {
    this.queryLog.push(record);
    // Cap in-memory log at 1000 entries
    if (this.queryLog.length > 1000) this.queryLog.shift();
  }

  getAMPLIFYSnapshot(): object {
    const total = this.queryLog.length;
    const substrate = this.queryLog.filter((r) => r.routing === 'substrate_hit').length;
    const local = this.queryLog.filter((r) => r.routing === 'local_ollama').length;
    const cloud = this.queryLog.filter((r) => r.routing === 'cloud_escalation').length;
    const avoided = this.queryLog.reduce((sum, r) => sum + r.cloud_cost_avoided_usd, 0);

    return {
      total_queries: total,
      substrate_hits: substrate,
      local_ollama_served: local,
      cloud_escalations: cloud,
      substrate_hit_ratio: total > 0 ? substrate / total : 0,
      local_ratio: total > 0 ? local / total : 0,
      cloud_ratio: total > 0 ? cloud / total : 0,
      total_cloud_cost_avoided_usd: avoided,
      total_tokens_saved_est: Math.round(avoided / 0.000003),
      as_of: new Date().toISOString(),
    };
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
