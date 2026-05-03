/**
 * Gold Tablet Ledger — KN-N1 / BP018 Pod N
 * ==========================================
 * Append-only JSONL ledger at ~/.claude/state/gold_tablet/ledger.jsonl
 * Latest-per-id reduction for current state.
 * Concurrent-writer-safe (single-process JS event loop; synchronous ops).
 *
 * Mirrors Iron Tablet KN089 append-only discipline:
 *   - Never delete/overwrite ledger entries
 *   - Latest-per-id = current state
 *   - Supersession via superseded_by field
 */

import {
  existsSync,
  readFileSync,
  appendFileSync,
  mkdirSync,
} from "fs";
import { resolve } from "path";
import { homedir } from "os";
import type { GoldTablet, GoldTabletQuery, GoldTabletAudit, GoldTier, GoldStatus } from "./schema.js";
export type { GoldTabletQuery, GoldTabletAudit };
import { nextGoldSerial } from "./serial.js";
import { signGoldTablet, chronosTimestamp, verifyGoldTablet } from "./hmac.js";

export const GOLD_DIR = resolve(homedir(), ".claude", "state", "gold_tablet");
export const LEDGER_PATH = resolve(GOLD_DIR, "ledger.jsonl");

function ensureDir(): void {
  if (!existsSync(GOLD_DIR)) mkdirSync(GOLD_DIR, { recursive: true });
}

// ─── Ledger I/O ────────────────────────────────────────────────────────────────

/** Read all raw ledger entries in order. */
export function readAllEntries(): GoldTablet[] {
  if (!existsSync(LEDGER_PATH)) return [];
  try {
    const raw = readFileSync(LEDGER_PATH, "utf-8");
    return raw
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l) as GoldTablet);
  } catch {
    return [];
  }
}

/**
 * Latest-per-id reduction: returns the most recent entry for each tablet id.
 * This is the canonical current state of all tablets.
 */
export function latestPerIdReduction(): Map<string, GoldTablet> {
  const entries = readAllEntries();
  const map = new Map<string, GoldTablet>();
  for (const entry of entries) {
    map.set(entry.id, entry);
  }
  return map;
}

/** Append a raw Gold Tablet record to the ledger (single atomic write). */
function appendEntry(tablet: GoldTablet): void {
  ensureDir();
  appendFileSync(LEDGER_PATH, JSON.stringify(tablet) + "\n", "utf-8");
}

// ─── Public operations ─────────────────────────────────────────────────────────

export interface AppendTabletParams {
  tier: GoldTier;
  scope: string;
  topic: string;
  rule_text: string;
  ratification_session: string;
  founder_voice_quote?: string;
  supersedes?: string[];
  signer_id: string;
}

export interface AppendTabletResult {
  success: boolean;
  tablet?: GoldTablet;
  error?: string;
}

/**
 * Append a new Gold Tablet to the ledger.
 * Generates serial, HMAC, Chronos timestamp.
 * If supersedes[] is provided, marks prior tablets as superseded.
 */
export function appendTablet(params: AppendTabletParams): AppendTabletResult {
  try {
    const id = nextGoldSerial();
    const ratification_ts = chronosTimestamp();

    const hmac_signature = signGoldTablet({
      id,
      tier: params.tier,
      scope: params.scope,
      topic: params.topic,
      rule_text: params.rule_text,
      ratification_session: params.ratification_session,
      ratification_ts,
    });

    const tablet: GoldTablet = {
      id,
      tier: params.tier,
      scope: params.scope,
      topic: params.topic,
      rule_text: params.rule_text,
      ratification_session: params.ratification_session,
      ratification_ts,
      founder_voice_quote: params.founder_voice_quote,
      excalibur_pointers: [],
      supersedes: params.supersedes ?? [],
      status: "active",
      hmac_signature,
      chronos_ts: ratification_ts,
    };

    appendEntry(tablet);

    // Mark superseded tablets
    if (params.supersedes && params.supersedes.length > 0) {
      const currentMap = latestPerIdReduction();
      for (const priorId of params.supersedes) {
        const prior = currentMap.get(priorId);
        if (prior) {
          const updated: GoldTablet = {
            ...prior,
            status: "superseded",
            superseded_by: id,
          };
          appendEntry(updated);
        }
      }
    }

    return { success: true, tablet };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/** Read the latest state of a Gold Tablet by id. Returns null if not found. */
export function readTablet(id: string): GoldTablet | null {
  const map = latestPerIdReduction();
  return map.get(id) ?? null;
}

/** Query tablets by filters (tier, scope, topic, status). */
export function queryTablets(query: GoldTabletQuery = {}): GoldTablet[] {
  const map = latestPerIdReduction();
  let results = Array.from(map.values());

  if (query.tier) results = results.filter((t) => t.tier === query.tier);
  if (query.scope) results = results.filter((t) => t.scope === query.scope);
  if (query.topic) results = results.filter((t) => t.topic === query.topic);
  if (!query.status || query.status === "active") {
    results = results.filter((t) => t.status === "active");
  }

  const offset = query.offset ?? 0;
  const limit = query.limit ?? 1000;
  return results.slice(offset, offset + limit);
}

/** Verify the HMAC signature on a Gold Tablet. */
export function verifyTablet(tablet: GoldTablet): boolean {
  return verifyGoldTablet({
    id: tablet.id,
    tier: tablet.tier,
    scope: tablet.scope,
    topic: tablet.topic,
    rule_text: tablet.rule_text,
    ratification_session: tablet.ratification_session,
    ratification_ts: tablet.ratification_ts,
    hmac_signature: tablet.hmac_signature,
  });
}

/** Aggregate audit: counts by tier × status × scope. */
export function auditTablets(): GoldTabletAudit {
  const map = latestPerIdReduction();
  const all = Array.from(map.values());

  const by_tier: Record<GoldTier, number> = {
    platform_canon: 0,
    platform_rules: 0,
    project_rules: 0,
  };
  const by_status: Record<GoldStatus, number> = {
    active: 0,
    superseded: 0,
  };
  const by_scope: Record<string, number> = {};

  for (const t of all) {
    by_tier[t.tier] = (by_tier[t.tier] ?? 0) + 1;
    by_status[t.status] = (by_status[t.status] ?? 0) + 1;
    by_scope[t.scope] = (by_scope[t.scope] ?? 0) + 1;
  }

  return { total: all.length, by_tier, by_status, by_scope };
}

/** Update excalibur_pointers on a tablet (append a new pointer; non-destructive). */
export function appendExcaliburPointer(tablet_id: string, excalibur_id: string): boolean {
  const current = readTablet(tablet_id);
  if (!current || current.status === "superseded") return false;
  const updated: GoldTablet = {
    ...current,
    excalibur_pointers: [...new Set([...current.excalibur_pointers, excalibur_id])],
  };
  appendEntry(updated);
  return true;
}
