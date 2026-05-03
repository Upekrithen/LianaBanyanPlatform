/**
 * Joules Operations — KN-M2 / BP018
 * ====================================
 * Mint / Transfer / Redeem operations for Forever-Stamp Joules.
 *
 * ONE-WAY VALVE rule (immutable):
 *   Marks consumed to mint Joules can NEVER be recovered as Marks.
 *   This is a structural absence — no cash-out-marks-from-joules function exists.
 *
 * Marks-backing conversion:
 *   Default rate: 1 Joule per 100 Marks-surplus (overrideable via backing rule).
 *   Backing rule is cited from Gold tablet (Pod-N); until Pod-N lands, a
 *   stub resolver accepts any non-empty backing_rule_id.
 *
 * Race safety: serial allocation + ledger append is synchronous JSONL.
 * For production concurrent safety, caller must serialize via queue or mutex;
 * the JSONL append is atomic on all supported platforms (O_APPEND).
 *
 * Composes with:
 *   KN-M1 ledger.ts + balance.ts (Forever-Stamp Joules)
 *   Pod-N gold_tablet (Gold tablet backing rule citation — stub until Pod-N LANDS)
 *   Pod-J Apiarist Hive (auto-mint on Marks-surplus close — KN-M3)
 */

import { randomUUID } from "crypto";
import { appendJoulesEntry, readAllJoulesEntries, type JoulesEntry } from "./ledger.js";
import { computeBalance, getCurrentHolder, isInCirculation } from "./balance.js";

// ─── Default conversion rate ─────────────────────────────────────────────────

export const DEFAULT_JOULES_PER_100_MARKS = 1;

// ─── Gold tablet stub (replace with Pod-N import when LANDED) ────────────────

export interface BackingRule {
  id: string;
  joules_per_100_marks: number;
  description: string;
}

/**
 * Resolve a backing rule by ID.
 * Stub: accepts any non-empty string; returns default rate.
 * Replace with gold_tablet_query import when Pod-N LANDS.
 */
export function resolveBackingRule(backing_rule_id: string): BackingRule | null {
  if (!backing_rule_id || !backing_rule_id.trim()) return null;
  // Stub — default rate until gold_tablet infrastructure lands
  return {
    id: backing_rule_id,
    joules_per_100_marks: DEFAULT_JOULES_PER_100_MARKS,
    description: `Backing rule ${backing_rule_id} (stub — wire to Pod-N gold_tablet_query on LAND)`,
  };
}

// ─── Marks stub (replace with Marks ledger import when available) ─────────────

/** Stub: always returns sufficient balance. Wire to Marks ledger when available. */
function checkMarksBalance(member_id: string, required_marks: number): boolean {
  // TODO: wire to Marks ledger (Pod-? Marks infrastructure)
  // For now: accept any positive amount (stub per PHASE C note in KN-M2 prompt)
  return required_marks > 0;
}

// ─── Mint result ─────────────────────────────────────────────────────────────

export interface MintResult {
  success: boolean;
  entry?: JoulesEntry;
  error?: string;
  joule_uuid?: string;
  face_value?: number;
}

// ─── JoulesOperations ────────────────────────────────────────────────────────

export class JoulesOperations {
  /**
   * Mint a new Joule from Marks-surplus.
   *
   * 1. Verify Marks balance >= marks_surplus
   * 2. Look up backing rule from Gold tablet (Pod-N stub)
   * 3. Compute face_value per backing rule
   * 4. Append mint entry to Joules ledger
   * 5. ONE-WAY VALVE: Marks consumed; never recoverable from Joules
   */
  async mintFromMarksSurplus(opts: {
    member_id: string;
    marks_surplus: number;
    backing_rule_id: string;
  }): Promise<MintResult> {
    if (opts.marks_surplus <= 0) {
      return { success: false, error: "marks_surplus must be positive" };
    }

    if (!checkMarksBalance(opts.member_id, opts.marks_surplus)) {
      return {
        success: false,
        error: `Insufficient Marks balance for member ${opts.member_id}. Required: ${opts.marks_surplus}`,
      };
    }

    const rule = resolveBackingRule(opts.backing_rule_id);
    if (!rule) {
      return {
        success: false,
        error: `Backing rule '${opts.backing_rule_id}' not found. Provide a valid Gold tablet ID.`,
      };
    }

    // face_value = floor(marks_surplus / 100) * joules_per_100_marks
    const face_value = Math.max(1, Math.floor(opts.marks_surplus / 100) * rule.joules_per_100_marks);
    const joule_uuid = randomUUID();

    const entry = appendJoulesEntry({
      joule_uuid,
      tx_type: "mint",
      face_value,
      minted_from_marks: opts.marks_surplus,
      mark_backing_rule_pointer: rule.id,
      to_member_id: opts.member_id,
    });

    // ONE-WAY VALVE: Marks are consumed here.
    // In production: call Marks ledger deduction. Stub: logged in entry only.

    return { success: true, entry, joule_uuid, face_value };
  }

  /**
   * Transfer a Joule from one member to another.
   * Preserves face_value exactly (forever-stamp semantics).
   */
  async transfer(opts: {
    from: string;
    to: string;
    joule_uuid: string;
  }): Promise<{ success: boolean; entry?: JoulesEntry; error?: string }> {
    const current_holder = getCurrentHolder(opts.joule_uuid);
    if (!current_holder) {
      return {
        success: false,
        error: `Joule ${opts.joule_uuid} not found or already redeemed`,
      };
    }
    if (current_holder !== opts.from) {
      return {
        success: false,
        error: `Member ${opts.from} does not hold Joule ${opts.joule_uuid}. Current holder: ${current_holder}`,
      };
    }

    // Retrieve canonical face_value from mint record (forever-stamp)
    const mintEntry = readAllJoulesEntries().find(
      (e) => e.joule_uuid === opts.joule_uuid && e.tx_type === "mint"
    );
    if (!mintEntry) {
      return { success: false, error: `No mint record found for Joule ${opts.joule_uuid}` };
    }

    const entry = appendJoulesEntry({
      joule_uuid: opts.joule_uuid,
      tx_type: "transfer",
      face_value: mintEntry.face_value, // preserved exactly
      from_member_id: opts.from,
      to_member_id: opts.to,
      mark_backing_rule_pointer: mintEntry.mark_backing_rule_pointer,
    });

    return { success: true, entry };
  }

  /**
   * Redeem a Joule against a civilization-class work target.
   * Removes the Joule from circulation permanently.
   */
  async redeem(opts: {
    member_id: string;
    joule_uuid: string;
    redemption_target: string;
  }): Promise<{ success: boolean; entry?: JoulesEntry; error?: string }> {
    if (!opts.redemption_target.trim()) {
      return { success: false, error: "redemption_target is required (civilization-class work descriptor)" };
    }

    const current_holder = getCurrentHolder(opts.joule_uuid);
    if (!current_holder) {
      return {
        success: false,
        error: `Joule ${opts.joule_uuid} not found or already redeemed`,
      };
    }
    if (current_holder !== opts.member_id) {
      return {
        success: false,
        error: `Member ${opts.member_id} does not hold Joule ${opts.joule_uuid}`,
      };
    }

    const mintEntry = readAllJoulesEntries().find(
      (e) => e.joule_uuid === opts.joule_uuid && e.tx_type === "mint"
    );
    if (!mintEntry) {
      return { success: false, error: `No mint record found for Joule ${opts.joule_uuid}` };
    }

    const entry = appendJoulesEntry({
      joule_uuid: opts.joule_uuid,
      tx_type: "redeem",
      face_value: mintEntry.face_value,
      from_member_id: opts.member_id,
      to_member_id: opts.member_id,
      redemption_target: opts.redemption_target,
    });

    return { success: true, entry };
  }
}
