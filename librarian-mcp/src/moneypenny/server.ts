/**
 * MoneyPenny — Module Exports + Daemon Entry (Bushel 82, BP034)
 *
 * This file serves two purposes:
 *   1. Module exports for Librarian MCP server wiring
 *   2. Standalone HTTP daemon (runs on port 7890 when invoked directly)
 *
 * G11 gate: health check returns 200 + recent activity; crash-recovery on restart.
 */

// ─── Module Exports (for Librarian MCP server.ts) ─────────────────────────────

export { moneyPennyRoute } from "./mcp_tools/moneypenny_route.js";
export { moneyPennyHold, moneyPennyReleaseHold } from "./mcp_tools/moneypenny_hold.js";
export { moneyPennyResurrect } from "./mcp_tools/moneypenny_resurrect.js";
export { moneyPennyStatus } from "./mcp_tools/moneypenny_status.js";
export {
  moneyPennyAvailabilityGet,
  moneyPennyAvailabilitySet,
  moneyPennyAvailabilityInfer,
} from "./mcp_tools/moneypenny_availability.js";
export { route, overrideCallerClass } from "./gateway/router.js";
export { mcci, MCCIContextKernel } from "./mcci/context_kernel.js";
export { readAvailability, setAvailability } from "./calendar/availability_state.js";
export { autoSchedule } from "./calendar/auto_scheduler.js";
export { listAllAssignments } from "./agents/kissaki_assignment.js";
export type {
  CallerClass, AvailabilityClass, RoutingDecision, Thread, HandoffPacket,
  ContextPacket, MoneyPennyStatus, HoldHandle, TransitionPacket,
} from "./types.js";

// ─── Bootstrap ────────────────────────────────────────────────────────────────

import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";

const STATE_DIR = resolve(homedir(), ".claude", "state", "moneypenny");
const MCCI_DIR = resolve(homedir(), ".claude", "state", "mcci");

export function bootstrapMoneyPenny(): void {
  const dirs = [
    STATE_DIR,
    resolve(STATE_DIR, "calls"),
    resolve(STATE_DIR, "engagements"),
    resolve(STATE_DIR, "transition_packets"),
    MCCI_DIR,
    resolve(MCCI_DIR, "threads"),
    resolve(MCCI_DIR, "handoffs"),
  ];
  for (const dir of dirs) mkdirSync(dir, { recursive: true });
}

// ─── Health Check ─────────────────────────────────────────────────────────────

import { moneyPennyStatus } from "./mcp_tools/moneypenny_status.js";

export function healthCheck(): {
  status: "healthy" | "degraded";
  state_dirs_exist: boolean;
  founder_availability: string;
  active_threads: number;
  on_hold: number;
  receipt_count_today: number;
  ts: string;
} {
  const stateDirsExist = existsSync(STATE_DIR);
  try {
    const s = moneyPennyStatus();
    return {
      status: "healthy",
      state_dirs_exist: stateDirsExist,
      founder_availability: s.founder_availability,
      active_threads: s.active_threads,
      on_hold: s.on_hold,
      receipt_count_today: s.receipt_count_today,
      ts: new Date().toISOString(),
    };
  } catch {
    return {
      status: "degraded",
      state_dirs_exist: stateDirsExist,
      founder_availability: "unknown",
      active_threads: 0,
      on_hold: 0,
      receipt_count_today: 0,
      ts: new Date().toISOString(),
    };
  }
}
