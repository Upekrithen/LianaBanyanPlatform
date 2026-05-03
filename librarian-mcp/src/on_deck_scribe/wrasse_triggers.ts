/**
 * On Deck Scribe — Wrasse Pre-Injection Triggers — KN-Q3 / BP018
 * ===============================================================
 * Registers 4 Wrasse trigger patterns that pre-inject On Deck Scribe
 * context when Bishop/Knight queries match.
 *
 * Triggers:
 *   1. "on deck scribe queue"    → pre-injects latest 50 queue entries
 *   2. "next knight prompt"      → pre-injects getNextForKnight() result
 *   3. "knight queue audit"      → pre-injects dispatchAudit() aggregate
 *   4. "engine ready"            → pre-injects engine readiness probe
 *
 * Implementation: in-process registry (extendable to file-based registry
 * when Wrasse daemon is live). Currently provides synchronous pre-inject
 * data builders that MCP consumers can call.
 *
 * Composes with:
 *   KN-Q1 reader.ts — loadQueue + getNextForKnight + dispatchAudit
 *   KN-Q3 substrate_writeback.ts — Pheromone entries confirming Pod-Q LANDED
 */

import { loadQueue, getNextForKnight, dispatchAudit } from "./reader.js";
import { existsSync } from "fs";

// ─── Wrasse trigger registry ───────────────────────────────────────────────────

export type WrasseTrigger = {
  trigger_phrase: string;
  description: string;
  build_pre_inject: () => unknown;
};

/** The 4 On Deck Scribe Wrasse triggers (Pod-Q KN-Q3). */
export const ODS_WRASSE_TRIGGERS: WrasseTrigger[] = [
  {
    trigger_phrase: "on deck scribe queue",
    description: "Pre-injects latest 50 On Deck Scribe queue entries (all categories, all statuses).",
    build_pre_inject: () => {
      const all = loadQueue();
      const latest50 = all.slice(0, 50);
      return {
        trigger: "on deck scribe queue",
        queue_depth: all.length,
        entries: latest50,
        pre_inject_ts: new Date().toISOString(),
      };
    },
  },
  {
    trigger_phrase: "next knight prompt",
    description: "Pre-injects the next K-prompt entry Knight should fire (getNextForKnight result).",
    build_pre_inject: () => {
      const next = getNextForKnight({ category: "knight" });
      return {
        trigger: "next knight prompt",
        next_entry: next ?? null,
        data_available: next !== null,
        pre_inject_ts: new Date().toISOString(),
      };
    },
  },
  {
    trigger_phrase: "knight queue audit",
    description: "Pre-injects aggregated On Deck Scribe dispatch counts.",
    build_pre_inject: () => {
      const audit = dispatchAudit();
      return {
        trigger: "knight queue audit",
        ...audit,
        pre_inject_ts: new Date().toISOString(),
      };
    },
  },
  {
    trigger_phrase: "engine ready",
    description: "Engine readiness probe: checks Pod-G (af1cc47), Pod-Q, and Pod-R LANDED status.",
    build_pre_inject: () => {
      // Check Pod-G landed marker (git tag presence is canonical — proxy: check build_compile.py exists)
      const podGLanded = existsSync(
        process.cwd().replace(/librarian-mcp.*/, "") + "the_shadow/build_compile.py"
      );
      // Pod-Q: on_deck_scribe reader must be callable (already imported above)
      const podQReady = true; // reached here = module loaded = Q is ready

      // Pod-R: overlap_watcher.py existence
      const podRLanded = existsSync(
        process.cwd().replace(/librarian-mcp.*/, "") + "the_shadow/overlap_watcher.py"
      );

      const audit = dispatchAudit();
      return {
        trigger: "engine ready",
        pod_G_landed: podGLanded,
        pod_Q_ready: podQReady,
        pod_R_landed: podRLanded,
        engine_operational: podGLanded && podQReady && podRLanded,
        dispatch_audit: audit,
        pre_inject_ts: new Date().toISOString(),
      };
    },
  },
];

// ─── Trigger lookup ────────────────────────────────────────────────────────────

/**
 * Find a Wrasse trigger by phrase (partial substring match).
 */
export function findWrasseTrigger(phrase: string): WrasseTrigger | null {
  const lower = phrase.toLowerCase();
  return ODS_WRASSE_TRIGGERS.find((t) => lower.includes(t.trigger_phrase)) ?? null;
}

/**
 * Execute a Wrasse trigger by phrase. Returns pre-inject data or null.
 */
export function executeWrasseTrigger(phrase: string): unknown | null {
  const trigger = findWrasseTrigger(phrase);
  if (!trigger) return null;
  return trigger.build_pre_inject();
}
