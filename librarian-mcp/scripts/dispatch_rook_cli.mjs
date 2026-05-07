#!/usr/bin/env node
/**
 * BP028 — CLI for Rook/Gemini key health (no secret values printed).
 * Usage: node scripts/dispatch_rook_cli.mjs --healthcheck
 */
import { getGeminiKeyHealth } from "../dist/gemini_env_sources.js";

const argv = process.argv.slice(2);
if (argv.includes("--healthcheck")) {
  console.log(JSON.stringify(getGeminiKeyHealth(), null, 2));
  process.exit(0);
}

console.error("Usage: node scripts/dispatch_rook_cli.mjs --healthcheck");
process.exit(1);
