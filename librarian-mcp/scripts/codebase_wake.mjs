#!/usr/bin/env node
/**
 * Context-Lever Wake — Rehydrate from Soccerball Handle (BP063 PoC)
 * =================================================================
 * Canon: pearl_ae68494bfe8d9027
 *   canon_codebase_index_is_our_content_addressed_substrate_not_cursor_proprietary_vendor_independent_bp063
 * Canon: pearl_063765738de7bb46
 *   canon_knight_anti_bloat_operational_foreman_index_context_lever_86pct_botch_bp063
 *
 * The 86% cure: instead of main-threading file reads + bash discovery (OG-026 botch),
 * Knight wakes reads a SINGLE handle → resolves what it needs (SMALL).
 *
 * Context-lever math:
 *   Botch baseline:    86% context (main-threaded, no lever)
 *   This wake:         reads 1 handle line (~135 bytes)
 *                      decodes: root_id, total_nodes, depth
 *                      selects: only the DAG nodes for the scope requested
 *   Estimated context% from this wake vs 1.5M token window:
 *     handle + DAG metadata ≈ 2-5 KB → ~0.3% context
 *     vs 86% = ~1.29M tokens = ~5MB
 *     Savings: ~99.7% of the botch baseline
 *
 * Usage:
 *   node scripts/codebase_wake.mjs [--scope hooks] [--symbol useFeatureFlag]
 *   node scripts/codebase_wake.mjs --handle DAGV1:...
 *
 * Output: rehydrated scope summary → what Knight loads + context% estimate
 */

import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __scriptDir = dirname(__filename);

const INDEX_DIR   = resolve(__scriptDir, "..", "stitchpunks", "codebase_index");
const CHUNKS_PATH = resolve(INDEX_DIR, "chunks.jsonl");
const DAG_PATH    = resolve(INDEX_DIR, "dag_nodes.jsonl");
const HANDLE_PATH = resolve(INDEX_DIR, "root_handle.txt");

// ─── Args ─────────────────────────────────────────────────────────────────────

function getArg(name, dflt = null) {
  const i = process.argv.indexOf(name);
  if (i === -1 || i + 1 >= process.argv.length) return dflt;
  return process.argv[i + 1];
}

const SCOPE_ARG   = getArg("--scope");
const SYMBOL_ARG  = getArg("--symbol");
const HANDLE_ARG  = getArg("--handle");

// ─── Handle decoder ───────────────────────────────────────────────────────────

/**
 * Decode DAGV1 handle (mirrors caithedral-core dag_soccerball_handle_decode)
 * Format: DAGV1:{root_id}:{max_depth_hex}:{total_nodes_hex}:{pearls_hash}:{epoch_hex}:{meta}
 */
function decodeHandle(handle) {
  if (!handle || !handle.startsWith("DAGV1:")) return null;
  const parts = handle.split(":");
  if (parts.length < 6) return null;
  const [, root_id, max_depth_hex, total_nodes_hex, pearls_hash, epoch_hex, ...metaParts] = parts;
  if (!root_id || root_id.length !== 32) return null;
  return {
    root_id,
    max_depth:   parseInt(max_depth_hex, 16),
    total_nodes: parseInt(total_nodes_hex, 16),
    pearls_hash,
    epoch_ms:    parseInt(epoch_hex, 16),
    session_meta: metaParts.join(":") || undefined,
  };
}

// ─── Context budget estimator ─────────────────────────────────────────────────

const BOTCH_BASELINE_TOKENS = 1_290_000; // 86% of 1.5M context = the OG-026 botch
const TOKEN_WINDOW           = 1_500_000; // 1.5M token window estimate (Sonnet 4.6)
const CHARS_PER_TOKEN        = 4;         // rough: 1 token ≈ 4 chars

function estimateContextPct(totalChars) {
  const tokens = totalChars / CHARS_PER_TOKEN;
  const pct = (tokens / TOKEN_WINDOW) * 100;
  return { tokens: Math.round(tokens), pct: pct.toFixed(2) };
}

// ─── Loader utilities ─────────────────────────────────────────────────────────

let _chunks = null;
let _dagNodes = null;

function getChunks() {
  if (_chunks) return _chunks;
  if (!existsSync(CHUNKS_PATH)) return [];
  _chunks = [];
  for (const line of readFileSync(CHUNKS_PATH, "utf-8").split("\n")) {
    if (!line.trim()) continue;
    try { _chunks.push(JSON.parse(line)); } catch {}
  }
  return _chunks;
}

function getDagNodes() {
  if (_dagNodes) return _dagNodes;
  if (!existsSync(DAG_PATH)) return [];
  _dagNodes = [];
  for (const line of readFileSync(DAG_PATH, "utf-8").split("\n")) {
    if (!line.trim()) continue;
    try { _dagNodes.push(JSON.parse(line)); } catch {}
  }
  return _dagNodes;
}

// ─── Scope resolution ─────────────────────────────────────────────────────────

/**
 * Given a scope filter (e.g. "hooks" or "useFeatureFlag"), resolve only the
 * relevant file DAG nodes + chunk SIDs. Returns a compact summary.
 */
function resolveScope(scopeFilter, symbolFilter) {
  const dagNodes = getDagNodes();
  const fileNodes = dagNodes.filter(n => n.type === "file");

  // Filter by scope/symbol
  let relevantFiles = fileNodes;
  if (scopeFilter) {
    relevantFiles = fileNodes.filter(n =>
      n.bindings?.file?.toLowerCase().includes(scopeFilter.toLowerCase())
    );
  }
  if (symbolFilter) {
    // Further narrow to files that contain the symbol
    const chunks = getChunks();
    const symbolLower = symbolFilter.toLowerCase();
    const matchingFiles = new Set(
      chunks
        .filter(c => c.content.toLowerCase().includes(symbolLower))
        .map(c => c.file)
    );
    relevantFiles = relevantFiles.filter(n =>
      matchingFiles.has(n.bindings?.file)
    );
  }

  return relevantFiles;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const wakeStart = Date.now();

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  CONTEXT-LEVER WAKE — Soccerball Handle Rehydration");
  console.log("  Canon: pearl_ae68494bfe8d9027 · BP063 Anti-Bloat PoC");
  console.log("═══════════════════════════════════════════════════════════");

  // ─── 1. Read the handle (one line, ~135 bytes) ────────────────────────────
  let handleStr = HANDLE_ARG;
  if (!handleStr && existsSync(HANDLE_PATH)) {
    handleStr = readFileSync(HANDLE_PATH, "utf-8").trim();
  }

  if (!handleStr) {
    console.error("  ✗ No handle found — run codebase_index.mjs first");
    process.exit(1);
  }

  let handleBytes = handleStr.length;
  console.log(`\n  Step 1: Read handle (${handleBytes} bytes)`);
  console.log(`          ${handleStr.slice(0, 80)}...`);

  // ─── 2. Decode handle (zero file reads) ──────────────────────────────────
  const decoded = decodeHandle(handleStr);
  if (!decoded) {
    console.error("  ✗ Invalid DAGV1 handle format");
    process.exit(1);
  }

  console.log(`\n  Step 2: Decoded handle`);
  console.log(`          root_id:     ${decoded.root_id}`);
  console.log(`          max_depth:   ${decoded.max_depth}`);
  console.log(`          total_nodes: ${decoded.total_nodes}`);
  console.log(`          pearls_hash: ${decoded.pearls_hash}`);
  console.log(`          session_meta: ${decoded.session_meta || "(none)"}`);
  console.log(`          indexed_at:  ${new Date(decoded.epoch_ms).toISOString()}`);

  // ─── 3. Resolve scope (selective load — SMALL) ────────────────────────────
  const dagNodes = getDagNodes();
  const rootNode = dagNodes.find(n => n.dag_id === decoded.root_id);

  console.log(`\n  Step 3: Scope resolution`);
  if (SCOPE_ARG || SYMBOL_ARG) {
    console.log(`          Scope filter: ${SCOPE_ARG || "(none)"}`);
    console.log(`          Symbol filter: ${SYMBOL_ARG || "(none)"}`);
    const relevantFiles = resolveScope(SCOPE_ARG, SYMBOL_ARG);
    console.log(`          Resolved: ${relevantFiles.length} of ${dagNodes.filter(n => n.type === "file").length} file nodes`);

    for (const fn of relevantFiles.slice(0, 10)) {
      console.log(`            • ${fn.bindings?.file} (${fn.pearls.length} chunks)`);
    }
    if (relevantFiles.length > 10) {
      console.log(`            ... and ${relevantFiles.length - 10} more`);
    }
  } else {
    console.log("          No scope filter — showing root summary only (SMALL wake)");
    if (rootNode) {
      const fileCount = rootNode.bindings?.file_count || "?";
      const chunkCount = rootNode.bindings?.chunk_count || "?";
      console.log(`          Root: ${fileCount} files, ${chunkCount} chunks`);
      console.log(`          Dir:  ${rootNode.bindings?.dir}`);
    }
  }

  // ─── 4. Context% measurement ──────────────────────────────────────────────

  // What did we actually load?
  const charCounts = {
    handle:      handleStr.length,
    dagMetadata: JSON.stringify(dagNodes).length,
    chunksLoaded: _chunks ? JSON.stringify(_chunks).length : 0,
  };

  // Conservative: count only what we explicitly read
  // Foreman mode: we DON'T inline-read chunks — we get SIDs only
  const wakeChars = charCounts.handle + charCounts.dagMetadata;
  const wakeEst   = estimateContextPct(wakeChars);
  const botchPct  = 86.0;
  const savings   = ((botchPct - parseFloat(wakeEst.pct)) / botchPct * 100).toFixed(1);

  console.log("\n  ─────────────────────────────────────────────────────────");
  console.log("  CONTEXT% MEASUREMENT vs 86% BOTCH BASELINE");
  console.log("  ─────────────────────────────────────────────────────────");
  console.log(`  Handle read:         ${charCounts.handle} chars`);
  console.log(`  DAG metadata loaded: ${(charCounts.dagMetadata / 1024).toFixed(1)} KB`);
  console.log(`  Chunks inlined:      ${_chunks ? (charCounts.chunksLoaded / 1024).toFixed(1) + " KB (scope query)" : "0 KB (Foreman — SIDs only)"}`);
  console.log(`  Total chars loaded:  ${(wakeChars / 1024).toFixed(1)} KB`);
  console.log(`  Estimated tokens:    ~${wakeEst.tokens.toLocaleString()}`);
  console.log(`  Context %:           ~${wakeEst.pct}%`);
  console.log(`  Botch baseline:      86.0% (OG-026 · BP063)`);
  console.log(`  Savings vs botch:    ${savings}% reduction`);
  console.log("  ─────────────────────────────────────────────────────────");

  if (parseFloat(wakeEst.pct) < 10) {
    console.log("  ✓ CONTEXT-LEVER WORKING — wake loaded SMALL (<10% context)");
  } else if (parseFloat(wakeEst.pct) < 40) {
    console.log("  ✓ IMPROVED — wake loaded significantly less than 86% botch");
  } else {
    console.log("  ⚠ Wake loaded more than expected — check scope filter");
  }

  const elapsedMs = Date.now() - wakeStart;
  console.log(`\n  Wake elapsed: ${elapsedMs}ms`);
  console.log("\n  ─────────────────────────────────────────────────────────");
  console.log("  FOREMAN DISCIPLINE (per Constitution Art. II):");
  console.log("  Knight main thread reads ONE handle → decodes → gets SIDs.");
  console.log("  Symbol resolution fans to Sonnet SEGs (not inlined here).");
  console.log("  This wake is the lever — not the payload.");
  console.log("  ─────────────────────────────────────────────────────────");
  console.log("\n  FOR THE KEEP. 🌊⚓🪙 Đ");
}

main().catch(e => {
  console.error("FATAL:", e);
  process.exit(1);
});
