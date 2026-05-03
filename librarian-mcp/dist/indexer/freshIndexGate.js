import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
export function createFreshIndexGate(indexDir, reload, isLoaded) {
    let lastSeenHash = null;
    let lastSeenTs = null;
    const fpPath = resolve(indexDir, "last_build_fingerprint.json");
    // Prime the gate on first construction so a tool call against a freshly-built,
    // freshly-loaded server doesn't trip a spurious reload on the first call.
    if (existsSync(fpPath)) {
        try {
            const raw = JSON.parse(readFileSync(fpPath, "utf-8"));
            lastSeenHash = typeof raw?.treeHash === "string" ? raw.treeHash : null;
            lastSeenTs = typeof raw?.timestamp === "string" ? raw.timestamp : null;
        }
        catch { /* leave nulls; check() will recover */ }
    }
    function check() {
        if (!existsSync(fpPath)) {
            if (!isLoaded()) {
                reload();
                return { reloaded: true, reason: "cold-start: no fingerprint yet", treeHash: null, timestamp: null };
            }
            return { reloaded: false, reason: "no fingerprint on disk", treeHash: lastSeenHash, timestamp: lastSeenTs };
        }
        let hash = null;
        let ts = null;
        try {
            const raw = JSON.parse(readFileSync(fpPath, "utf-8"));
            hash = typeof raw?.treeHash === "string" ? raw.treeHash : null;
            ts = typeof raw?.timestamp === "string" ? raw.timestamp : null;
        }
        catch {
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
    function resetForTesting(hash = null, ts = null) {
        lastSeenHash = hash;
        lastSeenTs = ts;
    }
    function current() {
        return { hash: lastSeenHash, timestamp: lastSeenTs };
    }
    return { check, resetForTesting, current };
}
//# sourceMappingURL=freshIndexGate.js.map
