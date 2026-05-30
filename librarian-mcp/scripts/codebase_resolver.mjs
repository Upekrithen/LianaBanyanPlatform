#!/usr/bin/env node
/**
 * Codebase Resolver — Exact + Hash-Verified Symbol Resolution (BP063 PoC)
 * ========================================================================
 * Canon: pearl_ae68494bfe8d9027
 *   canon_codebase_index_is_our_content_addressed_substrate_not_cursor_proprietary_vendor_independent_bp063
 *
 * Two resolution modes:
 *   --sid  <32-char-hex>   : exact fetch by content-address, hash-verified
 *   --symbol <name>        : pheromone-query discovery → top hit (fuzzy → exact)
 *   --dag  <dag_id>        : walk DAG node, list all chunk SIDs under it
 *
 * Proof output: shows chunk content + sha256 verification receipt
 *
 * Usage:
 *   node scripts/codebase_resolver.mjs --sid ae68494bfe8d902700000000deadbeef
 *   node scripts/codebase_resolver.mjs --symbol useCanonicalStats
 *   node scripts/codebase_resolver.mjs --dag <32-char-id>
 */

import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __scriptDir = dirname(__filename);

const WORKSPACE    = resolve(__scriptDir, "..", "..");
const INDEX_DIR    = resolve(__scriptDir, "..", "stitchpunks", "codebase_index");
const CHUNKS_PATH  = resolve(INDEX_DIR, "chunks.jsonl");
const DAG_PATH     = resolve(INDEX_DIR, "dag_nodes.jsonl");
const HANDLE_PATH  = resolve(INDEX_DIR, "root_handle.txt");

// ─── Args ─────────────────────────────────────────────────────────────────────

function getArg(name) {
  const i = process.argv.indexOf(name);
  if (i === -1 || i + 1 >= process.argv.length) return null;
  return process.argv[i + 1];
}

const MODE_SID    = getArg("--sid");
const MODE_SYMBOL = getArg("--symbol");
const MODE_DAG    = getArg("--dag");

// ─── Chunk loader ─────────────────────────────────────────────────────────────

function loadChunks() {
  if (!existsSync(CHUNKS_PATH)) {
    console.error("  ✗ chunks.jsonl not found — run codebase_index.mjs first");
    process.exit(1);
  }
  const chunks = [];
  for (const line of readFileSync(CHUNKS_PATH, "utf-8").split("\n")) {
    if (!line.trim()) continue;
    try { chunks.push(JSON.parse(line)); } catch {}
  }
  return chunks;
}

function loadDagNodes() {
  if (!existsSync(DAG_PATH)) return [];
  const nodes = [];
  for (const line of readFileSync(DAG_PATH, "utf-8").split("\n")) {
    if (!line.trim()) continue;
    try { nodes.push(JSON.parse(line)); } catch {}
  }
  return nodes;
}

// ─── Hash verifier ────────────────────────────────────────────────────────────

function verifySid(chunk) {
  const computed = createHash("sha256").update(chunk.content, "utf-8").digest("hex").slice(0, 32);
  return {
    stored_sid:   chunk.sid,
    computed_sid: computed,
    match:        computed === chunk.sid,
  };
}

// ─── Pheromone query ──────────────────────────────────────────────────────────

async function queryPheromone(symbol) {
  try {
    const mod = await import("../dist/scribes/pheromone.js");
    const result = mod.queryPheromone(symbol, { limit: 10, cathedral: "knight" });
    return result;
  } catch (e) {
    return null;
  }
}

// ─── Display helpers ──────────────────────────────────────────────────────────

function printChunk(chunk, verify) {
  const lines = chunk.content.split("\n");
  const preview = lines.slice(0, 10).join("\n");

  console.log("\n─────────────────────────────────────────────────────");
  console.log(`  FILE:        ${chunk.file}`);
  console.log(`  LINES:       ${chunk.start_line}–${chunk.end_line} (${chunk.line_count} lines)`);
  console.log(`  SID:         ${chunk.sid}`);
  console.log(`  HASH-VERIFY: ${verify.computed_sid}`);
  console.log(`  MATCH:       ${verify.match ? "✓ VERIFIED" : "✗ MISMATCH — DATA CORRUPT"}`);
  console.log("─────────────────────────────────────────────────────");
  console.log("  CONTENT (first 10 lines):");
  for (const line of preview.split("\n")) {
    console.log(`  │ ${line}`);
  }
  if (lines.length > 10) {
    console.log(`  │ ... (${lines.length - 10} more lines)`);
  }
  console.log("─────────────────────────────────────────────────────");
}

// ─── Resolution modes ─────────────────────────────────────────────────────────

async function resolveBySid(sid) {
  console.log(`\n  MODE: Exact resolution by SID`);
  console.log(`  SID:  ${sid}`);

  const chunks = loadChunks();
  const chunk = chunks.find(c => c.sid === sid);

  if (!chunk) {
    console.error(`  ✗ SID not found in index: ${sid}`);
    console.log(`  Indexed ${chunks.length} chunks.`);
    process.exit(1);
  }

  const verify = verifySid(chunk);
  printChunk(chunk, verify);

  if (!verify.match) {
    console.error("\n  ✗ INTEGRITY FAILURE — stored SID does not match computed hash");
    process.exit(2);
  }

  return chunk;
}

async function resolveBySymbol(symbol) {
  console.log(`\n  MODE: Symbol discovery via pheromone → exact by SID`);
  console.log(`  Symbol: ${symbol}`);

  const chunks = loadChunks();

  // First: keyword search in chunks (local — no external dependency)
  const symbolLower = symbol.toLowerCase();
  const candidates = chunks.filter(c =>
    c.content.toLowerCase().includes(symbolLower) ||
    c.file.toLowerCase().includes(symbolLower)
  );

  if (candidates.length === 0) {
    // Fallback: pheromone query
    console.log("  (not found locally — trying pheromone query...)");
    const phResult = await queryPheromone(symbol);
    if (phResult && phResult.hits && phResult.hits.length > 0) {
      const top = phResult.hits[0];
      console.log(`\n  Pheromone hit: scribe=${top.scribe} tablet=${top.tablet_id} score=${top.decay_score.toFixed(3)}`);
      // Extract SID from tablet_id (format: cidx_<sid>)
      const sidMatch = top.tablet_id.match(/cidx_([0-9a-f]{32})/);
      if (sidMatch) {
        return resolveBySid(sidMatch[1]);
      }
    }
    console.log(`  ✗ Symbol '${symbol}' not found in codebase index`);
    process.exit(1);
  }

  // Sort by relevance: exact function name match > partial
  candidates.sort((a, b) => {
    const aExact = a.content.match(new RegExp(`\\b${symbol}\\b`)) ? 1 : 0;
    const bExact = b.content.match(new RegExp(`\\b${symbol}\\b`)) ? 1 : 0;
    return bExact - aExact;
  });

  const best = candidates[0];
  console.log(`  Found ${candidates.length} candidates → resolving best match`);

  const verify = verifySid(best);
  printChunk(best, verify);

  console.log(`\n  All candidates (SID + file):`);
  for (const c of candidates.slice(0, 5)) {
    const v = verifySid(c);
    console.log(`    ${v.match ? "✓" : "✗"} ${c.sid}  ${c.file}  L${c.start_line}-${c.end_line}`);
  }

  return best;
}

async function resolveByDag(dagId) {
  console.log(`\n  MODE: DAG walk`);
  console.log(`  DAG id: ${dagId}`);

  const nodes = loadDagNodes();
  const node = nodes.find(n => n.dag_id === dagId);

  if (!node) {
    console.log(`  ✗ DAG node ${dagId} not found in index`);
    process.exit(1);
  }

  console.log(`\n  Node type: ${node.type}`);
  console.log(`  Bindings: ${JSON.stringify(node.bindings)}`);
  console.log(`  Pearls (${node.pearls.length}): ${node.pearls.slice(0, 5).join(", ")}${node.pearls.length > 5 ? "..." : ""}`);
  console.log(`  Faces: ${JSON.stringify(node.faces)}`);

  if (node.type === "dir") {
    console.log(`\n  Child file nodes:`);
    for (const [face, childId] of Object.entries(node.faces)) {
      const child = nodes.find(n => n.dag_id === childId);
      if (child) {
        console.log(`    face${face}: ${childId} → ${child.bindings?.file || "?"} (${child.pearls.length} chunks)`);
      }
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  CODEBASE RESOLVER — Hash-Verified (BP063 PoC)");
  console.log("═══════════════════════════════════════════════════");

  if (!existsSync(INDEX_DIR)) {
    console.error("  ✗ Index not built yet — run codebase_index.mjs first");
    process.exit(1);
  }

  // Show current index stats
  if (existsSync(CHUNKS_PATH)) {
    const chunkLines = readFileSync(CHUNKS_PATH, "utf-8").split("\n").filter(l => l.trim()).length;
    console.log(`  Index: ${chunkLines} chunks indexed`);
  }

  if (existsSync(HANDLE_PATH)) {
    const handle = readFileSync(HANDLE_PATH, "utf-8").trim();
    const parts = handle.split(":");
    if (parts.length >= 5) {
      console.log(`  Root:  ${parts[1]} (depth ${parseInt(parts[2], 16)}, ${parseInt(parts[3], 16)} nodes)`);
    }
  }

  if (MODE_SID) {
    await resolveBySid(MODE_SID);
  } else if (MODE_SYMBOL) {
    await resolveBySymbol(MODE_SYMBOL);
  } else if (MODE_DAG) {
    await resolveByDag(MODE_DAG);
  } else {
    console.log("\n  Usage:");
    console.log("    node scripts/codebase_resolver.mjs --sid <32-char-hex>");
    console.log("    node scripts/codebase_resolver.mjs --symbol <function-name>");
    console.log("    node scripts/codebase_resolver.mjs --dag <32-char-hex>");

    // Self-demo: resolve the first chunk in the index
    if (existsSync(CHUNKS_PATH)) {
      const firstLine = readFileSync(CHUNKS_PATH, "utf-8").split("\n").find(l => l.trim());
      if (firstLine) {
        const first = JSON.parse(firstLine);
        console.log(`\n  Demo: resolving first indexed chunk: ${first.sid}`);
        await resolveBySid(first.sid);
      }
    }
  }

  console.log("\n  FOR THE KEEP. 🌊⚓🪙 Đ");
}

main().catch(e => {
  console.error("FATAL:", e);
  process.exit(1);
});
