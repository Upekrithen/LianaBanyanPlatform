/**
 * Sweeper Scribe — MCP Tool: sweeper_query
 * KN016 / A&A #2328 candidate
 *
 * MCP tool for Founder query: "what's stale?" / "what's orphaned?" / "what's drifted?"
 * Returns structured digest from the most recent scan log.
 *
 * Toolsmith log: TS-BISHOP-SWEEPER-SCAVENGER-KN016-BP002
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIGEST_LOG_PATH = path.join(__dirname, "digest_log.jsonl");

export interface SweeperDigestEntry {
  lines: string[];
  chronos_hash: string;
  timestamp: string;
  total_items: number;
}

export interface SweeperQueryResult {
  query_class: string;
  latest_digest: SweeperDigestEntry | null;
  all_digests_count: number;
  formatted: string;
}

/**
 * Load the most recent digest from the log.
 */
function loadLatestDigest(): SweeperDigestEntry | null {
  if (!fs.existsSync(DIGEST_LOG_PATH)) {
    return null;
  }
  const lines = fs
    .readFileSync(DIGEST_LOG_PATH, "utf-8")
    .split("\n")
    .filter((l) => l.trim());
  if (lines.length === 0) return null;
  try {
    return JSON.parse(lines[lines.length - 1]) as SweeperDigestEntry;
  } catch {
    return null;
  }
}

/**
 * Count all digest entries in the log.
 */
function countDigests(): number {
  if (!fs.existsSync(DIGEST_LOG_PATH)) return 0;
  return fs
    .readFileSync(DIGEST_LOG_PATH, "utf-8")
    .split("\n")
    .filter((l) => l.trim()).length;
}

/**
 * Main query function.
 * query_class: "stale" | "orphaned" | "drift" | "all"
 */
export function sweeperQuery(queryClass: string = "all"): SweeperQueryResult {
  const latest = loadLatestDigest();
  const count = countDigests();

  const formatted = latest
    ? latest.lines.join("\n")
    : "No sweep digest available — run sweeper scan first.";

  return {
    query_class: queryClass,
    latest_digest: latest,
    all_digests_count: count,
    formatted,
  };
}

// MCP tool entrypoint
if (process.argv[2] === "--query") {
  const cls = process.argv[3] || "all";
  const result = sweeperQuery(cls);
  console.log(JSON.stringify(result, null, 2));
}
