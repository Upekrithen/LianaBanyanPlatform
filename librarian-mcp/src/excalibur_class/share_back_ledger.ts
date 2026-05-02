/**
 * Excalibur Share-Back Ledger — KN105 / BP016
 * =============================================
 * Per-Member ledger entries for share-back-pay from Excalibur Class subscriptions.
 * Append-only JSONL ledger — mirrors Iron Tablet single-writer pattern.
 *
 * Every time a subscriber pays (or subscription renews), share-back entries
 * are generated for all opted-in contributing Members.
 *
 * Radical-transparency per Meta-Law (CANONICAL_LAWS Section I 3.7):
 * share-back totals are auditable at the slice level.
 */

import type { ShareBackLedgerEntry } from "./types.js";
import { calculateMemberShareBack } from "./pricing_engine.js";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const STITCHPUNKS_DIR =
  process.env.LIBRARIAN_STITCHPUNKS_DIR
    ? resolve(process.env.LIBRARIAN_STITCHPUNKS_DIR)
    : resolve(__dirname, "..", "..", "stitchpunks");

const EXCALIBUR_DIR = resolve(STITCHPUNKS_DIR, "excalibur_class");
const LEDGER_PATH = resolve(EXCALIBUR_DIR, "share_back_ledger.jsonl");

// ─── Storage ──────────────────────────────────────────────────────────────

function ensureDir(): void {
  if (!existsSync(EXCALIBUR_DIR)) mkdirSync(EXCALIBUR_DIR, { recursive: true });
}

function appendLedgerEntry(entry: ShareBackLedgerEntry): void {
  ensureDir();
  writeFileSync(LEDGER_PATH, JSON.stringify(entry) + "\n", { flag: "a", encoding: "utf-8" });
}

function readAllEntries(): ShareBackLedgerEntry[] {
  ensureDir();
  if (!existsSync(LEDGER_PATH)) return [];
  const lines = readFileSync(LEDGER_PATH, "utf-8").split("\n").filter(l => l.trim());
  return lines.flatMap(line => {
    try {
      return [JSON.parse(line) as ShareBackLedgerEntry];
    } catch {
      return [];
    }
  });
}

// ─── Ledger Operations ────────────────────────────────────────────────────

/**
 * Records share-back entries for all opted-in members when a subscription payment occurs.
 * Returns the list of created ledger entries.
 */
export function recordShareBackForPayment(
  sliceId: string,
  members: Array<{
    member_id: string;
    contribution_share_proportion: number;
    opt_in_status: string;
  }>,
  subscriptionRevenue: number,
  periodStart: string,
  periodEnd: string,
): ShareBackLedgerEntry[] {
  const now = new Date().toISOString();
  const optedIn = members.filter(m => m.opt_in_status === "opted_in");
  const entries: ShareBackLedgerEntry[] = [];

  for (const member of optedIn) {
    const memberShare = calculateMemberShareBack(member, subscriptionRevenue);
    const costPortion = subscriptionRevenue / 1.20;

    const entry: ShareBackLedgerEntry = {
      id: randomUUID(),
      slice_id: sliceId,
      member_id: member.member_id,
      subscription_revenue: subscriptionRevenue,
      cost_portion: Math.round(costPortion * 100) / 100,
      member_share: memberShare,
      period_start: periodStart,
      period_end: periodEnd,
      created_at: now,
      paid_out: false,
      paid_out_at: null,
    };

    appendLedgerEntry(entry);
    entries.push(entry);
  }

  return entries;
}

/** Returns all unpaid share-back entries for a given member. */
export function getPendingShareBacks(memberId: string): ShareBackLedgerEntry[] {
  return readAllEntries().filter(e => e.member_id === memberId && !e.paid_out);
}

/** Returns all share-back entries for a given slice. */
export function getShareBacksForSlice(sliceId: string): ShareBackLedgerEntry[] {
  return readAllEntries().filter(e => e.slice_id === sliceId);
}

/** Total share-back earned by a member across all slices. */
export function getTotalShareBackEarned(memberId: string): number {
  const entries = readAllEntries().filter(e => e.member_id === memberId);
  return entries.reduce((s, e) => s + e.member_share, 0);
}

/** Marks share-back entries as paid out (batch). */
export function markShareBacksPaidOut(entryIds: string[]): void {
  const now = new Date().toISOString();
  const all = readAllEntries().map(e => {
    if (entryIds.includes(e.id)) {
      return { ...e, paid_out: true, paid_out_at: now };
    }
    return e;
  });
  ensureDir();
  writeFileSync(LEDGER_PATH, all.map(e => JSON.stringify(e)).join("\n") + "\n", "utf-8");
}

/**
 * Returns a summary of share-back totals per member for a given slice.
 * Used by the public subscriber dashboard (radical transparency).
 */
export function getShareBackSummaryForSlice(sliceId: string): Array<{
  member_id: string;
  total_earned: number;
  total_paid_out: number;
  total_pending: number;
}> {
  const entries = getShareBacksForSlice(sliceId);
  const byMember = new Map<string, { earned: number; paid: number }>();

  for (const e of entries) {
    const existing = byMember.get(e.member_id) ?? { earned: 0, paid: 0 };
    existing.earned += e.member_share;
    if (e.paid_out) existing.paid += e.member_share;
    byMember.set(e.member_id, existing);
  }

  return Array.from(byMember.entries()).map(([member_id, { earned, paid }]) => ({
    member_id,
    total_earned: Math.round(earned * 100) / 100,
    total_paid_out: Math.round(paid * 100) / 100,
    total_pending: Math.round((earned - paid) * 100) / 100,
  }));
}
