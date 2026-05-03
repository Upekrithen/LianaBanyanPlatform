/**
 * Per-Scribe scoring (K438b) — mirror of registry.scoreScribe but for
 * Supabase-fetched MemberScribeRow shape.
 *
 * Identical formula to librarian-mcp/src/scribes/registry.ts:scoreScribe
 * (#2270 Claim 1(c) primary*1.0 + adjacent*0.5) so the member-scoped
 * Cathedral and Bishop's stitchpunks Cathedral retrieve with the same
 * algorithm.
 */
import type { MemberScribeRow } from "./client.js";
export interface ScoreResult {
    score: number;
    primaryMatches: string[];
    adjacentMatches: string[];
}
export declare function scoreScribeAgainstThemes(scribe: MemberScribeRow, themes: string[]): ScoreResult;
