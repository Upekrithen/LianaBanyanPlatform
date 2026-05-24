/**
 * Watchdog Knight — Long-Running Daemon (Bushel BP034)
 *
 * LB-STACK-0165 Watchdog Cooperative Repair Loop
 * LB-STACK-0243 R-PRODUCTION-FIRST
 *
 * Polls all subject health checks on a configurable cadence (default 60s).
 * Applies alerting rules, persists state, writes heartbeat.
 *
 * Run:   node dist/watchdog/daemon.js
 * Stop:  SIGTERM (graceful) or Ctrl-C (SIGINT)
 *
 * Environment:
 *   WATCHDOG_POLL_MS     — poll cadence in ms (default 60000)
 *   WATCHDOG_PORT        — optional HTTP status server port (default 7777)
 *
 * G1 gate: long-running process with configurable cadence + graceful shutdown.
 * G6 gate: self-monitoring via heartbeat + stuck detection.
 */

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

import { runAllChecks }       from "./health_checks/index.js";
import {
  loadState, saveState, appendHistory, updateSubjectResult, writeHeartbeat, readHeartbeat,
} from "./state_store.js";
import { dispatchCoroner }          from "./alerting/coroner_dispatch.js";
import { dispatchMoneyPennyAlert }  from "./alerting/moneypenny_dispatch.js";
import { dispatchHallMonitor }      from "./alerting/hall_monitor_dispatch.js";
import { watchdogStatus }           from "./mcp_tools/watchdog_status.js";
import type { HealthCheckResult, WatchdogState } from "./types.js";
import {
  SUBJECT_CONFIGS,
  MULTI_DOWN_ALERT_COUNT,
  CRITICAL_DOWN_ALERT_MS,
} from "./types.js";

// ─── Config ───────────────────────────────────────────────────────────────────

const POLL_MS  = parseInt(process.env.WATCHDOG_POLL_MS ?? "60000", 10);
const HTTP_PORT = parseInt(process.env.WATCHDOG_PORT ?? "7777", 10);
const SELF_STUCK_MS = POLL_MS * 5;  // G6: if no heartbeat in 5 polls, self-restart

// Track when critical subjects first went down (for 5-min alert)
const criticalDownSince: Map<string, number> = new Map();

// Track which subjects have already triggered Hall Monitor this cycle
let hallMonitorFired = false;
let pollCount = 0;

// ─── Poll Logic ───────────────────────────────────────────────────────────────

async function runPollCycle(state: WatchdogState): Promise<WatchdogState> {
  const results = await runAllChecks();
  let updatedState = state;

  const downResults: HealthCheckResult[] = [];

  for (const result of results) {
    const prev = updatedState.subjects[result.subject];
    const prevStatus = prev?.status ?? 'unknown';

    // Status change detection
    if (prevStatus !== result.status) {
      appendHistory({
        event_type: 'status_change',
        subject: result.subject,
        from_status: prevStatus,
        to_status: result.status,
        details: result.metadata.error ?? undefined,
        ts: result.checked_at,
      });

      // ok/degraded → down: dispatch Coroner (G4)
      if (result.status === 'down' && prevStatus !== 'down') {
        dispatchCoroner(result, "status_flip_to_down");
        appendHistory({
          event_type: 'coroner_dispatch',
          subject: result.subject,
          from_status: prevStatus,
          to_status: 'down',
          ts: new Date().toISOString(),
        });
      }

      // down → ok: recovery receipt
      if (result.status === 'ok' && prevStatus === 'down') {
        criticalDownSince.delete(result.subject);
        appendHistory({
          event_type: 'recovery',
          subject: result.subject,
          from_status: 'down',
          to_status: 'ok',
          details: `Auto-recovery detected after ${result.latency_ms}ms`,
          ts: new Date().toISOString(),
        });
        console.log(`[watchdog] RECOVERY: subject="${result.subject}" is back up`);
      }
    }

    // Track critical subjects' down duration
    const config = SUBJECT_CONFIGS[result.subject];
    if (result.status === 'down') {
      downResults.push(result);
      if (config?.critical && !criticalDownSince.has(result.subject)) {
        criticalDownSince.set(result.subject, Date.now());
      }
    } else {
      criticalDownSince.delete(result.subject);
    }

    updatedState = updateSubjectResult(updatedState, result);
  }

  // G4: Hall Monitor — 3+ subjects simultaneously down
  if (downResults.length >= MULTI_DOWN_ALERT_COUNT && !hallMonitorFired) {
    hallMonitorFired = true;
    dispatchHallMonitor(downResults);
    appendHistory({
      event_type: 'hall_monitor_dispatch',
      details: `${downResults.length} subjects simultaneously down: ${downResults.map(r => r.subject).join(", ")}`,
      ts: new Date().toISOString(),
    });
  } else if (downResults.length < MULTI_DOWN_ALERT_COUNT) {
    hallMonitorFired = false;
  }

  // G4: MoneyPenny — critical subject down >5 min
  const criticallyOverdue = Array.from(criticalDownSince.entries())
    .filter(([, since]) => Date.now() - since > CRITICAL_DOWN_ALERT_MS)
    .map(([subject]) => subject);

  if (criticallyOverdue.length > 0) {
    const overdueResults = downResults.filter(r => criticallyOverdue.includes(r.subject));
    if (overdueResults.length > 0) {
      const longestDown = Math.max(
        ...criticallyOverdue.map(s => Date.now() - (criticalDownSince.get(s) ?? Date.now())),
      );
      dispatchMoneyPennyAlert(overdueResults, longestDown);
      appendHistory({
        event_type: 'moneypenny_dispatch',
        details: `Critical subjects down >${Math.round(CRITICAL_DOWN_ALERT_MS / 60000)}min: ${criticallyOverdue.join(", ")}`,
        ts: new Date().toISOString(),
      });
      // Clear so we don't re-alert until they recover and go down again
      for (const s of criticallyOverdue) criticalDownSince.delete(s);
    }
  }

  pollCount += 1;
  updatedState = { ...updatedState, poll_count: pollCount };
  return updatedState;
}

// ─── Self-Monitoring (G6) ─────────────────────────────────────────────────────

function checkSelfHealth(): void {
  const hb = readHeartbeat();
  if (!hb) return;
  const ageMs = Date.now() - new Date(hb.ts).getTime();
  if (ageMs > SELF_STUCK_MS) {
    console.error(`[watchdog] G6: Watchdog appears stuck (heartbeat ${Math.round(ageMs / 1000)}s old) — attempting self-restart`);
    appendHistory({
      event_type: 'self_restart_attempt',
      details: `Heartbeat stale ${Math.round(ageMs / 1000)}s — self-restart triggered`,
      ts: new Date().toISOString(),
    });
    process.exit(2);
  }
}

// ─── HTTP Status Server ───────────────────────────────────────────────────────

function startStatusServer(): void {
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    if (req.url === "/healthz" && req.method === "GET") {
      const status = watchdogStatus();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(status, null, 2));
      return;
    }
    if (req.url === "/status" && req.method === "GET") {
      const status = watchdogStatus();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(status, null, 2));
      return;
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "not found" }));
  });

  server.listen(HTTP_PORT, "127.0.0.1", () => {
    console.log(`[watchdog] HTTP status server listening on 127.0.0.1:${HTTP_PORT}`);
  });

  server.on("error", (err: Error) => {
    // Non-fatal: HTTP server optional — daemon continues without it
    console.error(`[watchdog] HTTP server error (non-fatal): ${err.message}`);
  });
}

// ─── Main Daemon Loop ─────────────────────────────────────────────────────────

async function startDaemon(): Promise<void> {
  console.log(`[watchdog] Watchdog Knight daemon starting — poll_ms=${POLL_MS} — BP034`);
  console.log(`[watchdog] LB-STACK-0165 Cooperative Repair Loop activated`);

  // G3: restore state from disk
  let state = loadState();
  state = { ...state, daemon_start: new Date().toISOString(), poll_count: 0 };
  saveState(state);

  // Start HTTP status server
  startStatusServer();

  // Initial poll immediately on start
  console.log(`[watchdog] Running initial health check sweep...`);
  try {
    state = await runPollCycle(state);
    saveState(state);
    writeHeartbeat(state.poll_count);
    appendHistory({ event_type: 'poll_cycle_complete', details: `Initial sweep`, ts: new Date().toISOString() });
    console.log(`[watchdog] Initial sweep complete — ${Object.keys(state.subjects).length} subjects checked`);
  } catch (err) {
    console.error(`[watchdog] Initial sweep error:`, err);
  }

  // Poll loop
  const pollInterval = setInterval(async () => {
    try {
      state = await runPollCycle(state);
      saveState(state);
      writeHeartbeat(state.poll_count);
      appendHistory({
        event_type: 'poll_cycle_complete',
        details: `cycle #${state.poll_count}`,
        ts: new Date().toISOString(),
      });

      const subjects = Object.values(state.subjects);
      const ok = subjects.filter(s => s.status === 'ok').length;
      const degraded = subjects.filter(s => s.status === 'degraded').length;
      const down = subjects.filter(s => s.status === 'down').length;
      console.log(`[watchdog] cycle #${state.poll_count} — ok=${ok} degraded=${degraded} down=${down}`);
    } catch (err) {
      console.error(`[watchdog] Poll cycle error:`, err);
    }
  }, POLL_MS);

  // G6: self-health check every 2x poll cycles
  setInterval(checkSelfHealth, POLL_MS * 2);

  // G1: graceful shutdown on SIGTERM / SIGINT
  function shutdown(sig: string): void {
    console.log(`[watchdog] Received ${sig} — persisting state and shutting down`);
    clearInterval(pollInterval);
    saveState(state);
    writeHeartbeat(state.poll_count);
    appendHistory({
      event_type: 'poll_cycle_complete',
      details: `Graceful shutdown on ${sig}`,
      ts: new Date().toISOString(),
    });
    process.exit(0);
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT",  () => shutdown("SIGINT"));

  console.log(`[watchdog] Daemon running — next poll in ${POLL_MS / 1000}s`);
}

startDaemon().catch(err => {
  console.error("[watchdog] Fatal startup error:", err);
  process.exit(1);
});
