/**
 * Scribes Consult — RAM-access pattern (SP-23 / K436)
 * ===================================================
 * `consult_scribes` query path. Scores `topic` against every registered Scribe,
 * then returns the most recent N entries from the highest-scoring Scribes.
 *
 * Latency target: p95 < 200ms for a 20-tablet cathedral with synthetic 500-entry
 * tablets. Hot path keeps work small: tablets are read once each, sliced by ts.
 */
import { getRegistry, scoreScribe } from "./registry.js";
import { readTablet, type ScribeTabletEntry } from "./cathedral.js";

export interface ConsultEntry extends ScribeTabletEntry {
  scribe_id: string;
}

export interface ConsultResult {
  topic: string;
  scribes_consulted: Array<{
    scribe_id: string;
    score: number;
    is_primary: boolean;
    entries_returned: number;
  }>;
  entries: ConsultEntry[];
  truncated: boolean;
  elapsed_ms: number;
}

export function consultScribes(input: {
  topic: string;
  max_entries?: number;
  since_ts?: string;
  include_adjacents?: boolean;
}): ConsultResult {
  const t0 = Date.now();
  const max_entries = Math.max(1, Math.min(200, input.max_entries ?? 20));
  const include_adjacents = input.include_adjacents ?? true;
  const sinceMs = input.since_ts ? Date.parse(input.since_ts) : NaN;

  const reg = getRegistry();

  // Treat the topic as a single theme so registry.scoreScribe can match against
  // both the keyword library (primary) and the adjacent-field text (secondary).
  const themes = [input.topic];

  type Ranked = {
    scribe_id: string;
    score: number;
    primaryMatches: string[];
    adjacentMatches: string[];
  };
  const ranked: Ranked[] = [];
  for (const s of reg.scribes) {
    const r = scoreScribe(s.id, themes);
    if (r.score <= 0) continue;
    ranked.push({
      scribe_id: s.id,
      score: r.score,
      primaryMatches: r.primaryMatches,
      adjacentMatches: r.adjacentMatches,
    });
  }
  // Primary matchers first (score >= 1.0), adjacent matchers after if enabled.
  ranked.sort((a, b) => b.score - a.score);
  const filtered = ranked.filter((r) =>
    include_adjacents ? true : r.primaryMatches.length > 0,
  );

  const entries: ConsultEntry[] = [];
  const consulted: ConsultResult["scribes_consulted"] = [];

  for (const r of filtered) {
    if (entries.length >= max_entries) break;
    const tablet = readTablet(r.scribe_id);
    // Newest first — tablets are append-only chronological.
    const reversed = [...tablet].reverse();
    const taken: ConsultEntry[] = [];
    for (const entry of reversed) {
      if (entries.length + taken.length >= max_entries) break;
      if (Number.isFinite(sinceMs)) {
        const entryMs = Date.parse(String(entry.ts));
        if (Number.isFinite(entryMs) && entryMs <= sinceMs) continue;
      }
      taken.push({ ...entry, scribe_id: r.scribe_id });
    }
    if (taken.length === 0) continue;
    entries.push(...taken);
    consulted.push({
      scribe_id: r.scribe_id,
      score: round2(r.score),
      is_primary: r.primaryMatches.length > 0,
      entries_returned: taken.length,
    });
  }

  return {
    topic: input.topic,
    scribes_consulted: consulted,
    entries,
    truncated: entries.length >= max_entries,
    elapsed_ms: Date.now() - t0,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
