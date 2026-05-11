// scoring/axis_f_federation.mjs
// Banyan Scale Axis F — Federation (cross-OS portability)

/**
 * Score Axis F.
 * Full score requires identical pass-criteria outcomes on Win11 AND Ubuntu.
 * In dry-run mode, single-OS result is recorded; cross-OS pending Pawn P-12.
 *
 * @param {{ win11: boolean | null; ubuntu: boolean | null }} crossOsResults
 * @param {number} tier
 */
export function scoreAxisF(crossOsResults, tier) {
  const { win11, ubuntu } = crossOsResults ?? {};
  let score = 0;
  if (win11 === true)  score += 50;
  if (ubuntu === true) score += 50;

  return {
    tier,
    score,
    win11_pass: win11,
    ubuntu_pass: ubuntu,
    cross_os_verified: win11 === true && ubuntu === true,
    note: ubuntu === null
      ? 'Ubuntu run pending — Pawn P-12 cross-OS verification dispatch'
      : undefined,
  };
}
