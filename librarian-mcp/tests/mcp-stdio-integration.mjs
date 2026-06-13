#!/usr/bin/env node
/**
 * mcp-stdio-integration.mjs — SEG-MC-5 (BP079 Wave D)
 * =====================================================
 * Full integration test for librarian-mcp/scripts/mnemosynec-mcp-stdio.mjs.
 *
 * Spawns the shim as a subprocess and exercises the complete 21-tool surface
 * via JSON-RPC 2.0 over stdio.
 *
 * Test sequence (10 steps):
 *   1. initialize          — valid MCP handshake response
 *   2. tools/list          — exactly 21 tools registered
 *   3. ping                — pong:true + version string
 *   4. send_message        — {ok:true, pearl_id:<uuid>}
 *   5. check_messages      — bishop inbox contains sent pearl
 *   6. ack_message         — {ok:true}
 *   7. check_messages      — acked pearl no longer present
 *   8. pearl_emit          — ok:true (live substrate OR offline queue)
 *   9. Unicode safety      — body round-trip with 日本語テスト 🌳🤝
 *  10. brief_me            — non-empty (live or graceful error — both PASS; crash = FAIL)
 *
 * Run:
 *   node tests/mcp-stdio-integration.mjs
 *
 * Exit 0 = all steps passed. Exit 1 = any failure.
 */

import { spawn }             from "node:child_process";
import { resolve, dirname }  from "node:path";
import { fileURLToPath }     from "node:url";
import { createInterface }   from "node:readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const SHIM       = resolve(__dirname, "../scripts/mnemosynec-mcp-stdio.mjs");
const NODE       = process.execPath;

// ── ANSI colours ──────────────────────────────────────────────────────────────

const RESET  = "\x1b[0m";
const GREEN  = "\x1b[32m";
const RED    = "\x1b[31m";
const YELLOW = "\x1b[33m";

// ── Counters & per-step records ───────────────────────────────────────────────

let passed  = 0;
let failed  = 0;
let skipped = 0;

/** @type {Array<{step:number|string, status:"PASS"|"FAIL"|"SKIP", label:string, detail?:string}>} */
const stepRecords = [];

function pass(stepNum, label) {
  process.stdout.write(`  ${GREEN}✓ PASS Step ${stepNum}${RESET} — ${label}\n`);
  passed++;
  stepRecords.push({ step: stepNum, status: "PASS", label });
}

function fail(stepNum, label, detail = "") {
  process.stdout.write(
    `  ${RED}✗ FAIL Step ${stepNum}${RESET} — ${label}` +
    (detail ? `\n         ${detail}` : "") + "\n",
  );
  failed++;
  stepRecords.push({ step: stepNum, status: "FAIL", label, detail });
}

function skip(stepNum, label, reason = "") {
  process.stdout.write(
    `  ${YELLOW}SKIP Step ${stepNum}${RESET} — ${label}` +
    (reason ? `: ${reason}` : "") + "\n",
  );
  skipped++;
  stepRecords.push({ step: stepNum, status: "SKIP", label, reason });
}

function info(msg) {
  process.stdout.write(`  ${YELLOW}…${RESET} ${msg}\n`);
}

// ── waitForId factory ─────────────────────────────────────────────────────────

/**
 * Returns a function that waits for a JSON-RPC response with the given id.
 * Checks an in-memory queue first, then registers a pending resolver.
 */
function makeWaitForId(lineQueue, pendingResolvers) {
  return function waitForId(id, timeoutMs = 10000) {
    return new Promise((res, rej) => {
      const idx = lineQueue.findIndex(m => m.id === id);
      if (idx !== -1) { res(lineQueue.splice(idx, 1)[0]); return; }

      const timer = setTimeout(() => {
        const i = pendingResolvers.findIndex(r => r.id === id);
        if (i !== -1) pendingResolvers.splice(i, 1);
        rej(new Error(`Timed out after ${timeoutMs}ms waiting for id=${id}`));
      }, timeoutMs);

      pendingResolvers.push({
        id,
        res: (val) => { clearTimeout(timer); res(val); },
        rej: (err) => { clearTimeout(timer); rej(err); },
      });
    });
  };
}

// ── helpers ───────────────────────────────────────────────────────────────────

/**
 * Extract the first text-block content from an MCP tool-call response and
 * parse it as JSON. Returns the parsed object (or raw string on parse error).
 */
function extractJson(resp) {
  const text = resp?.result?.content?.find(c => c.type === "text")?.text ?? "{}";
  try { return JSON.parse(text); } catch { return { _raw: text }; }
}

// ── Main ──────────────────────────────────────────────────────────────────────

/** Populated during test run; consumed by printSummary and caller. */
let briefMeStatus = "CRASH";

async function main() {
  process.stdout.write(`\nSEG-MC-5 Full stdio Integration Test\n${"─".repeat(52)}\n`);

  // ── Spawn shim ─────────────────────────────────────────────────────────────

  const child = spawn(NODE, [SHIM], {
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env, MNEMOSYNEC_HTTP_BASE: "http://127.0.0.1:11480" },
  });

  const lineQueue        = [];
  const pendingResolvers = [];
  let   stderrBuf        = "";

  child.stderr.on("data", chunk => { stderrBuf += chunk.toString(); });

  const rl = createInterface({ input: child.stdout, crlfDelay: Infinity });
  rl.on("line", (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    let parsed;
    try { parsed = JSON.parse(trimmed); } catch { return; }

    const idx = pendingResolvers.findIndex(r => r.id === parsed.id);
    if (idx !== -1) {
      const { res } = pendingResolvers.splice(idx, 1)[0];
      res(parsed);
    } else {
      lineQueue.push(parsed);
    }
  });

  child.on("exit", (code) => {
    for (const r of pendingResolvers) {
      r.rej(new Error(`Shim exited early (code=${code})`));
    }
    pendingResolvers.length = 0;
  });

  const waitForId = makeWaitForId(lineQueue, pendingResolvers);

  function send(obj) {
    child.stdin.write(JSON.stringify(obj) + "\n");
  }

  // State carried across steps
  let sendPearlId    = null;
  let unicodePearlId = null;

  // ── Step 1: initialize ────────────────────────────────────────────────────

  info("Step 1: MCP initialize handshake…");
  send({
    jsonrpc: "2.0",
    method:  "initialize",
    params:  {
      protocolVersion: "2024-11-05",
      capabilities:    {},
      clientInfo:      { name: "seg-mc-5-test", version: "1.0" },
    },
    id: 1,
  });

  let initOk = false;
  try {
    const resp = await waitForId(1, 8000);
    if (resp?.result?.serverInfo) {
      pass(1, `MCP handshake — serverInfo: ${JSON.stringify(resp.result.serverInfo)}`);
      send({ jsonrpc: "2.0", method: "notifications/initialized", params: {} });
      initOk = true;
    } else {
      fail(1, "MCP handshake — valid serverInfo", `Got: ${JSON.stringify(resp)}`);
    }
  } catch (err) {
    fail(1, "MCP handshake", err.message);
    for (let i = 2; i <= 10; i++) skip(i, "prior step failed");
    teardown(child);
    printSummary();
    return;
  }

  // ── Step 2: tools/list — exactly 21 tools ────────────────────────────────

  info("Step 2: tools/list (expecting 21 tools)…");
  send({ jsonrpc: "2.0", method: "tools/list", params: {}, id: 2 });

  const EXPECTED_COUNT = 21;
  const EXPECTED_TOOLS = [
    "ping", "get_mnemosynec_status",
    "send_message", "check_messages", "ack_message",
    "pearl_emit", "eblet_emit", "soccerball_emit", "scribe_log",
    "brief_me", "search_knowledge", "pheromone_query",
    "get_schema", "get_page_info", "query_domain",
    "get_component", "get_architecture", "consult_scribes",
    "detective_investigate", "pearl_decode", "soccerball_decode",
  ];

  let toolNames = [];
  try {
    const resp    = await waitForId(2, 8000);
    const tools   = resp?.result?.tools ?? [];
    toolNames     = tools.map(t => t.name);
    const count   = toolNames.length;
    const missing = EXPECTED_TOOLS.filter(n => !toolNames.includes(n));
    const extra   = toolNames.filter(n => !EXPECTED_TOOLS.includes(n));

    if (count === EXPECTED_COUNT && missing.length === 0) {
      pass(2, `tools/list returns exactly ${EXPECTED_COUNT} tools ✓`);
    } else {
      const detail = [
        `count=${count} (expected ${EXPECTED_COUNT})`,
        missing.length ? `missing: ${missing.join(", ")}` : "",
        extra.length   ? `extra: ${extra.join(", ")}`     : "",
      ].filter(Boolean).join(" | ");
      fail(2, `tools/list returns exactly ${EXPECTED_COUNT} tools`, detail);
    }
  } catch (err) {
    fail(2, "tools/list", err.message);
  }

  // ── Step 3: ping ─────────────────────────────────────────────────────────

  info("Step 3: tools/call ping…");
  send({
    jsonrpc: "2.0",
    method:  "tools/call",
    params:  { name: "ping", arguments: {} },
    id:      3,
  });

  try {
    const resp   = await waitForId(3, 8000);
    const parsed = extractJson(resp);
    if (parsed?.pong === true && typeof parsed?.version === "string" && parsed.version.length > 0) {
      pass(3, `ping → pong:true, version="${parsed.version}", shim="${parsed.shim}"`);
    } else {
      fail(3, "ping → pong:true + version string", `Got: ${JSON.stringify(parsed)}`);
    }
  } catch (err) {
    fail(3, "ping", err.message);
  }

  // ── Step 4: send_message ─────────────────────────────────────────────────

  info("Step 4: send_message {from:knight, to:bishop, subject:integration-test}…");
  send({
    jsonrpc: "2.0",
    method:  "tools/call",
    params:  {
      name:      "send_message",
      arguments: {
        from:    "knight",
        to:      "bishop",
        subject: "integration-test",
        body:    "hello from SEG-MC-5",
      },
    },
    id: 4,
  });

  try {
    const resp   = await waitForId(4, 8000);
    const parsed = extractJson(resp);
    if (parsed?.ok === true && typeof parsed?.pearl_id === "string" && parsed.pearl_id.length > 0) {
      sendPearlId = parsed.pearl_id;
      pass(4, `send_message → {ok:true, pearl_id:"${sendPearlId}"}`);
    } else {
      fail(4, "send_message → {ok:true, pearl_id:<uuid>}", `Got: ${JSON.stringify(parsed)}`);
    }
  } catch (err) {
    fail(4, "send_message", err.message);
  }

  // ── Step 5: check_messages — bishop inbox contains sent pearl ─────────────

  info("Step 5: check_messages for bishop — sent pearl present…");
  send({
    jsonrpc: "2.0",
    method:  "tools/call",
    params:  { name: "check_messages", arguments: { client_id: "bishop" } },
    id:      5,
  });

  try {
    const resp     = await waitForId(5, 8000);
    const parsed   = extractJson(resp);
    const messages = parsed?.messages ?? [];

    if (!sendPearlId) {
      skip(5, "check_messages contains sent pearl", "No pearl_id from Step 4");
    } else if (messages.some(m => m.pearl_id === sendPearlId)) {
      pass(5, `check_messages → array contains sent pearl ${sendPearlId}`);
    } else {
      fail(
        5,
        "check_messages → contains sent pearl",
        `IDs in inbox: [${messages.map(m => m.pearl_id).join(", ")}]`,
      );
    }
  } catch (err) {
    fail(5, "check_messages", err.message);
  }

  // ── Step 6: ack_message ───────────────────────────────────────────────────

  info("Step 6: ack_message…");
  if (!sendPearlId) {
    skip(6, "ack_message", "No pearl_id from Step 4");
  } else {
    send({
      jsonrpc: "2.0",
      method:  "tools/call",
      params:  { name: "ack_message", arguments: { pearl_id: sendPearlId } },
      id:      6,
    });

    try {
      const resp   = await waitForId(6, 8000);
      const parsed = extractJson(resp);
      if (parsed?.ok === true) {
        pass(6, `ack_message → {ok:true} for pearl ${sendPearlId}`);
      } else {
        fail(6, "ack_message → {ok:true}", `Got: ${JSON.stringify(parsed)}`);
      }
    } catch (err) {
      fail(6, "ack_message", err.message);
    }
  }

  // ── Step 7: check_messages — acked pearl gone ─────────────────────────────

  info("Step 7: check_messages after ack — pearl should be absent…");
  send({
    jsonrpc: "2.0",
    method:  "tools/call",
    params:  { name: "check_messages", arguments: { client_id: "bishop" } },
    id:      7,
  });

  try {
    const resp     = await waitForId(7, 8000);
    const parsed   = extractJson(resp);
    const messages = parsed?.messages ?? [];

    if (!sendPearlId) {
      skip(7, "acked pearl absent from check_messages", "No pearl_id from Step 4");
    } else if (!messages.some(m => m.pearl_id === sendPearlId)) {
      pass(7, `check_messages after ack: pearl ${sendPearlId} no longer present`);
    } else {
      fail(
        7,
        "acked pearl absent from check_messages",
        `Pearl still listed. IDs: [${messages.map(m => m.pearl_id).join(", ")}]`,
      );
    }
  } catch (err) {
    fail(7, "check_messages after ack", err.message);
  }

  // ── Step 8: pearl_emit ────────────────────────────────────────────────────

  info("Step 8: pearl_emit {content:'integration test pearl', client_id:'knight'}…");
  send({
    jsonrpc: "2.0",
    method:  "tools/call",
    params:  {
      name:      "pearl_emit",
      arguments: { content: "integration test pearl", client_id: "knight" },
    },
    id: 8,
  });

  try {
    const resp   = await waitForId(8, 12000);
    const parsed = extractJson(resp);
    if (parsed?.ok === true) {
      const substrate = parsed?.substrate ?? "unknown";
      const queued    = parsed?.queued === true ? " (queued)" : "";
      pass(8, `pearl_emit → ok:true, substrate:"${substrate}"${queued}`);
    } else {
      fail(8, "pearl_emit → ok:true (live or offline queue)", `Got: ${JSON.stringify(parsed)}`);
    }
  } catch (err) {
    fail(8, "pearl_emit", err.message);
  }

  // ── Step 9: Unicode safety ────────────────────────────────────────────────

  const UNICODE_BODY   = "日本語テスト 🌳🤝 cooperative-class";
  const UNICODE_NEEDLE = "日本語テスト";

  info(`Step 9: Unicode round-trip — body="${UNICODE_BODY}"…`);

  send({
    jsonrpc: "2.0",
    method:  "tools/call",
    params:  {
      name:      "send_message",
      arguments: { from: "knight", to: "bishop", subject: "unicode-test", body: UNICODE_BODY },
    },
    id: 9,
  });

  try {
    const sendResp   = await waitForId(9, 8000);
    const sendParsed = extractJson(sendResp);
    unicodePearlId   = sendParsed?.pearl_id ?? null;

    if (!unicodePearlId) {
      fail(9, "Unicode send_message — got pearl_id", `Got: ${JSON.stringify(sendParsed)}`);
    } else {
      // Retrieve via check_messages
      send({
        jsonrpc: "2.0",
        method:  "tools/call",
        params:  { name: "check_messages", arguments: { client_id: "bishop" } },
        id:      901,
      });

      const checkResp   = await waitForId(901, 8000);
      const checkParsed = extractJson(checkResp);
      const messages    = checkParsed?.messages ?? [];
      const unicodeMsg  = messages.find(m => m.pearl_id === unicodePearlId);

      if (!unicodeMsg) {
        fail(9, "Unicode pearl found in check_messages", `pearl_id=${unicodePearlId} not in inbox`);
      } else if (unicodeMsg.body === UNICODE_BODY && unicodeMsg.body.includes(UNICODE_NEEDLE)) {
        pass(9, `Unicode body round-trip intact — "${unicodeMsg.body}"`);
      } else {
        fail(
          9,
          "Unicode body intact (no garbling / surrogate escapes)",
          `Expected: "${UNICODE_BODY}" | Got: "${unicodeMsg.body}"`,
        );
      }

      // Cleanup: ack unicode pearl
      if (unicodePearlId) {
        send({
          jsonrpc: "2.0",
          method:  "tools/call",
          params:  { name: "ack_message", arguments: { pearl_id: unicodePearlId } },
          id:      902,
        });
        await waitForId(902, 5000).catch(() => {});
      }
    }
  } catch (err) {
    fail(9, "Unicode safety test", err.message);
  }

  // ── Step 10: brief_me ─────────────────────────────────────────────────────

  info("Step 10: brief_me (librarian proxy — 35s timeout)…");
  send({
    jsonrpc: "2.0",
    method:  "tools/call",
    params:  { name: "brief_me", arguments: { task: "integration test" } },
    id:      10,
  });

  try {
    const resp    = await waitForId(10, 35000);
    const content = resp?.result?.content ?? [];
    const text    = content.find(c => c.type === "text")?.text ?? "";

    if (text.length === 0) {
      briefMeStatus = "CRASH";
      fail(10, "brief_me → non-empty response", "Empty content block returned");
    } else if (resp?.result?.isError) {
      let detail = "(see response)";
      try {
        const p = JSON.parse(text);
        detail  = p?.error ?? p?.detail ?? text.slice(0, 120);
      } catch { detail = text.slice(0, 120); }
      briefMeStatus = "GRACEFUL ERROR";
      pass(10, `brief_me → graceful error (librarian unavailable): "${detail}"`);
    } else {
      briefMeStatus = "LIVE RESPONSE";
      pass(10, `brief_me → live librarian response (${text.length} chars)`);
    }
  } catch (err) {
    briefMeStatus = "CRASH";
    fail(10, "brief_me (timeout or crash)", err.message);
  }

  // ── Teardown ──────────────────────────────────────────────────────────────

  teardown(child);
  printSummary();
}

function teardown(child) {
  try { child.stdin.end(); }   catch {}
  try { child.kill("SIGTERM"); } catch {}
}

function printSummary() {
  const total = passed + failed + skipped;
  process.stdout.write(`${"─".repeat(52)}\n`);
  if (failed === 0 && skipped === 0) {
    process.stdout.write(`${GREEN}${passed}/10 STEPS PASSED${RESET}\n\n`);
  } else if (failed === 0) {
    process.stdout.write(`${YELLOW}${passed}/10 STEPS PASSED (${skipped} skipped)${RESET}\n\n`);
  } else {
    process.stdout.write(
      `${RED}${passed}/10 STEPS PASSED` +
      ` (${failed} failed${skipped ? `, ${skipped} skipped` : ""})${RESET}\n\n`,
    );
  }
}

// ── Entry point ───────────────────────────────────────────────────────────────

main().then(() => {
  process.exit(failed > 0 ? 1 : 0);
}).catch(err => {
  process.stderr.write(`[mcp-stdio-integration] Fatal: ${err.message}\n${err.stack}\n`);
  process.exit(1);
});
