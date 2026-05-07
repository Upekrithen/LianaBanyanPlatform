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
//   GET  /yoke/stream               — SSE inbox fan-out (MoneyPenny Phase B)

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { mkdirSync, existsSync, appendFileSync, readFileSync, watch } from 'fs';
import { resolve, dirname } from 'path';
import { randomUUID } from 'crypto';
import { SubstrateLocalIndex, SubstrateRouter, type FrameMode } from './substrate_router';
import { TelemetryStore, type RoutingSource } from './telemetry_store';
import { getMobileHTML, getManifestJSON, getServiceWorker, getIconSVG } from './mobile_pwa';
import type { FederationClient } from './federation_client';

// ─── Constants ────────────────────────────────────────────────────────────────

export const API_PORT = 11480;

const LOG_DIR = resolve(
  process.env.APPDATA || process.env.HOME || '.',
  'AMPLIFY Computer',
  'logs',
);

// Yoke path — Bushel 41 Pixel-to-Bishop async bridge target
// Override via YOKE_PATH env var; default targets Founder's local LianaBanyanPlatform repo
const YOKE_PATH = process.env.YOKE_PATH ?? resolve(
  process.env.HOMEDRIVE && process.env.HOMEPATH
    ? `${process.env.HOMEDRIVE}${process.env.HOMEPATH}`
    : process.env.HOME || '.',
  'Documents',
  'LianaBanyanPlatform',
  'KNIGHT_BISHOP_MESSAGES.md',
);

// Pixel inbox path — Bushel 42 Bishop-to-Pixel direction (MoneyPenny Mail bidirectional)
// Append-only JSONL; PWA polls /yoke/inbox to render Bishop replies in thread
const INBOX_PATH = resolve(
  process.env.APPDATA || process.env.HOME || '.',
  'AMPLIFY Computer',
  'pixel_inbox.jsonl',
);

// Family roster path — Bushel 44 Family Member discovery
// Append-only JSONL of family member records; active state managed by `active` field
const FAMILY_ROSTER_PATH = resolve(
  process.env.APPDATA || process.env.HOME || '.',
  'AMPLIFY Computer',
  'family_roster.jsonl',
);

// Family attachments dir — Bushel 46 Loteria-class rich content
// Image/audio attachments stored under {ATTACHMENTS_DIR}/{attachment_id}.{ext}
// Family Table scope only — never federated to lianabanyan.com
const ATTACHMENTS_DIR = resolve(
  process.env.APPDATA || process.env.HOME || '.',
  'AMPLIFY Computer',
  'family_attachments',
);
const ATTACHMENTS_INDEX = resolve(ATTACHMENTS_DIR, 'index.jsonl');

// ─── Substrate API Server ─────────────────────────────────────────────────────

export class SubstrateAPIServer {
  private server: ReturnType<typeof createServer> | null = null;
  private index: SubstrateLocalIndex;
  private router: SubstrateRouter;
  private federation: FederationClient | null = null;
  private telemetry: TelemetryStore;
  private degradedMode = false;
  private yokeSseClients = new Set<ServerResponse>();
  private inboxWatchInstalled = false;

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

  setDegradedMode(degraded: boolean): void {
    this.degradedMode = degraded;
  }

  async start(): Promise<void> {
    if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });
    await this.index.load();

    this.server = createServer((req, res) => this._handleRequest(req, res));
    return new Promise((resolve, reject) => {
      // Bind to 0.0.0.0 so MoneyPenny mobile can reach it over WiFi
      this.server!.listen(API_PORT, '0.0.0.0', () => {
        console.log(
          `[SubstrateAPI] Listening on http://0.0.0.0:${API_PORT} — ` +
          `${this.index.size} records indexed`,
        );
        resolve();
      });
      this.server!.on('error', reject);
    });
  }

  /** Pixel inbox JSON (same payload as GET /yoke/inbox). */
  private _readPixelInboxPayload(): { replies: unknown[]; as_of: string } {
    let entries: unknown[] = [];
    if (existsSync(INBOX_PATH)) {
      const raw = readFileSync(INBOX_PATH, 'utf8');
      entries = raw
        .split('\n')
        .filter((l) => l.trim().length > 0)
        .map((l) => {
          try {
            return JSON.parse(l) as unknown;
          } catch {
            return null;
          }
        })
        .filter((e) => e !== null);
    }
    entries.reverse();
    if (entries.length > 50) entries = entries.slice(0, 50);
    return {
      replies: entries,
      as_of: new Date().toISOString(),
    };
  }

  private _broadcastYokeInboxSse(): void {
    if (this.yokeSseClients.size === 0) return;
    const payload = JSON.stringify(this._readPixelInboxPayload());
    const chunk = `event: inbox\ndata: ${payload}\n\n`;
    for (const client of [...this.yokeSseClients]) {
      try {
        if (!client.writableEnded) client.write(chunk);
      } catch {
        this.yokeSseClients.delete(client);
      }
    }
  }

  private _ensurePixelInboxFanout(): void {
    if (this.inboxWatchInstalled) return;
    this.inboxWatchInstalled = true;
    try {
      mkdirSync(dirname(INBOX_PATH), { recursive: true });
      if (!existsSync(INBOX_PATH)) {
        appendFileSync(INBOX_PATH, '', 'utf8');
      }
    } catch {
      /* non-fatal */
    }
    try {
      let debounceTimer: ReturnType<typeof setTimeout>;
      watch(INBOX_PATH, () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => this._broadcastYokeInboxSse(), 100);
      });
    } catch (err) {
      console.warn('[SubstrateAPI] pixel inbox watch failed:', String(err));
    }
  }

  private _handleYokeSse(req: IncomingMessage, res: ServerResponse): void {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    const resFlush = res as unknown as { flushHeaders?: () => void };
    resFlush.flushHeaders?.();

    res.write(': connected\n\n');

    this._ensurePixelInboxFanout();
    this.yokeSseClients.add(res);

    try {
      const snapshot = JSON.stringify(this._readPixelInboxPayload());
      res.write(`event: inbox\ndata: ${snapshot}\n\n`);
    } catch {
      /* ignore initial snapshot failures */
    }

    const pingIv = setInterval(() => {
      try {
        if (!res.writableEnded) res.write(': ping\n\n');
      } catch {
        clearInterval(pingIv);
      }
    }, 28_000);

    req.on('close', () => {
      clearInterval(pingIv);
      this.yokeSseClients.delete(res);
    });
    req.socket.setTimeout?.(0);
  }

  private _handleRequest(req: IncomingMessage, res: ServerResponse): void {
    const url = req.url?.split('?')[0];

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method === 'GET' && url === '/yoke/stream') {
      this._handleYokeSse(req, res);
      return;
    }

    res.setHeader('Content-Type', 'application/json');

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

    // ── GET / → redirect to /mobile ──────────────────────────────────────────
    if (req.method === 'GET' && (url === '/' || url === '')) {
      res.writeHead(302, { Location: '/mobile' });
      res.end();
      return;
    }

    // ── GET /mobile — MoneyPenny PWA shell ───────────────────────────────────
    if (req.method === 'GET' && url === '/mobile') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.end(getMobileHTML());
      return;
    }

    // ── GET /manifest.json ────────────────────────────────────────────────────
    if (req.method === 'GET' && url === '/manifest.json') {
      res.setHeader('Content-Type', 'application/manifest+json');
      res.setHeader('Cache-Control', 'max-age=3600');
      res.end(getManifestJSON());
      return;
    }

    // ── GET /sw.js — service worker ───────────────────────────────────────────
    if (req.method === 'GET' && url === '/sw.js') {
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Service-Worker-Allowed', '/');
      res.setHeader('Cache-Control', 'no-cache');
      res.end(getServiceWorker());
      return;
    }

    // ── GET /icon.svg ─────────────────────────────────────────────────────────
    if (req.method === 'GET' && url === '/icon.svg') {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'max-age=86400');
      res.end(getIconSVG());
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
          const { query, model, degraded } = JSON.parse(body) as {
            query: string;
            model?: string;
            degraded?: boolean;
          };
          if (!query || typeof query !== 'string') {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'query field required' }));
            return;
          }

          const isDegraded = this.degradedMode || degraded === true;
          const result = await this.router.query(
            query,
            isDegraded ? undefined : model,
            { degraded: isDegraded },
          );

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
                const retryResult = await this.router.query(
                  query,
                  isDegraded ? undefined : model,
                  { degraded: isDegraded },
                );
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
          const { id, text, source, keywords, degraded } = JSON.parse(body) as {
            id?: string;
            text: string;
            source?: string;
            keywords?: string[];
            degraded?: boolean;
          };
          if (this.degradedMode || degraded === true) {
            res.statusCode = 403;
            res.end(JSON.stringify({ ok: false, reason: 'degraded_mode' }));
            return;
          }
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

    // ── POST /yoke/reply — Bushel 42 Bishop-to-Pixel reply (MoneyPenny Mail bidirectional) ─
    if (req.method === 'POST' && url === '/yoke/reply') {
      this._readBody(req, (body) => {
        try {
          const { in_reply_to, text, author } = JSON.parse(body) as {
            in_reply_to: string;
            text: string;
            author?: string;
          };
          if (!in_reply_to || typeof in_reply_to !== 'string') {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'in_reply_to field required' }));
            return;
          }
          if (!text || typeof text !== 'string' || text.trim().length === 0) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'text field required' }));
            return;
          }

          const msgId = randomUUID();
          const ts = new Date().toISOString();
          const authorVal = author ?? 'Bishop';

          // Yoke append (canonical format)
          const yokeEntry = [
            '',
            '',
            `## [BISHOP → PIXEL] Reply to ${in_reply_to}`,
            `**msg_id:** ${msgId}`,
            `**timestamp:** ${ts}`,
            `**in_reply_to:** ${in_reply_to}`,
            `**author:** ${authorVal}`,
            '',
            '---',
            '',
            text.trim(),
            '',
            '---',
            '',
          ].join('\n');

          // Inbox append (JSONL for fast PWA polling)
          const inboxEntry = JSON.stringify({
            msg_id: msgId,
            in_reply_to,
            ts,
            text: text.trim(),
            author: authorVal,
            read: false,
          }) + '\n';

          try {
            appendFileSync(YOKE_PATH, yokeEntry, 'utf8');
            appendFileSync(INBOX_PATH, inboxEntry, 'utf8');
            this._broadcastYokeInboxSse();
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({
              error: 'Append failed',
              detail: String(err),
            }));
            return;
          }

          res.end(JSON.stringify({
            success: true,
            msg_id: msgId,
            ts,
            in_reply_to,
            author: authorVal,
          }));
        } catch (err) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Invalid JSON', detail: String(err) }));
        }
      });
      return;
    }

    // ── GET /yoke/inbox — Bushel 42 PWA polling endpoint ─────────────────────
    if (req.method === 'GET' && url === '/yoke/inbox') {
      try {
        res.end(JSON.stringify(this._readPixelInboxPayload()));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Inbox read failed', detail: String(err) }));
      }
      return;
    }

    // ── POST /yoke/note — Bushel 41 Pixel-to-Bishop async bridge ─────────────
    // Founder leaves Bishop a note from MoneyPenny PWA; appended to Yoke channel
    // (KNIGHT_BISHOP_MESSAGES.md) which Bishop reads at next session-open.
    // Composes with B37 Phase 7 auth state (member/trial accept; degraded reject).
    if (req.method === 'POST' && url === '/yoke/note') {
      this._readBody(req, (body) => {
        try {
          const { note, urgency, tags, scope, recipient_id, recipient_name, attachment_ids } = JSON.parse(body) as {
            note: string;
            urgency?: 'low' | 'normal' | 'high';
            tags?: string[];
            scope?: 'helm' | 'family-table' | 'just-recipient' | 'public';
            recipient_id?: string;
            recipient_name?: string;
            attachment_ids?: string[];
          };
          if (!note || typeof note !== 'string' || note.trim().length === 0) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'note field required' }));
            return;
          }
          if (note.length > 8000) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'note too long (max 8000 chars)' }));
            return;
          }

          const msgId = randomUUID();
          const ts = new Date().toISOString();
          const urgencyVal = urgency ?? 'normal';
          const tagsVal = (tags ?? []).join(', ');
          const scopeVal = scope ?? 'just-recipient';
          const recipientLabel = recipient_name
            ? `${recipient_name}${recipient_id ? ` (${recipient_id.slice(0,8)})` : ''}`
            : recipient_id
              ? recipient_id.slice(0,8)
              : 'Bishop';

          // Determine Yoke header based on routing
          const yokeHeader = recipient_id
            ? `## [PIXEL → ${recipientLabel.toUpperCase()}] Founder Note via MoneyPenny (scope: ${scopeVal})`
            : '## [PIXEL → BISHOP] Founder Note via MoneyPenny';

          // Canonical Yoke message format
          const yokeEntry = [
            '',
            '',
            yokeHeader,
            `**msg_id:** ${msgId}`,
            `**timestamp:** ${ts}`,
            `**urgency:** ${urgencyVal}`,
            `**tags:** ${tagsVal || '(none)'}`,
            `**scope:** ${scopeVal}`,
            `**recipient_id:** ${recipient_id || '(bishop default)'}`,
            `**recipient_name:** ${recipient_name || 'Bishop'}`,
            '**author:** Founder (via MoneyPenny PWA)',
            '',
            '---',
            '',
            note.trim(),
            '',
            '---',
            '',
          ].join('\n');

          try {
            appendFileSync(YOKE_PATH, yokeEntry, 'utf8');
            // Bushel 45: Family Table scope notes also go to family_inbox.jsonl for recipient polling
            if (scopeVal === 'family-table' && recipient_id) {
              const familyInboxPath = resolve(
                process.env.APPDATA || process.env.HOME || '.',
                'AMPLIFY Computer',
                'family_inbox.jsonl',
              );
              const familyEntry = JSON.stringify({
                msg_id: msgId,
                ts,
                from: 'Founder',
                recipient_id,
                recipient_name: recipient_name || null,
                scope: scopeVal,
                urgency: urgencyVal,
                tags: tags || [],
                text: note.trim(),
                attachment_ids: attachment_ids || [],
                read: false,
              }) + '\n';
              appendFileSync(familyInboxPath, familyEntry, 'utf8');
            }
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({
              error: 'Yoke append failed',
              detail: String(err),
              yoke_path: YOKE_PATH,
            }));
            return;
          }

          res.end(JSON.stringify({
            success: true,
            msg_id: msgId,
            ts,
            urgency: urgencyVal,
            scope: scopeVal,
            recipient_id: recipient_id || null,
            recipient_name: recipient_name || null,
            yoke_path: YOKE_PATH,
          }));
        } catch (err) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Invalid JSON', detail: String(err) }));
        }
      });
      return;
    }

    // ── Bushel 47 #1: Read-receipts — POST /yoke/inbox/read marks Bishop reply as read ─
    if (req.method === 'POST' && url === '/yoke/inbox/read') {
      this._readBody(req, (body) => {
        try {
          const { msg_id } = JSON.parse(body) as { msg_id: string };
          if (!msg_id) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'msg_id required' }));
            return;
          }
          // Append a read-event entry; consumer (PWA) treats latest event per msg_id as canonical
          const readEntry = JSON.stringify({
            msg_id,
            event: 'read',
            ts: new Date().toISOString(),
          }) + '\n';
          appendFileSync(INBOX_PATH, readEntry, 'utf8');
          res.end(JSON.stringify({ success: true, msg_id, read_ts: new Date().toISOString() }));
        } catch (err) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Invalid JSON', detail: String(err) }));
        }
      });
      return;
    }

    // ── Bushel 46: Family attachments (Loteria-class rich content — Family Table scope only) ─
    // POST /family/attachment — body {filename, content_type, base64_data}
    if (req.method === 'POST' && url === '/family/attachment') {
      this._readBody(req, (body) => {
        try {
          const { filename, content_type, base64_data } = JSON.parse(body) as {
            filename: string;
            content_type: string;
            base64_data: string;
          };
          if (!filename || !content_type || !base64_data) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'filename, content_type, base64_data all required' }));
            return;
          }
          // Limit attachment size to 20 MB base64 (~14 MB binary)
          if (base64_data.length > 20 * 1024 * 1024) {
            res.statusCode = 413;
            res.end(JSON.stringify({ error: 'attachment too large (max 14 MB binary)' }));
            return;
          }
          if (!existsSync(ATTACHMENTS_DIR)) mkdirSync(ATTACHMENTS_DIR, { recursive: true });
          const attachmentId = randomUUID();
          // Derive extension from content_type or filename
          const extMatch = filename.match(/\.([a-zA-Z0-9]+)$/);
          const ext = extMatch ? extMatch[1].toLowerCase() : (content_type.split('/')[1] || 'bin');
          const diskPath = resolve(ATTACHMENTS_DIR, `${attachmentId}.${ext}`);
          // Write binary data
          const buf = Buffer.from(base64_data, 'base64');
          require('fs').writeFileSync(diskPath, buf);
          const ts = new Date().toISOString();
          const indexEntry = JSON.stringify({
            attachment_id: attachmentId,
            filename,
            content_type,
            size_bytes: buf.length,
            disk_path: diskPath,
            ts,
          }) + '\n';
          appendFileSync(ATTACHMENTS_INDEX, indexEntry, 'utf8');
          res.end(JSON.stringify({
            success: true,
            attachment_id: attachmentId,
            url: `/family/attachment/${attachmentId}`,
            size_bytes: buf.length,
            content_type,
          }));
        } catch (err) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Invalid attachment', detail: String(err) }));
        }
      });
      return;
    }

    // GET /family/attachment/{attachment_id} — serves binary
    if (req.method === 'GET' && url?.startsWith('/family/attachment/')) {
      try {
        const attachmentId = url.replace('/family/attachment/', '').trim();
        if (!attachmentId || attachmentId.includes('/') || attachmentId.includes('..')) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Invalid attachment_id' }));
          return;
        }
        // Look up in index for content_type + disk_path
        let entry: any = null;
        if (existsSync(ATTACHMENTS_INDEX)) {
          const raw = require('fs').readFileSync(ATTACHMENTS_INDEX, 'utf8') as string;
          for (const line of raw.split('\n')) {
            if (!line.trim()) continue;
            try {
              const e = JSON.parse(line);
              if (e.attachment_id === attachmentId) { entry = e; break; }
            } catch { continue; }
          }
        }
        if (!entry || !existsSync(entry.disk_path)) {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Attachment not found' }));
          return;
        }
        const buf = require('fs').readFileSync(entry.disk_path);
        res.setHeader('Content-Type', entry.content_type);
        res.setHeader('Content-Length', String(buf.length));
        res.setHeader('Cache-Control', 'private, max-age=3600');
        res.removeHeader('Content-Type'); // override default JSON
        res.writeHead(200, { 'Content-Type': entry.content_type });
        res.end(buf);
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Attachment serve failed', detail: String(err) }));
      }
      return;
    }

    // ── Bushel 45: Family Table inbox polling (per-recipient) ────────────────
    // GET /family/inbox?member_id=X — returns notes scoped to that family member
    if (req.method === 'GET' && url === '/family/inbox') {
      try {
        const queryStr = req.url?.split('?')[1] || '';
        const params = new URLSearchParams(queryStr);
        const memberId = params.get('member_id');
        const familyInboxPath = resolve(
          process.env.APPDATA || process.env.HOME || '.',
          'AMPLIFY Computer',
          'family_inbox.jsonl',
        );
        let entries: any[] = [];
        if (existsSync(familyInboxPath)) {
          const raw = require('fs').readFileSync(familyInboxPath, 'utf8') as string;
          entries = raw.split('\n')
            .filter((l) => l.trim().length > 0)
            .map((l) => { try { return JSON.parse(l); } catch { return null; } })
            .filter((e) => e !== null);
        }
        // Filter by recipient member_id if provided
        if (memberId) {
          entries = entries.filter((e) => e.recipient_id === memberId);
        }
        entries.reverse(); // most-recent-first
        if (entries.length > 50) entries = entries.slice(0, 50);
        res.end(JSON.stringify({
          messages: entries,
          member_id: memberId,
          as_of: new Date().toISOString(),
        }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Family inbox read failed', detail: String(err) }));
      }
      return;
    }

    // ── Bushel 44: Family Member roster (Family Table foundation) ────────────
    // Family members are paired AMPLIFY peers on local network.
    // Roster appended to family_roster.jsonl; active flag toggles inclusion.

    // POST /family/add — body {name, ip?, port?, role?}
    if (req.method === 'POST' && url === '/family/add') {
      this._readBody(req, (body) => {
        try {
          const { name, ip, port, role } = JSON.parse(body) as {
            name: string;
            ip?: string;
            port?: number;
            role?: string;
          };
          if (!name || typeof name !== 'string' || name.trim().length === 0) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'name field required' }));
            return;
          }
          const memberId = randomUUID();
          const ts = new Date().toISOString();
          const entry = {
            event: 'add',
            member_id: memberId,
            name: name.trim(),
            ip: ip || null,
            port: port || 11480,
            role: role || 'family_member',
            added_ts: ts,
            active: true,
          };
          appendFileSync(FAMILY_ROSTER_PATH, JSON.stringify(entry) + '\n', 'utf8');
          res.end(JSON.stringify({ success: true, ...entry }));
        } catch (err) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Invalid JSON', detail: String(err) }));
        }
      });
      return;
    }

    // POST /family/remove — body {member_id}
    if (req.method === 'POST' && url === '/family/remove') {
      this._readBody(req, (body) => {
        try {
          const { member_id } = JSON.parse(body) as { member_id: string };
          if (!member_id) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'member_id required' }));
            return;
          }
          const entry = {
            event: 'remove',
            member_id,
            removed_ts: new Date().toISOString(),
          };
          appendFileSync(FAMILY_ROSTER_PATH, JSON.stringify(entry) + '\n', 'utf8');
          res.end(JSON.stringify({ success: true, member_id }));
        } catch (err) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Invalid JSON', detail: String(err) }));
        }
      });
      return;
    }

    // GET /family/roster — returns active family members + online status from federation peers
    if (req.method === 'GET' && url === '/family/roster') {
      try {
        const members = new Map<string, any>();
        if (existsSync(FAMILY_ROSTER_PATH)) {
          const raw = require('fs').readFileSync(FAMILY_ROSTER_PATH, 'utf8') as string;
          for (const line of raw.split('\n')) {
            if (!line.trim()) continue;
            let entry: any;
            try { entry = JSON.parse(line); } catch { continue; }
            if (entry.event === 'add') {
              members.set(entry.member_id, { ...entry, active: true });
            } else if (entry.event === 'remove' && members.has(entry.member_id)) {
              const m = members.get(entry.member_id);
              m.active = false;
              members.set(entry.member_id, m);
            }
          }
        }
        // Cross-reference with federation peer registry for online/offline
        const fedPeers = this.federation?.getStatus().peers ?? [];
        const peerIPs = new Set(fedPeers.map((p) => p.address));
        const roster = Array.from(members.values())
          .filter((m) => m.active)
          .map((m) => ({
            member_id: m.member_id,
            name: m.name,
            ip: m.ip,
            port: m.port,
            role: m.role,
            added_ts: m.added_ts,
            online: m.ip ? peerIPs.has(m.ip) : false,
          }));
        res.end(JSON.stringify({ roster, as_of: new Date().toISOString() }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Roster read failed', detail: String(err) }));
      }
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
