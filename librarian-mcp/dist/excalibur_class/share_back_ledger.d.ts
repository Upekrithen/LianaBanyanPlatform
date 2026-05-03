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
/**
 * Records share-back entries for all opted-in members when a subscription payment occurs.
 * Returns the list of created ledger entries.
 */
export declare function recordShareBackForPayment(sliceId: string, members: Array<{
    member_id: string;
    contribution_share_proportion: number;
    opt_in_status: string;
}>, subscriptionRevenue: number, periodStart: string, periodEnd: string): ShareBackLedgerEntry[];
/** Returns all unpaid share-back entries for a given member. */
export declare function getPendingShareBacks(memberId: string): ShareBackLedgerEntry[];
/** Returns all share-back entries for a given slice. */
export declare function getShareBacksForSlice(sliceId: string): ShareBackLedgerEntry[];
/** Total share-back earned by a member across all slices. */
export declare function getTotalShareBackEarned(memberId: string): number;
/** Marks share-back entries as paid out (batch). */
export declare function markShareBacksPaidOut(entryIds: string[]): void;
/**
 * Returns a summary of share-back totals per member for a given slice.
 * Used by the public subscriber dashboard (radical transparency).
 */
export declare function getShareBackSummaryForSlice(sliceId: string): Array<{
    member_id: string;
    total_earned: number;
    total_paid_out: number;
    total_pending: number;
}>;
