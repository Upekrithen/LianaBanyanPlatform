/**
 * Gold Tablet Supersession Cascade — KN-N2 / BP018 Pod N
 * ========================================================
 * When a Gold Tablet is superseded:
 *   1. Mark old tablet `superseded` (written by appendTablet with supersedes=[])
 *   2. Cascade-mark all dependent Excalibur instances as `needs_re_anchor`
 *   3. Write Pheromone Pixie-Dust event (provenance write-back)
 */

import { readTablet } from "./ledger.js";
import { markExcaliburNeedsReAnchor } from "./excalibur_pointer.js";
import { writeGoldPixieDust } from "./pheromone.js";

export interface SupersessionCascadeResult {
  success: boolean;
  old_tablet_id: string;
  new_tablet_id: string;
  excalibur_affected: string[];
  error?: string;
}

/**
 * Cascade supersession from old_id → new_id.
 * Marks Excalibur instances needs_re_anchor + emits Pixie-Dust event.
 */
export function cascadeSupersession(old_id: string, new_id: string): SupersessionCascadeResult {
  try {
    const old_tablet = readTablet(old_id);
    const excalibur_affected = markExcaliburNeedsReAnchor(old_id);

    writeGoldPixieDust({
      event_type: "supersession_cascade",
      gold_tablet_id: old_id,
      new_gold_tablet_id: new_id,
      excalibur_affected,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      old_tablet_id: old_id,
      new_tablet_id: new_id,
      excalibur_affected,
    };
  } catch (err) {
    return {
      success: false,
      old_tablet_id: old_id,
      new_tablet_id: new_id,
      excalibur_affected: [],
      error: String(err),
    };
  }
}
