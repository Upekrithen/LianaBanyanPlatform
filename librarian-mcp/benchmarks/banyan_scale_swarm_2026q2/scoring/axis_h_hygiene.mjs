// scoring/axis_h_hygiene.mjs
// Banyan Scale Axis H — Hygiene (cross-vendor continuous routing)

/**
 * Score Axis H.
 * Full score: can route between vendors mid-task without state loss.
 * Score: 0 (single-vendor lock-in) → 100 (native cross-vendor, zero token loss).
 *
 * @param {{ crossVendorContinuity: boolean; tokenLossPct?: number }} opts
 * @param {number} tier
 */
export function scoreAxisH(opts, tier) {
  const { crossVendorContinuity, tokenLossPct } = opts ?? {};
  if (!crossVendorContinuity) {
    return { tier, score: 0, cross_vendor_continuity: false, token_loss_pct: null };
  }
  const lossPct = tokenLossPct ?? 0;
  // 100 pts for zero loss, scaled down by loss percentage
  const score = Math.max(0, Math.round(100 - lossPct));
  return {
    tier,
    score,
    cross_vendor_continuity: true,
    token_loss_pct: parseFloat(lossPct.toFixed(1)),
  };
}
