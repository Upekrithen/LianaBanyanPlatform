/**
 * On Deck Scribe — Reader — KN-Q1 / BP018
 * ==========================================
 * Reads queue.jsonl, reduces to latest-line-per-id, and provides
 * the next-fire entry for Knight (highest priority queued entry with
 * all prerequisites landed).
 *
 * Load model: pure file read — no mutation side effects.
 */

import { existsSync, readFileSync } from "fs";
import { ODS_QUEUE, deserializeEntry, type OnDeckEntry, type HsCohortClass } from "./state_file.js";

// ─── Queue loading ─────────────────────────────────────────────────────────────

/**
 * Load current queue state.
 * Reduces to latest-line-per-id: when the same id appears N times,
 * fields from all appearances are merged in order (later lines win per field).
 *
 * Returns entries sorted by priority ascending (0 fires first).
 */
export function loadQueue(): OnDeckEntry[] {
  if (!existsSync(ODS_QUEUE)) return [];

  const raw = readFileSync(ODS_QUEUE, "utf-8");
  const lines = raw.split("\n").filter((l) => l.trim().length > 0);

  // Reduce: latest-line-per-id with field merge
  const merged = new Map<string, OnDeckEntry>();
  for (const line of lines) {
    const entry = deserializeEntry(line);
    if (!entry || !entry.id) continue;
    const existing = merged.get(entry.id);
    if (!existing) {
      merged.set(entry.id, entry);
    } else {
      // Merge: fields from later line override, but preserve non-empty prior values
      const updated: OnDeckEntry = { ...existing };
      for (const [k, v] of Object.entries(entry)) {
        const key = k as keyof OnDeckEntry;
        // Later line wins if its value is set (not empty sentinel)
        if (v !== "" && v !== undefined && v !== null) {
          (updated as Record<string, unknown>)[key] = v;
        }
      }
      merged.set(entry.id, updated);
    }
  }

  const entries = Array.from(merged.values());
  // Sort by priority (ascending: 0 fires first)
  entries.sort((a, b) => a.priority - b.priority);
  return entries;
}

// ─── Next-fire query ───────────────────────────────────────────────────────────

export type NextForKnightOptions = {
  /** Filter by HsCohortClass (optional). */
  cohort_class?: HsCohortClass;
  /** Filter by category (default: "knight"). */
  category?: string;
};

/**
 * Return the next K-prompt entry Knight should fire.
 * Rules:
 *   - status === "queued"
 *   - all prerequisites have status === "landed"
 *   - passes optional cohort_class and category filters
 *   - lowest priority number wins (0 = highest priority)
 */
export function getNextForKnight(opts: NextForKnightOptions = {}): OnDeckEntry | null {
  const all = loadQueue();
  const landedIds = new Set(all.filter((e) => e.status === "landed").map((e) => e.id));

  const category = opts.category ?? "knight";

  for (const entry of all) {
    if (entry.status !== "queued") continue;
    if (entry.category !== category) continue;
    if (opts.cohort_class && entry.cohort_class && entry.cohort_class !== opts.cohort_class) continue;
    const prereqsMet = entry.prerequisites.every((pid) => landedIds.has(pid));
    if (!prereqsMet) continue;
    return entry;
  }
  return null;
}

// ─── Dispatch audit ────────────────────────────────────────────────────────────

export type DispatchAudit = {
  total: number;
  queued: number;
  in_flight: number;
  landed: number;
  deferred: number;
  errored: number;
  by_category: Record<string, number>;
  by_cohort_class: Record<string, number>;
  by_pod_class: Record<string, number>;
};

export function dispatchAudit(): DispatchAudit {
  const all = loadQueue();
  const audit: DispatchAudit = {
    total: all.length,
    queued: 0,
    in_flight: 0,
    landed: 0,
    deferred: 0,
    errored: 0,
    by_category: {},
    by_cohort_class: {},
    by_pod_class: {},
  };

  for (const e of all) {
    audit[e.status]++;
    audit.by_category[e.category] = (audit.by_category[e.category] ?? 0) + 1;
    if (e.cohort_class) {
      audit.by_cohort_class[e.cohort_class] = (audit.by_cohort_class[e.cohort_class] ?? 0) + 1;
    }
    if (e.pod_class) {
      audit.by_pod_class[e.pod_class] = (audit.by_pod_class[e.pod_class] ?? 0) + 1;
    }
  }

  return audit;
}

// ─── Promote from dropzone ─────────────────────────────────────────────────────

import { readdirSync, existsSync as fsExistsSync } from "fs";
import { resolve } from "path";

/**
 * Scan a dropzone directory for PROMPT_KNIGHT_*.md files and return
 * preliminary OnDeckEntry stubs (status=queued) ready for appendEntry.
 * Caller is responsible for appending them via writer.appendEntry.
 */
export function scanDropzoneForKPrompts(
  dropzone_path: string
): Array<Omit<OnDeckEntry, "id" | "ts_queued">> {
  if (!fsExistsSync(dropzone_path)) return [];
  const files = readdirSync(dropzone_path).filter((f) =>
    f.startsWith("PROMPT_KNIGHT_") && f.endsWith(".md")
  );
  return files.map((f) => ({
    category: "knight" as const,
    k_prompt_path: resolve(dropzone_path, f),
    status: "queued" as const,
    priority: 99,
    prerequisites: [],
  }));
}
