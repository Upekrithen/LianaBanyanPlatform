/**
 * Watchdog — health check registry.
 * All subject checks collected here; daemon imports this index.
 */

import type { HealthCheckResult } from "../types.js";

export { checkLibrarianMcp }   from "./librarian_mcp.js";
export { checkMoneyPenny }     from "./moneypenny.js";
export { checkDrekaskip }      from "./drekaskip.js";
export { checkHearth }         from "./hearth.js";
export { checkSweatScribe }    from "./sweat_scribe.js";
export { checkTearsScribe }    from "./tears_scribe.js";
export { checkForagerScribe }  from "./forager_scribe.js";
export { checkSubstrateApi }   from "./substrate_api.js";
export { checkKnightBishopBridge } from "./knight_bishop_bridge.js";

import { checkLibrarianMcp }       from "./librarian_mcp.js";
import { checkMoneyPenny }         from "./moneypenny.js";
import { checkDrekaskip }          from "./drekaskip.js";
import { checkHearth }             from "./hearth.js";
import { checkSweatScribe }        from "./sweat_scribe.js";
import { checkTearsScribe }        from "./tears_scribe.js";
import { checkForagerScribe }      from "./forager_scribe.js";
import { checkSubstrateApi }       from "./substrate_api.js";
import { checkKnightBishopBridge } from "./knight_bishop_bridge.js";

export type HealthCheckFn = () => Promise<HealthCheckResult>;

/** All registered health check functions, in poll order. */
export const ALL_CHECKS: HealthCheckFn[] = [
  checkLibrarianMcp,
  checkMoneyPenny,
  checkDrekaskip,
  checkHearth,
  checkSweatScribe,
  checkTearsScribe,
  checkForagerScribe,
  checkSubstrateApi,
  checkKnightBishopBridge,
];

/** Run all checks concurrently; returns results map keyed by subject. */
export async function runAllChecks(): Promise<HealthCheckResult[]> {
  return Promise.all(ALL_CHECKS.map(fn => fn()));
}
