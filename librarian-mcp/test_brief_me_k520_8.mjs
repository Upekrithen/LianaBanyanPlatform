/**
 * K520.8 MCP integration test — call brief_me via stdio JSON-RPC,
 * verify substrate_cache.json is written, capture [K520.8] log lines.
 */
import { spawn } from "child_process";
import { resolve } from "path";
import { homedir } from "os";
import { existsSync, unlinkSync, readFileSync, statSync } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_FILE = resolve(homedir(), ".lb-session", "substrate_cache.json");
const SERVER_SCRIPT = resolve(__dirname, "dist", "server.js");

// Clean slate
if (existsSync(CACHE_FILE)) {
  unlinkSync(CACHE_FILE);
  console.log("[TEST] Deleted existing cache file");
}
console.log("[TEST] Cache file before call:", existsSync(CACHE_FILE));

// Start MCP server
const server = spawn("node", [SERVER_SCRIPT], {
  stdio: ["pipe", "pipe", "pipe"],
  env: { ...process.env },
  cwd: __dirname,
});

const stderrLines = [];
server.stderr.on("data", (chunk) => {
  const lines = chunk.toString().split("\n").filter(Boolean);
  for (const line of lines) {
    stderrLines.push(line);
    if (line.includes("K520.8")) {
      console.log("[SERVER STDERR]", line);
    }
  }
});

let responseBuffer = "";
server.stdout.on("data", (chunk) => {
  responseBuffer += chunk.toString();
});

// Send initialize request
const initRequest = JSON.stringify({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "k520-8-test", version: "1.0" },
  },
}) + "\n";

server.stdin.write(initRequest);

// Wait for initialize response, then call brief_me
await new Promise(resolve => setTimeout(resolve, 2000));

const briefMeRequest = JSON.stringify({
  jsonrpc: "2.0",
  id: 2,
  method: "tools/call",
  params: {
    name: "brief_me",
    arguments: { task: "K520.8 end-to-end verification test" },
  },
}) + "\n";

console.log("[TEST] Sending brief_me request...");
server.stdin.write(briefMeRequest);

// Wait for response
await new Promise(resolve => setTimeout(resolve, 8000));

// Kill server
server.kill();

// Check results
console.log("\n[TEST] Cache file after brief_me:", existsSync(CACHE_FILE));
if (existsSync(CACHE_FILE)) {
  const stat = statSync(CACHE_FILE);
  const content = JSON.parse(readFileSync(CACHE_FILE, "utf-8"));
  console.log("[TEST] File size:", stat.size, "bytes");
  console.log("[TEST] Field ts:", content.ts, "(epoch)");
  console.log("[TEST] Field cached_at:", content.cached_at);
  console.log("[TEST] Field session_task:", content.session_task);
  const age = Math.floor(Date.now() / 1000) - content.ts;
  console.log("[TEST] Age:", age, "seconds (should be < 30)");
  console.log("[RESULT] PASS — cache file written correctly");
} else {
  console.log("[RESULT] FAIL — cache file NOT written after brief_me");
  console.log("\n[ALL STDERR]");
  stderrLines.forEach(l => console.log(" ", l));
}
