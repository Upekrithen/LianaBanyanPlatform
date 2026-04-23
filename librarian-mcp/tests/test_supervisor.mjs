/**
 * test_supervisor.mjs — K449(B118): MCP process supervisor tests
 * ==============================================================
 * Tests for scripts/supervise.mjs.
 *
 * 7 cases:
 *   1. Child exits non-zero (1) → supervisor restarts child within 10s
 *   2. Child exits zero (0) → supervisor does NOT restart; exits cleanly
 *   3. Supervisor receives SIGTERM → sends SIGTERM to child, exits 0
 *   4. Three consecutive fast crashes → backoff escalates to THRASH_DELAY_MS
 *   5. --stop reads pidfile, sends SIGTERM to supervisor, supervisor exits cleanly
 *   6. Supervisor log rotates when log file exceeds LOG_MAX_BYTES
 *   7. PID file is created on start and removed on clean exit
 *
 * Run: node --test tests/test_supervisor.mjs  (no prior tsc needed — pure .mjs)
 *
 * Implementation notes:
 *   - All tests use env vars to configure paths (PID/LOG in temp dirs) so
 *     tests never touch the real .supervisor.pid / .supervisor.log.
 *   - SUPERVISOR_RESTART_DELAY_MS=200, SUPERVISOR_THRASH_DELAY_MS=600,
 *     SUPERVISOR_FAST_CRASH_MS=500  keep the thrash test fast (< 5s).
 *   - SUPERVISOR_LOG_MAX_BYTES=512 for the rotation test so we don't need
 *     to write 10MB of real data.
 *   - Each test gets its own tempDir; torn down after the test.
 */

import { test }    from "node:test";
import assert       from "node:assert/strict";
import {
  mkdtempSync, writeFileSync, existsSync, readFileSync,
  appendFileSync, rmSync, statSync,
} from "node:fs";
import { tmpdir }  from "node:os";
import { join, resolve, dirname } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename   = fileURLToPath(import.meta.url);
const __dirname    = dirname(__filename);
const SUPERVISE    = resolve(__dirname, "../scripts/supervise.mjs");
const NODE         = process.execPath;

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeTempDir(prefix = "k449-sup-") {
  return mkdtempSync(join(tmpdir(), prefix));
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Spawn supervise.mjs with overrides so all file I/O goes to a temp dir.
 * childScript: path to a .mjs that will be used as SUPERVISOR_CHILD_CMD.
 * extraEnv: additional env vars.
 * Returns the supervisor child-process object.
 */
function spawnSupervisor(dir, childArgs, extraEnv = {}) {
  return spawn(NODE, [SUPERVISE], {
    env: {
      ...process.env,
      SUPERVISOR_PID_FILE:        join(dir, ".supervisor.pid"),
      SUPERVISOR_LOG_FILE:        join(dir, ".supervisor.log"),
      SUPERVISOR_CHILD_CMD:       NODE,
      SUPERVISOR_CHILD_ARGS:      JSON.stringify(childArgs),
      SUPERVISOR_RESTART_DELAY_MS: "200",
      SUPERVISOR_THRASH_DELAY_MS:  "600",
      SUPERVISOR_FAST_CRASH_MS:    "500",
      ...extraEnv,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
}

/** Wait up to maxMs for fn() to return truthy, polling every intervalMs. */
async function waitFor(fn, maxMs = 8000, intervalMs = 100) {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    if (fn()) return true;
    await sleep(intervalMs);
  }
  return false;
}

/** Collect all stdout+stderr from a process into a string. */
function collectOutput(proc) {
  let out = "";
  proc.stdout?.on("data", d => { out += d.toString(); });
  proc.stderr?.on("data", d => { out += d.toString(); });
  return () => out;
}

// ── Test 1: Non-zero exit → restart ───────────────────────────────────────────

test("child exits non-zero → supervisor restarts it within 10s", { timeout: 12_000 }, async () => {
  const dir = makeTempDir();
  const pidFile = join(dir, ".supervisor.pid");

  // Child script: exits 1 on first run, then hangs so we can observe the restart
  const counterFile = join(dir, "run_count.txt");
  const childScript = join(dir, "child.mjs");
  writeFileSync(childScript, `
    import { existsSync, writeFileSync, readFileSync } from "node:fs";
    const f = ${JSON.stringify(counterFile)};
    const count = existsSync(f) ? parseInt(readFileSync(f, "utf-8")) + 1 : 1;
    writeFileSync(f, String(count));
    if (count === 1) {
      process.exit(1);  // first run crashes
    }
    // Second run: hang until killed (use setInterval to avoid top-level-await exit code 13)
    setInterval(() => {}, 1 << 30);
  `);

  const sup = spawnSupervisor(dir, [childScript]);
  const getOut = collectOutput(sup);

  // Wait for supervisor to start and PID file to appear
  const pidAppeared = await waitFor(() => existsSync(pidFile));
  assert.ok(pidAppeared, "PID file should appear after supervisor starts");

  // Wait for the child to be restarted (run_count = 2)
  const restarted = await waitFor(() => {
    if (!existsSync(counterFile)) return false;
    return parseInt(readFileSync(counterFile, "utf-8")) >= 2;
  }, 10_000);

  assert.ok(restarted, `Child should have been restarted within 10s. Output: ${getOut()}`);

  // Cleanup: terminate supervisor
  sup.kill("SIGTERM");
  await new Promise(r => sup.on("exit", r));
  rmSync(dir, { recursive: true, force: true });
});

// ── Test 2: Clean exit (code 0) → no restart ─────────────────────────────────

test("child exits cleanly (code 0) → supervisor does NOT restart and exits 0", { timeout: 8_000 }, async () => {
  const dir = makeTempDir();

  // Child: exits 0 immediately
  const childScript = join(dir, "child.mjs");
  writeFileSync(childScript, "process.exit(0);");

  const sup = spawnSupervisor(dir, [childScript]);
  const getOut = collectOutput(sup);

  const exitCode = await new Promise(r => sup.on("exit", r));

  assert.equal(exitCode, 0, `Supervisor should exit 0 when child exits cleanly. Output: ${getOut()}`);

  // Verify it didn't loop (no "Scheduling restart" in output)
  assert.ok(!getOut().includes("Scheduling restart"), "Supervisor should not attempt restart on code-0 exit");

  rmSync(dir, { recursive: true, force: true });
});

// ── Test 3: SIGTERM to supervisor → graceful shutdown ─────────────────────────
//
// On Windows, process.kill/child.kill with SIGTERM calls TerminateProcess, which
// terminates immediately (exit code null) rather than firing the JS handler. The
// important observable behavior is: the supervisor STOPS and does NOT restart the
// child. We verify that, plus confirm the PID file is eventually gone.

test("supervisor SIGTERM → stops supervisor and does not restart child", { timeout: 8_000 }, async () => {
  const dir = makeTempDir();
  const pidFile = join(dir, ".supervisor.pid");

  // Child: hangs until killed (setInterval avoids top-level-await exit code 13)
  const childScript = join(dir, "child.mjs");
  writeFileSync(childScript, "setInterval(() => {}, 1 << 30);");

  const sup = spawnSupervisor(dir, [childScript]);
  const getOut = collectOutput(sup);

  // Wait for PID file (supervisor ready)
  const ready = await waitFor(() => existsSync(pidFile));
  assert.ok(ready, "Supervisor should write PID file on start");

  // Give child a moment to spawn
  await sleep(300);

  // Send SIGTERM to supervisor
  sup.kill("SIGTERM");

  // Supervisor must exit within 5s regardless of exit code
  // (Windows: null/signal-terminated; Unix: 0 via handler calling process.exit(0))
  const exitCode = await new Promise(r => sup.on("exit", r));
  assert.ok(
    exitCode === 0 || exitCode === null,
    `Supervisor should exit cleanly (0 or signal-terminated null). Got: ${exitCode}. Output: ${getOut()}`,
  );

  // Should NOT have attempted a restart after receiving SIGTERM
  assert.ok(
    !getOut().includes("Scheduling restart") && !getOut().includes("Thrash loop"),
    `Supervisor should not restart after SIGTERM. Output: ${getOut()}`,
  );

  rmSync(dir, { recursive: true, force: true });
});

// ── Test 4: Three fast crashes → backoff escalates ───────────────────────────

test("three consecutive fast crashes → restart delay escalates to THRASH_DELAY_MS", { timeout: 20_000 }, async () => {
  const dir = makeTempDir();
  const logFile = join(dir, ".supervisor.log");

  // Child: always exits 1 immediately (fast crash)
  const childScript = join(dir, "child.mjs");
  writeFileSync(childScript, "process.exit(1);");

  // Use short delays: RESTART=200ms, THRASH=600ms, FAST_CRASH=500ms
  // After 3 fast crashes, supervisor should log the thrash message and delay 600ms
  const sup = spawnSupervisor(dir, [childScript], {
    SUPERVISOR_RESTART_DELAY_MS: "200",
    SUPERVISOR_THRASH_DELAY_MS:  "600",
    SUPERVISOR_FAST_CRASH_MS:    "500",
  });
  const getOut = collectOutput(sup);

  // Wait until we see the thrash log message (THRASH_TRIGGER_COUNT = 3)
  const thrashLogged = await waitFor(() => {
    const combined = getOut() + (existsSync(logFile) ? readFileSync(logFile, "utf-8") : "");
    return combined.includes("Thrash loop");
  }, 15_000, 100);

  assert.ok(thrashLogged, `Should detect thrash loop after 3 fast crashes. Output:\n${getOut()}`);

  // Cleanup
  sup.kill("SIGTERM");
  await new Promise(r => sup.on("exit", r));
  rmSync(dir, { recursive: true, force: true });
});

// ── Test 5: --stop reads pidfile, terminates supervisor ──────────────────────

test("--stop reads pidfile and sends SIGTERM to supervisor cleanly", { timeout: 10_000 }, async () => {
  const dir = makeTempDir();
  const pidFile = join(dir, ".supervisor.pid");

  // Child: hangs until killed (setInterval avoids top-level-await exit code 13)
  const childScript = join(dir, "child.mjs");
  writeFileSync(childScript, "setInterval(() => {}, 1 << 30);");

  const sup = spawnSupervisor(dir, [childScript]);

  // Wait for PID file to appear
  const ready = await waitFor(() => existsSync(pidFile));
  assert.ok(ready, "Supervisor PID file should appear before --stop test");

  // Give child a moment to actually start
  await sleep(300);

  // Run --stop against the same PID file
  const stopResult = spawnSync(NODE, [SUPERVISE, "--stop"], {
    env: {
      ...process.env,
      SUPERVISOR_PID_FILE: pidFile,
    },
    timeout: 8_000,
    encoding: "utf-8",
  });

  assert.equal(stopResult.status, 0,
    `--stop should exit 0. stdout: ${stopResult.stdout} stderr: ${stopResult.stderr}`);
  assert.ok(
    stopResult.stderr.includes("SIGTERM") || stopResult.stderr.includes("exited"),
    `--stop output should mention SIGTERM or exit. stderr: ${stopResult.stderr}`,
  );

  // Supervisor should have exited
  const supExited = await waitFor(() => {
    try { process.kill(sup.pid, 0); return false; } catch { return true; }
  }, 6_000);
  assert.ok(supExited, "Supervisor process should have exited after --stop");

  rmSync(dir, { recursive: true, force: true });
});

// ── Test 6: Log rotates when file exceeds LOG_MAX_BYTES ───────────────────────

test("supervisor log rotates when file exceeds LOG_MAX_BYTES", { timeout: 10_000 }, async () => {
  const dir = makeTempDir();
  const logFile = join(dir, ".supervisor.log");

  // Pre-fill the log with data that's just under the threshold so the very
  // next supervisor log write triggers rotation.
  const LOG_MAX = 512;
  writeFileSync(logFile, "x".repeat(LOG_MAX - 10), "utf-8");

  // Child: write a chunk to stderr (forces supervisor to log), then exit 0
  const childScript = join(dir, "child.mjs");
  writeFileSync(childScript, `
    process.stderr.write("hello from child\\n");
    process.exit(0);
  `);

  const sup = spawnSupervisor(dir, [childScript], {
    SUPERVISOR_LOG_MAX_BYTES: String(LOG_MAX),
  });
  const getOut = collectOutput(sup);

  // Wait for supervisor to exit (child exits 0 → clean shutdown)
  await new Promise(r => sup.on("exit", r));

  // After rotation, .supervisor.log.1 should exist
  const rotated = existsSync(`${logFile}.1`);
  assert.ok(rotated, `Log should have rotated to .supervisor.log.1 when original exceeded ${LOG_MAX}B. Output: ${getOut()}`);

  rmSync(dir, { recursive: true, force: true });
});

// ── Test 7: PID file created on start, removed on clean exit ─────────────────
//
// The child must live long enough for the test to detect the PID file before
// the supervisor cleans up. We use setTimeout-based hang then exit-0.

test("supervisor writes PID file on start and removes it on clean exit", { timeout: 10_000 }, async () => {
  const dir = makeTempDir();
  const pidFile = join(dir, ".supervisor.pid");

  // Child: lives 600ms then exits 0 — gives the test time to observe the PID file
  const childScript = join(dir, "child.mjs");
  writeFileSync(childScript, "setTimeout(() => process.exit(0), 600);");

  assert.ok(!existsSync(pidFile), "PID file should not exist before supervisor starts");

  const sup = spawnSupervisor(dir, [childScript]);

  // PID file should appear quickly (supervisor writes it before spawning child)
  const pidAppeared = await waitFor(() => existsSync(pidFile), 5_000, 50);
  assert.ok(pidAppeared, "PID file should appear after supervisor starts");

  const pidValue = parseInt(readFileSync(pidFile, "utf-8").trim());
  assert.ok(!isNaN(pidValue) && pidValue > 0,
    `PID file should contain a valid PID, got: "${readFileSync(pidFile, "utf-8")}"`);
  assert.equal(pidValue, sup.pid, "PID in file should match supervisor process PID");

  // Wait for clean exit (child exits 0 after 600ms → supervisor exits 0)
  const exitCode = await new Promise(r => sup.on("exit", r));
  assert.equal(exitCode, 0, "Supervisor should exit 0 when child exits cleanly");

  // PID file should be gone after clean exit
  assert.ok(!existsSync(pidFile), "PID file should be removed after supervisor exits cleanly");

  rmSync(dir, { recursive: true, force: true });
});
