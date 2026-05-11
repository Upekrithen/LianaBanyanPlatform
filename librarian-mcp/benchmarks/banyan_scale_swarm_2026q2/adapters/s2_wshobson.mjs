// adapters/s2_wshobson.mjs
// S2 — wshobson/agents adapter
// IMPLEMENTATION_STATUS: scaffold
// To activate: install wshobson/agents Claude Code extension + Gemini CLI extension

import { nowISO, scaffoldRunResult, buildMetrics, ensureDir } from './base.mjs';
import { join } from 'path';

export const STACK_ID = 'S2';
export const STACK_NAME = 'wshobson/agents';
export const IMPLEMENTATION_STATUS = 'scaffold';

let _metrics = buildMetrics();

export async function preflight() {
  return {
    ok: false,
    version: 'unknown',
    hardwareFit: true,
    warnings: ['S2 adapter is scaffold-only; install wshobson/agents extensions to activate'],
    error: 'Not implemented',
  };
}

export async function runWorkload(workload, fixturePath, outputDir) {
  const startTs = nowISO();
  ensureDir(outputDir);
  const logPath = join(outputDir, 's2_wshobson.log');
  const endTs = nowISO();
  return scaffoldRunResult(startTs, endTs, outputDir, logPath);
}

export function observeMetrics() {
  return _metrics;
}

export async function cleanup() {}
