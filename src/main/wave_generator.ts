// AMPLIFY Computer — Wave Generator Daemon (B61 Phase A / LB-STACK-0164 §1)
// Implements the six core operations of canon §1:
//   1. Receive   — POST /yoke/wave/dispatch
//   2. Decompose — inline SEG array (templates arrive Phase B)
//   3. Dispatch  — N parallel Yoke calls to Phase 0 Pawn/Rook endpoints
//   4. Watch     — per-SEG progress log in wave_active/{wave_id}/seg_NN_progress/
//   5. Synthesize — synthesis SEG (claude-sonnet-4-5 default) with all N receipts
//   6. Report    — HMAC-bound synthesis_receipt.eblet.md in wave_archive/{wave_id}/
//
// Substrate paths (L2 per canon §5):
//   ~/.lb_substrate/wave_queue/     — queued requests
//   ~/.lb_substrate/wave_active/    — in-flight waves + per-SEG progress
//   ~/.lb_substrate/wave_archive/   — completed waves + synthesis Eblet + HMAC
//   ~/.lb_substrate/wave_templates/ — versioned template defs (Phase B placeholder)
//
// Crash-restart resilience (canon §9): init scans wave_active/ and marks any
// waves that were mid-flight as 'aborted' (async HTTP calls cannot be resumed).
//
// Canon anchor: LB-STACK-0164 §1, §5, §6, §9, §10

import {
  mkdirSync,
  existsSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  appendFileSync,
} from 'fs';
import { resolve } from 'path';
import { homedir } from 'os';
import { randomUUID, createHmac, createHash } from 'crypto';

// ─── Substrate paths ──────────────────────────────────────────────────────────

export const LB_SUBSTRATE_ROOT =
  process.env.LB_SUBSTRATE_ROOT ?? resolve(homedir(), '.lb_substrate');

export const WAVE_QUEUE_DIR     = resolve(LB_SUBSTRATE_ROOT, 'wave_queue');
export const WAVE_ACTIVE_DIR    = resolve(LB_SUBSTRATE_ROOT, 'wave_active');
export const WAVE_ARCHIVE_DIR   = resolve(LB_SUBSTRATE_ROOT, 'wave_archive');
export const WAVE_TEMPLATES_DIR = resolve(LB_SUBSTRATE_ROOT, 'wave_templates');

/** Yoke server base (Phase 0 endpoints). */
const YOKE_BASE = `http://127.0.0.1:${process.env.SUBSTRATE_API_PORT ?? '11480'}`;

/** HMAC signing key for wave receipts. Rotate via env or leave at default. */
const WAVE_HMAC_KEY =
  process.env.LB_WAVE_HMAC_KEY ?? 'lb-wave-hmac-phase-a-default-key';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SegRecipient = 'pawn' | 'rook' | 'knight';
export type WaveStatus   = 'queued' | 'running' | 'synthesizing' | 'complete' | 'aborted';
export type SegStatus    = 'pending' | 'dispatched' | 'done' | 'error';

export interface SegConfig {
  /** Short identifier — e.g. "seg_01". Generated if omitted. */
  seg_id?: string;
  recipient: SegRecipient;
  prompt: string;
  /** Optional context messages forwarded to Pawn/Rook. */
  context_msgs?: Array<{ role: string; content: string }>;
}

export interface WaveRequest {
  /** Caller-supplied; generated if absent. */
  wave_id?: string;
  /** Human-readable label / canon anchor. */
  anchor: string;
  /** Phase A: inline decomposition = pre-formed SEG array. */
  segs: SegConfig[];
  /**
   * Synthesis prompt sent to the synthesis SEG.
   * Use `{receipts}` as the placeholder for the concatenated SEG replies.
   * Defaults to a standard summary template.
   */
  synthesis_prompt?: string;
  /** Override synthesis SEG recipient. Default: 'knight' (Sonnet 4.6). */
  synthesis_recipient?: SegRecipient;
}

export interface SegProgress {
  seg_id: string;
  recipient: SegRecipient;
  status: SegStatus;
  dispatch_id?: string;
  started_at: string;
  done_at?: string;
  reply?: string;
  error?: string;
}

export interface Wave {
  wave_id: string;
  anchor: string;
  request: WaveRequest;
  status: WaveStatus;
  segs: SegProgress[];
  created_at: string;
  started_at?: string;
  synthesizing_at?: string;
  completed_at?: string;
  synthesis_text?: string;
  synthesis_receipt_path?: string;
  hmac?: string;
  error?: string;
  /** Path to this wave's active directory (during running) or archive dir (after complete). */
  dir?: string;
}

// ─── In-memory store ──────────────────────────────────────────────────────────

const _waves = new Map<string, Wave>();

// ─── Filesystem helpers ───────────────────────────────────────────────────────

function ensureSubstrateDirs(): void {
  for (const d of [WAVE_QUEUE_DIR, WAVE_ACTIVE_DIR, WAVE_ARCHIVE_DIR, WAVE_TEMPLATES_DIR]) {
    if (!existsSync(d)) mkdirSync(d, { recursive: true });
  }
}

function waveQueuePath(waveId: string): string {
  return resolve(WAVE_QUEUE_DIR, `${waveId}.wave.json`);
}

function waveActivePath(waveId: string): string {
  return resolve(WAVE_ACTIVE_DIR, waveId);
}

function waveArchivePath(waveId: string): string {
  return resolve(WAVE_ARCHIVE_DIR, waveId);
}

function saveWaveJson(wave: Wave): void {
  const dir = wave.status === 'complete' || wave.status === 'aborted'
    ? waveArchivePath(wave.wave_id)
    : waveActivePath(wave.wave_id);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'wave.json'), JSON.stringify(wave, null, 2), 'utf8');
}

function logSegProgress(wave: Wave, seg: SegProgress, event: string): void {
  const activeDir = waveActivePath(wave.wave_id);
  const segDir    = resolve(activeDir, `${seg.seg_id}_progress`);
  if (!existsSync(segDir)) mkdirSync(segDir, { recursive: true });
  const line = JSON.stringify({ event, seg_id: seg.seg_id, status: seg.status, ts: new Date().toISOString() });
  appendFileSync(resolve(segDir, 'events.jsonl'), line + '\n', 'utf8');
}

function hmacSign(payload: string): string {
  return createHmac('sha256', WAVE_HMAC_KEY).update(payload, 'utf8').digest('hex');
}

function contentSha256(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex').slice(0, 32);
}

// ─── Operation 1 — RECEIVE / INIT ─────────────────────────────────────────────

/**
 * Crash-restart resilience (canon §9).
 * On startup: load all waves from disk. Any that were `running` or `synthesizing`
 * (mid-flight HTTP calls that can't be resumed) are marked `aborted`.
 */
export function initWaveGenerator(): void {
  ensureSubstrateDirs();

  // Scan wave_active/ for abandoned waves
  const activeEntries = readdirSync(WAVE_ACTIVE_DIR);
  for (const entry of activeEntries) {
    const waveJsonPath = resolve(WAVE_ACTIVE_DIR, entry, 'wave.json');
    if (!existsSync(waveJsonPath)) continue;
    try {
      const wave = JSON.parse(readFileSync(waveJsonPath, 'utf8')) as Wave;
      if (wave.status === 'running' || wave.status === 'synthesizing') {
        wave.status = 'aborted';
        wave.error  = 'aborted on daemon restart (in-flight waves cannot be resumed)';
        // Move to archive
        const archiveDir = waveArchivePath(wave.wave_id);
        if (!existsSync(archiveDir)) mkdirSync(archiveDir, { recursive: true });
        writeFileSync(resolve(archiveDir, 'wave.json'), JSON.stringify(wave, null, 2), 'utf8');
      }
      _waves.set(wave.wave_id, wave);
    } catch {
      // skip malformed entries
    }
  }

  // Also load completed waves from archive (for status queries)
  const archiveEntries = readdirSync(WAVE_ARCHIVE_DIR);
  for (const entry of archiveEntries) {
    if (_waves.has(entry)) continue;
    const waveJsonPath = resolve(WAVE_ARCHIVE_DIR, entry, 'wave.json');
    if (!existsSync(waveJsonPath)) continue;
    try {
      const wave = JSON.parse(readFileSync(waveJsonPath, 'utf8')) as Wave;
      _waves.set(wave.wave_id, wave);
    } catch {
      // skip malformed entries
    }
  }

  console.log(`[wave-generator] init complete — ${_waves.size} wave(s) loaded from substrate`);
}

// ─── Operation 2 — DECOMPOSE ──────────────────────────────────────────────────

/**
 * Phase A: inline decomposition — normalise the incoming `segs` array.
 * Phase B: template expansion (not implemented here).
 */
function decomposeRequest(req: WaveRequest): SegProgress[] {
  return req.segs.map((s, i) => ({
    seg_id:   s.seg_id ?? `seg_${String(i + 1).padStart(2, '0')}`,
    recipient: s.recipient,
    status:    'pending' as const,
    started_at: new Date().toISOString(),
  }));
}

// ─── Operation 3 — DISPATCH (per-SEG) ────────────────────────────────────────

/**
 * Dispatch one SEG via the appropriate Phase 0 Yoke endpoint.
 * Returns the raw reply text.
 */
async function dispatchSeg(
  seg: SegProgress,
  segConfig: SegConfig,
  waveId: string,
): Promise<string> {
  const dispatchId = randomUUID();
  seg.dispatch_id  = dispatchId;
  seg.status       = 'dispatched';

  if (seg.recipient === 'pawn') {
    const body = JSON.stringify({
      dispatch_id: dispatchId,
      session:     `wave-${waveId}`,
      prompt:      segConfig.prompt,
      context_msgs: segConfig.context_msgs ?? [],
    });
    const res  = await fetch(`${YOKE_BASE}/yoke/pawn/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    if (!res.ok) throw new Error(`Pawn dispatch HTTP ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as { reply?: string; error?: string };
    if (data.error) throw new Error(`Pawn dispatch error: ${data.error}`);
    return data.reply ?? '(no reply)';
  }

  if (seg.recipient === 'rook') {
    const body = JSON.stringify({
      dispatch_id: dispatchId,
      session:     `wave-${waveId}`,
      prompt:      segConfig.prompt,
    });
    const res  = await fetch(`${YOKE_BASE}/yoke/rook/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    if (!res.ok) throw new Error(`Rook dispatch HTTP ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as { reply?: string; error?: string };
    if (data.error) throw new Error(`Rook dispatch error: ${data.error}`);
    return data.reply ?? '(no reply)';
  }

  if (seg.recipient === 'knight') {
    // Knight = Anthropic claude-sonnet-4-5 (Sonnet 4.6 in marketing)
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set for knight SEG');
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-5',
        max_tokens: 2048,
        messages:   [{ role: 'user', content: segConfig.prompt }],
      }),
    });
    if (!res.ok) throw new Error(`Knight dispatch HTTP ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as { content?: Array<{ text?: string }>; error?: { message?: string } };
    if (data.error) throw new Error(`Knight dispatch error: ${data.error.message}`);
    return data.content?.[0]?.text ?? '(no reply)';
  }

  throw new Error(`Unknown SEG recipient: ${seg.recipient as string}`);
}

// ─── Operations 4–6 — WATCH / SYNTHESIZE / REPORT (wave lifecycle) ────────────

const DEFAULT_SYNTHESIS_PROMPT =
  'You are a synthesis engine. The following SEG (sub-execution-group) replies have been ' +
  'collected from a parallel wave dispatch. Synthesize them into a coherent, structured summary.\n\n' +
  '--- SEG RECEIPTS ---\n{receipts}\n--- END RECEIPTS ---\n\n' +
  'Provide a synthesis that integrates all SEG outputs.';

async function runWaveLifecycle(wave: Wave, req: WaveRequest): Promise<void> {
  // ── RUNNING: Operation 4 — WATCH (parallel dispatch + progress tracking) ──
  wave.status     = 'running';
  wave.started_at = new Date().toISOString();
  saveWaveJson(wave);

  const segConfigs = req.segs.map((s, i) => ({
    ...s,
    seg_id: wave.segs[i]!.seg_id,
  }));

  // Fire all SEG dispatches in parallel
  const dispatchPromises = wave.segs.map((seg, i) => {
    logSegProgress(wave, seg, 'STARTED');
    return dispatchSeg(seg, segConfigs[i]!, wave.wave_id)
      .then((reply) => {
        seg.status  = 'done';
        seg.reply   = reply;
        seg.done_at = new Date().toISOString();
        logSegProgress(wave, seg, 'DONE');
        saveWaveJson(wave);
      })
      .catch((err: unknown) => {
        seg.status  = 'error';
        seg.error   = String(err);
        seg.done_at = new Date().toISOString();
        logSegProgress(wave, seg, 'ERROR');
        saveWaveJson(wave);
      });
  });

  await Promise.all(dispatchPromises);

  const allDone = wave.segs.every(s => s.status === 'done' || s.status === 'error');
  if (!allDone) {
    wave.status = 'aborted';
    wave.error  = 'not all SEGs completed';
    saveWaveJson(wave);
    _waves.set(wave.wave_id, wave);
    return;
  }

  // ── SYNTHESIZING: Operation 5 — SYNTHESIZE ───────────────────────────────
  wave.status          = 'synthesizing';
  wave.synthesizing_at = new Date().toISOString();
  saveWaveJson(wave);

  const receiptsBlock = wave.segs
    .map(s =>
      `[${s.seg_id}] (${s.recipient}) ${s.status === 'done' ? s.reply : `ERROR: ${s.error}`}`,
    )
    .join('\n\n');

  const synthPromptTemplate = req.synthesis_prompt ?? DEFAULT_SYNTHESIS_PROMPT;
  const synthPrompt         = synthPromptTemplate.replace('{receipts}', receiptsBlock);
  const synthRecipient      = req.synthesis_recipient ?? 'knight';
  const synthSegId          = 'seg_synth';

  const synthSeg: SegProgress = {
    seg_id:     synthSegId,
    recipient:  synthRecipient,
    status:     'pending',
    started_at: new Date().toISOString(),
  };

  let synthesisText = '';
  try {
    const synthSegConfig: SegConfig = {
      seg_id:    synthSegId,
      recipient: synthRecipient,
      prompt:    synthPrompt,
    };
    synthSeg.status = 'dispatched';
    synthesisText   = await dispatchSeg(synthSeg, synthSegConfig, wave.wave_id);
    synthSeg.status  = 'done';
    synthSeg.reply   = synthesisText;
    synthSeg.done_at = new Date().toISOString();
  } catch (err: unknown) {
    synthSeg.status  = 'error';
    synthSeg.error   = String(err);
    synthSeg.done_at = new Date().toISOString();
    synthesisText    = `[synthesis error: ${String(err)}]`;
  }

  wave.synthesis_text = synthesisText;

  // ── COMPLETE: Operation 6 — REPORT ────────────────────────────────────────
  wave.status       = 'complete';
  wave.completed_at = new Date().toISOString();

  // Build the HMAC-signed synthesis_receipt.eblet.md
  const ebletContent = buildEblet(wave, synthSeg);
  const ebletHmac    = hmacSign(ebletContent);
  wave.hmac          = ebletHmac;

  // Write to wave_archive/{wave_id}/
  const archiveDir = waveArchivePath(wave.wave_id);
  if (!existsSync(archiveDir)) mkdirSync(archiveDir, { recursive: true });

  const ebletPath = resolve(archiveDir, 'synthesis_receipt.eblet.md');
  writeFileSync(ebletPath, ebletContent, 'utf8');
  writeFileSync(resolve(archiveDir, 'wave.hmac'), ebletHmac, 'utf8');
  wave.synthesis_receipt_path = ebletPath;
  wave.dir = archiveDir;

  // Final wave.json goes to archive
  writeFileSync(resolve(archiveDir, 'wave.json'), JSON.stringify(wave, null, 2), 'utf8');

  _waves.set(wave.wave_id, wave);
  console.log(`[wave-generator] wave ${wave.wave_id} COMPLETE (${wave.segs.length} SEGs + synthesis)`);
}

function buildEblet(wave: Wave, synthSeg: SegProgress): string {
  const segSummary = wave.segs
    .map(
      s =>
        `### ${s.seg_id} (${s.recipient}) — ${s.status}\n` +
        (s.status === 'done'
          ? `**Reply excerpt:** ${(s.reply ?? '').slice(0, 300)}${(s.reply ?? '').length > 300 ? '…' : ''}`
          : `**Error:** ${s.error}`),
    )
    .join('\n\n');

  const contentHash = contentSha256(wave.synthesis_text ?? '');

  return `# Wave Synthesis Receipt — ${wave.wave_id}
**Anchor:** ${wave.anchor}
**Wave Status:** ${wave.status}
**Created:** ${wave.created_at}
**Completed:** ${wave.completed_at ?? 'N/A'}
**SEG Count:** ${wave.segs.length}
**Synthesis SEG:** ${synthSeg.seg_id} (${synthSeg.recipient}) — ${synthSeg.status}
**Synthesis Content Hash:** ${contentHash}

---

## SEG Receipts

${segSummary}

---

## Synthesis

${wave.synthesis_text ?? '(none)'}

---

*B61 Phase A Wave Generator — LB-STACK-0164 §1. Aircraft Carrier holds. Substrate compounds.*
`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Dispatch a new wave. Returns the Wave immediately (status = queued);
 * execution proceeds asynchronously.
 */
export async function dispatchWave(req: WaveRequest): Promise<Wave> {
  ensureSubstrateDirs();

  const waveId = req.wave_id ?? `wave-${randomUUID()}`;

  if (req.segs.length === 0) {
    throw new Error('wave request must contain at least one SEG');
  }

  const segs   = decomposeRequest(req);
  const now    = new Date().toISOString();

  const wave: Wave = {
    wave_id:    waveId,
    anchor:     req.anchor,
    request:    req,
    status:     'queued',
    segs,
    created_at: now,
  };

  _waves.set(waveId, wave);

  // Persist request to wave_queue/ immediately (crash point A safety)
  writeFileSync(
    waveQueuePath(waveId),
    JSON.stringify({ waveId, anchor: req.anchor, segs: req.segs.length, queued_at: now }, null, 2),
    'utf8',
  );

  // Save initial wave.json to wave_active/{wave_id}/
  saveWaveJson(wave);

  // Launch async (non-blocking — HTTP response returns wave_id immediately)
  setImmediate(() => {
    runWaveLifecycle(wave, req).catch((err: unknown) => {
      wave.status = 'aborted';
      wave.error  = String(err);
      saveWaveJson(wave);
      console.error(`[wave-generator] wave ${waveId} aborted:`, err);
    });
  });

  return wave;
}

/** Get current wave status by wave_id. Returns null if not found. */
export function getWave(waveId: string): Wave | null {
  return _waves.get(waveId) ?? null;
}

/**
 * Abort an in-flight wave. Sets status = aborted; cannot cancel in-flight HTTP.
 * Returns true if wave existed and was abortable.
 */
export function abortWave(waveId: string): boolean {
  const wave = _waves.get(waveId);
  if (!wave) return false;
  if (wave.status === 'complete' || wave.status === 'aborted') return false;
  wave.status = 'aborted';
  wave.error  = 'aborted by operator request';
  saveWaveJson(wave);
  return true;
}

/** Recent activity summary for /healthz. */
export function getWaveSummary(): {
  total: number;
  complete: number;
  running: number;
  queued: number;
  aborted: number;
  last_wave_id: string | null;
} {
  const all   = [..._waves.values()];
  const sorted = all.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return {
    total:        all.length,
    complete:     all.filter(w => w.status === 'complete').length,
    running:      all.filter(w => w.status === 'running' || w.status === 'synthesizing').length,
    queued:       all.filter(w => w.status === 'queued').length,
    aborted:      all.filter(w => w.status === 'aborted').length,
    last_wave_id: sorted[0]?.wave_id ?? null,
  };
}
