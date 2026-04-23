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

export function scoreScribeAgainstThemes(
  scribe: MemberScribeRow,
  themes: string[],
): ScoreResult {
  const primaryMatches = new Set<string>();
  const adjacentMatches = new Set<string>();

  const primaryHaystack = scribe.keywords.map((k) => k.toLowerCase());
  const primaryFieldLower = scribe.primary_field.toLowerCase();
  const adjacentHaystack = (scribe.adjacents || []).map((a) =>
    (a.field || "").toLowerCase(),
  );

  for (const themeRaw of themes) {
    const theme = (themeRaw || "").toLowerCase().trim();
    if (!theme) continue;

    const hitsPrimary =
      primaryHaystack.some((kw) => kw && (theme.includes(kw) || kw.includes(theme))) ||
      primaryFieldLower.includes(theme);
    if (hitsPrimary) {
      primaryMatches.add(themeRaw);
      continue;
    }

    const hitsAdjacent = adjacentHaystack.some(
      (field) => field && (field.includes(theme) || theme.includes(field)),
    );
    if (hitsAdjacent) adjacentMatches.add(themeRaw);
  }

  const score = primaryMatches.size * 1.0 + adjacentMatches.size * 0.5;
  return {
    score,
    primaryMatches: Array.from(primaryMatches),
    adjacentMatches: Array.from(adjacentMatches),
  };
}
