/**
 * Passive-Surveillance Logger — Substrate-API Gateway
 * BP044 W1 · Canon: Coffee BP043 §6 anchor #6
 * Class: Structural-code-class · invariant logging + informative-silence pattern
 *
 * Federal Body Cam doctrine inversion:
 *   the substrate logs the surveilors — they do NOT log the substrate.
 *
 * BLOOD RULE — INFORMATIVE SILENCE:
 *   This module NEVER emits any response header, body, or side-channel signal
 *   that discloses logging existence to the queryer.
 *
 * Storage:
 *   ~/.lb_substrate/passive_surveillance/
 *     raw_queries.jsonl         — append-only query event log
 *     gap_alerts.jsonl          — gap-detection alerts (Bishop + Watchdog)
 *     baseline_model.json       — per-endpoint throughput baseline
 *     audit_access.jsonl        — every Founder/Bishop read of this log is itself logged
 *
 * What gets logged:
 *   - Query frequency per account / IP / agent / timestamp / endpoint / legal-basis / referer-class
 *   - Failed-auth attempts at substrate-class endpoints
 *   - Scrape-pattern detection (programmatic vs human-rhythm)
 *   - Cross-account pattern fingerprints (same actor across multiple accounts)
 *   - Gap events: absence-of-expected-query when baseline establishes a pattern
 *
 * What does NOT get logged:
 *   - Member content · member private data
 *   - Member queries on their OWN data (per cooperative-substrate-class privacy invariant)
 *   - Anything that would violate Harper Guild mediation class
 *
 * Retention: 7 years default · Founder-direct purge path for legitimate-cause class
 * Audit-recursive: every Founder/Bishop query of this log is itself logged (acceptance criterion 6)
 */

import {
  existsSync,
  mkdirSync,
  appendFileSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { resolve } from 'path';
import { homedir } from 'os';
import { createHash } from 'crypto';
import type { IncomingMessage } from 'http';

// ─── Paths ────────────────────────────────────────────────────────────────────

const SURV_BASE = resolve(homedir(), '.lb_substrate', 'passive_surveillance');
const RAW_QUERIES_PATH   = resolve(SURV_BASE, 'raw_queries.jsonl');
const GAP_ALERTS_PATH    = resolve(SURV_BASE, 'gap_alerts.jsonl');
const BASELINE_PATH      = resolve(SURV_BASE, 'baseline_model.json');
const AUDIT_ACCESS_PATH  = resolve(SURV_BASE, 'audit_access.jsonl');

/** 7-year retention as milliseconds. */
const RETENTION_MS = 7 * 365.25 * 24 * 60 * 60 * 1000;

/** Endpoints that are substrate-public (i.e., callable by external parties). */
const SUBSTRATE_PUBLIC_ENDPOINTS = new Set([
  '/yoke/portal/search',
  '/yoke/portal/enroll',
  '/yoke/portal/agency_mou',
  '/yoke/portal/sessions',
  '/yoke/ip_ledger/owner',
  '/yoke/ip_ledger/history',
  '/yoke/ip_ledger/dispute',
  '/yoke/ip_ledger/register',
  '/yoke/ip_ledger/stats',
  '/substrate/query',
  '/substrate/write',
  '/mode',
  '/mode/force',
]);

/** Endpoints that are internal-only (member self-service) — excluded from surveillance log. */
const MEMBER_SELF_SERVICE_ENDPOINTS = new Set([
  '/yoke/stream',
  '/mobile',
  '/manifest.json',
  '/sw.js',
  '/icon.svg',
  '/health',
  '/healthz',
]);

// ─── Schema ───────────────────────────────────────────────────────────────────

/** Referer class derived from request headers. */
export type RefererClass =
  | 'direct'          // No referer or localhost-origin
  | 'browser-manual'  // Human-rhythm browser request
  | 'api-client'      // Programmatic / headless client (no Accept: text/html)
  | 'scraper'         // High-frequency, no User-Agent, or known scraper pattern
  | 'law-enforcement' // Carries X-LB-LE-Token or known LE agency IP range
  | 'unknown';

/** Scrape-pattern class. */
export type RhythmClass = 'human' | 'programmatic' | 'burst' | 'unknown';

/** A single surveillance query event. */
export interface SurveillanceEvent {
  event_id:       string;          // UUID4
  ts:             string;          // ISO 8601
  endpoint:       string;          // URL path (no query string)
  method:         string;          // GET | POST | …
  ip:             string;          // Remote IP (anonymized last octet for IPv4)
  user_agent:     string;          // Truncated to 200 chars; "[none]" if absent
  referer_class:  RefererClass;
  rhythm_class:   RhythmClass;
  account_id?:    string;          // If X-LB-Account-ID header present
  legal_basis?:   string;          // If X-LB-Legal-Basis header present
  le_token_hash?: string;          // SHA-256 first 16 chars of LE token (never full token)
  status_code:    number;          // HTTP response code
  is_failed_auth: boolean;
}

/** Gap-detection alert. */
export interface GapAlert {
  alert_id:    string;
  ts:          string;
  endpoint:    string;
  gap_type:    'extended_silence' | 'burst_after_silence' | 'pattern_shift';
  actor_ip:    string;
  actor_agent: string;
  baseline_rph: number;           // Requests-per-hour baseline
  observed_gap_hours: number;
  detail:      string;
  dispatched_to: string[];        // ['bishop', 'watchdog']
}

/** Per-endpoint throughput baseline for gap-detection. */
interface EndpointBaseline {
  endpoint:         string;
  sample_count:     number;
  mean_rph:         number;       // Requests per hour
  p95_gap_hours:    number;       // 95th percentile inter-request gap in hours
  last_seen:        string;       // ISO 8601
  last_updated:     string;       // ISO 8601
}

interface BaselineModel {
  version:   number;
  updated:   string;
  endpoints: Record<string, EndpointBaseline>;
}

/** Audit access record — every Founder/Bishop read of this log. */
export interface AuditAccessRecord {
  audit_id:   string;
  ts:         string;
  accessor:   string;   // 'founder' | 'bishop' | 'watchdog' | 'knight'
  action:     string;   // 'read_raw_queries' | 'read_gap_alerts' | 'read_baseline' | 'purge_request'
  session_id: string;
  reason?:    string;
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function ensureDir(): void {
  if (!existsSync(SURV_BASE)) mkdirSync(SURV_BASE, { recursive: true });
}

function uuid4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Anonymize last IPv4 octet; pass IPv6 through masked. */
function anonymizeIp(raw: string): string {
  const v4 = raw.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3})\.\d{1,3}$/);
  if (v4) return `${v4[1]}.0`;
  if (raw.includes(':')) return raw.replace(/:[0-9a-f]+$/, ':0000');
  return raw;
}

function classifyReferer(req: IncomingMessage): RefererClass {
  const ua    = (req.headers['user-agent'] ?? '') as string;
  const accept = (req.headers['accept'] ?? '') as string;
  const leToken = req.headers['x-lb-le-token'] as string | undefined;

  if (leToken) return 'law-enforcement';

  const uaLower = ua.toLowerCase();
  if (
    uaLower.includes('wget') ||
    uaLower.includes('curl') ||
    uaLower.includes('scrapy') ||
    uaLower.includes('python-requests') ||
    uaLower.includes('go-http-client') ||
    uaLower.includes('okhttp') ||
    uaLower.includes('java/')
  ) {
    return 'scraper';
  }

  if (!ua || ua === '-') return 'unknown';

  if (accept.includes('text/html')) return 'browser-manual';
  if (!accept) return 'api-client';

  return 'direct';
}

function classifyRhythm(ip: string, _endpoint: string): RhythmClass {
  const recentCounts = _recentIpCounts.get(ip) ?? 0;
  if (recentCounts > 30) return 'burst';    // >30 requests in sliding window
  if (recentCounts > 5)  return 'programmatic';
  return 'human';
}

/** Sliding-window request counter per IP (last 60 seconds). */
const _recentIpCounts = new Map<string, number>();
const _recentIpTs     = new Map<string, number[]>();

function trackIpFrequency(ip: string): void {
  const now = Date.now();
  const window = 60_000; // 1 minute
  const times = (_recentIpTs.get(ip) ?? []).filter(t => now - t < window);
  times.push(now);
  _recentIpTs.set(ip, times);
  _recentIpCounts.set(ip, times.length);
}

// ─── Baseline model ───────────────────────────────────────────────────────────

function loadBaseline(): BaselineModel {
  if (!existsSync(BASELINE_PATH)) {
    return { version: 1, updated: new Date().toISOString(), endpoints: {} };
  }
  try {
    return JSON.parse(readFileSync(BASELINE_PATH, 'utf8')) as BaselineModel;
  } catch {
    return { version: 1, updated: new Date().toISOString(), endpoints: {} };
  }
}

function saveBaseline(model: BaselineModel): void {
  writeFileSync(BASELINE_PATH, JSON.stringify(model, null, 2), 'utf8');
}

/**
 * Update per-endpoint baseline with new observation.
 * Uses exponential moving average for mean_rph + tracks last seen for gap detection.
 */
function updateBaseline(endpoint: string): void {
  const model = loadBaseline();
  const now = new Date().toISOString();
  const existing = model.endpoints[endpoint];

  if (!existing) {
    model.endpoints[endpoint] = {
      endpoint,
      sample_count: 1,
      mean_rph: 1,
      p95_gap_hours: 24,
      last_seen: now,
      last_updated: now,
    };
  } else {
    const gapMs = Date.now() - new Date(existing.last_seen).getTime();
    const gapHours = gapMs / 3_600_000;

    // Exponential moving average (alpha = 0.1)
    const alpha = 0.1;
    const instantRph = gapHours > 0 ? (1 / gapHours) : existing.mean_rph;
    existing.mean_rph = alpha * instantRph + (1 - alpha) * existing.mean_rph;

    // Update p95 gap via running approximation
    if (gapHours > existing.p95_gap_hours) {
      existing.p95_gap_hours = gapHours * 0.95 + existing.p95_gap_hours * 0.05;
    } else {
      existing.p95_gap_hours = existing.p95_gap_hours * 0.99;
    }

    existing.sample_count += 1;
    existing.last_seen = now;
    existing.last_updated = now;

    model.endpoints[endpoint] = existing;
  }

  model.updated = now;
  try {
    saveBaseline(model);
  } catch {
    /* non-fatal — baseline drift is acceptable */
  }
}

/**
 * Check if current gap for a given endpoint exceeds the 95th-percentile threshold.
 * Called on timer (every 15 minutes) to detect extended silence.
 *
 * Gap-detection IS the signal — the absence of an expected query pattern.
 */
export function checkGaps(): GapAlert[] {
  const alerts: GapAlert[] = [];
  const model = loadBaseline();
  const now = Date.now();

  for (const baseline of Object.values(model.endpoints)) {
    if (baseline.sample_count < 10) continue; // need enough data

    const lastSeenMs = new Date(baseline.last_seen).getTime();
    const gapHours = (now - lastSeenMs) / 3_600_000;

    if (gapHours > baseline.p95_gap_hours * 1.5) {
      const alert: GapAlert = {
        alert_id: uuid4(),
        ts: new Date().toISOString(),
        endpoint: baseline.endpoint,
        gap_type: 'extended_silence',
        actor_ip: '[all]',
        actor_agent: '[all]',
        baseline_rph: baseline.mean_rph,
        observed_gap_hours: gapHours,
        detail: `Endpoint ${baseline.endpoint} silent for ${gapHours.toFixed(1)}h — expected ≤${(baseline.p95_gap_hours * 1.5).toFixed(1)}h (p95 × 1.5). Possible evasion or service disruption.`,
        dispatched_to: ['bishop', 'watchdog'],
      };
      alerts.push(alert);

      ensureDir();
      try {
        appendFileSync(GAP_ALERTS_PATH, JSON.stringify(alert) + '\n', 'utf8');
      } catch { /* non-fatal */ }

      dispatchGapAlertToBishop(alert);
    }
  }

  return alerts;
}

/** Dispatch gap alert to Bishop via KNIGHT_BISHOP_MESSAGES.md yoke path. */
function dispatchGapAlertToBishop(alert: GapAlert): void {
  const yokePath = process.env.YOKE_PATH ?? resolve(
    process.env.HOMEDRIVE && process.env.HOMEPATH
      ? `${process.env.HOMEDRIVE}${process.env.HOMEPATH}`
      : process.env.HOME ?? '.',
    'Documents',
    'LianaBanyanPlatform',
    'KNIGHT_BISHOP_MESSAGES.md',
  );

  const timestamp = new Date().toISOString();
  const entry =
    `\n---\n` +
    `<!-- passive-surveillance-alert ${timestamp} -->\n` +
    `**[WATCHDOG · GAP-DETECTION ALERT · ${timestamp}]**\n\n` +
    `- **Alert type:** ${alert.gap_type}\n` +
    `- **Endpoint:** \`${alert.endpoint}\`\n` +
    `- **Gap observed:** ${alert.observed_gap_hours.toFixed(1)}h (baseline: ${alert.baseline_rph.toFixed(2)} rph)\n` +
    `- **Detail:** ${alert.detail}\n` +
    `- **Alert ID:** ${alert.alert_id}\n\n` +
    `_Passive Surveillance Logger — informative-silence class. Do not surface to queryers._\n`;

  try {
    appendFileSync(yokePath, entry, 'utf8');
  } catch {
    /* Yoke path may not be accessible from this context — gap alert preserved in gap_alerts.jsonl */
  }

  // Also write to watchdog moneypenny alerts path for Watchdog Scribe integration
  const watchdogAlertsPath = resolve(homedir(), '.claude', 'state', 'watchdog', 'passive_surveillance_alerts.jsonl');
  try {
    mkdirSync(resolve(watchdogAlertsPath, '..'), { recursive: true });
    appendFileSync(watchdogAlertsPath, JSON.stringify(alert) + '\n', 'utf8');
  } catch { /* non-fatal */ }
}

// ─── Main: logRequest ─────────────────────────────────────────────────────────

/**
 * Log a substrate-API gateway request.
 * Called as the FIRST operation in _handleRequest, before any routing.
 *
 * INFORMATIVE SILENCE: this function never modifies `req` or `res`.
 * It returns immediately; all I/O is best-effort and async-safe.
 */
export function logRequest(
  req: IncomingMessage,
  statusCode: number,
  accountId?: string,
): void {
  const url = req.url?.split('?')[0] ?? '/';

  // Member self-service endpoints are OUT of scope per privacy invariant
  if (MEMBER_SELF_SERVICE_ENDPOINTS.has(url)) return;

  // OPTIONS preflight — not substantive
  if (req.method === 'OPTIONS') return;

  const ip = anonymizeIp(
    (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ??
    req.socket?.remoteAddress ??
    '0.0.0.0',
  );

  trackIpFrequency(ip);

  const ua = ((req.headers['user-agent'] ?? '[none]') as string).slice(0, 200);
  const refererClass = classifyReferer(req);
  const rhythmClass  = classifyRhythm(ip, url);
  const leToken      = req.headers['x-lb-le-token'] as string | undefined;
  const legalBasis   = req.headers['x-lb-legal-basis'] as string | undefined;

  const event: SurveillanceEvent = {
    event_id:       uuid4(),
    ts:             new Date().toISOString(),
    endpoint:       url,
    method:         req.method ?? 'UNKNOWN',
    ip,
    user_agent:     ua,
    referer_class:  refererClass,
    rhythm_class:   rhythmClass,
    account_id:     accountId,
    legal_basis:    legalBasis,
    le_token_hash:  leToken
      ? createHash('sha256').update(leToken).digest('hex').slice(0, 16)
      : undefined,
    status_code:    statusCode,
    is_failed_auth: statusCode === 401 || statusCode === 403,
  };

  ensureDir();

  try {
    appendFileSync(RAW_QUERIES_PATH, JSON.stringify(event) + '\n', 'utf8');
  } catch {
    /* non-fatal: never let logging break the request path */
  }

  // Update baseline model for gap detection
  if (SUBSTRATE_PUBLIC_ENDPOINTS.has(url)) {
    try {
      updateBaseline(url);
    } catch {
      /* non-fatal */
    }
  }
}

// ─── Audit access logging (acceptance criterion 6) ───────────────────────────

/**
 * Log every Founder or Bishop access to the surveillance log.
 * Recursive transparency — cooperative-class self-binding.
 *
 * MUST be called by any tool that reads raw_queries.jsonl or gap_alerts.jsonl.
 */
export function logAuditAccess(
  accessor: 'founder' | 'bishop' | 'watchdog' | 'knight',
  action: AuditAccessRecord['action'],
  sessionId: string,
  reason?: string,
): void {
  const record: AuditAccessRecord = {
    audit_id:   uuid4(),
    ts:         new Date().toISOString(),
    accessor,
    action,
    session_id: sessionId,
    reason,
  };

  ensureDir();
  try {
    appendFileSync(AUDIT_ACCESS_PATH, JSON.stringify(record) + '\n', 'utf8');
  } catch { /* non-fatal */ }
}

// ─── Query interface (Founder/Bishop-only) ────────────────────────────────────

export interface SurveillanceQueryOptions {
  endpoint?:       string;
  ip?:             string;
  referer_class?:  RefererClass;
  since?:          string;   // ISO 8601
  limit?:          number;
  accessor:        'founder' | 'bishop' | 'watchdog' | 'knight';
  session_id:      string;
  reason?:         string;
}

/**
 * Query the surveillance log.
 * ALWAYS logs the access itself before returning results.
 * NEVER callable from external endpoints — internal Founder/Bishop tool only.
 */
export function querySurveillanceLog(opts: SurveillanceQueryOptions): SurveillanceEvent[] {
  logAuditAccess(opts.accessor, 'read_raw_queries', opts.session_id, opts.reason);

  if (!existsSync(RAW_QUERIES_PATH)) return [];

  const since = opts.since ? new Date(opts.since).getTime() : 0;
  const limit  = Math.min(opts.limit ?? 500, 2000);

  const raw = readFileSync(RAW_QUERIES_PATH, 'utf8');
  const all: SurveillanceEvent[] = raw
    .split('\n')
    .filter(l => l.trim())
    .map(l => {
      try { return JSON.parse(l) as SurveillanceEvent; } catch { return null; }
    })
    .filter((e): e is SurveillanceEvent => e !== null)
    .filter(e => {
      if (since && new Date(e.ts).getTime() < since) return false;
      if (opts.endpoint && e.endpoint !== opts.endpoint) return false;
      if (opts.ip && e.ip !== opts.ip) return false;
      if (opts.referer_class && e.referer_class !== opts.referer_class) return false;
      return true;
    });

  return all.slice(-limit);
}

/** Query gap alerts. Logs the access. */
export function queryGapAlerts(opts: Pick<SurveillanceQueryOptions, 'accessor' | 'session_id' | 'reason'>): GapAlert[] {
  logAuditAccess(opts.accessor, 'read_gap_alerts', opts.session_id, opts.reason);

  if (!existsSync(GAP_ALERTS_PATH)) return [];

  const raw = readFileSync(GAP_ALERTS_PATH, 'utf8');
  return raw
    .split('\n')
    .filter(l => l.trim())
    .map(l => {
      try { return JSON.parse(l) as GapAlert; } catch { return null; }
    })
    .filter((e): e is GapAlert => e !== null);
}

// ─── Retention enforcement ────────────────────────────────────────────────────

/**
 * Prune events older than RETENTION_MS (7 years).
 * Safe to run on a schedule (daily cron-class).
 * Logs the access before performing the purge.
 *
 * Founder-direct purge (legitimate-cause override):
 *   Pass `force_before_iso` to purge everything before that ISO timestamp.
 */
export function pruneOldEvents(
  accessor: 'founder' | 'bishop',
  sessionId: string,
  reason: string,
  forceBeforeIso?: string,
): { pruned: number; retained: number } {
  logAuditAccess(accessor, 'purge_request', sessionId, reason);

  if (!existsSync(RAW_QUERIES_PATH)) return { pruned: 0, retained: 0 };

  const cutoff = forceBeforeIso
    ? new Date(forceBeforeIso).getTime()
    : Date.now() - RETENTION_MS;

  const raw = readFileSync(RAW_QUERIES_PATH, 'utf8');
  const lines = raw.split('\n').filter(l => l.trim());

  const kept: string[] = [];
  let pruned = 0;

  for (const line of lines) {
    try {
      const ev = JSON.parse(line) as SurveillanceEvent;
      if (new Date(ev.ts).getTime() < cutoff) {
        pruned++;
      } else {
        kept.push(line);
      }
    } catch {
      pruned++; // drop malformed lines
    }
  }

  writeFileSync(RAW_QUERIES_PATH, kept.join('\n') + (kept.length ? '\n' : ''), 'utf8');
  return { pruned, retained: kept.length };
}

// ─── Gap-detection scheduler ──────────────────────────────────────────────────

let _gapCheckInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Start the periodic gap-detection check.
 * Called once from substrate_api.ts during server start.
 * Interval: 15 minutes.
 */
export function startGapDetectionScheduler(): void {
  if (_gapCheckInterval) return;
  _gapCheckInterval = setInterval(() => {
    try {
      checkGaps();
    } catch {
      /* non-fatal */
    }
  }, 15 * 60 * 1000);

  // Don't block process exit
  _gapCheckInterval.unref?.();
}

/** Stop the scheduler (for clean test teardown). */
export function stopGapDetectionScheduler(): void {
  if (_gapCheckInterval) {
    clearInterval(_gapCheckInterval);
    _gapCheckInterval = null;
  }
}

// ─── Exports summary ──────────────────────────────────────────────────────────

export {
  SURV_BASE,
  RAW_QUERIES_PATH,
  GAP_ALERTS_PATH,
  BASELINE_PATH,
  AUDIT_ACCESS_PATH,
  SUBSTRATE_PUBLIC_ENDPOINTS,
  RETENTION_MS,
};
