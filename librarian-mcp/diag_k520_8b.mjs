// Test the REAL readTablet + writeSubstrateCache via the compiled cathedral module
import { readTablet } from "./dist/scribes/cathedral.js";
import { resolve } from "path";
import { homedir } from "os";
import { writeFileSync, mkdirSync, statSync, existsSync, unlinkSync } from "fs";

const SUBSTRATE_CACHE_DIR = resolve(homedir(), ".lb-session");
const SUBSTRATE_CACHE_FILE = resolve(SUBSTRATE_CACHE_DIR, "substrate_cache.json");

// Delete first
if (existsSync(SUBSTRATE_CACHE_FILE)) {
  unlinkSync(SUBSTRATE_CACHE_FILE);
  console.error("[K520.8 DIAG-B] deleted existing cache");
}

// Test readTablet
let gotchas = [];
try {
  gotchas = readTablet("OperationalGotchas");
  console.error("[K520.8 DIAG-B] readTablet OK, entries=" + gotchas.length);
} catch (err) {
  console.error("[K520.8 DIAG-B] readTablet THREW: " + String(err));
  gotchas = [];
}

// Now attempt the full write
const target = SUBSTRATE_CACHE_FILE;
try {
  mkdirSync(SUBSTRATE_CACHE_DIR, { recursive: true });
  const payload = JSON.stringify({
    ts: Math.floor(Date.now() / 1000),
    session_task: "K520.8 real diag",
    briefing: "test briefing",
    gotchas,
    cached_at: new Date().toISOString(),
  }, null, 2);
  console.error("[K520.8 DIAG-B] payload size=" + payload.length + " bytes");
  writeFileSync(target, payload, "utf-8");
  const { size } = statSync(target);
  console.error("[K520.8 DIAG-B] write OK, file size=" + size);
} catch (err) {
  console.error("[K520.8 DIAG-B] write FAILED: " + String(err));
}

console.error("[K520.8 DIAG-B] file exists after write:", existsSync(SUBSTRATE_CACHE_FILE));
