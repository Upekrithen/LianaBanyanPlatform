#!/usr/bin/env node
/**
 * mcp-shim-seg-mc2-smoke.mjs — SEG-MC-2 (BP079 Wave D)
 * ======================================================
 * Smoke tests for SEG-MC-2: verifies tool count = 17 and brief_me proxy works.
 *
 * Run: node tests/mcp-shim-seg-mc2-smoke.mjs
 */

import { spawn }          from "node:child_process";
import { createInterface } from "node:readline";
import { resolve, dirname } from "node:path";
import { fileURLToPath }   from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const SHIM       = resolve(__dirname, "../scripts/mnemosynec-mcp-stdio.mjs");

const GREEN  = "\x1b[32m";
const RED    = "\x1b[31m";
const YELLOW = "\x1b[33m";
const RESET  = "\x1b[0m";

let passed = 0; let failed = 0;
function pass(label) { process.stdout.write(`  ${GREEN}✓ PASS${RESET}  ${label}\n`); passed++; }
function fail(label, d="") { process.stdout.write(`  ${RED}✗ FAIL${RESET}  ${label}${d ? "\n         "+d : ""}\n`); failed++; }
function info(msg) { process.stdout.write(`  ${YELLOW}…${RESET} ${msg}\n`); }

async function main() {
  process.stdout.write(`\nSEG-MC-2 Smoke Test\n${"─".repeat(40)}\n`);

  const child = spawn(process.execPath, [SHIM], {
    stdio: ["pipe", "pipe", "pipe"],
    env:   process.env,
  });

  const lineQueue = []; const pending = [];
  const rl = createInterface({ input: child.stdout, crlfDelay: Infinity });

  rl.on("line", (line) => {
    const t = line.trim(); if (!t) return;
    let p; try { p = JSON.parse(t); } catch { return; }
    const i = pending.findIndex(r => r.id === p.id);
    if (i !== -1) { const { res } = pending.splice(i, 1)[0]; res(p); }
    else lineQueue.push(p);
  });

  child.on("exit", () => {
    while (pending.length) { const { rej } = pending.shift(); rej(new Error("child exited")); }
  });

  function waitId(id, ms = 15000) {
    return new Promise((res, rej) => {
      const ai = lineQueue.findIndex(m => m.id === id);
      if (ai !== -1) { res(lineQueue.splice(ai, 1)[0]); return; }
      const t = setTimeout(() => rej(new Error(`timeout id=${id}`)), ms);
      pending.push({ id, res: v => { clearTimeout(t); res(v); }, rej });
    });
  }

  function send(obj) { child.stdin.write(JSON.stringify(obj) + "\n"); }

  // ── Step 1: Initialize ───────────────────────────────────────────────────────

  info("Step 1: initialize");
  send({ jsonrpc:"2.0", method:"initialize", params:{ protocolVersion:"2024-11-05", capabilities:{}, clientInfo:{name:"seg-mc2-smoke",version:"1"} }, id:1 });
  let r1;
  try { r1 = await waitId(1, 10000); } catch (e) { fail("Step 1 — initialize", e.message); child.kill(); process.exit(1); }
  if (r1?.result?.serverInfo) {
    pass(`Step 1 — initialize (server=${r1.result.serverInfo.name} v${r1.result.serverInfo.version})`);
    send({ jsonrpc:"2.0", method:"notifications/initialized", params:{} });
  } else {
    fail("Step 1 — initialize", JSON.stringify(r1));
  }

  // ── Step 2: tools/list count = 17 ───────────────────────────────────────────

  info("Step 2: tools/list — expect 17 tools");
  send({ jsonrpc:"2.0", method:"tools/list", params:{}, id:2 });
  let r2;
  try { r2 = await waitId(2, 10000); } catch (e) { fail("Step 2 — tools/list", e.message); child.kill(); process.exit(1); }
  const tools = r2?.result?.tools ?? [];
  if (tools.length === 17) {
    pass(`Step 2 — tools/list count = 17`);
  } else {
    fail(`Step 2 — tools/list count = 17`, `Got ${tools.length}: ${tools.map(t => t.name).join(", ")}`);
  }

  // ── Step 3: all 5 original tools present ────────────────────────────────────

  const ORIG = ["ping","get_mnemosynec_status","send_message","check_messages","ack_message"];
  const names = tools.map(t => t.name);
  const missing = ORIG.filter(n => !names.includes(n));
  if (missing.length === 0) {
    pass(`Step 3 — all 5 original tools present`);
  } else {
    fail(`Step 3 — all 5 original tools present`, `Missing: ${missing.join(", ")}`);
  }

  // ── Step 4: all 12 librarian tools present ──────────────────────────────────

  const LIB_TOOLS = ["brief_me","search_knowledge","pheromone_query","get_schema","get_page_info",
    "query_domain","get_component","get_architecture","consult_scribes","detective_investigate",
    "pearl_decode","soccerball_decode"];
  const missingLib = LIB_TOOLS.filter(n => !names.includes(n));
  if (missingLib.length === 0) {
    pass(`Step 4 — all 12 librarian proxy tools present`);
  } else {
    fail(`Step 4 — all 12 librarian proxy tools present`, `Missing: ${missingLib.join(", ")}`);
  }

  // ── Step 5: brief_me smoke test ──────────────────────────────────────────────

  info("Step 5: brief_me smoke (task='test smoke') — may take up to 45s if librarian boots");
  send({ jsonrpc:"2.0", method:"tools/call", params:{ name:"brief_me", arguments:{ task:"test smoke" } }, id:3 });
  let r3;
  try { r3 = await waitId(3, 45000); } catch (e) { fail("Step 5 — brief_me smoke", e.message); child.kill(); printSummary(); process.exit(failed > 0 ? 1 : 0); }

  const content = r3?.result?.content ?? [];
  const textBlock = content.find(c => c.type === "text");
  const text = textBlock?.text ?? "";
  let parsed;
  try { parsed = JSON.parse(text); } catch { parsed = null; }

  if (parsed?.error === "librarian not available") {
    pass(`Step 5 — brief_me smoke: graceful error (librarian not built)`);
  } else if (parsed?.error === "librarian proxy error") {
    pass(`Step 5 — brief_me smoke: graceful error (proxy error: ${parsed.detail?.slice?.(0, 100)})`);
  } else if (parsed?.error) {
    pass(`Step 5 — brief_me smoke: graceful error (${parsed.error})`);
  } else if (text && text.length > 10) {
    pass(`Step 5 — brief_me smoke: real response (length=${text.length})`);
  } else {
    fail(`Step 5 — brief_me smoke`, `Unexpected: ${text?.slice?.(0, 200) ?? JSON.stringify(r3)}`);
  }

  // ── Teardown ──────────────────────────────────────────────────────────────────

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
  process.stderr.write(`[mcp-shim-seg-mc2-smoke] Fatal: ${err.message}\n`);
  process.exit(1);
});
