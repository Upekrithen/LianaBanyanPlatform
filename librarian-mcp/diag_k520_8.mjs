import { resolve } from "path";
import { homedir } from "os";
import { writeFileSync, mkdirSync, statSync, existsSync, unlinkSync } from "fs";

const SUBSTRATE_CACHE_DIR = resolve(homedir(), ".lb-session");
const SUBSTRATE_CACHE_FILE = resolve(SUBSTRATE_CACHE_DIR, "substrate_cache.json");

console.error("[K520.8 DIAG] homedir:", homedir());
console.error("[K520.8 DIAG] target:", SUBSTRATE_CACHE_FILE);
console.error("[K520.8 DIAG] dir exists:", existsSync(SUBSTRATE_CACHE_DIR));

// Delete cache first to simulate fresh session
if (existsSync(SUBSTRATE_CACHE_FILE)) {
  unlinkSync(SUBSTRATE_CACHE_FILE);
  console.error("[K520.8 DIAG] deleted existing cache file");
}

function writeSubstrateCache(task, briefingText) {
  const target = SUBSTRATE_CACHE_FILE;
  try {
    mkdirSync(SUBSTRATE_CACHE_DIR, { recursive: true });
    console.error("[K520.8 DIAG] dir ensured, target=" + target);
    const payload = JSON.stringify({
      ts: Math.floor(Date.now() / 1000),
      session_task: task,
      briefing: briefingText.slice(0, 50000),
      gotchas: [],
      cached_at: new Date().toISOString(),
    }, null, 2);
    writeFileSync(target, payload, "utf-8");
    const { size } = statSync(target);
    if (size === 0) throw new Error("statSync shows size=0 after write");
    console.error("[K520.8 DIAG] write OK, size=" + size);
  } catch (err) {
    console.error("[K520.8 DIAG] FAILED: " + String(err));
  }
}

writeSubstrateCache("K520.8 diagnostic test", "sample briefing content for cache write test");

console.error("[K520.8 DIAG] file now exists:", existsSync(SUBSTRATE_CACHE_FILE));
