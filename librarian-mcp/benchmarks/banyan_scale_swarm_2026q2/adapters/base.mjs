// adapters/base.mjs
// Shared utilities for all stack adapters

import { execSync, spawnSync } from 'child_process';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export const BENCHMARK_ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');

export function nowISO() {
  return new Date().toISOString();
}

export function elapsedMs(startTs) {
  return Date.now() - new Date(startTs).getTime();
}

export function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

export function writeLog(logPath, lines) {
  writeFileSync(logPath, lines.join('\n'), 'utf8');
}

export function commandExists(cmd) {
  try {
    const result = spawnSync(cmd, ['--version'], { shell: true, encoding: 'utf8' });
    return result.status === 0;
  } catch {
    return false;
  }
}

/** Build a scaffold RunResult (used by adapters that are not yet production_ready) */
export function scaffoldRunResult(startTs, endTs, outputDir, logPath) {
  return {
    startTs,
    endTs,
    exitClass: 'fail',
    outputArtifactPaths: [],
    observedMessages: 0,
    observedTokens: { input: 0, output: 0 },
    observedCostUSD: 0,
    observedCostEquivalentUSD: 0,
    rawLogPath: logPath,
    extra: { note: 'scaffold — adapter not yet implemented' },
  };
}

/** Build a MetricsSnapshot from observed counters */
export function buildMetrics(opts = {}) {
  return {
    inputTokens: opts.inputTokens ?? 0,
    outputTokens: opts.outputTokens ?? 0,
    costUSD: opts.costUSD ?? 0,
    costEquivalentUSD: opts.costEquivalentUSD ?? 0,
    interAgentMessages: opts.interAgentMessages ?? 0,
    crossVerificationCount: opts.crossVerificationCount ?? 0,
    failureRecoveryObserved: opts.failureRecoveryObserved ?? false,
  };
}
