/**
 * Root Lineage — Cathedral-Prefixed Serial-Number Scheme (KN104 / BP016)
 * =======================================================================
 * Re-exports and extends provenance_chain.ts for the Miners module.
 * Provides the public API for Miner serial management used across the miners/ package.
 */
export { allocateSerial, allocateDaughterSerial, appendProvenanceEntry, queryProvenanceChain, listRootMiners, } from "../team_dispatcher/provenance_chain.js";
//# sourceMappingURL=root_lineage.js.map
