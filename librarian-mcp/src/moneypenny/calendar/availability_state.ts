/**
 * MoneyPenny Availability State (§6.1, Bushel 82, BP034)
 * Founder availability classes: DEEP_WORK / OPEN_BLOCK / OUT / SLEEP / FAMILY / COUNSEL
 *
 * G9 gate: availability inference returns one of 6 classes.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";
import type { AvailabilityClass, ISO8601 } from "../types.js";

export type { AvailabilityClass } from "../types.js";

// ─── Storage Path ─────────────────────────────────────────────────────────────

function availabilityPath(): string {
  return resolve(homedir(), ".claude", "state", "moneypenny", "availability.json");
}

function ensureDir(): void {
  mkdirSync(resolve(availabilityPath(), ".."), { recursive: true });
}

// ─── Availability Record ──────────────────────────────────────────────────────

export interface AvailabilityRecord {
  class: AvailabilityClass;
  set_at: ISO8601;
  until?: ISO8601;          // optional expiry; reverts to OPEN_BLOCK after
  set_by: "founder" | "calendar_inference" | "default" | "auto";
  notes?: string;
}

const DEFAULT_AVAILABILITY: AvailabilityClass = "OPEN_BLOCK";

// ─── Read / Write ─────────────────────────────────────────────────────────────

export function readAvailability(): AvailabilityClass {
  const p = availabilityPath();
  if (!existsSync(p)) return DEFAULT_AVAILABILITY;
  try {
    const record = JSON.parse(readFileSync(p, "utf-8")) as AvailabilityRecord;
    // Check if record has expired
    if (record.until && new Date(record.until).getTime() < Date.now()) {
      return DEFAULT_AVAILABILITY;
    }
    return record.class;
  } catch {
    return DEFAULT_AVAILABILITY;
  }
}

export function readAvailabilityRecord(): AvailabilityRecord {
  const p = availabilityPath();
  if (!existsSync(p)) {
    return {
      class: DEFAULT_AVAILABILITY,
      set_at: new Date().toISOString(),
      set_by: "default",
    };
  }
  try {
    return JSON.parse(readFileSync(p, "utf-8")) as AvailabilityRecord;
  } catch {
    return {
      class: DEFAULT_AVAILABILITY,
      set_at: new Date().toISOString(),
      set_by: "default",
    };
  }
}

/** Alias for readAvailabilityRecord — used by MCP tools and gateway */
export function getAvailability(): AvailabilityRecord {
  return readAvailabilityRecord();
}

export function setAvailability(
  availabilityClass: AvailabilityClass,
  until?: ISO8601,
  setBy: AvailabilityRecord["set_by"] = "founder",
  notes?: string,
): AvailabilityRecord {
  ensureDir();
  const record: AvailabilityRecord = {
    class: availabilityClass,
    set_at: new Date().toISOString(),
    until,
    set_by: setBy,
    notes,
  };
  writeFileSync(availabilityPath(), JSON.stringify(record, null, 2));
  return record;
}

// ─── Availability History ─────────────────────────────────────────────────────

function availabilityHistoryPath(): string {
  return resolve(homedir(), ".claude", "state", "moneypenny", "availability_history.jsonl");
}

export function logAvailabilityChange(
  from: AvailabilityClass,
  to: AvailabilityClass,
  source: AvailabilityRecord["set_by"],
): void {
  try {
    const entry = {
      from,
      to,
      source,
      ts: new Date().toISOString(),
    };
    appendFileSync(availabilityHistoryPath(), JSON.stringify(entry) + "\n");
  } catch { /* non-fatal */ }
}

/**
 * Infer availability from calendar blocks (used by calendar adapters).
 * Rule priority: explicit Founder-set > calendar event > default OPEN_BLOCK.
 */
export function inferAvailabilityFromBlocks(
  blocks: Array<{ title: string; start: ISO8601; end: ISO8601 }>,
  now: ISO8601 = new Date().toISOString(),
): AvailabilityClass {
  const nowMs = new Date(now).getTime();

  // Check if any block is active right now
  const activeBlock = blocks.find(b => {
    const start = new Date(b.start).getTime();
    const end = new Date(b.end).getTime();
    return start <= nowMs && nowMs <= end;
  });

  if (!activeBlock) return "OPEN_BLOCK";

  const title = activeBlock.title.toLowerCase();

  if (title.includes("deep work") || title.includes("focus") || title.includes("dnd") || title.includes("no meetings")) {
    return "DEEP_WORK";
  }
  if (title.includes("sleep") || title.includes("rest") || title.includes("unavailable") || title.includes("do not disturb")) {
    return "SLEEP";
  }
  if (title.includes("family") || title.includes("personal")) {
    return "FAMILY";
  }
  if (title.includes("legal") || title.includes("counsel") || title.includes("attorney")) {
    return "COUNSEL";
  }
  if (
    title.includes("out of office") ||
    title.includes("vacation") ||
    title.includes("travel") ||
    title.includes("ooo")
  ) {
    return "OUT";
  }

  return "OPEN_BLOCK";
}

/**
 * Human-readable description of an availability class.
 */
export function describeAvailability(av: AvailabilityClass): string {
  const descriptions: Record<AvailabilityClass, string> = {
    DEEP_WORK: "Deep work — only WB, family, and counsel can interrupt",
    OPEN_BLOCK: "Open block — most interactions accepted",
    OUT: "Out — all interactions queued or substantively engaged",
    SLEEP: "Sleep — family emergency only; all others queued",
    FAMILY: "Family time — only Warren Buffett class interrupts",
    COUNSEL: "Counsel time — only Warren Buffett class interrupts",
  };
  return descriptions[av];
}

/** CalendarBlock type for adapter use */
export type CalendarBlock = {
  title: string;
  start: ISO8601;
  end: ISO8601;
  source: "outlook" | "google" | "icloud" | "manual";
};
