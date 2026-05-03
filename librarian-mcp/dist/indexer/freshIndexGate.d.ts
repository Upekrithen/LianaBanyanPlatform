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
    current(): {
        hash: string | null;
        timestamp: string | null;
    };
}
export declare function createFreshIndexGate(indexDir: string, reload: () => void, isLoaded: () => boolean): FreshIndexGate;
