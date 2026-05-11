// adapters/s1_ruflo.mjs
// S1 — Ruflo (Claude-Flow) adapter
// IMPLEMENTATION_STATUS: scaffold
// To activate: install claude-flow (npx @anthropic-ai/claude-flow), set ANTHROPIC_API_KEY

import { nowISO, scaffoldRunResult, buildMetrics, ensureDir } from './base.mjs';
import { join } from 'path';

export const STACK_ID = 'S1';
export const STACK_NAME = 'Ruflo (Claude-Flow)';
export const IMPLEMENTATION_STATUS = 'scaffold';

let _metrics = buildMetrics();

export async function preflight() {
  return {
    ok: false,
    version: 'unknown',
    hardwareFit: true,
    warnings: ['S1 adapter is scaffold-only; install claude-flow to activate'],
    error: 'Not implemented',
  };
}

export async function runWorkload(workload, fixturePath, outputDir) {
  const startTs = nowISO();
  ensureDir(outputDir);
  const logPath = join(outputDir, 's1_ruflo.log');
  const endTs = nowISO();
  return scaffoldRunResult(startTs, endTs, outputDir, logPath);
}

export function observeMetrics() {
  return _metrics;
}

export async function cleanup() {}
