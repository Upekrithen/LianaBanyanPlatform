/**
 * mcp-stdio-shim-basic.mjs — SEG-MC-1 (BP079 Wave D)
 * ====================================================
 * Basic integration test for librarian-mcp/scripts/mnemosynec-mcp-stdio.mjs.
 *
 * Test steps:
 *   1. Spawn the shim as a subprocess (stdin/stdout)
 *   2. Send MCP initialize request and verify response
 *   3. Send tools/list and verify all 5 tools are registered
 *   4. Call ping tool and assert pong:true
 *   5. Gracefully terminate the shim
 *
 * Run:
 *   node tests/mcp-stdio-shim-basic.mjs
 *
 * Exit code 0 = all steps passed. Non-zero = failure.
 */

import { spawn }      from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath }    from "node:url";
import { createInterface }  from "node:readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const SHIM       = resolve(__dirname, "../scripts/mnemosynec-mcp-stdio.mjs");
const NODE       = process.execPath;

// ── Helpers ───────────────────────────────────────────────────────────────────

const RESET  = "\x1b[0m";
const GREEN  = "\x1b[32m";
const RED    = "\x1b[31m";
const YELLOW = "\x1b[33m";

let passed = 0;
let failed = 0;

function pass(label) {
  process.stdout.write(`  ${GREEN}✓ PASS${RESET}  ${label}\n`);
  passed++;
}

function fail(label, detail = "") {
  process.stdout.write(`  ${RED}✗ FAIL${RESET}  ${label}${detail ? `\n         ${detail}` : ""}\n`);
  failed++;
}

function info(msg) {
  process.stdout.write(`  ${YELLOW}…${RESET} ${msg}\n`);
}

/**
 * Wait for the next complete JSON-RPC message from the shim.
 * Each message is a newline-delimited JSON object.
 * Rejects after timeoutMs if nothing arrives.
 */
function waitForResponse(lineQueue, pendingResolvers, timeoutMs = 6000) {
  return new Promise((resolve, reject) => {
    if (lineQueue.length > 0) {
      resolve(lineQueue.shift());
      return;
    }
    const timer = setTimeout(() => {
      const idx = pendingResolvers.indexOf(entry);
      if (idx !== -1) pendingResolvers.splice(idx, 1);
      reject(new Error(`Timed out waiting for MCP response after ${timeoutMs}ms`));
    }, timeoutMs);
    const entry = { resolve: (val) => { clearTimeout(timer); resolve(val); }, reject };
    pendingResolvers.push(entry);
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  process.stdout.write(`\nSEG-MC-1 Basic Shim Test\n${"─".repeat(40)}\n`);

  // Spawn the shim
  const child = spawn(NODE, [SHIM], {
    stdio: ["pipe", "pipe", "pipe"],
    env: {
      ...process.env,
      // Point messages to a temp-safe location so tests don't pollute ~/.mnemosynec
      MNEMOSYNEC_HTTP_BASE: "http://127.0.0.1:11480",
    },
  });

  const lineQueue        = [];
  const pendingResolvers = [];

  // Collect stderr for diagnostics
  let stderrBuf = "";
  child.stderr.on("data", chunk => { stderrBuf += chunk.toString(); });

  // Line-delimited JSON reader on stdout
  const rl = createInterface({ input: child.stdout, crlfDelay: Infinity });
  rl.on("line", (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    let parsed;
    try { parsed = JSON.parse(trimmed); } catch { return; }
    if (pendingResolvers.length > 0) {
      const { resolve } = pendingResolvers.shift();
      resolve(parsed);
    } else {
      lineQueue.push(parsed);
    }
  });

  // Track whether the child exited unexpectedly
  let childExited = false;
  child.on("exit", (code) => {
    childExited = true;
    // Drain any pending resolvers with an error
    while (pendingResolvers.length > 0) {
      const { reject } = pendingResolvers.shift();
      reject(new Error(`Shim exited (code=${code}) before response arrived`));
    }
  });

  /**
   * Send a JSON-RPC message to the shim over stdin.
   */
  function send(obj) {
    child.stdin.write(JSON.stringify(obj) + "\n");
  }

  // ── Step 1: Initialize ────────────────────────────────────────────────────

  info("Step 1: Sending MCP initialize request…");
  send({
    jsonrpc: "2.0",
    method:  "initialize",
    params:  {
      protocolVersion: "2024-11-05",
      capabilities:    {},
      clientInfo:      { name: "test", version: "1.0" },
    },
    id: 1,
  });

  let resp1;
  try {
    resp1 = await waitForResponse(lineQueue, pendingResolvers, 8000);
  } catch (err) {
    fail("Step 1 — initialize response received", err.message);
    fail("Step 2 — tools/list response received", "skipped (no response from Step 1)");
    fail("Step 3 — tools/list contains all 5 expected tools", "skipped");
    fail("Step 4 — ping returns pong:true", "skipped");
    child.kill("SIGTERM");
    printSummary();
    process.exit(1);
  }

  if (resp1?.id === 1 && resp1?.result?.serverInfo) {
    pass("Step 1 — initialize response received");
    // Send the required 'initialized' notification before calling any tools
    send({ jsonrpc: "2.0", method: "notifications/initialized", params: {} });
  } else {
    fail("Step 1 — initialize response received", `Got: ${JSON.stringify(resp1)}`);
  }

  // ── Step 2: tools/list ────────────────────────────────────────────────────

  info("Step 2: Sending tools/list request…");
  send({ jsonrpc: "2.0", method: "tools/list", params: {}, id: 2 });

  let resp2;
  try {
    resp2 = await waitForResponse(lineQueue, pendingResolvers, 8000);
  } catch (err) {
    fail("Step 2 — tools/list response received", err.message);
    fail("Step 3 — tools/list contains all 5 expected tools", "skipped");
    fail("Step 4 — ping returns pong:true", "skipped");
    child.kill("SIGTERM");
    printSummary();
    process.exit(1);
  }

  if (resp2?.id === 2 && Array.isArray(resp2?.result?.tools)) {
    pass("Step 2 — tools/list response received");
  } else {
    fail("Step 2 — tools/list response received", `Got: ${JSON.stringify(resp2)}`);
  }

  // ── Step 3: Verify all 5 tools present ───────────────────────────────────

  const EXPECTED_TOOLS = ["ping", "get_mnemosynec_status", "send_message", "check_messages", "ack_message"];
  const registeredTools = (resp2?.result?.tools ?? []).map(t => t.name);

  const missingTools = EXPECTED_TOOLS.filter(name => !registeredTools.includes(name));
  if (missingTools.length === 0) {
    pass(`Step 3 — tools/list contains all 5 expected tools [${EXPECTED_TOOLS.join(", ")}]`);
  } else {
    fail(
      "Step 3 — tools/list contains all 5 expected tools",
      `Missing: ${missingTools.join(", ")} | Registered: ${registeredTools.join(", ")}`,
    );
  }

  // ── Step 4: Call ping ─────────────────────────────────────────────────────

  info("Step 4: Calling ping tool…");
  send({
    jsonrpc: "2.0",
    method:  "tools/call",
    params:  { name: "ping", arguments: {} },
    id:      3,
  });

  let resp3;
  try {
    resp3 = await waitForResponse(lineQueue, pendingResolvers, 8000);
  } catch (err) {
    fail("Step 4 — ping returns pong:true", err.message);
    child.kill("SIGTERM");
    printSummary();
    process.exit(1);
  }

  let pingOk = false;
  try {
    const content = resp3?.result?.content ?? [];
    const textBlock = content.find(c => c.type === "text");
    const parsed = JSON.parse(textBlock?.text ?? "{}");
    pingOk = parsed?.pong === true;
    if (pingOk) {
      pass(`Step 4 — ping returns pong:true (version=${parsed.version}, shim=${parsed.shim})`);
    } else {
      fail("Step 4 — ping returns pong:true", `Got: ${JSON.stringify(parsed)}`);
    }
  } catch (err) {
    fail("Step 4 — ping returns pong:true", `Parse error: ${err.message} | Raw: ${JSON.stringify(resp3)}`);
  }

  // ── Teardown ──────────────────────────────────────────────────────────────

  child.stdin.end();
  child.kill("SIGTERM");
  await new Promise(r => { child.on("exit", r); setTimeout(r, 1500); });

  printSummary();
  process.exit(failed > 0 ? 1 : 0);
}

function printSummary() {
  process.stdout.write(`${"─".repeat(40)}\n`);
  const total = passed + failed;
  if (failed === 0) {
    process.stdout.write(`${GREEN}ALL ${total}/${total} STEPS PASSED${RESET}\n\n`);
  } else {
    process.stdout.write(`${RED}${failed} STEP(S) FAILED${RESET} (${passed}/${total} passed)\n\n`);
  }
}

main().catch(err => {
  process.stderr.write(`[mcp-stdio-shim-basic] Fatal: ${err.message}\n`);
  process.exit(1);
});
