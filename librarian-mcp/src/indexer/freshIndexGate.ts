import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

/**
 * K441 Half D — fingerprint-based cache invalidation gate.
 *
 * The MCP server caches all index payloads in module-scoped variables for
 * speed. Before this gate landed, those caches were populated lazily on the
 * FIRST tool call (`if (!overview) reloadAll()`) and then frozen forever —
 * so `npm run rebuild` writing fresh content to disk had no effect on a
 * running server. Founder had to restart the client to see new data.
 *
 * This gate fixes that without paying the cost of a full reload on every
 * tool call. It reads JUST `index/last_build_fingerprint.json` (a tiny file
 * — KB, not MB — written at the end of every rebuild) and compares its
 * `treeHash` to the last value the gate saw. On change, it triggers the
 * reload callback and stamps the new fingerprint. On no change it is a
 * single small JSON parse.
 *
 * Usage:
 *   const gate = createFreshIndexGate(INDEX_DIR, () => reloadAll(), () => overview != null);
 *   server.tool("...", async () => { gate.check(); ... });
 */

export interface GateResult {
  reloaded: boolean;
  reason: string;
  treeHash: string | null;
  timestamp: string | null;
}

export interface FreshIndexGate {
  check(): GateResult;
  /** Test-only: force the gate's internal "last seen" hash. Useful for tests
   *  that want to simulate a server that just started. */
  resetForTesting(hash?: string | null, ts?: string | null): void;
  /** Inspector: the most recent (hash, timestamp) the gate has stamped. */
  current(): { hash: string | null; timestamp: string | null };
}

export function createFreshIndexGate(
  indexDir: string,
  reload: () => void,
  isLoaded: () => boolean,
): FreshIndexGate {
  let lastSeenHash: string | null = null;
  let lastSeenTs: string | null = null;

  const fpPath = resolve(indexDir, "last_build_fingerprint.json");

  // Prime the gate on first construction so a tool call against a freshly-built,
  // freshly-loaded server doesn't trip a spurious reload on the first call.
  if (existsSync(fpPath)) {
    try {
      const raw = JSON.parse(readFileSync(fpPath, "utf-8"));
      lastSeenHash = typeof raw?.treeHash === "string" ? raw.treeHash : null;
      lastSeenTs = typeof raw?.timestamp === "string" ? raw.timestamp : null;
    } catch { /* leave nulls; check() will recover */ }
  }

  function check(): GateResult {
    if (!existsSync(fpPath)) {
      if (!isLoaded()) {
        reload();
        return { reloaded: true, reason: "cold-start: no fingerprint yet", treeHash: null, timestamp: null };
      }
      return { reloaded: false, reason: "no fingerprint on disk", treeHash: lastSeenHash, timestamp: lastSeenTs };
    }
    let hash: string | null = null;
    let ts: string | null = null;
    try {
      const raw = JSON.parse(readFileSync(fpPath, "utf-8"));
      hash = typeof raw?.treeHash === "string" ? raw.treeHash : null;
      ts = typeof raw?.timestamp === "string" ? raw.timestamp : null;
    } catch {
      if (!isLoaded()) {
        reload();
        return { reloaded: true, reason: "cold-start: fingerprint unreadable", treeHash: null, timestamp: null };
      }
      return { reloaded: false, reason: "fingerprint unreadable; keeping cached", treeHash: lastSeenHash, timestamp: lastSeenTs };
    }
    if (!isLoaded()) {
      reload();
      lastSeenHash = hash;
      lastSeenTs = ts;
      return { reloaded: true, reason: "cold-start", treeHash: hash, timestamp: ts };
    }
    if (hash !== null && hash !== lastSeenHash) {
      reload();
      const reason = `fingerprint changed (${ts ?? "unknown ts"})`;
      lastSeenHash = hash;
      lastSeenTs = ts;
      return { reloaded: true, reason, treeHash: hash, timestamp: ts };
    }
    return { reloaded: false, reason: "fresh", treeHash: lastSeenHash, timestamp: lastSeenTs };
  }

  function resetForTesting(hash: string | null = null, ts: string | null = null): void {
    lastSeenHash = hash;
    lastSeenTs = ts;
  }

  function current(): { hash: string | null; timestamp: string | null } {
    return { hash: lastSeenHash, timestamp: lastSeenTs };
  }

  return { check, resetForTesting, current };
}
