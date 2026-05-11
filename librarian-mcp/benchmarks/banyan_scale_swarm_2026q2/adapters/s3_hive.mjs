// adapters/s3_hive.mjs
// S3 — The Hive (HiveCLI) adapter
// IMPLEMENTATION_STATUS: scaffold
// [VERIFY-PER-PAWN-P12] license confirmed MIT? — verify before enabling
// To activate: install HiveCLI from repo; configure K8s/git backend

import { nowISO, scaffoldRunResult, buildMetrics, ensureDir } from './base.mjs';
import { join } from 'path';

export const STACK_ID = 'S3';
export const STACK_NAME = 'The Hive (HiveCLI)';
export const IMPLEMENTATION_STATUS = 'scaffold';

let _metrics = buildMetrics();

export async function preflight() {
  return {
    ok: false,
    version: 'unknown',
    hardwareFit: true,
    warnings: [
      'S3 adapter is scaffold-only',
      '[VERIFY-PER-PAWN-P12] HiveCLI license not yet confirmed',
    ],
    error: 'Not implemented',
  };
}

export async function runWorkload(workload, fixturePath, outputDir) {
  const startTs = nowISO();
  ensureDir(outputDir);
  const logPath = join(outputDir, 's3_hive.log');
  const endTs = nowISO();
  return scaffoldRunResult(startTs, endTs, outputDir, logPath);
}

export function observeMetrics() {
  return _metrics;
}

export async function cleanup() {}
