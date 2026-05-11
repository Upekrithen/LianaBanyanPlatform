// adapters/s4_composio.mjs
// S4 — Composio Agent Orchestrator adapter
// IMPLEMENTATION_STATUS: scaffold
// To activate: pip install composio-core; set COMPOSIO_API_KEY

import { nowISO, scaffoldRunResult, buildMetrics, ensureDir } from './base.mjs';
import { join } from 'path';

export const STACK_ID = 'S4';
export const STACK_NAME = 'Composio Agent Orchestrator';
export const IMPLEMENTATION_STATUS = 'scaffold';

let _metrics = buildMetrics();

export async function preflight() {
  return {
    ok: false,
    version: 'unknown',
    hardwareFit: true,
    warnings: ['S4 adapter is scaffold-only; install composio-core to activate'],
    error: 'Not implemented',
  };
}

export async function runWorkload(workload, fixturePath, outputDir) {
  const startTs = nowISO();
  ensureDir(outputDir);
  const logPath = join(outputDir, 's4_composio.log');
  const endTs = nowISO();
  return scaffoldRunResult(startTs, endTs, outputDir, logPath);
}

export function observeMetrics() {
  return _metrics;
}

export async function cleanup() {}
