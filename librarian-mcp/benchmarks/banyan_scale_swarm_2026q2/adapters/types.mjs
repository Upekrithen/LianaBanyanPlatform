// adapters/types.mjs
// Canonical adapter contract for Banyan Scale Swarm Substrate Benchmark 2026Q2

/**
 * @typedef {'S1'|'S2'|'S3'|'S4'|'S5'|'S6'} StackId
 * @typedef {'W1'|'W2'|'W3'} WorkloadId
 * @typedef {'pass'|'fail'|'partial'|'crash'|'timeout'} ExitClass
 * @typedef {'scaffold'|'dry_run_capable'|'production_ready'} ImplementationStatus
 */

/**
 * @typedef {Object} PreflightResult
 * @property {boolean} ok
 * @property {string} version
 * @property {boolean} hardwareFit
 * @property {string[]} warnings
 * @property {string} [error]
 */

/**
 * @typedef {Object} RunResult
 * @property {string} startTs          ISO 8601
 * @property {string} endTs            ISO 8601
 * @property {ExitClass} exitClass
 * @property {string[]} outputArtifactPaths
 * @property {number} observedMessages  inter-agent message count
 * @property {{ input: number; output: number }} observedTokens
 * @property {number} observedCostUSD   measured-spend
 * @property {number} observedCostEquivalentUSD  raw-API equivalent
 * @property {string} rawLogPath
 * @property {Record<string, unknown>} [extra]
 */

/**
 * @typedef {Object} MetricsSnapshot
 * @property {number} inputTokens
 * @property {number} outputTokens
 * @property {number} costUSD
 * @property {number} costEquivalentUSD
 * @property {number} interAgentMessages
 * @property {number} crossVerificationCount
 * @property {boolean} failureRecoveryObserved
 */

/**
 * StackAdapter interface (JSDoc contract — implementations must honour this shape)
 * @typedef {Object} StackAdapter
 * @property {StackId} id
 * @property {string} name
 * @property {ImplementationStatus} implementationStatus
 * @property {() => Promise<PreflightResult>} preflight
 * @property {(workload: WorkloadId, fixturePath: string, outputDir: string) => Promise<RunResult>} runWorkload
 * @property {() => MetricsSnapshot} observeMetrics
 * @property {() => Promise<void>} cleanup
 */

export {};
