#!/usr/bin/env node
/**
 * Codebase Index — OUR Content-Addressed Substrate (BP063 PoC)
 * ============================================================
 * Canon: pearl_ae68494bfe8d9027
 *   canon_codebase_index_is_our_content_addressed_substrate_not_cursor_proprietary_vendor_independent_bp063
 * Canon: pearl_063765738de7bb46
 *   canon_knight_anti_bloat_operational_foreman_index_context_lever_86pct_botch_bp063
 *
 * Doctrine: This script IS the gadget layer. It builds OUR index — exact + hash-verified
 * (layer 3), not fuzzy embeddings (layer 2). Vendor-independent. Boat-in-Water at the
 * tooling layer.
 *
 * Architecture (dir → soccerball-DAG):
 *   Root DAG node     = one dir-level soccerball (faces 0-5 → file DAG nodes)
 *   File DAG nodes    = one per .ts file (pearls = chunk SIDs; faces 0-5 → chunk SIDs)
 *   Chunks            = ~50-line segments, SID = sha256(content).slice(0,32)
 *   Pheromone         = emitted per chunk so search_knowledge/pheromone covers OUR code
 *
 * Storage: librarian-mcp/stitchpunks/codebase_index/
 *   chunks.jsonl       — {sid, file, start_line, end_line, content}
 *   dag_nodes.jsonl    — {dag_id, type, pearls, bindings, faces, ts}
 *   root_handle.txt    — DAGV1:<root_id>:... compact handle (context-lever wake key)
 *   index_receipt.jsonl — run receipts
 *
 * Usage:
 *   node scripts/codebase_index.mjs [--target platform/src/hooks] [--chunk-lines 50]
 */

import { createHash, randomUUID } from "crypto";
import {
  existsSync, mkdirSync, writeFileSync, appendFileSync,
  readFileSync, readdirSync, statSync,
} from "fs";
import { resolve, relative, join, basename, dirname, extname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __scriptDir = dirname(__filename);

// ─── Config ──────────────────────────────────────────────────────────────────

function getArg(name, dflt) {
  const i = process.argv.indexOf(name);
  if (i === -1 || i + 1 >= process.argv.length) return dflt;
  return process.argv[i + 1];
}

const WORKSPACE    = resolve(__scriptDir, "..", "..");
const TARGET_REL   = getArg("--target", "platform/src/hooks");
const TARGET_DIR   = resolve(WORKSPACE, TARGET_REL);
const CHUNK_LINES  = parseInt(getArg("--chunk-lines", "50"), 10);
const INDEX_DIR    = resolve(__scriptDir, "..", "stitchpunks", "codebase_index");
const CHUNKS_PATH  = resolve(INDEX_DIR, "chunks.jsonl");
const DAG_PATH     = resolve(INDEX_DIR, "dag_nodes.jsonl");
const HANDLE_PATH  = resolve(INDEX_DIR, "root_handle.txt");
const RECEIPT_PATH = resolve(INDEX_DIR, "index_receipt.jsonl");
const PHEROMONE_LOG = resolve(INDEX_DIR, "pheromone_log.jsonl");

// ─── Pheromone import (dist-resident) ────────────────────────────────────────

let emitPheromone;
try {
  const mod = await import("../dist/scribes/pheromone.js");
  emitPheromone = mod.emitPheromone;
  console.log("  ✓ pheromone emitter loaded from dist");
} catch (e) {
  console.warn("  ⚠ pheromone dist unavailable — logging locally only:", e.message);
  emitPheromone = (scribe, tabletId, content, opts) => {
    const record = { ts: new Date().toISOString(), scribe, tablet_id: tabletId,
      topics: content.split(/\s+/).slice(0, 20), ...opts };
    appendFileSync(PHEROMONE_LOG, JSON.stringify(record) + "\n", "utf-8");
  };
}

// ─── Content addressing ───────────────────────────────────────────────────────

/** sha256(content).slice(0,32) — 128-bit content-addressed SID */
function computeSid(content) {
  return createHash("sha256").update(content, "utf-8").digest("hex").slice(0, 32);
}

/** Soccerball-compatible: sha256(sorted(pearls).join('|') + ':' + binding_json).slice(0,32) */
function dagContentAddress(pearls, bindings, faces) {
  const payload = JSON.stringify([
    [...pearls].sort(),
    Object.fromEntries(Object.entries(bindings).sort(([a],[b]) => a.localeCompare(b))),
    Object.fromEntries(Object.entries(faces).sort(([a],[b]) => a.localeCompare(b))),
  ]);
  return createHash("sha256").update(payload).digest("hex").slice(0, 32);
}

// ─── In-process DAG Crystal ───────────────────────────────────────────────────

const DAG_CRYSTAL = new Map();

function dagEmit(pearls, bindings = {}, faces = {}) {
  if (!pearls || pearls.length === 0) throw new Error("dagEmit: pearls must be non-empty");
  const id = dagContentAddress(pearls, bindings, faces);
  if (!DAG_CRYSTAL.has(id)) {
    DAG_CRYSTAL.set(id, { dag_id: id, pearls: [...pearls], bindings: {...bindings},
      faces: {...faces}, ts: Date.now() });
  }
  return id;
}

function dagHandleEncode(rootId, sessionMeta = "") {
  const root = DAG_CRYSTAL.get(rootId);
  if (!root) throw new Error(`dagHandleEncode: rootId ${rootId} not in DAG_CRYSTAL`);

  // BFS walk to count nodes + collect all pearls
  const visited = new Set();
  const queue = [rootId];
  const allPearls = [];
  let maxDepth = 0;

  while (queue.length) {
    const id = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);
    const node = DAG_CRYSTAL.get(id);
    if (!node) continue;
    allPearls.push(...node.pearls);
    for (const childId of Object.values(node.faces)) {
      if (childId) queue.push(childId);
    }
  }

  const totalNodes = visited.size;
  // Depth estimation: log6(totalNodes) or iterate faces depth
  maxDepth = Math.ceil(Math.log(Math.max(1, totalNodes)) / Math.log(6));

  const pearlsHash = createHash("sha256")
    .update([...allPearls].sort().join("|")).digest("hex").slice(0, 16);

  const epoch = root.ts;
  const meta = sessionMeta.slice(0, 20);

  return [
    "DAGV1",
    rootId,
    maxDepth.toString(16).padStart(2, "0"),
    totalNodes.toString(16).padStart(4, "0"),
    pearlsHash,
    epoch.toString(16),
    meta,
  ].join(":");
}

// ─── Keyword extractor ────────────────────────────────────────────────────────

const STOP_TS = new Set(
  "import export from const let var function class interface type return " +
  "if else for while do switch case break continue try catch throw new " +
  "async await extends implements readonly public private protected static " +
  "default void null undefined true false boolean number string object"
    .split(/\s+/)
);

function extractKeywords(content, filePath) {
  const kw = new Set();

  // Hook name from file path (useXxx)
  const hookMatch = basename(filePath, ".ts").match(/^(use\w+)$/);
  if (hookMatch) kw.add(hookMatch[1]);

  // Exported function names
  for (const m of content.matchAll(/(?:export\s+)?(?:function|const)\s+(\w+)/g)) {
    if (m[1].length > 2 && !STOP_TS.has(m[1])) kw.add(m[1].toLowerCase());
  }

  // Class / interface / type names
  for (const m of content.matchAll(/(?:class|interface|type)\s+(\w+)/g)) {
    if (!STOP_TS.has(m[1])) kw.add(m[1].toLowerCase());
  }

  // Supabase table refs ('tableName')
  for (const m of content.matchAll(/\.from\(['"](\w+)['"]\)/g)) {
    kw.add(`table:${m[1]}`);
  }

  // Canon/BP refs in comments
  for (const m of content.matchAll(/\b(BP\d{3}|K\d{3,4}|A&A #\d{4}|pearl_[0-9a-f]+)\b/g)) {
    kw.add(m[1].toLowerCase().replace(/\s+/g, "-"));
  }

  // File path components
  const parts = filePath.split(/[/\\]/).filter(p => p && p !== "src" && p !== "platform");
  for (const p of parts) kw.add(p.replace(/\.\w+$/, "").toLowerCase());

  kw.add("codebase-index");
  kw.add("lb-code");

  return [...kw].filter(k => k.length > 2).slice(0, 40);
}

// ─── File chunker ─────────────────────────────────────────────────────────────

function chunkFile(content, chunkLines) {
  const lines = content.split("\n");
  const chunks = [];
  for (let i = 0; i < lines.length; i += chunkLines) {
    const slice = lines.slice(i, i + chunkLines);
    const chunkContent = slice.join("\n");
    chunks.push({
      start_line: i + 1,
      end_line: Math.min(i + chunkLines, lines.length),
      content: chunkContent,
    });
  }
  return chunks;
}

// ─── Directory walker ─────────────────────────────────────────────────────────

function walkDir(dir, exts = [".ts", ".tsx"]) {
  const files = [];
  function walk(d) {
    let entries;
    try { entries = readdirSync(d); } catch { return; }
    for (const entry of entries) {
      const full = join(d, entry);
      try {
        const stat = statSync(full);
        if (stat.isDirectory()) walk(full);
        else if (exts.includes(extname(full))) files.push(full);
      } catch { /* skip */ }
    }
  }
  walk(dir);
  return files.sort();
}

// ─── Persist helpers ──────────────────────────────────────────────────────────

function appendRecord(path, record) {
  appendFileSync(path, JSON.stringify(record) + "\n", "utf-8");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  CODEBASE INDEX — OUR Substrate (BP063 PoC)");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Target:      ${TARGET_DIR}`);
  console.log(`  Chunk size:  ${CHUNK_LINES} lines`);
  console.log(`  Index dir:   ${INDEX_DIR}`);

  if (!existsSync(TARGET_DIR)) {
    console.error(`  ✗ Target directory not found: ${TARGET_DIR}`);
    process.exit(1);
  }

  mkdirSync(INDEX_DIR, { recursive: true });

  // Clear previous run (fresh index)
  writeFileSync(CHUNKS_PATH, "", "utf-8");
  writeFileSync(DAG_PATH, "", "utf-8");

  const t0 = Date.now();
  const files = walkDir(TARGET_DIR);
  console.log(`  Found ${files.length} source files`);

  let totalChunks = 0;
  let totalBytes = 0;
  const fileSids = [];       // [{ file, file_dag_id, chunk_sids }]
  const chunkIndex = [];     // for resolver

  // ─── Phase 1: Chunk files → SIDs ──────────────────────────────────────────
  console.log("\n  Phase 1: Chunking files → SIDs");
  for (const filePath of files) {
    const relPath = relative(WORKSPACE, filePath).replace(/\\/g, "/");
    let content;
    try { content = readFileSync(filePath, "utf-8"); } catch { continue; }

    totalBytes += content.length;
    const chunks = chunkFile(content, CHUNK_LINES);
    const chunkSids = [];

    for (const chunk of chunks) {
      const sid = computeSid(chunk.content);
      const record = {
        sid,
        file: relPath,
        start_line: chunk.start_line,
        end_line: chunk.end_line,
        line_count: chunk.end_line - chunk.start_line + 1,
        content: chunk.content,
        ts: new Date().toISOString(),
      };
      appendRecord(CHUNKS_PATH, record);
      chunkIndex.push(record);
      chunkSids.push(sid);
      totalChunks++;
    }

    // File DAG node: pearls = chunk SIDs, faces 0-5 = first 6 chunk SIDs
    const faces = {};
    for (let i = 0; i < Math.min(chunkSids.length, 6); i++) {
      faces[String(i)] = chunkSids[i];
    }
    const file_dag_id = dagEmit(chunkSids, { file: relPath, type: "file" }, faces);

    // Persist file DAG node
    appendRecord(DAG_PATH, { dag_id: file_dag_id, type: "file", pearls: chunkSids,
      bindings: { file: relPath, type: "file" }, faces, ts: Date.now() });

    fileSids.push({ file: relPath, file_dag_id, chunk_sids: chunkSids });
  }

  console.log(`    ✓ ${totalChunks} chunks across ${files.length} files`);

  // ─── Phase 2: Build root soccerball-DAG ───────────────────────────────────
  console.log("\n  Phase 2: Building root DAG node");

  // Root DAG node: pearls = file dag_ids, faces 0-5 = first 6 file dag_ids
  const fileIds = fileSids.map(f => f.file_dag_id);
  const rootFaces = {};
  for (let i = 0; i < Math.min(fileIds.length, 6); i++) {
    rootFaces[String(i)] = fileIds[i];
  }

  const rootId = dagEmit(
    fileIds.length > 0 ? fileIds : ["__empty__"],
    { dir: TARGET_REL, type: "dir", file_count: String(files.length),
      chunk_count: String(totalChunks), indexed_at: new Date().toISOString() },
    rootFaces
  );

  // Persist root DAG node
  appendRecord(DAG_PATH, {
    dag_id: rootId, type: "dir",
    pearls: fileIds.slice(0, 100), // first 100 to keep JSONL manageable
    bindings: { dir: TARGET_REL, type: "dir", file_count: String(files.length),
      chunk_count: String(totalChunks) },
    faces: rootFaces, ts: Date.now(),
  });

  // Encode and write root handle
  const handle = dagHandleEncode(rootId, "BP063-codebase-idx");
  writeFileSync(HANDLE_PATH, handle, "utf-8");
  console.log(`    ✓ Root DAG: ${rootId}`);
  console.log(`    ✓ Handle:   ${handle.slice(0, 80)}...`);

  // ─── Phase 3: Pheromone emission ──────────────────────────────────────────
  console.log("\n  Phase 3: Pheromone emission (pixie-dust mine into substrate)");
  let pheromoneCount = 0;

  for (const { file, chunk_sids } of fileSids) {
    // One pheromone record per file (topics cover all symbols in file)
    let fileContent = "";
    try { fileContent = readFileSync(join(WORKSPACE, file), "utf-8"); } catch {}
    const keywords = extractKeywords(fileContent, file);

    emitPheromone(
      "CodebaseIndex",
      `cidx_${chunk_sids[0] || "empty"}`,
      `${keywords.join(" ")} codebase-chunk sid:${chunk_sids[0] || "none"} ` +
      `file:${file} chunk-count:${chunk_sids.length} ` +
      `codebase-index lb-code platform hooks substrate-indexed`,
      {
        cathedral: "knight",
        flavorClass: {
          domain: "bread",       // code infrastructure — bread (foundational)
          cognition: "analytical",
          audience: "knight-build",
        },
        pheromone_class: "transient",
      }
    );
    pheromoneCount++;
  }

  console.log(`    ✓ ${pheromoneCount} pheromone records emitted`);

  // ─── Receipt ──────────────────────────────────────────────────────────────
  const elapsedMs = Date.now() - t0;
  const receipt = {
    run_id: randomUUID().slice(0, 8),
    target: TARGET_REL,
    files_indexed: files.length,
    total_chunks: totalChunks,
    total_bytes: totalBytes,
    dag_nodes: DAG_CRYSTAL.size,
    root_dag_id: rootId,
    handle: handle,
    pheromone_records: pheromoneCount,
    elapsed_ms: elapsedMs,
    ts: new Date().toISOString(),
  };

  appendRecord(RECEIPT_PATH, receipt);

  console.log("\n═══════════════════════════════════════════════════");
  console.log("  RECEIPT");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Files indexed:     ${files.length}`);
  console.log(`  Total chunks:      ${totalChunks}`);
  console.log(`  Total bytes:       ${(totalBytes / 1024).toFixed(1)} KB`);
  console.log(`  DAG nodes built:   ${DAG_CRYSTAL.size}`);
  console.log(`  Root DAG id:       ${rootId}`);
  console.log(`  Root handle:       ${handle.slice(0, 70)}...`);
  console.log(`  Pheromone records: ${pheromoneCount}`);
  console.log(`  Elapsed:           ${elapsedMs}ms`);
  console.log(`  Chunks JSONL:      ${CHUNKS_PATH}`);
  console.log(`  DAG JSONL:         ${DAG_PATH}`);
  console.log(`  Root handle file:  ${HANDLE_PATH}`);
  console.log("═══════════════════════════════════════════════════");
  console.log("  FOR THE KEEP. 🌊⚓🪙 Đ");
}

main().catch(e => {
  console.error("FATAL:", e);
  process.exit(1);
});
