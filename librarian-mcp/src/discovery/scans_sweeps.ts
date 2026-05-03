/**
 * Scans & Sweeps Continuous Discovery — Gap 9 / Bushel 18 Sub-Pod D
 * ==================================================================
 * Runner paired with KN100-era substrate hooks + KnightReport receipt.
 *
 * Scans/Sweeps are two distinct operation types:
 *   SCAN  — point-in-time snapshot query across the pheromone substrate
 *           looking for coverage gaps (topics with no pheromone records,
 *           or pheromone records with no associated strata assignment)
 *   SWEEP — time-windowed pass clearing stale/low-decay records and
 *           emitting a consolidation pheromone event
 *
 * KN100-era hooks:
 *   - sweep() hooks into substrate write-back by emitting a
 *     sweep_event pheromone before and after clearing
 *   - scan() uses queryPheromone Phase 0 fast path with decay scoring
 *
 * Primitive slug: scans_sweeps_continuous_discovery
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { emitPheromone, queryPheromone, PHEROMONE_INDEX_PATH } from '../scribes/pheromone.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ScanResult {
  ts: string;
  topics_scanned: number;
  topics_with_no_pheromone: number;
  topics_with_no_strata: number;
  coverage_gaps: string[];
  scan_duration_ms: number;
}

export interface SweepResult {
  ts: string;
  records_before: number;
  records_swept: number;
  sweep_duration_ms: number;
  decay_threshold_used: number;
}

// ─── Scans & Sweeps runner ─────────────────────────────────────────────────

export class ScansSweepsRunner {
  /**
   * SCAN: Point-in-time coverage gap analysis.
   * Returns topics lacking pheromone records or strata assignments.
   */
  scan(options: { topicsToCheck?: string[] } = {}): ScanResult {
    const t0 = Date.now();
    const topicsToCheck = options.topicsToCheck ?? this._sampleTopicsFromSubstrate();

    const coverageGaps: string[] = [];
    let topicsWithNoPheromone = 0;
    let topicsWithNoStrata    = 0;

    for (const topic of topicsToCheck) {
      // Check pheromone coverage
      const phResult = queryPheromone(topic, { decayActive: false, topK: 5 });
      if (phResult.hits.length === 0) {
        topicsWithNoPheromone++;
        coverageGaps.push(`[NO_PHEROMONE] ${topic}`);
      }
    }

    // Check for strata-indexed topics without pheromone (requires strata ledger)
    const strataLedger = resolve(
      __dirname, '../../stitchpunks', 'strata', 'strata_assignments.jsonl'
    );
    if (existsSync(strataLedger)) {
      const assignments = readFileSync(strataLedger, 'utf-8')
        .split('\n').filter(l => l.trim())
        .map(l => { try { return JSON.parse(l); } catch { return null; } })
        .filter(Boolean);

      for (const a of assignments) {
        const r = queryPheromone(a.topic, { decayActive: false, topK: 3 });
        if (r.hits.length === 0) {
          topicsWithNoStrata++;
          if (!coverageGaps.some(g => g.includes(a.topic))) {
            coverageGaps.push(`[STRATA_NO_PHEROMONE] ${a.topic} (${a.stratum})`);
          }
        }
      }
    }

    const scanDurationMs = Date.now() - t0;

    // Emit scan event to substrate
    emitPheromone('ScansSweeps', `scan-${Date.now()}`,
      `scans sweeps scan coverage gaps ${topicsWithNoPheromone} topics without pheromone`, {
      cathedral: 'knight',
      flavorClass: { cognition: 'empirical-receipt', audience: 'knight-build' },
      synthesisClass: 'scans_sweeps_continuous_discovery',
    });

    return {
      ts: new Date().toISOString(),
      topics_scanned: topicsToCheck.length,
      topics_with_no_pheromone: topicsWithNoPheromone,
      topics_with_no_strata: topicsWithNoStrata,
      coverage_gaps: coverageGaps.slice(0, 50), // cap for readability
      scan_duration_ms: scanDurationMs,
    };
  }

  /**
   * SWEEP: Time-windowed decay consolidation pass.
   * Counts records below a decay threshold (does NOT delete — append-only substrate).
   * Emits a pre-sweep and post-sweep pheromone event.
   */
  sweep(options: { decayThreshold?: number } = {}): SweepResult {
    const t0 = Date.now();
    const decayThreshold = options.decayThreshold ?? 0.01;

    // Pre-sweep event
    emitPheromone('ScansSweeps', `sweep-pre-${Date.now()}`,
      `scans sweeps sweep start decay threshold ${decayThreshold}`, {
      cathedral: 'knight',
      flavorClass: { cognition: 'empirical-receipt', audience: 'knight-build' },
      synthesisClass: 'scans_sweeps_continuous_discovery',
    });

    let recordsBefore = 0;
    let recordsSwept  = 0;

    if (existsSync(PHEROMONE_INDEX_PATH)) {
      const raw = readFileSync(PHEROMONE_INDEX_PATH, 'utf-8');
      const lines = raw.split('\n').filter(l => l.trim());
      recordsBefore = lines.length;
      const nowMs = Date.now();

      for (const line of lines) {
        try {
          const rec = JSON.parse(line);
          const ageDays = (nowMs - new Date(rec.ts).getTime()) / 86_400_000;
          const decay   = Math.exp(-ageDays / (rec.decay_constant_days ?? 30));
          if (decay < decayThreshold) {
            recordsSwept++;
          }
        } catch { /* skip malformed */ }
      }
    }

    const sweepDurationMs = Date.now() - t0;

    // Post-sweep event
    emitPheromone('ScansSweeps', `sweep-post-${Date.now()}`,
      `scans sweeps sweep complete swept ${recordsSwept} of ${recordsBefore} records`, {
      cathedral: 'knight',
      flavorClass: { cognition: 'empirical-receipt', audience: 'knight-build' },
      synthesisClass: 'scans_sweeps_continuous_discovery',
    });

    return {
      ts: new Date().toISOString(),
      records_before: recordsBefore,
      records_swept: recordsSwept,
      sweep_duration_ms: sweepDurationMs,
      decay_threshold_used: decayThreshold,
    };
  }

  private _sampleTopicsFromSubstrate(maxTopics = 20): string[] {
    if (!existsSync(PHEROMONE_INDEX_PATH)) return [];
    try {
      const raw = readFileSync(PHEROMONE_INDEX_PATH, 'utf-8');
      const topics = new Set<string>();
      for (const line of raw.split('\n').filter(l => l.trim())) {
        try {
          const rec = JSON.parse(line);
          for (const t of (rec.topics ?? [])) {
            topics.add(t);
            if (topics.size >= maxTopics) break;
          }
        } catch { /* skip */ }
        if (topics.size >= maxTopics) break;
      }
      return Array.from(topics);
    } catch {
      return [];
    }
  }
}

/** Singleton for production use. */
export const scansSweeps = new ScansSweepsRunner();
