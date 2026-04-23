#!/usr/bin/env node
/**
 * supervise.mjs — K449(B118): MCP process supervisor
 * ====================================================
 * Spawns the MCP server as a child process and restarts it on crash.
 * Logs to a rolling .supervisor.log (10MB cap, 3 files).
 * Writes .supervisor.pid for external monitoring and clean teardown.
 *
 * Usage:
 *   node scripts/supervise.mjs          ← start supervisor
 *   node scripts/supervise.mjs --stop   ← stop via PID file
 *
 * Configuration via env vars (useful for testing):
 *   SUPERVISOR_CHILD_CMD          override child executable (default: node)
 *   SUPERVISOR_CHILD_ARGS         JSON array override for child args
 *   SUPERVISOR_PID_FILE           override PID file path
 *   SUPERVISOR_LOG_FILE           override log file path
 *   SUPERVISOR_LOG_MAX_BYTES      log rotation threshold (default: 10MB)
 *   SUPERVISOR_RESTART_DELAY_MS   base restart delay (default: 5000ms)
 *   SUPERVISOR_THRASH_DELAY_MS    thrash-loop ceiling delay (default: 30000ms)
 *   SUPERVISOR_FAST_CRASH_MS      fast-crash threshold (default: 3000ms)
 *
 * Restart policy:
 *   - Exit code 0 → intentional shutdown; do NOT restart
 *   - SIGTERM from parent → supervisor's child is stopped; do NOT restart
 *   - Any other exit → restart after RESTART_DELAY_MS
 *   - 3+ consecutive fast crashes (child lived < FAST_CRASH_MS) → THRASH_DELAY_MS
 *
 * Zero npm dependencies. Pure Node.js built-ins only.
 */

import {
  existsSync, writeFileSync, unlinkSync, statSync,
  renameSync, appendFileSync, readFileSync,
} from "node:fs";
import { spawn } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const ROOT       = resolve(__dirname, "..");

// ── Configuration ─────────────────────────────────────────────────────────────

const PID_FILE  = process.env.SUPERVISOR_PID_FILE ?? resolve(ROOT, ".supervisor.pid");
const LOG_FILE  = process.env.SUPERVISOR_LOG_FILE ?? resolve(ROOT, ".supervisor.log");

const LOG_MAX_BYTES        = parseInt(process.env.SUPERVISOR_LOG_MAX_BYTES   ?? String(10 * 1024 * 1024));
const LOG_MAX_FILES        = 3;
const RESTART_DELAY_MS     = parseInt(process.env.SUPERVISOR_RESTART_DELAY_MS  ?? "5000");
const THRASH_DELAY_MS      = parseInt(process.env.SUPERVISOR_THRASH_DELAY_MS   ?? "30000");
const FAST_CRASH_MS        = parseInt(process.env.SUPERVISOR_FAST_CRASH_MS     ?? "3000");
const THRASH_TRIGGER_COUNT = 3;

const CHILD_CMD  = process.env.SUPERVISOR_CHILD_CMD ?? process.execPath;
const CHILD_ARGS = process.env.SUPERVISOR_CHILD_ARGS
  ? JSON.parse(process.env.SUPERVISOR_CHILD_ARGS)
  : [resolve(ROOT, "dist/server.js")];

// ── Rolling log ───────────────────────────────────────────────────────────────

function rotateLogs() {
  // Shift: .supervisor.log.2 → .log.3, .log.1 → .log.2, .log → .log.1
  for (let i = LOG_MAX_FILES; i >= 1; i--) {
    const src = i === 1 ? LOG_FILE : `${LOG_FILE}.${i - 1}`;
    const dst = `${LOG_FILE}.${i}`;
    if (existsSync(src)) {
      try { renameSync(src, dst); } catch { /* ignore race */ }
    }
  }
}

function log(msg) {
  const line = `[${new Date().toISOString()}] [supervisor] ${msg}\n`;
  process.stderr.write(line);
  try {
    if (existsSync(LOG_FILE)) {
      const { size } = statSync(LOG_FILE);
      if (size >= LOG_MAX_BYTES) rotateLogs();
    }
    appendFileSync(LOG_FILE, line, "utf-8");
  } catch { /* never let log errors kill the supervisor */ }
}

// ── PID file ──────────────────────────────────────────────────────────────────

function writePid() {
  writeFileSync(PID_FILE, String(process.pid), "utf-8");
}

function removePid() {
  if (existsSync(PID_FILE)) {
    try { unlinkSync(PID_FILE); } catch { /* ignore */ }
  }
}

// ── --stop command ────────────────────────────────────────────────────────────

async function cmdStop() {
  if (!existsSync(PID_FILE)) {
    process.stderr.write("[supervisor] No .supervisor.pid found. Is the supervisor running?\n");
    process.exit(1);
  }

  const raw = readFileSync(PID_FILE, "utf-8").trim();
  const pid = parseInt(raw);
  if (isNaN(pid)) {
    process.stderr.write(`[supervisor] Invalid PID in .supervisor.pid: "${raw}"\n`);
    process.exit(1);
  }

  try {
    process.kill(pid, "SIGTERM");
    process.stderr.write(`[supervisor] Sent SIGTERM to supervisor PID ${pid}\n`);
  } catch (err) {
    process.stderr.write(`[supervisor] Failed to signal PID ${pid}: ${err.message}\n`);
    process.exit(1);
  }

  // Poll for clean exit (up to 5 s), then SIGKILL fallback
  const deadline = Date.now() + 5_000;
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 100));
    try {
      process.kill(pid, 0); // throws if process no longer exists
    } catch {
      process.stderr.write(`[supervisor] Supervisor PID ${pid} has exited cleanly.\n`);
      process.exit(0);
    }
  }

  process.stderr.write("[supervisor] Timeout waiting for clean exit. Sending SIGKILL.\n");
  try { process.kill(pid, "SIGKILL"); } catch { /* already gone */ }
  process.exit(0);
}

// ── Main supervisor loop ──────────────────────────────────────────────────────

async function runSupervisor() {
  writePid();
  log(`Supervisor started (PID=${process.pid})`);
  log(`Child: ${CHILD_CMD} ${CHILD_ARGS.join(" ")}`);

  let stopping      = false;
  let cleanedUp     = false;
  let currentChild  = null;
  let fastCrashCount = 0;

  function cleanup() {
    if (cleanedUp) return;
    cleanedUp = true;
    removePid();
    log("Supervisor exiting cleanly.");
    process.exit(0);
  }

  function onParentSignal(sigName) {
    log(`Supervisor received ${sigName}. Stopping child and exiting.`);
    stopping = true;
    if (currentChild) {
      currentChild.kill("SIGTERM");
      // cleanup() will be called after child's exit event resolves the promise
    } else {
      cleanup();
    }
  }

  process.on("SIGTERM", () => onParentSignal("SIGTERM"));
  process.on("SIGINT",  () => onParentSignal("SIGINT"));

  // Main restart loop
  while (!stopping) {
    const startTime = Date.now();
    log(`Starting child process.`);

    const child = spawn(CHILD_CMD, CHILD_ARGS, {
      stdio: ["inherit", "inherit", "pipe"],
      env: process.env,
    });
    currentChild = child;

    // Capture last ~2 KB of stderr for exit log; forward to our stderr in real time
    let stderrTail = "";
    child.stderr.on("data", chunk => {
      const text = chunk.toString();
      stderrTail = (stderrTail + text).slice(-2048);
      process.stderr.write(chunk);
    });

    // Await child exit
    const result = await new Promise(resolve => {
      child.on("exit", (code, signal) => {
        currentChild = null;
        resolve({ code, signal, uptime: Date.now() - startTime });
      });
    });

    const { code, signal, uptime } = result;
    log(`Child exited: code=${code ?? "null"} signal=${signal ?? "none"} uptime=${uptime}ms`);
    if (stderrTail.trim()) {
      log(`Stderr tail: ${stderrTail.slice(-500).trim()}`);
    }

    // Don't restart when supervisor is shutting down
    if (stopping) {
      cleanup();
      return;
    }

    // Clean exit (code 0) = intentional shutdown (e.g. SIGTERM to child from host reboot)
    if (code === 0) {
      log("Child exited cleanly (code 0). Assuming intentional shutdown. Not restarting.");
      cleanup();
      return;
    }

    // Determine restart delay based on thrash detection
    const isFastCrash = uptime < FAST_CRASH_MS;
    if (isFastCrash) {
      fastCrashCount++;
      log(`Fast crash detected (uptime ${uptime}ms < ${FAST_CRASH_MS}ms). fastCrashCount=${fastCrashCount}.`);
    } else {
      fastCrashCount = 0;
    }

    const delay = fastCrashCount >= THRASH_TRIGGER_COUNT ? THRASH_DELAY_MS : RESTART_DELAY_MS;
    if (fastCrashCount >= THRASH_TRIGGER_COUNT) {
      log(`Thrash loop (${fastCrashCount} fast crashes). Backing off ${delay}ms to prevent thrash.`);
    } else {
      log(`Scheduling restart in ${delay}ms.`);
    }

    // Interruptible sleep — check stopping flag after wakeup
    await new Promise(r => setTimeout(r, delay));

    if (stopping) {
      cleanup();
      return;
    }
  }
}

// ── Entry point ───────────────────────────────────────────────────────────────

if (process.argv.includes("--stop")) {
  cmdStop();
} else {
  runSupervisor();
}
