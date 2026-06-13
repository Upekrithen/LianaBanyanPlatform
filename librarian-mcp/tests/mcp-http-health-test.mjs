#!/usr/bin/env node
/**
 * mcp-http-health-test.mjs — SEG-MC-6 health endpoint smoke test
 * ==============================================================
 * Spawns the HTTP server as a child process with --force,
 * waits 1s for startup, fetches /mcp/health, asserts status=="ok",
 * then kills the server. Reports PASS or FAIL.
 */

import { spawn }  from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath }    from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const HTTP_SCRIPT = resolve(__dirname, "../scripts/mnemosynec-mcp-http.mjs");
const PORT        = parseInt(process.env.MCP_HTTP_PORT ?? "11482", 10);
const HEALTH_URL  = `http://127.0.0.1:${PORT}/mcp/health`;

let passed = 0;
let failed = 0;

function pass(label) {
  console.log(`  ✔ ${label}`);
  passed++;
}

function fail(label, reason) {
  console.error(`  ✘ ${label}: ${reason}`);
  failed++;
}

async function runTest() {
  console.log("SEG-MC-6 HTTP health test");
  console.log(`  Script: ${HTTP_SCRIPT}`);
  console.log(`  URL:    ${HEALTH_URL}`);
  console.log("");

  // Spawn server child
  const child = spawn(process.execPath, [HTTP_SCRIPT, "--force"], {
    stdio: ["ignore", "pipe", "pipe"],
    env:   { ...process.env, MCP_HTTP_PORT: String(PORT) },
  });

  const stderrLines = [];
  child.stderr.on("data", (chunk) => {
    stderrLines.push(chunk.toString());
  });

  child.on("error", (err) => {
    fail("server spawn", err.message);
  });

  // Wait for startup
  await sleep(1500);

  // Check if child is still running
  if (child.exitCode !== null) {
    fail("server startup", `child exited early with code ${child.exitCode}`);
    console.log("\nServer stderr:");
    stderrLines.forEach(l => process.stdout.write("    " + l));
    reportAndExit();
    return;
  }

  pass("server spawned and running");

  // Fetch health endpoint
  let healthOk = false;
  let healthBody = null;
  try {
    const response = await fetch(HEALTH_URL, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      fail("health HTTP status", `expected 200, got ${response.status}`);
    } else {
      healthBody = await response.json();

      if (healthBody?.status === "ok") {
        pass(`health status == "ok"`);
        healthOk = true;
      } else {
        fail(`health status == "ok"`, `got ${JSON.stringify(healthBody?.status)}`);
      }

      if (typeof healthBody?.version === "string") {
        pass(`health version present: ${healthBody.version}`);
      } else {
        fail("health version present", `got ${JSON.stringify(healthBody?.version)}`);
      }

      if (healthBody?.port === PORT) {
        pass(`health port == ${PORT}`);
      } else {
        fail(`health port == ${PORT}`, `got ${JSON.stringify(healthBody?.port)}`);
      }
    }
  } catch (err) {
    fail("health fetch", err.message);
  }

  // Kill server
  try {
    child.kill("SIGTERM");
    await sleep(300);
    if (child.exitCode === null) child.kill("SIGKILL");
  } catch {}

  pass("server killed");

  reportAndExit();

  function reportAndExit() {
    console.log("");
    console.log(`Results: ${passed} passed, ${failed} failed`);

    if (healthBody) {
      console.log("\nHealth response:");
      console.log(JSON.stringify(healthBody, null, 2));
    }

    if (failed > 0) {
      console.error("\nSEG-MC-6 health test: FAIL");
      process.exit(1);
    } else {
      console.log("\nSEG-MC-6 health test: PASS");
      process.exit(0);
    }
  }
}

runTest().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
