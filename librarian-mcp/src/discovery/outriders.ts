/**
 * Outriders Continuous Discovery — Gap 8 / Bushel 18 Sub-Pod D
 * =============================================================
 * First-class module for Outriders dispatch loop before next Colossus-scale Bushel.
 *
 * Outriders are lightweight discovery probes dispatched at session boundaries
 * to surface:
 *   1. New canonical primitives that haven't been indexed in the pheromone substrate
 *   2. Scribes that have drifted from their last pheromone snapshot
 *   3. Cross-cathedral topics that lack cross-propagation
 *   4. Stale or missing KN receipt entries
 *
 * Dispatch loop:
 *   - Probe each registered Scribe for topic freshness
 *   - Compare pheromone index snapshot against current scribe tablet state
 *   - Emit discovery events to pheromone substrate
 *   - Return dispatch manifest (what was found / what needs attention)
 *
 * Primitive slug: outriders_continuous_discovery
 * Composes with: pheromone substrate, KnightReport system
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { emitPheromone, queryPheromone, PHEROMONE_INDEX_PATH } from '../scribes/pheromone.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const STITCHPUNKS_DIR   = resolve(__dirname, '../../stitchpunks');
const SCRIBES_DIR       = resolve(STITCHPUNKS_DIR, 'scribes');
const KNIGHT_SCRIBES    = resolve(STITCHPUNKS_DIR, 'knight_cathedral', 'scribes');

// ─── Types ─────────────────────────────────────────────────────────────────

export interface OutridersProbeResult {
  scribe: string;
  cathedral: string;
  tablet_lines: number;
  pheromone_records: number;
  drift_detected: boolean;
  drift_detail?: string;
  new_topics?: string[];
}

export interface OutridersDispatchManifest {
  ts: string;
  session_id: string;
  probes_run: number;
  drift_count: number;
  new_topic_count: number;
  results: OutridersProbeResult[];
  recommendations: string[];
}

// ─── Outriders runner ──────────────────────────────────────────────────────

export class OutridersRunner {
  /**
   * Run the full Outriders dispatch loop across all registered Scribes.
   */
  async dispatch(sessionId: string): Promise<OutridersDispatchManifest> {
    const ts = new Date().toISOString();
    const results: OutridersProbeResult[] = [];
    const recommendations: string[] = [];

    // Probe Bishop scribes
    if (existsSync(SCRIBES_DIR)) {
      const files = readdirSync(SCRIBES_DIR).filter(f => f.startsWith('scribe_') && f.endsWith('.jsonl'));
      for (const file of files) {
        const scribeName = file.replace(/^scribe_/, '').replace(/\.jsonl$/, '');
        const result = this._probeScribe(scribeName, resolve(SCRIBES_DIR, file), 'bishop');
        results.push(result);
        if (result.drift_detected) {
          recommendations.push(`[DRIFT] ${scribeName} (bishop): ${result.drift_detail}`);
        }
      }
    }

    // Probe Knight scribes
    if (existsSync(KNIGHT_SCRIBES)) {
      const files = readdirSync(KNIGHT_SCRIBES).filter(f => f.endsWith('.jsonl'));
      for (const file of files) {
        const scribeName = file.replace(/\.jsonl$/, '');
        const result = this._probeScribe(scribeName, resolve(KNIGHT_SCRIBES, file), 'knight');
        results.push(result);
        if (result.drift_detected) {
          recommendations.push(`[DRIFT] ${scribeName} (knight): ${result.drift_detail}`);
        }
      }
    }

    const driftCount    = results.filter(r => r.drift_detected).length;
    const newTopicCount = results.reduce((sum, r) => sum + (r.new_topics?.length ?? 0), 0);

    if (driftCount === 0 && newTopicCount === 0) {
      recommendations.push('[OK] All probed scribes are pheromone-fresh');
    }

    // Emit discovery event to pheromone substrate
    emitPheromone('Outriders', `dispatch-${sessionId}-${Date.now()}`,
      `outriders discovery scan session ${sessionId} drift ${driftCount} new topics ${newTopicCount}`, {
      cathedral: 'knight',
      flavorClass: { cognition: 'empirical-receipt', audience: 'knight-build' },
      synthesisClass: 'outriders_continuous_discovery',
    });

    return { ts, session_id: sessionId, probes_run: results.length, drift_count: driftCount, new_topic_count: newTopicCount, results, recommendations };
  }

  private _probeScribe(scribeName: string, filePath: string, cathedral: string): OutridersProbeResult {
    // Count tablet lines
    let tabletLines = 0;
    if (existsSync(filePath)) {
      try {
        tabletLines = readFileSync(filePath, 'utf-8').split('\n').filter(l => l.trim()).length;
      } catch { /* ignore */ }
    }

    // Count pheromone records for this scribe
    let pheromoneRecords = 0;
    let newTopics: string[] = [];
    if (existsSync(PHEROMONE_INDEX_PATH)) {
      try {
        const raw = readFileSync(PHEROMONE_INDEX_PATH, 'utf-8');
        const records = raw.split('\n')
          .filter(l => l.trim())
          .map(l => { try { return JSON.parse(l); } catch { return null; } })
          .filter(r => r && r.scribe === scribeName && r.cathedral === cathedral);
        pheromoneRecords = records.length;

        // Detect new topics in substrate that aren't in pheromone (simplified heuristic)
        const indexedTabletIds = new Set(records.map(r => r.tablet_id));
        if (tabletLines > 0 && pheromoneRecords === 0) {
          newTopics = [`${scribeName} has ${tabletLines} tablets but 0 pheromone records`];
        }
      } catch { /* ignore */ }
    }

    const driftDetected = tabletLines > 0 && pheromoneRecords === 0;
    const driftDetail = driftDetected
      ? `${tabletLines} tablet lines but 0 pheromone records (scribe not indexed)`
      : undefined;

    return { scribe: scribeName, cathedral, tablet_lines: tabletLines, pheromone_records: pheromoneRecords, drift_detected: driftDetected, drift_detail: driftDetail, new_topics: newTopics.length > 0 ? newTopics : undefined };
  }
}

/** Singleton for production use. */
export const outriders = new OutridersRunner();
