/**
 * Gold Tablet Pheromone Pixie-Dust — KN-N3 / BP018 Pod N
 * ========================================================
 * Writes Pixie-Dust provenance events to the Pheromone substrate
 * on every Gold Tablet mutation.
 *
 * Per BP017 turn 30 canon: every Gold Tablet mutation triggers
 * writeBackGoldTabletEvent to the Pheromone substrate.
 */

import { existsSync, mkdirSync, appendFileSync } from "fs";
import { resolve } from "path";
import { homedir } from "os";
import { randomUUID } from "crypto";

const PHEROMONE_DIR = resolve(homedir(), ".claude", "state", "pheromone");
const GOLD_PIXIE_DUST_LOG = resolve(PHEROMONE_DIR, "gold_tablet_events.jsonl");

function ensureDir(): void {
  if (!existsSync(PHEROMONE_DIR)) mkdirSync(PHEROMONE_DIR, { recursive: true });
}

export interface GoldPixieDustEvent {
  event_id: string;
  event_type:
    | "tablet_ratified"
    | "tablet_superseded"
    | "supersession_cascade"
    | "excalibur_linked"
    | "authority_check"
    | "audit_query";
  gold_tablet_id?: string;
  new_gold_tablet_id?: string;
  excalibur_id?: string;
  excalibur_affected?: string[];
  tier?: string;
  scope?: string;
  signer_id?: string;
  timestamp: string;
}

/** Write a Pheromone Pixie-Dust provenance event for a Gold Tablet mutation. */
export function writeGoldPixieDust(
  event: Omit<GoldPixieDustEvent, "event_id">
): void {
  try {
    ensureDir();
    const full: GoldPixieDustEvent = {
      event_id: randomUUID(),
      ...event,
    };
    appendFileSync(GOLD_PIXIE_DUST_LOG, JSON.stringify(full) + "\n", "utf-8");
  } catch {
    // non-fatal
  }
}
