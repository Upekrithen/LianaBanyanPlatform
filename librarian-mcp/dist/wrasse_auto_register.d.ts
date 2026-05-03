/**
 * Wrasse Auto-Register — K550/B133
 *
 * TypeScript counterpart to wrasse_registry_writer.py.
 * Called from detective_investigate handler after successful resolution.
 * Architecture decision D.1 = α: direct write from Detective.
 *
 * Stone Tablet Imperative: append-only writes via fs.appendFileSync + fsync.
 * Brick Wall: lock acquisition failure logs and skips — never throws to caller.
 *
 * Config flag: WRASSE_AUTO_REGISTER_ENABLED in librarian-mcp/config/wrasse.json
 */
export type TriggerClass = "k_prefix" | "ts_prefix" | "call_sign" | "vocabulary" | "file_path" | "canonical_number";
export interface TriggerCandidate {
    trigger_pattern: string;
    trigger_class: TriggerClass;
}
export declare function extractTriggers(claim: string): TriggerCandidate[];
export interface RegisterResult {
    action: "appended" | "bumped" | "unchanged";
    trigger_id: string;
}
/**
 * Append a new Wrasse registry entry if trigger_pattern is novel.
 * Called from detective_investigate after successful resolution.
 * Brick Wall: never throws; lock failure logs and returns unchanged.
 */
export declare function appendIfNew(triggerPattern: string, triggerClass: TriggerClass, canonicalResolution: string, sourceSession: string): RegisterResult;
/**
 * Auto-register all trigger patterns extracted from a Detective claim string.
 * Called after detective_investigate resolves (phase0 hits > 0 OR phase1 results > 0).
 * Resolution summary is built from the detective result object.
 */
export declare function autoRegisterFromDetective(claim: string, resolutionSummary: string, sourceSession: string): RegisterResult[];
