#!/usr/bin/env node
/**
 * Pheromone Bloodhound — Async Deep-Extraction Scout (K523 Phase D / K524 Phase A)
 * ==================================================================================
 * Nightly (or hourly via recalculate-queue-hourly) cron job that:
 *   1. Scans ALL Scribe tablets across all Cathedrals
 *   2. Runs richer deep topic-extraction (multi-pass phrase mining)
 *   3. Merges cross-Cathedral inbound_pheromones.jsonl queues (K524 G.8)
 *   4. Rebuilds pheromone substrate from scratch with updated tags
 *   5. Respects decay: aged tablets get fewer topic slots allocated
 *
 * Run manually:  node librarian-mcp/scripts/pheromone-bloodhound.mjs
 * Cron hook:     see package.json "pheromone:build" script
 *
 * A&A #2317 Claim 5 (async deep-extraction), Claim 6 (decay-respecting),
 *            Claim 7 (cross-Cathedral Hound inbound merge).
 */

import { readFileSync, existsSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, renameSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LIBRARIAN_ROOT = resolve(__dirname, '..');
const STITCHPUNKS_DIR = process.env.LIBRARIAN_STITCHPUNKS_DIR
  ? resolve(process.env.LIBRARIAN_STITCHPUNKS_DIR)
  : join(LIBRARIAN_ROOT, 'stitchpunks');

const PHEROMONE_DIR = join(STITCHPUNKS_DIR, 'pheromone_substrate');
const PHEROMONE_INDEX = join(PHEROMONE_DIR, 'index.jsonl');
const DEFAULT_DECAY_DAYS = 30;

// ─── Stop-words ────────────────────────────────────────────────────────────
const STOP = new Set(
  ('the a an and or of to in for is are was were be been being it ' +
   'this that these those at by on with as from i me my we us our you your ' +
   'has have had do does did will would could should can may might must ' +
   'b125 b126 b127 b128 b129 b130 k520 k521 k522 k523 ts ts- mcp api ' +
   'session sessions tool tools tablet tablets file files line lines ' +
   'code type which what when where why how also since because if then ' +
   'so but not no yes all any some each every one two three four five ' +
   'six seven eight nine ten context json yaml md py rust new old current ' +
   'per via str int bool null true false').split(/\s+/)
);

// ─── Enhanced topic extraction (deeper than sync-emit) ─────────────────────
function extractTopicsDeep(text) {
  if (!text) return [];
  const topics = new Set();

  // Quoted phrases
  for (const m of text.matchAll(/[`"']([A-Za-z][\w\s\-]{3,60})[`"']/g)) {
    topics.add(m[1].toLowerCase().trim());
  }
  // Innovation numbers
  for (const m of text.matchAll(/#(\d{3,4})\b/g)) {
    topics.add(`innovation_${m[1]}`);
  }
  // Session IDs (K/B/R/P + digits)
  for (const m of text.matchAll(/\b([KBRP]\d{3,4})\b/g)) {
    topics.add(m[1].toLowerCase());
  }
  // Capitalized multi-word phrases (up to 4 tokens)
  for (const m of text.matchAll(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3})\b/g)) {
    const phrase = m[1].toLowerCase().trim();
    if (!STOP.has(phrase.split(' ')[0])) topics.add(phrase);
  }
  // CamelCase identifiers (e.g. PheromoneSubstrate, DetectiveScribe)
  for (const m of text.matchAll(/\b([A-Z][a-z]+[A-Z][A-Za-z]+)\b/g)) {
    topics.add(m[1].toLowerCase());
  }
  // Hyphenated technical terms (e.g. "decay-constant", "append-only")
  for (const m of text.matchAll(/\b([a-z]{3,}(?:-[a-z]{3,})+)\b/g)) {
    topics.add(m[1]);
  }
  // Single alphabetic tokens (4+ chars, not stop)
  for (const m of text.toLowerCase().matchAll(/\b([a-z][a-z_]{3,30})\b/g)) {
    if (!STOP.has(m[1])) topics.add(m[1]);
  }
  return Array.from(topics);
}

// ─── Decay penalty for allocating topic-slots ──────────────────────────────
function decayFactor(tsStr, decayDays) {
  const ageDays = (Date.now() - new Date(tsStr).getTime()) / 86_400_000;
  return Math.exp(-ageDays / decayDays);
}

// ─── Scan sources ──────────────────────────────────────────────────────────
const SOURCES = [
  { dir: join(STITCHPUNKS_DIR, 'scribes'), cathedral: 'bishop', prefix: 'scribe_' },
  { dir: join(STITCHPUNKS_DIR, 'knight_cathedral', 'scribes'), cathedral: 'knight', prefix: '' },
  { dir: join(STITCHPUNKS_DIR, 'pawn_cathedral', 'scribes'), cathedral: 'pawn', prefix: '' },
];

function makeKey(cathedral, scribe, tabletId) {
  return `${cathedral}::${scribe}::${tabletId}`;
}

// ─── K524 Phase A: merge inbound_pheromones.jsonl queues ───────────────────
/**
 * Merge cross-Cathedral Hound inbound queues into the unified byKey map.
 * InboundPheromoneRecord → PheromoneRecord conversion: topics_compact → topics,
 * source_cathedral → cathedral. Last-write-wins by composite key.
 *
 * Returns count of records merged from inbound queues.
 */
function mergeInboundQueues(byKey) {
  let mergedCount = 0;

  for (const cath of ['bishop', 'knight', 'pawn']) {
    const inboundPath = join(STITCHPUNKS_DIR, `${cath}_cathedral`, 'inbound_pheromones.jsonl');
    if (!existsSync(inboundPath)) continue;

    let raw;
    try { raw = readFileSync(inboundPath, 'utf-8'); }
    catch { continue; }

    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      let inbound;
      try { inbound = JSON.parse(trimmed); } catch { continue; }

      const phrec = {
        ts: inbound.ts || new Date().toISOString(),
        scribe: inbound.scribe,
        tablet_id: inbound.tablet_id,
        topics: Array.isArray(inbound.topics_compact) ? inbound.topics_compact : [],
        decay_constant_days: inbound.decay_constant_days ?? DEFAULT_DECAY_DAYS,
        cathedral: inbound.source_cathedral,
      };

      if (!phrec.scribe || !phrec.tablet_id || !phrec.cathedral) continue;

      const key = makeKey(phrec.cathedral, phrec.scribe, phrec.tablet_id);
      // Last-write-wins: inbound record wins if newer than or same age as existing
      const existing = byKey.get(key);
      if (!existing || new Date(phrec.ts) >= new Date(existing.ts)) {
        byKey.set(key, phrec);
        mergedCount++;
      }
    }
  }

  return mergedCount;
}

// ─── Main build ────────────────────────────────────────────────────────────
function buildIndex() {
  const t0 = Date.now();
  console.error('[bloodhound] starting pheromone deep-extraction rebuild (with inbound merge)...');

  const byKey = new Map(); // key -> PheromoneRecord
  let tabletCount = 0;
  let scribeCount = 0;
  let skippedDecay = 0;

  for (const { dir, cathedral, prefix } of SOURCES) {
    if (!existsSync(dir)) continue;
    let files;
    try { files = readdirSync(dir).filter(f => f.endsWith('.jsonl')); }
    catch { continue; }

    for (const file of files) {
      const scribeName = file.replace(new RegExp(`^${prefix}`), '').replace(/\.jsonl$/, '');
      const filePath = join(dir, file);
      scribeCount++;

      let raw;
      try { raw = readFileSync(filePath, 'utf-8'); }
      catch { continue; }

      for (const line of raw.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        let rec;
        try { rec = JSON.parse(trimmed); } catch { continue; }
        if (rec.type === 'header') continue;

        tabletCount++;

        const ts = rec.ts || rec.created_at || new Date().toISOString();
        const df = decayFactor(ts, DEFAULT_DECAY_DAYS);

        // Aged tablets (decay < 0.01 = >150 days old) get minimal topic indexing
        if (df < 0.01) {
          skippedDecay++;
          const tabletId = rec.id || rec.toolsmith_id || rec.scribe_id || `${scribeName}_${tabletCount}`;
          const forensicTopics = [scribeName.toLowerCase()];
          if (rec.session) forensicTopics.push(rec.session.toLowerCase());
          byKey.set(makeKey(cathedral, scribeName, tabletId), {
            ts,
            scribe: scribeName,
            tablet_id: tabletId,
            topics: forensicTopics,
            decay_constant_days: DEFAULT_DECAY_DAYS,
            cathedral,
          });
          continue;
        }

        const text = Object.values(rec).filter(v => typeof v === 'string').join(' ');
        const topics = extractTopicsDeep(text);

        // Decay-scaled topic allocation: fewer topics for older records
        const maxTopics = Math.max(5, Math.ceil(topics.length * df));
        const allocatedTopics = topics.slice(0, maxTopics);

        const tabletId = rec.id || rec.toolsmith_id || rec.scribe_id || `${scribeName}_${tabletCount}`;

        byKey.set(makeKey(cathedral, scribeName, tabletId), {
          ts,
          scribe: scribeName,
          tablet_id: tabletId,
          topics: allocatedTopics,
          decay_constant_days: DEFAULT_DECAY_DAYS,
          cathedral,
        });
      }
    }
  }

  // K524 Phase A: merge cross-Cathedral inbound queues
  const inboundMerged = mergeInboundQueues(byKey);

  // Write atomically
  mkdirSync(PHEROMONE_DIR, { recursive: true });
  const lines = Array.from(byKey.values()).map(r => JSON.stringify(r));
  const tmpPath = PHEROMONE_INDEX + '.tmp';
  writeFileSync(tmpPath, lines.join('\n') + (lines.length > 0 ? '\n' : ''), 'utf-8');

  if (existsSync(PHEROMONE_INDEX)) {
    try { unlinkSync(PHEROMONE_INDEX); } catch { /* ignore */ }
  }
  try {
    renameSync(tmpPath, PHEROMONE_INDEX);
  } catch {
    writeFileSync(PHEROMONE_INDEX, lines.join('\n') + (lines.length > 0 ? '\n' : ''), 'utf-8');
    try { unlinkSync(tmpPath); } catch { /* ignore */ }
  }

  const buildMs = Date.now() - t0;
  const allTopics = new Set();
  for (const r of byKey.values()) r.topics.forEach(t => allTopics.add(t));

  console.error(
    `[bloodhound] done: ${byKey.size} records (${inboundMerged} from inbound queues), ` +
    `${allTopics.size} distinct topics, ${scribeCount} scribe files, ${tabletCount} tablets, ` +
    `${skippedDecay} decay-minimal (>150 days), ${buildMs}ms`
  );

  return {
    records: byKey.size,
    topics: allTopics.size,
    scribes: scribeCount,
    tablets: tabletCount,
    inbound_merged: inboundMerged,
    buildMs,
  };
}

const result = buildIndex();
console.log(JSON.stringify({ ok: true, ...result }));
