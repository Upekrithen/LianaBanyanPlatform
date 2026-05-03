#!/usr/bin/env node
/**
 * stats-capture CLI — KN-S2 / BP018
 * ====================================
 * Commands:
 *   prune [--dry-run] [--older-than-hours=24]
 *   protect <test_id>
 *   unprotect <test_id>
 *   archive [--week=YYYY-WW]
 *   status
 */

import { RetentionPruner, rollArchive } from "../dist/stats_capture/retention_pruner.js";

const args = process.argv.slice(2);
const cmd = args[0];

const dryRun = args.includes("--dry-run");
const olderThanHours = (() => {
  const flag = args.find((a) => a.startsWith("--older-than-hours="));
  return flag ? parseInt(flag.split("=")[1], 10) : 24;
})();
const weekFlag = (() => {
  const flag = args.find((a) => a.startsWith("--week="));
  return flag ? flag.split("=")[1] : undefined;
})();

const pruner = new RetentionPruner();

switch (cmd) {
  case "prune": {
    const receipt = await pruner.manual_prune({ older_than_hours: olderThanHours, dry_run: dryRun });
    console.log(JSON.stringify(receipt, null, 2));
    break;
  }
  case "protect": {
    const testId = args[1];
    if (!testId) { console.error("Usage: stats-capture protect <test_id>"); process.exit(1); }
    await pruner.protect(testId);
    console.log(`Protected: ${testId}`);
    break;
  }
  case "unprotect": {
    const testId = args[1];
    if (!testId) { console.error("Usage: stats-capture unprotect <test_id>"); process.exit(1); }
    await pruner.unprotect(testId);
    console.log(`Unprotected: ${testId}`);
    break;
  }
  case "archive": {
    const archiveFile = rollArchive(undefined, weekFlag);
    console.log(`Archive file: ${archiveFile}`);
    break;
  }
  case "status": {
    const status = pruner.status();
    console.log(JSON.stringify(status, null, 2));
    break;
  }
  default:
    console.error("Usage: stats-capture <prune|protect|unprotect|archive|status> [options]");
    process.exit(1);
}
